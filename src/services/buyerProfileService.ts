import { FirestoreService } from './firestoreService';

export interface BuyerProfile {
  id?: string;
  userId: string;
  name: string;
  email: string;
  favoriteMarkets: string[]; // Marchés/Catégories favoris (ex: ['Électronique', 'Mode', 'Alimentation'])
  favoriteStores: string[]; // IDs des boutiques favorites
  createdAt?: any;
  updatedAt?: any;
}

export const BuyerProfileService = {
  /**
   * Créer ou mettre à jour le profil d'un visiteur
   */
  async setProfile(userId: string, data: Partial<BuyerProfile>): Promise<void> {
    await FirestoreService.set('buyerProfiles', userId, data, true);
  },

  /**
   * Obtenir le profil d'un visiteur
   */
  async getProfile(userId: string): Promise<BuyerProfile | null> {
    return FirestoreService.get<BuyerProfile>('buyerProfiles', userId);
  },

  /**
   * Ajouter un marché aux favoris
   */
  async addFavoriteMarket(userId: string, market: string): Promise<void> {
    const profile = await this.getProfile(userId);
    if (!profile) {
      throw new Error('Profile not found');
    }
    const updatedMarkets = [...(profile.favoriteMarkets || []), market];
    await this.setProfile(userId, { favoriteMarkets: updatedMarkets });
  },

  /**
   * Retirer un marché des favoris
   */
  async removeFavoriteMarket(userId: string, market: string): Promise<void> {
    const profile = await this.getProfile(userId);
    if (!profile) {
      throw new Error('Profile not found');
    }
    const updatedMarkets = (profile.favoriteMarkets || []).filter(m => m !== market);
    await this.setProfile(userId, { favoriteMarkets: updatedMarkets });
  },

  /**
   * Ajouter une boutique aux favoris
   */
  async addFavoriteStore(userId: string, storeId: string): Promise<void> {
    const profile = await this.getProfile(userId);
    if (!profile) {
      throw new Error('Profile not found');
    }
    const updatedStores = [...(profile.favoriteStores || []), storeId];
    await this.setProfile(userId, { favoriteStores: updatedStores });
  },

  /**
   * Retirer une boutique des favoris
   */
  async removeFavoriteStore(userId: string, storeId: string): Promise<void> {
    const profile = await this.getProfile(userId);
    if (!profile) {
      throw new Error('Profile not found');
    }
    const updatedStores = (profile.favoriteStores || []).filter(s => s !== storeId);
    await this.setProfile(userId, { favoriteStores: updatedStores });
  },

  /**
   * Écouter les changements du profil en temps réel
   */
  subscribeToProfile(userId: string, callback: (profile: BuyerProfile | null) => void) {
    return FirestoreService.onDocument<BuyerProfile>('buyerProfiles', userId, callback);
  },
};
