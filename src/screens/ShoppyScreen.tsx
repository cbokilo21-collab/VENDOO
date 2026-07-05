import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  useWindowDimensions, ActivityIndicator, Image, Modal
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';
import { ShoppyService, PremiumTheme, ThemePurchase } from '../services/ShoppyService';
import { getHeaderTemplateById } from '../constants/headerTemplates';
import { getBodyTemplateById } from '../constants/bodyTemplates';
import { getFooterTemplateById } from '../constants/footerTemplates';
import { themeService } from '../services/ThemeService';
import { useAuth } from '../contexts/AuthContext';
import { useBoutique } from '../contexts/BoutiqueContext';
import ThemePreviewCanvas, { PreviewDevice, PreviewProduct } from '../components/ThemePreviewCanvas';

type RootStackParamList = {
  Shoppy: { boutiqueId?: string };
  ShoppyCheckout: { themeId: string };
  ThemeBuilderAdvanced: { templateId?: string; boutiqueId?: string };
};

type ShoppyRouteProp = RouteProp<RootStackParamList, 'Shoppy'>;
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
  gold: '#C6A15B',
};

const Ico: React.FC<{ d: string; color?: string; size?: number }> = ({ d, color = C.textMid, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d={d} />
  </Svg>
);

const fmtFCFA = (n: number) => `${n.toLocaleString('fr-FR')} F`;

const toPreviewProducts = (theme: PremiumTheme): PreviewProduct[] =>
  theme.demoProducts.map((d, i) => ({
    id: `${theme.id}-${i}`,
    name: d.name,
    price: d.price,
    originalPrice: d.originalPrice,
    emoji: d.emoji,
    imageUri: d.image,
  }));

const ShoppyScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<ShoppyRouteProp>();
  const { user } = useAuth();
  const { boutiqueData } = useBoutique();
  const { width } = useWindowDimensions();

  const [loading, setLoading] = useState(true);
  const [themes, setThemes] = useState<PremiumTheme[]>([]);
  const [purchases, setPurchases] = useState<ThemePurchase[]>([]);
  const [previewTheme, setPreviewTheme] = useState<PremiumTheme | null>(null);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [chooseTheme, setChooseTheme] = useState<PremiumTheme | null>(null);
  const [applying, setApplying] = useState(false);

  const boutiqueId = route.params?.boutiqueId || boutiqueData.id || user?.uid;
  const purchasedIds = new Set(purchases.map(p => p.themeId));

  const cols = width >= 1100 ? 3 : width >= 720 ? 2 : 1;
  const cardWidth = cols === 1 ? '100%' : `${100 / cols - 2}%`;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [activeThemes, userPurchases] = await Promise.all([
          ShoppyService.getActiveThemes(),
          user ? ShoppyService.getPurchasesByUser(user.uid) : Promise.resolve([]),
        ]);
        setThemes(activeThemes);
        setPurchases(userPurchases);
      } catch (error) {
        console.error('Error loading Shoppy catalog:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [boutiqueId, user?.uid]);

  const handleApply = async (theme: PremiumTheme, showDemoProducts: boolean) => {
    if (!boutiqueId) return;
    setApplying(true);
    try {
      await themeService.applyPremiumTheme(boutiqueId, theme, showDemoProducts);
      setChooseTheme(null);
      setPreviewTheme(null);
      navigation.navigate('ThemeBuilderAdvanced', { templateId: theme.id, boutiqueId });
    } catch (error) {
      console.error('Error applying premium theme:', error);
      alert("Erreur lors de l'application du thème");
    } finally {
      setApplying(false);
    }
  };

  const ThemeCard = ({ theme }: { theme: PremiumTheme }) => {
    const owned = purchasedIds.has(theme.id!);
    return (
      <View style={[s.card, { width: cardWidth as any }]}>
        <View style={s.cardBanner}>
          <Image source={{ uri: theme.hero.image }} style={s.cardBannerImg} resizeMode="cover" />
          <View style={[s.cardBannerOverlay, { backgroundColor: theme.colors.secondary + 'B0' }]} />
          <View style={s.premiumBadge}>
            <Ico d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" color={C.gold} size={12} />
            <Text style={s.premiumBadgeText}>Premium</Text>
          </View>
          {owned && (
            <View style={s.ownedBadge}>
              <Text style={s.ownedBadgeText}>✓ Acheté</Text>
            </View>
          )}
          <View style={s.cardBannerContent}>
            <View style={[s.industryChip, { backgroundColor: theme.colors.primary }]}>
              <Text style={s.industryChipText}>{theme.emoji}  {theme.industry}</Text>
            </View>
            <Text style={[s.cardTitle, { fontFamily: theme.fonts.heading }]} numberOfLines={1}>{theme.name}</Text>
            <Text style={s.cardTagline} numberOfLines={1}>{theme.tagline}</Text>
          </View>
        </View>

        <View style={s.cardBody}>
          <View style={s.paletteRow}>
            {[theme.colors.primary, theme.colors.secondary, theme.colors.accent, theme.colors.background].map((c, i) => (
              <View key={i} style={[s.paletteDot, { backgroundColor: c }]} />
            ))}
            <Text style={s.priceTag}>{fmtFCFA(theme.priceFCFA)}</Text>
          </View>

          <View style={s.thumbRow}>
            {theme.demoProducts.slice(0, 3).map((p, i) => (
              <View key={i} style={s.thumb}>
                <Image source={{ uri: p.image }} style={s.thumbImg} resizeMode="cover" />
              </View>
            ))}
          </View>

          <Text style={s.cardDesc} numberOfLines={2}>{theme.description}</Text>

          <View style={s.cardActions}>
            <TouchableOpacity style={s.previewBtn} onPress={() => { setPreviewTheme(theme); setPreviewDevice('desktop'); }} activeOpacity={0.85}>
              <Ico d="M1 12s4-8 11-8 11 8 11 8 11 8-4 8-11 8-11-8-11-8z" color={C.textDark} size={15} />
              <Text style={s.previewBtnText}>Aperçu</Text>
            </TouchableOpacity>
            {owned ? (
              <TouchableOpacity style={[s.useBtn, { backgroundColor: theme.colors.primary }]} onPress={() => setChooseTheme(theme)} activeOpacity={0.85}>
                <Text style={s.useBtnText}>Utiliser ce thème</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[s.useBtn, { backgroundColor: C.gold }]}
                onPress={() => navigation.navigate('ShoppyCheckout', { themeId: theme.id! })}
                activeOpacity={0.85}
              >
                <Text style={s.useBtnText}>Acheter — {fmtFCFA(theme.priceFCFA)}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ico d="M19 12H5M12 19l-7-7 7-7" color={C.navy} size={18} />
        </TouchableOpacity>
        <View style={s.headerContent}>
          <View style={s.headerTitleRow}>
            <Text style={s.headerTitle}>Shoppy</Text>
            <View style={s.headerBadge}><Text style={s.headerBadgeText}>Thèmes premium</Text></View>
          </View>
          <Text style={s.headerSubtitle}>Des designs exclusifs signés Vendoo pour sublimer votre boutique</Text>
        </View>
      </View>

      {loading ? (
        <View style={s.loadingContainer}><ActivityIndicator size="large" color={C.navy} /></View>
      ) : themes.length === 0 ? (
        <View style={s.loadingContainer}>
          <Text style={s.emptyIcon}>🛍️</Text>
          <Text style={s.emptyText}>Aucun thème premium disponible pour le moment.</Text>
        </View>
      ) : (
        <ScrollView style={s.content} contentContainerStyle={s.contentContainer}>
          <View style={s.grid}>
            {themes.map(theme => <ThemeCard key={theme.id} theme={theme} />)}
          </View>
        </ScrollView>
      )}

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
                <Text style={s.modalIndustry}>{previewTheme.emoji} {previewTheme.industry} · {fmtFCFA(previewTheme.priceFCFA)}</Text>
              </View>
              <View style={s.deviceToggle}>
                <TouchableOpacity style={[s.deviceBtn, previewDevice === 'desktop' && s.deviceBtnActive]} onPress={() => setPreviewDevice('desktop')}>
                  <Ico d="M4 4h16v10H4zM8 20h8M12 14v6" color={previewDevice === 'desktop' ? C.white : C.textLight} size={15} />
                </TouchableOpacity>
                <TouchableOpacity style={[s.deviceBtn, previewDevice === 'mobile' && s.deviceBtnActive]} onPress={() => setPreviewDevice('mobile')}>
                  <Ico d="M8 2h8a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM11 19h2" color={previewDevice === 'mobile' ? C.white : C.textLight} size={15} />
                </TouchableOpacity>
              </View>
              {purchasedIds.has(previewTheme.id!) ? (
                <TouchableOpacity style={[s.modalUseBtn, { backgroundColor: previewTheme.colors.primary }]} onPress={() => setChooseTheme(previewTheme)}>
                  <Text style={s.modalUseBtnText}>Utiliser</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[s.modalUseBtn, { backgroundColor: C.gold }]}
                  onPress={() => { setPreviewTheme(null); navigation.navigate('ShoppyCheckout', { themeId: previewTheme.id! }); }}
                >
                  <Text style={s.modalUseBtnText}>Acheter</Text>
                </TouchableOpacity>
              )}
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

      {/* With products / without products choice, shown right before applying an owned theme */}
      <Modal visible={!!chooseTheme} animationType="fade" transparent onRequestClose={() => setChooseTheme(null)}>
        {chooseTheme && (
          <View style={s.choiceBackdrop}>
            <View style={s.choiceCard}>
              <Text style={s.choiceTitle}>Comment appliquer « {chooseTheme.name} » ?</Text>
              <Text style={s.choiceSubtitle}>Vos vrais produits seront toujours affichés en priorité. Ce choix ne compte que pour les emplacements vides.</Text>

              <TouchableOpacity
                style={[s.choiceOption, { borderColor: chooseTheme.colors.primary }]}
                onPress={() => handleApply(chooseTheme, true)}
                disabled={applying}
                activeOpacity={0.85}
              >
                <View style={[s.choiceIconWrap, { backgroundColor: chooseTheme.colors.primary + '18' }]}>
                  <Ico d="M4 4h16v16H4zM4 15l4-4a2 2 0 0 1 3 0l5 5M14 13l1.5-1.5a2 2 0 0 1 3 0L21 14" color={chooseTheme.colors.primary} size={18} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.choiceOptionTitle}>Avec produits de démonstration</Text>
                  <Text style={s.choiceOptionDesc}>Le site montre tout de suite des exemples du secteur, en attendant que vous ajoutiez vos produits.</Text>
                </View>
                {applying ? <ActivityIndicator size="small" color={chooseTheme.colors.primary} /> : null}
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.choiceOption, { borderColor: C.border }]}
                onPress={() => handleApply(chooseTheme, false)}
                disabled={applying}
                activeOpacity={0.85}
              >
                <View style={[s.choiceIconWrap, { backgroundColor: C.bg }]}>
                  <Ico d="M3 3h18v18H3z" color={C.textMid} size={18} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.choiceOptionTitle}>Sans produits (page vierge)</Text>
                  <Text style={s.choiceOptionDesc}>Seuls vos vrais produits apparaîtront.</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setChooseTheme(null)} style={s.choiceCancel} disabled={applying}>
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
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: C.textDark },
  headerBadge: { backgroundColor: C.gold + '20', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  headerBadgeText: { fontSize: 11, fontWeight: '800', color: C.gold },
  headerSubtitle: { fontSize: 14, color: C.textLight },
  content: { flex: 1 },
  contentContainer: { padding: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 14, color: C.textLight },

  card: { backgroundColor: C.surface, borderRadius: 18, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  cardBanner: { height: 140, position: 'relative', justifyContent: 'flex-end' },
  cardBannerImg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  cardBannerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  premiumBadge: { position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  premiumBadgeText: { color: C.gold, fontSize: 10, fontWeight: '800' },
  ownedBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: '#10B981', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  ownedBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  cardBannerContent: { padding: 14 },
  industryChip: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginBottom: 8 },
  industryChipText: { color: C.white, fontSize: 11, fontWeight: '800' },
  cardTitle: { color: C.white, fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  cardTagline: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 2 },

  cardBody: { padding: 14 },
  paletteRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  paletteDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: C.border },
  priceTag: { marginLeft: 'auto', fontSize: 14, fontWeight: '800', color: C.gold },
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

export default ShoppyScreen;
