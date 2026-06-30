import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  TextInput, Alert, Image, ActivityIndicator, Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useAuth } from '../contexts/AuthContext';
import { AdminPreferencesService } from '../services/adminPreferencesService';
import { Currency, CURRENCIES } from '../services/currencyService';
import VerifiedBadge from '../components/VerifiedBadge';

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
  AdminProfile: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList>;

const AdminProfileScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const [name, setName] = useState('Cyril Bokilo');
  const [email, setEmail] = useState('cbokilo18@gmail.com');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [currency, setCurrency] = useState<Currency>('XOF');
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [preferencesLoading, setPreferencesLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;
    try {
      setPreferencesLoading(true);
      const prefs = await AdminPreferencesService.getPreferences(user.uid);
      setCurrency(prefs.currency);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setPreferencesLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await AdminPreferencesService.setCurrency(user.uid, currency);
      Alert.alert('Succès', 'Profil mis à jour avec succès !');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder les préférences');
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencySelect = async (selectedCurrency: Currency) => {
    setCurrency(selectedCurrency);
    setShowCurrencyModal(false);
    if (user) {
      try {
        await AdminPreferencesService.setCurrency(user.uid, selectedCurrency);
      } catch (error) {
        console.error('Error saving currency:', error);
      }
    }
  };

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.textDark} strokeWidth={2}>
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Mon Profil Admin</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Image - Twitter/X style */}
        <View style={s.avatarSection}>
          <View style={s.avatarContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={s.avatarImage} />
            ) : (
              <View style={s.avatarPlaceholder}>
                <Text style={s.avatarText}>{name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <TouchableOpacity style={s.cameraBtn}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth={2}>
                <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"/>
                <Circle cx="12" cy="13" r="4"/>
              </Svg>
            </TouchableOpacity>
          </View>
          
          <View style={s.nameRow}>
            <Text style={s.avatarName}>{name}</Text>
            <VerifiedBadge size={18} color="#1DA1F2" />
          </View>
          <Text style={s.avatarHandle}>@{user?.email?.split('@')[0] || 'cyrilbokilo'}</Text>
        </View>

        {/* Admin Info Card */}
        <View style={s.infoCard}>
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Rôle</Text>
            <Text style={s.infoValue}>Super Admin</Text>
          </View>
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Email</Text>
            <Text style={s.infoValue}>{user?.email}</Text>
          </View>
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Statut</Text>
            <View style={[s.statusBadge, { backgroundColor: C.success + '20' }]}>
              <Text style={[s.statusText, { color: C.success }]}>Actif</Text>
            </View>
          </View>
        </View>

        {/* Form Fields */}
        <Text style={s.sectionTitle}>Informations Personnelles</Text>
        
        <Text style={s.label}>Nom complet</Text>
        <TextInput
          style={s.input}
          value={name}
          onChangeText={setName}
          placeholder="Votre nom"
          placeholderTextColor={C.muted}
        />

        <Text style={s.label}>Email</Text>
        <TextInput
          style={s.input}
          value={email}
          onChangeText={setEmail}
          placeholder="votre@email.com"
          placeholderTextColor={C.muted}
          keyboardType="email-address"
          editable={false}
        />

        <Text style={s.label}>Téléphone</Text>
        <TextInput
          style={s.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="+33 6 12 34 56 78"
          placeholderTextColor={C.muted}
          keyboardType="phone-pad"
        />

        {/* Currency Selection */}
        <Text style={s.label}>Devise par défaut</Text>
        <TouchableOpacity
          style={s.currencySelector}
          onPress={() => setShowCurrencyModal(true)}
          disabled={preferencesLoading}
        >
          <View style={s.currencyLeft}>
            <Text style={s.currencyFlag}>{CURRENCIES[currency].flag}</Text>
            <Text style={s.currencyName}>{CURRENCIES[currency].name}</Text>
          </View>
          <View style={s.currencyRight}>
            <Text style={s.currencySymbol}>{CURRENCIES[currency].symbol}</Text>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.textLight} strokeWidth={2}>
              <Path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </View>
        </TouchableOpacity>

        {/* Payment Section - Only show if connected */}
        <Text style={s.sectionTitle}>Paiement</Text>
        <View style={s.paymentCard}>
          <View style={s.paymentHeader}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth={2}>
              <Rect x="2" y="4" width="20" height="16" rx="2"/>
              <Path d="M7 15h.01M11 15h.01M15 15h.01M7 11h.01M11 11h.01M15 11h.01M7 7h10" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
            <Text style={s.paymentTitle}>Méthode de paiement</Text>
          </View>
          <Text style={s.paymentDesc}>Aucune carte de paiement connectée. Connectez une carte Visa pour recevoir les paiements des abonnements.</Text>
          <TouchableOpacity style={s.paymentBtn}>
            <Text style={s.paymentBtnText}>Connecter une carte</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Stats Link */}
        <TouchableOpacity
          style={s.statsCard}
          onPress={() => navigation.navigate('AdminPaymentStats' as any)}
        >
          <View style={s.statsHeader}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.success} strokeWidth={2}>
              <Path d="M12 20V10"/>
              <Path d="M18 20V4"/>
              <Path d="M6 20v-4"/>
            </Svg>
            <Text style={s.statsTitle}>Statistiques des paiements</Text>
          </View>
          <Text style={s.statsDesc}>Voir les paiements reçus par Visa, Mobile Money et Espèces</Text>
          <View style={s.statsArrow}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.textLight} strokeWidth={2}>
              <Path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </View>
        </TouchableOpacity>

        {/* Save Button */}
        <TouchableOpacity
          style={s.saveBtn}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={C.white} />
          ) : (
            <Text style={s.saveBtnText}>💾 Enregistrer les modifications</Text>
          )}
        </TouchableOpacity>

        {/* Danger Zone */}
        <Text style={s.sectionTitle}>Zone de Danger</Text>
        <View style={s.dangerCard}>
          <Text style={s.dangerTitle}>Actions irréversibles</Text>
          <Text style={s.dangerDesc}>Ces actions sont permanentes et ne peuvent être annulées.</Text>
          <TouchableOpacity style={s.dangerBtn}>
            <Text style={s.dangerBtnText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Currency Selection Modal */}
      <Modal visible={showCurrencyModal} transparent animationType="slide" onRequestClose={() => setShowCurrencyModal(false)}>
        <View style={s.modalOverlay}>
          <TouchableOpacity style={s.modalBackdrop} activeOpacity={1} onPress={() => setShowCurrencyModal(false)} />
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Choisir la devise</Text>
              <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.textMid} strokeWidth={2}>
                  <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </TouchableOpacity>
            </View>
            <ScrollView style={s.currencyList} showsVerticalScrollIndicator={false}>
              {(Object.keys(CURRENCIES) as Currency[]).map((curr) => (
                <TouchableOpacity
                  key={curr}
                  style={[s.currencyOption, currency === curr && s.currencyOptionActive]}
                  onPress={() => handleCurrencySelect(curr)}
                >
                  <View style={s.currencyOptionLeft}>
                    <Text style={s.currencyOptionFlag}>{CURRENCIES[curr].flag}</Text>
                    <Text style={s.currencyOptionName}>{CURRENCIES[curr].name}</Text>
                  </View>
                  <Text style={[s.currencyOptionSymbol, currency === curr && s.currencyOptionSymbolActive]}>
                    {CURRENCIES[curr].symbol}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: C.textDark },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },

  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarContainer: { position: 'relative' },
  avatarImage: { width: 120, height: 120, borderRadius: 60 },
  avatarPlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 48, fontWeight: '800', color: C.white },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatarName: { fontSize: 24, fontWeight: '800', color: C.textDark, marginTop: 16 },
  avatarHandle: { fontSize: 14, color: C.textLight, marginTop: 4 },
  cameraBtn: { position: 'absolute', bottom: 0, left: 0, width: 36, height: 36, borderRadius: 18, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: C.surface },

  infoCard: { backgroundColor: C.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, marginBottom: 24 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  infoLabel: { fontSize: 14, color: C.textLight },
  infoValue: { fontSize: 14, fontWeight: '600', color: C.textDark },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: C.textDark, marginBottom: 12, marginTop: 8 },
  label: { fontSize: 14, fontWeight: '600', color: C.textMid, marginBottom: 8 },
  input: { height: 52, backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 16, fontSize: 15, color: C.textDark, borderWidth: 1.5, borderColor: C.border, marginBottom: 16 },

  paymentCard: { backgroundColor: C.surface, borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: C.accent, marginBottom: 24 },
  paymentHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  paymentTitle: { fontSize: 16, fontWeight: '700', color: C.textDark },
  paymentDesc: { fontSize: 13, color: C.textLight, marginBottom: 12, lineHeight: 18 },
  paymentBtn: { backgroundColor: C.accent, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  paymentBtnText: { fontSize: 14, fontWeight: '700', color: C.white },

  statsCard: { backgroundColor: C.surface, borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: C.success, marginBottom: 24 },
  statsHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  statsTitle: { fontSize: 16, fontWeight: '700', color: C.textDark },
  statsDesc: { fontSize: 13, color: C.textLight, marginBottom: 8, lineHeight: 18 },
  statsArrow: { position: 'absolute', right: 16, top: 16 },

  saveBtn: { backgroundColor: C.success, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 24, shadowColor: C.success, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 },
  saveBtnText: { color: C.white, fontSize: 16, fontWeight: '800' },

  dangerCard: { backgroundColor: '#FEF2F2', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#FECACA' },
  dangerTitle: { fontSize: 14, fontWeight: '700', color: '#DC2626', marginBottom: 4 },
  dangerDesc: { fontSize: 12, color: '#991B1B', marginBottom: 12 },
  dangerBtn: { backgroundColor: '#DC2626', height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  dangerBtnText: { fontSize: 14, fontWeight: '600', color: C.white },

  // Currency selector styles
  currencySelector: { height: 52, backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, borderColor: C.border, marginBottom: 16 },
  currencyLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  currencyFlag: { fontSize: 24 },
  currencyName: { fontSize: 15, fontWeight: '600', color: C.textDark },
  currencyRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  currencySymbol: { fontSize: 16, fontWeight: '700', color: C.textMid },

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBackdrop: { flex: 1 },
  modalContent: { backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: C.textDark },
  currencyList: { maxHeight: 400 },
  currencyOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: C.border },
  currencyOptionActive: { backgroundColor: C.accentSoft + '30', borderRadius: 12 },
  currencyOptionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  currencyOptionFlag: { fontSize: 28 },
  currencyOptionName: { fontSize: 16, fontWeight: '600', color: C.textDark },
  currencyOptionSymbol: { fontSize: 18, fontWeight: '700', color: C.textMid },
  currencyOptionSymbolActive: { color: C.accent },
});

export default AdminProfileScreen;
