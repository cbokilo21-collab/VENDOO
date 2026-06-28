import React, { useState, useRef, useEffect } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  TextInput, Modal, Animated, Dimensions, StatusBar, Image, Easing
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBoutique } from '../contexts/BoutiqueContext';
import Svg, { Path, Circle, Rect, Ellipse, G, Line, Text as SvgText } from 'react-native-svg';

const { width: SW, height: SH } = Dimensions.get('window');

const C = {
  sky:         '#DBEAFE',
  skyDeep:     '#93C5FD',
  sun:         '#FCD34D',
  ground:      '#D1FAE5',
  road:        '#374151',
  roadLine:    '#F59E0B',
  sidewalk:    '#E5E7EB',
  building:    '#F3F4F6',
  buildingDark:'#E5E7EB',
  window:      '#93C5FD',
  windowDark:  '#60A5FA',
  door:        '#78350F',
  doorDark:    '#92400E',
  tree:        '#22C55E',
  treeDark:    '#16A34A',
  trunk:       '#92400E',
  navy:        '#FF6B35',
  white:       '#FFFFFF',
  accent:      '#FF6B35',
  muted:       '#94A3B8',
  textDark:    '#0F172A',
  textLight:   '#64748B',
  textMid:     '#475569',
  bg:          '#F8FAFC',
  border:      '#E2E8F0',
  warning:     '#F59E0B',
  success:     '#10B981',
};

type RootStackParamList = {
  QuartierScreen: undefined; BusinessDashboard: undefined;
  BoutiqueAppearance: undefined; BoutiqueCatalog: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList>;

interface Boutique {
  id: string;
  nom: string;
  proprietaire: string;
  secteur: string;
  emoji: string;
  couleur: string;
  accentC: string;
  ville: string;
  note: number;
  avis: number;
  produits: number;
  statut: 'ouvert' | 'ferme';
  niveau: number;
  description: string;
  bestSeller?: string;
}

const BOUTIQUES: Boutique[] = [
  {
    id: 'b1', nom: 'Mode Étoile', proprietaire: 'Cyril B.',
    secteur: 'Mode', emoji: '👗', couleur: '#FF6B35', accentC: '#FFFFFF',
    ville: 'Paris', note: 4.8, avis: 142, produits: 87, statut: 'ouvert', niveau: 4,
    description: 'La mode parisienne accessible à tous. Collections tendance chaque semaine.',
    bestSeller: 'Veste Bomber — € 199',
  },
  {
    id: 'b2', nom: 'Tech Paradise', proprietaire: 'Lucas M.',
    secteur: 'Électronique', emoji: '📱', couleur: '#3B82F6', accentC: '#EFF6FF',
    ville: 'Lyon', note: 4.6, avis: 89, produits: 53, statut: 'ouvert', niveau: 3,
    description: 'High-tech et gadgets au meilleur prix. Livraison express disponible.',
    bestSeller: 'Écouteurs Pro — € 129',
  },
  {
    id: 'b3', nom: 'Bijoux Lumière', proprietaire: 'Emma D.',
    secteur: 'Bijoux', emoji: '💍', couleur: '#8B5CF6', accentC: '#F5F3FF',
    ville: 'Bordeaux', note: 4.9, avis: 204, produits: 31, statut: 'ferme', niveau: 4,
    description: 'Créations artisanales uniques. Chaque pièce est une histoire.',
    bestSeller: 'Collier Diamant — € 340',
  },
  {
    id: 'b4', nom: 'Fresh Market', proprietaire: 'Sophie T.',
    secteur: 'Alimentaire', emoji: '🛒', couleur: '#10B981', accentC: '#F0FDF4',
    ville: 'Montréal', note: 4.5, avis: 67, produits: 120, statut: 'ouvert', niveau: 2,
    description: 'Produits frais du marché livrés chez vous.',
    bestSeller: 'Panier Bio — € 45',
  },
  {
    id: 'b5', nom: 'Sport Max', proprietaire: 'Thomas R.',
    secteur: 'Sport', emoji: '⚽', couleur: '#F59E0B', accentC: '#FFFBEB',
    ville: 'Marseille', note: 4.4, avis: 95, produits: 78, statut: 'ouvert', niveau: 3,
    description: 'Équipement sportif pour tous les niveaux. Expertise personnalisée.',
    bestSeller: 'Running Pro — € 89',
  },
  {
    id: 'b6', nom: 'Maison & Co', proprietaire: 'Chloé M.',
    secteur: 'Maison', emoji: '🏠', couleur: '#EC4899', accentC: '#FDF2F8',
    ville: 'Dakar', note: 4.7, avis: 115, produits: 49, statut: 'ferme', niveau: 3,
    description: 'Déco intérieure tendance pour sublimer votre espace.',
    bestSeller: 'Lampe Bohème — € 75',
  },
];

const SECTEURS = ['Tous', 'Quartier Électronique', 'Quartier Mode', 'Quartier Bijoux', 'Quartier Alimentaire', 'Quartier Sport', 'Quartier Maison'];

// ─── Animated Card Component ───────────────────────────────────────────────────
const AnimatedCard: React.FC<{ children: React.ReactNode; delay?: number; style?: any }> = ({ children, delay = 0, style }) => {
  const animY = useRef(new Animated.Value(20)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animY, {
        toValue: 0,
        duration: 600,
        delay,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(animOpacity, {
        toValue: 1,
        duration: 500,
        delay,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity: animOpacity, transform: [{ translateY: animY }] }]}>
      {children}
    </Animated.View>
  );
};

// ─── SVG Façade par niveau ────────────────────────────────────────────────────
const Facade: React.FC<{ b: Boutique; selected: boolean; onPress: () => void }> = ({ b, selected, onPress }) => {
  const W = 90, H = 110;
  const c = b.couleur, a = b.accentC;
  const signBg   = 'rgba(0,0,0,0.82)';
  const signText = '#FFFFFF';
  const bois  = '#8B5E3C';
  const boisD = '#5C3A1E';
  const boisL = '#A97850';

  const renderFacade = () => {
    if (b.niveau === 1) return (
      <G>
        <Rect x="10" y="40" width="100" height="90" rx="8" fill={c}/>
        <Rect x="10" y="40" width="100" height="25" rx="8" fill="rgba(0,0,0,0.25)"/>
        <Rect x="10" y="55" width="100" height="10" fill="rgba(0,0,0,0.25)"/>
        <Rect x="20" y="70" width="80" height="35" rx="4" fill="rgba(200,230,255,0.4)"/>
        <Rect x="22" y="72" width="76" height="31" rx="3" fill="rgba(180,210,240,0.3)"/>
        <Path d="M25 75 L35 72" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round"/>
        <Rect x="15" y="105" width="90" height="18" rx="4" fill="#2D3748"/>
        <Rect x="15" y="42" width="90" height="20" rx="4" fill={signBg} stroke={a} strokeWidth="2"/>
        <SvgText x="60" y="55" fontSize="11" fill={signText} textAnchor="middle" fontWeight="bold">{b.emoji}</SvgText>
      </G>
    );
    if (b.niveau === 2) return (
      <G>
        <Rect x="5" y="30" width="110" height="100" rx="6" fill={c}/>
        <Rect x="5" y="30" width="110" height="28" rx="6" fill="rgba(0,0,0,0.2)"/>
        <Rect x="8" y="33" width="104" height="22" rx="4" fill={signBg} stroke={a} strokeWidth="2"/>
        <SvgText x="60" y="47" fontSize="11" fill={signText} textAnchor="middle" fontWeight="bold">{b.emoji} {b.nom.substring(0,6)}</SvgText>
        <Rect x="15" y="62" width="35" height="28" rx="3" fill="rgba(200,230,255,0.5)"/>
        <Rect x="70" y="62" width="35" height="28" rx="3" fill="rgba(200,230,255,0.5)"/>
        <Rect x="15" y="95" width="35" height="28" rx="3" fill="rgba(200,230,255,0.5)"/>
        <Rect x="70" y="95" width="35" height="28" rx="3" fill="rgba(200,230,255,0.5)"/>
        <Rect x="15" y="125" width="90" height="5" rx="2" fill={boisD}/>
      </G>
    );
    return (
      <G>
        <Rect x="0" y="20" width="120" height="110" rx="4" fill={c}/>
        <Rect x="0" y="20" width="120" height="30" rx="4" fill="rgba(0,0,0,0.15)"/>
        <Rect x="3" y="23" width="114" height="24" rx="4" fill={signBg} stroke={a} strokeWidth="2"/>
        <SvgText x="60" y="39" fontSize="12" fill={signText} textAnchor="middle" fontWeight="bold">{b.emoji} {b.nom.substring(0,8)}</SvgText>
        <Rect x="10" y="55" width="30" height="25" rx="2" fill="rgba(200,230,255,0.5)"/>
        <Rect x="45" y="55" width="30" height="25" rx="2" fill="rgba(200,230,255,0.5)"/>
        <Rect x="80" y="55" width="30" height="25" rx="2" fill="rgba(200,230,255,0.5)"/>
        <Rect x="10" y="85" width="30" height="25" rx="2" fill="rgba(200,230,255,0.5)"/>
        <Rect x="45" y="85" width="30" height="25" rx="2" fill="rgba(200,230,255,0.5)"/>
        <Rect x="80" y="85" width="30" height="25" rx="2" fill="rgba(200,230,255,0.5)"/>
        <Rect x="45" y="115" width="30" height="15" rx="2" fill={boisD}/>
        <Path d="M20 115 L20 130 M100 115 L100 130" stroke={boisD} strokeWidth="4"/>
      </G>
    );
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={{ marginRight: 12 }}>
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {renderFacade()}
        {selected && (
          <Circle cx={W/2} cy={H/2} r={W/2 + 5} fill="none" stroke={C.accent} strokeWidth={3} strokeDasharray="6 4" />
        )}
      </Svg>
      <Text style={{ fontSize: 11, fontWeight: '700', color: C.textDark, textAlign: 'center', marginTop: 4 }}>{b.nom}</Text>
      <Text style={{ fontSize: 9, color: C.textLight, textAlign: 'center' }}>{b.secteur}</Text>
    </TouchableOpacity>
  );
};

// ─── Boutique detail modal ────────────────────────────────────────────────────
const BoutiqueModal: React.FC<{ b: Boutique | null; onClose: () => void }> = ({ b, onClose }) => {
  const navigation = useNavigation<Nav>();
  if (!b) return null;
  return (
    <Modal visible={!!b} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={md.root}>
        <View style={[md.banner, { backgroundColor: b.couleur }]}>
          <TouchableOpacity style={md.closeBtn} onPress={onClose}>
            <Text style={md.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={md.bannerEmoji}>{b.emoji}</Text>
          <Text style={md.bannerTitle}>{b.nom}</Text>
        </View>

        <ScrollView contentContainerStyle={md.content} showsVerticalScrollIndicator={false}>
          <View style={md.ratingRow}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill={C.warning} stroke="none">
              <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </Svg>
            <Text style={st.ratingText}>{b.note}</Text>
            <Text style={st.ratingCount}>({b.avis})</Text>
          </View>

          <View style={md.infoRow}>
            <View style={[md.sectorBadge, { backgroundColor: b.couleur + '18' }]}>
              <Text style={[md.sectorText, { color: b.couleur }]}>{b.emoji} {b.secteur}</Text>
            </View>
            <View style={md.locBadge}>
              <Text style={md.locText}>📍 {b.ville}</Text>
            </View>
          </View>

          <Text style={md.sectionTitle}>Description</Text>
          <Text style={md.description}>{b.description}</Text>

          <Text style={md.sectionTitle}>Informations</Text>
          <View style={md.infoGrid}>
            <View style={md.infoItem}>
              <Text style={md.infoLabel}>Propriétaire</Text>
              <Text style={md.infoValue}>{b.proprietaire}</Text>
            </View>
            <View style={md.infoItem}>
              <Text style={md.infoLabel}>Produits</Text>
              <Text style={md.infoValue}>{b.produits}</Text>
            </View>
            <View style={md.infoItem}>
              <Text style={md.infoLabel}>Statut</Text>
              <Text style={[md.infoValue, { color: b.statut === 'ouvert' ? C.success : C.textLight }]}>{b.statut === 'ouvert' ? 'Ouvert' : 'Fermé'}</Text>
            </View>
          </View>

          {b.bestSeller && (
            <View style={md.bestSellerCard}>
              <Text style={md.bestSellerLabel}>⭐ Best-seller</Text>
              <Text style={md.bestSellerValue}>{b.bestSeller}</Text>
            </View>
          )}

          <View style={md.divider} />

          {b.statut === 'ouvert' ? (
            <TouchableOpacity style={[md.ctaBtn, { backgroundColor: b.couleur }]} onPress={() => { onClose(); navigation.navigate('BoutiqueCatalog' as any); }} activeOpacity={0.87}>
              <Text style={[md.ctaBtnText, { color: b.accentC }]}>🛒 Entrer dans la boutique</Text>
            </TouchableOpacity>
          ) : (
            <View style={md.ctaBtnDisabled}>
              <Text style={md.ctaBtnDisabledText}>{b.statut === 'ferme' ? 'Boutique fermée — revenez bientôt' : '🔒 Boutique inaccessible'}</Text>
            </View>
          )}

          <TouchableOpacity style={md.favBtn} onPress={onClose}>
            <Text style={md.favBtnText}>♡ Ajouter aux favoris</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

// ─── Main QuartierScreen ──────────────────────────────────────────────────────
const QuartierScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { boutiqueData } = useBoutique();
  const [secteur, setSecteur]   = useState('Tous');
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState<Boutique | null>(null);
  const [time, setTime]         = useState<'jour' | 'nuit'>('jour');
  const [country, setCountry]   = useState('France');
  const [city, setCity]         = useState('Paris');
  const [showCountrySelector, setShowCountrySelector] = useState(false);

  const userBoutique: Boutique | null = boutiqueData.nom ? {
    id: 'user',
    nom: boutiqueData.nom,
    proprietaire: 'Vous',
    secteur: boutiqueData.secteur || 'Mode',
    emoji: '🏪',
    couleur: boutiqueData.couleur || '#FF6B35',
    accentC: '#FFFFFF',
    ville: boutiqueData.ville || 'Paris',
    note: 0,
    avis: 0,
    produits: 0,
    statut: 'ouvert',
    niveau: 1,
    description: boutiqueData.description || 'Votre boutique',
  } : null;

  const allBoutiques = userBoutique ? [userBoutique, ...BOUTIQUES] : BOUTIQUES;

  const filtred = allBoutiques.filter(b => {
    const matchesSecteur = secteur === 'Tous' || 
      (secteur === 'Quartier Électronique' && b.secteur === 'Électronique') ||
      (secteur === 'Quartier Mode' && b.secteur === 'Mode') ||
      (secteur === 'Quartier Bijoux' && b.secteur === 'Bijoux') ||
      (secteur === 'Quartier Alimentaire' && b.secteur === 'Alimentaire') ||
      (secteur === 'Quartier Sport' && b.secteur === 'Sport') ||
      (secteur === 'Quartier Maison' && b.secteur === 'Maison');
    const matchesSearch = b.nom.toLowerCase().includes(search.toLowerCase()) || 
                         b.proprietaire.toLowerCase().includes(search.toLowerCase());
    const matchesLocation = !country || b.ville === city || (country === 'France' && ['Paris', 'Lyon', 'Bordeaux', 'Marseille'].includes(b.ville));
    return matchesSecteur && matchesSearch && matchesLocation;
  });

  const COUNTRIES = [
    { id: 'fr', name: 'France', flag: '🇫🇷', cities: ['Paris', 'Lyon', 'Bordeaux', 'Marseille', 'Nice', 'Strasbourg'] },
    { id: 'be', name: 'Belgique', flag: '🇧🇪', cities: ['Bruxelles', 'Liège', 'Anvers', 'Gand', 'Charleroi'] },
    { id: 'ch', name: 'Suisse', flag: '🇨🇭', cities: ['Zurich', 'Genève', 'Bâle', 'Berne', 'Lausanne'] },
    { id: 'de', name: 'Allemagne', flag: '🇩🇪', cities: ['Berlin', 'Hambourg', 'Munich', 'Cologne', 'Francfort'] },
    { id: 'es', name: 'Espagne', flag: '🇪🇸', cities: ['Madrid', 'Barcelone', 'Valence', 'Séville', 'Bilbao'] },
    { id: 'it', name: 'Italie', flag: '🇮🇹', cities: ['Rome', 'Milan', 'Naples', 'Turin', 'Venise'] },
    { id: 'uk', name: 'Royaume-Uni', flag: '🇬🇧', cities: ['Londres', 'Manchester', 'Birmingham', 'Liverpool', 'Édimbourg'] },
    { id: 'us', name: 'États-Unis', flag: '🇺🇸', cities: ['New York', 'Los Angeles', 'Chicago', 'Miami', 'San Francisco'] },
    { id: 'ca', name: 'Canada', flag: '🇨🇦', cities: ['Toronto', 'Montréal', 'Vancouver', 'Calgary', 'Ottawa'] },
    { id: 'jp', name: 'Japon', flag: '🇯🇵', cities: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya'] },
  ];

  const groundCol = time === 'nuit' ? '#1E293B' : C.ground;
  const skyCol    = time === 'nuit' ? '#0F172A' : C.sky;

  return (
    <View style={s.root}>
      <StatusBar barStyle={time === 'nuit' ? 'light-content' : 'dark-content'} backgroundColor={skyCol} />

      {/* ── Header overlay ────────────────────────────────────────────── */}
      <View style={s.headerOverlay}>
        <View style={s.headerRow}>
          <View>
            <TouchableOpacity onPress={() => setShowCountrySelector(true)} style={s.locationBtn}>
              <Text style={[s.headerTitle, { color: time === 'nuit' ? C.white : C.navy }]}>
                Quartier {city} {COUNTRIES.find(c => c.name === country)?.flag}
              </Text>
              <Text style={[s.headerSub, { color: time === 'nuit' ? '#94A3B8' : '#374151' }]}>
                {country} · {filtred.length} boutique{filtred.length !== 1 ? 's' : ''} · {allBoutiques.filter(b => b.statut === 'ouvert').length} ouvertes
              </Text>
            </TouchableOpacity>
          </View>
          <View style={s.headerRight}>
            <TouchableOpacity style={[s.timeToggle, { backgroundColor: time === 'nuit' ? '#1E293B' : C.white }]} onPress={() => setTime(t => t === 'jour' ? 'nuit' : 'jour')}>
              <Text style={s.timeToggleText}>{time === 'jour' ? '🌙' : '☀️'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.dashBtn} onPress={() => navigation.navigate('BusinessDashboard')}>
              <Text style={s.dashBtnText}>Ma boutique →</Text>
            </TouchableOpacity>
          </View>
        </View>

        <AnimatedCard delay={0} style={[s.searchBar, { backgroundColor: time === 'nuit' ? '#1E293B' : C.white }]}>
          <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2}>
            <Circle cx="11" cy="11" r="8"/><Path d="m21 21-4.35-4.35" strokeLinecap="round"/>
          </Svg>
          <TextInput
            style={[s.searchInput, { color: time === 'nuit' ? C.white : C.textDark }]}
            placeholder="Rechercher une boutique..."
            placeholderTextColor={C.muted}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            clearButtonMode="while-editing"
            spellCheck={false}/>
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: C.muted, fontSize: 16, lineHeight: 20 }}>✕</Text>
            </TouchableOpacity>
          )}
        </AnimatedCard>

        <AnimatedCard delay={50} style={s.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}
            keyboardShouldPersistTaps="handled">
            {SECTEURS.map(sec => (
              <TouchableOpacity key={sec} style={[s.filterChip, secteur === sec && s.filterChipActive, time === 'nuit' && s.filterChipNight, secteur === sec && time === 'nuit' && s.filterChipActiveNight]} onPress={() => setSecteur(sec)}>
                <Text style={[s.filterText, secteur === sec && s.filterTextActive]}>{sec}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </AnimatedCard>
      </View>

      {/* ── Street scene ─────────────────────────────────────────────── */}
      <View style={[s.streetScene, { backgroundColor: groundCol }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.boutiqueRow}
          keyboardShouldPersistTaps="handled">
          {filtred.map(b => (
            <Facade key={b.id} b={b} selected={selected?.id === b.id} onPress={() => setSelected(b)} />
          ))}
        </ScrollView>

        {filtred.length === 0 && (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>🔍</Text>
            <Text style={s.emptyText}>Aucune boutique trouvée</Text>
          </View>
        )}
      </View>

      <BoutiqueModal b={selected} onClose={() => setSelected(null)} />
      
      {/* Country/Region Selector Modal */}
      <Modal visible={showCountrySelector} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowCountrySelector(false)}>
        <View style={cs.root}>
          <View style={cs.header}>
            <TouchableOpacity onPress={() => setShowCountrySelector(false)} style={cs.closeBtn}>
              <Text style={cs.closeBtnText}>✕</Text>
            </TouchableOpacity>
            <Text style={cs.title}>Explorer le monde</Text>
            <View style={{ width: 36 }} />
          </View>
          
          <ScrollView contentContainerStyle={cs.content} showsVerticalScrollIndicator={false}>
            <Text style={cs.sectionTitle}>Pays</Text>
            <View style={cs.countryGrid}>
              {COUNTRIES.map(c => (
                <TouchableOpacity 
                  key={c.id} 
                  style={[cs.countryCard, country === c.name && cs.countryCardActive]} 
                  onPress={() => { setCountry(c.name); setCity(c.cities[0]); }}
                  activeOpacity={0.8}
                >
                  <Text style={cs.countryFlag}>{c.flag}</Text>
                  <Text style={[cs.countryName, country === c.name && cs.countryNameActive]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {country && (
              <>
                <Text style={cs.sectionTitle}>Villes</Text>
                <View style={cs.cityGrid}>
                  {COUNTRIES.find(c => c.name === country)?.cities.map(city => (
                    <TouchableOpacity 
                      key={city} 
                      style={[cs.cityCard, city === city && cs.cityCardActive]} 
                      onPress={() => { setCity(city); setShowCountrySelector(false); }}
                      activeOpacity={0.8}
                    >
                      <Text style={[cs.cityName, city === city && cs.cityNameActive]}>{city}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.sky },
  headerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20, gap: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerTitle: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  headerRight: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  locationBtn: { gap: 2 },
  timeToggle: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  timeToggleText: { fontSize: 18 },
  dashBtn: { backgroundColor: C.navy, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  dashBtnText: { color: C.white, fontSize: 12, fontWeight: '700' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, paddingHorizontal: 14, height: 44, borderWidth: 1, borderColor: C.border },
  searchInput: { flex: 1, fontSize: 15, color: C.textDark },
  filterRow: { gap: 8, paddingBottom: 4 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.white },
  filterChipActive: { backgroundColor: C.accent, borderColor: C.accent },
  filterChipNight: { backgroundColor: '#1E293B', borderColor: '#374151' },
  filterChipActiveNight: { backgroundColor: C.accent, borderColor: C.accent },
  filterText: { fontSize: 13, color: C.textMid, fontWeight: '500' },
  filterTextActive: { color: C.white, fontWeight: '600' },
  streetScene: { flex: 1, marginTop: 200, paddingTop: 20 },
  boutiqueRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, paddingBottom: 20 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, color: C.textMid, fontWeight: '500' },
});

const md = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  banner: { paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20, alignItems: 'center', gap: 8 },
  closeBtn: { position: 'absolute', top: 56, left: 20, width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { color: C.white, fontSize: 18, fontWeight: '700' },
  bannerEmoji: { fontSize: 48 },
  bannerTitle: { fontSize: 24, fontWeight: '800', color: C.white },
  content: { padding: 20, gap: 20, paddingBottom: 32 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoRow: { flexDirection: 'row', gap: 8 },
  sectorBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  sectorText: { fontSize: 12, fontWeight: '600' },
  locBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: C.bg },
  locText: { fontSize: 12, color: C.textMid },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: C.textDark },
  description: { fontSize: 14, color: C.textMid, lineHeight: 20 },
  infoGrid: { flexDirection: 'row', gap: 12 },
  infoItem: { flex: 1, backgroundColor: C.bg, borderRadius: 10, padding: 12 },
  infoLabel: { fontSize: 12, color: C.textLight, marginBottom: 4 },
  infoValue: { fontSize: 15, fontWeight: '700', color: C.textDark },
  bestSellerCard: { backgroundColor: C.warning + '15', borderRadius: 10, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bestSellerLabel: { fontSize: 13, fontWeight: '700', color: C.warning },
  bestSellerValue: { fontSize: 14, fontWeight: '800', color: C.textDark },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 8 },
  ctaBtn: { borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  ctaBtnText: { fontSize: 16, fontWeight: '800' },
  ctaBtnDisabled: { backgroundColor: C.bg, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  ctaBtnDisabledText: { fontSize: 16, fontWeight: '700', color: C.textLight },
  favBtn: { alignItems: 'center', paddingVertical: 12 },
  favBtnText: { fontSize: 14, fontWeight: '600', color: C.accent },
});

const st = StyleSheet.create({
  ratingText: { fontSize: 18, fontWeight: '800', color: C.textDark },
  ratingCount: { fontSize: 13, color: C.textLight },
});

const cs = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  closeBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 18, color: C.textDark },
  title: { fontSize: 18, fontWeight: '800', color: C.textDark },
  content: { padding: 20, gap: 24, paddingBottom: 40 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: C.textLight, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  countryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  countryCard: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border, minWidth: 140 },
  countryCardActive: { backgroundColor: C.accent + '15', borderColor: C.accent },
  countryFlag: { fontSize: 24 },
  countryName: { fontSize: 14, fontWeight: '600', color: C.textDark },
  countryNameActive: { color: C.accent },
  cityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cityCard: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border },
  cityCardActive: { backgroundColor: C.accent, borderColor: C.accent },
  cityName: { fontSize: 14, fontWeight: '600', color: C.textDark },
  cityNameActive: { color: C.white },
});

export default QuartierScreen;
