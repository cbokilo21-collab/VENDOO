/**
 * quickStyles.ts — curated one-click palettes and font pairings shared by the
 * theme builder (ThemeBuilderAdvanced) and the Shoppy admin theme editor,
 * so both offer the same fast styling shortcuts without duplication.
 */

export interface QuickPalette {
  name: string;
  colors: { primary: string; secondary: string; accent: string; background: string; text: string };
}

export const QUICK_PALETTES: QuickPalette[] = [
  { name: 'Street', colors: { primary: '#FF4D2E', secondary: '#111827', accent: '#FACC15', background: '#0F0F12', text: '#F9FAFB' } },
  { name: 'Océan', colors: { primary: '#0EA5E9', secondary: '#0F172A', accent: '#38BDF8', background: '#FFFFFF', text: '#0F172A' } },
  { name: 'Or & Nuit', colors: { primary: '#C6A15B', secondary: '#1C1917', accent: '#E7D2A5', background: '#0C0A09', text: '#F5F5F4' } },
  { name: 'Terracotta', colors: { primary: '#B45309', secondary: '#7C2D12', accent: '#F59E0B', background: '#FFFBEB', text: '#292524' } },
  { name: 'Punch', colors: { primary: '#EF4444', secondary: '#F97316', accent: '#FACC15', background: '#FFF7ED', text: '#1F2937' } },
  { name: 'Frais', colors: { primary: '#16A34A', secondary: '#166534', accent: '#F59E0B', background: '#F0FDF4', text: '#14532D' } },
  { name: 'Indigo', colors: { primary: '#6366F1', secondary: '#8B5CF6', accent: '#F59E0B', background: '#F8FAFC', text: '#0F172A' } },
  { name: 'Rose', colors: { primary: '#EC4899', secondary: '#8B5CF6', accent: '#10B981', background: '#FDF2F8', text: '#1F2937' } },
];

export interface QuickFontPair {
  name: string;
  heading: string;
  body: string;
}

export const FONT_PAIRS: QuickFontPair[] = [
  { name: 'Moderne', heading: 'Montserrat', body: 'Inter' },
  { name: 'Élégant', heading: 'Playfair Display', body: 'Lato' },
  { name: 'Impact', heading: 'Oswald', body: 'Inter' },
  { name: 'Amical', heading: 'Fredoka', body: 'Nunito' },
  { name: 'Neutre', heading: 'Inter', body: 'Inter' },
];

export const FONTS = ['Inter', 'Poppins', 'Playfair Display', 'Roboto', 'Lato', 'Nunito', 'Montserrat', 'Open Sans', 'Fredoka', 'Oswald'];
export const COLOR_PRESETS = ['#FF6B35', '#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#0EA5E9', '#F59E0B', '#EF4444', '#14B8A6', '#1E293B', '#0F172A', '#FFFFFF'];
