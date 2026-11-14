import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Colors } from '../../theme/colors';
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
  const [isFocused, setIsFocused] = useState(false);

  const hasError = !!error;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[Typography.label, styles.label]}>
          {label}
          {required && <Text style={styles.requiredMark}> *</Text>}
        </Text>
      </View>

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          hasError && styles.inputError,
          !editable && styles.inputDisabled,
        ]}
      >
        {leadingIcon && <View style={styles.leadingIcon}>{leadingIcon}</View>}

        <RNTextInput
          style={[
            Typography.bodyLarge,
            styles.nativeInput,
            !editable && styles.nativeInputDisabled,
          ]}
          placeholderTextColor={Colors.textSecondary}
          editable={editable}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          selectionColor={Colors.primary}
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
        <Text style={[Typography.caption, styles.errorText]}>{error}</Text>
      ) : helperText ? (
        <Text style={[Typography.caption, styles.helperText]}>{helperText}</Text>
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
  label: {
    color: Colors.textPrimary,
  },
  requiredMark: {
    color: Colors.primary,
  },
  inputContainer: {
    height: Sizes.inputHeight,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  inputFocused: {
    borderColor: Colors.borderFocused,
    backgroundColor: Colors.surfaceElevated,
  },
  inputError: {
    borderColor: Colors.borderError,
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
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  nativeInputDisabled: {
    color: Colors.textSecondary,
  },
  errorText: {
    color: Colors.danger,
    marginTop: Spacing.xs,
    marginLeft: 2,
  },
  helperText: {
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    marginLeft: 2,
  },
});
