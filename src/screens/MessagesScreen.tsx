import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Modal } from 'react-native';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { MessagingService, Conversation } from '../services/messagingService';
import { T } from '../theme';

const MessagesScreen: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showMenu, setShowMenu] = useState(false);

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
      setSelectedConversation(conversation);
      // Naviguer vers l'écran de conversation (à implémenter)
      console.log('Navigate to conversation:', conversation.id);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      for (const conv of conversations) {
        if (conv.unreadCount > 0) {
          await MessagingService.markMessagesAsRead(conv.id!, user!.uid);
        }
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };


  const filteredConversations = conversations.filter(conv =>
    conv.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (conv.lastMessage && conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const unreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

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
        <View style={s.headerTop}>
          <Text style={s.headerTitle}>{t('messages.title')}</Text>
          {unreadCount > 0 && (
            <View style={s.unreadHeaderBadge}>
              <Text style={s.unreadHeaderText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <Text style={s.headerSub}>{conversations.length} conversation{conversations.length > 1 ? 's' : ''}</Text>
      </View>

      {/* Search Bar */}
      <View style={s.searchContainer}>
        <View style={s.searchBar}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={T.textSub} strokeWidth={2}>
            <Circle cx={11} cy={11} r={8} />
            <Path d="m21 21-4.35-4.35" strokeLinecap="round" />
          </Svg>
          <TextInput
            style={s.searchInput}
            placeholder="Rechercher une conversation..."
            placeholderTextColor={T.textSub}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={s.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Quick Actions */}
      {unreadCount > 0 && (
        <View style={s.quickActions}>
          <TouchableOpacity style={s.quickActionBtn} onPress={handleMarkAllRead}>
            <Text style={s.quickActionText}>Tout marquer comme lu</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        {filteredConversations.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>💬</Text>
            <Text style={s.emptyTitle}>{t('messages.noMessages')}</Text>
            <Text style={s.emptySub}>{t('messages.startConversation')}</Text>
          </View>
        ) : (
          filteredConversations.map(conv => (
            <TouchableOpacity
              key={conv.id}
              style={[s.convCard, conv.unreadCount > 0 && s.convCardUnread]}
              onPress={() => handleConversationPress(conv)}
              onLongPress={() => { setSelectedConversation(conv); setShowMenu(true); }}
              activeOpacity={0.7}
            >
              <View style={s.convAvatar}>
                <Text style={s.convAvatarText}>{conv.storeName.charAt(0)}</Text>
                {conv.unreadCount > 0 && <View style={s.onlineDot} />}
              </View>
              <View style={s.convInfo}>
                <View style={s.convHeader}>
                  <Text style={[s.convName, conv.unreadCount > 0 && s.convNameUnread]}>{conv.storeName}</Text>
                  <Text style={s.convTime}>{formatTime(conv.lastMessageTimestamp)}</Text>
                </View>
                <Text style={[s.convMessage, conv.unreadCount > 0 && s.convMessageUnread]} numberOfLines={2}>
                  {conv.lastMessage || 'Nouvelle conversation'}
                </Text>
                <View style={s.convMeta}>
                  {conv.unreadCount > 0 && (
                    <View style={s.unreadMiniBadge}>
                      <Text style={s.unreadMiniText}>{conv.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={s.moreBtn}
                onPress={() => { setSelectedConversation(conv); setShowMenu(true); }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={T.textSub} strokeWidth={2}>
                  <Circle cx={12} cy={12} r={1} />
                  <Circle cx={12} cy={5} r={1} />
                  <Circle cx={12} cy={19} r={1} />
                </Svg>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Action Menu Modal */}
      <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setShowMenu(false)}>
          <View style={s.menuContainer}>
            <View style={s.menuContent}>
              <Text style={s.menuTitle}>Options de conversation</Text>
              <TouchableOpacity style={s.menuItem} onPress={() => { setShowMenu(false); }}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={T.text} strokeWidth={2}>
                  <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </Svg>
                <Text style={s.menuItemText}>Appeler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.menuItem} onPress={() => { setShowMenu(false); }}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={T.text} strokeWidth={2}>
                  <Path d="M23 7l-7 5 7 5V7z" />
                  <Rect x={1} y={5} width={15} height={14} rx={2} ry={2} />
                </Svg>
                <Text style={s.menuItemText}>Vidéo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.menuItem} onPress={() => { setShowMenu(false); }}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={T.text} strokeWidth={2}>
                  <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <Circle cx={12} cy={12} r={3} />
                </Svg>
                <Text style={s.menuItemText}>Voir la boutique</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.page },
  header: { padding: 24, paddingBottom: 16 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: T.text, marginBottom: 4 },
  headerSub: { fontSize: 14, color: T.textSub },
  unreadHeaderBadge: {
    backgroundColor: T.orange, paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 12, minWidth: 24, alignItems: 'center',
  },
  unreadHeaderText: { fontSize: 12, fontWeight: '700', color: T.white },
  
  searchContainer: { paddingHorizontal: 24, marginBottom: 12 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: T.surface,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1, borderColor: T.border, gap: 12,
  },
  searchInput: { flex: 1, fontSize: 15, color: T.text },
  clearSearch: { fontSize: 16, color: T.textSub },
  
  quickActions: { paddingHorizontal: 24, marginBottom: 12 },
  quickActionBtn: {
    backgroundColor: T.orangeSoft, paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 8, alignItems: 'center',
  },
  quickActionText: { fontSize: 14, fontWeight: '600', color: T.orange },
  
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
  convCardUnread: { backgroundColor: T.orange + '08', borderColor: T.orange },
  convAvatar: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: T.orange,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  convAvatarText: { fontSize: 20, fontWeight: '800', color: T.white },
  onlineDot: {
    position: 'absolute', bottom: 2, right: 2, width: 14, height: 14,
    borderRadius: 7, backgroundColor: '#10B981', borderWidth: 2, borderColor: T.white,
  },
  convInfo: { flex: 1 },
  convHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 4,
  },
  convName: { fontSize: 16, fontWeight: '700', color: T.text },
  convNameUnread: { fontWeight: '800' },
  convTime: { fontSize: 12, color: T.textSub },
  convMessage: { fontSize: 14, color: T.textSub, marginBottom: 4 },
  convMessageUnread: { fontWeight: '600', color: T.text },
  convMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  unreadMiniBadge: {
    backgroundColor: T.orange, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 8, minWidth: 20, alignItems: 'center',
  },
  unreadMiniText: { fontSize: 11, fontWeight: '700', color: T.white },
  moreBtn: { padding: 8 },
  
  unreadBadge: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: T.orange,
    alignItems: 'center', justifyContent: 'center', marginLeft: 12,
  },
  unreadText: { fontSize: 12, fontWeight: '700', color: T.white },
  
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  menuContainer: { paddingHorizontal: 24, paddingBottom: 40 },
  menuContent: {
    backgroundColor: T.surface, borderRadius: 20, padding: 8,
    borderWidth: 1, borderColor: T.border,
  },
  menuTitle: {
    fontSize: 14, fontWeight: '700', color: T.textSub,
    paddingHorizontal: 16, paddingVertical: 12, textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  menuItemText: { fontSize: 16, fontWeight: '600', color: T.text },
  menuItemDanger: {},
  menuItemTextDanger: { color: '#EF4444' },
  menuDivider: { height: 1, backgroundColor: T.border, marginHorizontal: 16, marginVertical: 4 },
});

export default MessagesScreen;
