import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import WebShell from '../components/WebShell';

const isWeb = Platform.OS === 'web';

// HOC — wraps a screen component with WebShell on web
function withWebShell(WrappedComponent: React.ComponentType<any>, routeName: string) {
  const Wrapped: React.FC<any> = (props) => {
    if (!isWeb) return <WrappedComponent {...props} />;
    return (
      <WebShell activeRoute={routeName}>
        <WrappedComponent {...props} />
      </WebShell>
    );
  };
  Wrapped.displayName = `WebShell(${routeName})`;
  return Wrapped;
}

// Auth screens
import LandingScreen        from '../screens/LandingScreen';
import LoginScreen          from '../screens/LoginScreen';
import RegisterScreen       from '../screens/RegisterScreen';

// Onboarding
import CreateBoutiqueScreen from '../screens/CreateBoutiqueScreen';
import BoutiqueKeysScreen   from '../screens/BoutiqueKeysScreen';
import BoutiqueTutorialScreen from '../screens/BoutiqueTutorialScreen';
import BuyerTutorialScreen from '../screens/BuyerTutorialScreen';

// Admin screens
import UsersManagementScreen from '../screens/UsersManagementScreen';
import SalesAnalyticsScreen from '../screens/SalesAnalyticsScreen';
import SubscriptionRevenueScreen from '../screens/SubscriptionRevenueScreen';
import BroadcastMessagingScreen from '../screens/BroadcastMessagingScreen';
import PromotionMarketScreen from '../screens/PromotionMarketScreen';
import AdminProfileScreen from '../screens/AdminProfileScreen';
import AdminLinksScreen from '../screens/AdminLinksScreen';
import AppDownloadsScreen from '../screens/AppDownloadsScreen';
import AdminPaymentStatsScreen from '../screens/AdminPaymentStatsScreen';

// Main app
import BusinessDashboard    from '../screens/BusinessDashboard';
import BuyerDashboard       from '../screens/BuyerDashboard';
import AdminDashboard       from '../screens/AdminDashboard';
import ProductsScreen       from '../screens/ProductsScreen';
import OrdersScreen         from '../screens/OrdersScreen';
import OrderDetailScreen    from '../screens/OrderDetailScreen';
import CustomersScreen      from '../screens/CustomersScreen';
import CustomerDetailScreen from '../screens/CustomerDetailScreen';
import SettingsScreen       from '../screens/SettingsScreen';
import MyOrdersScreen       from '../screens/MyOrdersScreen';
import FavoritesScreen      from '../screens/FavoritesScreen';
import MessagesScreen       from '../screens/MessagesScreen';
import ConversationScreen   from '../screens/ConversationScreen';
import FavoriteDistrictsScreen from '../screens/FavoriteDistrictsScreen';
import SpendingScreen       from '../screens/SpendingScreen';
import VisitHistoryScreen   from '../screens/VisitHistoryScreen';
import OrderTrackingScreen  from '../screens/OrderTrackingScreen';
import BuyerNotificationsScreen from '../screens/NotificationsScreen';
import StoreContactsScreen  from '../screens/StoreContactsScreen';
import SellerSurveyScreen   from '../screens/SellerSurveyScreen';
import ReviewsScreen        from '../screens/ReviewsScreen';

// Tools
import POSScreen            from '../screens/POSScreen';
import InvoiceScreen        from '../screens/InvoiceScreen';
import BoutiqueAppearanceScreen from '../screens/BoutiqueAppearanceScreen';
import VendooShopScreen     from '../screens/VendooShopScreen';
import BillingScreen         from '../screens/BillingScreen';
import ReceivablesScreen     from '../screens/ReceivablesScreen';
import PaymentSettingsScreen from '../screens/PaymentSettingsScreen';
import SponsorshipScreen     from '../screens/SponsorshipScreen';

// Quartier / social
import CountrySelectionScreen   from '../screens/CountrySelectionScreen';
import QuartierScreen           from '../screens/QuartierScreen';
import BoutiqueCatalogScreen    from '../screens/BoutiqueCatalogScreen';
import MarketplaceScreen        from '../screens/MarketplaceScreen';

// Analytics, Notifications, Marketing
import AnalyticsScreen          from '../screens/AnalyticsScreen';
import NotificationsScreen      from '../screens/NotificationsScreen';
import NotificationDetailScreen from '../screens/NotificationDetailScreen';
import MarketingScreen          from '../screens/MarketingScreen';

// AI
import AIAgentiqueScreen        from '../screens/AIAgentiqueScreen';

// Theme Builder
import ThemeSelectionScreen     from '../screens/ThemeSelectionScreen';
import ThemeElementDetailScreen from '../screens/ThemeElementDetailScreen';
import ThemeBuilder             from '../screens/ThemeBuilder';
import ThemeBuilderAdvanced     from '../screens/ThemeBuilderAdvanced';
import ThemeSitePreviewScreen   from '../screens/ThemeSitePreviewScreen';
import ShoppyScreen             from '../screens/ShoppyScreen';
import ShoppyCheckoutScreen     from '../screens/ShoppyCheckoutScreen';
import ShoppyAdminScreen        from '../screens/ShoppyAdminScreen';
import PackSelectionScreen      from '../screens/PackSelectionScreen';
import PaymentScreen            from '../screens/PaymentScreen';
import EmailVerificationScreen  from '../screens/EmailVerificationScreen';
import TwoFactorAuthScreen      from '../screens/TwoFactorAuthScreen';
import SecurityPuzzleScreen     from '../screens/SecurityPuzzleScreen';
import WalletScreen             from '../screens/WalletScreen';

// New Features
import InvoicesScreen           from '../screens/InvoicesScreen';
import SEOScreen                from '../screens/SEOScreen';
import ReferralScreen           from '../screens/ReferralScreen';
import BoostScreen              from '../screens/BoostScreen';

// Legacy (kept for compatibility)
import BoutiqueManagementScreen from '../screens/BoutiqueManagementScreen';
import CaseManagementScreen     from '../screens/CaseManagementScreen';

const Stack = createNativeStackNavigator();

const AppNavigator: React.FC = () => {
  const { user, userType, loading } = useAuth();
  
  // Force admin for cbokilo18@gmail.com regardless of stored userType
  const isAdmin = user?.email === 'cbokilo18@gmail.com';
  const effectiveUserType = isAdmin ? 'admin' : userType;

  // Navigation ref
  const navigationRef = useRef<any>(null);

  // Clear any old saved routes on mount to prevent navigation errors
  useEffect(() => {
    if (Platform.OS === 'web') {
      localStorage.removeItem('vendoo_current_route');
    }
  }, []);

  // Determine initial route based on auth state
  const getInitialRoute = () => {
    if (!user) return 'Landing';
    if (effectiveUserType === 'admin') return 'AdminDashboard';
    if (effectiveUserType === 'buyer') return 'BuyerDashboard';
    return 'BusinessDashboard';
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0800' }}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
    >
      <Stack.Navigator 
        screenOptions={{ headerShown: false, animation: isWeb ? 'none' : 'slide_from_right' }}
        initialRouteName={getInitialRoute()}
      >
        {user ? (
          <>
            {/* ── Main dashboard (based on userType) ─────────────────────────────────────── */}
            {effectiveUserType === 'admin' ? (
              <>
                <Stack.Screen name="AdminDashboard"       component={withWebShell(AdminDashboard,        'AdminDashboard')} />
                <Stack.Screen name="UsersManagement"      component={withWebShell(UsersManagementScreen,   'UsersManagement')} />
                <Stack.Screen name="SalesAnalytics"       component={withWebShell(SalesAnalyticsScreen,    'SalesAnalytics')} />
                <Stack.Screen name="SubscriptionRevenue" component={withWebShell(SubscriptionRevenueScreen, 'SubscriptionRevenue')} />
                <Stack.Screen name="BroadcastMessaging"  component={withWebShell(BroadcastMessagingScreen, 'BroadcastMessaging')} />
                <Stack.Screen name="PromotionMarket"     component={withWebShell(PromotionMarketScreen,    'PromotionMarket')} />
                <Stack.Screen name="AdminProfile"        component={withWebShell(AdminProfileScreen,       'AdminProfile')} />
                <Stack.Screen name="AdminLinks"          component={withWebShell(AdminLinksScreen,         'AdminLinks')} />
                <Stack.Screen name="AppDownloads"        component={withWebShell(AppDownloadsScreen,       'AppDownloads')} />
                <Stack.Screen name="AdminPaymentStats"   component={withWebShell(AdminPaymentStatsScreen,  'AdminPaymentStats')} />
                <Stack.Screen name="ShoppyAdmin"         component={withWebShell(ShoppyAdminScreen,        'ShoppyAdmin')} />
                <Stack.Screen name="Messages"            component={withWebShell(MessagesScreen,        'Messages')} />
                <Stack.Screen name="Conversation"        component={withWebShell(ConversationScreen,       'Conversation')} />
                <Stack.Screen name="Settings"            component={withWebShell(SettingsScreen,           'Settings')} />
              </>
            ) : userType === 'buyer' ? (
              <>
                <Stack.Screen name="BuyerDashboard"       component={withWebShell(BuyerDashboard,        'BuyerDashboard')} />
                <Stack.Screen name="Marketplace"           component={withWebShell(MarketplaceScreen,     'Marketplace')} />
                <Stack.Screen name="CountrySelection"     component={withWebShell(CountrySelectionScreen, 'CountrySelection')} />
                <Stack.Screen name="QuartierScreen"        component={withWebShell(QuartierScreen,      'QuartierScreen')} />
                <Stack.Screen name="MyOrders"             component={withWebShell(MyOrdersScreen,       'MyOrders')} />
                <Stack.Screen name="OrderTracking"        component={withWebShell(OrderTrackingScreen,  'OrderTracking')} />
                <Stack.Screen name="Favorites"            component={withWebShell(FavoritesScreen,      'Favorites')} />
                <Stack.Screen name="Messages"             component={withWebShell(MessagesScreen,       'Messages')} />
                <Stack.Screen name="Conversation"         component={withWebShell(ConversationScreen,   'Conversation')} />
                <Stack.Screen name="Notifications"       component={withWebShell(BuyerNotificationsScreen,  'Notifications')} />
                <Stack.Screen name="StoreContacts"        component={withWebShell(StoreContactsScreen,  'StoreContacts')} />
                <Stack.Screen name="SellerSurvey"         component={withWebShell(SellerSurveyScreen,   'SellerSurvey')} />
                <Stack.Screen name="Reviews"              component={withWebShell(ReviewsScreen,        'Reviews')} />
                <Stack.Screen name="Spending"             component={withWebShell(SpendingScreen,       'Spending')} />
                <Stack.Screen name="VisitHistory"         component={withWebShell(VisitHistoryScreen,   'VisitHistory')} />
                <Stack.Screen name="FavoriteDistricts"    component={withWebShell(FavoriteDistrictsScreen, 'FavoriteDistricts')} />
                <Stack.Screen name="Settings"             component={withWebShell(SettingsScreen,       'Settings')} />

                {/* ── Onboarding ─────────────────────────────────────────── */}
                <Stack.Screen name="BuyerTutorial"        component={withWebShell(BuyerTutorialScreen,   'BuyerTutorial')} />
              </>
            ) : (
              <>
                <Stack.Screen name="BusinessDashboard"  component={withWebShell(BusinessDashboard,  'BusinessDashboard')} />
                <Stack.Screen name="Products"           component={withWebShell(ProductsScreen,      'Products')} />
                <Stack.Screen name="Orders"             component={withWebShell(OrdersScreen,        'Orders')} />
                <Stack.Screen name="OrderDetail"        component={withWebShell(OrderDetailScreen,   'Orders')} />
                <Stack.Screen name="Customers"          component={withWebShell(CustomersScreen,     'Customers')} />
                <Stack.Screen name="CustomerDetail"     component={withWebShell(CustomerDetailScreen,'Customers')} />
                <Stack.Screen name="Settings"           component={withWebShell(SettingsScreen,      'Settings')} />
                <Stack.Screen name="Messages"           component={withWebShell(MessagesScreen,       'Messages')} />
                <Stack.Screen name="Conversation"       component={withWebShell(ConversationScreen,   'Conversation')} />

                {/* ── Boutique tools ─────────────────────────────────────── */}
                <Stack.Screen name="POS"                component={withWebShell(POSScreen,               'POS')} />
                <Stack.Screen name="Invoice"            component={withWebShell(InvoiceScreen,           'Invoice')} />
                <Stack.Screen name="BoutiqueAppearance" component={withWebShell(BoutiqueAppearanceScreen,'BoutiqueAppearance')} />
                <Stack.Screen name="VendooShop"         component={withWebShell(VendooShopScreen,        'VendooShop')} />
                <Stack.Screen name="Billing"            component={withWebShell(BillingScreen,           'Billing')} />
                <Stack.Screen name="Receivables"        component={withWebShell(ReceivablesScreen,       'Receivables')} />
                <Stack.Screen name="PaymentSettings"    component={withWebShell(PaymentSettingsScreen,   'PaymentSettings')} />
                <Stack.Screen name="Sponsorship"        component={withWebShell(SponsorshipScreen,       'Sponsorship')} />

                {/* ── AI ─────────────────────────────────────────────────── */}
                <Stack.Screen name="AIAgentique"       component={withWebShell(AIAgentiqueScreen,      'AIAgentique')} />

                {/* ── Theme Builder ─────────────────────────────────────── */}
                <Stack.Screen name="ThemeSelection"       component={withWebShell(ThemeSelectionScreen,    'ThemeSelection')} />
                <Stack.Screen name="ThemeBuilder"         component={withWebShell(ThemeBuilder,           'ThemeBuilder')} />
                <Stack.Screen name="ThemeBuilderAdvanced" component={withWebShell(ThemeBuilderAdvanced,   'ThemeBuilderAdvanced')} />
                <Stack.Screen name="ThemeSitePreview"     component={ThemeSitePreviewScreen} />
                <Stack.Screen name="ThemeElementDetail"    component={withWebShell(ThemeElementDetailScreen, 'ThemeElementDetail')} />
                <Stack.Screen name="Shoppy"                component={withWebShell(ShoppyScreen,           'Shoppy')} />
                <Stack.Screen name="ShoppyCheckout"       component={withWebShell(ShoppyCheckoutScreen,   'Shoppy')} />
                <Stack.Screen name="PackSelection"        component={withWebShell(PackSelectionScreen,     'PackSelection')} />
                <Stack.Screen name="Payment"              component={withWebShell(PaymentScreen,           'Payment')} />
                <Stack.Screen name="EmailVerification"    component={withWebShell(EmailVerificationScreen, 'EmailVerification')} />
                <Stack.Screen name="TwoFactorAuth"        component={withWebShell(TwoFactorAuthScreen,     'TwoFactorAuth')} />
                <Stack.Screen name="SecurityPuzzle"       component={withWebShell(SecurityPuzzleScreen,    'SecurityPuzzle')} />
                <Stack.Screen name="Wallet"               component={withWebShell(WalletScreen,            'Wallet')} />

                {/* ── New Features ─────────────────────────────────────────── */}
                <Stack.Screen name="Invoices"          component={withWebShell(InvoicesScreen,         'Invoices')} />
                <Stack.Screen name="SEO"               component={withWebShell(SEOScreen,              'SEO')} />
                <Stack.Screen name="Referral"          component={withWebShell(ReferralScreen,         'Referral')} />
                <Stack.Screen name="Boost"             component={withWebShell(BoostScreen,            'Boost')} />

                {/* ── Onboarding ─────────────────────────────────────────── */}
                <Stack.Screen name="CreateBoutique"     component={withWebShell(CreateBoutiqueScreen,  'CreateBoutique')} />
                <Stack.Screen name="BoutiqueKeys"       component={withWebShell(BoutiqueKeysScreen,    'BoutiqueKeys')} />
                <Stack.Screen name="BoutiqueTutorial"   component={withWebShell(BoutiqueTutorialScreen,'BoutiqueTutorial')} />

                {/* ── Quartier ────────────────────────────────────────────── */}
                <Stack.Screen name="QuartierScreen"     component={withWebShell(QuartierScreen,        'QuartierScreen')} />
                <Stack.Screen name="BoutiqueCatalog"    component={withWebShell(BoutiqueCatalogScreen, 'BoutiqueCatalog')} />
                <Stack.Screen name="Marketplace"        component={withWebShell(MarketplaceScreen,     'Marketplace')} />

                {/* ── Analytics, Notifications, Marketing ─────────────────── */}
                <Stack.Screen name="Analytics"          component={withWebShell(AnalyticsScreen,       'Analytics')} />
                <Stack.Screen name="Notifications"      component={withWebShell(NotificationsScreen,   'Notifications')} />
                <Stack.Screen name="NotificationDetail" component={withWebShell(NotificationDetailScreen, 'Notifications')} />
                <Stack.Screen name="Marketing"          component={withWebShell(MarketingScreen,       'Marketing')} />

                {/* ── Gestion ─────────────────────────────────────────────── */}
                <Stack.Screen name="BoutiqueManagement" component={withWebShell(BoutiqueManagementScreen,'BoutiqueManagement')} />
                <Stack.Screen name="CaseManagement"     component={withWebShell(CaseManagementScreen,   'CaseManagement')} />
              </>
            )}
          </>
        ) : (
          <>
            {/* ── Auth ───────────────────────────────────────────────── */}
            <Stack.Screen name="Landing"            component={LandingScreen}        />
            <Stack.Screen name="Login"              component={LoginScreen}          />
            <Stack.Screen name="Register"           component={RegisterScreen}       />

            {/* ── Onboarding (peut être vu avant connexion) ──────────── */}
            <Stack.Screen name="CreateBoutique"     component={CreateBoutiqueScreen} />
            <Stack.Screen name="BoutiqueKeys"       component={BoutiqueKeysScreen}   />
            <Stack.Screen name="BoutiqueTutorial"   component={BoutiqueTutorialScreen} />
            <Stack.Screen name="BuyerTutorial"      component={BuyerTutorialScreen} />

            {/* ── Quartier ────────────────────────────────────────────── */}
            <Stack.Screen name="CountrySelection"   component={CountrySelectionScreen} />
            <Stack.Screen name="QuartierScreen"     component={QuartierScreen}           />
            <Stack.Screen name="BoutiqueCatalog"    component={BoutiqueCatalogScreen}    />

            {/* ── Boutique management ──────────────────────────────────── */}
            <Stack.Screen name="BoutiqueManagement" component={BoutiqueManagementScreen} />
            <Stack.Screen name="CaseManagement"     component={CaseManagementScreen}     />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
