import React, { useState, useRef, useEffect } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  TextInput, Animated, Easing, Alert, Modal, FlatList,
  KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBoutique } from '../contexts/BoutiqueContext';
import { useAuth } from '../contexts/AuthContext';
import { BoutiqueService } from '../services/boutiqueService';
import DomainService from '../services/domainService';
import { slugify, generateShopUrl } from '../utils/slugify';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

const C = {
  navy: '#FF6B35', navyMid: '#FF8A5C',
  bg: '#FFF7F3', surface: '#FFFFFF', border: '#E5E7EB', borderFocus: '#FF6B35',
  accent: '#FF6B35', accentSoft: 'rgba(255,107,53,0.10)',
  textDark: '#111827', textMid: '#374151', textLight: '#6B7280', muted: '#9CA3AF',
  success: '#10B981', successSoft: '#D1FAE5',
  info: '#3B82F6', purple: '#8B5CF6',
  white: '#FFFFFF',
};

type RootStackParamList = {
  Login: undefined; Register: undefined;
  CreateBoutique: undefined; BoutiqueKeys: undefined;
  BusinessDashboard: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList>;

// ─── Data ─────────────────────────────────────────────────────────────────────
const SECTEURS = DomainService.getAllDomains();
const PAYS_DATA = DomainService.getAllPays();

const COULEURS = [
  { hex: '#FF6B35', label: 'Corail'   },
  { hex: '#3B82F6', label: 'Bleu'     },
  { hex: '#10B981', label: 'Vert'     },
  { hex: '#8B5CF6', label: 'Violet'   },
  { hex: '#F59E0B', label: 'Or'       },
  { hex: '#EF4444', label: 'Rouge'    },
  { hex: '#EC4899', label: 'Rose'     },
  { hex: '#0F172A', label: 'Nuit'     },
];

// Mapping pays -> devise
const PAYS_DEVISE: Record<string, string> = {
  // Europe
  'France': 'EUR', 'Belgique': 'EUR', 'Suisse': 'CHF', 'Allemagne': 'EUR',
  'Espagne': 'EUR', 'Italie': 'EUR', 'Portugal': 'EUR', 'Pays-Bas': 'EUR',
  'Royaume-Uni': 'GBP', 'Luxembourg': 'EUR', 'Autriche': 'EUR', 'Roumanie': 'EUR',
  'Pologne': 'PLN', 'Grèce': 'EUR',
  // Afrique centrale & Congo
  'Congo (RDC)': 'CDF', 'Congo (Brazzaville)': 'XAF', 'Gabon': 'XAF',
  'Centrafrique': 'XAF', 'Cameroun': 'XAF', 'Guinée équatoriale': 'XAF',
  'Burundi': 'BIF',
  // Afrique de l'Ouest
  "Côte d'Ivoire": 'XOF', 'Sénégal': 'XOF', 'Mali': 'XOF', 'Burkina Faso': 'XOF',
  'Guinée': 'GNF', 'Togo': 'XOF', 'Bénin': 'XOF', 'Niger': 'XOF', 'Nigeria': 'NGN',
  'Ghana': 'GHS', 'Sierra Leone': 'SLL', 'Liberia': 'LRD', 'Guinée-Bissau': 'XOF',
  'Gambie': 'GMD', 'Cap-Vert': 'CVE', 'Mauritanie': 'MRU',
  // Afrique du Nord
  'Maroc': 'MAD', 'Algérie': 'DZD', 'Tunisie': 'TND', 'Libye': 'LYD',
  'Égypte': 'EGP', 'Soudan': 'SDG',
  // Afrique de l'Est
  'Rwanda': 'RWF', 'Ouganda': 'UGX', 'Kenya': 'KES', 'Tanzanie': 'TZS',
  'Éthiopie': 'ETB', 'Somalie': 'SOS', 'Djibouti': 'DJF', 'Érythrée': 'ERN',
  'Zambie': 'ZMW', 'Zimbabwe': 'ZWL', 'Malawi': 'MWK', 'Mozambique': 'MZN',
  'Madagascar': 'MGA', 'Comores': 'KMF', 'Seychelles': 'SCR', 'Maurice': 'MUR',
  // Afrique du Sud
  'Afrique du Sud': 'ZAR', 'Angola': 'AOA', 'Namibie': 'NAD', 'Botswana': 'BWP',
  'Eswatini': 'SZL', 'Lesotho': 'LSL',
  // Amérique
  'États-Unis': 'USD', 'Canada': 'CAD', 'Brésil': 'BRL', 'Mexique': 'MXN',
  'Argentine': 'ARS', 'Colombie': 'COP', 'Pérou': 'PEN', 'Venezuela': 'VES',
  'Chili': 'CLP', 'Haïti': 'HTG', 'Martinique': 'EUR', 'Guadeloupe': 'EUR',
  'La Réunion': 'EUR',
  // Asie
  'Chine': 'CNY', 'Japon': 'JPY', 'Inde': 'INR', 'Émirats arabes unis': 'AED',
  'Arabie saoudite': 'SAR', 'Turquie': 'TRY',
  // Océanie
  'Australie': 'AUD', 'Nouvelle-Zélande': 'NZD',
  // Autre
  'Autre': 'EUR',
};

// ─── Dropdown component ───────────────────────────────────────────────────────
interface DropdownItem { label: string; value: string; meta?: string }
const Dropdown: React.FC<{
  label: string; placeholder: string; value: string;
  items: DropdownItem[]; onSelect: (v: string) => void; disabled?: boolean;
}> = ({ label, placeholder, value, items, onSelect, disabled }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = items.filter(i => i.label.toLowerCase().includes(search.toLowerCase()));
  const selected = items.find(i => i.value === value);

  return (
    <View style={dd.wrap}>
      <Text style={dd.label}>{label}</Text>
      <TouchableOpacity
        style={[dd.trigger, disabled && dd.triggerDisabled, open && dd.triggerOpen]}
        onPress={() => !disabled && setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={[dd.triggerText, !selected && dd.placeholderText]}>
          {selected ? selected.meta ? `${selected.meta} ${selected.label}` : selected.label : placeholder}
        </Text>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={disabled ? C.muted : C.textMid} strokeWidth={2}>
          <Path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={dd.backdrop} activeOpacity={1} onPress={() => setOpen(false)}/>
        <View style={dd.sheet}>
          <View style={dd.sheetHandle}/>
          <Text style={dd.sheetTitle}>{label}</Text>
          {items.length > 6 && (
            <View style={dd.searchBox}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2}>
                <Circle cx={11} cy={11} r={8}/><Path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
              </Svg>
              <TextInput
                style={dd.searchInput}
                placeholder="Rechercher..."
                placeholderTextColor={C.muted}
                value={search}
                onChangeText={setSearch}
                autoFocus
                autoCorrect={false}
              />
            </View>
          )}
          <FlatList
            data={filtered}
            keyExtractor={i => i.value}
            style={dd.list}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[dd.listItem, item.value === value && dd.listItemActive]}
                onPress={() => { onSelect(item.value); setSearch(''); setOpen(false); }}
              >
                {item.meta && <Text style={dd.itemMeta}>{item.meta}</Text>}
                <Text style={[dd.itemLabel, item.value === value && dd.itemLabelActive]}>{item.label}</Text>
                {item.value === value && (
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth={2.5}>
                    <Path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
};

const dd = StyleSheet.create({
  wrap:    { gap: 7 },
  label:   { fontSize: 13, fontWeight: '700', color: C.textMid, letterSpacing: 0.2 },
  trigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 58, borderWidth: 1.5, borderColor: C.border, borderRadius: 14, paddingHorizontal: 16, backgroundColor: C.bg },
  triggerDisabled: { opacity: 0.45 },
  triggerOpen:     { borderColor: C.borderFocus, backgroundColor: C.white },
  triggerText:     { fontSize: 16, color: C.textDark, fontWeight: '500', flex: 1 },
  placeholderText: { color: C.muted, fontWeight: '400' },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet:    { backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 12, paddingBottom: 40, maxHeight: '75%' },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginBottom: 16 },
  sheetTitle:  { fontSize: 17, fontWeight: '800', color: C.textDark, paddingHorizontal: 20, marginBottom: 14 },

  searchBox:   { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, backgroundColor: C.bg, borderRadius: 12, paddingHorizontal: 12, gap: 10, height: 46 },
  searchInput: { flex: 1, fontSize: 15, color: C.textDark },

  list:          { paddingHorizontal: 12 },
  listItem:      { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12 },
  listItemActive:{ backgroundColor: C.accentSoft },
  itemMeta:      { fontSize: 20 },
  itemLabel:     { flex: 1, fontSize: 15, color: C.textDark, fontWeight: '500' },
  itemLabelActive:{ color: C.accent, fontWeight: '700' },
});

// ─── Progress steps ───────────────────────────────────────────────────────────
const Steps: React.FC<{ step: number; total: number }> = ({ step, total }) => (
  <View style={st.row}>
    {Array.from({ length: total }).map((_, i) => {
      const done    = i + 1 < step;
      const active  = i + 1 === step;
      return (
        <React.Fragment key={i}>
          <View style={[st.dot, done && st.dotDone, active && st.dotActive]}>
            {done
              ? <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth={3}><Path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></Svg>
              : <Text style={[st.dotNum, active && st.dotNumActive]}>{i + 1}</Text>
            }
          </View>
          {i < total - 1 && <View style={[st.line, done && st.lineDone]}/>}
        </React.Fragment>
      );
    })}
  </View>
);
const st = StyleSheet.create({
  row:         { flexDirection: 'row', alignItems: 'center', flex: 1 },
  dot:         { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: C.border, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  dotDone:     { backgroundColor: C.success, borderColor: C.success },
  dotActive:   { backgroundColor: C.accent, borderColor: C.accent },
  dotNum:      { fontSize: 12, fontWeight: '700', color: C.muted },
  dotNumActive:{ color: C.white },
  line:        { flex: 1, height: 2, backgroundColor: C.border },
  lineDone:    { backgroundColor: C.success },
});

// ─── Facade preview SVG ───────────────────────────────────────────────────────
// ─── Façade boutique bois niveau 1 ──────────────────────────────────────────
const FacadePreview: React.FC<{ couleur: string; nom: string }> = ({ couleur, nom }) => {
  const label = (nom || 'MA BOUTIQUE').toUpperCase();

  // Palettes bois
  const bPlanche  = '#8B5E3C'; // planche principale
  const bLight    = '#A97850'; // planche claire
  const bDark     = '#5C3A1E'; // planche sombre / ombre
  const bGrain    = '#6B4528'; // veines bois

  return (
    <View style={fp.wrap}>
      <Svg width={260} height={210} viewBox="0 0 260 210">

        {/* ── Fond rue ─────────────────────────────────────────────── */}
        <Rect x={0}   y={0}   width={260} height={210} fill="#E9EDF2"/>
        {/* Trottoir */}
        <Rect x={0}   y={185} width={260} height={25}  fill="#C8BFAF"/>
        <Rect x={0}   y={185} width={260} height={4}   fill="#B8AD9C"/>
        {[52,104,156,208].map((x,i)=>(
          <Rect key={i} x={x} y={185} width={1} height={25} fill="rgba(0,0,0,0.07)"/>
        ))}

        {/* ── Ombre au sol ─────────────────────────────────────────── */}
        <Path d="M28 186 Q130 192 232 186"
          stroke="rgba(0,0,0,0.13)" strokeWidth={7} fill="none" strokeLinecap="round"/>

        {/* ══ STRUCTURE BOIS ══════════════════════════════════════════ */}

        {/* Poteaux porteurs gauche & droite */}
        <Rect x={18}  y={62} width={14} height={125} rx={4} fill={bDark}/>
        <Rect x={19}  y={62} width={4}  height={125} rx={2} fill={bLight} opacity={0.45}/>
        <Rect x={228} y={62} width={14} height={125} rx={4} fill={bDark}/>
        <Rect x={229} y={62} width={4}  height={125} rx={2} fill={bLight} opacity={0.45}/>

        {/* Traverse haute */}
        <Rect x={14}  y={58} width={232} height={10} rx={3} fill={bDark}/>
        <Rect x={16}  y={59} width={228} height={3}  rx={2} fill={bLight} opacity={0.3}/>

        {/* ── Mur arrière : planches verticales ───────────────────── */}
        {[34,54,74,94,114,134,154,174,194,214].map((x,i)=>(
          <Rect key={i} x={x} y={68} width={18} height={117}
            fill={i%2===0 ? bPlanche : bLight} rx={1}/>
        ))}
        {/* Joints entre planches */}
        {[34,54,74,94,114,134,154,174,194,214,232].map((x,i)=>(
          <Rect key={i} x={x} y={68} width={1.5} height={117} fill={bDark} opacity={0.5}/>
        ))}
        {/* Veines du bois */}
        {[
          "M42 75 Q46 90 43 105","M62 80 Q58 95 61 112",
          "M88 72 Q92 88 89 103","M108 85 Q104 100 107 118",
          "M148 74 Q152 90 149 108","M168 82 Q164 97 167 115",
          "M202 78 Q206 93 203 110","M222 86 Q218 101 221 118",
        ].map((d,i)=>(
          <Path key={i} d={d} stroke={bGrain} strokeWidth={1}
            fill="none" opacity={0.28} strokeLinecap="round"/>
        ))}

        {/* Traverse milieu (ceinture bois) */}
        <Rect x={18} y={120} width={224} height={8} rx={2} fill={bDark}/>
        <Rect x={20} y={121} width={220} height={3} rx={1} fill={bLight} opacity={0.25}/>

        {/* ── Fenêtre gauche ───────────────────────────────────────── */}
        <Rect x={28}  y={128} width={72} height={52} rx={3} fill={bDark}/>
        <Rect x={31}  y={131} width={66} height={46} rx={2} fill="rgba(190,225,255,0.38)"/>
        {/* Croisillon */}
        <Rect x={63}  y={131} width={2}  height={46} fill={bDark} opacity={0.7}/>
        <Rect x={31}  y={154} width={66} height={2}  fill={bDark} opacity={0.7}/>
        {/* Reflets */}
        <Path d="M34 134 L46 131" stroke="rgba(255,255,255,0.6)"
          strokeWidth={2} strokeLinecap="round"/>
        <Path d="M34 141 L50 135" stroke="rgba(255,255,255,0.35)"
          strokeWidth={1.5} strokeLinecap="round"/>
        {/* Rebord fenêtre bois */}
        <Rect x={26}  y={178} width={76} height={5} rx={2} fill={bDark}/>

        {/* ── Porte centrale bois ─────────────────────────────────── */}
        <Rect x={106} y={112} width={48} height={73} rx={3} fill={bDark}/>
        <Rect x={109} y={115} width={42} height={70} rx={2} fill={bPlanche}/>
        {/* Planches porte */}
        {[115,129,143,157,169,181].map((y,i)=>(
          <Rect key={i} x={111} y={y} width={38} height={12}
            fill={i%2===0 ? bPlanche : bLight} rx={1}/>
        ))}
        {/* Joints porte */}
        {[127,141,155,169,183].map((y,i)=>(
          <Rect key={i} x={111} y={y} width={38} height={1.5}
            fill={bDark} opacity={0.45}/>
        ))}
        {/* Petite vitre haut porte */}
        <Rect x={114} y={117} width={32} height={16} rx={2} fill="rgba(190,225,255,0.4)"/>
        <Rect x={128} y={117} width={2}  height={16} fill={bDark} opacity={0.4}/>
        <Path d="M117 120 L126 117" stroke="rgba(255,255,255,0.55)"
          strokeWidth={1.5} strokeLinecap="round"/>
        {/* Poignée */}
        <Rect x={148} y={152} width={5}  height={16} rx={2.5} fill="#B8862A"/>
        <Circle cx={150} cy={152} r={3} fill="#D4A840"/>
        {/* Marche */}
        <Rect x={100} y={183} width={60} height={5} rx={2} fill={bDark}/>
        <Rect x={102} y={181} width={56} height={4} rx={2} fill={bLight} opacity={0.35}/>

        {/* ── Fenêtre droite ───────────────────────────────────────── */}
        <Rect x={160} y={128} width={72} height={52} rx={3} fill={bDark}/>
        <Rect x={163} y={131} width={66} height={46} rx={2} fill="rgba(190,225,255,0.38)"/>
        <Rect x={195} y={131} width={2}  height={46} fill={bDark} opacity={0.7}/>
        <Rect x={163} y={154} width={66} height={2}  fill={bDark} opacity={0.7}/>
        <Path d="M166 134 L178 131" stroke="rgba(255,255,255,0.6)"
          strokeWidth={2} strokeLinecap="round"/>
        <Path d="M166 141 L182 135" stroke="rgba(255,255,255,0.35)"
          strokeWidth={1.5} strokeLinecap="round"/>
        <Rect x={158} y={178} width={76} height={5} rx={2} fill={bDark}/>

        {/* ══ AUVENT coloré (couleur choisie) ════════════════════════ */}
        {/* Structure auvent */}
        <Path d="M10 62 L250 62 L240 36 L20 36 Z" fill={couleur} opacity={0.97}/>
        {/* Rayures auvent */}
        {[26,46,66,86,106,126,146,166,186,206,226].map((x,i)=>(
          <Path key={i} d={`M${x} 36 L${x-6} 62`}
            stroke="rgba(255,255,255,0.22)" strokeWidth={7} fill="none"/>
        ))}
        {/* Ombre bas auvent */}
        <Rect x={10} y={60} width={240} height={4} rx={0} fill="rgba(0,0,0,0.2)"/>
        {/* Frange auvent */}
        {[16,28,40,52,64,76,88,100,112,124,136,148,160,172,184,196,208,220,232,244].map((x,i)=>(
          <Path key={i} d={`M${x} 62 L${x+4} 73`}
            stroke={couleur} strokeWidth={4} fill="none"
            strokeLinecap="round" opacity={0.9}/>
        ))}
        {/* Ligne bord auvent */}
        <Path d="M10 62 L250 62" stroke="rgba(0,0,0,0.2)" strokeWidth={1.5} fill="none"/>

        {/* ══ ENSEIGNE en bois ════════════════════════════════════════ */}
        {/* Fond panneau bois */}
        <Rect x={52}  y={16} width={156} height={26} rx={4} fill={bLight}/>
        <Rect x={54}  y={18} width={152} height={22} rx={3} fill={bPlanche}/>
        {/* Veines enseigne */}
        <Path d="M70 20 Q80 26 75 34" stroke={bGrain} strokeWidth={1}
          fill="none" opacity={0.3} strokeLinecap="round"/>
        <Path d="M160 20 Q170 26 165 34" stroke={bGrain} strokeWidth={1}
          fill="none" opacity={0.25} strokeLinecap="round"/>
        {/* Vis aux coins */}
        <Circle cx={60}  cy={29} r={3} fill={bDark}/>
        <Circle cx={200} cy={29} r={3} fill={bDark}/>
        <Circle cx={60}  cy={29} r={1} fill={bLight} opacity={0.5}/>
        <Circle cx={200} cy={29} r={1} fill={bLight} opacity={0.5}/>
        {/* Cordes suspentes */}
        <Path d="M72 16 L68 6"  stroke={bDark} strokeWidth={1.5} fill="none" opacity={0.7}/>
        <Path d="M188 16 L192 6" stroke={bDark} strokeWidth={1.5} fill="none" opacity={0.7}/>
        <Path d="M66 6 L194 6"  stroke={bDark} strokeWidth={1.5} fill="none" opacity={0.5}/>
        {/* Clous déco bord enseigne */}
        {[62,87,112,137,162,187].map((x,i)=>(
          <Circle key={i} cx={x} cy={18} r={1.5} fill={bDark} opacity={0.5}/>
        ))}

        {/* ── Guirlande lumineuse ──────────────────────────────────── */}
        <Path d="M22 36 Q70 28 130 26 Q190 28 238 36"
          stroke="rgba(0,0,0,0.2)" strokeWidth={1} fill="none"/>
        {[30,58,88,118,148,178,208,232].map((x,i)=>{
          const y = i%2===0 ? 33 : 29;
          return (
            <React.Fragment key={i}>
              <Circle cx={x} cy={y} r={4} fill="#FEF3C7" opacity={0.95}/>
              <Circle cx={x} cy={y} r={6} fill="#FEF3C7" opacity={0.18}/>
            </React.Fragment>
          );
        })}

        {/* ── Badge statut Ouvert ──────────────────────────────────── */}
        <Rect x={178} y={64} width={62} height={18} rx={9} fill="#D1FAE5" opacity={0.97}/>
        <Circle cx={191} cy={73} r={5}  fill="#10B981"/>
        <Circle cx={191} cy={73} r={2.5} fill="#6EE7B7"/>

      </Svg>

      {/* Nom sur l'enseigne */}
      <View style={fp.signOverlay} pointerEvents="none">
        <Text style={fp.signText} numberOfLines={1}>{label}</Text>
      </View>

      {/* Badge "Ouvert" overlay */}
      <View style={fp.statusOverlay} pointerEvents="none">
        <Text style={fp.statusText}>Ouvert</Text>
      </View>

      {/* Badges info */}
      <View style={fp.badgeRow}>
        <View style={fp.badgeWood}>
          <Text style={fp.badgeWoodText}>🪵 Stand bois · Niveau 1</Text>
        </View>
        <View style={[fp.badgeColor, { borderColor: couleur+'55', backgroundColor: couleur+'15' }]}>
          <View style={[fp.badgeDot, { backgroundColor: couleur }]}/>
          <Text style={[fp.badgeColorText, { color: couleur }]}>Auvent {couleur}</Text>
        </View>
      </View>
    </View>
  );
};

const fp = StyleSheet.create({
  wrap:          { alignItems: 'center' },
  signOverlay:   { position: 'absolute', top: 22, left: 0, right: 0, alignItems: 'center', paddingHorizontal: 60 },
  signText:      { color: '#FEF3C7', fontSize: 13, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase', textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  statusOverlay: { position: 'absolute', top: 68, right: 34 },
  statusText:    { color: '#065F46', fontSize: 9, fontWeight: '800' },
  badgeRow:      { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 },
  badgeWood:     { backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: '#FDE68A' },
  badgeWoodText: { fontSize: 11, fontWeight: '700', color: '#92400E' },
  badgeColor:    { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  badgeDot:      { width: 8, height: 8, borderRadius: 4 },
  badgeColorText:{ fontSize: 11, fontWeight: '700' },
});



// ─── Main ─────────────────────────────────────────────────────────────────────
const TOTAL = 6;

const CreateBoutiqueScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { setBoutiqueData } = useBoutique();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Form state
  const [boutiqueName, setBoutiqueName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [secteur, setSecteur]     = useState('');
  const [paysNom, setPaysNom]     = useState('');
  const [villeNom, setVilleNom]   = useState('');
  const [quartierNom, setQuartierNom] = useState('');
  const [couleur, setCouleur]     = useState(C.accent);
  const [currency, setCurrency]   = useState('EUR');
  const [focused, setFocused]     = useState<string | null>(null);
  
  // Chatbot configuration
  const [enableChatbot, setEnableChatbot] = useState(true);
  const [chatbotName, setChatbotName] = useState('Assistant');
  const [chatbotTone, setChatbotTone] = useState('professionnel');
  const [welcomeMessage, setWelcomeMessage] = useState('Bonjour ! Comment puis-je vous aider ?');

  // Auto-update currency when country changes
  useEffect(() => {
    if (paysNom && PAYS_DEVISE[paysNom]) {
      setCurrency(PAYS_DEVISE[paysNom]);
    }
  }, [paysNom]);

  const paysData = PAYS_DATA.find(p => p.nom === paysNom);
  const villesItems: DropdownItem[] = paysData
    ? paysData.villes.map(v => ({ label: v, value: v }))
    : [];
  const quartiersItems: DropdownItem[] = (paysData && villeNom)
    ? (paysData as any).quartiers?.[villeNom]?.map((q: string) => ({ label: q, value: q })) || []
    : [];
  const paysItems: DropdownItem[] = PAYS_DATA.map(p => ({ label: p.nom, value: p.nom, meta: p.flag }));

  const animateStep = (dir: 1 | -1) => {
    slideAnim.setValue(dir * 30);
    Animated.timing(slideAnim, { toValue: 0, duration: 240, easing: Easing.ease, useNativeDriver: true }).start();
  };

  const next = async () => {
    if (step === 1 && !boutiqueName.trim()) { Alert.alert('Requis', 'Donnez un nom à votre boutique.'); return; }
    if (step === 2 && !secteur)            { Alert.alert('Requis', 'Choisissez votre secteur.'); return; }
    if (step === 3 && (!paysNom || !villeNom || !quartierNom)) { Alert.alert('Requis', 'Choisissez un pays, une ville et un quartier.'); return; }
    if (step === 4 && !couleur)           { Alert.alert('Requis', 'Choisissez une couleur de façade.'); return; }
    if (step < TOTAL) { animateStep(1); setStep(s => s + 1); }
    else {
      if (!user) {
        Alert.alert('Erreur', 'Vous devez être connecté pour créer une boutique.');
        return;
      }

      setIsSaving(true);
      try {
        // Generate slug and public shop URL
        const slug = slugify(boutiqueName);
        const shopUrl = generateShopUrl(boutiqueName);

        // Save boutique to Firestore
        const boutiqueId = await BoutiqueService.create(user.uid, {
          nom: boutiqueName,
          slug: slug,
          shopUrl: shopUrl,
          description: description,
          logo: logo,
          website: website,
          instagram: instagram,
          facebook: facebook,
          email: email,
          phone: phone,
          secteur: secteur,
          pays: paysNom,
          ville: villeNom,
          quartier: quartierNom,
          couleur: couleur,
          currency: currency,
          timezone: 'Europe/Paris',
          chatbot: {
            enabled: enableChatbot,
            name: chatbotName,
            tone: chatbotTone,
            welcomeMessage: welcomeMessage,
          },
        });

        // Save boutique data to context with the Firestore ID
        setBoutiqueData({
          id: boutiqueId,
          nom: boutiqueName,
          slug: slug,
          shopUrl: shopUrl,
          description: description,
          logo: logo,
          website: website,
          instagram: instagram,
          facebook: facebook,
          email: email,
          phone: phone,
          secteur: secteur,
          pays: paysNom,
          ville: villeNom,
          quartier: quartierNom,
          couleur: couleur,
          currency: currency,
          timezone: 'Europe/Paris',
          chatbot: {
            enabled: enableChatbot,
            name: chatbotName,
            tone: chatbotTone,
            welcomeMessage: welcomeMessage,
          },
        });

        navigation.navigate('BoutiqueKeys');
      } catch (error) {
        console.error('Error creating boutique:', error);
        Alert.alert('Erreur', 'Impossible de créer la boutique. Veuillez réessayer.');
      } finally {
        setIsSaving(false);
      }
    }
  };
  const back = () => {
    if (step > 1) { animateStep(-1); setStep(s => s - 1); }
    else navigation.goBack();
  };

  const selectedSec = SECTEURS.find(s => s.id === secteur);

  // ── Step 1: Nom ─────────────────────────────────────────────────────────────
  const Step1 = (
    <View style={s.stepContent}>
      <View style={[s.stepIconWrap, { backgroundColor: '#FFF0EB' }]}>
        <Text style={s.stepEmoji}>🏪</Text>
      </View>
      <View style={s.stepHead}>
        <Text style={s.stepTitle}>Nommez votre boutique</Text>
        <Text style={s.stepSubtitle}>Ce nom sera affiché sur votre façade dans le quartier virtuel.</Text>
      </View>
      <View style={s.fieldGroup}>
        <Text style={s.fieldLabel}>Nom de la boutique</Text>
        <TextInput
          style={[s.input, focused === 'name' && s.inputFocused]}
          placeholder="ex : Tech Paradise, Mode Étoile..."
          placeholderTextColor={C.muted}
          value={boutiqueName}
          onChangeText={setBoutiqueName}
          onFocus={() => setFocused('name')}
          onBlur={() => setFocused(null)}
          autoFocus
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          clearButtonMode="while-editing"
          maxLength={40}
        />
        <Text style={s.charCount}>{boutiqueName.length}/40 caractères</Text>
      </View>

      {boutiqueName.length > 0 && (
        <View style={s.livePreview}>
          <View style={[s.previewAvatar, { backgroundColor: couleur }]}>
            <Text style={s.previewAvatarText}>{boutiqueName[0].toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.previewName}>{boutiqueName}</Text>
            <Text style={s.previewHint}>Aperçu de votre boutique</Text>
          </View>
          <View style={[s.previewDot, { backgroundColor: C.success }]}/>
        </View>
      )}

      <View style={s.tipCard}>
        <Text style={s.tipIcon}>💡</Text>
        <Text style={s.tipText}>Choisissez un nom court et mémorable — vos clients le verront en premier dans le quartier.</Text>
      </View>
    </View>
  );

  // ── Step 2: Secteur ─────────────────────────────────────────────────────────
  const Step2 = (
    <View style={s.stepContent}>
      <View style={[s.stepIconWrap, { backgroundColor: '#EFF6FF' }]}>
        <Text style={s.stepEmoji}>🏷️</Text>
      </View>
      <View style={s.stepHead}>
        <Text style={s.stepTitle}>Secteur d'activité</Text>
        <Text style={s.stepSubtitle}>Choisissez la catégorie qui correspond à ce que vous vendez.</Text>
      </View>
      <View style={s.sectorGrid}>
        {SECTEURS.map(sec => {
          const active = secteur === sec.id;
          return (
            <TouchableOpacity
              key={sec.id}
              style={[s.sectorCard, active && { borderColor: sec.color, backgroundColor: sec.color + '12' }]}
              onPress={() => setSecteur(sec.id)}
              activeOpacity={0.75}
            >
              <View style={s.sectorCardTop}>
                <Text style={s.sectorEmoji}>{sec.emoji}</Text>
                {active && (
                  <View style={[s.sectorCheck, { backgroundColor: sec.color }]}>
                    <Svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth={3}>
                      <Path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                    </Svg>
                  </View>
                )}
              </View>
              <Text style={[s.sectorLabel, active && { color: sec.color, fontWeight: '700' }]}>{sec.nom}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  // ── Step 3: Localisation ────────────────────────────────────────────────────
  const Step3 = (
    <View style={s.stepContent}>
      <View style={[s.stepIconWrap, { backgroundColor: '#F0FDF4' }]}>
        <Text style={s.stepEmoji}>📍</Text>
      </View>
      <View style={s.stepHead}>
        <Text style={s.stepTitle}>Votre localisation</Text>
        <Text style={s.stepSubtitle}>Vos clients vous trouveront dans le bon quartier selon votre ville.</Text>
      </View>

      <Dropdown
        label="Pays"
        placeholder="Sélectionnez votre pays..."
        value={paysNom}
        items={paysItems}
        onSelect={(v) => { setPaysNom(v); setVilleNom(''); }}
      />

      <Dropdown
        label="Ville"
        placeholder={paysNom ? 'Sélectionnez votre ville...' : 'Choisissez d\'abord un pays'}
        value={villeNom}
        items={villesItems}
        onSelect={(v) => { setVilleNom(v); setQuartierNom(''); }}
        disabled={!paysNom}
      />

      <Dropdown
        label="Quartier"
        placeholder={villeNom ? 'Sélectionnez votre quartier...' : 'Choisissez d\'abord une ville'}
        value={quartierNom}
        items={quartiersItems}
        onSelect={setQuartierNom}
        disabled={!villeNom}
      />

      {paysNom && villeNom && quartierNom && (
        <View style={s.locationConfirm}>
          <View style={s.locationConfirmIcon}>
            <Text style={{ fontSize: 20 }}>{PAYS_DATA.find(p => p.nom === paysNom)?.flag}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.locationConfirmCity}>{villeNom}</Text>
            <Text style={s.locationConfirmCountry}>{paysNom}</Text>
          </View>
          <View style={s.locationConfirmBadge}>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.success} strokeWidth={2.5}>
              <Path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
            <Text style={s.locationConfirmBadgeText}>Confirmé</Text>
          </View>
        </View>
      )}

      <View style={s.tipCard}>
        <Text style={s.tipIcon}>🏘️</Text>
        <Text style={s.tipText}>Votre boutique apparaîtra dans le quartier virtuel de votre ville pour attirer des clients locaux.</Text>
      </View>
    </View>
  );

  // ── Step 4: Apparence ───────────────────────────────────────────────────────
  const Step4 = (
    <View style={s.stepContent}>
      <View style={[s.stepIconWrap, { backgroundColor: '#FAF5FF' }]}>
        <Text style={s.stepEmoji}>🎨</Text>
      </View>
      <View style={s.stepHead}>
        <Text style={s.stepTitle}>Couleur de façade</Text>
        <Text style={s.stepSubtitle}>Cette couleur identifie votre boutique dans la rue commerçante.</Text>
      </View>

      <View style={s.colorGrid}>
        {COULEURS.map(c => {
          const active = couleur === c.hex;
          return (
            <TouchableOpacity key={c.hex} style={s.colorItem} onPress={() => setCouleur(c.hex)} activeOpacity={0.8}>
              <View style={[s.colorSwatch, { backgroundColor: c.hex }, active && s.colorSwatchActive]}>
                {active && (
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth={3}>
                    <Path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                )}
              </View>
              <Text style={[s.colorLabel, active && { color: c.hex, fontWeight: '700' }]}>{c.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Live façade preview */}
      <View style={s.facadeCard}>
        <FacadePreview couleur={couleur} nom={boutiqueName}/>
        <View style={s.facadeInfo}>
          <View style={[s.facadePill, { backgroundColor: couleur + '18', borderColor: couleur + '40', borderWidth: 1 }]}>
            <Text style={[s.facadePillText, { color: couleur }]}>{selectedSec?.emoji} {selectedSec?.nom || 'Secteur'}</Text>
          </View>
          <Text style={s.facadeLocation}>📍 {villeNom || 'Ville'}, {paysNom || 'Pays'}</Text>
        </View>
      </View>
    </View>
  );

  // ── Step 5: Informations détaillées ───────────────────────────────────────────
  const Step5 = (
    <View style={s.stepContent}>
      <View style={[s.stepIconWrap, { backgroundColor: '#F0F9FF' }]}>
        <Text style={s.stepEmoji}>📝</Text>
      </View>
      <View style={s.stepHead}>
        <Text style={s.stepTitle}>Informations détaillées</Text>
        <Text style={s.stepSubtitle}>Complétez votre profil pour attirer plus de clients.</Text>
      </View>

      <View style={s.fieldGroup}>
        <Text style={s.fieldLabel}>Description</Text>
        <TextInput
          style={[s.textArea, focused === 'description' && s.inputFocused]}
          placeholder="Décrivez votre boutique en quelques mots..."
          placeholderTextColor={C.muted}
          value={description}
          onChangeText={setDescription}
          onFocus={() => setFocused('description')}
          onBlur={() => setFocused(null)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={500}
        />
        <Text style={s.charCount}>{description.length}/500</Text>
      </View>

      <View style={s.fieldGroup}>
        <Text style={s.fieldLabel}>URL du logo</Text>
        <TextInput
          style={[s.input, focused === 'logo' && s.inputFocused]}
          placeholder="https://..."
          placeholderTextColor={C.muted}
          value={logo}
          onChangeText={setLogo}
          onFocus={() => setFocused('logo')}
          onBlur={() => setFocused(null)}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          clearButtonMode="while-editing"
        />
      </View>

      <View style={s.fieldGroup}>
        <Text style={s.fieldLabel}>Site web</Text>
        <TextInput
          style={[s.input, focused === 'website' && s.inputFocused]}
          placeholder="https://monsite.com"
          placeholderTextColor={C.muted}
          value={website}
          onChangeText={setWebsite}
          onFocus={() => setFocused('website')}
          onBlur={() => setFocused(null)}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          clearButtonMode="while-editing"
        />
      </View>

      <View style={s.fieldGroup}>
        <Text style={s.fieldLabel}>Instagram</Text>
        <TextInput
          style={[s.input, focused === 'instagram' && s.inputFocused]}
          placeholder="@votrecompte"
          placeholderTextColor={C.muted}
          value={instagram}
          onChangeText={setInstagram}
          onFocus={() => setFocused('instagram')}
          onBlur={() => setFocused(null)}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          clearButtonMode="while-editing"
        />
      </View>

      <View style={s.fieldGroup}>
        <Text style={s.fieldLabel}>Facebook</Text>
        <TextInput
          style={[s.input, focused === 'facebook' && s.inputFocused]}
          placeholder="facebook.com/votrepage"
          placeholderTextColor={C.muted}
          value={facebook}
          onChangeText={setFacebook}
          onFocus={() => setFocused('facebook')}
          onBlur={() => setFocused(null)}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          clearButtonMode="while-editing"
        />
      </View>

      <View style={s.fieldGroup}>
        <Text style={s.fieldLabel}>Email de contact</Text>
        <TextInput
          style={[s.input, focused === 'email' && s.inputFocused]}
          placeholder="contact@boutique.com"
          placeholderTextColor={C.muted}
          value={email}
          onChangeText={setEmail}
          onFocus={() => setFocused('email')}
          onBlur={() => setFocused(null)}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          returnKeyType="done"
          clearButtonMode="while-editing"
        />
      </View>

      <View style={s.fieldGroup}>
        <Text style={s.fieldLabel}>Téléphone</Text>
        <TextInput
          style={[s.input, focused === 'phone' && s.inputFocused]}
          placeholder="+33 6 12 34 56 78"
          placeholderTextColor={C.muted}
          value={phone}
          onChangeText={setPhone}
          onFocus={() => setFocused('phone')}
          onBlur={() => setFocused(null)}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="phone-pad"
          returnKeyType="done"
          clearButtonMode="while-editing"
        />
      </View>

      <View style={s.tipCard}>
        <Text style={s.tipIcon}>💡</Text>
        <Text style={s.tipText}>Ces informations sont optionnelles mais recommandées pour une meilleure visibilité.</Text>
      </View>
    </View>
  );

  // ── Step 6: Chatbot Intelligent ───────────────────────────────────────────────
  const Step6 = (
    <View style={s.stepContent}>
      <View style={[s.stepIconWrap, { backgroundColor: '#EDE9FE' }]}>
        <Text style={s.stepEmoji}>🤖</Text>
      </View>
      <View style={s.stepHead}>
        <Text style={s.stepTitle}>Chatbot Intelligent</Text>
        <Text style={s.stepSubtitle}>Configurez votre assistant IA pour répondre automatiquement aux clients.</Text>
      </View>

      <View style={s.fieldGroup}>
        <View style={s.switchRow}>
          <Text style={s.fieldLabel}>Activer le chatbot</Text>
          <TouchableOpacity 
            style={[s.switch, enableChatbot && s.switchActive]} 
            onPress={() => setEnableChatbot(!enableChatbot)}
            activeOpacity={0.8}
          >
            <View style={[s.switchKnob, enableChatbot && s.switchKnobActive]} />
          </TouchableOpacity>
        </View>
      </View>

      {enableChatbot && (
        <>
          <View style={s.fieldGroup}>
            <Text style={s.fieldLabel}>Nom du chatbot</Text>
            <TextInput
              style={[s.input, focused === 'chatbotName' && s.inputFocused]}
              placeholder="ex : Assistant, Julie, Max..."
              placeholderTextColor={C.muted}
              value={chatbotName}
              onChangeText={setChatbotName}
              onFocus={() => setFocused('chatbotName')}
              onBlur={() => setFocused(null)}
              autoCapitalize="words"
              returnKeyType="done"
              clearButtonMode="while-editing"
            />
          </View>

          <View style={s.fieldGroup}>
            <Text style={s.fieldLabel}>Ton de communication</Text>
            <View style={s.toneOptions}>
              {[
                { value: 'professionnel', label: 'Professionnel' },
                { value: 'amical', label: 'Amical' },
                { value: 'formal', label: 'Formel' },
                { value: 'casual', label: 'Décontracté' },
              ].map((tone) => (
                <TouchableOpacity
                  key={tone.value}
                  style={[s.toneOption, chatbotTone === tone.value && s.toneOptionActive]}
                  onPress={() => setChatbotTone(tone.value)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.toneOptionText, chatbotTone === tone.value && s.toneOptionTextActive]}>
                    {tone.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={s.fieldGroup}>
            <Text style={s.fieldLabel}>Message d'accueil</Text>
            <TextInput
              style={[s.textArea, focused === 'welcomeMessage' && s.inputFocused]}
              placeholder="Le premier message que le chatbot enverra aux clients..."
              placeholderTextColor={C.muted}
              value={welcomeMessage}
              onChangeText={setWelcomeMessage}
              onFocus={() => setFocused('welcomeMessage')}
              onBlur={() => setFocused(null)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={200}
            />
            <Text style={s.charCount}>{welcomeMessage.length}/200</Text>
          </View>

          <View style={s.tipCard}>
            <Text style={s.tipIcon}>✨</Text>
            <Text style={s.tipText}>Le chatbot utilisera l'IA Vendoo pour répondre intelligemment aux questions de vos clients 24h/24.</Text>
          </View>
        </>
      )}
    </View>
  );

  const steps = [Step1, Step2, Step3, Step4, Step5, Step6];
  const stepLabels = ['Nom', 'Secteur', 'Lieu', 'Design', 'Infos', 'Chatbot'];

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={back} style={s.backBtn}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.textDark} strokeWidth={2}>
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Steps step={step} total={TOTAL}/>
        </View>
        <View style={{ width: 36 }}/>
      </View>

      {/* Step labels */}
      <View style={s.stepLabelsRow}>
        {stepLabels.map((l, i) => (
          <Text key={i} style={[s.stepLabelText, i + 1 === step && s.stepLabelActive]}>{l}</Text>
        ))}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
            {steps[step - 1]}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer CTA */}
      <View style={s.footer}>
        <View style={s.footerMeta}>
          <Text style={s.footerStep}>Étape {step}/{TOTAL}</Text>
          <Text style={s.footerLabel}>{stepLabels[step - 1]}</Text>
        </View>
        <TouchableOpacity style={s.nextBtn} onPress={next} activeOpacity={0.87}>
          <Text style={s.nextBtnText}>
            {step < TOTAL ? 'Continuer' : '🔑 Finaliser'}
          </Text>
          {step < TOTAL && (
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth={2.5}>
              <Path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.surface },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: C.border, gap: 12 },
  backBtn:      { width: 36, height: 36, borderRadius: 10, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },

  stepLabelsRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 10, gap: 0, borderBottomWidth: 1, borderBottomColor: C.border },
  stepLabelText: { flex: 1, textAlign: 'center', fontSize: 11, color: C.muted, fontWeight: '500' },
  stepLabelActive:{ color: C.accent, fontWeight: '800' },

  scroll:        { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 24 },
  stepContent:   { gap: 22 },

  stepIconWrap: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  stepEmoji:    { fontSize: 32 },
  stepHead:     { gap: 6 },
  stepTitle:    { fontSize: 26, fontWeight: '800', color: C.textDark, lineHeight: 33 },
  stepSubtitle: { fontSize: 15, color: C.textLight, lineHeight: 22 },

  fieldGroup:  { gap: 8 },
  fieldLabel:  { fontSize: 13, fontWeight: '700', color: C.textMid, letterSpacing: 0.2 },
  input:       { height: 58, borderWidth: 1.5, borderColor: C.border, borderRadius: 14, paddingHorizontal: 18, fontSize: 17, color: C.textDark, backgroundColor: C.bg },
  textArea:    { height: 120, borderWidth: 1.5, borderColor: C.border, borderRadius: 14, paddingHorizontal: 18, paddingTop: 14, fontSize: 16, color: C.textDark, backgroundColor: C.bg },
  inputFocused:{ borderColor: C.borderFocus, backgroundColor: C.white },
  charCount:   { fontSize: 11, color: C.muted, textAlign: 'right' },
  
  // Chatbot step styles
  switchRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switch:      { width: 52, height: 28, borderRadius: 14, backgroundColor: C.border, padding: 2 },
  switchActive:{ backgroundColor: C.success },
  switchKnob:  { width: 24, height: 24, borderRadius: 12, backgroundColor: C.white, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  switchKnobActive: { transform: [{ translateX: 24 }] },
  toneOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  toneOption:  { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border },
  toneOptionActive: { backgroundColor: C.purple + '15', borderColor: C.purple },
  toneOptionText: { fontSize: 13, fontWeight: '600', color: C.textMid },
  toneOptionTextActive: { color: C.purple },

  livePreview: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.bg, borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: C.border },
  previewAvatar:    { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  previewAvatarText:{ color: C.white, fontSize: 22, fontWeight: '800' },
  previewName:  { fontSize: 16, fontWeight: '700', color: C.textDark },
  previewHint:  { fontSize: 12, color: C.muted, marginTop: 2 },
  previewDot:   { width: 10, height: 10, borderRadius: 5 },

  tipCard:  { flexDirection: 'row', gap: 12, backgroundColor: '#FFFBEB', borderRadius: 14, padding: 14, borderLeftWidth: 3, borderLeftColor: '#F59E0B', alignItems: 'flex-start' },
  tipIcon:  { fontSize: 18 },
  tipText:  { flex: 1, fontSize: 13, color: '#92400E', lineHeight: 19 },

  sectorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sectorCard: { width: '47%', backgroundColor: C.bg, borderRadius: 14, borderWidth: 1.5, borderColor: C.border, padding: 14, gap: 8 },
  sectorCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  sectorEmoji:   { fontSize: 26 },
  sectorCheck:   { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sectorLabel:   { fontSize: 13, fontWeight: '500', color: C.textMid, lineHeight: 18 },

  locationConfirm:      { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.successSoft, borderRadius: 16, padding: 16 },
  locationConfirmIcon:  { width: 44, height: 44, borderRadius: 12, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center' },
  locationConfirmCity:  { fontSize: 16, fontWeight: '800', color: '#065F46' },
  locationConfirmCountry:{ fontSize: 13, color: '#047857', marginTop: 2 },
  locationConfirmBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.success, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  locationConfirmBadgeText: { fontSize: 12, fontWeight: '700', color: C.white },

  colorGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorItem:  { alignItems: 'center', gap: 6, width: '22%' },
  colorSwatch:{ width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'transparent' },
  colorSwatchActive: { borderColor: C.textDark, transform: [{ scale: 1.12 }] },
  colorLabel: { fontSize: 11, color: C.muted, fontWeight: '500' },

  facadeCard: { backgroundColor: C.bg, borderRadius: 20, borderWidth: 1.5, borderColor: C.border, overflow: 'hidden', alignItems: 'center', paddingTop: 24, paddingBottom: 16, gap: 14 },
  facadeInfo: { alignItems: 'center', gap: 8 },
  facadePill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  facadePillText:{ fontSize: 13, fontWeight: '600' },
  facadeLocation:{ fontSize: 12, color: C.textLight },

  footer:     { padding: 20, paddingBottom: 36, borderTopWidth: 1, borderTopColor: C.border, gap: 12 },
  footerMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  footerStep: { fontSize: 12, color: C.muted, fontWeight: '500' },
  footerLabel:{ fontSize: 12, color: C.accent, fontWeight: '700' },
  nextBtn:    { backgroundColor: C.accent, height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: C.navy, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 14 },
  nextBtnText:{ color: C.white, fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
});

export default CreateBoutiqueScreen;
