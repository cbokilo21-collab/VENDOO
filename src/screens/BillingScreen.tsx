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
  Billing: undefined; BusinessDashboard: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList>;

interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue';
  date: string;
  dueDate: string;
  items: { name: string; qty: number; price: number }[];
}

const INVOICES: Invoice[] = [];

const BillingScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  const filteredInvoices = filter === 'all'
    ? INVOICES
    : INVOICES.filter(inv => inv.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return C.success;
      case 'pending': return C.warning;
      case 'overdue': return C.error;
      default: return C.muted;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Payée';
      case 'pending': return 'En attente';
      case 'overdue': return 'En retard';
      default: return status;
    }
  };

  const handleSendReminder = (invoice: Invoice) => {
    Alert.alert(
      'Rappel envoyé',
      `Un rappel a été envoyé à ${invoice.client} pour la facture ${invoice.number}.`
    );
  };

  const handleMarkPaid = (invoice: Invoice) => {
    Alert.alert(
      'Marquer comme payée',
      `Voulez-vous marquer la facture ${invoice.number} comme payée ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => {
            Alert.alert('Succès', 'La facture a été marquée comme payée.');
            setSelectedInvoice(null);
          },
        },
      ]
    );
  };

  return (
    <View style={s.root}>
        <ScreenHeader title="Facturation" />
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.textDark} strokeWidth={2}>
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>📄 Facturation</Text>
          <Text style={s.headerSubtitle}>Gérez vos factures et paiements</Text>
        </View>
        <TouchableOpacity style={s.createBtn}>
          <Text style={s.createBtnText}>+ Nouvelle</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        <View style={s.statCard}>
          <Text style={s.statValue}>€ 0.00</Text>
          <Text style={s.statLabel}>Total facturé</Text>
        </View>
        <View style={s.statCard}>
          <Text style={[s.statValue, { color: C.warning }]}>€ 0.00</Text>
          <Text style={s.statLabel}>En attente</Text>
        </View>
        <View style={s.statCard}>
          <Text style={[s.statValue, { color: C.error }]}>€ 0.00</Text>
          <Text style={s.statLabel}>En retard</Text>
        </View>
      </View>

      {/* Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterRow}>
        {[
          { id: 'all', label: 'Toutes' },
          { id: 'paid', label: 'Payées' },
          { id: 'pending', label: 'En attente' },
          { id: 'overdue', label: 'En retard' },
        ].map(f => (
          <TouchableOpacity
            key={f.id}
            style={[s.filterChip, filter === f.id && s.filterChipActive]}
            onPress={() => setFilter(f.id as any)}
          >
            <Text style={[s.filterText, filter === f.id && s.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Invoices List */}
      <ScrollView contentContainerStyle={s.invoiceList} showsVerticalScrollIndicator={false}>
        {filteredInvoices.map(invoice => (
          <TouchableOpacity
            key={invoice.id}
            style={s.invoiceCard}
            onPress={() => setSelectedInvoice(invoice)}
            activeOpacity={0.75}
          >
            <View style={s.invoiceHeader}>
              <View>
                <Text style={s.invoiceNumber}>{invoice.number}</Text>
                <Text style={s.invoiceClient}>{invoice.client}</Text>
              </View>
              <View style={[s.statusBadge, { backgroundColor: getStatusColor(invoice.status) + '15' }]}>
                <Text style={[s.statusText, { color: getStatusColor(invoice.status) }]}>
                  {getStatusLabel(invoice.status)}
                </Text>
              </View>
            </View>
            
            <View style={s.invoiceDetails}>
              <View style={s.detailRow}>
                <Text style={s.detailLabel}>Montant</Text>
                <Text style={s.detailValue}>{invoice.currency} {invoice.amount.toFixed(2)}</Text>
              </View>
              <View style={s.detailRow}>
                <Text style={s.detailLabel}>Date</Text>
                <Text style={s.detailValue}>{invoice.date}</Text>
              </View>
              <View style={s.detailRow}>
                <Text style={s.detailLabel}>Échéance</Text>
                <Text style={[s.detailValue, invoice.status === 'overdue' && s.overdueText]}>
                  {invoice.dueDate}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Invoice Detail Modal */}
      <Modal visible={!!selectedInvoice} transparent animationType="slide" onRequestClose={() => setSelectedInvoice(null)}>
        {selectedInvoice && (
          <View style={s.modalOverlay}>
            <TouchableOpacity style={s.modalBackdrop} activeOpacity={1} onPress={() => setSelectedInvoice(null)} />
            <View style={s.modalContent}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>{selectedInvoice.number}</Text>
                <TouchableOpacity onPress={() => setSelectedInvoice(null)}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.textMid} strokeWidth={2}>
                    <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                </TouchableOpacity>
              </View>

              <View style={s.modalSection}>
                <Text style={s.modalSectionTitle}>Client</Text>
                <Text style={s.modalClientName}>{selectedInvoice.client}</Text>
              </View>

              <View style={s.modalSection}>
                <Text style={s.modalSectionTitle}>Articles</Text>
                {selectedInvoice.items.map((item, i) => (
                  <View key={i} style={s.itemRow}>
                    <Text style={s.itemName}>{item.name} x{item.qty}</Text>
                    <Text style={s.itemPrice}>{selectedInvoice.currency} {(item.price * item.qty).toFixed(2)}</Text>
                  </View>
                ))}
              </View>

              <View style={s.modalTotal}>
                <Text style={s.modalTotalLabel}>Total</Text>
                <Text style={s.modalTotalValue}>{selectedInvoice.currency} {selectedInvoice.amount.toFixed(2)}</Text>
              </View>

              <View style={s.modalActions}>
                {selectedInvoice.status !== 'paid' && (
                  <>
                    <TouchableOpacity
                      style={[s.modalActionBtn, s.reminderBtn]}
                      onPress={() => handleSendReminder(selectedInvoice)}
                    >
                      <Text style={s.reminderBtnText}>📧 Envoyer rappel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.modalActionBtn, s.markPaidBtn]}
                      onPress={() => handleMarkPaid(selectedInvoice)}
                    >
                      <Text style={s.markPaidBtnText}>✓ Marquer payée</Text>
                    </TouchableOpacity>
                  </>
                )}
                <TouchableOpacity style={[s.modalActionBtn, s.downloadBtn]}>
                  <Text style={s.downloadBtnText}>📥 Télécharger PDF</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
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
  createBtn: { backgroundColor: C.accent, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 9 },
  createBtnText: { color: C.white, fontSize: 13, fontWeight: '700' },
  
  statsRow: { flexDirection: 'row', gap: 12, padding: 16, backgroundColor: C.white },
  statCard: { flex: 1, backgroundColor: C.bg, borderRadius: 12, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: C.textDark },
  statLabel: { fontSize: 11, color: C.textMid, marginTop: 4 },
  
  filterScroll: { flexGrow: 0, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border },
  filterRow: { gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 22, backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border },
  filterChipActive: { backgroundColor: C.accent, borderColor: C.accent },
  filterText: { fontSize: 13, color: C.textMid, fontWeight: '500' },
  filterTextActive: { color: C.white, fontWeight: '700' },
  
  invoiceList: { padding: 16, gap: 12, paddingBottom: 24 },
  invoiceCard: { backgroundColor: C.white, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 },
  invoiceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  invoiceNumber: { fontSize: 15, fontWeight: '700', color: C.textDark },
  invoiceClient: { fontSize: 13, color: C.textMid, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '700' },
  invoiceDetails: { borderTopWidth: 1, borderTopColor: C.border, paddingTop: 12, gap: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: 12, color: C.textLight },
  detailValue: { fontSize: 13, fontWeight: '600', color: C.textDark },
  overdueText: { color: C.error },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBackdrop: { flex: 1 },
  modalContent: { backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: C.textDark },
  modalSection: { gap: 8 },
  modalSectionTitle: { fontSize: 12, fontWeight: '700', color: C.textMid, textTransform: 'uppercase', letterSpacing: 0.5 },
  modalClientName: { fontSize: 16, fontWeight: '700', color: C.textDark },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  itemName: { fontSize: 14, color: C.textDark },
  itemPrice: { fontSize: 14, fontWeight: '600', color: C.textMid },
  modalTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 2, borderTopColor: C.border },
  modalTotalLabel: { fontSize: 16, fontWeight: '700', color: C.textDark },
  modalTotalValue: { fontSize: 20, fontWeight: '900', color: C.accent },
  modalActions: { gap: 10, marginTop: 8 },
  modalActionBtn: { height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  reminderBtn: { backgroundColor: C.warning + '15', borderWidth: 1.5, borderColor: C.warning },
  reminderBtnText: { fontSize: 14, fontWeight: '700', color: C.warning },
  markPaidBtn: { backgroundColor: C.success },
  markPaidBtnText: { fontSize: 14, fontWeight: '700', color: C.white },
  downloadBtn: { backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border },
  downloadBtnText: { fontSize: 14, fontWeight: '600', color: C.textDark },
});

export default BillingScreen;
