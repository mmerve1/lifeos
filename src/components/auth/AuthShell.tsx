import React, { useEffect, useRef } from 'react';
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
import { Globe, Sun, Moon } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useI18n } from '../../i18n';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { LifeOSLogo } from '../common/LifeOSLogo';
import { FadeRiseView } from '../common/FadeRiseView';
import { useResponsive } from '../../hooks/useResponsive';

interface AuthShellProps {
  children: React.ReactNode;
  shakeTrigger?: number;
}

const FloatingChip: React.FC<{
  label: string;
  bg: string;
  duration: number;
  delay: number;
}> = ({ label, bg, duration, delay }) => {
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

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });
  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['-3deg', '2deg'] });

  return (
    <Animated.View
      style={[
        styles.floatingChip,
        { backgroundColor: bg, transform: [{ translateY }, { rotate }] },
      ]}
    >
      <Text style={styles.floatingChipText}>{label}</Text>
    </Animated.View>
  );
};

export const AuthShell: React.FC<AuthShellProps> = ({ children, shakeTrigger = 0 }) => {
  const { isDark, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useI18n();
  const { isWideScreen } = useResponsive();

  const useNativeDriver = Platform.OS !== 'web';
  const swapOpacity = useRef(new Animated.Value(0)).current;
  const swapX = useRef(new Animated.Value(32)).current;
  const shakeX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(swapOpacity, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver,
      }),
      Animated.timing(swapX, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver,
      }),
    ]).start();
  }, [swapOpacity, swapX, useNativeDriver]);

  useEffect(() => {
    if (shakeTrigger === 0) return;
    Animated.sequence([
      Animated.timing(shakeX, { toValue: -9, duration: 60, useNativeDriver }),
      Animated.timing(shakeX, { toValue: 9, duration: 60, useNativeDriver }),
      Animated.timing(shakeX, { toValue: -7, duration: 60, useNativeDriver }),
      Animated.timing(shakeX, { toValue: 7, duration: 60, useNativeDriver }),
      Animated.timing(shakeX, { toValue: 0, duration: 60, useNativeDriver }),
    ]).start();
  }, [shakeTrigger, shakeX, useNativeDriver]);

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

  // Reference design uses #E7E9FF lavender card in dark mode and crisp #FFFFFF in light mode
  const formPanelBg = isDark ? '#E7E9FF' : '#FFFFFF';
  const pillBg = isDark ? 'rgba(20, 23, 58, 0.08)' : '#EEF0FF';
  const pillBorder = isDark ? 'rgba(20, 23, 58, 0.18)' : '#D8DCF5';

  const topControls = (
    <View style={styles.topControlRow}>
      <Pressable
        onPress={toggleLanguage}
        hitSlop={6}
        style={[styles.pillButton, { backgroundColor: pillBg, borderColor: pillBorder }]}
      >
        <Globe size={14} color="#26307A" />
        <Text style={[Typography.captionBold, { color: '#14173A' }]}>
          {language.toUpperCase()}
        </Text>
      </Pressable>

      <Pressable
        onPress={toggleTheme}
        hitSlop={6}
        style={[styles.pillButton, { backgroundColor: pillBg, borderColor: pillBorder }]}
      >
        {isDark ? <Sun size={14} color="#B86E00" /> : <Moon size={14} color="#26307A" />}
        <Text style={[Typography.captionBold, { color: '#14173A' }]}>
          {isDark ? (language === 'tr' ? 'Açık' : 'Light') : (language === 'tr' ? 'Koyu' : 'Dark')}
        </Text>
      </Pressable>
    </View>
  );

  const formContent = (
    <Animated.View
      style={[
        styles.formWrap,
        {
          opacity: swapOpacity,
          transform: [{ translateX: swapX }, { translateX: shakeX }],
        },
      ]}
    >
      {topControls}
      {children}
    </Animated.View>
  );

  if (isWideScreen) {
    return (
      <View style={styles.splitRoot}>
        {/* Left Hero */}
        <View style={styles.heroSide}>
          <LifeOSLogo size="md" />
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

        {/* Right Lavender/White Form Panel */}
        <ScrollView
          style={[styles.formSide, { backgroundColor: formPanelBg }]}
          contentContainerStyle={styles.formSideContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {formContent}
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.mobileRoot, { backgroundColor: formPanelBg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.mobileScrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mobileHeaderBanner}>
          <Text style={styles.mobileBrand}>LifeOS</Text>
          <Text style={styles.mobileSlogan}>
            {language === 'tr'
              ? 'Dağınık hayatın, tek bir güne sığsın.'
              : 'Your scattered life, in one calm day.'}
          </Text>
        </View>
        <View style={styles.mobileFormArea}>{formContent}</View>
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
    backgroundColor: '#0E1029',
  },
  heroSide: {
    flex: 1.25,
    paddingHorizontal: 56,
    paddingVertical: 48,
    justifyContent: 'center',
    gap: 36,
    backgroundColor: '#0E1029',
  },
  heroBigTitle: {
    fontSize: 54,
    fontWeight: '700',
    lineHeight: 60,
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
    shadowOpacity: 0.22,
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
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  formWrap: {
    width: '100%',
    maxWidth: 390,
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
  mobileRoot: {
    flex: 1,
  },
  mobileScrollContent: {
    flexGrow: 1,
  },
  mobileHeaderBanner: {
    backgroundColor: '#0E1029',
    paddingTop: 52,
    paddingBottom: 28,
    paddingHorizontal: Spacing.screenPadding,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  mobileBrand: {
    color: '#8FA2FF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  mobileSlogan: {
    color: '#F3F2FF',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
  },
  mobileFormArea: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    alignItems: 'center',
  },
});
