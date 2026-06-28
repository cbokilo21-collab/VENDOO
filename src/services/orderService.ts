import { where, orderBy, Timestamp } from 'firebase/firestore';
import { FirestoreService } from './firestoreService';

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'return_requested'
  | 'return_approved';

export interface OrderItem {
  productId: string;
  nom: string;
  prix: number;
  quantity: number;
  emoji?: string;
}

export interface Order {
  id: string;
  userId: string;
  boutiqueId?: string;
  orderNumber: string;
  client: string;
  email: string;
  phone?: string;
  shippingAddress?: string;
  items: OrderItem[];
  subtotal: number;
  discount?: number;
  total: number;
  status: OrderStatus;
  paymentMethod: 'card' | 'cash' | 'mobile';
  trackingNumber?: string;
  carrier?: string;
  returnReason?: string;
  refundAmount?: number;
  fraudRisk?: 'low' | 'medium' | 'high';
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; color: string; soft: string; next?: OrderStatus[] }> = {
  pending:          { label: 'En attente',      color: '#D97706', soft: '#FFFBEB', next: ['paid', 'cancelled'] },
  paid:             { label: 'Payé',            color: '#16A34A', soft: '#ECFDF5', next: ['processing', 'refunded'] },
  processing:       { label: 'En préparation',  color: '#2563EB', soft: '#EFF6FF', next: ['shipped', 'cancelled'] },
  shipped:          { label: 'Expédié',         color: '#7C3AED', soft: '#F5F3FF', next: ['delivered'] },
  delivered:        { label: 'Livré',           color: '#16A34A', soft: '#ECFDF5', next: ['return_requested'] },
  cancelled:        { label: 'Annulé',          color: '#DC2626', soft: '#FEF2F2', next: [] },
  refunded:         { label: 'Remboursé',       color: '#DC2626', soft: '#FEF2F2', next: [] },
  return_requested: { label: 'Retour demandé',  color: '#D97706', soft: '#FFFBEB', next: ['return_approved', 'delivered'] },
  return_approved:  { label: 'Retour approuvé', color: '#2563EB', soft: '#EFF6FF', next: ['refunded'] },
};

export const ORDER_STATUS_TIMELINE: OrderStatus[] = [
  'pending', 'paid', 'processing', 'shipped', 'delivered',
];

let _orderCounter = 1000;

export const OrderService = {
  async create(userId: string, data: Omit<Order, 'id' | 'userId' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<string> {
    _orderCounter++;
    const orderNumber = `#${_orderCounter}`;
    const id = await FirestoreService.create('orders', {
      ...data,
      userId,
      orderNumber,
      status: 'pending' as OrderStatus,
    });
    return id;
  },

  async updateStatus(orderId: string, status: OrderStatus, extra?: Partial<Order>): Promise<void> {
    await FirestoreService.update('orders', orderId, { status, ...extra });
  },

  async getByUser(userId: string): Promise<Order[]> {
    return FirestoreService.query<Order>('orders', [
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    ]);
  },

  async getById(orderId: string): Promise<Order | null> {
    return FirestoreService.get<Order>('orders', orderId);
  },

  async getPending(userId: string): Promise<Order[]> {
    return FirestoreService.query<Order>('orders', [
      where('userId', '==', userId),
      where('status', 'in', ['pending', 'processing']),
    ]);
  },

  computeStats(orders: Order[]) {
    const paid = orders.filter(o => ['paid', 'delivered', 'shipped', 'processing'].includes(o.status));
    const totalRevenue = paid.reduce((s, o) => s + o.total, 0);
    const avgCart = paid.length ? totalRevenue / paid.length : 0;
    const statusCounts = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return { totalRevenue, avgCart, statusCounts, totalOrders: orders.length };
  },
};
