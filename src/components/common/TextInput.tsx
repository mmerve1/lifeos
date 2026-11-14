import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../../theme/typography';
import { Sizes, Radius, Spacing } from '../../theme/spacing';

export interface CustomTextInputProps extends Omit<RNTextInputProps, 'style'> {
  label: string;
  error?: string | null;
  helperText?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  onTrailingIconPress?: () => void;
  required?: boolean;
}

export const TextInput: React.FC<CustomTextInputProps> = ({
  label,
  error,
  helperText,
  leadingIcon,
  trailingIcon,
  onTrailingIconPress,
  required = false,
  editable = true,
  onFocus,
  onBlur,
  ...rest
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const hasError = !!error;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[Typography.label, { color: colors.textPrimary }]}>
          {label}
          {required && <Text style={{ color: colors.primary }}> *</Text>}
        </Text>
      </View>

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
          isFocused && {
            borderColor: colors.borderFocused,
            backgroundColor: colors.surfaceElevated,
          },
          hasError && {
            borderColor: colors.borderError,
          },
          !editable && styles.inputDisabled,
        ]}
      >
        {leadingIcon && <View style={styles.leadingIcon}>{leadingIcon}</View>}

        <RNTextInput
          style={[
            Typography.bodyLarge,
            styles.nativeInput,
            { color: colors.textPrimary },
            !editable && { color: colors.textSecondary },
          ]}
          placeholderTextColor={colors.textSecondary}
          editable={editable}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          selectionColor={colors.primary}
          {...rest}
        />

        {trailingIcon && (
          <Pressable
            onPress={onTrailingIconPress}
            disabled={!onTrailingIconPress}
            hitSlop={8}
            style={styles.trailingIcon}
          >
            {trailingIcon}
          </Pressable>
        )}
      </View>

      {hasError ? (
        <Text style={[Typography.caption, { color: colors.danger, marginTop: Spacing.xs, marginLeft: 2 }]}>
          {error}
        </Text>
      ) : helperText ? (
        <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.xs, marginLeft: 2 }]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs + 2,
  },
  inputContainer: {
    height: Sizes.inputHeight,
    borderWidth: 1,
    borderRadius: Radius.input,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  leadingIcon: {
    marginRight: Spacing.md,
  },
  trailingIcon: {
    marginLeft: Spacing.md,
    padding: Spacing.xs,
  },
  nativeInput: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
  },
});
