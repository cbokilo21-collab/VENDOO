export interface FooterTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  structure: {
    type: 'simple' | 'multi-column' | 'newsletter' | 'social' | 'minimal' | 'dark' | 'centered' | 'split' | 'mega' | 'sticky';
    columns: number;
    hasNewsletter: boolean;
    hasSocialLinks: boolean;
    hasPaymentIcons: boolean;
    hasCopyright: boolean;
    hasLinks: boolean;
    hasContact: boolean;
  };
  customizable: {
    logo: boolean;
    colors: boolean;
    fonts: boolean;
    spacing: boolean;
    backgroundColor: boolean;
    textColor: boolean;
  };
}

export const FOOTER_TEMPLATES: FooterTemplate[] = [
  {
    id: 'simple',
    name: 'Simple',
    description: 'Footer minimaliste avec logo et copyright',
    preview: '📄',
    structure: {
      type: 'simple',
      columns: 1,
      hasNewsletter: false,
      hasSocialLinks: false,
      hasPaymentIcons: false,
      hasCopyright: true,
      hasLinks: false,
      hasContact: false,
    },
    customizable: {
      logo: true,
      colors: true,
      fonts: true,
      spacing: true,
      backgroundColor: true,
      textColor: true,
    },
  },
  {
    id: 'multi-column',
    name: 'Multi-Colonne',
    description: 'Footer avec 4 colonnes de liens',
    preview: '📋',
    structure: {
      type: 'multi-column',
      columns: 4,
      hasNewsletter: false,
      hasSocialLinks: true,
      hasPaymentIcons: true,
      hasCopyright: true,
      hasLinks: true,
      hasContact: false,
    },
    customizable: {
      logo: true,
      colors: true,
      fonts: true,
      spacing: true,
      backgroundColor: true,
      textColor: true,
    },
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    description: 'Footer avec formulaire d\'inscription newsletter',
    preview: '📧',
    structure: {
      type: 'newsletter',
      columns: 3,
      hasNewsletter: true,
      hasSocialLinks: true,
      hasPaymentIcons: true,
      hasCopyright: true,
      hasLinks: true,
      hasContact: false,
    },
    customizable: {
      logo: true,
      colors: true,
      fonts: true,
      spacing: true,
      backgroundColor: true,
      textColor: true,
    },
  },
  {
    id: 'social',
    name: 'Social',
    description: 'Footer axé sur les réseaux sociaux',
    preview: '🔗',
    structure: {
      type: 'social',
      columns: 2,
      hasNewsletter: false,
      hasSocialLinks: true,
      hasPaymentIcons: false,
      hasCopyright: true,
      hasLinks: true,
      hasContact: true,
    },
    customizable: {
      logo: true,
      colors: true,
      fonts: true,
      spacing: true,
      backgroundColor: true,
      textColor: true,
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Footer ultra épuré avec seulement copyright',
    preview: '✨',
    structure: {
      type: 'minimal',
      columns: 1,
      hasNewsletter: false,
      hasSocialLinks: false,
      hasPaymentIcons: false,
      hasCopyright: true,
      hasLinks: false,
      hasContact: false,
    },
    customizable: {
      logo: false,
      colors: true,
      fonts: true,
      spacing: true,
      backgroundColor: true,
      textColor: true,
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Footer sombre avec contraste élevé',
    preview: '🌑',
    structure: {
      type: 'dark',
      columns: 4,
      hasNewsletter: true,
      hasSocialLinks: true,
      hasPaymentIcons: true,
      hasCopyright: true,
      hasLinks: true,
      hasContact: true,
    },
    customizable: {
      logo: true,
      colors: true,
      fonts: true,
      spacing: true,
      backgroundColor: true,
      textColor: true,
    },
  },
  {
    id: 'centered',
    name: 'Centré',
    description: 'Footer avec contenu centré',
    preview: '🎯',
    structure: {
      type: 'centered',
      columns: 1,
      hasNewsletter: true,
      hasSocialLinks: true,
      hasPaymentIcons: false,
      hasCopyright: true,
      hasLinks: true,
      hasContact: false,
    },
    customizable: {
      logo: true,
      colors: true,
      fonts: true,
      spacing: true,
      backgroundColor: true,
      textColor: true,
    },
  },
  {
    id: 'split',
    name: 'Split',
    description: 'Footer divisé en deux sections',
    preview: '⬜⬛',
    structure: {
      type: 'split',
      columns: 2,
      hasNewsletter: true,
      hasSocialLinks: true,
      hasPaymentIcons: true,
      hasCopyright: true,
      hasLinks: true,
      hasContact: true,
    },
    customizable: {
      logo: true,
      colors: true,
      fonts: true,
      spacing: true,
      backgroundColor: true,
      textColor: true,
    },
  },
  {
    id: 'mega',
    name: 'Mega',
    description: 'Footer complet avec toutes les sections',
    preview: '📚',
    structure: {
      type: 'mega',
      columns: 5,
      hasNewsletter: true,
      hasSocialLinks: true,
      hasPaymentIcons: true,
      hasCopyright: true,
      hasLinks: true,
      hasContact: true,
    },
    customizable: {
      logo: true,
      colors: true,
      fonts: true,
      spacing: true,
      backgroundColor: true,
      textColor: true,
    },
  },
  {
    id: 'sticky',
    name: 'Sticky',
    description: 'Footer fixe en bas de page',
    preview: '📌',
    structure: {
      type: 'sticky',
      columns: 1,
      hasNewsletter: false,
      hasSocialLinks: false,
      hasPaymentIcons: false,
      hasCopyright: true,
      hasLinks: false,
      hasContact: false,
    },
    customizable: {
      logo: false,
      colors: true,
      fonts: true,
      spacing: true,
      backgroundColor: true,
      textColor: true,
    },
  },
  {
    id: 'brand-focused',
    name: 'Brand Focused',
    description: 'Footer centré sur la marque',
    preview: '🏷️',
    structure: {
      type: 'centered',
      columns: 1,
      hasNewsletter: true,
      hasSocialLinks: true,
      hasPaymentIcons: false,
      hasCopyright: true,
      hasLinks: false,
      hasContact: true,
    },
    customizable: {
      logo: true,
      colors: true,
      fonts: true,
      spacing: true,
      backgroundColor: true,
      textColor: true,
    },
  },
  {
    id: 'contact-focused',
    name: 'Contact Focused',
    description: 'Footer avec informations de contact',
    preview: '📞',
    structure: {
      type: 'multi-column',
      columns: 3,
      hasNewsletter: false,
      hasSocialLinks: true,
      hasPaymentIcons: false,
      hasCopyright: true,
      hasLinks: true,
      hasContact: true,
    },
    customizable: {
      logo: true,
      colors: true,
      fonts: true,
      spacing: true,
      backgroundColor: true,
      textColor: true,
    },
  },
];

export const getFooterTemplateById = (id: string): FooterTemplate | undefined => {
  return FOOTER_TEMPLATES.find(t => t.id === id);
};
