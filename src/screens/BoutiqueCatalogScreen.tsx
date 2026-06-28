import React, { useState, useRef, useEffect } from 'react';
import { ScreenHeader } from '../components/ScreenHeader';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  TextInput, Modal, Image, Dimensions, Animated, Easing
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle } from 'react-native-svg';

const C = {
  navy: '#FF6B35', navyMid: '#FF8A5C',
  bg: '#FFF7F3', surface: '#FFFFFF', border: '#E2E8F0',
  accent: '#FF6B35', accentSoft: 'rgba(255,107,53,0.1)',
  textDark: '#0F172A', textMid: '#475569', textLight: '#64748B', muted: '#94A3B8',
  success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6', purple: '#8B5CF6',
  white: '#FFFFFF',
};

type RootStackParamList = {
  BoutiqueCatalog: { boutique: any };
  QuartierScreen: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList, 'BoutiqueCatalog'>;

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  stock: number;
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'iPhone 15 Pro',
    price: 999,
    image: '📱',
    description: 'Le dernier iPhone avec puce A17 Pro et design titane.',
    category: 'Smartphones',
    stock: 15,
  },
  {
    id: 'p2',
    name: 'MacBook Air M3',
    price: 1299,
    image: '💻',
    description: 'Ultra-portable avec puce M3 et écran Liquid Retina.',
    category: 'Ordinateurs',
    stock: 8,
  },
  {
    id: 'p3',
    name: 'AirPods Pro 2',
    price: 249,
    image: '🎧',
    description: 'Écouteurs avec suppression active du bruit.',
    category: 'Audio',
    stock: 25,
  },
  {
    id: 'p4',
    name: 'Apple Watch Ultra',
    price: 799,
    image: '⌚',
    description: 'Montre connectée robuste pour les sportifs.',
    category: 'Montres',
    stock: 12,
  },
  {
    id: 'p5',
    name: 'iPad Pro 12.9"',
    price: 1099,
    image: '📲',
    description: 'Tablette avec écran XDR et puce M2.',
    category: 'Tablettes',
    stock: 6,
  },
];

// ─── Animated Card Component ───────────────────────────────────────────────────
const AnimatedCard: React.FC<{ children: React.ReactNode; delay?: number; style?: any }> = ({ children, delay = 0, style }) => {
  const animY = useRef(new Animated.Value(20)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animY, {
        toValue: 0,
        duration: 600,
        delay,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(animOpacity, {
        toValue: 1,
        duration: 500,
        delay,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity: animOpacity, transform: [{ translateY: animY }] }]}>
      {children}
    </Animated.View>
  );
};

const BoutiqueCatalogScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ text: string; isMe: boolean }[]>([
    { text: 'Bonjour ! Comment puis-je vous aider ?', isMe: false },
  ]);

  const categories = ['Tous', 'Smartphones', 'Ordinateurs', 'Audio', 'Montres', 'Tablettes'];

  const filteredProducts = MOCK_PRODUCTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { text: message, isMe: true }]);
      setMessage('');
      // Simulate seller response
      setTimeout(() => {
        setMessages(prev => [...prev, { text: 'Merci pour votre message ! Je vous répondrai rapidement.', isMe: false }]);
      }, 1000);
    }
  };

  return (
    <View style={s.root}>
        <ScreenHeader title="Catalogue" />
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.textDark} strokeWidth={2}>
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Tech Paradise</Text>
          <Text style={s.headerSubtitle}>📍 Lyon · Électronique</Text>
        </View>
        <TouchableOpacity style={s.chatBtn} onPress={() => setShowChat(true)}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth={2}>
            <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Boutique Info Card */}
        <AnimatedCard delay={0} style={s.boutiqueCard}>
          <View style={s.boutiqueHeader}>
            <View style={s.boutiqueAvatar}>
              <Text style={s.boutiqueAvatarText}>TP</Text>
            </View>
            <View style={s.boutiqueInfo}>
              <Text style={s.boutiqueName}>Tech Paradise</Text>
              <Text style={s.boutiqueOwner}>par Lucas M.</Text>
              <View style={s.boutiqueStats}>
                <Text style={s.boutiqueStat}>⭐ 4.6 (89 avis)</Text>
                <Text style={s.boutiqueStat}>📦 53 produits</Text>
              </View>
            </View>
          </View>
          <Text style={s.boutiqueDesc}>
            High-tech et gadgets au meilleur prix. Livraison express disponible sur toute la France.
          </Text>
        </AnimatedCard>

        {/* Search */}
        <AnimatedCard delay={50} style={s.searchBar}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2}>
            <Circle cx={11} cy={11} r={8}/><Path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
          </Svg>
          <TextInput
            style={s.searchInput}
            placeholder="Rechercher un produit..."
            placeholderTextColor={C.muted}
            value={search}
            onChangeText={setSearch}
          />
        </AnimatedCard>

        {/* Categories */}
        <AnimatedCard delay={100} style={s.categoryRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[s.categoryChip, selectedCategory === cat && s.categoryChipActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[s.categoryText, selectedCategory === cat && s.categoryTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </AnimatedCard>

        {/* Products Grid */}
        <AnimatedCard delay={150} style={s.productsGrid}>
          {filteredProducts.map(product => (
            <TouchableOpacity key={product.id} style={s.productCard}>
              <View style={s.productImage}>
                <Text style={s.productEmoji}>{product.image}</Text>
              </View>
              <Text style={s.productName}>{product.name}</Text>
              <Text style={s.productCategory}>{product.category}</Text>
              <View style={s.productPriceRow}>
                <Text style={s.productPrice}>€{product.price}</Text>
                <Text style={s.productStock}>{product.stock} en stock</Text>
              </View>
            </TouchableOpacity>
          ))}
        </AnimatedCard>

        {filteredProducts.length === 0 && (
          <AnimatedCard delay={200} style={s.emptyState}>
            <Text style={s.emptyIcon}>🔍</Text>
            <Text style={s.emptyText}>Aucun produit trouvé</Text>
          </AnimatedCard>
        )}

      </ScrollView>

      {/* Chat Modal */}
      <Modal visible={showChat} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowChat(false)}>
        <View style={s.chatRoot}>
          <View style={s.chatHeader}>
            <TouchableOpacity onPress={() => setShowChat(false)} style={s.chatBackBtn}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.textDark} strokeWidth={2}>
                <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            </TouchableOpacity>
            <View style={s.chatHeaderCenter}>
              <Text style={s.chatHeaderTitle}>Chat avec Tech Paradise</Text>
              <Text style={s.chatHeaderSubtitle}>Lucas M. · Répond habituellement en 5min</Text>
            </View>
          </View>

          <ScrollView contentContainerStyle={s.chatMessages} showsVerticalScrollIndicator={false}>
            {messages.map((msg, i) => (
              <View key={i} style={[s.messageBubble, msg.isMe ? s.messageMe : s.messageSeller]}>
                <Text style={[s.messageText, msg.isMe ? s.messageTextMe : s.messageTextSeller]}>{msg.text}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={s.chatInputRow}>
            <TextInput
              style={s.chatInput}
              placeholder="Écrivez votre message..."
              placeholderTextColor={C.muted}
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <TouchableOpacity style={s.chatSendBtn} onPress={sendMessage}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth={2}>
                <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { width: 36, height: 36, borderRadius: 9, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: C.textDark },
  headerSubtitle: { fontSize: 12, color: C.textLight },
  chatBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  
  content: { padding: 20, gap: 16, paddingBottom: 24 },
  
  boutiqueCard: { backgroundColor: C.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: C.border },
  boutiqueHeader: { flexDirection: 'row', gap: 14, marginBottom: 12 },
  boutiqueAvatar: { width: 56, height: 56, borderRadius: 12, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  boutiqueAvatarText: { color: C.white, fontSize: 20, fontWeight: '800' },
  boutiqueInfo: { flex: 1 },
  boutiqueName: { fontSize: 18, fontWeight: '800', color: C.textDark },
  boutiqueOwner: { fontSize: 13, color: C.textLight, marginTop: 2 },
  boutiqueStats: { flexDirection: 'row', gap: 12, marginTop: 6 },
  boutiqueStat: { fontSize: 12, color: C.textMid },
  boutiqueDesc: { fontSize: 14, color: C.textMid, lineHeight: 20 },
  
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 14, height: 48, borderWidth: 1, borderColor: C.border },
  searchInput: { flex: 1, fontSize: 15, color: C.textDark },
  
  categoryRow: { gap: 8, paddingBottom: 4 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface },
  categoryChipActive: { backgroundColor: C.accent, borderColor: C.accent },
  categoryText: { fontSize: 13, color: C.textMid, fontWeight: '500' },
  categoryTextActive: { color: C.white, fontWeight: '600' },
  
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  productCard: { width: (Dimensions.get('window').width - 52) / 2, backgroundColor: C.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: C.border },
  productImage: { width: '100%', height: 100, backgroundColor: C.bg, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  productEmoji: { fontSize: 40 },
  productName: { fontSize: 14, fontWeight: '700', color: C.textDark, marginBottom: 4 },
  productCategory: { fontSize: 12, color: C.textLight, marginBottom: 8 },
  productPriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { fontSize: 16, fontWeight: '800', color: C.accent },
  productStock: { fontSize: 11, color: C.success, fontWeight: '500' },
  
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, color: C.textMid, fontWeight: '500' },
  
  // Chat
  chatRoot: { flex: 1, backgroundColor: C.bg },
  chatHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border },
  chatBackBtn: { width: 36, height: 36, borderRadius: 9, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  chatHeaderCenter: { flex: 1 },
  chatHeaderTitle: { fontSize: 16, fontWeight: '800', color: C.textDark },
  chatHeaderSubtitle: { fontSize: 12, color: C.textLight },
  
  chatMessages: { padding: 20, gap: 12, paddingBottom: 24 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
  messageMe: { backgroundColor: C.accent, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  messageSeller: { backgroundColor: C.surface, alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 14, lineHeight: 18 },
  messageTextMe: { color: C.white },
  messageTextSeller: { color: C.textDark },
  
  chatInputRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingBottom: 24, paddingTop: 12, backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.border },
  chatInput: { flex: 1, backgroundColor: C.bg, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: C.textDark, maxHeight: 100 },
  chatSendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
});

export default BoutiqueCatalogScreen;
