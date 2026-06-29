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
  padding = 4,
  gap,
  children,
  style,
  onPress,
  ...props
}) => {
  const baseStyle = [
    s.base,
    variant === 'default' ? s.default : null,
    variant === 'interactive' ? s.interactive : null,
    variant === 'elevated' ? s.elevated : null,
    { padding: padding },
    gap ? { gap: gap } : null,
    style,
  ].filter(Boolean);

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
