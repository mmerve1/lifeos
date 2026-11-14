import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useI18n } from '../../i18n';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

interface LifeOSLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSlogan?: boolean;
}

export const LifeOSLogo: React.FC<LifeOSLogoProps> = ({
  size = 'md',
  showSlogan = true,
}) => {
  const { colors } = useTheme();
  const { t } = useI18n();

  const getLogoSize = () => {
    switch (size) {
      case 'sm':
        return { title: 20, dot: 6, gap: 2 };
      case 'lg':
        return { title: 34, dot: 9, gap: 4 };
      case 'md':
      default:
        return { title: 26, dot: 7, gap: 3 };
    }
  };

  const { title, dot, gap } = getLogoSize();

  return (
    <View style={styles.container}>
      <View style={[styles.brandRow, { gap }]}>
        <Text
          style={[
            Typography.pageTitle,
            styles.wordmark,
            { fontSize: title, color: colors.textPrimary },
          ]}
        >
          LifeOS
        </Text>
        <View
          style={[
            styles.dot,
            {
              width: dot,
              height: dot,
              borderRadius: dot / 2,
              backgroundColor: colors.primary,
            },
          ]}
        />
      </View>
      {showSlogan && (
        <Text
          style={[
            Typography.caption,
            styles.slogan,
            { color: colors.textSecondary },
          ]}
        >
          {t('brandSlogan')}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  wordmark: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  dot: {
    marginBottom: 2,
  },
  slogan: {
    marginTop: Spacing.xs,
    letterSpacing: 0.2,
  },
});
