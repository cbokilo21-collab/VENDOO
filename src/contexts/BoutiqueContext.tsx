import React, { createContext, useContext, useState, useEffect } from 'react';

interface BoutiqueData {
  nom: string;
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
  const [boutiqueData, setBoutiqueDataState] = useState<BoutiqueData>(defaultBoutiqueData);

  const setBoutiqueData = (data: Partial<BoutiqueData>) => {
    setBoutiqueDataState(prev => ({ ...prev, ...data }));
  };

  const resetBoutiqueData = () => {
    setBoutiqueDataState(defaultBoutiqueData);
  };

  return (
    <BoutiqueContext.Provider value={{ boutiqueData, setBoutiqueData, resetBoutiqueData }}>
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
