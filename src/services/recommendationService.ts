import { FirestoreService } from './firestoreService';
import { BuyerProfileService, BuyerProfile } from './buyerProfileService';
import { where } from 'firebase/firestore';

export interface Store {
  id: string;
  name: string;
  district: string;
  category: string;
  rating: number;
  description?: string;
  imageUrl?: string;
  createdAt?: any;
}

export interface Recommendation {
  store: Store;
  score: number;
  reason: string;
}

export const RecommendationService = {
  /**
   * Obtenir les boutiques recommandées pour un visiteur
   * Basé sur ses marchés favoris (catégories de produits)
   */
  async getRecommendations(buyerId: string): Promise<Recommendation[]> {
    try {
      // Obtenir le profil du client
      const profile = await BuyerProfileService.getProfile(buyerId);
      if (!profile) {
        return [];
      }

      const favoriteMarkets = profile.favoriteMarkets || [];

      // Obtenir toutes les boutiques
      const allStores = await FirestoreService.getAll<Store>('stores');

      // Calculer les scores de recommandation
      const recommendations: Recommendation[] = allStores.map(store => {
        let score = 0;
        const reasons: string[] = [];

        // Score basé sur les marchés favoris (catégories)
        if (favoriteMarkets.includes(store.category)) {
          score += 50;
          reasons.push(`Catégorie que vous aimez : ${store.category}`);
        }

        // Score basé sur la note de la boutique
        score += store.rating * 5;

        // Bonus pour les boutiques bien notées
        if (store.rating >= 4.5) {
          score += 10;
          reasons.push('Très bien notée');
        }

        return {
          store,
          score,
          reason: reasons.length > 0 ? reasons[0] : 'Recommandation',
        };
      });

      // Trier par score décroissant et retourner les 10 meilleures
      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  },

  /**
   * Obtenir les boutiques par secteur
   */
  async getStoresByDistrict(district: string): Promise<Store[]> {
    try {
      const stores = await FirestoreService.query<Store>('stores', [
        where('district', '==', district),
      ]);
      return stores;
    } catch (error) {
      console.error('Error getting stores by district:', error);
      return [];
    }
  },

  /**
   * Obtenir les boutiques par catégorie
   */
  async getStoresByCategory(category: string): Promise<Store[]> {
    try {
      const stores = await FirestoreService.query<Store>('stores', [
        where('category', '==', category),
      ]);
      return stores;
    } catch (error) {
      console.error('Error getting stores by category:', error);
      return [];
    }
  },

  /**
   * Obtenir les boutiques populaires (basé sur la note)
   */
  async getPopularStores(limit: number = 10): Promise<Store[]> {
    try {
      const allStores = await FirestoreService.getAll<Store>('stores');
      return allStores
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting popular stores:', error);
      return [];
    }
  },

  /**
   * Obtenir les boutiques dans les marchés favoris du client
   */
  async getStoresInFavoriteMarkets(buyerId: string): Promise<Store[]> {
    try {
      const profile = await BuyerProfileService.getProfile(buyerId);
      if (!profile || !profile.favoriteMarkets || profile.favoriteMarkets.length === 0) {
        return [];
      }

      const favoriteMarkets = profile.favoriteMarkets;
      const allStores = await FirestoreService.getAll<Store>('stores');

      // Filtrer les boutiques dans les marchés favoris (catégories)
      return allStores.filter(store => favoriteMarkets.includes(store.category));
    } catch (error) {
      console.error('Error getting stores in favorite markets:', error);
      return [];
    }
  },

  /**
   * Obtenir les nouvelles boutiques (basé sur la date de création)
   */
  async getNewStores(limit: number = 10): Promise<Store[]> {
    try {
      const allStores = await FirestoreService.getAll<Store>('stores');
      // Trier par date de création (plus récent en premier)
      return allStores
        .sort((a, b) => {
          const dateA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
          const dateB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting new stores:', error);
      return [];
    }
  },
};
