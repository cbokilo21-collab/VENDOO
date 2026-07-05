export interface ThemeTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  layout: {
    productGridColumns: number;
    spacing: number;
  };
  productCard: {
    showPrice: boolean;
    showOriginalPrice: boolean;
    showAddToCart: boolean;
    showFavorite: boolean;
    borderRadius: number;
    shadow: boolean;
    layout: 'grid' | 'list';
  };
}

export const THEME_TEMPLATES: ThemeTemplate[] = [
  {
    id: 'modern-minimal',
    name: 'Moderne Minimaliste',
    description: 'Design épuré avec beaucoup d\'espace blanc',
    preview: '🎨',
    colors: {
      primary: '#6366F1',
      secondary: '#8B5CF6',
      accent: '#F59E0B',
      background: '#F8FAFC',
      text: '#0F172A',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    layout: {
      productGridColumns: 3,
      spacing: 24,
    },
    productCard: {
      showPrice: true,
      showOriginalPrice: true,
      showAddToCart: true,
      showFavorite: true,
      borderRadius: 16,
      shadow: true,
      layout: 'grid',
    },
  },
  {
    id: 'bold-colorful',
    name: 'Audacieux Coloré',
    description: 'Couleurs vives et design dynamique',
    preview: '🌈',
    colors: {
      primary: '#FF6B35',
      secondary: '#F7931E',
      accent: '#00D4AA',
      background: '#FFF7F3',
      text: '#1A1A2E',
    },
    fonts: {
      heading: 'Poppins',
      body: 'Open Sans',
    },
    layout: {
      productGridColumns: 2,
      spacing: 20,
    },
    productCard: {
      showPrice: true,
      showOriginalPrice: true,
      showAddToCart: true,
      showFavorite: true,
      borderRadius: 12,
      shadow: true,
      layout: 'grid',
    },
  },
  {
    id: 'elegant-luxury',
    name: 'Élégant Luxe',
    description: 'Style sophistiqué pour boutiques premium',
    preview: '✨',
    colors: {
      primary: '#1E293B',
      secondary: '#334155',
      accent: '#D4AF37',
      background: '#FFFFFF',
      text: '#0F172A',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Lato',
    },
    layout: {
      productGridColumns: 3,
      spacing: 32,
    },
    productCard: {
      showPrice: true,
      showOriginalPrice: true,
      showAddToCart: true,
      showFavorite: true,
      borderRadius: 8,
      shadow: true,
      layout: 'grid',
    },
  },
  {
    id: 'playful-fun',
    name: 'Joueur Amusant',
    description: 'Design fun et coloré pour jeunes',
    preview: '🎉',
    colors: {
      primary: '#EC4899',
      secondary: '#8B5CF6',
      accent: '#10B981',
      background: '#FEF3C7',
      text: '#1F2937',
    },
    fonts: {
      heading: 'Fredoka',
      body: 'Nunito',
    },
    layout: {
      productGridColumns: 2,
      spacing: 16,
    },
    productCard: {
      showPrice: true,
      showOriginalPrice: false,
      showAddToCart: true,
      showFavorite: true,
      borderRadius: 20,
      shadow: true,
      layout: 'grid',
    },
  },
  {
    id: 'professional-corporate',
    name: 'Professionnel Corporate',
    description: 'Design sérieux pour entreprises',
    preview: '💼',
    colors: {
      primary: '#2563EB',
      secondary: '#1E40AF',
      accent: '#059669',
      background: '#F1F5F9',
      text: '#0F172A',
    },
    fonts: {
      heading: 'Roboto',
      body: 'Roboto',
    },
    layout: {
      productGridColumns: 4,
      spacing: 20,
    },
    productCard: {
      showPrice: true,
      showOriginalPrice: true,
      showAddToCart: true,
      showFavorite: false,
      borderRadius: 4,
      shadow: false,
      layout: 'grid',
    },
  },
];

export const getTemplateById = (id: string): ThemeTemplate | undefined => {
  return THEME_TEMPLATES.find(t => t.id === id);
};
