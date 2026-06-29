import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../services/translationService';
import { T } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LanguageSelector: React.FC = () => {
  const { language, setLanguage, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<View>(null);

  const currentLanguage = availableLanguages[language];

  const handleLanguageSelect = (langCode: Language) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <View style={s.container}>
      <TouchableOpacity
        style={s.selectorButton}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={s.flag}>{currentLanguage.flag}</Text>
        <Text style={s.languageCode}>{language.toUpperCase()}</Text>
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
              <Text style={s.modalTitle}>Sélectionner la langue</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)} style={s.closeButton}>
                <Text style={s.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={s.languageList} showsVerticalScrollIndicator={false}>
              {Object.entries(availableLanguages).map(([code, info]) => (
                <TouchableOpacity
                  key={code}
                  style={[s.languageItem, language === code && s.languageItemActive]}
                  onPress={() => handleLanguageSelect(code as Language)}
                  activeOpacity={0.7}
                >
                  <Text style={s.languageFlag}>{info.flag}</Text>
                  <View style={s.languageInfo}>
                    <Text style={[s.languageName, language === code && s.languageNameActive]}>
                      {info.nativeName}
                    </Text>
                    <Text style={s.languageEnglishName}>{info.name}</Text>
                  </View>
                  {language === code && (
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
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  flag: {
    fontSize: 20,
  },
  languageCode: {
    fontSize: 14,
    fontWeight: '700',
    color: T.text,
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
  languageList: {
    maxHeight: 350,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: T.divider,
  },
  languageItemActive: {
    backgroundColor: T.orangeSoft,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 15,
    fontWeight: '600',
    color: T.text,
    marginBottom: 2,
  },
  languageNameActive: {
    color: T.orange,
  },
  languageEnglishName: {
    fontSize: 13,
    color: T.textSub,
  },
  checkmark: {
    fontSize: 20,
    color: T.orange,
    fontWeight: '700',
  },
});

export default LanguageSelector;
