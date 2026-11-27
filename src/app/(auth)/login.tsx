import React from 'react';
import { useRouter } from 'expo-router';
import { LoginScreen } from '../../screens/LoginScreen';

export default function LoginRoute() {
  const router = useRouter();

  return (
    <LoginScreen
      onNavigateToRegister={() => router.push('/(auth)/register')}
      onLoginSuccess={() => router.replace('/(app)')}
      onNavigateToForgotPassword={() => router.push('/(auth)/forgot-password')}
    />
  );
}
