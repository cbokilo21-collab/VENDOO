import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useNavigation, NavigationProp } from '@react-navigation/native';

const C = {
  bg: '#FFFFFF',
  border: '#E5E7EB',
  active: '#FF6B35',
  inactive: '#9CA3AF',
  text: '#111827',
};

interface Module {
  id: string;
  label: string;
  icon: string;
  route: string;
}

const MODULES: Module[] = [
  { id: 'dashboard', label: 'Accueil', icon: 'M3 3v18h18M3 12l9-9 9 9M12 17V7', route: 'BusinessDashboard' },
  { id: 'products', label: 'Produits', icon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z', route: 'Products' },
  { id: 'orders', label: 'Commandes', icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 10h6M9 14h6M9 18h6', route: 'Orders' },
  { id: 'customers', label: 'Clients', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', route: 'Customers' },
  { id: 'messages', label: 'Messages', icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', route: 'Messages' },
  { id: 'analytics', label: 'Analytics', icon: 'M3 3v18h18M7 14l4-4 3 3 5-6', route: 'Analytics' },
  { id: 'theme', label: 'Constructeur', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', route: 'ThemeSelection' },
];

interface ModuleBarProps {
  activeRoute?: string;
}

const ModuleBar: React.FC<ModuleBarProps> = ({ activeRoute }) => {
  const navigation = useNavigation<NavigationProp<any>>();

  const handlePress = (route: string) => {
    navigation.navigate(route as any);
  };

  return (
    <View style={s.container}>
      {MODULES.map((module) => {
        const isActive = activeRoute === module.route || activeRoute?.includes(module.id);
        return (
          <TouchableOpacity
            key={module.id}
            style={[s.module, isActive && s.moduleActive]}
            onPress={() => handlePress(module.route)}
            activeOpacity={0.7}
          >
            <Svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke={isActive ? C.active : C.inactive}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <Path d={module.icon} />
            </Svg>
            <Text style={[s.label, isActive && s.labelActive]}>{module.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingHorizontal: 8,
    paddingVertical: 8,
    paddingBottom: 8,
  },
  module: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
  },
  moduleActive: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
  },
  label: {
    fontSize: 11,
    color: C.inactive,
    fontWeight: '500',
    marginTop: 4,
  },
  labelActive: {
    color: C.active,
    fontWeight: '600',
  },
});

export default ModuleBar;
