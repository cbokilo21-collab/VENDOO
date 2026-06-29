import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Modal } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ReviewService, Review } from '../services/reviewService';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { T } from '../theme';

const ReviewsScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const { storeId, storeName } = route.params as { storeId?: string; storeName?: string };
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddReview, setShowAddReview] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: '',
    pros: [] as string[],
    cons: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [user, storeId]);

  const loadReviews = async () => {
    try {
      let userReviews;
      if (storeId) {
        // Si storeId est fourni, charger les avis de cette boutique
        userReviews = await ReviewService.getStoreReviews(storeId);
      } else {
        // Sinon charger les avis de l'utilisateur
        userReviews = await ReviewService.getUserReviews(user!.uid);
      }
      setReviews(userReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderStars = (rating: number) => {
    return (
      <View style={s.stars}>
        {[1, 2, 3, 4, 5].map(star => (
          <Text key={star} style={[s.star, star <= rating && s.starActive]}>
            {star <= rating ? '★' : '☆'}
          </Text>
        ))}
      </View>
    );
  };

  const handleSubmitReview = async () => {
    if (!newReview.title || !newReview.comment) {
      alert('Veuillez remplir le titre et le commentaire');
      return;
    }

    setSubmitting(true);
    try {
      await ReviewService.createReview({
        userId: user!.uid,
        storeId: storeId || 'default',
        storeName: storeName || 'Boutique',
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment,
        pros: newReview.pros,
        cons: newReview.cons,
        verified: false,
      });

      // Recharger les avis
      await loadReviews();
      setShowAddReview(false);
      setNewReview({ rating: 5, title: '', comment: '', pros: [], cons: [] });
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    await ReviewService.markAsHelpful(reviewId);
    setReviews(prev => 
      prev.map(r => r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r)
    );
  };

  const handleDeleteReview = async (reviewId: string) => {
    await ReviewService.deleteReview(reviewId);
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  if (loading) {
    return (
      <View style={s.root}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Avis</Text>
          <Text style={s.headerSub}>{storeName || 'Mes avis'}</Text>
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Avis</Text>
        <Text style={s.headerSub}>{storeName || 'Mes avis'}</Text>
        {!storeId && (
          <TouchableOpacity 
            style={s.addReviewBtn}
            onPress={() => setShowAddReview(true)}
          >
            <Text style={s.addReviewBtnText}>+ Avis</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        {reviews.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>⭐</Text>
            <Text style={s.emptyTitle}>Aucun avis</Text>
            <Text style={s.emptySub}>Soyez le premier à donner votre avis</Text>
          </View>
        ) : (
          reviews.map(review => (
            <View key={review.id} style={s.reviewCard}>
              <View style={s.reviewHeader}>
                <View style={s.reviewRating}>
                  {renderStars(review.rating)}
                </View>
                <Text style={s.reviewDate}>{formatDate(review.createdAt)}</Text>
              </View>
              <Text style={s.reviewTitle}>{review.title}</Text>
              <Text style={s.reviewComment}>{review.comment}</Text>
              
              {review.verified && (
                <View style={s.verifiedBadge}>
                  <Text style={s.verifiedText}>✓ Achat vérifié</Text>
                </View>
              )}

              {(review.pros && review.pros.length > 0) && (
                <View style={s.prosCons}>
                  <Text style={s.prosConsLabel}>Points positifs:</Text>
                  {review.pros.map((pro, i) => (
                    <Text key={i} style={s.prosConsItem}>• {pro}</Text>
                  ))}
                </View>
              )}

              {(review.cons && review.cons.length > 0) && (
                <View style={s.prosCons}>
                  <Text style={s.prosConsLabel}>Points à améliorer:</Text>
                  {review.cons.map((con, i) => (
                    <Text key={i} style={s.prosConsItem}>• {con}</Text>
                  ))}
                </View>
              )}

              <View style={s.reviewActions}>
                <TouchableOpacity
                  style={s.helpfulBtn}
                  onPress={() => handleMarkHelpful(review.id!)}
                >
                  <Text style={s.helpfulText}>👍 Utile ({review.helpfulCount})</Text>
                </TouchableOpacity>
                {!storeId && (
                  <TouchableOpacity
                    style={s.deleteReviewBtn}
                    onPress={() => handleDeleteReview(review.id!)}
                  >
                    <Text style={s.deleteReviewText}>Supprimer</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Review Modal */}
      <Modal
        visible={showAddReview}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddReview(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Nouvel avis</Text>
              <TouchableOpacity onPress={() => setShowAddReview(false)}>
                <Text style={s.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={s.modalBody}>
              <Text style={s.modalLabel}>Note</Text>
              <View style={s.ratingSelector}>
                {[1, 2, 3, 4, 5].map(star => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setNewReview({ ...newReview, rating: star })}
                  >
                    <Text style={[s.ratingStar, star <= newReview.rating && s.ratingStarActive]}>
                      {star <= newReview.rating ? '★' : '☆'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.modalLabel}>Titre</Text>
              <TextInput
                style={s.modalInput}
                placeholder="Titre de votre avis"
                value={newReview.title}
                onChangeText={(text) => setNewReview({ ...newReview, title: text })}
              />

              <Text style={s.modalLabel}>Commentaire</Text>
              <TextInput
                style={[s.modalInput, s.modalInputMultiline]}
                placeholder="Décrivez votre expérience..."
                value={newReview.comment}
                onChangeText={(text) => setNewReview({ ...newReview, comment: text })}
                multiline
              />
            </ScrollView>

            <TouchableOpacity
              style={[s.modalSubmit, submitting && s.modalSubmitDisabled]}
              onPress={handleSubmitReview}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={T.white} />
              ) : (
                <Text style={s.modalSubmitText}>Publier l'avis</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  addReviewBtn: {
    backgroundColor: T.orange, paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 8,
  },
  addReviewBtnText: { fontSize: 14, fontWeight: '700', color: T.white },
  
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  emptyState: { padding: 60, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: T.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: T.textSub },
  
  reviewCard: {
    backgroundColor: T.surface, borderRadius: 16, padding: 20,
    marginBottom: 16, borderWidth: 1, borderColor: T.border,
  },
  reviewHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12,
  },
  reviewRating: { flexDirection: 'row' },
  stars: { flexDirection: 'row' },
  star: { fontSize: 20, color: T.border },
  starActive: { color: T.orange },
  reviewDate: { fontSize: 12, color: T.textSub },
  reviewTitle: { fontSize: 16, fontWeight: '700', color: T.text, marginBottom: 8 },
  reviewComment: { fontSize: 14, color: T.textMid, lineHeight: 20, marginBottom: 12 },
  
  verifiedBadge: {
    backgroundColor: T.success + '20', paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 8, alignSelf: 'flex-start', marginBottom: 12,
  },
  verifiedText: { fontSize: 12, fontWeight: '600', color: T.success },
  
  prosCons: { marginBottom: 12 },
  prosConsLabel: { fontSize: 13, fontWeight: '600', color: T.text, marginBottom: 4 },
  prosConsItem: { fontSize: 13, color: T.textMid, marginLeft: 8 },
  
  reviewActions: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: T.divider,
  },
  helpfulBtn: {},
  helpfulText: { fontSize: 13, color: T.textSub },
  deleteReviewBtn: {},
  deleteReviewText: { fontSize: 13, color: T.error },
  
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: T.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: T.text },
  modalClose: { fontSize: 24, color: T.textSub },
  modalBody: { flex: 1, marginBottom: 20 },
  modalLabel: { fontSize: 14, fontWeight: '600', color: T.text, marginBottom: 8 },
  ratingSelector: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  ratingStar: { fontSize: 32, color: T.border },
  ratingStarActive: { color: T.orange },
  modalInput: {
    backgroundColor: T.page, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: T.border, fontSize: 14, color: T.text,
    marginBottom: 16,
  },
  modalInputMultiline: { minHeight: 100, textAlignVertical: 'top' },
  modalSubmit: {
    backgroundColor: T.orange, borderRadius: 12, padding: 16,
    alignItems: 'center',
  },
  modalSubmitDisabled: { backgroundColor: T.muted },
  modalSubmitText: { fontSize: 16, fontWeight: '700', color: T.white },
});

export default ReviewsScreen;
