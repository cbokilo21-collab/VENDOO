import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, Text, TouchableOpacity, Alert, ActivityIndicator
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
  warning: '#F59E0B',
};

const EmailVerificationScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user, sendEmailVerification } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(48 * 60 * 60); // 48 hours in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const handleResendEmail = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await sendEmailVerification();
      setResent(true);
      Alert.alert('Succès', 'Email de vérification envoyé!');
      
      // Log the resend
      await FirestoreService.create('emailVerificationLogs', {
        userId: user.uid,
        email: user.email,
        sentAt: new Date(),
        type: 'resend',
      });
    } catch (error) {
      console.error('Error resending verification:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer l\'email de vérification');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await user.reload();
      if (user.emailVerified) {
        Alert.alert('Succès', 'Votre email est maintenant vérifié!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Non vérifié', 'Votre email n\'est pas encore vérifié. Veuillez vérifier votre boîte mail.');
      }
    } catch (error) {
      console.error('Error checking verification:', error);
      Alert.alert('Erreur', 'Impossible de vérifier le statut');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.root}>
      <View style={s.container}>
        <View style={s.iconContainer}>
          <Text style={s.icon}>📧</Text>
        </View>
        
        <Text style={s.title}>Vérifiez votre email</Text>
        <Text style={s.subtitle}>
          Nous avons envoyé un email de vérification à {user?.email}
        </Text>
        
        <View style={s.warningBox}>
          <Text style={s.warningIcon}>⚠️</Text>
          <View style={s.warningContent}>
            <Text style={s.warningTitle}>Important</Text>
            <Text style={s.warningText}>
              Vous avez {formatTime(timeLeft)} pour valider votre compte. 
              Après ce délai, votre compte sera désactivé.
            </Text>
          </View>
        </View>

        <View style={s.stepsContainer}>
          <Text style={s.stepsTitle}>Étapes à suivre:</Text>
          <View style={s.step}>
            <Text style={s.stepNumber}>1</Text>
            <Text style={s.stepText}>Ouvrez votre boîte mail</Text>
          </View>
          <View style={s.step}>
            <Text style={s.stepNumber}>2</Text>
            <Text style={s.stepText}>Trouvez l'email de Vendoo</Text>
          </View>
          <View style={s.step}>
            <Text style={s.stepNumber}>3</Text>
            <Text style={s.stepText}>Cliquez sur le lien de vérification</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[s.button, s.primaryButton]}
          onPress={handleCheckVerification}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={C.white} />
          ) : (
            <Text style={s.buttonText}>J'ai vérifié mon email</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.button, s.secondaryButton]}
          onPress={handleResendEmail}
          disabled={loading || resent}
        >
          {loading ? (
            <ActivityIndicator size="small" color={C.navy} />
          ) : (
            <Text style={[s.buttonText, s.secondaryButtonText]}>
              {resent ? 'Email envoyé ✓' : 'Renvoyer l\'email'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={s.skipButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={s.skipButtonText}>Plus tard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: C.textDark,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: C.textMid,
    textAlign: 'center',
    marginBottom: 24,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  stepsContainer: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: C.border,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.navy,
    color: C.white,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
    marginRight: 12,
  },
  stepText: {
    fontSize: 14,
    color: C.textMid,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: C.navy,
  },
  secondaryButton: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.navy,
  },
  buttonText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: C.navy,
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    color: C.textLight,
    fontWeight: '600',
  },
});

export default EmailVerificationScreen;
