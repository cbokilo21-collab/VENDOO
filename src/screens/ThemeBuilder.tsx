import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  Dimensions, ActivityIndicator, Alert
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { THEME_TEMPLATES, ThemeTemplate } from '../constants/themeTemplates';
import { themeService, ThemeConfig } from '../services/ThemeService';
import { THEME_ELEMENTS, getElementsByCategory } from '../data/themeElements';
import { useAuth } from '../contexts/AuthContext';
import { useBoutique } from '../contexts/BoutiqueContext';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

const { width: SCREEN_WIDTH } = typeof window !== 'undefined' ? { width: window.innerWidth } : { width: 375 };

type RootStackParamList = {
  ThemeBuilder: { templateId?: string; boutiqueId?: string };
  ThemeElementDetail: { elementId?: string };
  ThemeSelection: undefined;
  BusinessDashboard: undefined;
};

type ThemeBuilderRouteProp = RouteProp<RootStackParamList, 'ThemeBuilder'>;
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

const ThemeBuilder: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<ThemeBuilderRouteProp>();
  const { user } = useAuth();
  const { boutiqueData } = useBoutique();
  const { templateId, boutiqueId: routeBoutiqueId } = route.params || {};
  
  if (!templateId || !routeBoutiqueId) {
    return (
      <View style={s.root}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Paramètres manquants</Text>
        </View>
        <View style={s.errorContainer}>
          <Text style={s.errorText}>Template ID ou Boutique ID non fourni</Text>
        </View>
      </View>
    );
  }
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState<ThemeConfig | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const boutiqueId = routeBoutiqueId || boutiqueData.id || user?.uid;

  useEffect(() => {
    loadTheme();
  }, [boutiqueId]);

  const loadTheme = async () => {
    if (!boutiqueId) return;
    
    setLoading(true);
    try {
      const existingTheme = await themeService.getThemeByBoutique(boutiqueId);
      if (existingTheme) {
        setTheme(existingTheme);
      } else {
        const template = THEME_TEMPLATES.find(t => t.id === templateId);
        if (template) {
          setTheme({
            ...template,
            boutiqueId,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!theme || !boutiqueId) return;
    
    setSaving(true);
    try {
      // If theme doesn't have an ID (new theme), create it first
      if (!theme.id) {
        const themeId = await themeService.createTheme(boutiqueId, templateId);
        const updatedTheme = { ...theme, id: themeId };
        setTheme(updatedTheme);
        Alert.alert('Succès', 'Thème créé avec succès');
      } else {
        await themeService.updateTheme(theme.id, theme);
        Alert.alert('Succès', 'Thème enregistré avec succès');
      }
    } catch (error) {
      console.error('Error saving theme:', error);
      Alert.alert('Erreur', 'Impossible d\'enregistrer le thème');
    } finally {
      setSaving(false);
    }
  };

  const handleElementPress = (elementId: string) => {
    navigation.navigate('ThemeElementDetail', { elementId });
  };

  const categories = ['all', ...new Set(THEME_ELEMENTS.map(e => e.category))];

  const filteredElements = selectedCategory === 'all' 
    ? THEME_ELEMENTS 
    : getElementsByCategory(selectedCategory);

  if (loading) {
    return (
      <View style={s.root}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Constructeur de Thème</Text>
        </View>
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={C.navy} />
          <Text style={s.loadingText}>Chargement du thème...</Text>
        </View>
      </View>
    );
  }

  if (!theme) {
    return (
      <View style={s.root}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Constructeur de Thème</Text>
        </View>
        <View style={s.errorContainer}>
          <Text style={s.errorText}>Thème non trouvé</Text>
          <TouchableOpacity 
            style={s.retryBtn} 
            onPress={() => navigation.navigate('ThemeSelection')}
          >
            <Text style={s.retryBtnText}>Choisir un thème</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.navy} strokeWidth={2.5}>
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </TouchableOpacity>
        <View style={s.headerContent}>
          <Text style={s.headerTitle}>Constructeur de Thème</Text>
          <Text style={s.headerSubtitle}>{theme.name}</Text>
          <View style={s.headerStats}>
            <View style={s.statBadge}>
              <Text style={s.statLabel}>Éléments</Text>
              <Text style={s.statValue}>{THEME_ELEMENTS.length}</Text>
            </View>
            <View style={[s.statBadge, s.statBadgeCat]}>
              <Text style={s.statLabel}>Catégories</Text>
              <Text style={s.statValue}>{categories.length}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity 
          style={s.saveBtn} 
          onPress={handleSave} 
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={C.white} />
          ) : (
            <Text style={s.saveBtnText}>Enregistrer</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={s.content}>
        {/* Theme Preview */}
        <View style={s.previewSection}>
          <Text style={s.sectionTitle}>Aperçu du thème</Text>
          <View style={[s.previewCard, { backgroundColor: theme.colors.background }]}>
            <View style={[s.previewHeader, { backgroundColor: theme.colors.primary }]}>
              <Text style={[s.previewHeaderText, { color: theme.colors.text }]}>
                {theme.name}
              </Text>
            </View>
            <View style={s.previewBody}>
              <View style={s.previewColorRow}>
                <View style={[s.previewColorBox, { backgroundColor: theme.colors.primary }]} />
                <View style={[s.previewColorBox, { backgroundColor: theme.colors.secondary }]} />
                <View style={[s.previewColorBox, { backgroundColor: theme.colors.accent }]} />
              </View>
              <Text style={[s.previewText, { color: theme.colors.text }]}>
                Exemple de texte
              </Text>
            </View>
          </View>
        </View>

        {/* Category Filter */}
        <View style={s.categorySection}>
          <Text style={s.sectionTitle}>Catégories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.categoryScroll}>
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  s.categoryChip,
                  selectedCategory === category && s.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  s.categoryChipText,
                  selectedCategory === category && s.categoryChipTextActive,
                ]}>
                  {category === 'all' ? 'Tous' : category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Theme Elements */}
        <View style={s.elementsSection}>
          <Text style={s.sectionTitle}>Éléments personnalisables</Text>
          {filteredElements.map(element => (
            <TouchableOpacity
              key={element.id}
              style={s.elementCard}
              onPress={() => handleElementPress(element.id)}
              activeOpacity={0.8}
            >
              <View style={s.elementIcon}>
                <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={C.navy} strokeWidth={2}>
                  <Path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </View>
              <View style={s.elementContent}>
                <Text style={s.elementName}>{element.name}</Text>
                <Text style={s.elementDescription}>{element.description}</Text>
                <View style={s.elementMeta}>
                  <Text style={s.elementCategory}>{element.category}</Text>
                </View>
              </View>
              <View style={s.elementArrow}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.textLight} strokeWidth={2}>
                  <Path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Theme Info */}
        <View style={s.infoSection}>
          <Text style={s.sectionTitle}>Informations du thème</Text>
          <View style={s.infoCard}>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Police d'en-tête:</Text>
              <Text style={s.infoValue}>{theme.fonts.heading}</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Police de corps:</Text>
              <Text style={s.infoValue}>{theme.fonts.body}</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Colonnes grille:</Text>
              <Text style={s.infoValue}>{theme.layout.productGridColumns}</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Espacement:</Text>
              <Text style={s.infoValue}>{theme.layout.spacing}px</Text>
            </View>
          </View>
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
    fontSize: 26,
    fontWeight: '800',
    color: C.textDark,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: C.textLight,
  },
  headerStats: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.navy + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.navy + '30',
  },
  statBadgeCat: {
    backgroundColor: '#8B5CF6' + '15',
    borderColor: '#8B5CF6' + '30',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.textMid,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '800',
    color: C.textDark,
  },
  saveBtn: {
    backgroundColor: C.navy,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    minWidth: 110,
    alignItems: 'center',
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  saveBtnText: {
    color: C.white,
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: C.textMid,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: C.textMid,
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: C.navy,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryBtnText: {
    color: C.white,
    fontSize: 14,
    fontWeight: '700',
  },
  previewSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 16,
  },
  previewCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
  },
  previewHeader: {
    padding: 16,
    alignItems: 'center',
  },
  previewHeaderText: {
    fontSize: 18,
    fontWeight: '700',
  },
  previewBody: {
    padding: 20,
  },
  previewColorRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  previewColorBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  previewText: {
    fontSize: 16,
  },
  categorySection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: C.navy,
    borderColor: C.navy,
  },
  categoryChipText: {
    fontSize: 14,
    color: C.textMid,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: C.white,
  },
  elementsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  elementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  elementIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  elementContent: {
    flex: 1,
  },
  elementName: {
    fontSize: 16,
    fontWeight: '600',
    color: C.textDark,
    marginBottom: 4,
  },
  elementDescription: {
    fontSize: 14,
    color: C.textLight,
    marginBottom: 4,
  },
  elementMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  elementCategory: {
    fontSize: 11,
    fontWeight: '600',
    color: C.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  elementArrow: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  infoCard: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  infoLabel: {
    fontSize: 14,
    color: C.textMid,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textDark,
  },
});

export default ThemeBuilder;
