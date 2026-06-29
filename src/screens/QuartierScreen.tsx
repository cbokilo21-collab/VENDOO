import React, { useState, useRef, useEffect } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  TextInput, Modal, Animated, Dimensions, StatusBar, Image, Easing
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBoutique } from '../contexts/BoutiqueContext';
import Svg, {
  Path, Circle, Rect, Ellipse, G, Line, Text as SvgText,
  Defs, LinearGradient as SvgGrad, Stop, Polygon, RadialGradient,
} from 'react-native-svg';

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

// ─── Colour helpers ───────────────────────────────────────────────────────────
const shade = (hex: string, pct: number) => {
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  const n = parseInt(h, 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const r = clamp((n >> 16) * (1 + pct));
  const g = clamp(((n >> 8) & 0xff) * (1 + pct));
  const b = clamp((n & 0xff) * (1 + pct));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

// ─── Street backdrop (sky · sun/moon · road · sidewalk) ────────────────────────
const SceneBackdrop: React.FC<{ width: number; height: number; night: boolean }> = ({ width, height, night }) => {
  const roadH = 56;
  const walkH = 30;
  const roadY = height - roadH;
  const walkY = roadY - walkH;
  const dashes = Math.ceil(width / 38) + 1;

  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      <Defs>
        <SvgGrad id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={night ? '#0B1026' : '#BFE0FF'} />
          <Stop offset="1" stopColor={night ? '#26244B' : '#EAF6FF'} />
        </SvgGrad>
        <RadialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor={night ? '#FDFCEF' : '#FFF6C8'} stopOpacity="1" />
          <Stop offset="1" stopColor={night ? '#FDFCEF' : '#FFE07A'} stopOpacity="0" />
        </RadialGradient>
        <SvgGrad id="walk" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={night ? '#3A4159' : '#EEF1F5'} />
          <Stop offset="1" stopColor={night ? '#2B3147' : '#DDE3EA'} />
        </SvgGrad>
        <SvgGrad id="road" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={night ? '#1A1F30' : '#3A4150'} />
          <Stop offset="1" stopColor={night ? '#11151F' : '#2A303B'} />
        </SvgGrad>
      </Defs>

      {/* Sky */}
      <Rect x="0" y="0" width={width} height={height} fill="url(#sky)" />

      {/* Sun / Moon glow */}
      <Circle cx={width - 64} cy={64} r={70} fill="url(#sun)" />
      <Circle cx={width - 64} cy={64} r={24} fill={night ? '#EAEAF2' : '#FFD45E'} />
      {night && <Circle cx={width - 54} cy={58} r={20} fill="#26244B" />}

      {/* Stars (night) */}
      {night && [...Array(14)].map((_, i) => (
        <Circle key={i} cx={(i * 53) % (width - 20) + 10} cy={(i * 37) % 90 + 16}
          r={i % 3 === 0 ? 1.6 : 1} fill="#FFFFFF" opacity={0.85} />
      ))}

      {/* Clouds (day) */}
      {!night && [[40, 50], [width * 0.42, 38], [width * 0.7, 70]].map(([cx, cy], i) => (
        <G key={i} opacity={0.9}>
          <Ellipse cx={cx} cy={cy} rx={26} ry={13} fill="#FFFFFF" />
          <Ellipse cx={cx + 22} cy={cy + 4} rx={20} ry={11} fill="#FFFFFF" />
          <Ellipse cx={cx - 20} cy={cy + 5} rx={16} ry={9} fill="#F4F9FF" />
        </G>
      ))}

      {/* Distant skyline silhouette */}
      <G opacity={night ? 0.5 : 0.28}>
        {[...Array(Math.ceil(width / 46))].map((_, i) => {
          const bw = 38, bx = i * 46 + 4;
          const bh = 40 + ((i * 53) % 46);
          return <Rect key={i} x={bx} y={walkY - bh} width={bw} height={bh} rx={3}
            fill={night ? '#171B33' : '#9DB7CF'} />;
        })}
      </G>

      {/* Sidewalk */}
      <Rect x="0" y={walkY} width={width} height={walkH} fill="url(#walk)" />
      <Line x1="0" y1={walkY + 1} x2={width} y2={walkY + 1} stroke={night ? '#535C7A' : '#FFFFFF'} strokeWidth="1.5" opacity={0.6} />
      {/* Sidewalk seams */}
      {[...Array(Math.ceil(width / 46))].map((_, i) => (
        <Line key={i} x1={i * 46} y1={walkY} x2={i * 46} y2={walkY + walkH}
          stroke={night ? '#3F465F' : '#CFD6DE'} strokeWidth="1" opacity={0.6} />
      ))}

      {/* Road */}
      <Rect x="0" y={roadY} width={width} height={roadH} fill="url(#road)" />
      {/* Centre dashes */}
      {[...Array(dashes)].map((_, i) => (
        <Rect key={i} x={i * 38 + 6} y={roadY + roadH / 2 - 2} width={20} height={4} rx={2}
          fill={night ? '#C9A53A' : '#F4C430'} opacity={0.9} />
      ))}
    </Svg>
  );
};

// ─── SVG Façade — polished storefront ──────────────────────────────────────────
const Facade: React.FC<{ b: Boutique; selected: boolean; night: boolean; onPress: () => void }> = ({ b, selected, night, onPress }) => {
  const W = 132, H = 176;
  const uid = b.id;
  const c = b.couleur;
  const cDark = shade(c, -0.32);
  const cLight = shade(c, 0.22);
  const signBg = '#1A1430';
  const open = b.statut === 'ouvert';

  // Window glow: warm at night, cool reflective by day
  const winTop = night ? '#FFE6A6' : '#CFE9FF';
  const winBot = night ? '#FFC24D' : '#9FCDF2';
  const winOp = night ? 1 : 0.92;

  const groundShadow = (
    <Ellipse cx={W / 2} cy={H - 8} rx={56} ry={9} fill="rgba(0,0,0,0.18)" />
  );

  // Striped awning generator
  const Awning = ({ x, y, w, scale = 1 }: { x: number; y: number; w: number; scale?: number }) => {
    const stripes = Math.round(w / 16);
    const sw = w / stripes;
    const flapH = 12 * scale;
    return (
      <G>
        <Rect x={x} y={y} width={w} height={10 * scale} fill={cDark} rx={2} />
        {[...Array(stripes)].map((_, i) => (
          <Rect key={i} x={x + i * sw} y={y} width={sw} height={10 * scale}
            fill={i % 2 === 0 ? c : '#FFFFFF'} opacity={0.96} />
        ))}
        {/* Scalloped flap */}
        {[...Array(stripes)].map((_, i) => (
          <Path key={i}
            d={`M${x + i * sw} ${y + 10 * scale} L${x + i * sw + sw} ${y + 10 * scale} L${x + i * sw + sw / 2} ${y + 10 * scale + flapH} Z`}
            fill={i % 2 === 0 ? c : '#FFFFFF'} opacity={0.96} />
        ))}
      </G>
    );
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={{ marginRight: 14, alignItems: 'center' }}>
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Defs>
          <SvgGrad id={`wall-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={cLight} />
            <Stop offset="0.5" stopColor={c} />
            <Stop offset="1" stopColor={cDark} />
          </SvgGrad>
          <SvgGrad id={`win-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={winTop} stopOpacity={winOp} />
            <Stop offset="1" stopColor={winBot} stopOpacity={winOp} />
          </SvgGrad>
        </Defs>

        {groundShadow}

        {/* Building body */}
        <Rect x="12" y="44" width="108" height="120" rx="7" fill={`url(#wall-${uid})`} />
        {/* Right-side depth shade */}
        <Rect x="104" y="44" width="16" height="120" rx="7" fill="rgba(0,0,0,0.12)" />
        {/* Cornice */}
        <Rect x="8" y="40" width="116" height="10" rx="4" fill={cDark} />

        {/* Sign board */}
        <Rect x="16" y="20" width="100" height="22" rx="5" fill={signBg} />
        <Rect x="16" y="20" width="100" height="22" rx="5" fill="none" stroke={c} strokeWidth="2" />
        {night && <Rect x="14" y="18" width="104" height="26" rx="6" fill={c} opacity={0.18} />}
        <SvgText x={W / 2} y="35" fontSize="11" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">
          {b.emoji} {b.nom.length > 9 ? b.nom.slice(0, 9) + '…' : b.nom}
        </SvgText>

        {/* Awning */}
        <Awning x={16} y={52} w={100} />

        {/* Display windows (warm/cool glow) */}
        <Rect x="20" y="80" width="42" height="44" rx="4" fill={`url(#win-${uid})`} />
        <Rect x="70" y="80" width="42" height="44" rx="4" fill={`url(#win-${uid})`} />
        {/* Window frames */}
        <Rect x="20" y="80" width="42" height="44" rx="4" fill="none" stroke={cDark} strokeWidth="2" />
        <Rect x="70" y="80" width="42" height="44" rx="4" fill="none" stroke={cDark} strokeWidth="2" />
        {/* Reflection streaks */}
        <Path d="M26 84 L34 84 L24 110 L16 110 Z" fill="#FFFFFF" opacity={night ? 0.12 : 0.28} />
        <Path d="M76 84 L84 84 L74 110 L66 110 Z" fill="#FFFFFF" opacity={night ? 0.12 : 0.28} />

        {/* Door */}
        <Rect x="54" y="126" width="24" height="38" rx="3" fill={cDark} />
        <Rect x="57" y="130" width="18" height="30" rx="2" fill={`url(#win-${uid})`} opacity={0.85} />
        <Circle cx="72" cy="146" r="1.8" fill="#FFE082" />

        {/* Open / closed door sign */}
        <Rect x="58" y="134" width="16" height="7" rx="2" fill={open ? '#16A34A' : '#DC2626'} />
        <SvgText x="66" y="139.6" fontSize="4.6" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">
          {open ? 'OPEN' : 'FERMÉ'}
        </SvgText>

        {/* Potted plants (level 3+) */}
        {b.niveau >= 3 && (
          <G>
            <Rect x="24" y="150" width="12" height="14" rx="2" fill={cDark} />
            <Circle cx="27" cy="148" r="5" fill="#34C759" />
            <Circle cx="33" cy="148" r="5" fill="#2EA84B" />
            <Rect x="96" y="150" width="12" height="14" rx="2" fill={cDark} />
            <Circle cx="99" cy="148" r="5" fill="#34C759" />
            <Circle cx="105" cy="148" r="5" fill="#2EA84B" />
          </G>
        )}

        {/* String lights at night (level 4) */}
        {night && b.niveau >= 4 && (
          <G>
            <Path d="M12 50 Q66 60 120 50" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none" />
            {[20, 40, 60, 80, 100].map((x, i) => (
              <Circle key={i} cx={x} cy={54 + Math.sin(i) * 2} r={2.4}
                fill={['#FFD54F', '#FF8A5C', '#FFFFFF'][i % 3]} opacity={0.95} />
            ))}
          </G>
        )}

        {/* Selection ring */}
        {selected && (
          <Rect x="6" y="16" width="120" height="152" rx="12" fill="none"
            stroke={C.accent} strokeWidth="3" strokeDasharray="7 5" />
        )}
      </Svg>

      {/* Rating + status pill under the storefront */}
      <View style={fc.nameRow}>
        <Text style={[fc.name, night && { color: '#F1F5F9' }]} numberOfLines={1}>{b.nom}</Text>
      </View>
      <View style={fc.metaRow}>
        {b.note > 0 && (
          <View style={fc.ratingPill}>
            <Text style={fc.ratingStar}>★</Text>
            <Text style={fc.ratingTxt}>{b.note.toFixed(1)}</Text>
          </View>
        )}
        <View style={[fc.statusDot, { backgroundColor: open ? C.success : '#94A3B8' }]} />
        <Text style={[fc.statusTxt, night && { color: '#CBD5E1' }]}>{open ? 'Ouvert' : 'Fermé'}</Text>
      </View>
    </TouchableOpacity>
  );
};

const fc = StyleSheet.create({
  nameRow:    { marginTop: 6, maxWidth: 124 },
  name:       { fontSize: 12, fontWeight: '800', color: C.textDark, textAlign: 'center' },
  metaRow:    { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 10 },
  ratingStar: { fontSize: 9, color: '#F59E0B' },
  ratingTxt:  { fontSize: 10, fontWeight: '800', color: '#B45309' },
  statusDot:  { width: 6, height: 6, borderRadius: 3 },
  statusTxt:  { fontSize: 10, fontWeight: '600', color: C.textLight },
});

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
      <View style={s.streetScene}>
        <SceneBackdrop width={SW} height={SH - 200} night={time === 'nuit'} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.boutiqueScroll} contentContainerStyle={s.boutiqueRow}
          keyboardShouldPersistTaps="handled">
          {filtred.map(b => (
            <Facade key={b.id} b={b} selected={selected?.id === b.id} night={time === 'nuit'} onPress={() => setSelected(b)} />
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

      {/* ── Innovation Section ─────────────────────────────────────────────── */}
      <View style={innovation.root}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={innovation.scrollContent}>
          <View style={innovation.card}>
            <Text style={innovation.cardIcon}>🚀</Text>
            <Text style={innovation.cardTitle}>Le Futur du Commerce</Text>
            <Text style={innovation.cardDesc}>Une expérience immersive qui réinvente la façon de découvrir et acheter des produits locaux.</Text>
          </View>
          <View style={innovation.card}>
            <Text style={innovation.cardIcon}>🌍</Text>
            <Text style={innovation.cardTitle}>Commerce Mondial</Text>
            <Text style={innovation.cardDesc}>Connectez-vous avec des boutiques du monde entier dans un quartier virtuel sans frontières.</Text>
          </View>
          <View style={innovation.card}>
            <Text style={innovation.cardIcon}>💡</Text>
            <Text style={innovation.cardTitle}>Innovation 3D</Text>
            <Text style={innovation.cardDesc}>Des façades interactives et une navigation intuitive pour une expérience d'achat unique.</Text>
          </View>
        </ScrollView>
      </View>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <View style={footer.root}>
        <Text style={footer.text}>Développée et gérée par</Text>
        <Text style={footer.brand}>Axis com</Text>
        <Text style={footer.tagline}>L'innovation au service du commerce</Text>
      </View>
      
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
  streetScene: { flex: 1, marginTop: 200, overflow: 'hidden' },
  boutiqueScroll: { position: 'absolute', left: 0, right: 0, bottom: 44, top: 16 },
  boutiqueRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 20, gap: 10, minWidth: '100%' },
  emptyState: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, color: C.textMid, fontWeight: '500' },
});

const innovation = StyleSheet.create({
  root: { backgroundColor: C.white, paddingVertical: 20, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: C.border },
  scrollContent: { gap: 16 },
  card: { width: 280, backgroundColor: C.bg, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border },
  cardIcon: { fontSize: 32, marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: C.textDark, marginBottom: 8 },
  cardDesc: { fontSize: 13, color: C.textMid, lineHeight: 18 },
});

const footer = StyleSheet.create({
  root: { backgroundColor: C.navy, paddingVertical: 24, paddingHorizontal: 20, alignItems: 'center', gap: 4 },
  text: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  brand: { fontSize: 18, fontWeight: '800', color: C.white, letterSpacing: 1 },
  tagline: { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' },
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
