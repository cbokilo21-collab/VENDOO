import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  TextInput, Dimensions, Animated, Easing, Platform, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle } from 'react-native-svg';
import { useBoutique } from '../contexts/BoutiqueContext';
import { useAuth } from '../contexts/AuthContext';
import { OrderService } from '../services/orderService';
import { CustomerService } from '../services/customerService';
import { FirestoreService } from '../services/firestoreService';
import { where } from 'firebase/firestore';

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:          '#FFF7F3',
  surface:     '#FFFFFF',
  border:      '#FFE0D0',
  accent:      '#FF6B35',
  accentSoft:  'rgba(255,107,53,0.10)',
  accentDark:  '#EA4C10',
  orangeLight: '#FF9A70',
  textDark:    '#111827',
  textMid:     '#374151',
  textLight:   '#6B7280',
  muted:       '#9CA3AF',
  success:     '#10B981',
  successSoft: '#D1FAE5',
  warning:     '#F59E0B',
  error:       '#EF4444',
  white:       '#FFFFFF',
  purple:      '#8B5CF6',
  purpleSoft:  'rgba(139,92,246,0.10)',
};

type RootStackParamList = { 
  POSScreen: undefined; 
  BusinessDashboard: undefined; 
  Invoice: { saleId: string; saleData?: any };
};
type Nav = NativeStackNavigationProp<RootStackParamList>;
type PayMethod = 'card' | 'cash' | 'mobile';
type TabKey = 'caisse' | 'articles' | 'ventes' | 'stats' | 'ia';

interface Product { id: string; nom: string; prix: number; categorie?: string; stock?: number; }
interface CartItem { product: Product; qty: number; }
interface RecentSale { id: string; total: number; items: number; method: PayMethod; time: string; }
interface AIMessage { role: 'user' | 'ai'; text: string; ts: string; }

// CFA denominations
const DENOMS = [500, 1000, 2000, 5000, 10000, 25000];

// AI suggestions
const AI_SUGGESTIONS = [
  "Quels articles sont les plus vendus ?",
  "Résume mes ventes d'aujourd'hui",
  "Produits à stock faible ?",
  "Conseil pour augmenter les ventes",
  "Quel est mon meilleur jour de vente ?",
];

// AI response generator
const generateAIResponse = (question: string, sales: RecentSale[], cart: CartItem[], products: Product[]): string => {
  const q = question.toLowerCase();
  const totalSales = sales.reduce((t, s) => t + s.total, 0);
  const totalItems = sales.reduce((t, s) => t + s.items, 0);

  if (q.includes('stock faible') || q.includes('stock')) {
    const lowStock = products.filter(p => (p.stock || 0) < 15);
    if (lowStock.length === 0) return "✅ Tous vos produits ont un stock suffisant !";
    return `⚠️ ${lowStock.length} produit(s) à stock faible :\n${lowStock.map(p => `• ${p.nom} → ${p.stock || 0} unités`).join('\n')}\n\nJe vous recommande de réapprovisionner ces articles rapidement.`;
  }
  if (q.includes('vendus') || q.includes('populaire') || q.includes('plus vendu')) {
    if (products.length === 0) return "📊 Aucun produit dans votre catalogue.";
    return `📊 D'après votre catalogue, vous avez ${products.length} produits disponibles.\n\nAjoutez des ventes pour voir les articles les plus populaires.`;
  }
  if (q.includes('aujourd') || q.includes('vente') || q.includes('résume')) {
    if (sales.length === 0) return "📋 Pas encore de ventes enregistrées aujourd'hui. Commencez à encaisser pour voir vos statistiques ici !";
    return `📈 Résumé du jour :\n\n• ${sales.length} transaction(s) réalisée(s)\n• ${totalItems} articles vendus\n• Total encaissé : ${totalSales.toLocaleString('fr-FR')} F\n• Panier moyen : ${Math.round(totalSales / sales.length).toLocaleString('fr-FR')} F\n\nBonne journée ! 💪`;
  }
  if (q.includes('conseil') || q.includes('augmenter') || q.includes('améliorer')) {
    return `💡 Conseils pour booster vos ventes :\n\n1. **Offres groupées** – créez des promotions sur les produits populaires\n2. **Mise en avant** – placez vos produits vedettes près de la caisse\n3. **Heures de pointe** – maximisez le stock pendant les heures de rush\n4. **Fidélité** – un client fidèle dépense 3x plus\n5. **Promotions hebdo** – changez l'article en promotion chaque semaine`;
  }
  if (q.includes('panier') || q.includes('encours') || q.includes('actuel')) {
    if (cart.length === 0) return "🛒 Votre panier est vide. Ajoutez des produits pour que je puisse analyser la commande.";
    const cartTotal = cart.reduce((t, i) => t + i.product.prix * i.qty, 0);
    return `🛒 Panier en cours :\n\n${cart.map(i => `• ${i.product.nom} × ${i.qty} = ${(i.product.prix * i.qty).toLocaleString('fr-FR')} F`).join('\n')}\n\n**Total : ${cartTotal.toLocaleString('fr-FR')} F**`;
  }
  if (q.includes('meilleur jour')) {
    return `📅 Analysez vos ventes pour identifier vos meilleurs jours.\n\n💡 Conseil : faites vos approvisionnements avant vos jours de forte activité !`;
  }
  return `🤖 Je suis votre assistant caisse IA.\n\nJe peux vous aider avec :\n• L'analyse de vos ventes\n• Les alertes de stock\n• Des conseils de gestion\n• L'analyse de votre panier en cours\n\nPosez-moi une question !`;
};

// ── SVG Icons ────────────────────────────────────────────────────────────────
const BagIcon = ({ size = 28, color = C.accent }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M3 6h18" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M16 10a4 4 0 01-8 0" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const CartIconSvg = ({ size = 24, color = C.accent }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx={9} cy={21} r={1} fill={color}/>
    <Circle cx={20} cy={21} r={1} fill={color}/>
  </Svg>
);

const TABS: { key: TabKey; label: string; emoji: string }[] = [
  { key: 'caisse',   label: 'Caisse',   emoji: '🏪' },
  { key: 'articles', label: 'Articles', emoji: '📦' },
  { key: 'ventes',   label: 'Ventes',   emoji: '📈' },
  { key: 'stats',    label: 'Stats',    emoji: '📊' },
  { key: 'ia',       label: 'IA',       emoji: '🤖' },
];

// ── Component ─────────────────────────────────────────────────────────────────
const POSScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { boutiqueData } = useBoutique();
  const { user } = useAuth();
  const isDesktop = Dimensions.get('window').width >= 768;

  // Core state
  const [activeTab, setActiveTab]     = useState<TabKey>('caisse');
  const [cat, setCat]                 = useState('Tous');
  const [cart, setCart]               = useState<CartItem[]>([]);
  const [pay, setPay]                 = useState<PayMethod>('cash');
  const [discount, setDiscount]       = useState('0');
  const [search, setSearch]           = useState('');
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [products, setProducts]       = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Load products from Firestore
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const boutiqueId = boutiqueData.id || user?.uid;
        if (boutiqueId) {
          const fetchedProducts = await FirestoreService.query<any>('products', [
            where('boutique_id', '==', boutiqueId)
          ]);
          const mappedProducts = fetchedProducts.map((p: any) => ({
            id: p.id,
            nom: p.nom || 'Produit',
            prix: p.prix || 0,
            categorie: p.categorie || 'Autre',
            stock: p.stock || 0,
          }));
          setProducts(mappedProducts);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, [boutiqueData.id, user?.uid]);

  // Payment modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [montantRecu, setMontantRecu]   = useState('');
  const [paid, setPaid]                 = useState(false);
  const successAnim = useRef(new Animated.Value(0)).current;

  // AI state
  const [aiMessages, setAiMessages]   = useState<AIMessage[]>([
    { role: 'ai', text: "👋 Bonjour ! Je suis votre assistant caisse IA. Je peux analyser vos ventes, vérifier le stock, et vous donner des conseils en temps réel. Comment puis-je vous aider ?", ts: 'maintenant' }
  ]);
  const [aiInput, setAiInput]         = useState('');
  const [aiThinking, setAiThinking]   = useState(false);
  const aiScrollRef = useRef<ScrollView>(null);

  // Computed
  const subtotal    = cart.reduce((t, i) => t + i.product.prix * i.qty, 0);
  const discountAmt = subtotal * (parseFloat(discount) / 100 || 0);
  const total       = subtotal - discountAmt;
  const totalItems  = cart.reduce((t, i) => t + i.qty, 0);
  const recuNum     = parseInt(montantRecu) || 0;
  const monnaie     = recuNum - total;

  const formatPrice = (n: number) => `${Math.round(n).toLocaleString('fr-FR')} F`;
  const now = () => new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  // Cart actions
  const addToCart = (p: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === p.id);
      if (ex) return prev.map(i => i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product: p, qty: 1 }];
    });
  };

  const changeQty = (id: string, delta: number) => {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === id);
      if (!ex) return prev;
      if (ex.qty + delta <= 0) return prev.filter(i => i.product.id !== id);
      return prev.map(i => i.product.id === id ? { ...i, qty: i.qty + delta } : i);
    });
  };

  // Numpad
  const numpadPress = (key: string) => {
    if (key === 'C') { setMontantRecu(''); return; }
    if (key === '⌫') { setMontantRecu(prev => prev.slice(0, -1)); return; }
    setMontantRecu(prev => {
      const next = prev + key;
      return parseInt(next) > 9999999 ? prev : next;
    });
  };

  const addDenom = (d: number) => {
    setMontantRecu(prev => {
      const current = parseInt(prev) || 0;
      return String(current + d);
    });
  };

  // Persist the sale as a paid order in Firestore (best-effort, non-blocking).
  const persistOrder = async () => {
    if (!user) return; // anonymous/offline: keep local-only behaviour
    try {
      const id = await OrderService.create(user.uid, {
        client: 'Client comptoir',
        email: boutiqueData.email || '',
        boutiqueId: boutiqueData.id || user.uid, // Use boutiqueId if available, otherwise userId
        items: cart.map(item => ({
          productId: item.product.id,
          nom: item.product.nom,
          prix: item.product.prix,
          quantity: item.qty,
        })),
        subtotal,
        discount: discountAmt,
        total,
        paymentMethod: pay,
      } as any);
      // A POS sale is settled on the spot.
      await OrderService.updateStatus(id, 'paid');
    } catch (e) {
      console.warn('POS order persistence failed:', e);
    }
  };

  // Confirm payment
  const confirmPay = () => {
    if (pay === 'cash' && monnaie < 0) return;

    // Persist to Firestore in the background — UX continues regardless.
    persistOrder();

    // Prepare sale data for invoice
    const saleData = {
      items: cart.map(item => ({
        nom: item.product.nom,
        prix: item.product.prix,
        qty: item.qty,
        total: item.product.prix * item.qty,
      })),
      subtotal,
      discount: discountAmt,
      total,
      method: pay === 'cash' ? 'Espèces' : pay === 'card' ? 'Carte' : 'Mobile',
    };

    const newSale: RecentSale = {
      id: Date.now().toString(), total, items: totalItems, method: pay,
      time: now(),
    };
    setRecentSales(prev => [newSale, ...prev].slice(0, 10));
    setShowPayModal(false);
    setPaid(true);
    Animated.sequence([
      Animated.timing(successAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.back(2)), useNativeDriver: false }),
      Animated.delay(2200),
      Animated.timing(successAnim, { toValue: 0, duration: 200, useNativeDriver: false }),
    ]).start();
    
    // Navigate to invoice after success animation
    setTimeout(() => {
      navigation.navigate('Invoice', { 
        saleId: newSale.id, 
        saleData 
      });
      setCart([]); setDiscount('0'); setMontantRecu(''); setPaid(false);
    }, 2700);
  };

  // Open payment modal
  const openPayModal = () => {
    if (cart.length === 0) return;
    setMontantRecu('');
    setShowPayModal(true);
  };

  // AI send
  const sendAI = useCallback((text: string) => {
    if (!text.trim()) return;
    const userMsg: AIMessage = { role: 'user', text: text.trim(), ts: now() };
    setAiMessages(prev => [...prev, userMsg]);
    setAiInput('');
    setAiThinking(true);
    setTimeout(() => {
      const response = generateAIResponse(text, recentSales, cart, products);
      setAiMessages(prev => [...prev, { role: 'ai', text: response, ts: now() }]);
      setAiThinking(false);
      setTimeout(() => aiScrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 900 + Math.random() * 600);
  }, [recentSales, cart, products]);

  const categories = ['Tous', ...Array.from(new Set(products.map(p => p.categorie || 'Autre')))];
  
  const filtered = products.filter(p =>
    (cat === 'Tous' || p.categorie === cat) &&
    p.nom.toLowerCase().includes(search.toLowerCase())
  );

  const payMethods: { key: PayMethod; label: string; icon: string }[] = [
    { key: 'cash',   label: 'Espèces', icon: '💵' },
    { key: 'card',   label: 'Carte',   icon: '💳' },
    { key: 'mobile', label: 'Mobile',  icon: '📲' },
  ];

  // ── Payment Modal ─────────────────────────────────────────────────────────
  const paymentModal = (
    <Modal visible={showPayModal} transparent animationType="slide" onRequestClose={() => setShowPayModal(false)}>
      <View style={s.modalOverlay}>
        <View style={s.modalSheet}>
          {/* Header */}
          <View style={s.modalHeader}>
            <View>
              <Text style={s.modalTitle}>Encaisser</Text>
              <Text style={s.modalSub}>{totalItems} article{totalItems > 1 ? 's' : ''}</Text>
            </View>
            <TouchableOpacity style={s.modalClose} onPress={() => setShowPayModal(false)}>
              <Text style={s.modalCloseTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Total */}
          <View style={s.modalTotalBox}>
            <Text style={s.modalTotalLabel}>TOTAL À PAYER</Text>
            <Text style={s.modalTotalAmt}>{formatPrice(total)}</Text>
          </View>

          {/* Pay method selector */}
          <View style={s.modalPayRow}>
            {payMethods.map(m => (
              <TouchableOpacity key={m.key} style={[s.modalPayChip, pay === m.key && s.modalPayChipActive]} onPress={() => setPay(m.key)}>
                <Text style={s.modalPayIcon}>{m.icon}</Text>
                <Text style={[s.modalPayLabel, pay === m.key && s.modalPayLabelActive]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {pay === 'cash' && (
            <>
              {/* Montant reçu display */}
              <View style={s.recuDisplay}>
                <Text style={s.recuLabel}>Montant reçu</Text>
                <Text style={s.recuValue}>{montantRecu ? formatPrice(parseInt(montantRecu)) : '— F'}</Text>
              </View>

              {/* Monnaie */}
              <View style={[s.monnaieBox, monnaie >= 0 ? s.monnaieBonBox : s.monnaieErrBox]}>
                <Text style={s.monnaieLabel}>Monnaie à rendre</Text>
                <Text style={[s.monnaieVal, monnaie >= 0 ? s.monnaieBon : s.monnaieErr]}>
                  {recuNum > 0 ? (monnaie >= 0 ? `+ ${formatPrice(monnaie)}` : `− ${formatPrice(-monnaie)} manquant`) : '—'}
                </Text>
              </View>

              {/* Quick denoms */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.denomScroll} contentContainerStyle={s.denomRow}>
                {DENOMS.map(d => (
                  <TouchableOpacity key={d} style={s.denomChip} onPress={() => addDenom(d)}>
                    <Text style={s.denomText}>+{d >= 1000 ? `${d/1000}k` : d}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={[s.denomChip, s.denomExact]} onPress={() => setMontantRecu(String(Math.ceil(total / 500) * 500))}>
                  <Text style={[s.denomText, { color: C.accent }]}>Exact</Text>
                </TouchableOpacity>
              </ScrollView>

              {/* Numpad */}
              <View style={s.numpad}>
                {[['1','2','3'],['4','5','6'],['7','8','9'],['C','0','⌫']].map((row, ri) => (
                  <View key={ri} style={s.numpadRow}>
                    {row.map(k => (
                      <TouchableOpacity
                        key={k}
                        style={[s.numKey, k === 'C' && s.numKeyClear, k === '⌫' && s.numKeyBack]}
                        onPress={() => numpadPress(k)}
                        activeOpacity={0.7}
                      >
                        <Text style={[s.numKeyTxt, k === 'C' && s.numKeyClearTxt, k === '⌫' && s.numKeyBackTxt]}>{k}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </View>
            </>
          )}

          {(pay === 'card' || pay === 'mobile') && (
            <View style={s.cardPayInfo}>
              <Text style={s.cardPayIcon}>{pay === 'card' ? '💳' : '📲'}</Text>
              <Text style={s.cardPayText}>
                {pay === 'card' ? 'Faites passer la carte du client sur le terminal.' : 'Le client scanne le QR code ou transfert le montant.'}
              </Text>
              <Text style={s.cardPayAmt}>{formatPrice(total)}</Text>
            </View>
          )}

          {/* Confirm */}
          <TouchableOpacity
            style={[s.confirmBtn, (pay === 'cash' && (recuNum === 0 || monnaie < 0)) && s.btnDisabled]}
            onPress={confirmPay}
            activeOpacity={0.85}
            disabled={pay === 'cash' && (recuNum === 0 || monnaie < 0)}
          >
            <Text style={s.confirmTxt}>
              {pay === 'cash'
                ? (monnaie >= 0 && recuNum > 0 ? `✓ Rendre ${formatPrice(monnaie)}` : 'Confirmer le paiement')
                : '✓ Confirmer le paiement'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // ── IA Tab content ────────────────────────────────────────────────────────
  const iaContent = (
    <View style={s.iaPanel}>
      {/* Header IA */}
      <View style={s.iaHeader}>
        <View style={s.iaBadge}><Text style={s.iaBadgeTxt}>IA</Text></View>
        <View>
          <Text style={s.iaTitle}>Assistant Caisse IA</Text>
          <Text style={s.iaSub}>Propulsé par Vendoo Intelligence</Text>
        </View>
        <View style={s.iaOnline}><Text style={s.iaOnlineTxt}>● En ligne</Text></View>
      </View>

      {/* Stats rapides */}
      <View style={s.iaStatsRow}>
        {[
          { label: 'Ventes aujourd\'hui', val: recentSales.length === 0 ? '0' : String(recentSales.length), icon: '📊' },
          { label: 'Total encaissé', val: formatPrice(recentSales.reduce((t,s)=>t+s.total,0)), icon: '💰' },
          { label: 'Articles en vente', val: String(products.length), icon: '📦' },
          { label: 'Stock faible', val: String(products.filter(p=>(p.stock||0)<15).length), icon: '⚠️' },
        ].map(stat => (
          <View key={stat.label} style={s.iaStat}>
            <Text style={s.iaStatIcon}>{stat.icon}</Text>
            <Text style={s.iaStatVal}>{stat.val}</Text>
            <Text style={s.iaStatLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Chat */}
      <ScrollView
        ref={aiScrollRef}
        style={s.iaChat}
        contentContainerStyle={s.iaChatContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => aiScrollRef.current?.scrollToEnd({ animated: true })}
      >
        {aiMessages.map((msg, i) => (
          <View key={i} style={[s.msgRow, msg.role === 'user' && s.msgRowUser]}>
            {msg.role === 'ai' && (
              <View style={s.msgAvatarAI}><Text style={s.msgAvatarTxt}>🤖</Text></View>
            )}
            <View style={[s.msgBubble, msg.role === 'user' ? s.msgBubbleUser : s.msgBubbleAI]}>
              <Text style={[s.msgText, msg.role === 'user' && s.msgTextUser]}>{msg.text}</Text>
              <Text style={s.msgTime}>{msg.ts}</Text>
            </View>
            {msg.role === 'user' && (
              <View style={s.msgAvatarUser}><Text style={s.msgAvatarTxt}>CB</Text></View>
            )}
          </View>
        ))}
        {aiThinking && (
          <View style={s.msgRow}>
            <View style={s.msgAvatarAI}><Text style={s.msgAvatarTxt}>🤖</Text></View>
            <View style={[s.msgBubble, s.msgBubbleAI, s.msgThinking]}>
              <Text style={s.thinkingDots}>• • •</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Quick suggestions */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.suggestScroll} contentContainerStyle={s.suggestRow}>
        {AI_SUGGESTIONS.map(s_ => (
          <TouchableOpacity key={s_} style={s.suggestChip} onPress={() => sendAI(s_)}>
            <Text style={s.suggestTxt}>{s_}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Input */}
      <View style={s.iaInputRow}>
        <TextInput
          style={s.iaInput}
          placeholder="Posez une question à l'IA..."
          placeholderTextColor={C.muted}
          value={aiInput}
          onChangeText={setAiInput}
          onSubmitEditing={() => sendAI(aiInput)}
          returnKeyType="send"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={[s.iaSendBtn, (!aiInput.trim() || aiThinking) && s.btnDisabled]}
          onPress={() => sendAI(aiInput)}
          disabled={!aiInput.trim() || aiThinking}
        >
          <Text style={s.iaSendTxt}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── Cart panel ─────────────────────────────────────────────────────────────
  const cartPanel = (
    <View style={[s.cartPanel, isDesktop && s.cartPanelDesktop]}>
      <View style={s.cartHeaderRow}>
        <CartIconSvg size={18} color={C.accent} />
        <Text style={s.cartTitle}>Panier {totalItems > 0 ? `(${totalItems})` : ''}</Text>
        {cart.length > 0 && (
          <TouchableOpacity onPress={() => setCart([])} style={s.cartClearBtn}>
            <Text style={s.cartClearTxt}>Vider</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={s.cartScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {cart.length === 0 ? (
          <View style={s.emptyCart}>
            <CartIconSvg size={44} color={C.muted} />
            <Text style={s.emptyCartText}>Panier vide</Text>
            <Text style={s.emptyCartSub}>Tapez sur un produit pour l'ajouter</Text>
          </View>
        ) : (
          cart.map((item, i) => (
            <View key={item.product.id} style={[s.cartItem, i < cart.length - 1 && s.cartItemBorder]}>
              <View style={s.cartItemIcon}><BagIcon size={16} color={C.accent} /></View>
              <View style={s.cartItemInfo}>
                <Text style={s.cartItemName} numberOfLines={1}>{item.product.nom}</Text>
                <Text style={s.cartItemPrice}>{formatPrice(item.product.prix)} × {item.qty} = {formatPrice(item.product.prix * item.qty)}</Text>
              </View>
              <View style={s.qtyControl}>
                <TouchableOpacity style={s.qtyBtn} onPress={() => changeQty(item.product.id, -1)}>
                  <Text style={s.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={s.qtyVal}>{item.qty}</Text>
                <TouchableOpacity style={[s.qtyBtn, s.qtyBtnPlus]} onPress={() => changeQty(item.product.id, 1)}>
                  <Text style={[s.qtyBtnText, { color: C.white }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Discount */}
      {cart.length > 0 && (
        <View style={s.discountSection}>
          <View style={s.discountRow}>
            <Text style={s.discountLabel}>Remise</Text>
            <View style={s.discountInputWrap}>
              <TextInput
                style={s.discountField}
                value={discount}
                onChangeText={v => setDiscount(v.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad" maxLength={2}
                autoCorrect={false} autoCapitalize="none"
              />
              <Text style={s.discountPct}>%</Text>
            </View>
          </View>
          {parseFloat(discount) > 0 && (
            <View style={s.totalRow}>
              <Text style={[s.totalLabel, { color: C.success }]}>– Remise</Text>
              <Text style={[s.totalVal, { color: C.success }]}>− {formatPrice(discountAmt)}</Text>
            </View>
          )}
        </View>
      )}

      {/* Total */}
      <View style={s.totalSection}>
        <Text style={s.totalBigLabel}>TOTAL</Text>
        <Text style={s.totalBigVal}>{formatPrice(total)}</Text>
      </View>

      {/* Encaisser button */}
      <View style={s.actionRow}>
        <TouchableOpacity
          style={[s.encaisserBtn, cart.length === 0 && s.btnDisabled]}
          onPress={openPayModal}
          activeOpacity={0.85}
          disabled={cart.length === 0}
        >
          <Text style={s.encaisserText}>💳  Encaisser {cart.length > 0 ? formatPrice(total) : ''}</Text>
        </TouchableOpacity>
      </View>

      {/* Recent sales */}
      {recentSales.length > 0 && (
        <View style={s.recentSection}>
          <Text style={s.recentTitle}>Ventes récentes</Text>
          {recentSales.slice(0, 3).map(sale => (
            <View key={sale.id} style={s.recentRow}>
              <Text style={s.recentIcon}>{sale.method === 'cash' ? '💵' : sale.method === 'card' ? '💳' : '📲'}</Text>
              <Text style={s.recentAmt}>{formatPrice(sale.total)}</Text>
              <Text style={s.recentInfo}>{sale.items} art. · {sale.time}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  // ── Success overlay ────────────────────────────────────────────────────────
  const successOverlay = (
    <Animated.View style={[s.successOverlay, {
      opacity: successAnim,
      transform: [{ scale: successAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }]
    }]}>
      <Text style={s.successIcon}>✓</Text>
      <Text style={s.successTitle}>Paiement accepté !</Text>
      <Text style={s.successAmount}>{formatPrice(total)}</Text>
      {pay === 'cash' && recuNum > 0 && <Text style={s.successMonnaie}>Monnaie : {formatPrice(Math.max(0, monnaie))}</Text>}
      <Text style={s.successMethod}>{pay === 'card' ? '💳 Carte' : pay === 'cash' ? '💵 Espèces' : '📲 Mobile'}</Text>
    </Animated.View>
  );

  // ── Products panel ─────────────────────────────────────────────────────────
  const productsPanel = (
    <View style={s.productsPanel}>
      {/* App header */}
      <View style={s.appHeader}>
        <View style={s.appHeaderLogo}>
          <View style={s.logoIcon}><Text style={s.logoIconText}>SP</Text></View>
          <View>
            <View style={s.headerBadgeContainer}>
              <Text style={s.logoTitle}>SwiftPos</Text>
              <View style={s.proBadge}>
                <Text style={s.proBadgeText}>PRO</Text>
              </View>
            </View>
            <Text style={s.logoSub}>Caisse intelligente</Text>
          </View>
        </View>
        <View style={s.actifBadge}><Text style={s.actifText}>● Actif</Text></View>
      </View>

      {/* Tabs */}
      <View style={s.tabBar}>
        {TABS.map(t => (
          <TouchableOpacity key={t.key} style={s.tab} onPress={() => setActiveTab(t.key)}>
            <Text style={[s.tabText, activeTab === t.key && s.tabTextActive]}>
              {t.emoji} {t.label}
            </Text>
            {activeTab === t.key && <View style={s.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* IA tab */}
      {activeTab === 'ia' && iaContent}

      {/* Ventes tab */}
      {activeTab === 'ventes' && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
          <View style={s.statsHeader}>
            <Text style={s.statsTitle}>Historique des ventes</Text>
            <Text style={s.statsSub}>{recentSales.length} vente{recentSales.length > 1 ? 's' : ''} aujourd'hui</Text>
          </View>
          {recentSales.length === 0 ? (
            <View style={s.emptyState}>
              <Text style={s.emptyIcon}>📋</Text>
              <Text style={s.emptyTitle}>Aucune vente</Text>
              <Text style={s.emptySub}>Les ventes apparaîtront ici après encaissement</Text>
            </View>
          ) : (
            recentSales.map((sale, i) => (
              <TouchableOpacity 
                key={sale.id} 
                style={[s.saleRow, i < recentSales.length - 1 && s.saleRowBorder]}
                onPress={() => navigation.navigate('Invoice', { saleId: sale.id })}
              >
                <View style={s.saleIcon}>
                  <Text style={s.saleIconText}>{sale.method === 'cash' ? '💵' : sale.method === 'card' ? '💳' : '📲'}</Text>
                </View>
                <View style={s.saleInfo}>
                  <Text style={s.saleAmount}>{formatPrice(sale.total)}</Text>
                  <Text style={s.saleDetails}>{sale.items} article{sale.items > 1 ? 's' : ''} · {sale.time}</Text>
                </View>
                <View style={[s.saleMethodBadge, { backgroundColor: sale.method === 'cash' ? C.successSoft : sale.method === 'card' ? C.purpleSoft : C.accentSoft }]}>
                  <Text style={[s.saleMethodText, { color: sale.method === 'cash' ? C.success : sale.method === 'card' ? C.purple : C.accent }]}>
                    {sale.method === 'cash' ? 'Espèces' : sale.method === 'card' ? 'Carte' : 'Mobile'}
                  </Text>
                </View>
                <View style={s.saleArrow}>
                  <Text style={s.saleArrowText}>›</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* Stats tab */}
      {activeTab === 'stats' && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
          <View style={s.statsHeader}>
            <Text style={s.statsTitle}>Statistiques du jour</Text>
            <Text style={s.statsSub}>Résumé des performances</Text>
          </View>
          
          {/* Hero KPI Card */}
          <LinearGradient 
            colors={[C.accentDark, C.accent, C.orangeLight]}
            start={{x: 0, y: 0}} end={{x: 1, y: 1}}
            style={s.heroKpiCard}
          >
            <View style={s.heroKpiTop}>
              <View>
                <Text style={s.heroKpiLabel}>Chiffre d'affaires</Text>
                <Text style={s.heroKpiValue}>{formatPrice(recentSales.reduce((t, s) => t + s.total, 0))}</Text>
              </View>
              <View style={s.heroKpiBadge}>
                <Text style={s.heroKpiBadgeText}>📈 +12%</Text>
              </View>
            </View>
            <View style={s.heroKpiBottom}>
              <View style={s.heroKpiStat}>
                <Text style={s.heroKpiStatValue}>{recentSales.length}</Text>
                <Text style={s.heroKpiStatLabel}>Ventes</Text>
              </View>
              <View style={s.heroKpiDivider} />
              <View style={s.heroKpiStat}>
                <Text style={s.heroKpiStatValue}>{recentSales.reduce((t, s) => t + s.items, 0)}</Text>
                <Text style={s.heroKpiStatLabel}>Articles</Text>
              </View>
              <View style={s.heroKpiDivider} />
              <View style={s.heroKpiStat}>
                <Text style={s.heroKpiStatValue}>
                  {recentSales.length > 0 
                    ? formatPrice(Math.round(recentSales.reduce((t, s) => t + s.total, 0) / recentSales.length))
                    : '0 F'}
                </Text>
                <Text style={s.heroKpiStatLabel}>Panier moy</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Mini KPI Grid */}
          <View style={s.miniKpiGrid}>
            <View style={s.miniKpiCard}>
              <View style={[s.miniKpiIcon, { backgroundColor: C.successSoft }]}>
                <Text style={s.miniKpiIconText}>💰</Text>
              </View>
              <View style={s.miniKpiInfo}>
                <Text style={s.miniKpiValue}>{formatPrice(recentSales.reduce((t, s) => t + s.total, 0))}</Text>
                <Text style={s.miniKpiLabel}>Total</Text>
              </View>
            </View>
            <View style={s.miniKpiCard}>
              <View style={[s.miniKpiIcon, { backgroundColor: C.accentSoft }]}>
                <Text style={s.miniKpiIconText}>🛒</Text>
              </View>
              <View style={s.miniKpiInfo}>
                <Text style={s.miniKpiValue}>{recentSales.length}</Text>
                <Text style={s.miniKpiLabel}>Transactions</Text>
              </View>
            </View>
            <View style={s.miniKpiCard}>
              <View style={[s.miniKpiIcon, { backgroundColor: C.purpleSoft }]}>
                <Text style={s.miniKpiIconText}>📦</Text>
              </View>
              <View style={s.miniKpiInfo}>
                <Text style={s.miniKpiValue}>{recentSales.reduce((t, s) => t + s.items, 0)}</Text>
                <Text style={s.miniKpiLabel}>Articles</Text>
              </View>
            </View>
          </View>

          {/* Sales by hour chart */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Ventes par heure</Text>
            <View style={s.chartContainer}>
              <View style={s.chartBars}>
                {[8, 10, 12, 14, 16, 18, 20].map((hour, i) => {
                  const height = Math.random() * 60 + 20;
                  return (
                    <View key={hour} style={s.chartBarCol}>
                      <View style={[s.chartBar, { height: `${height}%` }]} />
                      <Text style={s.chartBarLabel}>{hour}h</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Payment methods breakdown with visual bar */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Répartition par moyen de paiement</Text>
            {['cash', 'card', 'mobile'].map(method => {
              const count = recentSales.filter(s => s.method === method).length;
              const total = recentSales.filter(s => s.method === method).reduce((t, s) => t + s.total, 0);
              const percent = recentSales.length > 0 ? Math.round((count / recentSales.length) * 100) : 0;
              const colors = { cash: C.success, card: C.purple, mobile: C.accent };
              return (
                <View key={method} style={s.methodRow}>
                  <View style={s.methodIcon}>
                    <Text>{method === 'cash' ? '💵' : method === 'card' ? '💳' : '📲'}</Text>
                  </View>
                  <View style={s.methodInfo}>
                    <Text style={s.methodName}>{method === 'cash' ? 'Espèces' : method === 'card' ? 'Carte' : 'Mobile'}</Text>
                    <Text style={s.methodDetail}>{count} transaction{count > 1 ? 's' : ''} · {formatPrice(total)}</Text>
                    <View style={s.methodProgressBar}>
                      <View style={[s.methodProgressFill, { width: `${percent}%`, backgroundColor: colors[method as keyof typeof colors] }]} />
                    </View>
                  </View>
                  <View style={s.methodPercent}>
                    <Text style={s.methodPercentText}>{percent}%</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Top products */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Top produits vendus</Text>
            {products.slice(0, 5).map((product: Product, i: number) => (
              <View key={product.id} style={[s.topProductRow, i < 4 && s.topProductRowBorder]}>
                <View style={s.topProductRank}>
                  <Text style={s.topProductRankText}>#{i + 1}</Text>
                </View>
                <View style={s.topProductInfo}>
                  <Text style={s.topProductName}>{product.nom}</Text>
                  <Text style={s.topProductCategory}>{product.categorie}</Text>
                </View>
                <View style={s.topProductStats}>
                  <Text style={s.topProductSold}>{Math.floor(Math.random() * 20) + 5} vendus</Text>
                  <Text style={s.topProductRevenue}>{formatPrice(product.prix * (Math.floor(Math.random() * 20) + 5))}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Caisse / Articles tabs */}
      {(activeTab === 'caisse' || activeTab === 'articles') && (
        <>
          {/* Search */}
          <View style={s.searchBar}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2}>
              <Circle cx={11} cy={11} r={8} /><Path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </Svg>
            <TextInput
              style={s.searchInput}
              placeholder="Rechercher un produit..."
              placeholderTextColor={C.muted}
              value={search} onChangeText={setSearch}
              autoCorrect={false} autoCapitalize="none"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={s.searchClear}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll} contentContainerStyle={s.catRow} keyboardShouldPersistTaps="handled">
            {categories.map((c: string) => (
              <TouchableOpacity key={c} style={[s.catChip, cat === c && s.catChipActive]} onPress={() => setCat(c)}>
                <Text style={[s.catText, cat === c && s.catTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Product grid */}
          <ScrollView contentContainerStyle={s.productGrid} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {filtered.map((p: Product) => {
              const inCart = cart.find(i => i.product.id === p.id);
              return (
                <TouchableOpacity key={p.id} style={[s.productCard, inCart && s.productCardActive]} onPress={() => addToCart(p)} activeOpacity={0.75}>
                  {inCart && (
                    <View style={s.productBadge}><Text style={s.productBadgeText}>{inCart.qty}</Text></View>
                  )}
                  <View style={[s.productIconArea, inCart && s.productIconAreaActive]}>
                    <BagIcon size={26} color={inCart ? C.white : C.accent} />
                  </View>
                  <Text style={[s.productName, inCart && s.productNameActive]} numberOfLines={2}>{p.nom}</Text>
                  <Text style={[s.productPrice, (p.stock || 0) < 15 && s.productPriceLow]}>{formatPrice(p.prix)}</Text>
                  <Text style={s.productStock}>Stock: {p.stock || 0}</Text>
                </TouchableOpacity>
              );
            })}
            {filtered.length === 0 && (
              <View style={s.noResults}><Text style={s.noResultsText}>Aucun produit trouvé</Text></View>
            )}
          </ScrollView>
        </>
      )}
    </View>
  );

  return (
    <View style={s.root}>
      {isDesktop ? (
        <View style={s.desktopLayout}>
          {productsPanel}
          {cartPanel}
        </View>
      ) : (
        <View style={s.mobileLayout}>
          {productsPanel}
          {cart.length > 0 && (
            <View style={s.mobileCart}>
              <Text style={s.mobileCartText}>{totalItems} art. · {formatPrice(subtotal)}</Text>
              <TouchableOpacity style={s.mobilePayBtn} onPress={openPayModal}>
                <Text style={s.mobilePayBtnText}>Encaisser</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {paymentModal}
      {paid && successOverlay}
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: C.bg },
  desktopLayout: { flex: 1, flexDirection: 'row' },
  mobileLayout:  { flex: 1 },

  // App header
  appHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 54 : 20, paddingBottom: 16,
    backgroundColor: C.accent, shadowColor: C.accentDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12,
  },
  appHeaderLogo: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  logoIcon:      { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', shadowColor: 'rgba(0,0,0,0.1)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  logoIconText:  { color: C.white, fontSize: 18, fontWeight: '900' },
  headerBadgeContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoTitle:     { fontSize: 18, fontWeight: '800', color: C.white, letterSpacing: -0.5 },
  proBadge: { backgroundColor: C.white, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  proBadgeText: { color: C.accent, fontSize: 10, fontWeight: 'bold' },
  logoSub:       { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '500', marginTop: 1 },
  actifBadge:    { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  actifText:     { color: C.white, fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },

  // Products panel
  productsPanel: { flex: 1, backgroundColor: C.bg },

  // Tabs
  tabBar: {
    flexDirection: 'row', backgroundColor: C.surface,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  tab:          { paddingHorizontal: 14, paddingVertical: 13, alignItems: 'center', position: 'relative' },
  tabText:      { fontSize: 13, color: C.textLight, fontWeight: '600' },
  tabTextActive:{ color: C.accent, fontWeight: '800' },
  tabUnderline: { position: 'absolute', bottom: 0, left: 8, right: 8, height: 3, backgroundColor: C.accent, borderRadius: 2 },

  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 18, paddingVertical: 12,
    backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  searchInput: { flex: 1, fontSize: 15, color: C.textDark, fontWeight: '500' },
  searchClear: { fontSize: 16, color: C.muted, paddingHorizontal: 6, paddingVertical: 2 },

  // Categories
  catScroll:    { flexGrow: 0, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  catRow:       { gap: 10, paddingHorizontal: 16, paddingVertical: 12 },
  catChip:      { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 22, backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border },
  catChipActive:{ backgroundColor: C.accent, borderColor: C.accent, shadowColor: C.accent, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  catText:      { fontSize: 13, color: C.textMid, fontWeight: '600' },
  catTextActive:{ color: C.white, fontWeight: '700' },

  // Product grid
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 14, gap: 12 },
  productCard: {
    width: '22%', minWidth: 110, backgroundColor: C.surface, borderRadius: 14,
    padding: 14, borderWidth: 1.5, borderColor: C.border,
    shadowColor: C.accent, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6,
    position: 'relative', overflow: 'hidden',
  },
  productCardActive:    { borderColor: C.accent, backgroundColor: '#FFF0EA' },
  productBadge:         { position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: 11, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  productBadgeText:     { color: C.white, fontSize: 11, fontWeight: '800' },
  productIconArea:      { width: 50, height: 50, borderRadius: 12, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  productIconAreaActive:{ backgroundColor: C.accent },
  productName:          { fontSize: 13, fontWeight: '700', color: C.textDark, marginBottom: 6, lineHeight: 18 },
  productNameActive:    { color: C.accentDark },
  productPrice:         { fontSize: 14, fontWeight: '800', color: C.accent, marginBottom: 3 },
  productPriceLow:      { color: C.warning },
  productStock:         { fontSize: 11, color: C.muted, fontWeight: '500' },
  noResults:            { flex: 1, alignItems: 'center', paddingVertical: 56, width: '100%' },
  noResultsText:        { color: C.muted, fontSize: 15, fontWeight: '500' },

  // Cart panel
  cartPanel:        { width: 320, backgroundColor: C.surface, borderLeftWidth: 1, borderLeftColor: C.border },
  cartPanelDesktop: {},
  cartHeaderRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: C.accentSoft },
  cartTitle:        { fontSize: 16, fontWeight: '800', color: C.accent, flex: 1 },
  cartClearBtn:     { paddingHorizontal: 10, paddingVertical: 5 },
  cartClearTxt:     { fontSize: 12, color: C.error, fontWeight: '700' },

  cartScroll:    { flex: 1, paddingHorizontal: 16 },
  cartItem:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 },
  cartItemBorder:{ borderBottomWidth: 1, borderBottomColor: C.border },
  cartItemIcon:  { width: 36, height: 36, borderRadius: 10, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center' },
  cartItemInfo:  { flex: 1 },
  cartItemName:  { fontSize: 13, fontWeight: '700', color: C.textDark, marginBottom: 3 },
  cartItemPrice: { fontSize: 12, color: C.textLight, fontWeight: '500' },
  qtyControl:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn:        { width: 28, height: 28, borderRadius: 8, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg },
  qtyBtnPlus:    { backgroundColor: C.accent, borderColor: C.accent },
  qtyBtnText:    { fontSize: 14, fontWeight: '800', color: C.textDark },
  qtyVal:        { fontSize: 14, fontWeight: '700', color: C.textDark, width: 24, textAlign: 'center' },

  emptyCart:    { alignItems: 'center', paddingVertical: 48, gap: 14 },
  emptyCartText:{ fontSize: 15, fontWeight: '700', color: C.textMid },
  emptyCartSub: { fontSize: 13, color: C.muted, textAlign: 'center', paddingHorizontal: 20 },

  discountSection:   { borderTopWidth: 1, borderTopColor: C.border, paddingHorizontal: 16, paddingVertical: 10, gap: 6 },
  discountRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  discountLabel:     { fontSize: 13, color: C.textMid, fontWeight: '600' },
  discountInputWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  discountField:     { width: 44, height: 28, borderWidth: 1.5, borderColor: C.border, borderRadius: 8, paddingHorizontal: 6, fontSize: 13, fontWeight: '700', color: C.textDark, textAlign: 'center', backgroundColor: C.bg },
  discountPct:       { fontSize: 13, color: C.textMid, fontWeight: '500' },
  totalRow:          { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel:        { fontSize: 13, color: C.textMid, fontWeight: '500' },
  totalVal:          { fontSize: 13, fontWeight: '700', color: C.textDark },

  totalSection: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderTopWidth: 1.5, borderTopColor: C.border, backgroundColor: C.accentSoft,
  },
  totalBigLabel:{ fontSize: 11, fontWeight: '800', color: C.accent, letterSpacing: 1, textTransform: 'uppercase' },
  totalBigVal:  { fontSize: 22, fontWeight: '900', color: C.accentDark },

  actionRow:    { paddingHorizontal: 16, paddingVertical: 14 },
  encaisserBtn: {
    height: 54, borderRadius: 14, backgroundColor: C.accent,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12,
  },
  encaisserText:{ color: C.white, fontSize: 16, fontWeight: '800' },
  btnDisabled:  { opacity: 0.4 },

  recentSection:{ paddingHorizontal: 14, paddingBottom: 16, gap: 6 },
  recentTitle:  { fontSize: 11, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  recentRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: C.border },
  recentIcon:   { fontSize: 14 },
  recentAmt:    { fontSize: 13, fontWeight: '700', color: C.accent },
  recentInfo:   { fontSize: 11, color: C.muted, flex: 1 },

  // Ventes tab styles
  statsHeader:  { marginBottom: 16 },
  statsTitle:   { fontSize: 20, fontWeight: '800', color: C.textDark },
  statsSub:     { fontSize: 13, color: C.muted, marginTop: 2 },
  emptyState:   { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyIcon:    { fontSize: 48 },
  emptyTitle:   { fontSize: 16, fontWeight: '700', color: C.textMid },
  emptySub:     { fontSize: 13, color: C.muted, textAlign: 'center' },
  saleRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, backgroundColor: C.white, borderRadius: 12, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  saleRowBorder:{ borderBottomWidth: 1, borderBottomColor: C.border },
  saleIcon:     { width: 40, height: 40, borderRadius: 10, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  saleIconText: { fontSize: 18 },
  saleInfo:     { flex: 1 },
  saleAmount:   { fontSize: 16, fontWeight: '800', color: C.textDark },
  saleDetails:  { fontSize: 12, color: C.muted, marginTop: 2 },
  saleMethodBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  saleMethodText: { fontSize: 11, fontWeight: '700' },
  saleArrow: { marginLeft: 8 },
  saleArrowText: { fontSize: 20, color: C.muted, fontWeight: '300' },

  // Stats tab styles
  kpiGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  kpiCard:      { flex: 1, minWidth: '45%', padding: 16, borderRadius: 12, alignItems: 'center' },
  kpiValue:     { fontSize: 20, fontWeight: '900', color: C.textDark },
  kpiLabel:     { fontSize: 11, color: C.muted, marginTop: 4, fontWeight: '600' },
  section:      { backgroundColor: C.white, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: C.border, marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: C.textDark, marginBottom: 12 },
  methodRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  methodIcon:   { width: 36, height: 36, borderRadius: 10, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  methodInfo:   { flex: 1 },
  methodName:   { fontSize: 14, fontWeight: '600', color: C.textDark },
  methodDetail: { fontSize: 12, color: C.muted, marginTop: 1 },
  methodPercent: { backgroundColor: C.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  methodPercentText: { fontSize: 12, fontWeight: '700', color: C.textMid },

  // Enhanced stats styles
  heroKpiCard:      { borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: C.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
  heroKpiTop:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  heroKpiLabel:     { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  heroKpiValue:     { fontSize: 32, fontWeight: '900', color: C.white, marginTop: 4, letterSpacing: -1 },
  heroKpiBadge:     { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  heroKpiBadgeText: { fontSize: 12, fontWeight: '700', color: C.white },
  heroKpiBottom:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)' },
  heroKpiStat:      { alignItems: 'center', flex: 1 },
  heroKpiStatValue: { fontSize: 18, fontWeight: '800', color: C.white },
  heroKpiStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  heroKpiDivider:   { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 12 },

  miniKpiGrid:    { flexDirection: 'row', gap: 10, marginBottom: 16 },
  miniKpiCard:    { flex: 1, backgroundColor: C.white, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: C.border },
  miniKpiIcon:    { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  miniKpiIconText: { fontSize: 18 },
  miniKpiInfo:    { flex: 1 },
  miniKpiValue:   { fontSize: 16, fontWeight: '800', color: C.textDark },
  miniKpiLabel:   { fontSize: 11, color: C.muted, fontWeight: '600' },

  chartContainer: { backgroundColor: C.bg, borderRadius: 12, padding: 16 },
  chartBars:      { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120 },
  chartBarCol:    { flex: 1, alignItems: 'center', gap: 6 },
  chartBar:       { width: 20, borderRadius: 6, backgroundColor: C.accent },
  chartBarLabel:  { fontSize: 10, color: C.muted, fontWeight: '600' },

  methodProgressBar: { height: 4, backgroundColor: C.bg, borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  methodProgressFill: { height: '100%', borderRadius: 2 },

  topProductRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  topProductRowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  topProductRank:     { width: 32, height: 32, borderRadius: 8, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center' },
  topProductRankText: { fontSize: 12, fontWeight: '800', color: C.accent },
  topProductInfo:     { flex: 1 },
  topProductName:     { fontSize: 14, fontWeight: '600', color: C.textDark },
  topProductCategory: { fontSize: 11, color: C.muted, marginTop: 2 },
  topProductStats:    { alignItems: 'flex-end' },
  topProductSold:     { fontSize: 11, color: C.muted, fontWeight: '500' },
  topProductRevenue:  { fontSize: 13, fontWeight: '700', color: C.success },

  // Mobile cart
  mobileCart:       { backgroundColor: C.surface, borderTopWidth: 1.5, borderTopColor: C.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  mobileCartText:   { fontSize: 14, fontWeight: '600', color: C.textDark },
  mobilePayBtn:     { backgroundColor: C.accent, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  mobilePayBtnText: { color: C.white, fontSize: 14, fontWeight: '700' },

  // ── Payment Modal ──────────────────────────────────────────────
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: C.white, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20, maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  modalTitle:  { fontSize: 20, fontWeight: '900', color: C.textDark },
  modalSub:    { fontSize: 13, color: C.muted, marginTop: 2 },
  modalClose:  { width: 36, height: 36, borderRadius: 18, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  modalCloseTxt:{ fontSize: 16, color: C.textMid },

  modalTotalBox: {
    alignItems: 'center', paddingVertical: 16,
    backgroundColor: C.accentSoft, marginHorizontal: 20, borderRadius: 16, marginTop: 16,
  },
  modalTotalLabel:{ fontSize: 11, fontWeight: '700', color: C.accent, letterSpacing: 1, textTransform: 'uppercase' },
  modalTotalAmt:  { fontSize: 36, fontWeight: '900', color: C.accentDark, marginTop: 4 },

  modalPayRow:   { flexDirection: 'row', gap: 10, marginHorizontal: 20, marginTop: 14 },
  modalPayChip:  { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', gap: 4 },
  modalPayChipActive:{ borderColor: C.accent, backgroundColor: C.accentSoft },
  modalPayIcon:  { fontSize: 18 },
  modalPayLabel: { fontSize: 11, color: C.textMid, fontWeight: '500' },
  modalPayLabelActive:{ color: C.accent, fontWeight: '700' },

  recuDisplay:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, marginTop: 14, padding: 14, backgroundColor: C.bg, borderRadius: 12, borderWidth: 1.5, borderColor: C.border },
  recuLabel:    { fontSize: 13, color: C.textMid, fontWeight: '600' },
  recuValue:    { fontSize: 22, fontWeight: '900', color: C.textDark },

  monnaieBox:     { marginHorizontal: 20, marginTop: 10, padding: 14, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  monnaieBonBox:  { backgroundColor: C.successSoft },
  monnaieErrBox:  { backgroundColor: '#FEE2E2' },
  monnaieLabel:   { fontSize: 13, color: C.textMid, fontWeight: '600' },
  monnaieVal:     { fontSize: 20, fontWeight: '900' },
  monnaieBon:     { color: C.success },
  monnaieErr:     { color: C.error },

  denomScroll:  { flexGrow: 0, marginTop: 12 },
  denomRow:     { gap: 8, paddingHorizontal: 20, paddingVertical: 4 },
  denomChip:    { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border },
  denomExact:   { borderColor: C.accent },
  denomText:    { fontSize: 13, fontWeight: '700', color: C.textDark },

  numpad:     { paddingHorizontal: 20, marginTop: 10, gap: 8 },
  numpadRow:  { flexDirection: 'row', gap: 8 },
  numKey:     { flex: 1, height: 52, borderRadius: 14, backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  numKeyClear:{ backgroundColor: '#FEE2E2', borderColor: '#FECACA' },
  numKeyBack: { backgroundColor: C.accentSoft, borderColor: C.border },
  numKeyTxt:  { fontSize: 20, fontWeight: '700', color: C.textDark },
  numKeyClearTxt:{ color: C.error },
  numKeyBackTxt: { color: C.accent },

  cardPayInfo:  { alignItems: 'center', padding: 30, gap: 12 },
  cardPayIcon:  { fontSize: 48 },
  cardPayText:  { fontSize: 14, color: C.textMid, textAlign: 'center', lineHeight: 20 },
  cardPayAmt:   { fontSize: 28, fontWeight: '900', color: C.accent },

  confirmBtn:   {
    marginHorizontal: 20, marginTop: 14, height: 54, borderRadius: 14,
    backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center',
    shadowColor: C.accent, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12,
  },
  confirmTxt:   { color: C.white, fontSize: 17, fontWeight: '900' },

  // ── IA Panel ──────────────────────────────────────────────────
  iaPanel:      { flex: 1, backgroundColor: C.bg },
  iaHeader:     {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16,
    backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  iaBadge:      { width: 40, height: 40, borderRadius: 12, backgroundColor: C.purple, alignItems: 'center', justifyContent: 'center' },
  iaBadgeTxt:   { color: C.white, fontSize: 12, fontWeight: '900' },
  iaTitle:      { fontSize: 15, fontWeight: '800', color: C.textDark, flex: 1 },
  iaSub:        { fontSize: 11, color: C.muted },
  iaOnline:     { backgroundColor: C.successSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  iaOnlineTxt:  { color: C.success, fontSize: 11, fontWeight: '700' },

  iaStatsRow:   { flexDirection: 'row', padding: 12, gap: 8 },
  iaStat:       { flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 10, alignItems: 'center', gap: 2, borderWidth: 1, borderColor: C.border },
  iaStatIcon:   { fontSize: 16 },
  iaStatVal:    { fontSize: 14, fontWeight: '900', color: C.textDark },
  iaStatLabel:  { fontSize: 9, color: C.muted, textAlign: 'center', lineHeight: 12 },

  iaChat:       { flex: 1 },
  iaChatContent:{ padding: 14, gap: 14, paddingBottom: 20 },

  msgRow:       { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowUser:   { flexDirection: 'row-reverse' },
  msgAvatarAI:  { width: 30, height: 30, borderRadius: 15, backgroundColor: C.purple, alignItems: 'center', justifyContent: 'center' },
  msgAvatarUser:{ width: 30, height: 30, borderRadius: 15, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  msgAvatarTxt: { fontSize: 12, fontWeight: '800', color: C.white },
  msgBubble:    { maxWidth: '78%', borderRadius: 16, padding: 12 },
  msgBubbleAI:  { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderBottomLeftRadius: 4 },
  msgBubbleUser:{ backgroundColor: C.accent, borderBottomRightRadius: 4 },
  msgThinking:  { paddingVertical: 14 },
  msgText:      { fontSize: 13, color: C.textDark, lineHeight: 20 },
  msgTextUser:  { color: C.white },
  msgTime:      { fontSize: 10, color: C.muted, marginTop: 4 },
  thinkingDots: { fontSize: 18, color: C.accent, letterSpacing: 4 },

  suggestScroll:{ flexGrow: 0 },
  suggestRow:   { gap: 8, paddingHorizontal: 14, paddingVertical: 10 },
  suggestChip:  { backgroundColor: C.purpleSoft, borderWidth: 1, borderColor: C.purple, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  suggestTxt:   { fontSize: 12, color: C.purple, fontWeight: '600' },

  iaInputRow:   { flexDirection: 'row', gap: 10, padding: 12, backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border },
  iaInput:      { flex: 1, height: 44, backgroundColor: C.bg, borderRadius: 12, paddingHorizontal: 14, fontSize: 14, color: C.textDark, borderWidth: 1.5, borderColor: C.border },
  iaSendBtn:    { width: 44, height: 44, borderRadius: 12, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  iaSendTxt:    { color: C.white, fontSize: 16 },

  // Success overlay
  successOverlay: {
    position: 'absolute', top: '30%', alignSelf: 'center',
    backgroundColor: C.white, borderRadius: 24, padding: 36,
    alignItems: 'center', gap: 8,
    shadowColor: C.accent, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.25, shadowRadius: 40,
    borderWidth: 1.5, borderColor: C.border, minWidth: 280,
  },
  successIcon:    { fontSize: 48, color: C.success },
  successTitle:   { fontSize: 20, fontWeight: '800', color: C.textDark },
  successAmount:  { fontSize: 32, fontWeight: '900', color: C.accent },
  successMonnaie: { fontSize: 16, fontWeight: '700', color: C.success, backgroundColor: C.successSoft, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  successMethod:  { fontSize: 14, color: C.textMid, marginTop: 2 },
});

export default POSScreen;
