import React, { useState, useEffect } from 'react';
import { ScreenHeader } from '../components/ScreenHeader';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  Dimensions, Alert, Modal, TextInput
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useAuth } from '../contexts/AuthContext';
import { AdminPreferencesService } from '../services/adminPreferencesService';
import { Currency, CurrencyService } from '../services/currencyService';

const C = {
  navy: '#FF6B35', navyMid: '#FF8A5C',
  bg: '#FFF7F3', surface: '#FFFFFF', border: '#E2E8F0',
  accent: '#FF6B35', accentSoft: 'rgba(255,107,53,0.1)',
  textDark: '#0F172A', textMid: '#475569', textLight: '#64748B', muted: '#94A3B8',
  success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6', purple: '#8B5CF6',
  white: '#FFFFFF',
};

type RootStackParamList = {
  Receivables: undefined; BusinessDashboard: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList>;

interface Receivable {
  id: string;
  client: string;
  amount: number;
  currency: string;
  status: 'pending' | 'partial' | 'overdue' | 'paid';
  dueDate: string;
  invoiceNumber: string;
  paidAmount: number;
  notes: string;
}

const RECEIVABLES: Receivable[] = [];

const ReceivablesScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'partial' | 'overdue'>('all');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('XAF');

  const filteredReceivables = filter === 'all'
    ? RECEIVABLES
    : RECEIVABLES.filter(rec => rec.status === filter);

  useEffect(() => {
    loadCurrency();
  }, [user]);

  const loadCurrency = async () => {
    if (!user) return;
    try {
      const prefs = await AdminPreferencesService.getPreferences(user.uid);
      setCurrency(prefs.currency);
    } catch (error) {
      console.error('Error loading currency:', error);
    }
  };

  const formatAmount = (amount: number) => {
    return CurrencyService.format(amount, currency);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return C.warning;
      case 'partial': return C.info;
      case 'overdue': return C.error;
      default: return C.muted;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'partial': return 'Partiel';
      case 'overdue': return 'En retard';
      default: return status;
    }
  };

  const handleRecordPayment = (receivable: Receivable) => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide.');
      return;
    }
    if (amount > (receivable.amount - receivable.paidAmount)) {
      Alert.alert('Erreur', 'Le montant dépasse le reste à payer.');
      return;
    }
    
    Alert.alert(
      'Confirmation',
      `Enregistrer un paiement de ${receivable.currency} ${amount.toFixed(2)} pour ${receivable.client} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => {
            Alert.alert('Succès', 'Paiement enregistré avec succès.');
            setPaymentAmount('');
            setSelectedReceivable(null);
          },
        },
      ]
    );
  };

  const handleSendReminder = (receivable: Receivable) => {
    Alert.alert(
      'Rappel envoyé',
      `Un rappel de paiement a été envoyé à ${receivable.client}.`
    );
  };

  const remainingAmount = (receivable: Receivable) => receivable.amount - receivable.paidAmount;
  const progressPercent = (receivable: Receivable) => (receivable.paidAmount / receivable.amount) * 100;

  return (
    <View style={s.root}>
        <ScreenHeader title="Créances" />
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.textDark} strokeWidth={2}>
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>💰 Créances</Text>
          <Text style={s.headerSubtitle}>Suivi des paiements clients</Text>
        </View>
        <TouchableOpacity style={s.createBtn}>
          <Text style={s.createBtnText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        <View style={s.statCard}>
          <Text style={s.statValue}>{formatAmount(0)}</Text>
          <Text style={s.statLabel}>Total créances</Text>
        </View>
        <View style={s.statCard}>
          <Text style={[s.statValue, { color: C.success }]}>{formatAmount(0)}</Text>
          <Text style={s.statLabel}>Encaissé</Text>
        </View>
        <View style={s.statCard}>
          <Text style={[s.statValue, { color: C.warning }]}>{formatAmount(0)}</Text>
          <Text style={s.statLabel}>À encaisser</Text>
        </View>
      </View>

      {/* Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterRow}>
        {[
          { id: 'all', label: 'Toutes' },
          { id: 'pending', label: 'En attente' },
          { id: 'partial', label: 'Partiel' },
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

      {/* Receivables List */}
      <ScrollView contentContainerStyle={s.receivablesList} showsVerticalScrollIndicator={false}>
        {filteredReceivables.map(receivable => (
          <TouchableOpacity
            key={receivable.id}
            style={s.receivableCard}
            onPress={() => setSelectedReceivable(receivable)}
            activeOpacity={0.75}
          >
            <View style={s.receivableHeader}>
              <View>
                <Text style={s.clientName}>{receivable.client}</Text>
                <Text style={s.invoiceNumber}>{receivable.invoiceNumber}</Text>
              </View>
              <View style={[s.statusBadge, { backgroundColor: getStatusColor(receivable.status) + '15' }]}>
                <Text style={[s.statusText, { color: getStatusColor(receivable.status) }]}>
                  {getStatusLabel(receivable.status)}
                </Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={s.progressContainer}>
              <View style={s.progressBar}>
                <View style={[s.progressFill, { width: `${progressPercent(receivable)}%`, backgroundColor: getStatusColor(receivable.status) }]} />
              </View>
              <Text style={s.progressText}>{progressPercent(receivable).toFixed(0)}%</Text>
            </View>

            <View style={s.receivableDetails}>
              <View style={s.detailRow}>
                <Text style={s.detailLabel}>Total</Text>
                <Text style={s.detailValue}>{receivable.currency} {receivable.amount.toFixed(2)}</Text>
              </View>
              <View style={s.detailRow}>
                <Text style={s.detailLabel}>Payé</Text>
                <Text style={[s.detailValue, { color: C.success }]}>{receivable.currency} {receivable.paidAmount.toFixed(2)}</Text>
              </View>
              <View style={s.detailRow}>
                <Text style={s.detailLabel}>Reste</Text>
                <Text style={[s.detailValue, { color: C.warning }]}>{receivable.currency} {remainingAmount(receivable).toFixed(2)}</Text>
              </View>
              <View style={s.detailRow}>
                <Text style={s.detailLabel}>Échéance</Text>
                <Text style={[s.detailValue, receivable.status === 'overdue' && s.overdueText]}>
                  {receivable.dueDate}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Receivable Detail Modal */}
      <Modal visible={!!selectedReceivable} transparent animationType="slide" onRequestClose={() => setSelectedReceivable(null)}>
        {selectedReceivable && (
          <View style={s.modalOverlay}>
            <TouchableOpacity style={s.modalBackdrop} activeOpacity={1} onPress={() => setSelectedReceivable(null)} />
            <View style={s.modalContent}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>{selectedReceivable.client}</Text>
                <TouchableOpacity onPress={() => setSelectedReceivable(null)}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.textMid} strokeWidth={2}>
                    <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                </TouchableOpacity>
              </View>

              <View style={s.modalSection}>
                <Text style={s.modalSectionTitle}>Facture</Text>
                <Text style={s.modalInvoiceNum}>{selectedReceivable.invoiceNumber}</Text>
              </View>

              <View style={s.modalProgress}>
                <View style={s.modalProgressBar}>
                  <View style={[s.modalProgressFill, { width: `${progressPercent(selectedReceivable)}%`, backgroundColor: getStatusColor(selectedReceivable.status) }]} />
                </View>
                <Text style={s.modalProgressText}>{progressPercent(selectedReceivable).toFixed(0)}% payé</Text>
              </View>

              <View style={s.modalAmounts}>
                <View style={s.modalAmountRow}>
                  <Text style={s.modalAmountLabel}>Total</Text>
                  <Text style={s.modalAmountValue}>{selectedReceivable.currency} {selectedReceivable.amount.toFixed(2)}</Text>
                </View>
                <View style={s.modalAmountRow}>
                  <Text style={s.modalAmountLabel}>Payé</Text>
                  <Text style={[s.modalAmountValue, { color: C.success }]}>{selectedReceivable.currency} {selectedReceivable.paidAmount.toFixed(2)}</Text>
                </View>
                <View style={s.modalAmountRow}>
                  <Text style={s.modalAmountLabel}>Reste à payer</Text>
                  <Text style={[s.modalAmountValue, { color: C.warning, fontWeight: '800' }]}>{selectedReceivable.currency} {remainingAmount(selectedReceivable).toFixed(2)}</Text>
                </View>
              </View>

              <View style={s.modalSection}>
                <Text style={s.modalSectionTitle}>Notes</Text>
                <Text style={s.modalNotes}>{selectedReceivable.notes}</Text>
              </View>

              {/* Payment Input */}
              {selectedReceivable.status !== 'paid' && (
                <View style={s.paymentSection}>
                  <Text style={s.paymentLabel}>Enregistrer un paiement</Text>
                  <View style={s.paymentInputRow}>
                    <TextInput
                      style={s.paymentInput}
                      placeholder="0.00"
                      placeholderTextColor={C.muted}
                      value={paymentAmount}
                      onChangeText={setPaymentAmount}
                      keyboardType="decimal-pad"
                    />
                    <Text style={s.paymentCurrency}>{selectedReceivable.currency}</Text>
                  </View>
                  <TouchableOpacity
                    style={s.recordPaymentBtn}
                    onPress={() => handleRecordPayment(selectedReceivable)}
                  >
                    <Text style={s.recordPaymentBtnText}>Enregistrer le paiement</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={s.modalActions}>
                <TouchableOpacity
                  style={[s.modalActionBtn, s.reminderBtn]}
                  onPress={() => handleSendReminder(selectedReceivable)}
                >
                  <Text style={s.reminderBtnText}>📧 Envoyer rappel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.modalActionBtn, s.viewInvoiceBtn]}>
                  <Text style={s.viewInvoiceBtnText}>📄 Voir facture</Text>
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
  
  receivablesList: { padding: 16, gap: 12, paddingBottom: 24 },
  receivableCard: { backgroundColor: C.white, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 },
  receivableHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  clientName: { fontSize: 15, fontWeight: '700', color: C.textDark },
  invoiceNumber: { fontSize: 12, color: C.textMid, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '700' },
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  progressBar: { flex: 1, height: 6, backgroundColor: C.bg, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 11, fontWeight: '700', color: C.textMid, minWidth: 35 },
  receivableDetails: { borderTopWidth: 1, borderTopColor: C.border, paddingTop: 12, gap: 6 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: 12, color: C.textLight },
  detailValue: { fontSize: 13, fontWeight: '600', color: C.textDark },
  overdueText: { color: C.error },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBackdrop: { flex: 1 },
  modalContent: { backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 16, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: C.textDark },
  modalSection: { gap: 6 },
  modalSectionTitle: { fontSize: 12, fontWeight: '700', color: C.textMid, textTransform: 'uppercase', letterSpacing: 0.5 },
  modalInvoiceNum: { fontSize: 14, fontWeight: '600', color: C.textDark },
  modalProgress: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modalProgressBar: { flex: 1, height: 8, backgroundColor: C.bg, borderRadius: 4, overflow: 'hidden' },
  modalProgressFill: { height: '100%', borderRadius: 4 },
  modalProgressText: { fontSize: 13, fontWeight: '700', color: C.textMid, minWidth: 45 },
  modalAmounts: { backgroundColor: C.bg, borderRadius: 12, padding: 16, gap: 8 },
  modalAmountRow: { flexDirection: 'row', justifyContent: 'space-between' },
  modalAmountLabel: { fontSize: 13, color: C.textMid },
  modalAmountValue: { fontSize: 15, fontWeight: '700', color: C.textDark },
  modalNotes: { fontSize: 14, color: C.textDark, lineHeight: 20 },
  paymentSection: { gap: 10 },
  paymentLabel: { fontSize: 14, fontWeight: '700', color: C.textDark },
  paymentInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  paymentInput: { flex: 1, height: 48, borderWidth: 1.5, borderColor: C.border, borderRadius: 10, paddingHorizontal: 16, fontSize: 16, fontWeight: '600', color: C.textDark, backgroundColor: C.white },
  paymentCurrency: { fontSize: 16, fontWeight: '700', color: C.textMid },
  recordPaymentBtn: { backgroundColor: C.success, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  recordPaymentBtnText: { fontSize: 15, fontWeight: '700', color: C.white },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  modalActionBtn: { flex: 1, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  reminderBtn: { backgroundColor: C.warning + '15', borderWidth: 1.5, borderColor: C.warning },
  reminderBtnText: { fontSize: 13, fontWeight: '700', color: C.warning },
  viewInvoiceBtn: { backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border },
  viewInvoiceBtnText: { fontSize: 13, fontWeight: '600', color: C.textDark },
});

export default ReceivablesScreen;
