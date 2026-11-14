import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../../theme/typography';

interface AvatarProps {
  initials?: string;
  size?: number;
  onPress?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({
  initials = 'M',
  size = 40,
  onPress,
}) => {
  const { colors } = useTheme();

  const content = (
    <View
      style={[
        styles.avatarCircle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.primary,
        },
      ]}
    >
      <Text
        style={[
          Typography.captionBold,
          {
            color: colors.secondaryViolet,
            fontSize: Math.max(12, Math.floor(size * 0.38)),
            fontWeight: '700',
          },
        ]}
      >
        {initials.toUpperCase()}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Profile settings"
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  pressable: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  avatarCircle: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
