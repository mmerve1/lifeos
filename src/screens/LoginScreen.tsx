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
import { Mail } from 'lucide-react-native';
import { Colors } from '../theme/colors';
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
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
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
      'Reset Password',
      'Password reset instructions will be sent once the backend email service is connected.'
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
        {/* Subtle Ambient Violet Glow Header */}
        <View style={styles.glowCircle} pointerEvents="none" />

        {/* Brand Area */}
        <View style={styles.brandContainer}>
          <LifeOSLogo size="lg" showSlogan={true} />
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeContainer}>
          <Text style={[Typography.pageTitle, styles.welcomeTitle]}>
            Welcome back
          </Text>
          <Text style={[Typography.body, styles.welcomeSubtitle]}>
            Continue building your LifeOS.
          </Text>
        </View>

        {/* General Feedback Message */}
        {generalError && (
          <InlineFeedback type="error" message={generalError} />
        )}

        {/* Form Area */}
        <View style={styles.formContainer}>
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

          <View style={styles.passwordWrapper}>
            <PasswordInput
              label="Password"
              placeholder="Enter your password"
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
              <Text style={[Typography.captionBold, styles.forgotPasswordText]}>
                Forgot password?
              </Text>
            </Pressable>
          </View>

          <PrimaryButton
            label="Log in"
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
            style={styles.demoPill}
          >
            <Text style={[Typography.caption, styles.demoPillText]}>
              Tap to fill demo credentials (merve@example.com)
            </Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <Text style={[Typography.body, styles.footerText]}>
            Don't have an account?{' '}
          </Text>
          <Pressable onPress={onNavigateToRegister} hitSlop={8}>
            <Text style={[Typography.button, styles.signUpLink]}>
              Sign up
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
    paddingTop: Spacing.xxxl,
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
    backgroundColor: 'rgba(139, 124, 246, 0.08)',
  },
  brandContainer: {
    marginBottom: Spacing.xxl,
  },
  welcomeContainer: {
    marginBottom: Spacing.xl,
  },
  welcomeTitle: {
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  welcomeSubtitle: {
    color: Colors.textSecondary,
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
  forgotPasswordText: {
    color: Colors.secondaryViolet,
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
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  demoPillText: {
    color: Colors.secondaryViolet,
    fontSize: 11,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xxl,
  },
  footerText: {
    color: Colors.textSecondary,
  },
  signUpLink: {
    color: Colors.primary,
  },
});
