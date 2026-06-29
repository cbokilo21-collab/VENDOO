import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { MessagingService, Conversation } from '../services/messagingService';
import { T } from '../theme';

const MessagesScreen: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadConversations = async () => {
      try {
        const convs = await MessagingService.getBuyerConversations(user.uid);
        setConversations(convs);
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();

    // Écouter les changements en temps réel
    const unsubscribe = MessagingService.subscribeToBuyerConversations(user.uid, (convs) => {
      setConversations(convs);
    });

    return () => unsubscribe();
  }, [user]);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('messages.justNow');
    if (diffMins < 60) return `${t('messages.ago')} ${diffMins} ${t('messages.min')}`;
    if (diffHours < 24) return `${t('messages.ago')} ${diffHours} ${t('messages.hour')}`;
    if (diffDays === 1) return t('messages.yesterday');
    if (diffDays < 7) return `${t('messages.ago')} ${diffDays} ${t('messages.day')}`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const handleConversationPress = async (conversation: Conversation) => {
    // Marquer les messages comme lus
    try {
      await MessagingService.markMessagesAsRead(conversation.id!, user!.uid);
      // Naviguer vers l'écran de conversation (à implémenter)
      console.log('Navigate to conversation:', conversation.id);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  if (loading) {
    return (
      <View style={s.root}>
        <View style={s.header}>
          <Text style={s.headerTitle}>{t('messages.title')}</Text>
          <Text style={s.headerSub}>{t('messages.subtitle')}</Text>
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
        <Text style={s.headerTitle}>{t('messages.title')}</Text>
        <Text style={s.headerSub}>{t('messages.subtitle')}</Text>
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        {conversations.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>💬</Text>
            <Text style={s.emptyTitle}>{t('messages.noMessages')}</Text>
            <Text style={s.emptySub}>{t('messages.startConversation')}</Text>
          </View>
        ) : (
          conversations.map(conv => (
            <TouchableOpacity
              key={conv.id}
              style={s.convCard}
              onPress={() => handleConversationPress(conv)}
              activeOpacity={0.7}
            >
              <View style={s.convAvatar}>
                <Text style={s.convAvatarText}>{conv.storeName.charAt(0)}</Text>
              </View>
              <View style={s.convInfo}>
                <View style={s.convHeader}>
                  <Text style={s.convName}>{conv.storeName}</Text>
                  <Text style={s.convTime}>{formatTime(conv.lastMessageTimestamp)}</Text>
                </View>
                <Text style={s.convMessage} numberOfLines={1}>
                  {conv.lastMessage || 'Nouvelle conversation'}
                </Text>
              </View>
              {conv.unreadCount > 0 && (
                <View style={s.unreadBadge}>
                  <Text style={s.unreadText}>{conv.unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.page },
  header: { padding: 24, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: T.text, marginBottom: 4 },
  headerSub: { fontSize: 14, color: T.textSub },
  
  content: { flex: 1, paddingHorizontal: 24 },
  
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  emptyState: { padding: 60, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: T.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: T.textSub },
  
  convCard: {
    flexDirection: 'row', backgroundColor: T.surface, borderRadius: 16,
    padding: 16, marginBottom: 12, borderWidth: 1, borderColor: T.border,
    alignItems: 'center',
  },
  convAvatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: T.orange,
    alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  convAvatarText: { fontSize: 18, fontWeight: '800', color: T.white },
  convInfo: { flex: 1 },
  convHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 4,
  },
  convName: { fontSize: 15, fontWeight: '700', color: T.text },
  convTime: { fontSize: 12, color: T.textSub },
  convMessage: { fontSize: 13, color: T.textSub },
  
  unreadBadge: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: T.orange,
    alignItems: 'center', justifyContent: 'center', marginLeft: 12,
  },
  unreadText: { fontSize: 12, fontWeight: '700', color: T.white },
});

export default MessagesScreen;
