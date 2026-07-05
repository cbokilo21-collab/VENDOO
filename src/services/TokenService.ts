import { FirestoreService } from './firestoreService';
import { where } from 'firebase/firestore';

export interface TokenWallet {
  id?: string;
  userId: string;
  balance: number;
  currency: 'VENDOO';
  totalEarned: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenTransaction {
  id: string;
  userId: string;
  type: 'earn' | 'spend' | 'transfer' | 'reward' | 'referral';
  amount: number;
  description: string;
  fromUserId?: string;
  toUserId?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  referredEmail: string;
  status: 'pending' | 'active' | 'completed';
  referralDate: Date;
  firstSaleDate?: Date;
  commissionEarned: number;
  commissionPaid: boolean;
}

// Token values
export const TOKEN_VALUE_USD = 0.40;
export const TOKEN_VALUE_FCFA = 272;
export const MINIMUM_WITHDRAWAL_TOKENS = 100;
export const MINIMUM_WITHDRAWAL_USD = MINIMUM_WITHDRAWAL_TOKENS * TOKEN_VALUE_USD;

// Referral bonuses
export const REFERRAL_COMMISSION_PERCENTAGE = 10; // 10% of first sale
export const VENDOO_COMMISSION_PERCENTAGE = 2; // 2% of Vendoo commission
export const REFERRAL_COMMISSION_OF_VENDOO = 5; // 5% of the 2% = 0.1%
export const MERCHANTS_FOR_BONUS = 100;
export const MERCHANT_BONUS_TOKENS = 2;
export const BUYERS_FOR_BONUS = 100;
export const BUYER_BONUS_TOKENS = 1;
export const FIRST_PACK_PURCHASE_BONUS_PERCENTAGE = 2; // 2% bonus

class TokenService {
  private collection = 'tokenWallets';
  private transactionsCollection = 'tokenTransactions';
  private referralsCollection = 'referrals';

  async getWallet(userId: string): Promise<TokenWallet | null> {
    const wallets = await FirestoreService.query<TokenWallet>(this.collection, [
      where('userId', '==', userId),
    ]);
    return wallets.length > 0 ? wallets[0] : null;
  }

  async createWallet(userId: string): Promise<TokenWallet> {
    const wallet: TokenWallet = {
      userId,
      balance: 0,
      currency: 'VENDOO',
      totalEarned: 0,
      totalSpent: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const walletId = await FirestoreService.create(this.collection, wallet);
    return { ...wallet, id: walletId };
  }

  async addTokens(
    userId: string,
    amount: number,
    description: string,
    type: TokenTransaction['type'] = 'earn',
    fromUserId?: string
  ): Promise<void> {
    let wallet = await this.getWallet(userId);
    if (!wallet) {
      wallet = await this.createWallet(userId);
    }

    // Update wallet
    await FirestoreService.update(this.collection, wallet.id!, {
      balance: wallet.balance + amount,
      totalEarned: wallet.totalEarned + amount,
      updatedAt: new Date(),
    });

    // Create transaction record
    const transaction: Omit<TokenTransaction, 'id'> = {
      userId,
      type,
      amount,
      description,
      fromUserId,
      status: 'completed',
      createdAt: new Date(),
      completedAt: new Date(),
    };
    await FirestoreService.create(this.transactionsCollection, transaction);
  }

  async spendTokens(
    userId: string,
    amount: number,
    description: string
  ): Promise<boolean> {
    const wallet = await this.getWallet(userId);
    if (!wallet || wallet.balance < amount) {
      return false;
    }

    // Update wallet
    await FirestoreService.update(this.collection, wallet.id!, {
      balance: wallet.balance - amount,
      totalSpent: wallet.totalSpent + amount,
      updatedAt: new Date(),
    });

    // Create transaction record
    const transaction: Omit<TokenTransaction, 'id'> = {
      userId,
      type: 'spend',
      amount,
      description,
      status: 'completed',
      createdAt: new Date(),
      completedAt: new Date(),
    };
    await FirestoreService.create(this.transactionsCollection, transaction);

    return true;
  }

  async getTransactions(userId: string): Promise<TokenTransaction[]> {
    return FirestoreService.query<TokenTransaction>(this.transactionsCollection, [
      where('userId', '==', userId),
    ]);
  }

  async createReferral(
    referrerId: string,
    referredId: string,
    referredEmail: string
  ): Promise<string> {
    const referral: Omit<Referral, 'id'> = {
      referrerId,
      referredId,
      referredEmail,
      status: 'pending',
      referralDate: new Date(),
      commissionEarned: 0,
      commissionPaid: false,
    };
    return FirestoreService.create(this.referralsCollection, referral);
  }

  async getReferrals(referrerId: string): Promise<Referral[]> {
    return FirestoreService.query<Referral>(this.referralsCollection, [
      where('referrerId', '==', referrerId),
    ]);
  }

  async processFirstSaleCommission(
    referredId: string,
    saleAmount: number
  ): Promise<void> {
    const referrals = await FirestoreService.query<Referral>(this.referralsCollection, [
      where('referredId', '==', referredId),
      where('status', '==', 'pending'),
    ]);

    if (referrals.length === 0) return;

    const referral = referrals[0];
    const commission = saleAmount * (REFERRAL_COMMISSION_PERCENTAGE / 100);
    const tokensEarned = commission / TOKEN_VALUE_USD;

    // Update referral
    await FirestoreService.update(this.referralsCollection, referral.id, {
      status: 'completed',
      firstSaleDate: new Date(),
      commissionEarned: commission,
    });

    // Add tokens to referrer
    await this.addTokens(
      referral.referrerId,
      Math.floor(tokensEarned),
      `Commission de parrainage - Première vente de ${referral.referredEmail}`,
      'referral',
      referredId
    );
  }

  async processPackPurchaseBonus(
    userId: string,
    packPrice: number
  ): Promise<void> {
    const bonus = packPrice * (FIRST_PACK_PURCHASE_BONUS_PERCENTAGE / 100);
    const tokensEarned = bonus / TOKEN_VALUE_USD;

    await this.addTokens(
      userId,
      Math.floor(tokensEarned),
      `Bonus achat premier pack (${packPrice}$)`,
      'reward'
    );
  }

  async checkAndAwardMerchantBonus(userId: string): Promise<void> {
    const referrals = await this.getReferrals(userId);
    const activeMerchants = referrals.filter(
      r => r.status === 'completed' || r.status === 'active'
    );

    if (activeMerchants.length >= MERCHANTS_FOR_BONUS) {
      await this.addTokens(
        userId,
        MERCHANT_BONUS_TOKENS,
        `Bonus: ${MERCHANTS_FOR_BONUS} marchands parrainés`,
        'reward'
      );
    }
  }

  async checkAndAwardBuyerBonus(userId: string): Promise<void> {
    // This would be implemented when buyer tracking is added
    // For now, placeholder
  }

  formatTokens(tokens: number): string {
    return `${tokens.toFixed(2)} VENDOO`;
  }

  formatTokensToUSD(tokens: number): string {
    return `${(tokens * TOKEN_VALUE_USD).toFixed(2)}$`;
  }

  formatTokensToFCFA(tokens: number): string {
    return `${(tokens * TOKEN_VALUE_FCFA).toFixed(0)} FCFA`;
  }

  canWithdraw(tokens: number): boolean {
    return tokens >= MINIMUM_WITHDRAWAL_TOKENS;
  }
}

export const tokenService = new TokenService();
