import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { CheckCircle2, Target } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { StatMetricType } from '../../types';

interface StatCardProps {
  item: StatMetricType;
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ item, onPress }) => {
  const { colors } = useTheme();

  const renderIcon = () => {
    switch (item.icon) {
      case 'CheckCircle2':
        return <CheckCircle2 size={18} color={colors.success} strokeWidth={2.2} />;
      case 'Target':
      default:
        return <Target size={18} color={colors.primary} strokeWidth={2.2} />;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.label}: ${item.value}`}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && { borderColor: colors.secondaryViolet, backgroundColor: colors.surfaceElevated },
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: colors.surfaceElevated }]}>
          {renderIcon()}
        </View>
      </View>

      <Text style={[Typography.hero, styles.valueText, { color: colors.textPrimary }]}>
        {item.value}
      </Text>
      <Text style={[Typography.captionBold, styles.labelText, { color: colors.textPrimary }]}>
        {item.label}
      </Text>
      <Text style={[Typography.caption, styles.subtitleText, { color: colors.textSecondary }]}>
        {item.subtitle}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.card,
    padding: Spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '700',
    marginBottom: 2,
  },
  labelText: {
    marginBottom: 2,
  },
  subtitleText: {
    fontSize: 11,
  },
});
