/**
 * Boutique Customizer — Professional theme builder (Shopify-level branding)
 *
 * Features:
 * - Logo upload
 * - Color scheme (primary, secondary, accent)
 * - Font selection (Montserrat, Poppins, etc.)
 * - Layout preferences
 * - Live preview of storefront
 * - Pre-built themes (Professional, Modern, Cozy)
 */
import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';
import { useBoutique } from '../contexts/BoutiqueContext';

const C = {
  bg: '#F9FAFB', surface: '#FFFFFF', border: '#E5E7EB',
  accent: '#FF6B35', accentSoft: 'rgba(255,107,53,0.1)',
  text: '#111827', textMid: '#374151', textLight: '#6B7280', muted: '#9CA3AF',
  success: '#10B981', danger: '#EF4444',
};

type Nav = NativeStackNavigationProp<any>;

interface BoutiqueTheme {
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  fontFamily: 'Montserrat' | 'Poppins' | 'Quicksand' | 'Lora';
  logoUrl?: string;
  description?: string;
}

const Ico = ({ d, s = 20, c = C.text }: { d: string; s?: number; c?: string }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d={d} />
  </Svg>
);

const presetThemes = {
  professional: {
    name: 'Professionnel',
    colorPrimary: '#1E3A8A',
    colorSecondary: '#7C3AED',
    colorAccent: '#0EA5E9',
    fontFamily: 'Montserrat',
  },
  modern: {
    name: 'Moderne',
    colorPrimary: '#000000',
    colorSecondary: '#7C3AED',
    colorAccent: '#FF6B35',
    fontFamily: 'Poppins',
  },
  cozy: {
    name: 'Chaleureux',
    colorPrimary: '#D97706',
    colorSecondary: '#F59E0B',
    colorAccent: '#DC2626',
    fontFamily: 'Lora',
  },
};

const BoutiqueCustomizerScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { boutiqueData, updateBoutique } = useBoutique();

  const [theme, setTheme] = useState<BoutiqueTheme>({
    colorPrimary: boutiqueData?.couleur || '#FF6B35',
    colorSecondary: '#7C3AED',
    colorAccent: '#0EA5E9',
    fontFamily: 'Montserrat',
    logoUrl: boutiqueData?.logoUrl,
    description: boutiqueData?.description,
  });

  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleColorChange = (field: 'colorPrimary' | 'colorSecondary' | 'colorAccent', value: string) => {
    setTheme({ ...theme, [field]: value });
  };

  const handleFontChange = (font: 'Montserrat' | 'Poppins' | 'Quicksand' | 'Lora') => {
    setTheme({ ...theme, fontFamily: font });
  };

  const handleApplyPreset = (preset: keyof typeof presetThemes) => {
    const presetTheme = presetThemes[preset];
    setTheme({
      colorPrimary: presetTheme.colorPrimary,
      colorSecondary: presetTheme.colorSecondary,
      colorAccent: presetTheme.colorAccent,
      fontFamily: presetTheme.fontFamily,
      logoUrl: theme.logoUrl,
      description: theme.description,
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Save to Firestore
      await updateBoutique({
        couleur: theme.colorPrimary,
        description: theme.description,
      });
      Alert.alert('Succès', 'Thème sauvegardé!');
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de sauvegarder le thème');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = () => {
    // TODO: Integrate with ImageKit or file upload service
    Alert.alert('Logo', 'Fonctionnalité upload coming soon');
  };

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ico d="M19 12H5M12 19l-7-7 7-7" s={20} c={C.text} />
        </TouchableOpacity>
        <Text style={s.title}>Customisation boutique</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <Text style={[s.saveBtn, loading && s.saveBtnDisabled]}>{loading ? 'Envoi...' : 'Sauvegarder'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Logo section */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Logo</Text>
          <TouchableOpacity style={s.logoBox} onPress={handleLogoUpload}>
            {theme.logoUrl ? (
              <Text style={s.logoText}>Logo uploadé</Text>
            ) : (
              <>
                <Ico d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" s={32} c={C.muted} />
                <Text style={s.logoPlaceholder}>Cliquez pour ajouter un logo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Preset themes */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Thèmes prédéfinis</Text>
          <View style={s.presetsGrid}>
            {Object.entries(presetThemes).map(([key, preset]) => (
              <TouchableOpacity
                key={key}
                style={[s.presetCard, theme.colorPrimary === preset.colorPrimary && s.presetCardActive]}
                onPress={() => handleApplyPreset(key as keyof typeof presetThemes)}
              >
                <View style={[s.presetPreview, { backgroundColor: preset.colorPrimary }]} />
                <Text style={s.presetName}>{preset.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Colors */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Couleurs personnalisées</Text>

          <View style={s.colorRow}>
            <Text style={s.colorLabel}>Couleur primaire</Text>
            <View style={s.colorInputWrapper}>
              <View style={[s.colorPreview, { backgroundColor: theme.colorPrimary }]} />
              <TextInput
                style={s.colorInput}
                placeholder="#FF6B35"
                value={theme.colorPrimary}
                onChangeText={(value) => handleColorChange('colorPrimary', value)}
                placeholderTextColor={C.muted}
              />
            </View>
          </View>

          <View style={s.colorRow}>
            <Text style={s.colorLabel}>Couleur secondaire</Text>
            <View style={s.colorInputWrapper}>
              <View style={[s.colorPreview, { backgroundColor: theme.colorSecondary }]} />
              <TextInput
                style={s.colorInput}
                placeholder="#7C3AED"
                value={theme.colorSecondary}
                onChangeText={(value) => handleColorChange('colorSecondary', value)}
                placeholderTextColor={C.muted}
              />
            </View>
          </View>

          <View style={s.colorRow}>
            <Text style={s.colorLabel}>Couleur d'accent</Text>
            <View style={s.colorInputWrapper}>
              <View style={[s.colorPreview, { backgroundColor: theme.colorAccent }]} />
              <TextInput
                style={s.colorInput}
                placeholder="#0EA5E9"
                value={theme.colorAccent}
                onChangeText={(value) => handleColorChange('colorAccent', value)}
                placeholderTextColor={C.muted}
              />
            </View>
          </View>
        </View>

        {/* Fonts */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Police de caractères</Text>
          <View style={s.fontGrid}>
            {(['Montserrat', 'Poppins', 'Quicksand', 'Lora'] as const).map(font => (
              <TouchableOpacity
                key={font}
                style={[s.fontCard, theme.fontFamily === font && s.fontCardActive]}
                onPress={() => handleFontChange(font)}
              >
                <Text style={[s.fontPreview, { fontFamily: font }]}>{font}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Description de la boutique</Text>
          <TextInput
            style={[s.input, s.inputMulti]}
            placeholder="Décrivez votre boutique..."
            value={theme.description || ''}
            onChangeText={(description) => setTheme({ ...theme, description })}
            multiline
            numberOfLines={4}
            placeholderTextColor={C.muted}
          />
        </View>

        {/* Preview */}
        <TouchableOpacity style={s.previewBtn} onPress={() => setShowPreview(true)}>
          <Ico d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" s={18} c="#fff" />
          <Text style={s.previewBtnText}>Aperçu boutique</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Preview modal */}
      <Modal visible={showPreview} animationType="slide" onRequestClose={() => setShowPreview(false)}>
        <ThemePreview theme={theme} onClose={() => setShowPreview(false)} />
      </Modal>
    </View>
  );
};

interface ThemePreviewProps {
  theme: BoutiqueTheme;
  onClose: () => void;
}

const ThemePreview: React.FC<ThemePreviewProps> = ({ theme, onClose }) => (
  <View style={s.previewRoot}>
    <View style={s.previewHeader}>
      <TouchableOpacity onPress={onClose}>
        <Ico d="M19 12H5M12 19l-7-7 7-7" s={20} c={C.text} />
      </TouchableOpacity>
      <Text style={s.previewTitle}>Aperçu</Text>
      <View style={{ width: 20 }} />
    </View>

    <ScrollView contentContainerStyle={s.previewContent}>
      {/* Hero banner */}
      <View style={[s.previewHero, { backgroundColor: theme.colorPrimary }]}>
        <Text style={s.previewHeroText}>Ma Boutique</Text>
        <Text style={s.previewHeroSub}>Bienvenue dans notre boutique</Text>
      </View>

      {/* Product cards preview */}
      <View style={s.previewGrid}>
        {[1, 2, 3, 4].map(i => (
          <View key={i} style={s.previewCard}>
            <View style={[s.previewCardImage, { backgroundColor: theme.colorSecondary }]} />
            <Text style={s.previewCardName}>Produit {i}</Text>
            <View style={[s.previewCardPrice, { backgroundColor: theme.colorAccent }]} />
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={[s.previewFooter, { backgroundColor: theme.colorPrimary }]}>
        <Text style={s.previewFooterText}>© 2026 Ma Boutique</Text>
      </View>
    </ScrollView>
  </View>
);

const s = StyleSheet.create<any>({
  root: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  title: { fontSize: 16, fontWeight: '700', color: C.text },
  saveBtn: { fontSize: 13, color: C.accent, fontWeight: '600' },
  saveBtnDisabled: { color: C.muted },
  content: { paddingHorizontal: 16, paddingVertical: 16 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 12 },
  logoBox: { backgroundColor: C.surface, borderRadius: 12, borderWidth: 2, borderColor: C.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 8 },
  logoText: { fontSize: 13, color: C.text, fontWeight: '600' },
  logoPlaceholder: { fontSize: 12, color: C.muted },
  presetsGrid: { flexDirection: 'row', gap: 12 },
  presetCard: { flex: 1, backgroundColor: C.surface, borderRadius: 8, borderWidth: 2, borderColor: C.border, overflow: 'hidden' },
  presetCardActive: { borderColor: C.accent, borderWidth: 3 },
  presetPreview: { height: 60, width: '100%' },
  presetName: { fontSize: 11, fontWeight: '600', color: C.text, padding: 8, textAlign: 'center' },
  colorRow: { marginBottom: 16 },
  colorLabel: { fontSize: 12, fontWeight: '600', color: C.text, marginBottom: 8 },
  colorInputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  colorPreview: { width: 36, height: 36, borderRadius: 6, borderWidth: 1, borderColor: C.border },
  colorInput: { flex: 1, backgroundColor: C.surface, borderRadius: 6, borderWidth: 1, borderColor: C.border, paddingHorizontal: 10, paddingVertical: 8, fontSize: 12, color: C.text, fontFamily: 'monospace' },
  fontGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fontCard: { flex: 1, minWidth: 80, backgroundColor: C.surface, borderRadius: 8, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  fontCardActive: { borderColor: C.accent, borderWidth: 3 },
  fontPreview: { fontSize: 14, fontWeight: '600', color: C.text },
  input: { backgroundColor: C.surface, borderRadius: 8, borderWidth: 1, borderColor: C.border, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: C.text },
  inputMulti: { height: 100, textAlignVertical: 'top' },
  previewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.accent, borderRadius: 8, paddingVertical: 12, marginTop: 20 },
  previewBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  previewRoot: { flex: 1, backgroundColor: C.bg },
  previewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  previewTitle: { fontSize: 16, fontWeight: '700', color: C.text },
  previewContent: { paddingHorizontal: 0, paddingVertical: 0 },
  previewHero: { paddingVertical: 40, alignItems: 'center', justifyContent: 'center' },
  previewHeroText: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 4 },
  previewHeroSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  previewGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, paddingVertical: 16, gap: 8 },
  previewCard: { width: '48%', backgroundColor: C.surface, borderRadius: 8, overflow: 'hidden' },
  previewCardImage: { width: '100%', height: 100 },
  previewCardName: { fontSize: 12, fontWeight: '600', color: C.text, padding: 8 },
  previewCardPrice: { height: 20, marginHorizontal: 8, marginBottom: 8, borderRadius: 4 },
  previewFooter: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  previewFooterText: { color: '#fff', fontSize: 12 },
});

export default BoutiqueCustomizerScreen;
