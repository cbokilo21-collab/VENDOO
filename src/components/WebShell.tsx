/**
 * WebShell — web layout: white sidebar (left) + slim topbar (back / breadcrumb).
 * The single source of app chrome on Platform.OS === 'web'.
 * White-dominant, professional. Orange is an accent only.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { T, shadow } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

type Nav = NativeStackNavigationProp<any>;

// ── Tiny icon helper ─────────────────────────────────────────────────────────
const Ico = ({ d, color = T.muted, size = 18, sw = 1.9 }: { d: string; color?: string; size?: number; sw?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <Path d={d} />
  </Svg>
);

// ── Nav groups ───────────────────────────────────────────────────────────────
const ADMIN_GROUPS = [
  {
    label: 'sidebar.main',
    items: [
      { route: 'AdminDashboard', label: 'sidebar.adminDashboard', d: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
      { route: 'UsersManagement', label: 'sidebar.usersManagement', d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
      { route: 'SalesAnalytics', label: 'sidebar.salesAnalytics', d: 'M3 3v18h18M7 14l4-4 3 3 5-6' },
      { route: 'SubscriptionRevenue', label: 'sidebar.subscriptionRevenue', d: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
    ],
  },
  {
    label: 'sidebar.adminTools',
    items: [
      { route: 'Messages',           label: 'nav.messages', d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
      { route: 'ShoppyAdmin',        label: 'sidebar.shoppyAdmin', d: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
      { route: 'BroadcastMessaging', label: 'sidebar.broadcastMessaging', d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
      { route: 'PromotionMarket', label: 'sidebar.promotionMarket', d: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z' },
      { route: 'AdminLinks', label: 'sidebar.adminLinks', d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' },
      { route: 'AppDownloads', label: 'sidebar.appDownloads', d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3' },
    ],
  },
  {
    label: 'sidebar.account',
    items: [
      { route: 'AdminProfile', label: 'sidebar.adminProfile', d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
      { route: 'Settings', label: 'sidebar.settings', d: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.51a2 2 0 0 1 1-1.72l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z' },
    ],
  },
];

const BUSINESS_GROUPS = [
  {
    label: 'sidebar.main',
    items: [
      { route: 'BusinessDashboard', label: 'sidebar.dashboard', d: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
      { route: 'Products',          label: 'sidebar.products',        d: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12l8.73-5.04M12 22V12' },
      { route: 'Orders',            label: 'sidebar.orders',       d: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 10h6M9 14h6' },
      { route: 'Customers',         label: 'sidebar.customers',         d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
      { route: 'Messages',          label: 'nav.messages',             d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
    ],
  },
  {
    label: 'sidebar.salesTools',
    items: [
      { route: 'POS',         label: 'sidebar.pos', d: 'M2 3h20v14H2zM8 21h8M12 17v4' },
      { route: 'Analytics',   label: 'sidebar.analytics',    d: 'M3 3v18h18M7 14l4-4 3 3 5-6' },
      { route: 'Marketing',   label: 'sidebar.marketing',    d: 'M3 11l19-9-9 19-2-8-8-2z' },
      { route: 'Billing',     label: 'sidebar.billing',  d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8' },
      { route: 'Receivables', label: 'sidebar.receivables',     d: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
    ],
  },
  {
    label: 'sidebar.boutique',
    items: [
      { route: 'ThemeSelection',     label: 'sidebar.themeBuilder', d: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
      { route: 'Shoppy',             label: 'sidebar.shoppy',       d: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
      { route: 'BoutiqueAppearance', label: 'sidebar.appearance',        d: 'M2 13.5V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5.5M12 2L2 7l10 5 10-5-10-5z' },
      { route: 'VendooShop',         label: 'sidebar.vendooShop',      d: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0' },
      { route: 'PaymentSettings',    label: 'sidebar.payments',        d: 'M1 4h22v16H1zM1 10h22' },
      { route: 'Invoices',          label: 'sidebar.invoices',         d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8' },
      { route: 'SEO',               label: 'sidebar.seo',              d: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3 3H2a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm6 0h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8V3z' },
      { route: 'Referral',          label: 'sidebar.referral',       d: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' },
      { route: 'Boost',             label: 'sidebar.boost',            d: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
    ],
  },
  {
    label: 'sidebar.ecommerceSite',
    items: [
      { route: 'ThemeSitePreview', label: 'sidebar.viewMySite', d: 'M1 12s4-8 11-8 11 8 11 8 11 8-4 8-11 8-11-8-11-8z' },
    ],
  },
  {
    label: 'sidebar.aiArgentique',
    items: [
      { route: 'AIAgentique', label: 'sidebar.aiAgentique', d: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
    ],
  },
  {
    label: 'sidebar.community',
    items: [
      { route: 'QuartierScreen',  label: 'sidebar.quartier',  d: 'M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v16M16 6v16' },
      { route: 'BoutiqueCatalog', label: 'sidebar.catalog', d: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z' },
      { route: 'Marketplace',     label: 'nav.marketplace', d: 'M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18' },
    ],
  },
  {
    label: 'sidebar.management',
    items: [
      { route: 'Notifications',      label: 'nav.notifications',    d: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0' },
      { route: 'BoutiqueManagement', label: 'sidebar.boutiqueManagement', d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10' },
      { route: 'CaseManagement',     label: 'sidebar.caseManagement',         d: 'M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2' },
      { route: 'Settings',           label: 'sidebar.settings',         d: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.51a2 2 0 0 1 1-1.72l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z' },
    ],
  },
];

const BUYER_GROUPS = [
  {
    label: 'sidebar.main',
    items: [
      { route: 'BuyerDashboard', label: 'sidebar.buyerDashboard', d: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
      { route: 'Marketplace',     label: 'nav.marketplace', d: 'M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18' },
      { route: 'QuartierScreen',  label: 'sidebar.quartiers',  d: 'M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v16M16 6v16' },
      { route: 'VisitHistory',    label: 'nav.visitHistory',  d: 'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z' },
    ],
  },
  {
    label: 'sidebar.myPurchases',
    items: [
      { route: 'MyOrders',   label: 'sidebar.myOrders',    d: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 10h6M9 14h6' },
      { route: 'Spending',   label: 'nav.spending',      d: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
      { route: 'Favorites',  label: 'nav.favorites',       d: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' },
    ],
  },
  {
    label: 'sidebar.communication',
    items: [
      { route: 'Messages',       label: 'nav.messages',    d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
      { route: 'Notifications', label: 'nav.notifications', d: 'M18 8A6 6 0 0 1 6 14c0 0-2 1-2 2v4h4l2 2h4l2-2h4v-4c0-1-2-2-2-2a6 6 0 0 1-6-6z' },
      { route: 'StoreContacts',  label: 'sidebar.storeContacts',     d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
    ],
  },
  {
    label: 'sidebar.preferences',
    items: [
      { route: 'FavoriteDistricts', label: 'sidebar.favoriteDistricts', d: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' },
    ],
  },
  {
    label: 'sidebar.account',
    items: [
      { route: 'Settings',    label: 'sidebar.settings',      d: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.51a2 2 0 0 1 1-1.72l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z' },
    ],
  },
];

// Map route → display name
const ROUTE_LABELS: Record<string, string> = {};
[...ADMIN_GROUPS, ...BUSINESS_GROUPS, ...BUYER_GROUPS].forEach(g => g.items.forEach(i => { ROUTE_LABELS[i.route] = i.label; }));

// ── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar: React.FC<{ activeRoute: string; onLogout: () => void }> = ({ activeRoute, onLogout }) => {
  const navigation = useNavigation<Nav>();
  const { userType, user } = useAuth();
  const { t } = useLanguage();
  
  // Force admin for cbokilo18@gmail.com regardless of stored userType
  const isAdmin = user?.email === 'cbokilo18@gmail.com';
  const effectiveUserType = isAdmin ? 'admin' : userType;
  
  const groups = effectiveUserType === 'admin' ? ADMIN_GROUPS : effectiveUserType === 'buyer' ? BUYER_GROUPS : BUSINESS_GROUPS;
  const logoSub = effectiveUserType === 'admin' ? 'Admin' : effectiveUserType === 'buyer' ? t('nav.marketplace') : 'Business';

  return (
    <View style={s.sidebar}>
      <View style={s.logoRow}>
        <View style={s.logoBadge}><Text style={s.logoV}>V</Text></View>
        <View>
          <Text style={s.logoName}>Vendoo</Text>
          <Text style={s.logoSub}>{logoSub}</Text>
        </View>
      </View>

      <ScrollView style={s.nav} contentContainerStyle={{ paddingVertical: 8 }} showsVerticalScrollIndicator={false}>
        {groups.map(group => (
          <View key={group.label} style={s.group}>
            <Text style={s.groupLabel}>{t(group.label)}</Text>
            {group.items.map(({ route, label, d }) => {
              const active = activeRoute === route;
              return (
                <TouchableOpacity
                  key={route}
                  style={[s.item, active && s.itemActive]}
                  onPress={() => navigation.navigate(route as any)}
                  activeOpacity={0.7}
                >
                  {active && <View style={s.activeBar} />}
                  <Ico d={d} color={active ? T.orange : T.textSub} size={18} sw={active ? 2.1 : 1.9} />
                  <Text style={[s.itemLabel, active && s.itemLabelActive]}>{t(label)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity style={s.footerAvatar} onPress={() => navigation.navigate('Settings' as any)} activeOpacity={0.7}>
          <Text style={s.footerAvatarTxt}>{user?.email?.charAt(0).toUpperCase() || 'U'}</Text>
          <View style={s.footerEditIcon}>
            <Ico d="M15 3l6 6-9 9H9v-6l9-9zM11 13l3-3M6 21h6" color="#fff" size={8} sw={1.8} />
          </View>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.footerName}>{user?.displayName || user?.email?.split('@')[0] || t('webshell.user')}</Text>
          <Text style={s.footerRole}>{effectiveUserType === 'admin' ? 'Super Admin' : effectiveUserType === 'buyer' ? 'Client' : 'Admin · Plan Pro'}</Text>
        </View>
        <TouchableOpacity onPress={onLogout} style={s.logoutBtn} activeOpacity={0.7}>
          <Ico d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" color={T.muted} size={17} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ── Topbar (back / forward / breadcrumb) ─────────────────────────────────────
const Topbar: React.FC<{ routeName: string }> = ({ routeName }) => {
  const navigation = useNavigation<Nav>();
  const { userType, user } = useAuth();
  const { t } = useLanguage();
  const canGoBack  = navigation.canGoBack();

  // Force admin for cbokilo18@gmail.com regardless of stored userType
  const isAdmin = user?.email === 'cbokilo18@gmail.com';
  const effectiveUserType = isAdmin ? 'admin' : userType;

  const goBack = () => { if (canGoBack) navigation.goBack(); };

  const label = ROUTE_LABELS[routeName] ?? routeName;
  const homeRoute = effectiveUserType === 'admin' ? 'AdminDashboard' : effectiveUserType === 'buyer' ? 'BuyerDashboard' : 'BusinessDashboard';
  
  // Format date with translation
  const now = new Date();
  const dayName = t(`date.weekday.${now.getDay()}`);
  const monthName = t(`date.month.${now.getMonth()}`);
  const today = `${dayName} ${now.getDate()} ${monthName}`;

  return (
    <View style={s.topbar}>
      <TouchableOpacity
        style={[s.navBtn, !canGoBack && s.navBtnDisabled]}
        onPress={goBack}
        disabled={!canGoBack}
        activeOpacity={0.7}
      >
        <Ico d="M15 18l-6-6 6-6" color={canGoBack ? T.textMid : T.faint} size={18} sw={2.2} />
      </TouchableOpacity>

      <View style={s.breadcrumb}>
        <Text style={s.breadHome}
          onPress={() => navigation.navigate(homeRoute as any)}>
          {t('nav.home')}
        </Text>
        {routeName !== homeRoute && (
          <>
            <Ico d="M9 18l6-6-6-6" color={T.faint} size={14} sw={2} />
            <Text style={s.breadCurrent}>{t(label)}</Text>
          </>
        )}
      </View>

      <View style={s.topRight}>
        <Ico d="M12 8v4l2.5 2.5M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" color={T.muted} size={15} sw={1.8} />
        <Text style={s.topDate}>{today.charAt(0).toUpperCase() + today.slice(1)}</Text>
        <TouchableOpacity style={s.userProfile} onPress={() => navigation.navigate('Settings' as any)} activeOpacity={0.7}>
          <View style={s.userAvatar}>
            <Text style={s.userAvatarText}>{user?.email?.charAt(0).toUpperCase() || 'U'}</Text>
            <View style={s.editIcon}>
              <Ico d="M15 3l6 6-9 9H9v-6l9-9zM11 13l3-3M6 21h6" color="#fff" size={10} sw={1.8} />
            </View>
          </View>
          <Text style={s.userName}>{user?.displayName || user?.email?.split('@')[0] || t('webshell.user')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ── WebShell ─────────────────────────────────────────────────────────────────
interface Props {
  children: React.ReactNode;
  activeRoute: string;
}

const WebShell: React.FC<Props> = ({ children, activeRoute }) => {
  const handleLogout = async () => {
    try { await signOut(auth); } catch { /* ignore */ }
  };

  return (
    <View style={s.root}>
      <Sidebar activeRoute={activeRoute} onLogout={handleLogout} />
      <View style={s.main}>
        <Topbar routeName={activeRoute} />
        <View style={s.content}>{children}</View>
      </View>
    </View>
  );
};

export default WebShell;

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: T.page },

  // Sidebar
  sidebar:        { width: 244, backgroundColor: T.sidebar, borderRightWidth: 1, borderRightColor: T.border, flexDirection: 'column' },
  logoRow:        { flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 18, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: T.border },
  logoBadge:      { width: 36, height: 36, borderRadius: 11, backgroundColor: T.orange, alignItems: 'center', justifyContent: 'center', ...shadow.card, shadowColor: T.orange, shadowOpacity: 0.3 },
  logoV:          { color: '#fff', fontWeight: '900', fontSize: 19 },
  logoName:       { color: T.text, fontWeight: '800', fontSize: 16, letterSpacing: -0.2 },
  logoSub:        { color: T.muted, fontSize: 10.5, fontWeight: '600', letterSpacing: 0.3 },

  nav:            { flex: 1 },
  group:          { marginBottom: 10 },
  groupLabel:     { fontSize: 10, fontWeight: '700', color: T.muted, paddingHorizontal: 18, paddingVertical: 6, letterSpacing: 0.9 },
  item:           { flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 12, paddingVertical: 9, marginHorizontal: 10, borderRadius: 10, position: 'relative' },
  itemActive:     { backgroundColor: T.orangeSoft },
  activeBar:      { position: 'absolute', left: -10, top: 9, bottom: 9, width: 3, borderTopRightRadius: 3, borderBottomRightRadius: 3, backgroundColor: T.orange },
  itemLabel:      { fontSize: 13, color: T.textMid, fontWeight: '500', flex: 1 },
  itemLabelActive:{ color: T.orangeDark, fontWeight: '700' },

  footer:         { borderTopWidth: 1, borderTopColor: T.border, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  footerAvatar:   { width: 34, height: 34, borderRadius: 10, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center' },
  footerAvatarTxt:{ color: '#fff', fontWeight: '800', fontSize: 12 },
  footerEditIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: T.text, borderRadius: 6, width: 14, height: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: T.sidebar },
  footerName:     { color: T.text, fontSize: 12.5, fontWeight: '700' },
  footerRole:     { color: T.muted, fontSize: 10.5, fontWeight: '500' },
  logoutBtn:      { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: T.surfaceAlt },

  // Topbar
  topbar:         { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 22, height: 56, backgroundColor: T.surface, borderBottomWidth: 1, borderBottomColor: T.border },
  navBtn:         { width: 32, height: 32, borderRadius: 9, backgroundColor: T.surfaceAlt, borderWidth: 1, borderColor: T.border, alignItems: 'center', justifyContent: 'center' },
  navBtnDisabled: { opacity: 0.45 },
  breadcrumb:     { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  breadHome:      { fontSize: 13, color: T.textSub, fontWeight: '500' },
  breadCurrent:   { fontSize: 13, color: T.text, fontWeight: '700' },
  topRight:       { flexDirection: 'row', alignItems: 'center', gap: 7 },
  topDate:        { fontSize: 12.5, color: T.textSub, fontWeight: '500' },
  userProfile:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 12, paddingLeft: 12, borderLeftWidth: 1, borderLeftColor: T.border },
  userAvatar:     { width: 36, height: 36, borderRadius: 18, backgroundColor: T.orange, alignItems: 'center', justifyContent: 'center' },
  userAvatarText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  editIcon:       { position: 'absolute', bottom: 0, right: 0, backgroundColor: T.text, borderRadius: 8, width: 16, height: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: T.surface },
  userName:       { fontSize: 13, fontWeight: '600', color: T.text },

  // Main content
  main:           { flex: 1, flexDirection: 'column' },
  content:        { flex: 1, backgroundColor: T.page },
});
