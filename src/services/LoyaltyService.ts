// ─── Loyalty Program Service ─────────────────────────────────────────────────
// Customer loyalty management with points, tiers, rewards, and gamification

export interface LoyaltyCustomer {
  customerId: string;
  customerName: string;
  customerEmail: string;
  points: number;
  tier: LoyaltyTier;
  totalSpent: number;
  totalOrders: number;
  joinDate: string;
  lastActivity: string;
  rewards: Reward[];
  streakDays: number;
  referralCount: number;
  birthday?: string;
  preferences: {
    notifications: boolean;
    emailMarketing: boolean;
    smsOffers: boolean;
  };
}

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface TierConfig {
  name: string;
  minPoints: number;
  minSpent: number;
  benefits: string[];
  pointMultiplier: number;
  discountPercent: number;
  freeShippingThreshold: number;
  color: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  type: 'discount' | 'free_product' | 'free_shipping' | 'exclusive_access' | 'early_access';
  pointsRequired: number;
  value: number;
  expiryDate?: string;
  redeemed: boolean;
  redeemedAt?: string;
}

export interface PointsTransaction {
  id: string;
  customerId: string;
  customerName: string;
  points: number;
  type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  reason: string;
  orderId?: string;
  timestamp: string;
  expiryDate?: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  referrerName: string;
  referredEmail: string;
  referredName?: string;
  status: 'pending' | 'completed' | 'converted';
  pointsEarned: number;
  createdAt: string;
  completedAt?: string;
}

class LoyaltyService {
  private customers: Map<string, LoyaltyCustomer> = new Map();
  private transactions: PointsTransaction[] = [];
  private referrals: Referral[] = [];
  private rewards: Reward[] = [];

  private readonly tierConfigs: Record<LoyaltyTier, TierConfig> = {
    bronze: {
      name: 'Bronze',
      minPoints: 0,
      minSpent: 0,
      benefits: ['Accès au programme', '1 point par € dépensé'],
      pointMultiplier: 1,
      discountPercent: 0,
      freeShippingThreshold: 100,
      color: '#CD7F32',
    },
    silver: {
      name: 'Silver',
      minPoints: 500,
      minSpent: 250,
      benefits: ['2x points', '5% de réduction', 'Livraison gratuite dès 75€'],
      pointMultiplier: 2,
      discountPercent: 5,
      freeShippingThreshold: 75,
      color: '#C0C0C0',
    },
    gold: {
      name: 'Gold',
      minPoints: 2000,
      minSpent: 1000,
      benefits: ['3x points', '10% de réduction', 'Livraison gratuite', 'Accès VIP'],
      pointMultiplier: 3,
      discountPercent: 10,
      freeShippingThreshold: 0,
      color: '#FFD700',
    },
    platinum: {
      name: 'Platinum',
      minPoints: 5000,
      minSpent: 2500,
      benefits: ['4x points', '15% de réduction', 'Livraison gratuite', 'Support prioritaire', 'Offres exclusives'],
      pointMultiplier: 4,
      discountPercent: 15,
      freeShippingThreshold: 0,
      color: '#E5E4E2',
    },
    diamond: {
      name: 'Diamond',
      minPoints: 10000,
      minSpent: 5000,
      benefits: ['5x points', '20% de réduction', 'Livraison gratuite', 'Conciergerie', 'Événements exclusifs'],
      pointMultiplier: 5,
      discountPercent: 20,
      freeShippingThreshold: 0,
      color: '#B9F2FF',
    },
  };

  // ─── Customer Management ─────────────────────────────────────────────────────

  enrollCustomer(customerId: string, customerName: string, customerEmail: string): LoyaltyCustomer {
    const customer: LoyaltyCustomer = {
      customerId,
      customerName,
      customerEmail,
      points: 0,
      tier: 'bronze',
      totalSpent: 0,
      totalOrders: 0,
      joinDate: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      rewards: [],
      streakDays: 0,
      referralCount: 0,
      preferences: {
        notifications: true,
        emailMarketing: true,
        smsOffers: false,
      },
    };

    this.customers.set(customerId, customer);
    return customer;
  }

  getCustomer(customerId: string): LoyaltyCustomer | undefined {
    return this.customers.get(customerId);
  }

  // ─── Points Management ───────────────────────────────────────────────────────

  addPoints(customerId: string, points: number, reason: string, orderId?: string): void {
    const customer = this.customers.get(customerId);
    if (!customer) return;

    const tierMultiplier = this.tierConfigs[customer.tier].pointMultiplier;
    const finalPoints = points * tierMultiplier;

    customer.points += finalPoints;
    customer.lastActivity = new Date().toISOString();

    const transaction: PointsTransaction = {
      id: `TXN-${Date.now()}`,
      customerId,
      customerName: customer.customerName,
      points: finalPoints,
      type: 'earned',
      reason,
      orderId,
      timestamp: new Date().toISOString(),
      expiryDate: this.calculatePointsExpiry(),
    };

    this.transactions.unshift(transaction);
    this.updateCustomerTier(customer);
  }

  redeemPoints(customerId: string, points: number, reason: string): boolean {
    const customer = this.customers.get(customerId);
    if (!customer || customer.points < points) return false;

    customer.points -= points;
    customer.lastActivity = new Date().toISOString();

    const transaction: PointsTransaction = {
      id: `TXN-${Date.now()}`,
      customerId,
      customerName: customer.customerName,
      points: -points,
      type: 'redeemed',
      reason,
      timestamp: new Date().toISOString(),
    };

    this.transactions.unshift(transaction);
    this.updateCustomerTier(customer);
    return true;
  }

  private calculatePointsExpiry(): string {
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    return expiryDate.toISOString();
  }

  // ─── Tier Management ─────────────────────────────────────────────────────────

  private updateCustomerTier(customer: LoyaltyCustomer): void {
    let newTier: LoyaltyTier = 'bronze';

    for (const [tier, config] of Object.entries(this.tierConfigs)) {
      if (customer.points >= config.minPoints && customer.totalSpent >= config.minSpent) {
        newTier = tier as LoyaltyTier;
      }
    }

    if (newTier !== customer.tier) {
      customer.tier = newTier;
      // Send tier upgrade notification
      this.sendTierUpgradeNotification(customer, newTier);
    }
  }

  private sendTierUpgradeNotification(customer: LoyaltyCustomer, newTier: LoyaltyTier): void {
    // In a real implementation, this would send an email/push notification
    console.log(`🎉 ${customer.customerName} upgraded to ${newTier} tier!`);
  }

  getTierConfig(tier: LoyaltyTier): TierConfig {
    return this.tierConfigs[tier];
  }

  // ─── Rewards Management ─────────────────────────────────────────────────────

  createReward(reward: Omit<Reward, 'id' | 'redeemed'>): Reward {
    const newReward: Reward = {
      ...reward,
      id: `RWD-${Date.now()}`,
      redeemed: false,
    };
    this.rewards.push(newReward);
    return newReward;
  }

  redeemReward(customerId: string, rewardId: string): boolean {
    const customer = this.customers.get(customerId);
    if (!customer) return false;

    const reward = this.rewards.find(r => r.id === rewardId && !r.redeemed);
    if (!reward || customer.points < reward.pointsRequired) return false;

    customer.points -= reward.pointsRequired;
    reward.redeemed = true;
    reward.redeemedAt = new Date().toISOString();
    customer.rewards.push(reward);

    const transaction: PointsTransaction = {
      id: `TXN-${Date.now()}`,
      customerId,
      customerName: customer.customerName,
      points: -reward.pointsRequired,
      type: 'redeemed',
      reason: `Redeemed reward: ${reward.name}`,
      timestamp: new Date().toISOString(),
    };

    this.transactions.unshift(transaction);
    this.updateCustomerTier(customer);
    return true;
  }

  getAvailableRewards(customerId: string): Reward[] {
    const customer = this.customers.get(customerId);
    if (!customer) return [];

    return this.rewards.filter(
      r => !r.redeemed && 
           customer.points >= r.pointsRequired &&
           (!r.expiryDate || new Date(r.expiryDate) > new Date())
    );
  }

  // ─── Referral Program ───────────────────────────────────────────────────────

  createReferral(referrerId: string, referrerName: string, referredEmail: string): Referral {
    const referral: Referral = {
      id: `REF-${Date.now()}`,
      referrerId,
      referrerName,
      referredEmail,
      status: 'pending',
      pointsEarned: 0,
      createdAt: new Date().toISOString(),
    };

    this.referrals.push(referral);
    return referral;
  }

  completeReferral(referralId: string, referredName?: string): void {
    const referral = this.referrals.find(r => r.id === referralId);
    if (!referral || referral.status !== 'pending') return;

    referral.status = 'completed';
    referral.referredName = referredName;
    referral.completedAt = new Date().toISOString();

    // Award points to referrer
    const referrer = this.customers.get(referral.referrerId);
    if (referrer) {
      const pointsEarned = 500; // 500 points for successful referral
      referral.pointsEarned = pointsEarned;
      referrer.referralCount++;
      this.addPoints(referral.referrerId, pointsEarned, 'Referral bonus');
    }
  }

  // ─── Streak & Gamification ───────────────────────────────────────────────────

  updateStreak(customerId: string): void {
    const customer = this.customers.get(customerId);
    if (!customer) return;

    const lastActivity = new Date(customer.lastActivity);
    const today = new Date();
    const daysSinceLastActivity = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceLastActivity === 1) {
      customer.streakDays++;
      // Bonus points for streak
      if (customer.streakDays % 7 === 0) {
        this.addPoints(customerId, customer.streakDays * 10, `Streak bonus: ${customer.streakDays} days`);
      }
    } else if (daysSinceLastActivity > 1) {
      customer.streakDays = 1;
    }

    customer.lastActivity = today.toISOString();
  }

  // ─── Analytics ───────────────────────────────────────────────────────────────

  getLoyaltyStats(days: number = 30): {
    totalMembers: number;
    activeMembers: number;
    totalPointsIssued: number;
    totalPointsRedeemed: number;
    tierDistribution: Record<LoyaltyTier, number>;
    topEarners: Array<{ customerId: string; customerName: string; points: number }>;
    referralConversionRate: number;
  } {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const activeMembers = Array.from(this.customers.values()).filter(
      c => new Date(c.lastActivity) >= cutoffDate
    ).length;

    const recentTransactions = this.transactions.filter(
      t => new Date(t.timestamp) >= cutoffDate
    );

    const totalPointsIssued = recentTransactions
      .filter(t => t.type === 'earned')
      .reduce((sum, t) => sum + t.points, 0);

    const totalPointsRedeemed = recentTransactions
      .filter(t => t.type === 'redeemed')
      .reduce((sum, t) => sum + Math.abs(t.points), 0);

    const tierDistribution: Record<LoyaltyTier, number> = {
      bronze: 0, silver: 0, gold: 0, platinum: 0, diamond: 0,
    };

    this.customers.forEach(c => {
      tierDistribution[c.tier]++;
    });

    const topEarners = Array.from(this.customers.values())
      .sort((a, b) => b.points - a.points)
      .slice(0, 10)
      .map(c => ({
        customerId: c.customerId,
        customerName: c.customerName,
        points: c.points,
      }));

    const completedReferrals = this.referrals.filter(r => r.status === 'completed').length;
    const referralConversionRate = this.referrals.length > 0
      ? (completedReferrals / this.referrals.length) * 100
      : 0;

    return {
      totalMembers: this.customers.size,
      activeMembers,
      totalPointsIssued,
      totalPointsRedeemed,
      tierDistribution,
      topEarners,
      referralConversionRate,
    };
  }

  getCustomerTransactions(customerId: string, limit: number = 50): PointsTransaction[] {
    return this.transactions
      .filter(t => t.customerId === customerId)
      .slice(0, limit);
  }
}

export const loyaltyService = new LoyaltyService();
