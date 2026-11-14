import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react-native';
import { TextInput, CustomTextInputProps } from './TextInput';
import { Colors } from '../../theme/colors';

interface PasswordInputProps extends Omit<CustomTextInputProps, 'secureTextEntry' | 'trailingIcon' | 'onTrailingIconPress'> {
  showLockIcon?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  showLockIcon = true,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextInput
      {...props}
      secureTextEntry={!showPassword}
      leadingIcon={
        showLockIcon ? (
          <Lock size={18} color={Colors.textSecondary} strokeWidth={2} />
        ) : undefined
      }
      trailingIcon={
        showPassword ? (
          <EyeOff size={18} color={Colors.textSecondary} strokeWidth={2} />
        ) : (
          <Eye size={18} color={Colors.textSecondary} strokeWidth={2} />
        )
      }
      onTrailingIconPress={() => setShowPassword((prev) => !prev)}
      autoCapitalize="none"
      autoCorrect={false}
    />
  );
};
