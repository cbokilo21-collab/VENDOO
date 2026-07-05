import React, { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Image
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';
import { onSnapshot, doc, getFirestore } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { MessagingService, Message, Conversation } from '../services/messagingService';
import UserAvatar from '../components/UserAvatar';

type RootStackParamList = {
  Conversation: { conversation: Conversation };
  Messages: undefined;
  BoutiqueCatalog: { boutiqueId?: string };
};
type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Conversation'>;

const C = {
  bg: '#F6F7F9',
  header: '#FFFFFF',
  surface: '#FFFFFF',
  textDark: '#111827',
  textMid: '#374151',
  textLight: '#94A3B8',
  orange: '#FF6B35',
  orangeSoft: '#FFF1EB',
  border: '#ECEEF1',
  theirBubble: '#F1F2F4',
  white: '#FFFFFF',
};

const Ico: React.FC<{ d: string; color?: string; size?: number; sw?: number }> = ({ d, color = C.textDark, size = 20, sw = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <Path d={d} />
  </Svg>
);

const dayLabel = (date: Date) => {
  const now = new Date();
  const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, now)) return "Aujourd'hui";
  if (isSameDay(date, yesterday)) return 'Hier';
  return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' });
};

const toDate = (timestamp: any): Date => (timestamp?.toDate ? timestamp.toDate() : new Date(timestamp || Date.now()));

const ConversationScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { user, userType } = useAuth();
  const { conversation } = route.params || {};

  if (!conversation) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, color: '#374151' }}>Conversation non fournie</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20, padding: 12, backgroundColor: C.orange, borderRadius: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [myPhoto, setMyPhoto] = useState(user?.photoURL || '');
  const [partnerPhoto, setPartnerPhoto] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

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

  // Real-time listener for partner profile photo
  useEffect(() => {
    if (!conversation) return;

    const partnerId = userType === 'business' ? conversation.buyerId : conversation.storeId;
    if (!partnerId) return;

    const db = getFirestore();
    const partnerRef = doc(db, 'users', partnerId);

    const unsubscribe = onSnapshot(partnerRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        if (userData?.photoURL) {
          setPartnerPhoto(userData.photoURL);
        }
      }
    }, (error) => {
      console.error('Error listening to partner document:', error);
    });

    return () => unsubscribe();
  }, [conversation?.id, userType]);

  useEffect(() => {
    loadMessages();

    const unsubscribe = MessagingService.subscribeToMessages(conversation.id!, (msgs) => {
      setMessages(msgs);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [conversation.id]);

  const loadMessages = async () => {
    try {
      const msgs = await MessagingService.getMessages(conversation.id!);
      setMessages(msgs);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const handleSend = async () => {
    if (!messageText.trim() || !user) return;

    setSending(true);
    try {
      const senderName = user.email?.split('@')[0] || conversation.buyerName;
      await MessagingService.sendMessage(
        conversation.id!,
        user.uid,
        senderName,
        messageText.trim(),
        myPhoto || undefined
      );
      setMessageText('');
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    return toDate(timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const isMyMessage = (message: Message) => message.senderId === user?.uid;

  const getPartnerName = () => {
    if (userType === 'admin') return `${conversation.buyerName} ↔ ${conversation.storeName}`;
    return userType === 'buyer' ? conversation.storeName : conversation.buyerName;
  };

  const getPartnerPhoto = () => {
    if (partnerPhoto) return partnerPhoto;
    return userType === 'business' ? conversation.buyerPhotoURL : conversation.storePhotoURL;
  };

  const getPartnerRoleLabel = () => {
    if (userType === 'admin') return 'Conversation';
    return userType === 'buyer' ? 'Boutique' : 'Client';
  };

  // Group messages under a date divider, matching the day it was sent.
  type Row = { type: 'divider'; key: string; label: string } | { type: 'message'; key: string; message: Message };
  const rows: Row[] = [];
  let lastDay: string | null = null;
  messages.forEach((message) => {
    const date = toDate(message.timestamp);
    const dayKey = date.toDateString();
    if (dayKey !== lastDay) {
      rows.push({ type: 'divider', key: `divider-${dayKey}`, label: dayLabel(date) });
      lastDay = dayKey;
    }
    rows.push({ type: 'message', key: message.id || `${message.senderId}-${dayKey}-${rows.length}`, message });
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ico d="M19 12H5M12 19l-7-7 7-7" color={C.orange} size={20} />
        </TouchableOpacity>
        <View style={s.headerInfo}>
          {getPartnerPhoto() ? (
            <Image source={{ uri: getPartnerPhoto() }} style={s.headerAvatar} />
          ) : (
            <UserAvatar name={getPartnerName()} gender="other" size={38} />
          )}
          <View style={s.headerTextContainer}>
            <Text style={s.headerName} numberOfLines={1}>{getPartnerName()}</Text>
            <Text style={s.headerStatus}>{getPartnerRoleLabel()}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={s.messagesContainer}
        contentContainerStyle={s.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Conversation intro panel */}
        <View style={s.introPanel}>
          {getPartnerPhoto() ? (
            <Image source={{ uri: getPartnerPhoto() }} style={s.introAvatar} />
          ) : (
            <UserAvatar name={getPartnerName()} gender="other" size={84} />
          )}
          <Text style={s.introName}>{getPartnerName()}</Text>
          <Text style={s.introRole}>{getPartnerRoleLabel()}</Text>
          {userType === 'buyer' && (
            <TouchableOpacity
              style={s.introBtn}
              onPress={() => navigation.navigate('BoutiqueCatalog', { boutiqueId: conversation.storeId })}
              activeOpacity={0.85}
            >
              <Text style={s.introBtnText}>Voir la boutique</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={s.loadingContainer}>
            <ActivityIndicator size="large" color={C.orange} />
          </View>
        ) : messages.length === 0 ? (
          <View style={s.emptyContainer}>
            <Text style={s.emptyText}>Aucun message pour l'instant</Text>
          </View>
        ) : (
          rows.map((row) => {
            if (row.type === 'divider') {
              return (
                <View key={row.key} style={s.dateDividerRow}>
                  <Text style={s.dateDividerText}>{row.label}</Text>
                </View>
              );
            }
            const message: Message = row.message;
            const mine = isMyMessage(message);
            return (
              <View key={row.key} style={[s.messageRow, mine ? s.myMessageRow : s.theirMessageRow]}>
                {!mine && (
                  <View style={s.messageAvatar}>
                    {message.senderPhotoURL ? (
                      <Image source={{ uri: message.senderPhotoURL }} style={s.avatarImg} />
                    ) : (
                      <View style={[s.avatarImg, s.avatarPlaceholder]}>
                        <Text style={s.avatarText}>{message.senderName.charAt(0)}</Text>
                      </View>
                    )}
                  </View>
                )}
                <View style={[s.messageBubble, mine ? s.myMessage : s.theirMessage]}>
                  {userType === 'admin' && !mine && (
                    <Text style={s.senderLabel}>{message.senderName}</Text>
                  )}
                  <Text style={[s.messageText, mine ? s.myMessageText : s.theirMessageText]}>
                    {message.text}
                  </Text>
                  <View style={s.messageMetaRow}>
                    <Text style={[s.messageTime, mine ? s.myMessageTime : s.theirMessageTime]}>
                      {formatTime(message.timestamp)}
                    </Text>
                    {mine && (
                      <Ico
                        d={message.read ? 'M1 12l5 5L20 4M6 12l5 5L23 5' : 'M4 12l5 5L18 6'}
                        color="rgba(255,255,255,0.85)"
                        size={13}
                        sw={2.4}
                      />
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={s.inputContainer}>
        <TextInput
          style={s.input}
          placeholder="Message"
          placeholderTextColor={C.textLight}
          value={messageText}
          onChangeText={setMessageText}
          multiline
        />
        <TouchableOpacity
          style={[s.sendBtn, (!messageText.trim() || sending) && s.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!messageText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color={C.white} />
          ) : (
            <Ico d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" color={C.white} size={18} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: C.header,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: C.orangeSoft, marginRight: 4 },
  headerInfo: { flex: 1, marginLeft: 8, flexDirection: 'row', alignItems: 'center' },
  headerAvatar: { width: 38, height: 38, borderRadius: 19 },
  headerTextContainer: { marginLeft: 10, flex: 1 },
  headerName: { fontSize: 15.5, fontWeight: '700', color: C.textDark },
  headerStatus: { fontSize: 12, color: C.textLight, marginTop: 1 },

  messagesContainer: { flex: 1 },
  messagesContent: { paddingHorizontal: 14, paddingBottom: 12 },
  loadingContainer: { paddingVertical: 40, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: C.textLight },

  introPanel: { alignItems: 'center', paddingVertical: 28, marginBottom: 8 },
  introAvatar: { width: 84, height: 84, borderRadius: 42, marginBottom: 12 },
  introName: { fontSize: 19, fontWeight: '800', color: C.textDark },
  introRole: { fontSize: 13, color: C.textLight, marginTop: 2, marginBottom: 16 },
  introBtn: { backgroundColor: C.textDark, borderRadius: 999, paddingHorizontal: 20, paddingVertical: 10 },
  introBtnText: { color: C.white, fontWeight: '700', fontSize: 13.5 },

  dateDividerRow: { alignItems: 'center', marginVertical: 14 },
  dateDividerText: { fontSize: 12, fontWeight: '600', color: C.textLight },

  messageRow: { marginBottom: 10, flexDirection: 'row', alignItems: 'flex-end' },
  myMessageRow: { justifyContent: 'flex-end' },
  theirMessageRow: { justifyContent: 'flex-start' },
  messageAvatar: { marginRight: 8 },
  avatarImg: { width: 30, height: 30, borderRadius: 15 },
  avatarPlaceholder: { backgroundColor: C.orange, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  messageBubble: {
    maxWidth: '72%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  myMessage: { backgroundColor: C.orange, borderBottomRightRadius: 6 },
  theirMessage: { backgroundColor: C.theirBubble, borderBottomLeftRadius: 6 },
  messageText: { fontSize: 15, lineHeight: 20 },
  myMessageText: { color: C.white },
  theirMessageText: { color: C.textDark },
  senderLabel: { fontSize: 11, fontWeight: '700', color: C.orange, marginBottom: 2 },
  messageMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 4 },
  messageTime: { fontSize: 11 },
  myMessageTime: { color: 'rgba(255,255,255,0.85)' },
  theirMessageTime: { color: C.textLight },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: C.header,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  input: {
    flex: 1,
    backgroundColor: C.bg,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
    color: C.textDark,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.orange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.orange,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  sendBtnDisabled: { backgroundColor: C.textLight, shadowOpacity: 0 },
});

export default ConversationScreen;
