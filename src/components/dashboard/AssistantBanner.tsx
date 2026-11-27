import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  Pressable,
} from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useI18n } from '../../i18n';
import { Spacing, Radius } from '../../theme/spacing';

interface AssistantBannerProps {
  onApproveAction?: (approved: boolean) => void;
}

export const AssistantBanner: React.FC<AssistantBannerProps> = ({
  onApproveAction,
}) => {
  const { colors, isDark } = useTheme();
  const { language } = useI18n();
  const [approved, setApproved] = useState(false);

  const breatheAnim = useRef(new Animated.Value(1)).current;
  const useNativeDriver = Platform.OS !== 'web';

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.08,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [breatheAnim, useNativeDriver]);

  const handlePress = () => {
    const next = !approved;
    setApproved(next);
    onApproveAction?.(next);
  };

  const title = approved
    ? language === 'tr'
      ? 'İki odak bloğu planına eklendi.'
      : 'Two focus blocks were added to your schedule.'
    : language === 'tr'
      ? 'Kalan görevlerin için hafta sonuna 2 odak bloğu yerleştireyim mi?'
      : 'Shall I schedule 2 focus blocks this weekend for remaining tasks?';

  const subtitle =
    language === 'tr'
      ? 'Neden: haftalık hedef ilerlemeni korumak için Cumartesi ve Pazar 11.00 boş görünüyor.'
      : 'Why: Saturday and Sunday 11:00 are open to keep your weekly goals on track.';

  const buttonLabel = approved
    ? language === 'tr'
      ? 'Geri al'
      : 'Undo'
    : language === 'tr'
      ? 'Onayla ve ekle'
      : 'Approve & add';

  return (
    <View style={[styles.banner, { backgroundColor: colors.accentLight }]}>
      <Animated.View
        style={[
          styles.iconCircle,
          {
            backgroundColor: isDark ? '#14173A' : '#8FA2FF',
            transform: [{ scale: breatheAnim }],
          },
        ]}
      >
        <Sparkles size={22} color={isDark ? '#B7C3FF' : '#0E1029'} />
      </Animated.View>

      <View style={styles.textCol}>
        <Text style={[styles.title, { color: colors.accentLightText }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: colors.accentLightSubtext }]}>{subtitle}</Text>
      </View>

      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.ctaButton,
          {
            backgroundColor: isDark ? '#14173A' : '#8FA2FF',
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Text style={[styles.ctaText, { color: isDark ? '#FFFFFF' : '#0E1029' }]}>
          {buttonLabel}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 22,
    paddingVertical: 20,
    borderRadius: 28,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
    minWidth: 220,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  ctaButton: {
    minHeight: 44,
    paddingHorizontal: 20,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
