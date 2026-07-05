import { where, Timestamp } from 'firebase/firestore';
import { FirestoreService } from './firestoreService';

export interface Boutique {
  id?: string;
  userId: string;
  nom: string;
  slug?: string;
  shopUrl?: string;
  description: string;
  logo: string;
  website: string;
  instagram: string;
  facebook: string;
  email: string;
  phone: string;
  currency: string;
  timezone: string;
  secteur: string;
  pays: string;
  ville: string;
  quartier?: string;
  couleur: string;
  chatbot?: {
    enabled: boolean;
    name: string;
    tone: string;
    welcomeMessage: string;
  };
  createdAt?: any;
  updatedAt?: any;
}

export const BoutiqueService = {
  async create(userId: string, data: Omit<Boutique, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = await FirestoreService.create('boutiques', {
      ...data,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return id;
  },

  async update(boutiqueId: string, data: Partial<Boutique>): Promise<void> {
    await FirestoreService.update('boutiques', boutiqueId, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async getByUser(userId: string): Promise<Boutique[]> {
    return FirestoreService.query<Boutique>('boutiques', [
      where('userId', '==', userId),
    ]);
  },

  async getById(boutiqueId: string): Promise<Boutique | null> {
    return FirestoreService.get<Boutique>('boutiques', boutiqueId);
  },

  async getBySlug(slug: string): Promise<Boutique | null> {
    const results = await FirestoreService.query<Boutique>('boutiques', [
      where('slug', '==', slug),
    ]);
    return results.length > 0 ? results[0] : null;
  },

  async getAll(): Promise<Boutique[]> {
    return FirestoreService.getAll<Boutique>('boutiques');
  },
};
