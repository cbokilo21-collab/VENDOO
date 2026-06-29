import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput, Modal, Share } from 'react-native';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';

const C = {
  bg: '#F8FAFC', surface: '#FFFFFF', border: '#E2E8F0',
  orange: '#F97316', orangeFade: 'rgba(249,115,22,0.08)',
  textDark: '#0F172A', textMid: '#475569', textLight: '#94A3B8', muted: '#CBD5E1',
  success: '#22C55E', warning: '#F59E0B', purple: '#8B5CF6',
};

interface Referral {
  id: string;
  name: string;
  date: string;
  bonus: string;
  status: 'completed' | 'pending';
}

const REFERRALS: Referral[] = [
  { id: '1', name: 'Jean Dupont', date: '2024-01-15', bonus: '5 000 F', status: 'completed' },
  { id: '2', name: 'Marie Kouassi', date: '2024-02-20', bonus: '5 000 F', status: 'completed' },
  { id: '3', name: 'Paul YAO', date: '2024-03-10', bonus: '5 000 F', status: 'pending' },
];

const REWARDS = [
  { id: '1', name: 'Réduction 10%', points: 100, icon: '🎁' },
  { id: '2', name: 'Livraison gratuite', points: 200, icon: '🚚' },
  { id: '3', name: 'Crédit 10 000 F', points: 500, icon: '💰' },
  { id: '4', name: 'Accès VIP', points: 1000, icon: '👑' },
];

const ReferralScreen: React.FC = () => {
  const [referralCode, setReferralCode] = useState('VENDOO-2024');
  const [points, setPoints] = useState(350);
  const [showShareModal, setShowShareModal] = useState(false);

  const shareReferral = () => {
    Share.share({
      message: `Rejoignez ma boutique sur Vendoo ! Utilisez mon code ${referralCode} pour obtenir 5 000 F de bonus. 🎁`,
      url: 'https://vendoo-boutique.netlify.app',
    });
  };

  const renderReferralItem = (referral: Referral) => (
    <View key={referral.id} style={s.referralItem}>
      <View style={s.referralIcon}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth={2}>
          <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
          <Circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      </View>
      <View style={s.referralInfo}>
        <Text style={s.referralName}>{referral.name}</Text>
        <Text style={s.referralDate}>{referral.date}</Text>
      </View>
      <View style={s.referralRight}>
        <Text style={s.referralBonus}>{referral.bonus}</Text>
        <View style={[s.statusBadge, { backgroundColor: referral.status === 'completed' ? C.success + '20' : C.warning + '20' }]}>
          <Text style={[s.statusText, { color: referral.status === 'completed' ? C.success : C.warning }]}>
            {referral.status === 'completed' ? 'Reçu' : 'En attente'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderReward = (reward: typeof REWARDS[0]) => (
    <TouchableOpacity key={reward.id} style={s.rewardItem}>
      <Text style={s.rewardIcon}>{reward.icon}</Text>
      <View style={s.rewardInfo}>
        <Text style={s.rewardName}>{reward.name}</Text>
        <Text style={s.rewardPoints}>{reward.points} points</Text>
      </View>
      <TouchableOpacity style={s.claimBtn} disabled={points < reward.points}>
        <Text style={[s.claimBtnText, points < reward.points && s.claimBtnTextDisabled]}>
          {points >= reward.points ? 'Réclamer' : `${reward.points - points} pts`}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Parrainage</Text>
        <Text style={s.headerSub}>Invitez vos amis et gagnez des bonus</Text>
      </View>

      <ScrollView style={s.content}>
        <View style={s.pointsCard}>
          <View style={s.pointsCircle}>
            <Text style={s.pointsValue}>{points}</Text>
            <Text style={s.pointsLabel}>points</Text>
          </View>
          <View style={s.pointsInfo}>
            <Text style={s.pointsTitle}>Vos points</Text>
            <Text style={s.pointsSub}>Échangez-les contre des récompenses</Text>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Votre code de parrainage</Text>
          <View style={s.codeContainer}>
            <Text style={s.code}>{referralCode}</Text>
            <TouchableOpacity style={s.copyBtn}>
              <Text style={s.copyBtnText}>📋 Copier</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={s.shareBtn} onPress={() => setShowShareModal(true)}>
            <Text style={s.shareBtnText}>📤 Partager avec un ami</Text>
          </TouchableOpacity>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Récompenses disponibles</Text>
          {REWARDS.map(renderReward)}
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Vos parrainages</Text>
          {REFERRALS.map(renderReferralItem)}
        </View>

        <View style={s.infoCard}>
          <Text style={s.infoTitle}>💡 Comment ça marche ?</Text>
          <Text style={s.infoText}>1. Partagez votre code avec un ami</Text>
          <Text style={s.infoText}>2. Il s'inscrit avec votre code</Text>
          <Text style={s.infoText}>3. Vous recevez 5 000 F de bonus</Text>
          <Text style={s.infoText}>4. Votre ami reçoit aussi 5 000 F</Text>
        </View>
      </ScrollView>

      <Modal visible={showShareModal} animationType="fade" onRequestClose={() => setShowShareModal(false)}>
        <View style={s.shareModalOverlay}>
          <View style={s.shareModal}>
            <Text style={s.shareModalTitle}>Partager votre code</Text>
            
            <TouchableOpacity style={s.shareOption} onPress={shareReferral}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.textMid} strokeWidth={2}>
                <Circle cx="18" cy="5" r="3" strokeLinecap="round" strokeLinejoin="round"/>
                <Circle cx="6" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round"/>
                <Circle cx="18" cy="19" r="3" strokeLinecap="round" strokeLinejoin="round"/>
                <Path d="M8.59 13.51l6.83 3.98" strokeLinecap="round" strokeLinejoin="round"/>
                <Path d="M15.41 6.51l-6.82 3.98" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
              <Text style={s.shareOptionText}>Partager via système</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={s.shareOption}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.textMid} strokeWidth={2}>
                <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
              <Text style={s.shareOptionText}>WhatsApp</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={s.shareOption}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.textMid} strokeWidth={2}>
                <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeLinecap="round" strokeLinejoin="round"/>
                <Path d="M22 6l-10 7L2 6" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
              <Text style={s.shareOptionText}>Email</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={s.cancelBtn} onPress={() => setShowShareModal(false)}>
              <Text style={s.cancelBtnText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { padding: 24, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: C.textDark, marginBottom: 4 },
  headerSub: { fontSize: 14, color: C.textLight },
  content: { flex: 1, paddingHorizontal: 16 },
  
  pointsCard: {
    flexDirection: 'row', backgroundColor: C.surface, borderRadius: 20,
    padding: 24, marginBottom: 24, borderWidth: 1, borderColor: C.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8,
  },
  pointsCircle: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: C.orangeFade,
    alignItems: 'center', justifyContent: 'center', marginRight: 20,
  },
  pointsValue: { fontSize: 32, fontWeight: '900', color: C.orange },
  pointsLabel: { fontSize: 13, color: C.textMid },
  pointsInfo: { flex: 1, justifyContent: 'center' },
  pointsTitle: { fontSize: 20, fontWeight: '800', color: C.textDark, marginBottom: 6 },
  pointsSub: { fontSize: 14, color: C.textLight },
  
  card: {
    backgroundColor: C.surface, borderRadius: 20, padding: 24,
    marginBottom: 20, borderWidth: 1, borderColor: C.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4,
  },
  cardTitle: { fontSize: 20, fontWeight: '800', color: C.textDark, marginBottom: 20, letterSpacing: -0.5 },
  
  codeContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg,
    borderRadius: 12, padding: 18, marginBottom: 16,
  },
  code: { flex: 1, fontSize: 22, fontWeight: '900', color: C.orange, letterSpacing: 3 },
  copyBtn: { paddingHorizontal: 14 },
  copyBtnText: { fontSize: 15, fontWeight: '700', color: C.textMid },
  shareBtn: {
    backgroundColor: C.orange, borderRadius: 12, padding: 16,
    alignItems: 'center',
  },
  shareBtnText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  
  rewardItem: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    backgroundColor: C.bg, borderRadius: 12, marginBottom: 12,
  },
  rewardIcon: { fontSize: 32, marginRight: 16 },
  rewardInfo: { flex: 1 },
  rewardName: { fontSize: 16, fontWeight: '800', color: C.textDark, marginBottom: 4 },
  rewardPoints: { fontSize: 14, color: C.orange, fontWeight: '700' },
  claimBtn: {
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10,
    backgroundColor: C.orange,
  },
  claimBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  claimBtnTextDisabled: { color: C.muted },
  
  referralItem: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    backgroundColor: C.bg, borderRadius: 12, marginBottom: 12,
  },
  referralIcon: { marginRight: 16 },
  referralInfo: { flex: 1 },
  referralName: { fontSize: 16, fontWeight: '800', color: C.textDark, marginBottom: 4 },
  referralDate: { fontSize: 13, color: C.textLight },
  referralRight: { alignItems: 'flex-end' },
  referralBonus: { fontSize: 18, fontWeight: '900', color: C.orange, marginBottom: 6 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  
  infoCard: {
    backgroundColor: C.purple + '10', borderRadius: 16, padding: 20,
    marginBottom: 24, borderWidth: 1, borderColor: C.purple + '30',
  },
  infoTitle: { fontSize: 16, fontWeight: '800', color: C.purple, marginBottom: 12 },
  infoText: { fontSize: 14, color: C.textMid, marginBottom: 6 },
  
  shareModalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  shareModal: {
    backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24,
  },
  shareModalTitle: { fontSize: 20, fontWeight: '800', color: C.textDark, marginBottom: 20, textAlign: 'center' },
  shareOption: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    backgroundColor: C.bg, borderRadius: 12, marginBottom: 12,
  },
  shareOptionText: { fontSize: 15, fontWeight: '600', color: C.textDark, marginLeft: 16 },
  cancelBtn: { padding: 16, alignItems: 'center', marginTop: 8 },
  cancelBtnText: { fontSize: 16, fontWeight: '700', color: C.textMid },
});

export default ReferralScreen;
