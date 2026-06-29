import React from 'react';
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

// Main app
import BusinessDashboard    from '../screens/BusinessDashboard';
import BuyerDashboard       from '../screens/BuyerDashboard';
import ProductsScreen       from '../screens/ProductsScreen';
import OrdersScreen         from '../screens/OrdersScreen';
import OrderDetailScreen    from '../screens/OrderDetailScreen';
import CustomersScreen      from '../screens/CustomersScreen';
import CustomerDetailScreen from '../screens/CustomerDetailScreen';
import SettingsScreen       from '../screens/SettingsScreen';
import MyOrdersScreen       from '../screens/MyOrdersScreen';
import FavoritesScreen      from '../screens/FavoritesScreen';
import MessagesScreen       from '../screens/MessagesScreen';
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
import QuartierScreen           from '../screens/QuartierScreen';
import BoutiqueCatalogScreen    from '../screens/BoutiqueCatalogScreen';
import MarketplaceScreen        from '../screens/MarketplaceScreen';

// Analytics, Notifications, Marketing
import AnalyticsScreen          from '../screens/AnalyticsScreen';
import NotificationsScreen      from '../screens/NotificationsScreen';
import NotificationDetailScreen from '../screens/NotificationDetailScreen';
import MarketingScreen          from '../screens/MarketingScreen';

// Online Store & AI
import OnlineStoreScreen         from '../screens/OnlineStoreScreen';
import AIAgentiqueScreen        from '../screens/AIAgentiqueScreen';

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

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0800' }}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: isWeb ? 'none' : 'slide_from_right' }}>
        {user ? (
          <>
            {/* ── Main dashboard (based on userType) ─────────────────────────────────────── */}
            {userType === 'buyer' ? (
              <>
                <Stack.Screen name="BuyerDashboard"       component={withWebShell(BuyerDashboard,        'BuyerDashboard')} />
                <Stack.Screen name="Marketplace"           component={withWebShell(MarketplaceScreen,     'Marketplace')} />
                <Stack.Screen name="QuartierScreen"        component={withWebShell(QuartierScreen,      'QuartierScreen')} />
                <Stack.Screen name="MyOrders"             component={withWebShell(MyOrdersScreen,       'MyOrders')} />
                <Stack.Screen name="OrderTracking"        component={withWebShell(OrderTrackingScreen,  'OrderTracking')} />
                <Stack.Screen name="Favorites"            component={withWebShell(FavoritesScreen,      'Favorites')} />
                <Stack.Screen name="Messages"             component={withWebShell(MessagesScreen,       'Messages')} />
                <Stack.Screen name="Notifications"       component={withWebShell(BuyerNotificationsScreen,  'Notifications')} />
                <Stack.Screen name="StoreContacts"        component={withWebShell(StoreContactsScreen,  'StoreContacts')} />
                <Stack.Screen name="SellerSurvey"         component={withWebShell(SellerSurveyScreen,   'SellerSurvey')} />
                <Stack.Screen name="Reviews"              component={withWebShell(ReviewsScreen,        'Reviews')} />
                <Stack.Screen name="Spending"             component={withWebShell(SpendingScreen,       'Spending')} />
                <Stack.Screen name="VisitHistory"         component={withWebShell(VisitHistoryScreen,   'VisitHistory')} />
                <Stack.Screen name="FavoriteDistricts"    component={withWebShell(FavoriteDistrictsScreen, 'FavoriteDistricts')} />
                <Stack.Screen name="Settings"             component={withWebShell(SettingsScreen,       'Settings')} />
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

                {/* ── Boutique tools ─────────────────────────────────────── */}
                <Stack.Screen name="POS"                component={withWebShell(POSScreen,               'POS')} />
                <Stack.Screen name="Invoice"            component={withWebShell(InvoiceScreen,           'Invoice')} />
                <Stack.Screen name="BoutiqueAppearance" component={withWebShell(BoutiqueAppearanceScreen,'BoutiqueAppearance')} />
                <Stack.Screen name="VendooShop"         component={withWebShell(VendooShopScreen,        'VendooShop')} />
                <Stack.Screen name="Billing"            component={withWebShell(BillingScreen,           'Billing')} />
                <Stack.Screen name="Receivables"        component={withWebShell(ReceivablesScreen,       'Receivables')} />
                <Stack.Screen name="PaymentSettings"    component={withWebShell(PaymentSettingsScreen,   'PaymentSettings')} />
                <Stack.Screen name="Sponsorship"        component={withWebShell(SponsorshipScreen,       'Sponsorship')} />

                {/* ── Online Store & AI ─────────────────────────────────── */}
                <Stack.Screen name="OnlineStore"        component={withWebShell(OnlineStoreScreen,       'OnlineStore')} />
                <Stack.Screen name="AIAgentique"       component={withWebShell(AIAgentiqueScreen,      'AIAgentique')} />

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

            {/* ── Quartier ────────────────────────────────────────────── */}
            <Stack.Screen name="QuartierScreen"     component={QuartierScreen}           />

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
