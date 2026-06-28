// ─── Point of Sale (POS) Service ──────────────────────────────────────────────
// In-store retail management with inventory sync, payment processing, and receipts

export interface POSRegister {
  id: string;
  name: string;
  location: string;
  deviceId: string;
  status: 'open' | 'closed' | 'maintenance';
  currentSession?: POSSession;
  cashDrawer: {
    expectedAmount: number;
    actualAmount: number;
    lastCounted: string;
  };
  printerConnected: boolean;
  scannerConnected: boolean;
  cardReaderConnected: boolean;
}

export interface POSSession {
  id: string;
  registerId: string;
  openedBy: string;
  openedAt: string;
  closedBy?: string;
  closedAt?: string;
  openingCash: number;
  closingCash?: number;
  sales: POSSale[];
  totalSales: number;
  totalRefunds: number;
  status: 'open' | 'closed';
}

export interface POSSale {
  id: string;
  sessionId: string;
  registerId: string;
  items: POSItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'mobile' | 'gift_card';
  paymentDetails?: {
    cardType?: string;
    last4?: string;
    transactionId?: string;
    cashReceived?: number;
    changeGiven?: number;
  };
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  staffId: string;
  staffName: string;
  status: 'completed' | 'refunded' | 'voided';
  refundedAt?: string;
  voidedAt?: string;
  refundAmount?: number;
  createdAt: string;
}

export interface POSItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
  tax: number;
  variant?: string;
}

export interface POSStaff {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'cashier' | 'supervisor';
  pin: string;
  permissions: string[];
  active: boolean;
  salesCount: number;
  totalSales: number;
}

export interface ReturnRequest {
  id: string;
  saleId: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    reason: string;
  }>;
  refundAmount: number;
  refundMethod: 'cash' | 'card' | 'store_credit';
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  requestedBy: string;
  requestedAt: string;
  processedBy?: string;
  processedAt?: string;
}

class POSService {
  private registers: Map<string, POSRegister> = new Map();
  private sessions: Map<string, POSSession> = new Map();
  private sales: Map<string, POSSale> = new Map();
  private staff: Map<string, POSStaff> = new Map();
  private returns: Map<string, ReturnRequest> = new Map();

  // ─── Register Management ─────────────────────────────────────────────────────

  addRegister(register: Omit<POSRegister, 'cashDrawer'>): POSRegister {
    const newRegister: POSRegister = {
      ...register,
      cashDrawer: {
        expectedAmount: 0,
        actualAmount: 0,
        lastCounted: new Date().toISOString(),
      },
    };

    this.registers.set(newRegister.id, newRegister);
    return newRegister;
  }

  openSession(registerId: string, staffId: string, openingCash: number): POSSession {
    const register = this.registers.get(registerId);
    if (!register) {
      throw new Error('Register not found');
    }

    const session: POSSession = {
      id: `SES-${Date.now()}`,
      registerId,
      openedBy: staffId,
      openedAt: new Date().toISOString(),
      openingCash,
      sales: [],
      totalSales: 0,
      totalRefunds: 0,
      status: 'open',
    };

    this.sessions.set(session.id, session);
    register.currentSession = session;
    register.status = 'open';

    return session;
  }

  closeSession(sessionId: string, staffId: string, closingCash: number): POSSession {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'open') {
      throw new Error('Session not found or already closed');
    }

    session.closedBy = staffId;
    session.closedAt = new Date().toISOString();
    session.closingCash = closingCash;
    session.status = 'closed';

    const register = this.registers.get(session.registerId);
    if (register) {
      register.currentSession = undefined;
      register.status = 'closed';
      register.cashDrawer = {
        expectedAmount: session.openingCash + session.totalSales - session.totalRefunds,
        actualAmount: closingCash,
        lastCounted: new Date().toISOString(),
      };
    }

    return session;
  }

  getRegister(registerId: string): POSRegister | undefined {
    return this.registers.get(registerId);
  }

  getRegisters(): POSRegister[] {
    return Array.from(this.registers.values());
  }

  // ─── Sale Processing ───────────────────────────────────────────────────────

  createSale(
    sessionId: string,
    items: Omit<POSItem, 'totalPrice' | 'tax'>[],
    paymentMethod: POSSale['paymentMethod'],
    paymentDetails?: POSSale['paymentDetails'],
    customer?: POSSale['customer']
  ): POSSale {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'open') {
      throw new Error('Session not found or closed');
    }

    const staff = this.staff.get(session.openedBy);
    if (!staff) {
      throw new Error('Staff not found');
    }

    const processedItems: POSItem[] = items.map(item => {
      const tax = item.unitPrice * item.quantity * 0.2; // 20% tax
      const totalPrice = (item.unitPrice * item.quantity) + tax - item.discount;
      return {
        ...item,
        totalPrice,
        tax,
      };
    });

    const subtotal = processedItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const tax = processedItems.reduce((sum, item) => sum + item.tax, 0);
    const discount = processedItems.reduce((sum, item) => sum + item.discount, 0);
    const total = subtotal + tax - discount;

    const sale: POSSale = {
      id: `SALE-${Date.now()}`,
      sessionId,
      registerId: session.registerId,
      items: processedItems,
      subtotal,
      tax,
      discount,
      total,
      paymentMethod,
      paymentDetails,
      customer,
      staffId: staff.id,
      staffName: staff.name,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    this.sales.set(sale.id, sale);
    session.sales.push(sale);
    session.totalSales += total;

    // Update staff stats
    staff.salesCount++;
    staff.totalSales += total;

    return sale;
  }

  refundSale(saleId: string, refundAmount: number, reason: string): POSSale {
    const sale = this.sales.get(saleId);
    if (!sale || sale.status !== 'completed') {
      throw new Error('Sale not found or cannot be refunded');
    }

    sale.status = 'refunded';
    sale.refundAmount = refundAmount;
    sale.refundedAt = new Date().toISOString();

    const session = this.sessions.get(sale.sessionId);
    if (session) {
      session.totalRefunds += refundAmount;
    }

    return sale;
  }

  voidSale(saleId: string): POSSale {
    const sale = this.sales.get(saleId);
    if (!sale || sale.status !== 'completed') {
      throw new Error('Sale not found or cannot be voided');
    }

    sale.status = 'voided';
    sale.voidedAt = new Date().toISOString();

    const session = this.sessions.get(sale.sessionId);
    if (session) {
      session.totalSales -= sale.total;
      session.sales = session.sales.filter(s => s.id !== saleId);
    }

    return sale;
  }

  // ─── Staff Management ───────────────────────────────────────────────────────

  addStaff(staff: Omit<POSStaff, 'salesCount' | 'totalSales'>): POSStaff {
    const newStaff: POSStaff = {
      ...staff,
      salesCount: 0,
      totalSales: 0,
    };

    this.staff.set(newStaff.id, newStaff);
    return newStaff;
  }

  authenticateStaff(staffId: string, pin: string): POSStaff | null {
    const staff = this.staff.get(staffId);
    if (staff && staff.pin === pin && staff.active) {
      return staff;
    }
    return null;
  }

  getStaff(staffId: string): POSStaff | undefined {
    return this.staff.get(staffId);
  }

  getAllStaff(): POSStaff[] {
    return Array.from(this.staff.values()).filter(s => s.active);
  }

  // ─── Return Management ─────────────────────────────────────────────────────

  createReturnRequest(
    saleId: string,
    items: Array<{ productId: string; productName: string; quantity: number; reason: string }>,
    refundMethod: ReturnRequest['refundMethod'],
    requestedBy: string
  ): ReturnRequest {
    const sale = this.sales.get(saleId);
    if (!sale) {
      throw new Error('Sale not found');
    }

    const refundAmount = items.reduce((sum, item) => {
      const saleItem = sale.items.find(i => i.productId === item.productId);
      return sum + (saleItem?.totalPrice || 0) * item.quantity;
    }, 0);

    const returnRequest: ReturnRequest = {
      id: `RET-${Date.now()}`,
      saleId,
      items,
      refundAmount,
      refundMethod,
      status: 'pending',
      requestedBy,
      requestedAt: new Date().toISOString(),
    };

    this.returns.set(returnRequest.id, returnRequest);
    return returnRequest;
  }

  processReturn(returnId: string, processedBy: string): ReturnRequest {
    const returnRequest = this.returns.get(returnId);
    if (!returnRequest || returnRequest.status !== 'pending') {
      throw new Error('Return request not found or already processed');
    }

    returnRequest.status = 'processed';
    returnRequest.processedBy = processedBy;
    returnRequest.processedAt = new Date().toISOString();

    // Refund the sale
    this.refundSale(returnRequest.saleId, returnRequest.refundAmount, 'Return processed');

    return returnRequest;
  }

  // ─── Analytics ───────────────────────────────────────────────────────────────

  getPOSStats(days: number = 30): {
    totalSales: number;
    totalRevenue: number;
    averageSaleValue: number;
    totalRefunds: number;
    netRevenue: number;
    byPaymentMethod: Record<string, { count: number; amount: number }>;
    byStaff: Array<{ staffId: string; staffName: string; salesCount: number; totalSales: number }>;
    topSellingItems: Array<{ productId: string; productName: string; quantity: number; revenue: number }>;
  } {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentSales = Array.from(this.sales.values()).filter(
      s => new Date(s.createdAt) >= cutoffDate && s.status === 'completed'
    );

    const totalSales = recentSales.length;
    const totalRevenue = recentSales.reduce((sum, s) => sum + s.total, 0);
    const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    const refundedSales = Array.from(this.sales.values()).filter(
      s => s.status === 'refunded' && new Date(s.refundedAt || '') >= cutoffDate
    );
    const totalRefunds = refundedSales.reduce((sum, s) => sum + (s.refundAmount || 0), 0);
    const netRevenue = totalRevenue - totalRefunds;

    const byPaymentMethod: Record<string, { count: number; amount: number }> = {};
    recentSales.forEach(sale => {
      if (!byPaymentMethod[sale.paymentMethod]) {
        byPaymentMethod[sale.paymentMethod] = { count: 0, amount: 0 };
      }
      byPaymentMethod[sale.paymentMethod].count++;
      byPaymentMethod[sale.paymentMethod].amount += sale.total;
    });

    const byStaff = Array.from(this.staff.values())
      .map(staff => ({
        staffId: staff.id,
        staffName: staff.name,
        salesCount: staff.salesCount,
        totalSales: staff.totalSales,
      }))
      .sort((a, b) => b.totalSales - a.totalSales);

    const itemSales: Map<string, { productName: string; quantity: number; revenue: number }> = new Map();
    recentSales.forEach(sale => {
      sale.items.forEach(item => {
        const existing = itemSales.get(item.productId);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.totalPrice;
        } else {
          itemSales.set(item.productId, {
            productName: item.productName,
            quantity: item.quantity,
            revenue: item.totalPrice,
          });
        }
      });
    });

    const topSellingItems = Array.from(itemSales.entries())
      .map(([productId, data]) => ({ productId, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      totalSales,
      totalRevenue,
      averageSaleValue,
      totalRefunds,
      netRevenue,
      byPaymentMethod,
      byStaff,
      topSellingItems,
    };
  }

  getSession(sessionId: string): POSSession | undefined {
    return this.sessions.get(sessionId);
  }

  getSale(saleId: string): POSSale | undefined {
    return this.sales.get(saleId);
  }
}

export const posService = new POSService();
