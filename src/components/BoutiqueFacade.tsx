/**
 * BoutiqueFacade — the real "MODEL BOUTIQUE NIVEAU 1" artwork (white square,
 * person removed) with dynamic, sector-aware content layered on top:
 *   - boutique NAME on the sign board
 *   - the two vitrines show products from the boutique's domain (sector)
 *   - a restrained night lighting overlay (lit windows + glowing sign)
 *
 * Rendered through react-native-svg's SvgXml so it's identical on web & native.
 */
import React from 'react';
import { SvgXml } from 'react-native-svg';
import { MODEL_SVG } from './boutiqueModelSvg';

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

// ── sector → product family ─────────────────────────────────────────────────────
type Family = 'clothing' | 'electronics' | 'food' | 'jewelry' | 'beauty' | 'sport' | 'home' | 'books' | 'generic';
const familyForSector = (sector?: string): Family => {
  const s = (sector || '').toLowerCase();
  const has = (...k: string[]) => k.some((w) => s.includes(w));
  
  // First check for exact domain IDs
  if (s === 'mode') return 'clothing';
  if (s === 'electronique' || s === 'electromenager') return 'electronics';
  if (s === 'alimentaire') return 'food';
  if (s === 'bijoux') return 'jewelry';
  if (s === 'beaute') return 'beauty';
  if (s === 'sport') return 'sport';
  if (s === 'maison') return 'home';
  if (s === 'librairie') return 'books';
  
  // Fallback to keyword matching for backward compatibility
  if (has('mode', 'vêtem', 'vetem', 'fashion', 'habill', 'prêt', 'pret', 'textile')) return 'clothing';
  if (has('électro', 'electro', 'tech', 'inform', 'téléph', 'telep', 'phone', 'gadget', 'high')) return 'electronics';
  if (has('alim', 'épic', 'epic', 'food', 'restau', 'boulang', 'café', 'cafe', 'grocer', 'fruit')) return 'food';
  if (has('bijou', 'joaill', 'jewel', 'montre', 'accessoir', 'or ')) return 'jewelry';
  if (has('beaut', 'cosmé', 'cosme', 'parfum', 'soin', 'spa', 'coiff')) return 'beauty';
  if (has('sport', 'fitness', 'gym')) return 'sport';
  if (has('maison', 'déco', 'deco', 'meuble', 'home', 'jardin', 'quincaill')) return 'home';
  if (has('livre', 'librair', 'book', 'papet', 'presse')) return 'books';
  return 'generic';
};

// ── product vignette inside a window box (model coordinates) ────────────────────
// Each window interior is x..x+w, y..y+h  (≈ 223 × 151).
function windowProducts(fam: Family, x: number, y: number, w: number, h: number, v: number): string {
  const cx = x + w / 2;
  const fy = y + h - 8;           // floor line
  const shelf = '#9A8C78';
  const wood = '#B59A6B';

  switch (fam) {
    case 'clothing': {
      if (v === 0) {
        // three dresses on mannequin stands
        return ([[x + 50, '#EC4899'], [cx, '#8B5CF6'], [x + w - 50, '#EF4444']] as [number, string][])
          .map(([dx, c]) => `
            <line x1="${dx}" y1="${fy}" x2="${dx}" y2="${fy - 92}" stroke="${shelf}" stroke-width="3"/>
            <rect x="${dx - 13}" y="${fy - 2}" width="26" height="6" rx="2" fill="${shelf}"/>
            <circle cx="${dx}" cy="${fy - 100}" r="8" fill="${c}"/>
            <path d="M${dx} ${fy - 90} L${dx - 24} ${fy - 14} Q${dx} ${fy - 4} ${dx + 24} ${fy - 14} Z" fill="${c}"/>
            <path d="M${dx} ${fy - 90} L${dx - 9} ${fy - 48} L${dx + 9} ${fy - 48} Z" fill="#FFFFFF" opacity="0.22"/>`).join('');
      }
      // clothing rack
      const railY = y + 34;
      const cols = ['#F472B6', '#FBBF24', '#60A5FA', '#34D399', '#FB7185'];
      return `<line x1="${x + 22}" y1="${railY}" x2="${x + w - 22}" y2="${railY}" stroke="${shelf}" stroke-width="4"/>
        <line x1="${x + 30}" y1="${railY}" x2="${x + 30}" y2="${fy}" stroke="${shelf}" stroke-width="3"/>
        <line x1="${x + w - 30}" y1="${railY}" x2="${x + w - 30}" y2="${fy}" stroke="${shelf}" stroke-width="3"/>
        ${cols.map((c, i) => { const gx = x + 42 + i * ((w - 84) / 4); return `
          <line x1="${gx}" y1="${railY - 6}" x2="${gx}" y2="${railY + 2}" stroke="${shelf}" stroke-width="2"/>
          <path d="M${gx} ${railY + 2} L${gx - 17} ${fy - 12} Q${gx} ${fy - 3} ${gx + 17} ${fy - 12} Z" fill="${c}"/>`; }).join('')}`;
    }
    case 'electronics': {
      if (v === 0) {
        // flat-screen TV on a media console
        return `<rect x="${cx - 60}" y="${fy - 12}" width="120" height="14" rx="3" fill="#5B4636"/>
          <rect x="${cx - 50}" y="${fy - 74}" width="100" height="62" rx="4" fill="#1F2937"/>
          <rect x="${cx - 44}" y="${fy - 68}" width="88" height="50" rx="1" fill="#3B82F6"/>
          <rect x="${cx - 10}" y="${fy - 12}" width="20" height="6" fill="#1F2937"/>
          <rect x="${cx + 22}" y="${fy - 30}" width="26" height="18" rx="2" fill="#374151"/>`;
      }
      // laptop + smartphone on a desk
      return `<rect x="${cx - 60}" y="${fy - 6}" width="120" height="8" rx="2" fill="${wood}"/>
        <rect x="${cx - 52}" y="${fy - 54}" width="66" height="44" rx="3" fill="#1F2937"/>
        <rect x="${cx - 47}" y="${fy - 49}" width="56" height="34" fill="#60A5FA"/>
        <rect x="${cx - 26}" y="${fy - 10}" width="22" height="4" fill="#1F2937"/>
        <rect x="${cx + 26}" y="${fy - 40}" width="20" height="34" rx="3" fill="#111827"/>
        <rect x="${cx + 28}" y="${fy - 36}" width="16" height="24" fill="#60A5FA"/>`;
    }
    case 'food': {
      // two stocked shelves
      const s1 = y + 54, s2 = fy - 4;
      const apple = (ax: number, ay: number, c: string) => `<circle cx="${ax}" cy="${ay}" r="7" fill="${c}"/>`;
      const can = (bx: number, by: number, c: string) => `<rect x="${bx - 6}" y="${by - 22}" width="12" height="22" rx="2" fill="${c}"/>`;
      return `<line x1="${x + 18}" y1="${s1}" x2="${x + w - 18}" y2="${s1}" stroke="${wood}" stroke-width="5"/>
        <line x1="${x + 18}" y1="${s2}" x2="${x + w - 18}" y2="${s2}" stroke="${wood}" stroke-width="5"/>
        ${[0, 1, 2, 3, 4].map(i => apple(x + 34 + i * ((w - 68) / 4), s1 - 8, ['#EF4444', '#F59E0B', '#84CC16', '#EF4444', '#F59E0B'][i])).join('')}
        ${[0, 1, 2, 3, 4].map(i => can(x + 34 + i * ((w - 68) / 4), s2, ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'][i])).join('')}`;
    }
    case 'jewelry': {
      // velvet busts with necklaces + a ring
      const bust = (bx: number) => `<path d="M${bx} ${fy} L${bx - 18} ${fy} Q${bx - 18} ${fy - 40} ${bx} ${fy - 48} Q${bx + 18} ${fy - 40} ${bx + 18} ${fy} Z" fill="#334155"/>
        <path d="M${bx - 12} ${fy - 30} Q${bx} ${fy - 8} ${bx + 12} ${fy - 30}" stroke="#FBBF24" stroke-width="3" fill="none"/>
        <circle cx="${bx}" cy="${fy - 13}" r="3.5" fill="#FDE68A"/>`;
      return `<rect x="${x + 18}" y="${fy}" width="${w - 36}" height="4" fill="${wood}"/>
        ${bust(x + 64)}${bust(x + w - 64)}
        <path d="M${cx} ${fy - 70} l3 6 6.5 1 -4.7 4.6 1.1 6.5 -5.9 -3 -5.9 3 1.1 -6.5 -4.7 -4.6 6.5 -1 z" fill="#FDE68A"/>`;
    }
    case 'beauty': {
      // cosmetic bottles + a round mirror
      const bottle = (bx: number, bh: number, c: string) => `<rect x="${bx - 7}" y="${fy - bh}" width="14" height="${bh}" rx="3" fill="${c}"/><rect x="${bx - 3}" y="${fy - bh - 6}" width="6" height="6" fill="#94A3B8"/>`;
      return `<line x1="${x + 18}" y1="${fy}" x2="${x + w - 18}" y2="${fy}" stroke="${wood}" stroke-width="4"/>
        ${bottle(x + 44, 34, '#F9A8D4')}${bottle(x + 74, 48, '#C4B5FD')}${bottle(x + 104, 28, '#FBCFE8')}
        <circle cx="${x + w - 56}" cy="${fy - 44}" r="26" fill="#E2E8F0" stroke="#94A3B8" stroke-width="3"/>
        <circle cx="${x + w - 56}" cy="${fy - 44}" r="20" fill="#F8FAFC"/>`;
    }
    case 'sport': {
      // ball + dumbbell + sneaker
      return `<line x1="${x + 18}" y1="${fy}" x2="${x + w - 18}" y2="${fy}" stroke="${wood}" stroke-width="4"/>
        <circle cx="${x + 56}" cy="${fy - 18}" r="18" fill="#F1F5F9" stroke="#334155" stroke-width="2"/>
        <path d="M${x + 56} ${fy - 36} Q${x + 68} ${fy - 18} ${x + 56} ${fy} Q${x + 44} ${fy - 18} ${x + 56} ${fy - 36}" stroke="#334155" stroke-width="1.5" fill="none"/>
        <g><rect x="${cx - 4}" y="${fy - 26}" width="8" height="26" fill="#475569"/><circle cx="${cx}" cy="${fy - 30}" r="9" fill="#1F2937"/><circle cx="${cx}" cy="${fy}" r="9" fill="#1F2937"/></g>
        <path d="M${x + w - 78} ${fy - 4} l34 0 0 -10 -12 -4 -8 -8 -14 0 z" fill="#EF4444"/>
        <rect x="${x + w - 80}" y="${fy - 4}" width="40" height="5" rx="2" fill="#1F2937"/>`;
    }
    case 'home': {
      // armchair + floor lamp + plant
      return `<line x1="${x + 18}" y1="${fy}" x2="${x + w - 18}" y2="${fy}" stroke="${wood}" stroke-width="4"/>
        <rect x="${x + 36}" y="${fy - 40}" width="62" height="40" rx="6" fill="#60A5FA"/>
        <rect x="${x + 30}" y="${fy - 50}" width="14" height="40" rx="6" fill="#3B82F6"/>
        <rect x="${x + 90}" y="${fy - 50}" width="14" height="40" rx="6" fill="#3B82F6"/>
        <line x1="${x + w - 64}" y1="${fy}" x2="${x + w - 64}" y2="${fy - 70}" stroke="#475569" stroke-width="3"/>
        <path d="M${x + w - 80} ${fy - 70} l32 0 -6 -22 -20 0 z" fill="#FCD34D"/>
        <path d="M${x + w - 30} ${fy} l0 -16 M${x + w - 30} ${fy - 6} l-10 -12 M${x + w - 30} ${fy - 6} l10 -12" stroke="#2F9E44" stroke-width="4" stroke-linecap="round"/>
        <rect x="${x + w - 38}" y="${fy}" width="16" height="0.5" fill="#7C5A3A"/>`;
    }
    case 'books': {
      const cols = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];
      const shelfRow = (sy: number) => cols.map((c, i) => `<rect x="${x + 26 + i * ((w - 52) / cols.length)}" y="${sy - 30}" width="${(w - 52) / cols.length - 3}" height="30" rx="1.5" fill="${c}"/>`).join('') + `<line x1="${x + 18}" y1="${sy}" x2="${x + w - 18}" y2="${sy}" stroke="${wood}" stroke-width="4"/>`;
      return shelfRow(y + 58) + shelfRow(fy);
    }
    default: {
      // generic boxes on shelves
      const box = (bx: number, by: number, s: number) => `<rect x="${bx}" y="${by - s}" width="${s}" height="${s}" rx="2" fill="#D8C49A"/><line x1="${bx}" y1="${by - s / 2}" x2="${bx + s}" y2="${by - s / 2}" stroke="${wood}" stroke-width="1.5"/>`;
      const row = (sy: number) => `<line x1="${x + 18}" y1="${sy}" x2="${x + w - 18}" y2="${sy}" stroke="${wood}" stroke-width="4"/>` + [0, 1, 2, 3].map(i => box(x + 32 + i * ((w - 80) / 3), sy, 30)).join('');
      return row(y + 64) + row(fy);
    }
  }
}

// Repaint window interiors (hides the baked clothing) + draw domain products.
const windowsOverlay = (fam: Family) => {
  const L = { x: 105, y: 228, w: 223, h: 151 };
  const R = { x: 430, y: 228, w: 223, h: 151 };
  const glass = (b: typeof L) => `
    <rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="#A8E4F6"/>
    <rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h * 0.5}" fill="#CDEEFB"/>`;
  const reflection = (b: typeof L) => `
    <polygon points="${b.x + 24},${b.y} ${b.x + 60},${b.y} ${b.x + 14},${b.y + b.h} ${b.x - 22},${b.y + b.h}" fill="#FFFFFF" opacity="0.12"/>`;
  return `<g>
    ${glass(L)}${glass(R)}
    ${windowProducts(fam, L.x, L.y, L.w, L.h, 0)}
    ${windowProducts(fam, R.x, R.y, R.w, R.h, 1)}
    ${reflection(L)}${reflection(R)}
  </g>`;
};

// Night = just the storefront's own lights coming on (the Quartier scene already
// supplies the dark sky / moon / stars behind it). No full-canvas wash, so the
// transparent background keeps showing the street.
const nightLayer = () => `<g>
    <rect x="105" y="228" width="223" height="151" fill="#FFCF6B" opacity="0.42"/>
    <rect x="430" y="228" width="223" height="151" fill="#FFCF6B" opacity="0.42"/>
    <rect x="350" y="240" width="59" height="131" fill="#FFD98A" opacity="0.4"/>
    <rect x="100" y="128" width="558" height="66" fill="#FFE9A8" opacity="0.16"/>
    <rect x="109" y="135" width="540" height="53" fill="#FFF7E0" opacity="0.3"/>
    <circle cx="715" cy="238" r="20" fill="#FFE08A" opacity="0.3"/>
  </g>`;

const selectionRing = (color: string) =>
  `<rect x="84" y="60" width="588" height="392" rx="20" fill="none" stroke="${color}" stroke-width="7" stroke-dasharray="18 13"/>`;

export interface BoutiqueFacadeProps {
  name: string;
  sector?: string;
  level?: number;
  night?: boolean;
  open?: boolean;
  color?: string;
  width?: number;
  selected?: boolean;
}

const BoutiqueFacade: React.FC<BoutiqueFacadeProps> = ({
  name, sector, night = false, color = '#FF6B35', width = 260, selected = false,
}) => {
  const height = (width * 398) / 750; // cropped storefront (viewBox 750 × 398)
  const family = familyForSector(sector);

  const display = (name || 'BOUTIQUE').toUpperCase();
  const nameText = display.length > 16 ? display.slice(0, 15) + '…' : display;
  const fontSize = nameText.length <= 8 ? 36 : nameText.length <= 11 ? 30 : nameText.length <= 14 ? 25 : 21;

  const overlay =
    windowsOverlay(family) +
    (night ? nightLayer() : '') +
    (selected ? selectionRing(color) : '');

  const xml = MODEL_SVG
    .replace('{{NAME}}', escapeXml(nameText))
    .replace('{{FONTSIZE}}', String(fontSize))
    .replace('{{NIGHT}}', overlay);

  return <SvgXml xml={xml} width={width} height={height} />;
};

export default BoutiqueFacade;
