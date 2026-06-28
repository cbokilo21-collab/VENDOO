import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { T } from '../theme';

interface SectionProps {
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
  children: React.ReactNode;
  gap?: keyof typeof T.spacing;
}

export const Section: React.FC<SectionProps> = ({
  title,
  subtitle,
  action,
  children,
  gap = '4',
}) => {
  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.title}>
          <Text style={s.titleText}>{title}</Text>
          {subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
        </View>
        {action && (
          <TouchableOpacity onPress={action.onPress} activeOpacity={0.6}>
            <Text style={s.action}>{action.label}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={{ gap: T.spacing[gap as any] }}>{children}</View>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    gap: T.spacing[3],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    gap: T.spacing[1],
  },
  titleText: {
    ...T.h4,
    fontWeight: '700',
    color: T.text,
  },
  subtitle: {
    ...T.bodySm,
    color: T.textSub,
  },
  action: {
    ...T.label,
    fontWeight: '700',
    color: T.orange,
  },
});
