import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';

const C = {
  bg: '#F8FAFC', surface: '#FFFFFF', border: '#E2E8F0',
  orange: '#F97316', orangeFade: 'rgba(249,115,22,0.08)',
  textDark: '#0F172A', textMid: '#475569', textLight: '#94A3B8', muted: '#CBD5E1',
  success: '#22C55E', warning: '#F59E0B', purple: '#8B5CF6',
};

const SEOScreen: React.FC = () => {
  const [seoData, setSeoData] = useState({
    title: 'Ma Boutique - Vêtements et Accessoires',
    description: 'Découvrez notre collection exclusive de vêtements et accessoires de mode. Qualité premium à prix abordables.',
    keywords: 'mode, vêtements, accessoires, boutique, shopping',
    ogTitle: 'Ma Boutique',
    ogDescription: 'Shoppez les dernières tendances de mode',
    ogImage: '',
    twitterCard: 'summary_large_image',
    sitemapEnabled: true,
    robotsEnabled: true,
  });

  const updateField = (field: keyof typeof seoData, value: string | boolean) => {
    setSeoData(prev => ({ ...prev, [field]: value }));
  };

  const renderField = (label: string, value: string, field: keyof typeof seoData, placeholder?: string, multiline?: boolean) => (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        style={[s.input, multiline && s.inputMultiline]}
        value={value}
        onChangeText={(text) => updateField(field, text)}
        placeholder={placeholder}
        placeholderTextColor={C.muted}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
      />
    </View>
  );

  const renderToggle = (label: string, sublabel: string, field: keyof typeof seoData, value: boolean) => (
    <View style={s.toggleRow}>
      <View style={s.toggleInfo}>
        <Text style={s.toggleLabel}>{label}</Text>
        <Text style={s.toggleSub}>{sublabel}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={(val) => updateField(field, val)}
        trackColor={{ false: '#E2E8F0', true: C.orange }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.headerTitle}>SEO</Text>
        <Text style={s.headerSub}>Optimisez votre boutique pour les moteurs de recherche</Text>
      </View>

      <ScrollView style={s.content}>
        <View style={s.card}>
          <Text style={s.cardTitle}>Métadonnées de base</Text>
          {renderField('Titre de la page', seoData.title, 'title', 'Titre affiché dans les résultats de recherche')}
          {renderField('Description', seoData.description, 'description', 'Description courte de votre boutique', true)}
          {renderField('Mots-clés', seoData.keywords, 'keywords', 'mots-clés séparés par des virgules')}
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Réseaux sociaux (Open Graph)</Text>
          {renderField('Titre OG', seoData.ogTitle, 'ogTitle', 'Titre lors du partage sur Facebook/LinkedIn')}
          {renderField('Description OG', seoData.ogDescription, 'ogDescription', 'Description lors du partage', true)}
          {renderField('Image OG', seoData.ogImage, 'ogImage', 'URL de l\'image lors du partage')}
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Twitter Card</Text>
          <View style={s.field}>
            <Text style={s.fieldLabel}>Type de carte</Text>
            <View style={s.optionsRow}>
              {['summary', 'summary_large_image', 'app'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[s.optionBtn, seoData.twitterCard === type && s.optionBtnActive]}
                  onPress={() => updateField('twitterCard', type)}
                >
                  <Text style={[s.optionBtnText, seoData.twitterCard === type && s.optionBtnTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Options techniques</Text>
          {renderToggle('Sitemap', 'Générer automatiquement le sitemap.xml', 'sitemapEnabled', seoData.sitemapEnabled)}
          {renderToggle('Robots.txt', 'Autoriser l\'indexation par les moteurs de recherche', 'robotsEnabled', seoData.robotsEnabled)}
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>📊 Score SEO</Text>
          <View style={s.scoreContainer}>
            <View style={s.scoreCircle}>
              <Text style={s.scoreValue}>78</Text>
              <Text style={s.scoreLabel}>/100</Text>
            </View>
            <View style={s.scoreDetails}>
              <View style={s.scoreItem}>
                <View style={[s.scoreDot, { backgroundColor: C.success }]} />
                <Text style={s.scoreItemText}>Titre optimisé</Text>
              </View>
              <View style={s.scoreItem}>
                <View style={[s.scoreDot, { backgroundColor: C.success }]} />
                <Text style={s.scoreItemText}>Description présente</Text>
              </View>
              <View style={s.scoreItem}>
                <View style={[s.scoreDot, { backgroundColor: C.warning }]} />
                <Text style={s.scoreItemText}>Image OG manquante</Text>
              </View>
              <View style={s.scoreItem}>
                <View style={[s.scoreDot, { backgroundColor: C.success }]} />
                <Text style={s.scoreItemText}>Sitemap activé</Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={s.saveBtn}>
          <Text style={s.saveBtnText}>💾 Enregistrer les modifications</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { padding: 24, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: C.textDark, marginBottom: 4 },
  headerSub: { fontSize: 14, color: C.textLight },
  content: { flex: 1, paddingHorizontal: 16 },
  
  card: {
    backgroundColor: C.surface, borderRadius: 20, padding: 24,
    marginBottom: 20, borderWidth: 1, borderColor: C.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4,
  },
  cardTitle: { fontSize: 20, fontWeight: '800', color: C.textDark, marginBottom: 20, letterSpacing: -0.5 },
  
  field: { marginBottom: 20 },
  fieldLabel: { fontSize: 14, fontWeight: '700', color: C.textMid, marginBottom: 10, letterSpacing: -0.3 },
  input: {
    backgroundColor: C.bg, borderRadius: 12, padding: 16,
    fontSize: 15, color: C.textDark, borderWidth: 1, borderColor: C.border,
  },
  inputMultiline: { minHeight: 120, textAlignVertical: 'top' },
  
  optionsRow: { flexDirection: 'row', gap: 12 },
  optionBtn: {
    flex: 1, padding: 14, borderRadius: 10, backgroundColor: C.bg,
    borderWidth: 1, borderColor: C.border, alignItems: 'center',
  },
  optionBtnActive: { backgroundColor: C.orange, borderColor: C.orange },
  optionBtnText: { fontSize: 13, fontWeight: '700', color: C.textMid },
  optionBtnTextActive: { color: '#FFFFFF' },
  
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  toggleInfo: { flex: 1 },
  toggleLabel: { fontSize: 16, fontWeight: '700', color: C.textDark, marginBottom: 4 },
  toggleSub: { fontSize: 14, color: C.textLight },
  
  scoreContainer: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  scoreCircle: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: C.orangeFade,
    alignItems: 'center', justifyContent: 'center',
  },
  scoreValue: { fontSize: 32, fontWeight: '900', color: C.orange },
  scoreLabel: { fontSize: 13, color: C.textMid },
  scoreDetails: { flex: 1 },
  scoreItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  scoreDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  scoreItemText: { fontSize: 14, fontWeight: '600', color: C.textMid },
  
  saveBtn: {
    backgroundColor: C.orange, borderRadius: 14, padding: 18,
    alignItems: 'center', marginBottom: 32,
  },
  saveBtnText: { fontSize: 17, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.3 },
});

export default SEOScreen;
