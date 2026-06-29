import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { BoutiqueService } from '../services/boutiqueService';

interface BoutiqueData {
  id?: string; // Firestore document ID
  nom: string;
  slug?: string; // URL-friendly name (auto-generated): "mode-etoile"
  shopUrl?: string; // Public shop URL: "shop.mode-etoile.vendoo"
  description: string;
  logo: string;
  website: string;
  instagram: string;
  facebook: string;
  email: string;
  phone: string;
  currency: string;
  timezone: string;
  secteur: string;
  pays: string;
  ville: string;
  quartier?: string;
  couleur: string;
  chatbot?: {
    enabled: boolean;
    name: string;
    tone: string;
    welcomeMessage: string;
  };
}

interface BoutiqueContextType {
  boutiqueData: BoutiqueData;
  setBoutiqueData: (data: Partial<BoutiqueData>) => void;
  resetBoutiqueData: () => void;
  loading: boolean;
}

const defaultBoutiqueData: BoutiqueData = {
  nom: 'Ma Boutique',
  description: '',
  logo: '',
  website: '',
  instagram: '',
  facebook: '',
  email: 'admin@vendoo.com',
  phone: '',
  currency: 'EUR',
  timezone: 'Europe/Paris',
  secteur: '',
  pays: '',
  ville: '',
  couleur: '#FF6B35',
};

const BoutiqueContext = createContext<BoutiqueContextType | undefined>(undefined);

export const BoutiqueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [boutiqueData, setBoutiqueDataState] = useState<BoutiqueData>(defaultBoutiqueData);
  const [loading, setLoading] = useState(false);

  // Load boutique data from Firestore when user is authenticated
  useEffect(() => {
    if (!user) {
      setBoutiqueDataState(defaultBoutiqueData);
      return;
    }

    const loadBoutique = async () => {
      setLoading(true);
      try {
        const boutiques = await BoutiqueService.getByUser(user.uid);
        if (boutiques.length > 0) {
          // Use the first boutique (assuming single boutique per user for now)
          setBoutiqueDataState(boutiques[0]);
        }
      } catch (error) {
        console.error('Error loading boutique:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBoutique();
  }, [user]);

  const setBoutiqueData = (data: Partial<BoutiqueData>) => {
    setBoutiqueDataState(prev => ({ ...prev, ...data }));
  };

  const resetBoutiqueData = () => {
    setBoutiqueDataState(defaultBoutiqueData);
  };

  return (
    <BoutiqueContext.Provider value={{ boutiqueData, setBoutiqueData, resetBoutiqueData, loading }}>
      {children}
    </BoutiqueContext.Provider>
  );
};

export const useBoutique = () => {
  const context = useContext(BoutiqueContext);
  if (context === undefined) {
    throw new Error('useBoutique must be used within a BoutiqueProvider');
  }
  return context;
};
