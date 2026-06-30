import React, { useState } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput,
  Image, Platform, Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle } from 'react-native-svg';
import { where } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeCollection } from '../hooks/useRealtimeData';
import { T } from '../theme';
import VerifiedBadge from '../components/VerifiedBadge';
import UserAvatar from '../components/UserAvatar';

const isWeb = Platform.OS === 'web';
type Nav = NativeStackNavigationProp<any>;

const fmtF = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M F` :
  n >= 1_000     ? `${(n / 1_000).toFixed(0)}k F`     :
  `${Math.round(n)} F`;

const Ic = ({ d, s = 20, c = T.textMid, w = 2 }: { d: string; s?: number; c?: string; w?: number }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
    <Path d={d} />
  </Svg>
);

// ─── Districts shown on the discovery rail (consistent Paris theme) ──────────────
const DISTRICTS = [
  { name: 'Le Marais',      tag: 'Mode & Concept',   stores: 48, color: T.orange },
  { name: 'Saint-Germain',  tag: 'Luxe & Beauté',    stores: 36, color: T.violet },
  { name: 'Bastille',       tag: 'Déco & Artisanat', stores: 52, color: T.success },
  { name: 'Montmartre',     tag: 'Art & Vintage',    stores: 41, color: T.info },
];

const BuyerDashboard: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  // Marketplace = every product from every boutique (not filtered by the buyer).
  const { data: products, loading } = useRealtimeCollection<any>('products', { enabled: true });
  // The buyer's own orders (purchase history), keyed by buyerId.
  // Empty until the buyer checkout flow writes orders with a buyerId.
  const { data: orders } = useRealtimeCollection<any>('orders', {
    constraints: user?.uid ? [where('buyerId', '==', user.uid)] : [],
    enabled: !!user?.uid,
  });

  const firstName = (user?.displayName || user?.email?.split('@')[0] || 'Utilisateur')
    .replace(/^\w/, (c) => c.toUpperCase());
  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir';
  })();

  const featured = products.slice(0, 8);
  const totalSpent = orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);

  const stats = [
    { label: 'Commandes',  value: String(orders.length),        icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 10h6M9 14h6', tint: T.orangeSoft,  ink: T.orange,  route: 'MyOrders' },
    { label: 'Favoris',    value: '0',                          icon: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z', tint: T.errorSoft,   ink: T.error,   route: 'Favorites' },
    { label: 'Dépenses',   value: fmtF(totalSpent),             icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6', tint: T.successSoft, ink: T.success, route: 'Spending' },
    { label: 'Boutiques',  value: String(new Set(products.map((p: any) => p.boutique_id || p.userId)).size), icon: 'M3 9l1-5h16l1 5M4 9v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M3 9h18', tint: T.violetSoft,  ink: T.violet,  route: 'Marketplace' },
  ];

  const quickActions = [
    { label: 'Explorer',      sub: 'Tous les produits',  icon: 'M3 3h18v18H3zM3 9h18M9 9v12', tint: T.orange,  route: 'Marketplace' },
    { label: 'Les quartiers', sub: 'Boutiques de quartier', icon: 'M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v16M16 6v16', tint: T.violet,  route: 'CountrySelection' },
    { label: 'Mes commandes', sub: 'Suivi & historique', icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2', tint: T.success, route: 'MyOrders' },
    { label: 'Messages',      sub: 'Vos échanges',       icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', tint: T.info,    route: 'Messages' },
  ];

  const submitSearch = () => {
    navigation.navigate('Marketplace', { query: search.trim() || undefined });
  };

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Profile Header (White) ─────────────────────────────────────────── */}
        <View style={s.profileHeader}>
          <TouchableOpacity onPress={() => navigation.navigate('Settings' as any)} activeOpacity={0.7}>
            <UserAvatar 
              name={firstName} 
              gender="other" 
              size={56} 
              showVerified={false} 
            />
          </TouchableOpacity>
          <View style={s.profileTextContainer}>
            <Text style={s.profileName}>{greeting}, {firstName} 👋</Text>
          </View>
        </View>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <View style={s.hero}>
          <View style={s.heroGlow} />
          <Text style={s.heroTitle}>Que cherchez-vous{'\n'}aujourd'hui ?</Text>
          <View style={s.searchBar}>
            <Ic d="M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" s={18} c={T.muted} />
            <TextInput
              style={s.searchInput}
              placeholder="Rechercher un produit, une boutique…"
              placeholderTextColor={T.muted}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={submitSearch}
              returnKeyType="search"
            />
            <TouchableOpacity style={s.searchBtn} onPress={submitSearch} activeOpacity={0.85}>
              <Text style={s.searchBtnText}>Explorer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Stats ────────────────────────────────────────────────────────── */}
        <View style={s.statRow}>
          {stats.map((k) => (
            <TouchableOpacity key={k.label} style={s.statCard} activeOpacity={0.85}
              onPress={() => navigation.navigate(k.route as any)}>
              <View style={[s.statIcon, { backgroundColor: k.tint }]}>
                <Ic d={k.icon} s={18} c={k.ink} />
              </View>
              <Text style={s.statValue}>{k.value}</Text>
              <Text style={s.statLabel}>{k.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Quick actions ────────────────────────────────────────────────── */}
        <View style={s.quickRow}>
          {quickActions.map((a) => (
            <TouchableOpacity key={a.label} style={s.quickCard} activeOpacity={0.85}
              onPress={() => navigation.navigate(a.route as any)}>
              <View style={[s.quickIcon, { backgroundColor: a.tint }]}>
                <Ic d={a.icon} s={20} c="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.quickLabel}>{a.label}</Text>
                <Text style={s.quickSub}>{a.sub}</Text>
              </View>
              <Ic d="M9 18l6-6-6-6" s={18} c={T.muted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Discover products ────────────────────────────────────────────── */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>À découvrir</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Marketplace' as any)}>
              <Text style={s.seeAll}>Tout voir →</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <Text style={s.muted}>Chargement des produits…</Text>
          ) : featured.length === 0 ? (
            <View style={s.emptyCard}>
              <Ic d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" s={32} c={T.muted} />
              <Text style={s.emptyText}>Aucun produit pour le moment</Text>
              <Text style={s.emptySub}>Les boutiques publient bientôt leur catalogue.</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.productRail}>
              {featured.map((p: any) => (
                <TouchableOpacity key={p.id} style={s.productCard} activeOpacity={0.85}
                  onPress={() => navigation.navigate('Marketplace' as any)}>
                  <View style={[s.productImg, { backgroundColor: p.couleur || T.surfaceAlt }]}>
                    {p.imageUri ? (
                      <Image source={{ uri: p.imageUri }} style={s.productImgInner} resizeMode="cover" />
                    ) : (
                      <Ic d="M3 9a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.66-.9l.82-1.2A2 2 0 0 1 10.07 4h3.86a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" s={26} c={T.muted} />
                    )}
                  </View>
                  <Text style={s.productName} numberOfLines={1}>{p.nom || 'Produit'}</Text>
                  <Text style={s.productPrice}>{fmtF(p.prix || 0)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* ── Districts ────────────────────────────────────────────────────── */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Quartiers populaires</Text>
            <TouchableOpacity onPress={() => navigation.navigate('QuartierScreen' as any)}>
              <Text style={s.seeAll}>Carte →</Text>
            </TouchableOpacity>
          </View>
          <View style={s.districtList}>
            {DISTRICTS.map((d) => (
              <TouchableOpacity key={d.name} style={s.districtCard} activeOpacity={0.85}
                onPress={() => navigation.navigate('QuartierScreen' as any)}>
                <View style={[s.districtBadge, { backgroundColor: d.color + '1A' }]}>
                  <Ic d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" s={18} c={d.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.districtName}>{d.name}</Text>
                  <Text style={s.districtTag}>{d.tag}</Text>
                </View>
                <View style={s.districtCountWrap}>
                  <Text style={s.districtCount}>{d.stores}</Text>
                  <Text style={s.districtCountLbl}>boutiques</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Recent orders ────────────────────────────────────────────────── */}
        <View style={[s.section, { marginBottom: 40 }]}>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Mes commandes récentes</Text>
            {orders.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('MyOrders' as any)}>
                <Text style={s.seeAll}>Tout voir →</Text>
              </TouchableOpacity>
            )}
          </View>
          {orders.length === 0 ? (
            <View style={s.emptyCard}>
              <Text style={s.emptyEmoji}>🛍️</Text>
              <Text style={s.emptyText}>Aucune commande pour l'instant</Text>
              <Text style={s.emptySub}>Découvrez les boutiques et passez votre première commande.</Text>
              <TouchableOpacity style={s.emptyCta} activeOpacity={0.85}
                onPress={() => navigation.navigate('Marketplace' as any)}>
                <Text style={s.emptyCtaText}>Explorer le marketplace</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={s.orderList}>
              {orders.slice(0, 4).map((o: any, i: number) => (
                <TouchableOpacity key={o.id || i} style={[s.orderRow, i > 0 && s.orderBorder]} activeOpacity={0.8}
                  onPress={() => navigation.navigate('MyOrders' as any)}>
                  <View style={s.orderIcon}><Text style={{ fontSize: 18 }}>📦</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.orderTitle}>{o.orderNumber || `Commande`}</Text>
                    <Text style={s.orderSub}>{o.client || 'Boutique'} · {(o.items?.length ?? 1)} article(s)</Text>
                  </View>
                  <Text style={s.orderAmount}>{fmtF(o.total || 0)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const CARD_MAX = 1100;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.page },
  scroll: { padding: isWeb ? 28 : 16, paddingTop: Platform.OS === 'ios' ? 56 : 24, gap: 18, alignItems: 'center' },

  // Profile Header (White)
  profileHeader: { width: '100%', maxWidth: CARD_MAX, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: T.surface, borderRadius: 16, padding: isWeb ? 20 : 16, borderWidth: 1, borderColor: T.border, marginBottom: 18 },
  profileTextContainer: { flexDirection: 'column', gap: 4 },
  profileName: { fontSize: 16, fontWeight: '700', color: T.text },

  // Hero
  hero: { width: '100%', maxWidth: CARD_MAX, backgroundColor: '#1A1206', borderRadius: 22, padding: isWeb ? 32 : 22, overflow: 'hidden' },
  heroGlow: { position: 'absolute', top: -60, right: -40, width: 220, height: 220, borderRadius: 110, backgroundColor: T.orange, opacity: 0.22 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroTitle: { color: '#fff', fontSize: isWeb ? 32 : 26, fontWeight: '800', lineHeight: isWeb ? 38 : 32, marginBottom: 20, letterSpacing: -0.5 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 14, paddingLeft: 14, paddingRight: 6, height: 52 },
  searchInput: { flex: 1, fontSize: 15, color: T.text, ...(isWeb ? { outlineStyle: 'none' } as any : {}) },
  searchBtn: { backgroundColor: T.orange, paddingHorizontal: 18, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Stats
  statRow: { width: '100%', maxWidth: CARD_MAX, flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  statCard: { flex: 1, minWidth: 140, backgroundColor: T.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: T.border, gap: 8 },
  statIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: T.text },
  statLabel: { fontSize: 12.5, color: T.textSub, fontWeight: '600' },

  // Quick actions
  quickRow: { width: '100%', maxWidth: CARD_MAX, flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  quickCard: { flexBasis: isWeb ? '48%' : '100%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: T.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: T.border },
  quickIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 15, fontWeight: '700', color: T.text },
  quickSub: { fontSize: 12.5, color: T.textSub, marginTop: 1 },

  // Sections
  section: { width: '100%', maxWidth: CARD_MAX, gap: 14 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: T.text, letterSpacing: -0.3 },
  seeAll: { fontSize: 13, fontWeight: '700', color: T.orange },
  muted: { fontSize: 13, color: T.muted },

  // Product rail
  productRail: { gap: 14, paddingRight: 8, paddingBottom: 4 },
  productCard: { width: 150 },
  productImg: { width: 150, height: 150, borderRadius: 14, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 8 },
  productImgInner: { width: '100%', height: '100%' },
  productName: { fontSize: 13.5, fontWeight: '600', color: T.text },
  productPrice: { fontSize: 14, fontWeight: '800', color: T.orange, marginTop: 2 },

  // Districts
  districtList: { gap: 10 },
  districtCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: T.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: T.border },
  districtBadge: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  districtName: { fontSize: 15, fontWeight: '700', color: T.text },
  districtTag: { fontSize: 12.5, color: T.textSub, marginTop: 1 },
  districtCountWrap: { alignItems: 'flex-end' },
  districtCount: { fontSize: 16, fontWeight: '800', color: T.text },
  districtCountLbl: { fontSize: 11, color: T.muted },

  // Orders
  orderList: { backgroundColor: T.surface, borderRadius: 16, borderWidth: 1, borderColor: T.border, overflow: 'hidden' },
  orderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  orderBorder: { borderTopWidth: 1, borderTopColor: T.divider },
  orderIcon: { width: 40, height: 40, borderRadius: 11, backgroundColor: T.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  orderTitle: { fontSize: 14, fontWeight: '700', color: T.text },
  orderSub: { fontSize: 12.5, color: T.textSub, marginTop: 1 },
  orderAmount: { fontSize: 14, fontWeight: '800', color: T.text },

  // Empty states
  emptyCard: { backgroundColor: T.surface, borderRadius: 16, borderWidth: 1, borderColor: T.border, padding: 28, alignItems: 'center', gap: 8 },
  emptyEmoji: { fontSize: 40, marginBottom: 4 },
  emptyText: { fontSize: 15, fontWeight: '700', color: T.textMid },
  emptySub: { fontSize: 13, color: T.muted, textAlign: 'center' },
  emptyCta: { marginTop: 12, backgroundColor: T.orange, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  emptyCtaText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});

export default BuyerDashboard;
