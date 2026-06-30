import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

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
  AppDownloads: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList>;

interface DownloadData {
  platform: string;
  downloads: number;
  rating: number;
  lastUpdate: string;
}

const AppDownloadsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [loading, setLoading] = useState(true);
  const [downloadData, setDownloadData] = useState<DownloadData[]>([]);

  useEffect(() => {
    // No real download data available yet
    setDownloadData([]);
    setLoading(false);
  }, []);

  const totalDownloads = downloadData.reduce((sum, data) => sum + data.downloads, 0);
  const avgRating = downloadData.length > 0 
    ? (downloadData.reduce((sum, data) => sum + data.rating, 0) / downloadData.length).toFixed(1)
    : '0';

  if (loading) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator size="large" color={C.accent} />
        <Text style={s.loadingText}>Chargement des statistiques...</Text>
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
        <Text style={s.headerTitle}>Téléchargements</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Overview Stats */}
        <View style={s.overviewSection}>
          <View style={s.statCard}>
            <Text style={s.statValue}>{totalDownloads.toLocaleString()}</Text>
            <Text style={s.statLabel}>Total Téléchargements</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statValue}>{avgRating}⭐</Text>
            <Text style={s.statLabel}>Note Moyenne</Text>
          </View>
        </View>

        {/* Platform Breakdown */}
        <Text style={s.sectionTitle}>Par Plateforme</Text>
        {downloadData.length === 0 ? (
          <View style={s.emptyContainer}>
            <Text style={s.emptyText}>Aucune donnée de téléchargement disponible</Text>
          </View>
        ) : (
          downloadData.map((data, index) => {
            const percentage = totalDownloads > 0 ? (data.downloads / totalDownloads) * 100 : 0;
            const colors = [C.success, C.info, C.purple];
            const color = colors[index % colors.length];
            
            return (
              <View key={data.platform} style={s.platformCard}>
                <View style={s.platformHeader}>
                  <View style={[s.platformIcon, { backgroundColor: color + '20' }]}>
                    {data.platform.includes('iOS') ? (
                      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
                        <Path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" strokeLinecap="round" strokeLinejoin="round"/>
                      </Svg>
                    ) : data.platform.includes('Google') ? (
                      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
                        <Path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" strokeLinecap="round" strokeLinejoin="round"/>
                      </Svg>
                    ) : (
                      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
                        <Rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <Path d="M3 9h18M9 21V9" strokeLinecap="round" strokeLinejoin="round"/>
                      </Svg>
                    )}
                  </View>
                  <View style={s.platformInfo}>
                    <Text style={s.platformName}>{data.platform}</Text>
                    <Text style={s.platformMeta}>Mis à jour le {data.lastUpdate}</Text>
                  </View>
                </View>
                
                <View style={s.platformStats}>
                  <View style={s.statRow}>
                    <Text style={s.statLabelSmall}>Téléchargements</Text>
                    <Text style={s.statValueSmall}>{data.downloads.toLocaleString()}</Text>
                  </View>
                  <View style={s.statRow}>
                    <Text style={s.statLabelSmall}>Note</Text>
                    <Text style={s.statValueSmall}>{data.rating}⭐</Text>
                  </View>
                  <View style={s.statRow}>
                    <Text style={s.statLabelSmall}>Part</Text>
                    <Text style={s.statValueSmall}>{percentage.toFixed(1)}%</Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={s.progressContainer}>
                  <View style={[s.progressBar, { width: `${percentage}%`, backgroundColor: color }]} />
                </View>
              </View>
            );
          })
        )}

        {/* Trends Section - Remove demo data */}
        <Text style={s.sectionTitle}>Tendances</Text>
        <View style={s.trendsCard}>
          <View style={s.emptyContainer}>
            <Text style={s.emptyText}>Aucune donnée de tendance disponible</Text>
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

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: C.textDark },

  scroll: { flex: 1 },
  overviewSection: { flexDirection: 'row', gap: 12, padding: 20, paddingBottom: 16 },
  statCard: { flex: 1, backgroundColor: C.surface, borderRadius: 16, padding: 20, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '800', color: C.textDark },
  statLabel: { fontSize: 12, color: C.textLight, marginTop: 4, textAlign: 'center' },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: C.textDark, paddingHorizontal: 20, marginBottom: 12, marginTop: 8 },

  platformCard: { backgroundColor: C.surface, marginHorizontal: 20, marginBottom: 16, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: C.border },
  platformHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  platformIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  platformInfo: { flex: 1, marginLeft: 12 },
  platformName: { fontSize: 16, fontWeight: '700', color: C.textDark },
  platformMeta: { fontSize: 12, color: C.textLight, marginTop: 2 },
  platformStats: { gap: 8, marginBottom: 12 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statLabelSmall: { fontSize: 13, color: C.textLight },
  statValueSmall: { fontSize: 15, fontWeight: '700', color: C.textDark },
  progressContainer: { height: 6, backgroundColor: C.bg, borderRadius: 3, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 3 },

  trendsCard: { backgroundColor: C.surface, marginHorizontal: 20, marginBottom: 20, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border },
  trendItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  trendDot: { width: 8, height: 8, borderRadius: 4 },
  trendContent: { flex: 1 },
  trendTitle: { fontSize: 14, fontWeight: '600', color: C.textDark },
  trendSubtitle: { fontSize: 12, color: C.textLight, marginTop: 2 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 15, color: C.textLight },
});

export default AppDownloadsScreen;
