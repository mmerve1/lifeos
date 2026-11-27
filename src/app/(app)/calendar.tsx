import React from 'react';
import { useRouter } from 'expo-router';
import { CalendarScreen } from '../../screens/CalendarScreen';
import { useAuthStore, useTaskStore } from '../../store';

export default function CalendarRoute() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const clearTasks = useTaskStore((s) => s.clearTasks);

  return (
    <CalendarScreen
      userName={user?.name || 'Merve'}
      onNavigateToHome={() => router.replace('/(app)')}
      onNavigateToTasks={() => router.replace('/(app)/tasks')}
      onNavigateToHabits={() => router.replace('/(app)/habits')}
      onNavigateToMentor={() => router.replace('/(app)/mentor')}
      onNavigateToEditTask={(id) => router.push({ pathname: '/(app)/tasks/[id]', params: { id } })}
      onLogout={async () => {
        clearTasks();
        await logout();
        router.replace('/(auth)/login');
      }}
    />
  );
}
