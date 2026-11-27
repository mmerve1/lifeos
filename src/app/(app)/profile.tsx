import React from 'react';
import { useRouter } from 'expo-router';
import { ProfileScreen } from '../../screens/ProfileScreen';
import { useAuthStore, useTaskStore, useLifeProfileStore } from '../../store';

export default function ProfileRoute() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const clearTasks = useTaskStore((s) => s.clearTasks);
  const clearProfile = useLifeProfileStore((s) => s.clearProfile);

  return (
    <ProfileScreen
      onNavigateToHome={() => router.replace('/(app)')}
      onNavigateToTasks={() => router.replace('/(app)/tasks')}
      onNavigateToCalendar={() => router.replace('/(app)/calendar')}
      onNavigateToHabits={() => router.replace('/(app)/habits')}
      onNavigateToMentor={() => router.replace('/(app)/mentor')}
      onNavigateToOnboarding={() => router.push('/(app)/onboarding')}
      onLogout={async () => {
        clearTasks();
        clearProfile();
        await logout();
        router.replace('/(auth)/login');
      }}
    />
  );
}
