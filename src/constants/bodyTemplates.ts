export interface BodyTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  structure: {
    type: 'grid' | 'list' | 'masonry' | 'sidebar' | 'full-width' | 'split' | 'carousel' | 'featured' | 'timeline' | 'magazine';
    columns: number;
    hasSidebar: boolean;
    hasFilters: boolean;
    hasSort: boolean;
    hasPagination: boolean;
    hasQuickView: boolean;
    hasWishlist: boolean;
  };
  customizable: {
    colors: boolean;
    fonts: boolean;
    spacing: boolean;
    borderRadius: boolean;
    shadow: boolean;
    imageSize: boolean;
    cardLayout: boolean;
  };
}

export const BODY_TEMPLATES: BodyTemplate[] = [
  {
    id: 'grid-3',
    name: 'Grille 3 Colonnes',
    description: 'Layout classique en grille avec 3 colonnes',
    preview: '▦',
    structure: {
      type: 'grid',
      columns: 3,
      hasSidebar: false,
      hasFilters: true,
      hasSort: true,
      hasPagination: true,
      hasQuickView: true,
      hasWishlist: true,
    },
    customizable: {
      colors: true,
      fonts: true,
      spacing: true,
      borderRadius: true,
      shadow: true,
      imageSize: true,
      cardLayout: true,
    },
  },
  {
    id: 'grid-4',
    name: 'Grille 4 Colonnes',
    description: 'Layout dense en grille avec 4 colonnes',
    preview: '▤',
    structure: {
      type: 'grid',
      columns: 4,
      hasSidebar: false,
      hasFilters: true,
      hasSort: true,
      hasPagination: true,
      hasQuickView: true,
      hasWishlist: true,
    },
    customizable: {
      colors: true,
      fonts: true,
      spacing: true,
      borderRadius: true,
      shadow: true,
      imageSize: true,
      cardLayout: true,
    },
  },
  {
    id: 'list',
    name: 'Liste',
    description: 'Layout en liste avec image à gauche',
    preview: '▬',
    structure: {
      type: 'list',
      columns: 1,
      hasSidebar: false,
      hasFilters: true,
      hasSort: true,
      hasPagination: true,
      hasQuickView: false,
      hasWishlist: true,
    },
    customizable: {
      colors: true,
      fonts: true,
      spacing: true,
      borderRadius: true,
      shadow: true,
      imageSize: true,
      cardLayout: true,
    },
  },
  {
    id: 'masonry',
    name: 'Masonry',
    description: 'Layout en maçonnerie avec hauteurs variables',
    preview: '🧱',
    structure: {
      type: 'masonry',
      columns: 3,
      hasSidebar: false,
      hasFilters: true,
      hasSort: true,
      hasPagination: true,
      hasQuickView: true,
      hasWishlist: true,
    },
    customizable: {
      colors: true,
      fonts: true,
      spacing: true,
      borderRadius: true,
      shadow: true,
      imageSize: true,
      cardLayout: true,
    },
  },
  {
    id: 'sidebar-left',
    name: 'Sidebar Gauche',
    description: 'Filtres sur la gauche, produits à droite',
    preview: '◧',
    structure: {
      type: 'sidebar',
      columns: 3,
      hasSidebar: true,
      hasFilters: true,
      hasSort: true,
      hasPagination: true,
      hasQuickView: true,
      hasWishlist: true,
    },
    customizable: {
      colors: true,
      fonts: true,
      spacing: true,
      borderRadius: true,
      shadow: true,
      imageSize: true,
      cardLayout: true,
    },
  },
  {
    id: 'sidebar-right',
    name: 'Sidebar Droite',
    description: 'Produits à gauche, filtres sur la droite',
    preview: '◨',
    structure: {
      type: 'sidebar',
      columns: 3,
      hasSidebar: true,
      hasFilters: true,
      hasSort: true,
      hasPagination: true,
      hasQuickView: true,
      hasWishlist: true,
    },
    customizable: {
      colors: true,
      fonts: true,
      spacing: true,
      borderRadius: true,
      shadow: true,
      imageSize: true,
      cardLayout: true,
    },
  },
  {
    id: 'full-width',
    name: 'Pleine Largeur',
    description: 'Produits sur toute la largeur sans sidebar',
    preview: '▬▬',
    structure: {
      type: 'full-width',
      columns: 5,
      hasSidebar: false,
      hasFilters: true,
      hasSort: true,
      hasPagination: true,
      hasQuickView: true,
      hasWishlist: true,
    },
    customizable: {
      colors: true,
      fonts: true,
      spacing: true,
      borderRadius: true,
      shadow: true,
      imageSize: true,
      cardLayout: true,
    },
  },
  {
    id: 'split',
    name: 'Split',
    description: 'Layout divisé avec catégories et produits',
    preview: '⬜⬛',
    structure: {
      type: 'split',
      columns: 2,
      hasSidebar: false,
      hasFilters: true,
      hasSort: true,
      hasPagination: true,
      hasQuickView: true,
      hasWishlist: true,
    },
    customizable: {
      colors: true,
      fonts: true,
      spacing: true,
      borderRadius: true,
      shadow: true,
      imageSize: true,
      cardLayout: true,
    },
  },
  {
    id: 'carousel',
    name: 'Carrousel',
    description: 'Produits en carrousel horizontal',
    preview: '↔️',
    structure: {
      type: 'carousel',
      columns: 4,
      hasSidebar: false,
      hasFilters: false,
      hasSort: false,
      hasPagination: false,
      hasQuickView: true,
      hasWishlist: true,
    },
    customizable: {
      colors: true,
      fonts: true,
      spacing: true,
      borderRadius: true,
      shadow: true,
      imageSize: true,
      cardLayout: true,
    },
  },
  {
    id: 'featured',
    name: 'Featured',
    description: 'Produits mis en avant en haut + grille',
    preview: '⭐',
    structure: {
      type: 'featured',
      columns: 4,
      hasSidebar: false,
      hasFilters: true,
      hasSort: true,
      hasPagination: true,
      hasQuickView: true,
      hasWishlist: true,
    },
    customizable: {
      colors: true,
      fonts: true,
      spacing: true,
      borderRadius: true,
      shadow: true,
      imageSize: true,
      cardLayout: true,
    },
  },
  {
    id: 'timeline',
    name: 'Timeline',
    description: 'Layout chronologique pour collections',
    preview: '📅',
    structure: {
      type: 'timeline',
      columns: 2,
      hasSidebar: false,
      hasFilters: true,
      hasSort: true,
      hasPagination: true,
      hasQuickView: false,
      hasWishlist: true,
    },
    customizable: {
      colors: true,
      fonts: true,
      spacing: true,
      borderRadius: true,
      shadow: true,
      imageSize: true,
      cardLayout: true,
    },
  },
  {
    id: 'magazine',
    name: 'Magazine',
    description: 'Style magazine avec gros hero et grille',
    preview: '📰',
    structure: {
      type: 'magazine',
      columns: 3,
      hasSidebar: false,
      hasFilters: true,
      hasSort: true,
      hasPagination: true,
      hasQuickView: true,
      hasWishlist: true,
    },
    customizable: {
      colors: true,
      fonts: true,
      spacing: true,
      borderRadius: true,
      shadow: true,
      imageSize: true,
      cardLayout: true,
    },
  },
];

export const getBodyTemplateById = (id: string): BodyTemplate | undefined => {
  return BODY_TEMPLATES.find(t => t.id === id);
};
