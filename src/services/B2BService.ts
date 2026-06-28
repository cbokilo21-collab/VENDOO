// ─── B2B Wholesale Service ─────────────────────────────────────────────────────
// Business-to-business wholesale management with tiered pricing, bulk orders, and B2B features

export interface B2BCustomer {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  taxId: string;
  tier: B2BTier;
  creditLimit: number;
  currentBalance: number;
  paymentTerms: PaymentTerms;
  billingAddress: Address;
  shippingAddresses: Address[];
  approvedAt: string;
  status: 'pending' | 'active' | 'suspended' | 'inactive';
  discountPercent: number;
  minimumOrderValue: number;
  netPaymentDays: number;
}

export type B2BTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export type PaymentTerms = 'net_15' | 'net_30' | 'net_45' | 'net_60' | 'cod' | 'prepaid';

export interface Address {
  name: string;
  company: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface WholesaleProduct {
  productId: string;
  productName: string;
  sku: string;
  retailPrice: number;
  wholesalePrice: number;
  minimumOrderQuantity: number;
  bulkDiscounts: BulkDiscount[];
  availableForB2B: boolean;
  leadTimeDays: number;
  stockAvailable: number;
  categories: string[];
}

export interface BulkDiscount {
  minQuantity: number;
  discountPercent: number;
}

export interface B2BOrder {
  id: string;
  customerId: string;
  customerName: string;
  companyName: string;
  items: B2BOrderItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  tax: number;
  total: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue';
  paymentTerms: PaymentTerms;
  dueDate: string;
  paidDate?: string;
  notes?: string;
  internalNotes?: string;
  requestedDeliveryDate?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  shippingAddress: Address;
  trackingNumber?: string;
  carrier?: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface B2BOrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  totalPrice: number;
}

export interface QuoteRequest {
  id: string;
  customerId: string;
  customerName: string;
  companyName: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
  }>;
  notes?: string;
  status: 'pending' | 'reviewed' | 'sent' | 'accepted' | 'rejected' | 'expired';
  validUntil: string;
  quotedTotal?: number;
  createdAt: string;
  respondedAt?: string;
}

class B2BService {
  private customers: Map<string, B2BCustomer> = new Map();
  private products: Map<string, WholesaleProduct> = new Map();
  private orders: Map<string, B2BOrder> = new Map();
  private quotes: Map<string, QuoteRequest> = new Map();

  private readonly tierConfigs: Record<B2BTier, { discountPercent: number; minimumOrderValue: number; creditLimit: number }> = {
    bronze: { discountPercent: 10, minimumOrderValue: 500, creditLimit: 5000 },
    silver: { discountPercent: 15, minimumOrderValue: 1000, creditLimit: 15000 },
    gold: { discountPercent: 20, minimumOrderValue: 2500, creditLimit: 50000 },
    platinum: { discountPercent: 25, minimumOrderValue: 5000, creditLimit: 100000 },
  };

  // ─── Customer Management ─────────────────────────────────────────────────────

  registerB2BCustomer(customer: Omit<B2BCustomer, 'id' | 'status' | 'approvedAt'>): B2BCustomer {
    const newCustomer: B2BCustomer = {
      ...customer,
      id: `B2B-${Date.now()}`,
      status: 'pending',
      approvedAt: '',
    };

    this.customers.set(newCustomer.id, newCustomer);
    return newCustomer;
  }

  approveCustomer(customerId: string, tier: B2BTier): boolean {
    const customer = this.customers.get(customerId);
    if (!customer) return false;

    customer.status = 'active';
    customer.tier = tier;
    customer.approvedAt = new Date().toISOString();
    customer.discountPercent = this.tierConfigs[tier].discountPercent;
    customer.minimumOrderValue = this.tierConfigs[tier].minimumOrderValue;
    customer.creditLimit = this.tierConfigs[tier].creditLimit;

    return true;
  }

  suspendCustomer(customerId: string, reason: string): boolean {
    const customer = this.customers.get(customerId);
    if (!customer) return false;

    customer.status = 'suspended';
    return true;
  }

  getCustomer(customerId: string): B2BCustomer | undefined {
    return this.customers.get(customerId);
  }

  getCustomers(): B2BCustomer[] {
    return Array.from(this.customers.values());
  }

  // ─── Product Management ───────────────────────────────────────────────────────

  addWholesaleProduct(product: WholesaleProduct): void {
    this.products.set(product.productId, product);
  }

  getWholesaleProduct(productId: string): WholesaleProduct | undefined {
    return this.products.get(productId);
  }

  getWholesaleProducts(): WholesaleProduct[] {
    return Array.from(this.products.values()).filter(p => p.availableForB2B);
  }

  calculateWholesalePrice(productId: string, quantity: number, customerTier: B2BTier): {
    unitPrice: number;
    discountPercent: number;
    totalPrice: number;
  } {
    const product = this.products.get(productId);
    if (!product) {
      return { unitPrice: 0, discountPercent: 0, totalPrice: 0 };
    }

    let unitPrice = product.wholesalePrice;
    let discountPercent = this.tierConfigs[customerTier].discountPercent;

    // Apply bulk discounts
    for (const bulkDiscount of product.bulkDiscounts) {
      if (quantity >= bulkDiscount.minQuantity) {
        discountPercent = Math.max(discountPercent, bulkDiscount.discountPercent);
      }
    }

    const finalPrice = unitPrice * (1 - discountPercent / 100);
    const totalPrice = finalPrice * quantity;

    return {
      unitPrice: finalPrice,
      discountPercent,
      totalPrice,
    };
  }

  // ─── Order Management ───────────────────────────────────────────────────────

  createB2BOrder(
    customerId: string,
    items: Array<{ productId: string; quantity: number }>,
    shippingAddress: Address,
    notes?: string
  ): B2BOrder {
    const customer = this.customers.get(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const orderItems: B2BOrderItem[] = [];
    let subtotal = 0;

    for (const item of items) {
      const pricing = this.calculateWholesalePrice(item.productId, item.quantity, customer.tier);
      const product = this.products.get(item.productId);
      
      if (!product) continue;

      orderItems.push({
        productId: item.productId,
        productName: product.productName,
        sku: product.sku,
        quantity: item.quantity,
        unitPrice: pricing.unitPrice,
        discountPercent: pricing.discountPercent,
        discountAmount: (product.wholesalePrice * item.quantity) - pricing.totalPrice,
        totalPrice: pricing.totalPrice,
      });

      subtotal += pricing.totalPrice;
    }

    const discountPercent = customer.discountPercent;
    const discountAmount = subtotal * (discountPercent / 100);
    const afterDiscount = subtotal - discountAmount;
    const tax = afterDiscount * 0.2; // 20% tax
    const total = afterDiscount + tax;

    const dueDate = this.calculateDueDate(customer.paymentTerms);

    const order: B2BOrder = {
      id: `B2B-ORD-${Date.now()}`,
      customerId,
      customerName: customer.contactName,
      companyName: customer.companyName,
      items: orderItems,
      subtotal,
      discountPercent,
      discountAmount,
      tax,
      total,
      status: 'pending_approval',
      paymentStatus: 'pending',
      paymentTerms: customer.paymentTerms,
      dueDate,
      shippingAddress,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.orders.set(order.id, order);
    return order;
  }

  private calculateDueDate(paymentTerms: PaymentTerms): string {
    const now = new Date();
    const daysMap: Record<PaymentTerms, number> = {
      net_15: 15,
      net_30: 30,
      net_45: 45,
      net_60: 60,
      cod: 0,
      prepaid: 0,
    };

    const days = daysMap[paymentTerms];
    now.setDate(now.getDate() + days);
    return now.toISOString();
  }

  approveOrder(orderId: string, approvedBy: string): boolean {
    const order = this.orders.get(orderId);
    if (!order || order.status !== 'pending_approval') return false;

    order.status = 'approved';
    order.approvedBy = approvedBy;
    order.approvedAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();

    return true;
  }

  processOrder(orderId: string): boolean {
    const order = this.orders.get(orderId);
    if (!order || order.status !== 'approved') return false;

    order.status = 'processing';
    order.updatedAt = new Date().toISOString();

    return true;
  }

  shipOrder(orderId: string, trackingNumber: string, carrier: string): boolean {
    const order = this.orders.get(orderId);
    if (!order || order.status !== 'processing') return false;

    order.status = 'shipped';
    order.trackingNumber = trackingNumber;
    order.carrier = carrier;
    order.estimatedDeliveryDate = this.calculateEstimatedDelivery();
    order.updatedAt = new Date().toISOString();

    return true;
  }

  private calculateEstimatedDelivery(): string {
    const date = new Date();
    date.setDate(date.getDate() + 7); // 7 days default
    return date.toISOString();
  }

  // ─── Quote Management ───────────────────────────────────────────────────────

  createQuoteRequest(
    customerId: string,
    items: Array<{ productId: string; productName: string; quantity: number }>,
    notes?: string
  ): QuoteRequest {
    const customer = this.customers.get(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30); // Valid for 30 days

    const quote: QuoteRequest = {
      id: `QT-${Date.now()}`,
      customerId,
      customerName: customer.contactName,
      companyName: customer.companyName,
      items,
      notes,
      status: 'pending',
      validUntil: validUntil.toISOString(),
      createdAt: new Date().toISOString(),
    };

    this.quotes.set(quote.id, quote);
    return quote;
  }

  respondToQuote(quoteId: string, quotedTotal: number, status: 'sent' | 'accepted' | 'rejected'): boolean {
    const quote = this.quotes.get(quoteId);
    if (!quote) return false;

    quote.status = status;
    quote.quotedTotal = quotedTotal;
    quote.respondedAt = new Date().toISOString();

    if (status === 'accepted') {
      // Convert quote to order
      const customer = this.customers.get(quote.customerId);
      if (customer) {
        const orderItems = quote.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        }));

        this.createB2BOrder(
          quote.customerId,
          orderItems,
          customer.billingAddress,
          `Created from quote ${quote.id}`
        );
      }
    }

    return true;
  }

  // ─── Analytics ─────────────────────────────────────────────────────────────

  getB2BStats(days: number = 30): {
    totalCustomers: number;
    activeCustomers: number;
    pendingApprovals: number;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    pendingOrders: number;
    overduePayments: number;
    byTier: Record<B2BTier, number>;
    topCustomers: Array<{ customerId: string; companyName: string; totalSpent: number }>;
  } {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const customers = Array.from(this.customers.values());
    const activeCustomers = customers.filter(c => c.status === 'active').length;
    const pendingApprovals = customers.filter(c => c.status === 'pending').length;

    const orders = Array.from(this.orders.values());
    const recentOrders = orders.filter(o => new Date(o.createdAt) >= cutoffDate);
    const totalRevenue = recentOrders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    const averageOrderValue = recentOrders.length > 0 
      ? totalRevenue / recentOrders.length 
      : 0;

    const pendingOrders = orders.filter(o => o.status === 'pending_approval').length;

    const overduePayments = orders.filter(
      o => o.paymentStatus === 'pending' && new Date(o.dueDate) < new Date()
    ).length;

    const byTier: Record<B2BTier, number> = {
      bronze: 0, silver: 0, gold: 0, platinum: 0,
    };
    customers.forEach(c => {
      byTier[c.tier]++;
    });

    const customerSpending: Map<string, number> = new Map();
    orders.forEach(o => {
      if (o.status !== 'cancelled') {
        const current = customerSpending.get(o.customerId) || 0;
        customerSpending.set(o.customerId, current + o.total);
      }
    });

    const topCustomers = Array.from(customerSpending.entries())
      .map(([customerId, totalSpent]) => {
        const customer = this.customers.get(customerId);
        return {
          customerId,
          companyName: customer?.companyName || '',
          totalSpent,
        };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    return {
      totalCustomers: customers.length,
      activeCustomers,
      pendingApprovals,
      totalOrders: recentOrders.length,
      totalRevenue,
      averageOrderValue,
      pendingOrders,
      overduePayments,
      byTier,
      topCustomers,
    };
  }

  getOrder(orderId: string): B2BOrder | undefined {
    return this.orders.get(orderId);
  }

  getCustomerOrders(customerId: string): B2BOrder[] {
    return Array.from(this.orders.values()).filter(o => o.customerId === customerId);
  }
}

export const b2bService = new B2BService();
