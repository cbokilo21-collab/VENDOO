export interface PackPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: 'month' | 'year';
  features: {
    boutiqueInQuartier: boolean;
    catalogue: boolean;
    promoCredits: number;
    ecommerceSite: boolean;
    externalMerchantExtension: boolean;
    seoVendoo: boolean;
    seoGoogle: boolean;
    siteBuilder: boolean;
    chatbotAI: boolean;
    chatbotTokens: number;
    whatsappIntegration: boolean;
    analytics: boolean;
    boutiqueAdvisor: boolean;
    domainName: boolean;
    professionalEmail: boolean;
    messages: boolean;
    salesReception: boolean;
    maxProducts: number;
  };
  description: string;
  popular?: boolean;
}

export const PACK_PLANS: PackPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    period: 'month',
    features: {
      boutiqueInQuartier: true,
      catalogue: false,
      promoCredits: 0,
      ecommerceSite: false,
      externalMerchantExtension: false,
      seoVendoo: false,
      seoGoogle: false,
      siteBuilder: false,
      chatbotAI: false,
      chatbotTokens: 0,
      whatsappIntegration: false,
      analytics: false,
      boutiqueAdvisor: false,
      domainName: false,
      professionalEmail: false,
      messages: false,
      salesReception: true,
      maxProducts: 5,
    },
    description: 'Idéal pour débuter avec une boutique de base',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 10,
    currency: 'USD',
    period: 'month',
    features: {
      boutiqueInQuartier: true,
      catalogue: true,
      promoCredits: 50,
      ecommerceSite: false,
      externalMerchantExtension: false,
      seoVendoo: false,
      seoGoogle: false,
      siteBuilder: false,
      chatbotAI: false,
      chatbotTokens: 0,
      whatsappIntegration: false,
      analytics: false,
      boutiqueAdvisor: false,
      domainName: false,
      professionalEmail: false,
      messages: false,
      salesReception: true,
      maxProducts: 20,
    },
    description: 'Pour les petites boutiques en croissance',
  },
  {
    id: 'business',
    name: 'Business',
    price: 25,
    currency: 'USD',
    period: 'month',
    features: {
      boutiqueInQuartier: true,
      catalogue: true,
      promoCredits: 100,
      ecommerceSite: true,
      externalMerchantExtension: true,
      seoVendoo: false,
      seoGoogle: false,
      siteBuilder: false,
      chatbotAI: false,
      chatbotTokens: 0,
      whatsappIntegration: false,
      analytics: false,
      boutiqueAdvisor: false,
      domainName: false,
      professionalEmail: false,
      messages: false,
      salesReception: true,
      maxProducts: 100,
    },
    description: 'Solution complète pour e-commerce',
    popular: true,
  },
  {
    id: 'tracker',
    name: 'Tracker',
    price: 45,
    currency: 'USD',
    period: 'month',
    features: {
      boutiqueInQuartier: true,
      catalogue: true,
      promoCredits: 200,
      ecommerceSite: true,
      externalMerchantExtension: true,
      seoVendoo: true,
      seoGoogle: true,
      siteBuilder: true,
      chatbotAI: false,
      chatbotTokens: 0,
      whatsappIntegration: false,
      analytics: true,
      boutiqueAdvisor: false,
      domainName: false,
      professionalEmail: false,
      messages: false,
      salesReception: true,
      maxProducts: 500,
    },
    description: 'Pour les boutiques qui veulent maximiser leur visibilité',
  },
  {
    id: 'golden',
    name: 'Golden',
    price: 100,
    currency: 'USD',
    period: 'month',
    features: {
      boutiqueInQuartier: true,
      catalogue: true,
      promoCredits: 200,
      ecommerceSite: true,
      externalMerchantExtension: true,
      seoVendoo: true,
      seoGoogle: true,
      siteBuilder: true,
      chatbotAI: true,
      chatbotTokens: 200,
      whatsappIntegration: true,
      analytics: true,
      boutiqueAdvisor: true,
      domainName: true,
      professionalEmail: true,
      messages: true,
      salesReception: true,
      maxProducts: 1000,
    },
    description: 'La solution ultime pour les entreprises ambitieuses',
    popular: true,
  },
];

export const getPackPlanById = (id: string): PackPlan | undefined => {
  return PACK_PLANS.find(p => p.id === id);
};

export const getPackPlanPricePerYear = (plan: PackPlan): number => {
  return plan.price * 12;
};
