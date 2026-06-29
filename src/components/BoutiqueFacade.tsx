/**
 * BoutiqueFacade — illustrated storefront for the marketplace / Quartier.
 *
 * Inspired by the "LOCAL SHOP" flat-design model:
 *  - wooden slatted roof
 *  - cream sign board carrying the boutique NAME (lights up at night)
 *  - glass vitrines that display the boutique's PRODUCT TYPE (by sector)
 *  - central door, base step, and level-based embellishments (1 → 10)
 *
 * Pure react-native-svg, so it renders identically on web and native.
 */
import React from 'react';
import Svg, {
  G, Rect, Path, Circle, Line, Ellipse, Polygon,
  Text as SvgText, Defs, LinearGradient as SvgGrad, RadialGradient, Stop,
} from 'react-native-svg';

// Base drawing space; the component scales to the requested `width`.
const VB_W = 200;
const VB_H = 212;

// ── colour helper ─────────────────────────────────────────────────────────────
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

// ── sector → product family ─────────────────────────────────────────────────────
type Family = 'clothing' | 'electronics' | 'food' | 'jewelry' | 'beauty' | 'sport' | 'home' | 'books' | 'generic';

const familyForSector = (sector?: string): Family => {
  const s = (sector || '').toLowerCase();
  const has = (...k: string[]) => k.some((w) => s.includes(w));
  if (has('mode', 'vêtem', 'vetem', 'fashion', 'habill', 'pret', 'prêt')) return 'clothing';
  if (has('électro', 'electro', 'tech', 'inform', 'téléph', 'telep', 'phone', 'gadget')) return 'electronics';
  if (has('alim', 'épic', 'epic', 'food', 'restau', 'boulang', 'café', 'cafe', 'grocer')) return 'food';
  if (has('bijou', 'joaill', 'jewel', 'montre', 'accessoir')) return 'jewelry';
  if (has('beaut', 'cosmé', 'cosme', 'parfum', 'soin', 'spa')) return 'beauty';
  if (has('sport', 'fitness', 'gym')) return 'sport';
  if (has('maison', 'déco', 'deco', 'meuble', 'home', 'jardin')) return 'home';
  if (has('livre', 'librair', 'book', 'papet')) return 'books';
  return 'generic';
};

// ── product vignette drawn inside a window box ─────────────────────────────────
const WindowProducts: React.FC<{
  family: Family; wx: number; wy: number; ww: number; wh: number; night: boolean; variant: number;
}> = ({ family, wx, wy, ww, wh, night, variant }) => {
  const cx = wx + ww / 2;
  const floor = wy + wh - 4;          // product baseline
  const dim = night ? 0.82 : 1;        // products are silhouetted a touch at night
  const op = night ? 0.9 : 1;

  switch (family) {
    case 'clothing': {
      // left window → dress on a mannequin · right window → clothing rack
      if (variant === 0) {
        const dressColor = ['#EC4899', '#8B5CF6', '#F472B6'][0];
        return (
          <G opacity={op}>
            <Line x1={cx} y1={floor} x2={cx} y2={wy + 14} stroke="#9A8C78" strokeWidth={2} />
            <Rect x={cx - 7} y={floor - 2} width={14} height={3} rx={1.5} fill="#9A8C78" />
            <Circle cx={cx} cy={wy + 11} r={4} fill={shade(dressColor, dim - 1)} />
            <Path d={`M${cx} ${wy + 16} L${cx - 11} ${floor - 6} Q${cx} ${floor - 1} ${cx + 11} ${floor - 6} Z`} fill={shade(dressColor, dim - 1)} />
            <Path d={`M${cx} ${wy + 16} L${cx - 4} ${wy + 28} L${cx + 4} ${wy + 28} Z`} fill={shade(dressColor, dim - 1.18)} opacity={0.6} />
          </G>
        );
      }
      const rackY = wy + 16;
      const cols = ['#F472B6', '#FBBF24', '#60A5FA', '#34D399'];
      return (
        <G opacity={op}>
          <Line x1={wx + 8} y1={rackY} x2={wx + ww - 8} y2={rackY} stroke="#9A8C78" strokeWidth={2} />
          <Line x1={wx + 12} y1={rackY} x2={wx + 12} y2={floor} stroke="#9A8C78" strokeWidth={1.4} />
          <Line x1={wx + ww - 12} y1={rackY} x2={wx + ww - 12} y2={floor} stroke="#9A8C78" strokeWidth={1.4} />
          {cols.map((col, i) => {
            const x = wx + 14 + i * ((ww - 28) / (cols.length - 1));
            return <Path key={i} d={`M${x} ${rackY + 1} L${x - 4} ${floor - 8} Q${x} ${floor - 5} ${x + 4} ${floor - 8} Z`} fill={shade(col, dim - 1)} />;
          })}
        </G>
      );
    }
    case 'electronics': {
      // TV / monitor + small phone
      const screen = night ? '#7DD3FC' : '#1E293B';
      return (
        <G opacity={op}>
          <Rect x={cx - 18} y={floor - 26} width={36} height={24} rx={2} fill="#334155" />
          <Rect x={cx - 15} y={floor - 23} width={30} height={18} rx={1} fill={screen} />
          <Rect x={cx - 4} y={floor - 4} width={8} height={4} rx={1} fill="#334155" />
          <Rect x={cx + 14} y={floor - 14} width={8} height={14} rx={2} fill="#0F172A" />
          <Rect x={cx + 15} y={floor - 12.5} width={6} height={9} rx={0.5} fill={screen} />
        </G>
      );
    }
    case 'food': {
      // two shelves with produce + bottles
      const s1 = wy + wh * 0.42, s2 = floor - 2;
      const apple = (x: number, y: number, c: string) => <Circle cx={x} cy={y} r={3.4} fill={shade(c, dim - 1)} />;
      return (
        <G opacity={op}>
          <Line x1={wx + 8} y1={s1} x2={wx + ww - 8} y2={s1} stroke="#B59A6B" strokeWidth={2.4} />
          <Line x1={wx + 8} y1={s2} x2={wx + ww - 8} y2={s2} stroke="#B59A6B" strokeWidth={2.4} />
          {apple(cx - 12, s1 - 4, '#EF4444')}{apple(cx - 4, s1 - 4, '#F59E0B')}{apple(cx + 4, s1 - 4, '#84CC16')}{apple(cx + 12, s1 - 4, '#EF4444')}
          <Rect x={cx - 13} y={s2 - 12} width={5} height={10} rx={1.5} fill="#10B981" />
          <Rect x={cx - 5} y={s2 - 13} width={5} height={11} rx={1.5} fill="#F59E0B" />
          <Rect x={cx + 3} y={s2 - 11} width={5} height={9} rx={1.5} fill="#EF4444" />
          <Rect x={cx + 11} y={s2 - 12} width={5} height={10} rx={1.5} fill="#3B82F6" />
        </G>
      );
    }
    case 'jewelry': {
      // velvet bust with a necklace + sparkle
      return (
        <G opacity={op}>
          <Path d={`M${cx} ${floor} L${cx - 9} ${floor} Q${cx - 9} ${floor - 16} ${cx} ${floor - 20} Q${cx + 9} ${floor - 16} ${cx + 9} ${floor} Z`} fill={night ? '#475569' : '#334155'} />
          <Path d={`M${cx - 6} ${floor - 13} Q${cx} ${floor - 4} ${cx + 6} ${floor - 13}`} stroke="#FBBF24" strokeWidth={1.6} fill="none" />
          <Circle cx={cx} cy={floor - 6} r={1.8} fill="#FDE68A" />
          <Path d={`M${cx + 6} ${wy + 14} l1.5 3 3 1.5 -3 1.5 -1.5 3 -1.5 -3 -3 -1.5 3 -1.5 z`} fill="#FDE68A" opacity={0.9} />
        </G>
      );
    }
    case 'beauty': {
      const bottle = (x: number, h: number, c: string) => (
        <G><Rect x={x - 3} y={floor - h} width={6} height={h} rx={1.5} fill={shade(c, dim - 1)} /><Rect x={x - 1.5} y={floor - h - 3} width={3} height={3} fill="#94A3B8" /></G>
      );
      return <G opacity={op}>{bottle(cx - 12, 16, '#F9A8D4')}{bottle(cx, 22, '#C4B5FD')}{bottle(cx + 12, 14, '#FBCFE8')}</G>;
    }
    case 'sport': {
      return (
        <G opacity={op}>
          <Circle cx={cx - 9} cy={floor - 8} r={8} fill={night ? '#E2E8F0' : '#F1F5F9'} stroke="#334155" strokeWidth={1} />
          <Path d={`M${cx - 9} ${floor - 16} Q${cx - 3} ${floor - 8} ${cx - 9} ${floor} Q${cx - 15} ${floor - 8} ${cx - 9} ${floor - 16}`} stroke="#334155" strokeWidth={0.8} fill="none" />
          <Path d={`M${cx + 4} ${floor - 2} l16 0 0 -5 -6 -2 -4 -4 -6 0 z`} fill={shade('#EF4444', dim - 1)} />
        </G>
      );
    }
    case 'home': {
      return (
        <G opacity={op}>
          <Rect x={cx - 16} y={floor - 3} width={32} height={3} rx={1} fill="#B59A6B" />
          <Path d={`M${cx - 12} ${floor - 3} l3 -12 6 0 3 12 z`} fill={night ? '#FDE68A' : '#FCD34D'} opacity={night ? 1 : 0.9} />
          <Line x1={cx - 9} y1={floor - 15} x2={cx - 9} y2={floor - 22} stroke="#94A3B8" strokeWidth={1.4} />
          <Path d={`M${cx + 8} ${floor} q-5 0 -5 -7 q0 -6 5 -6 q5 0 5 6 q0 7 -5 7 z`} fill={shade('#60A5FA', dim - 1)} />
        </G>
      );
    }
    case 'books': {
      const cols = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
      return (
        <G opacity={op}>
          {cols.map((c, i) => <Rect key={i} x={wx + 12 + i * 7} y={floor - 18} width={5.4} height={18} rx={1} fill={shade(c, dim - 1)} />)}
          <Line x1={wx + 10} y1={floor} x2={wx + ww - 10} y2={floor} stroke="#B59A6B" strokeWidth={2} />
        </G>
      );
    }
    default: {
      const box = (x: number, y: number, s: number) => (
        <G><Rect x={x} y={y} width={s} height={s} rx={1.5} fill={night ? '#CBB892' : '#D8C49A'} /><Line x1={x} y1={y + s / 2} x2={x + s} y2={y + s / 2} stroke="#B59A6B" strokeWidth={1} /></G>
      );
      return <G opacity={op}>{box(cx - 14, floor - 14, 14)}{box(cx + 1, floor - 14, 14)}{box(cx - 6, floor - 28, 14)}</G>;
    }
  }
};

// ── main facade ────────────────────────────────────────────────────────────────
export interface BoutiqueFacadeProps {
  name: string;
  sector?: string;
  level?: number;       // 1 → 10, controls embellishments
  night?: boolean;
  open?: boolean;
  color?: string;       // boutique accent colour
  width?: number;
  selected?: boolean;
}

const BoutiqueFacade: React.FC<BoutiqueFacadeProps> = ({
  name, sector, level = 1, night = false, open = true, color = '#FF6B35', width = 188, selected = false,
}) => {
  const lvl = Math.max(1, Math.min(10, Math.round(level)));
  const height = (width * VB_H) / VB_W;
  const uid = (name + sector + color).replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) || 'shop';
  const family = familyForSector(sector);

  const accent = color;
  const accentDark = shade(accent, -0.34);
  const accentLight = shade(accent, 0.25);

  // wood roof palette
  const woodA = '#7A4E2E', woodB = '#5C3720', woodEdge = '#412613';
  // cream sign + wall
  const signCream = night ? '#FFF3D2' : '#F5E9CC';
  const wall = '#EADFC8', wallShade = '#D9CBAE';
  // window glass (cool day / warm glow night)
  const glassTop = night ? '#FFE6A6' : '#CFEAFF';
  const glassBot = night ? '#FFC24D' : '#9FD0F2';

  // sign name (uppercase, like the model)
  const display = name.toUpperCase();
  const nameText = display.length > 13 ? display.slice(0, 12) + '…' : display;
  const nameSize = display.length > 10 ? 11 : display.length > 7 ? 13 : 15;

  // geometry
  const wallX = 18, wallW = 164, wallY = 80, wallH = 92;
  const lwX = 28, rwX = 122, wY = 92, wW = 50, wH = 72;   // windows
  const doorX = 84, doorY = 104, doorW = 32, doorH = 68;

  const lamp = (x: number, wx: number) => (
    <G>
      <Line x1={x} y1={wY + 2} x2={x} y2={wY + 12} stroke="#9A8C78" strokeWidth={1.2} />
      <Path d={`M${x - 5} ${wY + 18} Q${x} ${wY + 10} ${x + 5} ${wY + 18} Z`} fill={night ? '#FFD66B' : '#B9D6E8'} opacity={night ? 1 : 0.8} />
      {night && <Circle cx={x} cy={wY + 17} r={7} fill="#FFE08A" opacity={0.35} />}
    </G>
  );

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${VB_W} ${VB_H}`}>
      <Defs>
        <SvgGrad id={`glass-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={glassTop} />
          <Stop offset="1" stopColor={glassBot} />
        </SvgGrad>
        <SvgGrad id={`wall-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={shade(wall, 0.04)} />
          <Stop offset="1" stopColor={wallShade} />
        </SvgGrad>
        <RadialGradient id={`signglow-${uid}`} cx="0.5" cy="0.5" r="0.7">
          <Stop offset="0" stopColor="#FFE9A8" stopOpacity={night ? 0.9 : 0} />
          <Stop offset="1" stopColor="#FFE9A8" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {/* ground shadow */}
      <Ellipse cx={VB_W / 2} cy={186} rx={92} ry={10} fill="rgba(0,0,0,0.16)" />

      {/* ── wooden slatted roof ─────────────────────────────────── */}
      <G>
        <Polygon points="36,8 164,8 184,46 16,46" fill={woodB} />
        {[0, 1, 2, 3, 4].map((i) => {
          const y = 8 + i * 7.6;
          const inset = (i * (184 - 164)) / 2 / 5;
          const x1 = 36 - (i * (36 - 16)) / 5, x2 = 164 + (i * (184 - 164)) / 5;
          return <Line key={i} x1={x1} y1={y + 7.6} x2={x2} y2={y + 7.6} stroke={i % 2 ? woodEdge : woodA} strokeWidth={3.6} />;
        })}
        <Polygon points="36,8 164,8 184,46 16,46" fill="none" stroke={woodEdge} strokeWidth={2} />
        {/* roof eave shadow on facade */}
        <Rect x={16} y={46} width={168} height={4} fill="rgba(0,0,0,0.18)" />
      </G>

      {/* ── facade wall ─────────────────────────────────────────── */}
      <Rect x={wallX} y={wallY} width={wallW} height={wallH} fill={`url(#wall-${uid})`} />
      <Rect x={wallX} y={wallY} width={wallW} height={wallH} fill="none" stroke={shade(wall, -0.14)} strokeWidth={1} />

      {/* level 6+ : colored scalloped valance above the windows */}
      {lvl >= 6 && (
        <G>
          <Rect x={wallX} y={84} width={wallW} height={6} fill={accent} />
          {[...Array(Math.round(wallW / 12))].map((_, i) => {
            const x = wallX + i * 12;
            return <Path key={i} d={`M${x} 90 L${x + 12} 90 L${x + 6} 98 Z`} fill={i % 2 ? '#FFFFFF' : accent} opacity={0.95} />;
          })}
        </G>
      )}

      {/* ── sign board (enseigne) — carries the NAME ────────────── */}
      {night && <Rect x={14} y={44} width={172} height={42} fill={`url(#signglow-${uid})`} />}
      <Rect x={26} y={52} width={148} height={28} rx={4} fill={signCream} />
      <Rect x={26} y={52} width={148} height={28} rx={4} fill="none" stroke={accent} strokeWidth={2.4} />
      <Rect x={29} y={55} width={142} height={22} rx={3} fill="none" stroke={shade(signCream, -0.12)} strokeWidth={1} />

      {/* level 8+ : neon outline that glows at night */}
      {lvl >= 8 && (
        <Rect x={23} y={49} width={154} height={34} rx={6} fill="none" stroke={accent} strokeWidth={1.6} opacity={night ? 0.95 : 0.4} />
      )}

      {/* marquee bulbs + spotlights at night */}
      {night && (
        <G>
          {[...Array(11)].map((_, i) => {
            const x = 34 + i * 13.2;
            return <Circle key={i} cx={x} cy={52} r={1.8} fill={['#FFD54F', '#FFFFFF', '#FF8A5C'][i % 3]} opacity={0.95} />;
          })}
          <Path d="M70 50 L60 40 L66 40 Z" fill="#FFF1C2" opacity={0.5} />
          <Path d="M130 50 L140 40 L134 40 Z" fill="#FFF1C2" opacity={0.5} />
        </G>
      )}

      <SvgText x={VB_W / 2} y={71} fontSize={nameSize} fill="#3A2016" textAnchor="middle" fontWeight="bold" letterSpacing="1">
        {nameText}
      </SvgText>

      {/* ── windows (vitrines) with product displays ────────────── */}
      {[{ x: lwX, v: 0 }, { x: rwX, v: 1 }].map(({ x, v }) => (
        <G key={x}>
          <Rect x={x} y={wY} width={wW} height={wH} rx={3} fill={`url(#glass-${uid})`} />
          {/* reflection streaks */}
          <Path d={`M${x + 8} ${wY + 4} L${x + 18} ${wY + 4} L${x + 4} ${wY + wH - 6} L${x - 6} ${wY + wH - 6} Z`} fill="#FFFFFF" opacity={night ? 0.1 : 0.26} />
          <Path d={`M${x + 24} ${wY + 4} L${x + 30} ${wY + 4} L${x + 16} ${wY + wH - 6} L${x + 10} ${wY + wH - 6} Z`} fill="#FFFFFF" opacity={night ? 0.07 : 0.18} />
          {/* hanging lamps */}
          {lamp(x + 14, x)}
          {lamp(x + wW - 14, x)}
          {/* product vignette by sector */}
          <WindowProducts family={family} wx={x} wy={wY} ww={wW} wh={wH} night={night} variant={v} />
          {/* frame */}
          <Rect x={x} y={wY} width={wW} height={wH} rx={3} fill="none" stroke={accentDark} strokeWidth={2.4} />
          <Line x1={x} y1={wY + wH} x2={x + wW} y2={wY + wH} stroke={shade(wall, -0.2)} strokeWidth={2} />
          {/* level 5+ : flower box under each window */}
          {lvl >= 5 && (
            <G>
              <Rect x={x - 2} y={wY + wH} width={wW + 4} height={7} rx={1.5} fill={accentDark} />
              {[...Array(5)].map((_, i) => (
                <Circle key={i} cx={x + 6 + i * ((wW - 12) / 4)} cy={wY + wH} r={2.6} fill={['#F472B6', '#FBBF24', '#FB7185', '#A78BFA', '#FB7185'][i]} />
              ))}
            </G>
          )}
        </G>
      ))}

      {/* ── door ────────────────────────────────────────────────── */}
      <Rect x={doorX - 3} y={doorY - 3} width={doorW + 6} height={doorH + 3} rx={3} fill={accentDark} />
      <Rect x={doorX} y={doorY} width={doorW} height={doorH} rx={2} fill={`url(#glass-${uid})`} />
      <Rect x={doorX} y={doorY} width={doorW} height={doorH} rx={2} fill="none" stroke={accent} strokeWidth={2} />
      <Line x1={doorX + doorW / 2} y1={doorY} x2={doorX + doorW / 2} y2={doorY + doorH} stroke={accent} strokeWidth={1} opacity={0.5} />
      <Circle cx={doorX + doorW - 6} cy={doorY + doorH / 2} r={1.8} fill="#FFE082" />
      {/* OPEN / FERMÉ sign */}
      <Rect x={doorX + 4} y={doorY + 10} width={doorW - 8} height={8} rx={2} fill={open ? '#16A34A' : '#DC2626'} />
      <SvgText x={doorX + doorW / 2} y={doorY + 16} fontSize={5} fill="#FFFFFF" textAnchor="middle" fontWeight="bold">
        {open ? 'OPEN' : 'FERMÉ'}
      </SvgText>

      {/* ── base step ───────────────────────────────────────────── */}
      <Rect x={12} y={172} width={176} height={12} rx={2} fill="#D9CDB5" />
      <Rect x={12} y={172} width={176} height={3} fill="#C8BA9C" />

      {/* level 10 : red carpet from the door */}
      {lvl >= 10 && <Polygon points={`${doorX - 2},172 ${doorX + doorW + 2},172 ${doorX + doorW + 10},190 ${doorX - 10},190`} fill="#C1121F" opacity={0.9} />}

      {/* ── potted plants (level 2+) ────────────────────────────── */}
      {lvl >= 2 && (
        <G>
          {[wallX + 6, wallX + wallW - 18].map((px, i) => (
            <G key={i}>
              <Path d={`M${px + 6} 172 l-4 -12 M${px + 6} 172 l0 -16 M${px + 6} 172 l4 -12`} stroke="#2F9E44" strokeWidth={3} strokeLinecap="round" />
              <Path d={`M${px + 6} 162 q-7 -2 -9 -10 q7 1 9 10 M${px + 6} 162 q7 -2 9 -10 q-7 1 -9 10`} fill="#37B24D" />
              <Path d={`M${px} 172 l12 0 -1.5 10 -9 0 z`} fill={accent} />
            </G>
          ))}
        </G>
      )}

      {/* ── hanging shop sign on a bracket (level 3+) ───────────── */}
      {lvl >= 3 && (
        <G>
          <Line x1={wallX} y1={64} x2={wallX - 12} y2={64} stroke={woodEdge} strokeWidth={2} />
          <Line x1={wallX - 12} y1={64} x2={wallX - 12} y2={72} stroke={woodEdge} strokeWidth={2} />
          <Circle cx={wallX - 12} cy={82} r={10} fill={signCream} stroke={accent} strokeWidth={2} />
          {night && <Circle cx={wallX - 12} cy={82} r={14} fill="#FFE08A" opacity={0.3} />}
          {/* little shopping-bag glyph */}
          <Path d="M-3 -2 h6 v6 h-6 z" fill="none" stroke={accent} strokeWidth={1.4} transform={`translate(${wallX - 12} ${wallX === 18 ? 82 : 82})`} />
          <Path d={`M${wallX - 14} 80 a2 2 0 0 1 4 0`} fill="none" stroke={accent} strokeWidth={1.2} />
        </G>
      )}

      {/* ── street lamp (level 4+), lit at night ────────────────── */}
      {lvl >= 4 && (
        <G>
          <Rect x={wallX + wallW + 6} y={96} width={3} height={78} fill="#3A2016" />
          <Circle cx={wallX + wallW + 7.5} cy={94} r={5} fill={night ? '#FFE08A' : '#C8BA9C'} stroke="#3A2016" strokeWidth={1.4} />
          {night && <Circle cx={wallX + wallW + 7.5} cy={94} r={11} fill="#FFE08A" opacity={0.3} />}
        </G>
      )}

      {/* ── bunting / flags across the top (level 7+) ───────────── */}
      {lvl >= 7 && (
        <G>
          <Path d={`M${wallX} 50 Q${VB_W / 2} 60 ${wallX + wallW} 50`} stroke="#9A8C78" strokeWidth={1} fill="none" />
          {[...Array(7)].map((_, i) => {
            const t = i / 6;
            const x = wallX + t * wallW;
            const y = 50 + Math.sin(Math.PI * t) * 9;
            return <Polygon key={i} points={`${x - 4},${y} ${x + 4},${y} ${x},${y + 7}`} fill={['#EF4444', '#FBBF24', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#EF4444'][i]} />;
          })}
        </G>
      )}

      {/* level 9+ : medallion emblem on the sign */}
      {lvl >= 9 && (
        <G>
          <Circle cx={VB_W / 2} cy={46} r={6} fill="#FDE68A" stroke={accent} strokeWidth={1.5} />
          <Path d={`M${VB_W / 2} 42 l1.4 2.8 3 .4 -2.2 2.1 .5 3 -2.7 -1.4 -2.7 1.4 .5 -3 -2.2 -2.1 3 -.4 z`} fill={accent} />
        </G>
      )}

      {/* level 10 : golden premium trim around the whole facade */}
      {lvl >= 10 && (
        <Rect x={14} y={6} width={172} height={178} rx={6} fill="none" stroke="#E9B949" strokeWidth={2.5} opacity={0.9} />
      )}

      {/* selection ring */}
      {selected && (
        <Rect x={8} y={4} width={184} height={184} rx={12} fill="none" stroke={accent} strokeWidth={3} strokeDasharray="8 6" />
      )}
    </Svg>
  );
};

export default BoutiqueFacade;
