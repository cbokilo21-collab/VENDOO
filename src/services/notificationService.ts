import { FirestoreService } from './firestoreService';
import { where } from 'firebase/firestore';
import { MessagingService } from './messagingService';

export interface Notification {
  id?: string;
  userId: string;
  type: 'order' | 'message' | 'promotion' | 'review' | 'delivery' | 'system' | 'broadcast';
  title: string;
  body: string;
  data?: Record<string, any>; // Données supplémentaires (orderId, storeId, etc.)
  read: boolean;
  createdAt?: any;
}

export const NotificationService = {
  /**
   * Créer une notification pour un utilisateur
   */
  async create(userId: string, notification: Omit<Notification, 'id' | 'userId' | 'read' | 'createdAt'>): Promise<string> {
    return FirestoreService.create<Notification>('notifications', {
      ...notification,
      userId,
      read: false,
    });
  },

  /**
   * Obtenir toutes les notifications d'un utilisateur
   */
  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const notifications = await FirestoreService.query<Notification>('notifications', [
        where('userId', '==', userId),
      ]);
      // Trier par date décroissant
      return notifications.sort((a, b) => {
        const dateA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
        const dateB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  },

  /**
   * Obtenir les notifications non lues
   */
  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    try {
      const notifications = await FirestoreService.query<Notification>('notifications', [
        where('userId', '==', userId),
        where('read', '==', false),
      ]);
      return notifications.sort((a, b) => {
        const dateA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
        const dateB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('Error getting unread notifications:', error);
      return [];
    }
  },

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(notificationId: string): Promise<void> {
    await FirestoreService.update<Notification>('notifications', notificationId, { read: true });
  },

  /**
   * Marquer toutes les notifications d'un utilisateur comme lues
   */
  async markAllAsRead(userId: string): Promise<void> {
    const notifications = await this.getUnreadNotifications(userId);
    for (const notification of notifications) {
      if (notification.id) {
        await this.markAsRead(notification.id);
      }
    }
  },

  /**
   * Supprimer une notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await FirestoreService.delete('notifications', notificationId);
  },

  /**
   * Compter les notifications non lues
   */
  async getUnreadCount(userId: string): Promise<number> {
    const unread = await this.getUnreadNotifications(userId);
    return unread.length;
  },

  /**
   * Écouter les notifications en temps réel
   */
  subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    return FirestoreService.onQuery<Notification>('notifications', [
      where('userId', '==', userId),
    ], callback);
  },

  /**
   * Créer une notification de commande
   */
  async createOrderNotification(userId: string, orderId: string, status: string): Promise<void> {
    const statusMessages: Record<string, { title: string; body: string }> = {
      paid: { title: 'Commande payée', body: 'Votre commande a été payée avec succès' },
      processing: { title: 'Commande en préparation', body: 'Votre commande est en cours de préparation' },
      shipped: { title: 'Commande expédiée', body: 'Votre commande a été expédiée' },
      delivered: { title: 'Commande livrée', body: 'Votre commande a été livrée' },
      cancelled: { title: 'Commande annulée', body: 'Votre commande a été annulée' },
    };

    const message = statusMessages[status] || { title: 'Mise à jour commande', body: `Votre commande est ${status}` };
    
    await this.create(userId, {
      type: 'order',
      title: message.title,
      body: message.body,
      data: { orderId, status },
    });
  },

  /**
   * Créer une notification de message
   */
  async createMessageNotification(
    userId: string,
    conversationId: string,
    senderName: string,
    buyerId?: string,
    buyerName?: string,
    storeId?: string,
    storeName?: string
  ): Promise<void> {
    // D'abord, s'assurer que la conversation existe
    try {
      const conversation = await MessagingService.getConversation(conversationId);
      if (!conversation && buyerId && buyerName && storeId && storeName) {
        // Créer la conversation si elle n'existe pas
        const newConversationId = await MessagingService.createConversation({
          buyerId,
          buyerName,
          storeId,
          storeName,
        });
        console.log('Created conversation from notification:', newConversationId);
      }
    } catch (error) {
      console.error('Error checking/creating conversation:', error);
    }

    // Créer la notification
    await this.create(userId, {
      type: 'message',
      title: 'Nouveau message',
      body: `Vous avez reçu un message de ${senderName}`,
      data: { conversationId, senderName, buyerId, buyerName, storeId, storeName },
    });

    // Mettre à jour le compteur de non-lus si la conversation existe
    try {
      const conversation = await MessagingService.getConversation(conversationId);
      if (conversation) {
        await FirestoreService.update('conversations', conversationId, {
          unreadCount: (conversation.unreadCount || 0) + 1,
          lastMessageTimestamp: new Date(),
        });
      }
    } catch (error) {
      console.error('Error updating unread count:', error);
    }
  },

  /**
   * Créer une notification de livraison
   */
  async createDeliveryNotification(userId: string, orderId: string, message: string): Promise<void> {
    await this.create(userId, {
      type: 'delivery',
      title: 'Mise à jour livraison',
      body: message,
      data: { orderId },
    });
  },
};
