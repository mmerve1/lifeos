import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from 'react-native';
import { Mail, Globe, Sun, Moon } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { LifeOSLogo } from '../components/common/LifeOSLogo';
import { TextInput } from '../components/common/TextInput';
import { PasswordInput } from '../components/common/PasswordInput';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { InlineFeedback } from '../components/common/InlineFeedback';

interface LoginScreenProps {
  onNavigateToRegister: () => void;
  onLoginSuccess: (userEmail: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToRegister,
  onLoginSuccess,
}) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { t, language, toggleLanguage } = useI18n();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError(t('emailRequired'));
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setEmailError(t('emailInvalid'));
        isValid = false;
      }
    }

    if (!password) {
      setPasswordError(t('passwordRequired'));
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError(t('passwordMinLength'));
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = () => {
    if (!validate()) return;

    setIsLoading(true);

    // Simulate authentication API request
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(email.trim());
    }, 700);
  };

  const handleForgotPassword = () => {
    Alert.alert(
      t('forgotPassword'),
      language === 'tr'
        ? 'Şifre sıfırlama bağlantısı e-posta servisi bağlandığında iletilecektir.'
        : 'Password reset instructions will be sent once the backend email service is connected.'
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.keyboardContainer, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Subtle Ambient Violet Glow Header */}
        <View
          style={[
            styles.glowCircle,
            { backgroundColor: isDark ? 'rgba(139, 124, 246, 0.08)' : 'rgba(124, 58, 237, 0.05)' },
          ]}
          pointerEvents="none"
        />

        {/* Top Controls: Language & Theme Switch */}
        <View style={styles.topControlRow}>
          <Pressable
            onPress={toggleLanguage}
            hitSlop={6}
            style={[styles.pillButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Globe size={14} color={colors.textSecondary} />
            <Text style={[Typography.captionBold, { color: colors.textPrimary }]}>
              {language.toUpperCase()}
            </Text>
          </Pressable>

          <Pressable
            onPress={toggleTheme}
            hitSlop={6}
            style={[styles.pillButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            {isDark ? (
              <Sun size={14} color={colors.warning} />
            ) : (
              <Moon size={14} color={colors.primary} />
            )}
            <Text style={[Typography.caption, { color: colors.textSecondary }]}>
              {isDark ? t('lightMode') : t('darkMode')}
            </Text>
          </Pressable>
        </View>

        {/* Brand Area */}
        <View style={styles.brandContainer}>
          <LifeOSLogo size="lg" showSlogan={true} />
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeContainer}>
          <Text style={[Typography.pageTitle, styles.welcomeTitle, { color: colors.textPrimary }]}>
            {t('welcomeBack')}
          </Text>
          <Text style={[Typography.body, { color: colors.textSecondary }]}>
            {t('continueBuilding')}
          </Text>
        </View>

        {/* General Feedback Message */}
        {generalError && (
          <InlineFeedback type="error" message={generalError} />
        )}

        {/* Form Area */}
        <View style={styles.formContainer}>
          <TextInput
            label={t('emailLabel')}
            placeholder={t('emailPlaceholder')}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={emailError}
            leadingIcon={
              <Mail size={18} color={colors.textSecondary} strokeWidth={2} />
            }
            required
          />

          <View style={styles.passwordWrapper}>
            <PasswordInput
              label={t('passwordLabel')}
              placeholder={t('passwordPlaceholder')}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError(null);
              }}
              error={passwordError}
              required
            />
            <Pressable
              onPress={handleForgotPassword}
              hitSlop={8}
              style={styles.forgotPasswordButton}
            >
              <Text style={[Typography.captionBold, { color: colors.secondaryViolet }]}>
                {t('forgotPassword')}
              </Text>
            </Pressable>
          </View>

          <PrimaryButton
            label={t('logInButton')}
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={styles.loginButton}
          />
        </View>

        {/* Quick Demo Pre-fill for testing */}
        <View style={styles.quickFillContainer}>
          <Pressable
            onPress={() => {
              setEmail('merve@example.com');
              setPassword('LifeOS2026!');
            }}
            style={[
              styles.demoPill,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[Typography.caption, { color: colors.secondaryViolet, fontSize: 11 }]}>
              {t('demoPill')}
            </Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <Text style={[Typography.body, { color: colors.textSecondary }]}>
            {t('dontHaveAccount')}{' '}
          </Text>
          <Pressable onPress={onNavigateToRegister} hitSlop={8}>
            <Text style={[Typography.button, { color: colors.primary }]}>
              {t('signUp')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    justifyContent: 'center',
  },
  glowCircle: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  topControlRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  brandContainer: {
    marginBottom: Spacing.xl,
  },
  welcomeContainer: {
    marginBottom: Spacing.xl,
  },
  welcomeTitle: {
    marginBottom: Spacing.xs,
  },
  formContainer: {
    width: '100%',
  },
  passwordWrapper: {
    position: 'relative',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.lg,
  },
  loginButton: {
    marginTop: Spacing.sm,
  },
  quickFillContainer: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  demoPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xxl,
  },
});
