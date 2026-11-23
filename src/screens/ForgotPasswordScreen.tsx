import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { LifeOSLogo } from '../components/common/LifeOSLogo';
import { TextInput } from '../components/common/TextInput';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { InlineFeedback } from '../components/common/InlineFeedback';
import { createForgotPasswordSchema } from '../validation/authSchemas';

interface ForgotPasswordScreenProps {
  onNavigateToLogin: () => void;
  onNavigateToResetPassword: (email: string) => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onNavigateToLogin,
  onNavigateToResetPassword,
}) => {
  const { colors, isDark } = useTheme();
  const { t } = useI18n();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const validate = () => {
    setEmailError(null);
    const schema = createForgotPasswordSchema(t);
    const result = schema.safeParse({ email });
    if (!result.success) {
      const issue = result.error.issues[0];
      setEmailError(issue?.message ?? null);
      return false;
    }
    return true;
  };

  const handleSend = () => {
    if (!validate()) return;
    setIsLoading(true);
    // Simulate sending email
    setTimeout(() => {
      setIsLoading(false);
      setSubmittedEmail(email.trim());
      setIsSuccess(true);
    }, 900);
  };

  const handleResend = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 900);
  };

  if (isSuccess) {
    return (
      <View style={[styles.successContainer, { backgroundColor: colors.background }]}>
        {/* Glow */}
        <View
          style={[
            styles.glowCircle,
            { backgroundColor: isDark ? 'rgba(139, 124, 246, 0.08)' : 'rgba(124, 58, 237, 0.05)' },
          ]}
          pointerEvents="none"
        />

        <View style={styles.successInner}>
          {/* Icon */}
          <View
            style={[
              styles.successIconWrap,
              { backgroundColor: isDark ? 'rgba(139,124,246,0.15)' : 'rgba(124,58,237,0.08)' },
            ]}
          >
            <CheckCircle size={40} color={colors.primary} />
          </View>

          <Text style={[Typography.h2, { color: colors.textPrimary, textAlign: 'center', marginBottom: Spacing.sm }]}>
            {t('forgotPasswordSuccessTitle')}
          </Text>
          <Text style={[Typography.body, { color: colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xs }]}>
            {t('forgotPasswordSuccessDesc')}
          </Text>
          <Text style={[Typography.bodyBold, { color: colors.primary, textAlign: 'center', marginBottom: Spacing.xxxl }]}>
            {submittedEmail}
          </Text>

          <PrimaryButton
            label={t('resetPasswordButton')}
            onPress={() => onNavigateToResetPassword(submittedEmail)}
          />

          <View style={styles.resendRow}>
            <Text style={[Typography.body, { color: colors.textSecondary }]}>
              {t('forgotPasswordNoEmail')}{' '}
            </Text>
            <Pressable onPress={handleResend} hitSlop={8}>
              <Text style={[Typography.button, { color: colors.primary }]}>
                {t('forgotPasswordResend')}
              </Text>
            </Pressable>
          </View>

          <Pressable onPress={onNavigateToLogin} style={styles.backRow} hitSlop={8}>
            <ArrowLeft size={16} color={colors.textSecondary} />
            <Text style={[Typography.body, { color: colors.textSecondary }]}>
              {t('forgotPasswordBackToLogin')}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

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
        {/* Glow */}
        <View
          style={[
            styles.glowCircle,
            { backgroundColor: isDark ? 'rgba(139, 124, 246, 0.08)' : 'rgba(124, 58, 237, 0.05)' },
          ]}
          pointerEvents="none"
        />

        {/* Back button */}
        <Pressable onPress={onNavigateToLogin} style={styles.backButton} hitSlop={8}>
          <ArrowLeft size={20} color={colors.textSecondary} />
        </Pressable>

        {/* Logo */}
        <View style={styles.brandContainer}>
          <LifeOSLogo size="sm" />
        </View>

        {/* Header */}
        <View style={styles.headerContainer}>
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: isDark ? 'rgba(139,124,246,0.15)' : 'rgba(124,58,237,0.08)' },
            ]}
          >
            <Mail size={28} color={colors.primary} />
          </View>
          <Text style={[Typography.h2, { color: colors.textPrimary, marginBottom: Spacing.xs }]}>
            {t('forgotPasswordTitle')}
          </Text>
          <Text style={[Typography.body, { color: colors.textSecondary }]}>
            {t('forgotPasswordSubtitle')}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <TextInput
            label={t('emailLabel')}
            placeholder={t('emailPlaceholder')}
            value={email}
            onChangeText={(v) => { setEmail(v); setEmailError(null); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={emailError ?? undefined}
          />

          {emailError && (
            <InlineFeedback type="error" message={emailError} />
          )}

          <View style={styles.submitButton}>
            <PrimaryButton
              label={isLoading ? t('loading') : t('forgotPasswordButton')}
              onPress={handleSend}
              disabled={isLoading}
            />
          </View>
        </View>

        {/* Footer */}
        <Pressable onPress={onNavigateToLogin} style={styles.footerRow} hitSlop={8}>
          <ArrowLeft size={14} color={colors.textSecondary} />
          <Text style={[Typography.body, { color: colors.textSecondary }]}>
            {t('forgotPasswordBackToLogin')}
          </Text>
        </Pressable>
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
    left: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.lg,
    padding: Spacing.xs,
  },
  brandContainer: {
    marginBottom: Spacing.xl,
  },
  headerContainer: {
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: Radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  formContainer: {
    width: '100%',
  },
  submitButton: {
    marginTop: Spacing.lg,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xxl,
  },
  // Success state
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successInner: {
    width: '100%',
    paddingHorizontal: Spacing.screenPadding,
    alignItems: 'center',
  },
  successIconWrap: {
    width: 80,
    height: 80,
    borderRadius: Radius.modal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.lg,
  },
});
