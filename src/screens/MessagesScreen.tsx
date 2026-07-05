import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Circle } from 'react-native-svg';
import { onSnapshot, doc, getFirestore } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { MessagingService, Conversation } from '../services/messagingService';

const C = {
  bg: '#F5F5F5',
  header: '#FFFFFF',
  surface: '#FFFFFF',
  textDark: '#1A1A1A',
  textLight: '#999999',
  accent: '#FF6B35',
  border: '#E0E0E0',
  white: '#FFFFFF',
};

const MessagesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, userType } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [myPhoto, setMyPhoto] = useState(user?.photoURL || '');
  const [partnerPhotos, setPartnerPhotos] = useState<Record<string, string>>({});

  // Real-time listener for user profile photo
  useEffect(() => {
    if (!user?.uid) return;

    const db = getFirestore();
    const userRef = doc(db, 'users', user.uid);
    
    const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        if (userData?.photoURL) {
          setMyPhoto(userData.photoURL);
        }
      }
    }, (error) => {
      console.error('Error listening to user document:', error);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Real-time listeners for partner photos
  useEffect(() => {
    if (conversations.length === 0) return;

    const unsubscribes: (() => void)[] = [];
    const db = getFirestore();

    conversations.forEach(conv => {
      const partnerId = userType === 'buyer' ? conv.storeId : conv.buyerId;
      if (!partnerId) return;

      const partnerRef = doc(db, 'users', partnerId);
      
      const unsubscribe = onSnapshot(partnerRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          if (userData?.photoURL) {
            setPartnerPhotos(prev => ({ ...prev, [partnerId]: userData.photoURL }));
          }
        }
      }, (error) => {
        console.error('Error listening to partner document:', error);
      });

      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [conversations, userType]);

  useEffect(() => {
    if (!user) return;

    const loadConversations = async () => {
      try {
        const convs = await MessagingService.getUserConversations(user.uid, userType as 'buyer' | 'business');
        setConversations(convs);
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();

    const unsubscribe = MessagingService.subscribeToUserConversations(
      user.uid,
      userType as 'buyer' | 'business',
      (convs) => {
        setConversations(convs);
      }
    );

    return () => unsubscribe();
  }, [user, userType]);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const handleConversationPress = (conversation: Conversation) => {
    (navigation as any).navigate('Conversation', { conversation });
  };

  const handleNewChatSimple = async () => {
    if (!user) {
      console.log('No user logged in');
      return;
    }

    try {
      console.log('Creating conversation...');
      console.log('User ID:', user.uid);
      console.log('User email:', user.email);
      
      // Créer une conversation de test avec un ID de boutique fixe
      const conversation = await MessagingService.getOrCreateConversation(
        user.uid,
        user.email?.split('@')[0] || 'Client',
        'test-store-id',
        'Test Boutique',
        myPhoto || undefined
      );

      console.log('Conversation created:', conversation);
      console.log('Navigating to Conversation screen...');
      
      (navigation as any).navigate('Conversation', { conversation });
    } catch (error) {
      console.error('Error creating conversation:', error);
      Alert.alert('Erreur', 'Impossible de créer la conversation: ' + (error as Error).message);
    }
  };

  const getPartnerName = (conv: Conversation) => {
    return userType === 'buyer' ? conv.storeName : conv.buyerName;
  };

  const getPartnerPhoto = (conv: Conversation) => {
    // Use Firestore photo (source of truth) with fallback to conversation data
    const partnerId = userType === 'buyer' ? conv.storeId : conv.buyerId;
    if (partnerId && partnerPhotos[partnerId]) {
      return partnerPhotos[partnerId];
    }
    return userType === 'buyer' ? conv.storePhotoURL : conv.buyerPhotoURL;
  };

  const getMessagePreview = (conv: Conversation) => {
    return conv.lastMessage || '';
  };

  if (loading) {
    return (
      <View style={s.root}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Messages</Text>
        </View>
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={C.accent} />
        </View>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.headerTitle}>Messages</Text>
          <Text style={s.headerSubtitle}>{conversations.length} conversation{conversations.length > 1 ? 's' : ''}</Text>
        </View>
        {userType === 'buyer' && (
          <TouchableOpacity style={s.newChatBtn} onPress={() => handleNewChatSimple()}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth={2.5}>
              <Circle cx={12} cy={12} r={10} />
              <Path d="M12 8v8M8 12h8" strokeLinecap="round" />
            </Svg>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        {conversations.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>💬</Text>
            <Text style={s.emptyTitle}>Aucun message</Text>
            <Text style={s.emptySub}>
              {userType === 'buyer' ? 'Commencez une conversation avec une boutique' : 'Vous recevrez ici les messages de vos clients'}
            </Text>
          </View>
        ) : (
          conversations.map(conv => (
            <TouchableOpacity
              key={conv.id}
              style={s.convItem}
              onPress={() => handleConversationPress(conv)}
              activeOpacity={0.7}
            >
              <View style={s.avatarContainer}>
                {getPartnerPhoto(conv) ? (
                  <Image source={{ uri: getPartnerPhoto(conv) }} style={s.avatar} />
                ) : (
                  <View style={[s.avatar, s.avatarPlaceholder]}>
                    <Text style={s.avatarText}>{getPartnerName(conv).charAt(0)}</Text>
                  </View>
                )}
              </View>
              <View style={s.convContent}>
                <View style={s.convHeader}>
                  <Text style={s.convName} numberOfLines={1}>{getPartnerName(conv)}</Text>
                  <Text style={s.convTime}>{formatTime(conv.lastMessageTimestamp)}</Text>
                </View>
                <View style={s.convMessageRow}>
                  <Text style={s.convMessage} numberOfLines={1}>
                    {getMessagePreview(conv)}
                  </Text>
                  {conv.unreadCount > 0 && (
                    <View style={s.unreadBadge}>
                      <Text style={s.unreadText}>{conv.unreadCount > 99 ? '99+' : conv.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: C.header,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerLeft: { flex: 1 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: C.textDark, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: C.textLight, marginTop: 2 },
  newChatBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  
  content: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  emptyState: { padding: 60, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.textDark, marginBottom: 8 },
  emptySub: { fontSize: 14, color: C.textLight },
  
  convItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginHorizontal: 0,
  },
  avatarContainer: { marginRight: 16 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 26, fontWeight: '800', color: C.white },
  convContent: { flex: 1, justifyContent: 'center', gap: 4 },
  convHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  convName: { fontSize: 16, fontWeight: '600', color: C.textDark, flex: 1 },
  convTime: { fontSize: 12, color: C.textLight, marginLeft: 8 },
  convMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  convMessage: { fontSize: 14, color: C.textLight, flex: 1, marginRight: 8 },
  unreadBadge: {
    backgroundColor: C.accent,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: { fontSize: 11, fontWeight: '700', color: C.white },
});

export default MessagesScreen;
