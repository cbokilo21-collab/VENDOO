import { FirestoreService } from './firestoreService';
import { where } from 'firebase/firestore';

export interface SurveyQuestion {
  id: string;
  question: string;
  type: 'rating' | 'text' | 'choice' | 'multiple';
  options?: string[]; // Pour les questions à choix
  required: boolean;
}

export interface SurveyResponse {
  questionId: string;
  answer: string | number | string[];
}

export interface SellerSurvey {
  id?: string;
  userId: string; // ID du visiteur
  storeId: string; // ID de la boutique évaluée
  storeName: string;
  surveyType: 'quality' | 'service' | 'pricing' | 'overall';
  responses: SurveyResponse[];
  overallScore: number; // Score global calculé par l'IA
  aiAnalysis?: string; // Analyse générée par l'IA
  aiRecommendations?: string[]; // Recommandations de l'IA
  completed: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export const SurveyService = {
  /**
   * Créer une nouvelle enquête sur un vendeur
   */
  async createSurvey(data: Omit<SellerSurvey, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return FirestoreService.create<SellerSurvey>('sellerSurveys', data);
  },

  /**
   * Obtenir toutes les enquêtes d'un utilisateur
   */
  async getUserSurveys(userId: string): Promise<SellerSurvey[]> {
    try {
      const surveys = await FirestoreService.query<SellerSurvey>('sellerSurveys', [
        where('userId', '==', userId),
      ]);
      // Trier par date décroissant
      return surveys.sort((a, b) => {
        const dateA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
        const dateB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('Error getting user surveys:', error);
      return [];
    }
  },

  /**
   * Obtenir toutes les enquêtes pour une boutique
   */
  async getStoreSurveys(storeId: string): Promise<SellerSurvey[]> {
    try {
      const surveys = await FirestoreService.query<SellerSurvey>('sellerSurveys', [
        where('storeId', '==', storeId),
      ]);
      return surveys.sort((a, b) => {
        const dateA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
        const dateB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('Error getting store surveys:', error);
      return [];
    }
  },

  /**
   * Mettre à jour une enquête
   */
  async updateSurvey(surveyId: string, data: Partial<SellerSurvey>): Promise<void> {
    await FirestoreService.update<SellerSurvey>('sellerSurveys', surveyId, {
      ...data,
      updatedAt: new Date(),
    });
  },

  /**
   * Marquer une enquête comme terminée
   */
  async completeSurvey(surveyId: string, overallScore: number, aiAnalysis: string, aiRecommendations: string[]): Promise<void> {
    await this.updateSurvey(surveyId, {
      completed: true,
      overallScore,
      aiAnalysis,
      aiRecommendations,
    });
  },

  /**
   * Supprimer une enquête
   */
  async deleteSurvey(surveyId: string): Promise<void> {
    await FirestoreService.delete('sellerSurveys', surveyId);
  },

  /**
   * Obtenir les modèles de questions d'enquête
   */
  getSurveyQuestions(type: 'quality' | 'service' | 'pricing' | 'overall'): SurveyQuestion[] {
    const questionTemplates: Record<string, SurveyQuestion[]> = {
      quality: [
        { id: 'q1', question: 'Comment évaluez-vous la qualité des produits ?', type: 'rating', required: true },
        { id: 'q2', question: 'Les produits correspondent-ils à la description ?', type: 'rating', required: true },
        { id: 'q3', question: 'Les produits sont-ils bien emballés ?', type: 'rating', required: false },
        { id: 'q4', question: 'Commentaires sur la qualité', type: 'text', required: false },
      ],
      service: [
        { id: 'q1', question: 'Comment évaluez-vous le service client ?', type: 'rating', required: true },
        { id: 'q2', question: 'Le vendeur est-il réactif ?', type: 'rating', required: true },
        { id: 'q3', question: 'Le vendeur est-il courtois ?', type: 'rating', required: true },
        { id: 'q4', question: 'Quels aspects du service pourraient être améliorés ?', type: 'text', required: false },
      ],
      pricing: [
        { id: 'q1', question: 'Comment évaluez-vous les prix ?', type: 'rating', required: true },
        { id: 'q2', question: 'Les prix sont-ils compétitifs ?', type: 'rating', required: true },
        { id: 'q3', question: 'Y a-t-il des frais cachés ?', type: 'choice', options: ['Oui', 'Non'], required: true },
        { id: 'q4', question: 'Commentaires sur les prix', type: 'text', required: false },
      ],
      overall: [
        { id: 'q1', question: 'Recommanderiez-vous cette boutique ?', type: 'rating', required: true },
        { id: 'q2', question: 'Satisfaction globale', type: 'rating', required: true },
        { id: 'q3', question: 'Points forts (sélectionnez plusieurs)', type: 'multiple', options: ['Qualité', 'Service', 'Prix', 'Localisation', 'Variété'], required: true },
        { id: 'q4', question: 'Points à améliorer', type: 'text', required: false },
        { id: 'q5', question: 'Commentaire général', type: 'text', required: false },
      ],
    };

    return questionTemplates[type] || [];
  },

  /**
   * Calculer le score global d'une enquête (algorithme IA simplifié)
   */
  calculateOverallScore(responses: SurveyResponse[]): number {
    let totalScore = 0;
    let count = 0;

    responses.forEach(response => {
      if (typeof response.answer === 'number') {
        totalScore += response.answer;
        count++;
      }
    });

    return count > 0 ? (totalScore / count) * 20 : 0; // Normalisé sur 100
  },

  /**
   * Générer une analyse IA (simulation)
   */
  generateAIAnalysis(responses: SurveyResponse[], storeName: string): string {
    const overallScore = this.calculateOverallScore(responses);
    
    if (overallScore >= 80) {
      return `${storeName} est une boutique exceptionnelle avec des performances élevées dans tous les domaines. Les clients sont très satisfaits de la qualité, du service et des prix.`;
    } else if (overallScore >= 60) {
      return `${storeName} offre une bonne expérience globale avec quelques points à améliorer. La qualité des produits et le service sont satisfaisants mais pourraient être optimisés.`;
    } else if (overallScore >= 40) {
      return `${storeName} présente des performances moyennes. Certains aspects nécessitent une attention particulière pour améliorer l'expérience client.`;
    } else {
      return `${storeName} nécessite des améliorations significatives dans plusieurs domaines. Il est recommandé de revoir la qualité, le service et les prix.`;
    }
  },

  /**
   * Générer des recommandations IA (simulation)
   */
  generateAIRecommendations(responses: SurveyResponse[], overallScore: number): string[] {
    const recommendations: string[] = [];

    if (overallScore < 50) {
      recommendations.push('Améliorer la qualité des produits');
      recommendations.push('Renforcer le service client');
      recommendations.push('Revoir la politique de prix');
    } else if (overallScore < 70) {
      recommendations.push('Optimiser le temps de réponse');
      recommendations.push('Améliorer l\'emballage des produits');
    } else {
      recommendations.push('Maintenir le niveau de qualité actuel');
      recommendations.push('Considérer un programme de fidélité');
    }

    return recommendations;
  },

  /**
   * Obtenir les statistiques d'enquêtes pour une boutique
   */
  async getStoreSurveyStats(storeId: string): Promise<{
    total: number;
    averageScore: number;
    completed: number;
    byType: Record<string, number>;
  }> {
    try {
      const surveys = await this.getStoreSurveys(storeId);
      const completedSurveys = surveys.filter(s => s.completed);
      
      const byType: Record<string, number> = {};
      surveys.forEach(survey => {
        byType[survey.surveyType] = (byType[survey.surveyType] || 0) + 1;
      });

      const sum = completedSurveys.reduce((total, survey) => total + (survey.overallScore || 0), 0);
      const averageScore = completedSurveys.length > 0 ? sum / completedSurveys.length : 0;

      return {
        total: surveys.length,
        averageScore,
        completed: completedSurveys.length,
        byType,
      };
    } catch (error) {
      console.error('Error getting survey stats:', error);
      return { total: 0, averageScore: 0, completed: 0, byType: {} };
    }
  },
};
