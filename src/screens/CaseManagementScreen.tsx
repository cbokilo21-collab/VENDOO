import React, { useState } from 'react';
import { ScreenHeader } from '../components/ScreenHeader';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

const C = {
  navy: '#FF6B35', sideMuted: '#64748B',
  bg: '#FFF7F3', surface: '#FFFFFF', border: '#E5E7EB', borderFocus: '#FF6B35',
  accent: '#FF6B35', accentSoft: 'rgba(255,107,53,0.1)',
  textDark: '#111827', textMid: '#374151', textLight: '#6B7280', muted: '#9CA3AF',
  success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6', purple: '#8B5CF6',
  white: '#FFFFFF',
};

type RootStackParamList = {
  CaseManagement: undefined; BoutiqueManagement: undefined;
  QuartierScreen: undefined; BoutiqueAppearance: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList, 'CaseManagement'>;

interface Case {
  id: string; nom: string; adresse: string; ville: string;
  niveau: number; superficie: number; loyer: number; statut: 'actif' | 'libre' | 'reserve';
  emoji: string; couleur: string;
}

const NIVEAUX = [
  { n: 1, label: 'Stand', desc: 'Emplacement simple — idéal pour démarrer', color: C.success,  prix: 'Gratuit'   },
  { n: 2, label: 'Petite boutique', desc: 'Façade avec vitrine et porte',          color: C.info,    prix: '€ 29/mois' },
  { n: 3, label: 'Boutique complète', desc: 'Grande vitrine, enseigne, 2 fenêtres',color: C.purple,  prix: '€ 59/mois' },
  { n: 4, label: 'Boutique Premium', desc: 'Façade luxe, néons, déco premium',     color: C.accent,  prix: '€ 99/mois' },
];

const CaseManagementScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [cases, setCases] = useState<Case[]>([
    { id: 'c1', nom: 'Case Centre-Ville', adresse: '12 Rue de la Mode', ville: 'Paris',   niveau: 3, superficie: 45, loyer: 59,  statut: 'actif',   emoji: '👗', couleur: C.accent },
    { id: 'c2', nom: 'Case Shopping Mall',adresse: '45 Avenue Commerce',ville: 'Lyon',    niveau: 2, superficie: 30, loyer: 29,  statut: 'actif',   emoji: '📱', couleur: C.info  },
    { id: 'c3', nom: 'Espace Libre #3',   adresse: '—',                ville: 'Bordeaux', niveau: 1, superficie: 20, loyer: 0,   statut: 'libre',   emoji: '🏚️', couleur: C.muted },
  ]);
  const [showUpgrade, setShowUpgrade] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [editNom, setEditNom] = useState('');

  const statutConfig: Record<string, { label: string; color: string }> = {
    actif:   { label: 'Actif',    color: C.success },
    libre:   { label: 'Libre',    color: C.warning },
    reserve: { label: 'Réservé',  color: C.info    },
  };

  const totalLoyer = cases.filter(c => c.statut === 'actif').reduce((t, c) => t + c.loyer, 0);

  return (
    <View style={s.root}>
        <ScreenHeader title="Gestion des casiers" />
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.navigate('BoutiqueManagement')}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.textDark} strokeWidth={2}>
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Gestion des cases</Text>
          <Text style={s.headerSub}>{cases.filter(c => c.statut === 'actif').length} actives · {cases.filter(c => c.statut === 'libre').length} libre</Text>
        </View>
        <View style={s.loyerBadge}>
          <Text style={s.loyerVal}>€ {totalLoyer}/mois</Text>
          <Text style={s.loyerLabel}>loyer total</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.inner} showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

        {/* ── Niveaux disponibles ───────────────────────────────────── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Niveaux de façade</Text>
          <Text style={s.cardSub}>Montez de niveau pour agrandir votre façade dans le quartier</Text>
          {NIVEAUX.map(niv => (
            <View key={niv.n} style={[s.niveauRow, { borderLeftColor: niv.color }]}>
              <View style={[s.niveauBadge, { backgroundColor: niv.color + '18' }]}>
                <Text style={[s.niveauNum, { color: niv.color }]}>{niv.n}</Text>
              </View>
              <View style={s.niveauInfo}>
                <Text style={s.niveauLabel}>{niv.label}</Text>
                <Text style={s.niveauDesc}>{niv.desc}</Text>
              </View>
              <Text style={[s.niveauPrix, { color: niv.n === 1 ? C.success : C.textMid }]}>{niv.prix}</Text>
            </View>
          ))}
        </View>

        {/* ── Mes cases ─────────────────────────────────────────────── */}
        <Text style={s.sectionTitle}>Vos emplacements</Text>

        {cases.map(c => {
          const sc = statutConfig[c.statut];
          const niv = NIVEAUX.find(n => n.n === c.niveau)!;
          return (
            <View key={c.id} style={s.caseCard}>
              <View style={[s.caseStrip, { backgroundColor: c.couleur }]} />
              <View style={s.caseBody}>
                {/* Top */}
                <View style={s.caseTop}>
                  <View style={[s.caseIcon, { backgroundColor: c.couleur + '18' }]}>
                    <Text style={s.caseEmoji}>{c.emoji}</Text>
                  </View>
                  <View style={s.caseInfo}>
                    <Text style={s.caseName}>{c.nom}</Text>
                    <Text style={s.caseMeta}>
                      {c.statut !== 'libre' ? `${c.adresse} · ${c.ville}` : c.ville}
                    </Text>
                  </View>
                  <View style={[s.statutBadge, { backgroundColor: sc.color + '18' }]}>
                    <Text style={[s.statutText, { color: sc.color }]}>{sc.label}</Text>
                  </View>
                </View>

                {/* Stats row */}
                <View style={s.caseStats}>
                  <View style={s.caseStat}>
                    <Text style={s.caseStatVal}>{c.superficie} m²</Text>
                    <Text style={s.caseStatLabel}>Surface</Text>
                  </View>
                  <View style={s.statDivider} />
                  <View style={s.caseStat}>
                    <Text style={[s.caseStatVal, { color: niv.color }]}>Niv. {c.niveau}</Text>
                    <Text style={s.caseStatLabel}>{niv.label}</Text>
                  </View>
                  <View style={s.statDivider} />
                  <View style={s.caseStat}>
                    <Text style={[s.caseStatVal, { color: c.loyer === 0 ? C.success : C.textDark }]}>
                      {c.loyer === 0 ? 'Gratuit' : `€ ${c.loyer}/mois`}
                    </Text>
                    <Text style={s.caseStatLabel}>Loyer</Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={s.caseActions}>
                  {c.statut === 'actif' && (
                    <>
                      <TouchableOpacity style={s.caseBtn} onPress={() => navigation.navigate('BoutiqueAppearance')}>
                        <Text style={s.caseBtnText}>🎨 Façade</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={s.caseBtn} onPress={() => navigation.navigate('QuartierScreen')}>
                        <Text style={s.caseBtnText}>🏘️ Quartier</Text>
                      </TouchableOpacity>
                      {c.niveau < 4 && (
                        <TouchableOpacity style={[s.caseBtn, s.caseBtnUpgrade]} onPress={() => setShowUpgrade(c.id)}>
                          <Text style={s.caseBtnUpgradeText}>⬆ Niveau {c.niveau + 1}</Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                  {c.statut === 'libre' && (
                    <TouchableOpacity style={[s.caseBtn, { flex: 1, backgroundColor: C.accent }]} onPress={() => Alert.alert('Louer cet emplacement', `Louer "${c.nom}" au tarif ${NIVEAUX.find(n => n.n === c.niveau)?.prix} ?`, [
                      { text: 'Annuler', style: 'cancel' },
                      { text: 'Louer', onPress: () => {
                        setCases(prev => prev.map(ca => ca.id === c.id ? { ...ca, statut: 'actif', adresse: '—', loyer: 29 } : ca));
                      }},
                    ])}>
                      <Text style={[s.caseBtnText, { color: C.white, fontWeight: '700' }]}>+ Louer cet emplacement</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Upgrade modal inline */}
              {showUpgrade === c.id && (
                <View style={s.upgradePanel}>
                  <Text style={s.upgradePanelTitle}>Passer au niveau {c.niveau + 1}</Text>
                  <Text style={s.upgradePanelSub}>{NIVEAUX[c.niveau]?.desc}</Text>
                  <View style={s.upgradePanelBtns}>
                    <TouchableOpacity style={s.upgradeCancel} onPress={() => setShowUpgrade(null)}>
                      <Text style={s.upgradeCancelText}>Annuler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.upgradeConfirm} onPress={() => {
                      setCases(prev => prev.map(ca => ca.id === c.id ? { ...ca, niveau: (ca.niveau + 1) as any, loyer: NIVEAUX[ca.niveau]?.prix !== 'Gratuit' ? parseInt(NIVEAUX[ca.niveau]?.prix.replace(/\D/g, '') ?? '0') : 29 } : ca));
                      setShowUpgrade(null);
                      Alert.alert('✓ Niveau amélioré !', 'Votre façade a été mise à jour dans le quartier.');
                    }}>
                      <Text style={s.upgradeConfirmText}>Confirmer l'upgrade</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {/* ── Louer un nouvel emplacement ───────────────────────────── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>🏪 Louer un nouvel emplacement</Text>
          <Text style={s.cardSub}>Plus d'emplacements = plus de visibilité dans le quartier.</Text>
          <View style={s.newCaseForm}>
            <TextInput
              style={[s.input, focused === 'ville' && s.inputFocused]}
              placeholder="Ville souhaitée (ex: Paris, Dakar...)"
              placeholderTextColor={C.muted}
              value={editNom}
              onChangeText={setEditNom}
              onFocus={() => setFocused('ville')}
              onBlur={() => setFocused(null)}
            
      autoCorrect={false}
      autoCapitalize="sentences"
      returnKeyType="done"
      clearButtonMode="while-editing"
      spellCheck={false}/>
            <TouchableOpacity style={s.newCaseBtn} onPress={() => {
              if (!editNom.trim()) { Alert.alert('Requis', 'Indiquez une ville.'); return; }
              const newCase: Case = {
                id: Date.now().toString(), nom: `Boutique ${editNom}`,
                adresse: '—', ville: editNom, niveau: 1, superficie: 20,
                loyer: 0, statut: 'libre', emoji: '🏪', couleur: C.muted,
              };
              setCases(prev => [...prev, newCase]);
              setEditNom('');
              Alert.alert('✓ Emplacement ajouté', `Un emplacement libre a été créé à ${editNom}.`);
            }} activeOpacity={0.87}>
              <Text style={s.newCaseBtnText}>Trouver un emplacement</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn:    { width: 36, height: 36, borderRadius: 9, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle:{ fontSize: 18, fontWeight: '800', color: C.textDark },
  headerSub:  { fontSize: 12, color: C.textLight },
  loyerBadge: { alignItems: 'flex-end' },
  loyerVal:   { fontSize: 15, fontWeight: '800', color: C.accent },
  loyerLabel: { fontSize: 11, color: C.muted },

  inner: { padding: 20, gap: 16, paddingBottom: 48 },

  card:     { backgroundColor: C.surface, borderRadius: 16, padding: 20, gap: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 },
  cardTitle:{ fontSize: 16, fontWeight: '700', color: C.textDark },
  cardSub:  { fontSize: 12, color: C.textLight, marginTop: -8 },

  niveauRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, borderLeftWidth: 3, paddingLeft: 12, paddingVertical: 4 },
  niveauBadge: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  niveauNum:   { fontSize: 16, fontWeight: '900' },
  niveauInfo:  { flex: 1 },
  niveauLabel: { fontSize: 14, fontWeight: '700', color: C.textDark },
  niveauDesc:  { fontSize: 12, color: C.textLight },
  niveauPrix:  { fontSize: 13, fontWeight: '700' },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: C.textDark },

  caseCard:  { backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  caseStrip: { height: 4 },
  caseBody:  { padding: 18, gap: 14 },
  caseTop:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  caseIcon:  { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  caseEmoji: { fontSize: 22 },
  caseInfo:  { flex: 1 },
  caseName:  { fontSize: 15, fontWeight: '700', color: C.textDark, marginBottom: 2 },
  caseMeta:  { fontSize: 12, color: C.textLight },
  statutBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statutText:  { fontSize: 11, fontWeight: '700' },

  caseStats:    { flexDirection: 'row', backgroundColor: C.bg, borderRadius: 12, padding: 14, alignItems: 'center' },
  caseStat:     { flex: 1, alignItems: 'center', gap: 3 },
  caseStatVal:  { fontSize: 15, fontWeight: '800', color: C.textDark },
  caseStatLabel:{ fontSize: 11, color: C.muted, fontWeight: '500' },
  statDivider:  { width: 1, height: 32, backgroundColor: C.border },

  caseActions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  caseBtn:     { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 9, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.bg },
  caseBtnText: { fontSize: 12, color: C.textMid, fontWeight: '600' },
  caseBtnUpgrade:     { borderColor: C.accent, backgroundColor: C.accentSoft },
  caseBtnUpgradeText: { fontSize: 12, color: C.accent, fontWeight: '700' },

  upgradePanel:      { margin: 18, marginTop: 0, backgroundColor: C.bg, borderRadius: 12, padding: 16, borderWidth: 1.5, borderColor: C.accent, gap: 10 },
  upgradePanelTitle: { fontSize: 15, fontWeight: '700', color: C.textDark },
  upgradePanelSub:   { fontSize: 13, color: C.textLight },
  upgradePanelBtns:  { flexDirection: 'row', gap: 10 },
  upgradeCancel:     { flex: 1, height: 40, borderRadius: 9, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  upgradeCancelText: { fontSize: 13, color: C.textMid, fontWeight: '600' },
  upgradeConfirm:    { flex: 2, height: 40, borderRadius: 9, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  upgradeConfirmText:{ fontSize: 13, color: C.white, fontWeight: '700' },

  newCaseForm: { gap: 10 },
  input:        { height: 46, borderWidth: 1.5, borderColor: C.border, borderRadius: 10, paddingHorizontal: 14, fontSize: 16, color: C.textDark, backgroundColor: C.bg },
  inputFocused: { borderColor: C.borderFocus, backgroundColor: C.white },
  newCaseBtn:   { backgroundColor: C.accent, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  newCaseBtnText:{ color: C.white, fontSize: 14, fontWeight: '700' },
});

export default CaseManagementScreen;
