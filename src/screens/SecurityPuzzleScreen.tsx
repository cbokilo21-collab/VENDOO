import React, { useState } from 'react';
import {
  View, StyleSheet, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

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

interface Puzzle {
  question: string;
  answer: string;
  hint?: string;
}

const PUZZLES: Puzzle[] = [
  {
    question: "Quel est le carré de 7?",
    answer: "49",
    hint: "7 × 7 = ?",
  },
  {
    question: "Combien font 15 + 27?",
    answer: "42",
    hint: "Additionnez les deux nombres",
  },
  {
    question: "Quel est le résultat de 100 - 37?",
    answer: "63",
    hint: "Soustraction simple",
  },
  {
    question: "Combien de jours dans une année bissextile?",
    answer: "366",
    hint: "Une année normale a 365 jours",
  },
  {
    question: "Quel est le cube de 3?",
    answer: "27",
    hint: "3 × 3 × 3 = ?",
  },
  {
    question: "Combien font 8 × 9?",
    answer: "72",
    hint: "Table de multiplication",
  },
  {
    question: "Quel est le reste de 17 ÷ 5?",
    answer: "2",
    hint: "Division avec reste",
  },
  {
    question: "Combien de secondes dans une minute?",
    answer: "60",
    hint: "Temps standard",
  },
  {
    question: "Quel est le carré de 12?",
    answer: "144",
    hint: "12 × 12 = ?",
  },
  {
    question: "Combien font 144 ÷ 12?",
    answer: "12",
    hint: "Division inverse du carré",
  },
];

const SecurityPuzzleScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle>(PUZZLES[Math.floor(Math.random() * PUZZLES.length)]);
  const [answer, setAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(false);
  const [solved, setSolved] = useState(false);

  const handleCheckAnswer = () => {
    if (answer.trim().toLowerCase() === currentPuzzle.answer.toLowerCase()) {
      setSolved(true);
      Alert.alert('Succès', 'Puzzle résolu! Vous pouvez maintenant continuer.', [
        { text: 'Continuer', onPress: () => navigation.goBack() }
      ]);
    } else {
      setAttempts(prev => prev + 1);
      if (attempts >= 2) {
        setShowHint(true);
      }
      Alert.alert('Incorrect', 'Réponse incorrecte. Essayez encore.');
      setAnswer('');
    }
  };

  const handleNewPuzzle = () => {
    const newPuzzle = PUZZLES[Math.floor(Math.random() * PUZZLES.length)];
    setCurrentPuzzle(newPuzzle);
    setAnswer('');
    setAttempts(0);
    setShowHint(false);
    setSolved(false);
  };

  return (
    <View style={s.root}>
      <View style={s.container}>
        <View style={s.iconContainer}>
          <Text style={s.icon}>🔐</Text>
        </View>
        
        <Text style={s.title}>Sécurité Anti-Piratage</Text>
        <Text style={s.subtitle}>
          Résolvez cette énigme pour prouver que vous n'êtes pas un robot
        </Text>

        <View style={s.puzzleCard}>
          <View style={s.puzzleHeader}>
            <Text style={s.puzzleNumber}>Énigme #{attempts + 1}</Text>
            <Text style={s.attemptsText}>Tentatives: {attempts}/3</Text>
          </View>
          
          <Text style={s.question}>{currentPuzzle.question}</Text>
          
          <TextInput
            style={s.input}
            value={answer}
            onChangeText={setAnswer}
            placeholder="Votre réponse"
            keyboardType="numeric"
            autoFocus
          />

          {showHint && (
            <View style={s.hintBox}>
              <Text style={s.hintIcon}>💡</Text>
              <Text style={s.hintText}>{currentPuzzle.hint}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[s.button, solved && s.buttonSolved]}
            onPress={handleCheckAnswer}
            disabled={solved || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={C.white} />
            ) : (
              <Text style={s.buttonText}>{solved ? 'Résolu ✓' : 'Vérifier'}</Text>
            )}
          </TouchableOpacity>

          {attempts >= 2 && !solved && (
            <TouchableOpacity
              style={s.secondaryButton}
              onPress={handleNewPuzzle}
            >
              <Text style={s.secondaryButtonText}>Changer d'énigme</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={s.infoBox}>
          <Text style={s.infoTitle}>🛡️ Pourquoi cette étape?</Text>
          <Text style={s.infoText}>
            Cette mesure de sécurité protège votre compte contre les tentatives de piratage automatisées.
          </Text>
        </View>

        <TouchableOpacity
          style={s.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={s.cancelButtonText}>Annuler</Text>
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
    marginBottom: 32,
  },
  puzzleCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: C.border,
    shadowColor: C.textDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  puzzleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  puzzleNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: C.navy,
  },
  attemptsText: {
    fontSize: 13,
    color: C.textMid,
  },
  question: {
    fontSize: 20,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: C.bg,
    borderWidth: 2,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: C.textDark,
    marginBottom: 16,
    textAlign: 'center',
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  hintIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  hintText: {
    fontSize: 13,
    color: '#92400E',
    flex: 1,
  },
  button: {
    backgroundColor: C.navy,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonSolved: {
    backgroundColor: C.success,
  },
  buttonText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: C.navy,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: C.textMid,
    lineHeight: 18,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: C.textLight,
    fontWeight: '600',
  },
});

export default SecurityPuzzleScreen;
