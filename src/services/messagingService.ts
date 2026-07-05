import { FirestoreService } from './firestoreService';
import { where, orderBy } from 'firebase/firestore';

export interface Message {
  id?: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderPhotoURL?: string;
  text: string;
  timestamp?: any;
  read: boolean;
}

export interface Conversation {
  id?: string;
  buyerId: string;
  buyerName: string;
  buyerPhotoURL?: string;
  storeId: string;
  storeName: string;
  storePhotoURL?: string;
  lastMessage?: string;
  lastMessageTimestamp?: any;
  unreadCount: number;
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
      lastMessage: '',
      lastMessageTimestamp: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
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
   * Obtenir toutes les conversations d'un utilisateur (client ou boutique),
   * ou l'ensemble des conversations de la plateforme pour un admin (supervision).
   */
  async getUserConversations(userId: string, userType: 'buyer' | 'business' | 'admin'): Promise<Conversation[]> {
    if (userType === 'admin') {
      return this.getAllConversations();
    }
    const field = userType === 'buyer' ? 'buyerId' : 'storeId';
    return FirestoreService.query<Conversation>('conversations', [
      where(field, '==', userId),
    ]);
  },

  /**
   * Obtenir toutes les conversations de la plateforme (vue admin)
   */
  async getAllConversations(): Promise<Conversation[]> {
    try {
      return await FirestoreService.query<Conversation>('conversations', [
        orderBy('lastMessageTimestamp', 'desc'),
      ]);
    } catch (error) {
      console.error('Error getting all conversations:', error);
      return await FirestoreService.query<Conversation>('conversations', []);
    }
  },

  /**
   * Obtenir ou créer une conversation entre un client et une boutique
   */
  async getOrCreateConversation(buyerId: string, buyerName: string, storeId: string, storeName: string, buyerPhotoURL?: string, storePhotoURL?: string): Promise<Conversation> {
    try {
      const existing = await FirestoreService.query<Conversation>('conversations', [
        where('buyerId', '==', buyerId),
        where('storeId', '==', storeId),
      ]);

      if (existing.length > 0) {
        // Update photoURLs if they changed
        if (buyerPhotoURL && existing[0].buyerPhotoURL !== buyerPhotoURL) {
          await FirestoreService.update<Conversation>('conversations', existing[0].id!, { buyerPhotoURL });
        }
        if (storePhotoURL && existing[0].storePhotoURL !== storePhotoURL) {
          await FirestoreService.update<Conversation>('conversations', existing[0].id!, { storePhotoURL });
        }
        return existing[0];
      }
    } catch (error) {
      console.error('Error querying existing conversation:', error);
    }

    const conversationId = await this.createConversation({
      buyerId,
      buyerName,
      buyerPhotoURL,
      storeId,
      storeName,
      storePhotoURL,
    });

    const conversation = await this.getConversation(conversationId);
    if (!conversation) {
      throw new Error('Failed to create conversation');
    }

    return conversation;
  },

  /**
   * Envoyer un message texte
   */
  async sendMessage(conversationId: string, senderId: string, senderName: string, text: string, senderPhotoURL?: string): Promise<string> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) {
      throw new Error('Conversation does not exist');
    }

    const messageId = await FirestoreService.create<Message>('messages', {
      conversationId,
      senderId,
      senderName,
      senderPhotoURL,
      text,
      read: false,
      timestamp: new Date(),
    });

    const recipientId = senderId === conversation.buyerId ? conversation.storeId : conversation.buyerId;
    const recipientUnreadCount = senderId === conversation.buyerId ? 1 : 0;
    
    await FirestoreService.update<Conversation>('conversations', conversationId, {
      lastMessage: text,
      lastMessageTimestamp: new Date(),
      unreadCount: recipientUnreadCount,
      updatedAt: new Date(),
    });

    return messageId;
  },

  /**
   * Obtenir tous les messages d'une conversation
   */
  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      return await FirestoreService.query<Message>('messages', [
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'asc'),
      ]);
    } catch (error) {
      console.error('Error getting messages:', error);
      return await FirestoreService.query<Message>('messages', [
        where('conversationId', '==', conversationId),
      ]);
    }
  },

  /**
   * Marquer les messages comme lus
   */
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    const messages = await this.getMessages(conversationId);
    const unreadMessages = messages.filter(m => !m.read && m.senderId !== userId);

    for (const message of unreadMessages) {
      if (message.id) {
        await FirestoreService.update<Message>('messages', message.id, { read: true });
      }
    }

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
    try {
      return FirestoreService.onQuery<Message>('messages', [
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'asc'),
      ], callback);
    } catch (error) {
      console.error('Error subscribing to messages:', error);
      return FirestoreService.onQuery<Message>('messages', [
        where('conversationId', '==', conversationId),
      ], callback);
    }
  },

  /**
   * Écouter les conversations d'un utilisateur en temps réel
   */
  subscribeToUserConversations(userId: string, userType: 'buyer' | 'business' | 'admin', callback: (conversations: Conversation[]) => void) {
    if (userType === 'admin') {
      return this.subscribeToAllConversations(callback);
    }
    const field = userType === 'buyer' ? 'buyerId' : 'storeId';
    try {
      return FirestoreService.onQuery<Conversation>('conversations', [
        where(field, '==', userId),
        orderBy('lastMessageTimestamp', 'desc'),
      ], callback);
    } catch (error) {
      console.error('Error subscribing to conversations:', error);
      return FirestoreService.onQuery<Conversation>('conversations', [
        where(field, '==', userId),
      ], callback);
    }
  },

  /**
   * Écouter l'ensemble des conversations de la plateforme en temps réel (vue admin)
   */
  subscribeToAllConversations(callback: (conversations: Conversation[]) => void) {
    try {
      return FirestoreService.onQuery<Conversation>('conversations', [
        orderBy('lastMessageTimestamp', 'desc'),
      ], callback);
    } catch (error) {
      console.error('Error subscribing to all conversations:', error);
      return FirestoreService.onQuery<Conversation>('conversations', [], callback);
    }
  },
};
