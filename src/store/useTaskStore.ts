import { create } from 'zustand';
import { Task, CreateTaskInput, UpdateTaskInput, TaskStatus } from '../types/task';
import { taskRepository } from '../features/personal/repository/taskRepository';

interface TaskStore {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

  loadTasks: () => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<Task>;
  updateTask: (id: string, input: UpdateTaskInput) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  clearTasks: () => void;

  getByStatus: (status: TaskStatus) => Task[];
  getTodaysTasks: () => Task[];
  getStats: () => { total: number; completed: number; active: number; deferred: number };
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  loadTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await taskRepository.getAll();
      set({ tasks, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Görevler yüklenemedi.',
      });
    }
  },

  createTask: async (input) => {
    const created = await taskRepository.create(input);
    set((state) => ({ tasks: [created, ...state.tasks] }));
    return created;
  },

  updateTask: async (id, input) => {
    const updated = await taskRepository.update(id, input);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
    }));
  },

  toggleTask: async (id) => {
    // Optimistic update for snappy UI + orbit animation
    const prevTasks = get().tasks;
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? { ...t, status: t.status === 'completed' ? 'active' : 'completed' }
          : t
      ),
    }));

    try {
      const updated = await taskRepository.toggleStatus(id);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
      }));
    } catch {
      // Revert on failure
      set({ tasks: prevTasks });
    }
  },

  deleteTask: async (id) => {
    const prevTasks = get().tasks;
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
    try {
      await taskRepository.delete(id);
    } catch {
      set({ tasks: prevTasks });
    }
  },

  clearTasks: () => set({ tasks: [], error: null }),

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
