import React, { useState } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

const C = {
  navy: '#FF6B35', sideMuted: '#64748B',
  bg: '#FFF7F3', surface: '#FFFFFF', border: '#E5E7EB',
  accent: '#FF6B35', accentSoft: 'rgba(255,107,53,0.1)',
  textDark: '#111827', textMid: '#374151', textLight: '#6B7280', muted: '#9CA3AF',
  success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6', purple: '#8B5CF6',
  white: '#FFFFFF',
};

type RootStackParamList = {
  BoutiqueManagement: undefined; CreateBoutique: undefined;
  BoutiqueAppearance: undefined; BusinessDashboard: undefined;
  CaseManagement: undefined; QuartierScreen: undefined;
  BoutiqueKeys: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList>;

interface Boutique {
  id: string; nom: string; secteur: string; emoji: string;
  ville: string; couleur: string; niveau: number;
  revenus: string; commandes: number; produits: number; ouvert: boolean;
}

const BOUTIQUES: Boutique[] = [
  {
    id: 'b1', nom: 'Mode Étoile', secteur: 'Mode', emoji: '👗',
    ville: 'Paris', couleur: C.accent, niveau: 4,
    revenus: '€ 84 250', commandes: 142, produits: 87, ouvert: true,
  },
  {
    id: 'b2', nom: 'Tech Store Lyon', secteur: 'Électronique', emoji: '📱',
    ville: 'Lyon', couleur: C.info, niveau: 2,
    revenus: '€ 31 600', commandes: 67, produits: 53, ouvert: true,
  },
];

const quickActions = [
  { label: 'Voir le quartier',     emoji: '🏘️', route: 'QuartierScreen',   color: C.info    },
  { label: 'Modifier la façade',   emoji: '🎨', route: 'BoutiqueAppearance',color: C.purple  },
  { label: 'Gérer les cases',      emoji: '📦', route: 'CaseManagement',   color: C.warning },
  { label: 'Créer une boutique',   emoji: '➕', route: 'CreateBoutique',   color: C.success },
];

const BoutiqueManagementScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.navigate('BusinessDashboard')}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.textDark} strokeWidth={2}>
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>Mes boutiques</Text>
          <Text style={s.headerSub}>{BOUTIQUES.length} espace{BOUTIQUES.length > 1 ? 's' : ''} commercial{BOUTIQUES.length > 1 ? 'x' : ''}</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => navigation.navigate('CreateBoutique')}>
          <Text style={s.addBtnText}>+ Nouvelle</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.inner} showsVerticalScrollIndicator={false}>

        {/* ── Quick actions ────────────────────────────────────────── */}
        <View style={s.actionGrid}>
          {quickActions.map((a, i) => (
            <TouchableOpacity key={i} style={s.actionCard} onPress={() => navigation.navigate(a.route as any)} activeOpacity={0.8}>
              <View style={[s.actionIcon, { backgroundColor: a.color + '18' }]}>
                <Text style={s.actionEmoji}>{a.emoji}</Text>
              </View>
              <Text style={s.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Boutiques ───────────────────────────────────────────── */}
        <Text style={s.sectionTitle}>Vos boutiques</Text>

        {BOUTIQUES.map(b => (
          <View key={b.id} style={s.boutiqueCard}>
            {/* Top strip */}
            <View style={[s.cardStrip, { backgroundColor: b.couleur }]} />

            <View style={s.cardBody}>
              {/* Identity */}
              <View style={s.cardTop}>
                <View style={[s.boutiqueAvatar, { backgroundColor: b.couleur }]}>
                  <Text style={s.boutiqueAvatarText}>{b.emoji}</Text>
                </View>
                <View style={s.boutiqueInfo}>
                  <View style={s.boutiqueNameRow}>
                    <Text style={s.boutiqueName}>{b.nom}</Text>
                    <View style={[s.niveauBadge, { backgroundColor: b.couleur + '18' }]}>
                      <Text style={[s.niveauText, { color: b.couleur }]}>Niveau {b.niveau}</Text>
                    </View>
                  </View>
                  <Text style={s.boutiqueMeta}>{b.emoji} {b.secteur} · 📍 {b.ville}</Text>
                </View>
                <View style={[s.statusDot, { backgroundColor: b.ouvert ? C.success : C.error }]} />
              </View>

              {/* Stats */}
              <View style={s.statsRow}>
                {[
                  { label: 'Revenus', value: b.revenus,              color: b.couleur  },
                  { label: 'Cmdes',   value: b.commandes.toString(), color: C.info     },
                  { label: 'Produits',value: b.produits.toString(),  color: C.success  },
                ].map((st, i) => (
                  <View key={i} style={s.statItem}>
                    <Text style={[s.statValue, { color: st.color }]}>{st.value}</Text>
                    <Text style={s.statLabel}>{st.label}</Text>
                  </View>
                ))}
              </View>

              {/* Actions */}
              <View style={s.cardActions}>
                <TouchableOpacity style={s.cardActionBtn} onPress={() => navigation.navigate('BusinessDashboard')}>
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.textMid} strokeWidth={2}><Path d="M3 3v18h18M18 17V9M13 17V5M8 17v-3" strokeLinecap="round" strokeLinejoin="round"/></Svg>
                  <Text style={s.cardActionText}>Dashboard</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.cardActionBtn} onPress={() => navigation.navigate('BoutiqueAppearance')}>
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.textMid} strokeWidth={2}><Circle cx="13.5" cy="6.5" r="2.5"/><Circle cx="6.5" cy="13.5" r="2.5"/><Circle cx="17.5" cy="16.5" r="2.5"/><Path d="M2 2l20 20" strokeLinecap="round"/></Svg>
                  <Text style={s.cardActionText}>Façade</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.cardActionBtn, s.cardActionBtnPrimary, { backgroundColor: b.couleur }]} onPress={() => navigation.navigate('QuartierScreen')}>
                  <Text style={[s.cardActionText, { color: C.white }]}>Voir dans le quartier →</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {/* ── Create first boutique CTA (if empty) ─────────────────── */}
        <View style={s.card}>
          <View style={s.emptyCardBody}>
            <Text style={s.emptyCardIcon}>🏗️</Text>
            <Text style={s.emptyCardTitle}>Ouvrez une 2ᵉ boutique</Text>
            <Text style={s.emptyCardSub}>Chaque boutique supplémentaire multiplie votre visibilité dans le quartier.</Text>
            <TouchableOpacity style={s.emptyCardBtn} onPress={() => navigation.navigate('CreateBoutique')} activeOpacity={0.87}>
              <Text style={s.emptyCardBtnText}>+ Créer une boutique</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Tips ─────────────────────────────────────────────────── */}
        <View style={s.tipsCard}>
          <Text style={s.tipsTitle}>💡 Conseils pour booster votre visibilité</Text>
          {[
            'Montez au niveau 4 pour avoir la plus grande façade du quartier.',
            'Mettez à jour votre façade chaque mois pour rester visible.',
            'Les boutiques avec +50 produits apparaissent en tête de quartier.',
          ].map((tip, i) => (
            <View key={i} style={s.tipRow}>
              <View style={s.tipDot} />
              <Text style={s.tipText}>{tip}</Text>
            </View>
          ))}
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
  addBtn:     { backgroundColor: C.accent, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 9 },
  addBtnText: { color: C.white, fontSize: 13, fontWeight: '700' },

  inner: { padding: 20, gap: 16, paddingBottom: 48 },

  // Quick actions
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionCard: { width: '47%', backgroundColor: C.surface, borderRadius: 14, padding: 16, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  actionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionEmoji:{ fontSize: 22 },
  actionLabel:{ fontSize: 13, fontWeight: '700', color: C.textDark },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: C.textDark },

  // Boutique card
  boutiqueCard: { backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8 },
  cardStrip:    { height: 4 },
  cardBody:     { padding: 18, gap: 14 },
  cardTop:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  boutiqueAvatar:    { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  boutiqueAvatarText:{ fontSize: 24 },
  boutiqueInfo:      { flex: 1 },
  boutiqueNameRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  boutiqueName:      { fontSize: 16, fontWeight: '800', color: C.textDark },
  niveauBadge:       { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  niveauText:        { fontSize: 11, fontWeight: '700' },
  boutiqueMeta:      { fontSize: 12, color: C.textLight },
  statusDot:         { width: 10, height: 10, borderRadius: 5 },

  statsRow:  { flexDirection: 'row', backgroundColor: C.bg, borderRadius: 12, padding: 14 },
  statItem:  { flex: 1, alignItems: 'center', gap: 3 },
  statValue: { fontSize: 16, fontWeight: '800' },
  statLabel: { fontSize: 11, color: C.muted, fontWeight: '500' },

  cardActions:        { flexDirection: 'row', gap: 8 },
  cardActionBtn:      { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 38, borderRadius: 9, borderWidth: 1.5, borderColor: C.border },
  cardActionBtnPrimary:{ borderWidth: 0 },
  cardActionText:     { fontSize: 12, fontWeight: '600', color: C.textMid },

  // Empty CTA
  card:          { backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 },
  emptyCardBody: { padding: 28, alignItems: 'center', gap: 10 },
  emptyCardIcon: { fontSize: 44 },
  emptyCardTitle:{ fontSize: 17, fontWeight: '800', color: C.textDark },
  emptyCardSub:  { fontSize: 13, color: C.textLight, textAlign: 'center', lineHeight: 19 },
  emptyCardBtn:  { backgroundColor: C.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, marginTop: 6 },
  emptyCardBtnText:{ color: C.white, fontSize: 14, fontWeight: '700' },

  // Tips
  tipsCard:  { backgroundColor: '#FFF7ED', borderRadius: 14, padding: 18, gap: 10, borderLeftWidth: 3, borderLeftColor: C.accent },
  tipsTitle: { fontSize: 14, fontWeight: '700', color: C.textDark },
  tipRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  tipDot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: C.accent, marginTop: 6 },
  tipText:   { flex: 1, fontSize: 13, color: '#92400E', lineHeight: 19 },
});

export default BoutiqueManagementScreen;
