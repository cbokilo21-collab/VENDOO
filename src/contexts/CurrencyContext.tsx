import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Currency, CurrencyService, CURRENCIES } from '../services/currencyService';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatAmount: (amount: number) => string;
  formatAmountWithoutSymbol: (amount: number) => string;
  convertAmount: (amount: number, toCurrency?: Currency) => number;
  availableCurrencies: typeof CURRENCIES;
  currencyInfo: ReturnType<typeof CurrencyService.getCurrencyInfo>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_STORAGE_KEY = 'vendoo_currency';

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>('XOF');

  // Charger la devise sauvegardée au démarrage
  useEffect(() => {
    loadSavedCurrency();
  }, []);

  const loadSavedCurrency = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY);
        if (savedCurrency && savedCurrency in CURRENCIES) {
          setCurrencyState(savedCurrency as Currency);
        }
      }
    } catch (error) {
      console.error('Error loading saved currency:', error);
    }
  };

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
      }
    } catch (error) {
      console.error('Error saving currency:', error);
    }
  };

  const formatAmount = (amount: number): string => {
    return CurrencyService.format(amount, currency);
  };

  const formatAmountWithoutSymbol = (amount: number): string => {
    return CurrencyService.formatWithoutSymbol(amount, currency);
  };

  const convertAmount = (amount: number, toCurrency?: Currency): number => {
    return CurrencyService.convert(amount, currency, toCurrency || currency);
  };

  const currencyInfo = CurrencyService.getCurrencyInfo(currency);

  return (
    <CurrencyContext.Provider 
      value={{ 
        currency, 
        setCurrency, 
        formatAmount, 
        formatAmountWithoutSymbol, 
        convertAmount,
        availableCurrencies: CURRENCIES,
        currencyInfo,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
