import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Dimensions, Animated, Easing, Modal, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BottomNavigation from '../components/BottomNavigation';
import Svg, { Path, Circle, Rect, G, Line } from 'react-native-svg';
import { aiService } from '../services/AIService';

const C = {
  navy: '#FF6B35', sideMuted: '#64748B',
  bg: '#F6F7F9', surface: '#FFFFFF', border: '#E5E7EB',
  accent: '#FF6B35', textDark: '#111827', textMid: '#374151', textLight: '#6B7280', muted: '#9CA3AF',
  success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6', purple: '#8B5CF6',
  white: '#FFFFFF',
};

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'return_requested' | 'return_approved';
interface Order { 
  id: string; 
  client: string; 
  email: string;
  montant: number; 
  status: OrderStatus; 
  date: string; 
  items: number; 
  fraudRisk?: 'low'|'medium'|'high';
  trackingNumber?: string;
  carrier?: string;
  shippingAddress?: string;
  returnReason?: string;
  refundAmount?: number;
  subscription?: boolean;
  subscriptionId?: string;
}
type RootStackParamList = { BusinessDashboard: undefined; Products: undefined; Orders: undefined; Customers: undefined; Settings: undefined; };
type Nav = NativeStackNavigationProp<RootStackParamList, 'Orders'>;

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  pending:         { label: 'En attente',        color: C.warning },
  processing:      { label: 'En cours',          color: C.info    },
  shipped:         { label: 'Expédié',           color: C.purple  },
  delivered:       { label: 'Livré',             color: C.success },
  cancelled:       { label: 'Annulé',            color: C.error   },
  refunded:        { label: 'Remboursé',         color: C.error   },
  return_requested:{ label: 'Retour demandé',   color: C.warning },
  return_approved: { label: 'Retour approuvé',   color: C.info    },
};

const DashIcon  = ({ a }: { a?: boolean }) => <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={a ? C.white : C.sideMuted} strokeWidth={2}><Path d="M3 3v18h18M18 17V9M13 17V5M8 17v-3" strokeLinecap="round" strokeLinejoin="round"/></Svg>;
const BoxIcon   = ({ a }: { a?: boolean }) => <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={a ? C.white : C.sideMuted} strokeWidth={2}><Path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" strokeLinecap="round" strokeLinejoin="round"/></Svg>;
const ClipIcon  = ({ a }: { a?: boolean }) => <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={a ? C.white : C.sideMuted} strokeWidth={2}><Path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 10h6M9 14h6M9 18h6" strokeLinecap="round" strokeLinejoin="round"/></Svg>;
const UsersIcon = ({ a }: { a?: boolean }) => <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={a ? C.white : C.sideMuted} strokeWidth={2}><Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round"/><Circle cx="9" cy="7" r="4"/></Svg>;
const GearIcon  = ({ a }: { a?: boolean }) => <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={a ? C.white : C.sideMuted} strokeWidth={2}><Circle cx="12" cy="12" r="3"/><Path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" strokeLinecap="round" strokeLinejoin="round"/></Svg>;

const navItems = [
  { key: 'BusinessDashboard', label: 'Dashboard',  Icon: DashIcon  },
  { key: 'Products',          label: 'Produits',   Icon: BoxIcon   },
  { key: 'Orders',            label: 'Commandes',  Icon: ClipIcon  },
  { key: 'Customers',         label: 'Clients',    Icon: UsersIcon },
  { key: 'Settings',          label: 'Paramètres', Icon: GearIcon  },
];

const Sidebar: React.FC<{ active: string; onNav: (s: string) => void }> = ({ active, onNav }) => (
  <View style={s.sidebar}>
    <View style={s.sideLogoRow}>
      <View style={s.logoMark}><Text style={s.logoMarkText}>V</Text></View>
      <Text style={s.logoName}>Vendoo</Text>
    </View>
    <Text style={s.sideSection}>NAVIGATION</Text>
    {navItems.map(({ key, label, Icon }) => {
      const isActive = active === key;
      return (
        <TouchableOpacity key={key} style={[s.navItem, isActive && s.navItemActive]} onPress={() => onNav(key)} activeOpacity={0.7}>
          <Icon a={isActive} />
          <Text style={[s.navLabel, isActive && s.navLabelActive]}>{label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// ─── Animated Card Component ───────────────────────────────────────────────────
const AnimatedCard: React.FC<{ children: React.ReactNode; delay?: number; style?: any }> = ({ children, delay = 0, style }) => {
  const animY = useRef(new Animated.Value(20)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animY, {
        toValue: 0,
        duration: 600,
        delay,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(animOpacity, {
        toValue: 1,
        duration: 500,
        delay,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity: animOpacity, transform: [{ translateY: animY }] }]}>
      {children}
    </Animated.View>
  );
};

const OrdersScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const isDesktop = Dimensions.get('window').width >= 1024;
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders] = useState<Order[]>([
    { id: '#1042', client: 'Sophie Martin',  email: 'sophie@gmail.com', montant: 182, status: 'delivered',  date: '27 juin', items: 3, trackingNumber: 'FR123456789', carrier: 'Colissimo', shippingAddress: '12 Rue de la Paix, 75001 Paris' },
    { id: '#1041', client: 'Lucas Bernard',  email: 'lucas@gmail.com', montant: 340, status: 'processing', date: '27 juin', items: 5, fraudRisk: 'high' },
    { id: '#1040', client: 'Emma Dubois',    email: 'emma@gmail.com', montant:  97, status: 'pending',    date: '26 juin', items: 1 },
    { id: '#1039', client: 'Nathan Petit',   email: 'nathan@gmail.com', montant: 213, status: 'shipped',    date: '25 juin', items: 4, trackingNumber: 'FR987654321', carrier: 'DHL', shippingAddress: '45 Avenue des Champs, 75008 Paris' },
    { id: '#1038', client: 'Chloé Moreau',  email: 'chloe@gmail.com', montant: 455, status: 'delivered',  date: '25 juin', items: 7 },
    { id: '#1037', client: 'Tom Laurent',    email: 'tom@gmail.com', montant:  68, status: 'pending',    date: '24 juin', items: 2 },
  ]);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const goTo = (screen: string) => { if (screen !== 'Orders') navigation.navigate(screen as any); };

  const totalRevenue = orders.reduce((sum, o) => sum + o.montant, 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  const chips: { key: OrderStatus | 'all'; label: string }[] = [
    { key: 'all', label: 'Toutes' },
    { key: 'pending', label: 'En attente' },
    { key: 'processing', label: 'En cours' },
    { key: 'shipped', label: 'Expédié' },
    { key: 'delivered', label: 'Livré' },
  ];

  const statItems = [
    { label: 'Revenu total', value: `€${totalRevenue.toLocaleString()}`, color: C.success, icon: '💰' },
    { label: 'Panier moyen', value: `€${avgOrderValue.toFixed(0)}`, color: C.info, icon: '📊' },
    { label: 'En cours', value: orders.filter(o => o.status === 'processing').length.toString(), color: C.warning, icon: '⏳' },
    { label: 'Livrées', value: orders.filter(o => o.status === 'delivered').length.toString(), color: C.success, icon: '✅' },
  ];

  const content = (
    <ScrollView style={s.content} contentContainerStyle={s.inner} showsVerticalScrollIndicator={false}>
      {/* Header with gradient */}
      <AnimatedCard delay={0} style={s.headerCard}>
        <View style={s.headerTop}>
          <View>
            <Text style={s.pageTitle}>Commandes</Text>
            <Text style={s.pageSubtitle}>{orders.length} commandes au total</Text>
          </View>
          <TouchableOpacity style={s.addOrderBtn}>
            <Text style={s.addOrderBtnText}>+ Nouvelle</Text>
          </TouchableOpacity>
        </View>
      </AnimatedCard>

      {/* Stats with icons */}
      <AnimatedCard delay={50} style={s.statsRow}>
        {statItems.map((st, i) => (
          <View key={i} style={[s.statCard, { borderTopColor: st.color }]}>
            <Text style={s.statIcon}>{st.icon}</Text>
            <Text style={[s.statValue, { color: st.color }]}>{st.value}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
      </AnimatedCard>

      {/* Filters */}
      <AnimatedCard delay={100} style={s.filterScroll}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
          {chips.map(c => (
            <TouchableOpacity key={c.key} style={[s.filterChip, filter === c.key && s.filterChipActive]} onPress={() => setFilter(c.key)}>
              <Text style={[s.filterText, filter === c.key && s.filterTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </AnimatedCard>

      {/* Order list with improved design */}
      <AnimatedCard delay={150} style={s.card}>
        {filtered.map((o, i) => {
          const sc = statusConfig[o.status];
          return (
            <TouchableOpacity 
              key={o.id} 
              style={[s.orderCard, i < filtered.length - 1 && s.rowBorder]} 
              onPress={() => setSelectedOrder(o)}
              activeOpacity={0.7}
            >
              <View style={s.orderCardLeft}>
                <View style={[s.orderAvatar, { backgroundColor: sc.color + '15' }]}>
                  <Text style={[s.orderAvatarText, { color: sc.color }]}>{o.id.replace('#', '')}</Text>
                </View>
                <View style={s.orderInfo}>
                  <View style={s.orderTopRow}>
                    <Text style={s.orderId}>{o.id}</Text>
                    {o.fraudRisk === 'high' && (
                      <View style={s.fraudBadge}><Text style={s.fraudText}>⚠️</Text></View>
                    )}
                  </View>
                  <Text style={s.orderClient}>{o.client}</Text>
                  <Text style={s.orderMeta}>{o.items} article{o.items > 1 ? 's' : ''} · {o.date}</Text>
                </View>
              </View>
              <View style={s.orderCardRight}>
                <Text style={s.orderAmount}>€{o.montant.toFixed(2)}</Text>
                <View style={[s.statusBadge, { backgroundColor: sc.color + '15' }]}>
                  <Text style={[s.statusText, { color: sc.color }]}>{sc.label}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        {filtered.length === 0 && <Text style={s.emptyText}>Aucune commande dans ce filtre.</Text>}
      </AnimatedCard>
    </ScrollView>
  );

  if (isDesktop) {
    return (
      <View style={s.desktop}>
        {Platform.OS !== 'web' && <Sidebar active="Orders" onNav={goTo} />}
        {content}
      </View>
    );
  }

  return (
    <View style={s.mobile}>
      <View style={s.mobileHeader}><Text style={s.mobileTitle}>Commandes</Text></View>
      {content}
      <BottomNavigation activeRoute="Orders" />
    </View>
  );
};

const s = StyleSheet.create({
  desktop: { flex: 1, flexDirection: 'row', backgroundColor: C.bg },
  mobile:  { flex: 1, backgroundColor: C.bg },

  sidebar:        { width: 240, backgroundColor: C.accent, paddingVertical: 28, paddingHorizontal: 16 },
  sideLogoRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, marginBottom: 32 },
  logoMark:       { width: 32, height: 32, borderRadius: 7, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  logoMarkText:   { color: C.white, fontSize: 16, fontWeight: '800' },
  logoName:       { fontSize: 18, fontWeight: '700', color: C.white },
  sideSection:    { fontSize: 10, fontWeight: '700', color: C.sideMuted, letterSpacing: 1.4, paddingHorizontal: 8, marginBottom: 8 },
  navItem:        { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, paddingVertical: 10, borderRadius: 8, marginBottom: 2 },
  navItemActive:  { backgroundColor: 'rgba(255,255,255,0.08)' },
  navLabel:       { fontSize: 14, color: C.sideMuted, fontWeight: '500' },
  navLabelActive: { color: C.white, fontWeight: '600' },

  content:     { flex: 1 },
  inner:       { padding: 28, gap: 16, paddingBottom: 60 },
  pageHeader:  { marginBottom: 4 },
  pageTitle:   { fontSize: 24, fontWeight: '800', color: C.textDark, marginBottom: 3 },
  pageSubtitle:{ fontSize: 14, color: C.textLight },
  mobileHeader:{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border },
  mobileTitle: { fontSize: 22, fontWeight: '800', color: C.textDark },

  // Header card
  headerCard: { backgroundColor: C.surface, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addOrderBtn: { backgroundColor: C.accent, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, shadowColor: C.accent, shadowOpacity: 0.28, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  addOrderBtnText: { color: C.white, fontSize: 14, fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 16, borderTopWidth: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, alignItems: 'center' },
  statIcon: { fontSize: 24, marginBottom: 4 },
  statValue:{ fontSize: 20, fontWeight: '800', marginBottom: 2 },
  statLabel:{ fontSize: 11, color: C.textLight, fontWeight: '500' },

  filterScroll: { flexGrow: 0 },
  filterRow:    { gap: 8, paddingVertical: 2 },
  filterChip:        { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border },
  filterChipActive:  { backgroundColor: C.accent, borderColor: C.accent },
  filterText:        { fontSize: 13, color: C.textMid, fontWeight: '500' },
  filterTextActive:  { color: C.white, fontWeight: '600' },

  card:    { backgroundColor: C.surface, borderRadius: 14, padding: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 },
  orderRow:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  rowBorder:    { borderBottomWidth: 1, borderBottomColor: C.border },
  orderMain:    { flex: 1, gap: 3 },
  orderTopRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  orderId:      { fontSize: 14, fontWeight: '700', color: C.textDark },
  fraudBadge:   { backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  fraudText:    { fontSize: 11, fontWeight: '700', color: C.error },
  orderClient:  { fontSize: 13, color: C.textMid },
  orderMeta:    { fontSize: 12, color: C.muted },
  orderRight:   { alignItems: 'flex-end', gap: 6 },
  orderAmount:  { fontSize: 15, fontWeight: '800', color: C.textDark },
  statusBadge:  { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  statusText:   { fontSize: 11, fontWeight: '600' },
  emptyText:    { textAlign: 'center', color: C.muted, fontSize: 14, paddingVertical: 24 },

  // Improved order card styles
  orderCard: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: C.bg, borderRadius: 12, margin: 4 },
  orderCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  orderAvatar: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  orderAvatarText: { fontSize: 14, fontWeight: '800' },
  orderInfo: { flex: 1 },
  orderCardRight: { alignItems: 'flex-end', gap: 6 },
});

export default OrdersScreen;
