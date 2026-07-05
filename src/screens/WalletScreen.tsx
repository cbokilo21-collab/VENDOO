import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { tokenService, TokenWallet, TokenTransaction, TOKEN_VALUE_USD, TOKEN_VALUE_FCFA, MINIMUM_WITHDRAWAL_TOKENS } from '../services/TokenService';

type Nav = NavigationProp<any>;

const C = {
  navy: '#FF6B35',
  bg: '#FFF7F3',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  textDark: '#111827',
  textMid: '#374151',
  textLight: '#6B7280',
  muted: '#9CA3AF',
  white: '#FFFFFF',
  success: '#10B981',
  error: '#EF4444',
};

const WalletScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<TokenWallet | null>(null);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);

  useEffect(() => {
    loadWalletData();
  }, [user]);

  const loadWalletData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const walletData = await tokenService.getWallet(user.uid);
      setWallet(walletData);

      const transactionsData = await tokenService.getTransactions(user.uid);
      setTransactions(transactionsData.reverse());
    } catch (error) {
      console.error('Error loading wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = () => {
    if (!wallet || !tokenService.canWithdraw(wallet.balance)) {
      Alert.alert(
        'Retrait impossible',
        `Vous devez avoir au moins ${MINIMUM_WITHDRAWAL_TOKENS} VENDOO (${(MINIMUM_WITHDRAWAL_TOKENS * TOKEN_VALUE_USD).toFixed(2)}$) pour effectuer un retrait.`
      );
      return;
    }

    Alert.alert(
      'Retrait',
      `Vous pouvez retirer ${tokenService.formatTokensToUSD(wallet.balance)} (${tokenService.formatTokensToFCFA(wallet.balance)}).`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', onPress: () => Alert.alert('Info', 'La fonctionnalité de retrait sera bientôt disponible.') }
      ]
    );
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earn': return '💰';
      case 'spend': return '🛒';
      case 'transfer': return '↔️';
      case 'reward': return '🎁';
      case 'referral': return '👥';
      default: return '💳';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earn':
      case 'reward':
      case 'referral':
        return C.success;
      case 'spend':
        return C.error;
      default:
        return C.navy;
    }
  };

  if (loading) {
    return (
      <View style={s.root}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Portefeuille Vendoo</Text>
        </View>
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={C.navy} />
        </View>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Portefeuille Vendoo</Text>
      </View>

      <ScrollView style={s.content}>
        <View style={s.balanceCard}>
          <Text style={s.balanceLabel}>Solde actuel</Text>
          <Text style={s.balanceAmount}>
            {wallet ? tokenService.formatTokens(wallet.balance) : '0.00 VENDOO'}
          </Text>
          <View style={s.balanceDetails}>
            <View style={s.balanceDetail}>
              <Text style={s.detailLabel}>En USD</Text>
              <Text style={s.detailValue}>
                {wallet ? tokenService.formatTokensToUSD(wallet.balance) : '0.00$'}
              </Text>
            </View>
            <View style={s.balanceDetail}>
              <Text style={s.detailLabel}>En FCFA</Text>
              <Text style={s.detailValue}>
                {wallet ? tokenService.formatTokensToFCFA(wallet.balance) : '0 FCFA'}
              </Text>
            </View>
          </View>
        </View>

        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statLabel}>Total gagné</Text>
            <Text style={s.statValue}>
              {wallet ? tokenService.formatTokens(wallet.totalEarned) : '0 VENDOO'}
            </Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statLabel}>Total dépensé</Text>
            <Text style={s.statValue}>
              {wallet ? tokenService.formatTokens(wallet.totalSpent) : '0 VENDOO'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[s.withdrawBtn, (!wallet || !tokenService.canWithdraw(wallet.balance)) ? s.withdrawBtnDisabled : null]}
          onPress={handleWithdraw}
          disabled={!wallet || !tokenService.canWithdraw(wallet.balance)}
        >
          <Text style={s.withdrawBtnText}>Retirer</Text>
        </TouchableOpacity>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Historique des transactions</Text>
          
          {transactions.length === 0 ? (
            <View style={s.emptyState}>
              <Text style={s.emptyText}>Aucune transaction</Text>
            </View>
          ) : (
            transactions.map((transaction) => (
              <View key={transaction.id} style={s.transactionItem}>
                <View style={s.transactionIcon}>
                  <Text style={s.icon}>{getTransactionIcon(transaction.type)}</Text>
                </View>
                <View style={s.transactionDetails}>
                  <Text style={s.transactionDescription}>{transaction.description}</Text>
                  <Text style={s.transactionDate}>
                    {new Date(transaction.createdAt).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
                <Text style={[s.transactionAmount, { color: getTransactionColor(transaction.type) }]}>
                  {transaction.type === 'spend' ? '-' : '+'}
                  {tokenService.formatTokens(transaction.amount)}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={s.infoBox}>
          <Text style={s.infoTitle}>💡 Informations</Text>
          <Text style={s.infoText}>1 VENDOO = {TOKEN_VALUE_USD}$ = {TOKEN_VALUE_FCFA} FCFA</Text>
          <Text style={s.infoText}>Retrait minimum: {MINIMUM_WITHDRAWAL_TOKENS} VENDOO ({(MINIMUM_WITHDRAWAL_TOKENS * TOKEN_VALUE_USD).toFixed(2)}$)</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  backBtnText: {
    fontSize: 20,
    color: C.navy,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.textDark,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  balanceCard: {
    backgroundColor: C.navy,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: C.white,
    opacity: 0.8,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: C.white,
    marginBottom: 16,
  },
  balanceDetails: {
    flexDirection: 'row',
    gap: 20,
  },
  balanceDetail: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: C.white,
    opacity: 0.7,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: C.white,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  statLabel: {
    fontSize: 12,
    color: C.textMid,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textDark,
  },
  withdrawBtn: {
    backgroundColor: C.success,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  withdrawBtnDisabled: {
    backgroundColor: C.muted,
  },
  withdrawBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  emptyText: {
    fontSize: 14,
    color: C.textLight,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textDark,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: C.textLight,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  infoBox: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: C.textMid,
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default WalletScreen;
