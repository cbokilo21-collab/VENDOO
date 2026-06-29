import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { OrderService, Order, TrackingEvent, ORDER_STATUS_META } from '../services/orderService';
import { T } from '../theme';

const OrderTrackingScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId } = route.params as { orderId: string };
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const orderData = await OrderService.getById(orderId);
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatDeliveryDate = (timestamp: any) => {
    if (!timestamp) return 'Non définie';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getStatusIndex = (status: string) => {
    const timeline = ['pending', 'paid', 'processing', 'shipped', 'delivered'];
    return timeline.indexOf(status);
  };

  if (loading) {
    return (
      <View style={s.root}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Suivi de commande</Text>
        </View>
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={T.orange} />
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={s.root}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Suivi de commande</Text>
        </View>
        <View style={s.errorContainer}>
          <Text style={s.errorText}>Commande non trouvée</Text>
        </View>
      </View>
    );
  }

  const statusMeta = ORDER_STATUS_META[order.status as keyof typeof ORDER_STATUS_META];
  const currentStatusIndex = getStatusIndex(order.status);

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Suivi de commande</Text>
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        {/* Order Info */}
        <View style={s.orderInfoCard}>
          <View style={s.orderInfoHeader}>
            <Text style={s.orderNumber}>{order.orderNumber}</Text>
            <View style={[s.statusBadge, { backgroundColor: statusMeta.soft }]}>
              <Text style={[s.statusText, { color: statusMeta.color }]}>
                {statusMeta.label}
              </Text>
            </View>
          </View>
          <Text style={s.orderDate}>Commandée le {formatDate(order.createdAt)}</Text>
          <Text style={s.orderTotal}>Total: {order.total.toLocaleString()} FCFA</Text>
        </View>

        {/* Delivery Info */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Informations de livraison</Text>
          <View style={s.deliveryCard}>
            <View style={s.deliveryRow}>
              <Text style={s.deliveryLabel}>Transporteur:</Text>
              <Text style={s.deliveryValue}>{order.carrier || 'Non spécifié'}</Text>
            </View>
            <View style={s.deliveryRow}>
              <Text style={s.deliveryLabel}>Numéro de tracking:</Text>
              <Text style={s.deliveryValue}>{order.trackingNumber || 'Non disponible'}</Text>
            </View>
            <View style={s.deliveryRow}>
              <Text style={s.deliveryLabel}>Date de livraison estimée:</Text>
              <Text style={[s.deliveryValue, { color: T.orange }]}>
                {formatDeliveryDate(order.estimatedDeliveryDate)}
              </Text>
            </View>
            <View style={s.deliveryRow}>
              <Text style={s.deliveryLabel}>Zone de livraison:</Text>
              <Text style={s.deliveryValue}>{order.deliveryLocation || 'Non spécifiée'}</Text>
            </View>
          </View>
        </View>

        {/* Tracking Timeline */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Historique de suivi</Text>
          {order.trackingHistory && order.trackingHistory.length > 0 ? (
            <View style={s.timeline}>
              {order.trackingHistory.map((event, index) => (
                <View key={index} style={s.timelineItem}>
                  <View style={s.timelineDot} />
                  <View style={s.timelineContent}>
                    <Text style={s.timelineStatus}>{event.status}</Text>
                    <Text style={s.timelineDescription}>{event.description}</Text>
                    {event.location && (
                      <Text style={s.timelineLocation}>{event.location}</Text>
                    )}
                    <Text style={s.timelineDate}>{formatDate(event.timestamp)}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={s.emptyText}>Aucun événement de tracking disponible</Text>
          )}
        </View>

        {/* Order Items */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Articles commandés</Text>
          {order.items.map((item, index) => (
            <View key={index} style={s.itemRow}>
              <View style={s.itemInfo}>
                <Text style={s.itemName}>{item.nom}</Text>
                <Text style={s.itemQuantity}>Quantité: {item.quantity}</Text>
              </View>
              <Text style={s.itemPrice}>{(item.prix * item.quantity).toLocaleString()} FCFA</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.page },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: 24, paddingBottom: 16,
    backgroundColor: T.surface, borderBottomWidth: 1, borderBottomColor: T.border,
  },
  backBtn: { marginRight: 16 },
  backBtnText: { fontSize: 24, fontWeight: '800', color: T.text },
  headerTitle: { fontSize: 20, fontWeight: '800', color: T.text },
  
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: T.textSub },
  
  orderInfoCard: {
    backgroundColor: T.surface, borderRadius: 16, padding: 20,
    marginBottom: 24, borderWidth: 1, borderColor: T.border,
  },
  orderInfoHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: { fontSize: 18, fontWeight: '800', color: T.text },
  statusBadge: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
  },
  statusText: { fontSize: 12, fontWeight: '700' },
  orderDate: { fontSize: 14, color: T.textSub, marginBottom: 4 },
  orderTotal: { fontSize: 16, fontWeight: '700', color: T.orange },
  
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: T.text, marginBottom: 16 },
  
  deliveryCard: {
    backgroundColor: T.surface, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: T.border,
  },
  deliveryRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: T.border,
  },
  deliveryLabel: { fontSize: 14, color: T.textSub },
  deliveryValue: { fontSize: 14, fontWeight: '600', color: T.text },
  
  timeline: { marginLeft: 8 },
  timelineItem: {
    flexDirection: 'row', marginBottom: 20, position: 'relative',
  },
  timelineDot: {
    width: 12, height: 12, borderRadius: 6, backgroundColor: T.orange,
    marginTop: 4, marginRight: 16,
  },
  timelineContent: { flex: 1 },
  timelineStatus: { fontSize: 15, fontWeight: '700', color: T.text, marginBottom: 4 },
  timelineDescription: { fontSize: 14, color: T.textSub, marginBottom: 4 },
  timelineLocation: { fontSize: 13, color: T.textMid, marginBottom: 4 },
  timelineDate: { fontSize: 12, color: T.muted },
  
  itemRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: T.surface, borderRadius: 12, padding: 16, marginBottom: 8,
    borderWidth: 1, borderColor: T.border,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '600', color: T.text, marginBottom: 4 },
  itemQuantity: { fontSize: 13, color: T.textSub },
  itemPrice: { fontSize: 15, fontWeight: '700', color: T.orange },
  
  emptyText: { fontSize: 14, color: T.textSub, textAlign: 'center', padding: 20 },
});

export default OrderTrackingScreen;
