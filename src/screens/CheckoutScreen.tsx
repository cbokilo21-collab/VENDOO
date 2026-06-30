/**
 * Checkout Screen — professional cart & payment (Stripe integration)
 *
 * Flow: Cart → Address → Payment → Confirmation
 * Status: Foundation ready for Stripe webhook integration
 */
import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput, Image, FlatList, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';

const C = {
  bg: '#F9FAFB', surface: '#FFFFFF', border: '#E5E7EB',
  accent: '#FF6B35', accentSoft: 'rgba(255,107,53,0.1)',
  text: '#111827', textMid: '#374151', textLight: '#6B7280', muted: '#9CA3AF',
  success: '#10B981', warning: '#F59E0B', danger: '#EF4444',
};

type Nav = NativeStackNavigationProp<any>;

interface CartItem { id: string; nom: string; prix: number; quantity: number; imageUri?: string }
interface ShippingAddress { nom: string; phone: string; adresse: string; ville: string; cp: string; pays: string }

const Ico = ({ d, s = 20, c = C.text }: { d: string; s?: number; c?: string }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d={d} />
  </Svg>
);

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute();
  const routeParams = route.params as { boutique_id?: string; cart?: CartItem[] } | undefined;

  const [step, setStep] = useState<'cart' | 'address' | 'payment' | 'confirmation'>('cart');
  const [cart, setCart] = useState<CartItem[]>(routeParams?.cart || []);
  const [address, setAddress] = useState<ShippingAddress>({
    nom: '', phone: '', adresse: '', ville: '', cp: '', pays: 'Sénégal',
  });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile'>('card');
  const [processing, setProcessing] = useState(false);
  const [order, setOrder] = useState<any>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.prix * item.quantity, 0);
  const shipping = subtotal > 0 ? 5000 : 0;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  const handleRemoveItem = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) { handleRemoveItem(itemId); return; }
    setCart(cart.map(item => item.id === itemId ? { ...item, quantity } : item));
  };

  const handleCheckoutClick = () => {
    if (cart.length === 0) { Alert.alert('Erreur', 'Votre panier est vide'); return; }
    setStep('address');
  };

  const handleAddressSubmit = () => {
    if (!address.nom.trim() || !address.phone.trim() || !address.adresse.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    setStep('payment');
  };

  const handlePaymentClick = async () => {
    if (!address.nom) { Alert.alert('Erreur', 'Adresse requise'); return; }
    setProcessing(true);
    try {
      // TODO: Integrate Stripe payment intent or mobile money
      // POST /api/payments/create-intent { cart, address, boutique_id, amount: total }
      // Get client_secret or payment URL
      // For now, simulate success after 2s
      await new Promise(resolve => setTimeout(resolve, 2000));

      const orderId = `ORD-${Date.now()}`;
      setOrder({
        id: orderId,
        total,
        address,
        items: cart,
        createdAt: new Date().toISOString(),
        status: 'pending', // Awaiting payment confirmation via webhook
      });
      setStep('confirmation');
    } catch (err) {
      Alert.alert('Erreur', 'Paiement échoué. Veuillez réessayer.');
    } finally {
      setProcessing(false);
    }
  };

  const handleContinueShopping = () => {
    navigation.goBack();
  };

  return (
    <View style={s.root}>
      {/* Header with step indicator */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ico d="M19 12H5M12 19l-7-7 7-7" s={20} c={C.text} />
        </TouchableOpacity>
        <Text style={s.title}>Checkout</Text>
        <View style={s.stepIndicator}>
          {['cart', 'address', 'payment', 'confirmation'].map((st, i) => (
            <View key={st} style={[s.stepDot, ['cart', 'address', 'payment', 'confirmation'].indexOf(step) >= i && s.stepDotActive]} />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {step === 'cart' && (
          <View>
            <Text style={s.sectionTitle}>Votre panier ({cart.length})</Text>
            {cart.length === 0 ? (
              <View style={s.emptyCart}>
                <Ico d="M1 1h4v6H1V1zm6 0h4v6H7V1zm6 0h4v6h-4V1zM1 9h4v6H1V9zm6 0h4v6H7V9zm6 0h4v6h-4V9z" s={40} c={C.muted} />
                <Text style={s.emptyText}>Panier vide</Text>
              </View>
            ) : (
              <FlatList
                scrollEnabled={false}
                data={cart}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <View style={s.cartItem}>
                    {item.imageUri && <Image source={{ uri: item.imageUri }} style={s.cartItemImage} />}
                    <View style={s.cartItemInfo}>
                      <Text style={s.cartItemName}>{item.nom}</Text>
                      <Text style={s.cartItemPrice}>{(item.prix / 1000).toFixed(0)}k F</Text>
                    </View>
                    <View style={s.quantityControl}>
                      <TouchableOpacity onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
                        <Ico d="M5 12h14" s={18} c={C.muted} />
                      </TouchableOpacity>
                      <Text style={s.quantity}>{item.quantity}</Text>
                      <TouchableOpacity onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                        <Ico d="M12 5v14M5 12h14" s={18} c={C.muted} />
                      </TouchableOpacity>
                    </View>
                    <View style={s.cartItemTotal}>
                      <Text style={s.cartItemTotalPrice}>{((item.prix * item.quantity) / 1000).toFixed(0)}k F</Text>
                      <TouchableOpacity onPress={() => handleRemoveItem(item.id)} style={s.removeBtn}>
                        <Ico d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7" s={16} c={C.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            )}

            {/* Cart Summary */}
            {cart.length > 0 && (
              <View style={s.summary}>
                <View style={s.summaryRow}>
                  <Text style={s.summaryLabel}>Sous-total</Text>
                  <Text style={s.summaryValue}>{(subtotal / 1000).toFixed(0)}k F</Text>
                </View>
                <View style={s.summaryRow}>
                  <Text style={s.summaryLabel}>Livraison</Text>
                  <Text style={s.summaryValue}>{(shipping / 1000).toFixed(0)}k F</Text>
                </View>
                <View style={s.summaryRow}>
                  <Text style={s.summaryLabel}>Taxe (18%)</Text>
                  <Text style={s.summaryValue}>{(tax / 1000).toFixed(0)}k F</Text>
                </View>
                <View style={[s.summaryRow, s.summaryTotal]}>
                  <Text style={s.summaryLabel}>TOTAL</Text>
                  <Text style={s.summaryValueBold}>{(total / 1000).toFixed(0)}k F</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {step === 'address' && (
          <View>
            <Text style={s.sectionTitle}>Adresse de livraison</Text>
            <TextInput style={s.input} placeholder="Nom complet" value={address.nom} onChangeText={(nom) => setAddress({ ...address, nom })} />
            <TextInput style={s.input} placeholder="Numéro de téléphone" value={address.phone} onChangeText={(phone) => setAddress({ ...address, phone })} keyboardType="phone-pad" />
            <TextInput style={s.input} placeholder="Adresse" value={address.adresse} onChangeText={(adresse) => setAddress({ ...address, adresse })} />
            <TextInput style={s.input} placeholder="Ville" value={address.ville} onChangeText={(ville) => setAddress({ ...address, ville })} />
            <TextInput style={s.input} placeholder="Code postal" value={address.cp} onChangeText={(cp) => setAddress({ ...address, cp })} />
          </View>
        )}

        {step === 'payment' && (
          <View>
            <Text style={s.sectionTitle}>Méthode de paiement</Text>
            <TouchableOpacity style={[s.paymentOption, paymentMethod === 'card' && s.paymentOptionActive]} onPress={() => setPaymentMethod('card')}>
              <View style={s.paymentIcon}>
                <Ico d="M3 10h18M3 10a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2M3 10V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2" s={24} c={paymentMethod === 'card' ? C.accent : C.muted} />
              </View>
              <View style={s.paymentInfo}>
                <Text style={s.paymentTitle}>Carte bancaire</Text>
                <Text style={s.paymentDesc}>Visa, Mastercard, American Express</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[s.paymentOption, paymentMethod === 'mobile' && s.paymentOptionActive]} onPress={() => setPaymentMethod('mobile')}>
              <View style={s.paymentIcon}>
                <Ico d="M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM12 19a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" s={24} c={paymentMethod === 'mobile' ? C.accent : C.muted} />
              </View>
              <View style={s.paymentInfo}>
                <Text style={s.paymentTitle}>Mobile Money (Orange, Parcels)</Text>
                <Text style={s.paymentDesc}>Paiement par SMS ou app</Text>
              </View>
            </TouchableOpacity>

            {/* Card form (stub for Stripe) */}
            {paymentMethod === 'card' && (
              <View style={s.cardForm}>
                <TextInput style={s.input} placeholder="Numéro de carte" keyboardType="number-pad" />
                <View style={s.cardRow}>
                  <TextInput style={[s.input, { flex: 1 }]} placeholder="MM/YY" keyboardType="number-pad" />
                  <TextInput style={[s.input, { flex: 1, marginLeft: 8 }]} placeholder="CVC" keyboardType="number-pad" />
                </View>
              </View>
            )}

            {/* Order summary before payment */}
            <View style={s.summary}>
              <View style={[s.summaryRow, s.summaryTotal]}>
                <Text style={s.summaryLabel}>À payer</Text>
                <Text style={s.summaryValueBold}>{(total / 1000).toFixed(0)}k F</Text>
              </View>
            </View>
          </View>
        )}

        {step === 'confirmation' && order && (
          <View style={s.confirmation}>
            <View style={s.successIcon}>
              <Ico d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" s={48} c={C.success} />
            </View>
            <Text style={s.confirmationTitle}>Commande confirmée!</Text>
            <Text style={s.confirmationDesc}>Numéro: {order.id}</Text>
            <View style={s.orderDetails}>
              <View style={s.orderRow}>
                <Text style={s.orderLabel}>Livraison à:</Text>
                <Text style={s.orderValue}>{address.nom}</Text>
              </View>
              <View style={s.orderRow}>
                <Text style={s.orderLabel}>Adresse:</Text>
                <Text style={s.orderValue}>{address.adresse}, {address.ville}</Text>
              </View>
              <View style={s.orderRow}>
                <Text style={s.orderLabel}>Montant total:</Text>
                <Text style={[s.orderValue, s.orderValueBold]}>{(total / 1000).toFixed(0)}k F</Text>
              </View>
              <View style={s.orderRow}>
                <Text style={s.orderLabel}>Statut:</Text>
                <Text style={[s.orderValue, { color: C.warning }]}>En attente de paiement</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action buttons */}
      <View style={s.footer}>
        {step === 'cart' && cart.length > 0 && (
          <TouchableOpacity style={s.ctaButton} onPress={handleCheckoutClick}>
            <Text style={s.ctaText}>Procéder au paiement</Text>
          </TouchableOpacity>
        )}
        {step === 'address' && (
          <TouchableOpacity style={s.ctaButton} onPress={handleAddressSubmit}>
            <Text style={s.ctaText}>Continuer vers paiement</Text>
          </TouchableOpacity>
        )}
        {step === 'payment' && (
          <TouchableOpacity style={[s.ctaButton, processing && s.ctaDisabled]} onPress={handlePaymentClick} disabled={processing}>
            <Text style={s.ctaText}>{processing ? 'Traitement...' : `Payer ${(total / 1000).toFixed(0)}k F`}</Text>
          </TouchableOpacity>
        )}
        {step === 'confirmation' && (
          <TouchableOpacity style={s.ctaButton} onPress={handleContinueShopping}>
            <Text style={s.ctaText}>Continuer shopping</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const s = StyleSheet.create<any>({
  root: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  title: { fontSize: 18, fontWeight: '700', color: C.text, flex: 1 },
  stepIndicator: { flexDirection: 'row', gap: 4 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.border },
  stepDotActive: { backgroundColor: C.accent },
  content: { paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 100 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 12 },
  emptyCart: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 8 },
  emptyText: { fontSize: 14, color: C.muted },
  cartItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 8, padding: 12, marginBottom: 8 },
  cartItemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 4 },
  cartItemPrice: { fontSize: 12, color: C.textLight },
  quantityControl: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.bg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  quantity: { fontSize: 13, fontWeight: '600', color: C.text, minWidth: 24, textAlign: 'center' },
  cartItemTotal: { alignItems: 'flex-end', gap: 8 },
  cartItemTotalPrice: { fontSize: 13, fontWeight: '700', color: C.accent },
  removeBtn: { padding: 4 },
  summary: { backgroundColor: C.surface, borderRadius: 8, padding: 12, marginTop: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  summaryLabel: { fontSize: 13, color: C.textMid },
  summaryValue: { fontSize: 13, color: C.text, fontWeight: '600' },
  summaryTotal: { borderTopWidth: 1, borderTopColor: C.border, paddingTopColor: C.border, marginTop: 8 },
  summaryValueBold: { fontSize: 16, color: C.accent, fontWeight: '700' },
  input: { backgroundColor: C.surface, borderRadius: 8, borderWidth: 1, borderColor: C.border, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: C.text, marginBottom: 12 },
  cardForm: { marginTop: 12 },
  cardRow: { flexDirection: 'row', gap: 8 },
  paymentOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 2, borderColor: C.border },
  paymentOptionActive: { borderColor: C.accent },
  paymentIcon: { marginRight: 12 },
  paymentInfo: { flex: 1 },
  paymentTitle: { fontSize: 14, fontWeight: '600', color: C.text },
  paymentDesc: { fontSize: 12, color: C.muted, marginTop: 2 },
  confirmation: { alignItems: 'center', paddingVertical: 40 },
  successIcon: { marginBottom: 16 },
  confirmationTitle: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 4 },
  confirmationDesc: { fontSize: 14, color: C.muted, marginBottom: 24 },
  orderDetails: { width: '100%', backgroundColor: C.surface, borderRadius: 8, padding: 16 },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  orderLabel: { fontSize: 13, color: C.textMid },
  orderValue: { fontSize: 13, color: C.text, fontWeight: '600', textAlign: 'right' },
  orderValueBold: { fontSize: 16, color: C.accent, fontWeight: '700' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border, padding: 16 },
  ctaButton: { backgroundColor: C.accent, borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  ctaDisabled: { opacity: 0.6 },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default CheckoutScreen;
