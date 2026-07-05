import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { StoreContactService } from '../services/storeContactService';
import { BoutiqueService, Boutique } from '../services/boutiqueService';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';

const C = {
  bg: '#F8FAFC', surface: '#FFFFFF', border: '#E2E8F0',
  orange: '#F97316', orangeFade: 'rgba(249,115,22,0.08)',
  textDark: '#0F172A', textMid: '#475569', textLight: '#94A3B8', muted: '#CBD5E1',
  success: '#22C55E', warning: '#F59E0B', purple: '#8B5CF6',
};

interface Store {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  isOpen: boolean;
}

interface District {
  id: string;
  name: string;
  stores: Store[];
}

const MarketplaceScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);

  // Load boutiques from Firestore and group by quartier
  useEffect(() => {
    const loadBoutiques = async () => {
      try {
        setLoading(true);
        const boutiques = await BoutiqueService.getAll();
        
        // Map Boutique to Store and group by quartier
        const quartierMap = new Map<string, Store[]>();
        
        boutiques.forEach((boutique: Boutique) => {
          const store: Store = {
            id: boutique.id || '',
            name: boutique.nom,
            category: boutique.secteur || 'Autre',
            rating: 0, // Default rating - could be fetched from reviews
            reviews: 0, // Default reviews - could be fetched from reviews
            image: boutique.logo || '',
            description: boutique.description,
            isOpen: true, // Default to open - could be enhanced with actual hours
          };
          
          const quartier = boutique.quartier || 'Autre';
          if (!quartierMap.has(quartier)) {
            quartierMap.set(quartier, []);
          }
          quartierMap.get(quartier)?.push(store);
        });
        
        // Convert map to District array
        const districtsArray: District[] = Array.from(quartierMap.entries()).map(([name, stores], index) => ({
          id: index.toString(),
          name,
          stores,
        }));
        
        setDistricts(districtsArray);
      } catch (error) {
        console.error('Error loading boutiques:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadBoutiques();
  }, []);

  const filteredDistricts = districts.map(district => ({
    ...district,
    stores: district.stores.filter(store =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.category.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(district => district.stores.length > 0);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <View style={s.stars}>
        {[...Array(fullStars)].map((_, i) => (
          <Text key={`full-${i}`} style={s.star}>⭐</Text>
        ))}
        {hasHalfStar && <Text style={s.star}>⭐</Text>}
        {[...Array(emptyStars)].map((_, i) => (
          <Text key={`empty-${i}`} style={s.starEmpty}>☆</Text>
        ))}
      </View>
    );
  };

  const renderStoreCard = (store: Store) => (
    <TouchableOpacity
      key={store.id}
      style={s.storeCard}
      onPress={() => setSelectedStore(store)}
    >
      <View style={[s.storeImage, { backgroundColor: C.border }]}>
        <Text style={s.storeImagePlaceholder}>🏪</Text>
      </View>
      <View style={s.storeInfo}>
        <View style={s.storeHeader}>
          <Text style={s.storeName}>{store.name}</Text>
          <View style={[s.statusBadge, { backgroundColor: store.isOpen ? C.success + '20' : C.muted + '20' }]}>
            <Text style={[s.statusText, { color: store.isOpen ? C.success : C.textLight }]}>
              {store.isOpen ? 'Ouvert' : 'Fermé'}
            </Text>
          </View>
        </View>
        <Text style={s.storeCategory}>{store.category}</Text>
        <Text style={s.storeDescription}>{store.description}</Text>
        <View style={s.storeMeta}>
          <View style={s.rating}>
            {renderStars(store.rating)}
            <Text style={s.ratingText}>{store.rating}</Text>
          </View>
          <Text style={s.reviewsText}>({store.reviews} {t('marketplace.reviews')})</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDistrictSection = (district: District) => (
    <View key={district.id} style={s.districtSection}>
      <View style={s.districtHeader}>
        <View style={s.districtIcon}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth={2}>
            <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round"/>
            <Circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </View>
        <Text style={s.districtName}>{district.name}</Text>
        <Text style={s.districtCount}>{district.stores.length} boutiques</Text>
      </View>
      <View style={s.storesList}>
        {district.stores.map(renderStoreCard)}
      </View>
    </View>
  );

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Marketplace</Text>
        <Text style={s.headerSub}>Découvrez les boutiques de votre quartier</Text>
      </View>

      <View style={s.searchContainer}>
        <View style={s.searchBox}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.textLight} strokeWidth={2}>
            <Circle cx="11" cy="11" r="8" strokeLinecap="round" strokeLinejoin="round"/>
            <Path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
          <TextInput
            style={s.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('marketplace.search')}
            placeholderTextColor={C.textLight}
          />
        </View>
      </View>

      <ScrollView style={s.content}>
        {loading ? (
          <View style={s.loadingState}>
            <ActivityIndicator size="large" color={C.orange} />
            <Text style={s.loadingText}>Chargement des boutiques...</Text>
          </View>
        ) : filteredDistricts.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyStateText}>{t('marketplace.noStores')}</Text>
            <Text style={s.emptyStateSub}>{t('marketplace.noStoresDesc')}</Text>
          </View>
        ) : (
          filteredDistricts.map(renderDistrictSection)
        )}
      </ScrollView>

      {selectedStore && (
        <View style={s.storeModalOverlay}>
          <View style={s.storeModal}>
            <View style={s.storeModalHeader}>
              <Text style={s.storeModalTitle}>{selectedStore.name}</Text>
              <TouchableOpacity onPress={() => setSelectedStore(null)}>
                <Text style={s.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={[s.storeModalImage, { backgroundColor: C.border }]}>
              <Text style={s.storeModalImagePlaceholder}>🏪</Text>
            </View>
            <View style={s.storeModalContent}>
              <View style={s.storeModalMeta}>
                <Text style={s.storeModalCategory}>{selectedStore.category}</Text>
                <View style={[s.statusBadge, { backgroundColor: selectedStore.isOpen ? C.success + '20' : C.muted + '20' }]}>
                  <Text style={[s.statusText, { color: selectedStore.isOpen ? C.success : C.textLight }]}>
                    {selectedStore.isOpen ? t('marketplace.open') : t('marketplace.closed')}
                  </Text>
                </View>
              </View>
              <Text style={s.storeModalDescription}>{selectedStore.description}</Text>
              <View style={s.storeModalRating}>
                {renderStars(selectedStore.rating)}
                <Text style={s.storeModalRatingText}>{selectedStore.rating} ({selectedStore.reviews} {t('marketplace.reviews')})</Text>
              </View>
              <TouchableOpacity 
                style={s.visitStoreBtn}
                onPress={async () => {
                  // Enregistrer le contact si l'utilisateur est connecté
                  if (user && selectedStore) {
                    try {
                      await StoreContactService.recordContact(
                        user.uid,
                        selectedStore.id,
                        selectedStore.name,
                        selectedStore.category,
                        selectedDistrict ? districts.find(d => d.id === selectedDistrict)?.name || '' : ''
                      );
                    } catch (error) {
                      console.error('Error recording contact:', error);
                    }
                  }
                  setSelectedStore(null);
                  (navigation as any).navigate('BoutiqueCatalog', { storeId: selectedStore.id, storeName: selectedStore.name });
                }}
              >
                <Text style={s.visitStoreBtnText}>🛒 {t('marketplace.viewDetails')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { padding: 24, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: C.textDark, marginBottom: 4 },
  headerSub: { fontSize: 14, color: C.textLight },
  
  searchContainer: { paddingHorizontal: 16, marginBottom: 20 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface,
    borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.border,
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15, color: C.textDark },
  
  content: { flex: 1, paddingHorizontal: 16 },
  
  districtSection: { marginBottom: 24 },
  districtHeader: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 16,
  },
  districtIcon: {
    width: 40, height: 40, borderRadius: 10, backgroundColor: C.orangeFade,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  districtName: { fontSize: 20, fontWeight: '800', color: C.textDark, flex: 1 },
  districtCount: { fontSize: 14, color: C.textLight, fontWeight: '600' },
  
  storesList: { gap: 12 },
  
  storeCard: {
    flexDirection: 'row', backgroundColor: C.surface, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: C.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4,
  },
  storeImage: {
    width: 80, height: 80, borderRadius: 12, marginRight: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  storeImagePlaceholder: { fontSize: 32 },
  storeInfo: { flex: 1 },
  storeHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 6,
  },
  storeName: { fontSize: 16, fontWeight: '800', color: C.textDark, flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  storeCategory: { fontSize: 13, color: C.orange, fontWeight: '700', marginBottom: 4 },
  storeDescription: { fontSize: 13, color: C.textMid, marginBottom: 8 },
  storeMeta: { flexDirection: 'row', alignItems: 'center' },
  rating: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  stars: { flexDirection: 'row' },
  star: { fontSize: 12 },
  starEmpty: { fontSize: 12, color: C.muted },
  ratingText: { fontSize: 13, fontWeight: '700', color: C.textDark, marginLeft: 4 },
  reviewsText: { fontSize: 12, color: C.textLight },
  
  emptyState: { padding: 40, alignItems: 'center' },
  emptyStateText: { fontSize: 16, fontWeight: '800', color: C.textMid, marginBottom: 8 },
  emptyStateSub: { fontSize: 14, color: C.textLight },
  
  loadingState: { padding: 40, alignItems: 'center' },
  loadingText: { fontSize: 14, color: C.textMid, marginTop: 12 },
  
  storeModalOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center',
    padding: 20,
  },
  storeModal: {
    backgroundColor: C.surface, borderRadius: 20, maxHeight: '80%',
  },
  storeModalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  storeModalTitle: { fontSize: 20, fontWeight: '800', color: C.textDark },
  closeBtn: { fontSize: 24, color: C.textMid },
  storeModalImage: {
    height: 150, alignItems: 'center', justifyContent: 'center',
  },
  storeModalImagePlaceholder: { fontSize: 48 },
  storeModalContent: { padding: 20 },
  storeModalMeta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 12,
  },
  storeModalCategory: { fontSize: 16, fontWeight: '700', color: C.orange },
  storeModalDescription: { fontSize: 14, color: C.textMid, marginBottom: 16 },
  storeModalRating: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 20,
  },
  storeModalRatingText: { fontSize: 14, fontWeight: '700', color: C.textDark, marginLeft: 8 },
  visitStoreBtn: {
    backgroundColor: C.orange, borderRadius: 12, padding: 16,
    alignItems: 'center',
  },
  visitStoreBtnText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
});

export default MarketplaceScreen;
