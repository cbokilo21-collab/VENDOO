export type NiveauFacade = 1 | 2 | 3 | 4;

export interface Produit {
  id: string;
  nom: string;
  prix: number;
  image: string;
  description: string;
}

export interface Case {
  id: string;
  niveau: NiveauFacade;
  couleurPrincipale: string;
  couleurSecondaire: string;
  boutique?: Boutique;
}

export interface Boutique {
  id: string;
  nom: string;
  caseId: string;
  niveau: NiveauFacade;
  couleurPrincipale: string;
  couleurSecondaire: string;
  produits: Produit[];
  estLouee: boolean;
}

export interface Quartier {
  id: string;
  nom: string;
  theme: string;
  cases: Case[];
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  products: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: Date;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastPurchaseDate: Date;
  joinedDate: Date;
}
