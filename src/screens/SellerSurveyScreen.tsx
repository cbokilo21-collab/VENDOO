import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SurveyService, SellerSurvey, SurveyQuestion, SurveyResponse } from '../services/surveyService';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { T } from '../theme';

const SellerSurveyScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const { storeId, storeName } = (route.params as { storeId?: string; storeName?: string }) || {};
  
  if (!storeId) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, color: '#374151' }}>Store ID non fourni</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20, padding: 12, backgroundColor: '#FF6B35', borderRadius: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const [surveyType, setSurveyType] = useState<'quality' | 'service' | 'pricing' | 'overall'>('overall');
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [responses, setResponses] = useState<Record<string, SurveyResponse>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [overallScore, setOverallScore] = useState(0);

  useEffect(() => {
    loadQuestions();
  }, [surveyType]);

  const loadQuestions = () => {
    const surveyQuestions = SurveyService.getSurveyQuestions(surveyType);
    setQuestions(surveyQuestions);
    setResponses({});
  };

  const handleRatingChange = (questionId: string, rating: number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: { questionId, answer: rating },
    }));
  };

  const handleTextChange = (questionId: string, text: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: { questionId, answer: text },
    }));
  };

  const handleChoiceChange = (questionId: string, choice: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: { questionId, answer: choice },
    }));
  };

  const handleMultipleChoiceChange = (questionId: string, option: string) => {
    setResponses(prev => {
      const current = prev[questionId]?.answer as string[] || [];
      const updated = current.includes(option)
        ? current.filter(o => o !== option)
        : [...current, option];
      return {
        ...prev,
        [questionId]: { questionId, answer: updated },
      };
    });
  };

  const handleSubmit = async () => {
    // Vérifier que toutes les questions requises sont répondues
    const requiredQuestions = questions.filter(q => q.required);
    const allRequiredAnswered = requiredQuestions.every(q => responses[q.id]);

    if (!allRequiredAnswered) {
      alert('Veuillez répondre à toutes les questions requises');
      return;
    }

    setSubmitting(true);
    try {
      const responseArray = Object.values(responses);
      const score = SurveyService.calculateOverallScore(responseArray);
      const analysis = SurveyService.generateAIAnalysis(responseArray, storeName || 'Boutique');
      const recommendations = SurveyService.generateAIRecommendations(responseArray, score);

      // Créer l'enquête
      await SurveyService.createSurvey({
        userId: user!.uid,
        storeId,
        storeName: storeName || 'Boutique',
        surveyType,
        responses: responseArray,
        overallScore: score,
        aiAnalysis: analysis,
        aiRecommendations: recommendations,
        completed: true,
      });

      setOverallScore(score);
      setAiAnalysis(analysis);
      setAiRecommendations(recommendations);
      setSurveyCompleted(true);
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: SurveyQuestion) => {
    const response = responses[question.id];

    switch (question.type) {
      case 'rating':
        return (
          <View style={s.ratingContainer}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity
                key={star}
                onPress={() => handleRatingChange(question.id, star)}
                activeOpacity={0.7}
              >
                <Text style={[s.star, (response?.answer as number) >= star && s.starActive]}>
                  {star <= (response?.answer as number) ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'text':
        return (
          <TextInput
            style={s.textInput}
            placeholder="Votre réponse..."
            placeholderTextColor={T.textSub}
            value={response?.answer as string || ''}
            onChangeText={(text) => handleTextChange(question.id, text)}
            multiline
          />
        );

      case 'choice':
        return (
          <View style={s.choiceContainer}>
            {question.options?.map(option => (
              <TouchableOpacity
                key={option}
                style={[s.choiceOption, response?.answer === option && s.choiceOptionActive]}
                onPress={() => handleChoiceChange(question.id, option)}
                activeOpacity={0.7}
              >
                <Text style={[s.choiceText, response?.answer === option && s.choiceTextActive]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'multiple':
        return (
          <View style={s.choiceContainer}>
            {question.options?.map(option => {
              const selected = (response?.answer as string[] || []).includes(option);
              return (
                <TouchableOpacity
                  key={option}
                  style={[s.choiceOption, selected && s.choiceOptionActive]}
                  onPress={() => handleMultipleChoiceChange(question.id, option)}
                  activeOpacity={0.7}
                >
                  <Text style={[s.choiceText, selected && s.choiceTextActive]}>
                    {selected ? '✓ ' : ''}{option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );

      default:
        return null;
    }
  };

  if (surveyCompleted) {
    return (
      <View style={s.root}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Enquête terminée</Text>
        </View>

        <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
          <View style={s.resultCard}>
            <Text style={s.resultTitle}>Analyse IA</Text>
            <View style={s.scoreContainer}>
              <Text style={s.scoreValue}>{Math.round(overallScore)}/100</Text>
              <Text style={s.scoreLabel}>Score global</Text>
            </View>
            <Text style={s.analysisText}>{aiAnalysis}</Text>
          </View>

          <View style={s.section}>
            <Text style={s.sectionTitle}>Recommandations</Text>
            {aiRecommendations.map((rec, index) => (
              <View key={index} style={s.recommendationItem}>
                <Text style={s.recommendationText}>• {rec}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={s.finishBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={s.finishBtnText}>Terminer</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Enquête IA</Text>
        <Text style={s.headerSub}>{storeName}</Text>
      </View>

      {/* Survey Type Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.typeSelector}>
        {[
          { key: 'overall', label: 'Global' },
          { key: 'quality', label: 'Qualité' },
          { key: 'service', label: 'Service' },
          { key: 'pricing', label: 'Prix' },
        ].map(type => (
          <TouchableOpacity
            key={type.key}
            style={[s.typeChip, surveyType === type.key && s.typeChipActive]}
            onPress={() => setSurveyType(type.key as any)}
            activeOpacity={0.7}
          >
            <Text style={[s.typeChipText, surveyType === type.key && s.typeChipTextActive]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        {questions.map(question => (
          <View key={question.id} style={s.questionCard}>
            <Text style={s.questionText}>
              {question.question}
              {question.required && <Text style={s.requiredMark}> *</Text>}
            </Text>
            {renderQuestion(question)}
          </View>
        ))}

        <TouchableOpacity
          style={[s.submitBtn, submitting && s.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.7}
        >
          {submitting ? (
            <ActivityIndicator color={T.white} />
          ) : (
            <Text style={s.submitBtnText}>Soumettre l'enquête</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.page },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: 24, paddingBottom: 16,
    backgroundColor: T.surface, borderBottomWidth: 1, borderBottomColor: T.border,
  },
  backBtn: { marginRight: 16 },
  backBtnText: { fontSize: 24, fontWeight: '800', color: T.text },
  headerTitle: { fontSize: 20, fontWeight: '800', color: T.text, flex: 1 },
  headerSub: { fontSize: 14, color: T.textSub },
  
  typeSelector: {
    paddingHorizontal: 24, paddingVertical: 12, backgroundColor: T.surface,
    borderBottomWidth: 1, borderBottomColor: T.border,
  },
  typeChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: T.border, marginRight: 8,
  },
  typeChipActive: { backgroundColor: T.orange, borderColor: T.orange },
  typeChipText: { fontSize: 13, color: T.textSub, fontWeight: '600' },
  typeChipTextActive: { color: T.white },
  
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  
  questionCard: {
    backgroundColor: T.surface, borderRadius: 16, padding: 20,
    marginBottom: 16, borderWidth: 1, borderColor: T.border,
  },
  questionText: { fontSize: 15, fontWeight: '600', color: T.text, marginBottom: 16 },
  requiredMark: { color: T.orange },
  
  ratingContainer: { flexDirection: 'row', gap: 8 },
  star: { fontSize: 32, color: T.border },
  starActive: { color: T.orange },
  
  textInput: {
    backgroundColor: T.page, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: T.border, fontSize: 14, color: T.text,
    minHeight: 80, textAlignVertical: 'top',
  },
  
  choiceContainer: { gap: 8 },
  choiceOption: {
    backgroundColor: T.page, borderRadius: 12, padding: 16,
    borderWidth: 1.5, borderColor: T.border,
  },
  choiceOptionActive: { backgroundColor: T.orangeSoft, borderColor: T.orange },
  choiceText: { fontSize: 14, color: T.text },
  choiceTextActive: { color: T.orange, fontWeight: '600' },
  
  submitBtn: {
    backgroundColor: T.orange, borderRadius: 12, padding: 16,
    alignItems: 'center', marginBottom: 24,
  },
  submitBtnDisabled: { backgroundColor: T.muted },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: T.white },
  
  resultCard: {
    backgroundColor: T.surface, borderRadius: 16, padding: 24,
    marginBottom: 24, borderWidth: 1, borderColor: T.border,
  },
  resultTitle: { fontSize: 20, fontWeight: '800', color: T.text, marginBottom: 16 },
  scoreContainer: {
    alignItems: 'center', padding: 20, backgroundColor: T.orangeSoft,
    borderRadius: 12, marginBottom: 16,
  },
  scoreValue: { fontSize: 36, fontWeight: '800', color: T.orange, marginBottom: 4 },
  scoreLabel: { fontSize: 14, color: T.textSub },
  analysisText: { fontSize: 14, color: T.text, lineHeight: 22 },
  
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: T.text, marginBottom: 16 },
  recommendationItem: { marginBottom: 8 },
  recommendationText: { fontSize: 14, color: T.text, lineHeight: 20 },
  
  finishBtn: {
    backgroundColor: T.orange, borderRadius: 12, padding: 16,
    alignItems: 'center', marginBottom: 24,
  },
  finishBtnText: { fontSize: 16, fontWeight: '700', color: T.white },
});

export default SellerSurveyScreen;
