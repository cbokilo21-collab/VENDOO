import React, { useState } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity, Image,
  Dimensions, FlatList, Alert, Modal, TextInput, ActivityIndicator, Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useProducts } from '../contexts/ProductsContext';
import { useBoutique } from '../contexts/BoutiqueContext';
import Svg, { Path, Circle } from 'react-native-svg';

const { width: W } = Dimensions.get('window');
const COLS = 4; // Compact 4-column grid
const PRODUCT_WIDTH = (W - 48 - 30) / COLS; // Small cards

const C = {
  bg: '#F9FAFB', surface: '#FFFFFF', border: '#E5E7EB',
  accent: '#FF6B35', accentLight: 'rgba(255,107,53,0.1)',
  text: '#111827', textMid: '#374151', textLight: '#6B7280', muted: '#9CA3AF',
  success: '#10B981', error: '#EF4444', warning: '#F59E0B',
};

type Nav = NativeStackNavigationProp<any>;

const Ico = ({ d, s = 20, c = C.text }: { d: string; s?: number; c?: string }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d={d} />
  </Svg>
);

interface CartItem {
  productId: string;
  nom: string;
  prix: number;
  quantity: number;
}

const VendooShopScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute();
  const { products, loading } = useProducts();
  const { boutiqueData } = useBoutique();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = products.filter(p =>
    p.nom.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (p: any) => {
    const existing = cart.find(ci => ci.productId === p.id);
    if (existing) {
      setCart(cart.map(ci =>
        ci.productId === p.id ? { ...ci, quantity: ci.quantity + 1 } : ci
      ));
    } else {
      setCart([...cart, {
        productId: p.id,
        nom: p.nom,
        prix: p.prix,
        quantity: 1,
      }]);
    }
    Alert.alert('', `${p.nom} ajouté au panier`);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(ci => ci.productId !== productId));
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(ci =>
        ci.productId === productId ? { ...ci, quantity: qty } : ci
      ));
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.prix * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const renderProduct = ({ item: p }: { item: any }) => (
    <TouchableOpacity
      style={s.productCard}
      onPress={() => addToCart(p)}
      activeOpacity={0.75}
    >
      <View style={[s.imgBox, { backgroundColor: p.couleur || C.bg }]}>
        {p.imageUri ? (
          <Image source={{ uri: p.imageUri }} style={s.img} resizeMode="cover" />
        ) : (
          <View style={s.imgPlaceholder}>
            <Ico d="M4 16l8-8m-8 0l8 8M20 4l-8 8m8-8l-8-8" s={20} c={C.muted} />
          </View>
        )}
      </View>
      <Text style={s.productName} numberOfLines={1}>{p.nom}</Text>
      <Text style={s.productPrice}>{(p.prix / 1000).toFixed(0)}k</Text>
    </TouchableOpacity>
  );

  const cartItems = cart.map(ci => {
    const p = products.find(x => x.id === ci.productId);
    return { ...ci, product: p };
  });

  return (
    <View style={s.root}>
      {/* Header with shop info */}
      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={s.banner}>
          <View style={s.bannerGradient} />
          <View style={s.shopHeader}>
            <View style={s.logoBox}>
              <Text style={s.logoText}>V</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.shopName}>{boutiqueData?.nom || 'Ma Boutique'}</Text>
              <Text style={s.shopMeta}>Boutique en ligne • Vendoo</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={s.section}>
          <Text style={s.sectionText}>
            Bienvenue dans notre boutique. Découvrez notre sélection de produits de qualité.
          </Text>
        </View>

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

        {/* Products */}
        {loading ? (
          <View style={s.loadingBox}>
            <ActivityIndicator size="large" color={C.accent} />
          </View>
        ) : (
          <View style={s.productsSection}>
            <FlatList
              data={filtered}
              keyExtractor={p => p.id}
              numColumns={COLS}
              renderItem={renderProduct}
              scrollEnabled={false}
              contentContainerStyle={s.grid}
            />
          </View>
        )}
      </ScrollView>

      {/* Floating cart button */}
      {cartCount > 0 && (
        <TouchableOpacity
          style={s.floatingCart}
          onPress={() => setShowCart(true)}
          activeOpacity={0.9}
        >
          <Ico d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" s={20} c="#fff" />
          <View style={s.cartBadge}>
            <Text style={s.cartBadgeText}>{cartCount}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Cart modal */}
      <Modal visible={showCart} transparent animationType="slide">
        <View style={s.cartOverlay}>
          <View style={s.cartPanel}>
            {/* Cart header */}
            <View style={s.cartHeader}>
              <Text style={s.cartTitle}>Panier</Text>
              <TouchableOpacity onPress={() => setShowCart(false)}>
                <Ico d="M18 6L6 18M6 6l12 12" s={24} c={C.text} />
              </TouchableOpacity>
            </View>

            {/* Cart items */}
            {cartItems.length === 0 ? (
              <View style={s.emptyCart}>
                <Ico d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" s={40} c={C.muted} />
                <Text style={s.emptyText}>Panier vide</Text>
              </View>
            ) : (
              <ScrollView style={s.cartItems} showsVerticalScrollIndicator={false}>
                {cartItems.map(item => (
                  <View key={item.productId} style={s.cartItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.cartItemName}>{item.nom}</Text>
                      <Text style={s.cartItemPrice}>{(item.prix / 1000).toFixed(0)}k F</Text>
                    </View>
                    <View style={s.qtyControl}>
                      <TouchableOpacity
                        style={s.qtyBtn}
                        onPress={() => updateQty(item.productId, item.quantity - 1)}
                      >
                        <Text style={s.qtyBtnText}>−</Text>
                      </TouchableOpacity>
                      <Text style={s.qtyValue}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={s.qtyBtn}
                        onPress={() => updateQty(item.productId, item.quantity + 1)}
                      >
                        <Text style={s.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* Cart footer */}
            {cartItems.length > 0 && (
              <View style={s.cartFooter}>
                <View style={s.totalRow}>
                  <Text style={s.totalLabel}>Total</Text>
                  <Text style={s.totalAmount}>{(cartTotal / 1000).toFixed(0)}k F</Text>
                </View>
                <TouchableOpacity
                  style={s.checkoutBtn}
                  onPress={() => {
                    Alert.alert('Panier', `Total: ${(cartTotal / 1000).toFixed(0)}k F\n\nFonctionnalité de paiement à venir`);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={s.checkoutText}>Passer la commande</Text>
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
  content: { flex: 1 },
  banner: { backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border, overflow: 'hidden' },
  bannerGradient: { height: 100, backgroundColor: C.accent + '15' },
  shopHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, marginTop: -50, marginHorizontal: 16 },
  logoBox: { width: 50, height: 50, borderRadius: 12, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: C.surface, fontSize: 24, fontWeight: '800' },
  shopName: { fontSize: 18, fontWeight: '800', color: C.text },
  shopMeta: { fontSize: 11, color: C.textLight, marginTop: 1 },
  section: { paddingHorizontal: 16, paddingVertical: 12 },
  sectionText: { fontSize: 13, color: C.textMid, lineHeight: 19 },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12, paddingHorizontal: 12, height: 40, backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.border, gap: 8 },
  searchInput: { flex: 1, fontSize: 13, color: C.text },
  productsSection: { paddingHorizontal: 12, paddingBottom: 100 },
  grid: { gap: 8 },
  productCard: { width: PRODUCT_WIDTH, marginHorizontal: 2 },
  imgBox: { width: PRODUCT_WIDTH, height: PRODUCT_WIDTH * 1.1, borderRadius: 10, overflow: 'hidden', marginBottom: 6 },
  img: { width: '100%', height: '100%' },
  imgPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  productName: { fontSize: 11.5, fontWeight: '600', color: C.text, marginBottom: 2, lineHeight: 15 },
  productPrice: { fontSize: 12, fontWeight: '700', color: C.accent },
  loadingBox: { height: 300, alignItems: 'center', justifyContent: 'center' },
  floatingCart: { position: 'absolute', bottom: 24, right: 16, width: 56, height: 56, borderRadius: 28, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center', shadowColor: C.accent, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  cartBadge: { position: 'absolute', top: -8, right: -8, width: 28, height: 28, borderRadius: 14, backgroundColor: C.error, alignItems: 'center', justifyContent: 'center' },
  cartBadgeText: { color: C.surface, fontWeight: '800', fontSize: 12 },
  cartOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  cartPanel: { marginTop: 'auto', backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  cartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: C.border },
  cartTitle: { fontSize: 18, fontWeight: '700', color: C.text },
  cartItems: { padding: 16 },
  cartItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  cartItemName: { fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 4 },
  cartItemPrice: { fontSize: 13, color: C.accent, fontWeight: '700' },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.bg, borderRadius: 8, padding: 4 },
  qtyBtn: { width: 32, height: 32, borderRadius: 6, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { color: C.text, fontWeight: '700', fontSize: 14 },
  qtyValue: { width: 32, textAlign: 'center', fontWeight: '700', color: C.text },
  emptyCart: { height: 300, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontSize: 16, color: C.muted, fontWeight: '600' },
  cartFooter: { padding: 20, borderTopWidth: 1, borderTopColor: C.border, gap: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  totalLabel: { fontSize: 14, color: C.textMid, fontWeight: '600' },
  totalAmount: { fontSize: 24, fontWeight: '800', color: C.accent },
  checkoutBtn: { backgroundColor: C.accent, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  checkoutText: { color: C.surface, fontWeight: '700', fontSize: 15 },
});

export default VendooShopScreen;
