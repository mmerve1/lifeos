import { ModuleCategory } from './index';

export interface LifeProfile {
  id: string;
  lifeStage: string;
  focusAreas: ModuleCategory[];
  primaryGoal: string;
  peakTime: 'morning' | 'afternoon' | 'evening' | string;
  mentorStyle: 'supportive' | 'direct' | 'concise' | string;
  onboardingCompleted: boolean;
  updatedAt: string;
}

export interface SaveOnboardingInput {
  lifeStage: string;
  focusAreas: ModuleCategory[];
  primaryGoal: string;
  peakTime: string;
  mentorStyle: string;
}
