import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { TrendingUp, ChevronRight } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
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
  const percentage = Math.min(100, Math.max(0, progress.percentage));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Weekly progress ${percentage}%`}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <View style={styles.iconBox}>
            <TrendingUp size={16} color={Colors.primary} strokeWidth={2.2} />
          </View>
          <Text style={[Typography.captionBold, styles.badgeText]}>
            WEEKLY PROGRESS
          </Text>
        </View>
        <View style={styles.percentageRow}>
          <Text style={[Typography.hero, styles.percentageNumber]}>
            {percentage}%
          </Text>
          <ChevronRight size={16} color={Colors.textSecondary} strokeWidth={2} />
        </View>
      </View>

      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
      </View>

      <View style={styles.footerRow}>
        <Text style={[Typography.body, styles.messageText]}>
          {progress.message}
        </Text>
        <Text style={[Typography.caption, styles.subMeta]}>
          {progress.tasksCompleted}/{progress.tasksTotal} completed
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.cardGap,
  },
  cardPressed: {
    borderColor: Colors.secondaryViolet,
    backgroundColor: Colors.surfaceElevated,
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
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: Colors.textSecondary,
    letterSpacing: 0.8,
  },
  percentageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  percentageNumber: {
    color: Colors.textPrimary,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  messageText: {
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  subMeta: {
    color: Colors.success,
    fontWeight: '600',
  },
});
