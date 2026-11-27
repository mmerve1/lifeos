import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ResetPasswordScreen } from '../../screens/ResetPasswordScreen';

export default function ResetPasswordRoute() {
  const router = useRouter();
  const { email, devCode } = useLocalSearchParams<{ email: string; devCode?: string }>();

  return (
    <ResetPasswordScreen
      email={email ?? ''}
      devCode={devCode}
      onNavigateToLogin={() => router.replace('/(auth)/login')}
    />
  );
}
