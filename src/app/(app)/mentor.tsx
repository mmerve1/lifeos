import React from 'react';
import { useRouter } from 'expo-router';
import { AIMentorScreen } from '../../screens/AIMentorScreen';
import { useAuthStore, useTaskStore } from '../../store';

export default function MentorRoute() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const clearTasks = useTaskStore((s) => s.clearTasks);

  return (
    <AIMentorScreen
      userName={user?.name || 'Merve'}
      onNavigateToHome={() => router.replace('/(app)')}
      onNavigateToTasks={() => router.replace('/(app)/tasks')}
      onNavigateToCalendar={() => router.replace('/(app)/calendar')}
      onNavigateToHabits={() => router.replace('/(app)/habits')}
      onNavigateToProfile={() => router.replace('/(app)/profile')}
      onLogout={async () => {
        clearTasks();
        await logout();
        router.replace('/(auth)/login');
      }}
    />
  );
}
