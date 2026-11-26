import { ModuleCategory } from './index';

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'active' | 'completed' | 'deferred';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: ModuleCategory;
  dueDate?: string;   // ISO date string e.g. "2026-11-24"
  dueTime?: string;   // e.g. "09:00"
  createdAt: string;  // ISO timestamp
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority: TaskPriority;
  category: ModuleCategory;
  dueDate?: string;
  dueTime?: string;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  status?: TaskStatus;
}
