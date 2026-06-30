import { where } from 'firebase/firestore';
import { FirestoreService } from './firestoreService';
import { Currency } from './currencyService';

export interface AdminPreferences {
  id?: string;
  userId: string;
  currency: Currency;
  paymentMethods: {
    visa: {
      enabled: boolean;
      accountNumber?: string;
      bankName?: string;
    };
    mobileMoney: {
      enabled: boolean;
      provider?: 'orange' | 'mtn' | 'moov' | 'wave' | 'other';
      phoneNumber?: string;
    };
    cash: {
      enabled: boolean;
    };
  };
  createdAt?: any;
  updatedAt?: any;
}

const DEFAULT_PREFERENCES: Omit<AdminPreferences, 'userId' | 'id' | 'createdAt' | 'updatedAt'> = {
  currency: 'XOF',
  paymentMethods: {
    visa: {
      enabled: false,
    },
    mobileMoney: {
      enabled: false,
    },
    cash: {
      enabled: true,
    },
  },
};

export const AdminPreferencesService = {
  async getPreferences(userId: string): Promise<AdminPreferences> {
    try {
      const prefs = await FirestoreService.query<AdminPreferences>('adminPreferences', [
        where('userId', '==', userId),
      ]);
      
      if (prefs.length > 0) {
        return prefs[0];
      }
      
      // Create default preferences if none exist
      return await this.createPreferences(userId, DEFAULT_PREFERENCES);
    } catch (error) {
      console.error('Error getting admin preferences:', error);
      return { ...DEFAULT_PREFERENCES, userId } as AdminPreferences;
    }
  },

  async createPreferences(
    userId: string,
    data: Partial<Omit<AdminPreferences, 'userId' | 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<AdminPreferences> {
    const id = await FirestoreService.create('adminPreferences', {
      userId,
      ...DEFAULT_PREFERENCES,
      ...data,
    });
    return { id, userId, ...DEFAULT_PREFERENCES, ...data } as AdminPreferences;
  },

  async updatePreferences(
    userId: string,
    data: Partial<Omit<AdminPreferences, 'userId' | 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> {
    const prefs = await this.getPreferences(userId);
    if (prefs.id) {
      await FirestoreService.update('adminPreferences', prefs.id, {
        ...data,
        updatedAt: new Date(),
      });
    }
  },

  async setCurrency(userId: string, currency: Currency): Promise<void> {
    await this.updatePreferences(userId, { currency });
  },

  async updatePaymentMethod(
    userId: string,
    method: 'visa' | 'mobileMoney' | 'cash',
    data: any
  ): Promise<void> {
    const prefs = await this.getPreferences(userId);
    const updatedPaymentMethods = {
      ...prefs.paymentMethods,
      [method]: {
        ...prefs.paymentMethods[method],
        ...data,
      },
    };
    await this.updatePreferences(userId, { paymentMethods: updatedPaymentMethods });
  },
};
