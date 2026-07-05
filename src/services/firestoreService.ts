import {
  doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where,
  collection, QueryConstraint, addDoc, serverTimestamp, Timestamp,
  onSnapshot, Query, Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';

export class FirestoreService {
  /**
   * Create document with auto-ID
   */
  static async create<T extends Record<string, any>>(
    collectionName: string,
    data: T
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error(`Firestore create error (${collectionName}):`, error);
      throw error;
    }
  }

  /**
   * Create/update document with specific ID
   */
  static async set<T extends Record<string, any>>(
    collectionName: string,
    docId: string,
    data: T,
    merge = false
  ): Promise<void> {
    try {
      await setDoc(doc(db, collectionName, docId), {
        ...data,
        updatedAt: serverTimestamp(),
      }, { merge });
    } catch (error) {
      console.error(`Firestore set error (${collectionName}/${docId}):`, error);
      throw error;
    }
  }

  /**
   * Get single document
   */
  static async get<T = Record<string, any>>(
    collectionName: string,
    docId: string
  ): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, docId);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;
      return { ...snapshot.data(), id: snapshot.id } as T;
    } catch (error) {
      console.error(`Firestore get error (${collectionName}/${docId}):`, error);
      throw error;
    }
  }

  /**
   * Query documents
   */
  static async query<T = Record<string, any>>(
    collectionName: string,
    constraints: QueryConstraint[]
  ): Promise<T[]> {
    try {
      const q = query(collection(db, collectionName), ...constraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as T));
    } catch (error) {
      console.error(`Firestore query error (${collectionName}):`, error);
      throw error;
    }
  }

  /**
   * Get all documents in collection
   */
  static async getAll<T = Record<string, any>>(
    collectionName: string
  ): Promise<T[]> {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as T));
    } catch (error) {
      console.error(`Firestore getAll error (${collectionName}):`, error);
      throw error;
    }
  }

  /**
   * Update document (partial)
   */
  static async update<T extends Record<string, any>>(
    collectionName: string,
    docId: string,
    data: Partial<T>
  ): Promise<void> {
    try {
      await updateDoc(doc(db, collectionName, docId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(`Firestore update error (${collectionName}/${docId}):`, error);
      throw error;
    }
  }

  /**
   * Delete document
   */
  static async delete(collectionName: string, docId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, collectionName, docId));
    } catch (error) {
      console.error(`Firestore delete error (${collectionName}/${docId}):`, error);
      throw error;
    }
  }

  /**
   * Real-time listener for single document
   */
  static onDocument<T = Record<string, any>>(
    collectionName: string,
    docId: string,
    callback: (data: T | null) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    const docRef = doc(db, collectionName, docId);
    return onSnapshot(
      docRef,
      snapshot => {
        if (!snapshot.exists()) {
          callback(null);
        } else {
          callback({ ...snapshot.data(), id: snapshot.id } as T);
        }
      },
      error => {
        console.error(`Firestore listener error (${collectionName}/${docId}):`, error);
        onError?.(error);
      }
    );
  }

  /**
   * Real-time listener for query
   */
  static onQuery<T = Record<string, any>>(
    collectionName: string,
    constraints: QueryConstraint[],
    callback: (data: T[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    const q = query(collection(db, collectionName), ...constraints);
    return onSnapshot(
      q,
      snapshot => {
        const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as T));
        callback(data);
      },
      error => {
        console.error(`Firestore query listener error (${collectionName}):`, error);
        onError?.(error);
      }
    );
  }

  /**
   * Batch write helper (future)
   */
  static async batch(operations: Array<() => Promise<void>>): Promise<void> {
    try {
      for (const op of operations) {
        await op();
      }
    } catch (error) {
      console.error('Firestore batch error:', error);
      throw error;
    }
  }
}
