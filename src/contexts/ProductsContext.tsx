import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { useAuth } from './AuthContext';
import { useBoutique } from './BoutiqueContext';
import { FirestoreService } from '../services/firestoreService';
import { where } from 'firebase/firestore';

export interface Product {
  id: string;
  boutique_id: string;
  nom: string;
  prix: number;
  prixPromo?: number;
  stock: number;
  categorie: string;
  emoji?: string;
  couleur?: string;
  description?: string;
  note?: number;
  avis?: number;
  isNew?: boolean;
  isPromo?: boolean;
  sizes?: string[];
  colors?: string[];
  imageUri?: string;
  createdAt?: any;
  updatedAt?: any;
}

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (p: Omit<Product, 'id'>) => Promise<string>;
  removeProduct: (id: string) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  syncProducts: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

const STORAGE_KEY = 'vendoo_products_v1';

const loadLocal = (): Product[] => {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    }
  } catch {}
  return [];
};

const saveLocal = (items: Product[]) => {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  } catch {}
};

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { boutiqueData } = useBoutique();
  const [products, setProducts] = useState<Product[]>(() => loadLocal());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);

  // Real-time listener setup
  useEffect(() => {
    if (!user) {
      setProducts([]);
      if (unsubscribe) unsubscribe();
      return;
    }

    setLoading(true);
    try {
      // Listen to products for current boutique
      // Use boutique_id if available, otherwise fall back to userId for backward compatibility
      const constraints = boutiqueData.id 
        ? [where('boutique_id', '==', boutiqueData.id)]
        : [where('userId', '==', user.uid)];
      
      const unsub = FirestoreService.onQuery<Product>(
        'products',
        constraints,
        (data) => {
          setProducts(data);
          saveLocal(data);
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        }
      );
      setUnsubscribe(() => unsub);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load products';
      setError(msg);
      setLoading(false);
    }

    return () => {
      unsubscribe?.();
    };
  }, [user, boutiqueData.id]);

  const addProduct = async (p: Omit<Product, 'id'>) => {
    if (!user) throw new Error('Not authenticated');
    try {
      setError(null);
      // Use boutique_id if available, otherwise use userId for backward compatibility
      const boutiqueId = boutiqueData.id || user.uid;
      // Remove undefined values before sending to Firestore
      const cleanedData = Object.fromEntries(
        Object.entries({ ...p, boutique_id: boutiqueId, userId: user.uid }).filter(([_, v]) => v !== undefined)
      );
      const docId = await FirestoreService.create('products', cleanedData);
      return docId;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add product';
      setError(msg);
      throw err;
    }
  };

  const removeProduct = async (id: string) => {
    if (!user) throw new Error('Not authenticated');
    try {
      setError(null);
      await FirestoreService.delete('products', id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete product';
      setError(msg);
      throw err;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (!user) throw new Error('Not authenticated');
    try {
      setError(null);
      await FirestoreService.update('products', id, updates);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update product';
      setError(msg);
      throw err;
    }
  };

  const syncProducts = async () => {
    if (!user) throw new Error('Not authenticated');
    try {
      setLoading(true);
      const constraints = boutiqueData.id 
        ? [where('boutique_id', '==', boutiqueData.id)]
        : [where('userId', '==', user.uid)];
      const data = await FirestoreService.query<Product>('products', constraints);
      setProducts(data);
      saveLocal(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to sync products';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProductsContext.Provider value={{ products, loading, error, addProduct, removeProduct, updateProduct, syncProducts }}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider');
  return ctx;
};
