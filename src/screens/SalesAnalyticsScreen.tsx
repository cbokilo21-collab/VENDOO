import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { FirestoreService } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import { AdminPreferencesService } from '../services/adminPreferencesService';
import { Currency, CurrencyService } from '../services/currencyService';

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
  SalesAnalytics: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList>;

interface StoreSales {
  storeId: string;
  storeName: string;
  totalSales: number;
  orderCount: number;
  avgOrderValue: number;
}

const SalesAnalyticsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<Currency>('XAF');
  const [totalSales, setTotalSales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [topStores, setTopStores] = useState<StoreSales[]>([]);

  useEffect(() => {
    loadSalesData();
    loadCurrency();
  }, [user]);

  const loadCurrency = async () => {
    if (!user) return;
    try {
      const prefs = await AdminPreferencesService.getPreferences(user.uid);
      setCurrency(prefs.currency);
    } catch (error) {
      console.error('Error loading currency:', error);
    }
  };

  const loadSalesData = async () => {
    try {
      const orders = await FirestoreService.getAll<any>('orders');
      const completedOrders = orders.filter((o: any) => o.status === 'delivered' || o.status === 'completed');
      
      const total = completedOrders.reduce((sum: number, o: any) => sum + (o.total || o.amount || 0), 0);
      setTotalSales(total);
      setTotalOrders(completedOrders.length);

      // Group by store
      const storeMap = new Map<string, StoreSales>();
      completedOrders.forEach((order: any) => {
        const storeId = order.storeId || order.boutiqueId || 'unknown';
        const storeName = order.storeName || order.boutiqueName || 'Boutique inconnue';
        const existing = storeMap.get(storeId) || {
          storeId,
          storeName,
          totalSales: 0,
          orderCount: 0,
          avgOrderValue: 0,
        };
        existing.totalSales += order.total || order.amount || 0;
        existing.orderCount += 1;
        existing.avgOrderValue = existing.totalSales / existing.orderCount;
        storeMap.set(storeId, existing);
      });

      // Sort by total sales and take top 10
      const sorted = Array.from(storeMap.values())
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, 10);
      
      setTopStores(sorted);
    } catch (error) {
      console.error('Error loading sales data:', error);
      setTopStores([]);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return CurrencyService.format(amount, currency);
  };

  if (loading) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator size="large" color={C.accent} />
        <Text style={s.loadingText}>Chargement des données...</Text>
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
        <Text style={s.headerTitle}>Analytics des Ventes</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Overview Stats */}
        <View style={s.overviewSection}>
          <View style={s.statCard}>
            <Text style={s.statValue}>{formatAmount(totalSales)}</Text>
            <Text style={s.statLabel}>Chiffre d'Affaires Total</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statValue}>{totalOrders}</Text>
            <Text style={s.statLabel}>Commandes Livrées</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statValue}>{formatAmount(totalOrders > 0 ? totalSales / totalOrders : 0)}</Text>
            <Text style={s.statLabel}>Panier Moyen</Text>
          </View>
        </View>

        {/* Top Stores Ranking */}
        <Text style={s.sectionTitle}>Classement des Boutiques</Text>
        <View style={s.rankingCard}>
          {topStores.map((store, index) => (
            <View key={store.storeId} style={s.rankingItem}>
              <View style={s.rankBadge}>
                <Text style={s.rankText}>{index + 1}</Text>
              </View>
              <View style={s.storeInfo}>
                <Text style={s.storeName}>{store.storeName}</Text>
                <Text style={s.storeStats}>{store.orderCount} commandes · Moy: {formatAmount(store.avgOrderValue)}</Text>
              </View>
              <Text style={s.storeSales}>{formatAmount(store.totalSales)}</Text>
            </View>
          ))}
          {topStores.length === 0 && (
            <View style={s.emptyContainer}>
              <Text style={s.emptyText}>Aucune vente enregistrée</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },
  loadingText: { marginTop: 12, fontSize: 14, color: C.textLight },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: C.textDark },

  scroll: { flex: 1 },
  overviewSection: { flexDirection: 'row', gap: 12, padding: 20, paddingBottom: 16 },
  statCard: { flex: 1, backgroundColor: C.surface, borderRadius: 16, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800', color: C.textDark },
  statLabel: { fontSize: 12, color: C.textLight, marginTop: 4 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: C.textDark, paddingHorizontal: 20, marginBottom: 12 },
  rankingCard: { backgroundColor: C.surface, marginHorizontal: 20, marginBottom: 20, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border },
  rankingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  rankBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontSize: 14, fontWeight: '800', color: C.white },
  storeInfo: { flex: 1, marginLeft: 12 },
  storeName: { fontSize: 15, fontWeight: '600', color: C.textDark },
  storeStats: { fontSize: 12, color: C.textLight, marginTop: 2 },
  storeSales: { fontSize: 16, fontWeight: '700', color: C.success },

  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 15, color: C.textLight },
});

export default SalesAnalyticsScreen;
