import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, TextInput, Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';
import { useAuth } from '../contexts/AuthContext';
import { MessagingService, Conversation } from '../services/messagingService';

const C = {
  navy: '#FF6B35', navyMid: '#FF8A5C',
  bg: '#FFF7F3', surface: '#FFFFFF', border: '#E5E7EB',
  accent: '#FF6B35', accentSoft: 'rgba(255,107,53,0.1)',
  textDark: '#111827', textMid: '#374151', textLight: '#6B7280', muted: '#9CA3AF',
  success: '#10B981', info: '#3B82F6', warning: '#F59E0B', purple: '#8B5CF6',
  white: '#FFFFFF',
};

const AdminMessagesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'business' | 'buyer'>('all');

  useEffect(() => {
    if (!user) return;

    const loadConversations = async () => {
      try {
        // Admin can see all conversations
        const allConvs = await MessagingService.getBuyerConversations('all');
        setConversations(allConvs);
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [user]);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const handleConversationPress = (conversation: Conversation) => {
    (navigation as any).navigate('Conversation', { conversation });
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = 
      conv.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (conv.lastMessage && conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const unreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  if (loading) {
    return (
      <View style={s.root}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Messagerie Admin</Text>
          <Text style={s.headerSub}>Chargement...</Text>
        </View>
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={C.accent} />
        </View>
      </View>
    );
  }

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <Text style={s.headerTitle}>Messagerie Admin</Text>
          {unreadCount > 0 && (
            <View style={s.unreadBadge}>
              <Text style={s.unreadText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <Text style={s.headerSub}>{conversations.length} conversation{conversations.length > 1 ? 's' : ''}</Text>
      </View>

      {/* Search Bar */}
      <View style={s.searchContainer}>
        <View style={s.searchBar}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.textLight} strokeWidth={2}>
            <Circle cx={11} cy={11} r={8} />
            <Path d="m21 21-4.35-4.35" strokeLinecap="round" />
          </Svg>
          <TextInput
            style={s.searchInput}
            placeholder="Rechercher une conversation..."
            placeholderTextColor={C.textLight}
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

      {/* Stats Cards */}
      <View style={s.statsContainer}>
        <View style={s.statCard}>
          <Text style={s.statValue}>{conversations.length}</Text>
          <Text style={s.statLabel}>Total</Text>
        </View>
        <View style={[s.statCard, s.statCardAccent]}>
          <Text style={s.statValue}>{unreadCount}</Text>
          <Text style={s.statLabel}>Non lus</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statValue}>{conversations.filter(c => c.unreadCount === 0).length}</Text>
          <Text style={s.statLabel}>Lus</Text>
        </View>
      </View>

      {/* Conversations List */}
      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        {filteredConversations.length === 0 ? (
          <View style={s.emptyState}>
            <Svg width={64} height={64} viewBox="0 0 24 24" fill="none" stroke={C.textLight} strokeWidth={1.5}>
              <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
            <Text style={s.emptyTitle}>Aucune conversation</Text>
            <Text style={s.emptySub}>Les conversations apparaîtront ici</Text>
          </View>
        ) : (
          filteredConversations.map(conv => (
            <TouchableOpacity
              key={conv.id}
              style={[s.convCard, conv.unreadCount > 0 && s.convCardUnread]}
              onPress={() => handleConversationPress(conv)}
              activeOpacity={0.7}
            >
              <View style={s.convHeader}>
                <View style={s.convAvatar}>
                  <Text style={s.convAvatarText}>{conv.storeName.charAt(0)}</Text>
                  {conv.unreadCount > 0 && <View style={s.onlineDot} />}
                </View>
                <View style={s.convInfo}>
                  <View style={s.convTopRow}>
                    <Text style={[s.convName, conv.unreadCount > 0 && s.convNameUnread]}>
                      {conv.storeName}
                    </Text>
                    <Text style={s.convTime}>{formatTime(conv.lastMessageTimestamp)}</Text>
                  </View>
                  <Text style={s.convParticipants}>
                    {conv.buyerName} → {conv.storeName}
                  </Text>
                  <Text style={[s.convMessage, conv.unreadCount > 0 && s.convMessageUnread]} numberOfLines={2}>
                    {conv.lastMessage || 'Nouvelle conversation'}
                  </Text>
                </View>
              </View>
              {conv.unreadCount > 0 && (
                <View style={s.unreadMiniBadge}>
                  <Text style={s.unreadMiniText}>{conv.unreadCount}</Text>
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
  root: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 20, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: C.textDark },
  headerSub: { fontSize: 14, color: C.textLight },
  unreadBadge: { backgroundColor: C.accent, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, minWidth: 24, alignItems: 'center' },
  unreadText: { fontSize: 12, fontWeight: '700', color: C.white },
  
  searchContainer: { paddingHorizontal: 24, paddingVertical: 16, backgroundColor: C.surface },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1.5, borderColor: C.border },
  searchInput: { flex: 1, fontSize: 15, color: C.textDark, marginLeft: 12 },
  clearSearch: { fontSize: 18, color: C.textLight, marginLeft: 8 },
  
  statsContainer: { flexDirection: 'row', paddingHorizontal: 24, paddingVertical: 16, backgroundColor: C.surface, gap: 12 },
  statCard: { flex: 1, backgroundColor: C.bg, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  statCardAccent: { backgroundColor: C.accentSoft, borderColor: C.accent },
  statValue: { fontSize: 24, fontWeight: '800', color: C.textDark },
  statLabel: { fontSize: 12, color: C.textLight, marginTop: 4 },
  
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  emptyState: { padding: 80, alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.textDark, marginTop: 16, marginBottom: 8 },
  emptySub: { fontSize: 14, color: C.textLight },
  
  convCard: {
    backgroundColor: C.surface, borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1.5, borderColor: C.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8,
  },
  convCardUnread: { backgroundColor: C.accentSoft + '15', borderColor: C.accent },
  convHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  convAvatar: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: C.accent,
    alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  convAvatarText: { fontSize: 22, fontWeight: '800', color: C.white },
  onlineDot: {
    position: 'absolute', bottom: 2, right: 2, width: 16, height: 16,
    borderRadius: 8, backgroundColor: C.success, borderWidth: 3, borderColor: C.white,
  },
  convInfo: { flex: 1 },
  convTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  convName: { fontSize: 16, fontWeight: '700', color: C.textDark },
  convNameUnread: { fontWeight: '800' },
  convTime: { fontSize: 12, color: C.textLight },
  convParticipants: { fontSize: 13, color: C.accent, marginBottom: 4, fontWeight: '600' },
  convMessage: { fontSize: 14, color: C.textLight, lineHeight: 20 },
  convMessageUnread: { fontWeight: '600', color: C.textMid },
  
  unreadMiniBadge: {
    position: 'absolute', top: 16, right: 16,
    backgroundColor: C.accent, paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 10, minWidth: 24, alignItems: 'center',
  },
  unreadMiniText: { fontSize: 12, fontWeight: '700', color: C.white },
});

export default AdminMessagesScreen;
