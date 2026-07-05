/**
 * ThemePreviewCanvas — live wireframe preview of the storefront being edited.
 * Renders header / hero / product grid / footer from the currently selected
 * templates + customizations, so changes in the customizer panel are reflected
 * instantly (WordPress Customizer / Elementor style live canvas).
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { HeaderTemplate } from '../constants/headerTemplates';
import { BodyTemplate } from '../constants/bodyTemplates';
import { FooterTemplate } from '../constants/footerTemplates';

export type PreviewDevice = 'desktop' | 'mobile';
export type PreviewPage = 'home' | 'shop' | 'about' | 'contact';

export interface PreviewProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  emoji?: string;
  imageUri?: string;
}

export interface ThemePreviewColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

export interface ThemePreviewFonts {
  heading: string;
  body: string;
}

export interface ThemePreviewLayout {
  productGridColumns: number;
  spacing: number;
  borderRadius: number;
  shadow: boolean;
}

export interface ThemePreviewProps {
  device: PreviewDevice;
  siteName: string;
  header: HeaderTemplate;
  body: BodyTemplate;
  footer: FooterTemplate;
  colors: ThemePreviewColors;
  fonts: ThemePreviewFonts;
  layout: ThemePreviewLayout;
  headerTitle?: string;
  headerSubtitle?: string;
  footerBackground?: string;
  footerText?: string;
  products?: PreviewProduct[];
  chrome?: boolean;
  description?: string;
  email?: string;
  phone?: string;
  instagram?: string;
  facebook?: string;
  city?: string;
  quartier?: string;
}

const Ico: React.FC<{ d: string; color?: string; size?: number }> = ({ d, color = '#111827', size = 14 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d={d} />
  </Svg>
);

const ICONS = {
  search: 'M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z',
  cart: 'M6 6h15l-1.5 9h-12L4 3H1M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM20 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  menu: 'M4 6h16M4 12h16M4 18h16',
  heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z',
  mail: 'M4 4h16v16H4zM22 6l-10 7L2 6',
  instagram: 'M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z',
  facebook: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z',
  card: 'M2 7h20v13a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zM2 7V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2M2 11h20',
};

const withAlpha = (hex: string, alpha: string) => (hex?.startsWith('#') ? `${hex}${alpha}` : hex);

const ThemePreviewCanvas: React.FC<ThemePreviewProps> = ({
  device, siteName, header, body, footer, colors, fonts, layout,
  headerTitle, headerSubtitle, footerBackground, footerText, products,
  chrome = true, description, email, phone, instagram, facebook, city, quartier,
}) => {
  const isMobile = device === 'mobile';
  const isVerticalHeader = header.structure.layout === 'vertical';
  const showsHero = ['hero', 'video', 'overlay'].includes(header.structure.type);
  const cols = isMobile ? Math.min(2, layout.productGridColumns) : Math.min(layout.productGridColumns, 5);
  const productCount = isMobile ? 4 : Math.max(cols * 2, 6);
  const radius = layout.borderRadius;
  const hasRealProducts = !!products && products.length > 0;
  const gridItems: (PreviewProduct | null)[] = hasRealProducts
    ? products!.slice(0, isMobile ? 6 : productCount)
    : Array.from({ length: productCount }, () => null);

  const [activePage, setActivePage] = useState<PreviewPage>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const goToPage = (p: PreviewPage) => {
    setActivePage(p);
    setMobileMenuOpen(false);
  };

  const navItems: { label: string; page: PreviewPage }[] = [
    { label: 'Accueil', page: 'home' },
    { label: 'Boutique', page: 'shop' },
    { label: 'À propos', page: 'about' },
    { label: 'Contact', page: 'contact' },
  ];

  const HeaderBar = () => (
    <View
      style={[
        w.headerBar,
        {
          backgroundColor: header.structure.type === 'transparent' ? withAlpha(colors.background, 'CC') : colors.background,
          justifyContent: header.structure.type === 'centered' ? 'center' : 'space-between',
          borderBottomColor: withAlpha(colors.text, '14'),
        },
      ]}
    >
      {header.structure.type !== 'centered' && (
        <TouchableOpacity style={w.headerSide} onPress={() => goToPage('home')} activeOpacity={0.7}>
          {header.structure.hasLogo && (
            <View style={[w.logoDot, { backgroundColor: colors.primary }]}>
              <Text style={w.logoLetter}>{siteName.charAt(0).toUpperCase() || 'V'}</Text>
            </View>
          )}
          <Text style={[w.siteName, { color: colors.text, fontFamily: fonts.heading }]} numberOfLines={1}>
            {siteName}
          </Text>
        </TouchableOpacity>
      )}

      {header.structure.hasNavigation && !isMobile && header.structure.type !== 'minimal' && (
        <View style={[w.navRow, header.structure.type === 'split' && { marginLeft: 'auto', marginRight: 12 }]}>
          {navItems.map(n => (
            <TouchableOpacity key={n.label} onPress={() => goToPage(n.page)} activeOpacity={0.6}>
              <Text style={[w.navItem, { color: colors.text, fontFamily: fonts.body }, activePage === n.page && w.navItemActive]}>{n.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {header.structure.type === 'centered' && header.structure.hasLogo && (
        <TouchableOpacity style={w.headerSideCentered} onPress={() => goToPage('home')} activeOpacity={0.7}>
          <View style={[w.logoDot, { backgroundColor: colors.primary }]}>
            <Text style={w.logoLetter}>{siteName.charAt(0).toUpperCase() || 'V'}</Text>
          </View>
          <Text style={[w.siteName, { color: colors.text, fontFamily: fonts.heading }]}>{siteName}</Text>
        </TouchableOpacity>
      )}

      <View style={w.headerIcons}>
        {(isMobile || header.structure.type === 'minimal') && header.structure.hasNavigation && (
          <TouchableOpacity onPress={() => setMobileMenuOpen(o => !o)} activeOpacity={0.6}>
            <Ico d={ICONS.menu} color={colors.text} />
          </TouchableOpacity>
        )}
        {header.structure.hasSearch && <Ico d={ICONS.search} color={colors.text} />}
        {header.structure.hasUser && <Ico d={ICONS.user} color={colors.text} />}
        {header.structure.hasCart && (
          <View>
            <Ico d={ICONS.cart} color={colors.text} />
            <View style={[w.cartBadge, { backgroundColor: colors.primary }]}><Text style={w.cartBadgeText}>2</Text></View>
          </View>
        )}
        {header.structure.hasCTA && (
          <TouchableOpacity style={[w.ctaPill, { backgroundColor: colors.primary }]} onPress={() => goToPage('shop')} activeOpacity={0.8}>
            <Text style={w.ctaPillText}>Acheter</Text>
          </TouchableOpacity>
        )}
      </View>

      {(header.structure.type === 'sticky' || header.structure.type === 'transparent') && (
        <View style={w.badge}><Text style={w.badgeText}>{header.structure.type === 'sticky' ? 'Fixe au scroll' : 'Transparent'}</Text></View>
      )}

      {mobileMenuOpen && (
        <View style={[w.mobileMenu, { backgroundColor: colors.background, borderColor: withAlpha(colors.text, '14') }]}>
          {navItems.map(n => (
            <TouchableOpacity key={n.label} onPress={() => goToPage(n.page)} style={w.mobileMenuItem} activeOpacity={0.6}>
              <Text style={[w.navItem, { color: colors.text, fontFamily: fonts.body, fontSize: 13 }, activePage === n.page && w.navItemActive]}>{n.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const Hero = () => (
    <View style={[w.hero, { backgroundColor: colors.primary }]}>
      {header.structure.type === 'video' && (
        <View style={w.videoBadge}><Ico d="M23 7l-7 5 7 5V7zM1 5h15v14H1z" color="#fff" size={12} /><Text style={w.videoBadgeText}>Vidéo de fond</Text></View>
      )}
      <Text style={[w.heroTitle, { fontFamily: fonts.heading }]} numberOfLines={2}>
        {headerTitle || `Bienvenue chez ${siteName}`}
      </Text>
      <Text style={[w.heroSubtitle, { fontFamily: fonts.body }]} numberOfLines={2}>
        {headerSubtitle || 'Découvrez notre nouvelle collection'}
      </Text>
      {header.structure.hasCTA && (
        <TouchableOpacity style={w.heroCta} onPress={() => goToPage('shop')} activeOpacity={0.8}>
          <Text style={[w.heroCtaText, { color: colors.primary }]}>Découvrir</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const FilterChip = ({ label }: { label: string }) => (
    <View style={[w.filterChip, { borderColor: withAlpha(colors.text, '20') }]}>
      <Text style={[w.filterChipText, { color: colors.text }]}>{label}</Text>
    </View>
  );

  const ProductCard = ({ product, i }: { product: PreviewProduct | null; i: number }) => (
    <View
      style={[
        w.productCard,
        {
          width: isMobile ? `${100 / cols - 3}%` : `${100 / cols - 2}%`,
          borderRadius: radius,
          backgroundColor: '#fff',
          borderColor: withAlpha(colors.text, '12'),
        },
        layout.shadow && w.productCardShadow,
      ]}
    >
      <View style={[w.productImage, { backgroundColor: withAlpha(colors.secondary, '30'), borderTopLeftRadius: radius, borderTopRightRadius: radius }]}>
        {product?.imageUri ? (
          <Image source={{ uri: product.imageUri }} style={w.productImagePhoto} resizeMode="cover" />
        ) : product?.emoji ? (
          <Text style={w.productEmoji}>{product.emoji}</Text>
        ) : null}
        {body.structure.hasWishlist && (
          <View style={w.wishlistIcon}><Ico d={ICONS.heart} color={colors.primary} size={11} /></View>
        )}
      </View>
      <View style={w.productInfo}>
        {product ? (
          <Text style={[w.productName, { color: colors.text, fontFamily: fonts.body }]} numberOfLines={1}>{product.name}</Text>
        ) : (
          <View style={[w.productLine, { width: '80%', backgroundColor: withAlpha(colors.text, '25') }]} />
        )}
        <Text style={[w.productPrice, { color: colors.primary, fontFamily: fonts.body }]}>
          {product ? product.price.toFixed(2) : (9 + i * 3.5).toFixed(2)} €
        </Text>
        {body.structure.hasQuickView && (
          <View style={[w.addBtn, { backgroundColor: colors.primary }]}><Text style={w.addBtnText}>+ Ajouter</Text></View>
        )}
      </View>
    </View>
  );

  const HomeSection = () => (
    <View>
      {!showsHero && (
        <View style={[w.simpleWelcome, { backgroundColor: withAlpha(colors.primary, '12') }]}>
          <Text style={[w.welcomeTitle, { color: colors.text, fontFamily: fonts.heading }]} numberOfLines={2}>
            {headerTitle || `Bienvenue chez ${siteName}`}
          </Text>
          <Text style={[w.welcomeSubtitle, { color: withAlpha(colors.text, '80'), fontFamily: fonts.body }]} numberOfLines={2}>
            {headerSubtitle || 'Découvrez notre sélection de produits'}
          </Text>
          <TouchableOpacity style={[w.welcomeCta, { backgroundColor: colors.primary }]} onPress={() => goToPage('shop')} activeOpacity={0.85}>
            <Text style={w.welcomeCtaText}>Découvrir la boutique</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={w.bodySection}>
        <View style={w.bodyHeaderRow}>
          <Text style={[w.sectionHeading, { color: colors.text, fontFamily: fonts.heading }]}>Produits populaires</Text>
          <TouchableOpacity onPress={() => goToPage('shop')} activeOpacity={0.6}>
            <Text style={[w.seeAllLink, { color: colors.primary }]}>Voir tout →</Text>
          </TouchableOpacity>
        </View>
        <View style={w.productGrid}>
          {gridItems.slice(0, isMobile ? 2 : 4).map((product, i) => <ProductCard key={product?.id ?? i} product={product} i={i} />)}
        </View>
      </View>
    </View>
  );

  const AboutSection = () => (
    <View style={w.infoSection}>
      <Text style={[w.sectionHeading, { color: colors.text, fontFamily: fonts.heading }]}>À propos de {siteName}</Text>
      <Text style={[w.infoParagraph, { color: withAlpha(colors.text, '85'), fontFamily: fonts.body }]}>
        {description || `Découvrez l'histoire de ${siteName} et notre passion pour ce que nous proposons. Nous sélectionnons chaque article avec soin pour vous offrir le meilleur.`}
      </Text>
      {!!city && (
        <Text style={[w.infoMeta, { color: withAlpha(colors.text, '70') }]}>📍 {city}{quartier ? `, ${quartier}` : ''}</Text>
      )}
    </View>
  );

  const ContactSection = () => (
    <View style={w.infoSection}>
      <Text style={[w.sectionHeading, { color: colors.text, fontFamily: fonts.heading }]}>Contactez-nous</Text>
      <View style={{ gap: 10, marginTop: 4 }}>
        <Text style={[w.infoRow, { color: withAlpha(colors.text, '85') }]}>✉️  {email || `contact@${(siteName || 'boutique').toLowerCase().replace(/\s+/g, '-')}.vendoo.shop`}</Text>
        <Text style={[w.infoRow, { color: withAlpha(colors.text, '85') }]}>📞  {phone || '+33 6 00 00 00 00'}</Text>
      </View>
      {(!!instagram || !!facebook) && (
        <View style={w.socialRow}>
          {!!instagram && <Ico d={ICONS.instagram} color={colors.primary} size={18} />}
          {!!facebook && <Ico d={ICONS.facebook} color={colors.primary} size={18} />}
        </View>
      )}
    </View>
  );

  const ShopSection = () => (
    <View style={w.bodySection}>
      <View style={w.bodyHeaderRow}>
        <Text style={[w.sectionHeading, { color: colors.text, fontFamily: fonts.heading }]}>Nos produits</Text>
        {body.structure.hasSort && <Text style={[w.sortText, { color: withAlpha(colors.text, '80') }]}>Trier ▾</Text>}
      </View>
      <View style={{ flexDirection: 'row', gap: layout.spacing }}>
        {body.structure.hasSidebar && !isMobile && (
          <View style={w.sidebarFilters}>
            <Text style={[w.filterTitle, { color: colors.text }]}>Filtres</Text>
            {['Prix', 'Taille', 'Couleur', 'Catégorie'].map(f => <FilterChip key={f} label={f} />)}
          </View>
        )}
        <View style={{ flex: 1 }}>
          {body.structure.hasFilters && !body.structure.hasSidebar && (
            <View style={w.filterRow}>
              {['Tout', 'Nouveautés', 'Promo', 'Populaire'].map(f => <FilterChip key={f} label={f} />)}
            </View>
          )}
          {body.structure.type === 'list' ? (
            <View style={{ gap: layout.spacing }}>
              {(hasRealProducts ? products!.slice(0, 3) : Array.from({ length: 3 }, () => null)).map((product, i) => (
                <View key={product?.id ?? i} style={[w.listRow, { borderRadius: radius, borderColor: withAlpha(colors.text, '12') }]}>
                  <View style={[w.listImage, { backgroundColor: withAlpha(colors.secondary, '30'), borderRadius: radius / 1.5, alignItems: 'center', justifyContent: 'center' }]}>
                    {product?.imageUri ? (
                      <Image source={{ uri: product.imageUri }} style={w.productImagePhoto} resizeMode="cover" />
                    ) : product?.emoji ? (
                      <Text style={w.productEmoji}>{product.emoji}</Text>
                    ) : null}
                  </View>
                  <View style={{ flex: 1, gap: 6 }}>
                    {product ? (
                      <Text style={[w.productName, { color: colors.text }]} numberOfLines={1}>{product.name}</Text>
                    ) : (
                      <>
                        <View style={[w.productLine, { width: '60%', backgroundColor: withAlpha(colors.text, '25') }]} />
                        <View style={[w.productLine, { width: '35%', backgroundColor: withAlpha(colors.text, '15') }]} />
                      </>
                    )}
                    <Text style={[w.productPrice, { color: colors.primary }]}>{(product ? product.price : 14 + i * 4).toFixed(2)} €</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={w.productGrid}>
              {gridItems.map((product, i) => <ProductCard key={product?.id ?? i} product={product} i={i} />)}
            </View>
          )}
          {body.structure.hasPagination && (
            <View style={w.pagination}>
              {[1, 2, 3].map(p => (
                <View key={p} style={[w.pageDot, p === 1 && { backgroundColor: colors.primary }]}>
                  <Text style={[w.pageDotText, p === 1 && { color: '#fff' }]}>{p}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const FooterSection = () => {
    const bg = footerBackground || colors.text;
    const fg = footerText || '#fff';
    const footerCols = isMobile ? Math.min(2, footer.structure.columns) : footer.structure.columns;
    return (
      <View style={[w.footer, { backgroundColor: bg }]}>
        {footer.structure.hasNewsletter && (
          <View style={w.newsletterRow}>
            <Text style={[w.newsletterTitle, { color: fg, fontFamily: fonts.heading }]}>Restez informé</Text>
            <View style={w.newsletterInputRow}>
              <View style={w.newsletterInput}><Ico d={ICONS.mail} color={withAlpha(fg, '90')} size={12} /><Text style={[w.newsletterPlaceholder, { color: withAlpha(fg, '80') }]}>Votre email</Text></View>
              <View style={[w.newsletterBtn, { backgroundColor: colors.primary }]}><Text style={w.newsletterBtnText}>OK</Text></View>
            </View>
          </View>
        )}
        {footer.structure.columns > 1 && (
          <View style={w.footerColsRow}>
            {Array.from({ length: footerCols }).map((_, c) => (
              <View key={c} style={w.footerCol}>
                <View style={[w.footerColTitle, { backgroundColor: withAlpha(fg, '50') }]} />
                {[0, 1, 2].map(l => <View key={l} style={[w.footerLine, { backgroundColor: withAlpha(fg, '25') }]} />)}
              </View>
            ))}
          </View>
        )}
        {footer.structure.hasSocialLinks && (
          <View style={w.socialRow}>
            <Ico d={ICONS.instagram} color={fg} size={16} />
            <Ico d={ICONS.facebook} color={fg} size={16} />
          </View>
        )}
        {footer.structure.hasPaymentIcons && (
          <View style={w.paymentRow}>
            {[0, 1, 2].map(p => (
              <View key={p} style={w.paymentIcon}><Ico d={ICONS.card} color={withAlpha(fg, '90')} size={14} /></View>
            ))}
          </View>
        )}
        {footer.structure.hasCopyright && (
          <Text style={[w.copyright, { color: withAlpha(fg, '70') }]}>© {new Date().getFullYear()} {siteName}. Tous droits réservés.</Text>
        )}
      </View>
    );
  };

  const page = (
    <View style={{ backgroundColor: colors.background }}>
      {!isVerticalHeader && <HeaderBar />}
      {activePage === 'home' && showsHero && <Hero />}
      {activePage === 'home' && <HomeSection />}
      {activePage === 'shop' && <ShopSection />}
      {activePage === 'about' && <AboutSection />}
      {activePage === 'contact' && <ContactSection />}
      <FooterSection />
    </View>
  );

  const showChrome = chrome !== false;

  return (
    <View style={[w.frame, showChrome ? (isMobile ? w.frameMobile : w.frameDesktop) : (isMobile ? w.frameMobileBare : w.frameDesktopBare)]}>
      {showChrome && (
        <View style={w.chrome}>
          {!isMobile ? (
            <>
              <View style={[w.dot, { backgroundColor: '#FF5F57' }]} />
              <View style={[w.dot, { backgroundColor: '#FEBC2E' }]} />
              <View style={[w.dot, { backgroundColor: '#28C840' }]} />
              <View style={w.urlBar}><Text style={w.urlBarText}>{(siteName || 'boutique').toLowerCase().replace(/\s+/g, '-')}.vendoo.shop</Text></View>
            </>
          ) : (
            <View style={w.notch} />
          )}
        </View>
      )}

      <ScrollView style={showChrome ? w.body : w.bodyBare} contentContainerStyle={isVerticalHeader ? { flexDirection: 'row' } : undefined}>
        {isVerticalHeader ? (
          <>
            <View style={[w.sidebarHeader, { backgroundColor: colors.background, borderRightColor: withAlpha(colors.text, '14') }]}>
              <View style={[w.logoDot, { backgroundColor: colors.primary, marginBottom: 12 }]}>
                <Text style={w.logoLetter}>{siteName.charAt(0).toUpperCase() || 'V'}</Text>
              </View>
              {navItems.map(n => (
                <TouchableOpacity key={n.label} onPress={() => goToPage(n.page)} activeOpacity={0.6}>
                  <Text style={[w.sidebarNavItem, { color: colors.text, fontFamily: fonts.body }, activePage === n.page && w.navItemActive]}>{n.label}</Text>
                </TouchableOpacity>
              ))}
              <View style={{ marginTop: 'auto', gap: 10, alignItems: 'center' }}>
                {header.structure.hasSearch && <Ico d={ICONS.search} color={colors.text} />}
                {header.structure.hasCart && <Ico d={ICONS.cart} color={colors.text} />}
                {header.structure.hasUser && <Ico d={ICONS.user} color={colors.text} />}
              </View>
            </View>
            <View style={{ flex: 1 }}>{page}</View>
          </>
        ) : page}
      </ScrollView>
    </View>
  );
};

const w = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  frameDesktop: {
    width: '100%', maxWidth: 900, alignSelf: 'center', borderRadius: 14,
    borderWidth: 1, borderColor: '#E2E5EA',
    shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: 8 },
  },
  frameMobile: {
    width: 340, alignSelf: 'center', borderRadius: 14,
    borderWidth: 1, borderColor: '#E2E5EA',
    shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: 8 },
  },
  frameDesktopBare: { width: '100%' },
  frameMobileBare: { width: 390, alignSelf: 'center', borderRadius: 24, borderWidth: 1, borderColor: '#E2E5EA' },
  chrome: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F1F2F4',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E5EA',
  },
  dot: { width: 9, height: 9, borderRadius: 5 },
  urlBar: { flex: 1, marginLeft: 8, backgroundColor: '#fff', borderRadius: 6, paddingVertical: 3, paddingHorizontal: 10 },
  urlBarText: { fontSize: 10, color: '#64748B' },
  notch: { width: 90, height: 6, borderRadius: 3, backgroundColor: '#D1D5DB', alignSelf: 'center' },
  body: { maxHeight: 640 },
  bodyBare: { flexGrow: 1 },

  mobileMenu: {
    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20,
    borderWidth: 1, borderTopWidth: 0, paddingVertical: 6,
    shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  mobileMenuItem: { paddingHorizontal: 18, paddingVertical: 10 },
  navItemActive: { fontWeight: '800', textDecorationLine: 'underline' },

  simpleWelcome: { paddingVertical: 32, paddingHorizontal: 24, alignItems: 'center' },
  welcomeTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 6 },
  welcomeSubtitle: { fontSize: 13, textAlign: 'center', marginBottom: 14 },
  welcomeCta: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999 },
  welcomeCtaText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  seeAllLink: { fontSize: 12, fontWeight: '700' },

  infoSection: { padding: 24, gap: 8 },
  infoParagraph: { fontSize: 13, lineHeight: 20, marginTop: 4 },
  infoMeta: { fontSize: 12, marginTop: 8, fontWeight: '600' },
  infoRow: { fontSize: 13, fontWeight: '600' },

  headerBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, position: 'relative', zIndex: 10 },
  headerSide: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerSideCentered: { flexDirection: 'row', alignItems: 'center', gap: 8, position: 'absolute', left: 16 },
  logoDot: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  logoLetter: { color: '#fff', fontWeight: '800', fontSize: 12 },
  siteName: { fontSize: 14, fontWeight: '700' },
  navRow: { flexDirection: 'row', gap: 16 },
  navItem: { fontSize: 12, fontWeight: '600' },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 12, marginLeft: 12 },
  cartBadge: { position: 'absolute', top: -6, right: -6, width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  cartBadgeText: { color: '#fff', fontSize: 8, fontWeight: '800' },
  ctaPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  ctaPillText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  badge: { position: 'absolute', top: 6, right: 6, backgroundColor: '#111827', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { color: '#fff', fontSize: 8, fontWeight: '700' },

  hero: { paddingVertical: 40, paddingHorizontal: 24, alignItems: 'center' },
  videoBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 10 },
  videoBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  heroSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 13, textAlign: 'center', marginBottom: 16 },
  heroCta: { backgroundColor: '#fff', paddingHorizontal: 18, paddingVertical: 9, borderRadius: 999 },
  heroCtaText: { fontWeight: '800', fontSize: 12 },

  bodySection: { padding: 20 },
  bodyHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionHeading: { fontSize: 17, fontWeight: '800' },
  sortText: { fontSize: 11, fontWeight: '600' },
  sidebarFilters: { width: 110, gap: 8 },
  filterTitle: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  filterChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  filterChipText: { fontSize: 10, fontWeight: '600' },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: '2%', rowGap: 12 },
  productCard: { borderWidth: 1, overflow: 'hidden' },
  productCardShadow: { shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  productImage: { height: 70, alignItems: 'flex-end', justifyContent: 'center', padding: 6, overflow: 'hidden' },
  productImagePhoto: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  productEmoji: { fontSize: 28, alignSelf: 'center' },
  wishlistIcon: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  productInfo: { padding: 8, gap: 6 },
  productLine: { height: 7, borderRadius: 4 },
  productName: { fontSize: 11, fontWeight: '700' },
  productPrice: { fontSize: 12, fontWeight: '800' },
  addBtn: { borderRadius: 6, paddingVertical: 5, alignItems: 'center', marginTop: 2 },
  addBtnText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  listRow: { flexDirection: 'row', gap: 12, padding: 10, borderWidth: 1 },
  listImage: { width: 56, height: 56 },
  pagination: { flexDirection: 'row', gap: 6, justifyContent: 'center', marginTop: 16 },
  pageDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#F1F2F4', alignItems: 'center', justifyContent: 'center' },
  pageDotText: { fontSize: 10, fontWeight: '700', color: '#374151' },

  footer: { padding: 20, gap: 16 },
  newsletterRow: { alignItems: 'center', gap: 10 },
  newsletterTitle: { fontSize: 14, fontWeight: '800' },
  newsletterInputRow: { flexDirection: 'row', gap: 8, width: '100%', maxWidth: 260 },
  newsletterInput: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8 },
  newsletterPlaceholder: { fontSize: 10 },
  newsletterBtn: { borderRadius: 6, paddingHorizontal: 14, justifyContent: 'center' },
  newsletterBtnText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  footerColsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  footerCol: { width: 100, gap: 8 },
  footerColTitle: { height: 8, width: '60%', borderRadius: 4, marginBottom: 2 },
  footerLine: { height: 6, width: '90%', borderRadius: 3 },
  socialRow: { flexDirection: 'row', gap: 14, justifyContent: 'center' },
  paymentRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  paymentIcon: { width: 26, height: 18, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  copyright: { fontSize: 10, textAlign: 'center' },

  sidebarHeader: { width: 90, alignItems: 'center', paddingVertical: 20, gap: 14, borderRightWidth: 1 },
  sidebarNavItem: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
});

export default ThemePreviewCanvas;
