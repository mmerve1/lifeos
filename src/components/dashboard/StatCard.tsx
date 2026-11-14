import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { CheckCircle2, Target } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { StatMetricType } from '../../types';

interface StatCardProps {
  item: StatMetricType;
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ item, onPress }) => {
  const renderIcon = () => {
    switch (item.icon) {
      case 'CheckCircle2':
        return <CheckCircle2 size={18} color={Colors.success} strokeWidth={2.2} />;
      case 'Target':
      default:
        return <Target size={18} color={Colors.primary} strokeWidth={2.2} />;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.label}: ${item.value}`}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.topRow}>
        <View style={styles.iconBox}>{renderIcon()}</View>
      </View>

      <Text style={[Typography.hero, styles.valueText]}>{item.value}</Text>
      <Text style={[Typography.captionBold, styles.labelText]}>{item.label}</Text>
      <Text style={[Typography.caption, styles.subtitleText]}>{item.subtitle}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.card,
    padding: Spacing.lg,
  },
  cardPressed: {
    borderColor: Colors.secondaryViolet,
    backgroundColor: Colors.surfaceElevated,
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
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    color: Colors.textPrimary,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '700',
    marginBottom: 2,
  },
  labelText: {
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  subtitleText: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
});
