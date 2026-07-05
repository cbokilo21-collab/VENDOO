import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  Alert, TextInput, Clipboard
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle } from 'react-native-svg';

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
  AdminLinks: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList>;

interface AdminLink {
  id: string;
  name: string;
  description: string;
  url: string;
  createdAt: string;
}

const AdminLinksScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [links, setLinks] = useState<AdminLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      // Load links from Firestore
      setLoading(false);
    } catch (error) {
      console.error('Error loading links:', error);
      setLoading(false);
    }
  };
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkDesc, setNewLinkDesc] = useState('');

  const copyToClipboard = (url: string) => {
    Clipboard.setString(url);
    Alert.alert('Copié', 'Lien copié dans le presse-papier');
  };

  const createLink = () => {
    if (!newLinkName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom pour le lien');
      return;
    }

    const newLink: AdminLink = {
      id: Date.now().toString(),
      name: newLinkName,
      description: newLinkDesc,
      url: `https://vendoo-67f37.web.app/admin/${newLinkName.toLowerCase().replace(/\s+/g, '-')}`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setLinks([...links, newLink]);
    setNewLinkName('');
    setNewLinkDesc('');
    setShowCreateModal(false);
    Alert.alert('Succès', 'Lien admin créé avec succès');
  };

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.textDark} strokeWidth={2}>
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Liens Admin</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowCreateModal(true)}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth={2}>
            <Path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Info Box */}
        <View style={s.infoBox}>
          <Text style={s.infoTitle}>🔗 Générateur de Liens Admin</Text>
          <Text style={s.infoText}>
            Créez des liens sécurisés pour donner accès à d'autres administrateurs. 
            Chaque lien est unique et peut être révoqué à tout moment.
          </Text>
        </View>

        {/* Links List */}
        <Text style={s.sectionTitle}>Liens Actifs</Text>
        {links.map((link) => (
          <View key={link.id} style={s.linkCard}>
            <View style={s.linkHeader}>
              <Text style={s.linkName}>{link.name}</Text>
              <View style={[s.statusBadge, { backgroundColor: C.success + '20' }]}>
                <Text style={[s.statusText, { color: C.success }]}>Actif</Text>
              </View>
            </View>
            <Text style={s.linkDesc}>{link.description}</Text>
            <View style={s.urlContainer}>
              <Text style={s.urlText} numberOfLines={1}>{link.url}</Text>
            </View>
            <View style={s.linkActions}>
              <TouchableOpacity
                style={s.actionBtn}
                onPress={() => copyToClipboard(link.url)}
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.info} strokeWidth={2}>
                  <Path d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1M8 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M8 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m0 0h2a2 2 0 0 1 2 2v3m2 4H10m0 0l3-3m-3 3l3 3" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
                <Text style={s.actionBtnText}>Copier</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.actionBtn, s.actionBtnDanger]}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth={2}>
                  <Path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
                <Text style={[s.actionBtnText, s.actionBtnTextDanger]}>Révoquer</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Create Modal */}
        {showCreateModal && (
          <View style={s.modalOverlay}>
            <View style={s.modalContent}>
              <Text style={s.modalTitle}>Nouveau Lien Admin</Text>
              
              <Text style={s.modalLabel}>Nom du lien</Text>
              <TextInput
                style={s.modalInput}
                placeholder="Ex: Admin Support"
                placeholderTextColor={C.muted}
                value={newLinkName}
                onChangeText={setNewLinkName}
              />

              <Text style={s.modalLabel}>Description</Text>
              <TextInput
                style={[s.modalInput, s.modalTextArea]}
                placeholder="Description du lien..."
                placeholderTextColor={C.muted}
                value={newLinkDesc}
                onChangeText={setNewLinkDesc}
                multiline
                numberOfLines={3}
              />

              <View style={s.modalButtons}>
                <TouchableOpacity
                  style={s.modalCancelBtn}
                  onPress={() => {
                    setShowCreateModal(false);
                    setNewLinkName('');
                    setNewLinkDesc('');
                  }}
                >
                  <Text style={s.modalCancelBtnText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.modalCreateBtn} onPress={createLink}>
                  <Text style={s.modalCreateBtnText}>Créer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: C.textDark },
  addBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },

  scroll: { flex: 1 },
  infoBox: { backgroundColor: C.info + '10', borderRadius: 16, padding: 16, margin: 20, marginBottom: 24, borderLeftWidth: 4, borderLeftColor: C.info },
  infoTitle: { fontSize: 15, fontWeight: '700', color: C.info, marginBottom: 8 },
  infoText: { fontSize: 13, color: C.textMid, lineHeight: 20 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: C.textDark, paddingHorizontal: 20, marginBottom: 12 },

  linkCard: { backgroundColor: C.surface, marginHorizontal: 20, marginBottom: 12, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: C.border },
  linkHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  linkName: { fontSize: 16, fontWeight: '700', color: C.textDark },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  linkDesc: { fontSize: 13, color: C.textLight, marginBottom: 12 },
  urlContainer: { backgroundColor: C.bg, borderRadius: 8, padding: 10, marginBottom: 12 },
  urlText: { fontSize: 12, color: C.textMid, fontFamily: 'monospace' },
  linkActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 36, borderRadius: 8, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border },
  actionBtnDanger: { borderColor: '#FECACA', backgroundColor: '#FEF2F2' },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: C.textMid },
  actionBtnTextDanger: { color: '#DC2626' },

  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: C.surface, borderRadius: 20, padding: 24, width: '100%', maxWidth: 400 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: C.textDark, marginBottom: 20 },
  modalLabel: { fontSize: 14, fontWeight: '600', color: C.textMid, marginBottom: 8, marginTop: 12 },
  modalInput: { height: 48, backgroundColor: C.bg, borderRadius: 10, paddingHorizontal: 14, fontSize: 15, color: C.textDark, borderWidth: 1, borderColor: C.border },
  modalTextArea: { height: 80, paddingTop: 12, textAlignVertical: 'top' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  modalCancelBtn: { flex: 1, height: 48, borderRadius: 10, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  modalCancelBtnText: { fontSize: 15, fontWeight: '600', color: C.textMid },
  modalCreateBtn: { flex: 1, height: 48, borderRadius: 10, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  modalCreateBtnText: { fontSize: 15, fontWeight: '700', color: C.white },
});

export default AdminLinksScreen;
