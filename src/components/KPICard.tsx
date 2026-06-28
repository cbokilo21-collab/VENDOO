import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { T } from '../theme';

interface KPICardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendColor?: string;
  icon?: React.ReactNode;
  backgroundColor?: string;
  valueColor?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  trend,
  trendColor,
  icon,
  backgroundColor = T.orangeSoft,
  valueColor = T.orange,
}) => {
  return (
    <View style={[s.container, { backgroundColor }]}>
      <View style={s.header}>
        {icon && <View style={s.icon}>{icon}</View>}
        <Text style={s.label} numberOfLines={1}>
          {label}
        </Text>
      </View>

      <Text style={[s.value, { color: valueColor }]}>{value}</Text>

      {trend && (
        <Text style={[s.trend, { color: trendColor || T.success }]}>{trend}</Text>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    borderRadius: T.radius.lg,
    padding: T.spacing[4],
    gap: T.spacing[2],
    ...T.shadows.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: T.spacing[2],
  },
  icon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...T.label,
    color: T.textMid,
    fontWeight: '600',
  },
  value: {
    ...T.h2,
    fontWeight: '800',
  },
  trend: {
    ...T.labelSm,
    fontWeight: '600',
  },
});
