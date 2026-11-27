import { apiRequest } from './client';
import { LifeProfile, SaveOnboardingInput } from '../types/profile';

export const profileApi = {
  getLifeProfile(): Promise<LifeProfile | null> {
    return apiRequest<LifeProfile | null>('/profile/life', { method: 'GET' });
  },

  saveOnboarding(input: SaveOnboardingInput): Promise<LifeProfile> {
    return apiRequest<LifeProfile>('/profile/onboarding', {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },
};
