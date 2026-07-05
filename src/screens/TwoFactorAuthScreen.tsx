import React, { useState } from 'react';
import {
  View, StyleSheet, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, Switch, ScrollView
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';

type Nav = NavigationProp<any>;

const C = {
  navy: '#FF6B35',
  bg: '#FFF7F3',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  textDark: '#111827',
  textMid: '#374151',
  textLight: '#6B7280',
  muted: '#9CA3AF',
  white: '#FFFFFF',
  success: '#10B981',
  error: '#EF4444',
};

const TwoFactorAuthScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  const handleToggle2FA = async () => {
    if (!user) return;

    if (!twoFactorEnabled) {
      // Enable 2FA
      if (!phoneNumber || phoneNumber.length < 10) {
        Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide');
        return;
      }
      setLoading(true);
      try {
        // Simulate sending verification code
        setCodeSent(true);
        Alert.alert('Code envoyé', `Un code de vérification a été envoyé au ${phoneNumber}`);
      } catch (error) {
        console.error('Error enabling 2FA:', error);
        Alert.alert('Erreur', 'Impossible d\'activer la 2FA');
      } finally {
        setLoading(false);
      }
    } else {
      // Disable 2FA
      setLoading(true);
      try {
        await FirestoreService.update('users', user.uid, {
          twoFactorEnabled: false,
          phoneNumber: null,
        });
        setTwoFactorEnabled(false);
        setPhoneNumber('');
        setRecoveryCodes([]);
        Alert.alert('Succès', '2FA désactivée');
      } catch (error) {
        console.error('Error disabling 2FA:', error);
        Alert.alert('Erreur', 'Impossible de désactiver la 2FA');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerifyCode = async () => {
    if (!user || !verificationCode || verificationCode.length < 6) {
      Alert.alert('Erreur', 'Code de vérification invalide');
      return;
    }

    setLoading(true);
    try {
      // Simulate verification
      const newRecoveryCodes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );

      await FirestoreService.update('users', user.uid, {
        twoFactorEnabled: true,
        phoneNumber: phoneNumber,
        recoveryCodes: newRecoveryCodes,
      });

      setTwoFactorEnabled(true);
      setRecoveryCodes(newRecoveryCodes);
      setCodeSent(false);
      setVerificationCode('');
      
      Alert.alert('Succès', '2FA activée avec succès! Sauvegardez vos codes de récupération.');
    } catch (error) {
      console.error('Error verifying code:', error);
      Alert.alert('Erreur', 'Code de vérification invalide');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNewCodes = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const newRecoveryCodes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );

      await FirestoreService.update('users', user.uid, {
        recoveryCodes: newRecoveryCodes,
      });

      setRecoveryCodes(newRecoveryCodes);
      Alert.alert('Succès', 'Nouveaux codes de récupération générés');
    } catch (error) {
      console.error('Error generating codes:', error);
      Alert.alert('Erreur', 'Impossible de générer de nouveaux codes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Double Authentification</Text>
      </View>

      <ScrollView style={s.content}>
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>Activer la 2FA</Text>
            <Switch
              value={twoFactorEnabled}
              onValueChange={handleToggle2FA}
              disabled={loading}
              trackColor={{ false: C.border, true: C.navy }}
            />
          </View>
          <Text style={s.cardDescription}>
            Protégez votre compte avec une double authentification pour une sécurité maximale.
          </Text>
        </View>

        {!twoFactorEnabled && !codeSent && (
          <View style={s.card}>
            <Text style={s.sectionTitle}>Numéro de téléphone</Text>
            <TextInput
              style={s.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="+242 000 000 000"
              keyboardType="phone-pad"
            />
            <Text style={s.helperText}>
              Nous enverrons un code de vérification à ce numéro
            </Text>
          </View>
        )}

        {codeSent && !twoFactorEnabled && (
          <View style={s.card}>
            <Text style={s.sectionTitle}>Code de vérification</Text>
            <TextInput
              style={s.input}
              value={verificationCode}
              onChangeText={setVerificationCode}
              placeholder="123456"
              keyboardType="numeric"
              maxLength={6}
            />
            <TouchableOpacity
              style={s.button}
              onPress={handleVerifyCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={C.white} />
              ) : (
                <Text style={s.buttonText}>Vérifier</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {twoFactorEnabled && recoveryCodes.length > 0 && (
          <View style={s.card}>
            <Text style={s.sectionTitle}>Codes de récupération</Text>
            <Text style={s.warningText}>
              ⚠️ Sauvegardez ces codes dans un endroit sûr. Chaque code ne peut être utilisé qu'une seule fois.
            </Text>
            <View style={s.codesContainer}>
              {recoveryCodes.map((code, index) => (
                <View key={index} style={s.codeItem}>
                  <Text style={s.codeNumber}>{index + 1}.</Text>
                  <Text style={s.code}>{code}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={[s.button, s.secondaryButton]}
              onPress={handleGenerateNewCodes}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={C.navy} />
              ) : (
                <Text style={[s.buttonText, s.secondaryButtonText]}>Générer de nouveaux codes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={s.infoBox}>
          <Text style={s.infoTitle}>🔐 Comment ça marche?</Text>
          <Text style={s.infoText}>
            1. Activez la 2FA avec votre numéro de téléphone
          </Text>
          <Text style={s.infoText}>
            2. Recevez un code par SMS à chaque connexion
          </Text>
          <Text style={s.infoText}>
            3. Utilisez vos codes de récupération si vous n'avez pas accès à votre téléphone
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  backBtnText: {
    fontSize: 20,
    color: C.navy,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.textDark,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textDark,
  },
  cardDescription: {
    fontSize: 13,
    color: C.textMid,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 12,
  },
  input: {
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: C.textDark,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: C.textLight,
  },
  button: {
    backgroundColor: C.navy,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButton: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.navy,
  },
  buttonText: {
    color: C.white,
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: C.navy,
  },
  warningText: {
    fontSize: 12,
    color: '#92400E',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    lineHeight: 16,
  },
  codesContainer: {
    backgroundColor: C.bg,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  codeItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  codeNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textMid,
    marginRight: 12,
    width: 24,
  },
  code: {
    fontSize: 14,
    fontWeight: '700',
    color: C.textDark,
    letterSpacing: 2,
  },
  infoBox: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    color: C.textMid,
    marginBottom: 8,
    lineHeight: 18,
  },
});

export default TwoFactorAuthScreen;
