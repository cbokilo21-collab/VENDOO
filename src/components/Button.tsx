import React from 'react';
import {
  TouchableOpacity, TouchableOpacityProps, Text, StyleSheet,
  ViewStyle, TextStyle, ActivityIndicator, View,
} from 'react-native';
import { T } from '../theme';

type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

interface ButtonProps extends Omit<TouchableOpacityProps, 'children'> {
  label: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  size = 'md',
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  style,
  onPress,
  ...props
}) => {
  const isDisabled = disabled || loading;
  const containerStyle: ViewStyle[] = [
    s.base,
    s[`size_${size}`],
    s[`variant_${variant}`],
    isDisabled ? s.disabled : null,
    fullWidth ? s.fullWidth : null,
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  const textStyle: TextStyle[] = [
    s.text,
    s[`text_${size}`],
    s[`text_${variant}`],
    isDisabled ? s.textDisabled : null,
  ].filter(Boolean) as TextStyle[];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      <View style={s.content}>
        {loading ? (
          <ActivityIndicator color={variant === 'outline' ? T.orange : T.white} size="small" />
        ) : (
          <>
            {icon}
            <Text style={textStyle}>{label}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  base: {
    borderRadius: T.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: T.spacing[2],
  },

  // Sizes
  size_sm: {
    paddingVertical: T.spacing[2],
    paddingHorizontal: T.spacing[3],
    minHeight: 32,
  },
  size_md: {
    paddingVertical: T.spacing[3],
    paddingHorizontal: T.spacing[4],
    minHeight: 44,
  },
  size_lg: {
    paddingVertical: T.spacing[4],
    paddingHorizontal: T.spacing[5],
    minHeight: 52,
  },

  // Text sizes
  text_sm: { ...T.labelSm, fontWeight: '600' },
  text_md: { ...T.label, fontWeight: '600' },
  text_lg: { ...T.labelLg, fontWeight: '700' },

  // Variants
  variant_primary: {
    backgroundColor: T.orange,
    borderColor: T.orange,
  },
  text_primary: {
    color: T.white,
  },

  variant_secondary: {
    backgroundColor: T.orangeSoft,
    borderColor: T.orange,
  },
  text_secondary: {
    color: T.orange,
  },

  variant_outline: {
    backgroundColor: 'transparent',
    borderColor: T.border,
  },
  text_outline: {
    color: T.text,
  },

  variant_ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  text_ghost: {
    color: T.text,
  },

  // States
  disabled: {
    opacity: T.interactive.disabledOpacity,
  },
  textDisabled: {
    color: T.muted,
  },

  // Full width
  fullWidth: {
    width: '100%',
  },

  text: {
    textAlign: 'center',
  },
});
