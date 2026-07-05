/**
 * ShoppyService — Shoppy is Vendoo's premium theme marketplace. The admin
 * account authors and prices premium themes here; merchant accounts browse,
 * buy, and apply them to their own boutique from src/screens/ShoppyScreen.tsx.
 */
import { FirestoreService } from './firestoreService';
import { where } from 'firebase/firestore';

export interface ShoppyDemoProduct {
  name: string;
  price: number;
  originalPrice?: number;
  emoji: string;
  image: string;
}

export interface PremiumTheme {
  id?: string;
  name: string;
  industry: string;
  tagline: string;
  description: string;
  emoji: string;
  priceFCFA: number;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: { heading: string; body: string };
  layout: { productGridColumns: number; spacing: number };
  productCard: {
    showPrice: boolean;
    showOriginalPrice: boolean;
    showAddToCart: boolean;
    showFavorite: boolean;
    borderRadius: number;
    shadow: boolean;
    layout: 'grid' | 'list';
  };
  headerTemplate: string;
  bodyTemplate: string;
  footerTemplate: string;
  footer: { backgroundColor: string; textColor: string };
  hero: { title: string; subtitle: string; cta: string; image: string };
  demoProducts: ShoppyDemoProduct[];
  active: boolean;
  createdBy?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface ThemePurchase {
  id?: string;
  boutiqueId: string;
  userId: string;
  themeId: string;
  themeName: string;
  priceFCFA: number;
  purchasedAt?: any;
}

class ShoppyServiceImpl {
  private themesCollection = 'premiumThemes';
  private purchasesCollection = 'themePurchases';

  /** Public catalog: only themes the admin has published. */
  async getActiveThemes(): Promise<PremiumTheme[]> {
    const themes = await FirestoreService.query<PremiumTheme>(this.themesCollection, [
      where('active', '==', true),
    ]);
    return themes.sort((a, b) => a.name.localeCompare(b.name));
  }

  /** Admin catalog management view: every theme, published or not. */
  async getAllThemes(): Promise<PremiumTheme[]> {
    const themes = await FirestoreService.getAll<PremiumTheme>(this.themesCollection);
    return themes.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getTheme(id: string): Promise<PremiumTheme | null> {
    return FirestoreService.get<PremiumTheme>(this.themesCollection, id);
  }

  async createTheme(data: Omit<PremiumTheme, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return FirestoreService.create<PremiumTheme>(this.themesCollection, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as PremiumTheme);
  }

  async updateTheme(id: string, updates: Partial<PremiumTheme>): Promise<void> {
    await FirestoreService.update<PremiumTheme>(this.themesCollection, id, {
      ...updates,
      updatedAt: new Date(),
    });
  }

  async deleteTheme(id: string): Promise<void> {
    await FirestoreService.delete(this.themesCollection, id);
  }

  /**
   * List a merchant's Shoppy purchases. Queried by `userId` (not
   * `boutiqueId`) because Firestore security rules for list queries must
   * match the field the rule actually checks ownership on.
   */
  async getPurchasesByUser(userId: string): Promise<ThemePurchase[]> {
    return FirestoreService.query<ThemePurchase>(this.purchasesCollection, [
      where('userId', '==', userId),
    ]);
  }

  async recordPurchase(purchase: Omit<ThemePurchase, 'id' | 'purchasedAt'>): Promise<string> {
    return FirestoreService.create<ThemePurchase>(this.purchasesCollection, {
      ...purchase,
      purchasedAt: new Date(),
    } as ThemePurchase);
  }
}

export const ShoppyService = new ShoppyServiceImpl();
