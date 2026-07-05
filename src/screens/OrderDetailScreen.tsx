import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';
import { T, shadow, radius } from '../theme';
import OrderTimeline from '../components/OrderTimeline';
import { OrderService, ORDER_STATUS_META, ORDER_STATUS_TIMELINE, OrderStatus } from '../services/orderService';

type Params = {
  OrderDetail: { order: any };
};
type Nav = NativeStackNavigationProp<any>;

const Ic = ({ d, s = 18, c = T.textMid, w = 2 }: { d: string; s?: number; c?: string; w?: number }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"
    stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
    <Path d={d} />
  </Svg>
);

const InfoRow: React.FC<{ label: string; value: string; accent?: boolean }> = ({ label, value, accent }) => (
  <View style={st.infoRow}>
    <Text style={st.infoLabel}>{label}</Text>
    <Text style={[st.infoValue, accent && { color: T.orange, fontWeight: '700' }]}>{value}</Text>
  </View>
);

const OrderDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<Params, 'OrderDetail'>>();
  const order = route.params?.order;

  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order?.status ?? 'pending');
  const [updating, setUpdating] = useState(false);

  if (!order) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: T.page }}>
        <Text style={{ color: T.muted }}>Commande introuvable.</Text>
      </View>
    );
  }

  const meta = ORDER_STATUS_META[currentStatus];
  const nextStatuses = meta.next ?? [];

  const handleStatusUpdate = (nextStatus: OrderStatus) => {
    Alert.alert(
      'Changer le statut',
      `Passer la commande à « ${ORDER_STATUS_META[nextStatus].label} » ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            setUpdating(true);
            try {
              if (order.id && !order.id.startsWith('#')) {
                await OrderService.updateStatus(order.id, nextStatus);
              }
              setCurrentStatus(nextStatus);
            } catch (e) {
              Alert.alert('Erreur', 'Impossible de mettre à jour le statut.');
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const items: any[] = order.items ?? [];
  const total = order.total ?? order.montant ?? 0;
  const orderNum = order.orderNumber ?? order.id ?? '#—';
  const clientName = order.client ?? order.customerName ?? '—';
  const clientEmail = order.email ?? '—';
  const date = order.date ?? (order.createdAt?.toDate
    ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(order.createdAt.toDate())
    : '—');

  return (
    <View style={st.root}>
      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity style={st.backBtn} onPress={() => navigation.goBack()}>
          <Ic d="M19 12H5M12 19l-7-7 7-7" s={20} c={T.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={st.headerTitle}>Commande {orderNum}</Text>
          <Text style={st.headerSub}>{date} · {clientName}</Text>
        </View>
        <View style={[st.statusPill, { backgroundColor: meta.soft }]}>
          <Text style={[st.statusPillText, { color: meta.color }]}>{meta.label}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        {/* Timeline */}
        <View style={st.card}>
          <Text style={st.cardTitle}>Suivi de la commande</Text>
          <View style={{ marginTop: 16 }}>
            <OrderTimeline currentStatus={currentStatus} />
          </View>

          {nextStatuses.length > 0 && (
            <View style={st.actionsRow}>
              {nextStatuses.map((ns) => {
                const nm = ORDER_STATUS_META[ns];
                const isDanger = ns === 'cancelled' || ns === 'refunded';
                return (
                  <TouchableOpacity
                    key={ns}
                    style={[st.actionBtn, { backgroundColor: isDanger ? '#FEF2F2' : nm.soft, borderColor: nm.color + '44' }]}
                    onPress={() => handleStatusUpdate(ns)}
                    disabled={updating}
                    activeOpacity={0.8}
                  >
                    <Text style={[st.actionBtnText, { color: nm.color }]}>{nm.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Client info */}
        <View style={st.card}>
          <Text style={st.cardTitle}>Client</Text>
          <View style={st.clientRow}>
            <View style={st.avatar}>
              <Text style={st.avatarText}>
                {clientName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={st.clientName}>{clientName}</Text>
              <Text style={st.clientEmail}>{clientEmail}</Text>
              {order.phone && <Text style={st.clientEmail}>{order.phone}</Text>}
            </View>
          </View>
          {order.shippingAddress && (
            <View style={st.addressBox}>
              <Ic d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" s={14} c={T.textSub} />
              <Text style={st.addressText}>{order.shippingAddress}</Text>
            </View>
          )}
        </View>

        {/* Articles */}
        <View style={st.card}>
          <Text style={st.cardTitle}>Articles ({items.length})</Text>
          {items.map((item: any, i: number) => (
            <View key={i} style={[st.itemRow, i < items.length - 1 && st.itemBorder]}>
              <View style={st.itemEmoji}>
                <Text style={{ fontSize: 20 }}>{item.emoji ?? '📦'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={st.itemName}>{item.nom ?? item.productName ?? item.name ?? '—'}</Text>
                <Text style={st.itemQty}>Qté : {item.quantity ?? item.qty ?? 1}</Text>
              </View>
              <Text style={st.itemPrice}>
                {(((item.prix ?? item.price ?? 0) * (item.quantity ?? item.qty ?? 1)) / 100 >= 1
                  ? `${((item.prix ?? item.price ?? 0) * (item.quantity ?? item.qty ?? 1)).toLocaleString('fr-FR')} F`
                  : `€ ${((item.prix ?? item.price ?? 0) * (item.quantity ?? item.qty ?? 1)).toFixed(2)}`
                )}
              </Text>
            </View>
          ))}
        </View>

        {/* Order summary */}
        <View style={st.card}>
          <Text style={st.cardTitle}>Récapitulatif</Text>
          <InfoRow label="Sous-total" value={`${total.toLocaleString('fr-FR')} F`} />
          {order.discount != null && order.discount > 0 && (
            <InfoRow label="Réduction" value={`-${order.discount.toLocaleString('fr-FR')} F`} />
          )}
          <View style={st.divider} />
          <InfoRow label="Total" value={`${total.toLocaleString('fr-FR')} F`} accent />
          <InfoRow label="Paiement" value={
            order.paymentMethod === 'card' ? 'Carte bancaire' :
            order.paymentMethod === 'mobile' ? 'Mobile Money' : 'Espèces'
          } />
        </View>

        {/* Shipping */}
        {(order.trackingNumber || order.carrier) && (
          <View style={st.card}>
            <Text style={st.cardTitle}>Expédition</Text>
            {order.carrier && <InfoRow label="Transporteur" value={order.carrier} />}
            {order.trackingNumber && <InfoRow label="N° de suivi" value={order.trackingNumber} accent />}
          </View>
        )}

        {/* Fraud warning */}
        {order.fraudRisk === 'high' && (
          <View style={st.fraudCard}>
            <Ic d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" s={20} c="#DC2626" />
            <View style={{ flex: 1 }}>
              <Text style={st.fraudTitle}>Risque de fraude élevé</Text>
              <Text style={st.fraudSub}>Vérifiez l'identité du client avant traitement.</Text>
            </View>
          </View>
        )}

        {order.notes && (
          <View style={st.card}>
            <Text style={st.cardTitle}>Notes</Text>
            <Text style={{ fontSize: 14, color: T.textMid, lineHeight: 20 }}>{order.notes}</Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
};

const st = StyleSheet.create({
  root:    { flex: 1, backgroundColor: T.page },
  header:  {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 56 : 28, paddingBottom: 16,
    backgroundColor: T.surface, borderBottomWidth: 1, borderBottomColor: T.border, ...shadow.card,
  },
  backBtn: { width: 38, height: 38, borderRadius: 11, borderWidth: 1.5, borderColor: T.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: T.text },
  headerSub:   { fontSize: 12, color: T.textSub, marginTop: 1 },
  statusPill:  { paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.pill },
  statusPillText: { fontSize: 12, fontWeight: '700' },

  scroll:  { padding: 16, gap: 14, paddingBottom: 48 },

  card:    { backgroundColor: T.surface, borderRadius: radius.lg, padding: 18, borderWidth: 1, borderColor: T.border, gap: 0, ...shadow.card },
  cardTitle: { fontSize: 14, fontWeight: '800', color: T.text, marginBottom: 4 },

  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  actionBtn:  { flex: 1, minWidth: 120, paddingVertical: 11, borderRadius: radius.md, alignItems: 'center', borderWidth: 1 },
  actionBtnText: { fontSize: 13, fontWeight: '700' },

  clientRow:  { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 12 },
  avatar:     { width: 48, height: 48, borderRadius: 14, backgroundColor: T.orangeSoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '800', color: T.orange },
  clientName: { fontSize: 15, fontWeight: '700', color: T.text },
  clientEmail:{ fontSize: 13, color: T.textSub, marginTop: 2 },
  addressBox: { flexDirection: 'row', gap: 8, marginTop: 12, backgroundColor: T.page, borderRadius: 10, padding: 12, alignItems: 'flex-start' },
  addressText:{ flex: 1, fontSize: 13, color: T.textMid, lineHeight: 18 },

  itemRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: T.divider },
  itemEmoji:  { width: 42, height: 42, borderRadius: 12, backgroundColor: T.page, alignItems: 'center', justifyContent: 'center' },
  itemName:   { fontSize: 14, fontWeight: '600', color: T.text },
  itemQty:    { fontSize: 12, color: T.muted, marginTop: 2 },
  itemPrice:  { fontSize: 14, fontWeight: '800', color: T.text },

  infoRow:    { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: T.divider },
  infoLabel:  { fontSize: 13, color: T.textSub },
  infoValue:  { fontSize: 13, fontWeight: '600', color: T.text },
  divider:    { height: 1, backgroundColor: T.borderStrong, marginVertical: 4 },

  fraudCard:  { flexDirection: 'row', gap: 14, backgroundColor: '#FEF2F2', borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: '#FECACA', alignItems: 'center' },
  fraudTitle: { fontSize: 14, fontWeight: '700', color: '#DC2626' },
  fraudSub:   { fontSize: 12, color: '#B91C1C', marginTop: 2 },
});

export default OrderDetailScreen;
