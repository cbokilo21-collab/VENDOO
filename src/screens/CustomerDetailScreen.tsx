import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle } from 'react-native-svg';
import { T, shadow, radius } from '../theme';
import { ORDER_STATUS_META } from '../services/orderService';

type Nav = NativeStackNavigationProp<any>;

const Ic = ({ d, s = 18, c = T.textMid, w = 2 }: { d: string; s?: number; c?: string; w?: number }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"
    stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
    <Path d={d} />
  </Svg>
);

const SEGMENT_META = {
  vip:     { label: 'VIP',      color: '#7C3AED', soft: '#F5F3FF', icon: '👑' },
  fidele:  { label: 'Fidèle',   color: '#2563EB', soft: '#EFF6FF', icon: '⭐' },
  nouveau: { label: 'Nouveau',  color: '#16A34A', soft: '#ECFDF5', icon: '🌱' },
  inactif: { label: 'Inactif',  color: '#94A3B8', soft: '#F1F5F9', icon: '💤' },
};

const DEMO_ORDERS_BY_CLIENT: Record<string, any[]> = {
  'Sophie Martin': [
    { id: '#1048', montant: 182_500, status: 'delivered', date: '28 juin', items: 3 },
    { id: '#1032', montant:  97_000, status: 'delivered', date: '15 juin', items: 1 },
  ],
  'Lucas Bernard': [
    { id: '#1047', montant: 340_000, status: 'processing', date: '28 juin', items: 5 },
  ],
  'Emma Dubois': [
    { id: '#1046', montant: 97_000,  status: 'pending',   date: '27 juin', items: 1 },
    { id: '#1022', montant: 45_000,  status: 'delivered', date: '2 juin',  items: 2 },
    { id: '#1010', montant: 120_000, status: 'delivered', date: '20 mai',  items: 4 },
  ],
};

const CustomerDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<{ CustomerDetail: { customer: any } }, 'CustomerDetail'>>();
  const customer = route.params?.customer;
  const [activeTab, setActiveTab] = useState<'orders' | 'insights'>('orders');

  if (!customer) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: T.page }}>
        <Text style={{ color: T.muted }}>Client introuvable.</Text>
      </View>
    );
  }

  const seg = SEGMENT_META[customer.segment as keyof typeof SEGMENT_META] ?? SEGMENT_META.nouveau;
  const initials = customer.nom.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  const clientOrders = DEMO_ORDERS_BY_CLIENT[customer.nom] ?? [];
  const ltv = customer.total ?? clientOrders.reduce((s: number, o: any) => s + o.montant, 0);
  const avgCart = clientOrders.length ? ltv / clientOrders.length : 0;

  const AVATAR_COLORS = [T.orange, T.info, T.success, '#7C3AED', T.warning];
  const avatarColor = AVATAR_COLORS[customer.nom.charCodeAt(0) % AVATAR_COLORS.length];

  return (
    <View style={st.root}>
      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity style={st.backBtn} onPress={() => navigation.goBack()}>
          <Ic d="M19 12H5M12 19l-7-7 7-7" s={20} c={T.text} />
        </TouchableOpacity>
        <Text style={st.headerTitle}>Profil client</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        {/* Client card */}
        <View style={st.profileCard}>
          <View style={[st.avatarLg, { backgroundColor: avatarColor + '20' }]}>
            <Text style={[st.avatarLgText, { color: avatarColor }]}>{initials}</Text>
          </View>
          <Text style={st.clientName}>{customer.nom}</Text>
          <Text style={st.clientEmail}>{customer.email}</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, justifyContent: 'center' }}>
            <View style={[st.segBadge, { backgroundColor: seg.soft }]}>
              <Text style={{ fontSize: 14 }}>{seg.icon}</Text>
              <Text style={[st.segText, { color: seg.color }]}>{seg.label}</Text>
            </View>
            {customer.phone && (
              <View style={[st.segBadge, { backgroundColor: T.page }]}>
                <Ic d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.61a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" s={14} c={T.textSub} />
                <Text style={[st.segText, { color: T.textSub }]}>{customer.phone}</Text>
              </View>
            )}
          </View>
        </View>

        {/* KPIs */}
        <View style={st.kpiRow}>
          {[
            { label: 'Commandes',   value: (customer.commandes ?? clientOrders.length).toString(),  icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2', tint: T.infoSoft,    ink: T.info    },
            { label: 'LTV',         value: `${(ltv / 1000).toFixed(0)}k F`,                         icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6', tint: T.successSoft, ink: T.success },
            { label: 'Panier moy.', value: `${(avgCart / 1000).toFixed(0)}k F`,                     icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z', tint: T.orangeSoft,  ink: T.orange  },
            { label: 'Dernier achat',value: customer.dernierAchat ?? '—',                            icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z', tint: T.violetSoft,  ink: '#7C3AED' },
          ].map(k => (
            <View key={k.label} style={st.kpi}>
              <View style={[st.kpiIcon, { backgroundColor: k.tint }]}>
                <Ic d={k.icon} s={15} c={k.ink} />
              </View>
              <Text style={st.kpiVal}>{k.value}</Text>
              <Text style={st.kpiLbl}>{k.label}</Text>
            </View>
          ))}
        </View>

        {/* Tabs */}
        <View style={st.tabRow}>
          {(['orders', 'insights'] as const).map(t => (
            <TouchableOpacity
              key={t}
              style={[st.tab, activeTab === t && st.tabActive]}
              onPress={() => setActiveTab(t)}
              activeOpacity={0.8}
            >
              <Text style={[st.tabText, activeTab === t && st.tabTextActive]}>
                {t === 'orders' ? '📦 Commandes' : '💡 Insights IA'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Orders tab */}
        {activeTab === 'orders' && (
          <View style={st.card}>
            {clientOrders.length === 0 ? (
              <View style={st.empty}>
                <Ic d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" s={28} c={T.muted} />
                <Text style={st.emptyText}>Aucune commande enregistrée</Text>
              </View>
            ) : clientOrders.map((o, i) => {
              const meta = ORDER_STATUS_META[o.status as keyof typeof ORDER_STATUS_META];
              const isLast = i === clientOrders.length - 1;
              return (
                <TouchableOpacity
                  key={o.id}
                  style={[st.oRow, !isLast && st.oBorder]}
                  onPress={() => navigation.navigate('OrderDetail', { order: { ...o, client: customer.nom, email: customer.email } })}
                  activeOpacity={0.7}
                >
                  <View style={[st.oDot, { backgroundColor: meta.soft }]}>
                    <Text style={[{ fontSize: 12, fontWeight: '800', color: meta.color }]}>{o.id.slice(1)}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={st.oId}>{o.id}</Text>
                    <Text style={st.oMeta}>{o.items} article{o.items > 1 ? 's' : ''} · {o.date}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text style={st.oAmt}>{(o.montant / 1000).toFixed(0)}k F</Text>
                    <View style={[st.badge, { backgroundColor: meta.soft }]}>
                      <Text style={[st.badgeText, { color: meta.color }]}>{meta.label}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Insights tab */}
        {activeTab === 'insights' && (
          <View style={st.insightsWrap}>
            <View style={[st.insightCard, { backgroundColor: seg.soft, borderColor: seg.color + '30' }]}>
              <Text style={[st.insightTitle, { color: seg.color }]}>{seg.icon} Profil {seg.label}</Text>
              <Text style={st.insightText}>
                {customer.segment === 'vip'
                  ? `${customer.nom} génère ${(ltv / 1000).toFixed(0)}k F de revenus. Proposez-lui un accès VIP exclusif ou des remises personnalisées pour maintenir sa fidélité.`
                  : customer.segment === 'fidele'
                  ? `Client régulier avec ${customer.commandes ?? clientOrders.length} commandes. Lancez un programme de fidélité pour le faire progresser vers le statut VIP.`
                  : customer.segment === 'inactif'
                  ? `Inactif depuis ${customer.dernierAchat ?? '—'}. Envoyez une offre de réengagement avec une réduction exclusive pour le faire revenir.`
                  : `Nouveau client avec ${customer.commandes ?? clientOrders.length} commande(s). Proposez une réduction de bienvenue sur la prochaine commande.`}
              </Text>
            </View>

            {[
              { title: '📊 Comportement d\'achat', text: `Panier moyen : ${(avgCart / 1000).toFixed(0)}k F. Catégories préférées : Mode, Accessoires. Fréquence d\'achat : ${clientOrders.length > 2 ? 'régulière' : 'occasionnelle'}.` },
              { title: '🎯 Actions recommandées', text: customer.segment === 'inactif' ? 'Envoyez un email de réactivation. Proposez une promotion -15% valable 7 jours.' : 'Envoyez une newsletter avec les nouveaux produits. Invitez à rejoindre le programme de fidélité.' },
            ].map((ins, i) => (
              <View key={i} style={st.insightCard}>
                <Text style={st.insightTitle}>{ins.title}</Text>
                <Text style={st.insightText}>{ins.text}</Text>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </View>
  );
};

const st = StyleSheet.create({
  root:   { flex: 1, backgroundColor: T.page },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 56 : 28, paddingBottom: 16,
    backgroundColor: T.surface, borderBottomWidth: 1, borderBottomColor: T.border,
  },
  backBtn:     { width: 38, height: 38, borderRadius: 11, borderWidth: 1.5, borderColor: T.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: T.text },
  scroll:      { padding: 16, gap: 14, paddingBottom: 48 },

  profileCard: { backgroundColor: T.surface, borderRadius: radius.lg, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: T.border, ...shadow.card },
  avatarLg:    { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarLgText:{ fontSize: 28, fontWeight: '800' },
  clientName:  { fontSize: 22, fontWeight: '800', color: T.text },
  clientEmail: { fontSize: 14, color: T.textSub, marginTop: 4 },
  segBadge:    { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  segText:     { fontSize: 13, fontWeight: '700' },

  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kpi:    { flex: 1, minWidth: '45%', backgroundColor: T.surface, borderRadius: radius.md, padding: 14, gap: 4, borderWidth: 1, borderColor: T.border, ...shadow.card },
  kpiIcon:{ width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  kpiVal: { fontSize: 17, fontWeight: '800', color: T.text },
  kpiLbl: { fontSize: 11, color: T.muted, fontWeight: '600' },

  tabRow:      { flexDirection: 'row', backgroundColor: T.surface, borderRadius: radius.md, padding: 4, gap: 4, borderWidth: 1, borderColor: T.border },
  tab:         { flex: 1, paddingVertical: 10, borderRadius: radius.sm, alignItems: 'center' },
  tabActive:   { backgroundColor: T.page },
  tabText:     { fontSize: 13, fontWeight: '600', color: T.textSub },
  tabTextActive:{ color: T.text, fontWeight: '800' },

  card:  { backgroundColor: T.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: T.border, overflow: 'hidden', ...shadow.card },
  oRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  oBorder:{ borderBottomWidth: 1, borderBottomColor: T.divider },
  oDot:  { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  oId:   { fontSize: 14, fontWeight: '700', color: T.text },
  oMeta: { fontSize: 12, color: T.muted },
  oAmt:  { fontSize: 14, fontWeight: '800', color: T.text },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  badgeText:{ fontSize: 11, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  emptyText: { fontSize: 14, color: T.muted, fontWeight: '600' },

  insightsWrap: { gap: 12 },
  insightCard:  { backgroundColor: T.surface, borderRadius: radius.lg, padding: 18, gap: 8, borderWidth: 1, borderColor: T.border, ...shadow.card },
  insightTitle: { fontSize: 14, fontWeight: '800', color: T.text },
  insightText:  { fontSize: 13, color: T.textMid, lineHeight: 20 },
});

export default CustomerDetailScreen;
