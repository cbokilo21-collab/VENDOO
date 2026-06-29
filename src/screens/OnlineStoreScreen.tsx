import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput, Switch, Modal } from 'react-native';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';

const C = {
  bg: '#F8FAFC', surface: '#FFFFFF', border: '#E2E8F0',
  orange: '#F97316', orangeFade: 'rgba(249,115,22,0.08)',
  textDark: '#0F172A', textMid: '#475569', textLight: '#94A3B8', muted: '#CBD5E1',
  success: '#22C55E', warning: '#F59E0B', purple: '#8B5CF6',
  gradientStart: '#F97316', gradientEnd: '#FB923C',
};

type TabType = 'builder' | 'theme' | 'settings';

interface Section {
  id: string;
  type: 'header' | 'hero' | 'featured' | 'collection' | 'testimonials' | 'footer';
  title: string;
  enabled: boolean;
}

interface Theme {
  id: string;
  name: string;
  description: string;
  preview: string;
  colors: { primary: string; secondary: string; accent: string };
  mockData: {
    hero: { title: string; subtitle: string; description: string; buttonText: string };
    products: Array<{ name: string; price: string; category: string }>;
  };
}

const SECTIONS: Section[] = [
  { id: '1', type: 'header', title: 'En-tête de navigation', enabled: true },
  { id: '2', type: 'hero', title: 'Bannière principale', enabled: true },
  { id: '3', type: 'featured', title: 'Produits vedettes', enabled: true },
  { id: '4', type: 'collection', title: 'Collections', enabled: false },
  { id: '5', type: 'testimonials', title: 'Témoignages', enabled: false },
  { id: '6', type: 'footer', title: 'Pied de page', enabled: true },
];

const THEMES: Theme[] = [
  { 
    id: 'modern', 
    name: 'Moderne', 
    description: 'Design vibrant et dynamique pour boutiques de mode',
    preview: '#FF6B35', 
    colors: { primary: '#FF6B35', secondary: '#FFF7F3', accent: '#8B5CF6' },
    mockData: {
      hero: { title: 'Style Moderne', subtitle: 'La mode de demain', description: 'Découvrez notre collection exclusive de vêtements et accessoires tendance.', buttonText: 'Explorer' },
      products: [
        { name: 'Veste Oversize', price: '45 000 F', category: 'Vêtements' },
        { name: 'Sneakers Urban', price: '35 000 F', category: 'Chaussures' },
        { name: 'Sac à Dos Tech', price: '25 000 F', category: 'Accessoires' },
        { name: 'Casquette Street', price: '12 000 F', category: 'Accessoires' },
      ]
    }
  },
  { 
    id: 'minimal', 
    name: 'Minimal', 
    description: 'Épure et élégant pour boutiques de luxe',
    preview: '#111827', 
    colors: { primary: '#111827', secondary: '#FFFFFF', accent: '#10B981' },
    mockData: {
      hero: { title: 'Pureté', subtitle: 'L\'essentiel', description: 'Des pièces essentielles pour un style intemporel et raffiné.', buttonText: 'Découvrir' },
      products: [
        { name: 'Chemise Lin', price: '28 000 F', category: 'Vêtements' },
        { name: 'Pantalon Slim', price: '32 000 F', category: 'Vêtements' },
        { name: 'Cuir Premium', price: '65 000 F', category: 'Maroquinerie' },
        { name: 'Montre Classique', price: '85 000 F', category: 'Accessoires' },
      ]
    }
  },
  { 
    id: 'elegant', 
    name: 'Élégant', 
    description: 'Sophistiqué pour boutiques de bijoux et cosmétiques',
    preview: '#8B5CF6', 
    colors: { primary: '#8B5CF6', secondary: '#F5F3FF', accent: '#FF6B35' },
    mockData: {
      hero: { title: 'Élégance', subtitle: 'Brillez', description: 'Une sélection de bijoux et cosmétiques pour sublimer votre quotidien.', buttonText: 'Voir la collection' },
      products: [
        { name: 'Collier Or', price: '55 000 F', category: 'Bijoux' },
        { name: 'Sérum Luxe', price: '42 000 F', category: 'Cosmétiques' },
        { name: 'Boucles Perles', price: '18 000 F', category: 'Bijoux' },
        { name: 'Crème Nuit', price: '38 000 F', category: 'Cosmétiques' },
      ]
    }
  },
  { 
    id: 'bold', 
    name: 'Audacieux', 
    description: 'Coloré et énergique pour boutiques de sport',
    preview: '#10B981', 
    colors: { primary: '#10B981', secondary: '#ECFDF5', accent: '#F59E0B' },
    mockData: {
      hero: { title: 'Performance', subtitle: 'Dépassez vos limites', description: 'Équipements sportifs pour les athlètes exigeants.', buttonText: 'Commencer' },
      products: [
        { name: 'Legging Pro', price: '22 000 F', category: 'Sport' },
        { name: 'T-shirt Tech', price: '15 000 F', category: 'Sport' },
        { name: 'Chaussures Run', price: '48 000 F', category: 'Chaussures' },
        { name: 'Gym Band', price: '8 000 F', category: 'Accessoires' },
      ]
    }
  },
];

interface SectionContent {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  description: string;
  youtubeUrl?: string;
  imageUrl?: string;
}

const OnlineStoreScreen: React.FC = () => {
  const [activePanel, setActivePanel] = useState<'sections' | 'theme' | 'settings'>('sections');
  const [storeName, setStoreName] = useState('Ma Boutique');
  const [storeUrl, setStoreUrl] = useState('ma-boutique.vendoo.shop');
  const [isActive, setIsActive] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [sections, setSections] = useState(SECTIONS);
  const [sectionContent, setSectionContent] = useState<Record<string, SectionContent>>({
    '2': { id: '2', title: 'Bienvenue sur notre boutique', subtitle: 'Découvrez nos produits exclusifs', buttonText: 'Voir la collection', description: 'Une sélection unique de produits de qualité', youtubeUrl: '', imageUrl: '' },
  });
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [previewingTheme, setPreviewingTheme] = useState<Theme | null>(null);
  const [themeProducts, setThemeProducts] = useState<Array<{ name: string; price: string; category: string }>>([]);
  const [customColors, setCustomColors] = useState(selectedTheme.colors);
  const [customHero, setCustomHero] = useState({
    title: sectionContent['2']?.title || '',
    subtitle: sectionContent['2']?.subtitle || '',
    description: sectionContent['2']?.description || '',
    buttonText: sectionContent['2']?.buttonText || '',
  });

  const toggleSection = (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const updateSectionContent = (id: string, field: keyof SectionContent, value: string) => {
    setSectionContent(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const generateAIContent = async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    setTimeout(() => {
      setSectionContent(prev => ({
        ...prev,
        '2': {
          id: '2',
          title: `${storeName} - Excellence & Qualité`,
          subtitle: 'Découvrez notre collection exclusive',
          buttonText: 'Explorer maintenant',
          description: aiPrompt + ' Nous proposons des produits de qualité supérieure sélectionnés avec soin pour vous offrir la meilleure expérience.',
          youtubeUrl: '',
          imageUrl: '',
        }
      }));
      setAiGenerating(false);
      setAiPrompt('');
    }, 2000);
  };

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const selectTheme = (theme: Theme) => {
    setSelectedTheme(theme);
    setCustomColors(theme.colors);
    setCustomHero({
      title: theme.mockData.hero.title,
      subtitle: theme.mockData.hero.subtitle,
      description: theme.mockData.hero.description,
      buttonText: theme.mockData.hero.buttonText,
    });
    setThemeProducts([]); // Commence avec une liste vide
    setSectionContent(prev => ({
      ...prev,
      '2': {
        id: '2',
        title: theme.mockData.hero.title,
        subtitle: theme.mockData.hero.subtitle,
        description: theme.mockData.hero.description,
        buttonText: theme.mockData.hero.buttonText,
        youtubeUrl: '',
        imageUrl: '',
      }
    }));
  };

  const updateCustomColor = (colorKey: keyof typeof customColors, value: string) => {
    setCustomColors(prev => ({ ...prev, [colorKey]: value }));
  };

  const updateCustomHero = (field: keyof typeof customHero, value: string) => {
    setCustomHero(prev => ({ ...prev, [field]: value }));
    updateSectionContent('2', field, value);
  };

  const addProduct = () => {
    setThemeProducts(prev => [...prev, { name: 'Nouveau produit', price: '0 F', category: 'Général' }]);
  };

  const updateProduct = (index: number, field: 'name' | 'price' | 'category', value: string) => {
    setThemeProducts(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const removeProduct = (index: number) => {
    setThemeProducts(prev => prev.filter((_, i) => i !== index));
  };

  const previewTheme = (theme: Theme) => {
    setPreviewingTheme(theme);
  };

  const closeThemePreview = () => {
    setPreviewingTheme(null);
  };

  const renderSectionsPanel = () => (
    <ScrollView style={s.panelContent} showsVerticalScrollIndicator={false}>
      <View style={s.panelSection}>
        <Text style={s.panelTitle}>Sections de la page</Text>
        <Text style={s.panelSub}>Activez/désactivez les sections</Text>
        
        {sections.map((section) => (
          <View key={section.id} style={s.panelItem}>
            <View style={s.panelItemInfo}>
              <Text style={s.panelItemName}>{section.title}</Text>
              <Text style={s.panelItemType}>{section.type}</Text>
            </View>
            <Switch
              value={section.enabled}
              onValueChange={() => toggleSection(section.id)}
              trackColor={{ false: '#E5E7EB', true: C.orange }}
              thumbColor="#FFFFFF"
            />
          </View>
        ))}
      </View>

      <View style={s.panelSection}>
        <Text style={s.panelTitle}>✨ Générateur IA</Text>
        <Text style={s.panelSub}>Créez du contenu automatiquement</Text>
        <View style={s.aiCard}>
          <TextInput
            style={s.aiInput}
            value={aiPrompt}
            onChangeText={setAiPrompt}
            placeholder="Décrivez votre boutique, vos produits, votre style..."
            placeholderTextColor={C.muted}
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity 
            style={[s.aiGenerateBtn, aiGenerating && s.aiGenerateBtnDisabled]}
            onPress={generateAIContent}
            disabled={aiGenerating}
          >
            <Text style={s.aiGenerateBtnText}>
              {aiGenerating ? '⏳ Génération en cours...' : '🚀 Générer le contenu'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.panelSection}>
        <Text style={s.panelTitle}>Contenu Hero</Text>
        <View style={s.field}>
          <Text style={s.fieldLabel}>Titre</Text>
          <TextInput
            style={s.input}
            value={sectionContent['2']?.title || ''}
            onChangeText={(value) => updateSectionContent('2', 'title', value)}
          />
        </View>
        <View style={s.field}>
          <Text style={s.fieldLabel}>Sous-titre</Text>
          <TextInput
            style={s.input}
            value={sectionContent['2']?.subtitle || ''}
            onChangeText={(value) => updateSectionContent('2', 'subtitle', value)}
          />
        </View>
        <View style={s.field}>
          <Text style={s.fieldLabel}>Description</Text>
          <TextInput
            style={[s.input, { minHeight: 80, textAlignVertical: 'top' }]}
            value={sectionContent['2']?.description || ''}
            onChangeText={(value) => updateSectionContent('2', 'description', value)}
            multiline
          />
        </View>
        <View style={s.field}>
          <Text style={s.fieldLabel}>🎬 YouTube URL</Text>
          <TextInput
            style={s.input}
            value={sectionContent['2']?.youtubeUrl || ''}
            onChangeText={(value) => updateSectionContent('2', 'youtubeUrl', value)}
            placeholder="https://youtube.com/watch?v=..."
          />
        </View>
        <View style={s.field}>
          <Text style={s.fieldLabel}>🖼️ Image URL</Text>
          <TextInput
            style={s.input}
            value={sectionContent['2']?.imageUrl || ''}
            onChangeText={(value) => updateSectionContent('2', 'imageUrl', value)}
            placeholder="https://example.com/image.jpg"
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderThemePanel = () => (
    <ScrollView style={s.panelContent} showsVerticalScrollIndicator={false}>
      <View style={s.panelSection}>
        <Text style={s.panelTitle}>Choisissez un thème</Text>
        <Text style={s.panelSub}>Chaque thème a son propre style et contenu</Text>
        
        {THEMES.map((theme) => (
          <TouchableOpacity
            key={theme.id}
            style={[s.themeCard, selectedTheme.id === theme.id && s.themeCardSelected]}
            onPress={() => selectTheme(theme)}
          >
            <View style={[s.themePreview, { backgroundColor: theme.preview }]} />
            <View style={s.themeInfo}>
              <Text style={s.themeName}>{theme.name}</Text>
              <Text style={s.themeDescription}>{theme.description}</Text>
              <View style={s.themeColors}>
                <View style={[s.colorDot, { backgroundColor: theme.colors.primary }]} />
                <View style={[s.colorDot, { backgroundColor: theme.colors.secondary }]} />
                <View style={[s.colorDot, { backgroundColor: theme.colors.accent }]} />
              </View>
            </View>
            <View style={s.themeActions}>
              <TouchableOpacity 
                style={s.previewThemeBtn}
                onPress={() => previewTheme(theme)}
              >
                <Text style={s.previewThemeBtnText}>👁️</Text>
              </TouchableOpacity>
              {selectedTheme.id === theme.id && (
                <View style={s.checkmark}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.success} strokeWidth={2}>
                    <Path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.panelSection}>
        <Text style={s.panelTitle}>Personnalisation des couleurs</Text>
        <View style={s.field}>
          <Text style={s.fieldLabel}>Couleur principale</Text>
          <View style={s.colorPickerRow}>
            <View style={[s.colorPickerPreview, { backgroundColor: customColors.primary }]} />
            <TextInput
              style={s.colorInput}
              value={customColors.primary}
              onChangeText={(value) => updateCustomColor('primary', value)}
            />
          </View>
        </View>
        <View style={s.field}>
          <Text style={s.fieldLabel}>Couleur secondaire</Text>
          <View style={s.colorPickerRow}>
            <View style={[s.colorPickerPreview, { backgroundColor: customColors.secondary }]} />
            <TextInput
              style={s.colorInput}
              value={customColors.secondary}
              onChangeText={(value) => updateCustomColor('secondary', value)}
            />
          </View>
        </View>
        <View style={s.field}>
          <Text style={s.fieldLabel}>Couleur d'accent</Text>
          <View style={s.colorPickerRow}>
            <View style={[s.colorPickerPreview, { backgroundColor: customColors.accent }]} />
            <TextInput
              style={s.colorInput}
              value={customColors.accent}
              onChangeText={(value) => updateCustomColor('accent', value)}
            />
          </View>
        </View>
      </View>

      <View style={s.panelSection}>
        <Text style={s.panelTitle}>Contenu Hero</Text>
        <View style={s.field}>
          <Text style={s.fieldLabel}>Titre</Text>
          <TextInput
            style={s.input}
            value={customHero.title}
            onChangeText={(value) => updateCustomHero('title', value)}
          />
        </View>
        <View style={s.field}>
          <Text style={s.fieldLabel}>Sous-titre</Text>
          <TextInput
            style={s.input}
            value={customHero.subtitle}
            onChangeText={(value) => updateCustomHero('subtitle', value)}
          />
        </View>
        <View style={s.field}>
          <Text style={s.fieldLabel}>Description</Text>
          <TextInput
            style={[s.input, { minHeight: 80, textAlignVertical: 'top' }]}
            value={customHero.description}
            onChangeText={(value) => updateCustomHero('description', value)}
            multiline
          />
        </View>
        <View style={s.field}>
          <Text style={s.fieldLabel}>Texte du bouton</Text>
          <TextInput
            style={s.input}
            value={customHero.buttonText}
            onChangeText={(value) => updateCustomHero('buttonText', value)}
          />
        </View>
      </View>

      <View style={s.panelSection}>
        <Text style={s.panelTitle}>Produits</Text>
        <Text style={s.panelSub}>Ajoutez vos produits ici</Text>
        {themeProducts.length === 0 ? (
          <View style={s.emptyProducts}>
            <Text style={s.emptyProductsText}>Aucun produit</Text>
            <Text style={s.emptyProductsSub}>Cliquez sur + pour ajouter des produits</Text>
          </View>
        ) : (
          themeProducts.map((product, index) => (
            <View key={index} style={s.productItem}>
              <View style={s.productImage} />
              <View style={s.productInfo}>
                <TextInput
                  style={s.productNameInput}
                  value={product.name}
                  onChangeText={(value) => updateProduct(index, 'name', value)}
                />
                <TextInput
                  style={s.productPriceInput}
                  value={product.price}
                  onChangeText={(value) => updateProduct(index, 'price', value)}
                />
                <TextInput
                  style={s.productCategoryInput}
                  value={product.category}
                  onChangeText={(value) => updateProduct(index, 'category', value)}
                />
              </View>
              <TouchableOpacity 
                style={s.removeProductBtn}
                onPress={() => removeProduct(index)}
              >
                <Text style={s.removeProductBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
        <TouchableOpacity style={s.addProductBtn} onPress={addProduct}>
          <Text style={s.addProductBtnText}>+ Ajouter un produit</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderSettingsPanel = () => (
    <ScrollView style={s.panelContent} showsVerticalScrollIndicator={false}>
      <View style={s.panelSection}>
        <Text style={s.panelTitle}>Informations boutique</Text>
        <View style={s.field}>
          <Text style={s.fieldLabel}>Nom</Text>
          <TextInput style={s.input} value={storeName} onChangeText={setStoreName} />
        </View>
        <View style={s.field}>
          <Text style={s.fieldLabel}>URL</Text>
          <TextInput style={s.input} value={storeUrl} onChangeText={setStoreUrl} />
        </View>
      </View>

      <View style={s.panelSection}>
        <Text style={s.panelTitle}>Options</Text>
        <View style={s.toggleRow}>
          <Text style={s.toggleLabel}>Boutique active</Text>
          <Switch value={isActive} onValueChange={setIsActive} trackColor={{ false: '#E5E7EB', true: C.orange }} thumbColor="#FFFFFF" />
        </View>
      </View>
    </ScrollView>
  );

  const renderPreview = () => (
    <View style={[s.previewArea, { backgroundColor: customColors.secondary }]}>
      <View style={[s.previewNav, { backgroundColor: customColors.primary }]}>
        <Text style={s.previewNavLogo}>{storeName}</Text>
        <View style={s.previewNavLinks}>
          <TouchableOpacity onPress={() => {}}>
            <Text style={s.previewNavLink}>Accueil</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}}>
            <Text style={s.previewNavLink}>Boutique</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView>
        <View style={[s.previewHero, { backgroundColor: customColors.primary + '20' }]}>
          {sectionContent['2']?.imageUrl && (
            <View style={s.previewImageContainer}>
              <View style={[s.previewImage, { backgroundColor: C.border }]} />
              <Text style={s.previewImagePlaceholder}>Image</Text>
            </View>
          )}
          {sectionContent['2']?.youtubeUrl && getYoutubeEmbedUrl(sectionContent['2'].youtubeUrl) && (
            <View style={s.previewVideoContainer}>
              <View style={[s.previewVideoPlaceholder, { backgroundColor: C.border }]}>
                <Text style={s.previewVideoText}>▶️ YouTube</Text>
              </View>
            </View>
          )}
          <Text style={s.previewHeroTitle}>{sectionContent['2']?.title || 'Bienvenue'}</Text>
          <Text style={s.previewHeroSub}>{sectionContent['2']?.subtitle || ''}</Text>
          <Text style={s.previewHeroDesc}>{sectionContent['2']?.description || ''}</Text>
          <TouchableOpacity 
            style={[s.previewHeroBtn, { backgroundColor: customColors.primary }]}
            onPress={() => {}}
          >
            <Text style={s.previewHeroBtnText}>{sectionContent['2']?.buttonText || 'Voir'}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={s.previewSection}>
          <Text style={s.previewSectionTitle}>Nos produits</Text>
          <View style={s.previewGrid}>
            {themeProducts.length === 0 ? (
              <View style={s.emptyProductsPreview}>
                <Text style={s.emptyProductsPreviewText}>Aucun produit</Text>
              </View>
            ) : (
              themeProducts.map((product, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={s.previewCardItem}
                  onPress={() => {}}
                >
                  <View style={[s.previewCardImage, { backgroundColor: customColors.primary + '30' }]} />
                  <Text style={s.previewCardTitle}>{product.name}</Text>
                  <Text style={s.previewCardPrice}>{product.price}</Text>
                  <Text style={s.previewCardCategory}>{product.category}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );

  return (
    <View style={s.root}>
      {/* Top Bar */}
      <View style={s.topBar}>
        <Text style={s.topBarTitle}>Boutique en ligne</Text>
        <View style={s.topBarActions}>
          <TouchableOpacity 
            style={s.topBarBtn}
            onPress={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <Text style={s.topBarBtnText}>{sidebarCollapsed ? '☰' : '✕'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Split View */}
      <View style={s.splitView}>
        {/* Preview Area (Left/Center) */}
        <View style={s.previewContainer}>
          {renderPreview()}
        </View>

        {/* Settings Panel (Right) */}
        {!sidebarCollapsed && (
          <View style={s.sidebar}>
            {/* Panel Tabs */}
            <View style={s.panelTabs}>
              {(['sections', 'theme', 'settings'] as const).map((panel) => (
                <TouchableOpacity
                  key={panel}
                  style={[s.panelTab, activePanel === panel && s.panelTabActive]}
                  onPress={() => setActivePanel(panel)}
                >
                  <Text style={[s.panelTabText, activePanel === panel && s.panelTabTextActive]}>
                    {panel === 'sections' ? '📄 Sections' : 
                     panel === 'theme' ? '🎨 Thème' : '⚙️ Réglages'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Panel Content */}
            {activePanel === 'sections' && renderSectionsPanel()}
            {activePanel === 'theme' && renderThemePanel()}
            {activePanel === 'settings' && renderSettingsPanel()}
          </View>
        )}
      </View>

      {/* Theme Preview Modal */}
      {previewingTheme && (
        <Modal visible={!!previewingTheme} animationType="slide" onRequestClose={closeThemePreview}>
          <View style={s.themePreviewModal}>
            <View style={s.themePreviewHeader}>
              <TouchableOpacity onPress={closeThemePreview}>
                <Text style={s.closeBtn}>✕ Fermer</Text>
              </TouchableOpacity>
              <Text style={s.themePreviewTitle}>Aperçu: {previewingTheme.name}</Text>
              <TouchableOpacity onPress={() => { selectTheme(previewingTheme); closeThemePreview(); }}>
                <Text style={s.useThemeBtn}>Utiliser ce thème</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={s.themePreviewContent}>
              <View style={[s.themePreviewWebsite, { backgroundColor: previewingTheme.colors.secondary }]}>
                <View style={[s.previewNav, { backgroundColor: previewingTheme.colors.primary }]}>
                  <Text style={s.previewNavLogo}>{storeName}</Text>
                  <View style={s.previewNavLinks}>
                    <Text style={s.previewNavLink}>Accueil</Text>
                    <Text style={s.previewNavLink}>Boutique</Text>
                    <Text style={s.previewNavLink}>À propos</Text>
                  </View>
                </View>
                
                <View style={[s.previewHero, { backgroundColor: previewingTheme.colors.primary + '20' }]}>
                  <Text style={s.previewHeroTitle}>{previewingTheme.mockData.hero.title}</Text>
                  <Text style={s.previewHeroSub}>{previewingTheme.mockData.hero.subtitle}</Text>
                  <Text style={s.previewHeroDesc}>{previewingTheme.mockData.hero.description}</Text>
                  <View style={[s.previewHeroBtn, { backgroundColor: previewingTheme.colors.primary }]}>
                    <Text style={s.previewHeroBtnText}>{previewingTheme.mockData.hero.buttonText}</Text>
                  </View>
                </View>
                
                <View style={s.previewSection}>
                  <Text style={s.previewSectionTitle}>Nos produits</Text>
                  <View style={s.previewGrid}>
                    {previewingTheme.mockData.products.map((product, i) => (
                      <View key={i} style={s.previewCardItem}>
                        <View style={[s.previewCardImage, { backgroundColor: previewingTheme.colors.primary + '30' }]} />
                        <Text style={s.previewCardTitle}>{product.name}</Text>
                        <Text style={s.previewCardPrice}>{product.price}</Text>
                        <Text style={s.previewCardCategory}>{product.category}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                
                <View style={[s.previewFooter, { backgroundColor: previewingTheme.colors.primary }]}>
                  <Text style={s.previewFooterText}>© 2024 {storeName}</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  
  // Top Bar
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 18, backgroundColor: C.surface,
    borderBottomWidth: 1, borderBottomColor: C.border, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2,
  },
  topBarTitle: { fontSize: 22, fontWeight: '800', color: C.textDark, letterSpacing: -0.5 },
  topBarActions: { flexDirection: 'row', gap: 12 },
  topBarBtn: {
    width: 40, height: 40, borderRadius: 10, backgroundColor: C.bg,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border,
  },
  topBarBtnText: { fontSize: 20 },
  
  // Split View
  splitView: { flex: 1, flexDirection: 'row' },
  previewContainer: { flex: 1, backgroundColor: '#F1F5F9' },
  sidebar: {
    width: 400, backgroundColor: C.surface, borderLeftWidth: 1, borderLeftColor: C.border,
    flexDirection: 'column',
  },
  
  // Panel Tabs
  panelTabs: {
    flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.border,
  },
  panelTab: {
    flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  panelTabActive: { borderBottomColor: C.orange },
  panelTabText: { fontSize: 14, color: C.textMid, fontWeight: '600', letterSpacing: -0.3 },
  panelTabTextActive: { color: C.orange, fontWeight: '700' },
  
  // Panel Content
  panelContent: { flex: 1 },
  panelSection: { padding: 24, borderBottomWidth: 1, borderBottomColor: C.border },
  panelTitle: { fontSize: 19, fontWeight: '900', color: C.textDark, marginBottom: 8, letterSpacing: -0.5 },
  panelSub: { fontSize: 14, color: C.textLight, marginBottom: 20 },
  panelItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 16, paddingHorizontal: 16, backgroundColor: C.bg,
    borderRadius: 12, marginBottom: 10,
  },
  panelItemInfo: { flex: 1 },
  panelItemName: { fontSize: 16, fontWeight: '800', color: C.textDark, marginBottom: 4 },
  panelItemType: { fontSize: 13, color: C.textLight },
  
  // Field
  field: { marginBottom: 20 },
  fieldLabel: { fontSize: 14, fontWeight: '800', color: C.textMid, marginBottom: 10, letterSpacing: -0.3 },
  fieldHint: { fontSize: 13, color: C.textLight, marginTop: 8 },
  input: {
    backgroundColor: C.bg, borderRadius: 12, padding: 16,
    fontSize: 15, color: C.textDark, borderWidth: 1, borderColor: C.border,
  },
  
  // AI Card
  aiCard: {
    backgroundColor: C.bg, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: C.border,
  },
  aiInput: {
    backgroundColor: C.surface, borderRadius: 12, padding: 16,
    fontSize: 15, color: C.textDark, borderWidth: 1, borderColor: C.border,
    marginBottom: 16, minHeight: 100, textAlignVertical: 'top',
  },
  aiGenerateBtn: {
    backgroundColor: C.purple, borderRadius: 12, padding: 16,
    alignItems: 'center',
  },
  aiGenerateBtnDisabled: { backgroundColor: C.muted },
  aiGenerateBtnText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.3 },
  
  // Theme Card
  themeCard: {
    flexDirection: 'row', alignItems: 'center', padding: 20,
    backgroundColor: C.bg, borderRadius: 16, marginBottom: 16,
    borderWidth: 1, borderColor: C.border,
  },
  themeCardSelected: { borderColor: C.orange, borderWidth: 2, backgroundColor: C.orangeFade },
  themePreview: { width: 56, height: 56, borderRadius: 12, marginRight: 16 },
  themeInfo: { flex: 1 },
  themeName: { fontSize: 18, fontWeight: '800', color: C.textDark, marginBottom: 6 },
  themeDescription: { fontSize: 13, color: C.textLight, lineHeight: 18 },
  themeColors: { flexDirection: 'row', gap: 6, marginTop: 8 },
  colorDot: { width: 14, height: 14, borderRadius: 4 },
  themeActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  previewThemeBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  previewThemeBtnText: { fontSize: 18 },
  checkmark: { padding: 4 },
  
  // Product Item
  productItem: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    backgroundColor: C.bg, borderRadius: 12, marginBottom: 12,
  },
  productImage: { width: 48, height: 48, borderRadius: 10, backgroundColor: C.border, marginRight: 14 },
  productInfo: { flex: 1 },
  productName: { fontSize: 15, fontWeight: '800', color: C.textDark, marginBottom: 4 },
  productPrice: { fontSize: 14, color: C.orange, fontWeight: '700' },
  productCategory: { fontSize: 12, color: C.muted },
  
  emptyProducts: { padding: 40, alignItems: 'center', backgroundColor: C.bg, borderRadius: 12, marginBottom: 16 },
  emptyProductsText: { fontSize: 16, fontWeight: '800', color: C.textMid, marginBottom: 8 },
  emptyProductsSub: { fontSize: 14, color: C.textLight, textAlign: 'center' },
  addProductBtn: {
    backgroundColor: C.orange, borderRadius: 12, padding: 16,
    alignItems: 'center', marginTop: 12,
  },
  addProductBtnText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.3 },
  
  // Color Picker
  colorPickerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  colorPickerPreview: { width: 44, height: 44, borderRadius: 10, borderWidth: 1, borderColor: C.border },
  colorInput: {
    flex: 1, backgroundColor: C.bg, borderRadius: 10, padding: 12,
    fontSize: 14, color: C.textDark, borderWidth: 1, borderColor: C.border,
  },
  
  // Product Inputs
  productNameInput: {
    fontSize: 14, fontWeight: '700', color: C.textDark, marginBottom: 3,
  },
  productPriceInput: {
    fontSize: 13, color: C.orange, fontWeight: '600', marginBottom: 3,
  },
  productCategoryInput: {
    fontSize: 11, color: C.muted,
  },
  removeProductBtn: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: '#EF4444',
    alignItems: 'center', justifyContent: 'center', marginLeft: 10,
  },
  removeProductBtnText: { fontSize: 18, color: '#FFFFFF', fontWeight: '700' },
  
  // Toggle
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10,
  },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: C.textDark },
  
  // Preview Area
  previewArea: { flex: 1 },
  previewNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16,
  },
  previewNavLogo: { fontSize: 18, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5 },
  previewNavLinks: { flexDirection: 'row', gap: 16 },
  previewNavLink: { fontSize: 13, color: '#FFFFFF', fontWeight: '600' },
  
  previewHero: { padding: 40, alignItems: 'center' },
  previewImageContainer: { width: '100%', marginBottom: 16 },
  previewImage: { height: 180, borderRadius: 12, overflow: 'hidden' },
  previewImagePlaceholder: { textAlign: 'center', padding: 70, color: C.textLight, fontSize: 13 },
  previewVideoContainer: { width: '100%', marginBottom: 16 },
  previewVideoPlaceholder: { height: 180, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  previewVideoText: { fontSize: 16, fontWeight: '800', color: C.textDark, marginBottom: 6 },
  previewHeroTitle: { fontSize: 32, fontWeight: '900', color: C.textDark, marginBottom: 8, letterSpacing: -1 },
  previewHeroSub: { fontSize: 16, color: C.textLight, marginBottom: 8, fontWeight: '600' },
  previewHeroDesc: { fontSize: 14, color: C.textMid, textAlign: 'center', marginBottom: 16, maxWidth: 350, lineHeight: 20 },
  previewHeroBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 10 },
  previewHeroBtnText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.3 },
  
  previewSection: { padding: 24 },
  previewSectionTitle: { fontSize: 22, fontWeight: '800', color: C.textDark, marginBottom: 16, letterSpacing: -0.5 },
  previewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  previewCardItem: {
    width: '48%', backgroundColor: '#FFFFFF', borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: C.border,
  },
  previewCardImage: { height: 100, borderRadius: 8, marginBottom: 10 },
  previewCardTitle: { fontSize: 14, fontWeight: '700', color: C.textDark, marginBottom: 6 },
  previewCardPrice: { fontSize: 13, color: C.orange, fontWeight: '700' },
  previewCardCategory: { fontSize: 11, color: C.muted },
  
  emptyProductsPreview: { padding: 50, alignItems: 'center' },
  emptyProductsPreviewText: { fontSize: 15, fontWeight: '700', color: C.textMid },
  
  previewFooter: { padding: 24, alignItems: 'center' },
  previewFooterText: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' },
  
  // Theme Preview Modal
  themePreviewModal: { flex: 1, backgroundColor: '#FFFFFF' },
  themePreviewHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  closeBtn: { fontSize: 16, fontWeight: '700', color: C.textMid },
  themePreviewTitle: { fontSize: 18, fontWeight: '800', color: C.textDark },
  useThemeBtn: { fontSize: 16, fontWeight: '800', color: C.orange },
  themePreviewContent: { flex: 1 },
  themePreviewWebsite: { minHeight: '100%' },
});

export default OnlineStoreScreen;
