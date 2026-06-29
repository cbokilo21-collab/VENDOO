import { FirestoreService } from './firestoreService';

export interface Message {
  id?: string;
  conversationId: string;
  senderId: string; // ID de l'expéditeur (visiteur ou boutique)
  senderName: string;
  text: string;
  timestamp?: any;
  read: boolean;
}

export interface Conversation {
  id?: string;
  buyerId: string; // ID du visiteur
  buyerName: string;
  storeId: string; // ID de la boutique
  storeName: string;
  lastMessage?: string;
  lastMessageTimestamp?: any;
  unreadCount: number; // Nombre de messages non lus pour ce destinataire
  createdAt?: any;
  updatedAt?: any;
}

export const MessagingService = {
  /**
   * Créer une nouvelle conversation
   */
  async createConversation(data: Omit<Conversation, 'id' | 'unreadCount' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const conversationId = await FirestoreService.create<Conversation>('conversations', {
      ...data,
      unreadCount: 0,
    });
    return conversationId;
  },

  /**
   * Obtenir une conversation par ID
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
    return FirestoreService.get<Conversation>('conversations', conversationId);
  },

  /**
   * Obtenir toutes les conversations d'un visiteur
   */
  async getBuyerConversations(buyerId: string): Promise<Conversation[]> {
    return FirestoreService.query<Conversation>('conversations', [
      { field: 'buyerId', operator: '==', value: buyerId },
    ]);
  },

  /**
   * Obtenir toutes les conversations d'une boutique
   */
  async getStoreConversations(storeId: string): Promise<Conversation[]> {
    return FirestoreService.query<Conversation>('conversations', [
      { field: 'storeId', operator: '==', value: storeId },
    ]);
  },

  /**
   * Obtenir ou créer une conversation entre un visiteur et une boutique
   */
  async getOrCreateConversation(buyerId: string, buyerName: string, storeId: string, storeName: string): Promise<Conversation> {
    // Essayer de trouver une conversation existante
    const existing = await FirestoreService.query<Conversation>('conversations', [
      { field: 'buyerId', operator: '==', value: buyerId },
      { field: 'storeId', operator: '==', value: storeId },
    ]);

    if (existing.length > 0) {
      return existing[0];
    }

    // Créer une nouvelle conversation
    const conversationId = await this.createConversation({
      buyerId,
      buyerName,
      storeId,
      storeName,
    });

    const conversation = await this.getConversation(conversationId);
    if (!conversation) {
      throw new Error('Failed to create conversation');
    }

    return conversation;
  },

  /**
   * Envoyer un message
   */
  async sendMessage(conversationId: string, senderId: string, senderName: string, text: string): Promise<string> {
    const messageId = await FirestoreService.create<Message>('messages', {
      conversationId,
      senderId,
      senderName,
      text,
      read: false,
    });

    // Mettre à jour la conversation avec le dernier message
    const conversation = await this.getConversation(conversationId);
    if (conversation) {
      await FirestoreService.update<Conversation>('conversations', conversationId, {
        lastMessage: text,
        lastMessageTimestamp: new Date(),
        unreadCount: (conversation.unreadCount || 0) + 1,
      });
    }

    return messageId;
  },

  /**
   * Obtenir tous les messages d'une conversation
   */
  async getMessages(conversationId: string): Promise<Message[]> {
    return FirestoreService.query<Message>('messages', [
      { field: 'conversationId', operator: '==', value: conversationId },
    ]);
  },

  /**
   * Marquer les messages comme lus
   */
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    // Marquer tous les messages non lus de cette conversation comme lus
    const messages = await this.getMessages(conversationId);
    const unreadMessages = messages.filter(m => !m.read && m.senderId !== userId);

    for (const message of unreadMessages) {
      if (message.id) {
        await FirestoreService.update<Message>('messages', message.id, { read: true });
      }
    }

    // Réinitialiser le compteur de messages non lus
    const conversation = await this.getConversation(conversationId);
    if (conversation) {
      await FirestoreService.update<Conversation>('conversations', conversationId, {
        unreadCount: 0,
      });
    }
  },

  /**
   * Écouter les messages d'une conversation en temps réel
   */
  subscribeToMessages(conversationId: string, callback: (messages: Message[]) => void) {
    return FirestoreService.onQuery<Message>('messages', [
      { field: 'conversationId', operator: '==', value: conversationId },
    ], callback);
  },

  /**
   * Écouter les conversations d'un visiteur en temps réel
   */
  subscribeToBuyerConversations(buyerId: string, callback: (conversations: Conversation[]) => void) {
    return FirestoreService.onQuery<Conversation>('conversations', [
      { field: 'buyerId', operator: '==', value: buyerId },
    ], callback);
  },

  /**
   * Écouter les conversations d'une boutique en temps réel
   */
  subscribeToStoreConversations(storeId: string, callback: (conversations: Conversation[]) => void) {
    return FirestoreService.onQuery<Conversation>('conversations', [
      { field: 'storeId', operator: '==', value: storeId },
    ], callback);
  },
};
