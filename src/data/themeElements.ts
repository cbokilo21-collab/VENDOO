export interface ThemeElementOption {
  label: string;
  description: string;
  value?: string;
  type?: 'color' | 'text' | 'number' | 'boolean';
}

export interface ThemeElement {
  id: string;
  name: string;
  description: string;
  category: string;
  options: ThemeElementOption[];
}

export const THEME_ELEMENTS: ThemeElement[] = [
  {
    id: 'header',
    name: 'En-tête',
    description: 'Personnalisez l\'en-tête de votre boutique',
    category: 'layout',
    options: [
      {
        label: 'Couleur de fond',
        description: 'Couleur d\'arrière-plan de l\'en-tête',
        value: '#FFFFFF',
        type: 'color',
      },
      {
        label: 'Couleur du texte',
        description: 'Couleur du texte dans l\'en-tête',
        value: '#111827',
        type: 'color',
      },
      {
        label: 'Afficher le menu',
        description: 'Afficher ou masquer le menu de navigation',
        value: 'true',
        type: 'boolean',
      },
    ],
  },
  {
    id: 'hero',
    name: 'Section Hero',
    description: 'Personnalisez la section principale de votre boutique',
    category: 'layout',
    options: [
      {
        label: 'Couleur de fond',
        description: 'Couleur d\'arrière-plan de la section hero',
        value: '#6366F1',
        type: 'color',
      },
      {
        label: 'Couleur du texte',
        description: 'Couleur du texte dans la section hero',
        value: '#FFFFFF',
        type: 'color',
      },
      {
        label: 'Afficher le CTA',
        description: 'Afficher ou masquer le bouton d\'action',
        value: 'true',
        type: 'boolean',
      },
    ],
  },
  {
    id: 'colors',
    name: 'Couleurs',
    description: 'Définissez la palette de couleurs de votre boutique',
    category: 'colors',
    options: [
      {
        label: 'Couleur primaire',
        description: 'Couleur principale utilisée dans l\'interface',
        value: '#6366F1',
        type: 'color',
      },
      {
        label: 'Couleur secondaire',
        description: 'Couleur secondaire pour les accents',
        value: '#8B5CF6',
        type: 'color',
      },
      {
        label: 'Couleur d\'accent',
        description: 'Couleur pour les éléments importants',
        value: '#F59E0B',
        type: 'color',
      },
    ],
  },
  {
    id: 'product-card',
    name: 'Carte Produit',
    description: 'Personnalisez l\'apparence des cartes produit',
    category: 'components',
    options: [
      {
        label: 'Rayon des coins',
        description: 'Arrondi des coins des cartes',
        value: '16',
        type: 'number',
      },
      {
        label: 'Afficher le prix',
        description: 'Afficher ou masquer le prix',
        value: 'true',
        type: 'boolean',
      },
      {
        label: 'Afficher le bouton ajouter',
        description: 'Afficher ou masquer le bouton d\'ajout au panier',
        value: 'true',
        type: 'boolean',
      },
    ],
  },
];

export const getThemeElement = (id: string): ThemeElement | undefined => {
  return THEME_ELEMENTS.find(e => e.id === id);
};

export const getElementsByCategory = (category: string): ThemeElement[] => {
  return THEME_ELEMENTS.filter(e => e.category === category);
};
