import React, { useState } from 'react';
import { ScreenHeader } from '../components/ScreenHeader';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput, Switch, Alert, KeyboardAvoidingView, Platform} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

const C = {
  navy: '#FF6B35', bg: '#FFF7F3', surface: '#FFFFFF', border: '#E5E7EB', borderFocus: '#FF6B35',
  accent: '#FF6B35', accentSoft: 'rgba(255,107,53,0.1)',
  textDark: '#111827', textMid: '#374151', textLight: '#6B7280', muted: '#9CA3AF',
  success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6', purple: '#8B5CF6',
  white: '#FFFFFF',
};

type RootStackParamList = { Marketing: undefined; BusinessDashboard: undefined; };
type Nav = NativeStackNavigationProp<RootStackParamList>;

type CampaignStatus = 'active' | 'scheduled' | 'ended';
type PromoType = 'percent' | 'fixed' | 'shipping' | 'bundle';

interface Promo {
  id: string; code: string; type: PromoType; value: number; label: string;
  uses: number; maxUses: number; active: boolean; color: string;
}
interface Campaign {
  id: string; name: string; channel: string; status: CampaignStatus;
  sent: number; openRate: number; clicks: number; conversions: number; color: string;
}

const promoTypeLabel: Record<PromoType, string> = { percent: '%', fixed: '€', shipping: '🚚', bundle: '📦' };
const statusCfg: Record<CampaignStatus, { label: string; color: string }> = {
  active:    { label: 'Active',     color: C.success },
  scheduled: { label: 'Planifiée',  color: C.warning },
  ended:     { label: 'Terminée',   color: C.muted   },
};

const INITIAL_PROMOS: Promo[] = [
  { id: 'p1', code: 'SOLDES20',  type: 'percent', value: 20, label: '−20% sur tout',          uses: 147, maxUses: 500, active: true,  color: C.accent  },
  { id: 'p2', code: 'LIVRAISON', type: 'shipping', value: 0, label: 'Livraison offerte',       uses: 83,  maxUses: 200, active: true,  color: C.info    },
  { id: 'p3', code: 'VIP50',     type: 'fixed',   value: 50, label: '−€50 (clients VIP)',      uses: 12,  maxUses: 50,  active: false, color: C.purple  },
  { id: 'p4', code: 'PACK3',     type: 'bundle',  value: 15, label: '−15% pour 3 articles',   uses: 34,  maxUses: 300, active: true,  color: C.success },
];

const CAMPAIGNS: Campaign[] = [
  { id: 'c1', name: 'Newsletter Juin',    channel: '📧 Email',   status: 'active',    sent: 2840, openRate: 32, clicks: 412, conversions: 87,  color: C.info    },
  { id: 'c2', name: 'Flash Sale Weekend', channel: '📲 SMS',     status: 'active',    sent: 1200, openRate: 68, clicks: 890, conversions: 134, color: C.accent  },
  { id: 'c3', name: 'Relance Paniers',    channel: '📧 Email',   status: 'scheduled', sent: 0,    openRate: 0,  clicks: 0,   conversions: 0,   color: C.purple  },
  { id: 'c4', name: 'Promo Mai',          channel: '📧 Email',   status: 'ended',     sent: 3100, openRate: 28, clicks: 310, conversions: 62,  color: C.muted   },
];

const StatMini: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <View style={sm.wrap}>
    <Text style={[sm.val, { color }]}>{value}</Text>
    <Text style={sm.lbl}>{label}</Text>
  </View>
);
const sm = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center' },
  val:  { fontSize: 16, fontWeight: '800' },
  lbl:  { fontSize: 10, color: C.muted, fontWeight: '500', marginTop: 2 },
});

const MarketingScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [promos, setPromos]   = useState<Promo[]>(INITIAL_PROMOS);
  const [tab, setTab]         = useState<'promos' | 'campagnes' | 'creer'>('promos');
  const [focused, setFocused] = useState<string | null>(null);

  // New promo form state
  const [newCode,  setNewCode]  = useState('');
  const [newType,  setNewType]  = useState<PromoType>('percent');
  const [newValue, setNewValue] = useState('');
  const [newMax,   setNewMax]   = useState('');

  const togglePromo = (id: string) =>
    setPromos(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));

  const createPromo = () => {
    if (!newCode.trim() || !newValue.trim()) { Alert.alert('Requis', 'Code et valeur obligatoires.'); return; }
    const typeLabels: Record<PromoType, string> = { percent: `−${newValue}%`, fixed: `−€${newValue}`, shipping: 'Livraison offerte', bundle: `−${newValue}% lot` };
    const newPromo: Promo = {
      id: Date.now().toString(), code: newCode.toUpperCase(), type: newType,
      value: parseFloat(newValue) || 0, label: typeLabels[newType],
      uses: 0, maxUses: parseInt(newMax) || 100, active: true, color: C.accent,
    };
    setPromos(prev => [newPromo, ...prev]);
    setNewCode(''); setNewValue(''); setNewMax('');
    setTab('promos');
    Alert.alert('✓ Code créé', `Le code "${newPromo.code}" est maintenant actif.`);
  };

  const totalRevenuMarketing = 18_420;
  const totalConversions = CAMPAIGNS.reduce((t, c) => t + c.conversions, 0);

  return (
    <View style={s.root}>
        <ScreenHeader title="Marketing" subtitle="Promos &amp; campagnes" />
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.navigate('BusinessDashboard')}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.textDark} strokeWidth={2}>
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Marketing</Text>
          <Text style={s.headerSub}>Promos · Campagnes · Conversion</Text>
        </View>
        <View style={s.aiPill}><Text style={s.aiPillText}>✦ IA</Text></View>
      </View>

      {/* Summary cards */}
      <View style={s.summaryRow}>
        <View style={[s.summaryCard, { borderTopColor: C.accent }]}>
          <Text style={s.summaryVal}>€ {(totalRevenuMarketing/1000).toFixed(1)}k</Text>
          <Text style={s.summaryLabel}>Revenu marketing</Text>
        </View>
        <View style={[s.summaryCard, { borderTopColor: C.success }]}>
          <Text style={s.summaryVal}>{totalConversions}</Text>
          <Text style={s.summaryLabel}>Conversions</Text>
        </View>
        <View style={[s.summaryCard, { borderTopColor: C.info }]}>
          <Text style={s.summaryVal}>{promos.filter(p => p.active).length}</Text>
          <Text style={s.summaryLabel}>Promos actives</Text>
        </View>
        <View style={[s.summaryCard, { borderTopColor: C.purple }]}>
          <Text style={s.summaryVal}>{CAMPAIGNS.filter(c => c.status === 'active').length}</Text>
          <Text style={s.summaryLabel}>Campagnes live</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={s.tabBar}>
        {(['promos', 'campagnes', 'creer'] as const).map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>
              {t === 'promos' ? '🎟 Codes promo' : t === 'campagnes' ? '📣 Campagnes' : '+ Créer'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.inner} showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

        {/* ── CODES PROMO ──────────────────────────────────────────── */}
        {tab === 'promos' && (
          <>
            <View style={s.aiCard}>
              <Text style={s.aiCardTitle}>✦ Recommandation IA</Text>
              <Text style={s.aiCardText}>Le code SOLDES20 expire dans 3 jours. Créez un code de relance post-soldes pour maintenir votre taux de conversion (+22% en moyenne).</Text>
            </View>

            {promos.map(p => {
              const pct = Math.min((p.uses / p.maxUses) * 100, 100);
              return (
                <View key={p.id} style={s.promoCard}>
                  <View style={[s.promoStrip, { backgroundColor: p.color }]}/>
                  <View style={s.promoBody}>
                    <View style={s.promoTop}>
                      <View style={[s.codeBadge, { backgroundColor: p.color + '18', borderColor: p.color + '40', borderWidth: 1 }]}>
                        <Text style={[s.codeText, { color: p.color }]}>{p.code}</Text>
                      </View>
                      <View style={{ flex: 1, paddingLeft: 12 }}>
                        <Text style={s.promoLabel}>{p.label}</Text>
                        <Text style={s.promoMeta}>{p.uses} / {p.maxUses} utilisations</Text>
                      </View>
                      <Switch
                        value={p.active}
                        onValueChange={() => togglePromo(p.id)}
                        trackColor={{ false: C.border, true: p.color + '50' }}
                        thumbColor={p.active ? p.color : C.muted}
                      />
                    </View>
                    {/* Usage bar */}
                    <View style={s.usageBar}>
                      <View style={[s.usageFill, { width: `${pct}%` as any, backgroundColor: pct > 80 ? C.error : p.color }]}/>
                    </View>
                    <View style={s.promoFooter}>
                      <Text style={s.promoFooterText}>{promoTypeLabel[p.type]} · {p.active ? '🟢 Actif' : '⚪ Inactif'}</Text>
                      <Text style={[s.usagePct, { color: pct > 80 ? C.error : C.muted }]}>{Math.round(pct)}%</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* ── CAMPAGNES ────────────────────────────────────────────── */}
        {tab === 'campagnes' && (
          <>
            {CAMPAIGNS.map(c => {
              const cfg = statusCfg[c.status];
              return (
                <View key={c.id} style={s.campCard}>
                  <View style={s.campHeader}>
                    <View style={[s.campIcon, { backgroundColor: c.color + '18' }]}>
                      <Text style={{ fontSize: 20 }}>{c.channel.split(' ')[0]}</Text>
                    </View>
                    <View style={{ flex: 1, paddingLeft: 12 }}>
                      <Text style={s.campName}>{c.name}</Text>
                      <Text style={s.campChannel}>{c.channel}</Text>
                    </View>
                    <View style={[s.statusPill, { backgroundColor: cfg.color + '18' }]}>
                      <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                  </View>

                  {c.status !== 'scheduled' && (
                    <View style={s.campStats}>
                      <StatMini label="Envoyés"     value={c.sent.toLocaleString()} color={C.textDark}/>
                      <View style={s.statDiv}/>
                      <StatMini label="Taux ouvert" value={`${c.openRate}%`}         color={c.color}   />
                      <View style={s.statDiv}/>
                      <StatMini label="Clics"       value={c.clicks.toLocaleString()} color={C.info}   />
                      <View style={s.statDiv}/>
                      <StatMini label="Conversions" value={c.conversions.toString()}  color={C.success} />
                    </View>
                  )}

                  {c.status === 'scheduled' && (
                    <View style={s.scheduledBox}>
                      <Text style={s.scheduledText}>⏱ Planifiée — en attente d'envoi</Text>
                      <TouchableOpacity onPress={() => Alert.alert('Annuler', `Annuler la campagne "${c.name}" ?`)}>
                        <Text style={{ color: C.error, fontSize: 12, fontWeight: '700' }}>Annuler</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}

            <TouchableOpacity style={s.newCampBtn} onPress={() => setTab('creer')}>
              <Text style={s.newCampText}>+ Nouvelle campagne</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ── CRÉER UN CODE PROMO ──────────────────────────────────── */}
        {tab === 'creer' && (
          <>
            <View style={s.card}>
              <Text style={s.cardTitle}>Nouveau code promo</Text>
              <Text style={s.cardSub}>Créez un code de réduction pour vos clients</Text>

              <View style={s.formGroup}>
                <Text style={s.formLabel}>Code</Text>
                <TextInput
                  style={[s.input, focused === 'code' && s.inputFocused]}
                  placeholder="ex : SOLDES25"
                  placeholderTextColor={C.muted}
                  value={newCode}
                  onChangeText={t => setNewCode(t.toUpperCase())}
                  autoCapitalize="characters"
                  onFocus={() => setFocused('code')}
                  onBlur={() => setFocused(null)}
                
      autoCorrect={false}
      returnKeyType="done"
      clearButtonMode="while-editing"
      spellCheck={false}/>
              </View>

              <View style={s.formGroup}>
                <Text style={s.formLabel}>Type de réduction</Text>
                <View style={s.typeRow}>
                  {(['percent', 'fixed', 'shipping', 'bundle'] as PromoType[]).map(t => (
                    <TouchableOpacity
                      key={t}
                      style={[s.typeChip, newType === t && s.typeChipActive]}
                      onPress={() => setNewType(t)}
                    >
                      <Text style={[s.typeChipText, newType === t && s.typeChipTextActive]}>
                        {t === 'percent' ? '% Remise' : t === 'fixed' ? '€ Fixe' : t === 'shipping' ? '🚚 Livraison' : '📦 Lot'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {newType !== 'shipping' && (
                <View style={s.formGroup}>
                  <Text style={s.formLabel}>{newType === 'percent' ? 'Pourcentage (%)' : 'Montant (€)'}</Text>
                  <TextInput
                    style={[s.input, focused === 'val' && s.inputFocused]}
                    placeholder={newType === 'percent' ? '20' : '50'}
                    placeholderTextColor={C.muted}
                    value={newValue}
                    onChangeText={setNewValue}
                    keyboardType="numeric"
                    onFocus={() => setFocused('val')}
                    onBlur={() => setFocused(null)}
                  
      autoCorrect={false}
      autoCapitalize="none"
      returnKeyType="done"
      clearButtonMode="while-editing"
      spellCheck={false}/>
                </View>
              )}

              <View style={s.formGroup}>
                <Text style={s.formLabel}>Nombre max d'utilisations</Text>
                <TextInput
                  style={[s.input, focused === 'max' && s.inputFocused]}
                  placeholder="100"
                  placeholderTextColor={C.muted}
                  value={newMax}
                  onChangeText={setNewMax}
                  keyboardType="numeric"
                  onFocus={() => setFocused('max')}
                  onBlur={() => setFocused(null)}
                
      autoCorrect={false}
      autoCapitalize="none"
      returnKeyType="done"
      clearButtonMode="while-editing"
      spellCheck={false}/>
              </View>

              <TouchableOpacity style={s.createBtn} onPress={createPromo} activeOpacity={0.87}>
                <Text style={s.createBtnText}>Créer le code promo</Text>
              </TouchableOpacity>
            </View>

            {/* Quick templates */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Modèles rapides</Text>
              <Text style={s.cardSub}>Appliquez un modèle pour aller plus vite</Text>
              {[
                { label: 'Bienvenue −10%',     code: 'BIENVENUE10', type: 'percent' as PromoType, value: '10', color: C.success },
                { label: 'Anniversaire −25%',  code: 'ANNIV25',     type: 'percent' as PromoType, value: '25', color: C.purple  },
                { label: 'Livraison gratuite', code: 'FREELIV',     type: 'shipping'as PromoType, value: '0',  color: C.info    },
              ].map((tpl, i) => (
                <TouchableOpacity
                  key={i}
                  style={s.templateRow}
                  onPress={() => { setNewCode(tpl.code); setNewType(tpl.type); setNewValue(tpl.value); Alert.alert('Modèle appliqué', `Code "${tpl.code}" prêt — ajustez et créez.`); }}
                >
                  <View style={[s.templateDot, { backgroundColor: tpl.color }]}/>
                  <Text style={s.templateLabel}>{tpl.label}</Text>
                  <Text style={[s.templateCode, { color: tpl.color }]}>{tpl.code} →</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn:    { width: 36, height: 36, borderRadius: 9, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle:{ flex: 1, fontSize: 18, fontWeight: '800', color: C.textDark },
  headerSub:  { fontSize: 12, color: C.textLight },
  aiPill:     { backgroundColor: '#EDE9FE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  aiPillText: { fontSize: 12, fontWeight: '700', color: C.purple },

  summaryRow:  { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  summaryCard: { flex: 1, backgroundColor: C.bg, borderRadius: 10, padding: 10, borderTopWidth: 3, alignItems: 'center', gap: 4 },
  summaryVal:  { fontSize: 16, fontWeight: '800', color: C.textDark },
  summaryLabel:{ fontSize: 10, color: C.muted, fontWeight: '500', textAlign: 'center' },

  tabBar:      { flexDirection: 'row', backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  tab:         { flex: 1, paddingVertical: 13, alignItems: 'center' },
  tabActive:   { borderBottomWidth: 2.5, borderBottomColor: C.accent },
  tabText:     { fontSize: 13, color: C.textLight, fontWeight: '500' },
  tabTextActive:{ color: C.accent, fontWeight: '700' },

  inner: { padding: 16, gap: 14, paddingBottom: 48 },

  aiCard:     { backgroundColor: C.accent, borderRadius: 14, padding: 16, gap: 6 },
  aiCardTitle:{ fontSize: 14, fontWeight: '700', color: '#FF6B35' },
  aiCardText: { fontSize: 13, color: '#CBD5E1', lineHeight: 20 },

  promoCard: { backgroundColor: C.surface, borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 },
  promoStrip:{ height: 3 },
  promoBody: { padding: 16, gap: 12 },
  promoTop:  { flexDirection: 'row', alignItems: 'center' },
  codeBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  codeText:  { fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  promoLabel:{ fontSize: 14, fontWeight: '700', color: C.textDark },
  promoMeta: { fontSize: 12, color: C.textLight, marginTop: 2 },
  usageBar:  { height: 5, backgroundColor: C.bg, borderRadius: 3, overflow: 'hidden' },
  usageFill: { height: 5, borderRadius: 3 },
  promoFooter:  { flexDirection: 'row', justifyContent: 'space-between' },
  promoFooterText:{ fontSize: 12, color: C.textLight },
  usagePct:     { fontSize: 12, fontWeight: '700' },

  campCard:    { backgroundColor: C.surface, borderRadius: 14, padding: 16, gap: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 },
  campHeader:  { flexDirection: 'row', alignItems: 'center' },
  campIcon:    { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  campName:    { fontSize: 15, fontWeight: '700', color: C.textDark },
  campChannel: { fontSize: 12, color: C.textLight, marginTop: 2 },
  statusPill:  { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText:  { fontSize: 11, fontWeight: '700' },
  campStats:   { flexDirection: 'row', backgroundColor: C.bg, borderRadius: 12, padding: 14 },
  statDiv:     { width: 1, backgroundColor: C.border },
  scheduledBox:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.warning + '14', borderRadius: 10, padding: 12, borderLeftWidth: 3, borderLeftColor: C.warning },
  scheduledText:{ fontSize: 13, color: C.warning, fontWeight: '600' },

  newCampBtn:  { backgroundColor: C.accent, borderRadius: 12, height: 50, alignItems: 'center', justifyContent: 'center' },
  newCampText: { color: C.white, fontSize: 15, fontWeight: '700' },

  card:    { backgroundColor: C.surface, borderRadius: 16, padding: 20, gap: 14 },
  cardTitle:{ fontSize: 16, fontWeight: '700', color: C.textDark },
  cardSub:  { fontSize: 12, color: C.textLight, marginTop: -8 },

  formGroup: { gap: 6 },
  formLabel: { fontSize: 13, fontWeight: '600', color: C.textMid },
  input:     { height: 48, borderWidth: 1.5, borderColor: C.border, borderRadius: 10, paddingHorizontal: 14, fontSize: 16, color: C.textDark, backgroundColor: C.bg },
  inputFocused:{ borderColor: C.borderFocus, backgroundColor: C.white },
  typeRow:   { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  typeChip:  { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 9, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.bg },
  typeChipActive:    { backgroundColor: C.accent, borderColor: C.accent },
  typeChipText:      { fontSize: 13, color: C.textMid, fontWeight: '500' },
  typeChipTextActive:{ color: C.white, fontWeight: '700' },
  createBtn:     { backgroundColor: C.accent, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  createBtnText: { color: C.white, fontSize: 15, fontWeight: '800' },

  templateRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: C.border },
  templateDot:  { width: 10, height: 10, borderRadius: 5 },
  templateLabel:{ flex: 1, fontSize: 14, fontWeight: '600', color: C.textDark },
  templateCode: { fontSize: 13, fontWeight: '700' },
});

export default MarketingScreen;
