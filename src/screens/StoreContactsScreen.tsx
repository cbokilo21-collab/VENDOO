import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Modal } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StoreContactService, StoreContact } from '../services/storeContactService';
import Svg, { Path, Circle, Line, Rect, Polyline } from 'react-native-svg';
import { T } from '../theme';

const StoreContactsScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [contacts, setContacts] = useState<StoreContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<StoreContact | null>(null);
  const [showMenu, setShowMenu] = useState(false);

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
    // Naviguer vers la messagerie
    (navigation as any).navigate('Messages', { storeId: contact.storeId, storeName: contact.storeName });
  };

  const handleDeleteContact = async (contactId: string) => {
    await StoreContactService.deleteContact(contactId);
    setContacts(prev => prev.filter(c => c.id !== contactId));
    setShowMenu(false);
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
        <View style={s.headerTop}>
          <Text style={s.headerTitle}>Contacts vendeurs</Text>
          <View style={s.headerStats}>
            <View style={s.statBadge}>
              <Text style={s.statText}>{activeContacts.length} actifs</Text>
            </View>
          </View>
        </View>
        <Text style={s.headerSub}>{contacts.length} boutique{contacts.length > 1 ? 's' : ''} contactée{contacts.length > 1 ? 's' : ''}</Text>
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
            placeholder="Rechercher une boutique..."
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

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        {/* Active Contacts */}
        {activeContacts.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Actifs ({activeContacts.length})</Text>
            </View>
            {activeContacts.map(contact => (
              <TouchableOpacity
                key={contact.id}
                style={s.contactCard}
                onPress={() => handleContactPress(contact)}
                onLongPress={() => { setSelectedContact(contact); setShowMenu(true); }}
                activeOpacity={0.7}
              >
                <View style={s.contactIcon}>
                  <Text style={s.contactEmoji}>🏪</Text>
                  {contact.contactCount > 5 && <View style={s.activeDot} />}
                </View>
                <View style={s.contactInfo}>
                  <View style={s.contactHeader}>
                    <Text style={s.contactName}>{contact.storeName}</Text>
                    <Text style={s.contactLastContact}>{formatRelativeTime(contact.lastContactDate)}</Text>
                  </View>
                  <Text style={s.contactCategory}>{contact.storeCategory}</Text>
                  <View style={s.contactMeta}>
                    <View style={s.contactMetaItem}>
                      <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={T.textMid} strokeWidth={2}>
                        <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <Circle cx={12} cy={10} r={3} />
                      </Svg>
                      <Text style={s.contactDistrict}>{contact.storeDistrict}</Text>
                    </View>
                    <View style={s.contactMetaItem}>
                      <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={T.orange} strokeWidth={2}>
                        <Path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                      </Svg>
                      <Text style={s.contactCount}>{contact.contactCount} contact{contact.contactCount > 1 ? 's' : ''}</Text>
                    </View>
                  </View>
                </View>
                <View style={s.contactActions}>
                  <TouchableOpacity
                    style={s.messageBtn}
                    onPress={() => handleContactPress(contact)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={T.white} strokeWidth={2}>
                      <Path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </Svg>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.surveyBtn}
                    onPress={() => (navigation as any).navigate('SellerSurvey', { storeId: contact.storeId, storeName: contact.storeName })}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={s.surveyBtnText}>📊</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.moreBtn}
                    onPress={() => { setSelectedContact(contact); setShowMenu(true); }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={T.textSub} strokeWidth={2}>
                      <Circle cx={12} cy={12} r={1} />
                      <Circle cx={12} cy={5} r={1} />
                      <Circle cx={12} cy={19} r={1} />
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
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Inactifs ({inactiveContacts.length})</Text>
            </View>
            {inactiveContacts.map(contact => (
              <TouchableOpacity
                key={contact.id}
                style={[s.contactCard, s.contactCardInactive]}
                onPress={() => handleContactPress(contact)}
                onLongPress={() => { setSelectedContact(contact); setShowMenu(true); }}
                activeOpacity={0.7}
              >
                <View style={s.contactIcon}>
                  <Text style={s.contactEmoji}>🏪</Text>
                </View>
                <View style={s.contactInfo}>
                  <View style={s.contactHeader}>
                    <Text style={[s.contactName, s.contactNameInactive]}>{contact.storeName}</Text>
                    <Text style={s.contactLastContact}>{formatRelativeTime(contact.lastContactDate)}</Text>
                  </View>
                  <Text style={s.contactCategory}>{contact.storeCategory}</Text>
                  <View style={s.contactMeta}>
                    <View style={s.contactMetaItem}>
                      <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={T.textMid} strokeWidth={2}>
                        <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <Circle cx={12} cy={10} r={3} />
                      </Svg>
                      <Text style={s.contactDistrict}>{contact.storeDistrict}</Text>
                    </View>
                    <View style={s.contactMetaItem}>
                      <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={T.orange} strokeWidth={2}>
                        <Path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                      </Svg>
                      <Text style={s.contactCount}>{contact.contactCount} contact{contact.contactCount > 1 ? 's' : ''}</Text>
                    </View>
                  </View>
                </View>
                <View style={s.contactActions}>
                  <TouchableOpacity
                    style={s.moreBtn}
                    onPress={() => { setSelectedContact(contact); setShowMenu(true); }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={T.textSub} strokeWidth={2}>
                      <Circle cx={12} cy={12} r={1} />
                      <Circle cx={12} cy={5} r={1} />
                      <Circle cx={12} cy={19} r={1} />
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

      {/* Action Menu Modal */}
      <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setShowMenu(false)}>
          <View style={s.menuContainer}>
            <View style={s.menuContent}>
              <Text style={s.menuTitle}>Options de contact</Text>
              <TouchableOpacity style={s.menuItem} onPress={() => { setShowMenu(false); handleContactPress(selectedContact!); }}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={T.text} strokeWidth={2}>
                  <Path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </Svg>
                <Text style={s.menuItemText}>Envoyer un message</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.menuItem} onPress={() => { setShowMenu(false); }}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={T.text} strokeWidth={2}>
                  <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </Svg>
                <Text style={s.menuItemText}>Appeler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.menuItem} onPress={() => { setShowMenu(false); (navigation as any).navigate('SellerSurvey', { storeId: selectedContact?.storeId, storeName: selectedContact?.storeName }); }}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={T.text} strokeWidth={2}>
                  <Path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <Polyline points="14 2 14 8 20 8" />
                  <Line x1={16} y1={13} x2={8} y2={13} />
                  <Line x1={16} y1={17} x2={8} y2={17} />
                  <Polyline points="10 9 9 9 8 9" />
                </Svg>
                <Text style={s.menuItemText}>Voir l'enquête</Text>
              </TouchableOpacity>
              <View style={s.menuDivider} />
              <TouchableOpacity
                style={[s.menuItem, s.menuItemDanger]}
                onPress={() => selectedContact && handleDeleteContact(selectedContact.id!)}
              >
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth={2}>
                  <Path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </Svg>
                <Text style={[s.menuItemText, s.menuItemTextDanger]}>Supprimer</Text>
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
  headerStats: { flexDirection: 'row', gap: 8 },
  statBadge: { backgroundColor: T.orangeSoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statText: { fontSize: 12, fontWeight: '700', color: T.orange },
  
  searchContainer: { paddingHorizontal: 24, marginBottom: 12 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: T.surface,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1, borderColor: T.border, gap: 12,
  },
  searchInput: { flex: 1, fontSize: 15, color: T.text },
  clearSearch: { fontSize: 16, color: T.textSub },
  
  content: { flex: 1, paddingHorizontal: 24 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: T.text },
  
  contactCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: T.surface,
    borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: T.border,
  },
  contactCardInactive: { opacity: 0.6 },
  contactCardFavorite: { backgroundColor: T.orange + '08', borderColor: T.orange },
  
  contactIcon: {
    width: 52, height: 52, borderRadius: 12, backgroundColor: T.orangeSoft,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  contactEmoji: { fontSize: 24 },
  favoriteDot: {
    position: 'absolute', top: 4, right: 4, width: 16, height: 16,
    borderRadius: 8, backgroundColor: T.orange, alignItems: 'center', justifyContent: 'center',
  },
  activeDot: {
    position: 'absolute', bottom: 4, right: 4, width: 12, height: 12,
    borderRadius: 6, backgroundColor: '#10B981', borderWidth: 2, borderColor: T.white,
  },
  
  contactInfo: { flex: 1 },
  contactHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 4,
  },
  contactName: { fontSize: 16, fontWeight: '700', color: T.text },
  contactNameInactive: { color: T.textMid },
  contactCategory: { fontSize: 13, color: T.textSub, marginBottom: 8 },
  contactMeta: { flexDirection: 'row', gap: 16 },
  contactMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  contactDistrict: { fontSize: 12, color: T.textMid },
  contactCount: { fontSize: 12, color: T.orange, fontWeight: '600' },
  contactLastContact: { fontSize: 11, color: T.muted },
  
  contactActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  messageBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: T.orange,
    alignItems: 'center', justifyContent: 'center',
  },
  surveyBtn: { padding: 8 },
  surveyBtnText: { fontSize: 16 },
  moreBtn: { padding: 8 },
  
  emptyState: { padding: 60, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: T.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: T.textSub },
  
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

export default StoreContactsScreen;
