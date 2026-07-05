import { FirestoreService } from './firestoreService';
import { ThemeTemplate, getTemplateById } from '../constants/themeTemplates';
import { IndustryTheme } from '../constants/industryThemes';
import { PremiumTheme } from './ShoppyService';
import { PreviewProduct } from '../components/ThemePreviewCanvas';
import { where } from 'firebase/firestore';

export interface ThemeConfig extends ThemeTemplate {
  boutiqueId: string;
  headerTemplate?: string;
  bodyTemplate?: string;
  footerTemplate?: string;
  /** Which industry preset (industryThemes.ts) this config was seeded from, if any. */
  industryThemeId?: string;
  /** Which Shoppy premium theme (purchased from the marketplace) this config was seeded from, if any. */
  premiumThemeId?: string;
  /**
   * Whether the storefront should fall back to the industry theme's demo
   * products when the boutique has none of its own yet. When false, the
   * live site only ever shows real products (empty state otherwise) so
   * demo/stock photos never reach real customers unless explicitly chosen.
   */
  showDemoProducts?: boolean;
  customizations?: {
    header?: {
      logo?: string;
      title?: string;
      subtitle?: string;
      backgroundImage?: string;
      videoUrl?: string;
    };
    body?: {
      colors?: {
        primary?: string;
        secondary?: string;
        background?: string;
      };
      fonts?: {
        heading?: string;
        body?: string;
      };
    };
    footer?: {
      logo?: string;
      backgroundColor?: string;
      textColor?: string;
    };
    /**
     * Demo products carried over from the industry/premium preset at apply
     * time, stored directly so the storefront never needs an extra lookup.
     */
    demoProducts?: PreviewProduct[];
  };
  customElements?: {
    header?: {
      logo?: string;
      title?: string;
      showMenu?: boolean;
    };
    hero?: {
      image?: string;
      title?: string;
      subtitle?: string;
      showCTA?: boolean;
    };
    footer?: {
      showSocialLinks?: boolean;
      showNewsletter?: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

class ThemeService {
  private collection = 'themes';

  async createTheme(boutiqueId: string, templateId: string): Promise<string> {
    const template = getTemplateById(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const { id: _templateId, ...templateRest } = template;
    const themeConfig: Partial<ThemeConfig> = {
      boutiqueId,
      ...templateRest,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return FirestoreService.create(this.collection, themeConfig);
  }

  /**
   * Apply a fully-built industry theme preset to a boutique: seeds colours,
   * fonts, layout, header/body/footer models and hero content in one shot.
   * Creates the theme document if none exists yet, otherwise updates it.
   * `showDemoProducts` controls whether the sector's demo products should be
   * used as a fallback on the public storefront while real inventory is empty.
   */
  async applyIndustryTheme(boutiqueId: string, theme: IndustryTheme, showDemoProducts: boolean): Promise<string> {
    return this.applyPreset(boutiqueId, theme, showDemoProducts, { industryThemeId: theme.id });
  }

  /**
   * Apply a Shoppy premium theme (purchased from the marketplace) to a
   * boutique. Mirrors applyIndustryTheme but tags the config with
   * `premiumThemeId` instead, for provenance/analytics.
   */
  async applyPremiumTheme(boutiqueId: string, theme: PremiumTheme, showDemoProducts: boolean): Promise<string> {
    return this.applyPreset(boutiqueId, theme, showDemoProducts, { premiumThemeId: theme.id });
  }

  private async applyPreset(
    boutiqueId: string,
    theme: IndustryTheme | PremiumTheme,
    showDemoProducts: boolean,
    origin: { industryThemeId?: string; premiumThemeId?: string }
  ): Promise<string> {
    const demoProducts: PreviewProduct[] = theme.demoProducts.map((d, i) => ({
      id: `${theme.id || theme.name}-${i}`,
      name: d.name,
      price: d.price,
      originalPrice: d.originalPrice,
      emoji: d.emoji,
      imageUri: d.image,
    }));

    const config: Partial<ThemeConfig> = {
      boutiqueId,
      name: theme.name,
      description: theme.description,
      preview: theme.emoji,
      colors: theme.colors,
      fonts: theme.fonts,
      layout: theme.layout,
      productCard: theme.productCard,
      headerTemplate: theme.headerTemplate,
      bodyTemplate: theme.bodyTemplate,
      footerTemplate: theme.footerTemplate,
      showDemoProducts,
      ...origin,
      customizations: {
        header: { title: theme.hero.title, subtitle: theme.hero.subtitle, backgroundImage: theme.hero.image },
        footer: { backgroundColor: theme.footer.backgroundColor, textColor: theme.footer.textColor },
        demoProducts,
      },
      updatedAt: new Date(),
    };

    const existing = await this.getThemeByBoutique(boutiqueId);
    if (existing?.id) {
      await this.updateTheme(existing.id, config);
      return existing.id;
    }
    return FirestoreService.create(this.collection, { ...config, createdAt: new Date() });
  }

  async getThemeByBoutique(boutiqueId: string): Promise<ThemeConfig | null> {
    const themes = await FirestoreService.query<ThemeConfig>(this.collection, [
      where('boutiqueId', '==', boutiqueId),
    ]);

    return themes.length > 0 ? themes[0] : null;
  }

  async updateTheme(themeId: string, updates: Partial<ThemeConfig>): Promise<void> {
    await FirestoreService.update(this.collection, themeId, {
      ...updates,
      updatedAt: new Date(),
    });
  }

  async deleteTheme(themeId: string): Promise<void> {
    await FirestoreService.delete(this.collection, themeId);
  }

  async getAllTemplates(): Promise<ThemeTemplate[]> {
    return [];
  }
}

export const themeService = new ThemeService();
