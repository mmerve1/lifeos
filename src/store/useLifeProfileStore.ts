import { create } from 'zustand';
import { LifeProfile, SaveOnboardingInput } from '../types/profile';
import { profileApi } from '../api/profileApi';

interface LifeProfileStore {
  profile: LifeProfile | null;
  isLoaded: boolean;
  isLoading: boolean;

  loadProfile: () => Promise<LifeProfile | null>;
  saveOnboarding: (input: SaveOnboardingInput) => Promise<LifeProfile>;
  clearProfile: () => void;
}

export const useLifeProfileStore = create<LifeProfileStore>((set) => ({
  profile: null,
  isLoaded: false,
  isLoading: false,

  loadProfile: async () => {
    set({ isLoading: true });
    try {
      const profile = await profileApi.getLifeProfile();
      set({ profile, isLoaded: true, isLoading: false });
      return profile;
    } catch {
      set({ isLoaded: true, isLoading: false });
      return null;
    }
  },

  saveOnboarding: async (input) => {
    set({ isLoading: true });
    try {
      const saved = await profileApi.saveOnboarding(input);
      set({ profile: saved, isLoaded: true, isLoading: false });
      return saved;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  clearProfile: () => set({ profile: null, isLoaded: false }),
}));
