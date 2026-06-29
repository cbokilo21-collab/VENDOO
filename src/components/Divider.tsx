import React from 'react';
import { View, StyleSheet } from 'react-native';
import { T } from '../theme';

interface DividerProps {
  variant?: 'light' | 'default';
  marginVertical?: keyof typeof T.spacing;
}

export const Divider: React.FC<DividerProps> = ({ variant = 'default', marginVertical = 4 }) => {
  return (
    <View
      style={[
        s.divider,
        variant === 'light' && s.light,
        { marginVertical: marginVertical },
      ]}
    />
  );
};

const s = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: T.divider,
    width: '100%',
  },
  light: {
    backgroundColor: T.border,
    opacity: 0.5,
  },
});
