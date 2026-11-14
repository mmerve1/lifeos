import {
  UserProfileType,
  WeeklyProgressType,
  StatMetricType,
  AgendaItemType,
  ModuleItemType,
} from '../types';

export const mockUser: UserProfileType = {
  name: 'Merve',
  email: 'merve@example.com',
  initials: 'M',
};

export const mockProgress: WeeklyProgressType = {
  percentage: 72,
  message: "You're making progress towards your goals.",
  tasksCompleted: 5,
  tasksTotal: 8,
  activeGoals: 3,
};

export const mockStats: StatMetricType[] = [
  {
    id: 'tasks',
    label: 'Tasks completed',
    value: '5/8',
    subtitle: '62% done today',
    icon: 'CheckCircle2',
  },
  {
    id: 'goals',
    label: 'Active goals',
    value: '3',
    subtitle: 'In progress',
    icon: 'Target',
  },
];

export const mockAgendaItems: AgendaItemType[] = [
  {
    id: '1',
    time: '09:00',
    title: 'English practice',
    module: 'Learning',
    category: 'learning',
    completed: true,
  },
  {
    id: '2',
    time: '11:00',
    title: 'Project development',
    module: 'Career',
    category: 'career',
    completed: false,
  },
  {
    id: '3',
    time: '20:00',
    title: 'Read a book',
    module: 'Personal',
    category: 'personal',
    completed: false,
  },
];

export const mockModules: ModuleItemType[] = [
  {
    id: 'career',
    name: 'Career',
    description: 'Projects, milestones & work logs',
    category: 'career',
    iconName: 'Briefcase',
    badge: '1 active',
  },
  {
    id: 'academic',
    name: 'Academic',
    description: 'Courses, exams & research notes',
    category: 'academic',
    iconName: 'GraduationCap',
  },
  {
    id: 'finance',
    name: 'Finance',
    description: 'Budget, savings & expenses',
    category: 'finance',
    iconName: 'Wallet',
  },
  {
    id: 'health',
    name: 'Health & Wellness',
    description: 'Habits, workouts & hydration',
    category: 'health',
    iconName: 'HeartPulse',
    badge: 'Streak: 6d',
  },
  {
    id: 'learning',
    name: 'Learning',
    description: 'Languages, books & courses',
    category: 'learning',
    iconName: 'BookOpen',
  },
  {
    id: 'social',
    name: 'Social',
    description: 'Network, events & meetings',
    category: 'social',
    iconName: 'Users',
  },
  {
    id: 'personal',
    name: 'Personal',
    description: 'Journal, reflections & life tracker',
    category: 'personal',
    iconName: 'Compass',
  },
  {
    id: 'ai',
    name: 'LifeOS AI',
    description: 'Smart insights & daily review',
    category: 'ai',
    iconName: 'Sparkles',
    badge: 'Beta',
  },
];
