import { useState, useEffect, useRef } from 'react';
import { where, orderBy, limit, QueryConstraint } from 'firebase/firestore';
import { FirestoreService } from '../services/firestoreService';

interface UseRealtimeOptions {
  constraints?: QueryConstraint[];
  enabled?: boolean;
}

export function useRealtimeCollection<T = Record<string, any>>(
  collectionName: string,
  options: UseRealtimeOptions = {}
) {
  const { constraints = [], enabled = true } = options;
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const unsub = FirestoreService.onQuery<T>(
        collectionName,
        constraints,
        (docs) => {
          setData(docs);
          setLoading(false);
          setError(null);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        }
      );
      unsubRef.current = unsub;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }

    return () => {
      unsubRef.current?.();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, enabled]);

  const refresh = async () => {
    setLoading(true);
    try {
      const docs = await FirestoreService.query<T>(collectionName, constraints);
      setData(docs);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refresh };
}

export function useRealtimeDocument<T = Record<string, any>>(
  collectionName: string,
  docId: string | null,
  enabled = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!enabled || !docId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = FirestoreService.onDocument<T>(
      collectionName,
      docId,
      (doc) => {
        setData(doc);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    unsubRef.current = unsub;

    return () => {
      unsubRef.current?.();
    };
  }, [collectionName, docId, enabled]);

  return { data, loading, error };
}

// Convenience: real-time dashboard KPIs derived from orders
export function useDashboardKPIs(userId: string | null, boutiqueId?: string | null) {
  // Use boutiqueId if available, otherwise fall back to userId for backward compatibility
  const idFilter = boutiqueId || userId;
  
  const { data: orders, loading } = useRealtimeCollection<any>('orders', {
    constraints: idFilter ? [where('boutiqueId', '==', idFilter)] : [],
    enabled: !!idFilter,
  });
  const { data: customers } = useRealtimeCollection<any>('customers', {
    constraints: idFilter ? [where('userId', '==', idFilter)] : [],
    enabled: !!idFilter,
  });
  const { data: products } = useRealtimeCollection<any>('products', {
    constraints: idFilter ? [where('boutique_id', '==', idFilter)] : [],
    enabled: !!idFilter,
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter((o) => {
    if (!o.createdAt) return false;
    const d = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
    return d >= today;
  });

  const totalRevenue = orders
    .filter((o) => o.status === 'paid' || o.status === 'delivered')
    .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

  const avgCart =
    orders.length > 0
      ? orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0) / orders.length
      : 0;

  const lowStockProducts = products.filter((p: any) => p.stock < 5 && p.stock >= 0);

  const pendingOrders = orders.filter(
    (o: any) => o.status === 'pending' || o.status === 'processing'
  );

  return {
    loading,
    totalOrders: orders.length,
    todayOrders: todayOrders.length,
    totalCustomers: customers.length,
    totalProducts: products.length,
    totalRevenue,
    avgCart,
    lowStockProducts,
    pendingOrders,
    recentOrders: orders.slice(0, 5),
  };
}
