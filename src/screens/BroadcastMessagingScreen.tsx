import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle } from 'react-native-svg';
import { FirestoreService } from '../services/firestoreService';

const C = {
  navy: '#FF6B35', navyMid: '#FF8A5C',
  bg: '#FFF7F3', surface: '#FFFFFF', border: '#E5E7EB',
  accent: '#FF6B35', accentSoft: 'rgba(255,107,53,0.1)',
  textDark: '#111827', textMid: '#374151', textLight: '#6B7280', muted: '#9CA3AF',
  success: '#10B981', info: '#3B82F6', warning: '#F59E0B', purple: '#8B5CF6',
  white: '#FFFFFF',
};

type RootStackParamList = {
  AdminDashboard: undefined;
  BroadcastMessaging: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList>;

const BroadcastMessagingScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'merchants' | 'clients'>('all');
  const [sending, setSending] = useState(false);
  const [sentMessages, setSentMessages] = useState<any[]>([]);

  // Persist form data to localStorage
  useEffect(() => {
    if (Platform.OS === 'web') {
      const savedSubject = localStorage.getItem('broadcast_subject');
      const savedMessage = localStorage.getItem('broadcast_message');
      const savedAudience = localStorage.getItem('broadcast_audience') as 'all' | 'merchants' | 'clients';
      
      if (savedSubject) setSubject(savedSubject);
      if (savedMessage) setMessage(savedMessage);
      if (savedAudience) setTargetAudience(savedAudience);
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      localStorage.setItem('broadcast_subject', subject);
      localStorage.setItem('broadcast_message', message);
      localStorage.setItem('broadcast_audience', targetAudience);
    }
  }, [subject, message, targetAudience]);

  // Load sent messages from notifications
  useEffect(() => {
    loadSentMessages();
  }, []);

  const loadSentMessages = async () => {
    try {
      const notifications = await FirestoreService.getAll<any>('notifications');
      const broadcasts = notifications.filter((n: any) => n.type === 'broadcast');
      // Group by broadcast (same title + body + createdAt)
      const grouped = broadcasts.reduce((acc: any[], notif: any) => {
        const key = `${notif.title}_${notif.createdAt}`;
        const existing = acc.find((g: any) => g.key === key);
        if (existing) {
          existing.count++;
        } else {
          acc.push({
            key,
            title: notif.title,
            body: notif.body,
            createdAt: notif.createdAt,
            count: 1,
          });
        }
        return acc;
      }, []);
      // Sort by date desc and take last 10
      setSentMessages(grouped.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10));
    } catch (error) {
      console.error('Error loading sent messages:', error);
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Champs requis', 'Veuillez remplir le sujet et le message.');
      return;
    }

    setSending(true);
    
    try {
      // Get target users
      const users = await FirestoreService.getAll<any>('users');
      
      if (!users || users.length === 0) {
        Alert.alert('Erreur', 'Aucun utilisateur trouvé dans Firestore.');
        setSending(false);
        return;
      }
      
      let targetUsers = users;
      if (targetAudience === 'merchants') {
        targetUsers = users.filter((u: any) => u.userType === 'business');
      } else if (targetAudience === 'clients') {
        targetUsers = users.filter((u: any) => u.userType === 'buyer');
      }

      if (targetUsers.length === 0) {
        Alert.alert('Aucun utilisateur', 'Aucun utilisateur trouvé pour ce public cible.');
        setSending(false);
        return;
      }

      // Create notifications for all target users
      let successCount = 0;
      let errorCount = 0;
      
      for (const user of targetUsers) {
        try {
          // Use user.id as userId (this should match the Firebase Auth uid)
          await FirestoreService.create('notifications', {
            userId: user.id,
            type: 'broadcast',
            title: subject.trim(),
            body: message.trim(),
            read: false,
            createdAt: new Date().toISOString(),
          });
          successCount++;
        } catch (notifError) {
          errorCount++;
          console.error('Failed to create notification for user:', user.id, notifError);
        }
      }
      
      Alert.alert('Succès', `Message envoyé à ${successCount} utilisateurs ! (${errorCount} erreurs)`);
      setSubject('');
      setMessage('');
      // Reload sent messages
      loadSentMessages();
      
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer le message. Veuillez réessayer.');
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.textDark} strokeWidth={2}>
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Message Global</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Target Audience */}
        <Text style={s.label}>Public Cible</Text>
        <View style={s.audienceRow}>
          {(['all', 'merchants', 'clients'] as const).map((audience) => (
            <TouchableOpacity
              key={audience}
              style={[s.audienceBtn, targetAudience === audience && s.audienceBtnActive]}
              onPress={() => setTargetAudience(audience)}
            >
              <Text style={[s.audienceBtnText, targetAudience === audience && s.audienceBtnTextActive]}>
                {audience === 'all' ? 'Tous' : audience === 'merchants' ? 'Marchands' : 'Clients'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Subject */}
        <Text style={s.label}>Sujet</Text>
        <TextInput
          style={s.input}
          placeholder="Sujet du message..."
          placeholderTextColor={C.muted}
          value={subject}
          onChangeText={setSubject}
        />

        {/* Message */}
        <Text style={s.label}>Message</Text>
        <TextInput
          style={[s.input, s.textArea]}
          placeholder="Écrivez votre message ici..."
          placeholderTextColor={C.muted}
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={8}
          textAlignVertical="top"
        />

        {/* Info Box */}
        <View style={s.infoBox}>
          <Text style={s.infoTitle}>ℹ️ Information</Text>
          <Text style={s.infoText}>
            Ce message sera envoyé à tous les utilisateurs du public sélectionné via notification push et email.
            Assurez-vous que le message est clair et professionnel.
          </Text>
        </View>

        {/* Send Button */}
        <TouchableOpacity
          style={[s.sendBtn, (!subject.trim() || !message.trim()) && s.sendBtnDisabled]}
          onPress={handleSend}
          disabled={sending || !subject.trim() || !message.trim()}
        >
          {sending ? (
            <Text style={s.sendBtnText}>Envoi en cours...</Text>
          ) : (
            <Text style={s.sendBtnText}>📤 Envoyer le message</Text>
          )}
        </TouchableOpacity>

        {/* Sent Messages History */}
        {sentMessages.length > 0 && (
          <View style={s.historySection}>
            <Text style={s.historyTitle}>Messages envoyés</Text>
            {sentMessages.map((msg, index) => (
              <View key={msg.key} style={s.historyItem}>
                <View style={s.historyHeader}>
                  <Text style={s.historySubject}>{msg.title}</Text>
                  <Text style={s.historyCount}>{msg.count} destinataires</Text>
                </View>
                <Text style={s.historyBody}>{msg.body}</Text>
                <Text style={s.historyDate}>
                  {new Date(msg.createdAt).toLocaleString('fr-FR')}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: C.textDark },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },

  label: { fontSize: 14, fontWeight: '600', color: C.textMid, marginBottom: 8, marginTop: 16 },
  audienceRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  audienceBtn: { flex: 1, height: 44, borderRadius: 10, backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  audienceBtnActive: { backgroundColor: C.accent, borderColor: C.accent },
  audienceBtnText: { fontSize: 14, fontWeight: '600', color: C.textMid },
  audienceBtnTextActive: { color: C.white },

  input: { height: 52, backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 16, fontSize: 15, color: C.textDark, borderWidth: 1.5, borderColor: C.border },
  textArea: { height: 160, paddingTop: 16 },

  infoBox: { backgroundColor: C.info + '10', borderRadius: 12, padding: 16, marginTop: 20, borderLeftWidth: 4, borderLeftColor: C.info },
  infoTitle: { fontSize: 14, fontWeight: '700', color: C.info, marginBottom: 4 },
  infoText: { fontSize: 13, color: C.textMid, lineHeight: 20 },

  sendBtn: { backgroundColor: C.accent, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 24, shadowColor: C.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 },
  sendBtnDisabled: { backgroundColor: C.muted, shadowOpacity: 0 },
  sendBtnText: { color: C.white, fontSize: 16, fontWeight: '800' },
  
  historySection: { marginTop: 32, paddingHorizontal: 20 },
  historyTitle: { fontSize: 18, fontWeight: '700', color: C.textDark, marginBottom: 12 },
  historyItem: { backgroundColor: C.surface, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  historySubject: { fontSize: 15, fontWeight: '600', color: C.textDark, flex: 1 },
  historyCount: { fontSize: 12, color: C.accent, fontWeight: '600' },
  historyBody: { fontSize: 14, color: C.textMid, marginBottom: 8 },
  historyDate: { fontSize: 12, color: C.textLight },
});

export default BroadcastMessagingScreen;
