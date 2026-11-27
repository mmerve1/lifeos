import { apiRequest } from './client';
import { LifeProfile, SaveOnboardingInput } from '../types/profile';

export interface UpdatedAccountResponse {
  id: string;
  fullName: string;
  email: string;
  initials: string;
}

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

  updateAccount(fullName: string): Promise<UpdatedAccountResponse> {
    return apiRequest<UpdatedAccountResponse>('/profile/account', {
      method: 'PUT',
      body: JSON.stringify({ fullName }),
    });
  },
};
