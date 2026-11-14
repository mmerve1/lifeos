import React from 'react';
import { useRouter } from 'expo-router';
import { LoginScreen } from '../../screens/LoginScreen';
import { useAuthStore } from '../../store';

export default function LoginRoute() {
  const router = useRouter();
  const { login } = useAuthStore();

  return (
    <LoginScreen
      onNavigateToRegister={() => router.push('/(auth)/register')}
      onLoginSuccess={(email) => {
        login(email);
        router.replace('/(app)');
      }}
    />
  );
}
