import React from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  Dimensions, Image, Share, Alert, Platform,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useBoutique } from '../contexts/BoutiqueContext';

// ── Types ───────────────────────────────────────────────────────────────────
type RootStackParamList = {
  Invoice: { saleId: string; saleData?: any };
};

type InvoiceRouteProp = RouteProp<RootStackParamList, 'Invoice'>;
type InvoiceNavProp = NativeStackNavigationProp<RootStackParamList>;

interface InvoiceItem {
  nom: string;
  prix: number;
  qty: number;
  total: number;
}

interface InvoiceData {
  id: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  method: string;
  boutique: {
    nom: string;
    logo?: string;
    adresse?: string;
    telephone?: string;
    email?: string;
  };
}

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  textDark: '#1E293B',
  textMid: '#64748B',
  textLight: '#94A3B8',
  success: '#10B981',
  accent: '#FF6B35',
};

// ── SVG Components ───────────────────────────────────────────────────────────
const PrintIcon = ({ size = 24, color = C.textMid }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M6 9V2h12v7" />
    <Path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
    <Path d="M6 14h12v8H6z" />
  </Svg>
);

const ShareIcon = ({ size = 24, color = C.textMid }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx={18} cy={5} r={3} />
    <Circle cx={6} cy={12} r={3} />
    <Circle cx={18} cy={19} r={3} />
    <Path d="M8.59 13.51l6.83 3.98" />
    <Path d="M15.41 6.51l-6.82 3.98" />
  </Svg>
);

const CloseIcon = ({ size = 24, color = C.textMid }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 6L6 18" />
    <Path d="M6 6l12 12" />
  </Svg>
);

// ── Component ─────────────────────────────────────────────────────────────────
const InvoiceScreen: React.FC = () => {
  const route = useRoute<InvoiceRouteProp>();
  const navigation = useNavigation<InvoiceNavProp>();
  const { boutiqueData } = useBoutique();

  // Mock invoice data (in real app, this would come from route params or database)
  const invoiceData: InvoiceData = {
    id: route.params?.saleId || 'INV-2024-001',
    date: new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    items: route.params?.saleData?.items || [
      { nom: 'Produit A', prix: 5000, qty: 2, total: 10000 },
      { nom: 'Produit B', prix: 3500, qty: 1, total: 3500 },
      { nom: 'Produit C', prix: 8000, qty: 1, total: 8000 },
    ],
    subtotal: route.params?.saleData?.subtotal || 21500,
    discount: route.params?.saleData?.discount || 0,
    total: route.params?.saleData?.total || 21500,
    method: route.params?.saleData?.method || 'Espèces',
    boutique: {
      nom: boutiqueData?.nom || 'Ma Boutique',
      logo: boutiqueData?.logo,
      adresse: `${boutiqueData?.ville || 'Dakar'}, ${boutiqueData?.pays || 'Sénégal'}`,
      telephone: boutiqueData?.phone || '+221 77 123 45 67',
      email: boutiqueData?.email || 'contact@boutique.com',
    },
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleShare = async () => {
    try {
      const message = `
FACTURE #${invoiceData.id}
${invoiceData.boutique.nom}
${invoiceData.boutique.adresse}
${invoiceData.boutique.telephone}

Date: ${invoiceData.date}

${invoiceData.items.map(item => `${item.nom} x${item.qty} - ${formatPrice(item.total)}`).join('\n')}

Sous-total: ${formatPrice(invoiceData.subtotal)}
Remise: ${formatPrice(invoiceData.discount)}
TOTAL: ${formatPrice(invoiceData.total)}

Moyen de paiement: ${invoiceData.method}

Merci de votre confiance !
      `.trim();

      await Share.share({
        message,
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager la facture');
    }
  };

  const handlePrint = () => {
    Alert.alert(
      'Impression',
      'La fonctionnalité d\'impression sera bientôt disponible.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.headerBtn}>
          <CloseIcon size={24} color={C.textDark} />
        </TouchableOpacity>
        <View style={s.headerBadgeContainer}>
          <Text style={s.headerTitle}>Facture #{invoiceData.id}</Text>
          <View style={s.proBadge}>
            <Text style={s.proBadgeText}>PRO</Text>
          </View>
        </View>
        <View style={s.headerActions}>
          <TouchableOpacity onPress={handleShare} style={s.headerBtn}>
            <ShareIcon size={22} color={C.textDark} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePrint} style={s.headerBtn}>
            <PrintIcon size={22} color={C.textDark} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Invoice Content */}
      <ScrollView style={s.content} contentContainerStyle={s.contentContainer}>
        <View style={s.invoiceCard}>
          {/* Boutique Header */}
          <View style={s.boutiqueHeader}>
            {invoiceData.boutique.logo ? (
              <Image source={{ uri: invoiceData.boutique.logo }} style={s.logo} />
            ) : (
              <View style={s.logoPlaceholder}>
                <Text style={s.logoPlaceholderText}>{invoiceData.boutique.nom.charAt(0)}</Text>
              </View>
            )}
            <View style={s.boutiqueInfo}>
              <Text style={s.boutiqueName}>{invoiceData.boutique.nom}</Text>
              <Text style={s.boutiqueDetail}>{invoiceData.boutique.adresse}</Text>
              <Text style={s.boutiqueDetail}>{invoiceData.boutique.telephone}</Text>
              {invoiceData.boutique.email && (
                <Text style={s.boutiqueDetail}>{invoiceData.boutique.email}</Text>
              )}
            </View>
          </View>

          {/* Invoice Meta */}
          <View style={s.metaSection}>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>N° Facture</Text>
              <Text style={s.metaValue}>{invoiceData.id}</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Date</Text>
              <Text style={s.metaValue}>{invoiceData.date}</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Moyen de paiement</Text>
              <Text style={s.metaValue}>{invoiceData.method}</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={s.divider} />

          {/* Items Table */}
          <View style={s.itemsSection}>
            <Text style={s.sectionTitle}>Détails de la commande</Text>
            
            {/* Table Header */}
            <View style={s.tableHeader}>
              <Text style={[s.tableHeaderText, s.colProduct]}>Produit</Text>
              <Text style={[s.tableHeaderText, s.colQty]}>Qté</Text>
              <Text style={[s.tableHeaderText, s.colPrice]}>Prix</Text>
              <Text style={[s.tableHeaderText, s.colTotal]}>Total</Text>
            </View>

            {/* Table Rows */}
            {invoiceData.items.map((item, index) => (
              <View key={index} style={[s.tableRow, index < invoiceData.items.length - 1 && s.tableRowBorder]}>
                <Text style={[s.tableCellText, s.colProduct]} numberOfLines={1}>{item.nom}</Text>
                <Text style={[s.tableCellText, s.colQty]}>{item.qty}</Text>
                <Text style={[s.tableCellText, s.colPrice]}>{formatPrice(item.prix)}</Text>
                <Text style={[s.tableCellText, s.colTotal, s.colTotalBold]}>{formatPrice(item.total)}</Text>
              </View>
            ))}
          </View>

          {/* Divider */}
          <View style={s.divider} />

          {/* Totals */}
          <View style={s.totalsSection}>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Sous-total</Text>
              <Text style={s.totalValue}>{formatPrice(invoiceData.subtotal)}</Text>
            </View>
            {invoiceData.discount > 0 && (
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Remise</Text>
                <Text style={[s.totalValue, s.totalValueDiscount]}>-{formatPrice(invoiceData.discount)}</Text>
              </View>
            )}
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>TVA (0%)</Text>
              <Text style={s.totalValue}>{formatPrice(0)}</Text>
            </View>
            <View style={[s.totalRow, s.totalRowFinal]}>
              <Text style={s.totalLabelFinal}>TOTAL À PAYER</Text>
              <Text style={s.totalValueFinal}>{formatPrice(invoiceData.total)}</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={s.footer}>
            <Text style={s.footerTitle}>Merci de votre confiance !</Text>
            <Text style={s.footerSub}>Cette facture est générée automatiquement.</Text>
            <View style={s.footerDivider} />
            <Text style={s.footerSmall}>{invoiceData.boutique.nom} · {invoiceData.boutique.telephone}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={s.footerAction}>
        <TouchableOpacity onPress={handleShare} style={s.actionBtn}>
          <ShareIcon size={20} color={C.surface} />
          <Text style={s.actionBtnText}>Partager la facture</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 54 : 20,
    paddingBottom: 16,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.textDark,
  },
  headerBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  proBadge: {
    backgroundColor: C.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  invoiceCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  boutiqueHeader: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  logoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlaceholderText: {
    fontSize: 28,
    fontWeight: '800',
    color: C.surface,
  },
  boutiqueInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  boutiqueName: {
    fontSize: 20,
    fontWeight: '800',
    color: C.textDark,
    marginBottom: 4,
  },
  boutiqueDetail: {
    fontSize: 13,
    color: C.textMid,
    marginBottom: 2,
  },
  metaSection: {
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  metaLabel: {
    fontSize: 13,
    color: C.textMid,
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 13,
    color: C.textDark,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 20,
  },
  itemsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: C.border,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.textMid,
    textTransform: 'uppercase',
  },
  colProduct: {
    flex: 2,
  },
  colQty: {
    flex: 0.5,
    textAlign: 'center',
  },
  colPrice: {
    flex: 1,
    textAlign: 'right',
  },
  colTotal: {
    flex: 1,
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  tableRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tableCellText: {
    fontSize: 13,
    color: C.textDark,
  },
  colTotalBold: {
    fontWeight: '700',
  },
  totalsSection: {
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalRowFinal: {
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: C.border,
  },
  totalLabel: {
    fontSize: 14,
    color: C.textMid,
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 14,
    color: C.textDark,
    fontWeight: '600',
  },
  totalValueDiscount: {
    color: C.success,
  },
  totalLabelFinal: {
    fontSize: 16,
    fontWeight: '800',
    color: C.textDark,
  },
  totalValueFinal: {
    fontSize: 20,
    fontWeight: '900',
    color: C.primary,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 4,
  },
  footerSub: {
    fontSize: 13,
    color: C.textMid,
    marginBottom: 16,
  },
  footerDivider: {
    width: 60,
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    marginBottom: 12,
  },
  footerSmall: {
    fontSize: 11,
    color: C.textLight,
  },
  footerAction: {
    padding: 20,
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: C.primary,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.surface,
  },
});

export default InvoiceScreen;
