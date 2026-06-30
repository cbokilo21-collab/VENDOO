import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { FirestoreService } from '../services/firestoreService';

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
  PromotionMarket: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList>;

interface Promotion {
  id?: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  discount: number;
  active: boolean;
  categories?: string[];
}

const PromotionMarketScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [loading, setLoading] = useState(true);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newPromo, setNewPromo] = useState<Partial<Promotion>>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    discount: 0,
    active: true,
  });

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      const promos = await FirestoreService.getAll<Promotion>('promotions');
      setPromotions(promos);
    } catch (error) {
      console.error('Promotions collection not found or error:', error);
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromo = async () => {
    if (!newPromo.name || !newPromo.description || !newPromo.startDate || !newPromo.endDate) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs.');
      return;
    }

    try {
      await FirestoreService.set('promotions', Date.now().toString(), {
        ...newPromo,
        active: true,
      } as Promotion);
      Alert.alert('Succès', 'Promotion créée avec succès !');
      setShowModal(false);
      setNewPromo({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        discount: 0,
        active: true,
      });
      loadPromotions();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer la promotion.');
    }
  };

  const togglePromo = async (promo: Promotion) => {
    try {
      await FirestoreService.set('promotions', promo.id!, { ...promo, active: !promo.active });
      loadPromotions();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de modifier la promotion.');
    }
  };

  if (loading) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator size="large" color={C.accent} />
        <Text style={s.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.textDark} strokeWidth={2}>
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Marchés de Promotion</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowModal(true)}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth={2}>
            <Path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Active Promotions */}
        <Text style={s.sectionTitle}>Promotions Actives</Text>
        {promotions.filter(p => p.active).length === 0 ? (
          <View style={s.emptyContainer}>
            <Text style={s.emptyText}>Aucune promotion active</Text>
          </View>
        ) : (
          promotions.filter(p => p.active).map((promo) => (
            <View key={promo.id} style={s.promoCard}>
              <View style={s.promoHeader}>
                <Text style={s.promoName}>{promo.name}</Text>
                <View style={[s.statusBadge, { backgroundColor: C.success + '20' }]}>
                  <Text style={[s.statusText, { color: C.success }]}>Active</Text>
                </View>
              </View>
              <Text style={s.promoDesc}>{promo.description}</Text>
              <View style={s.promoMeta}>
                <Text style={s.promoMetaText}>📅 {promo.startDate} - {promo.endDate}</Text>
                <Text style={s.promoMetaText}>🎉 {promo.discount}% de réduction</Text>
              </View>
              <TouchableOpacity
                style={s.toggleBtn}
                onPress={() => togglePromo(promo)}
              >
                <Text style={s.toggleBtnText}>Désactiver</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Inactive Promotions */}
        <Text style={s.sectionTitle}>Promotions Inactives</Text>
        {promotions.filter(p => !p.active).length === 0 ? (
          <View style={s.emptyContainer}>
            <Text style={s.emptyText}>Aucune promotion inactive</Text>
          </View>
        ) : (
          promotions.filter(p => !p.active).map((promo) => (
            <View key={promo.id} style={[s.promoCard, s.promoCardInactive]}>
              <View style={s.promoHeader}>
                <Text style={s.promoName}>{promo.name}</Text>
                <View style={[s.statusBadge, { backgroundColor: C.muted + '20' }]}>
                  <Text style={[s.statusText, { color: C.muted }]}>Inactive</Text>
                </View>
              </View>
              <Text style={s.promoDesc}>{promo.description}</Text>
              <View style={s.promoMeta}>
                <Text style={s.promoMetaText}>📅 {promo.startDate} - {promo.endDate}</Text>
                <Text style={s.promoMetaText}>🎉 {promo.discount}% de réduction</Text>
              </View>
              <TouchableOpacity
                style={[s.toggleBtn, s.toggleBtnActivate]}
                onPress={() => togglePromo(promo)}
              >
                <Text style={[s.toggleBtnText, s.toggleBtnTextActivate]}>Activer</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Create Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Nouvelle Promotion</Text>
            
            <Text style={s.modalLabel}>Nom</Text>
            <TextInput
              style={s.modalInput}
              placeholder="Ex: Weekend Tech"
              placeholderTextColor={C.muted}
              value={newPromo.name}
              onChangeText={(text) => setNewPromo({ ...newPromo, name: text })}
            />

            <Text style={s.modalLabel}>Description</Text>
            <TextInput
              style={[s.modalInput, s.modalTextArea]}
              placeholder="Description de la promotion..."
              placeholderTextColor={C.muted}
              value={newPromo.description}
              onChangeText={(text) => setNewPromo({ ...newPromo, description: text })}
              multiline
              numberOfLines={3}
            />

            <Text style={s.modalLabel}>Date de début</Text>
            <TextInput
              style={s.modalInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={C.muted}
              value={newPromo.startDate}
              onChangeText={(text) => setNewPromo({ ...newPromo, startDate: text })}
            />

            <Text style={s.modalLabel}>Date de fin</Text>
            <TextInput
              style={s.modalInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={C.muted}
              value={newPromo.endDate}
              onChangeText={(text) => setNewPromo({ ...newPromo, endDate: text })}
            />

            <Text style={s.modalLabel}>Réduction (%)</Text>
            <TextInput
              style={s.modalInput}
              placeholder="0"
              placeholderTextColor={C.muted}
              keyboardType="numeric"
              value={newPromo.discount?.toString()}
              onChangeText={(text) => setNewPromo({ ...newPromo, discount: parseInt(text) || 0 })}
            />

            <View style={s.modalButtons}>
              <TouchableOpacity style={s.modalCancelBtn} onPress={() => setShowModal(false)}>
                <Text style={s.modalCancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalCreateBtn} onPress={handleCreatePromo}>
                <Text style={s.modalCreateBtnText}>Créer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },
  loadingText: { marginTop: 12, fontSize: 14, color: C.textLight },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: C.textDark },
  addBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },

  scroll: { flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: C.textDark, paddingHorizontal: 20, marginBottom: 12, marginTop: 20 },

  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 15, color: C.textLight },

  promoCard: { backgroundColor: C.surface, marginHorizontal: 20, marginBottom: 12, padding: 16, borderRadius: 16, borderWidth: 1.5, borderColor: C.success },
  promoCardInactive: { borderColor: C.muted, opacity: 0.7 },
  promoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  promoName: { fontSize: 16, fontWeight: '700', color: C.textDark },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  promoDesc: { fontSize: 14, color: C.textMid, marginBottom: 12, lineHeight: 20 },
  promoMeta: { gap: 4, marginBottom: 12 },
  promoMetaText: { fontSize: 12, color: C.textLight },
  toggleBtn: { backgroundColor: C.muted, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  toggleBtnActivate: { backgroundColor: C.success },
  toggleBtnText: { fontSize: 13, fontWeight: '600', color: C.white },
  toggleBtnTextActivate: { color: C.white },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: C.surface, borderRadius: 20, padding: 24, width: '100%', maxWidth: 400 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: C.textDark, marginBottom: 20 },
  modalLabel: { fontSize: 14, fontWeight: '600', color: C.textMid, marginBottom: 8, marginTop: 12 },
  modalInput: { height: 48, backgroundColor: C.bg, borderRadius: 10, paddingHorizontal: 14, fontSize: 15, color: C.textDark, borderWidth: 1, borderColor: C.border },
  modalTextArea: { height: 80, paddingTop: 12, textAlignVertical: 'top' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  modalCancelBtn: { flex: 1, height: 48, borderRadius: 10, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  modalCancelBtnText: { fontSize: 15, fontWeight: '600', color: C.textMid },
  modalCreateBtn: { flex: 1, height: 48, borderRadius: 10, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  modalCreateBtnText: { fontSize: 15, fontWeight: '700', color: C.white },
});

export default PromotionMarketScreen;
