import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  Dimensions, ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { FirestoreService } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import { AdminPreferencesService } from '../services/adminPreferencesService';
import { Currency, CurrencyService } from '../services/currencyService';
import UserAvatar from '../components/UserAvatar';
import VerifiedBadge from '../components/VerifiedBadge';

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
  UsersManagement: undefined;
  SalesAnalytics: undefined;
  SubscriptionRevenue: undefined;
  BroadcastMessaging: undefined;
  PromotionMarket: undefined;
  AdminProfile: undefined;
  AdminLinks: undefined;
  AppDownloads: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList>;

const { width: SW } = Dimensions.get('window');

interface StatCard {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  route?: keyof RootStackParamList;
}

const Icon = (c: string) => ({
  Users: <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}><Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round"/><Circle cx="9" cy="7" r="4"/></Svg>,
  Sales: <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}><Path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" strokeLinejoin="round"/></Svg>,
  Store: <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}><Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round"/><Path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round"/></Svg>,
  Revenue: <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}><Rect x="2" y="4" width="20" height="16" rx="2"/><Path d="M7 15h.01M11 15h.01M15 15h.01M7 11h.01M11 11h.01M15 11h.01M7 7h10" strokeLinecap="round" strokeLinejoin="round"/></Svg>,
  Message: <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}><Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"/></Svg>,
  Promo: <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}><Path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" strokeLinecap="round" strokeLinejoin="round"/><Circle cx="7" cy="7" r="1"/></Svg>,
  Download: <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}><Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round"/></Svg>,
  Link: <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}><Path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round"/><Path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round"/></Svg>,
});

const AdminDashboard: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<Currency>('XAF');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMerchants: 0,
    totalClients: 0,
    totalSales: 0,
    totalRevenue: 0,
    activePromotions: 0,
  });

  useEffect(() => {
    loadStats();
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

  const loadStats = async () => {
    try {
      // Get users count
      const users = await FirestoreService.getAll<any>('users');
      const merchants = users.filter((u: any) => u.userType === 'business');
      const clients = users.filter((u: any) => u.userType === 'buyer');

      // Get orders for sales
      let totalSales = 0;
      let completedOrdersCount = 0;
      try {
        const orders = await FirestoreService.getAll<any>('orders');
        const completedOrders = orders.filter((o: any) => o.status === 'delivered' || o.status === 'completed');
        completedOrdersCount = completedOrders.length;
        totalSales = completedOrders.reduce((sum: number, o: any) => sum + (o.total || o.amount || 0), 0);
      } catch (orderError) {
        console.error('Orders collection not found:', orderError);
      }

      // Get promotions
      let activePromos = 0;
      try {
        const promotions = await FirestoreService.getAll<any>('promotions');
        activePromos = promotions.filter((p: any) => p.active !== false).length;
      } catch (promoError) {
        console.error('Promotions collection not found:', promoError);
      }

      setStats({
        totalUsers: users.length,
        totalMerchants: merchants.length,
        totalClients: clients.length,
        totalSales: completedOrdersCount,
        totalRevenue: totalSales,
        activePromotions: activePromos,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({
        totalUsers: 0,
        totalMerchants: 0,
        totalClients: 0,
        totalSales: 0,
        totalRevenue: 0,
        activePromotions: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return CurrencyService.format(amount, currency);
  };

  const statCards: StatCard[] = [
    {
      id: 'users',
      title: 'Total Utilisateurs',
      value: stats.totalUsers.toString(),
      subtitle: `${stats.totalMerchants} marchands · ${stats.totalClients} clients`,
      icon: Icon(C.info).Users,
      color: C.info,
      route: 'UsersManagement',
    },
    {
      id: 'sales',
      title: 'Ventes Totales',
      value: stats.totalSales.toString(),
      subtitle: 'Commandes livrées',
      icon: Icon(C.success).Sales,
      color: C.success,
      route: 'SalesAnalytics',
    },
    {
      id: 'revenue',
      title: 'Chiffre d\'Affaires',
      value: formatAmount(stats.totalRevenue),
      subtitle: 'Abonnements + Ventes',
      icon: Icon(C.purple).Revenue,
      color: C.purple,
      route: 'SubscriptionRevenue',
    },
    {
      id: 'promos',
      title: 'Promotions Actives',
      value: stats.activePromotions.toString(),
      subtitle: 'Marchés de promotion',
      icon: Icon(C.warning).Promo,
      color: C.warning,
      route: 'PromotionMarket',
    },
  ];

  const quickActions = [
    { id: 'message', title: 'Message Global', subtitle: 'Écrire à tous les utilisateurs', icon: Icon(C.accent).Message, color: C.accent, route: 'BroadcastMessaging' },
    { id: 'links', title: 'Liens Admin', subtitle: 'Générer des liens pour les admins', icon: Icon(C.info).Link, color: C.info, route: 'AdminLinks' },
    { id: 'downloads', title: 'Téléchargements', subtitle: 'Applications téléchargées', icon: Icon(C.success).Download, color: C.success, route: 'AppDownloads' },
    { id: 'profile', title: 'Mon Profil', subtitle: 'Gérer mon compte admin', icon: Icon(C.purple).Store, color: C.purple, route: 'AdminProfile' },
  ];

  if (loading) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator size="large" color={C.accent} />
        <Text style={s.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <TouchableOpacity onPress={() => navigation.navigate('AdminProfile' as any)} activeOpacity={0.7}>
            <UserAvatar 
              name={user?.displayName || user?.email?.split('@')[0] || 'Admin'} 
              gender="male" 
              size={56} 
            />
          </TouchableOpacity>
          <View style={s.headerText}>
            <View style={s.nameRow}>
              <Text style={s.headerTitle}>{user?.displayName || user?.email?.split('@')[0] || 'Admin'}</Text>
              <VerifiedBadge size={18} color="#1DA1F2" />
            </View>
            <Text style={s.headerSubtitle}>Super Admin · Vendoo</Text>
          </View>
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <Text style={s.sectionTitle}>Vue d'ensemble</Text>
        <View style={s.statsGrid}>
          {statCards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={[s.statCard, { borderColor: card.color }]}
              onPress={() => card.route && navigation.navigate(card.route as any)}
              activeOpacity={0.8}
            >
              <View style={[s.statIcon, { backgroundColor: card.color + '15' }]}>
                {card.icon}
              </View>
              <Text style={s.statValue}>{card.value}</Text>
              <Text style={s.statTitle}>{card.title}</Text>
              <Text style={s.statSubtitle}>{card.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={s.sectionTitle}>Actions Rapides</Text>
        <View style={s.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[s.actionCard, { borderColor: action.color }]}
              onPress={() => action.route && navigation.navigate(action.route as any)}
              activeOpacity={0.8}
            >
              <View style={[s.actionIcon, { backgroundColor: action.color + '15' }]}>
                {action.icon}
              </View>
              <Text style={s.actionTitle}>{action.title}</Text>
              <Text style={s.actionSubtitle}>{action.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity - Remove demo data */}
        <Text style={s.sectionTitle}>Activité Récente</Text>
        <View style={s.activityCard}>
          <View style={s.emptyContainer}>
            <Text style={s.emptyText}>Aucune activité récente</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },
  loadingText: { marginTop: 12, fontSize: 14, color: C.textLight },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerText: { flexDirection: 'column' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: C.textDark },
  headerSubtitle: { fontSize: 13, color: C.textLight, marginTop: 2 },
  verifiedBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#6B7280', alignItems: 'center', justifyContent: 'center' },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: C.textDark, marginBottom: 16, marginTop: 8 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, minWidth: (SW - 52) / 2, backgroundColor: C.surface, borderRadius: 16, padding: 16, borderWidth: 2, borderColor: C.border },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statValue: { fontSize: 28, fontWeight: '800', color: C.textDark, marginBottom: 4 },
  statTitle: { fontSize: 13, fontWeight: '600', color: C.textMid, marginBottom: 2 },
  statSubtitle: { fontSize: 11, color: C.textLight },

  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  actionCard: { flex: 1, minWidth: (SW - 52) / 2, backgroundColor: C.surface, borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: C.border },
  actionIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  actionTitle: { fontSize: 14, fontWeight: '700', color: C.textDark, marginBottom: 4 },
  actionSubtitle: { fontSize: 11, color: C.textLight, lineHeight: 15 },

  activityCard: { backgroundColor: C.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border },
  activityItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  activityDot: { width: 8, height: 8, borderRadius: 4 },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: 14, fontWeight: '600', color: C.textDark },
  activityTime: { fontSize: 12, color: C.textLight, marginTop: 2 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 15, color: C.textLight },
});

export default AdminDashboard;
