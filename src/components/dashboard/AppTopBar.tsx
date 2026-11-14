import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Bell } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
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
  return (
    <View style={styles.container}>
      <LifeOSLogo size="sm" showSlogan={false} />

      <View style={styles.actionsRow}>
        <Pressable
          onPress={onNotificationPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        >
          <Bell size={20} color={Colors.textPrimary} strokeWidth={2} />
          {notificationCount > 0 && <View style={styles.badgeDot} />}
        </Pressable>

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
    gap: Spacing.md,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pressed: {
    opacity: 0.75,
    backgroundColor: Colors.surfaceElevated,
  },
  badgeDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
});
