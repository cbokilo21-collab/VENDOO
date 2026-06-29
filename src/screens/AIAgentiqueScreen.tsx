import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput, Switch, Modal } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';

const C = {
  bg: '#FFF7F3', surface: '#FFFFFF', border: '#E5E7EB',
  orange: '#FF6B35', orangeFade: 'rgba(255,107,53,0.1)',
  gold: '#FFD700', goldFade: 'rgba(255,215,0,0.1)',
  textDark: '#111827', textMid: '#374151', textLight: '#6B7280', muted: '#9CA3AF',
  success: '#10B981', warning: '#F59E0B', purple: '#8B5CF6', blue: '#3B82F6',
};

type AITabType = 'dashboard' | 'recommendations' | 'pricing' | 'descriptions' | 'forecast';

interface AIInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'success';
  title: string;
  description: string;
  impact: string;
  action?: string;
}

interface ProductRecommendation {
  id: string;
  name: string;
  currentSales: number;
  predictedSales: number;
  confidence: number;
  reason: string;
}

interface PricingSuggestion {
  id: string;
  productName: string;
  currentPrice: number;
  suggestedPrice: number;
  reason: string;
  expectedImpact: string;
}

const AI_INSIGHTS: AIInsight[] = [
  {
    id: '1',
    type: 'opportunity',
    title: 'Sneakers Premium en forte demande',
    description: 'Ventes +45% cette semaine. Considérez un stock accru.',
    impact: '+12k F revenus potentiels',
    action: 'Augmenter le stock',
  },
  {
    id: '2',
    type: 'warning',
    title: 'Veste Bomber - Stock critique',
    description: 'Seulement 2 unités restantes. Risque de rupture.',
    impact: '-8k F pertes estimées',
    action: 'Réapprovisionner',
  },
  {
    id: '3',
    type: 'success',
    title: 'Prix optimal détecté',
    description: 'Montre Classique vendue 3x plus vite à 45k F.',
    impact: '+15% marge',
  },
];

const PRODUCT_RECOMMENDATIONS: ProductRecommendation[] = [
  {
    id: '1',
    name: 'Sneakers Premium',
    currentSales: 45,
    predictedSales: 78,
    confidence: 92,
    reason: 'Tendance sneakers en hausse dans votre quartier',
  },
  {
    id: '2',
    name: 'Veste Bomber',
    currentSales: 23,
    predictedSales: 35,
    confidence: 87,
    reason: 'Saison automne approche',
  },
  {
    id: '3',
    name: 'Montre Classique',
    currentSales: 18,
    predictedSales: 28,
    confidence: 78,
    reason: 'Cadeaux de fin d\'année',
  },
];

const PRICING_SUGGESTIONS: PricingSuggestion[] = [
  {
    id: '1',
    productName: 'Sneakers Premium',
    currentPrice: 45000,
    suggestedPrice: 52000,
    reason: 'Demande élevée, faible concurrence',
    expectedImpact: '+15% marge',
  },
  {
    id: '2',
    productName: 'Veste Bomber',
    currentPrice: 35000,
    suggestedPrice: 32000,
    reason: 'Promotion pour écouler le stock',
    expectedImpact: '+40% ventes',
  },
];

const AIAgentiqueScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AITabType>('dashboard');
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoPricing, setAutoPricing] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 2000);
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return C.blue;
      case 'warning': return C.warning;
      case 'success': return C.success;
      default: return C.muted;
    }
  };

  const renderDashboardTab = () => (
    <View style={s.tabContent}>
      {/* AI Score Card */}
      <View style={[s.scoreCard, { backgroundColor: C.goldFade }]}>
        <View style={s.scoreHeader}>
          <Text style={s.scoreTitle}>Score IA Argentique</Text>
          <View style={s.scoreBadge}>
            <Text style={s.scoreValue}>87</Text>
            <Text style={s.scoreLabel}>/100</Text>
          </View>
        </View>
        <Text style={s.scoreDesc}>Votre boutique performe mieux que 78% des boutiques similaires</Text>
        <View style={s.scoreProgress}>
          <View style={[s.scoreBar, { width: '87%', backgroundColor: C.gold }]} />
        </View>
      </View>

      {/* AI Insights */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Insights IA</Text>
        <Text style={s.sectionSub}>Recommandations basées sur l'analyse de vos données</Text>
        
        {AI_INSIGHTS.map((insight) => (
          <TouchableOpacity
            key={insight.id}
            style={s.insightCard}
            onPress={() => {
              setSelectedInsight(insight);
              setShowDetailModal(true);
            }}
          >
            <View style={[s.insightDot, { backgroundColor: getInsightColor(insight.type) }]} />
            <View style={s.insightContent}>
              <Text style={s.insightTitle}>{insight.title}</Text>
              <Text style={s.insightDesc}>{insight.description}</Text>
              <Text style={[s.insightImpact, { color: getInsightColor(insight.type) }]}>{insight.impact}</Text>
            </View>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2}>
              <Path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Stats */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Statistiques IA</Text>
        <View style={s.statsGrid}>
          <View style={s.statCard}>
            <Text style={s.statValue}>+23%</Text>
            <Text style={s.statLabel}>Ventes prédites</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statValue}>12</Text>
            <Text style={s.statLabel}>Opportunités</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statValue}>5</Text>
            <Text style={s.statLabel}>Alertes stock</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statValue}>89%</Text>
            <Text style={s.statLabel}>Précision</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderRecommendationsTab = () => (
    <View style={s.tabContent}>
      <View style={s.section}>
        <Text style={s.sectionTitle}>Recommandations produits</Text>
        <Text style={s.sectionSub}>Produits à mettre en avant selon l'IA</Text>
        
        {PRODUCT_RECOMMENDATIONS.map((product) => (
          <View key={product.id} style={s.recommendationCard}>
            <View style={s.recommendationHeader}>
              <Text style={s.recommendationName}>{product.name}</Text>
              <View style={[s.confidenceBadge, { backgroundColor: C.success + '20' }]}>
                <Text style={[s.confidenceText, { color: C.success }]}>{product.confidence}%</Text>
              </View>
            </View>
            <View style={s.recommendationStats}>
              <View style={s.statItem}>
                <Text style={s.statItemLabel}>Ventes actuelles</Text>
                <Text style={s.statItemValue}>{product.currentSales}</Text>
              </View>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.success} strokeWidth={2}>
                <Path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
              <View style={s.statItem}>
                <Text style={s.statItemLabel}>Prédiction</Text>
                <Text style={[s.statItemValue, { color: C.success }]}>{product.predictedSales}</Text>
              </View>
            </View>
            <Text style={s.recommendationReason}>{product.reason}</Text>
            <TouchableOpacity style={s.applyBtn}>
              <Text style={s.applyBtnText}>Appliquer la recommandation</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  const renderPricingTab = () => (
    <View style={s.tabContent}>
      <View style={s.section}>
        <View style={s.card}>
          <View style={s.toggleRow}>
            <View style={s.toggleInfo}>
              <Text style={s.toggleLabel}>Prix dynamique automatique</Text>
              <Text style={s.toggleSub}>L'IA ajuste vos prix en temps réel</Text>
            </View>
            <Switch
              value={autoPricing}
              onValueChange={setAutoPricing}
              trackColor={{ false: '#E5E7EB', true: C.gold }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Suggestions de prix</Text>
        <Text style={s.sectionSub}>Optimisations basées sur le marché</Text>
        
        {PRICING_SUGGESTIONS.map((suggestion) => (
          <View key={suggestion.id} style={s.pricingCard}>
            <Text style={s.pricingProductName}>{suggestion.productName}</Text>
            <View style={s.pricingComparison}>
              <View style={s.pricingItem}>
                <Text style={s.pricingLabel}>Prix actuel</Text>
                <Text style={s.pricingValue}>{suggestion.currentPrice.toLocaleString()} F</Text>
              </View>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth={2}>
                <Path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
              <View style={s.pricingItem}>
                <Text style={s.pricingLabel}>Suggéré</Text>
                <Text style={[s.pricingValue, { color: C.orange }]}>{suggestion.suggestedPrice.toLocaleString()} F</Text>
              </View>
            </View>
            <Text style={s.pricingReason}>{suggestion.reason}</Text>
            <View style={[s.impactBadge, { backgroundColor: C.success + '15' }]}>
              <Text style={[s.impactBadgeText, { color: C.success }]}>{suggestion.expectedImpact}</Text>
            </View>
            <TouchableOpacity style={s.applyBtn}>
              <Text style={s.applyBtnText}>Appliquer le nouveau prix</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  const renderDescriptionsTab = () => (
    <View style={s.tabContent}>
      <View style={s.section}>
        <Text style={s.sectionTitle}>Générateur de descriptions</Text>
        <Text style={s.sectionSub}>Créez des descriptions produits optimisées SEO</Text>
        
        <View style={s.card}>
          <View style={s.field}>
            <Text style={s.fieldLabel}>Produit</Text>
            <TextInput
              style={s.input}
              placeholder="Nom du produit"
              placeholderTextColor={C.muted}
            />
          </View>
          <View style={s.field}>
            <Text style={s.fieldLabel}>Caractéristiques</Text>
            <TextInput
              style={s.input}
              placeholder="Matériau, taille, couleur..."
              placeholderTextColor={C.muted}
            />
          </View>
          <View style={s.field}>
            <Text style={s.fieldLabel}>Style</Text>
            <View style={s.styleOptions}>
              {['Élégant', 'Moderne', 'Décontracté', 'Luxe'].map((style) => (
                <TouchableOpacity key={style} style={[s.styleChip, s.styleChipSelected]}>
                  <Text style={[s.styleChipText, s.styleChipTextSelected]}>{style}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity 
            style={[s.generateBtn, isProcessing && s.generateBtnDisabled]}
            onPress={handleGenerate}
            disabled={isProcessing}
          >
            <Text style={s.generateBtnText}>
              {isProcessing ? 'Génération en cours...' : '✨ Générer la description'}
            </Text>
          </TouchableOpacity>
        </View>

        {isProcessing === false && (
          <View style={s.generatedCard}>
            <Text style={s.generatedTitle}>Description générée</Text>
            <Text style={s.generatedText}>
              Découvrez notre produit élégant et moderne, conçu avec les meilleurs matériaux. 
              Parfait pour un style décontracté ou chic, il s'adapte à toutes les occasions. 
              Qualité premium et finition soignée pour un look incomparable.
            </Text>
            <View style={s.generatedActions}>
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border }]}>
                <Text style={[s.actionBtnText, { color: C.textMid }]}>Régénérer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: C.orange }]}>
                <Text style={s.actionBtnText}>Utiliser</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  const renderForecastTab = () => (
    <View style={s.tabContent}>
      <View style={s.section}>
        <Text style={s.sectionTitle}>Prévisions de ventes</Text>
        <Text style={s.sectionSub}>Anticipez la demande pour optimiser votre stock</Text>
        
        <View style={s.forecastCard}>
          <View style={s.forecastHeader}>
            <Text style={s.forecastTitle}>Prévisions 30 jours</Text>
            <Text style={s.forecastSubtitle}>Basé sur l'historique et les tendances</Text>
          </View>
          
          <View style={s.forecastChart}>
            <View style={s.chartBarContainer}>
              <View style={[s.chartBar, { height: '40%' }]} />
              <Text style={s.chartLabel}>Sem 1</Text>
            </View>
            <View style={s.chartBarContainer}>
              <View style={[s.chartBar, { height: '65%' }]} />
              <Text style={s.chartLabel}>Sem 2</Text>
            </View>
            <View style={s.chartBarContainer}>
              <View style={[s.chartBar, { height: '85%' }]} />
              <Text style={s.chartLabel}>Sem 3</Text>
            </View>
            <View style={s.chartBarContainer}>
              <View style={[s.chartBar, { height: '70%' }]} />
              <Text style={s.chartLabel}>Sem 4</Text>
            </View>
          </View>

          <View style={s.forecastSummary}>
            <View style={s.summaryItem}>
              <Text style={s.summaryLabel}>Total prévu</Text>
              <Text style={s.summaryValue}>156 ventes</Text>
            </View>
            <View style={s.summaryItem}>
              <Text style={s.summaryLabel}>Revenus estimés</Text>
              <Text style={[s.summaryValue, { color: C.success }]}>+45%</Text>
            </View>
            <View style={s.summaryItem}>
              <Text style={s.summaryLabel}>Confiance</Text>
              <Text style={s.summaryValue}>89%</Text>
            </View>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Recommandations stock</Text>
          {['Sneakers Premium: +20 unités', 'Veste Bomber: +15 unités', 'Montre Classique: +10 unités'].map((rec, index) => (
            <View key={index} style={s.stockRecommendation}>
              <Text style={s.stockRecText}>{rec}</Text>
              <TouchableOpacity style={s.stockRecBtn}>
                <Text style={s.stockRecBtnText}>Commander</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderDetailModal = () => (
    <Modal visible={showDetailModal} animationType="slide" onRequestClose={() => setShowDetailModal(false)}>
      <View style={s.detailModal}>
        <View style={s.detailModalHeader}>
          <TouchableOpacity onPress={() => setShowDetailModal(false)}>
            <Text style={s.closeBtn}>✕ Fermer</Text>
          </TouchableOpacity>
          <Text style={s.detailModalTitle}>Détails de l'insight</Text>
          <View style={{ width: 60 }} />
        </View>
        
        <ScrollView style={s.detailContent}>
          {selectedInsight && (
            <View style={s.detailCard}>
              <View style={[s.detailIcon, { backgroundColor: getInsightColor(selectedInsight.type) + '20' }]}>
                <Text style={s.detailIconText}>
                  {selectedInsight.type === 'opportunity' ? '💡' : 
                   selectedInsight.type === 'warning' ? '⚠️' : '✅'}
                </Text>
              </View>
              <Text style={s.detailTitle}>{selectedInsight.title}</Text>
              <Text style={s.detailDescription}>{selectedInsight.description}</Text>
              
              <View style={s.detailImpact}>
                <Text style={s.detailImpactLabel}>Impact estimé</Text>
                <Text style={[s.detailImpactValue, { color: getInsightColor(selectedInsight.type) }]}>
                  {selectedInsight.impact}
                </Text>
              </View>

              {selectedInsight.action && (
                <TouchableOpacity style={s.detailActionBtn}>
                  <Text style={s.detailActionBtnText}>{selectedInsight.action}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.premiumBadge}>
          <Text style={s.premiumBadgeText}>✨ PREMIUM</Text>
        </View>
        <Text style={s.headerTitle}>IA Argentique</Text>
        <Text style={s.headerSub}>Intelligence artificielle avancée pour votre boutique</Text>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsContainer}>
        {(['dashboard', 'recommendations', 'pricing', 'descriptions', 'forecast'] as AITabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[s.tab, activeTab === tab && s.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
              {tab === 'dashboard' ? '📊 Tableau' : 
               tab === 'recommendations' ? '🎯 Recos' : 
               tab === 'pricing' ? '💰 Prix' : 
               tab === 'descriptions' ? '📝 Desc' : '🔮 Prévisions'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'dashboard' && renderDashboardTab()}
        {activeTab === 'recommendations' && renderRecommendationsTab()}
        {activeTab === 'pricing' && renderPricingTab()}
        {activeTab === 'descriptions' && renderDescriptionsTab()}
        {activeTab === 'forecast' && renderForecastTab()}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Detail Modal */}
      {renderDetailModal()}
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { padding: 24, paddingBottom: 16 },
  premiumBadge: {
    alignSelf: 'flex-start', backgroundColor: C.goldFade,
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 12,
  },
  premiumBadgeText: { fontSize: 11, fontWeight: '700', color: C.gold },
  headerTitle: { fontSize: 28, fontWeight: '800', color: C.textDark, marginBottom: 4 },
  headerSub: { fontSize: 14, color: C.textLight },
  
  tabsContainer: {
    backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  tabs: { flexDirection: 'row', paddingHorizontal: 16 },
  tab: { 
    paddingHorizontal: 16, paddingVertical: 14, marginRight: 4,
    borderRadius: 8, backgroundColor: C.bg,
  },
  tabActive: { backgroundColor: C.orangeFade },
  tabText: { fontSize: 13, fontWeight: '500', color: C.textLight },
  tabTextActive: { color: C.orange, fontWeight: '700' },
  
  scroll: { flex: 1 },
  tabContent: { paddingTop: 16 },
  
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: C.textDark, marginBottom: 4 },
  sectionSub: { fontSize: 13, color: C.textLight, marginBottom: 16 },
  
  scoreCard: {
    borderRadius: 16, padding: 20, marginHorizontal: 16, marginBottom: 24,
    borderWidth: 1, borderColor: C.gold,
  },
  scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  scoreTitle: { fontSize: 16, fontWeight: '700', color: C.textDark },
  scoreBadge: { flexDirection: 'row', alignItems: 'baseline' },
  scoreValue: { fontSize: 32, fontWeight: '800', color: C.gold },
  scoreLabel: { fontSize: 14, color: C.textLight, marginLeft: 4 },
  scoreDesc: { fontSize: 13, color: C.textMid, marginBottom: 12 },
  scoreProgress: { height: 8, backgroundColor: C.bg, borderRadius: 4, overflow: 'hidden' },
  scoreBar: { height: '100%', borderRadius: 4 },
  
  insightCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface,
    borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border,
  },
  insightDot: { width: 4, height: 40, borderRadius: 2, marginRight: 12 },
  insightContent: { flex: 1 },
  insightTitle: { fontSize: 14, fontWeight: '600', color: C.textDark, marginBottom: 4 },
  insightDesc: { fontSize: 12, color: C.textLight, marginBottom: 4 },
  insightImpact: { fontSize: 12, fontWeight: '600' },
  
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
  },
  statCard: {
    width: '48%', backgroundColor: C.surface, borderRadius: 12,
    padding: 16, borderWidth: 1, borderColor: C.border,
  },
  statValue: { fontSize: 24, fontWeight: '800', color: C.orange, marginBottom: 4 },
  statLabel: { fontSize: 12, color: C.textLight },
  
  recommendationCard: {
    backgroundColor: C.surface, borderRadius: 12, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: C.border,
  },
  recommendationHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
  },
  recommendationName: { fontSize: 15, fontWeight: '600', color: C.textDark },
  confidenceBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  confidenceText: { fontSize: 12, fontWeight: '700' },
  recommendationStats: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.bg, borderRadius: 8, padding: 12, marginBottom: 12,
  },
  statItem: { alignItems: 'center' },
  statItemLabel: { fontSize: 11, color: C.textLight, marginBottom: 2 },
  statItemValue: { fontSize: 16, fontWeight: '700', color: C.textDark },
  recommendationReason: { fontSize: 13, color: C.textMid, marginBottom: 12 },
  applyBtn: {
    backgroundColor: C.orange, borderRadius: 8, padding: 12, alignItems: 'center',
  },
  applyBtnText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  
  card: {
    backgroundColor: C.surface, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: C.border,
  },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  toggleInfo: { flex: 1 },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: C.textDark, marginBottom: 2 },
  toggleSub: { fontSize: 12, color: C.textLight },
  
  pricingCard: {
    backgroundColor: C.surface, borderRadius: 12, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: C.border,
  },
  pricingProductName: { fontSize: 15, fontWeight: '600', color: C.textDark, marginBottom: 12 },
  pricingComparison: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.bg, borderRadius: 8, padding: 12, marginBottom: 12,
  },
  pricingItem: { alignItems: 'center' },
  pricingLabel: { fontSize: 11, color: C.textLight, marginBottom: 2 },
  pricingValue: { fontSize: 16, fontWeight: '700', color: C.textDark },
  pricingReason: { fontSize: 13, color: C.textMid, marginBottom: 8 },
  impactBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginBottom: 12 },
  impactBadgeText: { fontSize: 12, fontWeight: '600' },
  
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: C.textMid, marginBottom: 6 },
  input: {
    backgroundColor: C.bg, borderRadius: 8, padding: 12,
    fontSize: 14, color: C.textDark, borderWidth: 1, borderColor: C.border,
  },
  styleOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  styleChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    borderWidth: 1, borderColor: C.border, backgroundColor: C.bg,
  },
  styleChipSelected: { backgroundColor: C.orange, borderColor: C.orange },
  styleChipText: { fontSize: 12, fontWeight: '500', color: C.textLight },
  styleChipTextSelected: { color: '#FFFFFF' },
  generateBtn: {
    backgroundColor: C.orange, borderRadius: 8, padding: 14,
    alignItems: 'center',
  },
  generateBtnDisabled: { backgroundColor: C.muted },
  generateBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  
  generatedCard: {
    backgroundColor: C.surface, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: C.border, marginTop: 16,
  },
  generatedTitle: { fontSize: 14, fontWeight: '600', color: C.textDark, marginBottom: 8 },
  generatedText: { fontSize: 13, color: C.textMid, lineHeight: 20, marginBottom: 12 },
  generatedActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  actionBtnText: { fontSize: 14, fontWeight: '600' },
  
  forecastCard: {
    backgroundColor: C.surface, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: C.border, marginBottom: 16,
  },
  forecastHeader: { marginBottom: 16 },
  forecastTitle: { fontSize: 16, fontWeight: '700', color: C.textDark },
  forecastSubtitle: { fontSize: 12, color: C.textLight },
  forecastChart: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    height: 120, marginBottom: 16,
  },
  chartBarContainer: { flex: 1, alignItems: 'center' },
  chartBar: {
    width: 40, backgroundColor: C.orange, borderRadius: 4, marginBottom: 8,
  },
  chartLabel: { fontSize: 11, color: C.textLight },
  forecastSummary: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: C.bg, borderRadius: 8, padding: 12,
  },
  summaryItem: { alignItems: 'center' },
  summaryLabel: { fontSize: 11, color: C.textLight, marginBottom: 2 },
  summaryValue: { fontSize: 14, fontWeight: '700', color: C.textDark },
  
  stockRecommendation: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: C.surface, borderRadius: 8, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: C.border,
  },
  stockRecText: { fontSize: 13, color: C.textMid, flex: 1 },
  stockRecBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: C.orangeFade },
  stockRecBtnText: { fontSize: 12, fontWeight: '600', color: C.orange },
  
  detailModal: { flex: 1, backgroundColor: '#FFFFFF' },
  detailModalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  closeBtn: { fontSize: 16, fontWeight: '600', color: C.textMid },
  detailModalTitle: { fontSize: 16, fontWeight: '700', color: C.textDark },
  detailContent: { flex: 1, padding: 16 },
  detailCard: {
    backgroundColor: C.bg, borderRadius: 12, padding: 20,
  },
  detailIcon: {
    width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  detailIconText: { fontSize: 24 },
  detailTitle: { fontSize: 20, fontWeight: '700', color: C.textDark, marginBottom: 8 },
  detailDescription: { fontSize: 14, color: C.textMid, lineHeight: 20, marginBottom: 16 },
  detailImpact: {
    backgroundColor: C.surface, borderRadius: 8, padding: 12, marginBottom: 16,
  },
  detailImpactLabel: { fontSize: 12, color: C.textLight, marginBottom: 4 },
  detailImpactValue: { fontSize: 16, fontWeight: '700' },
  detailActionBtn: {
    backgroundColor: C.orange, borderRadius: 8, padding: 14, alignItems: 'center',
  },
  detailActionBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});

export default AIAgentiqueScreen;
