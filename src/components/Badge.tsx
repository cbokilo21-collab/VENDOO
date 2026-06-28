import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { T } from '../theme';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default' | 'orange';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const variantConfig = {
  success: { bg: T.successSoft, text: T.success },
  warning: { bg: T.warningSoft, text: T.warning },
  error: { bg: T.errorSoft, text: T.error },
  info: { bg: T.infoSoft, text: T.info },
  default: { bg: T.surfaceAlt, text: T.text },
  orange: { bg: T.orangeSoft, text: T.orange },
};

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', size = 'md' }) => {
  const config = variantConfig[variant];
  const containerStyle: ViewStyle = {
    backgroundColor: config.bg,
    paddingVertical: size === 'sm' ? 2 : 4,
    paddingHorizontal: size === 'sm' ? 8 : 12,
    borderRadius: T.radius.full,
  };
  const textStyle: TextStyle = {
    color: config.text,
    fontSize: size === 'sm' ? 11 : 12,
    fontWeight: '600',
  };

  return (
    <View style={containerStyle}>
      <Text style={textStyle}>{label}</Text>
    </View>
  );
};
