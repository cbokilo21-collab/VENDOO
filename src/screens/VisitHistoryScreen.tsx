import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { VisitHistoryService, VisitHistory } from '../services/visitHistoryService';
import { T } from '../theme';

const VisitHistoryScreen: React.FC = () => {
  const { user } = useAuth();
  const [visitHistory, setVisitHistory] = useState<VisitHistory[]>([]);
  const [totalVisits, setTotalVisits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const history = await VisitHistoryService.getVisitHistory(user.uid);
        const total = await VisitHistoryService.getTotalVisits(user.uid);
        setVisitHistory(history);
        setTotalVisits(total);
      } catch (error) {
        console.error('Error loading visit history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatRelativeTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} j`;
    return formatDate(timestamp);
  };

  if (loading) {
    return (
      <View style={s.root}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Historique des quartiers</Text>
          <Text style={s.headerSub}>Vos visites de la Marketplace</Text>
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
        <Text style={s.headerTitle}>Historique des quartiers</Text>
        <Text style={s.headerSub}>Vos visites de la Marketplace</Text>
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View style={s.statsCard}>
          <View style={s.statItem}>
            <Text style={s.statValue}>{totalVisits}</Text>
            <Text style={s.statLabel}>Visites totales</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statValue}>{visitHistory.length}</Text>
            <Text style={s.statLabel}>Quartiers visités</Text>
          </View>
        </View>

        {/* Most Visited Districts */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Quartiers les plus visités</Text>
          {visitHistory.length === 0 ? (
            <Text style={s.emptyText}>Aucune visite enregistrée</Text>
          ) : (
            visitHistory.map((visit, index) => (
              <View key={visit.id} style={s.visitCard}>
                <View style={s.visitRank}>
                  <Text style={s.visitRankText}>{index + 1}</Text>
                </View>
                <View style={s.visitInfo}>
                  <Text style={s.visitDistrict}>{visit.district}</Text>
                  <Text style={s.visitCount}>{visit.visitCount} visite{visit.visitCount > 1 ? 's' : ''}</Text>
                </View>
                <View style={s.visitMeta}>
                  <Text style={s.visitLastVisit}>{formatRelativeTime(visit.lastVisit)}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Recent Visits */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Visites récentes</Text>
          {visitHistory.length === 0 ? (
            <Text style={s.emptyText}>Aucune visite récente</Text>
          ) : (
            visitHistory
              .sort((a, b) => {
                const dateA = a.lastVisit ? (a.lastVisit.toDate ? a.lastVisit.toDate() : new Date(a.lastVisit)) : new Date(0);
                const dateB = b.lastVisit ? (b.lastVisit.toDate ? b.lastVisit.toDate() : new Date(b.lastVisit)) : new Date(0);
                return dateB.getTime() - dateA.getTime();
              })
              .slice(0, 5)
              .map((visit) => (
                <View key={visit.id} style={s.recentCard}>
                  <Text style={s.recentDistrict}>{visit.district}</Text>
                  <Text style={s.recentDate}>{formatDate(visit.lastVisit)}</Text>
                </View>
              ))
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
  
  statsCard: {
    flexDirection: 'row', backgroundColor: T.surface, borderRadius: 16,
    padding: 20, marginBottom: 24, borderWidth: 1, borderColor: T.border,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800', color: T.orange, marginBottom: 4 },
  statLabel: { fontSize: 13, color: T.textSub },
  statDivider: { width: 1, backgroundColor: T.border, marginHorizontal: 16 },
  
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: T.text, marginBottom: 16 },
  
  visitCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: T.surface,
    borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: T.border,
  },
  visitRank: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: T.orange,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  visitRankText: { fontSize: 14, fontWeight: '800', color: T.white },
  visitInfo: { flex: 1 },
  visitDistrict: { fontSize: 15, fontWeight: '600', color: T.text, marginBottom: 4 },
  visitCount: { fontSize: 12, color: T.textSub },
  visitMeta: {},
  visitLastVisit: { fontSize: 12, color: T.textSub },
  
  recentCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: T.surface, borderRadius: 12, padding: 16, marginBottom: 8,
    borderWidth: 1, borderColor: T.border,
  },
  recentDistrict: { fontSize: 14, fontWeight: '600', color: T.text },
  recentDate: { fontSize: 12, color: T.textSub },
  
  emptyText: { fontSize: 14, color: T.textSub, textAlign: 'center', padding: 20 },
});

export default VisitHistoryScreen;
