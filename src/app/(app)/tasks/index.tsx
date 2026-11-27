import React from 'react';
import { useRouter } from 'expo-router';
import { TaskListScreen } from '../../../screens/TaskListScreen';
import { useAuthStore, useTaskStore } from '../../../store';

export default function TasksRoute() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const clearTasks = useTaskStore((s) => s.clearTasks);

  return (
    <TaskListScreen
      userName={user?.name || 'Merve'}
      onNavigateToHome={() => router.replace('/(app)')}
      onNavigateToCalendar={() => router.replace('/(app)/calendar')}
      onNavigateToHabits={() => router.replace('/(app)/habits')}
      onNavigateToMentor={() => router.replace('/(app)/mentor')}
      onLogout={async () => {
        clearTasks();
        await logout();
        router.replace('/(auth)/login');
      }}
      onNavigateToCreate={() => router.push('/(app)/tasks/new')}
      onNavigateToEdit={(id) => router.push({ pathname: '/(app)/tasks/[id]', params: { id } })}
    />
  );
}
