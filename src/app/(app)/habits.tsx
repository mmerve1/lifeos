import React from 'react';
import { useRouter } from 'expo-router';
import { HabitsGoalsScreen } from '../../screens/HabitsGoalsScreen';
import { useAuthStore, useTaskStore } from '../../store';

export default function HabitsRoute() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const clearTasks = useTaskStore((s) => s.clearTasks);

  return (
    <HabitsGoalsScreen
      userName={user?.name || 'Merve'}
      onNavigateToHome={() => router.replace('/(app)')}
      onNavigateToTasks={() => router.replace('/(app)/tasks')}
      onNavigateToCalendar={() => router.replace('/(app)/calendar')}
      onNavigateToMentor={() => router.replace('/(app)/mentor')}
      onNavigateToProfile={() => router.replace('/(app)/profile')}
      onLogout={async () => {
        clearTasks();
        await logout();
        router.replace('/(auth)/login');
      }}
    />
  );
}
