import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle, Line } from 'react-native-svg';

const C = {
  navy: '#FF6B35', bg: '#FFF7F3', surface: '#FFFFFF', border: '#E5E7EB',
  accent: '#FF6B35', textDark: '#111827', textMid: '#374151', textLight: '#6B7280', muted: '#9CA3AF',
  success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6', purple: '#8B5CF6',
  white: '#FFFFFF',
};

type RootStackParamList = {
  Notifications: undefined;
  NotificationDetail: { notification: any };
  BusinessDashboard: undefined;
  Orders: undefined;
  Products: undefined;
  Analytics: undefined;
  Customers: undefined;
  Settings: undefined;
};

type NotifType = 'order' | 'stock' | 'ai' | 'system';

interface Notif {
  id: string; type: NotifType; title: string; body: string;
  time: string; read: boolean; route?: keyof RootStackParamList;
}

type Nav = NativeStackNavigationProp<RootStackParamList>;
type DetailRouteProp = RouteProp<RootStackParamList, 'NotificationDetail'>;

const typeConfig: Record<NotifType, { color: string; label: string }> = {
  order:  { color: C.info,    label: 'Commande' },
  stock:  { color: C.warning, label: 'Stock'    },
  ai:     { color: C.purple,  label: 'IA'       },
  system: { color: C.muted,   label: 'Système'  },
};

const NotifIcon: React.FC<{ type: NotifType; color: string }> = ({ type, color }) => {
  const props = { fill: 'none' as const, stroke: color, strokeWidth: 2 };
  switch (type) {
    case 'order':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" {...props}>
          <Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round"/>
          <Line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round"/>
          <Path d="M16 10a4 4 0 01-8 0" strokeLinecap="round"/>
        </Svg>
      );
    case 'stock':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" {...props}>
          <Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
          <Line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round"/>
          <Line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round"/>
        </Svg>
      );
    case 'ai':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" {...props}>
          <Path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      );
    case 'system':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" {...props}>
          <Circle cx={12} cy={12} r={10}/>
          <Line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round"/>
          <Line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round"/>
        </Svg>
      );
  }
};

const NotificationDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<DetailRouteProp>();
  const { notification } = route.params || {};
  
  if (!notification) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, color: '#374151' }}>Notification non fournie</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20, padding: 12, backgroundColor: '#FF6B35', borderRadius: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const cfg = typeConfig[notification.type as NotifType];

  console.log('NotificationDetailScreen loaded:', notification);
  console.log('Route:', notification.route);

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.textDark} strokeWidth={2}>
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Détails de la notification</Text>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Notification Card */}
        <View style={s.card}>
          <View style={s.iconContainer}>
            <View style={[s.iconCircle, { backgroundColor: cfg.color + '18' }]}>
              <NotifIcon type={notification.type} color={cfg.color}/>
            </View>
            <View style={[s.typeBadge, { backgroundColor: cfg.color + '18' }]}>
              <Text style={[s.typeBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
          </View>

          <Text style={s.title}>{notification.title}</Text>
          <Text style={s.time}>{notification.time}</Text>
          
          <View style={s.divider} />
          
          <Text style={s.body}>{notification.body}</Text>

          {notification.route && (
            <TouchableOpacity 
              style={[s.actionBtn, { backgroundColor: cfg.color }]}
              onPress={() => {
                console.log('Navigating to:', notification.route);
                switch (notification.route) {
                  case 'Orders':
                    navigation.navigate('Orders');
                    break;
                  case 'Products':
                    navigation.navigate('Products');
                    break;
                  case 'Analytics':
                    navigation.navigate('Analytics');
                    break;
                  case 'Customers':
                    navigation.navigate('Customers');
                    break;
                  case 'Settings':
                    navigation.navigate('Settings');
                    break;
                  case 'BusinessDashboard':
                    navigation.navigate('BusinessDashboard');
                    break;
                  default:
                    console.warn('Unknown route:', notification.route);
                }
              }}
            >
              <Text style={s.actionBtnText}>Voir les détails →</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Additional Info */}
        <View style={s.infoCard}>
          <Text style={s.infoTitle}>Informations</Text>
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>ID</Text>
            <Text style={s.infoValue}>{notification.id}</Text>
          </View>
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Statut</Text>
            <Text style={[s.infoValue, { color: notification.read ? C.success : C.accent }]}>
              {notification.read ? 'Lu' : 'Non lu'}
            </Text>
          </View>
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Type</Text>
            <Text style={s.infoValue}>{cfg.label}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 9,
    borderWidth: 1.5, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: C.textDark },
  
  content: { padding: 16, paddingBottom: 40 },
  
  card: {
    backgroundColor: C.surface, borderRadius: 16, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, marginBottom: 16,
  },
  iconContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  iconCircle: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  typeBadge: {
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20,
  },
  typeBadgeText: { fontSize: 12, fontWeight: '700' },
  
  title: { fontSize: 20, fontWeight: '700', color: C.textDark, marginBottom: 4 },
  time: { fontSize: 13, color: C.muted, marginBottom: 16 },
  divider: { height: 1, backgroundColor: C.border, marginBottom: 16 },
  body: { fontSize: 15, color: C.textMid, lineHeight: 24, marginBottom: 20 },
  
  actionBtn: {
    paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12,
    alignItems: 'center',
  },
  actionBtnText: { fontSize: 15, fontWeight: '700', color: C.white },
  
  infoCard: {
    backgroundColor: C.surface, borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6,
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: C.textDark, marginBottom: 12 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  infoLabel: { fontSize: 13, color: C.textLight },
  infoValue: { fontSize: 13, fontWeight: '600', color: C.textMid },
});

export default NotificationDetailScreen;
