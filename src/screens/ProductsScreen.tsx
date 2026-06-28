import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput,
  Dimensions, Alert, Animated, Easing, Modal, KeyboardAvoidingView,
  Platform, PanResponder, StatusBar, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BottomNavigation from '../components/BottomNavigation';
import Svg, { Path, Circle, Rect, G, Line, Polygon } from 'react-native-svg';
import { useProducts } from '../contexts/ProductsContext';

const { width: W, height: H } = Dimensions.get('window');
const CARD_W = (W - 48 - 10) / 2;
const IMG_H = Math.round(CARD_W * 0.72); // compact product image ratio

const C = {
  navy: '#FF6B35', navyMid: '#FF8A5C', sideMuted: '#64748B',
  bg: '#F6F7F9', surface: '#FFFFFF', border: '#EBEBEB', borderFocus: '#FF6B35',
  accent: '#FF6B35', accentSoft: 'rgba(255,107,53,0.10)',
  textDark: '#111827', textMid: '#374151', textLight: '#6B7280', muted: '#9CA3AF',
  success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6',
  white: '#FFFFFF', gold: '#FBBF24', overlay: 'rgba(0,0,0,0.5)',
};

type RootStackParamList = { BusinessDashboard: undefined; Products: undefined; Orders: undefined; Customers: undefined; Settings: undefined };
type Nav = NativeStackNavigationProp<RootStackParamList, 'Products'>;

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Variant { label: string; stock: number }
interface Product {
  id: string; nom: string; prix: number; prixPromo?: number;
  stock: number; categorie: string; emoji: string; couleur: string;
  description?: string; note: number; avis: number;
  isNew?: boolean; isPromo?: boolean;
  sizes?: string[]; colors?: string[];
  imageUri?: string;
}
interface CartItem { product: Product; qty: number; size?: string; color?: string }

const CATS = ['Tous', 'Vêtements', 'Chaussures', 'Accessoires', 'Pantalons', 'Autre'];

// ─── Icons ─────────────────────────────────────────────────────────────────────
function ISearch() {
  return React.createElement(Svg, { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: C.muted, strokeWidth: 2.2 }, 
    React.createElement(Circle, { cx: 11, cy: 11, r: 8 }),
    React.createElement(Path, { d: "m21 21-4.35-4.35", strokeLinecap: "round" })
  );
}
function ICart(props) {
  var color = props.color || C.white;
  var size = props.size || 18;
  return React.createElement(Svg, { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 2 },
    React.createElement(Path, { d: "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z", strokeLinecap: "round", strokeLinejoin: "round" }),
    React.createElement(Line, { x1: 3, y1: 6, x2: 21, y2: 6, strokeLinecap: "round" }),
    React.createElement(Path, { d: "M16 10a4 4 0 0 1-8 0", strokeLinecap: "round" })
  );
}
function IPlus(props) {
  var color = props.color || C.white;
  var size = props.size || 16;
  return React.createElement(Svg, { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 2.5 },
    React.createElement(Line, { x1: 12, y1: 5, x2: 12, y2: 19, strokeLinecap: "round" }),
    React.createElement(Line, { x1: 5, y1: 12, x2: 19, y2: 12, strokeLinecap: "round" })
  );
}
function IMinus(props) {
  var color = props.color || C.textDark;
  return React.createElement(Svg, { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 2.5 },
    React.createElement(Line, { x1: 5, y1: 12, x2: 19, y2: 12, strokeLinecap: "round" })
  );
}
function IClose() {
  return React.createElement(Svg, { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: C.textMid, strokeWidth: 2 },
    React.createElement(Line, { x1: 18, y1: 6, x2: 6, y2: 18, strokeLinecap: "round" }),
    React.createElement(Line, { x1: 6, y1: 6, x2: 18, y2: 18, strokeLinecap: "round" })
  );
}
function IGrid(props) {
  var on = props.on;
  return React.createElement(Svg, { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: on ? C.textDark : C.muted, strokeWidth: 2 },
    React.createElement(Rect, { x: 3, y: 3, width: 8, height: 8, rx: 1 }),
    React.createElement(Rect, { x: 13, y: 3, width: 8, height: 8, rx: 1 }),
    React.createElement(Rect, { x: 3, y: 13, width: 8, height: 8, rx: 1 }),
    React.createElement(Rect, { x: 13, y: 13, width: 8, height: 8, rx: 1 })
  );
}
function IStar(props) {
  var f = props.f;
  return React.createElement(Svg, { width: 10, height: 10, viewBox: "0 0 24 24" },
    React.createElement(Polygon, { points: "12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26", fill: f ? C.gold : '#E5E7EB', stroke: f ? C.gold : '#E5E7EB', strokeWidth: 1 })
  );
}
function IHeart(props) {
  var on = props.on;
  return React.createElement(Svg, { width: 16, height: 16, viewBox: "0 0 24 24", fill: on ? '#EF4444' : 'none', stroke: on ? '#EF4444' : C.muted, strokeWidth: 2 },
    React.createElement(Path, { d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z", strokeLinecap: "round", strokeLinejoin: "round" })
  );
}
function ICheck() {
  return React.createElement(Svg, { width: 12, height: 12, viewBox: "0 0 24 24", fill: "none", stroke: C.white, strokeWidth: 3 },
    React.createElement(Path, { d: "M20 6L9 17l-5-5", strokeLinecap: "round", strokeLinejoin: "round" })
  );
}
function ITag() {
  return React.createElement(Svg, { width: 12, height: 12, viewBox: "0 0 24 24", fill: "none", stroke: C.accent, strokeWidth: 2 },
    React.createElement(Path, { d: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z", strokeLinecap: "round", strokeLinejoin: "round" }),
    React.createElement(Circle, { cx: 7, cy: 7, r: 1, fill: C.accent })
  );
}

// Sidebar icons
function IDash(props) {
  var a = props.a;
  return React.createElement(Svg, { width: 17, height: 17, viewBox: "0 0 24 24", fill: "none", stroke: a ? C.white : C.sideMuted, strokeWidth: 2 },
    React.createElement(Path, { d: "M3 3v18h18M18 17V9M13 17V5M8 17v-3", strokeLinecap: "round", strokeLinejoin: "round" })
  );
}
function IBox(props) {
  var a = props.a;
  return React.createElement(Svg, { width: 17, height: 17, viewBox: "0 0 24 24", fill: "none", stroke: a ? C.white : C.sideMuted, strokeWidth: 2 },
    React.createElement(Path, { d: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12", strokeLinecap: "round", strokeLinejoin: "round" })
  );
}
function IClip(props) {
  var a = props.a;
  return React.createElement(Svg, { width: 17, height: 17, viewBox: "0 0 24 24", fill: "none", stroke: a ? C.white : C.sideMuted, strokeWidth: 2 },
    React.createElement(Path, { d: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 10h6M9 14h6M9 18h6", strokeLinecap: "round", strokeLinejoin: "round" })
  );
}
function IUsers(props) {
  var a = props.a;
  return React.createElement(Svg, { width: 17, height: 17, viewBox: "0 0 24 24", fill: "none", stroke: a ? C.white : C.sideMuted, strokeWidth: 2 },
    React.createElement(Path, { d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75", strokeLinecap: "round", strokeLinejoin: "round" }),
    React.createElement(Circle, { cx: 9, cy: 7, r: 4 })
  );
}
function IGear(props) {
  var a = props.a;
  return React.createElement(Svg, { width: 17, height: 17, viewBox: "0 0 24 24", fill: "none", stroke: a ? C.white : C.sideMuted, strokeWidth: 2 },
    React.createElement(Circle, { cx: 12, cy: 12, r: 3 }),
    React.createElement(Path, { d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z", strokeLinecap: "round", strokeLinejoin: "round" })
  );
}

const navItems = [
  { key: 'BusinessDashboard', label: 'Dashboard',  Icon: IDash },
  { key: 'Products',          label: 'Produits',   Icon: IBox },
  { key: 'Orders',            label: 'Commandes',  Icon: IClip },
  { key: 'Customers',         label: 'Clients',    Icon: IUsers },
  { key: 'Settings',          label: 'Paramètres', Icon: IGear },
];

// ─── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar(props) {
  var active = props.active;
  var onNav = props.onNav;
  return (
    <View style={s.sidebar}>
      <View style={s.sideLogoRow}>
        <View style={s.logoMark}><Text style={s.logoMarkTxt}>V</Text></View>
        <Text style={s.logoName}>Vendoo</Text>
      </View>
      <Text style={s.sideSection}>NAVIGATION</Text>
      {navItems.map(function(item) {
        var key = item.key;
        var label = item.label;
        var Icon = item.Icon;
        var a = active === key;
        return (
          <TouchableOpacity key={key} style={[s.navItem, a && s.navItemA]} onPress={function() { onNav(key); }} activeOpacity={0.7}>
          <Icon a={a} /><Text style={[s.navLabel, a && s.navLabelA]}>{label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
  );
}

// ─── Stars ─────────────────────────────────────────────────────────────────────
function Stars(props) {
  var n = props.n;
  return React.createElement(View, { style: { flexDirection: 'row', gap: 1 } },
    [1,2,3,4,5].map(function(i) { return React.createElement(IStar, { key: i, f: i <= Math.round(n) }); })
  );
}

// ─── Product Thumbnail ─────────────────────────────────────────────────────────
const Thumb: React.FC<{ p: Product; w: number; h: number }> = ({ p, w, h }) => (
  <View style={{ width: w, height: h, backgroundColor: p.couleur + '18', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
    {p.imageUri ? (
      <Image source={{ uri: p.imageUri }} style={{ width: w, height: h }} resizeMode="contain" />
    ) : (
      <>
        <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', opacity: 0.06 }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <Line key={i} x1={i * (w / 8)} y1="0" x2="0" y2={i * (h / 8)} stroke={p.couleur} strokeWidth={10} />
          ))}
        </Svg>
        <Text style={{ fontSize: h * 0.38 }}>{p.emoji}</Text>
      </>
    )}
    {p.stock === 0 && (
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 5, alignItems: 'center' }}>
        <Text style={{ color: C.white, fontSize: 9, fontWeight: '800', letterSpacing: 1 }}>RUPTURE</Text>
      </View>
    )}
    {p.isPromo && p.prixPromo && (
      <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: C.accent, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5 }}>
        <Text style={{ color: C.white, fontSize: 9, fontWeight: '800' }}>-{Math.round((1 - p.prixPromo / p.prix) * 100)}%</Text>
      </View>
    )}
    {p.isNew && !p.isPromo && (
      <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: C.info, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5 }}>
        <Text style={{ color: C.white, fontSize: 9, fontWeight: '800' }}>NEW</Text>
      </View>
    )}
  </View>
);

// ─── Product Card ──────────────────────────────────────────────────────────────
const ProductCard: React.FC<{ p: Product; onPress: () => void; liked: boolean; onLike: () => void }> = ({ p, onPress, liked, onLike }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const pi = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start();
  const po = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

  return (
    <Animated.View style={[pc.wrap, { width: CARD_W, transform: [{ scale }] }]}>
      <TouchableOpacity onPress={onPress} onPressIn={pi} onPressOut={po} activeOpacity={1}>
        {/* Thumbnail */}
        <View style={{ position: 'relative' }}>
          <Thumb p={p} w={CARD_W} h={IMG_H} />
          {/* Heart */}
          <TouchableOpacity style={pc.heart} onPress={onLike} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <IHeart on={liked} />
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={pc.info}>
          <Text style={pc.cat}>{p.categorie}</Text>
          <Text style={pc.nom} numberOfLines={2}>{p.nom}</Text>

          {p.note > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 }}>
              <Stars n={p.note} />
              <Text style={pc.avis}>({p.avis})</Text>
            </View>
          )}

          <View style={pc.priceRow}>
            <View>
              {p.prixPromo ? (
                <>
                  <Text style={pc.prixOld}>{p.prix.toFixed(2)} €</Text>
                  <Text style={pc.prixPromo}>{p.prixPromo.toFixed(2)} €</Text>
                </>
              ) : (
                <Text style={pc.prix}>{p.prix.toFixed(2)} €</Text>
              )}
            </View>
            <View style={[pc.addBtn, { backgroundColor: p.stock === 0 ? C.border : C.navy }]}>
              {p.stock === 0
                ? <Text style={{ fontSize: 8, color: C.muted, fontWeight: '700' }}>N/A</Text>
                : <ICart size={14} />}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Buy Bottom Sheet ──────────────────────────────────────────────────────────
const BuySheet: React.FC<{
  product: Product | null; onClose: () => void; onAddToCart: (item: CartItem) => void;
  onUpdate?: (id: string, updates: Partial<Product>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}> = ({ product, onClose, onAddToCart, onUpdate, onDelete }) => {
  const slideY = useRef(new Animated.Value(H)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [qty, setQty] = useState(1);
  const [selSize, setSelSize] = useState<string | null>(null);
  const [selColor, setSelColor] = useState<string | null>(null);
  const [tab, setTab] = useState<'buy' | 'info' | 'manage'>('buy');
  const [busy, setBusy] = useState(false);

  const adjustStock = async (delta: number) => {
    if (!product || !onUpdate) return;
    const next = Math.max(0, product.stock + delta);
    setBusy(true);
    try { await onUpdate(product.id, { stock: next }); }
    catch { Alert.alert('Erreur', 'Mise à jour du stock impossible.'); }
    finally { setBusy(false); }
  };

  const togglePromo = async () => {
    if (!product || !onUpdate) return;
    setBusy(true);
    try {
      if (product.isPromo) {
        await onUpdate(product.id, { isPromo: false, prixPromo: undefined as any });
      } else {
        await onUpdate(product.id, { isPromo: true, prixPromo: Math.round(product.prix * 0.8 * 100) / 100 });
      }
    } catch { Alert.alert('Erreur', 'Mise à jour impossible.'); }
    finally { setBusy(false); }
  };

  const confirmDelete = () => {
    if (!product || !onDelete) return;
    Alert.alert('Supprimer le produit', `Retirer « ${product.nom} » du catalogue ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try { await onDelete(product.id); onClose(); }
          catch { Alert.alert('Erreur', 'Suppression impossible.'); }
          finally { setBusy(false); }
        },
      },
    ]);
  };

  useEffect(() => {
    if (product) {
      setQty(1); setSelSize(null); setSelColor(null); setTab('buy');
      Animated.parallel([
        Animated.spring(slideY, { toValue: 0, useNativeDriver: true, damping: 22, mass: 0.8, stiffness: 180 }),
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideY, { toValue: H, duration: 280, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [product]);

  const close = () => {
    Animated.parallel([
      Animated.timing(slideY, { toValue: H, duration: 260, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  const addToCart = () => {
    if (!product) return;
    if (product.sizes?.length && !selSize) { Alert.alert('Taille requise', 'Choisis une taille'); return; }
    if (product.colors?.length && !selColor) { Alert.alert('Couleur requise', 'Choisis une couleur'); return; }
    onAddToCart({ product, qty, size: selSize ?? undefined, color: selColor ?? undefined });
    Alert.alert('✓ Ajouté au panier', `${qty}× ${product.nom}`);
    close();
  };

  const buyNow = () => {
    if (!product) return;
    if (product.sizes?.length && !selSize) { Alert.alert('Taille requise', 'Choisis une taille'); return; }
    addToCart();
    Alert.alert('Commande', 'Fonctionnalité de paiement bientôt disponible !');
  };

  if (!product) return null;
  const total = ((product.prixPromo ?? product.prix) * qty).toFixed(2);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop */}
      <Animated.View style={[bs.backdrop, { opacity }]} pointerEvents={product ? 'auto' : 'none'}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={close} activeOpacity={1} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View style={[bs.sheet, { transform: [{ translateY: slideY }] }]}>
        {/* Handle */}
        <View style={bs.handle} />

        {/* Product preview row */}
        <View style={bs.previewRow}>
          <Thumb p={product} w={72} h={72} />
          <View style={{ flex: 1 }}>
            <Text style={bs.previewCat}>{product.categorie}</Text>
            <Text style={bs.previewNom} numberOfLines={2}>{product.nom}</Text>
            {product.note > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                <Stars n={product.note} /><Text style={bs.avis}>{product.note} ({product.avis} avis)</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={close} style={bs.closeBtn}><IClose /></TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={bs.tabs}>
          {(['buy', 'info', 'manage'] as const).map(t => (
            <TouchableOpacity key={t} style={[bs.tab, tab === t && bs.tabActive]} onPress={() => setTab(t)}>
              <Text style={[bs.tabText, tab === t && bs.tabTextActive]}>
                {t === 'buy' ? 'Commander' : t === 'info' ? 'Détails' : 'Gérer'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={bs.scroll} showsVerticalScrollIndicator={false}>
          {tab === 'manage' ? (
            <View style={{ gap: 18 }}>
              {/* Stock control */}
              <View>
                <Text style={bs.optLabel}>Gestion du stock</Text>
                <View style={bs.manageStockRow}>
                  <TouchableOpacity style={bs.manageStockBtn} onPress={() => adjustStock(-1)} disabled={busy || product.stock === 0}>
                    <IMinus />
                  </TouchableOpacity>
                  <View style={bs.manageStockMid}>
                    <Text style={bs.manageStockVal}>{product.stock}</Text>
                    <Text style={bs.manageStockLbl}>en stock</Text>
                  </View>
                  <TouchableOpacity style={bs.manageStockBtn} onPress={() => adjustStock(1)} disabled={busy}>
                    <IPlus color={C.textDark} />
                  </TouchableOpacity>
                </View>
                <View style={bs.manageQuick}>
                  {[5, 10, 25].map(n => (
                    <TouchableOpacity key={n} style={bs.manageQuickBtn} onPress={() => adjustStock(n)} disabled={busy}>
                      <Text style={bs.manageQuickTxt}>+{n}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Promo toggle */}
              <View>
                <Text style={bs.optLabel}>Promotion</Text>
                <TouchableOpacity style={[bs.managePromo, product.isPromo && bs.managePromoOn]} onPress={togglePromo} disabled={busy}>
                  <View style={{ flex: 1 }}>
                    <Text style={[bs.managePromoTitle, product.isPromo && { color: C.white }]}>
                      {product.isPromo ? '✓ En promotion (-20%)' : 'Activer une promo -20%'}
                    </Text>
                    <Text style={[bs.managePromoSub, product.isPromo && { color: 'rgba(255,255,255,0.85)' }]}>
                      {product.isPromo && product.prixPromo
                        ? `Prix promo : ${product.prixPromo.toFixed(2)} €`
                        : `Passerait de ${product.prix.toFixed(2)} € à ${(product.prix * 0.8).toFixed(2)} €`}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Delete */}
              <TouchableOpacity style={bs.manageDelete} onPress={confirmDelete} disabled={busy}>
                <Text style={bs.manageDeleteTxt}>🗑  Supprimer du catalogue</Text>
              </TouchableOpacity>
            </View>
          ) : tab === 'buy' ? (
            <>
              {/* Price */}
              <View style={bs.priceRow}>
                {product.prixPromo ? (
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                    <Text style={bs.prixPromo}>{product.prixPromo.toFixed(2)} €</Text>
                    <Text style={bs.prixOld}>{product.prix.toFixed(2)} €</Text>
                    <View style={bs.discBadge}><ITag /><Text style={bs.discText}>-{Math.round((1 - product.prixPromo / product.prix) * 100)}%</Text></View>
                  </View>
                ) : (
                  <Text style={bs.prix}>{product.prix.toFixed(2)} €</Text>
                )}
                <View style={[bs.stockChip, { backgroundColor: product.stock === 0 ? '#FEE2E2' : product.stock < 5 ? '#FEF3C7' : '#D1FAE5' }]}>
                  <View style={[bs.stockDot, { backgroundColor: product.stock === 0 ? C.error : product.stock < 5 ? C.warning : C.success }]} />
                  <Text style={[bs.stockTxt, { color: product.stock === 0 ? C.error : product.stock < 5 ? C.warning : C.success }]}>
                    {product.stock === 0 ? 'Rupture' : product.stock < 5 ? `⚡ Plus que ${product.stock}` : `${product.stock} en stock`}
                  </Text>
                </View>
              </View>

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <>
                  <Text style={bs.optLabel}>Taille</Text>
                  <View style={bs.optRow}>
                    {product.sizes.map(sz => (
                      <TouchableOpacity key={sz} onPress={() => setSelSize(sz)}
                        style={[bs.optChip, selSize === sz && bs.optChipA]}>
                        <Text style={[bs.optChipTxt, selSize === sz && bs.optChipTxtA]}>{sz}</Text>
                        {selSize === sz && <View style={bs.checkDot}><ICheck /></View>}
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <>
                  <Text style={bs.optLabel}>Couleur</Text>
                  <View style={bs.optRow}>
                    {product.colors.map(co => (
                      <TouchableOpacity key={co} onPress={() => setSelColor(co)}
                        style={[bs.optChip, selColor === co && bs.optChipA]}>
                        <Text style={[bs.optChipTxt, selColor === co && bs.optChipTxtA]}>{co}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {/* Qty */}
              <Text style={bs.optLabel}>Quantité</Text>
              <View style={bs.qtyRow}>
                <TouchableOpacity style={bs.qtyBtn} onPress={() => setQty(q => Math.max(1, q - 1))}><IMinus /></TouchableOpacity>
                <Text style={bs.qtyVal}>{qty}</Text>
                <TouchableOpacity style={bs.qtyBtn} onPress={() => setQty(q => Math.min(product.stock, q + 1))}><IPlus color={C.textDark} /></TouchableOpacity>
                <View style={{ flex: 1 }} />
                <Text style={bs.totalLabel}>Total</Text>
                <Text style={bs.totalVal}>{total} €</Text>
              </View>
            </>
          ) : (
            <>
              {product.description ? (
                <View style={bs.descBlock}>
                  <Text style={bs.descLabel}>Description</Text>
                  <Text style={bs.desc}>{product.description}</Text>
                </View>
              ) : <Text style={bs.desc}>Aucune description disponible.</Text>}
              <View style={bs.infoGrid}>
                {[
                  { k: 'Catégorie', v: product.categorie },
                  { k: 'Stock', v: `${product.stock} unités` },
                  { k: 'Prix', v: `${product.prix.toFixed(2)} €` },
                  { k: 'Note', v: product.note > 0 ? `${product.note}/5 (${product.avis} avis)` : '—' },
                ].map(({ k, v }) => (
                  <View key={k} style={bs.infoRow}>
                    <Text style={bs.infoKey}>{k}</Text>
                    <Text style={bs.infoVal}>{v}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>

        {/* CTA buttons */}
        {tab !== 'manage' && product.stock > 0 && (
          <View style={bs.cta}>
            <TouchableOpacity style={bs.ctaSecondary} onPress={addToCart} activeOpacity={0.85}>
              <ICart color={C.navy} size={16} />
              <Text style={bs.ctaSecondaryTxt}>Panier</Text>
            </TouchableOpacity>
            <TouchableOpacity style={bs.ctaPrimary} onPress={buyNow} activeOpacity={0.85}>
              <Text style={bs.ctaPrimaryTxt}>Acheter maintenant · {total} €</Text>
            </TouchableOpacity>
          </View>
        )}
        {tab !== 'manage' && product.stock === 0 && (
          <View style={bs.cta}>
            <View style={[bs.ctaPrimary, { backgroundColor: C.border, flex: 1 }]}>
              <Text style={[bs.ctaPrimaryTxt, { color: C.muted }]}>Rupture de stock</Text>
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

// ─── Add Product Modal ─────────────────────────────────────────────────────────
const EMOJI_LIST = ['📦','👕','👟','🧥','🧢','👜','👖','🩴','💎','🎽','👗','🧣','🕶','⌚','💍','🧴','🎒','👒','🥿','🩲'];
const COLOR_LIST = ['#6366F1','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#F97316','#64748B','#0EA5E9','#14B8A6'];

// ─── Web-safe image pick helper ────────────────────────────────────────────────
const webPickImage = (onPicked: (uri: string) => void) => {
  const input = (document as any).createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e: any) => {
    const file = e.target?.files?.[0];
    if (file) onPicked(URL.createObjectURL(file));
  };
  input.click();
};

// ─── Toggle switch ──────────────────────────────────────────────────────────────
const ToggleSwitch: React.FC<{ value: boolean; onToggle: () => void; label: string }> = ({ value, onToggle, label }) => (
  <TouchableOpacity style={am.switchRow} onPress={onToggle} activeOpacity={0.8}>
    <Text style={am.switchLabel}>{label}</Text>
    <View style={[am.switchTrack, value && am.switchTrackOn]}>
      <View style={[am.switchThumb, value && am.switchThumbOn]} />
    </View>
  </TouchableOpacity>
);

const AddModal: React.FC<{ visible: boolean; onClose: () => void; onAdd: (p: Product) => void }> = ({ visible, onClose, onAdd }) => {
  const [form, setForm] = useState({ nom: '', prix: '', prixPromo: '', stock: '', categorie: '', description: '', sizes: '', colors: '' });
  const [emoji, setEmoji] = useState('📦');
  const [couleur, setCouleur] = useState(COLOR_LIST[0]);
  const [focused, setFocused] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isPromo, setIsPromo] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const handlePickImage = () => {
    if (Platform.OS === 'web') { webPickImage(setImageUri); return; }
    Alert.alert('Info', 'Sélection d\'image non disponible sur cette plateforme');
  };

  const f = (field: keyof typeof form) => ({
    style: [am.input, focused === field && am.inputF] as any,
    value: form[field],
    onChangeText: (v: string) => setForm(x => ({ ...x, [field]: v })),
    onFocus: () => setFocused(field),
    onBlur: () => setFocused(null),
    autoCorrect: false as const,
    spellCheck: false as const,
    returnKeyType: 'next' as const,
    clearButtonMode: 'while-editing' as const,
    placeholderTextColor: C.muted,
  });

  const submit = () => {
    if (!form.nom.trim() || !form.prix) { Alert.alert('Requis', 'Nom et prix obligatoires'); return; }
    const p: Product = {
      id: Date.now().toString(),
      nom: form.nom.trim(),
      prix: parseFloat(form.prix) || 0,
      prixPromo: isPromo && form.prixPromo ? parseFloat(form.prixPromo) : undefined,
      stock: parseInt(form.stock) || 0,
      categorie: form.categorie.trim() || 'Autre',
      emoji, couleur,
      description: form.description.trim() || undefined,
      note: 0, avis: 0,
      isNew, isPromo,
      sizes: form.sizes ? form.sizes.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      colors: form.colors ? form.colors.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      imageUri: imageUri ?? undefined,
    };
    console.log('Adding product:', p);
    onAdd(p);
    setForm({ nom: '', prix: '', prixPromo: '', stock: '', categorie: '', description: '', sizes: '', colors: '' });
    setEmoji('📦'); setCouleur(COLOR_LIST[0]); setIsNew(false); setIsPromo(false); setImageUri(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={am.container}>

          {/* ── Header ─────────────────────────────────────────────────── */}
          <View style={am.header}>
            <TouchableOpacity onPress={onClose} style={am.closeBtn}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.textLight} strokeWidth={2.5}>
                <Path d="M18 6 6 18M6 6l12 12" strokeLinecap="round"/>
              </Svg>
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={am.title}>Nouveau produit</Text>
              <Text style={am.subtitle}>Remplissez les informations</Text>
            </View>
            <TouchableOpacity onPress={submit} style={am.saveBtn}>
              <Text style={am.saveBtnTxt}>Ajouter</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={am.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

            {/* ── Section : Identité ─────────────────────────────────────── */}
            <View style={am.section}>
              <Text style={am.sectionTitle}>Identité du produit</Text>

              {/* ── Nom + petite vignette style Amazon ─────────────────── */}
              <View style={am.nameImageRow}>
                {/* Thumbnail */}
                <TouchableOpacity style={am.thumb} onPress={handlePickImage} activeOpacity={0.8}>
                  {imageUri ? (
                    <>
                      <Image source={{ uri: imageUri }} style={am.thumbImg} resizeMode="cover" />
                      <TouchableOpacity style={am.thumbRemove} onPress={() => setImageUri(null)}>
                        <Svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}>
                          <Path d="M18 6 6 18M6 6l12 12" strokeLinecap="round"/>
                        </Svg>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View style={am.thumbEmpty}>
                      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth={1.5}>
                        <Rect x="3" y="3" width="18" height="18" rx="4"/>
                        <Circle cx="8.5" cy="8.5" r="1.5" fill={C.accent} stroke="none"/>
                        <Path d="m21 15-5-5L5 21" strokeLinecap="round" strokeLinejoin="round"/>
                      </Svg>
                      <Text style={am.thumbHint}>Photo</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Nom */}
                <View style={{ flex: 1 }}>
                  <Text style={[am.label, { marginTop: 0 }]}>Nom du produit *</Text>
                  <TextInput {...f('nom')} placeholder="ex : T-Shirt Premium Lin" autoCapitalize="words" />
                </View>
              </View>

              <Text style={am.label}>Description</Text>
              <TextInput
                style={[am.input, am.textarea, focused === 'description' && am.inputF]}
                value={form.description}
                onChangeText={v => setForm(x => ({ ...x, description: v }))}
                onFocus={() => setFocused('description')}
                onBlur={() => setFocused(null)}
                placeholder="Matière, coupe, particularités..."
                multiline
                numberOfLines={3}
                placeholderTextColor={C.muted}
                autoCorrect={false}
              />

              <Text style={am.label}>Catégorie</Text>
              <TextInput {...f('categorie')} placeholder="ex : Vêtements, Accessoires..." />

              <Text style={am.label}>Icône (si pas de photo)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={am.emojiScroll}>
                {EMOJI_LIST.map(e => (
                  <TouchableOpacity key={e} onPress={() => setEmoji(e)} style={[am.emojiBtn, emoji === e && am.emojiBtnA]}>
                    <Text style={{ fontSize: 22 }}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={am.label}>Couleur de fond</Text>
              <View style={am.colorRow}>
                {COLOR_LIST.map(c => (
                  <TouchableOpacity key={c} onPress={() => setCouleur(c)}
                    style={[am.colorDot, { backgroundColor: c }, couleur === c && am.colorDotA]}>
                    {couleur === c && <ICheck />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* ── Section : Prix & Stock ─────────────────────────────────── */}
            <View style={am.section}>
              <Text style={am.sectionTitle}>Prix & Stock</Text>
              <View style={am.row2}>
                <View style={{ flex: 1 }}>
                  <Text style={am.label}>Prix de vente (€) *</Text>
                  <View style={am.priceWrap}>
                    <Text style={am.pricePfx}>€</Text>
                    <TextInput
                      style={am.priceInput}
                      value={form.prix}
                      onChangeText={v => setForm(x => ({ ...x, prix: v }))}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      placeholderTextColor={C.muted}
                    />
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={am.label}>Stock dispo</Text>
                  <View style={am.priceWrap}>
                    <Text style={am.pricePfx}>#</Text>
                    <TextInput
                      style={am.priceInput}
                      value={form.stock}
                      onChangeText={v => setForm(x => ({ ...x, stock: v }))}
                      placeholder="0"
                      keyboardType="number-pad"
                      placeholderTextColor={C.muted}
                    />
                  </View>
                </View>
              </View>
              <ToggleSwitch value={isPromo} onToggle={() => setIsPromo(v => !v)} label="En promotion" />
              {isPromo && (
                <View style={am.promoBox}>
                  <Text style={am.label}>Prix promotionnel (€)</Text>
                  <View style={am.priceWrap}>
                    <Text style={[am.pricePfx, { color: C.accent }]}>€</Text>
                    <TextInput
                      style={[am.priceInput, { color: C.accent }]}
                      value={form.prixPromo}
                      onChangeText={v => setForm(x => ({ ...x, prixPromo: v }))}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      placeholderTextColor={C.muted}
                    />
                  </View>
                </View>
              )}
            </View>

            {/* ── Section : Variantes ────────────────────────────────────── */}
            <View style={am.section}>
              <Text style={am.sectionTitle}>Variantes</Text>
              <Text style={am.label}>Tailles disponibles</Text>
              <TextInput {...f('sizes')} placeholder="XS, S, M, L, XL" autoCapitalize="characters" />
              <Text style={am.label}>Couleurs disponibles</Text>
              <TextInput {...f('colors')} placeholder="Blanc, Noir, Rouge..." autoCapitalize="words" />
            </View>

            {/* ── Section : Badges ───────────────────────────────────────── */}
            <View style={am.section}>
              <Text style={am.sectionTitle}>Badges</Text>
              <ToggleSwitch value={isNew} onToggle={() => setIsNew(v => !v)} label="Marquer comme Nouveau" />
            </View>

            {/* ── CTA principal ──────────────────────────────────────────── */}
            <TouchableOpacity style={am.submit} onPress={submit} activeOpacity={0.85}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5}>
                <Path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
              <Text style={am.submitTxt}>Ajouter au catalogue</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── Main ──────────────────────────────────────────────────────────────────────
const ProductsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const isDesktop = W >= 1024;
  const { products, loading, error, addProduct, updateProduct, removeProduct } = useProducts();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('Tous');
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [buyProduct, setBuyProduct] = useState<Product | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [sort, setSort] = useState<'default' | 'asc' | 'desc' | 'note'>('default');


  const cartCount = cartItems.reduce((acc, i) => acc + i.qty, 0);
  const goTo = (screen: string) => { if (screen !== 'Products') navigation.navigate(screen as any); };

  const toggleLike = (id: string) => setLiked(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const addToCart = (item: CartItem) => {
    setCartItems(prev => {
      const existing = prev.findIndex(i => i.product.id === item.product.id && i.size === item.size && i.color === item.color);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = { ...next[existing], qty: next[existing].qty + item.qty };
        return next;
      }
      return [...prev, item];
    });
  };

  const filtered = products
    .filter(p => (cat === 'Tous' || p.categorie === cat) && p.nom.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'asc')  return (a.prixPromo ?? a.prix) - (b.prixPromo ?? b.prix);
      if (sort === 'desc') return (b.prixPromo ?? b.prix) - (a.prixPromo ?? a.prix);
      if (sort === 'note') return b.note - a.note;
      return 0;
    });

  // Log filter results
  React.useEffect(() => {
    console.log('Filter state - cat:', cat, 'search:', search, 'products:', products.length, 'filtered:', filtered.length);
  }, [cat, search, products, filtered]);

  // Category counts
  const catCount = (c: string) => c === 'Tous' ? products.length : products.filter(p => p.categorie === c).length;
  // Available cats (only ones with products + Tous)
  const availCats = CATS.filter(c => c === 'Tous' || products.some(p => p.categorie === c));

  const content = (
    <View style={{ flex: 1 }}>
      {/* ── Store Header ─────────────────────────────────────────────────── */}
      <View style={s.storeHeader}>
        <View style={s.storeLeft}>
          <View style={s.storeLogo}><Text style={{ fontSize: 22 }}>🏪</Text></View>
          <View>
            <Text style={s.storeName}>Notre Boutique</Text>
            <Text style={s.storeSub}>{products.length} article{products.length !== 1 ? 's' : ''} au catalogue</Text>
          </View>
        </View>
        {/* Cart */}
        <TouchableOpacity style={s.cartBtn} activeOpacity={0.8}>
          <ICart size={20} />
          {cartCount > 0 && (
            <View style={s.cartBadge}><Text style={s.cartBadgeTxt}>{cartCount}</Text></View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ── Search ───────────────────────────────────────────────────────── */}
        <View style={s.searchRow}>
          <View style={s.searchBar}>
            <ISearch />
            <TextInput style={s.searchInput} placeholder="Rechercher..." placeholderTextColor={C.muted}
              value={search} onChangeText={setSearch} autoCorrect={false} autoCapitalize="none"
              returnKeyType="search" clearButtonMode="while-editing" spellCheck={false} />
          </View>
        </View>

        {/* ── Category tabs ─────────────────────────────────────────────────── */}
        {products.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll} contentContainerStyle={s.catContent}>
            {availCats.map(c => {
              const a = cat === c;
              return (
                <TouchableOpacity key={c} onPress={() => setCat(c)} style={[s.catBtn, a && s.catBtnA]} activeOpacity={0.8}>
                  <Text style={[s.catTxt, a && s.catTxtA]}>{c}</Text>
                  <Text style={[s.catCnt, a && s.catCntA]}>{catCount(c)}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* ── Sort bar ─────────────────────────────────────────────────────── */}
        {products.length > 0 && (
          <View style={s.sortBar}>
            <Text style={s.sortCount}>{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {[['default','Défaut'], ['asc','Prix ↑'], ['desc','Prix ↓'], ['note','⭐ Note']] .map(([k, l]) => (
                <TouchableOpacity key={k} onPress={() => setSort(k as any)} style={[s.sortBtn, sort === k && s.sortBtnA]}>
                  <Text style={[s.sortTxt, sort === k && s.sortTxtA]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Error banner ─────────────────────────────────────────────────── */}
        {error && (
          <View style={s.errorBanner}>
            <Text style={s.errorBannerTxt}>⚠️ {error}</Text>
          </View>
        )}

        {/* ── Grid ─────────────────────────────────────────────────────────── */}
        {loading && products.length === 0 ? (
          <View style={s.empty}>
            <View style={s.spinnerWrap}>
              <Text style={{ fontSize: 40 }}>⏳</Text>
            </View>
            <Text style={s.emptyTitle}>Chargement du catalogue…</Text>
            <Text style={s.emptySub}>Synchronisation avec votre boutique</Text>
          </View>
        ) : filtered.length > 0 ? (
          <View style={s.grid}>
            {filtered.map(p => (
              <ProductCard key={p.id} p={p}
                onPress={() => setBuyProduct(p)}
                liked={liked.has(p.id)}
                onLike={() => toggleLike(p.id)} />
            ))}
            {/* Spacer if odd number */}
            {filtered.length % 2 !== 0 && <View style={{ width: CARD_W }} />}
          </View>
        ) : products.length > 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 48 }}>🔍</Text>
            <Text style={s.emptyTitle}>Aucun résultat</Text>
            <Text style={s.emptySub}>Essaie un autre terme ou catégorie</Text>
          </View>
        ) : (
          /* ── Empty state ─────────────────────────────────────────────── */
          <View style={s.emptyFull}>
            <View style={s.emptyIllus}>
              <Svg width={120} height={120} viewBox="0 0 120 120">
                {/* Shelf */}
                <Rect x="10" y="75" width="100" height="8" rx="3" fill="#E5E7EB"/>
                <Rect x="5" y="30" width="110" height="8" rx="3" fill="#E5E7EB"/>
                {/* Posts */}
                <Rect x="10" y="30" width="6" height="53" rx="2" fill="#D1D5DB"/>
                <Rect x="104" y="30" width="6" height="53" rx="2" fill="#D1D5DB"/>
                {/* Empty boxes */}
                <Rect x="22" y="48" width="28" height="27" rx="4" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1.5"/>
                <Rect x="56" y="42" width="28" height="33" rx="4" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1.5"/>
                <Rect x="90" y="50" width="22" height="25" rx="4" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1.5"/>
                {/* "+" in the middle box */}
                <Line x1="70" y1="52" x2="70" y2="65" stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round"/>
                <Line x1="63.5" y1="58.5" x2="76.5" y2="58.5" stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round"/>
              </Svg>
            </View>
            <Text style={s.emptyTitle}>Catalogue vide</Text>
            <Text style={s.emptySub}>Ajoute tes premiers produits{'\n'}et ils apparaîtront ici</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => setShowAdd(true)} activeOpacity={0.85}>
              <IPlus /><Text style={s.emptyBtnTxt}>Ajouter un produit</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ── FAB ─────────────────────────────────────────────────────────── */}
      <TouchableOpacity style={s.fab} onPress={() => setShowAdd(true)} activeOpacity={0.85}>
        <IPlus />
        <Text style={s.fabTxt}>Ajouter</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      {isDesktop ? (
        <View style={s.desktop}>
          {Platform.OS !== 'web' && <Sidebar active="Products" onNav={goTo} />}
          {content}
        </View>
      ) : (
        <View style={s.mobile}>
          {content}
          <BottomNavigation activeRoute="Products" />
        </View>
      )}

      <AddModal visible={showAdd} onClose={() => setShowAdd(false)} onAdd={p => {
        addProduct(p);
        setShowAdd(false);
      }} />
      <BuySheet product={buyProduct} onClose={() => setBuyProduct(null)} onAddToCart={addToCart}
        onUpdate={updateProduct} onDelete={removeProduct} />
    </>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  desktop: { flex: 1, flexDirection: 'row', backgroundColor: C.bg },
  mobile:  { flex: 1, backgroundColor: C.bg },
  sidebar:       { width: 240, backgroundColor: C.accent, paddingVertical: 28, paddingHorizontal: 16 },
  sideLogoRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, marginBottom: 32 },
  logoMark:      { width: 32, height: 32, borderRadius: 7, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  logoMarkTxt:   { color: C.white, fontSize: 16, fontWeight: '800' },
  logoName:      { fontSize: 18, fontWeight: '700', color: C.white },
  sideSection:   { fontSize: 10, fontWeight: '700', color: C.sideMuted, letterSpacing: 1.4, paddingHorizontal: 8, marginBottom: 8 },
  navItem:       { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, paddingVertical: 10, borderRadius: 8, marginBottom: 2 },
  navItemA:      { backgroundColor: 'rgba(255,255,255,0.08)' },
  navLabel:      { fontSize: 14, color: C.sideMuted, fontWeight: '500' },
  navLabelA:     { color: C.white, fontWeight: '600' },

  storeHeader:   { backgroundColor: C.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14, borderBottomWidth: 1, borderColor: C.border },
  storeLeft:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  storeLogo:     { width: 44, height: 44, borderRadius: 12, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  storeName:     { fontSize: 17, fontWeight: '800', color: C.textDark },
  storeSub:      { fontSize: 12, color: C.muted, marginTop: 1 },
  cartBtn:       { width: 44, height: 44, borderRadius: 12, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  cartBadge:     { position: 'absolute', top: -5, right: -5, backgroundColor: C.accent, borderRadius: 9, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  cartBadgeTxt:  { color: C.white, fontSize: 9, fontWeight: '800' },

  searchRow:     { paddingHorizontal: 16, paddingVertical: 12 },
  searchBar:     { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 12, paddingHorizontal: 12, height: 44, gap: 8, borderWidth: 1, borderColor: C.border },
  searchInput:   { flex: 1, fontSize: 15, color: C.textDark },

  catScroll:     { marginBottom: 8 },
  catContent:    { paddingHorizontal: 16, gap: 8 },
  catBtn:        { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border },
  catBtnA:       { backgroundColor: C.accent, borderColor: C.accent },
  catTxt:        { fontSize: 13, fontWeight: '600', color: C.textMid },
  catTxtA:       { color: C.white },
  catCnt:        { fontSize: 11, fontWeight: '700', color: C.muted, backgroundColor: C.bg, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 8 },
  catCntA:       { backgroundColor: 'rgba(255,255,255,0.2)', color: C.white },

  sortBar:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12 },
  sortCount:     { fontSize: 12, color: C.muted, fontWeight: '500', flexShrink: 0, marginRight: 10 },
  sortBtn:       { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.border },
  sortBtnA:      { backgroundColor: C.accent, borderColor: C.accent },
  sortTxt:       { fontSize: 11, fontWeight: '600', color: C.textLight },
  sortTxtA:      { color: C.white },

  grid:          { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },

  empty:         { alignItems: 'center', paddingVertical: 60, gap: 8 },
  spinnerWrap:   { width: 76, height: 76, borderRadius: 38, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  errorBanner:   { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FCA5A5', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  errorBannerTxt:{ fontSize: 13, color: '#B91C1C', fontWeight: '600' },
  emptyFull:     { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32, gap: 12 },
  emptyIllus:    { marginBottom: 8 },
  emptyTitle:    { fontSize: 20, fontWeight: '800', color: C.textDark },
  emptySub:      { fontSize: 14, color: C.muted, textAlign: 'center', lineHeight: 20 },
  emptyBtn:      { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.accent, paddingHorizontal: 22, paddingVertical: 13, borderRadius: 14, marginTop: 8 },
  emptyBtnTxt:   { color: C.white, fontWeight: '700', fontSize: 14 },

  fab:           { position: 'absolute', bottom: 90, right: 16, flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: C.accent, paddingHorizontal: 18, paddingVertical: 13, borderRadius: 26, shadowColor: C.accent, shadowOpacity: 0.4, shadowRadius: 14, shadowOffset: { width: 0, height: 5 } },
  fabTxt:        { color: C.white, fontWeight: '700', fontSize: 14 },
});

// Product card styles
const pc = StyleSheet.create({
  wrap:     { backgroundColor: C.white, borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  heart:    { position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 15, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  info:     { padding: 10 },
  cat:      { fontSize: 9, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 3 },
  nom:      { fontSize: 13, fontWeight: '700', color: C.textDark, lineHeight: 17, marginBottom: 5 },
  avis:     { fontSize: 9, color: C.muted },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 2 },
  prixOld:  { fontSize: 10, color: C.muted, textDecorationLine: 'line-through', marginBottom: 1 },
  prixPromo:{ fontSize: 14, fontWeight: '800', color: C.accent },
  prix:     { fontSize: 14, fontWeight: '800', color: C.textDark },
  addBtn:   { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
});

// Buy sheet styles
const bs = StyleSheet.create({
  backdrop:      { ...StyleSheet.absoluteFillObject, backgroundColor: C.overlay },
  sheet:         { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: H * 0.86, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 24, shadowOffset: { width: 0, height: -4 } },
  handle:        { width: 40, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 8 },
  previewRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1, borderColor: C.border },
  previewCat:    { fontSize: 10, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 2 },
  previewNom:    { fontSize: 15, fontWeight: '800', color: C.textDark, lineHeight: 20 },
  avis:          { fontSize: 11, color: C.muted },
  closeBtn:      { width: 32, height: 32, borderRadius: 16, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' },
  tabs:          { flexDirection: 'row', marginHorizontal: 16, marginTop: 12, marginBottom: 8, backgroundColor: C.bg, borderRadius: 10, padding: 3 },
  tab:           { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive:     { backgroundColor: C.white, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4 },
  tabText:       { fontSize: 13, fontWeight: '600', color: C.muted },
  tabTextActive: { color: C.textDark },
  scroll:        { paddingHorizontal: 16, paddingBottom: 8, gap: 2 },
  priceRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, marginTop: 4 },
  prix:          { fontSize: 26, fontWeight: '900', color: C.textDark },
  prixPromo:     { fontSize: 26, fontWeight: '900', color: C.accent },
  prixOld:       { fontSize: 14, color: C.muted, textDecorationLine: 'line-through' },
  discBadge:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.accentSoft, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  discText:      { fontSize: 12, fontWeight: '700', color: C.accent },
  stockChip:     { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  stockDot:      { width: 7, height: 7, borderRadius: 4 },
  stockTxt:      { fontSize: 12, fontWeight: '700' },
  optLabel:      { fontSize: 12, fontWeight: '700', color: C.textLight, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 12 },
  optRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optChip:       { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, borderColor: C.border, position: 'relative' },
  optChipA:      { borderColor: C.accent, backgroundColor: C.accent },
  optChipTxt:    { fontSize: 13, fontWeight: '600', color: C.textMid },
  optChipTxtA:   { color: C.white },
  checkDot:      { position: 'absolute', top: -6, right: -6, width: 16, height: 16, borderRadius: 8, backgroundColor: C.success, alignItems: 'center', justifyContent: 'center' },
  qtyRow:        { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  qtyBtn:        { width: 38, height: 38, borderRadius: 10, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  qtyVal:        { fontSize: 16, fontWeight: '800', color: C.textDark, minWidth: 32, textAlign: 'center' },
  totalLabel:    { fontSize: 12, color: C.muted, fontWeight: '600' },
  totalVal:      { fontSize: 18, fontWeight: '900', color: C.textDark },
  descBlock:     { backgroundColor: C.bg, borderRadius: 10, padding: 12, marginBottom: 12 },
  descLabel:     { fontSize: 11, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  desc:          { fontSize: 14, color: C.textMid, lineHeight: 20 },
  infoGrid:      { gap: 0 },
  infoRow:       { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: C.border },
  infoKey:       { fontSize: 13, color: C.muted, fontWeight: '500' },
  infoVal:       { fontSize: 13, color: C.textDark, fontWeight: '700' },
  cta:           { flexDirection: 'row', gap: 10, padding: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 16, borderTopWidth: 1, borderColor: C.border },
  ctaSecondary:  { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, height: 52, borderRadius: 14, borderWidth: 1.5, borderColor: C.accent },
  ctaSecondaryTxt:{ fontSize: 14, fontWeight: '700', color: C.accent },
  ctaPrimary:    { flex: 1, height: 52, borderRadius: 14, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  ctaPrimaryTxt: { color: C.white, fontWeight: '800', fontSize: 14 },

  // Manage tab
  manageStockRow:  { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 8 },
  manageStockBtn:  { width: 56, height: 56, borderRadius: 16, backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  manageStockMid:  { flex: 1, alignItems: 'center' },
  manageStockVal:  { fontSize: 30, fontWeight: '900', color: C.textDark },
  manageStockLbl:  { fontSize: 12, color: C.muted, fontWeight: '600' },
  manageQuick:     { flexDirection: 'row', gap: 8, marginTop: 12 },
  manageQuickBtn:  { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: C.accentSoft, alignItems: 'center' },
  manageQuickTxt:  { fontSize: 14, fontWeight: '800', color: C.accent },
  managePromo:     { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border, borderRadius: 14, padding: 16, marginTop: 8 },
  managePromoOn:   { backgroundColor: C.accent, borderColor: C.accent },
  managePromoTitle:{ fontSize: 14, fontWeight: '800', color: C.textDark },
  managePromoSub:  { fontSize: 12, color: C.textLight, marginTop: 3 },
  manageDelete:    { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FCA5A5', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  manageDeleteTxt: { fontSize: 14, fontWeight: '800', color: C.error },
});

// Add modal styles
const am = StyleSheet.create({
  container:    { flex: 1, backgroundColor: C.bg },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 56 : 20, paddingBottom: 14, backgroundColor: C.white, borderBottomWidth: 1, borderColor: C.border },
  title:        { fontSize: 16, fontWeight: '800', color: C.textDark },
  subtitle:     { fontSize: 12, color: C.muted, marginTop: 1 },
  closeBtn:     { width: 38, height: 38, borderRadius: 12, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  saveBtn:      { paddingHorizontal: 16, height: 36, borderRadius: 10, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  saveBtnTxt:   { color: C.white, fontSize: 13, fontWeight: '700' },
  scroll:       { paddingBottom: 20 },

  // Thumbnail (Amazon-style small image)
  nameImageRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 4 },
  thumb:         { width: 80, height: 80, borderRadius: 10, overflow: 'hidden', backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  thumbImg:      { width: 80, height: 80 },
  thumbEmpty:    { alignItems: 'center', justifyContent: 'center', gap: 4 },
  thumbHint:     { fontSize: 10, color: C.muted, fontWeight: '600' },
  thumbRemove:   { position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },

  // Sections
  section:      { backgroundColor: C.white, marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: C.textDark, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.4 },
  label:        { fontSize: 11, fontWeight: '700', color: C.textLight, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 12, marginBottom: 6 },
  input:        { height: 48, borderWidth: 1.5, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, fontSize: 15, color: C.textDark, backgroundColor: C.bg },
  inputF:       { borderColor: C.accent, backgroundColor: C.white },
  textarea:     { height: 80, paddingTop: 12, textAlignVertical: 'top' },

  emojiScroll:  { marginHorizontal: -4, marginTop: 0 },
  emojiBtn:     { width: 48, height: 48, borderRadius: 12, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', marginRight: 8, borderWidth: 1.5, borderColor: 'transparent' },
  emojiBtnA:    { borderColor: C.accent, backgroundColor: '#EEF2FF' },
  colorRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  colorDot:     { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: 'transparent' },
  colorDotA:    { borderColor: C.white, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },

  row2:         { flexDirection: 'row', gap: 12 },
  priceWrap:    { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: C.border, borderRadius: 12, backgroundColor: C.bg, paddingLeft: 12 },
  pricePfx:     { fontSize: 16, fontWeight: '700', color: C.muted, marginRight: 4 },
  priceInput:   { flex: 1, height: 48, fontSize: 18, fontWeight: '700', color: C.textDark },
  promoBox:     { marginTop: 12, padding: 12, backgroundColor: '#FFF4F0', borderRadius: 12, borderWidth: 1, borderColor: '#FFD5C4' },

  // Switch
  switchRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  switchLabel:  { fontSize: 14, fontWeight: '600', color: C.textMid },
  switchTrack:  { width: 46, height: 26, borderRadius: 13, backgroundColor: C.border, justifyContent: 'center', paddingHorizontal: 3 },
  switchTrackOn:{ backgroundColor: C.success },
  switchThumb:  { width: 20, height: 20, borderRadius: 10, backgroundColor: C.white, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } },
  switchThumbOn:{ transform: [{ translateX: 20 }] },

  submit:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: C.accent, height: 54, borderRadius: 16, marginHorizontal: 16, marginTop: 16, shadowColor: C.accent, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  submitTxt:    { color: C.white, fontSize: 15, fontWeight: '800' },
});

export default ProductsScreen;
