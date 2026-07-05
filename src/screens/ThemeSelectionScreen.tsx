import React, { useState } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  useWindowDimensions, ActivityIndicator, Image, Modal
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';
import { INDUSTRY_THEMES, IndustryTheme } from '../constants/industryThemes';
import { getHeaderTemplateById } from '../constants/headerTemplates';
import { getBodyTemplateById } from '../constants/bodyTemplates';
import { getFooterTemplateById } from '../constants/footerTemplates';
import { themeService } from '../services/ThemeService';
import { useAuth } from '../contexts/AuthContext';
import { useBoutique } from '../contexts/BoutiqueContext';
import { useProducts } from '../contexts/ProductsContext';
import ThemePreviewCanvas, { PreviewDevice, PreviewProduct } from '../components/ThemePreviewCanvas';

type RootStackParamList = {
  ThemeSelection: { boutiqueId?: string };
  ThemeBuilderAdvanced: { templateId?: string; boutiqueId?: string };
  BusinessDashboard: undefined;
};

type ThemeSelectionRouteProp = RouteProp<RootStackParamList, 'ThemeSelection'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const C = {
  navy: '#FF6B35',
  bg: '#F6F7F9',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  textDark: '#111827',
  textMid: '#374151',
  textLight: '#6B7280',
  muted: '#9CA3AF',
  white: '#FFFFFF',
};

const Ico: React.FC<{ d: string; color?: string; size?: number }> = ({ d, color = C.textMid, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d={d} />
  </Svg>
);

const toPreviewProducts = (theme: IndustryTheme): PreviewProduct[] =>
  theme.demoProducts.map((d, i) => ({
    id: `${theme.id}-${i}`,
    name: d.name,
    price: d.price,
    originalPrice: d.originalPrice,
    emoji: d.emoji,
    imageUri: d.image,
  }));

const ThemeSelectionScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<ThemeSelectionRouteProp>();
  const { user } = useAuth();
  const { boutiqueData } = useBoutique();
  const { products } = useProducts();
  const { width } = useWindowDimensions();
  const [applying, setApplying] = useState<string | null>(null);
  const [previewTheme, setPreviewTheme] = useState<IndustryTheme | null>(null);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [chooseTheme, setChooseTheme] = useState<IndustryTheme | null>(null);

  const boutiqueId = route.params?.boutiqueId || boutiqueData.id || user?.uid;
  const hasOwnProducts = products.length > 0;

  const cols = width >= 1100 ? 3 : width >= 720 ? 2 : 1;
  const cardWidth = cols === 1 ? '100%' : `${100 / cols - 2}%`;

  const handleUse = async (theme: IndustryTheme, showDemoProducts: boolean) => {
    if (!boutiqueId) {
      alert("Veuillez d'abord créer une boutique");
      return;
    }
    setApplying(theme.id);
    try {
      await themeService.applyIndustryTheme(boutiqueId, theme, showDemoProducts);
      setPreviewTheme(null);
      setChooseTheme(null);
      navigation.navigate('ThemeBuilderAdvanced', { templateId: theme.id, boutiqueId });
    } catch (error) {
      console.error('Error applying industry theme:', error);
      alert("Erreur lors de l'application du thème");
    } finally {
      setApplying(null);
    }
  };

  const ThemeCard = ({ theme }: { theme: IndustryTheme }) => (
    <View style={[s.card, { width: cardWidth as any }]}>
      {/* Hero banner */}
      <View style={s.cardBanner}>
        <Image source={{ uri: theme.hero.image }} style={s.cardBannerImg} resizeMode="cover" />
        <View style={[s.cardBannerOverlay, { backgroundColor: theme.colors.secondary + 'B0' }]} />
        <View style={s.cardBannerContent}>
          <View style={[s.industryChip, { backgroundColor: theme.colors.primary }]}>
            <Text style={s.industryChipText}>{theme.emoji}  {theme.industry}</Text>
          </View>
          <Text style={[s.cardTitle, { fontFamily: theme.fonts.heading }]} numberOfLines={1}>{theme.name}</Text>
          <Text style={s.cardTagline} numberOfLines={1}>{theme.tagline}</Text>
        </View>
      </View>

      <View style={s.cardBody}>
        {/* Palette */}
        <View style={s.paletteRow}>
          {[theme.colors.primary, theme.colors.secondary, theme.colors.accent, theme.colors.background].map((c, i) => (
            <View key={i} style={[s.paletteDot, { backgroundColor: c }]} />
          ))}
          <Text style={s.fontLabel} numberOfLines={1}>{theme.fonts.heading}</Text>
        </View>

        {/* Product thumbnails */}
        <View style={s.thumbRow}>
          {theme.demoProducts.slice(0, 3).map((p, i) => (
            <View key={i} style={s.thumb}>
              <Image source={{ uri: p.image }} style={s.thumbImg} resizeMode="cover" />
            </View>
          ))}
        </View>

        <Text style={s.cardDesc} numberOfLines={2}>{theme.description}</Text>

        {/* Actions */}
        <View style={s.cardActions}>
          <TouchableOpacity style={s.previewBtn} onPress={() => { setPreviewTheme(theme); setPreviewDevice('desktop'); }} activeOpacity={0.85}>
            <Ico d="M1 12s4-8 11-8 11 8 11 8 11 8-4 8-11 8-11-8-11-8z" color={C.textDark} size={15} />
            <Text style={s.previewBtnText}>Aperçu</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.useBtn, { backgroundColor: theme.colors.primary }]}
            onPress={() => setChooseTheme(theme)}
            disabled={applying === theme.id}
            activeOpacity={0.85}
          >
            {applying === theme.id ? (
              <ActivityIndicator size="small" color={C.white} />
            ) : (
              <Text style={s.useBtnText}>Utiliser ce thème</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ico d="M19 12H5M12 19l-7-7 7-7" color={C.navy} size={18} />
        </TouchableOpacity>
        <View style={s.headerContent}>
          <Text style={s.headerTitle}>Choisir un thème</Text>
          <Text style={s.headerSubtitle}>6 designs sectoriels prêts à l'emploi, entièrement personnalisables</Text>
        </View>
      </View>

      <ScrollView style={s.content} contentContainerStyle={s.contentContainer}>
        <View style={s.grid}>
          {INDUSTRY_THEMES.map(theme => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </View>
      </ScrollView>

      {/* Full-screen live preview modal */}
      <Modal visible={!!previewTheme} animationType="slide" transparent={false} onRequestClose={() => setPreviewTheme(null)}>
        {previewTheme && (
          <View style={s.modalRoot}>
            <View style={s.modalBar}>
              <TouchableOpacity onPress={() => setPreviewTheme(null)} style={s.modalClose}>
                <Ico d="M18 6L6 18M6 6l12 12" color={C.textDark} size={18} />
              </TouchableOpacity>
              <View style={s.modalTitleWrap}>
                <Text style={s.modalTitle} numberOfLines={1}>{previewTheme.name}</Text>
                <Text style={s.modalIndustry}>{previewTheme.emoji} {previewTheme.industry}</Text>
              </View>
              <View style={s.deviceToggle}>
                <TouchableOpacity style={[s.deviceBtn, previewDevice === 'desktop' && s.deviceBtnActive]} onPress={() => setPreviewDevice('desktop')}>
                  <Ico d="M4 4h16v10H4zM8 20h8M12 14v6" color={previewDevice === 'desktop' ? C.white : C.textLight} size={15} />
                </TouchableOpacity>
                <TouchableOpacity style={[s.deviceBtn, previewDevice === 'mobile' && s.deviceBtnActive]} onPress={() => setPreviewDevice('mobile')}>
                  <Ico d="M8 2h8a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM11 19h2" color={previewDevice === 'mobile' ? C.white : C.textLight} size={15} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={[s.modalUseBtn, { backgroundColor: previewTheme.colors.primary }]} onPress={() => setChooseTheme(previewTheme)} disabled={!!applying}>
                <Text style={s.modalUseBtnText}>Utiliser</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={s.modalCanvasArea} contentContainerStyle={s.modalCanvasContent}>
              <ThemePreviewCanvas
                device={previewDevice}
                chrome={false}
                animated
                siteName={boutiqueData.nom || previewTheme.name}
                header={getHeaderTemplateById(previewTheme.headerTemplate)!}
                body={getBodyTemplateById(previewTheme.bodyTemplate)!}
                footer={getFooterTemplateById(previewTheme.footerTemplate)!}
                colors={previewTheme.colors}
                fonts={previewTheme.fonts}
                layout={{ ...previewTheme.layout, borderRadius: previewTheme.productCard.borderRadius, shadow: previewTheme.productCard.shadow }}
                demoProducts={toPreviewProducts(previewTheme)}
                heroImage={previewTheme.hero.image}
                headerTitle={previewTheme.hero.title}
                headerSubtitle={previewTheme.hero.subtitle}
                ctaLabel={previewTheme.hero.cta}
                footerBackground={previewTheme.footer.backgroundColor}
                footerText={previewTheme.footer.textColor}
              />
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* With products / without products choice, shown right before applying */}
      <Modal visible={!!chooseTheme} animationType="fade" transparent onRequestClose={() => setChooseTheme(null)}>
        {chooseTheme && (
          <View style={s.choiceBackdrop}>
            <View style={s.choiceCard}>
              <Text style={s.choiceTitle}>Comment appliquer « {chooseTheme.name} » ?</Text>
              <Text style={s.choiceSubtitle}>
                {hasOwnProducts
                  ? 'Vos vrais produits seront toujours affichés en priorité. Ce choix ne compte que pour les emplacements vides.'
                  : "Vous n'avez pas encore de produits dans votre boutique."}
              </Text>

              <TouchableOpacity
                style={[s.choiceOption, { borderColor: chooseTheme.colors.primary }]}
                onPress={() => handleUse(chooseTheme, true)}
                disabled={!!applying}
                activeOpacity={0.85}
              >
                <View style={[s.choiceIconWrap, { backgroundColor: chooseTheme.colors.primary + '18' }]}>
                  <Ico d="M4 4h16v16H4zM4 15l4-4a2 2 0 0 1 3 0l5 5M14 13l1.5-1.5a2 2 0 0 1 3 0L21 14" color={chooseTheme.colors.primary} size={18} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.choiceOptionTitle}>Avec produits de démonstration</Text>
                  <Text style={s.choiceOptionDesc}>Le site montre tout de suite des exemples de produits du secteur, en attendant que vous ajoutiez les vôtres.</Text>
                </View>
                {applying ? <ActivityIndicator size="small" color={chooseTheme.colors.primary} /> : null}
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.choiceOption, { borderColor: C.border }]}
                onPress={() => handleUse(chooseTheme, false)}
                disabled={!!applying}
                activeOpacity={0.85}
              >
                <View style={[s.choiceIconWrap, { backgroundColor: C.bg }]}>
                  <Ico d="M3 3h18v18H3z" color={C.textMid} size={18} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.choiceOptionTitle}>Sans produits (page vierge)</Text>
                  <Text style={s.choiceOptionDesc}>Seuls vos vrais produits apparaîtront. La page reste vide tant que vous n'avez rien ajouté.</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setChooseTheme(null)} style={s.choiceCancel} disabled={!!applying}>
                <Text style={s.choiceCancelText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: 20,
    backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  headerContent: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: C.textDark, marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: C.textLight },
  content: { flex: 1 },
  contentContainer: { padding: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },

  card: { backgroundColor: C.surface, borderRadius: 18, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  cardBanner: { height: 140, position: 'relative', justifyContent: 'flex-end' },
  cardBannerImg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  cardBannerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  cardBannerContent: { padding: 14 },
  industryChip: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginBottom: 8 },
  industryChipText: { color: C.white, fontSize: 11, fontWeight: '800' },
  cardTitle: { color: C.white, fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  cardTagline: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 2 },

  cardBody: { padding: 14 },
  paletteRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  paletteDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: C.border },
  fontLabel: { marginLeft: 'auto', fontSize: 11, color: C.textLight, fontWeight: '600' },
  thumbRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  thumb: { flex: 1, height: 64, borderRadius: 10, overflow: 'hidden', backgroundColor: C.bg },
  thumbImg: { width: '100%', height: '100%' },
  cardDesc: { fontSize: 12.5, color: C.textLight, lineHeight: 18, marginBottom: 14 },
  cardActions: { flexDirection: 'row', gap: 10 },
  previewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1.5, borderColor: C.border },
  previewBtnText: { fontSize: 13, fontWeight: '700', color: C.textDark },
  useBtn: { flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  useBtnText: { color: C.white, fontSize: 13, fontWeight: '800' },

  modalRoot: { flex: 1, backgroundColor: C.bg },
  modalBar: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.surface,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  modalClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  modalTitleWrap: { flex: 1 },
  modalTitle: { fontSize: 15, fontWeight: '800', color: C.textDark },
  modalIndustry: { fontSize: 11, color: C.textLight, marginTop: 1 },
  deviceToggle: { flexDirection: 'row', backgroundColor: C.bg, borderRadius: 10, padding: 3, gap: 2 },
  deviceBtn: { width: 34, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  deviceBtnActive: { backgroundColor: C.navy },
  modalUseBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, minWidth: 84, alignItems: 'center' },
  modalUseBtnText: { color: C.white, fontWeight: '800', fontSize: 13 },
  modalCanvasArea: { flex: 1 },
  modalCanvasContent: { minHeight: '100%' },

  choiceBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  choiceCard: { width: '100%', maxWidth: 440, backgroundColor: C.surface, borderRadius: 20, padding: 22 },
  choiceTitle: { fontSize: 17, fontWeight: '800', color: C.textDark, marginBottom: 6 },
  choiceSubtitle: { fontSize: 12.5, color: C.textLight, lineHeight: 18, marginBottom: 18 },
  choiceOption: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 2, marginBottom: 12 },
  choiceIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  choiceOptionTitle: { fontSize: 14, fontWeight: '800', color: C.textDark, marginBottom: 3 },
  choiceOptionDesc: { fontSize: 11.5, color: C.textLight, lineHeight: 16 },
  choiceCancel: { alignItems: 'center', paddingVertical: 8, marginTop: 4 },
  choiceCancelText: { fontSize: 13, fontWeight: '700', color: C.textLight },
});

export default ThemeSelectionScreen;
