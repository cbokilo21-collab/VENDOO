/**
 * Convert a string to a URL-friendly slug.
 * Removes accents, special chars, converts to lowercase.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Normalize accents
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    // Replace spaces and special chars with dashes
    .replace(/[^\w\-]+/g, '-')
    // Remove multiple consecutive dashes
    .replace(/\-{2,}/g, '-')
    // Remove leading/trailing dashes
    .replace(/^\-+|\-+$/g, '');
}

/**
 * Generate public shop URL from boutique name.
 * Example: "Mode Étoile" → "shop.mode-etoile.vendoo"
 */
export function generateShopUrl(boutiqueNom: string): string {
  const slug = slugify(boutiqueNom);
  return `shop.${slug}.vendoo`;
}

/**
 * Ensure slug is unique by appending a number if needed.
 * Used during boutique creation.
 */
export function makeSlugUnique(baseSlug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }
  let counter = 2;
  while (existingSlugs.includes(`${baseSlug}-${counter}`)) {
    counter++;
  }
  return `${baseSlug}-${counter}`;
}
