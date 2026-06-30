import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  TextInput, Image, Platform, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle } from 'react-native-svg';
import { useProducts } from '../contexts/ProductsContext';
import { useBoutique } from '../contexts/BoutiqueContext';
import { useRealtimeCollection } from '../hooks/useRealtimeData';
import { where, getDoc, doc, getFirestore } from 'firebase/firestore';

// Fixed-width cards that wrap (Shopify-style) — robust to sidebar/content width.
const GRID_PAD = 16;
const PRODUCT_WIDTH = 180;

const C = {
  bg: '#F9FAFB', surface: '#FFFFFF', border: '#E5E7EB',
  accent: '#FF6B35', accentSoft: 'rgba(255,107,53,0.1)',
  text: '#111827', textMid: '#374151', textLight: '#6B7280', muted: '#9CA3AF',
  success: '#10B981', warning: '#F59E0B',
};

type Nav = NativeStackNavigationProp<any>;

const Ico = ({ d, s = 20, c = C.text }: { d: string; s?: number; c?: string }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d={d} />
  </Svg>
);

const BoutiqueCatalogScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute();
  const routeParams = route.params as { boutiqueId?: string } | undefined;
  console.log('BoutiqueCatalogScreen - routeParams:', routeParams);
  const { products, loading } = useProducts();
  const { boutiqueData } = useBoutique();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [externalBoutique, setExternalBoutique] = useState<any>(null);
  const [externalBoutiqueLoading, setExternalBoutiqueLoading] = useState(false);

  // If boutiqueId is provided, load that boutique's data
  useEffect(() => {
    const loadBoutique = async () => {
      if (routeParams?.boutiqueId) {
        console.log('Loading boutique with ID:', routeParams.boutiqueId);
        setExternalBoutiqueLoading(true);
        try {
          const db = getFirestore();
          const boutiqueDoc = await getDoc(doc(db, 'boutiques', routeParams.boutiqueId));
          console.log('Boutique doc exists:', boutiqueDoc.exists());
          if (boutiqueDoc.exists()) {
            const boutiqueData = { id: boutiqueDoc.id, ...boutiqueDoc.data() };
            console.log('Loaded boutique:', boutiqueData);
            setExternalBoutique(boutiqueData);
          } else {
            console.error('Boutique not found with ID:', routeParams.boutiqueId);
          }
        } catch (error) {
          console.error('Error loading boutique:', error);
        } finally {
          setExternalBoutiqueLoading(false);
        }
      }
    };
    loadBoutique();
  }, [routeParams?.boutiqueId]);

  // Load products for the external boutique if boutiqueId is provided
  const { data: externalProducts, loading: externalLoading } = useRealtimeCollection<any>('products', {
    enabled: !!routeParams?.boutiqueId,
    constraints: routeParams?.boutiqueId ? [where('boutique_id', '==', routeParams.boutiqueId)] : [],
  });

  // Use external boutique data if provided, otherwise use user's boutique
  const currentBoutique = externalBoutique || boutiqueData;
  const currentProducts = routeParams?.boutiqueId ? externalProducts : products;
  const currentLoading = routeParams?.boutiqueId ? (externalBoutiqueLoading || externalLoading) : loading;

  // Build category list from real products
  const categories = ['Tous', ...Array.from(new Set(currentProducts.map(p => p.categorie).filter(Boolean)))];

  const filtered = currentProducts.filter(p => {
    const matchesSearch = p.nom.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || p.categorie === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const shopName = currentBoutique?.nom || 'Ma Boutique';
  const initials = shopName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  const renderProduct = ({ item: p }: { item: any }) => (
    <TouchableOpacity style={s.productCard} activeOpacity={0.85}>
      <View style={[s.productImage, { backgroundColor: p.couleur || C.bg }]}>
        {p.imageUri ? (
          <Image source={{ uri: p.imageUri }} style={s.img} resizeMode="cover" />
        ) : (
          <View style={s.imgPlaceholder}>
            <Ico d="M3 9a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.66-.9l.82-1.2A2 2 0 0 1 10.07 4h3.86a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" s={24} c={C.muted} />
          </View>
        )}
        {p.stock === 0 && (
          <View style={s.soldOut}><Text style={s.soldOutText}>Épuisé</Text></View>
        )}
      </View>
      <Text style={s.productName} numberOfLines={1}>{p.nom}</Text>
      <Text style={s.productPrice}>{(p.prix / 1000).toFixed(0)}k F</Text>
    </TouchableOpacity>
  );

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Storefront banner */}
        <View style={s.banner}>
          <View style={s.bannerCover} />
          <View style={s.shopRow}>
            <View style={[s.shopAvatar, { backgroundColor: currentBoutique?.couleur || C.accent }]}>
              <Text style={s.shopAvatarText}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.shopName}>{shopName}</Text>
              {currentBoutique?.ville ? (
                <Text style={s.shopMeta}>{currentBoutique.ville}{currentBoutique.secteur ? ` · ${currentBoutique.secteur}` : ''}</Text>
              ) : (
                <Text style={s.shopMeta}>Boutique en ligne</Text>
              )}
              {currentBoutique?.shopUrl && (
                <Text style={s.shopUrl}>{currentBoutique.shopUrl}</Text>
              )}
            </View>
          </View>
          {currentBoutique?.description ? (
            <Text style={s.shopDesc}>{currentBoutique.description}</Text>
          ) : null}
        </View>

        {/* Search */}
        <View style={s.searchBar}>
          <Ico d="M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" s={16} c={C.muted} />
          <TextInput
            style={s.searchInput}
            placeholder="Rechercher un produit…"
            placeholderTextColor={C.muted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Categories */}
        {categories.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.categoryRow}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[s.categoryChip, selectedCategory === cat && s.categoryChipActive]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                <Text style={[s.categoryText, selectedCategory === cat && s.categoryTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Products */}
        {currentLoading ? (
          <View style={s.centerBox}>
            <ActivityIndicator size="large" color={C.accent} />
          </View>
        ) : filtered.length === 0 ? (
          <View style={s.centerBox}>
            <Ico d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" s={40} c={C.muted} />
            <Text style={s.emptyText}>Aucun produit</Text>
            <Text style={s.emptySub}>
              {currentProducts.length === 0 ? 'Ajoutez des produits depuis l\'onglet Produits' : 'Aucun résultat pour cette recherche'}
            </Text>
          </View>
        ) : (
          <View style={s.grid}>
            {filtered.map(p => (
              <View key={p.id}>{renderProduct({ item: p })}</View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { paddingBottom: 40, alignItems: 'center' },

  banner: { width: '100%', maxWidth: 1100, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border, overflow: 'hidden', paddingBottom: 16 },
  bannerCover: { height: 100, backgroundColor: C.accentSoft },
  shopRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, marginTop: -40 },
  shopAvatar: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: C.surface },
  shopAvatarText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  shopName: { fontSize: 20, fontWeight: '800', color: C.text, marginTop: 12 },
  shopMeta: { fontSize: 12, color: C.textLight, marginTop: 2 },
  shopUrl: { fontSize: 12, color: C.accent, fontWeight: '600', marginTop: 2 },
  shopDesc: { fontSize: 13, color: C.textMid, lineHeight: 19, paddingHorizontal: 16, marginTop: 12 },

  searchBar: { width: '100%', maxWidth: 1100, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 14, height: 44, borderWidth: 1, borderColor: C.border, marginTop: 16, marginHorizontal: 16 },
  searchInput: { flex: 1, fontSize: 14, color: C.text },

  categoryRow: { gap: 8, paddingHorizontal: 16, paddingVertical: 14 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface },
  categoryChipActive: { backgroundColor: C.accent, borderColor: C.accent },
  categoryText: { fontSize: 13, color: C.textMid, fontWeight: '500' },
  categoryTextActive: { color: '#fff', fontWeight: '600' },

  grid: { width: '100%', maxWidth: 1100, paddingHorizontal: GRID_PAD, flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  productCard: { width: PRODUCT_WIDTH },
  productImage: { width: PRODUCT_WIDTH, height: PRODUCT_WIDTH, borderRadius: 12, overflow: 'hidden', marginBottom: 8 },
  img: { width: '100%', height: '100%' },
  imgPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  soldOut: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(17,24,39,0.85)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  soldOutText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  productName: { fontSize: 13, fontWeight: '600', color: C.text },
  productPrice: { fontSize: 14, fontWeight: '700', color: C.accent, marginTop: 2 },

  centerBox: { width: '100%', alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 12 },
  emptyText: { fontSize: 16, fontWeight: '700', color: C.textMid },
  emptySub: { fontSize: 13, color: C.muted, textAlign: 'center', paddingHorizontal: 32 },
});

export default BoutiqueCatalogScreen;
