import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ScrollView } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { BoutiqueProvider } from './src/contexts/BoutiqueContext';
import { ProductsProvider } from './src/contexts/ProductsContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { CurrencyProvider } from './src/contexts/CurrencyContext';
import { DialogProvider } from './src/contexts/DialogContext';
import AppNavigator from './src/navigation/AppNavigator';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: string | null }> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }
  componentDidCatch(error: Error) {
    this.setState({ error: error.message + '\n' + error.stack });
  }
  static getDerivedStateFromError(error: Error) {
    return { error: error.message + '\n' + error.stack };
  }
  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 60 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#c00', marginBottom: 12 }}>
            🛑 Erreur de rendu
          </Text>
          <ScrollView>
            <Text style={{ fontSize: 12, color: '#333', fontFamily: 'monospace' }}>
              {this.state.error}
            </Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <CurrencyProvider>
          <AuthProvider>
            <BoutiqueProvider>
              <ProductsProvider>
                <DialogProvider>
                  <AppNavigator />
                  <StatusBar style="dark" />
                </DialogProvider>
              </ProductsProvider>
            </BoutiqueProvider>
          </AuthProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
