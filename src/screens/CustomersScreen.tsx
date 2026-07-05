import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput, Dimensions, KeyboardAvoidingView, Platform, Animated, Easing, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BottomNavigation from '../components/BottomNavigation';
import Svg, { Path, Circle } from 'react-native-svg';
import { useLanguage } from '../contexts/LanguageContext';

const C = {
  navy: '#FF6B35', sideMuted: '#64748B',
  bg: '#F6F7F9', surface: '#FFFFFF', border: '#E5E7EB',
  accent: '#FF6B35', textDark: '#111827', textMid: '#374151', textLight: '#6B7280', muted: '#9CA3AF',
  success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6', purple: '#8B5CF6',
  white: '#FFFFFF',
};

type Segment = 'vip' | 'fidele' | 'nouveau' | 'inactif';
interface Customer { id: string; nom: string; email: string; commandes: number; total: number; segment: Segment; dernierAchat: string; insight?: string; }
type RootStackParamList = { BusinessDashboard: undefined; Products: undefined; Orders: undefined; Customers: undefined; Settings: undefined; };
type Nav = NativeStackNavigationProp<RootStackParamList, 'Customers'>;

const segmentConfig: Record<Segment, { label: string; color: string }> = {
  vip:     { label: 'VIP',      color: C.purple  },
  fidele:  { label: 'Fidèle',   color: C.info    },
  nouveau: { label: 'Nouveau',  color: C.success },
  inactif: { label: 'Inactif',  color: C.muted   },
};

const avatarColors = [C.accent, C.info, C.success, C.purple, C.warning];

const DashIcon  = ({ a }: { a?: boolean }) => <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={a ? C.white : C.sideMuted} strokeWidth={2}><Path d="M3 3v18h18M18 17V9M13 17V5M8 17v-3" strokeLinecap="round" strokeLinejoin="round"/></Svg>;
const BoxIcon   = ({ a }: { a?: boolean }) => <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={a ? C.white : C.sideMuted} strokeWidth={2}><Path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" strokeLinecap="round" strokeLinejoin="round"/></Svg>;
const ClipIcon  = ({ a }: { a?: boolean }) => <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={a ? C.white : C.sideMuted} strokeWidth={2}><Path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 10h6M9 14h6M9 18h6" strokeLinecap="round" strokeLinejoin="round"/></Svg>;
const UsersIcon = ({ a }: { a?: boolean }) => <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={a ? C.white : C.sideMuted} strokeWidth={2}><Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round"/><Circle cx="9" cy="7" r="4"/></Svg>;
const GearIcon  = ({ a }: { a?: boolean }) => <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={a ? C.white : C.sideMuted} strokeWidth={2}><Circle cx="12" cy="12" r="3"/><Path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" strokeLinecap="round" strokeLinejoin="round"/></Svg>;

const navItems = [
  { key: 'BusinessDashboard', label: 'Dashboard',  Icon: DashIcon  },
  { key: 'Products',          label: 'Produits',   Icon: BoxIcon   },
  { key: 'Orders',            label: 'Commandes',  Icon: ClipIcon  },
  { key: 'Customers',         label: 'Clients',    Icon: UsersIcon },
  { key: 'Settings',          label: 'Paramètres', Icon: GearIcon  },
];

const Sidebar: React.FC<{ active: string; onNav: (s: string) => void }> = ({ active, onNav }) => (
  <View style={s.sidebar}>
    <View style={s.sideLogoRow}>
      <View style={s.logoMark}><Text style={s.logoMarkText}>V</Text></View>
      <Text style={s.logoName}>Vendoo</Text>
    </View>
    <Text style={s.sideSection}>NAVIGATION</Text>
    {navItems.map(({ key, label, Icon }) => {
      const isActive = active === key;
      return (
        <TouchableOpacity key={key} style={[s.navItem, isActive && s.navItemActive]} onPress={() => onNav(key)} activeOpacity={0.7}>
          <Icon a={isActive} />
          <Text style={[s.navLabel, isActive && s.navLabelActive]}>{label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// ─── Animated Card Component ───────────────────────────────────────────────────
const AnimatedCard: React.FC<{ children: React.ReactNode; delay?: number; style?: any }> = ({ children, delay = 0, style }) => {
  const animY = useRef(new Animated.Value(20)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animY, {
        toValue: 0,
        duration: 600,
        delay,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: false,
      }),
      Animated.timing(animOpacity, {
        toValue: 1,
        duration: 500,
        delay,
        easing: Easing.ease,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity: animOpacity, transform: [{ translateY: animY }] }]}>
      {children}
    </Animated.View>
  );
};

const CustomersScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { t } = useLanguage();
  const isDesktop = Dimensions.get('window').width >= 1024;
  const [search, setSearch] = useState('');
  const [filterSegment, setFilterSegment] = useState<Segment | 'all'>('all');
  const [showChat, setShowChat] = useState(false);
  const [chatCustomer, setChatCustomer] = useState<Customer | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ text: string; isMe: boolean }[]>([]);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      // Load customers from Firestore
      setLoading(false);
    } catch (error) {
      console.error('Error loading customers:', error);
      setLoading(false);
    }
  };

  const filtered = customers
    .filter(c => filterSegment === 'all' || c.segment === filterSegment)
    .filter(c => c.nom.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));

  const goTo = (screen: string) => { if (screen !== 'Customers') navigation.navigate(screen as any); };

  const openChat = (customer: Customer) => {
    setChatCustomer(customer);
    setMessages([{ text: `${t('customers.hello')} ${customer.nom} ! ${t('customers.howCanHelp')}`, isMe: false }]);
    setShowChat(true);
  };

  const sendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { text: message, isMe: true }]);
      setMessage('');
      setTimeout(() => {
        setMessages(prev => [...prev, { text: t('customers.autoReply'), isMe: false }]);
      }, 1000);
    }
  };

  const content = (
    <ScrollView style={s.content} contentContainerStyle={s.inner} showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
      <AnimatedCard delay={0} style={s.pageHeader}>
        <View style={s.headerLeft}>
          <Text style={s.pageTitle}>{t('customers.title')}</Text>
          <Text style={s.pageSubtitle}>{customers.length} {t('customers.registered')}</Text>
          <View style={s.statsRow}>
            <View style={s.statChip}>
              <Text style={s.statLabel}>VIP</Text>
              <Text style={s.statValue}>{customers.filter(c => c.segment === 'vip').length}</Text>
            </View>
            <View style={[s.statChip, s.statChipNew]}>
              <Text style={s.statLabel}>Nouveaux</Text>
              <Text style={s.statValue}>{customers.filter(c => c.segment === 'nouveau').length}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => {}}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5}>
            <Path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
          <Text style={s.addBtnText}>Ajouter</Text>
        </TouchableOpacity>
      </AnimatedCard>

      {/* Search */}
      <AnimatedCard delay={50} style={s.searchBar}>
        <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2}>
          <Circle cx="11" cy="11" r="8"/><Path d="m21 21-4.35-4.35" strokeLinecap="round"/>
        </Svg>
        <TextInput style={s.searchInput} placeholder={t('customers.searchPlaceholder')} placeholderTextColor={C.muted} value={search} onChangeText={setSearch} 
      autoCorrect={false}
      autoCapitalize="none"
      returnKeyType="search"
      clearButtonMode="while-editing"
      spellCheck={false}/>
      </AnimatedCard>

      {/* Segment filter */}
      <AnimatedCard delay={100} style={{}}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}
            keyboardShouldPersistTaps="handled">
          {(['all', 'vip', 'fidele', 'nouveau', 'inactif'] as const).map(seg => (
            <TouchableOpacity key={seg} style={[s.chip, filterSegment === seg && s.chipActive]} onPress={() => setFilterSegment(seg)}>
              <Text style={[s.chipText, filterSegment === seg && s.chipTextActive]}>
                {seg === 'all' ? t('customers.all') : segmentConfig[seg].label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </AnimatedCard>

      {/* Customer cards */}
      <AnimatedCard delay={150} style={s.card}>
        {filtered.map((c, i) => {
          const seg = segmentConfig[c.segment];
          const avatarColor = avatarColors[parseInt(c.id) % avatarColors.length];
          return (
            <TouchableOpacity
              key={c.id}
              style={[s.customerRow, i < filtered.length - 1 && s.rowBorder]}
              onPress={() => navigation.navigate('CustomerDetail' as any, { customer: c })}
              activeOpacity={0.7}
            >
              <View style={[s.avatar, { backgroundColor: avatarColor }]}>
                <Text style={s.avatarText}>{c.nom[0]}</Text>
              </View>
              <View style={s.customerInfo}>
                <View style={s.customerTopRow}>
                  <Text style={s.customerName}>{c.nom}</Text>
                  <View style={[s.segBadge, { backgroundColor: seg.color + '18' }]}>
                    <Text style={[s.segText, { color: seg.color }]}>{seg.label}</Text>
                  </View>
                </View>
                <Text style={s.customerEmail}>{c.email}</Text>
                <Text style={s.customerMeta}>{c.commandes} {c.commandes !== 1 ? t('customers.orders') : t('customers.order')} · {t('customers.total')}: €{c.total} · {t('customers.last')}: {c.dernierAchat}</Text>
                {c.insight && (
                  <View style={s.insightBox}>
                    <Text style={s.insightIcon}>✦</Text>
                    <Text style={s.insightText}>{c.insight}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity style={s.chatBtn} onPress={() => openChat(c)}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth={2}>
                  <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
        {filtered.length === 0 && <Text style={s.emptyText}>Aucun client trouvé.</Text>}
      </AnimatedCard>
    </ScrollView>
  );

  if (isDesktop) {
    return (
      <View style={s.desktop}>
        {Platform.OS !== 'web' && <Sidebar active="Customers" onNav={goTo} />}
        {content}
        <ChatModal visible={showChat} customer={chatCustomer} onClose={() => setShowChat(false)} messages={messages} onSend={sendMessage} message={message} onMessageChange={setMessage} />
      </View>
    );
  }

  return (
    <View style={s.mobile}>
      <View style={s.mobileHeader}><Text style={s.mobileTitle}>Clients</Text></View>
      {content}
      <BottomNavigation activeRoute="Customers" />
      <ChatModal visible={showChat} customer={chatCustomer} onClose={() => setShowChat(false)} messages={messages} onSend={sendMessage} message={message} onMessageChange={setMessage} />
    </View>
  );
};

// ─── Chat Modal ───────────────────────────────────────────────────────────────
const ChatModal: React.FC<{ visible: boolean; customer: Customer | null; onClose: () => void; messages: { text: string; isMe: boolean }[]; onSend: () => void; message: string; onMessageChange: (t: string) => void }> = ({ visible, customer, onClose, messages, onSend, message, onMessageChange }) => {
  if (!customer) return null;
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={s.chatRoot}>
        <View style={s.chatHeader}>
          <TouchableOpacity onPress={onClose} style={s.chatBackBtn}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.textDark} strokeWidth={2}>
              <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </TouchableOpacity>
          <View style={s.chatHeaderCenter}>
            <Text style={s.chatHeaderTitle}>Chat avec {customer.nom}</Text>
            <Text style={s.chatHeaderSubtitle}>{customer.email}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={s.chatMessages} showsVerticalScrollIndicator={false}>
          {messages.map((msg, i) => (
            <View key={i} style={[s.messageBubble, msg.isMe ? s.messageMe : s.messageSeller]}>
              <Text style={[s.messageText, msg.isMe ? s.messageTextMe : s.messageTextSeller]}>{msg.text}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={s.chatInputRow}>
          <TextInput
            style={s.chatInput}
            placeholder="Écrivez votre message..."
            placeholderTextColor={C.muted}
            value={message}
            onChangeText={onMessageChange}
            multiline
          />
          <TouchableOpacity style={s.chatSendBtn} onPress={onSend}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth={2}>
              <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  desktop: { flex: 1, flexDirection: 'row', backgroundColor: C.bg },
  mobile:  { flex: 1, backgroundColor: C.bg },

  sidebar:        { width: 240, backgroundColor: C.accent, paddingVertical: 28, paddingHorizontal: 16 },
  sideLogoRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, marginBottom: 32 },
  logoMark:       { width: 32, height: 32, borderRadius: 7, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  logoMarkText:   { color: C.white, fontSize: 16, fontWeight: '800' },
  logoName:       { fontSize: 18, fontWeight: '700', color: C.white },
  sideSection:    { fontSize: 10, fontWeight: '700', color: C.sideMuted, letterSpacing: 1.4, paddingHorizontal: 8, marginBottom: 8 },
  navItem:        { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, paddingVertical: 10, borderRadius: 8, marginBottom: 2 },
  navItemActive:  { backgroundColor: 'rgba(255,255,255,0.08)' },
  navLabel:       { fontSize: 14, color: C.sideMuted, fontWeight: '500' },
  navLabelActive: { color: C.white, fontWeight: '600' },

  content:      { flex: 1 },
  inner:        { padding: 28, gap: 16, paddingBottom: 60 },
  pageHeader:   { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 },
  headerLeft:   { flex: 1 },
  pageTitle:    { fontSize: 26, fontWeight: '800', color: C.textDark, marginBottom: 3, letterSpacing: -0.5 },
  pageSubtitle: { fontSize: 14, color: C.textLight },
  statsRow:     { flexDirection: 'row', gap: 8, marginTop: 8 },
  statChip:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.purple + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: C.purple + '30' },
  statChipNew:  { backgroundColor: C.success + '15', borderColor: C.success + '30' },
  statLabel:    { fontSize: 11, fontWeight: '600', color: C.textMid, textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue:    { fontSize: 13, fontWeight: '800', color: C.textDark },
  addBtn:       { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.accent, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, shadowColor: C.accent, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6 },
  addBtnText:   { fontSize: 13, fontWeight: '700', color: C.white },
  mobileHeader: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border },
  mobileTitle:  { fontSize: 22, fontWeight: '800', color: C.textDark },

  searchBar:   { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.surface, borderRadius: 10, paddingHorizontal: 14, height: 44, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
  searchInput: { flex: 1, fontSize: 14, color: C.textDark },

  filterRow:       { gap: 8, paddingVertical: 2 },
  chip:            { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border },
  chipActive:      { backgroundColor: C.accent, borderColor: C.accent },
  chipText:        { fontSize: 13, color: C.textMid, fontWeight: '500' },
  chipTextActive:  { color: C.white, fontWeight: '600' },

  card:    { backgroundColor: C.surface, borderRadius: 14, padding: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 },
  customerRow:    { paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', gap: 12, alignItems: 'center' },
  rowBorder:      { borderBottomWidth: 1, borderBottomColor: C.border },
  avatar:         { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText:     { color: C.white, fontSize: 17, fontWeight: '800' },
  customerInfo:   { flex: 1, gap: 3 },
  customerTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  customerName:   { fontSize: 14, fontWeight: '700', color: C.textDark },
  segBadge:       { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  segText:        { fontSize: 11, fontWeight: '700' },
  customerEmail:  { fontSize: 13, color: C.textMid },
  customerMeta:   { fontSize: 12, color: C.muted },
  insightBox:     { flexDirection: 'row', gap: 6, backgroundColor: '#EFF6FF', borderLeftWidth: 3, borderLeftColor: C.info, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 6, marginTop: 6 },
  insightIcon:    { fontSize: 11, color: C.info, fontWeight: '700' },
  insightText:    { flex: 1, fontSize: 12, color: '#1D4ED8', lineHeight: 17 },
  chatBtn:        { width: 36, height: 36, borderRadius: 10, backgroundColor: C.accent + '15', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  emptyText:      { textAlign: 'center', color: C.muted, fontSize: 14, paddingVertical: 24 },

  // Chat Modal
  chatRoot: { flex: 1, backgroundColor: C.bg },
  chatHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border },
  chatBackBtn: { width: 36, height: 36, borderRadius: 9, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  chatHeaderCenter: { flex: 1 },
  chatHeaderTitle: { fontSize: 16, fontWeight: '800', color: C.textDark },
  chatHeaderSubtitle: { fontSize: 12, color: C.textLight },
  chatMessages: { padding: 20, gap: 12, paddingBottom: 24 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
  messageMe: { backgroundColor: C.accent, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  messageSeller: { backgroundColor: C.surface, alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 14, lineHeight: 18 },
  messageTextMe: { color: C.white },
  messageTextSeller: { color: C.textDark },
  chatInputRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingBottom: 24, paddingTop: 12, backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.border },
  chatInput: { flex: 1, backgroundColor: C.bg, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: C.textDark, maxHeight: 100 },
  chatSendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
});

export default CustomersScreen;
