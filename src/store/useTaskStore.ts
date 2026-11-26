import { create } from 'zustand';
import { Task, CreateTaskInput, UpdateTaskInput, TaskStatus } from '../types/task';
import { taskRepository } from '../features/personal/repository/taskRepository';

interface TaskStore {
  tasks: Task[];
  isLoading: boolean;

  // Actions
  loadTasks: () => void;
  createTask: (input: CreateTaskInput) => Task;
  updateTask: (id: string, input: UpdateTaskInput) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;

  // Selectors (computed helpers)
  getByStatus: (status: TaskStatus) => Task[];
  getTodaysTasks: () => Task[];
  getStats: () => { total: number; completed: number; active: number; deferred: number };
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isLoading: false,

  loadTasks: () => {
    set({ isLoading: true });
    const tasks = taskRepository.getAll();
    set({ tasks, isLoading: false });
  },

  createTask: (input) => {
    const task = taskRepository.create(input);
    set((state) => ({ tasks: [task, ...state.tasks] }));
    return task;
  },

  updateTask: (id, input) => {
    taskRepository.update(id, input);
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...input, updatedAt: new Date().toISOString() } : t
      ),
    }));
  },

  toggleTask: (id) => {
    const updated = taskRepository.toggleStatus(id);
    if (!updated) return;
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
    }));
  },

  deleteTask: (id) => {
    taskRepository.delete(id);
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
  },

  getByStatus: (status) => get().tasks.filter((t) => t.status === status),

  getTodaysTasks: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().tasks.filter((t) => t.dueDate === today);
  },

  getStats: () => {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = get().tasks.filter((t) => t.dueDate === today);
    return {
      total: todayTasks.length,
      completed: todayTasks.filter((t) => t.status === 'completed').length,
      active: todayTasks.filter((t) => t.status === 'active').length,
      deferred: todayTasks.filter((t) => t.status === 'deferred').length,
    };
  },
}));
