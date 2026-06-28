import React, { useState } from 'react';
import {
  View, StyleSheet, Text, TextInput, TouchableOpacity,
  Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
  ScrollView, Dimensions,
} from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification, reload } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle, Line, Rect, Polyline } from 'react-native-svg';

const C = {
  navy: '#FF6B35', navyMid: '#FF8A5C',
  bg: '#FFF7F3', surface: '#FFFFFF', border: '#E5E7EB', borderFocus: '#FF6B35',
  accent: '#FF6B35', accentSoft: 'rgba(255,107,53,0.10)',
  textDark: '#111827', textMid: '#374151', textLight: '#6B7280', muted: '#9CA3AF',
  success: '#10B981', successLight: '#D1FAE5', info: '#3B82F6', infoLight: '#EFF6FF',
  white: '#FFFFFF', error: '#EF4444',
};

type UserType = 'personal' | 'business';
type RootStackParamList = { Login: undefined; Register: undefined; CreateBoutique: undefined; BusinessDashboard: undefined };
type Nav = NativeStackNavigationProp<RootStackParamList, 'Register'>;

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

// ─── Check icon ────────────────────────────────────────────────────────────────
const CheckIcon = ({ on }: { on: boolean }) => (
  <View style={[cb.box, on && cb.boxOn]}>
    {on && (
      <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth={3}>
        <Path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
      </Svg>
    )}
  </View>
);

const cb = StyleSheet.create({
  box:   { width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg },
  boxOn: { backgroundColor: C.accent, borderColor: C.accent },
});

// ─── Strength bar ──────────────────────────────────────────────────────────────
const strengthLevel = (pwd: string) => {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
};
const STRENGTH_COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981'];
const STRENGTH_LABELS = ['Trop court', 'Faible', 'Moyen', 'Fort', 'Très fort'];

const StrengthBar: React.FC<{ pwd: string }> = ({ pwd }) => {
  const lvl = strengthLevel(pwd);
  if (!pwd) return null;
  return (
    <View style={{ marginTop: 6, gap: 4 }}>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {[1,2,3,4].map(i => (
          <View key={i} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: i <= lvl ? STRENGTH_COLORS[lvl - 1] : C.border }} />
        ))}
      </View>
      <Text style={{ fontSize: 11, color: lvl >= 3 ? C.success : lvl >= 2 ? '#F59E0B' : C.error, fontWeight: '600' }}>
        {STRENGTH_LABELS[lvl]}
      </Text>
    </View>
  );
};

// ─── Email verification screen ─────────────────────────────────────────────────
const VerifyEmailScreen: React.FC<{ email: string; onResend: () => void; onCheck: () => void; onBack: () => void }> = ({ email, onResend, onCheck, onBack }) => (
  <View style={ve.container}>
    <View style={ve.iconWrap}>
      <View style={ve.iconBg}>
        <Svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth={1.5}>
          <Rect x="2" y="4" width="20" height="16" rx="3" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="m2 7 10 7 10-7" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      </View>
    </View>
    <Text style={ve.title}>Vérifiez votre email</Text>
    <Text style={ve.subtitle}>Un email de confirmation a été envoyé à</Text>
    <Text style={ve.email}>{email}</Text>
    <Text style={ve.instruction}>
      Cliquez sur le lien dans l'email pour activer votre compte.{'\n'}
      Vérifiez vos spams si vous ne le trouvez pas.
    </Text>

    <View style={ve.steps}>
      {[
        { n: '1', t: 'Ouvrez votre boîte mail' },
        { n: '2', t: 'Cliquez sur le lien Vendoo' },
        { n: '3', t: 'Revenez ici et continuez' },
      ].map(({ n, t }) => (
        <View key={n} style={ve.stepRow}>
          <View style={ve.stepNum}><Text style={ve.stepNumTxt}>{n}</Text></View>
          <Text style={ve.stepTxt}>{t}</Text>
        </View>
      ))}
    </View>

    <TouchableOpacity style={ve.primaryBtn} onPress={onCheck} activeOpacity={0.85}>
      <Text style={ve.primaryBtnTxt}>J'ai confirmé mon email →</Text>
    </TouchableOpacity>
    <TouchableOpacity style={ve.secondaryBtn} onPress={onResend} activeOpacity={0.85}>
      <Text style={ve.secondaryBtnTxt}>Renvoyer l'email</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={onBack} style={{ marginTop: 16 }}>
      <Text style={{ fontSize: 13, color: C.muted, textAlign: 'center' }}>← Changer d'adresse email</Text>
    </TouchableOpacity>
  </View>
);

const ve = StyleSheet.create({
  container:     { alignItems: 'center', paddingHorizontal: 4, paddingVertical: 16 },
  iconWrap:      { marginBottom: 20 },
  iconBg:        { width: 88, height: 88, borderRadius: 28, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center' },
  title:         { fontSize: 24, fontWeight: '800', color: C.textDark, marginBottom: 8 },
  subtitle:      { fontSize: 14, color: C.textLight, marginBottom: 4 },
  email:         { fontSize: 15, fontWeight: '700', color: C.accent, marginBottom: 16 },
  instruction:   { fontSize: 13, color: C.muted, lineHeight: 20, textAlign: 'center', marginBottom: 24 },
  steps:         { width: '100%', gap: 12, marginBottom: 28 },
  stepRow:       { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.bg, borderRadius: 12, padding: 12 },
  stepNum:       { width: 28, height: 28, borderRadius: 14, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  stepNumTxt:    { color: C.white, fontSize: 13, fontWeight: '800' },
  stepTxt:       { fontSize: 13, color: C.textMid, fontWeight: '500', flex: 1 },
  primaryBtn:    { width: '100%', height: 52, borderRadius: 14, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 10, shadowColor: C.accent, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  primaryBtnTxt: { color: C.white, fontWeight: '800', fontSize: 15 },
  secondaryBtn:  { width: '100%', height: 48, borderRadius: 14, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  secondaryBtnTxt:{ color: C.textMid, fontWeight: '600', fontSize: 14 },
});

// ─── Main ──────────────────────────────────────────────────────────────────────
const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const isDesktop  = Dimensions.get('window').width >= 768;

  const [userType, setUserType]       = useState<UserType>('business');
  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPwd, setConfirmPwd]   = useState('');
  const [showPwd, setShowPwd]         = useState(false);
  const [showCPwd, setShowCPwd]       = useState(false);
  const [acceptCgu, setAcceptCgu]     = useState(false);
  const [loading, setLoading]         = useState(false);
  const [focused, setFocused]         = useState<string | null>(null);
  const [verifyStep, setVerifyStep]   = useState(false); // show verify email screen

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPwd) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs.'); return;
    }
    if (password !== confirmPwd) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.'); return;
    }
    if (password.length < 6) {
      Alert.alert('Mot de passe trop court', 'Minimum 6 caractères requis.'); return;
    }
    if (!acceptCgu) {
      Alert.alert('CGU requises', 'Veuillez accepter les conditions générales pour continuer.'); return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await sendEmailVerification(cred.user);
      setVerifyStep(true);
    } catch (err: any) {
      const msg = err?.code === 'auth/email-already-in-use'
        ? 'Cette adresse email est déjà utilisée.'
        : err?.code === 'auth/invalid-email'
        ? 'Adresse email invalide.'
        : 'Une erreur est survenue. Réessayez.';
      Alert.alert('Erreur', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerified = async () => {
    try {
      if (auth.currentUser) {
        await reload(auth.currentUser);
        if (auth.currentUser.emailVerified) {
          if (userType === 'business') {
            navigation.navigate('CreateBoutique');
          } else {
            navigation.navigate('BusinessDashboard');
          }
        } else {
          Alert.alert('Email non vérifié', 'Cliquez d\'abord sur le lien dans votre email, puis réessayez.');
        }
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de vérifier. Réessayez dans quelques secondes.');
    }
  };

  const handleResend = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        Alert.alert('Email renvoyé ✓', `Un nouvel email a été envoyé à ${email}`);
      }
    } catch {
      Alert.alert('Erreur', 'Trop de tentatives. Réessayez dans quelques minutes.');
    }
  };

  // ── Password field helper ─────────────────────────────────────────────────
  const PwdField = ({ field, val, setter, show, setShow, placeholder }: {
    field: string; val: string; setter: (v: string) => void;
    show: boolean; setShow: (v: boolean) => void; placeholder: string;
  }) => (
    <View style={[s.inputWrap, focused === field && s.inputWrapF]}>
      <TextInput
        style={s.inputInner}
        value={val}
        onChangeText={setter}
        placeholder={placeholder}
        placeholderTextColor={C.muted}
        secureTextEntry={!show}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        returnKeyType="done"
        onFocus={() => setFocused(field)}
        onBlur={() => setFocused(null)}
      />
      <TouchableOpacity onPress={() => setShow(!show)} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }} style={{ padding: 4 }}>
        <EyeIcon visible={show} />
      </TouchableOpacity>
    </View>
  );

  const perks = [
    '🏪 Boutique dans le quartier virtuel',
    '📊 Dashboard & analytics IA',
    '🛒 Caisse POS intégrée',
    '👥 Gestion clients & fidélité',
  ];

  // ── Form section ──────────────────────────────────────────────────────────
  const formSection = (
    <View style={s.formCard}>
      {verifyStep ? (
        <VerifyEmailScreen
          email={email}
          onResend={handleResend}
          onCheck={handleCheckVerified}
          onBack={() => setVerifyStep(false)}
        />
      ) : (
        <>
          <Text style={s.formTitle}>Créer un compte</Text>
          <Text style={s.formSub}>Rejoignez des milliers de marchands Vendoo.</Text>

          {/* Type switcher */}
          <View style={s.typeSwitcher}>
            {(['business', 'personal'] as UserType[]).map(t => (
              <TouchableOpacity key={t} style={[s.typeBtn, userType === t && s.typeBtnA]}
                onPress={() => setUserType(t)} activeOpacity={0.8}>
                <Text style={[s.typeBtnTxt, userType === t && s.typeBtnTxtA]}>
                  {t === 'business' ? '🏪 Marchand' : '👤 Visiteur'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Context */}
          <View style={[s.contextBox, { backgroundColor: userType === 'business' ? C.accentSoft : C.infoLight }]}>
            <Text style={[s.contextTxt, { color: userType === 'business' ? '#92400E' : '#1D4ED8' }]}>
              {userType === 'business'
                ? '✦ En tant que marchand, vous aurez votre boutique dans le quartier.'
                : '✦ En tant que visiteur, vous explorez les boutiques et passez commande.'}
            </Text>
          </View>

          {/* Fields */}
          <View style={s.fields}>
            <View style={s.fieldGroup}>
              <Text style={s.label}>{userType === 'business' ? 'Nom complet' : 'Pseudonyme'} *</Text>
              <TextInput
                style={[s.input, focused === 'name' && s.inputF]}
                value={name} onChangeText={setName}
                placeholder={userType === 'business' ? 'Jean Dupont' : 'Explorer42'}
                placeholderTextColor={C.muted}
                autoCapitalize="words" autoCorrect={false} spellCheck={false}
                returnKeyType="next" clearButtonMode="while-editing"
                onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
              />
            </View>

            <View style={s.fieldGroup}>
              <Text style={s.label}>Adresse email *</Text>
              <TextInput
                style={[s.input, focused === 'email' && s.inputF]}
                value={email} onChangeText={setEmail}
                placeholder="vous@exemple.com" placeholderTextColor={C.muted}
                keyboardType="email-address" autoCapitalize="none"
                autoCorrect={false} spellCheck={false}
                returnKeyType="next" clearButtonMode="while-editing"
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
              />
            </View>

            <View style={s.fieldGroup}>
              <Text style={s.label}>Mot de passe *</Text>
              <PwdField field="pwd" val={password} setter={setPassword}
                show={showPwd} setShow={setShowPwd} placeholder="Minimum 6 caractères" />
              <StrengthBar pwd={password} />
            </View>

            <View style={s.fieldGroup}>
              <Text style={s.label}>Confirmer le mot de passe *</Text>
              <PwdField field="cpwd" val={confirmPwd} setter={setConfirmPwd}
                show={showCPwd} setShow={setShowCPwd} placeholder="••••••••" />
              {confirmPwd.length > 0 && (
                <Text style={{ fontSize: 11, marginTop: 4, fontWeight: '600', color: confirmPwd === password ? C.success : C.error }}>
                  {confirmPwd === password ? '✓ Les mots de passe correspondent' : '✗ Les mots de passe ne correspondent pas'}
                </Text>
              )}
            </View>
          </View>

          {/* CGU Checkbox — OBLIGATOIRE */}
          <TouchableOpacity style={s.cguRow} onPress={() => setAcceptCgu(v => !v)} activeOpacity={0.8}>
            <CheckIcon on={acceptCgu} />
            <Text style={s.cguTxt}>
              J'accepte les <Text style={s.cguLink}>Conditions Générales d'Utilisation</Text> et la{' '}
              <Text style={s.cguLink}>Politique de Confidentialité</Text> de Vendoo.{' '}
              <Text style={s.cguRequired}>(Obligatoire)</Text>
            </Text>
          </TouchableOpacity>

          {/* Submit */}
          <TouchableOpacity style={[s.btn, !acceptCgu && s.btnDisabled]} onPress={handleRegister}
            disabled={loading || !acceptCgu} activeOpacity={0.87}>
            {loading
              ? <ActivityIndicator color={C.white} />
              : <Text style={s.btnTxt}>
                  {userType === 'business' ? '→ Créer ma boutique' : '→ Explorer le quartier'}
                </Text>
            }
          </TouchableOpacity>

          {/* Legal block */}
          <View style={s.legalBlock}>
            <View style={s.legalSep} />
            <Text style={s.legalTitle}>Mentions légales</Text>
            <Text style={s.legalTxt}>
              Vos données personnelles sont collectées par Vendoo SAS dans le cadre de la création de votre compte.
              Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression.
              Contact DPO : <Text style={s.legalLink}>dpo@vendoo.app</Text>
            </Text>
            <Text style={s.legalTxt}>
              Vendoo SAS — RCS Paris — SIRET 000 000 000 00000. Hébergement : UE.
            </Text>
            <View style={s.legalRow}>
              {['CGU', 'Confidentialité', 'Mentions légales', 'Cookies'].map((l, i) => (
                <React.Fragment key={l}>
                  {i > 0 && <Text style={s.legalDot}>·</Text>}
                  <TouchableOpacity><Text style={s.legalLink}>{l}</Text></TouchableOpacity>
                </React.Fragment>
              ))}
            </View>
          </View>

          <View style={s.dividerRow}>
            <View style={s.divLine} /><Text style={s.divTxt}>Déjà un compte ?</Text><View style={s.divLine} />
          </View>
          <TouchableOpacity style={s.loginBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={s.loginBtnTxt}>Se connecter</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  if (isDesktop) {
    return (
      <View style={s.desktopLayout}>
        <View style={s.brandPanel}>
          <View style={s.logoRow}>
            <View style={s.logoMark}><Text style={s.logoMarkTxt}>V</Text></View>
            <Text style={s.logoName}>Vendoo</Text>
          </View>
          <View style={s.brandBody}>
            <Text style={s.brandHeadline}>Ouvrez votre boutique{'\n'}en 3 minutes.</Text>
            <Text style={s.brandSub}>Rejoignez le quartier commerçant le plus actif.</Text>
            <View style={s.perkList}>
              {perks.map((p, i) => (
                <View key={i} style={s.perkRow}>
                  <View style={s.perkDot} /><Text style={s.perkTxt}>{p}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={s.brandFooter}>
            <Text style={s.brandFooterTxt}>✓ Gratuit pour commencer · Pas de carte requise</Text>
          </View>
        </View>
        <View style={s.formPanel}>
          <ScrollView contentContainerStyle={s.formPanelContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {formSection}
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.root}>
      <ScrollView contentContainerStyle={s.mobileContent} showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={s.mobileHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.textDark} strokeWidth={2}>
              <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </TouchableOpacity>
          <View style={s.logoRow}>
            <View style={s.logoMark}><Text style={s.logoMarkTxt}>V</Text></View>
            <Text style={[s.logoName, { color: C.textDark }]}>Vendoo</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>
        {formSection}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: C.bg },
  desktopLayout: { flex: 1, flexDirection: 'row' },

  brandPanel:     { width: 400, backgroundColor: C.accent, padding: 48, justifyContent: 'space-between' },
  logoRow:        { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoMark:       { width: 36, height: 36, borderRadius: 8, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  logoMarkTxt:    { color: C.white, fontSize: 18, fontWeight: '800' },
  logoName:       { fontSize: 20, fontWeight: '700', color: C.white, letterSpacing: 0.3 },
  brandBody:      { flex: 1, paddingTop: 48 },
  brandHeadline:  { fontSize: 32, fontWeight: '900', color: C.white, lineHeight: 42, marginBottom: 16 },
  brandSub:       { fontSize: 15, color: '#9CA3AF', lineHeight: 24, marginBottom: 32 },
  perkList:       { gap: 14 },
  perkRow:        { flexDirection: 'row', alignItems: 'center', gap: 12 },
  perkDot:        { width: 6, height: 6, borderRadius: 3, backgroundColor: C.accent },
  perkTxt:        { fontSize: 14, color: '#D1D5DB', fontWeight: '500' },
  brandFooter:    { borderTopWidth: 1, borderTopColor: '#FFE0D0', paddingTop: 20 },
  brandFooterTxt: { fontSize: 13, color: '#6B7280' },

  formPanel:        { flex: 1, backgroundColor: C.surface },
  formPanelContent: { padding: 48, justifyContent: 'center', flexGrow: 1 },

  mobileHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
  mobileContent: { padding: 20, paddingBottom: 40 },
  backBtn:       { width: 36, height: 36, borderRadius: 9, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },

  formCard:      { maxWidth: 440, width: '100%' },
  formTitle:     { fontSize: 26, fontWeight: '800', color: C.textDark, marginBottom: 6 },
  formSub:       { fontSize: 14, color: C.textLight, marginBottom: 22 },

  typeSwitcher:  { flexDirection: 'row', backgroundColor: C.bg, borderRadius: 12, padding: 4, marginBottom: 16 },
  typeBtn:       { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  typeBtnA:      { backgroundColor: C.white, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
  typeBtnTxt:    { fontSize: 14, color: C.muted, fontWeight: '500' },
  typeBtnTxtA:   { color: C.textDark, fontWeight: '700' },

  contextBox:    { borderRadius: 10, padding: 12, marginBottom: 20 },
  contextTxt:    { fontSize: 13, fontWeight: '500', lineHeight: 19 },

  fields:        { gap: 16, marginBottom: 18 },
  fieldGroup:    { gap: 6 },
  label:         { fontSize: 13, fontWeight: '600', color: C.textMid },
  input:         { height: 48, borderWidth: 1.5, borderColor: C.border, borderRadius: 10, paddingHorizontal: 14, fontSize: 16, color: C.textDark, backgroundColor: C.bg },
  inputF:        { borderColor: C.borderFocus, backgroundColor: C.white },
  inputWrap:     { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: C.border, borderRadius: 10, backgroundColor: C.bg, paddingRight: 12 },
  inputWrapF:    { borderColor: C.borderFocus, backgroundColor: C.white },
  inputInner:    { flex: 1, height: 48, paddingHorizontal: 14, fontSize: 16, color: C.textDark },

  // CGU
  cguRow:        { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 18, padding: 12, backgroundColor: C.bg, borderRadius: 10, borderWidth: 1, borderColor: C.border },
  cguTxt:        { flex: 1, fontSize: 12, color: C.textMid, lineHeight: 18 },
  cguLink:       { color: C.accent, fontWeight: '600' },
  cguRequired:   { color: C.error, fontWeight: '700' },

  btn:           { backgroundColor: C.accent, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: C.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 10 },
  btnDisabled:   { backgroundColor: C.muted, shadowOpacity: 0 },
  btnTxt:        { color: C.white, fontSize: 15, fontWeight: '800', letterSpacing: 0.2 },

  // Legal
  legalBlock:    { marginTop: 4, marginBottom: 20 },
  legalSep:      { height: 1, backgroundColor: C.border, marginBottom: 14 },
  legalTitle:    { fontSize: 10, fontWeight: '800', color: C.textLight, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  legalTxt:      { fontSize: 11, color: C.muted, lineHeight: 16, marginBottom: 6 },
  legalRow:      { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  legalLink:     { fontSize: 11, color: C.accent, fontWeight: '600' },
  legalDot:      { fontSize: 11, color: C.muted },

  dividerRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  divLine:       { flex: 1, height: 1, backgroundColor: C.border },
  divTxt:        { fontSize: 12, color: C.muted },

  loginBtn:      { height: 48, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  loginBtnTxt:   { fontSize: 14, fontWeight: '600', color: C.textMid },
});

export default RegisterScreen;
