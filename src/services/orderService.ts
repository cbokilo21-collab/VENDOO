import { where, orderBy, Timestamp } from 'firebase/firestore';
import { FirestoreService } from './firestoreService';
import { NotificationService } from './notificationService';

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
  paymentMethod: 'visa' | 'mobile_money' | 'cash';
  trackingNumber?: string;
  carrier?: string;
  estimatedDeliveryDate?: any; // Date de livraison estimée (accordée avec le vendeur)
  actualDeliveryDate?: any; // Date de livraison réelle
  deliveryLocation?: string; // Quartier/zone de livraison
  trackingHistory?: TrackingEvent[]; // Historique du tracking
  returnReason?: string;
  refundAmount?: number;
  fraudRisk?: 'low' | 'medium' | 'high';
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface TrackingEvent {
  id?: string;
  status: string;
  description: string;
  location?: string;
  timestamp?: any;
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
      boutiqueId: data.boutiqueId || userId, // Use boutiqueId if provided, otherwise use userId as fallback
      orderNumber,
      status: 'pending' as OrderStatus,
    });
    return id;
  },

  async updateStatus(orderId: string, status: OrderStatus, extra?: Partial<Order>): Promise<void> {
    const order = await this.getById(orderId);
    if (!order) return;

    await FirestoreService.update('orders', orderId, { status, ...extra });

    // Créer des notifications automatiques basées sur le statut
    try {
      switch (status) {
        case 'paid':
          await NotificationService.createOrderNotification(order.userId, orderId, 'paid');
          break;
        case 'processing':
          await NotificationService.createOrderNotification(order.userId, orderId, 'processing');
          break;
        case 'shipped':
          await NotificationService.createOrderNotification(order.userId, orderId, 'shipped');
          break;
        case 'delivered':
          await NotificationService.createOrderNotification(order.userId, orderId, 'delivered');
          break;
        case 'cancelled':
          await NotificationService.createOrderNotification(order.userId, orderId, 'cancelled');
          break;
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
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

  /**
   * Définir la date de livraison estimée (accordée avec le vendeur)
   */
  async setEstimatedDelivery(orderId: string, estimatedDate: Date, location: string): Promise<void> {
    await FirestoreService.update('orders', orderId, {
      estimatedDeliveryDate: estimatedDate,
      deliveryLocation: location,
    });
  },

  /**
   * Ajouter un événement de tracking
   */
  async addTrackingEvent(orderId: string, event: Omit<TrackingEvent, 'id' | 'timestamp'>): Promise<void> {
    const order = await this.getById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const trackingHistory = order.trackingHistory || [];
    const newEvent: TrackingEvent = {
      ...event,
      timestamp: new Date(),
    };

    await FirestoreService.update('orders', orderId, {
      trackingHistory: [...trackingHistory, newEvent],
    });
  },

  /**
   * Marquer la commande comme livrée
   */
  async markAsDelivered(orderId: string): Promise<void> {
    await this.updateStatus(orderId, 'delivered', {
      actualDeliveryDate: new Date(),
    });
  },
};
