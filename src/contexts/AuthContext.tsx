import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { UserService, UserType } from '../services/userService';

interface AuthContextType {
  user: User | null;
  userType: UserType | null;
  setUserType: (type: UserType | null) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    // Fast timeout for web to prevent hanging
    const timeoutMs = 2000;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!mounted) return;
      console.log('Auth state changed:', currentUser?.email || 'no user');
      setUser(currentUser);

      if (currentUser) {
        // Check if super admin - this overrides any existing profile
        if (currentUser.email === 'cbokilo18@gmail.com') {
          if (mounted) setUserType('admin');
          // Update Firestore profile to admin for consistency
          try {
            await UserService.setProfile(currentUser.uid, {
              name: 'Cyril Bokilo',
              email: currentUser.email,
              userType: 'admin',
            });
          } catch (e) {
            console.error('Failed to update admin profile:', e);
          }
        } else {
          // Load the persisted user type so we show the right interface.
          // Default to 'business' for legacy accounts that have no profile yet.
          try {
            const type = await UserService.getType(currentUser.uid);
            if (mounted) setUserType(type ?? 'business');
          } catch {
            if (mounted) setUserType('business');
          }
        }
      } else {
        setUserType(null);
      }

      if (mounted) setLoading(false);
    });

    // Timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth timeout - forcing loading to false');
        setLoading(false);
      }
    }, timeoutMs);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userType, setUserType, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
