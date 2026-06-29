import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { useAuth } from '../contexts/AuthContext';
import { BuyerProfileService, BuyerProfile } from '../services/buyerProfileService';
import { FirestoreService } from '../services/firestoreService';
import { T } from '../theme';

interface Store {
  id: string;
  name: string;
  category: string;
  district: string;
  rating: number;
  description?: string;
  imageUrl?: string;
}

const FavoritesScreen: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<BuyerProfile | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        // Charger le profil du visiteur
        const buyerProfile = await BuyerProfileService.getProfile(user.uid);
        setProfile(buyerProfile);

        if (buyerProfile && buyerProfile.favoriteStores && buyerProfile.favoriteStores.length > 0) {
          // Charger les boutiques favorites
          const allStores = await FirestoreService.getAll<Store>('stores');
          const favoriteStores = allStores.filter(store => 
            buyerProfile.favoriteStores!.includes(store.id)
          );
          setStores(favoriteStores);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleRemoveFavorite = async (storeId: string) => {
    if (!user) return;
    try {
      await BuyerProfileService.removeFavoriteStore(user.uid, storeId);
      // Recharger les données
      const updatedProfile = await BuyerProfileService.getProfile(user.uid);
      setProfile(updatedProfile);
      if (updatedProfile) {
        const allStores = await FirestoreService.getAll<Store>('stores');
        const favoriteStores = allStores.filter(store => 
          (updatedProfile.favoriteStores || []).includes(store.id)
        );
        setStores(favoriteStores);
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (loading) {
    return (
      <View style={s.root}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Favoris</Text>
          <Text style={s.headerSub}>Vos boutiques préférées</Text>
        </View>
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={T.orange} />
        </View>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Favoris</Text>
        <Text style={s.headerSub}>Vos boutiques préférées</Text>
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        {stores.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>❤️</Text>
            <Text style={s.emptyTitle}>Aucun favori</Text>
            <Text style={s.emptySub}>Ajoutez des boutiques à vos favoris depuis la Marketplace</Text>
          </View>
        ) : (
          stores.map(store => (
            <TouchableOpacity key={store.id} style={s.favCard}>
              <View style={s.favImage}>
                <Text style={s.favImagePlaceholder}>🏪</Text>
              </View>
              <View style={s.favInfo}>
                <Text style={s.favName}>{store.name}</Text>
                <Text style={s.favCategory}>{store.category}</Text>
                <View style={s.favMeta}>
                  <Text style={s.favDistrict}>{store.district}</Text>
                  <View style={s.rating}>
                    <Text style={s.ratingText}>⭐ {store.rating}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity 
                style={s.removeBtn}
                onPress={() => handleRemoveFavorite(store.id)}
                activeOpacity={0.7}
              >
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth={2}>
                  <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.page },
  header: { padding: 24, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: T.text, marginBottom: 4 },
  headerSub: { fontSize: 14, color: T.textSub },
  
  content: { flex: 1, paddingHorizontal: 24 },
  
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  emptyState: { padding: 60, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: T.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: T.textSub },
  
  favCard: {
    flexDirection: 'row', backgroundColor: T.surface, borderRadius: 16,
    padding: 16, marginBottom: 12, borderWidth: 1, borderColor: T.border,
    alignItems: 'center',
  },
  favImage: {
    width: 64, height: 64, borderRadius: 12, backgroundColor: T.surfaceAlt,
    alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  favImagePlaceholder: { fontSize: 28 },
  favInfo: { flex: 1 },
  favName: { fontSize: 16, fontWeight: '700', color: T.text, marginBottom: 4 },
  favCategory: { fontSize: 13, color: T.orange, fontWeight: '600', marginBottom: 6 },
  favMeta: { flexDirection: 'row', alignItems: 'center' },
  favDistrict: { fontSize: 12, color: T.textSub, marginRight: 12 },
  rating: {},
  ratingText: { fontSize: 12, fontWeight: '600', color: T.textMid },
  
  removeBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: T.surfaceAlt,
    alignItems: 'center', justifyContent: 'center', marginLeft: 12,
  },
});

export default FavoritesScreen;
