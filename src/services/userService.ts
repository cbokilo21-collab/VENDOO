import { FirestoreService } from './firestoreService';

export type UserType = 'buyer' | 'business' | 'admin';

export interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  userType: UserType;
  createdAt?: any;
  updatedAt?: any;
}

export const UserService = {
  /**
   * Create or update a user profile (stores the userType so the app can
   * show the right interface — buyer vs business — after login).
   */
  async setProfile(
    uid: string,
    data: { name?: string; email?: string; userType: UserType }
  ): Promise<void> {
    await FirestoreService.set('users', uid, data, true);
  },

  /**
   * Get the full user profile document.
   */
  async getProfile(uid: string): Promise<UserProfile | null> {
    return FirestoreService.get<UserProfile>('users', uid);
  },

  /**
   * Get only the userType. Returns null if no profile exists yet.
   */
  async getType(uid: string): Promise<UserType | null> {
    try {
      const profile = await FirestoreService.get<UserProfile>('users', uid);
      return profile?.userType ?? null;
    } catch {
      return null;
    }
  },
};
