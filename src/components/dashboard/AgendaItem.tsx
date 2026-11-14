import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Check, Clock } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { AgendaItemType } from '../../types';

interface AgendaItemProps {
  item: AgendaItemType;
  onToggle: (id: string) => void;
  onPress?: (id: string) => void;
}

export const AgendaItem: React.FC<AgendaItemProps> = ({
  item,
  onToggle,
  onPress,
}) => {
  const { colors } = useTheme();
  const moduleColor = colors.modules[item.category] || colors.primary;

  return (
    <Pressable
      onPress={() => onPress?.(item.id)}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && { backgroundColor: colors.surfaceElevated },
      ]}
    >
      <Pressable
        onPress={() => onToggle(item.id)}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.completed }}
        style={[
          styles.checkbox,
          { borderColor: colors.border, backgroundColor: colors.surfaceElevated },
          item.completed && { backgroundColor: colors.success, borderColor: colors.success },
        ]}
      >
        {item.completed && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
      </Pressable>

      <View style={styles.contentCol}>
        <View style={styles.topMeta}>
          <View style={styles.timeRow}>
            <Clock size={12} color={colors.textSecondary} strokeWidth={2} />
            <Text style={[Typography.caption, { color: colors.textSecondary, fontWeight: '500' }]}>
              {item.time}
            </Text>
          </View>

          <View
            style={[
              styles.moduleBadge,
              { backgroundColor: `${moduleColor}1A`, borderColor: `${moduleColor}33` },
            ]}
          >
            <View style={[styles.moduleDot, { backgroundColor: moduleColor }]} />
            <Text style={[Typography.caption, styles.moduleBadgeText, { color: moduleColor }]}>
              {item.module}
            </Text>
          </View>
        </View>

        <Text
          style={[
            Typography.body,
            styles.titleText,
            { color: colors.textPrimary },
            item.completed && [styles.titleCompleted, { color: colors.textSecondary }],
          ]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.card,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentCol: {
    flex: 1,
  },
  topMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moduleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    borderWidth: 1,
    gap: 5,
  },
  moduleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  moduleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  titleText: {
    fontWeight: '500',
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
  },
});
