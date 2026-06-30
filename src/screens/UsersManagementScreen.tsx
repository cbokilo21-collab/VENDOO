import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert
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
  UsersManagement: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList>;

interface User {
  id: string;
  name?: string;
  email?: string;
  userType: 'buyer' | 'business' | 'admin';
  createdAt?: any;
}

const UsersManagementScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'business' | 'buyer'>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await FirestoreService.getAll<User>('users');
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMissingUser = async () => {
    Alert.alert(
      'Ajouter utilisateur manuellement',
      'Ajouter cbokilo26@gmail.com à la base de données?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Ajouter',
          onPress: async () => {
            try {
              await FirestoreService.create('users', {
                name: 'cbokilo26',
                email: 'cbokilo26@gmail.com',
                userType: 'buyer',
                createdAt: new Date().toISOString(),
              });
              Alert.alert('Succès', 'cbokilo26@gmail.com ajouté avec succès');
              loadUsers();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible d\'ajouter l\'utilisateur');
            }
          },
        },
      ]
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || user.userType === filter;
    return matchesSearch && matchesFilter;
  });

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case 'business': return C.success;
      case 'buyer': return C.info;
      case 'admin': return C.purple;
      default: return C.muted;
    }
  };

  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case 'business': return 'Marchand';
      case 'buyer': return 'Client';
      case 'admin': return 'Admin';
      default: return type;
    }
  };

  if (loading) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator size="large" color={C.accent} />
        <Text style={s.loadingText}>Chargement des utilisateurs...</Text>
      </View>
    );
  }

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.textDark} strokeWidth={2}>
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Gestion des Utilisateurs</Text>
        <TouchableOpacity onPress={addMissingUser} style={s.addBtn}>
          <Text style={s.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={s.searchSection}>
        <TextInput
          style={s.searchInput}
          placeholder="Rechercher par nom ou email..."
          placeholderTextColor={C.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={s.filterRow}>
          {(['all', 'business', 'buyer'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[s.filterBtn, filter === f && s.filterBtnActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[s.filterBtnText, filter === f && s.filterBtnTextActive]}>
                {f === 'all' ? 'Tous' : f === 'business' ? 'Marchands' : 'Clients'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Users List */}
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Text style={s.statValue}>{users.length}</Text>
            <Text style={s.statLabel}>Total</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statValue}>{users.filter(u => u.userType === 'business').length}</Text>
            <Text style={s.statLabel}>Marchands</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statValue}>{users.filter(u => u.userType === 'buyer').length}</Text>
            <Text style={s.statLabel}>Clients</Text>
          </View>
        </View>

        {filteredUsers.length === 0 ? (
          <View style={s.emptyContainer}>
            <Text style={s.emptyText}>Aucun utilisateur trouvé</Text>
          </View>
        ) : (
          filteredUsers.map((user) => (
            <View key={user.id} style={s.userCard}>
              <View style={s.userAvatar}>
                <Text style={s.userAvatarText}>
                  {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={s.userInfo}>
                <Text style={s.userName}>{user.name || 'Sans nom'}</Text>
                <Text style={s.userEmail}>{user.email || 'Pas d\'email'}</Text>
              </View>
              <View style={[s.userTypeBadge, { backgroundColor: getUserTypeColor(user.userType) + '20' }]}>
                <Text style={[s.userTypeText, { color: getUserTypeColor(user.userType) }]}>
                  {getUserTypeLabel(user.userType)}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },
  loadingText: { marginTop: 12, fontSize: 14, color: C.textLight },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: C.textDark },
  addBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { fontSize: 24, color: C.white, fontWeight: '700' },

  searchSection: { backgroundColor: C.surface, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  searchInput: { height: 48, backgroundColor: C.bg, borderRadius: 12, paddingHorizontal: 16, fontSize: 15, color: C.textDark, marginBottom: 12 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterBtn: { flex: 1, height: 36, borderRadius: 8, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  filterBtnActive: { backgroundColor: C.accent, borderColor: C.accent },
  filterBtnText: { fontSize: 13, fontWeight: '600', color: C.textMid },
  filterBtnTextActive: { color: C.white },

  scroll: { flex: 1 },
  statsRow: { flexDirection: 'row', gap: 12, padding: 20, paddingBottom: 16 },
  statBox: { flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800', color: C.textDark },
  statLabel: { fontSize: 12, color: C.textLight, marginTop: 4 },

  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 15, color: C.textLight },

  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, marginHorizontal: 20, marginBottom: 12, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: C.border },
  userAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  userAvatarText: { fontSize: 18, fontWeight: '700', color: C.white },
  userInfo: { flex: 1, marginLeft: 12 },
  userName: { fontSize: 15, fontWeight: '600', color: C.textDark },
  userEmail: { fontSize: 13, color: C.textLight, marginTop: 2 },
  userTypeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  userTypeText: { fontSize: 11, fontWeight: '700' },
});

export default UsersManagementScreen;
