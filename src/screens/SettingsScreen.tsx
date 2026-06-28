import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput, Switch, Dimensions, Alert, KeyboardAvoidingView, Platform, Animated, Easing } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBoutique } from '../contexts/BoutiqueContext';
import BottomNavigation from '../components/BottomNavigation';
import Svg, { Path, Circle } from 'react-native-svg';

const C = {
  navy: '#FF6B35', sideMuted: '#64748B',
  bg: '#F6F7F9', surface: '#FFFFFF', border: '#E5E7EB', borderFocus: '#FF6B35',
  accent: '#FF6B35', textDark: '#111827', textMid: '#374151', textLight: '#6B7280', muted: '#9CA3AF',
  success: '#10B981', warning: '#F59E0B', error: '#EF4444',
  white: '#FFFFFF',
};

type RootStackParamList = { BusinessDashboard: undefined; Products: undefined; Orders: undefined; Customers: undefined; Settings: undefined; };
type Nav = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

const DashIcon  = ({ a }: { a?: boolean }) => <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={a ? C.white : C.sideMuted} strokeWidth={2}><Path d="M3 3v18h18M18 17V9M13 17V5M8 17v-3" strokeLinecap="round" strokeLinejoin="round"/></Svg>;
const BoxIcon   = ({ a }: { a?: boolean }) => <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={a ? C.white : C.sideMuted} strokeWidth={2}><Path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" strokeLinecap="round" strokeLinejoin="round"/></Svg>;
const ClipIcon  = ({ a }: { a?: boolean }) => <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={a ? C.white : C.sideMuted} strokeWidth={2}><Path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 10h6M9 14h6M9 18h6" strokeLinecap="round" strokeLinejoin="round"/></Svg>;
const UsersIcon = ({ a }: { a?: boolean }) => <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={a ? C.white : C.sideMuted} strokeWidth={2}><Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round"/><Circle cx="9" cy="7" r="4"/></Svg>;
const GearIcon  = ({ a }: { a?: boolean }) => <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={a ? C.white : C.sideMuted} strokeWidth={2}><Circle cx="12" cy="12" r="3"/><Path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" strokeLinecap="round" strokeLinejoin="round"/></Svg>;

const navItems = [
  { key: 'BusinessDashboard', label: 'Dashboard',  Icon: DashIcon  },
  { key: 'Products',          label: 'Produits',   Icon: BoxIcon   },
  { key: 'Orders',            label: 'Commandes',  Icon: ClipIcon  },
  { key: 'Customers',         label: 'Clients',    Icon: UsersIcon },
  { key: 'Settings',          label: 'Paramètres', Icon: GearIcon  },
];

const Sidebar: React.FC<{ active: string; onNav: (s: string) => void }> = ({ active, onNav }) => (
  <View style={s.sidebar}>
    <View style={s.sideLogoRow}>
      <View style={s.logoMark}><Text style={s.logoMarkText}>V</Text></View>
      <Text style={s.logoName}>Vendoo</Text>
    </View>
    <Text style={s.sideSection}>NAVIGATION</Text>
    {navItems.map(({ key, label, Icon }) => {
      const isActive = active === key;
      return (
        <TouchableOpacity key={key} style={[s.navItem, isActive && s.navItemActive]} onPress={() => onNav(key)} activeOpacity={0.7}>
          <Icon a={isActive} />
          <Text style={[s.navLabel, isActive && s.navLabelActive]}>{label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// ─── Animated Card Component ───────────────────────────────────────────────────
const AnimatedCard: React.FC<{ children: React.ReactNode; delay?: number; style?: any }> = ({ children, delay = 0, style }) => {
  const animY = useRef(new Animated.Value(20)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animY, {
        toValue: 0,
        duration: 600,
        delay,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(animOpacity, {
        toValue: 1,
        duration: 500,
        delay,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity: animOpacity, transform: [{ translateY: animY }] }]}>
      {children}
    </Animated.View>
  );
};

const SwitchRow: React.FC<{ label: string; desc?: string; value: boolean; onChange: (v: boolean) => void }> = ({ label, desc, value, onChange }) => (
  <View style={s.switchRow}>
    <View style={s.switchInfo}>
      <Text style={s.switchLabel}>{label}</Text>
      {desc && <Text style={s.switchDesc}>{desc}</Text>}
    </View>
    <Switch value={value} onValueChange={onChange} trackColor={{ false: C.border, true: C.accent }} thumbColor={C.white} ios_backgroundColor={C.border} />
  </View>
);

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { boutiqueData, setBoutiqueData } = useBoutique();
  const isDesktop = Dimensions.get('window').width >= 1024;
  const [boutiqueName, setBoutiqueName] = useState(boutiqueData.nom);
  const [boutiqueDescription, setBoutiqueDescription] = useState(boutiqueData.description);
  const [boutiqueLogo, setBoutiqueLogo] = useState(boutiqueData.logo);
  const [website, setWebsite] = useState(boutiqueData.website);
  const [instagram, setInstagram] = useState(boutiqueData.instagram);
  const [facebook, setFacebook] = useState(boutiqueData.facebook);
  const [email, setEmail] = useState(boutiqueData.email);
  const [phone, setPhone] = useState(boutiqueData.phone);
  const [currency, setCurrency] = useState(boutiqueData.currency);
  const [timezone, setTimezone] = useState(boutiqueData.timezone);
  const [iban, setIban] = useState('');
  const [bic, setBic] = useState('');
  const [bankName, setBankName] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const [notifOrders, setNotifOrders]   = useState(true);
  const [notifStock, setNotifStock]     = useState(true);
  const [notifAI, setNotifAI]           = useState(false);
  const [autoShip, setAutoShip]         = useState(false);
  const [twoFA, setTwoFA]               = useState(false);

  // Sync with context when component mounts
  useEffect(() => {
    setBoutiqueName(boutiqueData.nom);
    setBoutiqueDescription(boutiqueData.description);
    setBoutiqueLogo(boutiqueData.logo);
    setWebsite(boutiqueData.website);
    setInstagram(boutiqueData.instagram);
    setFacebook(boutiqueData.facebook);
    setEmail(boutiqueData.email);
    setPhone(boutiqueData.phone);
    setCurrency(boutiqueData.currency);
    setTimezone(boutiqueData.timezone);
  }, [boutiqueData]);

  const handleSave = () => {
    setBoutiqueData({
      nom: boutiqueName,
      description: boutiqueDescription,
      logo: boutiqueLogo,
      website: website,
      instagram: instagram,
      facebook: facebook,
      email: email,
      phone: phone,
      currency: currency,
      timezone: timezone,
    });
    Alert.alert('Sauvegardé', 'Vos paramètres ont été enregistrés.');
  };
  const handleLogout = async () => { try { await signOut(auth); } catch {} };
  const goTo = (screen: string) => { if (screen !== 'Settings') navigation.navigate(screen as any); };

  const inp = (field: string, value: string, onChange: (v: string) => void, placeholder?: string) => (
    <TextInput
      style={[s.input, focused === field && s.inputFocused]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={C.muted}
      onFocus={() => setFocused(field)}
      onBlur={() => setFocused(null)}
    
      autoCorrect={false}
      autoCapitalize="sentences"
      returnKeyType="done"
      clearButtonMode="while-editing"
      spellCheck={false}/>
  );

  const content = (
    <ScrollView style={s.content} contentContainerStyle={s.inner} showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
      {/* Header */}
      <AnimatedCard delay={0} style={s.pageHeaderRow}>
        <View>
          <Text style={s.pageTitle}>Paramètres</Text>
          <Text style={s.pageSubtitle}>Gérez votre boutique et vos préférences.</Text>
        </View>
        <TouchableOpacity style={s.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <Text style={s.saveBtnText}>Sauvegarder</Text>
        </TouchableOpacity>
      </AnimatedCard>

      {/* Profile */}
      <AnimatedCard delay={50} style={s.card}>
        <Text style={s.cardTitle}>Mon profil</Text>
        <View style={s.profileRow}>
          <View style={s.profileAvatar}><Text style={s.profileAvatarText}>C</Text></View>
          <View>
            <Text style={s.profileName}>Cyril B.</Text>
            <View style={s.planBadge}><Text style={s.planText}>Plan Pro</Text></View>
          </View>
        </View>
      </AnimatedCard>

      {/* Boutique info */}
      <AnimatedCard delay={100} style={s.card}>
        <Text style={s.cardTitle}>Informations boutique</Text>
        <View style={s.fieldGroup}>
          <Text style={s.label}>Nom de la boutique</Text>
          {inp('boutique', boutiqueName, setBoutiqueName, 'Nom de la boutique')}
        </View>
        <View style={s.fieldGroup}>
          <Text style={s.label}>Description</Text>
          <TextInput
            style={[s.textArea, focused === 'description' && s.inputFocused]}
            placeholder='Décrivez votre boutique en quelques mots...'
            placeholderTextColor={C.muted}
            value={boutiqueDescription}
            onChangeText={setBoutiqueDescription}
            onFocus={() => setFocused('description')}
            onBlur={() => setFocused(null)}
            multiline
            numberOfLines={4}
            textAlignVertical='top'
            maxLength={500}
          />
          <Text style={s.charCount}>{boutiqueDescription.length}/500</Text>
        </View>
        <View style={s.fieldGroup}>
          <Text style={s.label}>URL du logo</Text>
          {inp('logo', boutiqueLogo, setBoutiqueLogo, 'https://...')}
        </View>
        <View style={s.fieldGroup}>
          <Text style={s.label}>Site web</Text>
          {inp('website', website, setWebsite, 'https://monsite.com')}
        </View>
      </AnimatedCard>

      {/* Contact info */}
      <AnimatedCard delay={150} style={s.card}>
        <Text style={s.cardTitle}>Coordonnées</Text>
        <View style={s.fieldGroup}>
          <Text style={s.label}>Email de contact</Text>
          {inp('email', email, setEmail, 'contact@boutique.com')}
        </View>
        <View style={s.fieldGroup}>
          <Text style={s.label}>Téléphone</Text>
          {inp('phone', phone, setPhone, '+33 6 12 34 56 78')}
        </View>
      </AnimatedCard>

      {/* Social media */}
      <AnimatedCard delay={200} style={s.card}>
        <Text style={s.cardTitle}>Réseaux sociaux</Text>
        <View style={s.fieldGroup}>
          <Text style={s.label}>Instagram</Text>
          {inp('instagram', instagram, setInstagram, '@votrecompte')}
        </View>
        <View style={s.fieldGroup}>
          <Text style={s.label}>Facebook</Text>
          {inp('facebook', facebook, setFacebook, 'facebook.com/votrepage')}
        </View>
      </AnimatedCard>

      {/* Store settings */}
      <AnimatedCard delay={250} style={s.card}>
        <Text style={s.cardTitle}>Paramètres magasin</Text>
        <View style={s.fieldGroup}>
          <Text style={s.label}>Devise</Text>
          {inp('currency', currency, setCurrency, 'EUR')}
        </View>
        <View style={s.fieldGroup}>
          <Text style={s.label}>Fuseau horaire</Text>
          {inp('timezone', timezone, setTimezone, 'Europe/Paris')}
        </View>
      </AnimatedCard>

      {/* Bank details */}
      <AnimatedCard delay={300} style={s.card}>
        <View style={s.cardHeaderRow}>
          <View>
            <Text style={s.cardTitle}>Coordonnées bancaires</Text>
            <Text style={s.cardSub}>IBAN, BIC et informations bancaires</Text>
          </View>
          <TouchableOpacity style={s.linkBtn} onPress={() => navigation.navigate('PaymentSettings' as any)}>
            <Text style={s.linkBtnText}>Paiements →</Text>
          </TouchableOpacity>
        </View>
        <View style={s.fieldGroup}>
          <Text style={s.label}>IBAN</Text>
          {inp('iban', iban, setIban, 'FR76XXXXXXXXXXXXXXXXXXX')}
        </View>
        <View style={s.fieldGroup}>
          <Text style={s.label}>BIC / SWIFT</Text>
          {inp('bic', bic, setBic, 'XXXXXXXX')}
        </View>
        <View style={s.fieldGroup}>
          <Text style={s.label}>Nom de la banque</Text>
          {inp('bankName', bankName, setBankName, 'ex: BNP Paribas')}
        </View>
      </AnimatedCard>

      {/* Notifications */}
      <AnimatedCard delay={350} style={s.card}>
        <Text style={s.cardTitle}>Notifications</Text>
        <SwitchRow label="Nouvelles commandes" desc="Alerte à chaque commande reçue" value={notifOrders} onChange={setNotifOrders} />
        <View style={s.divider} />
        <SwitchRow label="Alertes de stock" desc="Notification quand le stock est faible" value={notifStock} onChange={setNotifStock} />
        <View style={s.divider} />
        <SwitchRow label="Rapports IA" desc="Résumé hebdomadaire généré par l'IA" value={notifAI} onChange={setNotifAI} />
      </AnimatedCard>

      {/* Automation */}
      <AnimatedCard delay={400} style={s.card}>
        <Text style={s.cardTitle}>Automatisation</Text>
        <SwitchRow label="Expédition automatique" desc="Confirme les commandes validées automatiquement" value={autoShip} onChange={setAutoShip} />
      </AnimatedCard>

      {/* Security */}
      <AnimatedCard delay={450} style={s.card}>
        <Text style={s.cardTitle}>Sécurité</Text>
        <SwitchRow label="Authentification à 2 facteurs" desc="Protège votre compte avec un code OTP" value={twoFA} onChange={setTwoFA} />
      </AnimatedCard>

      {/* Danger zone */}
      <AnimatedCard delay={500} style={[s.card, s.dangerCard]}>
        <Text style={s.dangerTitle}>Zone dangereuse</Text>
        <Text style={s.dangerDesc}>Ces actions sont irréversibles. Procédez avec prudence.</Text>
        <TouchableOpacity style={s.dangerBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={s.dangerBtnText}>Se déconnecter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.dangerBtnGhost} onPress={() => Alert.alert('Attention', 'Cette action supprimera définitivement votre compte.')} activeOpacity={0.85}>
          <Text style={s.dangerBtnGhostText}>Supprimer le compte</Text>
        </TouchableOpacity>
      </AnimatedCard>
    </ScrollView>
  );

  if (isDesktop) {
    return (
      <View style={s.desktop}>
        {Platform.OS !== 'web' && <Sidebar active="Settings" onNav={goTo} />}
        {content}
      </View>
    );
  }

  return (
    <View style={s.mobile}>
      <View style={s.mobileHeader}><Text style={s.mobileTitle}>Paramètres</Text></View>
      {content}
      <BottomNavigation activeRoute="Settings" />
    </View>
  );
};

const s = StyleSheet.create({
  desktop: { flex: 1, flexDirection: 'row', backgroundColor: C.bg },
  mobile:  { flex: 1, backgroundColor: C.bg },

  sidebar:        { width: 240, backgroundColor: C.accent, paddingVertical: 28, paddingHorizontal: 16 },
  sideLogoRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, marginBottom: 32 },
  logoMark:       { width: 32, height: 32, borderRadius: 7, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  logoMarkText:   { color: C.white, fontSize: 16, fontWeight: '800' },
  logoName:       { fontSize: 18, fontWeight: '700', color: C.white },
  sideSection:    { fontSize: 10, fontWeight: '700', color: C.sideMuted, letterSpacing: 1.4, paddingHorizontal: 8, marginBottom: 8 },
  navItem:        { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, paddingVertical: 10, borderRadius: 8, marginBottom: 2 },
  navItemActive:  { backgroundColor: 'rgba(255,255,255,0.08)' },
  navLabel:       { fontSize: 14, color: C.sideMuted, fontWeight: '500' },
  navLabelActive: { color: C.white, fontWeight: '600' },

  content:      { flex: 1 },
  inner:        { padding: 28, gap: 18, paddingBottom: 60 },
  pageHeaderRow:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  pageTitle:    { fontSize: 24, fontWeight: '800', color: C.textDark, marginBottom: 3 },
  pageSubtitle: { fontSize: 14, color: C.textLight },
  saveBtn:      { backgroundColor: C.accent, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 9 },
  saveBtnText:  { color: C.white, fontSize: 13, fontWeight: '700' },
  mobileHeader: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border },
  mobileTitle:  { fontSize: 22, fontWeight: '800', color: C.textDark },

  card:      { backgroundColor: C.surface, borderRadius: 14, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, gap: 0 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: C.textDark, marginBottom: 2 },
  cardSub:     { fontSize: 12, color: C.textLight },
  linkBtn:     { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: C.bg },
  linkBtnText: { fontSize: 13, fontWeight: '600', color: C.accent },

  profileRow:       { flexDirection: 'row', alignItems: 'center', gap: 14 },
  profileAvatar:    { width: 52, height: 52, borderRadius: 26, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  profileAvatarText:{ fontSize: 22, fontWeight: '800', color: C.white },
  profileName:      { fontSize: 16, fontWeight: '700', color: C.textDark, marginBottom: 5 },
  planBadge:        { backgroundColor: C.accent + '18', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start' },
  planText:         { fontSize: 12, fontWeight: '700', color: C.accent },

  fieldGroup: { marginBottom: 14 },
  label:      { fontSize: 13, fontWeight: '600', color: C.textMid, marginBottom: 7 },
  input:        { height: 44, borderWidth: 1.5, borderColor: C.border, borderRadius: 9, paddingHorizontal: 12, fontSize: 16, color: C.textDark, backgroundColor: C.bg },
  inputFocused: { borderColor: C.borderFocus, backgroundColor: C.white },
  textArea:     { height: 100, borderWidth: 1.5, borderColor: C.border, borderRadius: 9, paddingHorizontal: 12, paddingTop: 12, fontSize: 15, color: C.textDark, backgroundColor: C.bg },
  charCount:    { fontSize: 11, color: C.muted, textAlign: 'right', marginTop: 4 },

  switchRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  switchInfo: { flex: 1, paddingRight: 16 },
  switchLabel:{ fontSize: 14, fontWeight: '600', color: C.textDark, marginBottom: 2 },
  switchDesc: { fontSize: 12, color: C.textLight, lineHeight: 17 },
  divider:    { height: 1, backgroundColor: C.border },

  dangerCard:         { borderWidth: 1.5, borderColor: '#FCA5A5', backgroundColor: '#FFF5F5' },
  dangerTitle:        { fontSize: 16, fontWeight: '700', color: C.error, marginBottom: 6 },
  dangerDesc:         { fontSize: 13, color: '#B91C1C', marginBottom: 16, lineHeight: 19 },
  dangerBtn:          { backgroundColor: C.error, height: 44, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  dangerBtnText:      { color: C.white, fontSize: 14, fontWeight: '700' },
  dangerBtnGhost:     { height: 44, borderRadius: 9, borderWidth: 1.5, borderColor: C.error, alignItems: 'center', justifyContent: 'center' },
  dangerBtnGhostText: { color: C.error, fontSize: 14, fontWeight: '700' },
});

export default SettingsScreen;
