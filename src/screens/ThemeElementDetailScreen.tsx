import React, { useState } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getThemeElement, ThemeElementOption } from '../data/themeElements';

const { width: SCREEN_WIDTH } = typeof window !== 'undefined' ? { width: window.innerWidth } : { width: 375 };

type RootStackParamList = {
  ThemeElementDetail: { elementId?: string };
  ThemeBuilder: undefined;
};

type ThemeElementDetailRouteProp = RouteProp<RootStackParamList, 'ThemeElementDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const C = {
  navy: '#FF6B35',
  bg: '#FFF7F3',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  textDark: '#111827',
  textMid: '#374151',
  textLight: '#6B7280',
  muted: '#9CA3AF',
  white: '#FFFFFF',
};

const ThemeElementDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<ThemeElementDetailRouteProp>();
  const [loading, setLoading] = useState(false);

  // Handle missing params gracefully
  const elementId = route.params?.elementId;
  
  if (!elementId) {
    return (
      <View style={s.root}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Paramètre manquant</Text>
        </View>
        <View style={s.errorContainer}>
          <Text style={s.errorText}>ID d'élément non fourni</Text>
        </View>
      </View>
    );
  }

  const element = getThemeElement(elementId);

  if (!element) {
    return (
      <View style={s.root}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Élément non trouvé</Text>
        </View>
        <View style={s.errorContainer}>
          <Text style={s.errorText}>Cet élément n'existe pas</Text>
        </View>
      </View>
    );
  }

  const handleSave = async () => {
    setLoading(true);
    // TODO: Save element configuration
    setTimeout(() => {
      setLoading(false);
      navigation.goBack();
    }, 1000);
  };

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={s.headerContent}>
          <Text style={s.headerTitle}>{element.name}</Text>
          <Text style={s.headerSubtitle}>{element.description}</Text>
        </View>
      </View>

      <ScrollView style={s.content} contentContainerStyle={s.contentContainer}>
        <View style={s.section}>
          <Text style={s.sectionTitle}>Options de personnalisation</Text>
          {element.options.map((option: ThemeElementOption, index: number) => (
            <View key={index} style={s.optionCard}>
              <Text style={s.optionLabel}>{option.label}</Text>
              <Text style={s.optionDescription}>{option.description}</Text>
              <View style={s.optionPreview}>
                <View style={[s.previewBox, { backgroundColor: option.value || '#E5E7EB' }]} />
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={C.white} />
          ) : (
            <Text style={s.saveBtnText}>Enregistrer</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  backBtnText: {
    fontSize: 20,
    color: C.navy,
    fontWeight: '700',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: C.textDark,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: C.textLight,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: C.textMid,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 16,
  },
  optionCard: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: C.textDark,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: C.textLight,
    marginBottom: 12,
  },
  optionPreview: {
    alignItems: 'center',
  },
  previewBox: {
    width: SCREEN_WIDTH - 72,
    height: 60,
    borderRadius: 8,
  },
  saveBtn: {
    backgroundColor: C.navy,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ThemeElementDetailScreen;
