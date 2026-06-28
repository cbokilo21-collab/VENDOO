import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle } from 'react-native-svg';

const C = {
  bg:       '#FFFFFF',
  border:   '#FFE0D0',
  inactive: '#B0B8C1',
  active:   '#FF6B35',
  activeBg: 'rgba(255,107,53,0.15)',
};

type Nav = NativeStackNavigationProp<any>;
interface Props { activeRoute: string; }

const HomeIcon  = ({ on }: { on: boolean }) => <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={on ? C.active : C.inactive} strokeWidth={on ? 2.2 : 1.8}><Path d="M3 3v18h18M18 17V9M13 17V5M8 17v-3" strokeLinecap="round" strokeLinejoin="round"/></Svg>;
const BoxIcon   = ({ on }: { on: boolean }) => <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={on ? C.active : C.inactive} strokeWidth={on ? 2.2 : 1.8}><Path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" strokeLinecap="round" strokeLinejoin="round"/><Path d="m3.27 6.96 8.73 5.05 8.73-5.05M12 22.08V12" strokeLinecap="round"/></Svg>;
const ClipIcon  = ({ on }: { on: boolean }) => <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={on ? C.active : C.inactive} strokeWidth={on ? 2.2 : 1.8}><Path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 10h6M9 14h6M9 18h6" strokeLinecap="round" strokeLinejoin="round"/></Svg>;
const UsersIcon = ({ on }: { on: boolean }) => <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={on ? C.active : C.inactive} strokeWidth={on ? 2.2 : 1.8}><Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round"/><Circle cx="9" cy="7" r="4"/></Svg>;
const GearIcon  = ({ on }: { on: boolean }) => <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={on ? C.active : C.inactive} strokeWidth={on ? 2.2 : 1.8}><Circle cx="12" cy="12" r="3"/><Path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" strokeLinecap="round" strokeLinejoin="round"/></Svg>;

const tabs = [
  { route: 'BusinessDashboard', label: 'Accueil',   Icon: HomeIcon  },
  { route: 'Products',          label: 'Produits',  Icon: BoxIcon   },
  { route: 'Orders',            label: 'Commandes', Icon: ClipIcon  },
  { route: 'Customers',         label: 'Clients',   Icon: UsersIcon },
  { route: 'Settings',          label: 'Réglages',  Icon: GearIcon  },
];

const BottomNavigation: React.FC<Props> = ({ activeRoute }) => {
  const navigation = useNavigation<Nav>();
  return (
    <View style={s.bar}>
      {tabs.map(({ route, label, Icon }) => {
        const on = activeRoute === route;
        return (
          <TouchableOpacity
            key={route}
            style={s.tab}
            onPress={() => { if (!on) navigation.navigate(route as any); }}
            activeOpacity={0.7}
          >
            <View style={[s.iconWrap, on && s.iconOn]}>
              <Icon on={on} />
            </View>
            <Text style={[s.label, on && s.labelOn]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const s = StyleSheet.create({
  bar:     { flexDirection: 'row', backgroundColor: C.bg, borderTopWidth: 1, borderTopColor: C.border, paddingBottom: 24, paddingTop: 8 },
  tab:     { flex: 1, alignItems: 'center', gap: 4, paddingTop: 4 },
  iconWrap: { width: 44, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  iconOn:  { backgroundColor: C.activeBg },
  label:   { fontSize: 10, color: C.inactive, fontWeight: '500' },
  labelOn: { color: C.active, fontWeight: '700' },
});

export default BottomNavigation;
