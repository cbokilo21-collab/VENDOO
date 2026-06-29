export type Currency = 
  | 'XOF'  // Franc CFA Ouest Africain
  | 'XAF'  // Franc CFA Centre Africain
  | 'USD'  // US Dollar
  | 'EUR'  // Euro
  | 'GBP'  // British Pound
  | 'JPY'  // Japanese Yen
  | 'CNY'  // Chinese Yuan
  | 'KRW'  // South Korean Won
  | 'INR'  // Indian Rupee
  | 'BRL'  // Brazilian Real
  | 'MXN'  // Mexican Peso
  | 'ZAR'  // South African Rand
  | 'NGN'  // Nigerian Naira
  | 'EGP'  // Egyptian Pound
  | 'SAR'  // Saudi Riyal
  | 'AED'  // UAE Dirham
  | 'TRY'  // Turkish Lira
  | 'RUB'  // Russian Ruble
  | 'CAD'  // Canadian Dollar
  | 'AUD'  // Australian Dollar
  | 'CHF'  // Swiss Franc;

export const CURRENCIES: Record<Currency, { name: string; symbol: string; flag: string; locale: string }> = {
  XOF: { name: 'Franc CFA (Ouest)', symbol: 'CFA', flag: '🇨🇮', locale: 'fr-CI' },
  XAF: { name: 'Franc CFA (Centre)', symbol: 'CFA', flag: '🇨🇲', locale: 'fr-CM' },
  USD: { name: 'US Dollar', symbol: '$', flag: '🇺🇸', locale: 'en-US' },
  EUR: { name: 'Euro', symbol: '€', flag: '🇪🇺', locale: 'fr-FR' },
  GBP: { name: 'British Pound', symbol: '£', flag: '🇬🇧', locale: 'en-GB' },
  JPY: { name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', locale: 'ja-JP' },
  CNY: { name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳', locale: 'zh-CN' },
  KRW: { name: 'South Korean Won', symbol: '₩', flag: '🇰🇷', locale: 'ko-KR' },
  INR: { name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', locale: 'hi-IN' },
  BRL: { name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷', locale: 'pt-BR' },
  MXN: { name: 'Mexican Peso', symbol: '$', flag: '🇲🇽', locale: 'es-MX' },
  ZAR: { name: 'South African Rand', symbol: 'R', flag: '🇿🇦', locale: 'en-ZA' },
  NGN: { name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬', locale: 'en-NG' },
  EGP: { name: 'Egyptian Pound', symbol: 'E£', flag: '🇪🇬', locale: 'ar-EG' },
  SAR: { name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦', locale: 'ar-SA' },
  AED: { name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪', locale: 'ar-AE' },
  TRY: { name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷', locale: 'tr-TR' },
  RUB: { name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺', locale: 'ru-RU' },
  CAD: { name: 'Canadian Dollar', symbol: '$', flag: '🇨🇦', locale: 'en-CA' },
  AUD: { name: 'Australian Dollar', symbol: '$', flag: '🇦🇺', locale: 'en-AU' },
  CHF: { name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭', locale: 'fr-CH' },
};

// Taux de change par rapport au XOF (base currency)
// Ces taux sont des exemples et devraient être mis à jour avec une API de taux de change réels
export const EXCHANGE_RATES: Record<Currency, number> = {
  XOF: 1,      // Base currency
  XAF: 1,      // Parité avec XOF
  USD: 0.0016, // 1 XOF = 0.0016 USD
  EUR: 0.0015, // 1 XOF = 0.0015 EUR
  GBP: 0.0013, // 1 XOF = 0.0013 GBP
  JPY: 0.24,   // 1 XOF = 0.24 JPY
  CNY: 0.012,  // 1 XOF = 0.012 CNY
  KRW: 2.1,    // 1 XOF = 2.1 KRW
  INR: 0.13,   // 1 XOF = 0.13 INR
  BRL: 0.0085, // 1 XOF = 0.0085 BRL
  MXN: 0.027,  // 1 XOF = 0.027 MXN
  ZAR: 0.03,   // 1 XOF = 0.03 ZAR
  NGN: 2.5,    // 1 XOF = 2.5 NGN
  EGP: 0.05,   // 1 XOF = 0.05 EGP
  SAR: 0.006,  // 1 XOF = 0.006 SAR
  AED: 0.006,  // 1 XOF = 0.006 AED
  TRY: 0.05,   // 1 XOF = 0.05 TRY
  RUB: 0.15,   // 1 XOF = 0.15 RUB
  CAD: 0.0022, // 1 XOF = 0.0022 CAD
  AUD: 0.0025, // 1 XOF = 0.0025 AUD
  CHF: 0.0014, // 1 XOF = 0.0014 CHF
};

export const CurrencyService = {
  /**
   * Convertir un montant d'une devise à une autre
   */
  convert(amount: number, from: Currency, to: Currency): number {
    if (from === to) return amount;
    
    // Convertir vers XOF d'abord (base currency)
    const amountInXOF = amount / EXCHANGE_RATES[from];
    // Puis convertir de XOF vers la devise cible
    return amountInXOF * EXCHANGE_RATES[to];
  },

  /**
   * Formater un montant avec le symbole de devise
   */
  format(amount: number, currency: Currency, locale?: string): string {
    const currencyInfo = CURRENCIES[currency];
    const usedLocale = locale || currencyInfo.locale;
    
    return new Intl.NumberFormat(usedLocale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  },

  /**
   * Formater un montant sans symbole de devise
   */
  formatWithoutSymbol(amount: number, currency: Currency, locale?: string): string {
    const currencyInfo = CURRENCIES[currency];
    const usedLocale = locale || currencyInfo.locale;
    
    return new Intl.NumberFormat(usedLocale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  },

  /**
   * Obtenir le symbole d'une devise
   */
  getSymbol(currency: Currency): string {
    return CURRENCIES[currency].symbol;
  },

  /**
   * Obtenir le nom d'une devise
   */
  getName(currency: Currency): string {
    return CURRENCIES[currency].name;
  },

  /**
   * Obtenir le drapeau d'une devise
   */
  getFlag(currency: Currency): string {
    return CURRENCIES[currency].flag;
  },

  /**
   * Obtenir les informations complètes d'une devise
   */
  getCurrencyInfo(currency: Currency): { name: string; symbol: string; flag: string; locale: string } {
    return CURRENCIES[currency];
  },

  /**
   * Obtenir toutes les devises disponibles
   */
  getAllCurrencies(): Record<Currency, { name: string; symbol: string; flag: string; locale: string }> {
    return CURRENCIES;
  },

  /**
   * Obtenir le taux de change entre deux devises
   */
  getExchangeRate(from: Currency, to: Currency): number {
    if (from === to) return 1;
    return EXCHANGE_RATES[to] / EXCHANGE_RATES[from];
  },

  /**
   * Mettre à jour les taux de change (à connecter avec une API externe)
   */
  async updateExchangeRates(): Promise<void> {
    // TODO: Intégrer avec une API de taux de change comme:
    // - https://api.exchangerate-api.com/v4/latest/XOF
    // - https://open.er-api.com/v6/latest/XOF
    // - https://api.frankfurter.app/latest?from=XOF
    
    try {
      // Exemple d'implémentation avec une API
      // const response = await fetch('https://api.exchangerate-api.com/v4/latest/XOF');
      // const data = await response.json();
      // Mettre à jour EXCHANGE_RATES avec les nouvelles valeurs
    } catch (error) {
      console.error('Error updating exchange rates:', error);
    }
  },
};
