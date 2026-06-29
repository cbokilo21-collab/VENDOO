import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StoreContactService, StoreContact } from '../services/storeContactService';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { T } from '../theme';

const StoreContactsScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [contacts, setContacts] = useState<StoreContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;

    const loadContacts = async () => {
      try {
        const userContacts = await StoreContactService.getUserContacts(user.uid);
        setContacts(userContacts);
      } catch (error) {
        console.error('Error loading contacts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, [user]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatRelativeTime = (timestamp: any) => {
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
    return formatDate(timestamp);
  };

  const handleContactPress = (contact: StoreContact) => {
    // Naviguer vers la boutique ou la messagerie
    (navigation as any).navigate('Messages');
  };

  const handleDeleteContact = async (contactId: string) => {
    await StoreContactService.deleteContact(contactId);
    setContacts(prev => prev.filter(c => c.id !== contactId));
  };

  const filteredContacts = contacts.filter(contact =>
    contact.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.storeCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.storeDistrict.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeContacts = filteredContacts.filter(c => c.status === 'active');
  const inactiveContacts = filteredContacts.filter(c => c.status === 'inactive');

  if (loading) {
    return (
      <View style={s.root}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Contacts vendeurs</Text>
          <Text style={s.headerSub}>Vos boutiques contactées</Text>
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
        <Text style={s.headerTitle}>Contacts vendeurs</Text>
        <Text style={s.headerSub}>{contacts.length} boutique{contacts.length > 1 ? 's' : ''} contactée{contacts.length > 1 ? 's' : ''}</Text>
      </View>

      {/* Search Bar */}
      <View style={s.searchContainer}>
        <TextInput
          style={s.searchInput}
          placeholder="Rechercher une boutique..."
          placeholderTextColor={T.textSub}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        {/* Active Contacts */}
        {activeContacts.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Actifs ({activeContacts.length})</Text>
            {activeContacts.map(contact => (
              <TouchableOpacity
                key={contact.id}
                style={s.contactCard}
                onPress={() => handleContactPress(contact)}
                activeOpacity={0.7}
              >
                <View style={s.contactIcon}>
                  <Text style={s.contactEmoji}>🏪</Text>
                </View>
                <View style={s.contactInfo}>
                  <Text style={s.contactName}>{contact.storeName}</Text>
                  <Text style={s.contactCategory}>{contact.storeCategory}</Text>
                  <View style={s.contactMeta}>
                    <Text style={s.contactDistrict}>{contact.storeDistrict}</Text>
                    <Text style={s.contactCount}>{contact.contactCount} contact{contact.contactCount > 1 ? 's' : ''}</Text>
                  </View>
                </View>
                <View style={s.contactActions}>
                  <Text style={s.contactLastContact}>{formatRelativeTime(contact.lastContactDate)}</Text>
                  <TouchableOpacity
                    style={s.surveyBtn}
                    onPress={() => (navigation as any).navigate('SellerSurvey', { storeId: contact.storeId, storeName: contact.storeName })}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={s.surveyBtnText}>📊</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.deleteBtn}
                    onPress={() => handleDeleteContact(contact.id!)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth={2}>
                      <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                    </Svg>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Inactive Contacts */}
        {inactiveContacts.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Inactifs ({inactiveContacts.length})</Text>
            {inactiveContacts.map(contact => (
              <TouchableOpacity
                key={contact.id}
                style={[s.contactCard, s.contactCardInactive]}
                onPress={() => handleContactPress(contact)}
                activeOpacity={0.7}
              >
                <View style={s.contactIcon}>
                  <Text style={s.contactEmoji}>🏪</Text>
                </View>
                <View style={s.contactInfo}>
                  <Text style={[s.contactName, s.contactNameInactive]}>{contact.storeName}</Text>
                  <Text style={s.contactCategory}>{contact.storeCategory}</Text>
                  <View style={s.contactMeta}>
                    <Text style={s.contactDistrict}>{contact.storeDistrict}</Text>
                    <Text style={s.contactCount}>{contact.contactCount} contact{contact.contactCount > 1 ? 's' : ''}</Text>
                  </View>
                </View>
                <View style={s.contactActions}>
                  <Text style={s.contactLastContact}>{formatRelativeTime(contact.lastContactDate)}</Text>
                  <TouchableOpacity
                    style={s.deleteBtn}
                    onPress={() => handleDeleteContact(contact.id!)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth={2}>
                      <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                    </Svg>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {filteredContacts.length === 0 && (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>👥</Text>
            <Text style={s.emptyTitle}>Aucun contact</Text>
            <Text style={s.emptySub}>Contactez des boutiques pour voir les apparaître ici</Text>
          </View>
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
  
  searchContainer: { paddingHorizontal: 24, marginBottom: 16 },
  searchInput: {
    backgroundColor: T.surface, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: T.border, fontSize: 15, color: T.text,
  },
  
  content: { flex: 1, paddingHorizontal: 24 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: T.text, marginBottom: 12 },
  
  contactCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: T.surface,
    borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: T.border,
  },
  contactCardInactive: { opacity: 0.6 },
  
  contactIcon: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: T.orangeSoft,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  contactEmoji: { fontSize: 24 },
  
  contactInfo: { flex: 1 },
  contactName: { fontSize: 16, fontWeight: '700', color: T.text, marginBottom: 4 },
  contactNameInactive: { color: T.textMid },
  contactCategory: { fontSize: 13, color: T.textSub, marginBottom: 8 },
  contactMeta: { flexDirection: 'row', gap: 12 },
  contactDistrict: { fontSize: 12, color: T.textMid },
  contactCount: { fontSize: 12, color: T.orange, fontWeight: '600' },
  
  contactActions: { alignItems: 'flex-end' },
  contactLastContact: { fontSize: 11, color: T.muted, marginBottom: 8 },
  surveyBtn: { marginBottom: 8 },
  surveyBtnText: { fontSize: 16 },
  deleteBtn: {},
  
  emptyState: { padding: 60, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: T.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: T.textSub },
});

export default StoreContactsScreen;
