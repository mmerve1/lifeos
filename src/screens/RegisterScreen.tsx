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
import { User, Mail, Check } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { LifeOSLogo } from '../components/common/LifeOSLogo';
import { TextInput } from '../components/common/TextInput';
import { PasswordInput } from '../components/common/PasswordInput';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { InlineFeedback } from '../components/common/InlineFeedback';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
  onRegisterSuccess: (userName: string, userEmail: string) => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onNavigateToLogin,
  onRegisterSuccess,
}) => {
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
    let isValid = true;
    setFullNameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    setConsentError(null);

    if (!fullName.trim()) {
      setFullNameError('Full name is required');
      isValid = false;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('Email address is required');
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setEmailError('Please enter a valid email address');
        isValid = false;
      }
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }

    if (!agreedToTerms) {
      setConsentError('You must agree to the Terms and Privacy Policy to continue');
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = () => {
    if (!validate()) return;

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage('Account created successfully! Preparing your workspace...');
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
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Ambient Glow */}
        <View style={styles.glowCircle} pointerEvents="none" />

        {/* Header */}
        <View style={styles.brandContainer}>
          <LifeOSLogo size="md" showSlogan={false} />
        </View>

        <View style={styles.titleContainer}>
          <Text style={[Typography.pageTitle, styles.pageTitle]}>
            Create your account
          </Text>
          <Text style={[Typography.body, styles.subtitle]}>
            A more organized life starts here.
          </Text>
        </View>

        {successMessage && (
          <InlineFeedback
            type="success"
            title="Success"
            message={successMessage}
          />
        )}

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <TextInput
            label="Full name"
            placeholder="Your name"
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              if (fullNameError) setFullNameError(null);
            }}
            error={fullNameError}
            leadingIcon={
              <User size={18} color={Colors.textSecondary} strokeWidth={2} />
            }
            required
          />

          <TextInput
            label="Email address"
            placeholder="name@example.com"
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
              <Mail size={18} color={Colors.textSecondary} strokeWidth={2} />
            }
            required
          />

          <PasswordInput
            label="Password"
            placeholder="Create a strong password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError(null);
            }}
            helperText="At least 8 characters"
            error={passwordError}
            required
          />

          <PasswordInput
            label="Confirm password"
            placeholder="Re-enter your password"
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
                agreedToTerms && styles.checkboxActive,
              ]}
            >
              {agreedToTerms && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
            </Pressable>

            <View style={styles.consentTextContainer}>
              <Text style={[Typography.caption, styles.consentText]}>
                I accept the{' '}
                <Text
                  onPress={() => showDocumentInfo('Terms of Service')}
                  style={styles.consentLink}
                >
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text
                  onPress={() => showDocumentInfo('Privacy Policy')}
                  style={styles.consentLink}
                >
                  Privacy Policy
                </Text>
                .
              </Text>
            </View>
          </View>
          {consentError && (
            <Text style={[Typography.caption, styles.consentErrorText]}>
              {consentError}
            </Text>
          )}

          {/* Primary Action Button */}
          <PrimaryButton
            label="Create account"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            style={styles.createButton}
          />
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <Text style={[Typography.body, styles.footerText]}>
            Already have an account?{' '}
          </Text>
          <Pressable onPress={onNavigateToLogin} hitSlop={8}>
            <Text style={[Typography.button, styles.logInLink]}>
              Log in
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
    backgroundColor: Colors.background,
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
    top: -50,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(139, 124, 246, 0.08)',
  },
  brandContainer: {
    marginBottom: Spacing.lg,
  },
  titleContainer: {
    marginBottom: Spacing.xl,
  },
  pageTitle: {
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: Colors.textSecondary,
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
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  consentTextContainer: {
    flex: 1,
  },
  consentText: {
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  consentLink: {
    color: Colors.secondaryViolet,
    textDecorationLine: 'underline',
  },
  consentErrorText: {
    color: Colors.danger,
    marginTop: -Spacing.xs,
    marginBottom: Spacing.md,
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
  footerText: {
    color: Colors.textSecondary,
  },
  logInLink: {
    color: Colors.primary,
  },
});
