/**
 * industryThemes.ts — 6 thèmes sectoriels entièrement construits (A → Z).
 * Chacun fournit une palette complète, des polices, un hero (titre/sous-titre/image),
 * des produits de démonstration avec images, et les modèles header/body/footer.
 * Ces thèmes servent à la fois de point de départ dans le constructeur ET
 * d'aperçu riche dans l'écran de sélection.
 *
 * Les images sont servies par le CDN Unsplash ; en cas d'échec de chargement,
 * l'emoji de repli (défini sur chaque produit) s'affiche automatiquement.
 */

export interface DemoProduct {
  name: string;
  price: number;
  originalPrice?: number;
  emoji: string;
  image: string;
}

export interface IndustryTheme {
  id: string;
  industry: string;          // libellé secteur (chip)
  name: string;              // nom du thème
  tagline: string;           // accroche courte
  description: string;
  emoji: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: { heading: string; body: string };
  layout: { productGridColumns: number; spacing: number };
  productCard: {
    showPrice: boolean;
    showOriginalPrice: boolean;
    showAddToCart: boolean;
    showFavorite: boolean;
    borderRadius: number;
    shadow: boolean;
    layout: 'grid' | 'list';
  };
  headerTemplate: string;
  bodyTemplate: string;
  footerTemplate: string;
  footer: { backgroundColor: string; textColor: string };
  hero: {
    title: string;
    subtitle: string;
    cta: string;
    image: string;          // grande image de fond du hero
  };
  demoProducts: DemoProduct[];
}

const IMG = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=700&q=70`;

export const INDUSTRY_THEMES: IndustryTheme[] = [
  // ─────────────────────────────────────────── SNEAKERS ───────────
  {
    id: 'sneakers-street',
    industry: 'Sneakers',
    name: 'Street Kicks',
    tagline: 'Énergie urbaine & drops exclusifs',
    description: 'Design audacieux et sombre pour boutiques de sneakers, avec mise en avant des nouveautés.',
    emoji: '👟',
    colors: { primary: '#FF4D2E', secondary: '#111827', accent: '#FACC15', background: '#0F0F12', text: '#F9FAFB' },
    fonts: { heading: 'Oswald', body: 'Inter' },
    layout: { productGridColumns: 3, spacing: 18 },
    productCard: { showPrice: true, showOriginalPrice: true, showAddToCart: true, showFavorite: true, borderRadius: 14, shadow: true, layout: 'grid' },
    headerTemplate: 'hero',
    bodyTemplate: 'masonry',
    footerTemplate: 'dark',
    footer: { backgroundColor: '#000000', textColor: '#FFFFFF' },
    hero: {
      title: 'La rue a un nouveau roi',
      subtitle: 'Découvrez les derniers drops et éditions limitées avant tout le monde.',
      cta: 'Voir les nouveautés',
      image: IMG('photo-1552346154-21d32810aba3'),
    },
    demoProducts: [
      { name: 'Air Max Rétro', price: 89000, originalPrice: 110000, emoji: '👟', image: IMG('photo-1542291026-7eec264c27ff') },
      { name: 'Runner Volt', price: 75000, emoji: '👟', image: IMG('photo-1600185365483-26d7a4cc7519') },
      { name: 'High Top Classic', price: 65000, emoji: '👟', image: IMG('photo-1595950653106-6c9ebd614d3a') },
      { name: 'Court Legacy', price: 58000, originalPrice: 72000, emoji: '👟', image: IMG('photo-1608231387042-66d1773070a5') },
      { name: 'Trail Beast', price: 95000, emoji: '🥾', image: IMG('photo-1606107557195-0e29a4b5b4aa') },
      { name: 'Slip-On Mono', price: 42000, emoji: '👟', image: IMG('photo-1525966222134-fcfa99b8ae77') },
    ],
  },

  // ─────────────────────────────────────────── LUNETTERIE ─────────
  {
    id: 'eyewear-optic',
    industry: 'Lunetterie',
    name: 'Optic Vision',
    tagline: 'Clarté, style & précision',
    description: 'Épuré et lumineux, idéal pour opticiens et boutiques de lunettes haut de gamme.',
    emoji: '👓',
    colors: { primary: '#0EA5E9', secondary: '#0F172A', accent: '#38BDF8', background: '#FFFFFF', text: '#0F172A' },
    fonts: { heading: 'Montserrat', body: 'Inter' },
    layout: { productGridColumns: 3, spacing: 28 },
    productCard: { showPrice: true, showOriginalPrice: false, showAddToCart: true, showFavorite: true, borderRadius: 10, shadow: true, layout: 'grid' },
    headerTemplate: 'centered',
    bodyTemplate: 'featured',
    footerTemplate: 'multi-column',
    footer: { backgroundColor: '#0F172A', textColor: '#FFFFFF' },
    hero: {
      title: 'Voyez le monde autrement',
      subtitle: 'Des montures qui subliment votre regard, verres de haute précision inclus.',
      cta: 'Essayer en boutique',
      image: IMG('photo-1508296695146-257a814070b4'),
    },
    demoProducts: [
      { name: 'Aviateur Or', price: 45000, emoji: '🕶️', image: IMG('photo-1511499767150-a48a237f0083') },
      { name: 'Ronde Acétate', price: 38000, emoji: '👓', image: IMG('photo-1574258495973-f010dfbb5371') },
      { name: 'Cat-Eye Chic', price: 52000, emoji: '🕶️', image: IMG('photo-1577803645773-f96470509666') },
      { name: 'Carrée Mat', price: 41000, emoji: '👓', image: IMG('photo-1556306535-0f09a537f0a3') },
      { name: 'Sport Polarisé', price: 60000, emoji: '🕶️', image: IMG('photo-1483412468200-72182dbca99f') },
      { name: 'Fine Titane', price: 72000, emoji: '👓', image: IMG('photo-1591076482161-42ce6da69f67') },
    ],
  },

  // ─────────────────────────────────────────── MONTRES DE LUXE ────
  {
    id: 'watches-luxe',
    industry: 'Montres de luxe',
    name: 'Chrono Prestige',
    tagline: "L'excellence horlogère",
    description: 'Noir et or, typographie raffinée : le thème signature des maisons horlogères.',
    emoji: '⌚',
    colors: { primary: '#C6A15B', secondary: '#1C1917', accent: '#E7D2A5', background: '#0C0A09', text: '#F5F5F4' },
    fonts: { heading: 'Playfair Display', body: 'Lato' },
    layout: { productGridColumns: 3, spacing: 32 },
    productCard: { showPrice: true, showOriginalPrice: false, showAddToCart: true, showFavorite: true, borderRadius: 4, shadow: true, layout: 'grid' },
    headerTemplate: 'overlay',
    bodyTemplate: 'featured',
    footerTemplate: 'centered',
    footer: { backgroundColor: '#000000', textColor: '#C6A15B' },
    hero: {
      title: 'Le temps, magnifié',
      subtitle: 'Des garde-temps d’exception, sélectionnés pour les connaisseurs.',
      cta: 'Explorer la collection',
      image: IMG('photo-1524805444758-089113d48a6d'),
    },
    demoProducts: [
      { name: 'Chronographe Or', price: 1250000, emoji: '⌚', image: IMG('photo-1523275335684-37898b6baf30') },
      { name: 'Automatique Squelette', price: 2100000, emoji: '⌚', image: IMG('photo-1524592094714-0f0654e20314') },
      { name: 'Diver Acier', price: 980000, emoji: '⌚', image: IMG('photo-1547996160-81dfa63595aa') },
      { name: 'Classique Cuir', price: 750000, emoji: '⌚', image: IMG('photo-1533139502658-0198f920d8e8') },
      { name: 'Édition Nuit', price: 1680000, emoji: '⌚', image: IMG('photo-1587836374828-4dbafa94cf0e') },
      { name: 'GMT Voyage', price: 1420000, emoji: '⌚', image: IMG('photo-1614164185128-e4ec99c436d7') },
    ],
  },

  // ─────────────────────────────────────────── RESTAURANT ─────────
  {
    id: 'restaurant-savory',
    industry: 'Restaurant',
    name: 'Savory Table',
    tagline: 'Une cuisine qui raconte une histoire',
    description: 'Chaleureux et gourmand, parfait pour restaurants, bistrots et traiteurs.',
    emoji: '🍽️',
    colors: { primary: '#B45309', secondary: '#7C2D12', accent: '#F59E0B', background: '#FFFBEB', text: '#292524' },
    fonts: { heading: 'Playfair Display', body: 'Nunito' },
    layout: { productGridColumns: 2, spacing: 24 },
    productCard: { showPrice: true, showOriginalPrice: false, showAddToCart: true, showFavorite: false, borderRadius: 16, shadow: true, layout: 'grid' },
    headerTemplate: 'hero',
    bodyTemplate: 'magazine',
    footerTemplate: 'contact-focused',
    footer: { backgroundColor: '#292524', textColor: '#FEF3C7' },
    hero: {
      title: 'Réservez votre table',
      subtitle: 'Des plats préparés avec passion, à partir de produits frais et locaux.',
      cta: 'Voir le menu',
      image: IMG('photo-1517248135467-4c7edcad34c4'),
    },
    demoProducts: [
      { name: 'Filet & Sauce Maison', price: 12000, emoji: '🥩', image: IMG('photo-1544025162-d76694265947') },
      { name: 'Risotto Crémeux', price: 9000, emoji: '🍚', image: IMG('photo-1476124369491-e7addf5db371') },
      { name: 'Salade du Chef', price: 6500, emoji: '🥗', image: IMG('photo-1512621776951-a57141f2eefd') },
      { name: 'Burger Signature', price: 8000, emoji: '🍔', image: IMG('photo-1568901346375-23c9450c58cd') },
      { name: 'Dessert du Jour', price: 4500, emoji: '🍰', image: IMG('photo-1551024506-0bccd828d307') },
      { name: 'Plateau Fruits de Mer', price: 22000, emoji: '🦐', image: IMG('photo-1559742811-822873691df8') },
    ],
  },

  // ─────────────────────────────────────────── FAST FOOD ──────────
  {
    id: 'fastfood-rush',
    industry: 'Fast food',
    name: 'Rush Bites',
    tagline: 'Chaud, rapide, irrésistible',
    description: 'Coloré et énergique : le thème parfait pour burgers, pizzas et snacks.',
    emoji: '🍔',
    colors: { primary: '#EF4444', secondary: '#F97316', accent: '#FACC15', background: '#FFF7ED', text: '#1F2937' },
    fonts: { heading: 'Fredoka', body: 'Nunito' },
    layout: { productGridColumns: 3, spacing: 16 },
    productCard: { showPrice: true, showOriginalPrice: true, showAddToCart: true, showFavorite: false, borderRadius: 20, shadow: true, layout: 'grid' },
    headerTemplate: 'modern',
    bodyTemplate: 'carousel',
    footerTemplate: 'social',
    footer: { backgroundColor: '#B91C1C', textColor: '#FFFFFF' },
    hero: {
      title: 'Ta commande en 15 min ⚡',
      subtitle: 'Menus généreux, livraison express, prix mini. Régale-toi maintenant !',
      cta: 'Commander',
      image: IMG('photo-1571091718767-18b5b1457add'),
    },
    demoProducts: [
      { name: 'Double Cheese', price: 4500, originalPrice: 6000, emoji: '🍔', image: IMG('photo-1568901346375-23c9450c58cd') },
      { name: 'Pizza Pepperoni', price: 7000, emoji: '🍕', image: IMG('photo-1513104890138-7c749659a591') },
      { name: 'Poulet Croustillant', price: 5000, originalPrice: 6500, emoji: '🍗', image: IMG('photo-1562967914-608f82629710') },
      { name: 'Frites Maison', price: 2000, emoji: '🍟', image: IMG('photo-1573080496219-bb080dd4f877') },
      { name: 'Hot-Dog Deluxe', price: 3500, emoji: '🌭', image: IMG('photo-1612392062631-94dd858cba88') },
      { name: 'Milkshake Vanille', price: 3000, emoji: '🥤', image: IMG('photo-1572490122747-3968b75cc699') },
    ],
  },

  // ─────────────────────────────────────────── SUPERETTE / CASINO ─
  {
    id: 'grocery-market',
    industry: 'Supérette',
    name: 'Marché Frais',
    tagline: 'Tous vos essentiels, chaque jour',
    description: 'Frais et pratique : grille dense idéale pour supérettes, casinos de quartier et épiceries.',
    emoji: '🛒',
    colors: { primary: '#16A34A', secondary: '#166534', accent: '#F59E0B', background: '#F0FDF4', text: '#14532D' },
    fonts: { heading: 'Montserrat', body: 'Open Sans' },
    layout: { productGridColumns: 4, spacing: 14 },
    productCard: { showPrice: true, showOriginalPrice: true, showAddToCart: true, showFavorite: false, borderRadius: 10, shadow: true, layout: 'grid' },
    headerTemplate: 'mega-menu',
    bodyTemplate: 'sidebar-left',
    footerTemplate: 'multi-column',
    footer: { backgroundColor: '#14532D', textColor: '#DCFCE7' },
    hero: {
      title: 'Faites vos courses en ligne',
      subtitle: 'Produits frais, promos du jour et livraison à domicile dans votre quartier.',
      cta: 'Remplir mon panier',
      image: IMG('photo-1542838132-92c53300491e'),
    },
    demoProducts: [
      { name: 'Panier de Légumes', price: 3500, originalPrice: 4500, emoji: '🥬', image: IMG('photo-1540420773420-3366772f4999') },
      { name: 'Fruits de Saison', price: 4000, emoji: '🍎', image: IMG('photo-1619566636858-adf3ef46400b') },
      { name: 'Pain Frais', price: 800, emoji: '🥖', image: IMG('photo-1509440159596-0249088772ff') },
      { name: 'Lait 1L', price: 1200, emoji: '🥛', image: IMG('photo-1550583724-b2692b85b150') },
      { name: 'Œufs x12', price: 2500, originalPrice: 3000, emoji: '🥚', image: IMG('photo-1582722872445-44dc5f7e3c8f') },
      { name: 'Riz 5kg', price: 6000, emoji: '🍚', image: IMG('photo-1586201375761-83865001e31c') },
      { name: 'Jus d’Orange', price: 1800, emoji: '🧃', image: IMG('photo-1600271886742-f049cd451bba') },
      { name: 'Café Moulu', price: 3200, emoji: '☕', image: IMG('photo-1447933601403-0c6688de566e') },
    ],
  },
];

export const getIndustryThemeById = (id: string): IndustryTheme | undefined =>
  INDUSTRY_THEMES.find(t => t.id === id);
