import { FirestoreService } from './firestoreService';
import { where } from 'firebase/firestore';

export interface VisitHistory {
  id?: string;
  userId: string;
  district: string; // Quartier visité
  visitCount: number; // Nombre de visites
  lastVisit?: any; // Dernière visite
  firstVisit?: any; // Première visite
  createdAt?: any;
  updatedAt?: any;
}

export const VisitHistoryService = {
  /**
   * Enregistrer une visite d'un quartier
   */
  async recordVisit(userId: string, district: string): Promise<void> {
    try {
      // Chercher si le quartier a déjà été visité
      const existing = await FirestoreService.query<VisitHistory>('visitHistory', [
        where('userId', '==', userId),
        where('district', '==', district),
      ]);

      if (existing.length > 0) {
        // Mettre à jour la visite existante
        const history = existing[0];
        await FirestoreService.update<VisitHistory>('visitHistory', history.id!, {
          visitCount: (history.visitCount || 0) + 1,
          lastVisit: new Date(),
        });
      } else {
        // Créer une nouvelle entrée
        await FirestoreService.create<VisitHistory>('visitHistory', {
          userId,
          district,
          visitCount: 1,
          firstVisit: new Date(),
          lastVisit: new Date(),
        });
      }
    } catch (error) {
      console.error('Error recording visit:', error);
    }
  },

  /**
   * Obtenir l'historique des visites d'un utilisateur
   */
  async getVisitHistory(userId: string): Promise<VisitHistory[]> {
    try {
      const history = await FirestoreService.query<VisitHistory>('visitHistory', [
        where('userId', '==', userId),
      ]);
      // Trier par nombre de visites décroissant
      return history.sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0));
    } catch (error) {
      console.error('Error getting visit history:', error);
      return [];
    }
  },

  /**
   * Obtenir les quartiers les plus visités
   */
  async getMostVisitedDistricts(userId: string, limit: number = 10): Promise<VisitHistory[]> {
    try {
      const history = await this.getVisitHistory(userId);
      return history.slice(0, limit);
    } catch (error) {
      console.error('Error getting most visited districts:', error);
      return [];
    }
  },

  /**
   * Obtenir le nombre total de visites
   */
  async getTotalVisits(userId: string): Promise<number> {
    try {
      const history = await this.getVisitHistory(userId);
      return history.reduce((total, h) => total + (h.visitCount || 0), 0);
    } catch (error) {
      console.error('Error getting total visits:', error);
      return 0;
    }
  },

  /**
   * Obtenir les visites récentes (par date)
   */
  async getRecentVisits(userId: string, limit: number = 10): Promise<VisitHistory[]> {
    try {
      const history = await FirestoreService.query<VisitHistory>('visitHistory', [
        where('userId', '==', userId),
      ]);
      // Trier par dernière visite décroissant
      return history
        .sort((a, b) => {
          const dateA = a.lastVisit ? (a.lastVisit.toDate ? a.lastVisit.toDate() : new Date(a.lastVisit)) : new Date(0);
          const dateB = b.lastVisit ? (b.lastVisit.toDate ? b.lastVisit.toDate() : new Date(b.lastVisit)) : new Date(0);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting recent visits:', error);
      return [];
    }
  },
};
