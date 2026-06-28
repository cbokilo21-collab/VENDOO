// ─── Subscription & Recurring Payments Service ─────────────────────────────────
// Manage subscription products, recurring billing, and customer subscriptions

export interface SubscriptionProduct {
  id: string;
  productId: string;
  productName: string;
  type: 'box' | 'accessory' | 'service' | 'digital';
  billingCycle: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  basePrice: number;
  trialDays?: number;
  setupFee?: number;
  shippingIncluded: boolean;
  maxCycles?: number; // undefined = infinite
  cancellationPolicy: 'anytime' | 'after_trial' | 'after_minimum' | 'end_of_cycle';
  minimumCycles?: number;
  proratedRefund: boolean;
  pauseAllowed: boolean;
  maxPauseDays?: number;
  skipAllowed: boolean;
  giftAllowed: boolean;
}

export interface Subscription {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  subscriptionProductId: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired' | 'trial' | 'past_due' | 'pending';
  startDate: string;
  nextBillingDate: string;
  endDate?: string;
  trialEndDate?: string;
  currentCycle: number;
  totalCycles?: number;
  price: number;
  billingCycle: SubscriptionProduct['billingCycle'];
  paymentMethod: {
    type: 'card' | 'bank_account' | 'paypal';
    last4: string;
    expiryDate?: string;
  };
  shippingAddress: {
    name: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: SubscriptionItem[];
  pausedAt?: string;
  pausedUntil?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  metadata?: Record<string, any>;
}

export interface SubscriptionItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  variant?: string;
}

export interface SubscriptionEvent {
  id: string;
  subscriptionId: string;
  type: 'created' | 'activated' | 'trial_started' | 'trial_ended' | 'billed' | 'payment_failed' | 'paused' | 'resumed' | 'cancelled' | 'expired' | 'updated' | 'skipped';
  description: string;
  amount?: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface SubscriptionInvoice {
  id: string;
  subscriptionId: string;
  customerId: string;
  amount: number;
  tax: number;
  total: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  dueDate: string;
  paidDate?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  paymentMethod: string;
  retryCount: number;
  nextRetryDate?: string;
}

class SubscriptionService {
  private subscriptionProducts: Map<string, SubscriptionProduct> = new Map();
  private subscriptions: Map<string, Subscription> = new Map();
  private events: SubscriptionEvent[] = [];
  private invoices: SubscriptionInvoice[] = [];

  // ─── Subscription Product Management ───────────────────────────────────────────

  addSubscriptionProduct(product: SubscriptionProduct): void {
    this.subscriptionProducts.set(product.id, product);
  }

  getSubscriptionProduct(productId: string): SubscriptionProduct | undefined {
    return this.subscriptionProducts.get(productId);
  }

  getSubscriptionProducts(): SubscriptionProduct[] {
    return Array.from(this.subscriptionProducts.values());
  }

  // ─── Subscription Management ───────────────────────────────────────────────────

  createSubscription(
    customerId: string,
    customerName: string,
    customerEmail: string,
    subscriptionProductId: string,
    paymentMethod: Subscription['paymentMethod'],
    shippingAddress: Subscription['shippingAddress'],
    items: SubscriptionItem[],
    startTrial: boolean = false
  ): Subscription {
    const product = this.subscriptionProducts.get(subscriptionProductId);
    if (!product) {
      throw new Error('Subscription product not found');
    }

    const now = new Date();
    const startDate = now.toISOString();
    const nextBillingDate = this.calculateNextBillingDate(product.billingCycle, startTrial ? product.trialDays || 0 : 0);

    const subscription: Subscription = {
      id: `SUB-${Date.now()}`,
      customerId,
      customerName,
      customerEmail,
      subscriptionProductId,
      status: startTrial ? 'trial' : 'active',
      startDate,
      nextBillingDate,
      trialEndDate: startTrial && product.trialDays 
        ? new Date(now.getTime() + product.trialDays * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
      currentCycle: 0,
      totalCycles: product.maxCycles,
      price: product.basePrice,
      billingCycle: product.billingCycle,
      paymentMethod,
      shippingAddress,
      items,
      metadata: {},
    };

    this.subscriptions.set(subscription.id, subscription);

    this.recordEvent({
      id: `EVT-${Date.now()}`,
      subscriptionId: subscription.id,
      type: startTrial ? 'trial_started' : 'created',
      description: startTrial 
        ? `Trial started for ${product.productName}`
        : `Subscription created for ${product.productName}`,
      timestamp: new Date().toISOString(),
    });

    return subscription;
  }

  private calculateNextBillingDate(cycle: SubscriptionProduct['billingCycle'], trialDays: number = 0): string {
    const now = new Date();
    const trialOffset = trialDays * 24 * 60 * 60 * 1000;
    const baseDate = new Date(now.getTime() + trialOffset);

    switch (cycle) {
      case 'weekly':
        baseDate.setDate(baseDate.getDate() + 7);
        break;
      case 'biweekly':
        baseDate.setDate(baseDate.getDate() + 14);
        break;
      case 'monthly':
        baseDate.setMonth(baseDate.getMonth() + 1);
        break;
      case 'quarterly':
        baseDate.setMonth(baseDate.getMonth() + 3);
        break;
      case 'yearly':
        baseDate.setFullYear(baseDate.getFullYear() + 1);
        break;
    }

    return baseDate.toISOString();
  }

  // ─── Subscription Actions ─────────────────────────────────────────────────────

  pauseSubscription(subscriptionId: string, days?: number): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription || !subscription.pausedUntil) return false;

    const product = this.subscriptionProducts.get(subscription.subscriptionProductId);
    if (!product || !product.pauseAllowed) return false;

    const maxDays = product.maxPauseDays || 30;
    const pauseDays = Math.min(days || maxDays, maxDays);

    subscription.status = 'paused';
    subscription.pausedAt = new Date().toISOString();
    subscription.pausedUntil = new Date(Date.now() + pauseDays * 24 * 60 * 60 * 1000).toISOString();

    this.recordEvent({
      id: `EVT-${Date.now()}`,
      subscriptionId,
      type: 'paused',
      description: `Subscription paused for ${pauseDays} days`,
      timestamp: new Date().toISOString(),
    });

    return true;
  }

  resumeSubscription(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription || subscription.status !== 'paused') return false;

    subscription.status = 'active';
    subscription.pausedAt = undefined;
    subscription.pausedUntil = undefined;

    this.recordEvent({
      id: `EVT-${Date.now()}`,
      subscriptionId,
      type: 'resumed',
      description: 'Subscription resumed',
      timestamp: new Date().toISOString(),
    });

    return true;
  }

  cancelSubscription(subscriptionId: string, reason: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return false;

    const product = this.subscriptionProducts.get(subscription.subscriptionProductId);
    if (!product) return false;

    // Check cancellation policy
    if (product.cancellationPolicy === 'after_minimum' && product.minimumCycles) {
      if (subscription.currentCycle < product.minimumCycles) {
        return false; // Cannot cancel yet
      }
    }

    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date().toISOString();
    subscription.cancellationReason = reason;
    subscription.endDate = subscription.nextBillingDate;

    this.recordEvent({
      id: `EVT-${Date.now()}`,
      subscriptionId,
      type: 'cancelled',
      description: `Subscription cancelled: ${reason}`,
      timestamp: new Date().toISOString(),
    });

    return true;
  }

  skipCycle(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return false;

    const product = this.subscriptionProducts.get(subscription.subscriptionProductId);
    if (!product || !product.skipAllowed) return false;

    const oldNextBilling = subscription.nextBillingDate;
    subscription.nextBillingDate = this.calculateNextBillingDate(subscription.billingCycle);

    this.recordEvent({
      id: `EVT-${Date.now()}`,
      subscriptionId,
      type: 'skipped',
      description: `Cycle skipped. Next billing: ${subscription.nextBillingDate}`,
      timestamp: new Date().toISOString(),
    });

    return true;
  }

  // ─── Billing ─────────────────────────────────────────────────────────────────

  processBilling(): SubscriptionInvoice[] {
    const now = new Date();
    const processedInvoices: SubscriptionInvoice[] = [];

    this.subscriptions.forEach(subscription => {
      if (subscription.status !== 'active') return;

      const nextBilling = new Date(subscription.nextBillingDate);
      if (nextBilling <= now) {
        const invoice = this.createInvoice(subscription);
        this.invoices.push(invoice);
        processedInvoices.push(invoice);

        // Update subscription
        subscription.currentCycle++;
        subscription.nextBillingDate = this.calculateNextBillingDate(subscription.billingCycle);

        // Check if max cycles reached
        if (subscription.totalCycles && subscription.currentCycle >= subscription.totalCycles) {
          subscription.status = 'expired';
          subscription.endDate = new Date().toISOString();

          this.recordEvent({
            id: `EVT-${Date.now()}`,
            subscriptionId: subscription.id,
            type: 'expired',
            description: 'Subscription expired after reaching maximum cycles',
            timestamp: new Date().toISOString(),
          });
        } else {
          this.recordEvent({
            id: `EVT-${Date.now()}`,
            subscriptionId: subscription.id,
            type: 'billed',
            description: `Billing cycle ${subscription.currentCycle} processed`,
            amount: invoice.total,
            timestamp: new Date().toISOString(),
          });
        }
      }
    });

    return processedInvoices;
  }

  private createInvoice(subscription: Subscription): SubscriptionInvoice {
    const tax = subscription.price * 0.2; // 20% tax
    const total = subscription.price + tax;

    const invoice: SubscriptionInvoice = {
      id: `INV-${Date.now()}`,
      subscriptionId: subscription.id,
      customerId: subscription.customerId,
      amount: subscription.price,
      tax,
      total,
      currency: 'EUR',
      status: 'pending',
      dueDate: subscription.nextBillingDate,
      items: subscription.items.map(item => ({
        description: item.productName,
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.price * item.quantity,
      })),
      paymentMethod: `${subscription.paymentMethod.type} **** ${subscription.paymentMethod.last4}`,
      retryCount: 0,
    };

    return invoice;
  }

  // ─── Event Tracking ─────────────────────────────────────────────────────────

  private recordEvent(event: SubscriptionEvent): void {
    this.events.unshift(event);
  }

  getSubscriptionEvents(subscriptionId: string, limit: number = 50): SubscriptionEvent[] {
    return this.events
      .filter(e => e.subscriptionId === subscriptionId)
      .slice(0, limit);
  }

  // ─── Analytics ───────────────────────────────────────────────────────────────

  getSubscriptionStats(days: number = 30): {
    totalSubscriptions: number;
    activeSubscriptions: number;
    trialSubscriptions: number;
    pausedSubscriptions: number;
    cancelledSubscriptions: number;
    monthlyRecurringRevenue: number;
    averageRevenuePerUser: number;
    churnRate: number;
    byBillingCycle: Record<string, number>;
  } {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const subscriptions = Array.from(this.subscriptions.values());
    
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
    const trialSubscriptions = subscriptions.filter(s => s.status === 'trial').length;
    const pausedSubscriptions = subscriptions.filter(s => s.status === 'paused').length;
    const cancelledSubscriptions = subscriptions.filter(s => 
      s.status === 'cancelled' && s.cancelledAt && new Date(s.cancelledAt) >= cutoffDate
    ).length;

    const monthlyRecurringRevenue = subscriptions
      .filter(s => s.status === 'active' || s.status === 'trial')
      .reduce((sum, s) => {
        const monthlyAmount = this.convertToMonthly(s.price, s.billingCycle);
        return sum + monthlyAmount;
      }, 0);

    const averageRevenuePerUser = activeSubscriptions > 0 
      ? monthlyRecurringRevenue / activeSubscriptions 
      : 0;

    const churnRate = activeSubscriptions > 0
      ? (cancelledSubscriptions / (activeSubscriptions + cancelledSubscriptions)) * 100
      : 0;

    const byBillingCycle: Record<string, number> = {};
    subscriptions.forEach(s => {
      if (!byBillingCycle[s.billingCycle]) {
        byBillingCycle[s.billingCycle] = 0;
      }
      byBillingCycle[s.billingCycle]++;
    });

    return {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions,
      trialSubscriptions,
      pausedSubscriptions,
      cancelledSubscriptions,
      monthlyRecurringRevenue,
      averageRevenuePerUser,
      churnRate,
      byBillingCycle,
    };
  }

  private convertToMonthly(amount: number, cycle: SubscriptionProduct['billingCycle']): number {
    switch (cycle) {
      case 'weekly': return amount * 4.33;
      case 'biweekly': return amount * 2.17;
      case 'monthly': return amount;
      case 'quarterly': return amount / 3;
      case 'yearly': return amount / 12;
    }
  }

  getSubscription(subscriptionId: string): Subscription | undefined {
    return this.subscriptions.get(subscriptionId);
  }

  getCustomerSubscriptions(customerId: string): Subscription[] {
    return Array.from(this.subscriptions.values()).filter(s => s.customerId === customerId);
  }
}

export const subscriptionService = new SubscriptionService();
