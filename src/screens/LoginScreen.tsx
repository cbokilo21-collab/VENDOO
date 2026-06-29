import React, { useState } from 'react';
import {
  View, StyleSheet, Text, TextInput, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform, ActivityIndicator, Dimensions, ScrollView,
} from 'react-native';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLanguage } from '../contexts/LanguageContext';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

const C = {
  navy: '#FF6B35', navyMid: '#FF8A5C', navyLight: '#FFBD9A',
  muted: '#9CA3AF', border: '#E5E7EB', borderFocus: '#FF6B35',
  bg: '#FFF7F3', surface: '#FFFFFF', accent: '#FF6B35',
  textDark: '#111827', textMid: '#374151', textLight: '#6B7280', white: '#FFFFFF',
  success: '#10B981', successLight: '#D1FAE5',
};

type RootStackParamList = { Login: undefined; Register: undefined };
type Nav = NativeStackNavigationProp<RootStackParamList, 'Login'>;

// ─── Eye icon ──────────────────────────────────────────────────────────────────
const EyeIcon = ({ visible }: { visible: boolean }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2}>
    {visible ? (
      <>
        <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round"/>
        <Circle cx="12" cy="12" r="3"/>
      </>
    ) : (
      <>
        <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeLinecap="round" strokeLinejoin="round"/>
        <Line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round"/>
      </>
    )}
  </Svg>
);

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { t } = useLanguage();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState<string | null>(null);
  const isDesktop = Dimensions.get('window').width >= 768;

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert(t('login.requiredFields'), t('login.fillAllFields')); return; }
    setLoading(true);
    try { await signInWithEmailAndPassword(auth, email, password); }
    catch { Alert.alert(t('login.loginError'), t('login.invalidCredentials')); setLoading(false); }
  };

  const handleForgot = async () => {
    if (!email) { Alert.alert(t('login.emailRequired'), t('login.enterEmail')); return; }
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(t('login.emailSent'), `${t('login.resetLinkSent')} ${email}`);
    } catch {
      Alert.alert(t('login.emailError'), t('login.emailNotFound'));
    }
  };

  const features = [
    { icon: '📦', label: t('login.feature1') },
    { icon: '📊', label: t('login.feature2') },
    { icon: '🤖', label: t('login.feature3') },
    { icon: '🌍', label: t('login.feature4') },
  ];
  const stats = [
    { value: '12K+', label: t('login.stat1') },
    { value: '98%',  label: t('login.stat2') },
    { value: '3.2M', label: t('login.stat3') },
  ];

  const formContent = (
    <View style={s.formCard}>
      <Text style={s.formTitle}>{t('login.title')}</Text>
      <Text style={s.formSubtitle}>{t('login.subtitle')}</Text>

      {/* Email */}
      <View style={s.fieldGroup}>
        <Text style={s.label}>{t('login.email')}</Text>
        <TextInput
          style={[s.input, focused === 'email' && s.inputF]}
          placeholder={t('login.emailPlaceholder')}
          placeholderTextColor={C.muted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          returnKeyType="next"
          clearButtonMode="while-editing"
          onFocus={() => setFocused('email')}
          onBlur={() => setFocused(null)}
        />
      </View>

      {/* Password */}
      <View style={s.fieldGroup}>
        <View style={s.labelRow}>
          <Text style={s.label}>{t('login.password')}</Text>
          <TouchableOpacity onPress={handleForgot}>
            <Text style={s.forgotLink}>{t('login.forgotPassword')}</Text>
          </TouchableOpacity>
        </View>
        <View style={s.inputWrap}>
          <TextInput
            style={[s.inputInner, focused === 'pass' && s.inputF]}
            placeholder={t('login.passwordPlaceholder')}
            placeholderTextColor={C.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPwd}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            onFocus={() => setFocused('pass')}
            onBlur={() => setFocused(null)}
          />
          <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPwd(v => !v)} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <EyeIcon visible={showPwd} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Login CTA */}
      <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
        {loading ? <ActivityIndicator color={C.white} /> : <Text style={s.btnText}>{t('login.loginBtn')}</Text>}
      </TouchableOpacity>

      <View style={s.dividerRow}>
        <View style={s.divLine} /><Text style={s.divText}>{t('login.or')}</Text><View style={s.divLine} />
      </View>

      <TouchableOpacity style={s.btnOutline} onPress={() => navigation.navigate('Register')} activeOpacity={0.85}>
        <Text style={s.btnOutlineText}>{t('login.registerBtn')}</Text>
      </TouchableOpacity>

      {/* ── Mentions légales obligatoires ─────────────────────────────── */}
      <View style={s.legalBlock}>
        <View style={s.legalSep} />
        <Text style={s.legalTitle}>{t('login.legalInfo')}</Text>
        <Text style={s.legalText}>
          {t('login.legalText')}{' '}
          <Text style={s.legalLink}>{t('login.terms')}</Text>
          {' '}{t('login.and')}{' '}
          <Text style={s.legalLink}>{t('login.privacy')}</Text>.
        </Text>
        <Text style={s.legalText}>
          {t('login.gdpr')}
        </Text>
        <View style={s.legalRow}>
          <TouchableOpacity><Text style={s.legalLink}>{t('login.cgu')}</Text></TouchableOpacity>
          <Text style={s.legalDot}>·</Text>
          <TouchableOpacity><Text style={s.legalLink}>{t('login.confidentiality')}</Text></TouchableOpacity>
          <Text style={s.legalDot}>·</Text>
          <TouchableOpacity><Text style={s.legalLink}>{t('login.legal')}</Text></TouchableOpacity>
          <Text style={s.legalDot}>·</Text>
          <TouchableOpacity><Text style={s.legalLink}>{t('login.cookies')}</Text></TouchableOpacity>
        </View>
        <Text style={s.legalCopy}>{t('login.copyright')}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.root}>
      <View style={[s.layout, isDesktop && s.layoutDesktop]}>

        {/* ── LEFT: Brand panel (desktop) ───────────────────────────────── */}
        {isDesktop && (
          <View style={s.brandPanel}>
            <View style={s.logoRow}>
              <View style={s.logoMark}><Text style={s.logoMarkTxt}>V</Text></View>
              <Text style={s.logoName}>Vendoo</Text>
            </View>
            <View style={s.brandBody}>
              <Text style={s.headline}>{t('login.headline')}</Text>
              <Text style={s.subline}>{t('login.subline')}</Text>
              <View style={s.featureList}>
                {features.map((f, i) => (
                  <View key={i} style={s.featureRow}>
                    <View style={s.featureDot} />
                    <Text style={s.featureTxt}>{f.icon}  {f.label}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={s.statsRow}>
              {stats.map((st, i) => (
                <View key={i} style={s.statItem}>
                  <Text style={s.statValue}>{st.value}</Text>
                  <Text style={s.statLabel}>{st.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── RIGHT: Form panel ─────────────────────────────────────────── */}
        <View style={s.formPanel}>
          <ScrollView contentContainerStyle={s.formPanelInner}
            showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {!isDesktop && (
              <View style={s.mobileLogoRow}>
                <View style={s.logoMark}><Text style={s.logoMarkTxt}>V</Text></View>
                <Text style={[s.logoName, { color: C.textDark }]}>Vendoo</Text>
              </View>
            )}
            {formContent}
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: C.bg },
  layout:        { flex: 1 },
  layoutDesktop: { flexDirection: 'row' },

  brandPanel:    { width: 420, backgroundColor: C.accent, padding: 48, justifyContent: 'space-between' },
  logoRow:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoMark:      { width: 36, height: 36, borderRadius: 8, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  logoMarkTxt:   { color: C.white, fontSize: 18, fontWeight: '800' },
  logoName:      { fontSize: 20, fontWeight: '700', color: C.white, letterSpacing: 0.3 },
  brandBody:     { flex: 1, paddingTop: 56, paddingBottom: 40 },
  headline:      { fontSize: 34, fontWeight: '800', color: C.white, lineHeight: 44, marginBottom: 16 },
  subline:       { fontSize: 15, color: '#9CA3AF', lineHeight: 24, marginBottom: 36 },
  featureList:   { gap: 14 },
  featureRow:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureDot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: C.accent },
  featureTxt:    { fontSize: 14, color: '#D1D5DB', fontWeight: '500' },
  statsRow:      { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#FFE0D0', paddingTop: 28 },
  statItem:      { flex: 1 },
  statValue:     { fontSize: 22, fontWeight: '800', color: C.white, marginBottom: 3 },
  statLabel:     { fontSize: 12, color: '#6B7280' },

  formPanel:       { flex: 1, backgroundColor: C.surface },
  formPanelInner:  { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 32, paddingBottom: 40, minHeight: '100%' as any },
  mobileLogoRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 32 },
  formCard:        { width: '100%', maxWidth: 400 },
  formTitle:       { fontSize: 26, fontWeight: '800', color: C.textDark, marginBottom: 6 },
  formSubtitle:    { fontSize: 14, color: C.textLight, marginBottom: 32 },

  fieldGroup:    { marginBottom: 20 },
  labelRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 },
  label:         { fontSize: 13, fontWeight: '600', color: C.textMid, marginBottom: 7 },
  forgotLink:    { fontSize: 13, color: C.accent, fontWeight: '600' },

  input:         { height: 48, borderWidth: 1.5, borderColor: C.border, borderRadius: 10, paddingHorizontal: 14, fontSize: 16, color: C.textDark, backgroundColor: C.bg },
  inputF:        { borderColor: C.borderFocus, backgroundColor: C.white },

  inputWrap:     { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: C.border, borderRadius: 10, backgroundColor: C.bg, paddingRight: 12 },
  inputInner:    { flex: 1, height: 48, paddingHorizontal: 14, fontSize: 16, color: C.textDark },
  eyeBtn:        { padding: 4 },

  btn:           { height: 50, borderRadius: 10, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center', marginTop: 4, shadowColor: C.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  btnText:       { color: C.white, fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },

  dividerRow:    { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 12 },
  divLine:       { flex: 1, height: 1, backgroundColor: C.border },
  divText:       { fontSize: 13, color: C.muted },

  btnOutline:    { height: 50, borderRadius: 10, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  btnOutlineText:{ color: C.textMid, fontSize: 15, fontWeight: '600' },

  // Legal block
  legalBlock:    { marginTop: 28 },
  legalSep:      { height: 1, backgroundColor: C.border, marginBottom: 18 },
  legalTitle:    { fontSize: 11, fontWeight: '800', color: C.textLight, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  legalText:     { fontSize: 11, color: C.muted, lineHeight: 16, marginBottom: 8 },
  legalRow:      { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginTop: 6, marginBottom: 10 },
  legalLink:     { fontSize: 11, color: C.accent, fontWeight: '600' },
  legalDot:      { fontSize: 11, color: C.muted },
  legalCopy:     { fontSize: 11, color: C.muted },
});

export default LoginScreen;
