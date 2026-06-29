import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import Svg, { Path, Circle, Line, Rect, Polyline } from 'react-native-svg';

const C = {
  bg: '#F8FAFC', surface: '#FFFFFF', border: '#E2E8F0',
  orange: '#F97316', orangeFade: 'rgba(249,115,22,0.08)',
  textDark: '#0F172A', textMid: '#475569', textLight: '#94A3B8', muted: '#CBD5E1',
  success: '#22C55E', warning: '#F59E0B', purple: '#8B5CF6',
};

interface BoostPackage {
  id: string;
  name: string;
  description: string;
  views: string;
  clicks: string;
  price: string;
  popular?: boolean;
}

const PACKAGES: BoostPackage[] = [
  { id: '1', name: 'Starter', description: 'Idéal pour tester', views: '1 000', clicks: '50', price: '5 000 F' },
  { id: '2', name: 'Growth', description: 'Pour les boutiques en croissance', views: '5 000', clicks: '250', price: '20 000 F', popular: true },
  { id: '3', name: 'Pro', description: 'Maximum de visibilité', views: '20 000', clicks: '1 000', price: '75 000 F' },
  { id: '4', name: 'Enterprise', description: 'Visibilité illimitée', views: '100 000', clicks: '5 000', price: '300 000 F' },
];

interface ActiveBoost {
  id: string;
  package: string;
  startDate: string;
  endDate: string;
  views: number;
  clicks: number;
  targetViews: number;
  targetClicks: number;
  status: 'active' | 'completed' | 'paused';
}

const ACTIVE_BOOSTS: ActiveBoost[] = [
  { id: '1', package: 'Growth', startDate: '2024-03-01', endDate: '2024-03-31', views: 2340, clicks: 120, targetViews: 5000, targetClicks: 250, status: 'active' },
];

const BoostScreen: React.FC = () => {
  const [selectedPackage, setSelectedPackage] = useState<BoostPackage | null>(null);
  const [customBudget, setCustomBudget] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

  const renderPackage = (pkg: BoostPackage) => (
    <TouchableOpacity
      key={pkg.id}
      style={[s.packageCard, pkg.popular && s.packageCardPopular]}
      onPress={() => setSelectedPackage(pkg)}
    >
      {pkg.popular && <View style={s.popularBadge}><Text style={s.popularBadgeText}>Populaire</Text></View>}
      <Text style={s.packageName}>{pkg.name}</Text>
      <Text style={s.packageDescription}>{pkg.description}</Text>
      <View style={s.packageStats}>
        <View style={s.statItem}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth={2}>
            <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round"/>
            <Circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
          <Text style={s.packageStatValue}>{pkg.views} vues</Text>
        </View>
        <View style={s.statItem}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.success} strokeWidth={2}>
            <Path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" strokeLinecap="round" strokeLinejoin="round"/>
            <Polyline points="10 17 15 12 10 7" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
          <Text style={s.packageStatValue}>{pkg.clicks} clics</Text>
        </View>
      </View>
      <Text style={s.packagePrice}>{pkg.price}</Text>
      <TouchableOpacity style={s.selectBtn}>
        <Text style={s.selectBtnText}>Sélectionner</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderActiveBoost = (boost: ActiveBoost) => {
    const viewsProgress = (boost.views / boost.targetViews) * 100;
    const clicksProgress = (boost.clicks / boost.targetClicks) * 100;
    
    return (
      <View key={boost.id} style={s.activeBoostCard}>
        <View style={s.activeBoostHeader}>
          <Text style={s.activeBoostTitle}>{boost.package}</Text>
          <View style={[s.statusBadge, { backgroundColor: boost.status === 'active' ? C.success + '20' : C.muted + '20' }]}>
            <Text style={[s.statusText, { color: boost.status === 'active' ? C.success : C.muted }]}>
              {boost.status === 'active' ? 'Actif' : boost.status === 'completed' ? 'Terminé' : 'En pause'}
            </Text>
          </View>
        </View>
        
        <View style={s.progressSection}>
          <View style={s.progressRow}>
            <Text style={s.progressLabel}>Vues</Text>
            <Text style={s.progressValue}>{boost.views} / {boost.targetViews}</Text>
          </View>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${viewsProgress}%`, backgroundColor: C.orange }]} />
          </View>
        </View>
        
        <View style={s.progressSection}>
          <View style={s.progressRow}>
            <Text style={s.progressLabel}>Clics</Text>
            <Text style={s.progressValue}>{boost.clicks} / {boost.targetClicks}</Text>
          </View>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${clicksProgress}%`, backgroundColor: C.success }]} />
          </View>
        </View>
        
        <View style={s.dateRow}>
          <Text style={s.dateLabel}>Du {boost.startDate}</Text>
          <Text style={s.dateLabel}>Au {boost.endDate}</Text>
        </View>
        
        <View style={s.activeBoostActions}>
          <TouchableOpacity style={s.pauseBtn}>
            <Text style={s.pauseBtnText}>⏸️ Pause</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.extendBtn}>
            <Text style={s.extendBtnText}>📈 Étendre</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Boost</Text>
        <Text style={s.headerSub}>Augmentez la visibilité de votre boutique</Text>
      </View>

      <ScrollView style={s.content}>
        <View style={s.statsCard}>
          <View style={s.stat}>
            <Text style={s.statLabel}>Vues totales</Text>
            <Text style={s.statValue}>12 450</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.stat}>
            <Text style={s.statLabel}>Clics totaux</Text>
            <Text style={s.statValue}>856</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.stat}>
            <Text style={s.statLabel}>Taux de clic</Text>
            <Text style={[s.statValue, s.statValueGreen]}>6.9%</Text>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Boosts actifs</Text>
          {ACTIVE_BOOSTS.length === 0 ? (
            <View style={s.emptyState}>
              <Text style={s.emptyStateText}>Aucun boost actif</Text>
              <Text style={s.emptyStateSub}>Lancez votre premier boost pour augmenter votre visibilité</Text>
            </View>
          ) : (
            ACTIVE_BOOSTS.map(renderActiveBoost)
          )}
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Packages de boost</Text>
          {PACKAGES.map(renderPackage)}
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Budget personnalisé</Text>
          <View style={s.field}>
            <Text style={s.fieldLabel}>Votre budget (F)</Text>
            <TextInput
              style={s.input}
              value={customBudget}
              onChangeText={setCustomBudget}
              placeholder="Ex: 50 000"
              keyboardType="numeric"
            />
          </View>
          <TouchableOpacity style={s.customBtn}>
            <Text style={s.customBtnText}>Créer un boost personnalisé</Text>
          </TouchableOpacity>
        </View>

        <View style={s.infoCard}>
          <Text style={s.infoTitle}>💡 Comment ça marche ?</Text>
          <Text style={s.infoText}>1. Choisissez un package de boost</Text>
          <Text style={s.infoText}>2. Votre boutique est affichée à plus d'utilisateurs</Text>
          <Text style={s.infoText}>3. Vous payez uniquement pour les résultats (vues/clics)</Text>
          <Text style={s.infoText}>4. Suivez vos performances en temps réel</Text>
        </View>
      </ScrollView>

      <Modal visible={!!selectedPackage} animationType="fade" onRequestClose={() => setSelectedPackage(null)}>
        <View style={s.paymentModalOverlay}>
          <View style={s.paymentModal}>
            <Text style={s.paymentModalTitle}>Payer le boost</Text>
            
            <View style={s.paymentSummary}>
              <Text style={s.paymentSummaryLabel}>Package</Text>
              <Text style={s.paymentSummaryValue}>{selectedPackage?.name}</Text>
              
              <Text style={s.paymentSummaryLabel}>Vues estimées</Text>
              <Text style={s.paymentSummaryValue}>{selectedPackage?.views}</Text>
              
              <Text style={s.paymentSummaryLabel}>Clics estimés</Text>
              <Text style={s.paymentSummaryValue}>{selectedPackage?.clicks}</Text>
              
              <View style={s.paymentDivider} />
              
              <Text style={s.paymentSummaryLabel}>Total</Text>
              <Text style={[s.paymentSummaryValue, s.paymentSummaryValuePrice]}>{selectedPackage?.price}</Text>
            </View>
            
            <View style={s.cardField}>
              <Text style={s.cardFieldLabel}>Numéro de carte</Text>
              <TextInput
                style={s.cardInput}
                value={cardNumber}
                onChangeText={setCardNumber}
                placeholder="4242 4242 4242 4242"
                keyboardType="numeric"
                maxLength={19}
              />
            </View>
            
            <View style={s.cardRow}>
              <View style={[s.cardField, s.cardFieldHalf]}>
                <Text style={s.cardFieldLabel}>Expiration</Text>
                <TextInput
                  style={s.cardInput}
                  value={cardExpiry}
                  onChangeText={setCardExpiry}
                  placeholder="MM/AA"
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              <View style={[s.cardField, s.cardFieldHalf]}>
                <Text style={s.cardFieldLabel}>CVC</Text>
                <TextInput
                  style={s.cardInput}
                  value={cardCvc}
                  onChangeText={setCardCvc}
                  placeholder="123"
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>
            
            <View style={s.cardField}>
              <Text style={s.cardFieldLabel}>Nom sur la carte</Text>
              <TextInput
                style={s.cardInput}
                value={cardName}
                onChangeText={setCardName}
                placeholder="JEAN DUPONT"
              />
            </View>
            
            <View style={s.cardBrands}>
              <View style={[s.cardBrand, { backgroundColor: '#1A1F71' }]}>
                <Text style={s.cardBrandText}>VISA</Text>
              </View>
              <View style={[s.cardBrand, { backgroundColor: '#EB001B' }]}>
                <View style={s.mastercardCircles}>
                  <View style={[s.mastercardCircle, { backgroundColor: '#EB001B' }]} />
                  <View style={[s.mastercardCircle, { backgroundColor: '#F79E1B', marginLeft: -6 }]} />
                </View>
              </View>
              <View style={[s.cardBrand, { backgroundColor: '#0066B2' }]}>
                <Text style={s.cardBrandText}>MC</Text>
              </View>
            </View>
            
            <TouchableOpacity style={s.confirmBtn}>
              <Text style={s.confirmBtnText}>💳 Payer {selectedPackage?.price}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={s.cancelBtn} onPress={() => setSelectedPackage(null)}>
              <Text style={s.cancelBtnText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { padding: 24, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: C.textDark, marginBottom: 4 },
  headerSub: { fontSize: 14, color: C.textLight },
  content: { flex: 1, paddingHorizontal: 16 },
  
  statsCard: {
    flexDirection: 'row', backgroundColor: C.surface, borderRadius: 20,
    padding: 24, marginBottom: 24, borderWidth: 1, borderColor: C.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8,
  },
  stat: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 13, color: C.textLight, marginBottom: 6, fontWeight: '600' },
  statValue: { fontSize: 24, fontWeight: '900', color: C.textDark },
  statValueGreen: { color: C.success },
  statDivider: { width: 1, backgroundColor: C.border },
  
  card: {
    backgroundColor: C.surface, borderRadius: 20, padding: 24,
    marginBottom: 20, borderWidth: 1, borderColor: C.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4,
  },
  cardTitle: { fontSize: 20, fontWeight: '800', color: C.textDark, marginBottom: 20, letterSpacing: -0.5 },
  
  packageCard: {
    backgroundColor: C.bg, borderRadius: 16, padding: 24,
    marginBottom: 16, borderWidth: 1, borderColor: C.border, position: 'relative',
  },
  packageCardPopular: { borderColor: C.orange, borderWidth: 2 },
  popularBadge: {
    position: 'absolute', top: -12, right: 24, backgroundColor: C.orange,
    paddingHorizontal: 14, paddingVertical: 5, borderRadius: 14,
  },
  popularBadgeText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },
  packageName: { fontSize: 20, fontWeight: '900', color: C.textDark, marginBottom: 6 },
  packageDescription: { fontSize: 14, color: C.textLight, marginBottom: 16 },
  packageStats: { flexDirection: 'row', gap: 20, marginBottom: 16 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  packageStatValue: { fontSize: 14, fontWeight: '700', color: C.textMid },
  packagePrice: { fontSize: 28, fontWeight: '900', color: C.orange, marginBottom: 16 },
  selectBtn: {
    backgroundColor: C.orange, borderRadius: 12, padding: 16,
    alignItems: 'center',
  },
  selectBtnText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  
  activeBoostCard: {
    backgroundColor: C.bg, borderRadius: 16, padding: 20,
    marginBottom: 16, borderWidth: 1, borderColor: C.border,
  },
  activeBoostHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 20,
  },
  activeBoostTitle: { fontSize: 18, fontWeight: '900', color: C.textDark },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  progressSection: { marginBottom: 16 },
  progressRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: { fontSize: 14, fontWeight: '600', color: C.textMid },
  progressValue: { fontSize: 14, fontWeight: '700', color: C.textDark },
  progressBar: {
    height: 8, backgroundColor: C.border, borderRadius: 4, overflow: 'hidden',
  },
  progressFill: { height: '100%' },
  dateRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateLabel: { fontSize: 13, color: C.textLight },
  activeBoostActions: { flexDirection: 'row', gap: 12 },
  pauseBtn: {
    flex: 1, padding: 12, borderRadius: 10, backgroundColor: C.bg,
    borderWidth: 1, borderColor: C.border, alignItems: 'center',
  },
  pauseBtnText: { fontSize: 14, fontWeight: '700', color: C.textMid },
  extendBtn: {
    flex: 1, padding: 12, borderRadius: 10, backgroundColor: C.success,
    alignItems: 'center',
  },
  extendBtnText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
  
  emptyState: { padding: 32, alignItems: 'center' },
  emptyStateText: { fontSize: 15, fontWeight: '700', color: C.textMid, marginBottom: 4 },
  emptyStateSub: { fontSize: 13, color: C.textLight, textAlign: 'center' },
  
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 14, fontWeight: '700', color: C.textMid, marginBottom: 8 },
  input: {
    backgroundColor: C.bg, borderRadius: 10, padding: 14,
    fontSize: 14, color: C.textDark, borderWidth: 1, borderColor: C.border,
  },
  customBtn: {
    backgroundColor: C.purple, borderRadius: 10, padding: 14,
    alignItems: 'center',
  },
  customBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  
  infoCard: {
    backgroundColor: C.orangeFade, borderRadius: 16, padding: 20,
    marginBottom: 24, borderWidth: 1, borderColor: C.orange + '30',
  },
  infoTitle: { fontSize: 16, fontWeight: '800', color: C.orange, marginBottom: 12 },
  infoText: { fontSize: 14, color: C.textMid, marginBottom: 6 },
  
  paymentModalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center',
    padding: 20,
  },
  paymentModal: {
    backgroundColor: C.surface, borderRadius: 20, padding: 24,
  },
  paymentModalTitle: { fontSize: 20, fontWeight: '800', color: C.textDark, marginBottom: 20, textAlign: 'center' },
  paymentSummary: { marginBottom: 20 },
  paymentSummaryLabel: { fontSize: 14, color: C.textLight, marginBottom: 4 },
  paymentSummaryValue: { fontSize: 16, fontWeight: '700', color: C.textDark, marginBottom: 12 },
  paymentDivider: { height: 1, backgroundColor: C.border, marginVertical: 12 },
  paymentSummaryValuePrice: { fontSize: 24, fontWeight: '900', color: C.orange },
  confirmBtn: {
    backgroundColor: C.orange, borderRadius: 12, padding: 16,
    alignItems: 'center', marginBottom: 12,
  },
  confirmBtnText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  cancelBtn: { padding: 16, alignItems: 'center' },
  cancelBtnText: { fontSize: 16, fontWeight: '700', color: C.textMid },
  
  // Card Payment
  cardField: { marginBottom: 16 },
  cardFieldLabel: { fontSize: 13, fontWeight: '700', color: C.textMid, marginBottom: 8 },
  cardInput: {
    backgroundColor: C.bg, borderRadius: 10, padding: 14,
    fontSize: 14, color: C.textDark, borderWidth: 1, borderColor: C.border,
  },
  cardRow: { flexDirection: 'row', gap: 12 },
  cardFieldHalf: { flex: 1 },
  cardBrands: {
    flexDirection: 'row', justifyContent: 'center', gap: 16,
    marginBottom: 20,
  },
  cardBrand: {
    width: 50, height: 32, borderRadius: 6, alignItems: 'center',
    justifyContent: 'center',
  },
  cardBrandText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF' },
  mastercardCircles: { flexDirection: 'row' },
  mastercardCircle: { width: 16, height: 16, borderRadius: 8 },
});

export default BoostScreen;
