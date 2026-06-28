import React, { useState, useRef, useEffect } from 'react';
import { ScreenHeader } from '../components/ScreenHeader';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal, Switch, Animated, Easing
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
  Sponsorship: undefined; BusinessDashboard: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList, 'Sponsorship'>;

interface SponsorshipPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration: string;
  boost: string;
  features: string[];
  popular?: boolean;
}

const SPONSORSHIP_PLANS: SponsorshipPlan[] = [
  {
    id: 'basic',
    name: 'Visibilité Basic',
    price: 9.99,
    currency: 'EUR',
    duration: '7 jours',
    boost: '+25% visibilité',
    features: [
      'Affichage prioritaire dans votre quartier',
      'Badge "Sponsorisé" sur votre boutique',
      '2x plus de vues sur votre boutique',
      'Support par email',
    ],
  },
  {
    id: 'pro',
    name: 'Visibilité Pro',
    price: 24.99,
    currency: 'EUR',
    duration: '30 jours',
    boost: '+50% visibilité',
    popular: true,
    features: [
      'Tout du plan Basic',
      'Affichage dans les quartiers voisins',
      'Badge "Premium" exclusif',
      '3x plus de vues sur votre boutique',
      'Campagne de mise en avant',
      'Support prioritaire',
    ],
  },
  {
    id: 'elite',
    name: 'Visibilité Elite',
    price: 59.99,
    currency: 'EUR',
    duration: '90 jours',
    boost: '+100% visibilité',
    features: [
      'Tout du plan Pro',
      'Affichage en vedette sur toute la plateforme',
      'Badge "Elite" exclusif',
      '5x plus de vues sur votre boutique',
      'Campagne de mise en avant personnalisée',
      'Account manager dédié',
      'Rapports hebdomadaires de performance',
    ],
  },
];

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

const SponsorshipScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [selectedPlan, setSelectedPlan] = useState<SponsorshipPlan | null>(null);
  const [autoRenew, setAutoRenew] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleSelectPlan = (plan: SponsorshipPlan) => {
    setSelectedPlan(plan);
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    if (!selectedPlan) return;
    setShowConfirmModal(false);
    Alert.alert(
      'Sponsorship activé !',
      `Votre plan ${selectedPlan.name} est maintenant actif pour ${selectedPlan.duration}.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setShowConfirmModal(false);
            setSelectedPlan(null);
          },
        },
      ]
    );
  };

  return (
    <View style={s.root}>
        <ScreenHeader title="Parrainage" />
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.textDark} strokeWidth={2}>
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>⚡ Sponsorship</Text>
          <Text style={s.headerSubtitle}>Boostez votre visibilité sur Vendoo</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Hero Section */}
        <AnimatedCard delay={0} style={s.heroCard}>
          <Text style={s.heroTitle}>Devenez visible par des milliers de clients</Text>
          <Text style={s.heroDesc}>
            Augmentez votre visibilité dans le quartier et attirez plus de clients avec nos plans de sponsorship.
          </Text>
          <View style={s.heroStats}>
            <View style={s.heroStat}>
              <Text style={s.heroStatValue}>+150%</Text>
              <Text style={s.heroStatLabel}>Vues en moyenne</Text>
            </View>
            <View style={s.heroStat}>
              <Text style={s.heroStatValue}>3x</Text>
              <Text style={s.heroStatLabel}>Plus de clients</Text>
            </View>
            <View style={s.heroStat}>
              <Text style={s.heroStatValue}>24/7</Text>
              <Text style={s.heroStatLabel}>Visibilité continue</Text>
            </View>
          </View>
        </AnimatedCard>

        {/* Plans */}
        <AnimatedCard delay={50} style={s.sectionTitleWrapper}>
          <Text style={s.sectionTitle}>Choisissez votre plan</Text>
        </AnimatedCard>

        {SPONSORSHIP_PLANS.map((plan, index) => (
          <AnimatedCard key={plan.id} delay={100 + index * 50} style={[s.planCard, selectedPlan?.id === plan.id && s.planCardSelected]}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => handleSelectPlan(plan)}
              activeOpacity={0.85}
            >
            {plan.popular && (
              <View style={s.popularBadge}>
                <Text style={s.popularBadgeText}>Populaire</Text>
              </View>
            )}
            
            <View style={s.planHeader}>
              <View>
                <Text style={s.planName}>{plan.name}</Text>
                <Text style={s.planBoost}>{plan.boost}</Text>
              </View>
              <View style={s.planPrice}>
                <Text style={s.planPriceValue}>{plan.price}€</Text>
                <Text style={s.planPriceDuration}>/{plan.duration}</Text>
              </View>
            </View>

            <View style={s.planFeatures}>
              {plan.features.map((feature, index) => (
                <View key={index} style={s.featureItem}>
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.success} strokeWidth={2}>
                    <Path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                  <Text style={s.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={[s.selectBtn, selectedPlan?.id === plan.id && s.selectBtnSelected]}>
              <Text style={[s.selectBtnText, selectedPlan?.id === plan.id && s.selectBtnTextSelected]}>
                {selectedPlan?.id === plan.id ? 'Sélectionné' : 'Choisir ce plan'}
              </Text>
            </TouchableOpacity>
            </TouchableOpacity>
          </AnimatedCard>
        ))}

        {/* Auto-renew option */}
        <AnimatedCard delay={250} style={s.autoRenewCard}>
          <View style={s.autoRenewInfo}>
            <Text style={s.autoRenewTitle}>Renouvellement automatique</Text>
            <Text style={s.autoRenewDesc}>
              Renouvelez automatiquement votre sponsorship à la fin de la période pour ne jamais perdre votre visibilité.
            </Text>
          </View>
          <Switch
            value={autoRenew}
            onValueChange={setAutoRenew}
            trackColor={{ false: C.border, true: C.accent }}
            thumbColor={C.white}
          />
        </AnimatedCard>

        {/* Info Box */}
        <AnimatedCard delay={300} style={s.infoBox}>
          <Text style={s.infoIcon}>💡</Text>
          <Text style={s.infoText}>
            Les sponsorships sont visibles dans tout le quartier Vendoo. Plus votre boutique est visible, plus vous attirez de clients potentiels.
          </Text>
        </AnimatedCard>

      </ScrollView>

      {/* Confirm Modal */}
      <Modal visible={showConfirmModal} transparent animationType="slide" onRequestClose={() => setShowConfirmModal(false)}>
        <View style={s.modalOverlay}>
          <TouchableOpacity style={s.modalBackdrop} activeOpacity={1} onPress={() => setShowConfirmModal(false)} />
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Confirmer le sponsorship</Text>
              <TouchableOpacity onPress={() => setShowConfirmModal(false)}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.textMid} strokeWidth={2}>
                  <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </TouchableOpacity>
            </View>
            
            {selectedPlan && (
              <View style={s.modalBody}>
                <View style={s.modalPlanCard}>
                  <Text style={s.modalPlanName}>{selectedPlan.name}</Text>
                  <Text style={s.modalPlanPrice}>{selectedPlan.price}€ / {selectedPlan.duration}</Text>
                  <Text style={s.modalPlanBoost}>{selectedPlan.boost}</Text>
                </View>

                <View style={s.modalSummary}>
                  <View style={s.modalSummaryRow}>
                    <Text style={s.modalSummaryLabel}>Prix total</Text>
                    <Text style={s.modalSummaryValue}>{selectedPlan.price}€</Text>
                  </View>
                  <View style={s.modalSummaryRow}>
                    <Text style={s.modalSummaryLabel}>Durée</Text>
                    <Text style={s.modalSummaryValue}>{selectedPlan.duration}</Text>
                  </View>
                  {autoRenew && (
                    <View style={s.modalSummaryRow}>
                      <Text style={s.modalSummaryLabel}>Renouvellement</Text>
                      <Text style={s.modalSummaryValue}>Automatique</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity style={s.confirmBtn} onPress={handleConfirm}>
                  <Text style={s.confirmBtnText}>Confirmer et payer</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { width: 36, height: 36, borderRadius: 9, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: C.textDark },
  headerSubtitle: { fontSize: 12, color: C.textLight },
  
  content: { padding: 20, gap: 20, paddingBottom: 24 },
  
  heroCard: { backgroundColor: C.accent, borderRadius: 16, padding: 24, gap: 16 },
  heroTitle: { fontSize: 20, fontWeight: '800', color: C.white, marginBottom: 4 },
  heroDesc: { fontSize: 14, color: '#94A3B8', lineHeight: 20 },
  heroStats: { flexDirection: 'row', gap: 16, marginTop: 8 },
  heroStat: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 12, alignItems: 'center' },
  heroStatValue: { fontSize: 18, fontWeight: '800', color: C.accent },
  heroStatLabel: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  
  sectionTitle: { fontSize: 18, fontWeight: '800', color: C.textDark, marginBottom: 8 },
  sectionTitleWrapper: { marginBottom: 8 },
  
  planCard: { backgroundColor: C.surface, borderRadius: 16, padding: 20, borderWidth: 2, borderColor: C.border, gap: 16 },
  planCardSelected: { borderColor: C.accent, backgroundColor: C.accentSoft },
  popularBadge: { position: 'absolute', top: -10, right: 20, backgroundColor: C.accent, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  popularBadgeText: { fontSize: 11, fontWeight: '700', color: C.white },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  planName: { fontSize: 16, fontWeight: '800', color: C.textDark },
  planBoost: { fontSize: 13, color: C.accent, fontWeight: '600', marginTop: 4 },
  planPrice: { alignItems: 'flex-end' },
  planPriceValue: { fontSize: 20, fontWeight: '900', color: C.textDark },
  planPriceDuration: { fontSize: 12, color: C.textLight },
  planFeatures: { gap: 10 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { fontSize: 13, color: C.textMid, flex: 1 },
  selectBtn: { backgroundColor: C.accent, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  selectBtnSelected: { backgroundColor: C.accent },
  selectBtnText: { fontSize: 14, fontWeight: '700', color: C.white },
  selectBtnTextSelected: { color: C.white },
  
  autoRenewCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: C.border },
  autoRenewInfo: { flex: 1 },
  autoRenewTitle: { fontSize: 14, fontWeight: '700', color: C.textDark },
  autoRenewDesc: { fontSize: 12, color: C.textLight, marginTop: 2 },
  
  infoBox: { flexDirection: 'row', gap: 12, backgroundColor: C.info + '10', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: C.info + '30' },
  infoIcon: { fontSize: 20 },
  infoText: { flex: 1, fontSize: 13, color: C.textMid, lineHeight: 18 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBackdrop: { flex: 1 },
  modalContent: { backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 32 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: C.textDark },
  modalBody: { gap: 20 },
  modalPlanCard: { backgroundColor: C.bg, borderRadius: 12, padding: 16, alignItems: 'center', gap: 4 },
  modalPlanName: { fontSize: 16, fontWeight: '800', color: C.textDark },
  modalPlanPrice: { fontSize: 24, fontWeight: '900', color: C.accent },
  modalPlanBoost: { fontSize: 13, color: C.textLight },
  modalSummary: { gap: 12 },
  modalSummaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalSummaryLabel: { fontSize: 14, color: C.textMid },
  modalSummaryValue: { fontSize: 14, fontWeight: '700', color: C.textDark },
  confirmBtn: { backgroundColor: C.accent, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  confirmBtnText: { fontSize: 16, fontWeight: '800', color: C.white },
});

export default SponsorshipScreen;
