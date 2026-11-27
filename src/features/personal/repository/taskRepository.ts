import { apiRequest } from '../../../api/client';
import { Task, CreateTaskInput, UpdateTaskInput, TaskStatus } from '../../../types/task';

export const taskRepository = {
  getAll(status?: TaskStatus, dueDate?: string): Promise<Task[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (dueDate) params.append('dueDate', dueDate);
    const qs = params.toString();
    return apiRequest<Task[]>(`/tasks${qs ? `?${qs}` : ''}`, { method: 'GET' });
  },

  getById(id: string): Promise<Task> {
    return apiRequest<Task>(`/tasks/${id}`, { method: 'GET' });
  },

  create(input: CreateTaskInput): Promise<Task> {
    return apiRequest<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  update(id: string, input: UpdateTaskInput): Promise<Task> {
    return apiRequest<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },

  toggleStatus(id: string): Promise<Task> {
    return apiRequest<Task>(`/tasks/${id}/toggle`, {
      method: 'PATCH',
    });
  },

  delete(id: string): Promise<{ deleted: boolean }> {
    return apiRequest<{ deleted: boolean }>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};
