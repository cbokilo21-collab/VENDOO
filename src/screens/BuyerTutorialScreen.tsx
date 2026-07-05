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
  BuyerTutorial: undefined; BuyerDashboard: undefined;
  Marketplace: undefined; QuartierScreen: undefined; Favorites: undefined;
  MyOrders: undefined; Messages: undefined;
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
  Explore:  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}><Circle cx="12" cy="12" r="10"/><Path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeLinecap="round" strokeLinejoin="round"/></Svg>,
  Store:    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}><Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round"/><Path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round"/></Svg>,
  Heart:    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}><Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round"/></Svg>,
  Cart:     <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}><Circle cx="9" cy="21" r="1"/><Circle cx="20" cy="21" r="1"/><Path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" strokeLinecap="round" strokeLinejoin="round"/></Svg>,
  Message:  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}><Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"/></Svg>,
  Map:      <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}><Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round"/><Circle cx="12" cy="10" r="3"/></Svg>,
  AI:       <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}><Circle cx="12" cy="12" r="10"/><Path d="M12 8v4M12 16h.01" strokeLinecap="round"/></Svg>,
});

const STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    icon: Icon(C.accent).Explore,
    color: C.accent,
    title: 'Bienvenue dans Vendoo !',
    subtitle: 'Votre quartier commerçant virtuel.',
    description: 'Vous venez de rejoindre Vendoo, la marketplace locale qui connecte les commerçants de votre quartier. Découvrez des boutiques uniques, des produits locaux et profitez de recommandations IA personnalisées.',
    tip: '💡 Conseil : Explorez les quartiers proches de chez vous pour trouver des trésors locaux.',
  },
  {
    id: 'marketplace',
    icon: Icon(C.info).Store,
    color: C.info,
    title: 'Marketplace',
    subtitle: 'Parcourez toutes les boutiques.',
    description: 'La marketplace centralise tous les commerçants Vendoo. Filtrez par catégorie, quartier ou prix pour trouver exactement ce que vous cherchez. Chaque boutique a sa propre identité et ses offres exclusives.',
    tip: '💡 Conseil : Utilisez la recherche pour trouver des produits spécifiques rapidement.',
    route: 'Marketplace',
    routeLabel: 'Explorer la marketplace',
  },
  {
    id: 'quartier',
    icon: Icon(C.purple).Map,
    color: C.purple,
    title: 'Quartiers',
    subtitle: 'Découvrez les commerçants près de chez vous.',
    description: 'Naviguez dans les quartiers commerçants virtuels comme si vous étiez dans la rue. Chaque quartier a ses boutiques, son ambiance et ses promotions. Ajoutez vos quartiers favoris en un clic.',
    tip: '💡 Conseil : Favorisez les quartiers proches pour une livraison plus rapide.',
    route: 'QuartierScreen',
    routeLabel: 'Voir les quartiers',
  },
  {
    id: 'favorites',
    icon: Icon(C.warning).Heart,
    color: C.warning,
    title: 'Favoris',
    subtitle: 'Gardez vos coups de cœur.',
    description: 'Ajoutez vos boutiques et produits préférés à vos favoris pour y accéder instantanément. Recevez des notifications quand vos boutiques favorites ajoutent de nouveaux produits ou font des promotions.',
    tip: '💡 Conseil : Suivez vos boutiques préférées pour ne rien manquer de leurs offres.',
    route: 'Favorites',
    routeLabel: 'Voir mes favoris',
  },
  {
    id: 'orders',
    icon: Icon(C.success).Cart,
    color: C.success,
    title: 'Mes commandes',
    subtitle: 'Suivez vos achats en temps réel.',
    description: 'Toutes vos commandes sont regroupées ici avec leur statut : En attente, En préparation, Expédié, Livré. Suivez la livraison en direct et accédez à l\'historique de vos achats.',
    tip: '💡 Conseil : Activez les notifications pour suivre l\'avancement de vos commandes.',
    route: 'MyOrders',
    routeLabel: 'Voir mes commandes',
  },
  {
    id: 'messages',
    icon: Icon(C.accent).Message,
    color: C.accent,
    title: 'Messages',
    subtitle: 'Communiquez avec les commerçants.',
    description: 'Contactez directement les boutiques pour poser des questions, demander des personnalisations ou négocier. Les commerçants répondent rapidement pour vous offrir le meilleur service.',
    tip: '💡 Conseil : N\'hésitez pas à demander des conseils aux commerçants sur leurs produits.',
    route: 'Messages',
    routeLabel: 'Voir mes messages',
  },
  {
    id: 'ai',
    icon: Icon(C.purple).AI,
    color: C.purple,
    title: 'Recommandations IA',
    subtitle: 'Des suggestions personnalisées pour vous.',
    description: 'Notre IA analyse vos préférences, vos achats et vos favoris pour vous recommander des produits et boutiques qui vous correspondent parfaitement. Plus vous utilisez Vendoo, plus les recommandations sont précises.',
    tip: '💡 Conseil : Interagissez avec les produits que vous aimez pour affiner les recommandations.',
  },
];

const BuyerTutorialScreen: React.FC = () => {
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
        useNativeDriver: false,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const goTo = (idx: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: false }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
    ]).start();
    setStep(idx);
  };

  const current = STEPS[step];
  const isLast  = step === STEPS.length - 1;

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.skipHeaderBtn} onPress={() => navigation.navigate('BuyerDashboard')}>
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
            onPress={() => isLast ? navigation.navigate('BuyerDashboard') : goTo(step + 1)}
            activeOpacity={0.87}
          >
            <Text style={s.nextBtnText}>{isLast ? '✓ Commencer à explorer !' : 'Suivant →'}</Text>
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

export default BuyerTutorialScreen;
