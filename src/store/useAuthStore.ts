import { create } from 'zustand';
import { UserProfileType } from '../types';
import { authApi } from '../api/authApi';
import { setUnauthorizedHandler, tokenStorage } from '../api/client';

interface AuthState {
  isAuthenticated: boolean;
  isHydrated: boolean;
  user: UserProfileType | null;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  restoreSession: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfileType>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isHydrated: false,
  user: null,

  login: async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    await tokenStorage.setTokens(res.accessToken, res.refreshToken);
    set({
      isAuthenticated: true,
      isHydrated: true,
      user: {
        name: res.user.fullName,
        email: res.user.email,
        initials: res.user.initials,
      },
    });
  },

  register: async (fullName: string, email: string, password: string) => {
    const res = await authApi.register(fullName, email, password);
    await tokenStorage.setTokens(res.accessToken, res.refreshToken);
    set({
      isAuthenticated: true,
      isHydrated: true,
      user: {
        name: res.user.fullName,
        email: res.user.email,
        initials: res.user.initials,
      },
    });
  },

  restoreSession: async () => {
    const token = await tokenStorage.getAccessToken();
    if (!token) {
      set({ isHydrated: true, isAuthenticated: false, user: null });
      return;
    }
    try {
      const me = await authApi.getMe();
      set({
        isAuthenticated: true,
        isHydrated: true,
        user: {
          name: me.fullName,
          email: me.email,
          initials: me.initials,
        },
      });
    } catch {
      await tokenStorage.clearTokens();
      set({ isAuthenticated: false, isHydrated: true, user: null });
    }
  },

  logout: async () => {
    await tokenStorage.clearTokens();
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

setUnauthorizedHandler(() => {
  useAuthStore.setState({ isAuthenticated: false, user: null });
});
