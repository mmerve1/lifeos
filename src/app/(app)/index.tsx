import React from 'react';
import { useRouter } from 'expo-router';
import { DashboardScreen } from '../../screens/DashboardScreen';
import { useAuthStore } from '../../store';

export default function DashboardRoute() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  return (
    <DashboardScreen
      userName={user?.name || 'Merve'}
      onLogout={() => {
        logout();
        router.replace('/(auth)/login');
      }}
      onNavigateToTasks={() => router.push('/(app)/tasks')}
      onNavigateToNewTask={() => router.push('/(app)/tasks/new')}
    />
  );
}
