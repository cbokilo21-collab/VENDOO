/**
 * BusinessDashboard — professional, white-dominant overview.
 * Orange is an accent only (CTA, chart line, one KPI chip).
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
} from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient as SvgGrad, Stop } from 'react-native-svg';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BottomNavigation from '../components/BottomNavigation';
import { T, shadow } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import { useBoutique } from '../contexts/BoutiqueContext';
import { useDashboardKPIs } from '../hooks/useRealtimeData';
import { useLanguage } from '../contexts/LanguageContext';
import { NotificationService } from '../services/notificationService';
import { OrderService } from '../services/orderService';

const fmtF = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)} M F` :
  n >= 1_000     ? `${(n / 1_000).toFixed(0)} k F`     :
  `${Math.round(n)} F`;

const isWeb = Platform.OS === 'web';
type Nav = NativeStackNavigationProp<any>;

const BAR_H    = 92;

const getDays = (t: any) => [
  t('dashboard.mon'),
  t('dashboard.tue'),
  t('dashboard.wed'),
  t('dashboard.thu'),
  t('dashboard.fri'),
  t('dashboard.sat'),
  t('dashboard.sun')
];

// Helper to format relative time
const formatRelativeTime = (date: any): string => {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours} h`;
  return `Il y a ${diffDays} j`;
};

const KPIS = [
  { label:'business.orders',    value:'47',       sub:'+8 vs hier',     trend:'+8.0%',  tint:T.infoSoft,    ink:T.info,    icon:'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 10h6M9 14h6' },
  { label:'business.customers',      value:'1 284',    sub:'+23 ce mois',    trend:'+1.8%',  tint:T.successSoft, ink:T.success, icon:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  { label:'business.products',     value:'156',      sub:'4 en stock faible', trend:'',    tint:T.violetSoft,  ink:T.violet,  icon:'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' },
  { label:'business.averageBasket', value:'52 800 F', sub:'+3 200 F',       trend:'+6.5%',  tint:T.orangeSoft,  ink:T.orange,  icon:'M3 6h18M3 6l1.5 12a2 2 0 0 0 2 1.8h10.9a2 2 0 0 0 2-1.8L21 6M16 10a4 4 0 0 1-8 0' },
];

// ── Icon helper ─────────────────────────────────────────────────────────────────
const Ic = ({ d, s=16, c=T.textMid, w=2 }: { d:string; s?:number; c?:string; w?:number }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"
    stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"><Path d={d}/></Svg>
);

// ── Responsive area sparkline ────────────────────────────────────────────────────
const Sparkline: React.FC<{ h:number; data:number[] }> = ({ h, data }) => {
  const [w, setW] = useState(isWeb ? 640 : 300);
  const min = Math.min(...data), max = Math.max(...data);
  const r = max - min || 1;
  const pad = 8;
  const pts = data.map((v,i) => ({
    x: (i/(data.length-1))*(w-pad*2)+pad,
    y: h-((v-min)/r)*(h-16)-8,
  }));
  const line = pts.reduce((acc:string, p:any, i:number) => {
    if (i===0) return `M${p.x},${p.y}`;
    const cx=(pts[i-1].x+p.x)/2;
    return `${acc} C${cx},${pts[i-1].y} ${cx},${p.y} ${p.x},${p.y}`;
  }, '');
  const last = pts[pts.length-1];
  return (
    <View onLayout={e => setW(Math.max(120, e.nativeEvent.layout.width))} style={{ width:'100%' }}>
      <Svg width={w} height={h}>
        <Defs><SvgGrad id="sg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={T.orange} stopOpacity="0.18"/>
          <Stop offset="1" stopColor={T.orange} stopOpacity="0"/>
        </SvgGrad></Defs>
        <Path d={`${line} L${last.x},${h} L${pad},${h} Z`} fill="url(#sg)"/>
        <Path d={line} stroke={T.orange} strokeWidth={2.6} fill="none" strokeLinecap="round"/>
        <Circle cx={last.x} cy={last.y} r={5} fill="#fff" stroke={T.orange} strokeWidth={2.6}/>
      </Svg>
    </View>
  );
};

const notifColorForStatus = (status?:string, t?:any) =>
  status==='paid' || status==='delivered' ? { status:t('business.paid'),        color:T.success, soft:T.successSoft } :
  status==='processing'                   ? { status:t('business.preparing'), color:T.warning, soft:T.warningSoft } :
  status==='shipped'                      ? { status:t('business.shipped'),     color:T.info,    soft:T.infoSoft    } :
  status==='cancelled' || status==='refunded' ? { status:t('business.cancelled'),  color:T.error,   soft:T.errorSoft   } :
                                            { status:t('business.pending'),  color:T.warning, soft:T.warningSoft };

const notifMeta = (type:string) =>
  type==='order'   ? { c:T.info,    soft:T.infoSoft,    d:'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2' } :
  type==='payment' ? { c:T.success, soft:T.successSoft, d:'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' } :
                     { c:T.warning, soft:T.warningSoft, d:'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01' };

// ── Dashboard ─────────────────────────────────────────────────────────────────
const BusinessDashboard: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const { boutiqueData } = useBoutique();
  const { t } = useLanguage();
  
  const translatedKPIs = KPIS.map(kpi => ({ ...kpi, label: t(kpi.label) }));
  const live = useDashboardKPIs(user?.uid ?? null, boutiqueData.id ?? null);
  const [showNotifs, setShowNotifs] = useState(false);
  const [readNotifs, setReadNotifs] = useState<Set<string>>(new Set());
  const [period, setPeriod] = useState<'Jour'|'Semaine'|'Mois'>('Mois');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);

  // Load real notifications
  useEffect(() => {
    const loadNotifications = async () => {
      if (user?.uid) {
        try {
          const notifs = await NotificationService.getUserNotifications(user.uid);
          setNotifications(notifs.slice(0, 10)); // Show last 10 notifications
        } catch (error) {
          console.error('Error loading notifications:', error);
        } finally {
          setLoadingNotifs(false);
        }
      }
    };
    loadNotifications();
  }, [user?.uid]);

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? t('dashboard.goodMorning') : h < 18 ? t('dashboard.goodAfternoon') : t('dashboard.goodEvening');
  })();
  const ownerName = (user?.displayName || user?.email?.split('@')[0] || 'Cyril')
    .replace(/^\w/, (c) => c.toUpperCase());

  // KPI values: use live data only
  const kpiData = [
    { ...translatedKPIs[0], value: String(live.totalOrders), sub: `${live.todayOrders} aujourd'hui`, trend: live.totalOrders > 0 ? '+0%' : '' },
    { ...translatedKPIs[1], value: live.totalCustomers.toLocaleString('fr-FR'), sub: `${live.totalCustomers} clients`, trend: live.totalCustomers > 0 ? '+0%' : '' },
    { ...translatedKPIs[2], value: String(live.totalProducts), sub: `${live.lowStockProducts.length} stock faible`, trend: '' },
    { ...translatedKPIs[3], value: fmtF(live.avgCart), sub: live.totalOrders > 0 ? 'Panier moyen' : '0 F', trend: '' },
  ];
  const revenueValue = fmtF(live.totalRevenue);
  
  // Real orders from Firestore
  const liveOrders = live.recentOrders.map((o: any) => ({
    id: o.orderNumber ?? `#${o.id?.slice(0, 4)}`,
    name: o.client ?? o.customerName ?? 'Client',
    amt: fmtF(o.total ?? 0),
    ...notifColorForStatus(o.status, t),
  }));

  // Real notifications
  const unread = notifications.filter(n => !n.read).length;
  const handleLogout = async () => { try { await signOut(auth); } catch {} };
  const markAllRead = async () => {
    if (user?.uid) {
      await NotificationService.markAllAsRead(user.uid);
      setReadNotifs(new Set(notifications.map((n: any) => n.id)));
    }
  };

  // Calculate real data for charts from orders
  const calculateSparklineData = (): number[] => {
    const orders = live.recentOrders;
    const sparkData = [0, 0, 0, 0, 0, 0, 0]; // Last 7 days
    
    orders.forEach((order: any) => {
      if (!order.createdAt) return;
      const date = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      const daysAgo = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (daysAgo >= 0 && daysAgo < 7) {
        sparkData[6 - daysAgo] += order.total || 0;
      }
    });
    
    return sparkData;
  };

  const calculateBarData = (): number[] => {
    const orders = live.recentOrders;
    const barData = [0, 0, 0, 0, 0, 0, 0]; // Last 7 days
    
    orders.forEach((order: any) => {
      if (!order.createdAt) return;
      const date = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      const daysAgo = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (daysAgo >= 0 && daysAgo < 7) {
        barData[6 - daysAgo] += 1;
      }
    });
    
    const max = Math.max(...barData) || 1;
    return barData.map(v => (v / max) * 100);
  };

  const sparklineData = calculateSparklineData();
  const barData = calculateBarData();

  const content = (
    <View style={{ gap: 16 }}>

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <View style={d.pageHead}>
        <View style={{ flex: 1 }}>
          <Text style={d.greet}>{greeting}, {ownerName} 👋</Text>
          <Text style={d.pageTitle}>{t('nav.home')}</Text>
          <Text style={d.pageSub}>{boutiqueData.nom || 'Ma boutique'} · aperçu en temps réel</Text>
        </View>
        <View style={d.headActions}>
          <View>
            <TouchableOpacity style={d.bellBtn} onPress={() => setShowNotifs(v => !v)} activeOpacity={0.8}>
              <Ic d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" s={19} c={T.textMid} w={1.9}/>
              {unread > 0 && <View style={d.bellBadge}><Text style={d.bellBadgeTxt}>{unread}</Text></View>}
            </TouchableOpacity>
            {showNotifs && (
              <View style={d.notifPanel}>
                <View style={d.notifHead}>
                  <Text style={d.notifTitle}>{t('nav.notifications')}</Text>
                  <TouchableOpacity onPress={markAllRead}><Text style={d.notifMark}>{t('notifications.markAllRead')}</Text></TouchableOpacity>
                </View>
                {notifications.map((n: any) => {
                  const isRead = readNotifs.has(n.id);
                  const m = notifMeta(n.type);
                  return (
                    <TouchableOpacity key={n.id} style={d.notifRow}
                      onPress={() => setReadNotifs(prev => new Set([...prev, n.id]))} activeOpacity={0.7}>
                      <View style={[d.notifIcon, { backgroundColor: m.soft }]}><Ic d={m.d} s={14} c={m.c}/></View>
                      <View style={{ flex:1 }}>
                        <Text style={[d.notifMsg, isRead && { color:T.muted, fontWeight:'500' }]}>{n.title}</Text>
                        <Text style={d.notifTime}>{formatRelativeTime(n.createdAt)}</Text>
                      </View>
                      {!isRead && <View style={d.notifDot}/>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
          <TouchableOpacity style={d.cta} onPress={() => navigation.navigate('POS' as any)} activeOpacity={0.85}>
            <Ic d="M12 5v14M5 12h14" s={17} c="#fff" w={2.4}/>
            <Text style={d.ctaTxt}>Nouvelle vente</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Public Shop Link ─────────────────────────────────────────────── */}
      {boutiqueData.shopUrl && (
        <TouchableOpacity style={d.shopLinkCard} activeOpacity={0.8}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
            <Ic d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" s={20} c={T.orange} w={2}/>
            <View style={{ flex: 1 }}>
              <Text style={d.shopLinkLabel}>Votre boutique en ligne</Text>
              <Text style={d.shopLinkUrl}>{boutiqueData.shopUrl}</Text>
            </View>
          </View>
          <Ic d="M8 17a2 2 0 01-2-2V5a2 2 0 012-2h6a2 2 0 012 2v10a2 2 0 01-2 2H8z" s={18} c={T.orange} w={2}/>
        </TouchableOpacity>
      )}

      {/* ── Revenue card ─────────────────────────────────────────────────── */}
      <View style={d.card}>
        <View style={d.revTop}>
          <View>
            <Text style={d.revLabel}>Chiffre d'affaires · ce mois</Text>
            <View style={d.revAmtRow}>
              <Text style={d.revAmt}>{revenueValue}</Text>
              <View style={d.trendChip}>
                <Ic d="M3 17l6-6 4 4 8-8M21 7h-6M21 7v6" s={12} c={T.success} w={2.4}/>
                <Text style={d.trendTxt}>12.5%</Text>
              </View>
            </View>
          </View>
          <View style={d.periodTabs}>
            {[t('dashboard.day'), t('dashboard.week'), t('dashboard.month')].map((p, idx) => (
              <TouchableOpacity key={idx} onPress={() => setPeriod(['Jour','Semaine','Mois'][idx] as any)}
                style={[d.periodTab, period===['Jour','Semaine','Mois'][idx] && d.periodTabA]} activeOpacity={0.8}>
                <Text style={[d.periodTxt, period===['Jour','Semaine','Mois'][idx] && d.periodTxtA]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <Sparkline h={isWeb ? 120 : 96} data={sparklineData}/>
        <View style={d.dayRow}>
          {getDays(t).map((day: string, i: number) => <Text key={i} style={d.dayLbl}>{day}</Text>)}
        </View>
      </View>

      {/* ── KPI grid ─────────────────────────────────────────────────────── */}
      <View style={d.kpiRow}>
        {kpiData.map(k => (
          <View key={k.label} style={d.kpiCard}>
            <View style={d.kpiTop}>
              <View style={[d.kpiIcon, { backgroundColor:k.tint }]}><Ic d={k.icon} s={18} c={k.ink} w={2}/></View>
              {k.trend ? (
                <View style={d.kpiTrend}>
                  <Ic d="M7 17L17 7M17 7H9M17 7v8" s={11} c={T.success} w={2.4}/>
                  <Text style={d.kpiTrendTxt}>{k.trend}</Text>
                </View>
              ) : null}
            </View>
            <Text style={d.kpiValue}>{k.value}</Text>
            <Text style={d.kpiLabel}>{k.label}</Text>
            <Text style={d.kpiSub}>{k.sub}</Text>
          </View>
        ))}
      </View>

      {/* ── Split : bars + recent orders ─────────────────────────────────── */}
      <View style={d.splitRow}>
        {/* 7-day sales */}
        <View style={[d.card, { flex: 1 }]}>
          <View style={d.secHead}>
            <View>
              <Text style={d.secTitle}>{t('dashboard.last7DaysSales')}</Text>
              <Text style={d.secSub}>{t('dashboard.total')}: {fmtF(sparklineData.reduce((a, b) => a + b, 0))}</Text>
            </View>
          </View>
          <View style={d.bars}>
            {barData.map((pct: number, i: number) => {
              const peak = pct === Math.max(...barData);
              return (
                <View key={i} style={d.barCol}>
                  <View style={d.barTrack}>
                    <View style={{ width:'70%', height: Math.round((pct/100)*BAR_H), borderRadius:6,
                      backgroundColor: peak ? T.orange : T.orangeSoft, borderWidth: peak ? 0 : 1, borderColor: '#FFD9C7' }}/>
                  </View>
                  <Text style={[d.barDay, peak && { color:T.orangeDark, fontWeight:'800' }]}>{getDays(t)[i].slice(0,1)}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Recent orders */}
        <View style={[d.card, { flex: isWeb ? 1.5 : 1 }]}>
          <View style={d.secHead}>
            <Text style={d.secTitle}>{t('dashboard.recentOrders')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Orders' as any)} activeOpacity={0.7}>
              <Text style={d.seeAll}>{t('dashboard.seeAll')} →</Text>
            </TouchableOpacity>
          </View>
          {liveOrders.map((o, i) => (
            <View key={`${o.id}-${i}`} style={[d.orderRow, i === liveOrders.length-1 && { borderBottomWidth:0, paddingBottom:0 }]}>
              <View style={d.oAvatar}><Text style={d.oAvatarTxt}>{o.name.split(' ').map((s:string)=>s[0]).join('')}</Text></View>
              <View style={{ flex:1 }}>
                <Text style={d.oName}>{o.name}</Text>
                <Text style={d.oId}>{o.id}</Text>
              </View>
              <Text style={d.oAmt}>{o.amt}</Text>
              <View style={[d.chip, { backgroundColor:o.soft }]}>
                <Text style={[d.chipTxt, { color:o.color }]}>{o.status}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* ── Quick actions ────────────────────────────────────────────────── */}
      <View style={d.card}>
        <Text style={d.secTitle}>{t('dashboard.quickActions')}</Text>
        <View style={d.quickRow}>
          {[
            { label:t('sidebar.pos'),    route:'POS',       tint:T.orangeSoft,  ink:T.orange,  icon:'M2 3h20v14H2zM8 21h8M12 17v4' },
            { label:t('sidebar.products'),   route:'Products',  tint:T.violetSoft,  ink:T.violet,  icon:'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' },
            { label:t('sidebar.orders'), route:'Orders',    tint:T.infoSoft,    ink:T.info,    icon:'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2' },
            { label:t('sidebar.analytics'), route:'Analytics', tint:T.successSoft, ink:T.success, icon:'M3 3v18h18M7 14l4-4 3 3 5-6' },
            { label:t('sidebar.marketing'), route:'Marketing', tint:T.warningSoft, ink:T.warning, icon:'M3 11l19-9-9 19-2-8-8-2z' },
            { label:t('sidebar.customers'),   route:'Customers', tint:T.violetSoft,  ink:T.violet,  icon:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
          ].map(q => (
            <TouchableOpacity key={q.route} style={d.qItem}
              onPress={() => navigation.navigate(q.route as any)} activeOpacity={0.8}>
              <View style={[d.qBtn, { backgroundColor:q.tint }]}><Ic d={q.icon} s={20} c={q.ink} w={2}/></View>
              <Text style={d.qLabel}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Low stock alerts ────────────────────────────────────────────────── */}
      {live.lowStockProducts.length > 0 && (
        <View style={[d.card, { borderColor:T.error, borderWidth:1.5 }]}>
          <View style={d.secHead}>
            <View>
              <Text style={[d.secTitle, { color:T.error }]}>⚠️ Stock faible</Text>
              <Text style={d.secSub}>{live.lowStockProducts.length} produit(s) nécessitent un réapprovisionnement</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Products' as any)} activeOpacity={0.7}>
              <Text style={d.seeAll}>Voir tout →</Text>
            </TouchableOpacity>
          </View>
          <View style={{ gap:8 }}>
            {live.lowStockProducts.slice(0, 3).map((p: any) => (
              <View key={p.id} style={{ flexDirection:'row', alignItems:'center', gap:12, paddingVertical:8, borderBottomWidth:1, borderBottomColor:T.divider }}>
                <View style={{ width:40, height:40, borderRadius:8, backgroundColor:T.page, alignItems:'center', justifyContent:'center' }}>
                  <Text style={{ fontSize:18 }}>{p.emoji || '📦'}</Text>
                </View>
                <View style={{ flex:1 }}>
                  <Text style={{ fontSize:13, fontWeight:'700', color:T.text }}>{p.nom || p.name}</Text>
                  <Text style={{ fontSize:11, color:T.muted }}>Stock: {p.stock} unités</Text>
                </View>
                <View style={{ paddingHorizontal:8, paddingVertical:4, borderRadius:6, backgroundColor:T.errorSoft }}>
                  <Text style={{ fontSize:11, fontWeight:'700', color:T.error }}>Critique</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

    </View>
  );

  if (!isWeb) {
    return (
      <View style={d.root}>
        <ScrollView contentContainerStyle={d.scrollMobile} showsVerticalScrollIndicator={false}>
          {content}
          <TouchableOpacity style={d.logout} onPress={handleLogout} activeOpacity={0.7}>
            <Ic s={15} c={T.muted} d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            <Text style={d.logoutTxt}>Se déconnecter</Text>
          </TouchableOpacity>
        </ScrollView>
        <BottomNavigation activeRoute="BusinessDashboard"/>
      </View>
    );
  }

  return (
    <ScrollView style={d.rootWeb} contentContainerStyle={d.scrollWeb} showsVerticalScrollIndicator={false}>
      <View style={d.maxw}>{content}</View>
    </ScrollView>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────
const d = StyleSheet.create({
  root:        { flex:1, backgroundColor:T.page },
  rootWeb:     { flex:1, backgroundColor:T.page },
  scrollMobile:{ padding:16, paddingTop: Platform.OS === 'ios' ? 56 : 28, paddingBottom:110 },
  scrollWeb:   { padding:28, paddingBottom:56, alignItems:'center' },
  maxw:        { width:'100%', maxWidth:1240 },

  // Page header
  pageHead:    { flexDirection:'row', alignItems:'flex-start', justifyContent:'space-between', gap:12, zIndex:20 },
  greet:       { fontSize:13, color:T.textSub, fontWeight:'600', marginBottom:3 },
  pageTitle:   { fontSize:26, fontWeight:'800', color:T.text, letterSpacing:-0.6 },
  pageSub:     { fontSize:13, color:T.muted, marginTop:3 },
  headActions: { flexDirection:'row', alignItems:'center', gap:10 },
  bellBtn:     { width:42, height:42, borderRadius:12, backgroundColor:T.surface, borderWidth:1, borderColor:T.border, alignItems:'center', justifyContent:'center', ...shadow.card },
  bellBadge:   { position:'absolute', top:-3, right:-3, minWidth:18, height:18, paddingHorizontal:4, borderRadius:9, backgroundColor:T.error, alignItems:'center', justifyContent:'center', borderWidth:2, borderColor:T.surface },
  bellBadgeTxt:{ color:'#fff', fontSize:9, fontWeight:'900' },
  cta:         { flexDirection:'row', alignItems:'center', gap:7, backgroundColor:T.orange, paddingHorizontal:16, height:42, borderRadius:12, shadowColor:T.orange, shadowOpacity:0.3, shadowRadius:12, shadowOffset:{width:0,height:4} },
  ctaTxt:      { color:'#fff', fontWeight:'700', fontSize:13.5 },

  // Notif panel
  notifPanel:  { position:'absolute', top:50, right:0, width:320, backgroundColor:T.surface, borderRadius:16, borderWidth:1, borderColor:T.border, overflow:'hidden', ...shadow.pop, zIndex:50 },
  notifHead:   { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:16, paddingVertical:13, borderBottomWidth:1, borderBottomColor:T.divider },
  notifTitle:  { fontSize:14, fontWeight:'800', color:T.text },
  notifMark:   { fontSize:12, color:T.orange, fontWeight:'700' },
  notifRow:    { flexDirection:'row', alignItems:'center', gap:12, paddingHorizontal:16, paddingVertical:12, borderBottomWidth:1, borderBottomColor:T.divider },
  notifIcon:   { width:34, height:34, borderRadius:10, alignItems:'center', justifyContent:'center' },
  notifMsg:    { fontSize:12.5, fontWeight:'600', color:T.textMid, lineHeight:17 },
  notifTime:   { fontSize:11, color:T.muted, marginTop:2 },
  notifDot:    { width:8, height:8, borderRadius:4, backgroundColor:T.orange },

  // Shop link card
  shopLinkCard:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingVertical:14, backgroundColor:T.orange+'12', borderRadius:14, borderWidth:1.5, borderColor:T.orange+'40', gap:12 },
  shopLinkLabel:{ fontSize:12, fontWeight:'700', color:T.textMid, marginBottom:2 },
  shopLinkUrl: { fontSize:13, fontWeight:'600', color:T.orange },

  // Generic card
  card:        { backgroundColor:T.surface, borderRadius:16, padding:18, borderWidth:1, borderColor:T.border, ...shadow.card },

  // Revenue
  revTop:      { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 },
  revLabel:    { fontSize:12, color:T.textSub, fontWeight:'600', marginBottom:6 },
  revAmtRow:   { flexDirection:'row', alignItems:'center', gap:10 },
  revAmt:      { fontSize:28, fontWeight:'800', color:T.text, letterSpacing:-0.8 },
  trendChip:   { flexDirection:'row', alignItems:'center', gap:3, backgroundColor:T.successSoft, paddingHorizontal:8, paddingVertical:4, borderRadius:8 },
  trendTxt:    { color:T.success, fontWeight:'800', fontSize:12 },
  periodTabs:  { flexDirection:'row', backgroundColor:T.page, borderRadius:10, padding:3, gap:2 },
  periodTab:   { paddingHorizontal:12, paddingVertical:6, borderRadius:8 },
  periodTabA:  { backgroundColor:T.surface, ...shadow.card },
  periodTxt:   { fontSize:12, fontWeight:'600', color:T.textSub },
  periodTxtA:  { color:T.text, fontWeight:'700' },
  dayRow:      { flexDirection:'row', justifyContent:'space-between', marginTop:6, paddingHorizontal:4 },
  dayLbl:      { fontSize:10, color:T.muted, fontWeight:'600', flex:1, textAlign:'center' },

  // KPI
  kpiRow:      { flexDirection:'row', gap:14, flexWrap:'wrap' },
  kpiCard:     { flex:1, minWidth:150, backgroundColor:T.surface, borderRadius:16, padding:16, borderWidth:1, borderColor:T.border, ...shadow.card },
  kpiTop:      { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 },
  kpiIcon:     { width:38, height:38, borderRadius:11, alignItems:'center', justifyContent:'center' },
  kpiTrend:    { flexDirection:'row', alignItems:'center', gap:2, backgroundColor:T.successSoft, paddingHorizontal:6, paddingVertical:3, borderRadius:7 },
  kpiTrendTxt: { color:T.success, fontWeight:'800', fontSize:10.5 },
  kpiValue:    { fontSize:22, fontWeight:'800', color:T.text, letterSpacing:-0.6 },
  kpiLabel:    { fontSize:12.5, color:T.textMid, fontWeight:'600', marginTop:3 },
  kpiSub:      { fontSize:11, color:T.muted, marginTop:2 },

  // Split
  splitRow:    { flexDirection: isWeb ? 'row' : 'column', gap:14 },

  // Section head
  secHead:     { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 },
  secTitle:    { fontSize:14, fontWeight:'800', color:T.text },
  secSub:      { fontSize:12, color:T.muted, marginTop:2 },
  seeAll:      { fontSize:12.5, color:T.orange, fontWeight:'700' },

  // Bars
  bars:        { flexDirection:'row', alignItems:'flex-end', gap:6, height:BAR_H+22 },
  barCol:      { flex:1, alignItems:'center', gap:8, justifyContent:'flex-end' },
  barTrack:    { width:'100%', height:BAR_H, alignItems:'center', justifyContent:'flex-end' },
  barDay:      { fontSize:11, color:T.muted, fontWeight:'600' },

  // Orders
  orderRow:    { flexDirection:'row', alignItems:'center', gap:11, paddingVertical:11, borderBottomWidth:1, borderBottomColor:T.divider },
  oAvatar:     { width:36, height:36, borderRadius:10, backgroundColor:T.page, alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:T.border },
  oAvatarTxt:  { fontSize:12, fontWeight:'800', color:T.textMid },
  oName:       { fontSize:13, fontWeight:'700', color:T.text },
  oId:         { fontSize:11, color:T.muted, marginTop:1 },
  oAmt:        { fontSize:13, fontWeight:'800', color:T.text, marginRight:8 },
  chip:        { paddingHorizontal:9, paddingVertical:4, borderRadius:8 },
  chipTxt:     { fontSize:11, fontWeight:'700' },

  // Quick actions
  quickRow:    { flexDirection:'row', flexWrap:'wrap', gap:18, marginTop:16 },
  qItem:       { alignItems:'center', gap:8, minWidth:60 },
  qBtn:        { width:54, height:54, borderRadius:15, alignItems:'center', justifyContent:'center' },
  qLabel:      { fontSize:11.5, color:T.textMid, fontWeight:'600', textAlign:'center' },

  // Logout (mobile)
  logout:      { flexDirection:'row', alignItems:'center', gap:8, paddingVertical:18, justifyContent:'center' },
  logoutTxt:   { fontSize:12.5, color:T.muted, fontWeight:'600' },
});

export default BusinessDashboard;
