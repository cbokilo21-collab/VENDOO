import React, { useState } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput,
  Dimensions, Alert, Modal, Image, FlatList, ActivityIndicator, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BottomNavigation from '../components/BottomNavigation';
import Svg, { Path, Circle } from 'react-native-svg';
import { useProducts } from '../contexts/ProductsContext';
import { useAuth } from '../contexts/AuthContext';

const { width: W } = Dimensions.get('window');
const COLS = 3;
const PRODUCT_WIDTH = (W - 32 - (COLS - 1) * 10) / COLS;
const IMG_SIZE = PRODUCT_WIDTH;

const C = {
  bg: '#F9FAFB', surface: '#FFFFFF', border: '#E5E7EB',
  accent: '#FF6B35', accentLight: 'rgba(255,107,53,0.1)',
  text: '#111827', textMid: '#374151', textLight: '#6B7280', muted: '#9CA3AF',
  success: '#10B981', error: '#EF4444', warning: '#F59E0B', info: '#3B82F6',
};

type Nav = NativeStackNavigationProp<any>;

const Ico = ({ d, s = 20, c = C.text }: { d: string; s?: number; c?: string }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d={d} />
  </Svg>
);

interface Product {
  id: string; nom: string; prix: number; prixPromo?: number;
  stock: number; categorie: string;
  description?: string; note?: number; avis?: number;
  imageUri?: string; couleur?: string;
}

const ProductsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const { products, loading, error, updateProduct, removeProduct } = useProducts();
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');

  const filtered = products.filter(p =>
    p.nom.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (p: Product) => {
    setSelectedProduct(p);
    setEditName(p.nom);
    setEditPrice(p.prix.toString());
    setEditStock(p.stock.toString());
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!selectedProduct) return;
    const prix = parseInt(editPrice) || selectedProduct.prix;
    const stock = parseInt(editStock) || selectedProduct.stock;
    await updateProduct(selectedProduct.id, { nom: editName, prix, stock });
    setShowModal(false);
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    Alert.alert('Supprimer', `Supprimer "${selectedProduct.nom}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          await removeProduct(selectedProduct.id);
          setShowModal(false);
        },
      },
    ]);
  };

  const renderProduct = ({ item: p }: { item: Product }) => (
    <TouchableOpacity
      style={s.productCard}
      onPress={() => openEdit(p)}
      activeOpacity={0.8}
    >
      {/* Image */}
      <View style={[s.imgBox, { backgroundColor: p.couleur || C.bg }]}>
        {p.imageUri ? (
          <Image source={{ uri: p.imageUri }} style={s.img} />
        ) : (
          <View style={s.imgPlaceholder}>
            <Ico d="M4 16l8-8m-8 0l8 8M20 4l-8 8m8-8l-8-8" s={32} c={C.muted} />
          </View>
        )}
        {/* Stock badge */}
        {p.stock < 5 && (
          <View style={[s.stockBadge, p.stock === 0 && { backgroundColor: C.error }]}>
            <Text style={s.stockText}>{p.stock === 0 ? 'Rupture' : `${p.stock} restant`}</Text>
          </View>
        )}
        {p.prixPromo && (
          <View style={s.promoBadge}>
            <Text style={s.promoText}>-20%</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={s.info}>
        <Text style={s.nom} numberOfLines={2}>{p.nom}</Text>
        <View style={s.priceRow}>
          <Text style={s.price}>{(p.prix / 1000).toFixed(0)}k F</Text>
          {p.prixPromo && <Text style={s.oldPrice}>{(p.prixPromo / 1000).toFixed(0)}k</Text>}
        </View>
        {p.note !== undefined && (
          <View style={s.ratingRow}>
            <Text style={s.rating}>★ {p.note.toFixed(1)}</Text>
            <Text style={s.avis}>({p.avis || 0})</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Produits</Text>
          <Text style={s.sub}>{filtered.length} article{filtered.length !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity style={s.addBtn} activeOpacity={0.8}>
          <Ico d="M12 5v14M5 12h14" s={18} c="#fff" />
        </TouchableOpacity>
      </View>

      {/* Error banner */}
      {error && (
        <View style={[s.banner, { backgroundColor: C.error + '15' }]}>
          <Text style={{ color: C.error, fontSize: 13 }}>⚠ {error}</Text>
        </View>
      )}

      {/* Search */}
      <View style={s.searchBar}>
        <Ico d="M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" s={16} c={C.muted} />
        <TextInput
          style={s.searchInput}
          placeholder="Rechercher…"
          placeholderTextColor={C.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Products grid */}
      {loading ? (
        <View style={s.loadingBox}>
          <ActivityIndicator size="large" color={C.accent} />
          <Text style={s.loadingText}>Synchronisation…</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={s.emptyBox}>
          <Ico d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" s={40} c={C.muted} />
          <Text style={s.emptyText}>Aucun produit</Text>
          <Text style={s.emptySub}>Créez votre premier produit</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={p => p.id}
          numColumns={COLS}
          renderItem={renderProduct}
          contentContainerStyle={s.grid}
          scrollEnabled={false}
        />
      )}

      {/* Edit modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Éditer produit</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ico d="M18 6L6 18M6 6l12 12" s={24} c={C.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={s.modalBody} showsVerticalScrollIndicator={false}>
              {/* Product image preview */}
              {selectedProduct?.imageUri && (
                <Image
                  source={{ uri: selectedProduct.imageUri }}
                  style={s.modalImg}
                />
              )}

              <View style={s.field}>
                <Text style={s.label}>Nom</Text>
                <TextInput
                  style={s.input}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Nom du produit"
                />
              </View>

              <View style={s.field}>
                <Text style={s.label}>Prix (F)</Text>
                <TextInput
                  style={s.input}
                  value={editPrice}
                  onChangeText={setEditPrice}
                  keyboardType="number-pad"
                  placeholder="0"
                />
              </View>

              <View style={s.field}>
                <Text style={s.label}>Stock</Text>
                <TextInput
                  style={s.input}
                  value={editStock}
                  onChangeText={setEditStock}
                  keyboardType="number-pad"
                  placeholder="0"
                />
              </View>

              <View style={s.fieldRow}>
                <TouchableOpacity
                  style={[s.actionBtn, { backgroundColor: C.success }]}
                  onPress={handleSave}
                  activeOpacity={0.8}
                >
                  <Text style={s.actionText}>Enregistrer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.actionBtn, { backgroundColor: C.error }]}
                  onPress={handleDelete}
                  activeOpacity={0.8}
                >
                  <Text style={s.actionText}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {Platform.OS !== 'web' && <BottomNavigation activeRoute="Products" />}
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: Platform.OS === 'ios' ? 56 : 28, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  title: { fontSize: 24, fontWeight: '800', color: C.text },
  sub: { fontSize: 13, color: C.textLight, marginTop: 2 },
  addBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center', shadowColor: C.accent, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  banner: { marginHorizontal: 16, marginTop: 12, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginVertical: 12, paddingHorizontal: 14, height: 44, backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.border, gap: 10 },
  searchInput: { flex: 1, fontSize: 14, color: C.text },
  grid: { padding: 16, gap: 10 },
  productCard: { width: PRODUCT_WIDTH, marginHorizontal: 5 },
  imgBox: { width: IMG_SIZE, height: IMG_SIZE, borderRadius: 12, overflow: 'hidden', marginBottom: 8 },
  img: { width: '100%', height: '100%' },
  imgPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  stockBadge: { position: 'absolute', bottom: 8, left: 8, backgroundColor: C.warning, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  stockText: { fontSize: 10, fontWeight: '700', color: C.surface },
  promoBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: C.error, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  promoText: { fontSize: 10, fontWeight: '700', color: C.surface },
  info: { gap: 4 },
  nom: { fontSize: 13, fontWeight: '600', color: C.text, lineHeight: 18 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  price: { fontSize: 15, fontWeight: '700', color: C.accent },
  oldPrice: { fontSize: 11, color: C.muted, textDecorationLine: 'line-through' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { fontSize: 12, fontWeight: '600', color: C.warning },
  avis: { fontSize: 11, color: C.muted },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: C.textMid },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontSize: 16, fontWeight: '700', color: C.textMid },
  emptySub: { fontSize: 13, color: C.muted },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  modalContent: { width: '90%', maxWidth: 500, backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: C.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: C.text },
  modalBody: { padding: 20, maxHeight: 500 },
  modalImg: { width: '100%', height: 200, borderRadius: 12, marginBottom: 16 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: C.text },
  fieldRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  actionText: { color: C.surface, fontWeight: '700', fontSize: 14 },
});

export default ProductsScreen;
