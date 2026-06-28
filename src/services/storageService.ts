import { ref, uploadBytes, getDownloadURL, deleteObject, uploadBytesResumable } from 'firebase/storage';
import { storage } from './firebase';
import { Platform } from 'react-native';

/**
 * Service pour gérer le stockage des fichiers sur Firebase Storage
 */
export class StorageService {
  /**
   * Compresse une image avant upload
   * @param uri - URI de l'image locale
   * @param maxWidth - Largeur maximale (défaut: 800px)
   * @param quality - Qualité JPEG (défaut: 0.7)
   * @returns Blob compressé
   */
  private static async compressImage(uri: string, maxWidth = 800, quality = 0.7): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        // Calculer les dimensions en conservant le ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        // Créer un canvas pour redimensionner
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir en blob avec compression
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = uri;
    });
  }

  /**
   * Upload une image de produit vers Firebase Storage avec compression
   * @param userId - ID de l'utilisateur connecté
   * @param productId - ID du produit (optionnel, généré si non fourni)
   * @param uri - URI de l'image locale
   * @param onProgress - Callback pour la progression (0-100)
   * @returns URL publique de l'image uploadée
   */
  static async uploadProductImage(
    userId: string, 
    productId: string, 
    uri: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const fileName = `${productId}_${timestamp}.jpg`;
      const storagePath = `products/${userId}/${fileName}`;
      
      const storageRef = ref(storage, storagePath);
      
      // Compresser l'image avant upload
      let blob: Blob;
      if (Platform.OS === 'web') {
        // Compression automatique sur le web
        blob = await this.compressImage(uri, 800, 0.7);
      } else {
        // Pour mobile, on utilise l'URI directement
        // Note: Sur React Native, vous aurez besoin de 'expo-file-system' ou similaire
        blob = await this.uriToBlob(uri);
      }
      
      console.log(`Image compressée: ${(blob.size / 1024).toFixed(2)} KB`);
      
      // Upload avec progression
      const uploadTask = uploadBytesResumable(storageRef, blob);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress?.(progress);
          },
          (error) => {
            console.error('Upload error:', error);
            reject(new Error('Échec de l\'upload de l\'image'));
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Échec de l\'upload de l\'image');
    }
  }
  
  /**
   * Supprime une image de produit
   * @param userId - ID de l'utilisateur
   * @param productId - ID du produit
   * @param imageUrl - URL de l'image à supprimer
   */
  static async deleteProductImage(userId: string, productId: string, imageUrl: string): Promise<void> {
    try {
      // Extraire le chemin de l'URL
      const storageRef = ref(storage, imageUrl);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
      // Ne pas throw - l'erreur n'est pas critique
    }
  }
  
  /**
   * Upload le logo de la boutique
   * @param userId - ID de l'utilisateur
   * @param uri - URI de l'image locale
   * @returns URL publique du logo uploadé
   */
  static async uploadBoutiqueLogo(userId: string, uri: string): Promise<string> {
    try {
      const timestamp = Date.now();
      const fileName = `logo_${timestamp}.jpg`;
      const storagePath = `boutiques/${userId}/${fileName}`;
      
      const storageRef = ref(storage, storagePath);
      
      let blob: Blob;
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        blob = await response.blob();
      } else {
        blob = await this.uriToBlob(uri);
      }
      
      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw new Error('Échec de l\'upload du logo');
    }
  }
  
  /**
   * Convertit une URI en Blob (helper pour React Native)
   */
  private static async uriToBlob(uri: string): Promise<Blob> {
    // Sur React Native, vous aurez besoin d'utiliser expo-file-system
    // Pour l'instant, cette implémentation est basique pour le web
    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      return await response.blob();
    }
    
    // Fallback pour mobile - nécessite expo-file-system
    throw new Error('uriToBlob not implemented for mobile - use expo-file-system');
  }
}
