import { create } from 'zustand';
import { Habit, Goal, CreateHabitInput, CreateGoalInput } from '../types/habit';
import { habitGoalApi } from '../api/habitGoalApi';
import { addDays, toIsoDate } from '../utils/calendarUtils';

export function calculateStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;
  const set = new Set(completedDates);
  let streak = 0;
  let cursor = new Date();

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
  isLoading: boolean;
  error: string | null;

  loadAll: () => Promise<void>;
  toggleHabitDate: (habitId: string, isoDate: string) => Promise<void>;
  addHabit: (input: CreateHabitInput) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;

  addGoal: (input: CreateGoalInput) => Promise<void>;
  stepGoal: (goalId: string, delta: number) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  clearAll: () => void;
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [],
  goals: [],
  isLoading: false,
  error: null,

  loadAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const [habits, goals] = await Promise.all([
        habitGoalApi.getHabits(),
        habitGoalApi.getGoals(),
      ]);
      set({ habits, goals, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Veriler yüklenemedi.',
      });
    }
  },

  toggleHabitDate: async (habitId, isoDate) => {
    const prev = get().habits;
    // Optimistic update
    set({
      habits: prev.map((h) => {
        if (h.id !== habitId) return h;
        const exists = h.completedDates.includes(isoDate);
        return {
          ...h,
          completedDates: exists
            ? h.completedDates.filter((d) => d !== isoDate)
            : [...h.completedDates, isoDate],
        };
      }),
    });

    try {
      const updated = await habitGoalApi.toggleHabitDate(habitId, isoDate);
      set((state) => ({
        habits: state.habits.map((h) => (h.id === habitId ? updated : h)),
      }));
    } catch {
      set({ habits: prev });
    }
  },

  addHabit: async (input) => {
    const created = await habitGoalApi.createHabit(input);
    set((state) => ({ habits: [created, ...state.habits] }));
  },

  deleteHabit: async (habitId) => {
    const prev = get().habits;
    set({ habits: prev.filter((h) => h.id !== habitId) });
    try {
      await habitGoalApi.deleteHabit(habitId);
    } catch {
      set({ habits: prev });
    }
  },

  addGoal: async (input) => {
    const created = await habitGoalApi.createGoal(input);
    set((state) => ({ goals: [created, ...state.goals] }));
  },

  stepGoal: async (goalId, delta) => {
    const prev = get().goals;
    // Optimistic update
    set({
      goals: prev.map((g) => {
        if (g.id !== goalId) return g;
        const next = Math.max(0, Math.min(g.targetCount, g.currentCount + delta));
        return { ...g, currentCount: next };
      }),
    });

    try {
      const updated = await habitGoalApi.stepGoal(goalId, delta);
      set((state) => ({
        goals: state.goals.map((g) => (g.id === goalId ? updated : g)),
      }));
    } catch {
      set({ goals: prev });
    }
  },

  deleteGoal: async (goalId) => {
    const prev = get().goals;
    set({ goals: prev.filter((g) => g.id !== goalId) });
    try {
      await habitGoalApi.deleteGoal(goalId);
    } catch {
      set({ goals: prev });
    }
  },

  clearAll: () => set({ habits: [], goals: [], error: null }),
}));
