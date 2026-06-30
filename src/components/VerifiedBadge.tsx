import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface VerifiedBadgeProps {
  size?: number;
  color?: string;
}

const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ size = 20, color = '#1DA1F2' }) => {
  return (
    <View style={[s.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        {/* X-style hexagonal shape with zigzag */}
        <Path 
          d="M12 2L15.5 5.5L20 5L19.5 9.5L23 13L19.5 16.5L20 21L15.5 20.5L12 24L8.5 20.5L4 21L4.5 16.5L1 13L4.5 9.5L4 5L8.5 5.5L12 2Z" 
          fill={color}
        />
        {/* Checkmark */}
        <Path 
          d="M8 12l2.5 2.5L16 9" 
          stroke="white" 
          strokeWidth={2} 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          fill="none"
        />
      </Svg>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    borderRadius: 999,
    overflow: 'hidden',
  },
});

export default VerifiedBadge;
