import React from 'react';
import { useRouter } from 'expo-router';
import { TaskListScreen } from '../../../screens/TaskListScreen';

export default function TasksRoute() {
  const router = useRouter();
  return (
    <TaskListScreen
      onNavigateToCreate={() => router.push('/(app)/tasks/new')}
      onNavigateToEdit={(id) => router.push({ pathname: '/(app)/tasks/[id]', params: { id } })}
    />
  );
}
