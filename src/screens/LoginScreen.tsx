import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Animated,
  Easing,
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
import { FadeRiseView } from '../components/common/FadeRiseView';
import { createLoginSchema } from '../validation/authSchemas';
import { useResponsive } from '../hooks/useResponsive';

interface LoginScreenProps {
  onNavigateToRegister: () => void;
  onLoginSuccess: (userEmail: string) => void;
  onNavigateToForgotPassword?: () => void;
}

interface FloatingChipProps {
  label: string;
  bg: string;
  duration: number;
  delay: number;
}

const FloatingChip: React.FC<FloatingChipProps> = ({ label, bg, duration, delay }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const useNativeDriver = Platform.OS !== 'web';

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: duration / 2,
          delay,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim, delay, duration, useNativeDriver]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -14],
  });
  const rotate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-3deg', '2deg'],
  });

  return (
    <Animated.View
      style={[
        styles.floatingChip,
        {
          backgroundColor: bg,
          transform: [{ translateY }, { rotate }],
        },
      ]}
    >
      <Text style={styles.floatingChipText}>{label}</Text>
    </Animated.View>
  );
};

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToRegister,
  onLoginSuccess,
  onNavigateToForgotPassword,
}) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { t, language, toggleLanguage } = useI18n();
  const { isWideScreen } = useResponsive();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);

    const schema = createLoginSchema(t);
    const result = schema.safeParse({ email, password });

    if (!result.success) {
      let hasEmailErr = false;
      let hasPassErr = false;
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field === 'email' && !hasEmailErr) {
          setEmailError(issue.message);
          hasEmailErr = true;
        } else if (field === 'password' && !hasPassErr) {
          setPasswordError(issue.message);
          hasPassErr = true;
        }
      });
      return false;
    }

    return true;
  };

  const handleLogin = () => {
    if (!validate()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(email.trim());
    }, 600);
  };

  const handleForgotPassword = () => {
    if (onNavigateToForgotPassword) {
      onNavigateToForgotPassword();
    }
  };

  const heroChips =
    language === 'tr'
      ? [
          { label: "CV'yi güncelle", bg: '#FFB454', duration: 5000, delay: 0 },
          { label: 'Final tekrarı', bg: '#5FD6E8', duration: 6000, delay: 400 },
          { label: 'Taksit günü', bg: '#7BE3A1', duration: 5500, delay: 200 },
          { label: 'Yürüyüş', bg: '#FF8FA3', duration: 6500, delay: 600 },
          { label: 'Kelime tekrarı', bg: '#C9A6FF', duration: 5200, delay: 300 },
        ]
      : [
          { label: 'Update resume', bg: '#FFB454', duration: 5000, delay: 0 },
          { label: 'Exam review', bg: '#5FD6E8', duration: 6000, delay: 400 },
          { label: 'Bill reminder', bg: '#7BE3A1', duration: 5500, delay: 200 },
          { label: 'Morning walk', bg: '#FF8FA3', duration: 6500, delay: 600 },
          { label: 'Vocabulary', bg: '#C9A6FF', duration: 5200, delay: 300 },
        ];

  const heroHeadline =
    language === 'tr'
      ? 'Dağınık hayatın,\ntek bir güne sığsın.'
      : 'Your scattered life,\nin one calm day.';

  const renderFormCard = () => (
    <FadeRiseView delay={120} style={styles.formInner}>
      {/* Top Controls: Language & Theme Switch */}
      <View style={styles.topControlRow}>
        <Pressable
          onPress={toggleLanguage}
          hitSlop={6}
          style={[styles.pillButton, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
        >
          <Globe size={14} color={colors.textSecondary} />
          <Text style={[Typography.captionBold, { color: colors.textPrimary }]}>
            {language.toUpperCase()}
          </Text>
        </Pressable>

        <Pressable
          onPress={toggleTheme}
          hitSlop={6}
          style={[styles.pillButton, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
        >
          {isDark ? (
            <Sun size={14} color="#FFB454" />
          ) : (
            <Moon size={14} color={colors.primary} />
          )}
          <Text style={[Typography.captionBold, { color: colors.textPrimary }]}>
            {isDark ? (language === 'tr' ? 'Açık' : 'Light') : (language === 'tr' ? 'Koyu' : 'Dark')}
          </Text>
        </Pressable>
      </View>

      {!isWideScreen && (
        <View style={styles.brandContainer}>
          <LifeOSLogo size="md" showSlogan />
        </View>
      )}

      <View style={styles.welcomeContainer}>
        <Text style={[Typography.h2, styles.welcomeTitle, { color: colors.textPrimary }]}>
          {t('welcomeBack')}
        </Text>
        <Text style={[Typography.body, { color: colors.textSecondary }]}>
          {t('continueBuilding')}
        </Text>
      </View>

      {generalError && <InlineFeedback type="error" message={generalError} />}

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
          leadingIcon={<Mail size={18} color={colors.textSecondary} />}
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
          />
          <Pressable
            onPress={handleForgotPassword}
            hitSlop={8}
            style={styles.forgotPasswordButton}
          >
            <Text style={[Typography.captionBold, { color: colors.primary }]}>
              {t('forgotPassword')}
            </Text>
          </Pressable>
        </View>

        <PrimaryButton
          label={t('logInButton')}
          onPress={handleLogin}
          loading={isLoading}
          style={styles.loginButton}
        />
      </View>

      {/* Quick Demo Fill */}
      <View style={styles.quickFillContainer}>
        <Pressable
          onPress={() => {
            setEmail('merve@example.com');
            setPassword('LifeOS2026!');
          }}
          style={[
            styles.demoPill,
            { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
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
    </FadeRiseView>
  );

  if (isWideScreen) {
    return (
      <View style={[styles.splitRoot, { backgroundColor: '#0E1029' }]}>
        {/* Left Hero with Floating Pastel Chips */}
        <View style={styles.heroSide}>
          <View style={styles.heroBrand}>
            <LifeOSLogo size="md" />
          </View>

          <FadeRiseView delay={0}>
            <Text style={styles.heroBigTitle}>{heroHeadline}</Text>
          </FadeRiseView>

          <View style={styles.floatingChipsWrap}>
            {heroChips.map((chip) => (
              <FloatingChip
                key={chip.label}
                label={chip.label}
                bg={chip.bg}
                duration={chip.duration}
                delay={chip.delay}
              />
            ))}
          </View>
        </View>

        {/* Right Form Panel */}
        <ScrollView
          style={[styles.formSide, { backgroundColor: colors.surface }]}
          contentContainerStyle={styles.formSideContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {renderFormCard()}
        </ScrollView>
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
        {renderFormCard()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  splitRoot: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    height: '100%',
  },
  heroSide: {
    flex: 1.2,
    paddingHorizontal: 56,
    paddingVertical: 48,
    justifyContent: 'center',
    gap: 36,
    backgroundColor: '#0E1029',
  },
  heroBrand: {
    marginBottom: 4,
  },
  heroBigTitle: {
    fontSize: 52,
    fontWeight: '700',
    lineHeight: 58,
    color: '#F3F2FF',
    letterSpacing: -1,
  },
  floatingChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    maxWidth: 560,
  },
  floatingChip: {
    paddingHorizontal: 22,
    paddingVertical: 15,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  floatingChipText: {
    color: '#0E1029',
    fontSize: 15,
    fontWeight: '700',
  },
  formSide: {
    flex: 0.95,
  },
  formSideContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingVertical: 40,
  },
  formInner: {
    width: '100%',
    maxWidth: 400,
  },
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
