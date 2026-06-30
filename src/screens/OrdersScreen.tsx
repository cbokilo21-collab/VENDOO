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
import { useLanguage } from '../contexts/LanguageContext';
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

const getStatusFilters = (t: any) => [
  { key: 'all' as const,        label: t('orders.all') },
  { key: 'pending' as const,    label: t('orders.pending') },
  { key: 'processing' as const, label: t('orders.processing') },
  { key: 'shipped' as const,    label: t('orders.shipped') },
  { key: 'delivered' as const,  label: t('orders.delivered') },
  { key: 'cancelled' as const,  label: t('orders.cancelled') },
];

const OrdersScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  // Fetch orders from Firestore in real-time, filtered by current user
  const { data: orders, loading, error } = useRealtimeCollection<Order>('orders', {
    constraints: user?.uid ? [where('userId', '==', user.uid)] : [],
    enabled: !!user?.uid,
  });

  const filtered = orders.filter((o: Order) => {
    const matchStatus = filter === 'all' || o.status === filter;
    const q = search.toLowerCase();
    const oId = o.orderNumber || o.id || '#0';
    const matchSearch = !q || o.client.toLowerCase().includes(q) || oId.includes(q);
    return matchStatus && matchSearch;
  });

  const stats = {
    total:   orders.length,
    revenue: orders.filter((o: Order) => !['cancelled','refunded'].includes(o.status)).reduce((s: number, o: Order) => s + (o.total || 0), 0),
    pending: orders.filter((o: Order) => o.status === 'pending' || o.status === 'processing').length,
    done:    orders.filter((o: Order) => o.status === 'delivered').length,
  };

  const content = (
    <>
      {/* Error banner */}
      {error && (
        <FadeIn delay={0} style={[st.errorBanner, { backgroundColor: T.errorSoft }]}>
          <Text style={[st.errorText, { color: T.error }]}>⚠ {t('common.error')}: {error}</Text>
        </FadeIn>
      )}

      {/* Page heading */}
      <FadeIn delay={0} style={st.pageHead}>
        <View style={{ flex: 1 }}>
          <View style={st.headerBadgeContainer}>
            <Text style={st.pageTitle}>{t('orders.title')}</Text>
            <View style={st.proBadge}>
              <Text style={st.proBadgeText}>PRO</Text>
            </View>
          </View>
          <Text style={st.pageSub}>
            {loading ? t('common.loading') : `${stats.total} ${t('orders.orders')} · ${(stats.revenue / 1000).toFixed(0)}k F ${t('orders.collected')}`}
          </Text>
        </View>
        <TouchableOpacity style={st.newBtn} onPress={() => navigation.navigate('POS' as any)} activeOpacity={0.85}>
          <Ic d="M12 5v14M5 12h14" s={16} c="#fff" w={2.5} />
          <Text style={st.newBtnText}>{t('orders.newSale')}</Text>
        </TouchableOpacity>
      </FadeIn>

      {/* KPI row */}
      <FadeIn delay={60} style={st.kpiRow}>
        {[
          { label: t('orders.total'), value: stats.total.toString(),              icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2', tint: T.infoSoft,    ink: T.info    },
          { label: t('orders.revenue'), value: `${(stats.revenue/1_000_000).toFixed(1)}M F`, icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6', tint: T.successSoft, ink: T.success },
          { label: t('orders.inProgress'), value: stats.pending.toString(),          icon: 'M12 8v4l3 3M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z', tint: T.warningSoft, ink: T.warning },
          { label: t('orders.delivered'), value: stats.done.toString(),               icon: 'M20 6L9 17l-5-5', tint: T.successSoft, ink: T.success },
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
          placeholder={t('orders.searchPlaceholder')}
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
          {getStatusFilters(t).map(f => {
            const active = filter === f.key;
            const meta = f.key !== 'all' ? ORDER_STATUS_META[f.key as OrderStatus] : null;
            const count = f.key === 'all' ? orders.length : orders.filter((o: Order) => o.status === f.key).length;
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
            <Text style={st.emptyText}>{t('orders.loadingOrders')}</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={st.emptyBox}>
            <Ic d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2" s={32} c={T.muted} />
            <Text style={st.emptyText}>{t('orders.noOrdersFound')}</Text>
            <Text style={st.emptySub}>{t('orders.noOrdersSub')}</Text>
          </View>
        ) : filtered.map((o, i) => {
          const meta = ORDER_STATUS_META[o.status];
          const initials = o.client.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
          const isLast = i === filtered.length - 1;
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
                      <Text style={st.fraudText}>⚠ {t('orders.risk')}</Text>
                    </View>
                  )}
                </View>
                <Text style={st.clientName}>{o.client}</Text>
                <Text style={st.orderMeta}>{o.items?.length ?? 1} {(o.items?.length ?? 1) > 1 ? t('orders.items') : t('orders.item')} · {formattedDate}</Text>
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
  headerBadgeContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pageTitle: { fontSize: 26, fontWeight: '800', color: T.text, letterSpacing: -0.5 },
  proBadge: { backgroundColor: T.orange, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  proBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
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
