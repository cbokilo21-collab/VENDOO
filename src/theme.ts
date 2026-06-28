/**
 * Vendoo Design System v2 — Enterprise SaaS
 * White-dominant, professional. Orange is accent only, never a surface.
 * Light mode only initially; dark mode tokens included for future.
 */

// ── Color Palette (Light Mode) ─────────────────────────────────────────────
const colors = {
  // Surfaces
  white:       '#FFFFFF',
  page:        '#F6F7F9',   // app background (cool near-white)
  surface:     '#FFFFFF',   // cards, panels
  surfaceAlt:  '#FAFBFC',   // subtle hover/active fill
  surfaceHover: '#F8F9FB',  // interactive backgrounds

  // Borders
  border:      '#ECEEF1',   // subtle lines
  borderStrong:'#E0E3E8',   // emphasized borders
  divider:     '#F1F2F4',   // section dividers

  // Brand (Orange — accent only)
  orange:      '#FF6B35',
  orangeDark:  '#E8551E',
  orangeLight: '#FF9A70',
  orangeSoft:  '#FFF1EB',   // soft bg for badges, chips
  orangeRing:  'rgba(255, 107, 53, 0.12)',

  // Text Hierarchy
  text:        '#0F172A',   // strong titles, numbers
  textMid:     '#334155',   // body text
  textSub:     '#64748B',   // secondary labels
  muted:       '#94A3B8',   // disabled, hints
  faint:       '#CBD5E1',   // very subtle

  // Status Colors
  success:     '#16A34A',
  successSoft: '#ECFDF5',
  successLight:'#86EFAC',

  warning:     '#D97706',
  warningSoft: '#FFFBEB',
  warningLight:'#FCD34D',

  error:       '#DC2626',
  errorSoft:   '#FEF2F2',
  errorLight:  '#FCA5A5',

  info:        '#2563EB',
  infoSoft:    '#EFF6FF',
  infoLight:   '#93C5FD',

  violet:      '#7C3AED',
  violetSoft:  '#F5F3FF',
  violetLight: '#D8B4FE',

  // Additional
  black:       '#000000',
} as const;

// ── Dark Mode Colors (future) ──────────────────────────────────────────────
const darkMode = {
  page:        '#0F172A',
  surface:     '#1E293B',
  surfaceAlt:  '#334155',
  border:      '#475569',
  text:        '#F1F5F9',
  textMid:     '#CBD5E1',
  textSub:     '#94A3B8',
  muted:       '#64748B',
  faint:       '#475569',
} as const;

// ── Typography System ──────────────────────────────────────────────────────
export const typography = {
  // Titles & Headings
  h1: { fontSize: 32, fontWeight: '800', lineHeight: 40, letterSpacing: -0.5 },
  h2: { fontSize: 28, fontWeight: '700', lineHeight: 36, letterSpacing: -0.3 },
  h3: { fontSize: 24, fontWeight: '700', lineHeight: 32, letterSpacing: 0 },
  h4: { fontSize: 20, fontWeight: '600', lineHeight: 28, letterSpacing: 0 },
  h5: { fontSize: 18, fontWeight: '600', lineHeight: 26, letterSpacing: 0 },

  // Body
  bodyLg: { fontSize: 16, fontWeight: '400', lineHeight: 24, letterSpacing: 0 },
  body:   { fontSize: 15, fontWeight: '400', lineHeight: 22, letterSpacing: 0 },
  bodySm: { fontSize: 14, fontWeight: '400', lineHeight: 20, letterSpacing: 0 },

  // UI Labels & Badges
  labelLg: { fontSize: 14, fontWeight: '600', lineHeight: 20, letterSpacing: 0.1 },
  label:   { fontSize: 13, fontWeight: '600', lineHeight: 18, letterSpacing: 0.1 },
  labelSm: { fontSize: 12, fontWeight: '600', lineHeight: 16, letterSpacing: 0.2 },

  // Caption (smallest)
  caption: { fontSize: 11, fontWeight: '400', lineHeight: 14, letterSpacing: 0.1 },

  // Mono (for code, prices, technical)
  mono:    { fontSize: 14, fontWeight: '500', lineHeight: 20 },
} as const;

// ── Spacing Scale (8px base) ───────────────────────────────────────────────
export const spacing = {
  0:    0,
  1:    2,
  2:    4,
  3:    8,
  4:    12,
  5:    16,
  6:    20,
  7:    24,
  8:    32,
  9:    40,
  10:   48,
  12:   56,
  14:   64,
  16:   80,
  20:   96,
} as const;

// ── Border Radius ──────────────────────────────────────────────────────────
export const radius = {
  none:   0,
  sm:     4,
  base:   8,
  md:     12,
  lg:     16,
  xl:     20,
  '2xl':  24,
  full:   9999,
} as const;

// ── Shadows (Elevation System) ─────────────────────────────────────────────
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
  },
  xs: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  sm: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
  },
  base: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  md: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.10,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
  },
  xl: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 20 },
  },
  pop: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.15,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 25 },
  },
} as const;

// ── Animations & Transitions ───────────────────────────────────────────────
export const animations = {
  duration: {
    fast:   150,
    base:   250,
    slow:   350,
    slower: 500,
  },
  timing: {
    ease:       'ease',
    easeIn:     'ease-in',
    easeOut:    'ease-out',
    easeInOut:  'ease-in-out',
  },
} as const;

// ── Z-Index System ─────────────────────────────────────────────────────────
export const zIndex = {
  hide:    -1,
  base:    0,
  dropdown: 100,
  sticky:  200,
  fixed:   300,
  backdrop: 900,
  modal:   1000,
  popover: 1100,
  toast:   2000,
  tooltip: 2100,
} as const;

// ── Gradients (Preset) ─────────────────────────────────────────────────────
export const gradients = {
  brandOrange: {
    colors: [colors.orange, colors.orangeDark],
    angle: '135deg',
  },
  success: {
    colors: [colors.success, colors.successLight],
    angle: '135deg',
  },
  warning: {
    colors: [colors.warning, colors.warningLight],
    angle: '135deg',
  },
} as const;

// ── Focus & Interactive States ─────────────────────────────────────────────
export const interactive = {
  focusRing: {
    width: 2,
    color: colors.orange,
    offset: 2,
  },
  disabledOpacity: 0.5,
  hoverOpacity: 0.85,
  activeOpacity: 0.7,
} as const;

// ── Unified Export ────────────────────────────────────────────────────────
export const T = {
  // Colors
  ...colors,
  darkMode,

  // Typography
  ...typography,

  // Other systems
  spacing,
  radius,
  shadows,
  animations,
  zIndex,
  gradients,
  interactive,

  // Aliases for backward compatibility
  orange:      colors.orange,
  orangeDark:  colors.orangeDark,
  orangeSoft:  colors.orangeSoft,
  orangeRing:  colors.orangeRing,
  text:        colors.text,
  textMid:     colors.textMid,
  textSub:     colors.textSub,
  muted:       colors.muted,
  faint:       colors.faint,
  success:     colors.success,
  successSoft: colors.successSoft,
  warning:     colors.warning,
  warningSoft: colors.warningSoft,
  error:       colors.error,
  errorSoft:   colors.errorSoft,
  info:        colors.info,
  infoSoft:    colors.infoSoft,
  violet:      colors.violet,
  violetSoft:  colors.violetSoft,
  white:       colors.white,
  black:       colors.black,
  border:      colors.border,
  borderStrong: colors.borderStrong,
  divider:     colors.divider,
  page:        colors.page,
  surface:     colors.surface,
  surfaceAlt:  colors.surfaceAlt,
  sidebar:     colors.white,
  card:        shadows.base,
  pop:         shadows.lg,
} as const;
