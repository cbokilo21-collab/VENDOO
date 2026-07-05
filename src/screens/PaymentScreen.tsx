import React, { useState } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PACK_PLANS, PackPlan } from '../constants/packPlans';
import { useAuth } from '../contexts/AuthContext';
import { useBoutique } from '../contexts/BoutiqueContext';
import { FirestoreService } from '../services/firestoreService';

type RootStackParamList = {
  Payment: { planId: string };
  BusinessDashboard: undefined;
};

type PaymentRouteProp = RouteProp<RootStackParamList, 'Payment'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

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
  error: '#EF4444',
};

const PaymentScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<PaymentRouteProp>();
  const { user } = useAuth();
  const { boutiqueData } = useBoutique();
  const { planId } = route.params || {};
  
  if (!planId) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, color: '#374151' }}>Plan ID non fourni</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20, padding: 12, backgroundColor: '#FF6B35', borderRadius: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const plan = PACK_PLANS.find(p => p.id === planId);
  
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  
  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.substring(0, 19);
  };
  
  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };
  
  const validateCard = () => {
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      Alert.alert('Erreur', 'Numéro de carte invalide');
      return false;
    }
    if (!expiryDate || expiryDate.length < 5) {
      Alert.alert('Erreur', 'Date d\'expiration invalide');
      return false;
    }
    if (!cvv || cvv.length < 3) {
      Alert.alert('Erreur', 'CVV invalide');
      return false;
    }
    if (!cardName || cardName.length < 2) {
      Alert.alert('Erreur', 'Nom sur la carte requis');
      return false;
    }
    return true;
  };
  
  const handlePayment = async () => {
    if (!validateCard()) return;
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté');
      return;
    }
    
    setLoading(true);
    try {
      // Enregistrer le paiement dans Firestore
      const paymentData = {
        userId: user.uid,
        boutiqueId: boutiqueData.id,
        planId: plan?.id,
        planName: plan?.name,
        amount: plan?.price,
        currency: plan?.currency,
        cardLast4: cardNumber.slice(-4),
        cardName: cardName,
        status: 'completed',
        createdAt: new Date(),
      };
      
      await FirestoreService.create('payments', paymentData);
      
      // Mettre à jour l'abonnement de l'utilisateur
      const subscriptionData = {
        userId: user.uid,
        boutiqueId: boutiqueData.id,
        planId: plan?.id,
        planName: plan?.name,
        status: 'active',
        startDate: new Date(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
        features: plan?.features,
      };
      
      await FirestoreService.create('subscriptions', subscriptionData);
      
      Alert.alert('Succès', 'Paiement réussi! Votre abonnement est maintenant actif.', [
        { text: 'OK', onPress: () => navigation.navigate('BusinessDashboard') }
      ]);
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Erreur', 'Le paiement a échoué. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!plan) {
    return (
      <View style={s.root}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Paiement</Text>
        </View>
        <View style={s.errorContainer}>
          <Text style={s.errorText}>Pack non trouvé</Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Paiement</Text>
      </View>
      
      <ScrollView style={s.content}>
        <View style={s.summaryCard}>
          <Text style={s.summaryTitle}>Récapitulatif</Text>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Pack</Text>
            <Text style={s.summaryValue}>{plan.name}</Text>
          </View>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Prix</Text>
            <Text style={s.summaryPrice}>{plan.price === 0 ? 'Gratuit' : `${plan.price}$ / mois`}</Text>
          </View>
        </View>
        
        <View style={s.cardForm}>
          <Text style={s.formTitle}>Informations de carte</Text>
          
          <View style={s.inputGroup}>
            <Text style={s.label}>Nom sur la carte</Text>
            <TextInput
              style={s.input}
              value={cardName}
              onChangeText={setCardName}
              placeholder="JEAN DUPONT"
              autoCapitalize="words"
            />
          </View>
          
          <View style={s.inputGroup}>
            <Text style={s.label}>Numéro de carte</Text>
            <TextInput
              style={s.input}
              value={cardNumber}
              onChangeText={(text) => setCardNumber(formatCardNumber(text))}
              placeholder="1234 5678 9012 3456"
              keyboardType="numeric"
              maxLength={19}
            />
          </View>
          
          <View style={s.row}>
            <View style={[s.inputGroup, s.half]}>
              <Text style={s.label}>Expiration (MM/AA)</Text>
              <TextInput
                style={s.input}
                value={expiryDate}
                onChangeText={(text) => setExpiryDate(formatExpiry(text))}
                placeholder="12/25"
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            
            <View style={[s.inputGroup, s.half]}>
              <Text style={s.label}>CVV</Text>
              <TextInput
                style={s.input}
                value={cvv}
                onChangeText={setCvv}
                placeholder="123"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>
          
          <View style={s.securityNote}>
            <Text style={s.securityIcon}>🔒</Text>
            <Text style={s.securityText}>Paiement sécurisé. Vos informations sont cryptées.</Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={[s.payBtn, loading && s.payBtnDisabled]}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={C.white} />
          ) : (
            <Text style={s.payBtnText}>
              {plan.price === 0 ? 'Activer gratuitement' : `Payer ${plan.price}$`}
            </Text>
          )}
        </TouchableOpacity>
        
        <View style={s.legalText}>
          <Text style={s.legalTextContent}>
            En confirmant ce paiement, vous acceptez les conditions d'utilisation de Vendoo.
          </Text>
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
    padding: 20,
  },
  summaryCard: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: C.textMid,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textDark,
  },
  summaryPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: C.navy,
  },
  cardForm: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  half: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textMid,
    marginBottom: 8,
  },
  input: {
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: C.textDark,
  },
  row: {
    flexDirection: 'row',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    padding: 12,
    backgroundColor: C.bg,
    borderRadius: 8,
  },
  securityIcon: {
    fontSize: 16,
  },
  securityText: {
    fontSize: 12,
    color: C.textMid,
    flex: 1,
  },
  payBtn: {
    backgroundColor: C.navy,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  payBtnDisabled: {
    backgroundColor: C.muted,
  },
  payBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '700',
  },
  legalText: {
    padding: 16,
  },
  legalTextContent: {
    fontSize: 11,
    color: C.textLight,
    textAlign: 'center',
    lineHeight: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: C.error,
  },
});

export default PaymentScreen;
