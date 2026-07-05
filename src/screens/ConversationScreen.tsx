import React, { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Image
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';
import { onSnapshot, doc, getFirestore } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { MessagingService, Message, Conversation } from '../services/messagingService';
import UserAvatar from '../components/UserAvatar';

type RootStackParamList = {
  Conversation: { conversation: Conversation };
  Messages: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Conversation'>;

const C = {
  bg: '#EDEDED',
  header: '#EDEDED',
  surface: '#FFFFFF',
  textDark: '#000000',
  textLight: '#999999',
  accent: '#07C160',
  accentLight: '#95EC69',
  border: '#E5E5E5',
  white: '#FFFFFF',
  messageBg: '#95EC69',
  messageText: '#000000',
};

const ConversationScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { user, userType } = useAuth();
  const { conversation } = route.params || {};
  
  if (!conversation) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, color: '#374151' }}>Conversation non fournie</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20, padding: 12, backgroundColor: '#FF6B35', borderRadius: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
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

    const partnerId = userType === 'buyer' ? conversation.storeId : conversation.buyerId;
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
      // Always use buyer profile (user email) for sender name
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
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const isMyMessage = (message: Message) => {
    return message.senderId === user?.uid;
  };

  const getPartnerName = () => {
    if (userType === 'buyer') {
      return conversation.storeName;
    }
    return conversation.buyerName;
  };

  const getPartnerPhoto = () => {
    // Use Firestore photo (source of truth) with fallback to conversation data
    if (partnerPhoto) {
      return partnerPhoto;
    }
    return userType === 'buyer' ? conversation.storePhotoURL : conversation.buyerPhotoURL;
  };

  const getMyPhoto = () => {
    return myPhoto;
  };


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={s.root}
    >
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.textDark} strokeWidth={2}>
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </TouchableOpacity>
        <View style={s.headerInfo}>
          {getPartnerPhoto() ? (
            <Image 
              source={{ uri: getPartnerPhoto() }} 
              style={s.headerAvatar}
            />
          ) : (
            <UserAvatar 
              name={getPartnerName()} 
              gender="other" 
              size={40} 
            />
          )}
          <View style={s.headerTextContainer}>
            <Text style={s.headerName}>{getPartnerName()}</Text>
            <Text style={s.headerStatus}>En ligne</Text>
          </View>
        </View>
        <TouchableOpacity style={s.headerBtn}>
          <Ellipse cx={12} cy={12} rx={2} ry={2} fill={C.textDark} />
          <Ellipse cx={12} cy={6} rx={2} ry={2} fill={C.textDark} />
          <Ellipse cx={12} cy={18} rx={2} ry={2} fill={C.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={s.messagesContainer} 
        contentContainerStyle={s.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={s.loadingContainer}>
            <ActivityIndicator size="large" color={C.accent} />
          </View>
        ) : messages.length === 0 ? (
          <View style={s.emptyContainer}>
            <Text style={s.emptyText}>Aucun message</Text>
          </View>
        ) : (
          messages.map((message) => (
            <View
              key={message.id}
              style={[
                s.messageRow,
                isMyMessage(message) ? s.myMessageRow : s.theirMessageRow,
              ]}
            >
              {!isMyMessage(message) && (
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
              <View style={[
                s.messageBubble,
                isMyMessage(message) ? s.myMessage : s.theirMessage,
              ]}>
                <Text style={[
                  s.messageText,
                  isMyMessage(message) ? s.myMessageText : s.theirMessageText,
                ]}>
                  {message.text}
                </Text>
                <Text style={[
                  s.messageTime,
                  isMyMessage(message) ? s.myMessageTime : s.theirMessageTime,
                ]}>
                  {formatTime(message.timestamp)}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View style={s.inputContainer}>
        <TouchableOpacity style={s.attachBtn} onPress={() => setShowActionSheet(true)}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.textLight} strokeWidth={2}>
            <Circle cx={12} cy={12} r={10} />
            <Path d="M12 8v8M8 12h8" strokeLinecap="round" />
          </Svg>
        </TouchableOpacity>
        <TextInput
          style={s.input}
          placeholder="..."
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
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth={2}>
              <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
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
    paddingVertical: 8,
    backgroundColor: C.header,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1, marginLeft: 4, flexDirection: 'row', alignItems: 'center' },
  headerAvatar: { width: 40, height: 40, borderRadius: 20 },
  headerTextContainer: { marginLeft: 8 },
  headerName: { fontSize: 17, fontWeight: '600', color: C.textDark },
  headerStatus: { fontSize: 12, color: C.textLight },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 12, paddingBottom: 8 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, color: C.textLight },
  
  messageRow: { marginBottom: 12, flexDirection: 'row', alignItems: 'flex-end' },
  myMessageRow: { justifyContent: 'flex-end' },
  theirMessageRow: { justifyContent: 'flex-start' },
  messageAvatar: { marginRight: 8 },
  avatarImg: { width: 36, height: 36, borderRadius: 18 },
  avatarPlaceholder: { backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 18,
  },
  myMessage: { backgroundColor: C.messageBg, borderBottomRightRadius: 4 },
  theirMessage: { backgroundColor: C.surface, borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15, color: C.messageText, lineHeight: 20 },
  myMessageText: { color: C.messageText },
  theirMessageText: { color: C.textDark },
  messageTime: { fontSize: 11, marginTop: 4 },
  myMessageTime: { color: 'rgba(0,0,0,0.5)', textAlign: 'right' },
  theirMessageTime: { color: C.textLight, textAlign: 'right' },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: C.header,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.border,
  },
  attachBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', paddingBottom: 4 },
  input: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
    color: C.textDark,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 4,
  },
  sendBtnDisabled: { backgroundColor: C.textLight },
});

export default ConversationScreen;
