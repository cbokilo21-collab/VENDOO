import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useAuth } from '../contexts/AuthContext';
import { OrderService, Order } from '../services/orderService';
import { AdminPreferencesService } from '../services/adminPreferencesService';
import { Currency, CURRENCIES, CurrencyService } from '../services/currencyService';

const C = {
  navy: '#FF6B35', navyMid: '#FF8A5C',
  bg: '#FFF7F3', surface: '#FFFFFF', border: '#E5E7EB',
  accent: '#FF6B35', accentSoft: 'rgba(255,107,53,0.1)',
  textDark: '#111827', textMid: '#374151', textLight: '#6B7280', muted: '#9CA3AF',
  success: '#10B981', info: '#3B82F6', warning: '#F59E0B', purple: '#8B5CF6',
  white: '#FFFFFF',
};

type RootStackParamList = {
  AdminDashboard: undefined;
  AdminPaymentStats: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList>;

interface PaymentStats {
  visa: { count: number; total: number };
  mobileMoney: { count: number; total: number };
  cash: { count: number; total: number };
  total: { count: number; total: number };
}

const AdminPaymentStatsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PaymentStats>({
    visa: { count: 0, total: 0 },
    mobileMoney: { count: 0, total: 0 },
    cash: { count: 0, total: 0 },
    total: { count: 0, total: 0 },
  });
  const [currency, setCurrency] = useState<Currency>('XOF');
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      
      // Load admin preferences for currency
      const prefs = await AdminPreferencesService.getPreferences(user.uid);
      setCurrency(prefs.currency);

      // Get all orders (admin sees all orders)
      const allOrders = await OrderService.getByUser(user.uid);
      
      // Calculate stats by payment method
      const paymentStats: PaymentStats = {
        visa: { count: 0, total: 0 },
        mobileMoney: { count: 0, total: 0 },
        cash: { count: 0, total: 0 },
        total: { count: 0, total: 0 },
      };

      allOrders.forEach(order => {
        if (order.status === 'paid' || order.status === 'delivered' || order.status === 'processing' || order.status === 'shipped') {
          paymentStats.total.count++;
          paymentStats.total.total += order.total;

          switch (order.paymentMethod) {
            case 'visa':
              paymentStats.visa.count++;
              paymentStats.visa.total += order.total;
              break;
            case 'mobile_money':
              paymentStats.mobileMoney.count++;
              paymentStats.mobileMoney.total += order.total;
              break;
            case 'cash':
              paymentStats.cash.count++;
              paymentStats.cash.total += order.total;
              break;
          }
        }
      });

      setStats(paymentStats);
      setRecentOrders(allOrders.slice(0, 10));
    } catch (error) {
      console.error('Error loading payment stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return CurrencyService.format(amount, currency);
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'visa': return 'Visa';
      case 'mobile_money': return 'Mobile Money';
      case 'cash': return 'Espèces';
      default: return method;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'visa':
        return (
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.info} strokeWidth={2}>
            <Rect x="2" y="4" width="20" height="16" rx="2"/>
            <Path d="M7 15h.01M11 15h.01M15 15h.01M7 11h.01M11 11h.01M15 11h.01M7 7h10" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        );
      case 'mobile_money':
        return (
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.success} strokeWidth={2}>
            <Rect x="5" y="2" width="14" height="20" rx="2"/>
            <Path d="M12 18h.01"/>
            <Path d="M8 10h8"/>
            <Path d="M8 14h8"/>
          </Svg>
        );
      case 'cash':
        return (
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.warning} strokeWidth={2}>
            <Circle cx="12" cy="12" r="10"/>
            <Path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
            <Path d="M12 18V6"/>
          </Svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={s.root}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.textDark} strokeWidth={2}>
              <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Statistiques Paiements</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={C.accent} />
          <Text style={s.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.textDark} strokeWidth={2}>
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Statistiques Paiements</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Currency Info */}
        <View style={s.currencyBanner}>
          <Text style={s.currencyBannerText}>Devise: {CURRENCIES[currency].flag} {CURRENCIES[currency].name}</Text>
        </View>

        {/* Total Stats */}
        <View style={s.totalCard}>
          <Text style={s.totalLabel}>Total des paiements reçus</Text>
          <Text style={s.totalAmount}>{formatAmount(stats.total.total)}</Text>
          <Text style={s.totalCount}>{stats.total.count} transactions</Text>
        </View>

        {/* Payment Method Breakdown */}
        <Text style={s.sectionTitle}>Répartition par méthode</Text>

        {/* Visa */}
        <View style={s.methodCard}>
          <View style={s.methodHeader}>
            <View style={s.methodIconContainer}>{getPaymentMethodIcon('visa')}</View>
            <View style={s.methodInfo}>
              <Text style={s.methodName}>Visa</Text>
              <Text style={s.methodCount}>{stats.visa.count} transactions</Text>
            </View>
            <Text style={s.methodAmount}>{formatAmount(stats.visa.total)}</Text>
          </View>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${stats.total.count > 0 ? (stats.visa.count / stats.total.count) * 100 : 0}%`, backgroundColor: C.info }]} />
          </View>
        </View>

        {/* Mobile Money */}
        <View style={s.methodCard}>
          <View style={s.methodHeader}>
            <View style={s.methodIconContainer}>{getPaymentMethodIcon('mobile_money')}</View>
            <View style={s.methodInfo}>
              <Text style={s.methodName}>Mobile Money</Text>
              <Text style={s.methodCount}>{stats.mobileMoney.count} transactions</Text>
            </View>
            <Text style={s.methodAmount}>{formatAmount(stats.mobileMoney.total)}</Text>
          </View>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${stats.total.count > 0 ? (stats.mobileMoney.count / stats.total.count) * 100 : 0}%`, backgroundColor: C.success }]} />
          </View>
        </View>

        {/* Cash */}
        <View style={s.methodCard}>
          <View style={s.methodHeader}>
            <View style={s.methodIconContainer}>{getPaymentMethodIcon('cash')}</View>
            <View style={s.methodInfo}>
              <Text style={s.methodName}>Espèces</Text>
              <Text style={s.methodCount}>{stats.cash.count} transactions</Text>
            </View>
            <Text style={s.methodAmount}>{formatAmount(stats.cash.total)}</Text>
          </View>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${stats.total.count > 0 ? (stats.cash.count / stats.total.count) * 100 : 0}%`, backgroundColor: C.warning }]} />
          </View>
        </View>

        {/* Recent Orders */}
        <Text style={s.sectionTitle}>Transactions récentes</Text>
        {recentOrders.map((order) => (
          <View key={order.id} style={s.orderCard}>
            <View style={s.orderHeader}>
              <Text style={s.orderNumber}>{order.orderNumber}</Text>
              <View style={s.orderMethodBadge}>
                {getPaymentMethodIcon(order.paymentMethod)}
                <Text style={s.orderMethodText}>{getPaymentMethodLabel(order.paymentMethod)}</Text>
              </View>
            </View>
            <View style={s.orderDetails}>
              <Text style={s.orderClient}>{order.client}</Text>
              <Text style={s.orderAmount}>{formatAmount(order.total)}</Text>
            </View>
          </View>
        ))}

        {recentOrders.length === 0 && (
          <View style={s.emptyState}>
            <Text style={s.emptyText}>Aucune transaction récente</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: C.textDark },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: C.textLight },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },

  currencyBanner: { backgroundColor: C.accentSoft, borderRadius: 12, padding: 16, marginBottom: 20, alignItems: 'center' },
  currencyBannerText: { fontSize: 14, fontWeight: '600', color: C.accent },

  totalCard: { backgroundColor: C.surface, borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 24, borderWidth: 2, borderColor: C.accent },
  totalLabel: { fontSize: 14, color: C.textLight, marginBottom: 8 },
  totalAmount: { fontSize: 32, fontWeight: '900', color: C.textDark, marginBottom: 4 },
  totalCount: { fontSize: 13, color: C.textMid },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: C.textDark, marginBottom: 12, marginTop: 8 },

  methodCard: { backgroundColor: C.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  methodHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  methodIconContainer: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  methodInfo: { flex: 1 },
  methodName: { fontSize: 16, fontWeight: '700', color: C.textDark },
  methodCount: { fontSize: 12, color: C.textLight, marginTop: 2 },
  methodAmount: { fontSize: 18, fontWeight: '800', color: C.textDark },
  progressBar: { height: 6, backgroundColor: C.bg, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },

  orderCard: { backgroundColor: C.surface, borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderNumber: { fontSize: 14, fontWeight: '700', color: C.textDark },
  orderMethodBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  orderMethodText: { fontSize: 11, fontWeight: '600', color: C.textMid },
  orderDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderClient: { fontSize: 13, color: C.textLight },
  orderAmount: { fontSize: 15, fontWeight: '700', color: C.accent },

  emptyState: { backgroundColor: C.surface, borderRadius: 12, padding: 32, alignItems: 'center', marginBottom: 12 },
  emptyText: { fontSize: 14, color: C.textLight },
});

export default AdminPaymentStatsScreen;
