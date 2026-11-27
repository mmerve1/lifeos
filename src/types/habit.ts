import { ModuleCategory } from './index';

export interface Habit {
  id: string;
  title: string;
  category: ModuleCategory;
  targetPerWeek: number;
  completedDates: string[]; // ISO YYYY-MM-DD
  createdAt: string;
}

export type GoalPeriod = 'weekly' | 'monthly';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: ModuleCategory;
  period: GoalPeriod;
  currentCount: number;
  targetCount: number;
  deadline?: string; // ISO YYYY-MM-DD
  createdAt: string;
}

export interface CreateHabitInput {
  title: string;
  category: ModuleCategory;
  targetPerWeek?: number;
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  category: ModuleCategory;
  period: GoalPeriod;
  targetCount: number;
  deadline?: string;
}
