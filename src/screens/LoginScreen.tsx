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
import { PortalTransition } from '../components/auth/PortalTransition';
import { createLoginSchema } from '../validation/authSchemas';

interface LoginScreenProps {
  onNavigateToRegister: () => void;
  onLoginSuccess: (userEmail: string) => void;
  onNavigateToForgotPassword?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToRegister,
  onLoginSuccess,
  onNavigateToForgotPassword,
}) => {
  const { t, language } = useI18n();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shakeCount, setShakeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPortal, setShowPortal] = useState(false);

  const triggerError = (msg: string) => {
    setError(msg);
    setShakeCount((c) => c + 1);
  };

  const handleLogin = () => {
    if (isLoading) return;
    setError(null);

    const schema = createLoginSchema(t);
    const result = schema.safeParse({ email, password });

    if (!result.success) {
      triggerError(result.error.issues[0]?.message ?? t('emailInvalid'));
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowPortal(true);
    }, 650);
  };

  return (
    <View style={styles.root}>
      <AuthShell shakeTrigger={shakeCount}>
        <View style={styles.formStack}>
          <Text style={styles.heading}>{t('welcomeBack')}</Text>

          <Text style={styles.label}>{t('emailLabel')}</Text>
          <RNTextInput
            style={styles.input}
            placeholder={t('emailPlaceholder')}
            placeholderTextColor="#6A6FA8"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>{t('passwordLabel')}</Text>
          <RNTextInput
            style={styles.input}
            placeholder={t('passwordPlaceholder')}
            placeholderTextColor="#6A6FA8"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (error) setError(null);
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            onSubmitEditing={handleLogin}
          />

          <View style={styles.rowBetween}>
            <Pressable
              onPress={() => setShowPassword((prev) => !prev)}
              hitSlop={8}
              style={styles.textBtn}
            >
              <Text style={styles.mutedAction}>
                {showPassword
                  ? language === 'tr'
                    ? 'Parolayı gizle'
                    : 'Hide password'
                  : language === 'tr'
                    ? 'Parolayı göster'
                    : 'Show password'}
              </Text>
            </Pressable>

            <Pressable
              onPress={onNavigateToForgotPassword}
              hitSlop={8}
              style={styles.textBtn}
            >
              <Text style={styles.linkBold}>{t('forgotPassword')}</Text>
            </Pressable>
          </View>

          <View style={styles.errorSlot}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <Pressable
            onPress={handleLogin}
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
                  ? 'Giriş yapılıyor…'
                  : 'Signing in…'
                : t('logInButton')}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setEmail('merve@example.com');
              setPassword('LifeOS2026!');
              setError(null);
            }}
            style={({ pressed }) => [
              styles.dashedPill,
              pressed && { opacity: 0.75 },
            ]}
          >
            <Text style={styles.dashedPillText}>
              {language === 'tr' ? 'Demo bilgileriyle doldur' : 'Fill with demo credentials'}
            </Text>
          </Pressable>

          <Pressable onPress={onNavigateToRegister} style={styles.switchBtn} hitSlop={8}>
            <Text style={styles.switchBtnText}>
              {t('dontHaveAccount')} {t('signUp')}
            </Text>
          </Pressable>
        </View>
      </AuthShell>

      <PortalTransition
        visible={showPortal}
        isNewUser={false}
        onComplete={() => {
          setShowPortal(false);
          onLoginSuccess(email.trim());
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  formStack: {
    gap: 10,
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    color: '#14173A',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14173A',
    marginTop: 2,
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
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  textBtn: {
    minHeight: 38,
    justifyContent: 'center',
  },
  mutedAction: {
    color: '#3E426E',
    fontSize: 14,
    fontWeight: '600',
  },
  linkBold: {
    color: '#26307A',
    fontSize: 14,
    fontWeight: '700',
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
  dashedPill: {
    minHeight: 46,
    borderRadius: 99,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#6A6FA8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  dashedPillText: {
    color: '#26307A',
    fontSize: 14,
    fontWeight: '600',
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
