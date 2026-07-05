import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, Switch, useWindowDimensions
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';
import { HEADER_TEMPLATES, HeaderTemplate, getHeaderTemplateById } from '../constants/headerTemplates';
import { BODY_TEMPLATES, BodyTemplate, getBodyTemplateById } from '../constants/bodyTemplates';
import { FOOTER_TEMPLATES, FooterTemplate, getFooterTemplateById } from '../constants/footerTemplates';
import { THEME_TEMPLATES } from '../constants/themeTemplates';
import { getIndustryThemeById } from '../constants/industryThemes';
import { themeService, ThemeConfig } from '../services/ThemeService';
import { useAuth } from '../contexts/AuthContext';
import { useBoutique } from '../contexts/BoutiqueContext';
import { useProducts } from '../contexts/ProductsContext';
import ThemePreviewCanvas, { PreviewDevice, PreviewProduct } from '../components/ThemePreviewCanvas';

type RootStackParamList = {
  ThemeBuilderAdvanced: { templateId?: string; boutiqueId?: string };
  ThemeSitePreview: { boutiqueId?: string };
  ThemeSelection: undefined;
  BusinessDashboard: undefined;
};

type ThemeBuilderAdvancedRouteProp = RouteProp<RootStackParamList, 'ThemeBuilderAdvanced'>;
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

const FONTS = ['Inter', 'Poppins', 'Playfair Display', 'Roboto', 'Lato', 'Nunito', 'Montserrat', 'Open Sans', 'Fredoka', 'Oswald'];
const COLOR_PRESETS = ['#FF6B35', '#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#0EA5E9', '#F59E0B', '#EF4444', '#14B8A6', '#1E293B', '#0F172A', '#FFFFFF'];

// One-click curated palettes (richer builder tool).
type Palette = { name: string; colors: { primary: string; secondary: string; accent: string; background: string; text: string } };
const QUICK_PALETTES: Palette[] = [
  { name: 'Street', colors: { primary: '#FF4D2E', secondary: '#111827', accent: '#FACC15', background: '#0F0F12', text: '#F9FAFB' } },
  { name: 'Océan', colors: { primary: '#0EA5E9', secondary: '#0F172A', accent: '#38BDF8', background: '#FFFFFF', text: '#0F172A' } },
  { name: 'Or & Nuit', colors: { primary: '#C6A15B', secondary: '#1C1917', accent: '#E7D2A5', background: '#0C0A09', text: '#F5F5F4' } },
  { name: 'Terracotta', colors: { primary: '#B45309', secondary: '#7C2D12', accent: '#F59E0B', background: '#FFFBEB', text: '#292524' } },
  { name: 'Punch', colors: { primary: '#EF4444', secondary: '#F97316', accent: '#FACC15', background: '#FFF7ED', text: '#1F2937' } },
  { name: 'Frais', colors: { primary: '#16A34A', secondary: '#166534', accent: '#F59E0B', background: '#F0FDF4', text: '#14532D' } },
  { name: 'Indigo', colors: { primary: '#6366F1', secondary: '#8B5CF6', accent: '#F59E0B', background: '#F8FAFC', text: '#0F172A' } },
  { name: 'Rose', colors: { primary: '#EC4899', secondary: '#8B5CF6', accent: '#10B981', background: '#FDF2F8', text: '#1F2937' } },
];

// Curated font pairings (heading + body) for quick selection.
const FONT_PAIRS: { name: string; heading: string; body: string }[] = [
  { name: 'Moderne', heading: 'Montserrat', body: 'Inter' },
  { name: 'Élégant', heading: 'Playfair Display', body: 'Lato' },
  { name: 'Impact', heading: 'Oswald', body: 'Inter' },
  { name: 'Amical', heading: 'Fredoka', body: 'Nunito' },
  { name: 'Neutre', heading: 'Inter', body: 'Inter' },
];

const GEAR_PATH = 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z';

type PanelKey = 'root' | 'templates' | 'colors' | 'fonts' | 'layout' | 'site';
type TemplateSection = 'header' | 'body' | 'footer';

const SECTIONS: { key: PanelKey; label: string; desc: string }[] = [
  { key: 'templates', label: 'Modèles', desc: 'En-tête, corps, pied de page' },
  { key: 'colors', label: 'Couleurs', desc: 'La palette de votre boutique' },
  { key: 'fonts', label: 'Typographie', desc: 'Polices des titres et du texte' },
  { key: 'layout', label: 'Mise en page', desc: 'Grille, espacement, arrondis' },
  { key: 'site', label: 'Réglages du site', desc: 'Nom, logo, textes du header' },
];

const Ico: React.FC<{ d: string; color?: string; size?: number; sw?: number }> = ({ d, color = C.textMid, size = 18, sw = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <Path d={d} />
  </Svg>
);

// ── Abstract wireframe thumbnails (mini live-preview of a template's structure) ─
const HeaderWire = ({ structure }: { structure: HeaderTemplate['structure'] }) => {
  if (structure.layout === 'vertical') {
    return (
      <View style={{ flexDirection: 'row', flex: 1 }}>
        <View style={t.wireSidebar}>
          {structure.hasLogo && <View style={t.wireDot} />}
          <View style={t.wireLineSm} />
          <View style={t.wireLineSm} />
        </View>
        <View style={{ flex: 1, padding: 4, justifyContent: 'center' }}>
          <View style={t.wireBlockFill} />
        </View>
      </View>
    );
  }
  const showsHero = ['hero', 'video', 'overlay'].includes(structure.type);
  return (
    <View style={{ flex: 1 }}>
      <View style={[t.wireRow, structure.type === 'centered' && { justifyContent: 'center' }]}>
        {structure.hasLogo && <View style={t.wireDot} />}
        {structure.hasNavigation && structure.type !== 'minimal' && (
          <View style={{ flexDirection: 'row', gap: 3, marginLeft: structure.type === 'split' ? 'auto' : 4 }}>
            <View style={t.wireLineTiny} /><View style={t.wireLineTiny} /><View style={t.wireLineTiny} />
          </View>
        )}
        <View style={{ flexDirection: 'row', gap: 3, marginLeft: 'auto' }}>
          {structure.hasSearch && <View style={t.wireIconDot} />}
          {structure.hasCart && <View style={t.wireIconDot} />}
          {structure.hasUser && <View style={t.wireIconDot} />}
        </View>
      </View>
      {showsHero && <View style={t.wireHeroBlock} />}
    </View>
  );
};

const BodyWire = ({ structure }: { structure: BodyTemplate['structure'] }) => {
  if (structure.type === 'list') {
    return <View style={{ gap: 3, flex: 1, justifyContent: 'center' }}>{[0, 1, 2].map(i => <View key={i} style={t.wireListRow} />)}</View>;
  }
  const cols = Math.min(structure.columns, 4);
  return (
    <View style={{ flexDirection: 'row', flex: 1 }}>
      {structure.hasSidebar && <View style={t.wireSidebarThin} />}
      <View style={t.wireGrid}>
        {Array.from({ length: cols * 2 }).map((_, i) => (
          <View key={i} style={[t.wireGridCell, { width: `${100 / cols - 4}%`, height: structure.type === 'masonry' ? (i % 2 === 0 ? 22 : 14) : 16 }]} />
        ))}
      </View>
    </View>
  );
};

const FooterWire = ({ structure }: { structure: FooterTemplate['structure'] }) => (
  <View style={{ flex: 1, justifyContent: 'flex-end', gap: 4 }}>
    {structure.hasNewsletter && <View style={t.wireNewsletter} />}
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {Array.from({ length: Math.min(structure.columns, 4) }).map((_, i) => <View key={i} style={t.wireFooterCol} />)}
    </View>
    {structure.hasSocialLinks && <View style={{ flexDirection: 'row', gap: 3 }}><View style={t.wireIconDotSm} /><View style={t.wireIconDotSm} /></View>}
    {structure.hasCopyright && <View style={t.wireLineFull} />}
  </View>
);

const ThemeBuilderAdvanced: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<ThemeBuilderAdvancedRouteProp>();
  const { user } = useAuth();
  const { boutiqueData } = useBoutique();
  const { products } = useProducts();
  const { templateId, boutiqueId: routeBoutiqueId } = route.params || {};
  const { width: winWidth } = useWindowDimensions();
  const isWide = winWidth >= 980;

  if (!templateId || !routeBoutiqueId) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, color: '#374151' }}>Paramètres manquants</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20, padding: 12, backgroundColor: '#FF6B35', borderRadius: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit');
  const [panel, setPanel] = useState<PanelKey>('root');
  const [templateSection, setTemplateSection] = useState<TemplateSection>('header');

  const [selectedHeader, setSelectedHeader] = useState<HeaderTemplate>(HEADER_TEMPLATES[0]);
  const [selectedBody, setSelectedBody] = useState<BodyTemplate>(BODY_TEMPLATES[0]);
  const [selectedFooter, setSelectedFooter] = useState<FooterTemplate>(FOOTER_TEMPLATES[0]);

  const [siteName, setSiteName] = useState(boutiqueData.nom || 'Ma Boutique');
  const [colors, setColors] = useState({ primary: '#FF6B35', secondary: '#8B5CF6', accent: '#F59E0B', background: '#F8FAFC', text: '#0F172A' });
  const [fonts, setFonts] = useState({ heading: 'Inter', body: 'Inter' });
  const [layout, setLayout] = useState({ productGridColumns: 3, spacing: 20, borderRadius: 16, shadow: true });

  const [customizations, setCustomizations] = useState({
    header: { logo: '', title: '', subtitle: '', backgroundImage: '', videoUrl: '' },
    footer: { logo: '', backgroundColor: '#1E293B', textColor: '#FFFFFF' },
  });
  const [industryThemeId, setIndustryThemeId] = useState<string | undefined>(
    getIndustryThemeById(templateId) ? templateId : undefined
  );
  // Whether the public storefront should fall back to sector demo products
  // when the boutique has none of its own yet — chosen when applying the
  // theme, editable anytime from "Réglages du site".
  const [showDemoProducts, setShowDemoProducts] = useState(true);

  const boutiqueId = routeBoutiqueId || boutiqueData.id || user?.uid;

  useEffect(() => {
    loadTheme();
  }, [boutiqueId]);

  const loadTheme = async () => {
    if (!boutiqueId) return;
    setLoading(true);
    try {
      const baseTemplate = THEME_TEMPLATES.find(tpl => tpl.id === templateId) || THEME_TEMPLATES[0];
      const existingTheme = await themeService.getThemeByBoutique(boutiqueId);

      if (existingTheme) {
        setSelectedHeader(getHeaderTemplateById(existingTheme.headerTemplate || '') || HEADER_TEMPLATES[0]);
        setSelectedBody(getBodyTemplateById(existingTheme.bodyTemplate || '') || BODY_TEMPLATES[0]);
        setSelectedFooter(getFooterTemplateById(existingTheme.footerTemplate || '') || FOOTER_TEMPLATES[0]);
        setColors(prev => ({ ...prev, ...(existingTheme.colors || baseTemplate.colors) }));
        setFonts(existingTheme.fonts || baseTemplate.fonts);
        setLayout({
          productGridColumns: existingTheme.layout?.productGridColumns ?? baseTemplate.layout.productGridColumns,
          spacing: existingTheme.layout?.spacing ?? baseTemplate.layout.spacing,
          borderRadius: existingTheme.productCard?.borderRadius ?? baseTemplate.productCard.borderRadius,
          shadow: existingTheme.productCard?.shadow ?? baseTemplate.productCard.shadow,
        });
        if (existingTheme.customizations?.header || existingTheme.customizations?.footer) {
          setCustomizations(prev => ({
            header: { ...prev.header, ...(existingTheme.customizations?.header || {}) },
            footer: { ...prev.footer, ...(existingTheme.customizations?.footer || {}) },
          }));
        }
        setIndustryThemeId(existingTheme.industryThemeId || (getIndustryThemeById(templateId) ? templateId : undefined));
        setShowDemoProducts(existingTheme.showDemoProducts ?? true);
      } else {
        setColors(prev => ({ ...prev, ...baseTemplate.colors }));
        setFonts(baseTemplate.fonts);
        setLayout({
          productGridColumns: baseTemplate.layout.productGridColumns,
          spacing: baseTemplate.layout.spacing,
          borderRadius: baseTemplate.productCard.borderRadius,
          shadow: baseTemplate.productCard.shadow,
        });
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!boutiqueId) return;
    setSaving(true);
    try {
      const baseTemplate = THEME_TEMPLATES.find(tpl => tpl.id === templateId) || THEME_TEMPLATES[0];
      const { id: _baseTemplateId, ...baseTemplateRest } = baseTemplate;
      const fullConfig: Partial<ThemeConfig> = {
        ...baseTemplateRest,
        name: siteName,
        colors,
        fonts,
        layout: { productGridColumns: layout.productGridColumns, spacing: layout.spacing },
        productCard: { ...baseTemplate.productCard, borderRadius: layout.borderRadius, shadow: layout.shadow },
        boutiqueId,
        headerTemplate: selectedHeader.id,
        bodyTemplate: selectedBody.id,
        footerTemplate: selectedFooter.id,
        customizations,
        industryThemeId,
        showDemoProducts,
        updatedAt: new Date(),
      };

      const existing = await themeService.getThemeByBoutique(boutiqueId);
      if (existing?.id) {
        await themeService.updateTheme(existing.id, fullConfig);
      } else {
        const newId = await themeService.createTheme(boutiqueId, baseTemplate.id);
        await themeService.updateTheme(newId, fullConfig);
      }
      navigation.navigate('ThemeSitePreview', { boutiqueId });
    } catch (error) {
      console.error('Error saving theme:', error);
      Alert.alert('Erreur', "Impossible d'enregistrer le thème");
    } finally {
      setSaving(false);
    }
  };

  const TemplateThumbCard = ({ kind, template, selected, onPress }: { kind: TemplateSection; template: any; selected: boolean; onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} style={[t.thumbCard, selected && t.thumbCardActive]} activeOpacity={0.85}>
      <View style={t.thumbBadge}><Text style={t.thumbBadgeText}>{template.preview}</Text></View>
      <View style={t.thumbWire}>
        {kind === 'header' && <HeaderWire structure={template.structure} />}
        {kind === 'body' && <BodyWire structure={template.structure} />}
        {kind === 'footer' && <FooterWire structure={template.structure} />}
      </View>
      <Text style={t.thumbName} numberOfLines={1}>{template.name}</Text>
      {selected && <View style={t.thumbCheck}><Text style={t.thumbCheckText}>✓</Text></View>}
    </TouchableOpacity>
  );

  const Field = ({ label, value, onChangeText, placeholder }: { label: string; value: string; onChangeText: (v: string) => void; placeholder?: string }) => (
    <View style={t.inputGroup}>
      <Text style={t.label}>{label}</Text>
      <TextInput style={t.input} value={value} onChangeText={onChangeText} placeholder={placeholder} autoCapitalize="none" />
    </View>
  );

  const ColorRow = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <View style={t.colorRow}>
      <View style={t.colorRowHead}>
        <View style={[t.colorSwatch, { backgroundColor: value }]} />
        <View style={{ flex: 1 }}>
          <Text style={t.label}>{label}</Text>
          <TextInput style={t.hexInput} value={value} onChangeText={onChange} placeholder="#000000" autoCapitalize="none" />
        </View>
      </View>
      <View style={t.presetRow}>
        {COLOR_PRESETS.map(c => (
          <TouchableOpacity key={c} onPress={() => onChange(c)} style={[t.presetSwatch, { backgroundColor: c }, value?.toLowerCase() === c.toLowerCase() && t.presetSwatchActive]} />
        ))}
      </View>
    </View>
  );

  const Stepper = ({ label, value, onChange, min, max, step, suffix }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; suffix?: string }) => (
    <View style={t.stepperRow}>
      <Text style={t.label}>{label}</Text>
      <View style={t.stepperControls}>
        <TouchableOpacity onPress={() => onChange(Math.max(min, value - step))} style={t.stepperBtn}><Text style={t.stepperBtnText}>−</Text></TouchableOpacity>
        <Text style={t.stepperValue}>{value}{suffix || ''}</Text>
        <TouchableOpacity onPress={() => onChange(Math.min(max, value + step))} style={t.stepperBtn}><Text style={t.stepperBtnText}>+</Text></TouchableOpacity>
      </View>
    </View>
  );

  const renderPanel = () => {
    if (panel === 'root') {
      return (
        <View>
          {SECTIONS.map(sec => (
            <TouchableOpacity key={sec.key} style={t.sectionRow} onPress={() => setPanel(sec.key)} activeOpacity={0.7}>
              <View style={t.sectionIconWrap}>
                {sec.key === 'templates' && <Ico d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" color={C.navy} />}
                {sec.key === 'colors' && (
                  <View style={{ flexDirection: 'row' }}>
                    <View style={[t.miniDot, { backgroundColor: colors.primary }]} />
                    <View style={[t.miniDot, { backgroundColor: colors.secondary, marginLeft: -6 }]} />
                    <View style={[t.miniDot, { backgroundColor: colors.accent, marginLeft: -6 }]} />
                  </View>
                )}
                {sec.key === 'fonts' && <Text style={{ fontWeight: '800', color: C.navy, fontSize: 15 }}>Aa</Text>}
                {sec.key === 'layout' && <Ico d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" color={C.navy} />}
                {sec.key === 'site' && <Ico d={GEAR_PATH} color={C.navy} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={t.sectionLabel}>{sec.label}</Text>
                <Text style={t.sectionDesc}>{sec.desc}</Text>
              </View>
              <Ico d="M9 18l6-6-6-6" color={C.muted} size={16} />
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    const sectionMeta = SECTIONS.find(s => s.key === panel)!;
    return (
      <View>
        <TouchableOpacity style={t.backRow} onPress={() => setPanel('root')}>
          <Ico d="M15 18l-6-6 6-6" color={C.navy} size={16} />
          <Text style={t.backRowText}>Réglages</Text>
        </TouchableOpacity>
        <Text style={t.panelHeading}>{sectionMeta.label}</Text>

        {panel === 'templates' && (
          <View>
            <View style={t.segmentRow}>
              {(['header', 'body', 'footer'] as TemplateSection[]).map(k => (
                <TouchableOpacity key={k} onPress={() => setTemplateSection(k)} style={[t.segmentBtn, templateSection === k && t.segmentBtnActive]}>
                  <Text style={[t.segmentBtnText, templateSection === k && t.segmentBtnTextActive]}>
                    {k === 'header' ? 'En-tête' : k === 'body' ? 'Corps' : 'Pied de page'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {templateSection === 'header' && (
              <>
                <View style={t.thumbGrid}>
                  {HEADER_TEMPLATES.map(tpl => (
                    <TemplateThumbCard key={tpl.id} kind="header" template={tpl} selected={selectedHeader.id === tpl.id} onPress={() => setSelectedHeader(tpl)} />
                  ))}
                </View>
                <View style={t.customizationPanel}>
                  <Text style={t.panelTitle}>Personnalisation de l'en-tête</Text>
                  {selectedHeader.customizable.logo && (
                    <Field label="URL du logo" value={customizations.header.logo} placeholder="https://..." onChangeText={v => setCustomizations(p => ({ ...p, header: { ...p.header, logo: v } }))} />
                  )}
                  {selectedHeader.customizable.title && (
                    <Field label="Titre" value={customizations.header.title} placeholder="Votre titre" onChangeText={v => setCustomizations(p => ({ ...p, header: { ...p.header, title: v } }))} />
                  )}
                  {selectedHeader.customizable.subtitle && (
                    <Field label="Sous-titre" value={customizations.header.subtitle} placeholder="Votre sous-titre" onChangeText={v => setCustomizations(p => ({ ...p, header: { ...p.header, subtitle: v } }))} />
                  )}
                  {selectedHeader.customizable.backgroundImage && (
                    <Field label="Image de fond" value={customizations.header.backgroundImage} placeholder="https://..." onChangeText={v => setCustomizations(p => ({ ...p, header: { ...p.header, backgroundImage: v } }))} />
                  )}
                  {selectedHeader.customizable.videoUrl && (
                    <Field label="URL YouTube" value={customizations.header.videoUrl} placeholder="https://youtube.com/..." onChangeText={v => setCustomizations(p => ({ ...p, header: { ...p.header, videoUrl: v } }))} />
                  )}
                </View>
              </>
            )}

            {templateSection === 'body' && (
              <View style={t.thumbGrid}>
                {BODY_TEMPLATES.map(tpl => (
                  <TemplateThumbCard
                    key={tpl.id}
                    kind="body"
                    template={tpl}
                    selected={selectedBody.id === tpl.id}
                    onPress={() => {
                      setSelectedBody(tpl);
                      setLayout(p => ({ ...p, productGridColumns: tpl.structure.columns }));
                    }}
                  />
                ))}
              </View>
            )}

            {templateSection === 'footer' && (
              <>
                <View style={t.thumbGrid}>
                  {FOOTER_TEMPLATES.map(tpl => (
                    <TemplateThumbCard key={tpl.id} kind="footer" template={tpl} selected={selectedFooter.id === tpl.id} onPress={() => setSelectedFooter(tpl)} />
                  ))}
                </View>
                <View style={t.customizationPanel}>
                  <Text style={t.panelTitle}>Personnalisation du pied de page</Text>
                  {selectedFooter.customizable.logo && (
                    <Field label="URL du logo" value={customizations.footer.logo} placeholder="https://..." onChangeText={v => setCustomizations(p => ({ ...p, footer: { ...p.footer, logo: v } }))} />
                  )}
                  <ColorRow label="Couleur de fond" value={customizations.footer.backgroundColor} onChange={v => setCustomizations(p => ({ ...p, footer: { ...p.footer, backgroundColor: v } }))} />
                  <ColorRow label="Couleur du texte" value={customizations.footer.textColor} onChange={v => setCustomizations(p => ({ ...p, footer: { ...p.footer, textColor: v } }))} />
                </View>
              </>
            )}
          </View>
        )}

        {panel === 'colors' && (
          <View style={t.customizationPanel}>
            <Text style={t.label}>Palettes rapides</Text>
            <View style={t.paletteGrid}>
              {QUICK_PALETTES.map(pal => {
                const active = colors.primary.toLowerCase() === pal.colors.primary.toLowerCase()
                  && colors.background.toLowerCase() === pal.colors.background.toLowerCase();
                return (
                  <TouchableOpacity key={pal.name} style={[t.paletteCard, active && t.paletteCardActive]} onPress={() => setColors(pal.colors)} activeOpacity={0.85}>
                    <View style={t.paletteSwatches}>
                      <View style={[t.paletteSwatch, { backgroundColor: pal.colors.primary }]} />
                      <View style={[t.paletteSwatch, { backgroundColor: pal.colors.secondary }]} />
                      <View style={[t.paletteSwatch, { backgroundColor: pal.colors.accent }]} />
                      <View style={[t.paletteSwatch, { backgroundColor: pal.colors.background, borderWidth: 1, borderColor: C.border }]} />
                    </View>
                    <Text style={[t.paletteName, active && { color: C.navy }]}>{pal.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={t.divider} />
            <ColorRow label="Couleur primaire" value={colors.primary} onChange={v => setColors(p => ({ ...p, primary: v }))} />
            <ColorRow label="Couleur secondaire" value={colors.secondary} onChange={v => setColors(p => ({ ...p, secondary: v }))} />
            <ColorRow label="Couleur d'accent" value={colors.accent} onChange={v => setColors(p => ({ ...p, accent: v }))} />
            <ColorRow label="Couleur de fond" value={colors.background} onChange={v => setColors(p => ({ ...p, background: v }))} />
            <ColorRow label="Couleur du texte" value={colors.text} onChange={v => setColors(p => ({ ...p, text: v }))} />
          </View>
        )}

        {panel === 'fonts' && (
          <View style={t.customizationPanel}>
            <Text style={t.label}>Associations rapides</Text>
            <View style={t.fontChipRow}>
              {FONT_PAIRS.map(fp => {
                const active = fonts.heading === fp.heading && fonts.body === fp.body;
                return (
                  <TouchableOpacity key={fp.name} onPress={() => setFonts({ heading: fp.heading, body: fp.body })} style={[t.pairChip, active && t.fontChipActive]}>
                    <Text style={[t.pairChipTitle, active && { color: C.white }, { fontFamily: fp.heading }]}>{fp.name}</Text>
                    <Text style={[t.pairChipSub, active && { color: '#FFFFFFCC' }]}>{fp.heading} · {fp.body}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={t.divider} />
            <Text style={t.label}>Police des titres</Text>
            <View style={t.fontChipRow}>
              {FONTS.map(f => (
                <TouchableOpacity key={f} onPress={() => setFonts(p => ({ ...p, heading: f }))} style={[t.fontChip, fonts.heading === f && t.fontChipActive]}>
                  <Text style={[t.fontChipText, fonts.heading === f && t.fontChipTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[t.label, { marginTop: 16 }]}>Police du texte</Text>
            <View style={t.fontChipRow}>
              {FONTS.map(f => (
                <TouchableOpacity key={f} onPress={() => setFonts(p => ({ ...p, body: f }))} style={[t.fontChip, fonts.body === f && t.fontChipActive]}>
                  <Text style={[t.fontChipText, fonts.body === f && t.fontChipTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {panel === 'layout' && (
          <View style={t.customizationPanel}>
            <Stepper label="Colonnes de la grille" value={layout.productGridColumns} min={1} max={5} step={1} onChange={v => setLayout(p => ({ ...p, productGridColumns: v }))} />
            <Stepper label="Espacement" value={layout.spacing} min={8} max={40} step={4} suffix="px" onChange={v => setLayout(p => ({ ...p, spacing: v }))} />
            <Stepper label="Arrondi des coins" value={layout.borderRadius} min={0} max={24} step={4} suffix="px" onChange={v => setLayout(p => ({ ...p, borderRadius: v }))} />
            <View style={t.switchRow}>
              <Text style={t.label}>Ombre des cartes produit</Text>
              <Switch value={layout.shadow} onValueChange={v => setLayout(p => ({ ...p, shadow: v }))} trackColor={{ false: C.border, true: C.navy }} thumbColor={C.white} />
            </View>
          </View>
        )}

        {panel === 'site' && (
          <View style={t.customizationPanel}>
            <Field label="Nom de la boutique" value={siteName} placeholder="Ma Boutique" onChangeText={setSiteName} />
            <Field label="Titre de la bannière (hero)" value={customizations.header.title} placeholder="Votre titre" onChangeText={v => setCustomizations(p => ({ ...p, header: { ...p.header, title: v } }))} />
            <Field label="Sous-titre de la bannière" value={customizations.header.subtitle} placeholder="Votre sous-titre" onChangeText={v => setCustomizations(p => ({ ...p, header: { ...p.header, subtitle: v } }))} />
            <Field label="Image de la bannière (URL)" value={customizations.header.backgroundImage} placeholder="https://..." onChangeText={v => setCustomizations(p => ({ ...p, header: { ...p.header, backgroundImage: v } }))} />
            <Field label="URL du logo" value={customizations.header.logo} placeholder="https://..." onChangeText={v => setCustomizations(p => ({ ...p, header: { ...p.header, logo: v } }))} />
            {!!industryTheme && (
              <>
                <View style={t.divider} />
                <View style={t.switchRow}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={t.label}>Produits de démonstration</Text>
                    <Text style={t.switchHint}>Affiche des exemples du secteur tant que vous n'avez pas encore ajouté vos produits.</Text>
                  </View>
                  <Switch value={showDemoProducts} onValueChange={setShowDemoProducts} trackColor={{ false: C.border, true: C.navy }} thumbColor={C.white} />
                </View>
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  const DeviceToggle = () => (
    <View style={t.deviceToggle}>
      <TouchableOpacity style={[t.deviceBtn, device === 'desktop' && t.deviceBtnActive]} onPress={() => setDevice('desktop')}>
        <Ico d="M4 4h16v10H4zM8 20h8M12 14v6" color={device === 'desktop' ? C.white : C.textMid} size={15} />
      </TouchableOpacity>
      <TouchableOpacity style={[t.deviceBtn, device === 'mobile' && t.deviceBtnActive]} onPress={() => setDevice('mobile')}>
        <Ico d="M8 2h8a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM11 19h2" color={device === 'mobile' ? C.white : C.textMid} size={15} />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={t.root}>
        <View style={t.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={t.backBtn}>
            <Text style={t.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={t.headerTitle}>Constructeur de Thème</Text>
        </View>
        <View style={t.loadingContainer}>
          <ActivityIndicator size="large" color={C.navy} />
          <Text style={t.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  const previewProducts: PreviewProduct[] = products.map(p => ({
    id: p.id,
    name: p.nom,
    price: p.prixPromo ?? p.prix,
    originalPrice: p.prixPromo ? p.prix : undefined,
    emoji: p.emoji,
    imageUri: p.imageUri,
  }));

  // Curated demo products from the chosen industry theme, shown when the
  // boutique has no real products yet — mirrors exactly what "Voir le site"
  // will display, respecting the merchant's with/without-demo choice.
  const industryTheme = industryThemeId ? getIndustryThemeById(industryThemeId) : undefined;
  const demoProducts: PreviewProduct[] | undefined = (showDemoProducts && industryTheme)
    ? industryTheme.demoProducts.map((d, i) => ({
        id: `${industryTheme.id}-${i}`,
        name: d.name,
        price: d.price,
        originalPrice: d.originalPrice,
        emoji: d.emoji,
        imageUri: d.image,
      }))
    : undefined;

  const canvas = (
    <ThemePreviewCanvas
      device={device}
      siteName={siteName}
      header={selectedHeader}
      body={selectedBody}
      footer={selectedFooter}
      colors={colors}
      fonts={fonts}
      layout={layout}
      products={previewProducts}
      demoProducts={demoProducts}
      heroImage={customizations.header.backgroundImage}
      ctaLabel={industryTheme?.hero.cta}
      animated
      headerTitle={customizations.header.title}
      headerSubtitle={customizations.header.subtitle}
      footerBackground={customizations.footer.backgroundColor}
      footerText={customizations.footer.textColor}
      description={boutiqueData.description}
      email={boutiqueData.email}
      phone={boutiqueData.phone}
      instagram={boutiqueData.instagram}
      facebook={boutiqueData.facebook}
      city={boutiqueData.ville}
      quartier={boutiqueData.quartier}
    />
  );

  return (
    <View style={t.root}>
      <View style={t.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={t.backBtn}>
          <Text style={t.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={t.headerTitle}>Constructeur de Thème</Text>
          <Text style={t.headerSubtitle}>{boutiqueData.nom || siteName}</Text>
        </View>
        <DeviceToggle />
        <TouchableOpacity style={t.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator size="small" color={C.white} /> : <Text style={t.saveBtnText}>Enregistrer</Text>}
        </TouchableOpacity>
      </View>

      {!isWide && (
        <View style={t.mobileSwitchRow}>
          <TouchableOpacity style={[t.mobileSwitchBtn, mobileView === 'edit' && t.mobileSwitchBtnActive]} onPress={() => setMobileView('edit')}>
            <Text style={[t.mobileSwitchText, mobileView === 'edit' && t.mobileSwitchTextActive]}>Réglages</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[t.mobileSwitchBtn, mobileView === 'preview' && t.mobileSwitchBtnActive]} onPress={() => setMobileView('preview')}>
            <Text style={[t.mobileSwitchText, mobileView === 'preview' && t.mobileSwitchTextActive]}>Aperçu</Text>
          </TouchableOpacity>
        </View>
      )}

      {isWide ? (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <ScrollView style={t.sidePanel} contentContainerStyle={{ padding: 16 }}>
            {renderPanel()}
          </ScrollView>
          <ScrollView style={t.canvasArea} contentContainerStyle={t.canvasAreaContent}>
            {canvas}
          </ScrollView>
        </View>
      ) : mobileView === 'edit' ? (
        <ScrollView style={t.sidePanel} contentContainerStyle={{ padding: 16 }}>
          {renderPanel()}
        </ScrollView>
      ) : (
        <ScrollView style={t.canvasArea} contentContainerStyle={t.canvasAreaContent}>
          {canvas}
        </ScrollView>
      )}
    </View>
  );
};

const t = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16,
    backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 18, color: C.navy, fontWeight: '700' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: C.textDark },
  headerSubtitle: { fontSize: 12, color: C.textLight },
  saveBtn: { backgroundColor: C.navy, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, minWidth: 100, alignItems: 'center' },
  saveBtnText: { color: C.white, fontWeight: '700', fontSize: 13 },

  deviceToggle: { flexDirection: 'row', backgroundColor: C.bg, borderRadius: 10, padding: 3, gap: 2 },
  deviceBtn: { width: 34, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  deviceBtnActive: { backgroundColor: C.navy },

  mobileSwitchRow: { flexDirection: 'row', backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  mobileSwitchBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  mobileSwitchBtnActive: { borderBottomColor: C.navy },
  mobileSwitchText: { fontSize: 13, fontWeight: '600', color: C.textLight },
  mobileSwitchTextActive: { color: C.navy, fontWeight: '800' },

  sidePanel: { width: 380, maxWidth: '100%', flexGrow: 0, flexShrink: 0, backgroundColor: C.surface, borderRightWidth: 1, borderRightColor: C.border },
  canvasArea: { flex: 1, backgroundColor: C.bg },
  canvasAreaContent: { padding: 24, minHeight: '100%', width: '100%' },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: C.textMid },

  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  sectionIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: C.textDark },
  sectionDesc: { fontSize: 11, color: C.textLight, marginTop: 2 },
  miniDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderColor: C.white },

  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  backRowText: { color: C.navy, fontWeight: '700', fontSize: 13 },
  panelHeading: { fontSize: 18, fontWeight: '800', color: C.textDark, marginBottom: 16 },

  segmentRow: { flexDirection: 'row', backgroundColor: C.bg, borderRadius: 10, padding: 3, marginBottom: 16, gap: 2 },
  segmentBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  segmentBtnActive: { backgroundColor: C.navy },
  segmentBtnText: { fontSize: 12, fontWeight: '600', color: C.textMid },
  segmentBtnTextActive: { color: C.white, fontWeight: '800' },

  thumbGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  thumbCard: { width: '47%', backgroundColor: C.bg, borderRadius: 12, padding: 8, borderWidth: 2, borderColor: 'transparent', position: 'relative' },
  thumbCardActive: { borderColor: C.navy, backgroundColor: C.white },
  thumbBadge: { position: 'absolute', top: 6, right: 6, zIndex: 1 },
  thumbBadgeText: { fontSize: 13 },
  thumbWire: { height: 56, backgroundColor: C.white, borderRadius: 8, borderWidth: 1, borderColor: C.border, padding: 6, marginBottom: 6, overflow: 'hidden' },
  thumbName: { fontSize: 11, fontWeight: '700', color: C.textDark },
  thumbCheck: { position: 'absolute', bottom: 6, right: 6, width: 16, height: 16, borderRadius: 8, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center' },
  thumbCheckText: { color: C.white, fontSize: 9, fontWeight: '800' },

  wireRow: { flexDirection: 'row', alignItems: 'center' },
  wireDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.navy },
  wireLineTiny: { width: 8, height: 3, borderRadius: 2, backgroundColor: C.muted },
  wireIconDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: C.muted },
  wireHeroBlock: { flex: 1, marginTop: 4, borderRadius: 4, backgroundColor: C.navy + '30' },
  wireSidebar: { width: 16, alignItems: 'center', gap: 4, paddingVertical: 4 },
  wireLineSm: { width: 8, height: 3, borderRadius: 2, backgroundColor: C.muted },
  wireBlockFill: { flex: 1, borderRadius: 4, backgroundColor: C.border },
  wireListRow: { height: 8, borderRadius: 2, backgroundColor: C.border },
  wireSidebarThin: { width: 10, marginRight: 4, borderRadius: 2, backgroundColor: C.border },
  wireGrid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 3, alignContent: 'flex-start' },
  wireGridCell: { borderRadius: 3, backgroundColor: C.navy + '25' },
  wireNewsletter: { height: 8, width: '70%', borderRadius: 2, backgroundColor: C.muted, alignSelf: 'center' },
  wireFooterCol: { flex: 1, height: 18, borderRadius: 2, backgroundColor: C.muted + '60' },
  wireIconDotSm: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: C.muted },
  wireLineFull: { height: 3, width: '90%', borderRadius: 2, backgroundColor: C.border, alignSelf: 'center' },

  customizationPanel: { backgroundColor: C.white, borderRadius: 12, padding: 4 },
  panelTitle: { fontSize: 14, fontWeight: '700', color: C.textDark, marginBottom: 12 },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: C.textMid, marginBottom: 6 },
  input: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9, fontSize: 13, color: C.textDark },

  colorRow: { marginBottom: 16 },
  colorRowHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  colorSwatch: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, borderColor: C.border },
  hexInput: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 12, color: C.textDark },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  presetSwatch: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: C.border },
  presetSwatchActive: { borderWidth: 2, borderColor: C.navy },

  fontChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fontChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border },
  fontChipActive: { backgroundColor: C.navy, borderColor: C.navy },
  fontChipText: { fontSize: 12, color: C.textMid, fontWeight: '600' },
  fontChipTextActive: { color: C.white },

  divider: { height: 1, backgroundColor: C.border, marginVertical: 16 },
  paletteGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  paletteCard: { width: '47%', backgroundColor: C.bg, borderRadius: 10, padding: 8, borderWidth: 2, borderColor: 'transparent' },
  paletteCardActive: { borderColor: C.navy, backgroundColor: C.white },
  paletteSwatches: { flexDirection: 'row', gap: 3, marginBottom: 6 },
  paletteSwatch: { flex: 1, height: 20, borderRadius: 4 },
  paletteName: { fontSize: 11, fontWeight: '700', color: C.textDark },
  pairChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border },
  pairChipTitle: { fontSize: 13, fontWeight: '800', color: C.textDark },
  pairChipSub: { fontSize: 10, color: C.textLight, marginTop: 1 },

  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepperBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  stepperBtnText: { fontSize: 16, fontWeight: '800', color: C.textDark },
  stepperValue: { fontSize: 13, fontWeight: '700', color: C.textDark, minWidth: 40, textAlign: 'center' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchHint: { fontSize: 11, color: C.textLight, marginTop: 3, lineHeight: 15 },
});

export default ThemeBuilderAdvanced;
