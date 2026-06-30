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
  SubscriptionRevenue: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList>;

interface Subscription {
  id: string;
  merchantId: string;
  merchantName: string;
  plan: 'basic' | 'pro' | 'enterprise';
  amount: number;
  status: 'active' | 'cancelled' | 'expired';
  startDate: any;
  endDate: any;
}

const SubscriptionRevenueScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [activeSubscriptions, setActiveSubscriptions] = useState(0);
  const [currency, setCurrency] = useState<Currency>('XAF');

  useEffect(() => {
    loadSubscriptions();
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

  const loadSubscriptions = async () => {
    try {
      // Check if subscriptions collection exists
      const subs = await FirestoreService.getAll<Subscription>('subscriptions');
      setSubscriptions(subs);
      
      const active = subs.filter((s: Subscription) => s.status === 'active');
      setActiveSubscriptions(active.length);
      
      const revenue = active.reduce((sum: number, s: Subscription) => sum + s.amount, 0);
      setTotalRevenue(revenue);
    } catch (error) {
      console.error('Subscriptions collection not found or error:', error);
      // Set empty state
      setSubscriptions([]);
      setTotalRevenue(0);
      setActiveSubscriptions(0);
    } finally {
      setLoading(false);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic': return C.info;
      case 'pro': return C.purple;
      case 'enterprise': return C.accent;
      default: return C.muted;
    }
  };

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case 'basic': return 'Basic';
      case 'pro': return 'Pro';
      case 'enterprise': return 'Enterprise';
      default: return plan;
    }
  };

  const formatAmount = (amount: number) => {
    return CurrencyService.format(amount, currency);
  };

  if (loading) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator size="large" color={C.accent} />
        <Text style={s.loadingText}>Chargement des abonnements...</Text>
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
        <Text style={s.headerTitle}>Revenus Abonnements</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Revenue Overview */}
        <View style={s.overviewSection}>
          <View style={s.revenueCard}>
            <Text style={s.revenueValue}>{formatAmount(totalRevenue)}</Text>
            <Text style={s.revenueLabel}>Revenu Mensuel</Text>
            <Text style={s.revenueSub}>Abonnements actifs</Text>
          </View>
          <View style={s.subsCard}>
            <Text style={s.subsValue}>{activeSubscriptions}</Text>
            <Text style={s.subsLabel}>Abonnements Actifs</Text>
          </View>
        </View>

        {/* Plan Distribution */}
        <Text style={s.sectionTitle}>Distribution par Plan</Text>
        <View style={s.plansSection}>
          {(['basic', 'pro', 'enterprise'] as const).map((plan) => {
            const count = subscriptions.filter((s: Subscription) => s.plan === plan && s.status === 'active').length;
            const percentage = activeSubscriptions > 0 ? (count / activeSubscriptions) * 100 : 0;
            return (
              <View key={plan} style={s.planCard}>
                <View style={[s.planIndicator, { backgroundColor: getPlanColor(plan) }]} />
                <View style={s.planInfo}>
                  <Text style={s.planName}>{getPlanLabel(plan)}</Text>
                  <Text style={s.planCount}>{count} abonnés</Text>
                </View>
                <Text style={s.planPercentage}>{percentage.toFixed(0)}%</Text>
              </View>
            );
          })}
        </View>

        {/* Subscriptions List */}
        <Text style={s.sectionTitle}>Abonnements Récents</Text>
        <View style={s.listCard}>
          {subscriptions.length === 0 ? (
            <View style={s.emptyContainer}>
              <Text style={s.emptyText}>Aucun abonnement enregistré</Text>
            </View>
          ) : (
            subscriptions.slice(0, 10).map((sub) => (
              <View key={sub.id} style={s.subItem}>
                <View style={s.subAvatar}>
                  <Text style={s.subAvatarText}>{sub.merchantName.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={s.subInfo}>
                  <Text style={s.subMerchant}>{sub.merchantName}</Text>
                  <View style={[s.planBadge, { backgroundColor: getPlanColor(sub.plan) + '20' }]}>
                    <Text style={[s.planBadgeText, { color: getPlanColor(sub.plan) }]}>
                      {getPlanLabel(sub.plan)}
                    </Text>
                  </View>
                </View>
                <View style={s.subAmount}>
                  <Text style={s.subAmountValue}>{formatAmount(sub.amount)}/mois</Text>
                  <Text style={[s.subStatus, { color: sub.status === 'active' ? C.success : C.muted }]}>
                    {sub.status === 'active' ? 'Actif' : 'Inactif'}
                  </Text>
                </View>
              </View>
            ))
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
  revenueCard: { flex: 2, backgroundColor: C.surface, borderRadius: 16, padding: 20, borderWidth: 2, borderColor: C.success },
  revenueValue: { fontSize: 32, fontWeight: '800', color: C.success },
  revenueLabel: { fontSize: 14, fontWeight: '600', color: C.textDark, marginTop: 4 },
  revenueSub: { fontSize: 12, color: C.textLight },
  subsCard: { flex: 1, backgroundColor: C.surface, borderRadius: 16, padding: 20, alignItems: 'center' },
  subsValue: { fontSize: 28, fontWeight: '800', color: C.textDark },
  subsLabel: { fontSize: 12, color: C.textLight, marginTop: 4 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: C.textDark, paddingHorizontal: 20, marginBottom: 12 },
  plansSection: { backgroundColor: C.surface, marginHorizontal: 20, marginBottom: 20, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border },
  planCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  planIndicator: { width: 4, height: 40, borderRadius: 2 },
  planInfo: { flex: 1, marginLeft: 12 },
  planName: { fontSize: 15, fontWeight: '600', color: C.textDark },
  planCount: { fontSize: 12, color: C.textLight },
  planPercentage: { fontSize: 18, fontWeight: '700', color: C.textDark },

  listCard: { backgroundColor: C.surface, marginHorizontal: 20, marginBottom: 20, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border },
  subItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  subAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  subAvatarText: { fontSize: 16, fontWeight: '700', color: C.white },
  subInfo: { flex: 1, marginLeft: 12 },
  subMerchant: { fontSize: 14, fontWeight: '600', color: C.textDark },
  planBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  planBadgeText: { fontSize: 10, fontWeight: '700' },
  subAmount: { alignItems: 'flex-end' },
  subAmountValue: { fontSize: 14, fontWeight: '700', color: C.textDark },
  subStatus: { fontSize: 11, fontWeight: '600', marginTop: 2 },

  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 15, color: C.textLight },
});

export default SubscriptionRevenueScreen;
