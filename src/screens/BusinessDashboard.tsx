/**
 * BusinessDashboard — professional, white-dominant overview.
 * Orange is an accent only (CTA, chart line, one KPI chip).
 */
import React, { useState } from 'react';
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

const fmtF = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)} M F` :
  n >= 1_000     ? `${(n / 1_000).toFixed(0)} k F`     :
  `${Math.round(n)} F`;

const isWeb = Platform.OS === 'web';
type Nav = NativeStackNavigationProp<any>;

const SPARK    = [11.2, 15.8, 13.4, 19.6, 17.1, 22.3, 24.85];
const DAYS     = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
const BAR_VALS = [68, 82, 55, 91, 78, 95, 100];
const BAR_H    = 92;

const NOTIFS = [
  { id:1, msg:'Nouvelle commande #1848 — 76 400 F', time:'Il y a 2 min', type:'order'   },
  { id:2, msg:'Stock faible : Chemise Blanche (2 restants)', time:'Il y a 1h', type:'stock' },
  { id:3, msg:'Paiement reçu pour #1847 — Marie D.', time:'Il y a 3h', type:'payment' },
];

const ORDERS = [
  { id:'#1847', name:'Marie Dubois',   amt:'76 500 F',  status:'Payé',        color:T.success, soft:T.successSoft },
  { id:'#1846', name:'Thomas Martin',  amt:'124 800 F', status:'Préparation', color:T.warning, soft:T.warningSoft },
  { id:'#1845', name:'Sophie Laurent', amt:'67 200 F',  status:'Expédié',     color:T.info,    soft:T.infoSoft    },
  { id:'#1844', name:'Pierre Moreau',  amt:'245 000 F', status:'Payé',        color:T.success, soft:T.successSoft },
];

const KPIS = [
  { label:'Commandes',    value:'47',       sub:'+8 vs hier',     trend:'+8.0%',  tint:T.infoSoft,    ink:T.info,    icon:'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 10h6M9 14h6' },
  { label:'Clients',      value:'1 284',    sub:'+23 ce mois',    trend:'+1.8%',  tint:T.successSoft, ink:T.success, icon:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  { label:'Produits',     value:'156',      sub:'4 en stock faible', trend:'',    tint:T.violetSoft,  ink:T.violet,  icon:'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' },
  { label:'Panier moyen', value:'52 800 F', sub:'+3 200 F',       trend:'+6.5%',  tint:T.orangeSoft,  ink:T.orange,  icon:'M3 6h18M3 6l1.5 12a2 2 0 0 0 2 1.8h10.9a2 2 0 0 0 2-1.8L21 6M16 10a4 4 0 0 1-8 0' },
];

// ── Icon helper ─────────────────────────────────────────────────────────────────
const Ic = ({ d, s=16, c=T.textMid, w=2 }: { d:string; s?:number; c?:string; w?:number }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"
    stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"><Path d={d}/></Svg>
);

// ── Responsive area sparkline ────────────────────────────────────────────────────
const Sparkline: React.FC<{ h:number }> = ({ h }) => {
  const [w, setW] = useState(isWeb ? 640 : 300);
  const min = Math.min(...SPARK), max = Math.max(...SPARK);
  const r = max - min || 1;
  const pad = 8;
  const pts = SPARK.map((v,i) => ({
    x: (i/(SPARK.length-1))*(w-pad*2)+pad,
    y: h-((v-min)/r)*(h-16)-8,
  }));
  const line = pts.reduce((acc,p,i) => {
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

const notifColorForStatus = (status?:string) =>
  status==='paid' || status==='delivered' ? { status:'Payé',        color:T.success, soft:T.successSoft } :
  status==='processing'                   ? { status:'Préparation', color:T.warning, soft:T.warningSoft } :
  status==='shipped'                      ? { status:'Expédié',     color:T.info,    soft:T.infoSoft    } :
  status==='cancelled' || status==='refunded' ? { status:'Annulé',  color:T.error,   soft:T.errorSoft   } :
                                            { status:'En attente',  color:T.warning, soft:T.warningSoft };

const notifMeta = (type:string) =>
  type==='order'   ? { c:T.info,    soft:T.infoSoft,    d:'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2' } :
  type==='payment' ? { c:T.success, soft:T.successSoft, d:'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' } :
                     { c:T.warning, soft:T.warningSoft, d:'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01' };

// ── Dashboard ─────────────────────────────────────────────────────────────────
const BusinessDashboard: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const { boutiqueData } = useBoutique();
  const live = useDashboardKPIs(user?.uid ?? null);
  const [showNotifs, setShowNotifs] = useState(false);
  const [readNotifs, setReadNotifs] = useState<Set<number>>(new Set());
  const [period, setPeriod] = useState<'Jour'|'Semaine'|'Mois'>('Mois');

  // Live data drives the dashboard; demo constants fill in until Firestore has rows.
  const hasLiveOrders = live.totalOrders > 0;

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir';
  })();
  const ownerName = (user?.displayName || user?.email?.split('@')[0] || 'Cyril')
    .replace(/^\w/, (c) => c.toUpperCase());

  // KPI values: prefer live aggregates, fall back to the demo snapshot.
  const kpiData = [
    { ...KPIS[0], value: hasLiveOrders ? String(live.totalOrders) : KPIS[0].value },
    { ...KPIS[1], value: live.totalCustomers > 0 ? live.totalCustomers.toLocaleString('fr-FR') : KPIS[1].value },
    { ...KPIS[2], value: live.totalProducts > 0 ? String(live.totalProducts) : KPIS[2].value,
      sub: live.totalProducts > 0 ? `${live.lowStockProducts.length} en stock faible` : KPIS[2].sub },
    { ...KPIS[3], value: hasLiveOrders ? fmtF(live.avgCart) : KPIS[3].value },
  ];
  const revenueValue = hasLiveOrders ? fmtF(live.totalRevenue) : '24 850 000 F';
  const liveOrders = hasLiveOrders
    ? live.recentOrders.map((o: any) => ({
        id: o.orderNumber ?? `#${o.id?.slice(0, 4)}`,
        name: o.client ?? o.customerName ?? 'Client',
        amt: fmtF(o.total ?? 0),
        ...notifColorForStatus(o.status),
      }))
    : ORDERS;

  const unread = NOTIFS.length - readNotifs.size;
  const handleLogout = async () => { try { await signOut(auth); } catch {} };
  const markAllRead = () => setReadNotifs(new Set(NOTIFS.map(n => n.id)));

  const content = (
    <View style={{ gap: 16 }}>

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <View style={d.pageHead}>
        <View style={{ flex: 1 }}>
          <Text style={d.greet}>{greeting}, {ownerName} 👋</Text>
          <Text style={d.pageTitle}>Tableau de bord</Text>
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
                  <Text style={d.notifTitle}>Notifications</Text>
                  <TouchableOpacity onPress={markAllRead}><Text style={d.notifMark}>Tout marquer lu</Text></TouchableOpacity>
                </View>
                {NOTIFS.map(n => {
                  const isRead = readNotifs.has(n.id);
                  const m = notifMeta(n.type);
                  return (
                    <TouchableOpacity key={n.id} style={d.notifRow}
                      onPress={() => setReadNotifs(prev => new Set([...prev, n.id]))} activeOpacity={0.7}>
                      <View style={[d.notifIcon, { backgroundColor: m.soft }]}><Ic d={m.d} s={14} c={m.c}/></View>
                      <View style={{ flex:1 }}>
                        <Text style={[d.notifMsg, isRead && { color:T.muted, fontWeight:'500' }]}>{n.msg}</Text>
                        <Text style={d.notifTime}>{n.time}</Text>
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
            {(['Jour','Semaine','Mois'] as const).map(p => (
              <TouchableOpacity key={p} onPress={() => setPeriod(p)}
                style={[d.periodTab, period===p && d.periodTabA]} activeOpacity={0.8}>
                <Text style={[d.periodTxt, period===p && d.periodTxtA]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <Sparkline h={isWeb ? 120 : 96}/>
        <View style={d.dayRow}>
          {DAYS.map((day,i) => <Text key={i} style={d.dayLbl}>{day}</Text>)}
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
              <Text style={d.secTitle}>Ventes des 7 derniers jours</Text>
              <Text style={d.secSub}>Total : 12 340 000 F</Text>
            </View>
          </View>
          <View style={d.bars}>
            {BAR_VALS.map((pct, i) => {
              const peak = pct === Math.max(...BAR_VALS);
              return (
                <View key={i} style={d.barCol}>
                  <View style={d.barTrack}>
                    <View style={{ width:'70%', height: Math.round((pct/100)*BAR_H), borderRadius:6,
                      backgroundColor: peak ? T.orange : T.orangeSoft, borderWidth: peak ? 0 : 1, borderColor: '#FFD9C7' }}/>
                  </View>
                  <Text style={[d.barDay, peak && { color:T.orangeDark, fontWeight:'800' }]}>{DAYS[i].slice(0,1)}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Recent orders */}
        <View style={[d.card, { flex: isWeb ? 1.5 : 1 }]}>
          <View style={d.secHead}>
            <Text style={d.secTitle}>Commandes récentes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Orders' as any)} activeOpacity={0.7}>
              <Text style={d.seeAll}>Voir tout →</Text>
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
        <Text style={d.secTitle}>Actions rapides</Text>
        <View style={d.quickRow}>
          {[
            { label:'Caisse',    route:'POS',       tint:T.orangeSoft,  ink:T.orange,  icon:'M2 3h20v14H2zM8 21h8M12 17v4' },
            { label:'Produit',   route:'Products',  tint:T.violetSoft,  ink:T.violet,  icon:'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' },
            { label:'Commandes', route:'Orders',    tint:T.infoSoft,    ink:T.info,    icon:'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2' },
            { label:'Analytics', route:'Analytics', tint:T.successSoft, ink:T.success, icon:'M3 3v18h18M7 14l4-4 3 3 5-6' },
            { label:'Marketing', route:'Marketing', tint:T.warningSoft, ink:T.warning, icon:'M3 11l19-9-9 19-2-8-8-2z' },
            { label:'Clients',   route:'Customers', tint:T.violetSoft,  ink:T.violet,  icon:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
          ].map(q => (
            <TouchableOpacity key={q.route} style={d.qItem}
              onPress={() => navigation.navigate(q.route as any)} activeOpacity={0.8}>
              <View style={[d.qBtn, { backgroundColor:q.tint }]}><Ic d={q.icon} s={20} c={q.ink} w={2}/></View>
              <Text style={d.qLabel}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

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
