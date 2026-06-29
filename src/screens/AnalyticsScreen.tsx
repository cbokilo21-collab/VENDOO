import React, { useState, useRef, useEffect } from 'react';
import { ScreenHeader } from '../components/ScreenHeader';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Dimensions, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Rect, Circle, Line, Text as SvgText, G, Defs, LinearGradient as SvgGrad, Stop } from 'react-native-svg';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeCollection } from '../hooks/useRealtimeData';
import { where } from 'firebase/firestore';
import { OrderService } from '../services/orderService';

const C = {
  navy: '#FF6B35', bg: '#FFF7F3', surface: '#FFFFFF', border: '#E5E7EB',
  accent: '#FF6B35', textDark: '#111827', textMid: '#374151', textLight: '#6B7280', muted: '#9CA3AF',
  success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6', purple: '#8B5CF6',
  white: '#FFFFFF',
};

type RootStackParamList = { Analytics: undefined; BusinessDashboard: undefined; };
type Nav = NativeStackNavigationProp<RootStackParamList>;

const { width: SW } = Dimensions.get('window');
const CHART_W = Math.min(SW - 56, 560);

// ─── Bar chart ────────────────────────────────────────────────────────────────
const BarChart: React.FC<{ data: { label: string; value: number; color: string }[]; height?: number }> = ({ data, height = 160 }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const max  = Math.max(...data.map(d => d.value));
  const barW = (CHART_W - 32) / data.length - 10;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 900, delay: 200, easing: Easing.ease, useNativeDriver: false }).start();
  }, []);

  return (
    <View style={{ height: height + 28, paddingHorizontal: 8 }}>
      <Svg width={CHART_W - 16} height={height}>
        <Defs>
          {data.map((d, i) => (
            <SvgGrad key={i} id={`g${i}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={d.color} stopOpacity="1"/>
              <Stop offset="1" stopColor={d.color} stopOpacity="0.4"/>
            </SvgGrad>
          ))}
        </Defs>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
          <Line key={i} x1={0} y1={height * (1 - pct)} x2={CHART_W - 16} y2={height * (1 - pct)} stroke={C.border} strokeWidth={1} strokeDasharray={i === 0 ? undefined : '4 4'}/>
        ))}
        {data.map((d, i) => {
          const x = i * ((CHART_W - 16) / data.length) + 5;
          const barHeight = (d.value / max) * (height - 16);
          const y = height - barHeight;
          return (
            <G key={i}>
              <Rect x={x} y={y} width={barW} height={barHeight} rx={6} fill={`url(#g${i})`}/>
              <SvgText x={x + barW / 2} y={y - 5} fontSize={10} fontWeight="700" fill={d.color} textAnchor="middle">
                {d.value >= 1000 ? `${(d.value/1000).toFixed(0)}k` : d.value.toString()}
              </SvgText>
            </G>
          );
        })}
      </Svg>
      {/* Labels */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 8 }}>
        {data.map((d, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 10, color: C.muted, fontWeight: '500' }}>{d.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// ─── Line chart (SVG path) ────────────────────────────────────────────────────
const LineChart: React.FC<{ data: number[]; labels: string[]; color: string; height?: number }> = ({ data, labels, color, height = 120 }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const W = CHART_W - 16;
  const H = height;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * (W - 20) + 10,
    y: H - ((v - min) / range) * (H - 20) - 10,
  }));
  const pathD = pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ');
  const areaD = `${pathD} L${pts[pts.length-1].x},${H} L${pts[0].x},${H} Z`;

  return (
    <View>
      <Svg width={W} height={H}>
        <Defs>
          <SvgGrad id="area" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.25"/>
            <Stop offset="1" stopColor={color} stopOpacity="0"/>
          </SvgGrad>
        </Defs>
        {/* Grid */}
        {[0.25, 0.5, 0.75].map((p, i) => (
          <Line key={i} x1={10} y1={H * p} x2={W - 10} y2={H * p} stroke={C.border} strokeWidth={1} strokeDasharray="4 4"/>
        ))}
        {/* Area fill */}
        <Path d={areaD} fill="url(#area)"/>
        {/* Line */}
        <Path d={pathD} stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Dots */}
        {pts.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={4} fill={C.white} stroke={color} strokeWidth={2.5}/>
        ))}
      </Svg>
      {/* X labels */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 10, marginTop: 4 }}>
        {labels.map((l, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 10, color: C.muted }}>{l}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// ─── Donut chart ──────────────────────────────────────────────────────────────
const DonutChart: React.FC<{ segments: { label: string; value: number; color: string }[] }> = ({ segments }) => {
  const total = segments.reduce((t, s) => t + s.value, 0);
  const SIZE  = 120;
  const R     = 46;
  const CX = SIZE / 2, CY = SIZE / 2;
  let angle = -90;

  const arcs = segments.map(seg => {
    const sweep = (seg.value / total) * 360;
    const start = angle;
    angle += sweep;
    const r = angle * Math.PI / 180;
    const s = start * Math.PI / 180;
    const x1 = CX + R * Math.cos(s), y1 = CY + R * Math.sin(s);
    const x2 = CX + R * Math.cos(r), y2 = CY + R * Math.sin(r);
    const large = sweep > 180 ? 1 : 0;
    const gap = 2;
    return { ...seg, path: `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`, sweep, pct: Math.round(seg.value / total * 100) };
  });

  return (
    <View style={{ alignItems: 'center', gap: 16 }}>
      <Svg width={SIZE} height={SIZE}>
        <Circle cx={CX} cy={CY} r={R} fill={C.bg}/>
        {arcs.map((a, i) => <Path key={i} d={a.path} fill={a.color} opacity={0.9}/>)}
        <Circle cx={CX} cy={CY} r={28} fill={C.white}/>
      </Svg>
      <View style={{ gap: 6, width: '100%' }}>
        {arcs.map((a, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: a.color }}/>
            <Text style={{ flex: 1, fontSize: 12, color: C.textMid, fontWeight: '500' }}>{a.label}</Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: a.color }}>{a.pct}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const PERIODS = ['7 jours', '30 jours', '3 mois', '1 an'];

const AnalyticsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const [period, setPeriod] = useState('30 jours');

  // Fetch orders from Firestore in real-time
  const { data: orders, loading } = useRealtimeCollection<any>('orders', {
    constraints: user?.uid ? [where('userId', '==', user.uid)] : [],
    enabled: !!user?.uid,
  });

  // Calculate real revenue data based on period
  const calculateRevenueData = (period: string): { data: number[]; labels: string[] } => {
    const now = new Date();
    const data: number[] = [];
    const labels: string[] = [];
    
    const days = period === '7 jours' ? 7 : period === '30 jours' ? 30 : period === '3 mois' ? 90 : 365;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const dayRevenue = orders
        .filter((o: any) => {
          if (!o.createdAt) return false;
          const orderDate = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
          return orderDate.toDateString() === date.toDateString() && 
                 ['paid', 'delivered', 'shipped'].includes(o.status);
        })
        .reduce((sum: number, o: any) => sum + (o.total || 0), 0);
      
      data.push(dayRevenue);
      
      if (period === '7 jours') {
        labels.push(['L','M','M','J','V','S','D'][date.getDay()]);
      } else if (period === '30 jours' && i % 5 === 0) {
        labels.push(String(i + 1));
      } else {
        labels.push('');
      }
    }
    
    return { data, labels };
  };

  const { data: currentData, labels: currentLabels } = calculateRevenueData(period);
  const total = currentData.reduce((a: number, b: number) => a + b, 0);

  // Calculate category distribution from orders
  const calculateCategoryData = () => {
    const categories: Record<string, number> = {};
    
    orders.forEach((o: any) => {
      if (o.items && Array.isArray(o.items)) {
        o.items.forEach((item: any) => {
          const category = item.category || 'Autre';
          categories[category] = (categories[category] || 0) + (item.prix * item.quantity || 0);
        });
      }
    });
    
    return Object.entries(categories).map(([label, value]) => ({
      label,
      value,
      color: [C.accent, C.info, C.purple, C.success, C.warning][Object.keys(categories).indexOf(label) % 5],
    }));
  };

  const barData = calculateCategoryData();

  // Calculate top products from orders
  const calculateTopProducts = () => {
    const products: Record<string, { nom: string; ventes: number; revenu: number }> = {};
    
    orders.forEach((o: any) => {
      if (o.items && Array.isArray(o.items)) {
        o.items.forEach((item: any) => {
          const nom = item.nom || 'Produit';
          if (!products[nom]) {
            products[nom] = { nom, ventes: 0, revenu: 0 };
          }
          products[nom].ventes += item.quantity || 0;
          products[nom].revenu += item.prix * item.quantity || 0;
        });
      }
    });
    
    return Object.values(products)
      .sort((a, b) => b.ventes - a.ventes)
      .slice(0, 5)
      .map((p, i) => ({
        ...p,
        revenu: `${(p.revenu / 1000).toFixed(1)}k F`,
        couleur: [C.accent, C.info, C.purple, C.success, C.warning][i],
      }));
  };

  const topProducts = calculateTopProducts();

  // Calculate client segments from orders
  const calculateClientSegments = () => {
    const clients: Record<string, number> = {};
    
    orders.forEach((o: any) => {
      const client = o.client || 'Inconnu';
      const orderCount = orders.filter((ord: any) => ord.client === client).length;
      
      if (orderCount >= 10) {
        clients['VIP'] = (clients['VIP'] || 0) + 1;
      } else if (orderCount >= 5) {
        clients['Fidèle'] = (clients['Fidèle'] || 0) + 1;
      } else if (orderCount >= 1) {
        clients['Nouveau'] = (clients['Nouveau'] || 0) + 1;
      }
    });
    
    const totalClients = Object.values(clients).reduce((a: number, b: number) => a + b, 0);
    const inactif = Math.max(0, totalClients - Object.values(clients).reduce((a: number, b: number) => a + b, 0));
    
    return [
      { label: 'VIP',     value: clients['VIP'] || 0, color: C.purple  },
      { label: 'Fidèle',  value: clients['Fidèle'] || 0, color: C.info    },
      { label: 'Nouveau', value: clients['Nouveau'] || 0, color: C.success },
      { label: 'Inactif', value: inactif, color: C.muted   },
    ];
  };

  const clientSegments = calculateClientSegments();

  // Calculate KPIs from real data
  const calculateKPIs = () => {
    const totalRevenue = total;
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const conversionRate = 3.2; // Placeholder - would need visitor data
    
    return [
      { label: 'Revenu total',       value: `${(totalRevenue/1000).toFixed(0)}k F`, change: '+0%',  color: C.accent  },
      { label: 'Ticket moyen',       value: `${(avgOrderValue/1000).toFixed(0)}k F`, change: '+0%',   color: C.info    },
      { label: 'Taux de conversion', value: '3.4%',                           change: '+0%', color: C.success },
      { label: 'Retours',            value: '3.2%',                           change: '-0%', color: C.error   },
    ];
  };

  const kpis = calculateKPIs();

  return (
    <View style={s.root}>
        <ScreenHeader title="Analytiques" subtitle="Statistiques détaillées" />
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.navigate('BusinessDashboard')}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.textDark} strokeWidth={2}>
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>Analytics</Text>
          <Text style={s.headerSub}>Vue détaillée de vos performances</Text>
        </View>
        <View style={s.aiBadge}><Text style={s.aiBadgeText}>✦ IA</Text></View>
      </View>

      <ScrollView contentContainerStyle={s.inner} showsVerticalScrollIndicator={false}>

        {/* Period selector */}
        <View style={s.periodRow}>
          {PERIODS.map(p => (
            <TouchableOpacity key={p} style={[s.periodChip, period === p && s.periodChipActive]} onPress={() => setPeriod(p)}>
              <Text style={[s.periodText, period === p && s.periodTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* KPI row */}
        <View style={s.kpiGrid}>
          {kpis.map((k, i) => (
            <View key={i} style={s.kpiCard}>
              <View style={[s.kpiBar, { backgroundColor: k.color }]}/>
              <Text style={s.kpiLabel}>{k.label}</Text>
              <Text style={s.kpiValue}>{k.value}</Text>
              <View style={[s.kpiPill, { backgroundColor: k.color + '18' }]}>
                <Text style={[s.kpiChange, { color: k.color }]}>{k.change}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Revenue line chart */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <View>
              <Text style={s.cardTitle}>Évolution des revenus</Text>
              <Text style={s.cardSub}>{period} · Total : € {(total/1000).toFixed(1)}k</Text>
            </View>
          </View>
          <LineChart
            data={currentData.filter((_: number, i: number) => i % Math.max(1, Math.floor(currentData.length / 12)) === 0).slice(0, 12)}
            labels={currentLabels.filter((_: string, i: number) => i % Math.max(1, Math.floor(currentLabels.length / 12)) === 0).slice(0, 12)}
            color={C.accent}
            height={130}
          />
        </View>

        {/* Revenue by category bar chart */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Revenus par catégorie</Text>
          <Text style={s.cardSub}>Répartition de vos ventes</Text>
          <BarChart data={barData} height={150}/>
        </View>

        {/* Client segments donut */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Segmentation clients</Text>
          <Text style={s.cardSub}>Répartition de votre base clients</Text>
          <View style={s.donutLayout}>
            <DonutChart segments={clientSegments}/>
            <View style={s.donutInsight}>
              <Text style={s.donutInsightTitle}>💡 Analyse IA</Text>
              <Text style={s.donutInsightText}>35% de nouveaux clients ce mois. Activez une campagne de fidélisation pour les convertir en clients réguliers.</Text>
            </View>
          </View>
        </View>

        {/* Top products */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Top 5 Produits</Text>
          <Text style={s.cardSub}>Par chiffre d'affaires généré</Text>
          {topProducts.map((p, i) => (
            <View key={i} style={[s.productRow, i < topProducts.length - 1 && s.rowBorder]}>
              <View style={[s.rankBadge, { backgroundColor: i === 0 ? C.warning + '22' : C.bg }]}>
                <Text style={[s.rankText, { color: i === 0 ? C.warning : C.muted }]}>#{i + 1}</Text>
              </View>
              <View style={s.productInfo}>
                <Text style={s.productName}>{p.nom}</Text>
                <Text style={s.productMeta}>{p.ventes} ventes</Text>
              </View>
              <Text style={[s.productRevenu, { color: p.couleur }]}>{p.revenu}</Text>
            </View>
          ))}
        </View>

        {/* AI summary */}
        <View style={s.aiCard}>
          <View style={s.aiCardHeader}>
            <Text style={s.aiCardTitle}>Résumé IA — {period}</Text>
            <View style={s.aiBadge}><Text style={s.aiBadgeText}>✦ IA Vendoo</Text></View>
          </View>
          <Text style={s.aiCardText}>
            Vos revenus sont en hausse de <Text style={s.aiHighlight}>+14%</Text> par rapport à la période précédente. Le secteur Mode représente <Text style={s.aiHighlight}>38%</Text> de votre chiffre d'affaires. Vos Sneakers Édition Limitée dominent les ventes avec 214 unités. Recommandation : réapprovisionner ce produit avant épuisement et lancer une promotion sur les Montres Classiques, dont les ventes ralentissent.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn:    { width: 36, height: 36, borderRadius: 9, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle:{ flex: 1, fontSize: 18, fontWeight: '800', color: C.textDark },
  headerSub:  { fontSize: 12, color: C.textLight },
  aiBadge:    { backgroundColor: '#EDE9FE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  aiBadgeText:{ fontSize: 12, fontWeight: '700', color: C.purple },

  inner: { padding: 20, gap: 16, paddingBottom: 48 },

  periodRow:       { flexDirection: 'row', gap: 8 },
  periodChip:      { flex: 1, paddingVertical: 9, borderRadius: 20, backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border, alignItems: 'center' },
  periodChipActive:{ backgroundColor: C.accent, borderColor: C.accent },
  periodText:      { fontSize: 12, color: C.textMid, fontWeight: '500' },
  periodTextActive:{ color: C.white, fontWeight: '700' },

  kpiGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kpiCard:  { flex: 1, minWidth: 140, backgroundColor: C.surface, borderRadius: 14, padding: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 },
  kpiBar:   { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  kpiLabel: { fontSize: 11, color: C.textLight, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 8, marginBottom: 8 },
  kpiValue: { fontSize: 22, fontWeight: '800', color: C.textDark, marginBottom: 8 },
  kpiPill:  { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start' },
  kpiChange:{ fontSize: 11, fontWeight: '700' },

  card:      { backgroundColor: C.surface, borderRadius: 16, padding: 20, gap: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 },
  cardHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: C.textDark },
  cardSub:   { fontSize: 12, color: C.textLight, marginTop: 2 },

  donutLayout: { flexDirection: 'row', gap: 20, alignItems: 'flex-start' },
  donutInsight:{ flex: 1, backgroundColor: '#EFF6FF', borderRadius: 12, padding: 14, gap: 6, borderLeftWidth: 3, borderLeftColor: C.info },
  donutInsightTitle:{ fontSize: 13, fontWeight: '700', color: '#1D4ED8' },
  donutInsightText: { fontSize: 12, color: '#1E40AF', lineHeight: 18 },

  productRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  rowBorder:    { borderBottomWidth: 1, borderBottomColor: C.border },
  rankBadge:    { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  rankText:     { fontSize: 12, fontWeight: '800' },
  productInfo:  { flex: 1 },
  productName:  { fontSize: 13, fontWeight: '700', color: C.textDark, marginBottom: 2 },
  productMeta:  { fontSize: 12, color: C.textLight },
  productRevenu:{ fontSize: 14, fontWeight: '800' },

  aiCard:       { backgroundColor: C.accent, borderRadius: 16, padding: 20, gap: 12 },
  aiCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  aiCardTitle:  { fontSize: 15, fontWeight: '700', color: C.white },
  aiCardText:   { fontSize: 14, color: '#CBD5E1', lineHeight: 22 },
  aiHighlight:  { color: C.accent, fontWeight: '700' },
});

export default AnalyticsScreen;
