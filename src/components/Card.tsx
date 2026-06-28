import React from 'react';
import { View, ViewProps, StyleSheet, Platform } from 'react-native';
import { T } from '../theme';

interface CardProps extends ViewProps {
  variant?: 'default' | 'interactive' | 'elevated';
  children: React.ReactNode;
  padding?: keyof typeof T.spacing;
  gap?: keyof typeof T.spacing;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = '5',
  gap,
  children,
  style,
  onPress,
  ...props
}) => {
  const baseStyle = [
    s.base,
    variant === 'default' && s.default,
    variant === 'interactive' && s.interactive,
    variant === 'elevated' && s.elevated,
    { padding: T.spacing[padding as any] },
    gap && { gap: T.spacing[gap as any] },
    style,
  ];

  return (
    <View style={baseStyle} {...props}>
      {children}
    </View>
  );
};

const s = StyleSheet.create({
  base: {
    backgroundColor: T.surface,
    borderRadius: T.radius.lg,
    borderWidth: 1,
    borderColor: T.border,
  },
  default: {
    ...T.shadows.base,
  },
  interactive: {
    ...T.shadows.sm,
  },
  elevated: {
    ...T.shadows.lg,
  },
});
