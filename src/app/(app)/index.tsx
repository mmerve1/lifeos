import React from 'react';
import { useRouter } from 'expo-router';
import { DashboardScreen } from '../../screens/DashboardScreen';
import { useAuthStore, useTaskStore } from '../../store';

export default function DashboardRoute() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const clearTasks = useTaskStore((s) => s.clearTasks);

  return (
    <DashboardScreen
      userName={user?.name || 'Merve'}
      onLogout={async () => {
        clearTasks();
        await logout();
        router.replace('/(auth)/login');
      }}
      onNavigateToTasks={() => router.push('/(app)/tasks')}
      onNavigateToNewTask={() => router.push('/(app)/tasks/new')}
      onNavigateToCalendar={() => router.push('/(app)/calendar')}
      onNavigateToHabits={() => router.push('/(app)/habits')}
    />
  );
}
