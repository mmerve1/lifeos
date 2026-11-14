import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../store';

export default function Index() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
