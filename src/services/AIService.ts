import { Produit, Order, Customer } from '../types';

// AI Service for business automation
export interface SalesPrediction {
  period: string;
  predictedRevenue: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  factors: string[];
}

export interface StockRecommendation {
  productId: string;
  productName: string;
  currentStock: number;
  recommendedStock: number;
  urgency: 'low' | 'medium' | 'high';
  reason: string;
}

export interface CustomerInsight {
  customerId: string;
  customerName: string;
  segment: 'vip' | 'regular' | 'at-risk' | 'new';
  lifetimeValue: number;
  nextPurchasePrediction: number; // days until next purchase
  recommendedAction: string;
  churnRisk: number; // 0-1
}

export interface ProductRecommendation {
  productId: string;
  productName: string;
  confidence: number;
  reason: string;
  targetCustomer: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AIInsight {
  type: 'sales' | 'stock' | 'customer' | 'product' | 'general';
  title: string;
  description: string;
  action: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
}

class AIService {
  private apiKey: string | null = null;
  private baseUrl: string = 'https://api.openai.com/v1';

  constructor() {
    // Load API key from storage or config
    this.apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || null;
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }

  // Sales Prediction
  async predictSales(historicalData: Order[]): Promise<SalesPrediction[]> {
    // Simulate AI prediction (replace with actual API call)
    const predictions: SalesPrediction[] = [
      {
        period: 'Aujourd\'hui',
        predictedRevenue: 285,
        confidence: 0.92,
        trend: 'up',
        factors: ['Tendance saisonnière positive', 'Promotions actives', 'Nouveau clientèle']
      },
      {
        period: 'Cette semaine',
        predictedRevenue: 1950,
        confidence: 0.88,
        trend: 'up',
        factors: ['Demande croissante', 'Stock suffisant', 'Marketing efficace']
      },
      {
        period: 'Ce mois',
        predictedRevenue: 8234,
        confidence: 0.85,
        trend: 'up',
        factors: ['Saison favorable', 'Expansion clientèle', 'Rétention améliorée']
      }
    ];

    return predictions;
  }

  // Stock Management
  async analyzeStock(products: Produit[], orders: Order[]): Promise<StockRecommendation[]> {
    // Simulate AI stock analysis
    const recommendations: StockRecommendation[] = [
      {
        productId: '1',
        productName: 'Robe été',
        currentStock: 3,
        recommendedStock: 25,
        urgency: 'high',
        reason: 'Ventes élevées récentes, stock critique'
      },
      {
        productId: '2',
        productName: 'Sac à main',
        currentStock: 2,
        recommendedStock: 20,
        urgency: 'high',
        reason: 'Demande en hausse, rupture imminente'
      }
    ];

    return recommendations;
  }

  // Customer Insights
  async analyzeCustomers(customers: Customer[], orders: Order[]): Promise<CustomerInsight[]> {
    // Simulate AI customer analysis
    const insights: CustomerInsight[] = [
      {
        customerId: 'c1',
        customerName: 'Marie Dupont',
        segment: 'vip',
        lifetimeValue: 1250,
        nextPurchasePrediction: 7,
        recommendedAction: 'Offrir réduction exclusive',
        churnRisk: 0.1
      },
      {
        customerId: 'c2',
        customerName: 'Jean Martin',
        segment: 'at-risk',
        lifetimeValue: 450,
        nextPurchasePrediction: 45,
        recommendedAction: 'Envoyer email de réengagement',
        churnRisk: 0.75
      }
    ];

    return insights;
  }

  // Product Recommendations
  async recommendProducts(customerId: string, products: Produit[], orders: Order[]): Promise<ProductRecommendation[]> {
    // Simulate AI product recommendations
    const recommendations: ProductRecommendation[] = [
      {
        productId: '3',
        productName: 'Blazer élégant',
        confidence: 0.89,
        reason: 'Complémente vos achats précédents',
        targetCustomer: customerId
      },
      {
        productId: '4',
        productName: 'Accessoires assortis',
        confidence: 0.82,
        reason: 'Tendance actuelle pour votre profil',
        targetCustomer: customerId
      }
    ];

    return recommendations;
  }

  // Chatbot
  async chat(message: string, context: string): Promise<string> {
    // Simulate AI chat response (replace with actual API call)
    const responses = [
      'Je peux vous aider avec votre commande. Pourriez-vous me donner votre numéro de commande?',
      'Nos délais de livraison sont généralement de 2-3 jours ouvrés.',
      'Vous pouvez suivre votre commande dans la section "Mes commandes" de l\'application.',
      'Nous avons une politique de retour de 30 jours pour tous les articles.',
      'Pour un remboursement, veuillez contacter notre service client par email.'
    ];

    // Simple keyword matching for demo
    if (message.toLowerCase().includes('livraison')) {
      return 'Nos délais de livraison sont généralement de 2-3 jours ouvrés. Vous pouvez suivre votre commande en temps réel dans l\'application.';
    } else if (message.toLowerCase().includes('retour')) {
      return 'Nous acceptons les retours sous 30 jours. Pour initier un retour, allez dans votre historique de commandes et cliquez sur "Retourner".';
    } else if (message.toLowerCase().includes('remboursement')) {
      return 'Les remboursements sont traités sous 5-7 jours ouvrés après réception de l\'article retourné.';
    } else if (message.toLowerCase().includes('stock')) {
      return 'Je peux vérifier la disponibilité d\'un produit. Quel article recherchez-vous?';
    } else {
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  // Generate AI Insights
  async generateInsights(data: {
    sales: Order[];
    products: Produit[];
    customers: Customer[];
  }): Promise<AIInsight[]> {
    const insights: AIInsight[] = [
      {
        type: 'sales',
        title: '📈 Opportunité de vente',
        description: 'Les ventes de robes d\'été ont augmenté de 35% cette semaine',
        action: 'Augmenter le stock de robes d\'été',
        priority: 'high',
        timestamp: new Date()
      },
      {
        type: 'stock',
        title: '⚠️ Alerte stock',
        description: '2 produits sont en stock critique',
        action: 'Réapprovisionner immédiatement',
        priority: 'high',
        timestamp: new Date()
      },
      {
        type: 'customer',
        title: '👤 Client à risque',
        description: '3 clients n\'ont pas acheté depuis 30 jours',
        action: 'Envoyer campagne de réengagement',
        priority: 'medium',
        timestamp: new Date()
      },
      {
        type: 'product',
        title: '🎯 Produit tendance',
        description: 'Les sacs à main sont les plus vendus ce mois',
        action: 'Mettre en avant sur la page d\'accueil',
        priority: 'medium',
        timestamp: new Date()
      }
    ];

    return insights;
  }

  // Order Processing AI
  async processOrder(order: Order): Promise<{
    fraudRisk: number;
    recommendedAction: 'approve' | 'review' | 'reject';
    reason: string;
  }> {
    // Simulate AI fraud detection
    const fraudRisk = Math.random() * 0.3; // Low risk for demo
    
    return {
      fraudRisk,
      recommendedAction: fraudRisk > 0.5 ? 'review' : 'approve',
      reason: fraudRisk > 0.5 ? 'Anomalie détectée dans le pattern d\'achat' : 'Commande conforme aux patterns normaux'
    };
  }

  // Price Optimization
  async optimizePrice(productId: string, currentPrice: number, salesData: Order[]): Promise<{
    recommendedPrice: number;
    reason: string;
    expectedImpact: number;
  }> {
    // Simulate AI price optimization
    return {
      recommendedPrice: currentPrice * 1.05,
      reason: 'Demande élevée, marge d\'augmentation possible',
      expectedImpact: 12 // % increase in revenue
    };
  }
}

export const aiService = new AIService();
