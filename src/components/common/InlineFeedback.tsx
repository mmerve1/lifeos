import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Radius, Spacing } from '../../theme/spacing';

export type FeedbackType = 'success' | 'warning' | 'error' | 'info';

interface InlineFeedbackProps {
  type: FeedbackType;
  message: string;
  title?: string;
}

export const InlineFeedback: React.FC<InlineFeedbackProps> = ({
  type,
  message,
  title,
}) => {
  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          color: Colors.success,
          bg: 'rgba(81, 212, 181, 0.08)',
          borderColor: 'rgba(81, 212, 181, 0.3)',
          icon: <CheckCircle2 size={18} color={Colors.success} strokeWidth={2} />,
        };
      case 'warning':
        return {
          color: Colors.warning,
          bg: 'rgba(243, 184, 108, 0.08)',
          borderColor: 'rgba(243, 184, 108, 0.3)',
          icon: <AlertTriangle size={18} color={Colors.warning} strokeWidth={2} />,
        };
      case 'error':
        return {
          color: Colors.danger,
          bg: 'rgba(240, 120, 145, 0.08)',
          borderColor: 'rgba(240, 120, 145, 0.3)',
          icon: <AlertCircle size={18} color={Colors.danger} strokeWidth={2} />,
        };
      case 'info':
      default:
        return {
          color: Colors.secondaryViolet,
          bg: 'rgba(182, 171, 255, 0.08)',
          borderColor: 'rgba(182, 171, 255, 0.3)',
          icon: <Info size={18} color={Colors.secondaryViolet} strokeWidth={2} />,
        };
    }
  };

  const { color, bg, borderColor, icon } = getConfig();

  return (
    <View style={[styles.container, { backgroundColor: bg, borderColor }]}>
      <View style={styles.iconContainer}>{icon}</View>
      <View style={styles.textContainer}>
        {title && (
          <Text style={[Typography.captionBold, styles.title, { color }]}>
            {title}
          </Text>
        )}
        <Text style={[Typography.caption, styles.message, { color }]}>
          {message}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: Radius.input,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  iconContainer: {
    marginTop: 1,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    marginBottom: 2,
  },
  message: {
    lineHeight: 18,
  },
});
