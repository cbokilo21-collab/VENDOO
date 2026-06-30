import { FirestoreService } from './firestoreService';
import { where } from 'firebase/firestore';

export interface Review {
  id?: string;
  userId: string; // ID du client
  storeId: string; // ID de la boutique
  storeName: string;
  rating: number; // Note de 1 à 5
  title: string;
  comment: string;
  pros?: string[]; // Points positifs
  cons?: string[]; // Points négatifs
  verified: boolean; // Achat vérifié
  orderId?: string; // ID de commande si vérifié
  helpfulCount: number; // Nombre de votes utiles
  createdAt?: any;
  updatedAt?: any;
}

export const ReviewService = {
  /**
   * Créer un avis sur une boutique
   */
  async createReview(data: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'helpfulCount'>): Promise<string> {
    return FirestoreService.create<Review>('reviews', {
      ...data,
      helpfulCount: 0,
    });
  },

  /**
   * Obtenir tous les avis d'un utilisateur
   */
  async getUserReviews(userId: string): Promise<Review[]> {
    try {
      const reviews = await FirestoreService.query<Review>('reviews', [
        where('userId', '==', userId),
      ]);
      // Trier par date décroissant
      return reviews.sort((a, b) => {
        const dateA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
        const dateB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('Error getting user reviews:', error);
      return [];
    }
  },

  /**
   * Obtenir tous les avis d'une boutique
   */
  async getStoreReviews(storeId: string): Promise<Review[]> {
    try {
      const reviews = await FirestoreService.query<Review>('reviews', [
        where('storeId', '==', storeId),
      ]);
      return reviews.sort((a, b) => {
        const dateA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
        const dateB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('Error getting store reviews:', error);
      return [];
    }
  },

  /**
   * Obtenir la note moyenne d'une boutique
   */
  async getStoreAverageRating(storeId: string): Promise<{ average: number; count: number }> {
    try {
      const reviews = await this.getStoreReviews(storeId);
      if (reviews.length === 0) {
        return { average: 0, count: 0 };
      }
      const sum = reviews.reduce((total, review) => total + review.rating, 0);
      return { average: sum / reviews.length, count: reviews.length };
    } catch (error) {
      console.error('Error getting average rating:', error);
      return { average: 0, count: 0 };
    }
  },

  /**
   * Marquer un avis comme utile
   */
  async markAsHelpful(reviewId: string): Promise<void> {
    const review = await FirestoreService.get<Review>('reviews', reviewId);
    if (review) {
      await FirestoreService.update<Review>('reviews', reviewId, {
        helpfulCount: (review.helpfulCount || 0) + 1,
      });
    }
  },

  /**
   * Mettre à jour un avis
   */
  async updateReview(reviewId: string, data: Partial<Review>): Promise<void> {
    await FirestoreService.update<Review>('reviews', reviewId, {
      ...data,
      updatedAt: new Date(),
    });
  },

  /**
   * Supprimer un avis
   */
  async deleteReview(reviewId: string): Promise<void> {
    await FirestoreService.delete('reviews', reviewId);
  },

  /**
   * Obtenir les avis vérifiés (avec achat)
   */
  async getVerifiedReviews(storeId: string): Promise<Review[]> {
    try {
      const reviews = await FirestoreService.query<Review>('reviews', [
        where('storeId', '==', storeId),
        where('verified', '==', true),
      ]);
      return reviews.sort((a, b) => {
        const dateA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
        const dateB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('Error getting verified reviews:', error);
      return [];
    }
  },

  /**
   * Obtenir les statistiques d'avis d'une boutique
   */
  async getStoreReviewStats(storeId: string): Promise<{
    total: number;
    average: number;
    distribution: Record<number, number>; // Distribution par note (1-5)
    verifiedCount: number;
  }> {
    try {
      const reviews = await this.getStoreReviews(storeId);
      const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      
      reviews.forEach(review => {
        distribution[review.rating] = (distribution[review.rating] || 0) + 1;
      });

      const sum = reviews.reduce((total, review) => total + review.rating, 0);
      const average = reviews.length > 0 ? sum / reviews.length : 0;
      const verifiedCount = reviews.filter(r => r.verified).length;

      return {
        total: reviews.length,
        average,
        distribution,
        verifiedCount,
      };
    } catch (error) {
      console.error('Error getting review stats:', error);
      return { total: 0, average: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, verifiedCount: 0 };
    }
  },
};
