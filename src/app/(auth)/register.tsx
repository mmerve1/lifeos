import React from 'react';
import { useRouter } from 'expo-router';
import { RegisterScreen } from '../../screens/RegisterScreen';

export default function RegisterRoute() {
  const router = useRouter();

  return (
    <RegisterScreen
      onNavigateToLogin={() => router.back()}
      onRegisterSuccess={() => router.replace('/(app)')}
    />
  );
}
