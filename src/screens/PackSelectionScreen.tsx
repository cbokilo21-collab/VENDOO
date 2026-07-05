import React, { useState } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  Dimensions, ActivityIndicator, Alert
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { PACK_PLANS, PackPlan } from '../constants/packPlans';
import { useAuth } from '../contexts/AuthContext';
import { useBoutique } from '../contexts/BoutiqueContext';
import { FirestoreService } from '../services/firestoreService';

const { width: SCREEN_WIDTH } = typeof window !== 'undefined' ? { width: window.innerWidth } : { width: 375 };

type Nav = NavigationProp<any>;

const C = {
  navy: '#FF6B35',
  bg: '#FFF7F3',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  textDark: '#111827',
  textMid: '#374151',
  textLight: '#6B7280',
  muted: '#9CA3AF',
  white: '#FFFFFF',
  success: '#10B981',
};

const PackSelectionScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const { boutiqueData } = useBoutique();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleSubscribe = async (plan: PackPlan) => {
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté pour souscrire à un pack');
      return;
    }

    if (plan.price === 0) {
      // Free plan - activate directly
      setLoading(true);
      try {
        const subscriptionData = {
          userId: user.uid,
          boutiqueId: boutiqueData.id,
          planId: plan.id,
          planName: plan.name,
          status: 'active',
          startDate: new Date(),
          nextBillingDate: null,
          features: plan.features,
        };
        
        await FirestoreService.create('subscriptions', subscriptionData);
        Alert.alert('Succès', 'Pack Free activé!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } catch (error) {
        console.error('Error activating free plan:', error);
        Alert.alert('Erreur', 'Impossible d\'activer le pack');
      } finally {
        setLoading(false);
      }
    } else {
      // Paid plan - go to payment screen
      navigation.navigate('Payment' as any, { planId: plan.id });
    }
  };

  const FeatureItem = ({ included, text }: { included: boolean; text: string }) => (
    <View style={s.featureItem}>
      <Text style={[s.featureIcon, included ? s.featureIconIncluded : s.featureIconExcluded]}>
        {included ? '✓' : '✗'}
      </Text>
      <Text style={[s.featureText, !included && s.featureTextExcluded]}>{text}</Text>
    </View>
  );

  const PlanCard = ({ plan }: { plan: PackPlan }) => (
    <TouchableOpacity
      style={[s.planCard, selectedPlan === plan.id && s.planCardSelected, plan.popular && s.planCardPopular]}
      onPress={() => handleSelectPlan(plan.id)}
      activeOpacity={0.8}
    >
      {plan.popular && <View style={s.popularBadge}><Text style={s.popularBadgeText}>Populaire</Text></View>}
      <Text style={s.planName}>{plan.name}</Text>
      <View style={s.priceContainer}>
        <Text style={s.price}>{plan.price === 0 ? 'Gratuit' : `${plan.price}$`}</Text>
        <Text style={s.period}>/mois</Text>
      </View>
      <Text style={s.planDescription}>{plan.description}</Text>
      
      <View style={s.featuresContainer}>
        <FeatureItem included={plan.features.boutiqueInQuartier} text="Boutique dans un quartier" />
        <FeatureItem included={plan.features.catalogue} text="Catalogue produits" />
        <FeatureItem included={plan.features.promoCredits > 0} text={`${plan.features.promoCredits} crédits promo`} />
        <FeatureItem included={plan.features.ecommerceSite} text="Site e-commerce" />
        <FeatureItem included={plan.features.externalMerchantExtension} text="Extension marchands externes" />
        <FeatureItem included={plan.features.seoVendoo} text="SEO sur Vendoo" />
        <FeatureItem included={plan.features.seoGoogle} text="SEO sur Google" />
        <FeatureItem included={plan.features.siteBuilder} text="Constructeur de site" />
        <FeatureItem included={plan.features.chatbotAI} text="Chatbot AI" />
        <FeatureItem included={plan.features.chatbotTokens > 0} text={`${plan.features.chatbotTokens} tokens chatbot`} />
        <FeatureItem included={plan.features.whatsappIntegration} text="Intégration WhatsApp" />
        <FeatureItem included={plan.features.analytics} text="Analytique avancée" />
        <FeatureItem included={plan.features.boutiqueAdvisor} text="Conseiller boutique" />
        <FeatureItem included={plan.features.domainName} text="Nom de domaine" />
        <FeatureItem included={plan.features.professionalEmail} text="Email professionnel" />
        <FeatureItem included={plan.features.messages} text="Messages" />
        <FeatureItem included={plan.features.salesReception} text="Réception de ventes" />
        <FeatureItem included={true} text={`${plan.features.maxProducts} produits max`} />
      </View>

      <TouchableOpacity
        style={[s.subscribeBtn, selectedPlan === plan.id && s.subscribeBtnSelected]}
        onPress={() => handleSubscribe(plan)}
        disabled={loading}
      >
        {loading && selectedPlan === plan.id ? (
          <ActivityIndicator size="small" color={C.white} />
        ) : (
          <Text style={s.subscribeBtnText}>S'abonner</Text>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Choisir un Pack</Text>
      </View>

      <ScrollView style={s.content} contentContainerStyle={s.contentContainer}>
        <Text style={s.subtitle}>Sélectionnez le pack qui correspond à vos besoins</Text>
        
        <View style={s.plansContainer}>
          {PACK_PLANS.map(plan => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </View>

        <View style={s.infoBox}>
          <Text style={s.infoTitle}>💡 Informations</Text>
          <Text style={s.infoText}>- Vous pouvez changer de pack à tout moment</Text>
          <Text style={s.infoText}>- Les crédits promo se renouvellent chaque mois</Text>
          <Text style={s.infoText}>- Annulation possible sans frais</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  backBtnText: {
    fontSize: 20,
    color: C.navy,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.textDark,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    color: C.textMid,
    textAlign: 'center',
    marginBottom: 24,
  },
  plansContainer: {
    gap: 16,
  },
  planCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: C.border,
    position: 'relative',
  },
  planCardSelected: {
    borderColor: C.navy,
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  planCardPopular: {
    borderColor: C.navy,
    borderWidth: 3,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: C.navy,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  popularBadgeText: {
    color: C.white,
    fontSize: 11,
    fontWeight: '700',
  },
  planName: {
    fontSize: 20,
    fontWeight: '800',
    color: C.textDark,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 32,
    fontWeight: '800',
    color: C.navy,
  },
  period: {
    fontSize: 14,
    color: C.textMid,
    marginLeft: 4,
  },
  planDescription: {
    fontSize: 13,
    color: C.textLight,
    marginBottom: 16,
  },
  featuresContainer: {
    gap: 8,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
  },
  featureIconIncluded: {
    color: C.success,
    backgroundColor: C.success + '20',
  },
  featureIconExcluded: {
    color: C.muted,
    backgroundColor: C.muted + '20',
  },
  featureText: {
    fontSize: 13,
    color: C.textMid,
    flex: 1,
  },
  featureTextExcluded: {
    color: C.muted,
    textDecorationLine: 'line-through',
  },
  subscribeBtn: {
    backgroundColor: C.border,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  subscribeBtnSelected: {
    backgroundColor: C.navy,
  },
  subscribeBtnText: {
    color: C.textDark,
    fontWeight: '700',
  },
  infoBox: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: C.border,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: C.textMid,
    marginBottom: 4,
  },
});

export default PackSelectionScreen;
