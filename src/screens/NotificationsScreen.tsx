import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ScreenHeader } from '../components/ScreenHeader';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Animated, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
  BusinessDashboard: undefined;
  NotificationDetail: { notification: Notif };
  Orders: undefined;
  Products: undefined;
  Analytics: undefined;
  Customers: undefined;
  Settings: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList>;

type NotifType = 'order' | 'stock' | 'ai' | 'system';

interface Notif {
  id: string; type: NotifType; title: string; body: string;
  time: string; read: boolean; route?: keyof RootStackParamList;
}

const typeConfig: Record<NotifType, { color: string; label: string }> = {
  order:  { color: C.info,    label: 'Commande' },
  stock:  { color: C.warning, label: 'Stock'    },
  ai:     { color: C.purple,  label: 'IA'       },
  system: { color: C.muted,   label: 'Système'  },
};

const INITIAL_NOTIFS: Notif[] = [
  { id: 'n1',  type: 'order',  title: 'Nouvelle commande #1042',           body: 'Commande de 3 articles — € 287 — en attente de validation.',                                              time: 'il y a 3 min',  read: false, route: 'Orders'    },
  { id: 'n2',  type: 'ai',     title: '✦ Opportunité détectée',            body: 'Vos Sneakers Édition Limitée ont un taux de conversion +22% ce soir. Lancez une promo flash.',           time: 'il y a 14 min', read: false, route: 'Analytics' },
  { id: 'n3',  type: 'stock',  title: 'Stock critique — Veste Bomber',     body: 'Il ne reste que 2 unités. Réapprovisionnez avant rupture.',                                              time: 'il y a 1h',    read: false, route: 'Products'  },
  { id: 'n4',  type: 'order',  title: 'Commande #1041 expédiée',           body: 'Suivi : DHL · ETA demain avant 18h.',                                                                   time: 'il y a 2h',    read: true,  route: 'Orders'    },
  { id: 'n5',  type: 'ai',     title: '✦ Résumé hebdomadaire IA',          body: 'Revenus en hausse de +14 %. Vos top 3 clients ont commandé 8× ce mois.',                                time: 'il y a 4h',    read: true,  route: 'Analytics' },
  { id: 'n6',  type: 'system', title: 'Mise à jour disponible',            body: 'Vendoo v2.4.1 — nouvelles fonctionnalités Analytics & Notifications.',                                  time: 'hier',          read: true                          },
  { id: 'n7',  type: 'stock',  title: 'Stock épuisé — Montre Classique',   body: "Ce produit n'est plus disponible. Mettez à jour la fiche.",                                             time: 'hier',          read: true,  route: 'Products'  },
  { id: 'n8',  type: 'order',  title: "5 nouvelles commandes aujourd'hui", body: "Chiffre d'affaires du jour : € 1 284.",                                                                  time: 'hier',          read: true,  route: 'Orders'    },
  { id: 'n9',  type: 'ai',     title: '✦ Alerte tendance',                 body: 'La catégorie Bijoux est en forte hausse dans votre quartier. Envisagez d\'étendre votre catalogue.',    time: 'il y a 2 j',   read: true                          },
  { id: 'n10', type: 'system', title: 'Sauvegarde automatique effectuée',  body: 'Vos données ont été sauvegardées avec succès.',                                                          time: 'il y a 3 j',   read: true                          },
];

const FILTERS: (NotifType | 'all')[] = ['all', 'order', 'stock', 'ai', 'system'];
const FILTER_LABELS: Record<string, string> = { all: 'Tout', order: 'Commandes', stock: 'Stock', ai: 'IA', system: 'Système' };

const NotifIcon = React.memo<{ type: NotifType; color: string }>(({ type, color }) => {
  const props = { fill: 'none' as const, stroke: color, strokeWidth: 2 };
  switch (type) {
    case 'order':
      return (
        <Svg width={18} height={18} viewBox="0 0 24 24" {...props}>
          <Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round"/>
          <Line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round"/>
          <Path d="M16 10a4 4 0 01-8 0" strokeLinecap="round"/>
        </Svg>
      );
    case 'stock':
      return (
        <Svg width={18} height={18} viewBox="0 0 24 24" {...props}>
          <Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
          <Line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round"/>
          <Line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round"/>
        </Svg>
      );
    case 'ai':
      return (
        <Svg width={18} height={18} viewBox="0 0 24 24" {...props}>
          <Path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      );
    case 'system':
      return (
        <Svg width={18} height={18} viewBox="0 0 24 24" {...props}>
          <Circle cx={12} cy={12} r={10}/>
          <Line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round"/>
          <Line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round"/>
        </Svg>
      );
  }
});

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL_NOTIFS);
  const [filter, setFilter] = useState<NotifType | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const unread   = notifs.filter(n => !n.read).length;
  const filtered = filter === 'all' ? notifs : notifs.filter(n => n.type === filter);

  const markRead  = useCallback((id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)), []);
  const markAll   = useCallback(() => setNotifs(prev => prev.map(n => ({ ...n, read: true }))), []);
  const deleteOne = useCallback((id: string) => {
    setDeletingId(id);
    setTimeout(() => {
      setNotifs(prev => prev.filter(n => n.id !== id));
      setDeletingId(null);
    }, 200);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [filtered, fadeAnim, slideAnim]);

  const handlePress = (notif: Notif) => {
    markRead(notif.id);
    navigation.navigate('NotificationDetail', { notification: notif });
  };

  const handleFilterChange = useCallback((newFilter: NotifType | 'all') => {
    setFilter(newFilter);
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
  }, [fadeAnim, slideAnim]);

  const NotificationCard = React.memo(({ notif, isDeleting }: { notif: Notif; isDeleting: boolean }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    
    useEffect(() => {
      if (isDeleting) {
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else {
        scaleAnim.setValue(1);
      }
    }, [isDeleting, scaleAnim]);

    const cfg = typeConfig[notif.type];

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        }}
      >
        <TouchableOpacity
          style={[s.notifCard, !notif.read && s.notifCardUnread]}
          activeOpacity={0.7}
          onPress={() => handlePress(notif)}
        >
        {!notif.read && <View style={s.unreadDot}/>}
        <View style={[s.iconCircle, { backgroundColor: cfg.color + '18' }]}>
          <NotifIcon type={notif.type} color={cfg.color}/>
        </View>
        <View style={s.notifBody}>
          <View style={s.notifTop}>
            <View style={[s.typePill, { backgroundColor: cfg.color + '18' }]}>
              <Text style={[s.typePillText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
            <Text style={s.notifTime}>{notif.time}</Text>
          </View>
          <Text style={[s.notifTitle, !notif.read && s.notifTitleUnread]}>{notif.title}</Text>
          <Text style={s.notifBodyText} numberOfLines={2}>{notif.body}</Text>
          {notif.route && (
            <Text style={[s.notifCta, { color: cfg.color }]}>Voir →</Text>
          )}
        </View>
        <TouchableOpacity
          style={s.deleteBtn}
          onPress={() => deleteOne(notif.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2}>
            <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
          </Svg>
        </TouchableOpacity>
      </TouchableOpacity>
      </Animated.View>
    );
  });

  return (
    <View style={s.root}>
        <ScreenHeader title="Notifications" />
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.navigate('BusinessDashboard')}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.textDark} strokeWidth={2}>
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <View style={s.titleRow}>
            <Text style={s.headerTitle}>Notifications</Text>
            {unread > 0 && (
              <View style={s.unreadBadge}><Text style={s.unreadText}>{unread}</Text></View>
            )}
          </View>
          <Text style={s.headerSub}>{unread > 0 ? `${unread} non lues` : 'Tout est à jour'}</Text>
        </View>
        {unread > 0 && (
          <TouchableOpacity onPress={markAll}>
            <Text style={s.markAllText}>Tout lire</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterBar} contentContainerStyle={s.filterBarInner}>
        {FILTERS.map(f => (
          <TouchableOpacity 
            key={f} 
            style={[s.filterChip, filter === f && s.filterChipActive]} 
            onPress={() => handleFilterChange(f)}
            activeOpacity={0.7}
          >
            <Text style={[s.filterText, filter === f && s.filterTextActive]}>{FILTER_LABELS[f]}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView 
        contentContainerStyle={s.inner} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.accent}
            colors={[C.accent]}
          />
        }
      >
        {loading ? (
          <View style={s.loadingContainer}>
            <ActivityIndicator size="large" color={C.accent} />
            <Text style={s.loadingText}>Chargement...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <Animated.View style={[s.emptyCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={{ fontSize: 40, textAlign: 'center' }}>🔔</Text>
            <Text style={s.emptyTitle}>Aucune notification</Text>
            <Text style={s.emptySub}>Revenez plus tard</Text>
          </Animated.View>
        ) : null}

        {filtered.map((notif) => (
          <NotificationCard 
            key={notif.id} 
            notif={notif} 
            isDeleting={deletingId === notif.id}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: C.bg },
  header:  { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { width: 36, height: 36, borderRadius: 9, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  titleRow:{ flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: C.textDark },
  headerSub:   { fontSize: 12, color: C.textLight },
  unreadBadge: { backgroundColor: C.accent, borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2 },
  unreadText:  { fontSize: 11, fontWeight: '800', color: C.white },
  markAllText: { fontSize: 13, fontWeight: '700', color: C.accent },

  filterBar:      { maxHeight: 52, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  filterBarInner: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: 'row', alignItems: 'center' },
  filterChip:      { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.bg },
  filterChipActive:{ backgroundColor: C.accent, borderColor: C.accent },
  filterText:      { fontSize: 12, color: C.textMid, fontWeight: '500' },
  filterTextActive:{ color: C.white, fontWeight: '700' },

  inner: { padding: 16, gap: 10, paddingBottom: 40 },

  notifCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: C.surface, borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6,
    position: 'relative',
  },
  notifCardUnread: { borderWidth: 1.5, borderColor: C.border },
  unreadDot: { position: 'absolute', top: 16, left: 6, width: 7, height: 7, borderRadius: 4, backgroundColor: C.accent },

  iconCircle: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

  notifBody: { flex: 1, gap: 4 },
  notifTop:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  typePill:      { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  typePillText:  { fontSize: 10, fontWeight: '700' },
  notifTime:     { fontSize: 11, color: C.muted },
  notifTitle:    { fontSize: 14, fontWeight: '600', color: C.textMid, lineHeight: 20 },
  notifTitleUnread: { fontWeight: '700', color: C.textDark },
  notifBodyText: { fontSize: 13, color: C.textLight, lineHeight: 19 },
  notifCta:      { fontSize: 12, fontWeight: '700', marginTop: 2 },
  deleteBtn:     { alignSelf: 'flex-start' },

  emptyCard:  { backgroundColor: C.surface, borderRadius: 16, padding: 40, alignItems: 'center', gap: 8, marginTop: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: C.textDark, textAlign: 'center' },
  emptySub:   { fontSize: 13, color: C.textLight, textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 14, color: C.textLight, fontWeight: '500' },
});

export default React.memo(NotificationsScreen);
