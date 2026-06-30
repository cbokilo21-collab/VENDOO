import { FirestoreService } from './firestoreService';
import { OrderService, Order } from './orderService';

export interface SpendingStats {
  totalSpent: number;
  totalOrders: number;
  averageOrderValue: number;
  thisMonthSpent: number;
  lastMonthSpent: number;
  monthlyTrend: number; // Pourcentage de variation
  spendingByCategory: Record<string, number>;
  spendingByMonth: Record<string, number>;
  topStores: { storeId: string; storeName: string; totalSpent: number; orderCount: number }[];
}

export const SpendingService = {
  /**
   * Obtenir les statistiques de dépenses d'un client
   */
  async getSpendingStats(userId: string): Promise<SpendingStats> {
    try {
      const orders = await OrderService.getByUser(userId);
      const deliveredOrders = orders.filter(o => o.status === 'delivered');

      // Total dépensé
      const totalSpent = deliveredOrders.reduce((sum, order) => sum + order.total, 0);
      const totalOrders = deliveredOrders.length;
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

      // Dépenses ce mois
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      const thisMonthSpent = deliveredOrders
        .filter(order => {
          const orderDate = order.createdAt ? (order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt)) : new Date(0);
          return orderDate.getMonth() === thisMonth && orderDate.getFullYear() === thisYear;
        })
        .reduce((sum, order) => sum + order.total, 0);

      // Dépenses le mois dernier
      const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
      const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
      const lastMonthSpent = deliveredOrders
        .filter(order => {
          const orderDate = order.createdAt ? (order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt)) : new Date(0);
          return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
        })
        .reduce((sum, order) => sum + order.total, 0);

      // Tendance mensuelle
      const monthlyTrend = lastMonthSpent > 0 
        ? ((thisMonthSpent - lastMonthSpent) / lastMonthSpent) * 100 
        : 0;

      // Dépenses par catégorie (basé sur les items)
      const spendingByCategory: Record<string, number> = {};
      deliveredOrders.forEach(order => {
        order.items.forEach(item => {
          const category = item.nom || 'Autre';
          spendingByCategory[category] = (spendingByCategory[category] || 0) + (item.prix * item.quantity);
        });
      });

      // Dépenses par mois
      const spendingByMonth: Record<string, number> = {};
      deliveredOrders.forEach(order => {
        const orderDate = order.createdAt ? (order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt)) : new Date(0);
        const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
        spendingByMonth[monthKey] = (spendingByMonth[monthKey] || 0) + order.total;
      });

      // Top boutiques
      const storeSpending: Record<string, { storeName: string; totalSpent: number; orderCount: number }> = {};
      deliveredOrders.forEach(order => {
        const storeId = order.boutiqueId || 'unknown';
        const storeName = order.client || 'Inconnu';
        if (!storeSpending[storeId]) {
          storeSpending[storeId] = { storeName, totalSpent: 0, orderCount: 0 };
        }
        storeSpending[storeId].totalSpent += order.total;
        storeSpending[storeId].orderCount += 1;
      });

      const topStores = Object.entries(storeSpending)
        .map(([storeId, data]) => ({ storeId, ...data }))
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);

      return {
        totalSpent,
        totalOrders,
        averageOrderValue,
        thisMonthSpent,
        lastMonthSpent,
        monthlyTrend,
        spendingByCategory,
        spendingByMonth,
        topStores,
      };
    } catch (error) {
      console.error('Error getting spending stats:', error);
      return {
        totalSpent: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        thisMonthSpent: 0,
        lastMonthSpent: 0,
        monthlyTrend: 0,
        spendingByCategory: {},
        spendingByMonth: {},
        topStores: [],
      };
    }
  },

  /**
   * Obtenir les dépenses pour une période spécifique
   */
  async getSpendingByPeriod(userId: string, startDate: Date, endDate: Date): Promise<Order[]> {
    try {
      const orders = await OrderService.getByUser(userId);
      return orders.filter(order => {
        const orderDate = order.createdAt ? (order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt)) : new Date(0);
        return orderDate >= startDate && orderDate <= endDate;
      });
    } catch (error) {
      console.error('Error getting spending by period:', error);
      return [];
    }
  },

  /**
   * Obtenir l'historique des dépenses mensuelles
   */
  async getMonthlySpendingHistory(userId: string, months: number = 12): Promise<{ month: string; amount: number }[]> {
    try {
      const stats = await this.getSpendingStats(userId);
      const history: { month: string; amount: number }[] = [];

      const now = new Date();
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        history.push({
          month: monthKey,
          amount: stats.spendingByMonth[monthKey] || 0,
        });
      }

      return history;
    } catch (error) {
      console.error('Error getting monthly spending history:', error);
      return [];
    }
  },
};
