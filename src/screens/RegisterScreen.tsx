import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Check } from 'lucide-react-native';
import { useI18n } from '../i18n';
import { AuthShell } from '../components/auth/AuthShell';
import { PortalTransition } from '../components/auth/PortalTransition';
import { createRegisterSchema } from '../validation/authSchemas';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
  onRegisterSuccess: (userName: string, userEmail: string) => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onNavigateToLogin,
  onRegisterSuccess,
}) => {
  const { t, language } = useI18n();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shakeCount, setShakeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPortal, setShowPortal] = useState(false);

  const strengthScore = useMemo(() => {
    if (!password) return 0;
    return [
      password.length >= 8,
      /\d/.test(password),
      /[^A-Za-z0-9]/.test(password) || (/[a-z]/.test(password) && /[A-Z]/.test(password)),
    ].filter(Boolean).length;
  }, [password]);

  const strengthColor = ['#A3123A', '#A3123A', '#B86E00', '#14773F'][strengthScore];
  const strengthWidth: `${number}%` = password ? `${Math.max(strengthScore, 1) * 33.3}%` : '0%';
  const strengthLabel = !password
    ? language === 'tr'
      ? 'Parola gücü'
      : 'Password strength'
    : [
        t('passwordStrengthWeak'),
        t('passwordStrengthWeak'),
        t('passwordStrengthFair'),
        t('passwordStrengthStrong'),
      ][strengthScore];

  const handleRegister = () => {
    if (isLoading) return;
    setError(null);

    const schema = createRegisterSchema(t);
    const result = schema.safeParse({
      fullName,
      email,
      password,
      confirmPassword,
      agreedToTerms,
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? t('emailInvalid'));
      setShakeCount((c) => c + 1);
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
          <Text style={styles.heading}>{t('createAccount')}</Text>

          <Text style={styles.label}>{t('fullNameLabel')}</Text>
          <RNTextInput
            style={styles.input}
            placeholder={t('fullNamePlaceholder')}
            placeholderTextColor="#6A6FA8"
            value={fullName}
            onChangeText={(v) => {
              setFullName(v);
              if (error) setError(null);
            }}
          />

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
          />

          <Text style={styles.label}>
            {t('passwordLabel')} ({t('passwordRuleHint')})
          </Text>
          <RNTextInput
            style={styles.input}
            placeholder={t('passwordPlaceholder')}
            placeholderTextColor="#6A6FA8"
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              if (error) setError(null);
            }}
            secureTextEntry
            autoCapitalize="none"
          />

          {/* Password strength bar */}
          <View style={styles.strengthTrack}>
            <View
              style={[
                styles.strengthFill,
                { width: strengthWidth, backgroundColor: strengthColor },
              ]}
            />
          </View>
          <Text style={styles.strengthText}>{strengthLabel}</Text>

          <Text style={styles.label}>{t('confirmPasswordLabel')}</Text>
          <RNTextInput
            style={styles.input}
            placeholder={t('confirmPasswordPlaceholder')}
            placeholderTextColor="#6A6FA8"
            value={confirmPassword}
            onChangeText={(v) => {
              setConfirmPassword(v);
              if (error) setError(null);
            }}
            secureTextEntry
            autoCapitalize="none"
            onSubmitEditing={handleRegister}
          />

          <Pressable
            onPress={() => {
              setAgreedToTerms((prev) => !prev);
              if (error) setError(null);
            }}
            style={styles.consentRow}
          >
            <View
              style={[
                styles.checkbox,
                agreedToTerms && { backgroundColor: '#14173A', borderColor: '#14173A' },
              ]}
            >
              {agreedToTerms && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
            </View>
            <Text style={styles.consentText}>
              {language === 'tr'
                ? 'Kullanım koşullarını kabul ediyor, aydınlatma metnini okuduğumu onaylıyorum.'
                : 'I accept the Terms of Service and Privacy Policy.'}
            </Text>
          </Pressable>

          <View style={styles.errorSlot}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <Pressable
            onPress={handleRegister}
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
                  ? 'Hesap oluşturuluyor…'
                  : 'Creating account…'
                : t('createAccountButton')}
            </Text>
          </Pressable>

          <Pressable onPress={onNavigateToLogin} style={styles.switchBtn} hitSlop={8}>
            <Text style={styles.switchBtnText}>
              {t('alreadyHaveAccount')} {t('logInButton')}
            </Text>
          </Pressable>
        </View>
      </AuthShell>

      <PortalTransition
        visible={showPortal}
        isNewUser={true}
        onComplete={() => {
          setShowPortal(false);
          onRegisterSuccess(fullName.trim(), email.trim());
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
    gap: 8,
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    color: '#14173A',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14173A',
    marginTop: 2,
  },
  input: {
    height: 50,
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
    marginTop: 2,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 99,
  },
  strengthText: {
    fontSize: 13,
    color: '#3E426E',
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    minHeight: 40,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#6A6FA8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  consentText: {
    flex: 1,
    fontSize: 13,
    color: '#14173A',
    lineHeight: 18,
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
