// ─── AI Shopping Assistant Service ─────────────────────────────────────────────
// AI-powered personal shopping assistant with recommendations and style advice

export interface ShoppingSession {
  id: string;
  customerId: string;
  customerName: string;
  preferences: CustomerPreferences;
  browsingHistory: BrowsingItem[];
  cartItems: CartItem[];
  recommendations: Recommendation[];
  chatHistory: ChatMessage[];
  status: 'active' | 'completed' | 'abandoned';
  startedAt: string;
  lastActivity: string;
  completedAt?: string;
}

export interface CustomerPreferences {
  style: string[];
  colors: string[];
  brands: string[];
  priceRange: { min: number; max: number };
  sizes: string[];
  occasions: string[];
  dislikes: string[];
  bodyType?: string;
  lifestyle?: string;
}

export interface BrowsingItem {
  productId: string;
  productName: string;
  category: string;
  viewedAt: string;
  timeSpent: number;
  addedToWishlist: boolean;
  addedToCart: boolean;
}

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  addedAt: string;
}

export interface Recommendation {
  id: string;
  productId: string;
  productName: string;
  reason: string;
  confidence: number;
  type: 'similar' | 'complementary' | 'trending' | 'personalized' | 'outfit';
  imageUrl?: string;
  price: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachments?: Array<{ type: 'image' | 'product'; url: string; id: string }>;
  suggestedActions?: Array<{ label: string; action: string; data?: any }>;
}

export interface OutfitSuggestion {
  id: string;
  name: string;
  description: string;
  items: Array<{
    productId: string;
    productName: string;
    category: string;
    imageUrl?: string;
  }>;
  occasion: string;
  style: string;
  totalLookPrice: number;
  weather?: string;
  season: string;
}

class ShoppingAssistantService {
  private sessions: Map<string, ShoppingSession> = new Map();
  private outfitDatabase: OutfitSuggestion[] = [];

  constructor() {
    this.initializeOutfitDatabase();
  }

  private initializeOutfitDatabase(): void {
    this.outfitDatabase = [
      {
        id: 'outfit-1',
        name: 'Casual Friday',
        description: 'Perfect for a relaxed office environment',
        items: [
          { productId: '1', productName: 'Oversized Blazer', category: 'Outerwear' },
          { productId: '2', productName: 'Slim Fit Chinos', category: 'Pants' },
          { productId: '3', productName: 'White Sneakers', category: 'Shoes' },
        ],
        occasion: 'work',
        style: 'casual',
        totalLookPrice: 189,
        season: 'all',
      },
      {
        id: 'outfit-2',
        name: 'Weekend Brunch',
        description: 'Stylish and comfortable for weekend outings',
        items: [
          { productId: '4', productName: 'Floral Dress', category: 'Dresses' },
          { productId: '5', productName: 'Denim Jacket', category: 'Outerwear' },
          { productId: '6', productName: 'Ankle Boots', category: 'Shoes' },
        ],
        occasion: 'casual',
        style: 'chic',
        totalLookPrice: 145,
        season: 'spring',
      },
      {
        id: 'outfit-3',
        name: 'Business Professional',
        description: 'Sharp and sophisticated for important meetings',
        items: [
          { productId: '7', productName: 'Tailored Suit', category: 'Suits' },
          { productId: '8', productName: 'Dress Shirt', category: 'Tops' },
          { productId: '9', productName: 'Leather Oxfords', category: 'Shoes' },
        ],
        occasion: 'work',
        style: 'formal',
        totalLookPrice: 350,
        season: 'all',
      },
    ];
  }

  // ─── Session Management ─────────────────────────────────────────────────────

  startSession(customerId: string, customerName: string, initialPreferences?: Partial<CustomerPreferences>): ShoppingSession {
    const session: ShoppingSession = {
      id: `SES-${Date.now()}`,
      customerId,
      customerName,
      preferences: {
        style: initialPreferences?.style || [],
        colors: initialPreferences?.colors || [],
        brands: initialPreferences?.brands || [],
        priceRange: initialPreferences?.priceRange || { min: 0, max: 1000 },
        sizes: initialPreferences?.sizes || [],
        occasions: initialPreferences?.occasions || [],
        dislikes: initialPreferences?.dislikes || [],
        bodyType: initialPreferences?.bodyType,
        lifestyle: initialPreferences?.lifestyle,
      },
      browsingHistory: [],
      cartItems: [],
      recommendations: [],
      chatHistory: [
        {
          id: `MSG-${Date.now()}`,
          role: 'assistant',
          content: `Bonjour ${customerName} ! 👋 Je suis votre assistant shopping personnel. Comment puis-je vous aider aujourd'hui ?`,
          timestamp: new Date().toISOString(),
          suggestedActions: [
            { label: 'Trouver une tenue', action: 'find_outfit' },
            { label: 'Recommandations', action: 'get_recommendations' },
            { label: 'Conseil style', action: 'style_advice' },
          ],
        },
      ],
      status: 'active',
      startedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    };

    this.sessions.set(session.id, session);
    return session;
  }

  updatePreferences(sessionId: string, preferences: Partial<CustomerPreferences>): ShoppingSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    session.preferences = { ...session.preferences, ...preferences };
    session.lastActivity = new Date().toISOString();
    
    // Regenerate recommendations based on new preferences
    session.recommendations = this.generateRecommendations(session);

    return session;
  }

  trackBrowsing(sessionId: string, item: BrowsingItem): ShoppingSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Remove existing entry for same product if exists
    session.browsingHistory = session.browsingHistory.filter(i => i.productId !== item.productId);
    session.browsingHistory.unshift(item);
    
    // Keep only last 50 items
    if (session.browsingHistory.length > 50) {
      session.browsingHistory = session.browsingHistory.slice(0, 50);
    }

    session.lastActivity = new Date().toISOString();
    session.recommendations = this.generateRecommendations(session);

    return session;
  }

  addToCart(sessionId: string, item: CartItem): ShoppingSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const existingIndex = session.cartItems.findIndex(i => i.productId === item.productId);
    if (existingIndex >= 0) {
      session.cartItems[existingIndex].quantity += item.quantity;
    } else {
      session.cartItems.push(item);
    }

    session.lastActivity = new Date().toISOString();
    return session;
  }

  // ─── AI Recommendations ───────────────────────────────────────────────────

  generateRecommendations(session: ShoppingSession): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const { preferences, browsingHistory, cartItems } = session;

    // 1. Similar items based on browsing history
    const recentItems = browsingHistory.slice(0, 5);
    recentItems.forEach(item => {
      recommendations.push({
        id: `REC-${Date.now()}-${Math.random()}`,
        productId: `${parseInt(item.productId) + 100}`,
        productName: `${item.productName} (Similar)`,
        reason: 'Based on your recent browsing',
        confidence: 0.85,
        type: 'similar',
        price: Math.random() * 100 + 20,
      });
    });

    // 2. Complementary items based on cart
    cartItems.forEach(item => {
      recommendations.push({
        id: `REC-${Date.now()}-${Math.random()}`,
        productId: `${parseInt(item.productId) + 200}`,
        productName: `Accessory for ${item.productName}`,
        reason: 'Complements items in your cart',
        confidence: 0.75,
        type: 'complementary',
        price: Math.random() * 50 + 10,
      });
    });

    // 3. Personalized based on preferences
    if (preferences.style.length > 0) {
      preferences.style.forEach(style => {
        recommendations.push({
          id: `REC-${Date.now()}-${Math.random()}`,
          productId: `${Math.floor(Math.random() * 1000)}`,
          productName: `${style} Collection Item`,
          reason: `Matches your ${style} style preference`,
          confidence: 0.9,
          type: 'personalized',
          price: preferences.priceRange.min + Math.random() * (preferences.priceRange.max - preferences.priceRange.min),
        });
      });
    }

    // 4. Trending items
    recommendations.push({
      id: `REC-${Date.now()}-${Math.random()}`,
      productId: `${Math.floor(Math.random() * 1000)}`,
      productName: 'Trending Summer Collection',
      reason: 'Popular this week',
      confidence: 0.7,
      type: 'trending',
      price: Math.random() * 80 + 30,
    });

    // Sort by confidence and limit to 10
    return recommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);
  }

  // ─── Outfit Suggestions ───────────────────────────────────────────────────

  getOutfitSuggestions(occasion?: string, style?: string, weather?: string): OutfitSuggestion[] {
    let suggestions = this.outfitDatabase;

    if (occasion) {
      suggestions = suggestions.filter(o => o.occasion === occasion);
    }

    if (style) {
      suggestions = suggestions.filter(o => o.style === style);
    }

    return suggestions;
  }

  generateOutfitFromPreferences(preferences: CustomerPreferences): OutfitSuggestion {
    const style = preferences.style[0] || 'casual';
    const occasion = preferences.occasions[0] || 'casual';
    const season = this.getCurrentSeason();

    return {
      id: `OUT-${Date.now()}`,
      name: `Custom ${style} Look`,
      description: `Personalized ${style} outfit for ${occasion}`,
      items: [
        { productId: `${Math.floor(Math.random() * 1000)}`, productName: 'Main Piece', category: 'Tops' },
        { productId: `${Math.floor(Math.random() * 1000)}`, productName: 'Bottom', category: 'Pants' },
        { productId: `${Math.floor(Math.random() * 1000)}`, productName: 'Footwear', category: 'Shoes' },
        { productId: `${Math.floor(Math.random() * 1000)}`, productName: 'Accessory', category: 'Accessories' },
      ],
      occasion,
      style,
      totalLookPrice: Math.random() * 200 + 100,
      season,
    };
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  // ─── Chat Interface ───────────────────────────────────────────────────────

  processMessage(sessionId: string, userMessage: string): ShoppingSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Add user message
    session.chatHistory.push({
      id: `MSG-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    });

    // Generate AI response
    const aiResponse = this.generateAIResponse(userMessage, session);
    
    session.chatHistory.push(aiResponse);
    session.lastActivity = new Date().toISOString();

    return session;
  }

  private generateAIResponse(userMessage: string, session: ShoppingSession): ChatMessage {
    const lowerMessage = userMessage.toLowerCase();
    let content = '';
    let suggestedActions: Array<{ label: string; action: string; data?: any }> = [];

    if (lowerMessage.includes('tenue') || lowerMessage.includes('outfit')) {
      const outfit = this.generateOutfitFromPreferences(session.preferences);
      content = `Voici une suggestion de tenue pour vous : ${outfit.name}. ${outfit.description}. Le prix total est de ${outfit.totalLookPrice.toFixed(2)}€.`;
      suggestedActions = [
        { label: 'Voir les détails', action: 'view_outfit', data: { outfitId: outfit.id } },
        { label: 'Ajouter au panier', action: 'add_outfit_to_cart', data: { outfitId: outfit.id } },
        { label: 'Autre suggestion', action: 'suggest_another_outfit' },
      ];
    } else if (lowerMessage.includes('prix') || lowerMessage.includes('budget')) {
      content = `Votre budget est entre ${session.preferences.priceRange.min}€ et ${session.preferences.priceRange.max}€. Je peux vous recommander des articles dans cette gamme de prix.`;
      suggestedActions = [
        { label: 'Voir les recommandations', action: 'show_recommendations' },
        { label: 'Modifier le budget', action: 'update_budget' },
      ];
    } else if (lowerMessage.includes('style') || lowerMessage.includes('conseil')) {
      content = `Basé sur vos préférences de style (${session.preferences.style.join(', ')}), je vous recommande de privilégier des pièces intemporelles qui s'adaptent à votre lifestyle.`;
      suggestedActions = [
        { label: 'Voir les tendances', action: 'show_trends' },
        { label: 'Nouveau conseil', action: 'style_advice' },
      ];
    } else if (lowerMessage.includes('recommandation')) {
      const recs = session.recommendations.slice(0, 3);
      content = `Voici mes recommandations pour vous : ${recs.map(r => r.productName).join(', ')}.`;
      suggestedActions = [
        { label: 'Voir plus', action: 'show_more_recommendations' },
        { label: 'Filtrer par prix', action: 'filter_by_price' },
      ];
    } else {
      content = 'Je suis là pour vous aider ! Je peux vous suggérer des tenues, donner des conseils de style, ou vous recommander des produits. Que préférez-vous ?';
      suggestedActions = [
        { label: 'Trouver une tenue', action: 'find_outfit' },
        { label: 'Conseil style', action: 'style_advice' },
        { label: 'Recommandations', action: 'get_recommendations' },
      ];
    }

    return {
      id: `MSG-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      suggestedActions,
    };
  }

  // ─── Session Management ─────────────────────────────────────────────────────

  completeSession(sessionId: string): ShoppingSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    session.status = 'completed';
    session.completedAt = new Date().toISOString();

    return session;
  }

  getSession(sessionId: string): ShoppingSession | undefined {
    return this.sessions.get(sessionId);
  }

  getCustomerSessions(customerId: string): ShoppingSession[] {
    return Array.from(this.sessions.values()).filter(s => s.customerId === customerId);
  }

  // ─── Analytics ─────────────────────────────────────────────────────────────

  getAssistantStats(days: number = 30): {
    totalSessions: number;
    completedSessions: number;
    averageSessionDuration: number;
    totalRecommendations: number;
    conversionRate: number;
    topPreferences: Record<string, number>;
    chatMessages: number;
  } {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const sessions = Array.from(this.sessions.values()).filter(
      s => new Date(s.startedAt) >= cutoffDate
    );

    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    
    const totalDuration = sessions.reduce((sum, s) => {
      const end = new Date(s.completedAt || s.lastActivity);
      const start = new Date(s.startedAt);
      return sum + (end.getTime() - start.getTime());
    }, 0);
    const averageSessionDuration = sessions.length > 0 ? totalDuration / sessions.length / 1000 / 60 : 0; // in minutes

    const totalRecommendations = sessions.reduce((sum, s) => sum + s.recommendations.length, 0);

    const sessionsWithCart = sessions.filter(s => s.cartItems.length > 0).length;
    const conversionRate = sessions.length > 0 ? (sessionsWithCart / sessions.length) * 100 : 0;

    const topPreferences: Record<string, number> = {};
    sessions.forEach(s => {
      s.preferences.style.forEach(style => {
        topPreferences[style] = (topPreferences[style] || 0) + 1;
      });
    });

    const chatMessages = sessions.reduce((sum, s) => sum + s.chatHistory.length, 0);

    return {
      totalSessions: sessions.length,
      completedSessions,
      averageSessionDuration,
      totalRecommendations,
      conversionRate,
      topPreferences,
      chatMessages,
    };
  }
}

export const shoppingAssistantService = new ShoppingAssistantService();
