import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useI18n } from '../i18n';
import { AuthShell } from '../components/auth/AuthShell';
import { createForgotPasswordSchema } from '../validation/authSchemas';

interface ForgotPasswordScreenProps {
  onNavigateToLogin: () => void;
  onNavigateToResetPassword: (email: string) => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onNavigateToLogin,
  onNavigateToResetPassword,
}) => {
  const { t, language } = useI18n();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [shakeCount, setShakeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = () => {
    if (isLoading) return;
    setError(null);

    const schema = createForgotPasswordSchema(t);
    const result = schema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? t('emailInvalid'));
      setShakeCount((c) => c + 1);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onNavigateToResetPassword(email.trim());
    }, 650);
  };

  return (
    <AuthShell shakeTrigger={shakeCount}>
      <View style={styles.formStack}>
        <Text style={styles.heading}>{t('forgotPasswordTitle')}</Text>
        <Text style={styles.subtitle}>
          {language === 'tr'
            ? 'E-posta adresini yaz, 6 haneli sıfırlama kodu gönderelim.'
            : 'Enter your email address and we will send you a 6-digit reset code.'}
        </Text>

        <Text style={styles.label}>{t('emailLabel')}</Text>
        <RNTextInput
          style={styles.input}
          placeholder={t('emailPlaceholder')}
          placeholderTextColor="#6A6FA8"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            if (error) setError(null);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={handleSendCode}
        />

        <View style={styles.errorSlot}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <Pressable
          onPress={handleSendCode}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.primaryPill,
            (pressed || isLoading) && { opacity: 0.85 },
          ]}
        >
          {isLoading && <ActivityIndicator size="small" color="#FFFFFF" />}
          <Text style={styles.primaryPillText}>
            {isLoading
              ? language === 'tr'
                ? 'Gönderiliyor…'
                : 'Sending…'
              : language === 'tr'
                ? 'Kod gönder'
                : 'Send code'}
          </Text>
        </Pressable>

        <Pressable onPress={onNavigateToLogin} style={styles.switchBtn} hitSlop={8}>
          <Text style={styles.switchBtnText}>← {t('forgotPasswordBackToLogin')}</Text>
        </Pressable>
      </View>
    </AuthShell>
  );
};

const styles = StyleSheet.create({
  formStack: {
    gap: 10,
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    color: '#14173A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#3E426E',
    lineHeight: 22,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14173A',
  },
  input: {
    height: 52,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#6A6FA8',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    color: '#14173A',
    fontSize: 16,
    fontWeight: '500',
  },
  errorSlot: {
    minHeight: 20,
    justifyContent: 'center',
  },
  errorText: {
    color: '#A3123A',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryPill: {
    height: 54,
    borderRadius: 99,
    backgroundColor: '#14173A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryPillText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  switchBtn: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchBtnText: {
    color: '#26307A',
    fontSize: 15,
    fontWeight: '600',
  },
});
