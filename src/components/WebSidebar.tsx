import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

const C = {
  bg:         '#FFFFFF',
  surface:    '#FFF7F3',
  border:     '#FFE0D0',
  orange:     '#FF6B35',
  orangeFade: 'rgba(255,107,53,0.15)',
  white:      '#FFFFFF',
  muted:      '#9CA3AF',
  faint:      '#F3F4F6',
  groupLabel: '#FF8C5A',
  textDark:   '#111827',
};

type Nav = NativeStackNavigationProp<any>;

// ── Icons (SVG) ───────────────────────────────────────────────────────────────
const I = (p: { d: string; size?: number; color?: string }) => (
  <Svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none"
    stroke={p.color || C.muted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <Path d={p.d} />
  </Svg>
);

const IHome      = (c: string) => <I color={c} d="M3 3v18h18M18 17V9M13 17V5M8 17v-3" />;
const IBox       = (c: string) => <I color={c} d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12l8.73-5.04M12 22V12" />;
const IClip      = (c: string) => <I color={c} d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 10h6M9 14h6" />;
const IUsers     = (c: string) => <I color={c} d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />;
const IMessage   = (c: string) => <I color={c} d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />;
const IGear      = (c: string) => <I color={c} d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.51a2 2 0 0 1 1-1.72l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />;
const IPOS       = (c: string) => <I color={c} d="M2 3h20v14H2zM8 21h8M12 17v4" />;
const IChart     = (c: string) => <I color={c} d="M3 3v18h18M18 17V9M13 17V5M8 17v-3" />;
const IMegaphone = (c: string) => <I color={c} d="M3 11l19-9-9 19-2-8-8-2z" />;
const IReceipt   = (c: string) => <I color={c} d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" />;
const IMoney     = (c: string) => <I color={c} d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />;
const IPaint     = (c: string) => <I color={c} d="M2 13.5V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5.5M12 2L2 7l10 5 10-5-10-5z" />;
const IShop      = (c: string) => <I color={c} d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" />;
const ISparkle   = (c: string) => <I color={c} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />;
const ICard      = (c: string) => <I color={c} d="M1 4h22v16H1zM1 10h22" />;
const IHeart     = (c: string) => <I color={c} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />;
const IMap       = (c: string) => <I color={c} d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v16M16 6v16" />;
const IBook      = (c: string) => <I color={c} d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z" />;
const IBell      = (c: string) => <I color={c} d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />;
const IStore     = (c: string) => <I color={c} d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10" />;
const IBriefcase = (c: string) => <I color={c} d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />;
const ITheme     = (c: string) => <I color={c} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />;
const IEye       = (c: string) => <I color={c} d="M1 12s4-8 11-8 11 8 11 8 11 8-4 8-11 8-11-8-11-8z" />;
const ILogout    = (c: string) => <I color={c} d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />;

// ── Nav groups ────────────────────────────────────────────────────────────────
const GROUPS = [
  {
    label: 'PRINCIPAL',
    items: [
      { route: 'BusinessDashboard', label: 'Tableau de bord', icon: IHome },
      { route: 'Products',          label: 'Produits',        icon: IBox  },
      { route: 'Orders',            label: 'Commandes',       icon: IClip },
      { route: 'Customers',         label: 'Clients',         icon: IUsers },
      { route: 'Messages',          label: 'Messages',        icon: IMessage },
    ],
  },
  {
    label: 'VENTES & OUTILS',
    items: [
      { route: 'POS',              label: 'Caisse (POS)',  icon: IPOS       },
      { route: 'Analytics',        label: 'Analytics',    icon: IChart      },
      { route: 'Marketing',        label: 'Marketing',    icon: IMegaphone  },
      { route: 'Billing',          label: 'Facturation',  icon: IReceipt    },
      { route: 'Receivables',      label: 'Créances',     icon: IMoney      },
    ],
  },
  {
    label: 'BOUTIQUE',
    items: [
      { route: 'ThemeSelection',     label: 'Constructeur de thème', icon: ITheme },
      { route: 'BoutiqueAppearance', label: 'Apparence',        icon: IPaint },
      { route: 'VendooShop',         label: 'Vendoo Shop',      icon: IShop  },
      { route: 'PaymentSettings',    label: 'Paiements',        icon: ICard  },
      { route: 'Sponsorship',        label: 'Parrainage',       icon: IHeart },
    ],
  },
  {
    label: 'SITE E-COMMERCE',
    items: [
      { route: 'ThemeSitePreview',   label: 'Voir mon site', icon: IEye },
    ],
  },
  {
    label: 'IA ARGENTIQUE',
    items: [
      { route: 'AIAgentique', label: 'IA Argentique', icon: ISparkle },
    ],
  },
  {
    label: 'COMMUNAUTÉ',
    items: [
      { route: 'QuartierScreen',   label: 'Quartier',   icon: IMap  },
      { route: 'BoutiqueCatalog',  label: 'Catalogue',  icon: IBook },
    ],
  },
  {
    label: 'GESTION',
    items: [
      { route: 'Notifications',      label: 'Notifications',     icon: IBell      },
      { route: 'BoutiqueManagement', label: 'Gestion boutique',  icon: IStore     },
      { route: 'CaseManagement',     label: 'Affaires',          icon: IBriefcase },
      { route: 'Settings',           label: 'Réglages',          icon: IGear      },
    ],
  },
];

interface Props { activeRoute: string; onLogout?: () => void; }

const WebSidebar: React.FC<Props> = ({ activeRoute, onLogout }) => {
  const navigation = useNavigation<Nav>();

  return (
    <View style={s.sidebar}>
      {/* Logo */}
      <View style={s.logoRow}>
        <View style={s.logoBadge}>
          <Text style={s.logoV}>V</Text>
        </View>
        <View>
          <Text style={s.logoName}>Vendoo</Text>
          <Text style={s.logoSub}>Business</Text>
        </View>
      </View>

      {/* Nav */}
      <ScrollView style={s.nav} showsVerticalScrollIndicator={false}>
        {GROUPS.map(group => (
          <View key={group.label} style={s.group}>
            <Text style={s.groupLabel}>{group.label}</Text>
            {group.items.map(({ route, label, icon }) => {
              const active = activeRoute === route;
              const color = active ? C.orange : C.muted;
              return (
                <TouchableOpacity
                  key={route}
                  style={[s.item, active && s.itemActive]}
                  onPress={() => navigation.navigate(route as any)}
                  activeOpacity={0.7}
                >
                  <View style={s.iconWrap}>{icon(color)}</View>
                  <Text style={[s.itemLabel, active && s.itemLabelActive]}>{label}</Text>
                  {active && <View style={s.activePill} />}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Footer */}
      <View style={s.footer}>
        <View style={s.footerUser}>
          <View style={s.footerAvatar}>
            <Text style={s.footerAvatarTxt}>CB</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.footerName}>Cyril B.</Text>
            <Text style={s.footerRole}>Admin</Text>
          </View>
        </View>
        {onLogout && (
          <TouchableOpacity style={s.logoutBtn} onPress={onLogout} activeOpacity={0.7}>
            {ILogout(C.muted)}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  sidebar:        { width: 230, backgroundColor: C.bg, borderRightWidth: 1, borderRightColor: C.border, flexDirection: 'column' },
  logoRow:        { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  logoBadge:      { width: 36, height: 36, borderRadius: 10, backgroundColor: C.orange, alignItems: 'center', justifyContent: 'center' },
  logoV:          { color: '#fff', fontWeight: '900', fontSize: 20 },
  logoName:       { color: '#111827', fontWeight: '800', fontSize: 16 },
  logoSub:        { color: C.muted, fontSize: 11, fontWeight: '500' },
  nav:            { flex: 1, paddingTop: 8 },
  group:          { marginBottom: 4 },
  groupLabel:     { fontSize: 10, fontWeight: '700', color: C.groupLabel, paddingHorizontal: 16, paddingVertical: 8, letterSpacing: 0.8 },
  item:           { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 9, marginHorizontal: 8, borderRadius: 10, position: 'relative' },
  itemActive:     { backgroundColor: C.orangeFade },
  iconWrap:       { width: 20, alignItems: 'center' },
  itemLabel:      { fontSize: 13, color: C.muted, fontWeight: '500', flex: 1 },
  itemLabelActive:{ color: C.orange, fontWeight: '700' },
  activePill:     { width: 3, height: 16, borderRadius: 2, backgroundColor: C.orange, position: 'absolute', right: 0 },
  footer:         { borderTopWidth: 1, borderTopColor: C.border, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerUser:     { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  footerAvatar:   { width: 32, height: 32, borderRadius: 8, backgroundColor: C.orange, alignItems: 'center', justifyContent: 'center' },
  footerAvatarTxt:{ color: '#fff', fontWeight: '800', fontSize: 12 },
  footerName:     { color: '#111827', fontSize: 13, fontWeight: '700' },
  footerRole:     { color: C.muted, fontSize: 11 },
  logoutBtn:      { padding: 6 },
});

export default WebSidebar;
