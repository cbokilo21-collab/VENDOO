import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Line } from 'react-native-svg';

const C = {
  navy: '#FF6B35', border: '#FFE0D0', surface: '#FFFFFF',
  textDark: '#111827', textLight: '#6B7280', accent: '#FF6B35', white: '#FFFFFF',
};

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  dark?: boolean;           // navy background
  onBack?: () => void;      // custom back handler
  rightElement?: React.ReactNode;
}

const BackIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2}>
    <Path d="M19 12H5" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, subtitle, dark = false, onBack, rightElement }) => {
  const navigation = useNavigation();
  const bg   = dark ? C.accent   : C.surface;
  const col  = dark ? C.white   : C.textDark;
  const sub  = dark ? 'rgba(255,255,255,0.55)' : C.textLight;
  const btn  = dark ? 'rgba(255,255,255,0.12)' : '#F3F4F6';
  const icol = dark ? C.white   : C.textDark;
  const bord = dark ? 'transparent' : C.border;

  const handleBack = () => {
    if (onBack) { onBack(); return; }
    if (navigation.canGoBack()) navigation.goBack();
  };

  return (
    <View style={[h.wrap, { backgroundColor: bg, borderBottomColor: bord }]}>
      {/* Back button */}
      <TouchableOpacity style={[h.backBtn, { backgroundColor: btn }]} onPress={handleBack} activeOpacity={0.7}>
        <BackIcon color={icol} />
      </TouchableOpacity>

      {/* Title */}
      <View style={h.center}>
        <Text style={[h.title, { color: col }]} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={[h.subtitle, { color: sub }]} numberOfLines={1}>{subtitle}</Text> : null}
      </View>

      {/* Right slot */}
      <View style={h.right}>
        {rightElement ?? <View style={{ width: 40 }} />}
      </View>
    </View>
  );
};

const h = StyleSheet.create({
  wrap:    {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 52 : 20,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  center:  { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  title:   { fontSize: 16, fontWeight: '800', textAlign: 'center' },
  subtitle:{ fontSize: 12, marginTop: 1, textAlign: 'center' },
  right:   { width: 40, alignItems: 'flex-end' },
});

export default ScreenHeader;
