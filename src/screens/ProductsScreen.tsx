import React, { useState } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput,
  Alert, Modal, Image, ActivityIndicator, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BottomNavigation from '../components/BottomNavigation';
import Svg, { Path, Circle } from 'react-native-svg';
import { useProducts } from '../contexts/ProductsContext';
import { useAuth } from '../contexts/AuthContext';
import { StorageService } from '../services/storageService';

const CATEGORIES = ['Vêtements', 'Chaussures', 'Accessoires', 'Électronique', 'Maison', 'Autre'];
const PRODUCT_COLORS = ['#FEE2E2', '#DBEAFE', '#D1FAE5', '#FEF3C7', '#EDE9FE', '#FCE7F3'];

// Fixed-width cards that wrap to fill the available space (Shopify-style).
// A fixed width avoids the "giant card" bug when the window width (incl. the
// web sidebar) doesn't match the content area width.
const PRODUCT_WIDTH = 168;
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
  const { products, loading, error, addProduct, updateProduct, removeProduct } = useProducts();
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');

  // Create-product modal state (Shopify-style product form)
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newComparePrice, setNewComparePrice] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [newImageUri, setNewImageUri] = useState('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = products.filter(p =>
    p.nom.toLowerCase().includes(search.toLowerCase())
  );

  // Pick an image via the web file picker; keep a local preview + the File for upload.
  const pickImage = () => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file: File | undefined = e.target?.files?.[0];
      if (file) {
        setNewImageFile(file);
        setNewImageUri(URL.createObjectURL(file));
      }
    };
    input.click();
  };

  const resetAddForm = () => {
    setNewName(''); setNewDescription(''); setNewPrice(''); setNewComparePrice('');
    setNewStock(''); setNewCategory(CATEGORIES[0]); setNewImageUri(''); setNewImageFile(null);
  };

  const handleCreate = async () => {
    if (!newName.trim()) {
      Alert.alert('Titre requis', 'Donnez un titre au produit.');
      return;
    }
    const prix = parseInt(newPrice) || 0;
    const comparePrice = parseInt(newComparePrice) || 0;
    const stock = parseInt(newStock) || 0;
    setSaving(true);
    try {
      const couleur = PRODUCT_COLORS[Math.floor(Math.random() * PRODUCT_COLORS.length)];
      // Create the product first to get its id, then attach the uploaded image.
      const docId = await addProduct({
        boutique_id: '',
        nom: newName.trim(),
        description: newDescription.trim() || undefined,
        prix,
        prixPromo: comparePrice > prix ? comparePrice : undefined,
        stock,
        categorie: newCategory,
        couleur,
        isNew: true,
      } as any);

      if (newImageUri && user?.uid) {
        try {
          const url = await StorageService.uploadProductImage(user.uid, docId, newImageUri);
          await updateProduct(docId, { imageUri: url });
        } catch (imgErr) {
          console.warn('Image upload failed, product saved without image:', imgErr);
        }
      }
      resetAddForm();
      setShowAdd(false);
    } catch (err) {
      Alert.alert('Erreur', "Impossible de créer le produit. Réessayez.");
    } finally {
      setSaving(false);
    }
  };

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
        <TouchableOpacity style={s.addBtn} activeOpacity={0.8} onPress={() => { resetAddForm(); setShowAdd(true); }}>
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
          <TouchableOpacity style={s.emptyCta} activeOpacity={0.85} onPress={() => { resetAddForm(); setShowAdd(true); }}>
            <Ico d="M12 5v14M5 12h14" s={16} c="#fff" />
            <Text style={s.emptyCtaText}>Ajouter un produit</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.gridScroll} showsVerticalScrollIndicator={false}>
          <View style={s.grid}>
            {filtered.map(p => (
              <View key={p.id}>{renderProduct({ item: p })}</View>
            ))}
          </View>
        </ScrollView>
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

      {/* Create-product modal — Shopify-style product form */}
      <Modal visible={showAdd} transparent animationType="slide">
        <View style={s.sheetOverlay}>
          <View style={s.sheet}>
            {/* Sticky header */}
            <View style={s.sheetHeader}>
              <TouchableOpacity onPress={() => setShowAdd(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ico d="M18 6L6 18M6 6l12 12" s={22} c={C.textMid} />
              </TouchableOpacity>
              <Text style={s.sheetTitle}>Nouveau produit</Text>
              <TouchableOpacity
                style={[s.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleCreate}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveBtnText}>Enregistrer</Text>}
              </TouchableOpacity>
            </View>

            <ScrollView style={s.sheetBody} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
              {/* ── Titre & description ── */}
              <View style={s.card}>
                <Text style={s.cardLabel}>Titre</Text>
                <TextInput
                  style={s.input}
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="T-shirt coton bio"
                  placeholderTextColor={C.muted}
                />
                <Text style={[s.cardLabel, { marginTop: 16 }]}>Description</Text>
                <TextInput
                  style={[s.input, s.textArea]}
                  value={newDescription}
                  onChangeText={setNewDescription}
                  placeholder="Décrivez votre produit, sa matière, ses atouts…"
                  placeholderTextColor={C.muted}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* ── Média ── */}
              <View style={s.card}>
                <Text style={s.cardSectionTitle}>Média</Text>
                <TouchableOpacity style={s.mediaPicker} onPress={pickImage} activeOpacity={0.8}>
                  {newImageUri ? (
                    <Image source={{ uri: newImageUri }} style={s.mediaPreview} resizeMode="cover" />
                  ) : (
                    <View style={s.mediaEmpty}>
                      <View style={s.mediaIconBox}>
                        <Ico d="M3 9a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.66-.9l.82-1.2A2 2 0 0 1 10.07 4h3.86a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" s={22} c={C.accent} />
                      </View>
                      <Text style={s.mediaText}>Ajouter une image</Text>
                      <Text style={s.mediaHint}>PNG, JPG — affichée dans le catalogue</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* ── Tarification ── */}
              <View style={s.card}>
                <Text style={s.cardSectionTitle}>Tarification</Text>
                <View style={s.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardLabel}>Prix (F)</Text>
                    <TextInput
                      style={s.input}
                      value={newPrice}
                      onChangeText={setNewPrice}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={C.muted}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardLabel}>Prix barré (F)</Text>
                    <TextInput
                      style={s.input}
                      value={newComparePrice}
                      onChangeText={setNewComparePrice}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={C.muted}
                    />
                  </View>
                </View>
                <Text style={s.helpText}>Le prix barré (plus élevé) affiche une promo dans le catalogue.</Text>
              </View>

              {/* ── Inventaire ── */}
              <View style={s.card}>
                <Text style={s.cardSectionTitle}>Inventaire</Text>
                <Text style={s.cardLabel}>Quantité en stock</Text>
                <TextInput
                  style={s.input}
                  value={newStock}
                  onChangeText={setNewStock}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={C.muted}
                />
              </View>

              {/* ── Catégorie ── */}
              <View style={s.card}>
                <Text style={s.cardSectionTitle}>Catégorie</Text>
                <View style={s.catWrap}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[s.catChip, newCategory === cat && s.catChipActive]}
                      onPress={() => setNewCategory(cat)}
                      activeOpacity={0.8}
                    >
                      <Text style={[s.catChipText, newCategory === cat && s.catChipTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
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
  gridScroll: { padding: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  productCard: { width: PRODUCT_WIDTH },
  imgBox: { width: IMG_SIZE, height: IMG_SIZE * 1.15, borderRadius: 10, overflow: 'hidden', marginBottom: 6 },
  img: { width: '100%', height: '100%' },
  imgPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  stockBadge: { position: 'absolute', bottom: 6, left: 6, backgroundColor: C.warning, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 },
  stockText: { fontSize: 9, fontWeight: '700', color: C.surface },
  promoBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: C.error, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 },
  promoText: { fontSize: 9, fontWeight: '700', color: C.surface },
  info: { gap: 2 },
  nom: { fontSize: 11.5, fontWeight: '600', color: C.text, lineHeight: 15 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  price: { fontSize: 12.5, fontWeight: '700', color: C.accent },
  oldPrice: { fontSize: 10, color: C.muted, textDecorationLine: 'line-through' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  rating: { fontSize: 10.5, fontWeight: '600', color: C.warning },
  avis: { fontSize: 9, color: C.muted },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: C.textMid },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontSize: 16, fontWeight: '700', color: C.textMid },
  emptySub: { fontSize: 13, color: C.muted },
  emptyCta: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.accent, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 12, marginTop: 8 },
  emptyCtaText: { color: '#fff', fontWeight: '700', fontSize: 14 },
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

  // Shopify-style product sheet
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: C.bg, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '94%', height: '94%' },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: C.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  sheetTitle: { fontSize: 16, fontWeight: '800', color: C.text },
  saveBtn: { backgroundColor: C.accent, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10, minWidth: 96, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  sheetBody: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },

  card: { backgroundColor: C.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.border, marginBottom: 14 },
  cardSectionTitle: { fontSize: 14, fontWeight: '800', color: C.text, marginBottom: 12 },
  cardLabel: { fontSize: 12.5, fontWeight: '600', color: C.textMid, marginBottom: 6 },
  textArea: { height: 96, paddingTop: 10 },
  helpText: { fontSize: 11.5, color: C.muted, marginTop: 8, lineHeight: 16 },
  row: { flexDirection: 'row', gap: 12 },

  mediaPicker: { width: '100%', height: 160, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, borderStyle: 'dashed', overflow: 'hidden', backgroundColor: C.bg },
  mediaPreview: { width: '100%', height: '100%' },
  mediaEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  mediaIconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: C.accentLight, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  mediaText: { fontSize: 14, fontWeight: '700', color: C.text },
  mediaHint: { fontSize: 11.5, color: C.muted },

  catWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface },
  catChipActive: { backgroundColor: C.accent, borderColor: C.accent },
  catChipText: { fontSize: 13, fontWeight: '600', color: C.textMid },
  catChipTextActive: { color: '#fff' },
});

export default ProductsScreen;
