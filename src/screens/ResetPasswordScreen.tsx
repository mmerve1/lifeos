import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { KeyRound, ArrowLeft, CheckCircle } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { LifeOSLogo } from '../components/common/LifeOSLogo';
import { PasswordInput } from '../components/common/PasswordInput';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { InlineFeedback } from '../components/common/InlineFeedback';
import { createResetPasswordSchema } from '../validation/authSchemas';

interface ResetPasswordScreenProps {
  email: string;
  onNavigateToLogin: () => void;
}

type StrengthLevel = 'weak' | 'fair' | 'strong';

function getPasswordStrength(password: string): StrengthLevel {
  if (password.length === 0) return 'weak';
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return 'weak';
  if (score <= 2) return 'fair';
  return 'strong';
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({
  email,
  onNavigateToLogin,
}) => {
  const { colors, isDark } = useTheme();
  const { t } = useI18n();

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);

  const strengthColor = useMemo(() => {
    if (strength === 'weak') return colors.danger;
    if (strength === 'fair') return '#F59E0B';
    return '#10B981';
  }, [strength, colors]);

  const strengthLabel = useMemo(() => {
    if (strength === 'weak') return t('passwordStrengthWeak');
    if (strength === 'fair') return t('passwordStrengthFair');
    return t('passwordStrengthStrong');
  }, [strength, t]);

  const validate = () => {
    setNewPasswordError(null);
    setConfirmError(null);
    const schema = createResetPasswordSchema(t);
    const result = schema.safeParse({ newPassword, confirmNewPassword });
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field === 'newPassword' && !newPasswordError) setNewPasswordError(issue.message);
        else if (field === 'confirmNewPassword' && !confirmError) setConfirmError(issue.message);
      });
      return false;
    }
    return true;
  };

  const handleReset = () => {
    if (!validate()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 900);
  };

  if (isSuccess) {
    return (
      <View style={[styles.successContainer, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.glowCircle,
            { backgroundColor: isDark ? 'rgba(139, 124, 246, 0.08)' : 'rgba(124, 58, 237, 0.05)' },
          ]}
          pointerEvents="none"
        />
        <View style={styles.successInner}>
          <View
            style={[
              styles.successIconWrap,
              { backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.08)' },
            ]}
          >
            <CheckCircle size={40} color="#10B981" />
          </View>
          <Text style={[Typography.h2, { color: colors.textPrimary, textAlign: 'center', marginBottom: Spacing.sm }]}>
            {t('resetPasswordSuccess')}
          </Text>
          <Text style={[Typography.body, { color: colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xxxl }]}>
            {t('resetPasswordSuccessDesc')}
          </Text>
          <PrimaryButton label={t('logInButton')} onPress={onNavigateToLogin} />
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
            <KeyRound size={28} color={colors.primary} />
          </View>
          <Text style={[Typography.h2, { color: colors.textPrimary, marginBottom: Spacing.xs }]}>
            {t('resetPasswordTitle')}
          </Text>
          <Text style={[Typography.body, { color: colors.textSecondary, marginBottom: Spacing.xs }]}>
            {t('resetPasswordSubtitle')}
          </Text>
          <Text style={[Typography.captionBold, { color: colors.primary }]}>
            {email}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <PasswordInput
            label={t('newPasswordLabel')}
            placeholder={t('newPasswordPlaceholder')}
            value={newPassword}
            onChangeText={(v) => { setNewPassword(v); setNewPasswordError(null); }}
            error={newPasswordError ?? undefined}
          />

          {newPasswordError && <InlineFeedback type="error" message={newPasswordError} />}

          {/* Password strength bar */}
          {newPassword.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBars}>
                {(['weak', 'fair', 'strong'] as StrengthLevel[]).map((level, i) => {
                  const active =
                    (strength === 'weak' && i === 0) ||
                    (strength === 'fair' && i <= 1) ||
                    strength === 'strong';
                  return (
                    <View
                      key={level}
                      style={[
                        styles.strengthBar,
                        {
                          backgroundColor: active ? strengthColor : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'),
                        },
                      ]}
                    />
                  );
                })}
              </View>
              <Text style={[Typography.caption, { color: strengthColor }]}>{strengthLabel}</Text>
            </View>
          )}

          <PasswordInput
            label={t('confirmNewPasswordLabel')}
            placeholder={t('confirmNewPasswordPlaceholder')}
            value={confirmNewPassword}
            onChangeText={(v) => { setConfirmNewPassword(v); setConfirmError(null); }}
            error={confirmError ?? undefined}
          />

          {confirmError && <InlineFeedback type="error" message={confirmError} />}

          <View style={styles.submitButton}>
            <PrimaryButton
              label={isLoading ? t('loading') : t('resetPasswordButton')}
              onPress={handleReset}
              disabled={isLoading}
            />
          </View>
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
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  submitButton: {
    marginTop: Spacing.lg,
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
});
