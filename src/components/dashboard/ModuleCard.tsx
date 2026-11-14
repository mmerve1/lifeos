import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  Briefcase,
  GraduationCap,
  Wallet,
  HeartPulse,
  BookOpen,
  Users,
  Compass,
  Sparkles,
  ChevronRight,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { ModuleItemType } from '../../types';

interface ModuleCardProps {
  module: ModuleItemType;
  onPress: (id: string) => void;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({ module, onPress }) => {
  const { colors } = useTheme();
  const moduleColor = colors.modules[module.category] || colors.primary;

  const renderIcon = () => {
    const iconProps = { size: 20, color: moduleColor, strokeWidth: 2 };
    switch (module.category) {
      case 'career':
        return <Briefcase {...iconProps} />;
      case 'academic':
        return <GraduationCap {...iconProps} />;
      case 'finance':
        return <Wallet {...iconProps} />;
      case 'health':
        return <HeartPulse {...iconProps} />;
      case 'learning':
        return <BookOpen {...iconProps} />;
      case 'social':
        return <Users {...iconProps} />;
      case 'personal':
        return <Compass {...iconProps} />;
      case 'ai':
        return <Sparkles {...iconProps} />;
      default:
        return <Compass {...iconProps} />;
    }
  };

  return (
    <Pressable
      onPress={() => onPress(module.id)}
      accessibilityRole="button"
      accessibilityLabel={`Open ${module.name} module`}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && { borderColor: colors.secondaryViolet, backgroundColor: colors.surfaceElevated },
      ]}
    >
      <View style={styles.leftCol}>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: `${moduleColor}14`, borderColor: `${moduleColor}33` },
          ]}
        >
          {renderIcon()}
        </View>

        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={[Typography.cardTitle, styles.titleText, { color: colors.textPrimary }]}>
              {module.name}
            </Text>
            {module.badge && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: `${moduleColor}1F`, borderColor: `${moduleColor}40` },
                ]}
              >
                <Text style={[Typography.captionBold, styles.badgeText, { color: moduleColor }]}>
                  {module.badge}
                </Text>
              </View>
            )}
          </View>
          <Text style={[Typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>
            {module.description}
          </Text>
        </View>
      </View>

      <ChevronRight size={18} color={colors.textSecondary} strokeWidth={2} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radius.card,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    marginBottom: 2,
  },
  titleText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
  },
});
