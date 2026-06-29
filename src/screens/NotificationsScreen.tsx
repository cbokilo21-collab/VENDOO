import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import { NotificationService, Notification } from '../services/notificationService';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';
import { T } from '../theme';

type NotifType = 'order' | 'message' | 'promotion' | 'review' | 'delivery' | 'system';

const getTypeConfig = (t: any) => ({
  order:     { color: T.info,    label: t('notifications.typeOrder') },
  message:   { color: T.violet,  label: t('notifications.typeMessage')  },
  promotion: { color: T.warning, label: t('notifications.typePromo')    },
  review:    { color: T.success, label: t('notifications.typeReview')      },
  delivery:  { color: T.orange,  label: t('notifications.typeDelivery') },
  system:    { color: T.muted,   label: t('notifications.typeSystem')  },
});

const NotifIcon: React.FC<{ type: NotifType; color: string }> = ({ type, color }) => {
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
    case 'message':
      return (
        <Svg width={18} height={18} viewBox="0 0 24 24" {...props}>
          <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      );
    case 'promotion':
      return (
        <Svg width={18} height={18} viewBox="0 0 24 24" {...props}>
          <Path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" strokeLinecap="round" strokeLinejoin="round"/>
          <Line x1="7" y1="7" x2="7.01" y2="7" strokeLinecap="round"/>
        </Svg>
      );
    case 'review':
      return (
        <Svg width={18} height={18} viewBox="0 0 24 24" {...props}>
          <Circle cx={12} cy={12} r={10}/>
          <Path d="M8 14s1.5 2 4 2 4-2 4-2" strokeLinecap="round"/>
          <Line x1="9" y1="9" x2="9.01" y2="9" strokeLinecap="round"/>
          <Line x1="15" y1="9" x2="15.01" y2="9" strokeLinecap="round"/>
        </Svg>
      );
    case 'delivery':
      return (
        <Svg width={18} height={18} viewBox="0 0 24 24" {...props}>
          <Rect x={1} y={3} width={15} height={13} rx={2} ry={2} strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M16 8h4a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-4" strokeLinecap="round" strokeLinejoin="round"/>
          <Circle cx={5.5} cy={18.5} r={2.5}/>
          <Circle cx={18.5} cy={18.5} r={2.5}/>
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
    default:
      return null;
  }
};

const NotificationsScreen: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      try {
        const userNotifications = await NotificationService.getUserNotifications(user.uid);
        setNotifications(userNotifications);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [user]);

  const formatRelativeTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('notifications.justNow');
    if (diffMins < 60) return `${t('notifications.ago')} ${diffMins} ${t('notifications.min')}`;
    if (diffHours < 24) return `${t('notifications.ago')} ${diffHours} ${t('notifications.hour')}`;
    if (diffDays === 1) return t('notifications.yesterday');
    if (diffDays < 7) return `${t('notifications.ago')} ${diffDays} ${t('notifications.day')}`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.read) {
      await NotificationService.markAsRead(notification.id!);
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
    }

    // Navigation basée sur le type de notification
    if (notification.type === 'order' && notification.data?.orderId) {
      (navigation as any).navigate('OrderTracking', { orderId: notification.data.orderId });
    } else if (notification.type === 'message' && notification.data?.conversationId) {
      (navigation as any).navigate('Messages');
    } else if (notification.type === 'order') {
      (navigation as any).navigate('MyOrders');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    await NotificationService.markAllAsRead(user.uid);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDelete = async (notificationId: string) => {
    await NotificationService.deleteNotification(notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <View style={s.root}>
        <View style={s.header}>
          <Text style={s.headerTitle}>{t('notifications.title')}</Text>
          <Text style={s.headerSub}>{t('notifications.yourAlerts')}</Text>
        </View>
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={T.orange} />
        </View>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <View style={s.header}>
        <View style={s.headerTop}>
          <Text style={s.headerTitle}>{t('notifications.title')}</Text>
          {unreadCount > 0 && (
            <View style={s.unreadBadge}>
              <Text style={s.unreadText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <Text style={s.headerSub}>{unreadCount > 0 ? `${unreadCount} ${t('notifications.unread')}` : t('notifications.allCaughtUp')}</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead} style={s.markAllBtn}>
            <Text style={s.markAllText}>{t('notifications.markAllRead')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>🔔</Text>
            <Text style={s.emptyTitle}>{t('notifications.noNotifications')}</Text>
            <Text style={s.emptySub}>{t('notifications.comeBackLater')}</Text>
          </View>
        ) : (
          notifications.map(notification => {
            const cfg = getTypeConfig(t)[notification.type as NotifType] || getTypeConfig(t).system;
            return (
              <TouchableOpacity
                key={notification.id}
                style={[s.notifCard, !notification.read && s.notifCardUnread]}
                onPress={() => handleNotificationPress(notification)}
                activeOpacity={0.7}
              >
                {!notification.read && <View style={s.unreadDot} />}
                <View style={[s.iconCircle, { backgroundColor: cfg.color + '20' }]}>
                  <NotifIcon type={notification.type as NotifType} color={cfg.color} />
                </View>
                <View style={s.notifBody}>
                  <View style={s.notifTop}>
                    <View style={[s.typePill, { backgroundColor: cfg.color + '20' }]}>
                      <Text style={[s.typePillText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                    <Text style={s.notifTime}>{formatRelativeTime(notification.createdAt)}</Text>
                  </View>
                  <Text style={[s.notifTitle, !notification.read && s.notifTitleUnread]}>
                    {notification.title}
                  </Text>
                  <Text style={s.notifBodyText} numberOfLines={2}>
                    {notification.body}
                  </Text>
                </View>
                <TouchableOpacity
                  style={s.deleteBtn}
                  onPress={() => handleDelete(notification.id!)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth={2}>
                    <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                  </Svg>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.page },
  header: { padding: 24, paddingBottom: 16 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: T.text },
  headerSub: { fontSize: 14, color: T.textSub, marginBottom: 12 },
  unreadBadge: { backgroundColor: T.orange, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  unreadText: { fontSize: 12, fontWeight: '800', color: T.white },
  markAllBtn: {},
  markAllText: { fontSize: 14, fontWeight: '700', color: T.orange },
  
  content: { flex: 1, paddingHorizontal: 24 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  emptyState: { padding: 60, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: T.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: T.textSub },
  
  notifCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: T.surface, borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: T.border,
    position: 'relative',
  },
  notifCardUnread: { borderColor: T.orange },
  unreadDot: { position: 'absolute', top: 16, left: 6, width: 7, height: 7, borderRadius: 4, backgroundColor: T.orange },
  
  iconCircle: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  
  notifBody: { flex: 1 },
  notifTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  typePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  typePillText: { fontSize: 10, fontWeight: '700' },
  notifTime: { fontSize: 12, color: T.muted },
  notifTitle: { fontSize: 15, fontWeight: '600', color: T.text, marginBottom: 4 },
  notifTitleUnread: { fontWeight: '700', color: T.text },
  notifBodyText: { fontSize: 13, color: T.textSub, lineHeight: 18 },
  
  deleteBtn: { alignSelf: 'flex-start' },
});

export default NotificationsScreen;
