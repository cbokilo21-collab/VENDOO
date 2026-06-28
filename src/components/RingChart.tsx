import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface RingChartProps {
  size?: number;
  strokeWidth?: number;
  progress: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
  value?: string;
  showPercentage?: boolean;
}

const RingChart: React.FC<RingChartProps> = ({
  size = 120,
  strokeWidth = 12,
  progress,
  color = '#FF6B35',
  backgroundColor = '#E0E0E0',
  label,
  value,
  showPercentage = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={styles.content}>
        {value && <Text style={styles.value}>{value}</Text>}
        {showPercentage && (
          <Text style={styles.percentage}>{Math.round(progress)}%</Text>
        )}
        {label && <Text style={styles.label}>{label}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    position: 'absolute',
    alignItems: 'center',
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  percentage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  label: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
});

export default RingChart;
