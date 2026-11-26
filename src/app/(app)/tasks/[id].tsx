import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { TaskFormScreen } from '../../../screens/TaskFormScreen';

export default function EditTaskRoute() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <TaskFormScreen
      taskId={id}
      onBack={() => router.back()}
      onSaved={() => router.back()}
    />
  );
}
