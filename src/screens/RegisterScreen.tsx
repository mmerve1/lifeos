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
import { User, Mail, Check, Globe, Sun, Moon } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { LifeOSLogo } from '../components/common/LifeOSLogo';
import { TextInput } from '../components/common/TextInput';
import { PasswordInput } from '../components/common/PasswordInput';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { InlineFeedback } from '../components/common/InlineFeedback';
import { createRegisterSchema } from '../validation/authSchemas';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
  onRegisterSuccess: (userName: string, userEmail: string) => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onNavigateToLogin,
  onRegisterSuccess,
}) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { t, language, toggleLanguage } = useI18n();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [consentError, setConsentError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validate = () => {
    setFullNameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    setConsentError(null);

    const schema = createRegisterSchema(t);
    const result = schema.safeParse({
      fullName,
      email,
      password,
      confirmPassword,
      agreedToTerms,
    });

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field === 'fullName' && !fullNameError) {
          setFullNameError(issue.message);
        } else if (field === 'email' && !emailError) {
          setEmailError(issue.message);
        } else if (field === 'password' && !passwordError) {
          setPasswordError(issue.message);
        } else if (field === 'confirmPassword' && !confirmPasswordError) {
          setConfirmPasswordError(issue.message);
        } else if (field === 'agreedToTerms' && !consentError) {
          setConsentError(issue.message);
        }
      });
      return false;
    }

    return true;
  };

  const handleRegister = () => {
    if (!validate()) return;

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage(t('registerSuccess'));
      setTimeout(() => {
        onRegisterSuccess(fullName.trim(), email.trim());
      }, 800);
    }, 700);
  };

  const showDocumentInfo = (title: string) => {
    Alert.alert(
      title,
      `LifeOS ${title} will be accessible here in production once document hosting is configured.`
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
        {/* Ambient Glow */}
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

        {/* Header */}
        <View style={styles.brandContainer}>
          <LifeOSLogo size="md" showSlogan={false} />
        </View>

        <View style={styles.titleContainer}>
          <Text style={[Typography.pageTitle, styles.pageTitle, { color: colors.textPrimary }]}>
            {t('createAccount')}
          </Text>
          <Text style={[Typography.body, { color: colors.textSecondary }]}>
            {t('registerSubtitle')}
          </Text>
        </View>

        {successMessage && (
          <InlineFeedback
            type="success"
            title={language === 'tr' ? 'Başarılı' : 'Success'}
            message={successMessage}
          />
        )}

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <TextInput
            label={t('fullNameLabel')}
            placeholder={t('fullNamePlaceholder')}
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              if (fullNameError) setFullNameError(null);
            }}
            error={fullNameError}
            leadingIcon={
              <User size={18} color={colors.textSecondary} strokeWidth={2} />
            }
            required
          />

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

          <PasswordInput
            label={t('passwordLabel')}
            placeholder={t('passwordPlaceholder')}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError(null);
            }}
            helperText={t('passwordRuleHint')}
            error={passwordError}
            required
          />

          <PasswordInput
            label={t('confirmPasswordLabel')}
            placeholder={t('confirmPasswordPlaceholder')}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (confirmPasswordError) setConfirmPasswordError(null);
            }}
            error={confirmPasswordError}
            required
          />

          {/* Consent Checkbox */}
          <View style={styles.consentRow}>
            <Pressable
              onPress={() => {
                setAgreedToTerms(!agreedToTerms);
                if (consentError) setConsentError(null);
              }}
              hitSlop={6}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: agreedToTerms }}
              style={[
                styles.checkbox,
                { borderColor: colors.border, backgroundColor: colors.surface },
                agreedToTerms && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
            >
              {agreedToTerms && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
            </Pressable>

            <View style={styles.consentTextContainer}>
              <Text style={[Typography.caption, styles.consentText, { color: colors.textSecondary }]}>
                {language === 'tr' ? (
                  <>
                    <Text
                      onPress={() => showDocumentInfo(t('termsOfService'))}
                      style={[styles.consentLink, { color: colors.secondaryViolet }]}
                    >
                      {t('termsOfService')}
                    </Text>{' '}
                    {t('and')}{' '}
                    <Text
                      onPress={() => showDocumentInfo(t('privacyPolicy'))}
                      style={[styles.consentLink, { color: colors.secondaryViolet }]}
                    >
                      {t('privacyPolicy')}
                    </Text>
                    'nı kabul ediyorum.
                  </>
                ) : (
                  <>
                    {t('termsConsentPrefix')}{' '}
                    <Text
                      onPress={() => showDocumentInfo(t('termsOfService'))}
                      style={[styles.consentLink, { color: colors.secondaryViolet }]}
                    >
                      {t('termsOfService')}
                    </Text>{' '}
                    {t('and')}{' '}
                    <Text
                      onPress={() => showDocumentInfo(t('privacyPolicy'))}
                      style={[styles.consentLink, { color: colors.secondaryViolet }]}
                    >
                      {t('privacyPolicy')}
                    </Text>
                    .
                  </>
                )}
              </Text>
            </View>
          </View>
          {consentError && (
            <Text style={[Typography.caption, { color: colors.danger, marginTop: -Spacing.xs, marginBottom: Spacing.md }]}>
              {consentError}
            </Text>
          )}

          {/* Primary Action Button */}
          <PrimaryButton
            label={t('createAccountButton')}
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            style={styles.createButton}
          />
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <Text style={[Typography.body, { color: colors.textSecondary }]}>
            {t('alreadyHaveAccount')}{' '}
          </Text>
          <Pressable onPress={onNavigateToLogin} hitSlop={8}>
            <Text style={[Typography.button, { color: colors.primary }]}>
              {t('logInButton')}
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
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  glowCircle: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  topControlRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
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
    marginBottom: Spacing.md,
  },
  titleContainer: {
    marginBottom: Spacing.xl,
  },
  pageTitle: {
    marginBottom: Spacing.xs,
  },
  formContainer: {
    width: '100%',
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  consentTextContainer: {
    flex: 1,
  },
  consentText: {
    lineHeight: 18,
  },
  consentLink: {
    textDecorationLine: 'underline',
  },
  createButton: {
    marginTop: Spacing.sm,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
});
