import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';
import { HEADER_TEMPLATES, HeaderTemplate, getHeaderTemplateById } from '../constants/headerTemplates';
import { BODY_TEMPLATES, BodyTemplate, getBodyTemplateById } from '../constants/bodyTemplates';
import { FOOTER_TEMPLATES, FooterTemplate, getFooterTemplateById } from '../constants/footerTemplates';
import { themeService, ThemeConfig } from '../services/ThemeService';
import { getIndustryThemeById } from '../constants/industryThemes';
import { useBoutique } from '../contexts/BoutiqueContext';
import { useProducts } from '../contexts/ProductsContext';
import ThemePreviewCanvas, { PreviewDevice, PreviewProduct } from '../components/ThemePreviewCanvas';

type RootStackParamList = {
  ThemeSitePreview: { boutiqueId?: string };
  ThemeBuilderAdvanced: { templateId?: string; boutiqueId?: string };
};

type ThemeSitePreviewRouteProp = RouteProp<RootStackParamList, 'ThemeSitePreview'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const C = {
  navy: '#FF6B35',
  bg: '#F6F7F9',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  textDark: '#111827',
  textLight: '#6B7280',
  white: '#FFFFFF',
};

const Ico: React.FC<{ d: string; color?: string; size?: number }> = ({ d, color = C.textDark, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d={d} />
  </Svg>
);

const ThemeSitePreviewScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<ThemeSitePreviewRouteProp>();
  const { boutiqueData } = useBoutique();
  const { products } = useProducts();
  const boutiqueId = route.params?.boutiqueId || boutiqueData.id;

  const [loading, setLoading] = useState(true);
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [theme, setTheme] = useState<ThemeConfig | null>(null);

  const [header, setHeader] = useState<HeaderTemplate>(HEADER_TEMPLATES[0]);
  const [body, setBody] = useState<BodyTemplate>(BODY_TEMPLATES[0]);
  const [footer, setFooter] = useState<FooterTemplate>(FOOTER_TEMPLATES[0]);

  useEffect(() => {
    (async () => {
      if (!boutiqueId) { setLoading(false); return; }
      try {
        const existing = await themeService.getThemeByBoutique(boutiqueId);
        if (existing) {
          setTheme(existing);
          setHeader(getHeaderTemplateById(existing.headerTemplate || '') || HEADER_TEMPLATES[0]);
          setBody(getBodyTemplateById(existing.bodyTemplate || '') || BODY_TEMPLATES[0]);
          setFooter(getFooterTemplateById(existing.footerTemplate || '') || FOOTER_TEMPLATES[0]);
        }
      } catch (error) {
        console.error('Error loading theme preview:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [boutiqueId]);

  const previewProducts: PreviewProduct[] = products.map(p => ({
    id: p.id,
    name: p.nom,
    price: p.prixPromo ?? p.prix,
    originalPrice: p.prixPromo ? p.prix : undefined,
    emoji: p.emoji,
    imageUri: p.imageUri,
  }));

  // Only fall back to demo products on the public storefront when the
  // merchant explicitly opted in when applying the theme — otherwise
  // stock/demo photos must never reach real customers. Prefers the products
  // persisted at apply-time (works for Shoppy premium themes too), falling
  // back to the static industry theme lookup for older saved themes.
  const industryTheme = theme?.industryThemeId ? getIndustryThemeById(theme.industryThemeId) : undefined;
  const persistedDemoProducts = theme?.customizations?.demoProducts;
  const demoProducts: PreviewProduct[] | undefined = !theme?.showDemoProducts
    ? undefined
    : (persistedDemoProducts && persistedDemoProducts.length > 0)
    ? persistedDemoProducts
    : industryTheme?.demoProducts.map((d, i) => ({
        id: `${industryTheme.id}-${i}`,
        name: d.name,
        price: d.price,
        originalPrice: d.originalPrice,
        emoji: d.emoji,
        imageUri: d.image,
      }));

  const goEdit = () => navigation.navigate('ThemeBuilderAdvanced', { templateId: theme?.industryThemeId || theme?.premiumThemeId || 'custom', boutiqueId });

  return (
    <View style={s.root}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ico d="M19 12H5M12 19l-7-7 7-7" color={C.textDark} size={18} />
        </TouchableOpacity>
        <View style={s.deviceToggle}>
          <TouchableOpacity style={[s.deviceBtn, device === 'desktop' && s.deviceBtnActive]} onPress={() => setDevice('desktop')}>
            <Ico d="M4 4h16v10H4zM8 20h8M12 14v6" color={device === 'desktop' ? C.white : C.textLight} size={15} />
          </TouchableOpacity>
          <TouchableOpacity style={[s.deviceBtn, device === 'mobile' && s.deviceBtnActive]} onPress={() => setDevice('mobile')}>
            <Ico d="M8 2h8a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM11 19h2" color={device === 'mobile' ? C.white : C.textLight} size={15} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={s.editBtn} onPress={goEdit} activeOpacity={0.85}>
          <Ico d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" color={C.white} size={15} />
          <Text style={s.editBtnText}>Modifier le thème</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={C.navy} />
          <Text style={s.loadingText}>Chargement de votre boutique...</Text>
        </View>
      ) : !theme ? (
        <View style={s.loadingContainer}>
          <Text style={s.loadingText}>Aucun thème enregistré pour cette boutique.</Text>
          <TouchableOpacity style={s.editBtn} onPress={goEdit} activeOpacity={0.85}>
            <Text style={s.editBtnText}>Créer mon thème</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView style={s.canvasArea} contentContainerStyle={s.canvasAreaContent}>
            <ThemePreviewCanvas
              device={device}
              chrome={false}
              siteName={boutiqueData.nom || theme.name}
              header={header}
              body={body}
              footer={footer}
              colors={theme.colors}
              fonts={theme.fonts}
              layout={{
                productGridColumns: theme.layout.productGridColumns,
                spacing: theme.layout.spacing,
                borderRadius: theme.productCard.borderRadius,
                shadow: theme.productCard.shadow,
              }}
              products={previewProducts}
              demoProducts={demoProducts}
              heroImage={theme.customizations?.header?.backgroundImage}
              animated
              headerTitle={theme.customizations?.header?.title}
              headerSubtitle={theme.customizations?.header?.subtitle}
              footerBackground={theme.customizations?.footer?.backgroundColor}
              footerText={theme.customizations?.footer?.textColor}
              description={boutiqueData.description}
              email={boutiqueData.email}
              phone={boutiqueData.phone}
              instagram={boutiqueData.instagram}
              facebook={boutiqueData.facebook}
              city={boutiqueData.ville}
              quartier={boutiqueData.quartier}
            />
          </ScrollView>
          <TouchableOpacity style={s.fab} onPress={goEdit} activeOpacity={0.85}>
            <Ico d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" color={C.white} size={20} />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  topBar: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 10, backgroundColor: C.surface,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg },
  deviceToggle: { flexDirection: 'row', backgroundColor: C.bg, borderRadius: 10, padding: 3, gap: 2 },
  deviceBtn: { width: 34, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  deviceBtnActive: { backgroundColor: C.navy },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: C.navy, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10,
  },
  editBtnText: { color: C.white, fontWeight: '700', fontSize: 13 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { fontSize: 14, color: C.textLight },
  canvasArea: { flex: 1 },
  canvasAreaContent: { minHeight: '100%', width: '100%' },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 52, height: 52, borderRadius: 26, backgroundColor: C.navy,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.navy, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
});

export default ThemeSitePreviewScreen;
