import { create } from 'zustand';
import { UserProfileType } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfileType | null;
  login: (email: string, name?: string) => void;
  register: (name: string, email: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfileType>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,

  login: (email: string, name?: string) => {
    const inferredName =
      name ||
      email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);

    set({
      isAuthenticated: true,
      user: {
        name: inferredName,
        email,
        initials: inferredName.charAt(0).toUpperCase(),
      },
    });
  },

  register: (name: string, email: string) => {
    set({
      isAuthenticated: true,
      user: {
        name,
        email,
        initials: name.charAt(0).toUpperCase(),
      },
    });
  },

  logout: () => {
    set({
      isAuthenticated: false,
      user: null,
    });
  },

  updateProfile: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    }));
  },
}));
