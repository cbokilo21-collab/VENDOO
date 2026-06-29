import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, TextInput, Modal, Dimensions, Alert } from 'react-native';
import { ReviewService, Review } from '../services/reviewService';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { T } from '../theme';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ReviewSectionProps {
  storeId: string;
  storeName: string;
}

const StarIcon = ({ filled, size = 20 }: { filled: boolean; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#FF6B35' : 'none'} stroke={filled ? '#FF6B35' : '#E5E7EB'} strokeWidth={2}>
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const ReviewSection: React.FC<ReviewSectionProps> = ({ storeId, storeName }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [showAddReview, setShowAddReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [storeId]);

  const loadReviews = async () => {
    try {
      const [reviewsData, stats] = await Promise.all([
        ReviewService.getStoreReviews(storeId),
        ReviewService.getStoreReviewStats(storeId),
      ]);
      setReviews(reviewsData);
      setAverageRating(stats.average);
      setTotalReviews(stats.total);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const handleAddReview = async () => {
    if (!user) {
      Alert.alert(t('reviewSection.loginRequired'), t('reviewSection.loginRequiredDesc'));
      return;
    }

    if (rating === 0) {
      Alert.alert(t('reviewSection.ratingRequired'), t('reviewSection.ratingRequiredDesc'));
      return;
    }

    if (!title.trim() || !comment.trim()) {
      Alert.alert(t('reviewSection.fieldsRequired'), t('reviewSection.fieldsRequiredDesc'));
      return;
    }

    setLoading(true);
    try {
      await ReviewService.createReview({
        userId: user.uid,
        storeId,
        storeName,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        verified: false,
      });
      Alert.alert(t('reviewSection.success'), t('reviewSection.successDesc'));
      setShowAddReview(false);
      setTitle('');
      setComment('');
      setRating(0);
      loadReviews();
    } catch (error) {
      console.error('Error adding review:', error);
      Alert.alert(t('reviewSection.error'), t('reviewSection.errorDesc'));
    } finally {
      setLoading(false);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    if (!user) {
      Alert.alert(t('reviewSection.loginRequired'), t('reviewSection.loginRequiredDesc'));
      return;
    }
    try {
      await ReviewService.markAsHelpful(reviewId);
      loadReviews();
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  const renderStars = (rating: number, interactive = false, size = 20) => {
    return (
      <View style={s.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={interactive ? () => setRating(star) : undefined}
            disabled={!interactive}
            activeOpacity={0.7}
          >
            <StarIcon filled={star <= rating} size={size} />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>{t('reviewSection.title')}</Text>
          <View style={s.ratingRow}>
            {renderStars(Math.round(averageRating), false, 24)}
            <Text style={s.averageRating}>{averageRating.toFixed(1)}</Text>
            <Text style={s.totalReviews}>({totalReviews} avis)</Text>
          </View>
        </View>
        <TouchableOpacity style={s.addReviewBtn} onPress={() => setShowAddReview(true)} activeOpacity={0.7}>
          <Text style={s.addReviewBtnText}>{t('reviewSection.addReview')}</Text>
        </TouchableOpacity>
      </View>

      {/* Reviews list */}
      <ScrollView style={s.reviewsList} showsVerticalScrollIndicator={false}>
        {reviews.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyText}>{t('reviewSection.noReviews')}</Text>
            <Text style={s.emptySub}>{t('reviewSection.noReviewsSub')}</Text>
          </View>
        ) : (
          reviews.map((review) => (
            <View key={review.id} style={s.reviewCard}>
              <View style={s.reviewHeader}>
                <View style={s.reviewAuthor}>
                  <View style={s.authorAvatar}>
                    <Text style={s.authorAvatarText}>
                      {review.userId.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={s.authorName}>{t('reviewSection.client')}</Text>
                    {review.verified && (
                      <View style={s.verifiedBadge}>
                        <Text style={s.verifiedText}>{t('reviews.verified')}</Text>
                      </View>
                    )}
                  </View>
                </View>
                {renderStars(review.rating, false, 16)}
              </View>
              <Text style={s.reviewTitle}>{review.title}</Text>
              <Text style={s.reviewComment}>{review.comment}</Text>
              <View style={s.reviewFooter}>
                <TouchableOpacity
                  style={s.helpfulBtn}
                  onPress={() => handleMarkHelpful(review.id!)}
                  activeOpacity={0.7}
                >
                  <Text style={s.helpfulText}>{t('reviewSection.helpful')} ({review.helpfulCount})</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Review Modal */}
      <Modal
        visible={showAddReview}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddReview(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{t('reviewSection.writeReview')}</Text>
              <TouchableOpacity onPress={() => setShowAddReview(false)} activeOpacity={0.7}>
                <Text style={s.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={s.modalBody} showsVerticalScrollIndicator={false}>
              <View style={s.ratingSection}>
                <Text style={s.ratingLabel}>{t('reviewSection.rating')}</Text>
                {renderStars(rating, true, 32)}
              </View>

              <View style={s.inputSection}>
                <Text style={s.inputLabel}>{t('reviews.title')}</Text>
                <TextInput
                  style={s.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder={t('reviewSection.titlePlaceholder')}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={s.inputSection}>
                <Text style={s.inputLabel}>{t('reviews.comment')}</Text>
                <TextInput
                  style={[s.input, s.textArea]}
                  value={comment}
                  onChangeText={setComment}
                  placeholder={t('reviewSection.commentPlaceholder')}
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            <View style={s.modalFooter}>
              <TouchableOpacity
                style={[s.modalBtn, s.modalBtnCancel]}
                onPress={() => setShowAddReview(false)}
                activeOpacity={0.7}
              >
                <Text style={s.modalBtnCancelText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalBtn, s.modalBtnSubmit, loading && s.modalBtnDisabled]}
                onPress={handleAddReview}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={s.modalBtnSubmitText}>
                  {loading ? t('reviewSection.publishing') : t('reviewSection.publish')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.page,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: T.surface,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: T.text,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  averageRating: {
    fontSize: 18,
    fontWeight: '700',
    color: T.text,
  },
  totalReviews: {
    fontSize: 14,
    color: T.textSub,
  },
  addReviewBtn: {
    backgroundColor: T.orange,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addReviewBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewsList: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: T.text,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: T.textSub,
  },
  reviewCard: {
    backgroundColor: T.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: T.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: T.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: T.text,
  },
  verifiedBadge: {
    backgroundColor: '#10B98120',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  reviewTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: T.text,
    marginBottom: 6,
  },
  reviewComment: {
    fontSize: 14,
    color: T.textSub,
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  helpfulBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: T.page,
  },
  helpfulText: {
    fontSize: 12,
    fontWeight: '600',
    color: T.textSub,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: T.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: T.text,
  },
  modalClose: {
    fontSize: 24,
    color: T.textSub,
    fontWeight: '300',
  },
  modalBody: {
    padding: 20,
  },
  ratingSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: T.text,
    marginBottom: 12,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: T.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: T.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: T.text,
    backgroundColor: T.page,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: T.border,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnCancel: {
    backgroundColor: T.page,
  },
  modalBtnCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: T.textSub,
  },
  modalBtnSubmit: {
    backgroundColor: T.orange,
  },
  modalBtnSubmitText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  modalBtnDisabled: {
    opacity: 0.5,
  },
});

export default ReviewSection;
