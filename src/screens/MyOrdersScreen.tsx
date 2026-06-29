import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { OrderService, Order, ORDER_STATUS_META } from '../services/orderService';
import { T } from '../theme';

const MyOrdersScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState<'all' | 'active' | 'completed'>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadOrders = async () => {
      try {
        const userOrders = await OrderService.getByUser(user.uid);
        setOrders(userOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user]);

  const filteredOrders = orders.filter(order => {
    if (selectedTab === 'active') return ['pending', 'paid', 'processing', 'shipped'].includes(order.status);
    if (selectedTab === 'completed') return order.status === 'delivered';
    return true;
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getStatusMeta = (status: string) => {
    return ORDER_STATUS_META[status as keyof typeof ORDER_STATUS_META] || {
      label: status,
      color: T.muted,
      soft: T.surfaceAlt,
    };
  };

  const handleOrderPress = (order: Order) => {
    (navigation as any).navigate('OrderTracking', { orderId: order.id });
  };

  if (loading) {
    return (
      <View style={s.root}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Mes Achats</Text>
          <Text style={s.headerSub}>Suivez vos commandes</Text>
        </View>
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={T.orange} />
        </View>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Mes Achats</Text>
        <Text style={s.headerSub}>Suivez vos commandes</Text>
      </View>

      <View style={s.tabs}>
        {[
          { key: 'all', label: 'Toutes' },
          { key: 'active', label: 'En cours' },
          { key: 'completed', label: 'Terminées' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[s.tab, selectedTab === tab.key && s.tabActive]}
            onPress={() => setSelectedTab(tab.key as any)}
          >
            <Text style={[s.tabText, selectedTab === tab.key && s.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        {filteredOrders.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>📦</Text>
            <Text style={s.emptyTitle}>Aucune commande</Text>
            <Text style={s.emptySub}>Commencez vos achats sur la Marketplace</Text>
          </View>
        ) : (
          filteredOrders.map(order => {
            const statusMeta = getStatusMeta(order.status);
            return (
              <TouchableOpacity 
                key={order.id} 
                style={s.orderCard}
                onPress={() => handleOrderPress(order)}
                activeOpacity={0.7}
              >
                <View style={s.orderHeader}>
                  <View style={s.orderId}>
                    <Text style={s.orderIdLabel}>{order.orderNumber}</Text>
                    <Text style={s.orderDate}>{formatDate(order.createdAt)}</Text>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: statusMeta.soft }]}>
                    <Text style={[s.statusText, { color: statusMeta.color }]}>
                      {statusMeta.label}
                    </Text>
                  </View>
                </View>
                <View style={s.orderBody}>
                  <View style={s.storeInfo}>
                    <Text style={s.storeName}>{order.client}</Text>
                    <Text style={s.storeDistrict}>{order.items.length} article{order.items.length > 1 ? 's' : ''}</Text>
                  </View>
                  <Text style={s.orderTotal}>{order.total.toLocaleString()} FCFA</Text>
                </View>
                <TouchableOpacity style={s.trackBtn}>
                  <Text style={s.trackBtnText}>Voir les détails</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.page },
  header: { padding: 24, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: T.text, marginBottom: 4 },
  headerSub: { fontSize: 14, color: T.textSub },
  
  tabs: { flexDirection: 'row', paddingHorizontal: 24, marginBottom: 16, gap: 8 },
  tab: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8,
    backgroundColor: T.surface, borderWidth: 1, borderColor: T.border,
  },
  tabActive: { backgroundColor: T.orange, borderColor: T.orange },
  tabText: { fontSize: 13, fontWeight: '600', color: T.textSub },
  tabTextActive: { color: T.white },
  
  content: { flex: 1, paddingHorizontal: 24 },
  
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  emptyState: { padding: 60, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: T.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: T.textSub },
  
  orderCard: {
    backgroundColor: T.surface, borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: T.border,
  },
  orderHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: T.divider,
  },
  orderId: {},
  orderIdLabel: { fontSize: 14, fontWeight: '700', color: T.text, marginBottom: 4 },
  orderDate: { fontSize: 12, color: T.textSub },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  
  orderBody: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12,
  },
  storeInfo: {},
  storeName: { fontSize: 15, fontWeight: '700', color: T.text, marginBottom: 4 },
  storeDistrict: { fontSize: 13, color: T.textSub },
  orderTotal: { fontSize: 16, fontWeight: '800', color: T.orange },
  
  trackBtn: {
    backgroundColor: T.surfaceAlt, borderRadius: 10, padding: 12,
    alignItems: 'center',
  },
  trackBtnText: { fontSize: 13, fontWeight: '600', color: T.textMid },
});

export default MyOrdersScreen;
