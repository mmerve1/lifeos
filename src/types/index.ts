export type ScreenType = 'login' | 'register' | 'dashboard';

export type NavTabType = 'home' | 'calendar' | 'tasks' | 'habits' | 'ai' | 'profile';

export type ModuleCategory =
  | 'career'
  | 'academic'
  | 'finance'
  | 'health'
  | 'learning'
  | 'social'
  | 'personal'
  | 'ai';

export interface AgendaItemType {
  id: string;
  time: string;
  title: string;
  module: string;
  category: ModuleCategory;
  completed: boolean;
}

export interface ModuleItemType {
  id: string;
  name: string;
  description: string;
  category: ModuleCategory;
  iconName: string;
  badge?: string;
}

export interface StatMetricType {
  id: string;
  label: string;
  value: string;
  subtitle: string;
  icon: string;
}

export interface WeeklyProgressType {
  percentage: number;
  message: string;
  tasksCompleted: number;
  tasksTotal: number;
  activeGoals: number;
}

export interface UserProfileType {
  name: string;
  email: string;
  initials: string;
  avatarUrl?: string;
}
