import React, { useState } from 'react';
import {
  View, TextInput, TextInputProps, StyleSheet, ViewStyle,
  TouchableOpacity, Text,
} from 'react-native';
import { T } from '../theme';
import Svg, { Path } from 'react-native-svg';

interface InputProps extends Omit<TextInputProps, 'placeholderTextColor'> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  variant?: 'default' | 'filled';
}

export const Input = React.forwardRef<TextInput, InputProps>(
  ({
    label,
    error,
    icon,
    rightElement,
    variant = 'default',
    style,
    ...props
  }, ref) => {
    const [focused, setFocused] = useState(false);

    const containerStyle: ViewStyle[] = [
      s.container,
      variant === 'filled' && s.filled,
      error && s.error,
      focused && s.focused,
    ];

    return (
      <View>
        {label && <Text style={s.label}>{label}</Text>}
        <View style={containerStyle}>
          {icon && <View style={s.icon}>{icon}</View>}
          <TextInput
            ref={ref}
            style={[s.input, style]}
            placeholderTextColor={T.muted}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            {...props}
          />
          {rightElement && <View style={s.rightElement}>{rightElement}</View>}
        </View>
        {error && <Text style={s.errorText}>{error}</Text>}
      </View>
    );
  }
);

Input.displayName = 'Input';

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: T.spacing[4],
    borderRadius: T.radius.md,
    borderWidth: 1.5,
    borderColor: T.border,
    backgroundColor: T.surface,
    minHeight: 44,
    gap: T.spacing[2],
  },
  filled: {
    backgroundColor: T.surfaceAlt,
    borderColor: 'transparent',
  },
  focused: {
    borderColor: T.orange,
    ...T.shadows.base,
  },
  error: {
    borderColor: T.error,
  },
  label: {
    ...T.label,
    color: T.text,
    marginBottom: T.spacing[2],
  },
  input: {
    flex: 1,
    ...T.body,
    color: T.text,
    padding: 0,
  },
  icon: {
    opacity: 0.7,
  },
  rightElement: {
    marginLeft: 'auto',
  },
  errorText: {
    ...T.caption,
    color: T.error,
    marginTop: T.spacing[2],
  },
});
