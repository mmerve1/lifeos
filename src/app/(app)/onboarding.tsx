import React from 'react';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '../../screens/OnboardingScreen';
import { useAuthStore } from '../../store';

export default function OnboardingRoute() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  return (
    <OnboardingScreen
      userName={user?.name || 'Merve'}
      onComplete={() => router.replace('/(app)')}
      onSkip={() => router.replace('/(app)')}
    />
  );
}
