import { Task, CreateTaskInput, UpdateTaskInput, TaskStatus } from '../../../types/task';

// In-memory mock store – will be replaced by real API calls when backend is ready
let _tasks: Task[] = [
  {
    id: '1',
    title: 'İngilizce pratik yap',
    description: 'Duolingo + 15 dakika podcast dinle',
    priority: 'medium',
    status: 'completed',
    category: 'learning',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '09:00',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Proje geliştirme',
    description: 'LifeOS task modülünü tamamla',
    priority: 'high',
    status: 'active',
    category: 'career',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '11:00',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Kitap oku',
    description: 'Atomic Habits — 30 dakika',
    priority: 'low',
    status: 'active',
    category: 'personal',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '20:00',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Haftalık bütçe kontrolü',
    description: 'Harcamaları gözden geçir',
    priority: 'medium',
    status: 'deferred',
    category: 'finance',
    dueDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function generateId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export const taskRepository = {
  getAll(): Task[] {
    return [..._tasks];
  },

  getById(id: string): Task | undefined {
    return _tasks.find((t) => t.id === id);
  },

  getByStatus(status: TaskStatus): Task[] {
    return _tasks.filter((t) => t.status === status);
  },

  getTodaysTasks(): Task[] {
    const today = new Date().toISOString().split('T')[0];
    return _tasks.filter((t) => t.dueDate === today);
  },

  create(input: CreateTaskInput): Task {
    const now = new Date().toISOString();
    const task: Task = {
      id: generateId(),
      title: input.title,
      description: input.description,
      priority: input.priority,
      category: input.category,
      dueDate: input.dueDate,
      dueTime: input.dueTime,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    _tasks = [task, ..._tasks];
    return task;
  },

  update(id: string, input: UpdateTaskInput): Task | undefined {
    let updated: Task | undefined;
    _tasks = _tasks.map((t) => {
      if (t.id === id) {
        updated = { ...t, ...input, updatedAt: new Date().toISOString() };
        return updated;
      }
      return t;
    });
    return updated;
  },

  toggleStatus(id: string): Task | undefined {
    const task = _tasks.find((t) => t.id === id);
    if (!task) return undefined;
    const nextStatus: TaskStatus = task.status === 'completed' ? 'active' : 'completed';
    return taskRepository.update(id, { status: nextStatus });
  },

  delete(id: string): boolean {
    const before = _tasks.length;
    _tasks = _tasks.filter((t) => t.id !== id);
    return _tasks.length < before;
  },

  getStats(): { total: number; completed: number; active: number; deferred: number } {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = _tasks.filter((t) => t.dueDate === today);
    return {
      total: todayTasks.length,
      completed: todayTasks.filter((t) => t.status === 'completed').length,
      active: todayTasks.filter((t) => t.status === 'active').length,
      deferred: todayTasks.filter((t) => t.status === 'deferred').length,
    };
  },
};
