import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ResetPasswordScreen } from '../../screens/ResetPasswordScreen';

export default function ResetPasswordRoute() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  return (
    <ResetPasswordScreen
      email={email ?? ''}
      onNavigateToLogin={() => router.replace('/(auth)/login')}
    />
  );
}
