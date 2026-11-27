import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, Goal, CreateHabitInput, CreateGoalInput } from '../types/habit';
import { addDays, toIsoDate } from '../utils/calendarUtils';

const HABITS_KEY = '@lifeos_habits_v1';
const GOALS_KEY = '@lifeos_goals_v1';

function buildStarterDates(daysBack: number[]): string[] {
  const today = new Date();
  return daysBack.map((offset) => toIsoDate(addDays(today, -offset)));
}

function getDefaultHabits(): Habit[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'h1',
      title: 'Sabah yürüyüşü (30 dk)',
      category: 'health',
      targetPerWeek: 5,
      completedDates: buildStarterDates([0, 1, 2, 3, 5, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21]),
      createdAt: now,
    },
    {
      id: 'h2',
      title: '2L su iç',
      category: 'health',
      targetPerWeek: 7,
      completedDates: buildStarterDates([0, 1, 2, 3, 4, 5, 7, 8, 9, 11, 12, 13, 14, 16, 17, 19, 22]),
      createdAt: now,
    },
    {
      id: 'h3',
      title: '20 dk İngilizce kelime & okuma',
      category: 'learning',
      targetPerWeek: 5,
      completedDates: buildStarterDates([1, 2, 3, 4, 6, 8, 10, 11, 13, 15, 17, 20]),
      createdAt: now,
    },
    {
      id: 'h4',
      title: 'Derin odak çalışması (1 saat)',
      category: 'career',
      targetPerWeek: 5,
      completedDates: buildStarterDates([0, 1, 3, 4, 5, 7, 10, 12, 14, 15, 18]),
      createdAt: now,
    },
  ];
}

function getDefaultGoals(): Goal[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'g1',
      title: 'Haftalık 3 iş başvurusu & portföy güncellemesi',
      description: 'CV ve GitHub projelerini güncelleyip başvuru yap',
      category: 'career',
      period: 'weekly',
      currentCount: 2,
      targetCount: 3,
      deadline: toIsoDate(addDays(new Date(), 4)),
      createdAt: now,
    },
    {
      id: 'g2',
      title: 'Bu ay 2 kitap bitir',
      description: 'Atomic Habits + Clean Architecture',
      category: 'learning',
      period: 'monthly',
      currentCount: 1,
      targetCount: 2,
      deadline: toIsoDate(addDays(new Date(), 18)),
      createdAt: now,
    },
    {
      id: 'g3',
      title: 'Haftalık 4 antrenman',
      description: 'Yürüyüş, koşu veya kuvvet antrenmanı',
      category: 'health',
      period: 'weekly',
      currentCount: 3,
      targetCount: 4,
      deadline: toIsoDate(addDays(new Date(), 3)),
      createdAt: now,
    },
  ];
}

export function calculateStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;
  const set = new Set(completedDates);
  let streak = 0;
  let cursor = new Date();

  // If today is not completed yet, check starting from yesterday
  if (!set.has(toIsoDate(cursor))) {
    cursor = addDays(cursor, -1);
  }

  while (set.has(toIsoDate(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

interface HabitStore {
  habits: Habit[];
  goals: Goal[];
  isLoaded: boolean;

  loadAll: () => Promise<void>;
  toggleHabitDate: (habitId: string, isoDate: string) => Promise<void>;
  addHabit: (input: CreateHabitInput) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;

  addGoal: (input: CreateGoalInput) => Promise<void>;
  stepGoal: (goalId: string, delta: number) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [],
  goals: [],
  isLoaded: false,

  loadAll: async () => {
    if (get().isLoaded) return;
    try {
      const [rawHabits, rawGoals] = await Promise.all([
        AsyncStorage.getItem(HABITS_KEY),
        AsyncStorage.getItem(GOALS_KEY),
      ]);

      const habits: Habit[] = rawHabits ? JSON.parse(rawHabits) : getDefaultHabits();
      const goals: Goal[] = rawGoals ? JSON.parse(rawGoals) : getDefaultGoals();

      if (!rawHabits) await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
      if (!rawGoals) await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(goals));

      set({ habits, goals, isLoaded: true });
    } catch {
      set({ habits: getDefaultHabits(), goals: getDefaultGoals(), isLoaded: true });
    }
  },

  toggleHabitDate: async (habitId, isoDate) => {
    const updated = get().habits.map((h) => {
      if (h.id !== habitId) return h;
      const exists = h.completedDates.includes(isoDate);
      return {
        ...h,
        completedDates: exists
          ? h.completedDates.filter((d) => d !== isoDate)
          : [...h.completedDates, isoDate],
      };
    });
    set({ habits: updated });
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updated));
  },

  addHabit: async (input) => {
    const habit: Habit = {
      id: `h_${Date.now()}`,
      title: input.title.trim(),
      category: input.category,
      targetPerWeek: input.targetPerWeek ?? 5,
      completedDates: [],
      createdAt: new Date().toISOString(),
    };
    const updated = [habit, ...get().habits];
    set({ habits: updated });
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updated));
  },

  deleteHabit: async (habitId) => {
    const updated = get().habits.filter((h) => h.id !== habitId);
    set({ habits: updated });
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updated));
  },

  addGoal: async (input) => {
    const goal: Goal = {
      id: `g_${Date.now()}`,
      title: input.title.trim(),
      description: input.description?.trim() || undefined,
      category: input.category,
      period: input.period,
      currentCount: 0,
      targetCount: Math.max(1, input.targetCount),
      deadline: input.deadline?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    const updated = [goal, ...get().goals];
    set({ goals: updated });
    await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(updated));
  },

  stepGoal: async (goalId, delta) => {
    const updated = get().goals.map((g) => {
      if (g.id !== goalId) return g;
      const next = Math.max(0, Math.min(g.targetCount, g.currentCount + delta));
      return { ...g, currentCount: next };
    });
    set({ goals: updated });
    await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(updated));
  },

  deleteGoal: async (goalId) => {
    const updated = get().goals.filter((g) => g.id !== goalId);
    set({ goals: updated });
    await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(updated));
  },
}));
