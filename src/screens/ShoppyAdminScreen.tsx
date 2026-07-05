import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Switch, Image, useWindowDimensions, Alert, Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';
import { ShoppyService, PremiumTheme, ShoppyDemoProduct } from '../services/ShoppyService';
import { HEADER_TEMPLATES } from '../constants/headerTemplates';
import { BODY_TEMPLATES } from '../constants/bodyTemplates';
import { FOOTER_TEMPLATES } from '../constants/footerTemplates';
import { QUICK_PALETTES, FONT_PAIRS, FONTS, COLOR_PRESETS } from '../constants/quickStyles';
import { useAuth } from '../contexts/AuthContext';
import ThemePreviewCanvas, { PreviewDevice, PreviewProduct } from '../components/ThemePreviewCanvas';

type Nav = NativeStackNavigationProp<any>;

const C = {
  navy: '#FF6B35',
  gold: '#C6A15B',
  bg: '#F6F7F9',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  textDark: '#111827',
  textMid: '#374151',
  textLight: '#6B7280',
  muted: '#9CA3AF',
  white: '#FFFFFF',
  danger: '#EF4444',
};

const Ico: React.FC<{ d: string; color?: string; size?: number }> = ({ d, color = C.textMid, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d={d} />
  </Svg>
);

const fmtFCFA = (n: number) => `${n.toLocaleString('fr-FR')} F`;

const emptyDraft = (): Omit<PremiumTheme, 'id' | 'createdAt' | 'updatedAt'> => ({
  name: '',
  industry: '',
  tagline: '',
  description: '',
  emoji: '✨',
  priceFCFA: 15000,
  colors: { primary: '#FF6B35', secondary: '#111827', accent: '#F59E0B', background: '#FFFFFF', text: '#0F172A' },
  fonts: { heading: 'Inter', body: 'Inter' },
  layout: { productGridColumns: 3, spacing: 20 },
  productCard: { showPrice: true, showOriginalPrice: true, showAddToCart: true, showFavorite: true, borderRadius: 14, shadow: true, layout: 'grid' },
  headerTemplate: HEADER_TEMPLATES[0].id,
  bodyTemplate: BODY_TEMPLATES[0].id,
  footerTemplate: FOOTER_TEMPLATES[0].id,
  footer: { backgroundColor: '#111827', textColor: '#FFFFFF' },
  hero: { title: 'Bienvenue', subtitle: 'Découvrez notre collection', cta: 'Découvrir', image: '' },
  demoProducts: [],
  active: true,
});

const ShoppyAdminScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const { width: winWidth } = useWindowDimensions();
  const isWide = winWidth >= 980;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [themes, setThemes] = useState<PremiumTheme[]>([]);
  const [mode, setMode] = useState<'list' | 'edit'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [draft, setDraft] = useState(emptyDraft());

  const loadThemes = async () => {
    setLoading(true);
    try {
      setThemes(await ShoppyService.getAllThemes());
    } catch (error) {
      console.error('Error loading Shoppy admin catalog:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadThemes(); }, []);

  const startCreate = () => {
    setDraft(emptyDraft());
    setEditingId(null);
    setMode('edit');
  };

  const startEdit = (theme: PremiumTheme) => {
    const { id, createdAt, updatedAt, createdBy, ...rest } = theme;
    setDraft(rest);
    setEditingId(theme.id!);
    setMode('edit');
  };

  const handleDelete = (theme: PremiumTheme) => {
    const doDelete = async () => {
      await ShoppyService.deleteTheme(theme.id!);
      loadThemes();
    };
    // react-native-web's Alert doesn't render multi-button confirmation
    // dialogs, so use the browser's native confirm() there instead.
    if (Platform.OS === 'web') {
      if (window.confirm(`Supprimer « ${theme.name} » du catalogue Shoppy ?`)) {
        doDelete();
      }
      return;
    }
    Alert.alert('Supprimer', `Supprimer « ${theme.name} » du catalogue Shoppy ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: doDelete },
    ]);
  };

  const handleToggleActive = async (theme: PremiumTheme) => {
    await ShoppyService.updateTheme(theme.id!, { active: !theme.active });
    loadThemes();
  };

  const handleSave = async () => {
    if (!draft.name.trim()) { Alert.alert('Erreur', 'Le nom du thème est requis'); return; }
    if (!draft.hero.image.trim()) { Alert.alert('Erreur', "L'image de bannière est requise"); return; }
    setSaving(true);
    try {
      if (editingId) {
        await ShoppyService.updateTheme(editingId, draft);
      } else {
        await ShoppyService.createTheme({ ...draft, createdBy: user?.uid });
      }
      setMode('list');
      loadThemes();
    } catch (error) {
      console.error('Error saving premium theme:', error);
      Alert.alert('Erreur', "Impossible d'enregistrer le thème");
    } finally {
      setSaving(false);
    }
  };

  const updateDemoProduct = (i: number, patch: Partial<ShoppyDemoProduct>) => {
    setDraft(p => ({ ...p, demoProducts: p.demoProducts.map((d, idx) => idx === i ? { ...d, ...patch } : d) }));
  };
  const addDemoProduct = () => {
    setDraft(p => ({ ...p, demoProducts: [...p.demoProducts, { name: '', price: 10000, emoji: '📦', image: '' }] }));
  };
  const removeDemoProduct = (i: number) => {
    setDraft(p => ({ ...p, demoProducts: p.demoProducts.filter((_, idx) => idx !== i) }));
  };

  const Field = ({ label, value, onChangeText, placeholder, keyboardType }: { label: string; value: string; onChangeText: (v: string) => void; placeholder?: string; keyboardType?: 'default' | 'numeric' }) => (
    <View style={t.inputGroup}>
      <Text style={t.label}>{label}</Text>
      <TextInput style={t.input} value={value} onChangeText={onChangeText} placeholder={placeholder} keyboardType={keyboardType} autoCapitalize="none" />
    </View>
  );

  const previewProducts: PreviewProduct[] = draft.demoProducts.map((d, i) => ({
    id: `draft-${i}`, name: d.name || `Produit ${i + 1}`, price: d.price, originalPrice: d.originalPrice, emoji: d.emoji, imageUri: d.image || undefined,
  }));

  const selectedHeader = HEADER_TEMPLATES.find(h => h.id === draft.headerTemplate) || HEADER_TEMPLATES[0];
  const selectedBody = BODY_TEMPLATES.find(b => b.id === draft.bodyTemplate) || BODY_TEMPLATES[0];
  const selectedFooter = FOOTER_TEMPLATES.find(f => f.id === draft.footerTemplate) || FOOTER_TEMPLATES[0];

  const canvas = (
    <ThemePreviewCanvas
      device={device}
      siteName={draft.name || 'Ma Boutique Premium'}
      header={selectedHeader}
      body={selectedBody}
      footer={selectedFooter}
      colors={draft.colors}
      fonts={draft.fonts}
      layout={{ productGridColumns: draft.layout.productGridColumns, spacing: draft.layout.spacing, borderRadius: draft.productCard.borderRadius, shadow: draft.productCard.shadow }}
      demoProducts={previewProducts}
      heroImage={draft.hero.image || undefined}
      ctaLabel={draft.hero.cta}
      headerTitle={draft.hero.title}
      headerSubtitle={draft.hero.subtitle}
      footerBackground={draft.footer.backgroundColor}
      footerText={draft.footer.textColor}
      animated
    />
  );

  if (loading) {
    return (
      <View style={t.root}>
        <View style={t.loadingContainer}><ActivityIndicator size="large" color={C.gold} /></View>
      </View>
    );
  }

  if (mode === 'list') {
    return (
      <View style={t.root}>
        <View style={t.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={t.backBtn}>
            <Ico d="M19 12H5M12 19l-7-7 7-7" color={C.gold} size={18} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={t.headerTitle}>Shoppy — Gestion</Text>
            <Text style={t.headerSubtitle}>Catalogue des thèmes premium en vente</Text>
          </View>
          <TouchableOpacity style={t.newBtn} onPress={startCreate}>
            <Ico d="M12 5v14M5 12h14" color={C.white} size={16} />
            <Text style={t.newBtnText}>Nouveau thème</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={t.listContent}>
          {themes.length === 0 ? (
            <View style={t.emptyState}>
              <Text style={t.emptyIcon}>🛍️</Text>
              <Text style={t.emptyText}>Aucun thème premium créé. Commencez par en ajouter un.</Text>
            </View>
          ) : (
            <View style={t.grid}>
              {themes.map(theme => (
                <View key={theme.id} style={t.listCard}>
                  <View style={t.listCardBanner}>
                    {!!theme.hero.image && <Image source={{ uri: theme.hero.image }} style={t.listCardImg} resizeMode="cover" />}
                    <View style={[t.activeBadge, { backgroundColor: theme.active ? '#10B981' : C.muted }]}>
                      <Text style={t.activeBadgeText}>{theme.active ? 'Publié' : 'Brouillon'}</Text>
                    </View>
                  </View>
                  <View style={t.listCardBody}>
                    <Text style={t.listCardName} numberOfLines={1}>{theme.emoji} {theme.name}</Text>
                    <Text style={t.listCardIndustry} numberOfLines={1}>{theme.industry}</Text>
                    <Text style={t.listCardPrice}>{fmtFCFA(theme.priceFCFA)}</Text>
                    <View style={t.listCardActions}>
                      <TouchableOpacity style={t.iconBtn} onPress={() => startEdit(theme)}>
                        <Ico d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" color={C.textMid} size={15} />
                      </TouchableOpacity>
                      <TouchableOpacity style={t.iconBtn} onPress={() => handleToggleActive(theme)}>
                        <Ico d={theme.active ? 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24' : 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'} color={C.textMid} size={15} />
                      </TouchableOpacity>
                      <TouchableOpacity style={t.iconBtn} onPress={() => handleDelete(theme)}>
                        <Ico d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16z" color={C.danger} size={15} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={t.root}>
      <View style={t.header}>
        <TouchableOpacity onPress={() => setMode('list')} style={t.backBtn}>
          <Ico d="M19 12H5M12 19l-7-7 7-7" color={C.gold} size={18} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={t.headerTitle}>{editingId ? 'Modifier le thème premium' : 'Nouveau thème premium'}</Text>
        </View>
        <View style={t.deviceToggle}>
          <TouchableOpacity style={[t.deviceBtn, device === 'desktop' && t.deviceBtnActive]} onPress={() => setDevice('desktop')}>
            <Ico d="M4 4h16v10H4zM8 20h8M12 14v6" color={device === 'desktop' ? C.white : C.textMid} size={15} />
          </TouchableOpacity>
          <TouchableOpacity style={[t.deviceBtn, device === 'mobile' && t.deviceBtnActive]} onPress={() => setDevice('mobile')}>
            <Ico d="M8 2h8a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM11 19h2" color={device === 'mobile' ? C.white : C.textMid} size={15} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={t.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator size="small" color={C.white} /> : <Text style={t.saveBtnText}>Enregistrer</Text>}
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, flexDirection: isWide ? 'row' : 'column' }}>
        <ScrollView style={t.sidePanel} contentContainerStyle={{ padding: 16 }}>
          <Text style={t.sectionHeading}>Informations générales</Text>
          <Field label="Nom du thème" value={draft.name} placeholder="Ex: Boutique Sneakers Elite" onChangeText={v => setDraft(p => ({ ...p, name: v }))} />
          <Field label="Secteur" value={draft.industry} placeholder="Ex: Sneakers" onChangeText={v => setDraft(p => ({ ...p, industry: v }))} />
          <Field label="Accroche" value={draft.tagline} placeholder="Une phrase courte et percutante" onChangeText={v => setDraft(p => ({ ...p, tagline: v }))} />
          <Field label="Description" value={draft.description} placeholder="Description complète du thème" onChangeText={v => setDraft(p => ({ ...p, description: v }))} />
          <View style={t.row2}>
            <View style={{ flex: 1 }}>
              <Field label="Emoji" value={draft.emoji} placeholder="✨" onChangeText={v => setDraft(p => ({ ...p, emoji: v }))} />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Prix (FCFA)" value={String(draft.priceFCFA)} keyboardType="numeric" onChangeText={v => setDraft(p => ({ ...p, priceFCFA: parseInt(v.replace(/\D/g, ''), 10) || 0 }))} />
            </View>
          </View>
          <View style={t.switchRow}>
            <Text style={t.label}>Publié dans Shoppy</Text>
            <Switch value={draft.active} onValueChange={v => setDraft(p => ({ ...p, active: v }))} trackColor={{ false: C.border, true: C.gold }} thumbColor={C.white} />
          </View>

          <View style={t.divider} />
          <Text style={t.sectionHeading}>Modèles</Text>
          <Text style={t.label}>En-tête</Text>
          <View style={t.chipRow}>
            {HEADER_TEMPLATES.map(h => (
              <TouchableOpacity key={h.id} onPress={() => setDraft(p => ({ ...p, headerTemplate: h.id }))} style={[t.chip, draft.headerTemplate === h.id && t.chipActive]}>
                <Text style={[t.chipText, draft.headerTemplate === h.id && t.chipTextActive]}>{h.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[t.label, { marginTop: 12 }]}>Corps</Text>
          <View style={t.chipRow}>
            {BODY_TEMPLATES.map(b => (
              <TouchableOpacity key={b.id} onPress={() => setDraft(p => ({ ...p, bodyTemplate: b.id }))} style={[t.chip, draft.bodyTemplate === b.id && t.chipActive]}>
                <Text style={[t.chipText, draft.bodyTemplate === b.id && t.chipTextActive]}>{b.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[t.label, { marginTop: 12 }]}>Pied de page</Text>
          <View style={t.chipRow}>
            {FOOTER_TEMPLATES.map(f => (
              <TouchableOpacity key={f.id} onPress={() => setDraft(p => ({ ...p, footerTemplate: f.id }))} style={[t.chip, draft.footerTemplate === f.id && t.chipActive]}>
                <Text style={[t.chipText, draft.footerTemplate === f.id && t.chipTextActive]}>{f.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={t.divider} />
          <Text style={t.sectionHeading}>Palette & typographie</Text>
          <View style={t.paletteGrid}>
            {QUICK_PALETTES.map(pal => {
              const active = draft.colors.primary.toLowerCase() === pal.colors.primary.toLowerCase() && draft.colors.background.toLowerCase() === pal.colors.background.toLowerCase();
              return (
                <TouchableOpacity key={pal.name} style={[t.paletteCard, active && t.paletteCardActive]} onPress={() => setDraft(p => ({ ...p, colors: pal.colors }))} activeOpacity={0.85}>
                  <View style={t.paletteSwatches}>
                    <View style={[t.paletteSwatch, { backgroundColor: pal.colors.primary }]} />
                    <View style={[t.paletteSwatch, { backgroundColor: pal.colors.secondary }]} />
                    <View style={[t.paletteSwatch, { backgroundColor: pal.colors.accent }]} />
                    <View style={[t.paletteSwatch, { backgroundColor: pal.colors.background, borderWidth: 1, borderColor: C.border }]} />
                  </View>
                  <Text style={[t.paletteName, active && { color: C.gold }]}>{pal.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={t.fontChipRow}>
            {FONT_PAIRS.map(fp => {
              const active = draft.fonts.heading === fp.heading && draft.fonts.body === fp.body;
              return (
                <TouchableOpacity key={fp.name} onPress={() => setDraft(p => ({ ...p, fonts: { heading: fp.heading, body: fp.body } }))} style={[t.pairChip, active && t.chipActive]}>
                  <Text style={[t.pairChipTitle, active && { color: C.white }]}>{fp.name}</Text>
                  <Text style={[t.pairChipSub, active && { color: '#FFFFFFCC' }]}>{fp.heading} · {fp.body}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={t.divider} />
          <Text style={t.sectionHeading}>Bannière (hero)</Text>
          <Field label="Titre" value={draft.hero.title} onChangeText={v => setDraft(p => ({ ...p, hero: { ...p.hero, title: v } }))} />
          <Field label="Sous-titre" value={draft.hero.subtitle} onChangeText={v => setDraft(p => ({ ...p, hero: { ...p.hero, subtitle: v } }))} />
          <Field label="Texte du bouton" value={draft.hero.cta} onChangeText={v => setDraft(p => ({ ...p, hero: { ...p.hero, cta: v } }))} />
          <Field label="Image de fond (URL)" value={draft.hero.image} placeholder="https://..." onChangeText={v => setDraft(p => ({ ...p, hero: { ...p.hero, image: v } }))} />

          <View style={t.divider} />
          <View style={t.sectionHeaderRow}>
            <Text style={t.sectionHeading}>Produits de démonstration</Text>
            <TouchableOpacity onPress={addDemoProduct} style={t.addProductBtn}>
              <Ico d="M12 5v14M5 12h14" color={C.gold} size={14} />
              <Text style={t.addProductBtnText}>Ajouter</Text>
            </TouchableOpacity>
          </View>
          {draft.demoProducts.map((dp, i) => (
            <View key={i} style={t.productRow}>
              <View style={t.productRowHead}>
                <Text style={t.productRowTitle}>Produit {i + 1}</Text>
                <TouchableOpacity onPress={() => removeDemoProduct(i)}>
                  <Ico d="M18 6L6 18M6 6l12 12" color={C.danger} size={14} />
                </TouchableOpacity>
              </View>
              <Field label="Nom" value={dp.name} onChangeText={v => updateDemoProduct(i, { name: v })} />
              <View style={t.row2}>
                <View style={{ flex: 1 }}>
                  <Field label="Prix (FCFA)" value={String(dp.price)} keyboardType="numeric" onChangeText={v => updateDemoProduct(i, { price: parseInt(v.replace(/\D/g, ''), 10) || 0 })} />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Emoji" value={dp.emoji} onChangeText={v => updateDemoProduct(i, { emoji: v })} />
                </View>
              </View>
              <Field label="Image (URL)" value={dp.image} placeholder="https://..." onChangeText={v => updateDemoProduct(i, { image: v })} />
            </View>
          ))}
        </ScrollView>

        <ScrollView style={t.canvasArea} contentContainerStyle={t.canvasAreaContent}>
          {canvas}
        </ScrollView>
      </View>
    </View>
  );
};

const t = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16,
    backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: C.textDark },
  headerSubtitle: { fontSize: 12, color: C.textLight, marginTop: 2 },
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.gold, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  newBtnText: { color: C.white, fontWeight: '800', fontSize: 13 },
  saveBtn: { backgroundColor: C.gold, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, minWidth: 100, alignItems: 'center' },
  saveBtnText: { color: C.white, fontWeight: '700', fontSize: 13 },
  deviceToggle: { flexDirection: 'row', backgroundColor: C.bg, borderRadius: 10, padding: 3, gap: 2 },
  deviceBtn: { width: 34, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  deviceBtnActive: { backgroundColor: C.gold },

  listContent: { padding: 20 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 14, color: C.textLight },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  listCard: { width: 260, backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  listCardBanner: { height: 110, backgroundColor: C.bg, position: 'relative' },
  listCardImg: { width: '100%', height: '100%' },
  activeBadge: { position: 'absolute', top: 8, right: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  activeBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  listCardBody: { padding: 12 },
  listCardName: { fontSize: 14, fontWeight: '800', color: C.textDark },
  listCardIndustry: { fontSize: 11, color: C.textLight, marginTop: 2, marginBottom: 6 },
  listCardPrice: { fontSize: 15, fontWeight: '800', color: C.gold, marginBottom: 10 },
  listCardActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },

  sidePanel: { width: 400, maxWidth: '100%', flexGrow: 0, flexShrink: 0, backgroundColor: C.surface, borderRightWidth: 1, borderRightColor: C.border },
  canvasArea: { flex: 1, backgroundColor: C.bg },
  canvasAreaContent: { padding: 24, minHeight: '100%', width: '100%' },

  sectionHeading: { fontSize: 14, fontWeight: '800', color: C.textDark, marginBottom: 12 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: C.textMid, marginBottom: 6 },
  input: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9, fontSize: 13, color: C.textDark },
  row2: { flexDirection: 'row', gap: 10 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 18 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border },
  chipActive: { backgroundColor: C.gold, borderColor: C.gold },
  chipText: { fontSize: 12, color: C.textMid, fontWeight: '600' },
  chipTextActive: { color: C.white },

  paletteGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  paletteCard: { width: '47%', backgroundColor: C.bg, borderRadius: 10, padding: 8, borderWidth: 2, borderColor: 'transparent' },
  paletteCardActive: { borderColor: C.gold, backgroundColor: C.white },
  paletteSwatches: { flexDirection: 'row', gap: 3, marginBottom: 6 },
  paletteSwatch: { flex: 1, height: 20, borderRadius: 4 },
  paletteName: { fontSize: 11, fontWeight: '700', color: C.textDark },
  fontChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pairChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border },
  pairChipTitle: { fontSize: 13, fontWeight: '800', color: C.textDark },
  pairChipSub: { fontSize: 10, color: C.textLight, marginTop: 1 },

  addProductBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: C.bg },
  addProductBtnText: { fontSize: 12, fontWeight: '700', color: C.gold },
  productRow: { backgroundColor: C.bg, borderRadius: 12, padding: 12, marginBottom: 12 },
  productRowHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  productRowTitle: { fontSize: 12, fontWeight: '800', color: C.textDark },
});

export default ShoppyAdminScreen;
