import React from 'react';
import { useRouter } from 'expo-router';
import { TaskFormScreen } from '../../../screens/TaskFormScreen';

export default function NewTaskRoute() {
  const router = useRouter();
  return (
    <TaskFormScreen
      onBack={() => router.back()}
      onSaved={() => router.back()}
    />
  );
}
