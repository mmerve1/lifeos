import React from 'react';
import { useRouter } from 'expo-router';
import { RegisterScreen } from '../../screens/RegisterScreen';
import { useAuthStore } from '../../store';

export default function RegisterRoute() {
  const router = useRouter();
  const { register } = useAuthStore();

  return (
    <RegisterScreen
      onNavigateToLogin={() => router.back()}
      onRegisterSuccess={(name, email) => {
        register(name, email);
        router.replace('/(app)');
      }}
    />
  );
}
