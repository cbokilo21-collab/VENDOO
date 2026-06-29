// Service de gestion des domaines (quartiers) pour la marketplace
// Les domaines sont des catégories d'activités : électronique, électroménager, mode, etc.

export interface Domain {
  id: string;
  nom: string;
  emoji: string;
  color: string;
  description: string;
  sousCategories?: string[];
}

// Liste des domaines disponibles (quartiers de la marketplace)
export const DOMAINES: Domain[] = [
  {
    id: 'electronique',
    nom: 'Électronique & Tech',
    emoji: '📱',
    color: '#3B82F6',
    description: 'Smartphones, ordinateurs, accessoires tech',
    sousCategories: ['Smartphones', 'Ordinateurs', 'Tablettes', 'Accessoires', 'Gaming']
  },
  {
    id: 'electromenager',
    nom: 'Électroménager',
    emoji: '🔌',
    color: '#F59E0B',
    description: 'Appareils ménagers, cuisine, réfrigération',
    sousCategories: ['Cuisine', 'Réfrigération', 'Lavage', 'Petit électroménager']
  },
  {
    id: 'mode',
    nom: 'Mode & Vêtements',
    emoji: '👗',
    color: '#EC4899',
    description: 'Habit, chaussures, accessoires de mode',
    sousCategories: ['Homme', 'Femme', 'Enfant', 'Chaussures', 'Accessoires']
  },
  {
    id: 'alimentaire',
    nom: 'Alimentation & Épicerie',
    emoji: '🛒',
    color: '#10B981',
    description: 'Produits alimentaires, épicerie, frais',
    sousCategories: ['Fruits & Légumes', 'Boulangerie', 'Viandes', 'Épicerie', 'Boissons']
  },
  {
    id: 'beaute',
    nom: 'Beauté & Cosmétiques',
    emoji: '💄',
    color: '#F59E0B',
    description: 'Maquillage, soins, parfums',
    sousCategories: ['Maquillage', 'Soins visage', 'Soins corps', 'Parfums', 'Cheveux']
  },
  {
    id: 'maison',
    nom: 'Maison & Décoration',
    emoji: '🏠',
    color: '#8B5CF6',
    description: 'Meubles, décoration, bricolage',
    sousCategories: ['Meubles', 'Décoration', 'Bricolage', 'Jardin', 'Éclairage']
  },
  {
    id: 'sport',
    nom: 'Sport & Fitness',
    emoji: '⚽',
    color: '#14B8A6',
    description: 'Équipement sportif, fitness, outdoor',
    sousCategories: ['Fitness', 'Football', 'Running', 'Outdoor', 'Vélo']
  },
  {
    id: 'bijoux',
    nom: 'Bijoux & Accessoires',
    emoji: '💍',
    color: '#F59E0B',
    description: 'Bijoux, montres, accessoires',
    sousCategories: ['Bijoux fines', 'Montres', 'Bagues', 'Colliers', 'Bracelets']
  },
  {
    id: 'librairie',
    nom: 'Livres & Papeterie',
    emoji: '📚',
    color: '#6366F1',
    description: 'Livres, fournitures, papeterie',
    sousCategories: ['Romans', 'BD', 'Fournitures', 'Papeterie', 'Cahiers']
  },
  {
    id: 'services',
    nom: 'Services & Artisanat',
    emoji: '🔧',
    color: '#64748B',
    description: 'Services professionnels, artisanat',
    sousCategories: ['Réparation', 'Artisanat', 'Services', 'Formation', 'Conseil']
  },
  {
    id: 'auto',
    nom: 'Automobile & Moto',
    emoji: '🚗',
    color: '#EF4444',
    description: 'Pièces auto, accessoires, entretien',
    sousCategories: ['Pièces', 'Accessoires', 'Entretien', 'Moto', 'Outils']
  },
  {
    id: 'sante',
    nom: 'Santé & Bien-être',
    emoji: '💊',
    color: '#10B981',
    description: 'Produits de santé, bien-être, pharmacie',
    sousCategories: ['Pharmacie', 'Bien-être', 'Compléments', 'Hygiène', 'Premiers secours']
  },
];

export interface Pays {
  code: string;
  nom: string;
  flag: string;
  villes: string[];
  quartiers?: Record<string, string[]>; // quartiers par ville
}

// Liste des pays disponibles
export const PAYS: Pays[] = [
  { code: 'FR', nom: 'France', flag: '🇫🇷', villes: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Bordeaux', 'Lille', 'Strasbourg', 'Nantes', 'Rennes', 'Montpellier', 'Grenoble'] },
  { code: 'BE', nom: 'Belgique', flag: '🇧🇪', villes: ['Bruxelles', 'Liège', 'Anvers', 'Gand', 'Charleroi', 'Bruges', 'Namur', 'Louvain', 'Mons', 'Ostende'] },
  { code: 'CH', nom: 'Suisse', flag: '🇨🇭', villes: ['Zurich', 'Genève', 'Bâle', 'Lausanne', 'Berne', 'Winterthour', 'Lucerne', 'Saint-Gall', 'Lugano', 'Bienne'] },
  { code: 'CA', nom: 'Canada', flag: '🇨🇦', villes: ['Toronto', 'Montréal', 'Vancouver', 'Calgary', 'Ottawa', 'Edmonton', 'Québec', 'Winnipeg', 'Hamilton', 'Kitchener'] },
  { code: 'SN', nom: 'Sénégal', flag: '🇸🇳', villes: ['Dakar', 'Touba', 'Thiès', 'Rufisque', 'Kaolack', 'Saint-Louis', 'Ziguinchor', 'Diourbel', 'Mbour', 'Louga'] },
  { code: 'CI', nom: 'Côte d\'Ivoire', flag: '🇨🇮', villes: ['Abidjan', 'Bouaké', 'Yamoussoukro', 'Daloa', 'San-Pédro', 'Korhogo', 'Divo', 'Man', 'Abengourou', 'Grand-Béréby'] },
  { code: 'CM', nom: 'Cameroun', flag: '🇨🇲', villes: ['Douala', 'Yaoundé', 'Bafoussam', 'Garoua', 'Bamenda', 'Maroua', 'Kumba', 'Nkongsamba', 'Buea', 'Edéa'] },
  { code: 'MG', nom: 'Madagascar', flag: '🇲🇬', villes: ['Antananarivo', 'Toamasina', 'Antsirabe', 'Fianarantsoa', 'Mahajanga', 'Toliara', 'Ambovombe', 'Antsiranana', 'Ambatondrazaka', 'Morondava'] },
  { code: 'ML', nom: 'Mali', flag: '🇲🇱', villes: ['Bamako', 'Sikasso', 'Mopti', 'Kayes', 'Ségou', 'Gao', 'Koulikoro', 'Kita', 'Bougouni', 'Koutiala'] },
  { code: 'BF', nom: 'Burkina Faso', flag: '🇧🇫', villes: ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Ouahigouya', 'Banfora', 'Kaya', 'Pouytenga', 'Kaya', 'Dédougou', 'Fada N\'Gourma'] },
  { code: 'CG', nom: 'Congo (Brazzaville)', flag: '🇨🇬', villes: ['Brazzaville', 'Pointe-Noire', 'Dolisie', 'Nkayi', 'Impfondo', 'Ouesso', 'Madingou', 'Owando'], quartiers: {
    'Brazzaville': ['Poto-Poto', 'Bacongo', 'Moungali', 'Ouenzé', 'Talangaï', 'Mfilou', 'Djiri', 'Madibou', 'Kinkala', 'Ngamaba', 'Makélékélé', 'Brazza'],
    'Pointe-Noire': ['Cité', 'Mvou-Mvou', 'Tié-Tié', 'Loandjili', 'Kouilou', 'Mbota', 'Tchimbamba', 'Nzambi', 'Sindou', 'Mvouti'],
  } },
];

class DomainService {
  // Obtenir tous les domaines
  static getAllDomains(): Domain[] {
    return DOMAINES;
  }

  // Obtenir un domaine par ID
  static getDomainById(id: string): Domain | undefined {
    return DOMAINES.find(d => d.id === id);
  }

  // Obtenir tous les pays
  static getAllPays(): Pays[] {
    return PAYS;
  }

  // Obtenir un pays par code
  static getPaysByCode(code: string): Pays | undefined {
    return PAYS.find(p => p.code === code);
  }

  // Obtenir les villes d'un pays
  static getVillesByPays(paysCode: string): string[] {
    const pays = this.getPaysByCode(paysCode);
    return pays?.villes || [];
  }

  // Obtenir les quartiers d'une ville
  static getQuartiersByVille(paysCode: string, ville: string): string[] {
    const pays = this.getPaysByCode(paysCode);
    return pays?.quartiers?.[ville] || [];
  }

  // Rechercher des domaines
  static searchDomains(query: string): Domain[] {
    const q = query.toLowerCase();
    return DOMAINES.filter(d => 
      d.nom.toLowerCase().includes(q) || 
      d.description.toLowerCase().includes(q) ||
      d.sousCategories?.some(sc => sc.toLowerCase().includes(q))
    );
  }

  // Obtenir les domaines populaires (à personnaliser selon les statistiques)
  static getPopularDomains(): Domain[] {
    return DOMAINES.slice(0, 6);
  }
}

export default DomainService;
