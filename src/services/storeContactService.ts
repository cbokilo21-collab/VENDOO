import { FirestoreService } from './firestoreService';
import { where } from 'firebase/firestore';

export interface StoreContact {
  id?: string;
  userId: string; // ID du visiteur
  storeId: string; // ID de la boutique
  storeName: string;
  storeCategory: string;
  storeDistrict: string;
  contactDate: any; // Date du premier contact
  lastContactDate?: any; // Date du dernier contact
  contactCount: number; // Nombre de fois contacté
  status: 'active' | 'inactive' | 'blocked';
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}

export const StoreContactService = {
  /**
   * Créer ou mettre à jour un contact vendeur
   */
  async recordContact(userId: string, storeId: string, storeName: string, storeCategory: string, storeDistrict: string): Promise<void> {
    try {
      // Chercher si le contact existe déjà
      const existing = await FirestoreService.query<StoreContact>('storeContacts', [
        where('userId', '==', userId),
        where('storeId', '==', storeId),
      ]);

      if (existing.length > 0) {
        // Mettre à jour le contact existant
        const contact = existing[0];
        await FirestoreService.update<StoreContact>('storeContacts', contact.id!, {
          contactCount: (contact.contactCount || 0) + 1,
          lastContactDate: new Date(),
          status: 'active',
          updatedAt: new Date(),
        });
      } else {
        // Créer un nouveau contact
        await FirestoreService.create<StoreContact>('storeContacts', {
          userId,
          storeId,
          storeName,
          storeCategory,
          storeDistrict,
          contactDate: new Date(),
          lastContactDate: new Date(),
          contactCount: 1,
          status: 'active',
        });
      }
    } catch (error) {
      console.error('Error recording contact:', error);
    }
  },

  /**
   * Obtenir tous les contacts d'un utilisateur
   */
  async getUserContacts(userId: string): Promise<StoreContact[]> {
    try {
      const contacts = await FirestoreService.query<StoreContact>('storeContacts', [
        where('userId', '==', userId),
      ]);
      // Trier par dernier contact décroissant
      return contacts.sort((a, b) => {
        const dateA = a.lastContactDate ? (a.lastContactDate.toDate ? a.lastContactDate.toDate() : new Date(a.lastContactDate)) : new Date(0);
        const dateB = b.lastContactDate ? (b.lastContactDate.toDate ? b.lastContactDate.toDate() : new Date(b.lastContactDate)) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('Error getting user contacts:', error);
      return [];
    }
  },

  /**
   * Obtenir les contacts actifs
   */
  async getActiveContacts(userId: string): Promise<StoreContact[]> {
    try {
      const contacts = await FirestoreService.query<StoreContact>('storeContacts', [
        where('userId', '==', userId),
        where('status', '==', 'active'),
      ]);
      return contacts.sort((a, b) => {
        const dateA = a.lastContactDate ? (a.lastContactDate.toDate ? a.lastContactDate.toDate() : new Date(a.lastContactDate)) : new Date(0);
        const dateB = b.lastContactDate ? (b.lastContactDate.toDate ? b.lastContactDate.toDate() : new Date(b.lastContactDate)) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('Error getting active contacts:', error);
      return [];
    }
  },

  /**
   * Mettre à jour le statut d'un contact
   */
  async updateContactStatus(contactId: string, status: 'active' | 'inactive' | 'blocked'): Promise<void> {
    await FirestoreService.update<StoreContact>('storeContacts', contactId, { status, updatedAt: new Date() });
  },

  /**
   * Ajouter des notes à un contact
   */
  async addNotes(contactId: string, notes: string): Promise<void> {
    await FirestoreService.update<StoreContact>('storeContacts', contactId, { notes, updatedAt: new Date() });
  },

  /**
   * Supprimer un contact
   */
  async deleteContact(contactId: string): Promise<void> {
    await FirestoreService.delete('storeContacts', contactId);
  },

  /**
   * Obtenir les contacts les plus fréquents
   */
  async getMostContactedStores(userId: string, limit: number = 10): Promise<StoreContact[]> {
    try {
      const contacts = await this.getUserContacts(userId);
      return contacts.sort((a, b) => (b.contactCount || 0) - (a.contactCount || 0)).slice(0, limit);
    } catch (error) {
      console.error('Error getting most contacted stores:', error);
      return [];
    }
  },

  /**
   * Obtenir le nombre total de contacts
   */
  async getTotalContacts(userId: string): Promise<number> {
    try {
      const contacts = await this.getUserContacts(userId);
      return contacts.length;
    } catch (error) {
      console.error('Error getting total contacts:', error);
      return 0;
    }
  },
};
