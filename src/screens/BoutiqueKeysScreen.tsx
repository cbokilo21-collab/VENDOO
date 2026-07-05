import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Animated, Easing, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle, G, Rect, Ellipse } from 'react-native-svg';

const C = {
  navy: '#FF6B35', navyMid: '#FF8A5C',
  bg: '#FFF7F3', surface: '#FFFFFF', border: '#E5E7EB',
  accent: '#FF6B35', accentLight: '#FFEDE5',
  gold: '#F59E0B', goldLight: '#FEF3C7',
  success: '#10B981', successLight: '#D1FAE5',
  textDark: '#111827', textMid: '#374151', textLight: '#6B7280',
  white: '#FFFFFF',
};

type RootStackParamList = {
  BoutiqueKeys: undefined;
  BoutiqueTutorial: undefined;
  BusinessDashboard: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList>;

// ─── Key SVG illustration ─────────────────────────────────────────────────────
const KeyIllustration: React.FC<{ scale: Animated.Value; rotate: Animated.Value }> = ({ scale, rotate }) => {
  const rotateInterp = rotate.interpolate({ inputRange: [0, 1], outputRange: ['-15deg', '15deg'] });
  return (
    <Animated.View style={{ transform: [{ scale }, { rotate: rotateInterp }] }}>
      <Svg width={120} height={120} viewBox="0 0 120 120">
        {/* Key body */}
        <Circle cx="42" cy="50" r="26" fill={C.gold} opacity={0.9} />
        <Circle cx="42" cy="50" r="18" fill={C.goldLight} />
        <Circle cx="42" cy="50" r="10" fill={C.gold} />
        {/* Key shaft */}
        <Rect x="62" y="46" width="46" height="8" rx="4" fill={C.gold} />
        {/* Key teeth */}
        <Rect x="82" y="54" width="8" height="10" rx="2" fill={C.gold} />
        <Rect x="96" y="54" width="8" height="7" rx="2" fill={C.gold} />
        {/* Shine */}
        <Circle cx="36" cy="44" r="5" fill={C.white} opacity={0.4} />
      </Svg>
    </Animated.View>
  );
};

// ─── Sparkle dots ─────────────────────────────────────────────────────────────
const Sparkle: React.FC<{ style: any; delay: number; anim: Animated.Value }> = ({ style, delay, anim }) => {
  const opacity = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 0] });
  const scale   = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 1.2, 0.3] });
  return (
    <Animated.View style={[{ position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: C.gold }, style, { opacity, transform: [{ scale }] }]} />
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const BoutiqueKeysScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const scaleAnim  = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const sparkAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    // Sequence: key pops in, then wobble, then content fades
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 5, useNativeDriver: false }),
      Animated.sequence([
        Animated.timing(rotateAnim, { toValue: 1, duration: 150, easing: Easing.ease, useNativeDriver: false }),
        Animated.timing(rotateAnim, { toValue: -1, duration: 200, easing: Easing.ease, useNativeDriver: false }),
        Animated.timing(rotateAnim, { toValue: 0.5, duration: 150, easing: Easing.ease, useNativeDriver: false }),
        Animated.timing(rotateAnim, { toValue: 0, duration: 100, useNativeDriver: false }),
      ]),
    ]).start();

    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 700, delay: 500, easing: Easing.ease, useNativeDriver: false }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, delay: 500, easing: Easing.ease, useNativeDriver: false }),
    ]).start();

    // Looping sparkle
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkAnim, { toValue: 1, duration: 1200, easing: Easing.ease, useNativeDriver: false }),
        Animated.timing(sparkAnim, { toValue: 0, duration: 600, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const sparkles = [
    { top: 60,  left: 50,   delay: 0   },
    { top: 40,  right: 60,  delay: 200 },
    { top: 130, left: 30,   delay: 400 },
    { top: 90,  right: 40,  delay: 100 },
    { top: 160, right: 80,  delay: 300 },
    { top: 20,  left: 100,  delay: 150 },
  ];

  return (
    <View style={s.root}>
      {/* Background glow */}
      <View style={s.glowCircle} />

      {/* Illustration zone */}
      <View style={s.illustrationZone}>
        {sparkles.map((sp, i) => <Sparkle key={i} style={{ top: sp.top, left: (sp as any).left, right: (sp as any).right }} delay={sp.delay} anim={sparkAnim} />)}
        <View style={s.keyRing}>
          <View style={s.keyRingInner}>
            <KeyIllustration scale={scaleAnim} rotate={rotateAnim} />
          </View>
        </View>
      </View>

      {/* Content */}
      <Animated.View style={[s.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Badge */}
        <View style={s.successBadge}>
          <Text style={s.successBadgeText}>✓ Location finalisée !</Text>
        </View>

        <Text style={s.headline}>Tu as tes clés !</Text>
        <Text style={s.subline}>
          Félicitations ! Votre boutique est prête.{'\n'}
          Entrez et découvrez tous vos outils.
        </Text>

        {/* Feature bullets */}
        <View style={s.featureList}>
          {[
            { icon: '🏪', text: 'Votre façade dans le quartier' },
            { icon: '📦', text: 'Gestion produits & inventaire' },
            { icon: '📊', text: 'Dashboard & analytics IA' },
            { icon: '🛒', text: 'Caisse (POS) et commandes' },
            { icon: '👥', text: 'Suivi clients & fidélité' },
          ].map((f, i) => (
            <View key={i} style={s.featureRow}>
              <Text style={s.featureIcon}>{f.icon}</Text>
              <Text style={s.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity style={s.enterBtn} onPress={() => navigation.navigate('BoutiqueTutorial')} activeOpacity={0.87}>
          <Text style={s.enterBtnText}>🚪 Entrer dans ma boutique</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.skipBtn} onPress={() => navigation.navigate('BusinessDashboard')} activeOpacity={0.7}>
          <Text style={s.skipBtnText}>Passer le tutoriel →</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.surface },

  glowCircle: {
    position: 'absolute', top: -100, alignSelf: 'center',
    width: 400, height: 400, borderRadius: 200,
    backgroundColor: C.goldLight, opacity: 0.5,
  },

  illustrationZone: {
    height: 280, alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },

  keyRing: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: C.goldLight,
    alignItems: 'center', justifyContent: 'center',
  },
  keyRingInner: {
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: C.white,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.gold, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 20,
  },

  content: { flex: 1, paddingHorizontal: 28, paddingTop: 4 },

  successBadge:     { backgroundColor: C.successLight, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 16 },
  successBadgeText: { fontSize: 13, fontWeight: '700', color: C.success },

  headline: { fontSize: 34, fontWeight: '900', color: C.textDark, marginBottom: 10, lineHeight: 40 },
  subline:  { fontSize: 15, color: C.textLight, lineHeight: 23, marginBottom: 24 },

  featureList: { gap: 12, marginBottom: 32 },
  featureRow:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon: { fontSize: 20, width: 32 },
  featureText: { fontSize: 14, color: C.textMid, fontWeight: '500' },

  enterBtn:     { backgroundColor: C.accent, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 14, shadowColor: C.navy, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16 },
  enterBtnText: { color: C.white, fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },

  skipBtn:     { alignItems: 'center', paddingVertical: 12 },
  skipBtnText: { fontSize: 14, color: C.textLight, fontWeight: '500' },
});

export default BoutiqueKeysScreen;
