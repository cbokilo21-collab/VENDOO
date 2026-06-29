import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { BuyerProfileService } from '../services/buyerProfileService';
import { T } from '../theme';

const AVAILABLE_MARKETS = [
  { id: 'electronique', name: 'Électronique', emoji: '📱', description: 'Smartphones, ordinateurs, accessoires tech' },
  { id: 'mode', name: 'Mode', emoji: '👗', description: 'Vêtements, chaussures, accessoires' },
  { id: 'alimentation', name: 'Alimentation', emoji: '🍎', description: 'Produits frais, épicerie, supermarché' },
  { id: 'beaute', name: 'Beauté & Cosmétiques', emoji: '💄', description: 'Maquillage, soins, parfums' },
  { id: 'maison', name: 'Maison & Décoration', emoji: '🏠', description: 'Meubles, décoration, électroménager' },
  { id: 'sport', name: 'Sport & Loisirs', emoji: '⚽', description: 'Équipement sportif, jeux, hobbies' },
  { id: 'livres', name: 'Livres & Culture', emoji: '📚', description: 'Livres, musique, films, art' },
  { id: 'enfants', name: 'Enfants & Bébé', emoji: '🧸', description: 'Jouets, vêtements enfants, puériculture' },
  { id: 'sante', name: 'Santé & Bien-être', emoji: '💊', description: 'Pharmacie, compléments, bien-être' },
  { id: 'auto', name: 'Auto & Moto', emoji: '🚗', description: 'Pièces auto, accessoires, entretien' },
];

const FavoriteDistrictsScreen: React.FC = () => {
  const { user } = useAuth();
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    try {
      const profile = await BuyerProfileService.getProfile(user.uid);
      if (profile) {
        setSelectedMarkets(profile.favoriteMarkets || []);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMarket = (marketId: string) => {
    setSelectedMarkets(prev => {
      if (prev.includes(marketId)) {
        return prev.filter(id => id !== marketId);
      } else {
        return [...prev, marketId];
      }
    });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Create or update profile with favorite markets
      await BuyerProfileService.setProfile(user.uid, {
        userId: user.uid,
        name: user.displayName || '',
        email: user.email || '',
        favoriteMarkets: selectedMarkets,
      });
      alert('Marchés favoris enregistrés !');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={s.container}>
        <ActivityIndicator size="large" color={T.orange} />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Marchés favoris</Text>
        <Text style={s.headerSub}>Sélectionnez les catégories de produits qui vous intéressent</Text>
        <Text style={s.headerNote}>L'IA utilisera ces préférences pour vous recommander des boutiques</Text>
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.grid}>
          {AVAILABLE_MARKETS.map(market => {
            const isSelected = selectedMarkets.includes(market.id);
            return (
              <TouchableOpacity
                key={market.id}
                style={[s.marketCard, isSelected && s.marketCardSelected]}
                onPress={() => toggleMarket(market.id)}
                activeOpacity={0.7}
              >
                <View style={s.marketHeader}>
                  <Text style={s.marketEmoji}>{market.emoji}</Text>
                  <View style={s.marketInfo}>
                    <Text style={[s.marketName, isSelected && s.marketNameSelected]}>
                      {market.name}
                    </Text>
                    <Text style={[s.marketDesc, isSelected && s.marketDescSelected]}>
                      {market.description}
                    </Text>
                  </View>
                  {isSelected && (
                    <View style={s.checkBadge}>
                      <Text style={s.checkBadgeText}>✓</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity
          style={[s.saveBtn, selectedMarkets.length === 0 && s.saveBtnDisabled]}
          onPress={handleSave}
          disabled={selectedMarkets.length === 0 || saving}
          activeOpacity={0.7}
        >
          {saving ? (
            <ActivityIndicator color={T.white} />
          ) : (
            <Text style={s.saveBtnText}>
              Enregistrer ({selectedMarkets.length} sélectionné{selectedMarkets.length > 1 ? 's' : ''})
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.page },
  header: { padding: 24, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: T.text, marginBottom: 8 },
  headerSub: { fontSize: 15, color: T.textSub, marginBottom: 4 },
  headerNote: { fontSize: 13, color: T.orange, fontWeight: '600' },
  
  content: { flex: 1, paddingHorizontal: 24 },
  grid: { gap: 12 },
  
  marketCard: {
    backgroundColor: T.surface, borderRadius: 16, padding: 16,
    borderWidth: 2, borderColor: T.border,
  },
  marketCardSelected: {
    backgroundColor: T.orangeSoft, borderColor: T.orange,
  },
  marketHeader: {
    flexDirection: 'row', alignItems: 'center',
  },
  marketEmoji: { fontSize: 32, marginRight: 12 },
  marketInfo: { flex: 1 },
  marketName: { fontSize: 16, fontWeight: '700', color: T.text, marginBottom: 4 },
  marketNameSelected: { color: T.orange },
  marketDesc: { fontSize: 13, color: T.textSub },
  marketDescSelected: { color: T.textMid },
  
  checkBadge: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: T.orange,
    alignItems: 'center', justifyContent: 'center', marginLeft: 12,
  },
  checkBadgeText: { fontSize: 14, fontWeight: '800', color: T.white },
  
  footer: {
    padding: 24, borderTopWidth: 1, borderTopColor: T.border,
    backgroundColor: T.surface,
  },
  saveBtn: {
    backgroundColor: T.orange, borderRadius: 12, padding: 16,
    alignItems: 'center',
  },
  saveBtnDisabled: { backgroundColor: T.muted },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: T.white },
});

export default FavoriteDistrictsScreen;
