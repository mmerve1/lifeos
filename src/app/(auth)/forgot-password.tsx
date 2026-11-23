import React from 'react';
import { useRouter } from 'expo-router';
import { ForgotPasswordScreen } from '../../screens/ForgotPasswordScreen';

export default function ForgotPasswordRoute() {
  const router = useRouter();

  return (
    <ForgotPasswordScreen
      onNavigateToLogin={() => router.back()}
      onNavigateToResetPassword={(email) =>
        router.push({ pathname: '/(auth)/reset-password', params: { email } })
      }
    />
  );
}
