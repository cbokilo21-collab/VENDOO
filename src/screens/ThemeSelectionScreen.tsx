import React, { useState } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  Dimensions, ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { THEME_TEMPLATES, ThemeTemplate } from '../constants/themeTemplates';
import { themeService } from '../services/ThemeService';
import { useAuth } from '../contexts/AuthContext';
import { useBoutique } from '../contexts/BoutiqueContext';

const { width: SCREEN_WIDTH } = typeof window !== 'undefined' ? { width: window.innerWidth } : { width: 375 };

type RootStackParamList = {
  ThemeSelection: { boutiqueId?: string };
  ThemeBuilder: { templateId: string; boutiqueId: string };
  ThemeBuilderAdvanced: { templateId?: string; boutiqueId?: string };
  BusinessDashboard: undefined;
};

type ThemeSelectionRouteProp = RouteProp<RootStackParamList, 'ThemeSelection'>;
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

const ThemeSelectionScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<ThemeSelectionRouteProp>();
  const { user } = useAuth();
  const { boutiqueData } = useBoutique();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  console.log('ThemeSelectionScreen mounted', { user, boutiqueData, routeParams: route.params });

  const boutiqueId = route.params?.boutiqueId || boutiqueData.id || user?.uid;

  const handleSelectTemplate = async (template: ThemeTemplate) => {
    if (!boutiqueId) {
      alert('Veuillez d\'abord créer une boutique');
      return;
    }

    setLoading(true);
    try {
      await themeService.createTheme(boutiqueId, template.id);
      navigation.navigate('ThemeBuilderAdvanced', { templateId: template.id, boutiqueId });
    } catch (error) {
      console.error('Error creating theme:', error);
      alert('Erreur lors de la création du thème');
    } finally {
      setLoading(false);
    }
  };

  const TemplateCard = ({ template }: { template: ThemeTemplate }) => (
    <TouchableOpacity
      style={[
        s.templateCard,
        selectedTemplate === template.id && s.templateCardSelected,
      ]}
      onPress={() => setSelectedTemplate(template.id)}
      activeOpacity={0.8}
    >
      <View style={s.templatePreview}>
        <Text style={s.templateEmoji}>{template.preview}</Text>
        <View style={[s.colorDot, { backgroundColor: template.colors.primary }]} />
        <View style={[s.colorDot, { backgroundColor: template.colors.secondary }]} />
        <View style={[s.colorDot, { backgroundColor: template.colors.accent }]} />
      </View>
      <Text style={s.templateName}>{template.name}</Text>
      <Text style={s.templateDescription}>{template.description}</Text>
      {selectedTemplate === template.id && (
        <TouchableOpacity
          style={s.useTemplateBtn}
          onPress={() => handleSelectTemplate(template)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={C.white} />
          ) : (
            <Text style={s.useTemplateBtnText}>Utiliser ce thème</Text>
          )}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={s.headerContent}>
          <Text style={s.headerTitle}>Choisir un thème</Text>
          <Text style={s.headerSubtitle}>Sélectionnez un design pour votre boutique</Text>
        </View>
      </View>

      <ScrollView style={s.content} contentContainerStyle={s.contentContainer}>
        <View style={s.grid}>
          {THEME_TEMPLATES.map(template => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  templateCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: C.border,
    marginBottom: 8,
  },
  templateCardSelected: {
    borderColor: C.navy,
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  templatePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  templateEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 12,
    color: C.textLight,
    lineHeight: 16,
    marginBottom: 12,
  },
  useTemplateBtn: {
    backgroundColor: C.navy,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  useTemplateBtnText: {
    color: C.white,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ThemeSelectionScreen;
