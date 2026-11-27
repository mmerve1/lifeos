import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { Check } from 'lucide-react-native';
import { useI18n } from '../i18n';
import { AuthShell } from '../components/auth/AuthShell';
import { authApi } from '../api/authApi';

interface ResetPasswordScreenProps {
  email: string;
  devCode?: string;
  onNavigateToLogin: () => void;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({
  email,
  devCode,
  onNavigateToLogin,
}) => {
  const { t, language } = useI18n();

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [shakeCount, setShakeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const popScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isSuccess) return;
    popScale.setValue(0);
    Animated.spring(popScale, {
      toValue: 1,
      friction: 5,
      tension: 95,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [isSuccess, popScale]);

  const strengthScore = useMemo(() => {
    if (!newPassword) return 0;
    return [
      newPassword.length >= 8,
      /\d/.test(newPassword),
      /[^A-Za-z0-9]/.test(newPassword) ||
        (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)),
    ].filter(Boolean).length;
  }, [newPassword]);

  const strengthColor = ['#A3123A', '#A3123A', '#B86E00', '#14773F'][strengthScore];
  const strengthWidth: `${number}%` = newPassword
    ? `${Math.max(strengthScore, 1) * 33.3}%`
    : '0%';

  const handleReset = async () => {
    if (isLoading) return;
    setError(null);

    if (!/^\d{6}$/.test(code.trim())) {
      setError(
        language === 'tr'
          ? '6 haneli doğrulama kodunu yaz.'
          : 'Please enter the 6-digit verification code.'
      );
      setShakeCount((c) => c + 1);
      return;
    }

    if (newPassword.length < 8) {
      setError(t('newPasswordMinLength'));
      setShakeCount((c) => c + 1);
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword(email, code.trim(), newPassword);
      setIsLoading(false);
      setIsSuccess(true);
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : t('newPasswordMinLength'));
      setShakeCount((c) => c + 1);
    }
  };

  if (isSuccess) {
    return (
      <AuthShell>
        <View style={styles.doneStack}>
          <Animated.View style={[styles.doneCircle, { transform: [{ scale: popScale }] }]}>
            <Check size={44} color="#FFFFFF" strokeWidth={3} />
          </Animated.View>

          <Text style={styles.doneTitle}>
            {language === 'tr' ? 'Parolan yenilendi' : 'Password updated'}
          </Text>
          <Text style={styles.doneSubtitle}>{t('resetPasswordSuccessDesc')}</Text>

          <Pressable
            onPress={onNavigateToLogin}
            style={({ pressed }) => [styles.primaryPill, { width: '100%' }, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.primaryPillText}>{t('logInButton')}</Text>
          </Pressable>
        </View>
      </AuthShell>
    );
  }

  return (
    <AuthShell shakeTrigger={shakeCount}>
      <View style={styles.formStack}>
        <Text style={styles.heading}>{t('resetPasswordTitle')}</Text>
        <Text style={styles.subtitle}>
          {language === 'tr'
            ? `${email || 'E-posta adresin'} kayıtlıysa 6 haneli bir kod gönderildi.${devCode ? ` (Geliştirme kodu: ${devCode})` : ''}`
            : `If ${email || 'your email'} is registered, a 6-digit code was sent.${devCode ? ` (Dev code: ${devCode})` : ''}`}
        </Text>

        <Text style={styles.label}>
          {language === 'tr' ? 'Doğrulama kodu' : 'Verification code'}
        </Text>
        <RNTextInput
          style={styles.codeInput}
          placeholder="000000"
          placeholderTextColor="#9CA1CF"
          value={code}
          onChangeText={(v) => {
            setCode(v.replace(/[^0-9]/g, '').slice(0, 6));
            if (error) setError(null);
          }}
          keyboardType="number-pad"
          maxLength={6}
        />

        <Text style={styles.label}>
          {t('newPasswordLabel')} ({t('passwordRuleHint')})
        </Text>
        <RNTextInput
          style={styles.input}
          placeholder={t('newPasswordPlaceholder')}
          placeholderTextColor="#6A6FA8"
          value={newPassword}
          onChangeText={(v) => {
            setNewPassword(v);
            if (error) setError(null);
          }}
          secureTextEntry
          autoCapitalize="none"
          onSubmitEditing={handleReset}
        />

        <View style={styles.strengthTrack}>
          <View
            style={[
              styles.strengthFill,
              { width: strengthWidth, backgroundColor: strengthColor },
            ]}
          />
        </View>

        <View style={styles.errorSlot}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <Pressable
          onPress={handleReset}
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
                ? 'Kaydediliyor…'
                : 'Saving…'
              : t('resetPasswordButton')}
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
    fontSize: 14,
    color: '#3E426E',
    lineHeight: 20,
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14173A',
  },
  codeInput: {
    height: 60,
    borderWidth: 2,
    borderColor: '#6A6FA8',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    color: '#14173A',
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 10,
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
  strengthTrack: {
    height: 8,
    borderRadius: 99,
    backgroundColor: '#C3C7EC',
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 99,
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
  doneStack: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 20,
  },
  doneCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#14173A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#14173A',
    textAlign: 'center',
  },
  doneSubtitle: {
    fontSize: 15,
    color: '#3E426E',
    textAlign: 'center',
    marginBottom: 8,
  },
});
