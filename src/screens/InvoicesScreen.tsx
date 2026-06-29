import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';

const C = {
  bg: '#F8FAFC', surface: '#FFFFFF', border: '#E2E8F0',
  orange: '#F97316', orangeFade: 'rgba(249,115,22,0.08)',
  textDark: '#0F172A', textMid: '#475569', textLight: '#94A3B8', muted: '#CBD5E1',
  success: '#22C55E', warning: '#F59E0B', purple: '#8B5CF6',
};

interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: string;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
}

const INVOICES: Invoice[] = [
  { id: '1', number: 'INV-2024-001', date: '2024-01-15', amount: '25 000 F', status: 'paid', description: 'Abonnement mensuel' },
  { id: '2', number: 'INV-2024-002', date: '2024-02-15', amount: '25 000 F', status: 'paid', description: 'Abonnement mensuel' },
  { id: '3', number: 'INV-2024-003', date: '2024-03-15', amount: '25 000 F', status: 'pending', description: 'Abonnement mensuel' },
  { id: '4', number: 'INV-2024-004', date: '2024-04-15', amount: '50 000 F', status: 'pending', description: 'Boost publicitaire' },
];

const InvoicesScreen: React.FC = () => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return C.success;
      case 'pending': return C.warning;
      case 'overdue': return '#EF4444';
      default: return C.muted;
    }
  };

  const getStatusText = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return 'Payée';
      case 'pending': return 'En attente';
      case 'overdue': return 'En retard';
      default: return 'Inconnu';
    }
  };

  const renderInvoiceItem = (invoice: Invoice) => (
    <TouchableOpacity
      key={invoice.id}
      style={s.invoiceItem}
      onPress={() => setSelectedInvoice(invoice)}
    >
      <View style={s.invoiceIcon}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth={2}>
          <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      </View>
      <View style={s.invoiceInfo}>
        <Text style={s.invoiceNumber}>{invoice.number}</Text>
        <Text style={s.invoiceDescription}>{invoice.description}</Text>
        <Text style={s.invoiceDate}>{invoice.date}</Text>
      </View>
      <View style={s.invoiceRight}>
        <Text style={s.invoiceAmount}>{invoice.amount}</Text>
        <View style={[s.statusBadge, { backgroundColor: getStatusColor(invoice.status) + '20' }]}>
          <Text style={[s.statusText, { color: getStatusColor(invoice.status) }]}>
            {getStatusText(invoice.status)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderInvoiceDetail = () => (
    <Modal visible={!!selectedInvoice} animationType="slide" onRequestClose={() => setSelectedInvoice(null)}>
      <View style={s.modal}>
        <View style={s.modalHeader}>
          <TouchableOpacity onPress={() => setSelectedInvoice(null)}>
            <Text style={s.closeBtn}>✕ Fermer</Text>
          </TouchableOpacity>
          <Text style={s.modalTitle}>Facture {selectedInvoice?.number}</Text>
          <TouchableOpacity onPress={() => { setShowShareModal(true); }}>
            <Text style={s.shareBtn}>Partager</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={s.modalContent}>
          <View style={s.invoiceDetailCard}>
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>Numéro</Text>
              <Text style={s.detailValue}>{selectedInvoice?.number}</Text>
            </View>
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>Date</Text>
              <Text style={s.detailValue}>{selectedInvoice?.date}</Text>
            </View>
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>Description</Text>
              <Text style={s.detailValue}>{selectedInvoice?.description}</Text>
            </View>
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>Montant</Text>
              <Text style={[s.detailValue, s.detailAmount]}>{selectedInvoice?.amount}</Text>
            </View>
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>Statut</Text>
              <View style={[s.statusBadge, { backgroundColor: getStatusColor(selectedInvoice?.status || 'pending') + '20' }]}>
                <Text style={[s.statusText, { color: getStatusColor(selectedInvoice?.status || 'pending') }]}>
                  {getStatusText(selectedInvoice?.status || 'pending')}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={s.downloadBtn}>
            <Text style={s.downloadBtnText}>📥 Télécharger PDF</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={s.payBtn} onPress={() => setShowPaymentModal(true)}>
            <Text style={s.payBtnText}>💳 Payer maintenant</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderShareModal = () => (
    <Modal visible={showShareModal} animationType="fade" onRequestClose={() => setShowShareModal(false)}>
      <View style={s.shareModalOverlay}>
        <View style={s.shareModal}>
          <Text style={s.shareModalTitle}>Partager la facture</Text>
          
          <TouchableOpacity style={s.shareOption}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.textMid} strokeWidth={2}>
              <Path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" strokeLinecap="round" strokeLinejoin="round"/>
              <Path d="M16 6l-4-4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
              <Path d="M12 2v13" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
            <Text style={s.shareOptionText}>Télécharger</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={s.shareOption}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.textMid} strokeWidth={2}>
              <Path d="M22 2L11 13" strokeLinecap="round" strokeLinejoin="round"/>
              <Path d="M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
            <Text style={s.shareOptionText}>Envoyer par email</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={s.shareOption}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.textMid} strokeWidth={2}>
              <Circle cx="18" cy="5" r="3" strokeLinecap="round" strokeLinejoin="round"/>
              <Circle cx="6" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round"/>
              <Circle cx="18" cy="19" r="3" strokeLinecap="round" strokeLinejoin="round"/>
              <Path d="M8.59 13.51l6.83 3.98" strokeLinecap="round" strokeLinejoin="round"/>
              <Path d="M15.41 6.51l-6.82 3.98" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
            <Text style={s.shareOptionText}>Partager sur WhatsApp</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={s.cancelBtn} onPress={() => setShowShareModal(false)}>
            <Text style={s.cancelBtnText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderPaymentModal = () => (
    <Modal visible={showPaymentModal} animationType="fade" onRequestClose={() => setShowPaymentModal(false)}>
      <View style={s.paymentModalOverlay}>
        <View style={s.paymentModal}>
          <Text style={s.paymentModalTitle}>Payer avec Visa</Text>
          
          <View style={s.paymentSummary}>
            <Text style={s.paymentSummaryLabel}>Facture</Text>
            <Text style={s.paymentSummaryValue}>{selectedInvoice?.number}</Text>
            <Text style={s.paymentSummaryLabel}>Montant</Text>
            <Text style={[s.paymentSummaryValue, s.paymentSummaryValueAmount]}>{selectedInvoice?.amount}</Text>
          </View>
          
          <View style={s.cardField}>
            <Text style={s.cardFieldLabel}>Numéro de carte</Text>
            <TextInput
              style={s.cardInput}
              value={cardNumber}
              onChangeText={setCardNumber}
              placeholder="4242 4242 4242 4242"
              keyboardType="numeric"
              maxLength={19}
            />
          </View>
          
          <View style={s.cardRow}>
            <View style={[s.cardField, s.cardFieldHalf]}>
              <Text style={s.cardFieldLabel}>Expiration</Text>
              <TextInput
                style={s.cardInput}
                value={cardExpiry}
                onChangeText={setCardExpiry}
                placeholder="MM/AA"
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            <View style={[s.cardField, s.cardFieldHalf]}>
              <Text style={s.cardFieldLabel}>CVC</Text>
              <TextInput
                style={s.cardInput}
                value={cardCvc}
                onChangeText={setCardCvc}
                placeholder="123"
                keyboardType="numeric"
                maxLength={3}
                secureTextEntry
              />
            </View>
          </View>
          
          <View style={s.cardField}>
            <Text style={s.cardFieldLabel}>Nom sur la carte</Text>
            <TextInput
              style={s.cardInput}
              value={cardName}
              onChangeText={setCardName}
              placeholder="JEAN DUPONT"
            />
          </View>
          
          <View style={s.cardBrands}>
            <View style={[s.cardBrand, { backgroundColor: '#1A1F71' }]}>
              <Text style={s.cardBrandText}>VISA</Text>
            </View>
            <View style={[s.cardBrand, { backgroundColor: '#EB001B' }]}>
              <View style={s.mastercardCircles}>
                <View style={[s.mastercardCircle, { backgroundColor: '#EB001B' }]} />
                <View style={[s.mastercardCircle, { backgroundColor: '#F79E1B', marginLeft: -6 }]} />
              </View>
            </View>
            <View style={[s.cardBrand, { backgroundColor: '#0066B2' }]}>
              <Text style={s.cardBrandText}>MC</Text>
            </View>
          </View>
          
          <TouchableOpacity style={s.confirmPaymentBtn}>
            <Text style={s.confirmPaymentBtnText}>💳 Payer {selectedInvoice?.amount}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={s.cancelBtn} onPress={() => setShowPaymentModal(false)}>
            <Text style={s.cancelBtnText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Factures</Text>
        <Text style={s.headerSub}>Gérez vos paiements et abonnements</Text>
      </View>

      <ScrollView style={s.content}>
        <View style={s.summaryCard}>
          <View style={s.summaryItem}>
            <Text style={s.summaryLabel}>Total dû</Text>
            <Text style={s.summaryValue}>75 000 F</Text>
          </View>
          <View style={s.summaryDivider} />
          <View style={s.summaryItem}>
            <Text style={s.summaryLabel}>Payé ce mois</Text>
            <Text style={[s.summaryValue, s.summaryValueGreen]}>25 000 F</Text>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Historique des factures</Text>
          {INVOICES.map(renderInvoiceItem)}
        </View>
      </ScrollView>

      {renderInvoiceDetail()}
      {renderShareModal()}
      {renderPaymentModal()}
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { padding: 24, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: C.textDark, marginBottom: 4 },
  headerSub: { fontSize: 14, color: C.textLight },
  content: { flex: 1 },
  
  summaryCard: {
    flexDirection: 'row', backgroundColor: C.surface, borderRadius: 16,
    padding: 20, marginHorizontal: 16, marginBottom: 24, borderWidth: 1, borderColor: C.border,
  },
  summaryItem: { flex: 1 },
  summaryLabel: { fontSize: 13, color: C.textLight, marginBottom: 6, fontWeight: '600' },
  summaryValue: { fontSize: 28, fontWeight: '900', color: C.textDark },
  summaryValueGreen: { color: C.success },
  summaryDivider: { width: 1, backgroundColor: C.border },
  
  section: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: C.textDark, marginBottom: 20, letterSpacing: -0.5 },
  
  invoiceItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface,
    borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: C.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4,
  },
  invoiceIcon: { marginRight: 16 },
  invoiceInfo: { flex: 1 },
  invoiceNumber: { fontSize: 16, fontWeight: '800', color: C.textDark, marginBottom: 3 },
  invoiceDescription: { fontSize: 14, color: C.textMid, marginBottom: 3 },
  invoiceDate: { fontSize: 12, color: C.textLight },
  invoiceRight: { alignItems: 'flex-end' },
  invoiceAmount: { fontSize: 18, fontWeight: '900', color: C.orange, marginBottom: 6 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  
  // Modal
  modal: { flex: 1, backgroundColor: C.bg },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 18, backgroundColor: C.surface,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  closeBtn: { fontSize: 16, fontWeight: '700', color: C.textMid },
  modalTitle: { fontSize: 18, fontWeight: '800', color: C.textDark },
  shareBtn: { fontSize: 16, fontWeight: '700', color: C.orange },
  modalContent: { flex: 1, padding: 20 },
  
  invoiceDetailCard: {
    backgroundColor: C.surface, borderRadius: 16, padding: 20,
    marginBottom: 20, borderWidth: 1, borderColor: C.border,
  },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  detailLabel: { fontSize: 14, color: C.textMid },
  detailValue: { fontSize: 14, fontWeight: '600', color: C.textDark },
  detailAmount: { fontSize: 18, fontWeight: '800', color: C.orange },
  
  downloadBtn: {
    backgroundColor: C.bg, borderRadius: 12, padding: 16,
    alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: C.border,
  },
  downloadBtnText: { fontSize: 15, fontWeight: '700', color: C.textDark },
  payBtn: {
    backgroundColor: C.orange, borderRadius: 12, padding: 16,
    alignItems: 'center',
  },
  payBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  
  // Share Modal
  shareModalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  shareModal: {
    backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24,
  },
  shareModalTitle: { fontSize: 20, fontWeight: '800', color: C.textDark, marginBottom: 20, textAlign: 'center' },
  shareOption: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    backgroundColor: C.bg, borderRadius: 12, marginBottom: 12,
  },
  shareOptionText: { fontSize: 15, fontWeight: '600', color: C.textDark, marginLeft: 16 },
  cancelBtn: { padding: 16, alignItems: 'center', marginTop: 8 },
  cancelBtnText: { fontSize: 16, fontWeight: '700', color: C.textMid },
  
  // Payment Modal
  paymentModalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center',
    padding: 20,
  },
  paymentModal: {
    backgroundColor: C.surface, borderRadius: 20, padding: 24,
  },
  paymentModalTitle: { fontSize: 20, fontWeight: '800', color: C.textDark, marginBottom: 20, textAlign: 'center' },
  paymentSummary: {
    backgroundColor: C.bg, borderRadius: 12, padding: 16,
    marginBottom: 20,
  },
  paymentSummaryLabel: { fontSize: 13, color: C.textLight, marginBottom: 4 },
  paymentSummaryValue: { fontSize: 15, fontWeight: '700', color: C.textDark, marginBottom: 12 },
  paymentSummaryValueAmount: { fontSize: 24, fontWeight: '900', color: C.orange },
  cardField: { marginBottom: 16 },
  cardFieldLabel: { fontSize: 13, fontWeight: '700', color: C.textMid, marginBottom: 8 },
  cardInput: {
    backgroundColor: C.bg, borderRadius: 10, padding: 14,
    fontSize: 14, color: C.textDark, borderWidth: 1, borderColor: C.border,
  },
  cardRow: { flexDirection: 'row', gap: 12 },
  cardFieldHalf: { flex: 1 },
  cardBrands: {
    flexDirection: 'row', justifyContent: 'center', gap: 16,
    marginBottom: 20,
  },
  cardBrand: {
    width: 50, height: 32, borderRadius: 6, alignItems: 'center',
    justifyContent: 'center',
  },
  cardBrandText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF' },
  mastercardCircles: { flexDirection: 'row' },
  mastercardCircle: { width: 16, height: 16, borderRadius: 8 },
  confirmPaymentBtn: {
    backgroundColor: C.orange, borderRadius: 12, padding: 16,
    alignItems: 'center', marginBottom: 12,
  },
  confirmPaymentBtnText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
});

export default InvoicesScreen;
