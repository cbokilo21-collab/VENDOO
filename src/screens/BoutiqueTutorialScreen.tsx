import React, { useState, useRef, useEffect } from 'react';
import {
  View, StyleSheet, Text, TouchableOpacity,
  ScrollView, Animated, Dimensions, Easing
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

const C = {
  navy: '#FF6B35', navyMid: '#FF8A5C',
  bg: '#FFF7F3', surface: '#FFFFFF', border: '#E5E7EB',
  accent: '#FF6B35', accentSoft: 'rgba(255,107,53,0.1)',
  textDark: '#111827', textMid: '#374151', textLight: '#6B7280', muted: '#9CA3AF',
  success: '#10B981', info: '#3B82F6', warning: '#F59E0B', purple: '#8B5CF6',
  white: '#FFFFFF',
};

type RootStackParamList = {
  BoutiqueTutorial: undefined; BusinessDashboard: undefined;
  Products: undefined; Orders: undefined; Customers: undefined;
  POS: undefined; BoutiqueAppearance: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList>;

const { width: SW } = Dimensions.get('window');

interface TutorialStep {
  id: string;
  icon: React.ReactNode;
  color: string;
  title: string;
  subtitle: string;
  description: string;
  tip: string;
  route?: keyof RootStackParamList;
  routeLabel?: string;
}

const Icon = (c: string) => ({
  Dashboard: <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}><Path d="M3 3v18h18M18 17V9M13 17V5M8 17v-3" strokeLinecap="round" strokeLinejoin="round"/></Svg>,
  Box:       <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}><Path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" strokeLinecap="round" strokeLinejoin="round"/></Svg>,
  Clip:      <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}><Path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 10h6M9 14h6M9 18h6" strokeLinecap="round" strokeLinejoin="round"/></Svg>,
  Users:     <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}><Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round"/><Circle cx="9" cy="7" r="4"/></Svg>,
  POS:       <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}><Rect x="2" y="4" width="20" height="16" rx="2"/><Path d="M7 15h.01M11 15h.01M15 15h.01M7 11h.01M11 11h.01M15 11h.01M7 7h10" strokeLinecap="round" strokeLinejoin="round"/></Svg>,
  Facade:    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}><Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round"/><Path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round"/></Svg>,
  AI:        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}><Circle cx="12" cy="12" r="10"/><Path d="M12 8v4M12 16h.01" strokeLinecap="round"/></Svg>,
});

const STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    icon: Icon(C.accent).Facade,
    color: C.accent,
    title: 'Bienvenue dans votre boutique !',
    subtitle: 'Votre espace commercial virtuel est prêt.',
    description: 'Vous venez d\'ouvrir votre boutique dans le quartier Vendoo. Ici, les clients peuvent vous trouver, parcourir vos produits et passer commande. Ce tutoriel rapide vous montre comment tout fonctionne — étape par étape.',
    tip: '💡 Conseil : Complétez votre profil boutique pour apparaître plus haut dans les résultats du quartier.',
  },
  {
    id: 'dashboard',
    icon: Icon(C.info).Dashboard,
    color: C.info,
    title: 'Tableau de bord',
    subtitle: 'Votre vue d\'ensemble en temps réel.',
    description: 'Le dashboard affiche vos chiffres clés : revenus du mois, commandes en cours, clients actifs et taux de retour. Les anneaux de progression vous donnent une vue instantanée de vos objectifs. Les insights IA analysent vos données pour vous suggérer des actions concrètes.',
    tip: '💡 Conseil : Consultez le dashboard chaque matin pour suivre votre activité quotidienne.',
    route: 'BusinessDashboard',
    routeLabel: 'Voir le dashboard',
  },
  {
    id: 'produits',
    icon: Icon(C.purple).Box,
    color: C.purple,
    title: 'Produits & Inventaire',
    subtitle: 'Gérez votre catalogue complet.',
    description: 'Ajoutez vos produits avec nom, prix, stock et catégorie. Le système vous alerte automatiquement quand un article est en rupture ou en stock faible. Utilisez la recherche et les filtres pour retrouver n\'importe quel produit en quelques secondes.',
    tip: '💡 Conseil : Ajoutez vos 5 meilleurs produits dès aujourd\'hui pour commencer à vendre.',
    route: 'Products',
    routeLabel: 'Gérer les produits',
  },
  {
    id: 'commandes',
    icon: Icon(C.warning).Clip,
    color: C.warning,
    title: 'Commandes',
    subtitle: 'Suivez chaque vente en temps réel.',
    description: 'Toutes vos commandes apparaissent ici avec leur statut : En attente, En cours, Expédié, Livré. Le système de détection de fraude IA signale automatiquement les commandes suspectes. Utilisez les filtres pour trier par statut ou date.',
    tip: '💡 Conseil : Activez les notifications pour être alerté à chaque nouvelle commande.',
    route: 'Orders',
    routeLabel: 'Voir les commandes',
  },
  {
    id: 'clients',
    icon: Icon(C.success).Users,
    color: C.success,
    title: 'Clients & Fidélité',
    subtitle: 'Connaissez vos clients par cœur.',
    description: 'Chaque client est segmenté automatiquement : VIP, Fidèle, Nouveau, ou Inactif. L\'IA génère des insights personnalisés — par exemple quand un VIP risque de ne plus acheter, ou quel client mérite une offre spéciale. Filtrez et cherchez en quelques clics.',
    tip: '💡 Conseil : Ciblez vos clients VIP en premier pour maximiser votre chiffre d\'affaires.',
    route: 'Customers',
    routeLabel: 'Voir les clients',
  },
  {
    id: 'pos',
    icon: Icon(C.accent).POS,
    color: C.accent,
    title: 'Caisse (POS)',
    subtitle: 'Encaissez vos ventes en boutique.',
    description: 'Le Point de Vente (POS) vous permet d\'encaisser directement en magasin. Sélectionnez les produits par catégorie, ajustez les quantités, appliquez des remises, et acceptez les paiements par carte, espèces ou mobile. Le reçu est généré automatiquement.',
    tip: '💡 Conseil : Le POS fonctionne en mode hors-ligne — vous ne perdez aucune vente.',
    route: 'POS',
    routeLabel: 'Ouvrir la caisse',
  },
  {
    id: 'facade',
    icon: Icon(C.purple).Facade,
    color: C.purple,
    title: 'Apparence de la boutique',
    subtitle: 'Personnalisez votre façade dans le quartier.',
    description: 'Modifiez les couleurs de votre façade, votre logo, votre slogan et votre vitrine. Les clients voient votre boutique dans la rue commerçante virtuelle — une belle façade attire plus de visiteurs. Mettez à jour votre apparence aussi souvent que vous le souhaitez.',
    tip: '💡 Conseil : Changez votre façade selon les saisons pour rester visible et attractif.',
    route: 'BoutiqueAppearance',
    routeLabel: 'Personnaliser la façade',
  },
];

const BoutiqueTutorialScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const goTo = (idx: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setStep(idx);
  };

  const current = STEPS[step];
  const isLast  = step === STEPS.length - 1;

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.skipHeaderBtn} onPress={() => navigation.navigate('BusinessDashboard')}>
          <Text style={s.skipHeaderText}>Passer →</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Guide de démarrage</Text>
        <Text style={s.headerStep}>{step + 1}/{STEPS.length}</Text>
      </View>

      {/* Dot progress */}
      <View style={s.dotRow}>
        {STEPS.map((_, i) => (
          <TouchableOpacity key={i} onPress={() => goTo(i)}>
            <View style={[s.dot, i === step && s.dotActive, i < step && s.dotDone]} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[s.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }]}>
          {/* Icon circle */}
          <View style={[s.iconCircle, { backgroundColor: current.color + '15' }]}>
            {current.icon}
          </View>
          <View style={[s.colorBar, { backgroundColor: current.color }]} />

          <Text style={s.cardSubtitle}>{current.subtitle}</Text>
          <Text style={s.cardTitle}>{current.title}</Text>
          <Text style={s.cardDescription}>{current.description}</Text>

          {/* Tip box */}
          <View style={s.tipBox}>
            <Text style={s.tipText}>{current.tip}</Text>
          </View>
        </Animated.View>

        {/* Module list (thumbnails) */}
        <View style={s.moduleRow}>
          {STEPS.map((st, i) => (
            <TouchableOpacity key={st.id} style={[s.moduleMini, i === step && s.moduleMiniActive, { borderColor: i === step ? st.color : C.border }]} onPress={() => goTo(i)}>
              <View style={{ opacity: i === step ? 1 : 0.5 }}>{st.icon ? React.cloneElement(st.icon as any, { }) : null}</View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={s.footer}>
        {current.route && (
          <TouchableOpacity style={[s.exploreBtn, { borderColor: current.color }]} onPress={() => navigation.navigate(current.route as any)} activeOpacity={0.8}>
            <Text style={[s.exploreBtnText, { color: current.color }]}>{current.routeLabel} →</Text>
          </TouchableOpacity>
        )}
        <View style={s.navBtns}>
          {step > 0 && (
            <TouchableOpacity style={s.backBtn} onPress={() => goTo(step - 1)}>
              <Text style={s.backBtnText}>← Précédent</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[s.nextBtn, { backgroundColor: isLast ? C.success : C.navy, flex: step > 0 ? 1 : undefined, minWidth: 160 }]}
            onPress={() => isLast ? navigation.navigate('BusinessDashboard') : goTo(step + 1)}
            activeOpacity={0.87}
          >
            <Text style={s.nextBtnText}>{isLast ? '✓ Commencer à vendre !' : 'Suivant →'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 14, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  skipHeaderBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  skipHeaderText:{ fontSize: 13, color: C.textLight, fontWeight: '500' },
  headerTitle:   { fontSize: 15, fontWeight: '700', color: C.textDark },
  headerStep:    { fontSize: 13, color: C.muted, fontWeight: '500' },

  dotRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: C.surface },
  dot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: C.border },
  dotActive: { width: 24, backgroundColor: C.accent },
  dotDone:   { backgroundColor: C.success },

  scroll:        { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 20, gap: 16 },

  card: {
    backgroundColor: C.surface, borderRadius: 20, padding: 24, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12,
    overflow: 'hidden', position: 'relative',
  },
  colorBar:     { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  iconCircle:   { width: 68, height: 68, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  cardSubtitle: { fontSize: 13, color: C.textLight, fontWeight: '600', letterSpacing: 0.4, textTransform: 'uppercase' },
  cardTitle:    { fontSize: 24, fontWeight: '800', color: C.textDark, lineHeight: 30 },
  cardDescription:{ fontSize: 15, color: C.textMid, lineHeight: 24 },
  tipBox:       { backgroundColor: '#FFF7ED', borderRadius: 10, padding: 14, borderLeftWidth: 3, borderLeftColor: C.accent },
  tipText:      { fontSize: 13, color: '#92400E', lineHeight: 19 },

  moduleRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  moduleMini:       { width: 52, height: 52, borderRadius: 14, borderWidth: 2, borderColor: C.border, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  moduleMiniActive: { backgroundColor: '#F8FAFC' },

  footer:      { padding: 20, paddingBottom: 36, backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border, gap: 12 },
  exploreBtn:  { height: 44, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  exploreBtnText: { fontSize: 14, fontWeight: '700' },
  navBtns:     { flexDirection: 'row', gap: 12 },
  backBtn:     { height: 50, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 14, color: C.textMid, fontWeight: '600' },
  nextBtn:     { height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  nextBtnText: { color: C.white, fontSize: 15, fontWeight: '700' },
});

export default BoutiqueTutorialScreen;
