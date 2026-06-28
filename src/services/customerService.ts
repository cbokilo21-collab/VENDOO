import { where, Timestamp } from 'firebase/firestore';
import { FirestoreService } from './firestoreService';

export interface Customer {
  id: string;
  userId: string;
  nom: string;
  email: string;
  phone?: string;
  segment: 'vip' | 'fidele' | 'nouveau' | 'inactif';
  totalSpent: number;
  orderCount: number;
  lastPurchaseDate?: any;
  createdAt?: any;
  updatedAt?: any;
  notes?: string;
}

export const CustomerService = {
  async create(userId: string, data: Omit<Customer, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = await FirestoreService.create('customers', {
      ...data,
      userId,
      totalSpent: data.totalSpent || 0,
      orderCount: data.orderCount || 0,
      segment: 'nouveau',
      createdAt: Timestamp.now(),
    });
    return id;
  },

  async createFromOrder(userId: string, email: string, nom: string, total: number): Promise<string | null> {
    try {
      // Check if customer already exists
      const existing = await FirestoreService.query<Customer>('customers', [
        where('userId', '==', userId),
        where('email', '==', email),
      ]);

      if (existing.length > 0) {
        // Update existing customer
        const customer = existing[0];
        const newOrderCount = customer.orderCount + 1;
        const newTotal = customer.totalSpent + total;

        // Auto-segment: VIP (3+k), fidele (2+ orders), nouveau (1 order), inactif (inactive)
        let segment: Customer['segment'] = 'nouveau';
        if (newOrderCount >= 2) segment = newTotal >= 3000 ? 'vip' : 'fidele';
        else if (newTotal >= 3000) segment = 'vip';

        await FirestoreService.update('customers', customer.id, {
          orderCount: newOrderCount,
          totalSpent: newTotal,
          segment,
          lastPurchaseDate: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        return customer.id;
      } else {
        // Create new customer from order
        return this.create(userId, {
          nom,
          email,
          segment: 'nouveau',
          totalSpent: total,
          orderCount: 1,
          lastPurchaseDate: Timestamp.now(),
        });
      }
    } catch (err) {
      console.error('Error creating/updating customer:', err);
      return null;
    }
  },

  async getByUser(userId: string): Promise<Customer[]> {
    return FirestoreService.query<Customer>('customers', [
      where('userId', '==', userId),
    ]);
  },

  async getByEmail(userId: string, email: string): Promise<Customer | null> {
    const results = await FirestoreService.query<Customer>('customers', [
      where('userId', '==', userId),
      where('email', '==', email),
    ]);
    return results.length > 0 ? results[0] : null;
  },

  async updateSegment(customerId: string, segment: Customer['segment']): Promise<void> {
    await FirestoreService.update('customers', customerId, { segment, updatedAt: Timestamp.now() });
  },
};
