import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { TrendingUp, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useI18n } from '../../i18n';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { WeeklyProgressType } from '../../types';

interface ProgressCardProps {
  progress: WeeklyProgressType;
  onPress?: () => void;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  progress,
  onPress,
}) => {
  const { colors } = useTheme();
  const { t } = useI18n();
  const percentage = Math.min(100, Math.max(0, progress.percentage));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Weekly progress ${percentage}%`}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && { borderColor: colors.secondaryViolet, backgroundColor: colors.surfaceElevated },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <View style={[styles.iconBox, { backgroundColor: colors.surfaceElevated }]}>
            <TrendingUp size={16} color={colors.primary} strokeWidth={2.2} />
          </View>
          <Text style={[Typography.captionBold, styles.badgeText, { color: colors.textSecondary }]}>
            {t('weeklyProgressBadge')}
          </Text>
        </View>
        <View style={styles.percentageRow}>
          <Text style={[Typography.hero, styles.percentageNumber, { color: colors.textPrimary }]}>
            {percentage}%
          </Text>
          <ChevronRight size={16} color={colors.textSecondary} strokeWidth={2} />
        </View>
      </View>

      <View style={[styles.progressBarBackground, { backgroundColor: colors.surfaceElevated }]}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${percentage}%`, backgroundColor: colors.primary },
          ]}
        />
      </View>

      <View style={styles.footerRow}>
        <Text style={[Typography.body, styles.messageText, { color: colors.textPrimary }]}>
          {t('progressMessage')}
        </Text>
        <Text style={[Typography.caption, styles.subMeta, { color: colors.success }]}>
          {progress.tasksCompleted}/{progress.tasksTotal} {t('tasksDoneRatio')}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.cardGap,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    letterSpacing: 0.8,
  },
  percentageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  percentageNumber: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
  },
  progressBarBackground: {
    height: 8,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  messageText: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  subMeta: {
    fontWeight: '600',
  },
});
