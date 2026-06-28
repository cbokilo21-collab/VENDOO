import React, { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  Animated, Easing, Platform, TextInput, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { where } from 'firebase/firestore';
import Svg, { Path, Circle } from 'react-native-svg';
import BottomNavigation from '../components/BottomNavigation';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeCollection } from '../hooks/useRealtimeData';
import { T, shadow, radius } from '../theme';
import { OrderStatus, ORDER_STATUS_META, Order } from '../services/orderService';

type Nav = NativeStackNavigationProp<any>;

const Ic = ({ d, s = 16, c = T.textMid, w = 2 }: { d: string; s?: number; c?: string; w?: number }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"
    stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
    <Path d={d} />
  </Svg>
);

const FadeIn: React.FC<{ delay?: number; children: React.ReactNode; style?: any }> = ({ delay = 0, children, style }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 450, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  return <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>{children}</Animated.View>;
};

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_ORDERS = [
  {
    id: '#1048', orderNumber: '#1048', client: 'Sophie Martin',  email: 'sophie@gmail.com',
    montant: 182_500, total: 182_500, status: 'delivered' as OrderStatus,
    date: '28 juin', items: [{ nom: 'Sneakers ÉL', prix: 60_800, quantity: 3, emoji: '👟' }],
    trackingNumber: 'FR123456789', carrier: 'Colissimo',
    shippingAddress: '12 Rue de la Paix, 75001 Paris', paymentMethod: 'card',
  },
  {
    id: '#1047', orderNumber: '#1047', client: 'Lucas Bernard',  email: 'lucas@gmail.com',
    montant: 340_000, total: 340_000, status: 'processing' as OrderStatus,
    date: '28 juin', items: [{ nom: 'Veste Bomber', prix: 68_000, quantity: 5, emoji: '🧥' }],
    fraudRisk: 'high', paymentMethod: 'cash',
  },
  {
    id: '#1046', client: 'Emma Dubois', email: 'emma@gmail.com',
    montant: 97_000, total: 97_000, status: 'pending' as OrderStatus,
    date: '27 juin', items: [{ nom: 'Sac Cuir', prix: 97_000, quantity: 1, emoji: '👜' }],
    paymentMethod: 'mobile',
  },
  {
    id: '#1045', client: 'Nathan Petit', email: 'nathan@gmail.com',
    montant: 213_200, total: 213_200, status: 'shipped' as OrderStatus,
    date: '26 juin', items: [{ nom: 'Écouteurs BT', prix: 53_300, quantity: 4, emoji: '🎧' }],
    trackingNumber: 'FR987654321', carrier: 'DHL',
    shippingAddress: '45 Av. des Champs, 75008 Paris', paymentMethod: 'card',
  },
  {
    id: '#1044', client: 'Chloé Moreau',  email: 'chloe@gmail.com',
    montant: 455_000, total: 455_000, status: 'paid' as OrderStatus,
    date: '25 juin', items: [{ nom: 'Montre Classique', prix: 65_000, quantity: 7, emoji: '⌚' }],
    paymentMethod: 'card',
  },
  {
    id: '#1043', client: 'Tom Laurent',   email: 'tom@gmail.com',
    montant: 68_000, total: 68_000, status: 'cancelled' as OrderStatus,
    date: '24 juin', items: [{ nom: 'T-Shirt', prix: 34_000, quantity: 2, emoji: '👕' }],
    paymentMethod: 'cash',
  },
];

const STATUS_FILTERS: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all',        label: 'Toutes' },
  { key: 'pending',    label: 'En attente' },
  { key: 'processing', label: 'En cours' },
  { key: 'shipped',    label: 'Expédié' },
  { key: 'delivered',  label: 'Livré' },
  { key: 'cancelled',  label: 'Annulé' },
];

const OrdersScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  // Fetch orders from Firestore in real-time, filtered by current user
  const { data: orders, loading, error } = useRealtimeCollection<Order>('orders', {
    constraints: user?.uid ? [where('userId', '==', user.uid)] : [],
    enabled: !!user?.uid,
  });

  // Fall back to demo if no orders yet
  const displayOrders = orders.length > 0 ? orders : DEMO_ORDERS;

  const filtered = displayOrders.filter(o => {
    const matchStatus = filter === 'all' || o.status === filter;
    const q = search.toLowerCase();
    const oId = (o as any).id || (o as any).orderNumber || '#0';
    const matchSearch = !q || o.client.toLowerCase().includes(q) || oId.includes(q);
    return matchStatus && matchSearch;
  });

  const stats = {
    total:   displayOrders.length,
    revenue: displayOrders.filter(o => !['cancelled','refunded'].includes(o.status)).reduce((s, o) => s + (o.total || (o as any).montant || 0), 0),
    pending: displayOrders.filter(o => o.status === 'pending' || o.status === 'processing').length,
    done:    displayOrders.filter(o => o.status === 'delivered').length,
  };

  const content = (
    <>
      {/* Error banner */}
      {error && (
        <FadeIn delay={0} style={[st.errorBanner, { backgroundColor: T.errorSoft }]}>
          <Text style={[st.errorText, { color: T.error }]}>⚠ Erreur: {error}</Text>
        </FadeIn>
      )}

      {/* Page heading */}
      <FadeIn delay={0} style={st.pageHead}>
        <View style={{ flex: 1 }}>
          <Text style={st.pageTitle}>Commandes</Text>
          <Text style={st.pageSub}>
            {loading ? 'Synchronisation...' : `${stats.total} commandes · ${(stats.revenue / 1000).toFixed(0)}k F encaissés`}
          </Text>
        </View>
        <TouchableOpacity style={st.newBtn} onPress={() => navigation.navigate('POS' as any)} activeOpacity={0.85}>
          <Ic d="M12 5v14M5 12h14" s={16} c="#fff" w={2.5} />
          <Text style={st.newBtnText}>Nouvelle vente</Text>
        </TouchableOpacity>
      </FadeIn>

      {/* KPI row */}
      <FadeIn delay={60} style={st.kpiRow}>
        {[
          { label: 'Total', value: stats.total.toString(),              icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2', tint: T.infoSoft,    ink: T.info    },
          { label: 'Revenus', value: `${(stats.revenue/1_000_000).toFixed(1)}M F`, icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6', tint: T.successSoft, ink: T.success },
          { label: 'En cours', value: stats.pending.toString(),          icon: 'M12 8v4l3 3M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z', tint: T.warningSoft, ink: T.warning },
          { label: 'Livrés', value: stats.done.toString(),               icon: 'M20 6L9 17l-5-5', tint: T.successSoft, ink: T.success },
        ].map((k) => (
          <View key={k.label} style={st.kpi}>
            <View style={[st.kpiIcon, { backgroundColor: k.tint }]}>
              <Ic d={k.icon} s={16} c={k.ink} />
            </View>
            <Text style={st.kpiVal}>{k.value}</Text>
            <Text style={st.kpiLbl}>{k.label}</Text>
          </View>
        ))}
      </FadeIn>

      {/* Search */}
      <FadeIn delay={100} style={st.searchBar}>
        <Ic d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" s={16} c={T.muted} />
        <TextInput
          style={st.searchInput}
          placeholder="Rechercher une commande ou un client…"
          placeholderTextColor={T.muted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ic d="M18 6L6 18M6 6l12 12" s={16} c={T.muted} />
          </TouchableOpacity>
        )}
      </FadeIn>

      {/* Filters */}
      <FadeIn delay={130}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.filterRow}>
          {STATUS_FILTERS.map(f => {
            const active = filter === f.key;
            const meta = f.key !== 'all' ? ORDER_STATUS_META[f.key as OrderStatus] : null;
            const count = f.key === 'all' ? displayOrders.length : displayOrders.filter(o => o.status === f.key).length;
            return (
              <TouchableOpacity
                key={f.key}
                style={[st.chip, active && { backgroundColor: meta?.color ?? T.orange, borderColor: meta?.color ?? T.orange }]}
                onPress={() => setFilter(f.key)}
                activeOpacity={0.8}
              >
                <Text style={[st.chipText, active && { color: '#fff', fontWeight: '700' }]}>{f.label}</Text>
                <View style={[st.chipCount, active && { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                  <Text style={[st.chipCountText, active && { color: '#fff' }]}>{count}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </FadeIn>

      {/* Orders list */}
      <FadeIn delay={160} style={st.listCard}>
        {loading ? (
          <View style={st.emptyBox}>
            <ActivityIndicator size="large" color={T.orange} />
            <Text style={st.emptyText}>Chargement des commandes...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={st.emptyBox}>
            <Ic d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2" s={32} c={T.muted} />
            <Text style={st.emptyText}>Aucune commande trouvée</Text>
            <Text style={st.emptySub}>Modifiez votre filtre ou lancez une nouvelle vente</Text>
          </View>
        ) : filtered.map((o, i) => {
          const meta = ORDER_STATUS_META[o.status];
          const initials = o.client.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
          const isLast = i === filtered.length - 1;
          // Use orderNumber if id is missing (backward compat with demo data)
          const oId = (o as any).id || o.orderNumber || '#0';
          const oTotal = (o as any).total || (o as any).montant || 0;
          const formattedDate = (o as any).date || ((o as any).createdAt ? new Date((o as any).createdAt).toLocaleDateString('fr-FR') : '—');
          return (
            <TouchableOpacity
              key={oId}
              style={[st.row, !isLast && st.rowBorder]}
              onPress={() => navigation.navigate('OrderDetail', { order: o })}
              activeOpacity={0.7}
            >
              <View style={[st.avatar, { backgroundColor: meta.soft }]}>
                <Text style={[st.avatarText, { color: meta.color }]}>{initials}</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={st.orderNum}>{oId}</Text>
                  {o.fraudRisk === 'high' && (
                    <View style={st.fraudPill}>
                      <Text style={st.fraudText}>⚠ Risque</Text>
                    </View>
                  )}
                </View>
                <Text style={st.clientName}>{o.client}</Text>
                <Text style={st.orderMeta}>{o.items?.length ?? 1} article{(o.items?.length ?? 1) > 1 ? 's' : ''} · {formattedDate}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <Text style={st.amount}>{(oTotal / 1000).toFixed(0)}k F</Text>
                <View style={[st.badge, { backgroundColor: meta.soft }]}>
                  <Text style={[st.badgeText, { color: meta.color }]}>{meta.label}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </FadeIn>
    </>
  );

  return (
    <View style={st.root}>
      <ScrollView
        contentContainerStyle={st.scroll}
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>
      {Platform.OS !== 'web' && <BottomNavigation activeRoute="Orders" />}
    </View>
  );
};

const st = StyleSheet.create({
  root:   { flex: 1, backgroundColor: T.page },
  scroll: { padding: 16, paddingTop: Platform.OS === 'ios' ? 56 : 28, gap: 14, paddingBottom: 100 },

  errorBanner: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: radius.md, marginBottom: 8 },
  errorText: { fontSize: 13, fontWeight: '600' },

  pageHead:  { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  pageTitle: { fontSize: 26, fontWeight: '800', color: T.text, letterSpacing: -0.5 },
  pageSub:   { fontSize: 13, color: T.textSub, marginTop: 3 },
  newBtn:    { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: T.orange, paddingHorizontal: 14, height: 40, borderRadius: 11, shadowColor: T.orange, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  newBtnText:{ fontSize: 13, fontWeight: '700', color: '#fff' },

  kpiRow: { flexDirection: 'row', gap: 10 },
  kpi:    { flex: 1, backgroundColor: T.surface, borderRadius: radius.md, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: T.border, ...shadow.card },
  kpiIcon:{ width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  kpiVal: { fontSize: 18, fontWeight: '800', color: T.text },
  kpiLbl: { fontSize: 10, color: T.muted, fontWeight: '600', textAlign: 'center' },

  searchBar:   { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: T.surface, borderRadius: radius.md, paddingHorizontal: 14, height: 46, borderWidth: 1, borderColor: T.border },
  searchInput: { flex: 1, fontSize: 14, color: T.text },

  filterRow: { gap: 8, paddingVertical: 2 },
  chip:      { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: T.surface, borderWidth: 1.5, borderColor: T.border },
  chipText:  { fontSize: 13, color: T.textMid, fontWeight: '500' },
  chipCount: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.pill, backgroundColor: T.page },
  chipCountText: { fontSize: 11, fontWeight: '700', color: T.textSub },

  listCard: { backgroundColor: T.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: T.border, ...shadow.card, overflow: 'hidden' },
  row:      { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  rowBorder:{ borderBottomWidth: 1, borderBottomColor: T.divider },
  avatar:   { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  avatarText:{ fontSize: 14, fontWeight: '800' },
  orderNum: { fontSize: 14, fontWeight: '700', color: T.text },
  clientName:{ fontSize: 13, color: T.textMid },
  orderMeta: { fontSize: 12, color: T.muted },
  amount:   { fontSize: 14, fontWeight: '800', color: T.text },
  badge:    { paddingHorizontal: 9, paddingVertical: 3, borderRadius: radius.pill },
  badgeText:{ fontSize: 11, fontWeight: '700' },
  fraudPill:{ backgroundColor: '#FEF2F2', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  fraudText:{ fontSize: 11, fontWeight: '700', color: '#DC2626' },

  emptyBox: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText:{ fontSize: 16, fontWeight: '700', color: T.textMid },
  emptySub: { fontSize: 13, color: T.muted, textAlign: 'center' },
});

export default OrdersScreen;
