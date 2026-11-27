import { apiRequest } from './client';
import { Habit, Goal, CreateHabitInput, CreateGoalInput } from '../types/habit';

export const habitGoalApi = {
  getHabits(): Promise<Habit[]> {
    return apiRequest<Habit[]>('/habits', { method: 'GET' });
  },

  createHabit(input: CreateHabitInput): Promise<Habit> {
    return apiRequest<Habit>('/habits', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  toggleHabitDate(habitId: string, date: string): Promise<Habit> {
    return apiRequest<Habit>(`/habits/${habitId}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ date }),
    });
  },

  deleteHabit(habitId: string): Promise<{ deleted: boolean }> {
    return apiRequest<{ deleted: boolean }>(`/habits/${habitId}`, {
      method: 'DELETE',
    });
  },

  getGoals(): Promise<Goal[]> {
    return apiRequest<Goal[]>('/goals', { method: 'GET' });
  },

  createGoal(input: CreateGoalInput): Promise<Goal> {
    return apiRequest<Goal>('/goals', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  stepGoal(goalId: string, delta: number): Promise<Goal> {
    return apiRequest<Goal>(`/goals/${goalId}/step`, {
      method: 'PATCH',
      body: JSON.stringify({ delta }),
    });
  },

  deleteGoal(goalId: string): Promise<{ deleted: boolean }> {
    return apiRequest<{ deleted: boolean }>(`/goals/${goalId}`, {
      method: 'DELETE',
    });
  },
};
