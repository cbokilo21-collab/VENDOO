import { FirestoreService } from './firestoreService';
import { ThemeTemplate, getTemplateById } from '../constants/themeTemplates';
import { where } from 'firebase/firestore';

export interface ThemeConfig extends ThemeTemplate {
  boutiqueId: string;
  headerTemplate?: string;
  bodyTemplate?: string;
  footerTemplate?: string;
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
