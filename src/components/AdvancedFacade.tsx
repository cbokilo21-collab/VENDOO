import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Svg, { Rect, Circle, Path, Line, Defs, LinearGradient as SvgGradient, Stop, G, Text as SvgText } from 'react-native-svg';
import { T } from '../theme';

export interface FacadeProps {
  level: 1 | 2 | 3 | 4;
  primaryColor: string;
  secondaryColor: string;
  shopName: string;
  rating: number;
  productsCount: number;
  isOpen: boolean;
  onPress?: () => void;
  animated?: boolean;
}

const FacadeLevel1: React.FC<{ primary: string; secondary: string }> = ({ primary, secondary }) => (
  <Svg width={80} height={100} viewBox="0 0 80 100">
    <Defs>
      <SvgGradient id="roof1" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={primary} stopOpacity="1" />
        <Stop offset="100%" stopColor={secondary} stopOpacity="1" />
      </SvgGradient>
    </Defs>
    {/* Stand roof */}
    <Path d="M 20 30 L 40 10 L 60 30 Z" fill="url(#roof1)" stroke={secondary} strokeWidth="1.5" />
    {/* Stand body */}
    <Rect x="15" y="30" width="50" height="40" fill={primary} stroke={secondary} strokeWidth="1.5" />
    {/* Window */}
    <Rect x="25" y="40" width="30" height="20" fill="#FFE0D0" stroke={secondary} strokeWidth="1" />
    {/* Base */}
    <Rect x="10" y="70" width="60" height="20" fill={secondary} stroke={primary} strokeWidth="1" />
  </Svg>
);

const FacadeLevel2: React.FC<{ primary: string; secondary: string }> = ({ primary, secondary }) => (
  <Svg width={100} height={120} viewBox="0 0 100 120">
    <Defs>
      <SvgGradient id="wall2" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor={primary} stopOpacity="0.95" />
        <Stop offset="100%" stopColor={secondary} stopOpacity="0.85" />
      </SvgGradient>
    </Defs>
    {/* Roof */}
    <Path d="M 15 25 L 50 5 L 85 25 Z" fill={primary} stroke={secondary} strokeWidth="2" />
    {/* Wall */}
    <Rect x="10" y="25" width="80" height="60" fill="url(#wall2)" stroke={secondary} strokeWidth="2" />
    {/* Door */}
    <Rect x="40" y="70" width="20" height="30" fill="#8B4513" stroke={secondary} strokeWidth="1.5" />
    {/* Window left */}
    <Rect x="20" y="40" width="18" height="15" fill="#FFE0D0" stroke={secondary} strokeWidth="1" />
    {/* Window right */}
    <Rect x="62" y="40" width="18" height="15" fill="#FFE0D0" stroke={secondary} strokeWidth="1" />
    {/* Sign */}
    <Rect x="30" y="12" width="40" height="8" fill={secondary} stroke={primary} strokeWidth="1" rx="2" />
    <SvgText x="50" y="17" fontSize="6" fontWeight="bold" fill={primary} textAnchor="middle">SHOP</SvgText>
  </Svg>
);

const FacadeLevel3: React.FC<{ primary: string; secondary: string }> = ({ primary, secondary }) => (
  <Svg width={120} height={150} viewBox="0 0 120 150">
    <Defs>
      <SvgGradient id="storefront" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor={primary} stopOpacity="1" />
        <Stop offset="50%" stopColor={primary} stopOpacity="0.9" />
        <Stop offset="100%" stopColor={secondary} stopOpacity="0.8" />
      </SvgGradient>
    </Defs>
    {/* Roof/Top */}
    <Path d="M 10 30 L 60 5 L 110 30 Z" fill={primary} stroke={secondary} strokeWidth="2.5" />
    {/* Main facade */}
    <Rect x="8" y="30" width="104" height="80" fill="url(#storefront)" stroke={secondary} strokeWidth="2.5" />
    {/* Door center */}
    <Rect x="50" y="85" width="20" height="25" fill="#8B6914" stroke={secondary} strokeWidth="1.5" />
    {/* Storefront glass left */}
    <Rect x="15" y="40" width="25" height="40" fill="#E0F7FF" stroke={secondary} strokeWidth="1.5" opacity="0.7" />
    {/* Storefront glass right */}
    <Rect x="80" y="40" width="25" height="40" fill="#E0F7FF" stroke={secondary} strokeWidth="1.5" opacity="0.7" />
    {/* Sign banner */}
    <Rect x="20" y="15" width="80" height="12" fill={secondary} stroke={primary} strokeWidth="1.5" rx="3" />
    <SvgText x="60" y="24" fontSize="8" fontWeight="bold" fill={primary} textAnchor="middle">BOUTIQUE</SvgText>
    {/* Lights */}
    <Circle cx="30" cy="45" r="2" fill="#FFD700" />
    <Circle cx="90" cy="45" r="2" fill="#FFD700" />
  </Svg>
);

const FacadeLevel4: React.FC<{ primary: string; secondary: string }> = ({ primary, secondary }) => (
  <Svg width={140} height={180} viewBox="0 0 140 180">
    <Defs>
      <SvgGradient id="premium" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor={primary} stopOpacity="1" />
        <Stop offset="40%" stopColor={primary} stopOpacity="0.95" />
        <Stop offset="100%" stopColor={secondary} stopOpacity="0.85" />
      </SvgGradient>
    </Defs>
    {/* Roof with multiple levels */}
    <Path d="M 10 40 L 70 10 L 130 40 Z" fill={primary} stroke={secondary} strokeWidth="3" />
    {/* Upper facade */}
    <Rect x="8" y="40" width="124" height="60" fill={secondary} stroke={primary} strokeWidth="2" opacity="0.5" />
    {/* Main facade */}
    <Rect x="8" y="100" width="124" height="70" fill="url(#premium)" stroke={secondary} strokeWidth="3" />

    {/* Double doors */}
    <Rect x="45" y="130" width="12" height="30" fill="#8B6914" stroke={secondary} strokeWidth="1.5" />
    <Rect x="83" y="130" width="12" height="30" fill="#8B6914" stroke={secondary} strokeWidth="1.5" />

    {/* Large storefronts */}
    <Rect x="15" y="55" width="30" height="45" fill="#E0F7FF" stroke={secondary} strokeWidth="2" opacity="0.8" />
    <Rect x="95" y="55" width="30" height="45" fill="#E0F7FF" stroke={secondary} strokeWidth="2" opacity="0.8" />

    {/* Fancy sign */}
    <Rect x="25" y="20" width="90" height="16" fill={secondary} stroke={primary} strokeWidth="2" rx="4" />
    <SvgText x="70" y="32" fontSize="10" fontWeight="bold" fill={primary} textAnchor="middle">PREMIUM STORE</SvgText>

    {/* Decorative lights */}
    <Circle cx="35" cy="60" r="2.5" fill="#FFD700" />
    <Circle cx="70" cy="50" r="2.5" fill="#FFD700" />
    <Circle cx="105" cy="60" r="2.5" fill="#FFD700" />
  </Svg>
);

export const AdvancedFacade: React.FC<FacadeProps> = ({
  level,
  primaryColor,
  secondaryColor,
  shopName,
  rating,
  productsCount,
  isOpen,
  onPress,
  animated = true,
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (!animated) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.05, duration: 2000, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animated, scaleAnim]);

  const renderFacade = () => {
    switch (level) {
      case 1:
        return <FacadeLevel1 primary={primaryColor} secondary={secondaryColor} />;
      case 2:
        return <FacadeLevel2 primary={primaryColor} secondary={secondaryColor} />;
      case 3:
        return <FacadeLevel3 primary={primaryColor} secondary={secondaryColor} />;
      case 4:
        return <FacadeLevel4 primary={primaryColor} secondary={secondaryColor} />;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={s.container}
    >
      <Animated.View style={[s.facadeWrapper, animated && { transform: [{ scale: scaleAnim }] }]}>
        {renderFacade()}
      </Animated.View>

      {/* Info overlay */}
      <View style={s.info}>
        <Text style={s.shopName} numberOfLines={1}>{shopName}</Text>

        <View style={s.statsRow}>
          <Text style={s.rating}>⭐ {rating.toFixed(1)}</Text>
          <Text style={s.products}>{productsCount} produits</Text>
        </View>

        {isOpen ? (
          <View style={[s.badge, s.openBadge]}>
            <Text style={s.badgeText}>Ouvert</Text>
          </View>
        ) : (
          <View style={[s.badge, s.closedBadge]}>
            <Text style={s.badgeText}>Fermé</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: T.spacing[3],
  },
  facadeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    alignItems: 'center',
    gap: T.spacing[1],
    width: '100%',
  },
  shopName: {
    ...T.label,
    color: T.text,
    fontWeight: '700',
    maxWidth: 120,
  },
  statsRow: {
    flexDirection: 'row',
    gap: T.spacing[2],
    alignItems: 'center',
  },
  rating: {
    ...T.labelSm,
    color: T.warning,
    fontWeight: '600',
  },
  products: {
    ...T.labelSm,
    color: T.textSub,
  },
  badge: {
    paddingHorizontal: T.spacing[3],
    paddingVertical: 2,
    borderRadius: T.radius.full,
  },
  openBadge: {
    backgroundColor: T.successSoft,
  },
  closedBadge: {
    backgroundColor: T.errorSoft,
  },
  badgeText: {
    ...T.labelSm,
    fontWeight: '700',
    color: T.text,
  },
});
