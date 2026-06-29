import React, { useState } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  useWindowDimensions, Image, Modal, FlatList, Animated, Dimensions, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { T, spacing, shadows } from '../theme';
import { Button, Badge, Card, Section, Divider } from '../components';
import { useRealtimeCollection } from '../hooks/useRealtimeData';
import Svg, { Path, Circle } from 'react-native-svg';

type Nav = NativeStackNavigationProp<any>;

export interface ShopDetail {
  id: string;
  nom: string;
  couleur: string;
  colorAccent: string;
  emoji: string;
  secteur: string;
  description: string;
  ville: string;
  note: number;
  avis: number;
  produits: number;
  statut: 'ouvert' | 'ferme';
  niveau: 1 | 2 | 3 | 4;
  proprietaire: string;
  email: string;
  phone: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  horaires?: { jour: string; heures: string }[];
  images?: string[];
  reviews?: Array<{ id: string; auteur: string; note: number; texte: string; date: string }>;
  productsList?: Array<{ id: string; nom: string; prix: number; emoji: string }>;
  bestseller?: string;
}

interface ShopDetailScreenProps {
  route: { params: { shop: ShopDetail } };
}

const ShopDetailScreen: React.FC<ShopDetailScreenProps> = ({ route }) => {
  const navigation = useNavigation<Nav>();
  const { shop } = route.params;
  const { width } = useWindowDimensions();
  const [isFavorited, setIsFavorited] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'reviews'>('overview');

  const isOpen = shop.statut === 'ouvert';

  // Fetch real data from Firestore
  const { data: reviews, loading: reviewsLoading } = useRealtimeCollection<any>('reviews', {
    enabled: true,
  });
  const { data: products, loading: productsLoading } = useRealtimeCollection<any>('products', {
    enabled: true,
  });

  // Filter reviews and products for this shop
  const shopReviews = reviews.filter((r: any) => r.shopId === shop.id);
  const shopProducts = products.filter((p: any) => p.shopId === shop.id);

  return (
    <View style={s.root}>
      {/* Header Banner */}
      <View style={[s.banner, { backgroundColor: shop.couleur }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={shop.colorAccent} strokeWidth={2}>
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>

        <View style={s.bannerContent}>
          <Text style={[s.emoji, s.lg]}>{shop.emoji}</Text>
          <Text style={[s.shopName, { color: shop.colorAccent }]}>{shop.nom}</Text>
        </View>

        <TouchableOpacity onPress={() => setIsFavorited(!isFavorited)} style={s.favBtn}>
          <Text style={s.favIcon}>{isFavorited ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={s.statsRow}>
        <View style={s.statItem}>
          <Text style={s.statValue}>{shop.note}</Text>
          <Text style={s.statLabel}>⭐ Note ({shop.avis})</Text>
        </View>
        <View style={s.dividerVert} />
        <View style={s.statItem}>
          <Text style={s.statValue}>{shop.produits}</Text>
          <Text style={s.statLabel}>Produits</Text>
        </View>
        <View style={s.dividerVert} />
        <View style={s.statItem}>
          <Badge
            label={isOpen ? 'Ouvert' : 'Fermé'}
            variant={isOpen ? 'success' : 'error'}
            size="sm"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* About Section */}
        <Section title="À Propos" subtitle={shop.secteur}>
          <Text style={s.description}>{shop.description}</Text>
          <View style={s.tagsRow}>
            <Badge label={shop.secteur} variant="orange" />
            <Badge label={`📍 ${shop.ville}`} variant="default" />
            <Badge label={`Niveau ${shop.niveau}`} variant="info" />
          </View>
        </Section>

        <Divider marginVertical={4} />

        {/* Contact & Social Section */}
        <Section title="Coordonnées">
          <View style={s.contactList}>
            <TouchableOpacity style={s.contactItem}>
              <Text style={s.contactIcon}>📧</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.contactLabel}>Email</Text>
                <Text style={s.contactValue}>{shop.email}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={s.contactItem}>
              <Text style={s.contactIcon}>📱</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.contactLabel}>Téléphone</Text>
                <Text style={s.contactValue}>{shop.phone}</Text>
              </View>
            </TouchableOpacity>

            {shop.website && (
              <TouchableOpacity style={s.contactItem}>
                <Text style={s.contactIcon}>🌐</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.contactLabel}>Site web</Text>
                  <Text style={s.contactValue}>{shop.website}</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {(shop.instagram || shop.facebook) && (
            <View style={s.socialRow}>
              {shop.instagram && (
                <TouchableOpacity style={s.socialBtn}>
                  <Text style={s.socialIcon}>📸</Text>
                  <Text style={s.socialLabel}>Instagram</Text>
                </TouchableOpacity>
              )}
              {shop.facebook && (
                <TouchableOpacity style={s.socialBtn}>
                  <Text style={s.socialIcon}>👥</Text>
                  <Text style={s.socialLabel}>Facebook</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </Section>

        <Divider marginVertical={4} />

        {/* Hours Section */}
        {shop.horaires && (
          <>
            <Section title="Horaires">
              <View style={s.horairesList}>
                {shop.horaires.map((h, i) => (
                  <View key={i} style={s.horaireItem}>
                    <Text style={s.horairesDay}>{h.jour}</Text>
                    <Text style={s.horairesTime}>{h.heures}</Text>
                  </View>
                ))}
              </View>
            </Section>
            <Divider marginVertical={4} />
          </>
        )}

        {/* Tabs */}
        <View style={s.tabs}>
          {(['overview', 'products', 'reviews'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[s.tab, activeTab === tab && s.tabActive]}
            >
              <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
                {tab === 'overview' && '📋 Aperçu'}
                {tab === 'products' && '🛍️ Produits'}
                {tab === 'reviews' && '⭐ Avis'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <Section title="Point Fort">
            <Card variant="elevated" padding={4}>
              <Text style={s.bestsellerLabel}>⭐ Best-seller</Text>
              <Text style={s.bestsellerValue}>{shop.bestseller || 'Article populaire'}</Text>
            </Card>
          </Section>
        )}

        {activeTab === 'products' && (
          <Section title={`${shopProducts.length} Produits`}>
            {productsLoading ? (
              <View style={s.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B35" />
                <Text style={s.loadingText}>Chargement des produits...</Text>
              </View>
            ) : shopProducts.length === 0 ? (
              <View style={s.emptyContainer}>
                <Text style={s.emptyText}>Aucun produit disponible</Text>
              </View>
            ) : (
              <View style={s.productGrid}>
                {shopProducts.map((p: any) => (
                  <Card key={p.id} variant="interactive" padding={4} gap={2} style={s.productCard}>
                    <Text style={s.productEmoji}>{p.emoji || '📦'}</Text>
                    <Text style={s.productName}>{p.nom}</Text>
                    <Text style={s.productPrice}>€{p.prix}</Text>
                  </Card>
                ))}
              </View>
            )}
          </Section>
        )}

        {activeTab === 'reviews' && (
          <Section title={`Avis (${shopReviews.length})`}>
            {reviewsLoading ? (
              <View style={s.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B35" />
                <Text style={s.loadingText}>Chargement des avis...</Text>
              </View>
            ) : shopReviews.length === 0 ? (
              <View style={s.emptyContainer}>
                <Text style={s.emptyText}>Aucun avis disponible</Text>
              </View>
            ) : (
              shopReviews.map((review: any) => (
                <Card key={review.id} variant="interactive" padding={4} gap={2}>
                  <View style={s.reviewHeader}>
                    <View>
                      <Text style={s.reviewAuteur}>{review.auteur}</Text>
                      <Text style={s.reviewDate}>{review.date}</Text>
                    </View>
                    <Text style={s.reviewRating}>⭐ {review.note}</Text>
                  </View>
                  <Text style={s.reviewText}>{review.texte}</Text>
                </Card>
              ))
            )}
          </Section>
        )}

        {/* CTA Button */}
        <View style={s.ctaContainer}>
          {isOpen ? (
            <>
              <Button
                label="🛒 Voir les produits"
                variant="primary"
                size="lg"
                fullWidth
                onPress={() => {
                  // Navigate to catalog
                }}
              />
              <Button
                label="💬 Contacter"
                variant="outline"
                size="lg"
                fullWidth
                onPress={() => {
                  // Open chat or contact modal
                }}
              />
            </>
          ) : (
            <Card variant="elevated" padding={4}>
              <Text style={s.closedMessage}>
                Cette boutique est actuellement fermée. Revenez plus tard !
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: T.page,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: T.spacing[5],
    paddingVertical: T.spacing[6],
    paddingTop: T.spacing[8],
    gap: T.spacing[4],
    ...T.shadows.lg,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: T.radius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerContent: {
    flex: 1,
    alignItems: 'center',
    gap: T.spacing[2],
  },
  emoji: {
    fontSize: 48,
  },
  lg: {
    fontSize: 48,
  },
  shopName: {
    ...T.h2,
    fontWeight: '800',
  },
  favBtn: {
    width: 44,
    height: 44,
    borderRadius: T.radius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favIcon: {
    fontSize: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: T.spacing[4],
    paddingHorizontal: T.spacing[5],
    backgroundColor: T.surface,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  statItem: {
    alignItems: 'center',
    gap: T.spacing[1],
    flex: 1,
  },
  statValue: {
    ...T.h3,
    fontWeight: '800',
    color: T.text,
  },
  statLabel: {
    ...T.labelSm,
    color: T.textSub,
  },
  dividerVert: {
    width: 1,
    height: 40,
    backgroundColor: T.border,
  },
  scrollContent: {
    paddingHorizontal: T.spacing[5],
    paddingVertical: T.spacing[5],
    gap: T.spacing[5],
  },
  description: {
    ...T.body,
    color: T.textMid,
    lineHeight: 22,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: T.spacing[2],
    marginTop: T.spacing[3],
  },
  contactList: {
    gap: T.spacing[3],
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: T.spacing[3],
    paddingVertical: T.spacing[3],
    paddingHorizontal: T.spacing[4],
    backgroundColor: T.surfaceAlt,
    borderRadius: T.radius.md,
  },
  contactIcon: {
    fontSize: 20,
  },
  contactLabel: {
    ...T.labelSm,
    color: T.textSub,
  },
  contactValue: {
    ...T.body,
    color: T.text,
    fontWeight: '600',
  },
  socialRow: {
    flexDirection: 'row',
    gap: T.spacing[3],
    marginTop: T.spacing[3],
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: T.spacing[2],
    paddingVertical: T.spacing[3],
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: T.radius.md,
  },
  socialIcon: {
    fontSize: 18,
  },
  socialLabel: {
    ...T.label,
    fontWeight: '600',
    color: T.text,
  },
  horairesList: {
    gap: T.spacing[2],
  },
  horaireItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: T.spacing[2],
    paddingHorizontal: T.spacing[3],
    backgroundColor: T.surfaceAlt,
    borderRadius: T.radius.md,
  },
  horairesDay: {
    ...T.label,
    fontWeight: '600',
    color: T.text,
  },
  horairesTime: {
    ...T.label,
    color: T.textSub,
  },
  tabs: {
    flexDirection: 'row',
    gap: T.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: T.border,
    marginBottom: T.spacing[4],
  },
  tab: {
    paddingVertical: T.spacing[3],
    paddingHorizontal: T.spacing[3],
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: T.orange,
  },
  tabText: {
    ...T.label,
    fontWeight: '600',
    color: T.muted,
  },
  tabTextActive: {
    color: T.orange,
  },
  bestsellerLabel: {
    ...T.labelSm,
    color: T.warning,
    fontWeight: '700',
  },
  bestsellerValue: {
    ...T.h4,
    fontWeight: '700',
    color: T.text,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: T.spacing[3],
  },
  productCard: {
    width: '48%',
    alignItems: 'center',
    gap: T.spacing[2],
  },
  productEmoji: {
    fontSize: 32,
  },
  productName: {
    ...T.labelSm,
    fontWeight: '600',
    color: T.text,
    textAlign: 'center',
  },
  productPrice: {
    ...T.body,
    fontWeight: '700',
    color: T.orange,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewAuteur: {
    ...T.label,
    fontWeight: '600',
    color: T.text,
  },
  reviewDate: {
    ...T.caption,
    color: T.textSub,
  },
  reviewRating: {
    ...T.label,
    fontWeight: '700',
    color: T.warning,
  },
  reviewText: {
    ...T.body,
    color: T.textMid,
    lineHeight: 20,
  },
  ctaContainer: {
    gap: T.spacing[3],
    marginBottom: T.spacing[6],
  },
  closedMessage: {
    ...T.body,
    color: T.error,
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...T.body,
    color: T.textSub,
    marginTop: 12,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...T.body,
    color: T.textSub,
  },
});

export default ShopDetailScreen;
