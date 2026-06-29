import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';
import { useCurrency } from '../contexts/CurrencyContext';
import { Currency } from '../services/currencyService';
import { T } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CurrencySelector: React.FC = () => {
  const { currency, setCurrency, availableCurrencies } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<View>(null);

  const currentCurrency = availableCurrencies[currency];

  const handleCurrencySelect = (currencyCode: Currency) => {
    setCurrency(currencyCode);
    setIsOpen(false);
  };

  return (
    <View style={s.container}>
      <TouchableOpacity
        style={s.selectorButton}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={s.flag}>{currentCurrency.flag}</Text>
        <Text style={s.currencySymbol}>{currentCurrency.symbol}</Text>
        <Text style={s.currencyCode}>{currency}</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={s.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Sélectionner la devise</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)} style={s.closeButton}>
                <Text style={s.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={s.currencyList} showsVerticalScrollIndicator={false}>
              {Object.entries(availableCurrencies).map(([code, info]) => (
                <TouchableOpacity
                  key={code}
                  style={[s.currencyItem, currency === code && s.currencyItemActive]}
                  onPress={() => handleCurrencySelect(code as Currency)}
                  activeOpacity={0.7}
                >
                  <Text style={s.currencyFlag}>{info.flag}</Text>
                  <View style={s.currencyInfo}>
                    <Text style={[s.currencyName, currency === code && s.currencyNameActive]}>
                      {info.name}
                    </Text>
                    <Text style={s.currencySymbolText}>{info.symbol}</Text>
                  </View>
                  {currency === code && (
                    <Text style={s.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.surface,
    borderWidth: 1.5,
    borderColor: T.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  flag: {
    fontSize: 20,
  },
  currencySymbol: {
    fontSize: 15,
    fontWeight: '700',
    color: T.text,
  },
  currencyCode: {
    fontSize: 13,
    fontWeight: '700',
    color: T.textSub,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: T.surface,
    borderRadius: 16,
    width: Math.min(SCREEN_WIDTH - 40, 400),
    maxHeight: SCREEN_WIDTH > 600 ? 500 : 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: T.text,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: T.textSub,
  },
  currencyList: {
    maxHeight: 350,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: T.divider,
  },
  currencyItemActive: {
    backgroundColor: T.orangeSoft,
  },
  currencyFlag: {
    fontSize: 24,
    marginRight: 16,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyName: {
    fontSize: 15,
    fontWeight: '600',
    color: T.text,
    marginBottom: 2,
  },
  currencyNameActive: {
    color: T.orange,
  },
  currencySymbolText: {
    fontSize: 13,
    color: T.textSub,
  },
  checkmark: {
    fontSize: 20,
    color: T.orange,
    fontWeight: '700',
  },
});

export default CurrencySelector;
