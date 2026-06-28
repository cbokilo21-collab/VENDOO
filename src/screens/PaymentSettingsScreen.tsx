import React, { useState } from 'react';
import { ScreenHeader } from '../components/ScreenHeader';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal, Switch
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

const C = {
  navy: '#FF6B35', navyMid: '#FF8A5C',
  bg: '#FFF7F3', surface: '#FFFFFF', border: '#E2E8F0',
  accent: '#FF6B35', accentSoft: 'rgba(255,107,53,0.1)',
  textDark: '#0F172A', textMid: '#475569', textLight: '#64748B', muted: '#94A3B8',
  success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6', purple: '#8B5CF6',
  white: '#FFFFFF',
};

type RootStackParamList = {
  PaymentSettings: undefined; BusinessDashboard: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList>;

interface PaymentCard {
  id: string;
  last4: string;
  brand: 'visa' | 'mastercard' | 'amex';
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  holderName: string;
}

interface PaymentProvider {
  id: string;
  name: string;
  logo: string;
  enabled: boolean;
  connected: boolean;
  fees: { percentage: number; fixed: number };
  currency?: string;
}

const PAYMENT_PROVIDERS: PaymentProvider[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    logo: '💳',
    enabled: true,
    connected: false,
    fees: { percentage: 1.4, fixed: 0.25 },
  },
  {
    id: 'paypal',
    name: 'PayPal',
    logo: '🅿️',
    enabled: false,
    connected: false,
    fees: { percentage: 2.9, fixed: 0.30 },
  },
  {
    id: 'adyen',
    name: 'Adyen',
    logo: '🔷',
    enabled: false,
    connected: false,
    fees: { percentage: 1.5, fixed: 0.20 },
  },
];

const PaymentSettingsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [providers, setProviders] = useState(PAYMENT_PROVIDERS);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  
  // Add card form
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  
  // Payout settings
  const [payoutFrequency, setPayoutFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [minimumPayout, setMinimumPayout] = useState('25');
  const [autoPayout, setAutoPayout] = useState(true);

  const handleAddCard = () => {
    if (!cardNumber || !cardHolder || !expiryMonth || !expiryYear || !cvv) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    
    const newCard: PaymentCard = {
      id: Date.now().toString(),
      last4: cardNumber.slice(-4),
      brand: cardNumber.startsWith('4') ? 'visa' : cardNumber.startsWith('5') ? 'mastercard' : 'amex',
      expiryMonth: parseInt(expiryMonth),
      expiryYear: parseInt(expiryYear),
      isDefault: cards.length === 0,
      holderName: cardHolder,
    };
    
    setCards([...cards, newCard]);
    setShowAddCardModal(false);
    setCardNumber('');
    setCardHolder('');
    setExpiryMonth('');
    setExpiryYear('');
    setCvv('');
    Alert.alert('Succès', 'Carte ajoutée avec succès.');
  };

  const handleDeleteCard = (cardId: string) => {
    Alert.alert(
      'Supprimer la carte',
      'Voulez-vous vraiment supprimer cette carte ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setCards(cards.filter(c => c.id !== cardId));
          },
        },
      ]
    );
  };

  const handleSetDefault = (cardId: string) => {
    setCards(cards.map(c => ({ ...c, isDefault: c.id === cardId })));
  };

  const handleConnectProvider = (providerId: string) => {
    Alert.alert(
      'Connecter ' + providers.find(p => p.id === providerId)?.name,
      'Vous allez être redirigé vers la page de connexion du fournisseur de paiement.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Continuer',
          onPress: () => {
            setProviders(providers.map(p => 
              p.id === providerId ? { ...p, connected: true, enabled: true } : p
            ));
            Alert.alert('Succès', 'Fournisseur connecté avec succès.');
          },
        },
      ]
    );
  };

  const handleDisconnectProvider = (providerId: string) => {
    Alert.alert(
      'Déconnecter',
      'Voulez-vous vraiment déconnecter ce fournisseur de paiement ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: () => {
            setProviders(providers.map(p => 
              p.id === providerId ? { ...p, connected: false, enabled: false } : p
            ));
          },
        },
      ]
    );
  };

  const getCardBrandIcon = (brand: string) => {
    switch (brand) {
      case 'visa': return '💳';
      case 'mastercard': return '💳';
      case 'amex': return '💳';
      default: return '💳';
    }
  };

  const getCardBrandColor = (brand: string) => {
    switch (brand) {
      case 'visa': return '#1A1F71';
      case 'mastercard': return '#EB001B';
      case 'amex': return '#006FCF';
      default: return C.textDark;
    }
  };

  return (
    <View style={s.root}>
        <ScreenHeader title="Paiements" subtitle="Configuration" />
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.textDark} strokeWidth={2}>
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>💳 Paiements</Text>
          <Text style={s.headerSubtitle}>Configurez vos moyens de paiement</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        
        {/* Payment Providers */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Fournisseurs de paiement</Text>
          <Text style={s.cardSub}>Connectez Stripe, PayPal ou d'autres services</Text>
          
          {providers.map(provider => (
            <View key={provider.id} style={s.providerRow}>
              <View style={s.providerInfo}>
                <Text style={s.providerLogo}>{provider.logo}</Text>
                <View>
                  <Text style={s.providerName}>{provider.name}</Text>
                  <Text style={s.providerFees}>
                    {provider.fees.percentage}% + {provider.currency || '€'}{provider.fees.fixed} par transaction
                  </Text>
                </View>
              </View>
              
              {provider.connected ? (
                <TouchableOpacity
                  style={s.disconnectBtn}
                  onPress={() => handleDisconnectProvider(provider.id)}
                >
                  <Text style={s.disconnectBtnText}>Déconnecter</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={s.connectBtn}
                  onPress={() => handleConnectProvider(provider.id)}
                >
                  <Text style={s.connectBtnText}>Connecter</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Payment Cards */}
        <View style={s.card}>
          <View style={s.cardHeaderRow}>
            <View>
              <Text style={s.cardTitle}>Cartes bancaires</Text>
              <Text style={s.cardSub}>Ajoutez vos cartes pour recevoir des paiements</Text>
            </View>
            <TouchableOpacity
              style={s.addCardBtn}
              onPress={() => setShowAddCardModal(true)}
            >
              <Text style={s.addCardBtnText}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>

          {cards.length === 0 ? (
            <View style={s.emptyState}>
              <Text style={s.emptyIcon}>💳</Text>
              <Text style={s.emptyTitle}>Aucune carte ajoutée</Text>
              <Text style={s.emptyDesc}>Ajoutez une carte pour commencer à recevoir des paiements</Text>
            </View>
          ) : (
            cards.map(card => (
              <View key={card.id} style={[s.cardItem, card.isDefault && s.cardItemDefault]}>
                {card.isDefault && <View style={s.defaultBadge}><Text style={s.defaultBadgeText}>Par défaut</Text></View>}
                <View style={s.cardRow}>
                  <View style={[s.cardBrand, { backgroundColor: getCardBrandColor(card.brand) }]}>
                    <Text style={s.cardBrandIcon}>{getCardBrandIcon(card.brand)}</Text>
                  </View>
                  <View style={s.cardDetails}>
                    <Text style={s.cardNumber}>•••• •••• •••• {card.last4}</Text>
                    <Text style={s.cardHolder}>{card.holderName}</Text>
                    <Text style={s.cardExpiry}>Exp: {String(card.expiryMonth).padStart(2, '0')}/{card.expiryYear}</Text>
                  </View>
                </View>
                <View style={s.cardActions}>
                  {!card.isDefault && (
                    <TouchableOpacity
                      style={s.setDefaultBtn}
                      onPress={() => handleSetDefault(card.id)}
                    >
                      <Text style={s.setDefaultBtnText}>Définir par défaut</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={s.deleteCardBtn}
                    onPress={() => handleDeleteCard(card.id)}
                  >
                    <Text style={s.deleteCardBtnText}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Payout Settings */}
        <View style={s.card}>
          <View style={s.cardHeaderRow}>
            <View>
              <Text style={s.cardTitle}>Versements</Text>
              <Text style={s.cardSub}>Configurez comment vous recevez vos paiements</Text>
            </View>
            <TouchableOpacity
              style={s.payoutBtn}
              onPress={() => setShowPayoutModal(true)}
            >
              <Text style={s.payoutBtnText}>Configurer</Text>
            </TouchableOpacity>
          </View>

          <View style={s.payoutInfo}>
            <View style={s.payoutRow}>
              <Text style={s.payoutLabel}>Fréquence</Text>
              <Text style={s.payoutValue}>{payoutFrequency === 'daily' ? 'Quotidien' : payoutFrequency === 'weekly' ? 'Hebdomadaire' : 'Mensuel'}</Text>
            </View>
            <View style={s.payoutRow}>
              <Text style={s.payoutLabel}>Minimum de versement</Text>
              <Text style={s.payoutValue}>€ {minimumPayout}</Text>
            </View>
            <View style={s.payoutRow}>
              <Text style={s.payoutLabel}>Versement automatique</Text>
              <Text style={[s.payoutValue, { color: autoPayout ? C.success : C.textMid }]}>
                {autoPayout ? 'Activé' : 'Désactivé'}
              </Text>
            </View>
          </View>
        </View>

        {/* Security Info */}
        <View style={s.infoBox}>
          <Text style={s.infoIcon}>🔒</Text>
          <Text style={s.infoText}>
            Vos informations de paiement sont sécurisées et cryptées conformément aux normes PCI-DSS. Nous ne stockons jamais vos informations de carte complètes.
          </Text>
        </View>

      </ScrollView>

      {/* Add Card Modal */}
      <Modal visible={showAddCardModal} transparent animationType="slide" onRequestClose={() => setShowAddCardModal(false)}>
        <View style={s.modalOverlay}>
          <TouchableOpacity style={s.modalBackdrop} activeOpacity={1} onPress={() => setShowAddCardModal(false)} />
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Ajouter une carte</Text>
              <TouchableOpacity onPress={() => setShowAddCardModal(false)}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.textMid} strokeWidth={2}>
                  <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </TouchableOpacity>
            </View>

            <View style={s.formGroup}>
              <Text style={s.formLabel}>Numéro de carte</Text>
              <TextInput
                style={s.formInput}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={C.muted}
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="number-pad"
                maxLength={19}
              />
            </View>

            <View style={s.formGroup}>
              <Text style={s.formLabel}>Titulaire de la carte</Text>
              <TextInput
                style={s.formInput}
                placeholder="JEAN DUPONT"
                placeholderTextColor={C.muted}
                value={cardHolder}
                onChangeText={setCardHolder}
                autoCapitalize="characters"
              />
            </View>

            <View style={s.formRow}>
              <View style={[s.formGroup, { flex: 1 }]}>
                <Text style={s.formLabel}>Expiration</Text>
                <View style={s.expiryRow}>
                  <TextInput
                    style={[s.formInput, { flex: 1 }]}
                    placeholder="MM"
                    placeholderTextColor={C.muted}
                    value={expiryMonth}
                    onChangeText={setExpiryMonth}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                  <Text style={s.expirySeparator}>/</Text>
                  <TextInput
                    style={[s.formInput, { flex: 1 }]}
                    placeholder="AA"
                    placeholderTextColor={C.muted}
                    value={expiryYear}
                    onChangeText={setExpiryYear}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>
              </View>
              <View style={[s.formGroup, { flex: 1 }]}>
                <Text style={s.formLabel}>CVV</Text>
                <TextInput
                  style={s.formInput}
                  placeholder="123"
                  placeholderTextColor={C.muted}
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity style={s.submitBtn} onPress={handleAddCard}>
              <Text style={s.submitBtnText}>Ajouter la carte</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Payout Settings Modal */}
      <Modal visible={showPayoutModal} transparent animationType="slide" onRequestClose={() => setShowPayoutModal(false)}>
        <View style={s.modalOverlay}>
          <TouchableOpacity style={s.modalBackdrop} activeOpacity={1} onPress={() => setShowPayoutModal(false)} />
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Paramètres de versement</Text>
              <TouchableOpacity onPress={() => setShowPayoutModal(false)}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.textMid} strokeWidth={2}>
                  <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </TouchableOpacity>
            </View>

            <View style={s.formGroup}>
              <Text style={s.formLabel}>Fréquence de versement</Text>
              <View style={s.optionRow}>
                {[
                  { id: 'daily', label: 'Quotidien' },
                  { id: 'weekly', label: 'Hebdomadaire' },
                  { id: 'monthly', label: 'Mensuel' },
                ].map(opt => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[s.optionChip, payoutFrequency === opt.id && s.optionChipActive]}
                    onPress={() => setPayoutFrequency(opt.id as any)}
                  >
                    <Text style={[s.optionText, payoutFrequency === opt.id && s.optionTextActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={s.formGroup}>
              <Text style={s.formLabel}>Minimum de versement (€)</Text>
              <TextInput
                style={s.formInput}
                placeholder="25"
                placeholderTextColor={C.muted}
                value={minimumPayout}
                onChangeText={setMinimumPayout}
                keyboardType="number-pad"
              />
            </View>

            <View style={s.switchRow}>
              <View style={s.switchInfo}>
                <Text style={s.switchLabel}>Versement automatique</Text>
                <Text style={s.switchDesc}>Les fonds sont transférés automatiquement</Text>
              </View>
              <Switch
                value={autoPayout}
                onValueChange={setAutoPayout}
                trackColor={{ false: C.border, true: C.success }}
                thumbColor={C.white}
              />
            </View>

            <TouchableOpacity style={s.submitBtn} onPress={() => setShowPayoutModal(false)}>
              <Text style={s.submitBtnText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { width: 36, height: 36, borderRadius: 9, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: C.textDark },
  headerSubtitle: { fontSize: 12, color: C.textLight },
  
  content: { padding: 20, gap: 16, paddingBottom: 24 },
  
  card: { backgroundColor: C.surface, borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: C.textDark },
  cardSub: { fontSize: 12, color: C.textLight, marginTop: 2 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  
  // Providers
  providerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  providerInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  providerLogo: { fontSize: 28 },
  providerName: { fontSize: 15, fontWeight: '700', color: C.textDark },
  providerFees: { fontSize: 12, color: C.textLight },
  connectBtn: { backgroundColor: C.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  connectBtnText: { fontSize: 13, fontWeight: '700', color: C.white },
  disconnectBtn: { backgroundColor: C.error + '15', borderWidth: 1.5, borderColor: C.error, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  disconnectBtnText: { fontSize: 13, fontWeight: '700', color: C.error },
  
  // Cards
  addCardBtn: { backgroundColor: C.accent, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  addCardBtnText: { fontSize: 13, fontWeight: '700', color: C.white },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: C.textDark, marginBottom: 4 },
  emptyDesc: { fontSize: 13, color: C.textLight, textAlign: 'center' },
  cardItem: { backgroundColor: C.bg, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 2, borderColor: 'transparent' },
  cardItemDefault: { borderColor: C.success },
  defaultBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: C.success, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  defaultBadgeText: { fontSize: 10, fontWeight: '700', color: C.white },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardBrand: { width: 48, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  cardBrandIcon: { fontSize: 20 },
  cardDetails: { flex: 1 },
  cardNumber: { fontSize: 16, fontWeight: '700', color: C.textDark, marginBottom: 4 },
  cardHolder: { fontSize: 13, color: C.textMid, marginBottom: 2 },
  cardExpiry: { fontSize: 12, color: C.textLight },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  setDefaultBtn: { flex: 1, backgroundColor: C.info + '15', borderWidth: 1.5, borderColor: C.info, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  setDefaultBtnText: { fontSize: 12, fontWeight: '700', color: C.info },
  deleteCardBtn: { flex: 1, backgroundColor: C.error + '15', borderWidth: 1.5, borderColor: C.error, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  deleteCardBtnText: { fontSize: 12, fontWeight: '700', color: C.error },
  
  // Payout
  payoutBtn: { backgroundColor: C.success, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  payoutBtnText: { fontSize: 13, fontWeight: '700', color: C.white },
  payoutInfo: { gap: 12 },
  payoutRow: { flexDirection: 'row', justifyContent: 'space-between' },
  payoutLabel: { fontSize: 14, color: C.textMid },
  payoutValue: { fontSize: 14, fontWeight: '600', color: C.textDark },
  
  // Info
  infoBox: { flexDirection: 'row', gap: 12, backgroundColor: '#F0FDF4', borderRadius: 12, padding: 14, borderLeftWidth: 3, borderLeftColor: C.success },
  infoIcon: { fontSize: 18 },
  infoText: { flex: 1, fontSize: 13, color: '#166534', lineHeight: 19 },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBackdrop: { flex: 1 },
  modalContent: { backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: C.textDark },
  
  // Form
  formGroup: { gap: 8 },
  formLabel: { fontSize: 14, fontWeight: '600', color: C.textDark },
  formInput: { height: 48, borderWidth: 1.5, borderColor: C.border, borderRadius: 10, paddingHorizontal: 14, fontSize: 15, color: C.textDark, backgroundColor: C.bg },
  formRow: { flexDirection: 'row', gap: 12 },
  expiryRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  expirySeparator: { fontSize: 18, fontWeight: '700', color: C.textMid },
  
  // Options
  optionRow: { flexDirection: 'row', gap: 8 },
  optionChip: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1.5, borderColor: C.border, alignItems: 'center' },
  optionChipActive: { backgroundColor: C.accent, borderColor: C.accent },
  optionText: { fontSize: 13, color: C.textMid, fontWeight: '500' },
  optionTextActive: { color: C.white, fontWeight: '700' },
  
  // Switch
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  switchInfo: { flex: 1 },
  switchLabel: { fontSize: 15, fontWeight: '600', color: C.textDark },
  switchDesc: { fontSize: 12, color: C.textLight },
  
  submitBtn: { backgroundColor: C.accent, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  submitBtnText: { fontSize: 16, fontWeight: '800', color: C.white },
});

export default PaymentSettingsScreen;
