import React, { useState } from 'react';
import { ScreenHeader } from '../components/ScreenHeader';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBoutique } from '../contexts/BoutiqueContext';
import { useAuth } from '../contexts/AuthContext';
import { BoutiqueService } from '../services/boutiqueService';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

const C = {
  navy: '#FF6B35', sideMuted: '#64748B',
  bg: '#FFF7F3', surface: '#FFFFFF', border: '#E5E7EB', borderFocus: '#FF6B35',
  accent: '#FF6B35', accentSoft: 'rgba(255,107,53,0.08)',
  textDark: '#111827', textMid: '#374151', textLight: '#6B7280', muted: '#9CA3AF',
  success: '#10B981', error: '#EF4444', white: '#FFFFFF',
};

type RootStackParamList = {
  BoutiqueAppearance: undefined; BusinessDashboard: undefined;
  Products: undefined; Orders: undefined; Customers: undefined; Settings: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList>;

const COULEURS_FACADE = [
  '#FF6B35','#EF4444','#F59E0B','#10B981',
  '#3B82F6','#8B5CF6','#EC4899','#0F172A',
  '#06B6D4','#84CC16','#F97316','#6366F1',
];
const COULEURS_ACCENT = ['#FFFFFF','#FFF7ED','#EFF6FF','#F0FDF4','#FDF4FF','#1F2937'];
const THEMES = [
  { id: 'moderne',    label: 'Moderne',    emoji: '✨' },
  { id: 'classique',  label: 'Classique',  emoji: '🏛️' },
  { id: 'luxe',       label: 'Luxe',       emoji: '👑' },
  { id: 'streetwear', label: 'Streetwear', emoji: '🔥' },
  { id: 'nature',     label: 'Nature',     emoji: '🌿' },
  { id: 'tech',       label: 'Tech',       emoji: '⚡' },
];
const ENSEIGNES = ['Néon', 'Bois', 'Métal', 'Lumière'];

// ─── Facade Preview ───────────────────────────────────────────────────────────
const FacadePreview: React.FC<{
  nom: string; slogan: string; couleur: string; accent: string; theme: string;
}> = ({ nom, slogan, couleur, accent, theme }) => (
  <View style={[fp.wrapper]}>
    {/* Building */}
    <View style={[fp.building, { backgroundColor: couleur }]}>
      {/* Windows row */}
      <View style={fp.windowRow}>
        <View style={[fp.window, { backgroundColor: accent + 'CC' }]} />
        <View style={[fp.window, { backgroundColor: accent + 'CC' }]} />
        <View style={[fp.window, { backgroundColor: accent + 'CC' }]} />
      </View>
      {/* Sign */}
      <View style={[fp.sign, { backgroundColor: accent }]}>
        <Text style={[fp.signText, { color: couleur }]} numberOfLines={1}>{nom || 'Ma Boutique'}</Text>
      </View>
      {/* Door + windows row 2 */}
      <View style={fp.entryRow}>
        <View style={[fp.windowSm, { backgroundColor: accent + 'BB' }]} />
        <View style={[fp.door, { backgroundColor: accent + 'EE' }]}>
          <View style={fp.doorKnob} />
        </View>
        <View style={[fp.windowSm, { backgroundColor: accent + 'BB' }]} />
      </View>
    </View>
    {/* Ground */}
    <View style={[fp.ground, { backgroundColor: couleur + '30' }]}>
      {slogan ? <Text style={fp.slogan} numberOfLines={1}>{slogan}</Text> : null}
    </View>
    {/* Theme badge */}
    <View style={[fp.themeBadge, { backgroundColor: couleur }]}>
      <Text style={[fp.themeText, { color: accent }]}>{theme ? THEMES.find(t => t.id === theme)?.emoji : '✨'} {THEMES.find(t => t.id === theme)?.label || 'Thème'}</Text>
    </View>
  </View>
);

const fp = StyleSheet.create({
  wrapper:    { width: '100%', alignItems: 'center' },
  building:   { width: '85%', height: 180, borderRadius: 12, padding: 12, justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 16 },
  windowRow:  { flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 8 },
  window:     { width: 28, height: 28, borderRadius: 4 },
  sign:       { marginHorizontal: -4, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, alignItems: 'center' },
  signText:   { fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  entryRow:   { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 10 },
  windowSm:   { width: 22, height: 36, borderRadius: 4 },
  door:       { width: 34, height: 48, borderRadius: 4, alignItems: 'flex-end', paddingRight: 5, paddingTop: 20 },
  doorKnob:   { width: 5, height: 5, borderRadius: 2.5, backgroundColor: 'rgba(0,0,0,0.3)' },
  ground:     { width: '100%', height: 28, alignItems: 'center', justifyContent: 'center' },
  slogan:     { fontSize: 11, color: '#374151', fontWeight: '500', fontStyle: 'italic' },
  themeBadge: { position: 'absolute', top: 8, right: '7%', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  themeText:  { fontSize: 11, fontWeight: '700' },
});

// ─── Main ─────────────────────────────────────────────────────────────────────
const BoutiqueAppearanceScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { boutiqueData, setBoutiqueData } = useBoutique();
  const { user } = useAuth();
  const [nom, setNom]         = useState(boutiqueData.nom || 'Mode Étoile');
  const [slogan, setSlogan]   = useState('Le style à votre image');
  const [couleur, setCouleur] = useState(boutiqueData.couleur || C.accent);
  const [accentC, setAccentC] = useState('#FFFFFF');
  const [theme, setTheme]     = useState('moderne');
  const [enseigne, setEnseigne] = useState('Néon');
  const [focused, setFocused] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Boutique stats (mock data)
  const boutiqueStats = {
    level: 1,
    products: 0,
    sales: 0,
    rating: 0,
    reviews: 0,
    visitors: 0,
    joined: 'N/A',
  };

  const inp = (field: string, val: string, setter: (v: string) => void, placeholder: string, label: string) => (
    <View style={s.fieldGroup}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        style={[s.input, focused === field && s.inputFocused]}
        value={val}
        onChangeText={setter}
        placeholder={placeholder}
        placeholderTextColor={C.muted}
        onFocus={() => setFocused(field)}
        onBlur={() => setFocused(null)}
      
      autoCorrect={false}
      autoCapitalize="sentences"
      returnKeyType="done"
      clearButtonMode="while-editing"
      spellCheck={false}/>
    </View>
  );

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté pour publier votre boutique.');
      return;
    }

    setIsSaving(true);
    try {
      // Update boutique data in context
      setBoutiqueData({
        nom,
        couleur,
      });

      // If boutique exists in Firestore, update it
      if (boutiqueData.id) {
        await BoutiqueService.update(boutiqueData.id, {
          nom,
          couleur,
        });
        Alert.alert('Façade mise à jour !', `Votre boutique "${nom}" est maintenant visible dans le quartier.`);
      } else {
        // Create new boutique in Firestore
        const boutiqueId = await BoutiqueService.create(user.uid, {
          nom,
          couleur,
          description: boutiqueData.description || '',
          logo: boutiqueData.logo || '',
          website: boutiqueData.website || '',
          instagram: boutiqueData.instagram || '',
          facebook: boutiqueData.facebook || '',
          email: boutiqueData.email || '',
          phone: boutiqueData.phone || '',
          secteur: boutiqueData.secteur || 'Mode',
          pays: boutiqueData.pays || 'France',
          ville: boutiqueData.ville || 'Paris',
          currency: boutiqueData.currency || 'EUR',
          timezone: boutiqueData.timezone || 'Europe/Paris',
        });

        // Update context with the new ID
        setBoutiqueData({
          id: boutiqueId,
          nom,
          couleur,
        });

        Alert.alert('Boutique publiée !', `Votre boutique "${nom}" est maintenant visible dans le quartier.`);
      }
    } catch (error) {
      console.error('Error saving boutique:', error);
      Alert.alert('Erreur', 'Impossible de publier votre boutique. Veuillez réessayer.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={s.root}>
        <ScreenHeader title="Apparence boutique" />
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.textDark} strokeWidth={2}>
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </TouchableOpacity>
        <View>
          <View style={s.headerBadgeContainer}>
            <Text style={s.headerTitle}>Apparence de la boutique</Text>
            <View style={s.proBadge}>
              <Text style={s.proBadgeText}>PRO</Text>
            </View>
          </View>
          <Text style={s.headerSub}>Ce que voient vos clients dans le quartier</Text>
        </View>
        <TouchableOpacity style={[s.saveBtn, isSaving && s.saveBtnDisabled]} onPress={handleSave} disabled={isSaving}>
          <Text style={s.saveBtnText}>{isSaving ? 'Publication...' : 'Publier'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.inner} showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

        {/* ── Boutique Stats ──────────────────────────────────────────── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Statistiques de la boutique</Text>
          <Text style={s.cardSub}>Performance et métriques</Text>
          <View style={s.statsGrid}>
            <View style={s.statItem}>
              <Text style={s.statValue}>{boutiqueStats.level}</Text>
              <Text style={s.statLabel}>Niveau</Text>
            </View>
            <View style={s.statItem}>
              <Text style={s.statValue}>{boutiqueStats.products}</Text>
              <Text style={s.statLabel}>Produits</Text>
            </View>
            <View style={s.statItem}>
              <Text style={s.statValue}>{boutiqueStats.sales}</Text>
              <Text style={s.statLabel}>Ventes</Text>
            </View>
            <View style={s.statItem}>
              <Text style={[s.statValue, { color: C.accent }]}>{boutiqueStats.rating}</Text>
              <Text style={s.statLabel}>Note</Text>
            </View>
            <View style={s.statItem}>
              <Text style={s.statValue}>{boutiqueStats.reviews}</Text>
              <Text style={s.statLabel}>Avis</Text>
            </View>
            <View style={s.statItem}>
              <Text style={s.statValue}>{boutiqueStats.visitors}</Text>
              <Text style={s.statLabel}>Visiteurs</Text>
            </View>
          </View>
          <View style={s.joinedInfo}>
            <Text style={s.joinedLabel}>Membre depuis le {boutiqueStats.joined}</Text>
          </View>
        </View>

        {/* ── Live Preview ─────────────────────────────────────────── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Aperçu en direct</Text>
          <Text style={s.cardSub}>Voici comment votre boutique apparaît dans la rue commerçante</Text>
          <View style={s.previewBox}>
            <FacadePreview nom={nom} slogan={slogan} couleur={couleur} accent={accentC} theme={theme} />
          </View>
        </View>

        {/* ── Nom & Slogan ──────────────────────────────────────────── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Identité</Text>
          {inp('nom',    nom,    setNom,    'Nom de la boutique', 'Nom affiché sur la façade')}
          {inp('slogan', slogan, setSlogan, 'Votre accroche...', 'Slogan (optionnel)')}
        </View>

        {/* ── Opening Hours ──────────────────────────────────────────── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Horaires d'ouverture</Text>
          <Text style={s.cardSub}>Définissez vos heures d'ouverture</Text>
          <View style={s.hoursContainer}>
            {[
              { day: 'Lundi', hours: '09:00 - 18:00' },
              { day: 'Mardi', hours: '09:00 - 18:00' },
              { day: 'Mercredi', hours: '09:00 - 18:00' },
              { day: 'Jeudi', hours: '09:00 - 20:00' },
              { day: 'Vendredi', hours: '09:00 - 20:00' },
              { day: 'Samedi', hours: '10:00 - 18:00' },
              { day: 'Dimanche', hours: 'Fermé' },
            ].map((h, i) => (
              <View key={i} style={s.hourRow}>
                <Text style={s.hourDay}>{h.day}</Text>
                <Text style={[s.hourTime, h.hours === 'Fermé' && s.hourClosed]}>{h.hours}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Contact Info Display ────────────────────────────────────── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Informations de contact</Text>
          <Text style={s.cardSub}>Visibles par vos clients</Text>
          <View style={s.contactInfo}>
            <View style={s.contactRow}>
              <Text style={s.contactIcon}>📍</Text>
              <Text style={s.contactText}>{boutiqueData.ville ? `${boutiqueData.ville}, ${boutiqueData.pays || ''}` : 'Non défini'}</Text>
            </View>
            <View style={s.contactRow}>
              <Text style={s.contactIcon}>📧</Text>
              <Text style={s.contactText}>{boutiqueData.email || 'Non défini'}</Text>
            </View>
            <View style={s.contactRow}>
              <Text style={s.contactIcon}>📱</Text>
              <Text style={s.contactText}>{boutiqueData.phone || 'Non défini'}</Text>
            </View>
            <View style={s.contactRow}>
              <Text style={s.contactIcon}>🌐</Text>
              <Text style={s.contactText}>{boutiqueData.website || 'Non défini'}</Text>
            </View>
          </View>
        </View>

        {/* ── Couleur façade ───────────────────────────────────────── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Couleur de la façade</Text>
          <Text style={s.cardSub}>La teinte principale de votre bâtiment</Text>
          <View style={s.colorGrid}>
            {COULEURS_FACADE.map(c => (
              <TouchableOpacity key={c} style={[s.colorSwatch, { backgroundColor: c }, couleur === c && s.colorSwatchActive]} onPress={() => setCouleur(c)} activeOpacity={0.8} />
            ))}
          </View>
        </View>

        {/* ── Couleur accent ───────────────────────────────────────── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Couleur d'accent</Text>
          <Text style={s.cardSub}>Fenêtres, enseigne et détails</Text>
          <View style={s.colorGridSm}>
            {COULEURS_ACCENT.map(c => (
              <TouchableOpacity key={c} style={[s.accentSwatch, { backgroundColor: c, borderColor: c === '#FFFFFF' ? C.border : c }, accentC === c && s.accentSwatchActive]} onPress={() => setAccentC(c)} activeOpacity={0.8} />
            ))}
          </View>
        </View>

        {/* ── Thème ───────────────────────────────────────────────── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Thème décoratif</Text>
          <Text style={s.cardSub}>L'ambiance générale de votre boutique</Text>
          <View style={s.themeGrid}>
            {THEMES.map(t => (
              <TouchableOpacity key={t.id} style={[s.themeCard, theme === t.id && s.themeCardActive]} onPress={() => setTheme(t.id)} activeOpacity={0.8}>
                <Text style={s.themeEmoji}>{t.emoji}</Text>
                <Text style={[s.themeLabel, theme === t.id && s.themeLabelActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Enseigne ─────────────────────────────────────────────── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Type d'enseigne</Text>
          <Text style={s.cardSub}>Le style de votre panneau de boutique</Text>
          <View style={s.enseigneRow}>
            {ENSEIGNES.map(e => (
              <TouchableOpacity key={e} style={[s.enseigneChip, enseigne === e && s.enseigneChipActive]} onPress={() => setEnseigne(e)} activeOpacity={0.8}>
                <Text style={[s.enseigneText, enseigne === e && s.enseigneTextActive]}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Visibility info ──────────────────────────────────────── */}
        <View style={s.infoBox}>
          <Text style={s.infoIcon}>💡</Text>
          <Text style={s.infoText}>Les visiteurs du quartier voient votre façade dans la rue commerçante. Une belle façade attire plus de clics et de clients.</Text>
        </View>

        {/* Save CTA */}
        <TouchableOpacity style={s.mainSaveBtn} onPress={handleSave} activeOpacity={0.87}>
          <Text style={s.mainSaveBtnText}>🏪 Publier la façade dans le quartier</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn:    { width: 36, height: 36, borderRadius: 9, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  headerBadgeContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle:{ flex: 1, fontSize: 16, fontWeight: '800', color: C.textDark },
  proBadge: { backgroundColor: C.accent, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  proBadgeText: { color: C.white, fontSize: 10, fontWeight: 'bold' },
  headerSub:  { fontSize: 12, color: C.textLight },
  saveBtn:    { backgroundColor: C.accent, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 9 },
  saveBtnDisabled: { backgroundColor: C.muted },
  saveBtnText:{ color: C.white, fontSize: 13, fontWeight: '700' },

  inner: { padding: 20, gap: 16, paddingBottom: 48 },

  card:     { backgroundColor: C.white, borderRadius: 16, padding: 20, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 },
  cardTitle:{ fontSize: 16, fontWeight: '700', color: C.textDark },
  cardSub:  { fontSize: 12, color: C.textLight, marginTop: -6 },

  previewBox: { backgroundColor: C.bg, borderRadius: 12, padding: 20, alignItems: 'center' },

  fieldGroup: { gap: 7 },
  label:      { fontSize: 13, fontWeight: '600', color: C.textMid },
  input:        { height: 46, borderWidth: 1.5, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, fontSize: 16, color: C.textDark, backgroundColor: C.bg },
  inputFocused: { borderColor: C.borderFocus, backgroundColor: C.white },

  colorGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorSwatch:      { width: 40, height: 40, borderRadius: 20, borderWidth: 3, borderColor: 'transparent' },
  colorSwatchActive:{ borderColor: C.textDark, transform: [{ scale: 1.15 }] },

  colorGridSm:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  accentSwatch:      { width: 40, height: 40, borderRadius: 10, borderWidth: 2 },
  accentSwatchActive:{ borderColor: C.textDark, transform: [{ scale: 1.1 }] },

  themeGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  themeCard:      { width: '30%', backgroundColor: C.bg, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, padding: 12, alignItems: 'center', gap: 5 },
  themeCardActive:{ borderColor: C.accent, backgroundColor: 'rgba(255,107,53,0.06)' },
  themeEmoji:     { fontSize: 22 },
  themeLabel:     { fontSize: 12, fontWeight: '600', color: C.textMid },
  themeLabelActive:{ color: C.accent },

  enseigneRow:       { flexDirection: 'row', gap: 10 },
  enseigneChip:      { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: C.border, alignItems: 'center' },
  enseigneChipActive:{ borderColor: C.accent, backgroundColor: C.accent },
  enseigneText:      { fontSize: 13, color: C.textMid, fontWeight: '500' },
  enseigneTextActive:{ color: C.white, fontWeight: '700' },

  infoBox:  { flexDirection: 'row', gap: 10, backgroundColor: '#FFF7ED', borderRadius: 12, padding: 14, borderLeftWidth: 3, borderLeftColor: C.accent },
  infoIcon: { fontSize: 18 },
  infoText: { flex: 1, fontSize: 13, color: '#92400E', lineHeight: 19 },

  mainSaveBtn:    { backgroundColor: C.accent, height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowColor: C.navy, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 14 },
  mainSaveBtnText:{ color: C.white, fontSize: 15, fontWeight: '800' },

  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statItem: { flex: 1, minWidth: '30%', backgroundColor: C.bg, borderRadius: 12, padding: 14, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: C.textDark },
  statLabel: { fontSize: 11, color: C.textMid, marginTop: 4 },
  joinedInfo: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border },
  joinedLabel: { fontSize: 12, color: C.textLight, textAlign: 'center' },

  // Hours
  hoursContainer: { gap: 8 },
  hourRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  hourDay: { fontSize: 14, fontWeight: '600', color: C.textDark },
  hourTime: { fontSize: 14, color: C.textMid },
  hourClosed: { color: C.error, fontStyle: 'italic' },

  // Contact
  contactInfo: { gap: 12 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  contactIcon: { fontSize: 20 },
  contactText: { fontSize: 14, color: C.textMid },
});

export default BoutiqueAppearanceScreen;
