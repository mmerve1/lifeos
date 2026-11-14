import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Bell, Sun, Moon } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Spacing } from '../../theme/spacing';
import { LifeOSLogo } from '../common/LifeOSLogo';
import { Avatar } from '../common/Avatar';
import { UserProfileType } from '../../types';

interface AppTopBarProps {
  user: UserProfileType;
  notificationCount?: number;
  onNotificationPress: () => void;
  onAvatarPress: () => void;
}

export const AppTopBar: React.FC<AppTopBarProps> = ({
  user,
  notificationCount = 2,
  onNotificationPress,
  onAvatarPress,
}) => {
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <View style={styles.container}>
      <LifeOSLogo size="sm" showSlogan={false} />

      <View style={styles.actionsRow}>
        {/* Instant Theme Toggle (Dark / Light) */}
        <Pressable
          onPress={toggleTheme}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Toggle Dark/Light Mode"
          style={({ pressed }) => [
            styles.iconButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && { opacity: 0.75, backgroundColor: colors.surfaceElevated },
          ]}
        >
          {isDark ? (
            <Sun size={18} color={colors.warning} strokeWidth={2} />
          ) : (
            <Moon size={18} color={colors.primary} strokeWidth={2} />
          )}
        </Pressable>

        {/* Notifications */}
        <Pressable
          onPress={onNotificationPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          style={({ pressed }) => [
            styles.iconButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && { opacity: 0.75, backgroundColor: colors.surfaceElevated },
          ]}
        >
          <Bell size={18} color={colors.textPrimary} strokeWidth={2} />
          {notificationCount > 0 && (
            <View style={[styles.badgeDot, { backgroundColor: colors.primary }]} />
          )}
        </Pressable>

        {/* User Avatar */}
        <Avatar
          initials={user.initials}
          size={36}
          onPress={onAvatarPress}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});
