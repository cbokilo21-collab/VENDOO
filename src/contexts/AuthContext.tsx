import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  userType: 'buyer' | 'business' | null;
  setUserType: (type: 'buyer' | 'business' | null) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'buyer' | 'business' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    // Fast timeout for web to prevent hanging
    const timeoutMs = 2000;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (mounted) {
        console.log('Auth state changed:', currentUser?.email || 'no user');
        setUser(currentUser);
        setLoading(false);
      }
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
