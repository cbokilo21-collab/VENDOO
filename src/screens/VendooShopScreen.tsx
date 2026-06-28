import React, { useState } from 'react';
import { ScreenHeader } from '../components/ScreenHeader';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  Dimensions, Alert, Modal, TextInput
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

const C = {
  navy: '#FF6B35', navyMid: '#FF8A5C',
  bg: '#FFF7F3', surface: '#FFFFFF', border: '#E2E8F0',
  accent: '#FF6B35', accentSoft: 'rgba(255,107,53,0.1)',
  textDark: '#0F172A', textMid: '#475569', textLight: '#64748B', muted: '#94A3B8',
  success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6', purple: '#8B5CF6',
  white: '#FFFFFF',
};

type RootStackParamList = {
  VendooShop: undefined; BusinessDashboard: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList>;

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: 'facade' | 'decoration' | 'upgrade' | 'premium';
  emoji: string;
  color: string;
  popular?: boolean;
  new?: boolean;
}

const SHOP_ITEMS: ShopItem[] = [];

const CATEGORIES = [
  { id: 'all', label: 'Tout', color: C.textMid },
  { id: 'facade', label: 'Façades', color: C.purple },
  { id: 'decoration', label: 'Décorations', color: C.warning },
  { id: 'upgrade', label: 'Upgrades', color: C.info },
  { id: 'premium', label: 'Premium', color: C.accent },
];

const VendooShopScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ text: string; isMe: boolean; sender?: string }[]>([
    { text: 'Bienvenue sur Vendoo Shop ! Comment puis-je vous aider ?', isMe: false, sender: 'Assistant Vendoo' },
  ]);

  const filteredItems = selectedCategory === 'all'
    ? SHOP_ITEMS
    : SHOP_ITEMS.filter(item => item.category === selectedCategory);

  const handlePurchase = (item: ShopItem) => {
    Alert.alert(
      'Confirmer l\'achat',
      `Voulez-vous acheter ${item.name} pour ${item.currency} ${item.price.toFixed(2)} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Acheter',
          onPress: () => {
            setOwnedItems(prev => [...prev, item.id]);
            Alert.alert('Succès', `${item.name} a été ajouté à votre boutique !`);
            setSelectedItem(null);
          },
        },
      ]
    );
  };

  const isOwned = (itemId: string) => ownedItems.includes(itemId);

  const sendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { text: message, isMe: true }]);
      setMessage('');
      
      setTimeout(() => {
        const responses = [
          'Je peux vous aider à trouver la meilleure façade pour votre boutique !',
          'Nos décorations sont très populaires. Voulez-vous voir les nouveautés ?',
          'Les upgrades premium peuvent augmenter vos ventes de 30% !',
          'N\'hésitez pas à me poser des questions sur nos produits.',
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        setMessages(prev => [...prev, { text: randomResponse, isMe: false, sender: 'Assistant Vendoo' }]);
      }, 1000);
    }
  };

  return (
    <View style={s.root}>
        <ScreenHeader title="Vendoo Shop" />
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.textDark} strokeWidth={2}>
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>🛍️ Vendoo Shop</Text>
          <Text style={s.headerSubtitle}>Personnalisez votre boutique</Text>
        </View>
        <View style={s.balanceBadge}>
          <Text style={s.balanceText}>€ 0.00</Text>
        </View>
        <TouchableOpacity style={s.chatBtn} onPress={() => setShowChat(true)}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth={2}>
            <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll} contentContainerStyle={s.catRow}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[s.catChip, selectedCategory === cat.id && s.catChipActive]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text style={[s.catText, selectedCategory === cat.id && s.catTextActive]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Advertising Banner */}
      <View style={s.adBanner}>
        <View style={s.adContent}>
          <View style={s.adLeft}>
            <Text style={s.adTag}>PUBLICITÉ</Text>
            <Text style={s.adTitle}>Boostez vos ventes avec Premium</Text>
            <Text style={s.adDesc}>+30% de visibilité dès maintenant</Text>
          </View>
          <TouchableOpacity style={s.adBtn}>
            <Text style={s.adBtnText}>Découvrir</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Items Grid */}
      <ScrollView contentContainerStyle={s.itemsGrid} showsVerticalScrollIndicator={false}>
        {filteredItems.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[s.itemCard, isOwned(item.id) && s.itemCardOwned]}
            onPress={() => setSelectedItem(item)}
            activeOpacity={0.75}
          >
            {item.popular && <View style={s.popularBadge}><Text style={s.popularText}>Populaire</Text></View>}
            {item.new && <View style={[s.popularBadge, s.newBadge]}><Text style={s.popularText}>Nouveau</Text></View>}
            {isOwned(item.id) && <View style={[s.popularBadge, s.ownedBadge]}><Text style={s.popularText}>Possédé</Text></View>}
            
            <View style={[s.itemIcon, { backgroundColor: item.color + '20' }]}>
              <Text style={s.itemEmoji}>{item.emoji}</Text>
            </View>
            
            <Text style={s.itemName}>{item.name}</Text>
            <Text style={s.itemDesc} numberOfLines={2}>{item.description}</Text>
            
            <View style={s.itemFooter}>
              <Text style={s.itemPrice}>{item.currency} {item.price.toFixed(2)}</Text>
              {isOwned(item.id) ? (
                <View style={s.ownedBtn}>
                  <Text style={s.ownedBtnText}>✓ Possédé</Text>
                </View>
              ) : (
                <View style={[s.buyBtn, { backgroundColor: item.color }]}>
                  <Text style={s.buyBtnText}>Acheter</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Item Detail Modal */}
      <Modal visible={!!selectedItem} transparent animationType="slide" onRequestClose={() => setSelectedItem(null)}>
        {selectedItem && (
          <View style={s.modalOverlay}>
            <TouchableOpacity style={s.modalBackdrop} activeOpacity={1} onPress={() => setSelectedItem(null)} />
            <View style={s.modalContent}>
              <View style={[s.modalIcon, { backgroundColor: selectedItem.color + '20' }]}>
                <Text style={s.modalEmoji}>{selectedItem.emoji}</Text>
              </View>
              
              <Text style={s.modalTitle}>{selectedItem.name}</Text>
              <Text style={s.modalDesc}>{selectedItem.description}</Text>
              
              <View style={s.modalPriceRow}>
                <Text style={s.modalPrice}>{selectedItem.currency} {selectedItem.price.toFixed(2)}</Text>
                {isOwned(selectedItem.id) && <Text style={s.modalOwned}>Déjà possédé</Text>}
              </View>
              
              <View style={s.modalFeatures}>
                <Text style={s.modalFeatureTitle}>Caractéristiques :</Text>
                <Text style={s.modalFeature}>• Installation instantanée</Text>
                <Text style={s.modalFeature}>• Compatible avec votre boutique</Text>
                <Text style={s.modalFeature}>• Support inclus</Text>
              </View>
              
              <TouchableOpacity
                style={[s.modalBuyBtn, isOwned(selectedItem.id) && s.modalBuyBtnOwned]}
                onPress={() => handlePurchase(selectedItem)}
                disabled={isOwned(selectedItem.id)}
              >
                <Text style={s.modalBuyBtnText}>
                  {isOwned(selectedItem.id) ? 'Déjà possédé' : `Acheter pour ${selectedItem.currency} ${selectedItem.price.toFixed(2)}`}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={s.modalCloseBtn} onPress={() => setSelectedItem(null)}>
                <Text style={s.modalCloseBtnText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>

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
              <Text style={s.chatHeaderTitle}>Assistant Vendoo</Text>
              <Text style={s.chatHeaderSubtitle}>Votre assistant shopping 24/7</Text>
            </View>
          </View>

          <ScrollView contentContainerStyle={s.chatMessages} showsVerticalScrollIndicator={false}>
            {/* Advertising in chat */}
            <View style={s.chatAdBanner}>
              <Text style={s.chatAdTag}>SPONSORISÉ</Text>
              <Text style={s.chatAdTitle}>Offre spéciale : -20% sur les façades</Text>
              <TouchableOpacity style={s.chatAdBtn}>
                <Text style={s.chatAdBtnText}>Voir l'offre</Text>
              </TouchableOpacity>
            </View>

            {messages.map((msg, i) => (
              <View key={i} style={[s.messageBubble, msg.isMe ? s.messageMe : s.messageSeller]}>
                {!msg.isMe && msg.sender && <Text style={s.messageSender}>{msg.sender}</Text>}
                <Text style={[s.messageText, msg.isMe ? s.messageTextMe : s.messageTextSeller]}>{msg.text}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={s.chatInputRow}>
            <TextInput
              style={s.chatInput}
              placeholder="Posez une question sur les produits..."
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
  
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { width: 36, height: 36, borderRadius: 9, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: C.textDark },
  headerSubtitle: { fontSize: 12, color: C.textLight },
  balanceBadge: { backgroundColor: C.success + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  balanceText: { fontSize: 13, fontWeight: '700', color: C.success },
  chatBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  
  catScroll: { flexGrow: 0, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border },
  catRow: { gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  catChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 22, backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border },
  catChipActive: { backgroundColor: C.accent, borderColor: C.accent },
  catText: { fontSize: 13, color: C.textMid, fontWeight: '500' },
  catTextActive: { color: C.white, fontWeight: '700' },
  
  itemsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 12, paddingBottom: 24 },
  itemCard: {
    width: '47%', backgroundColor: C.white, borderRadius: 16, padding: 14,
    borderWidth: 2, borderColor: 'transparent',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
    position: 'relative',
  },
  itemCardOwned: { borderColor: C.success, backgroundColor: '#F0FDF4' },
  popularBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: C.accent, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  newBadge: { backgroundColor: C.success },
  ownedBadge: { backgroundColor: C.success },
  popularText: { fontSize: 10, fontWeight: '700', color: C.white },
  itemIcon: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  itemEmoji: { fontSize: 28 },
  itemName: { fontSize: 14, fontWeight: '700', color: C.textDark, marginBottom: 4 },
  itemDesc: { fontSize: 11, color: C.textLight, marginBottom: 10, lineHeight: 15 },
  itemFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemPrice: { fontSize: 15, fontWeight: '800', color: C.textDark },
  buyBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  buyBtnText: { fontSize: 12, fontWeight: '700', color: C.white },
  ownedBtn: { backgroundColor: C.success, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  ownedBtnText: { fontSize: 12, fontWeight: '700', color: C.white },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBackdrop: { flex: 1 },
  modalContent: { backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 16 },
  modalIcon: { width: 70, height: 70, borderRadius: 20, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  modalEmoji: { fontSize: 40 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: C.textDark, textAlign: 'center' },
  modalDesc: { fontSize: 14, color: C.textMid, textAlign: 'center', lineHeight: 20 },
  modalPriceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  modalPrice: { fontSize: 28, fontWeight: '900', color: C.accent },
  modalOwned: { fontSize: 14, fontWeight: '700', color: C.success },
  modalFeatures: { backgroundColor: C.bg, borderRadius: 12, padding: 16, gap: 8 },
  modalFeatureTitle: { fontSize: 13, fontWeight: '700', color: C.textDark },
  modalFeature: { fontSize: 13, color: C.textMid },
  modalBuyBtn: { backgroundColor: C.accent, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  modalBuyBtnOwned: { backgroundColor: C.success, opacity: 0.6 },
  modalBuyBtnText: { fontSize: 16, fontWeight: '800', color: C.white },
  modalCloseBtn: { alignItems: 'center', paddingVertical: 12 },
  modalCloseBtnText: { fontSize: 14, fontWeight: '600', color: C.textMid },

  // Chat modal styles
  chatRoot: { flex: 1, backgroundColor: C.bg },
  chatHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border },
  chatBackBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  chatHeaderCenter: { flex: 1, marginLeft: 12 },
  chatHeaderTitle: { fontSize: 18, fontWeight: '800', color: C.textDark },
  chatHeaderSubtitle: { fontSize: 12, color: C.textLight },
  chatMessages: { padding: 20, gap: 12, paddingBottom: 100 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 8 },
  messageMe: { backgroundColor: C.accent, alignSelf: 'flex-end' },
  messageSeller: { backgroundColor: C.white, alignSelf: 'flex-start', borderWidth: 1, borderColor: C.border },
  messageSender: { fontSize: 11, fontWeight: '700', color: C.textLight, marginBottom: 4 },
  messageText: { fontSize: 14, lineHeight: 20 },
  messageTextMe: { color: C.white },
  messageTextSeller: { color: C.textDark },
  chatInputRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.border, gap: 12 },
  chatInput: { flex: 1, backgroundColor: C.bg, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, maxHeight: 100 },
  chatSendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },

  // Advertising banner styles
  adBanner: { backgroundColor: C.accent, marginHorizontal: 16, marginTop: 16, borderRadius: 16, overflow: 'hidden' },
  adContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  adLeft: { flex: 1 },
  adTag: { fontSize: 10, fontWeight: '700', color: C.accent, letterSpacing: 1, marginBottom: 4 },
  adTitle: { fontSize: 16, fontWeight: '800', color: C.white, marginBottom: 2 },
  adDesc: { fontSize: 12, color: '#94A3B8' },
  adBtn: { backgroundColor: C.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  adBtnText: { fontSize: 13, fontWeight: '700', color: C.white },

  // Chat advertising styles
  chatAdBanner: { backgroundColor: C.accent + '10', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  chatAdTag: { fontSize: 10, fontWeight: '700', color: C.accent, letterSpacing: 1, marginBottom: 4 },
  chatAdTitle: { fontSize: 14, fontWeight: '700', color: C.textDark, marginBottom: 8 },
  chatAdBtn: { backgroundColor: C.accent, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, alignSelf: 'flex-start' },
  chatAdBtnText: { fontSize: 12, fontWeight: '700', color: C.white },
});

export default VendooShopScreen;
