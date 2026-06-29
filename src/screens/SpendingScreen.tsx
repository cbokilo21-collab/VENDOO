import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { useAuth } from '../contexts/AuthContext';
import { SpendingService, SpendingStats } from '../services/spendingService';
import { T } from '../theme';

const SpendingScreen: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<SpendingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadStats = async () => {
      try {
        const spendingStats = await SpendingService.getSpendingStats(user.uid);
        setStats(spendingStats);
      } catch (error) {
        console.error('Error loading spending stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user]);

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} FCFA`;
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <View style={s.root}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Mes Dépenses</Text>
          <Text style={s.headerSub}>Analysez vos achats</Text>
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
        <Text style={s.headerTitle}>Mes Dépenses</Text>
        <Text style={s.headerSub}>Analysez vos achats</Text>
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        {/* Overview Cards */}
        <View style={s.overviewGrid}>
          <View style={s.overviewCard}>
            <Text style={s.overviewLabel}>Total dépensé</Text>
            <Text style={s.overviewValue}>{formatCurrency(stats?.totalSpent || 0)}</Text>
          </View>
          <View style={s.overviewCard}>
            <Text style={s.overviewLabel}>Commandes</Text>
            <Text style={s.overviewValue}>{stats?.totalOrders || 0}</Text>
          </View>
          <View style={s.overviewCard}>
            <Text style={s.overviewLabel}>Panier moyen</Text>
            <Text style={s.overviewValue}>{formatCurrency(stats?.averageOrderValue || 0)}</Text>
          </View>
        </View>

        {/* Monthly Comparison */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Ce mois</Text>
          <View style={s.monthlyCard}>
            <View style={s.monthlyMain}>
              <Text style={s.monthlyAmount}>{formatCurrency(stats?.thisMonthSpent || 0)}</Text>
              <Text style={s.monthlyLabel}>Dépenses ce mois</Text>
            </View>
            <View style={s.monthlyTrend}>
              <Text style={[s.trendValue, (stats?.monthlyTrend || 0) >= 0 ? s.trendPositive : s.trendNegative]}>
                {formatPercentage(stats?.monthlyTrend || 0)}
              </Text>
              <Text style={s.trendLabel}>vs mois dernier</Text>
            </View>
          </View>
        </View>

        {/* Top Stores */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Boutiques favorites</Text>
          {stats?.topStores && stats.topStores.length > 0 ? (
            stats.topStores.map((store, index) => (
              <View key={store.storeId} style={s.storeRow}>
                <View style={s.storeRank}>
                  <Text style={s.storeRankText}>{index + 1}</Text>
                </View>
                <View style={s.storeInfo}>
                  <Text style={s.storeName}>{store.storeName}</Text>
                  <Text style={s.storeOrders}>{store.orderCount} commande{store.orderCount > 1 ? 's' : ''}</Text>
                </View>
                <Text style={s.storeAmount}>{formatCurrency(store.totalSpent)}</Text>
              </View>
            ))
          ) : (
            <Text style={s.emptyText}>Aucune dépense enregistrée</Text>
          )}
        </View>

        {/* Spending by Category */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Par catégorie</Text>
          {stats?.spendingByCategory && Object.keys(stats.spendingByCategory).length > 0 ? (
            Object.entries(stats.spendingByCategory).map(([category, amount]) => (
              <View key={category} style={s.categoryRow}>
                <Text style={s.categoryName}>{category}</Text>
                <Text style={s.categoryAmount}>{formatCurrency(amount)}</Text>
              </View>
            ))
          ) : (
            <Text style={s.emptyText}>Aucune donnée de catégorie</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.page },
  header: { padding: 24, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: T.text, marginBottom: 4 },
  headerSub: { fontSize: 14, color: T.textSub },
  
  content: { flex: 1, paddingHorizontal: 24 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  overviewGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  overviewCard: {
    flex: 1, backgroundColor: T.surface, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: T.border,
  },
  overviewLabel: { fontSize: 12, color: T.textSub, marginBottom: 8 },
  overviewValue: { fontSize: 18, fontWeight: '800', color: T.text },
  
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: T.text, marginBottom: 16 },
  
  monthlyCard: {
    backgroundColor: T.surface, borderRadius: 16, padding: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: T.border,
  },
  monthlyMain: {},
  monthlyAmount: { fontSize: 24, fontWeight: '800', color: T.orange, marginBottom: 4 },
  monthlyLabel: { fontSize: 13, color: T.textSub },
  monthlyTrend: { alignItems: 'flex-end' },
  trendValue: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  trendPositive: { color: T.success },
  trendNegative: { color: T.error },
  trendLabel: { fontSize: 12, color: T.textSub },
  
  storeRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: T.surface,
    borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: T.border,
  },
  storeRank: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: T.orange,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  storeRankText: { fontSize: 14, fontWeight: '800', color: T.white },
  storeInfo: { flex: 1 },
  storeName: { fontSize: 15, fontWeight: '600', color: T.text, marginBottom: 4 },
  storeOrders: { fontSize: 12, color: T.textSub },
  storeAmount: { fontSize: 15, fontWeight: '700', color: T.text },
  
  categoryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: T.surface, borderRadius: 12, padding: 16, marginBottom: 8,
    borderWidth: 1, borderColor: T.border,
  },
  categoryName: { fontSize: 14, fontWeight: '600', color: T.text },
  categoryAmount: { fontSize: 14, fontWeight: '700', color: T.orange },
  
  emptyText: { fontSize: 14, color: T.textSub, textAlign: 'center', padding: 20 },
});

export default SpendingScreen;
