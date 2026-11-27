import React from 'react';
import { useRouter } from 'expo-router';
import { TaskListScreen } from '../../../screens/TaskListScreen';
import { useAuthStore } from '../../../store';

export default function TasksRoute() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  return (
    <TaskListScreen
      userName={user?.name || 'Merve'}
      onNavigateToHome={() => router.replace('/(app)')}
      onLogout={() => {
        logout();
        router.replace('/(auth)/login');
      }}
      onNavigateToCreate={() => router.push('/(app)/tasks/new')}
      onNavigateToEdit={(id) => router.push({ pathname: '/(app)/tasks/[id]', params: { id } })}
    />
  );
}
