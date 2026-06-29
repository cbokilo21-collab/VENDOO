import React, { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput,
  Dimensions, KeyboardAvoidingView, Platform, StatusBar, Animated,
  ImageBackground, Pressable, Modal, Image, Easing
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { UserService } from '../services/userService';

const { width: W, height: H } = Dimensions.get('window');

// Advanced Animation Components
const ParallaxCard = ({ children, scrollY, index, style }: any) => {
  const translateY = scrollY.interpolate({
    inputRange: [(index - 1) * 100, index * 100, (index + 1) * 100],
    outputRange: [50, 0, -50],
    extrapolate: 'clamp',
  });

  const scale = scrollY.interpolate({
    inputRange: [(index - 1) * 100, index * 100, (index + 1) * 100],
    outputRange: [0.9, 1, 0.9],
    extrapolate: 'clamp',
  });

  const opacity = scrollY.interpolate({
    inputRange: [(index - 1) * 100, index * 100, (index + 1) * 100],
    outputRange: [0.5, 1, 0.5],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[style, { transform: [{ translateY }, { scale }], opacity }]}>
      {children}
    </Animated.View>
  );
};

const PulseAnimation = ({ children, style }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
      {children}
    </Animated.View>
  );
};

const ShimmerEffect = ({ style, children }: any) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-W, W],
  });

  return (
    <View style={style}>
      {children}
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: W * 0.5,
          backgroundColor: 'rgba(255,255,255,0.3)',
          transform: [{ translateX }],
        }}
      />
    </View>
  );
};

const RotateIn = ({ children, delay = 0, style }: any) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.back(1.7)),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-180deg', '0deg'],
  });

  return (
    <Animated.View style={[style, { transform: [{ rotate }, { scale: scaleAnim }] }]}>
      {children}
    </Animated.View>
  );
};

const BounceIn = ({ children, delay = 0, style }: any) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[style, { transform: [{ scale: bounceAnim }] }]}>
      {children}
    </Animated.View>
  );
};

const FadeInUp = ({ children, delay = 0, style }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }]}>
      {children}
    </Animated.View>
  );
};

const ScaleOnPress = ({ children, style, onPress }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 7,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 7,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

const GradientBackground = ({ children, colors }: any) => {
  return (
    <View style={{ flex: 1, backgroundColor: colors[0] }}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: colors[1],
          opacity: 0.5,
        }}
      />
      {children}
    </View>
  );
};

// Vendoo Theme
const COLORS = {
  white: '#FFFFFF',
  page: '#F6F7F9',
  surface: '#FFFFFF',
  surfaceAlt: '#FAFBFC',
  border: '#ECEEF1',
  borderStrong: '#E0E3E8',
  orange: '#FF6B35',
  orangeDark: '#E8551E',
  text: '#1A1A1A',
  textLight: '#6B7280',
  textLighter: '#9CA3AF',
  error: '#EF4444',
  success: '#10B981',
};

const VENDOO_MODULES = [
  {
    id: 1,
    icon: 'https://cdn-icons-png.flaticon.com/512/6104/6104687.png',
    title: 'IA Intelligente',
    description: 'Notre IA révolutionnaire analyse vos préférences culturelles pour des recommandations ultra-personnalisées.',
  },
  {
    id: 2,
    icon: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png',
    title: 'Marketplace Locale',
    description: 'Découvrez les commerçants de votre quartier avec une marketplace géolocalisée unique dans le monde.',
  },
  {
    id: 3,
    icon: 'https://cdn-icons-png.flaticon.com/512/3236/3236336.png',
    title: 'Réseau Mondial',
    description: 'Connectez-vous avec des vendeurs et acheteurs dans le monde entier grâce à notre réseau étendu.',
  },
  {
    id: 4,
    icon: 'https://cdn-icons-png.flaticon.com/512/2950/2950324.png',
    title: 'Paiements Sécurisés',
    description: 'Système de paiement mobile adapté au marché mondial: Mobile Money, carte, crypto.',
  },
  {
    id: 5,
    icon: 'https://cdn-icons-png.flaticon.com/512/3175/3175337.png',
    title: 'App Mobile Native',
    description: 'Application optimisée pour les réseaux mobiles mondiaux avec mode hors-ligne intelligent.',
  },
  {
    id: 6,
    icon: 'https://cdn-icons-png.flaticon.com/512/3686/3686848.png',
    title: 'Livraison Express',
    description: 'Livraison rapide par des coursiers locaux avec suivi en temps réel et points relais.',
  },
];

const PRODUCTS = [
  { id: 1, name: 'T-Shirt Premium', price: 29.99, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', category: 'Vêtements', rating: 4.5 },
  { id: 2, name: 'Jean Slim Fit', price: 59.99, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop', category: 'Vêtements', rating: 4.8 },
  { id: 3, name: 'Sneakers Urban', price: 89.99, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', category: 'Chaussures', rating: 4.7 },
  { id: 4, name: 'Sac à Dos', price: 45.99, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop', category: 'Accessoires', rating: 4.3 },
];

const QUARTIERS = [
  { id: 1, name: 'Yopougon', stores: 45, icon: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png' },
  { id: 2, name: 'Plateau', stores: 38, icon: 'https://cdn-icons-png.flaticon.com/512/2618/2618435.png' },
  { id: 3, name: 'Cocody', stores: 52, icon: 'https://cdn-icons-png.flaticon.com/512/2989/2989955.png' },
  { id: 4, name: 'Marcory', stores: 67, icon: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png' },
];

const STORES = [
  { id: 1, name: 'Superette Express', quartier: 'Yopougon', type: 'Superette', rating: 4.5, icon: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png' },
  { id: 2, name: 'Boulangerie du Coin', quartier: 'Yopougon', type: 'Boulangerie', rating: 4.8, icon: 'https://cdn-icons-png.flaticon.com/512/2919/2919577.png' },
  { id: 3, name: 'Mode Urbaine', quartier: 'Plateau', type: 'Boutique', rating: 4.7, icon: 'https://cdn-icons-png.flaticon.com/512/2618/2618435.png' },
  { id: 4, name: 'Épicerie Fine', quartier: 'Cocody', type: 'Épicerie', rating: 4.6, icon: 'https://cdn-icons-png.flaticon.com/512/2919/2919589.png' },
];

const STORE_ADVANTAGES = [
  { id: 1, icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', title: 'Prix Locaux', description: 'Prix adaptés au marché mondial sans intermédiaire ni marge excessive' },
  { id: 2, icon: 'https://cdn-icons-png.flaticon.com/512/2910/2910764.png', title: 'Promotions Quartier', description: 'Offres exclusives réservées aux habitants de votre quartier' },
  { id: 3, icon: 'https://cdn-icons-png.flaticon.com/512/3175/3175337.png', title: 'Mobile Money', description: 'Orange Money, MTN Mobile Money, Wave - payez comme vous le souhaitez' },
  { id: 4, icon: 'https://cdn-icons-png.flaticon.com/512/3686/3686848.png', title: 'Livraison Express', description: 'Livraison rapide par coursiers locaux avec suivi en temps réel' },
  { id: 5, icon: 'https://cdn-icons-png.flaticon.com/512/3236/3236336.png', title: 'Soutien Local', description: 'Soutenez les commerçants locaux et boostez l\'économie locale' },
  { id: 6, icon: 'https://cdn-icons-png.flaticon.com/512/3236/3236336.png', title: 'Produits Locaux', description: 'Produits artisanaux et locaux mis en avant par notre IA' },
];

// Video component
const VideoHeader = () => {
  if (Platform.OS === 'web') {
    const webVideoContainer: any = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      backgroundColor: '#000',
    };
    // Cover technique: scale iframe to always fill container (no black bars)
    const webVideo: any = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '100vw',
      height: '56.25vw', // 16:9 ratio based on width
      minHeight: '100%',
      minWidth: '177.77vh', // 16:9 ratio based on height
      transform: 'translate(-50%, -50%)',
      border: 'none',
      pointerEvents: 'none',
    };
    const webVideoOverlay: any = {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.65) 100%)',
    };
    return (
      <div style={webVideoContainer}>
        <iframe
          style={webVideo}
          src="https://www.youtube.com/embed/IqgBn7sT6vI?autoplay=1&mute=1&loop=1&playlist=IqgBn7sT6vI&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&fs=0&iv_load_policy=3"
          title="Vendoo Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        <div style={webVideoOverlay} />
      </div>
    );
  }
  return (
    <ImageBackground 
      source={{ uri: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80' }}
      style={styles.videoHeader}
    >
      <View style={styles.videoOverlay} />
    </ImageBackground>
  );
};

// Animated Advantage Card
function AnimatedAdvantageCard({ advantage, index }: { advantage: any; index: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        delay: index * 100,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay: index * 100,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 100,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, fadeAnim, slideAnim, scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.advantageCard,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ]
        }
      ]}
    >
      <View style={styles.advantageIconContainer}>
        <Image source={{ uri: advantage.icon }} style={styles.advantageIconImage} />
      </View>
      <Text style={styles.advantageTitle}>{advantage.title}</Text>
      <Text style={styles.advantageDescription}>{advantage.description}</Text>
    </Animated.View>
  );
}

// Floating animation for scroll hint
function FloatingAnimation({ children }: { children: React.ReactNode }) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -10,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [translateY]);

  return (
    <Animated.View style={{ transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

// Animated button with press effect
function AnimatedButton({ style, onPress, children }: { style?: any; onPress: () => void; children: React.ReactNode }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

// Generic animated reveal wrapper (fade + slide up + scale, staggered by index)
function AnimatedReveal({ index = 0, style, children }: { index?: number; style?: any; children: React.ReactNode }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        delay: index * 120,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay: index * 120,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 120,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, fadeAnim, slideAnim, scaleAnim]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export default function LandingScreen() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [selectedTab, setSelectedTab] = useState<'online' | 'stores'>('online');
  const [selectedQuartier, setSelectedQuartier] = useState<number | null>(null);
  const [cartCount, setCartCount] = useState(0);

  // Scroll animation tracking
  const scrollY = useRef(new Animated.Value(0)).current;

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'business' | 'personal'>('business');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Hero entrance animation
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroTranslateY = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 1000,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.spring(heroTranslateY, {
        toValue: 0,
        delay: 300,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [heroOpacity, heroTranslateY]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t('landing.fillAllFields'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setShowAuthModal(false);
    } catch (err: any) {
      setError(err.message || t('landing.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError(t('landing.fillAllFields'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('landing.passwordMismatch'));
      return;
    }
    if (password.length < 6) {
      setError(t('landing.passwordTooShort'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      
      // Save user type to Firestore so the app knows which interface to show
      if (cred.user.uid) {
        try {
          await UserService.setProfile(cred.user.uid, {
            name: name || 'Unnamed',
            email,
            userType: userType === 'business' ? 'business' : 'buyer',
          });
        } catch (err) {
          console.error('Failed to save user type:', err);
          // Continue anyway - user type save is non-blocking
        }
      }
      
      setShowAuthModal(false);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (productId: number) => {
    setCartCount(prev => prev + 1);
  };

  const viewProductShop = (product: any) => {
    // Navigate to shop page for this product
    console.log('Viewing shop for product:', product.name);
    // For now, just add to cart as a placeholder
    addToCart(product.id);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.logo}>Vendoo</Text>
          
          <View style={styles.tabSelector}>
            <AnimatedButton 
              style={[styles.tab, selectedTab === 'online' && styles.tabActive]}
              onPress={() => setSelectedTab('online')}
            >
              <Text style={[styles.tabText, selectedTab === 'online' && styles.tabTextActive]}>🛍️ Explorer</Text>
            </AnimatedButton>
            <AnimatedButton 
              style={[styles.tab, selectedTab === 'stores' && styles.tabActive]}
              onPress={() => setSelectedTab('stores')}
            >
              <Text style={[styles.tabText, selectedTab === 'stores' && styles.tabTextActive]}>🏪 Quartiers</Text>
            </AnimatedButton>
          </View>

          <View style={styles.headerActions}>
            <AnimatedButton 
              style={styles.headerButtonSecondary}
              onPress={() => setShowAuthModal(true)}
            >
              <Text style={styles.headerButtonTextSecondary}>{t('landing.register')}</Text>
            </AnimatedButton>
            <AnimatedButton 
              style={styles.headerButton} 
              onPress={() => setShowAuthModal(true)}
            >
              <Text style={styles.headerButtonText}>{t('landing.login')}</Text>
            </AnimatedButton>
            <TouchableOpacity style={styles.cartButton}>
              <Text style={styles.cartIcon}>🛒</Text>
              {cartCount > 0 && <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cartCount}</Text></View>}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Video Header - Only show on online tab */}
        {selectedTab === 'online' && (
          <View style={[styles.videoHeaderWrapper, Platform.OS === 'web' ? ({ height: '90vh' } as any) : null]}>
            <VideoHeader />
          </View>
        )}

        {/* Hero Content - Only show on online tab */}
        {selectedTab === 'online' && (
          <View style={styles.heroSection}>
            <FadeInUp delay={0}>
              <PulseAnimation>
                <Text style={styles.heroBadge}>🤖 Propulsé par l'IA</Text>
              </PulseAnimation>
            </FadeInUp>
            <FadeInUp delay={100}>
              <Text style={styles.heroTitle}>
                La Marketplace{'\n'}
                <Text style={styles.heroTitleHighlight}>de Demain</Text>
              </Text>
            </FadeInUp>
            <FadeInUp delay={200}>
              <Text style={styles.heroSubtitle}>
                Notre IA révolutionnaire analyse vos préférences culturelles pour vous recommander les meilleurs produits de votre quartier.
              </Text>
            </FadeInUp>
            <FadeInUp delay={300}>
              <View style={styles.heroCTAs}>
                <ScaleOnPress
                  style={styles.primaryButton}
                  onPress={() => setShowAuthModal(true)}
                >
                  <Text style={styles.primaryButtonText}>🚀 Créer mon compte</Text>
                </ScaleOnPress>
                <ScaleOnPress
                  style={styles.secondaryButton}
                  onPress={() => setSelectedTab('online')}
                >
                  <Text style={styles.secondaryButtonText}>Explorer</Text>
                </ScaleOnPress>
              </View>
            </FadeInUp>
            <FadeInUp delay={400}>
              <View style={styles.heroStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>10K+</Text>
                  <Text style={styles.statLabel}>Commerçants</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>50K+</Text>
                  <Text style={styles.statLabel}>Produits</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>100%</Text>
                  <Text style={styles.statLabel}>IA Intelligente</Text>
                </View>
              </View>
            </FadeInUp>
          </View>
        )}

        {/* Vendoo Modules - Only show on online tab */}
        {selectedTab === 'online' && (
          <FadeInUp delay={500}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>La Révolution Vendoo</Text>
              <Text style={styles.sectionSubtitle}>
                Une marketplace mondiale propulsée par l'IA
              </Text>
              <View style={styles.modulesGrid}>
                {VENDOO_MODULES.map((module, index) => (
                  <BounceIn key={module.id} delay={index * 100} style={styles.moduleCard}>
                    <PulseAnimation>
                      <View style={styles.moduleIconContainer}>
                        <Image source={{ uri: module.icon }} style={styles.moduleIconImage} />
                      </View>
                      <Text style={styles.moduleTitle}>{module.title}</Text>
                      <Text style={styles.moduleDescription}>{module.description}</Text>
                    </PulseAnimation>
                  </BounceIn>
                ))}
              </View>
            </View>
          </FadeInUp>
        )}

        {/* Tab Content */}
        {selectedTab === 'online' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Produits Populaires</Text>
            <View style={styles.productsGrid}>
              {PRODUCTS.map((product, index) => (
                <RotateIn key={product.id} delay={index * 150} style={styles.productCard}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => viewProductShop(product)}
                  >
                    <ImageBackground
                      source={{ uri: product.image }}
                      style={styles.productImage}
                      imageStyle={styles.productImageInner}
                    >
                      <View style={styles.productRatingBadge}>
                        <Text style={styles.productRatingText}>⭐ {product.rating}</Text>
                      </View>
                    </ImageBackground>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productPrice}>{product.price}€</Text>
                      <AnimatedButton
                        style={styles.addToCartButton}
                        onPress={() => addToCart(product.id)}
                      >
                        <Text style={styles.addToCartText}>Voir Boutique</Text>
                      </AnimatedButton>
                    </View>
                  </TouchableOpacity>
                </RotateIn>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Commerçants en Ligne</Text>
            <Text style={styles.sectionSubtitle}>
              Découvrez les boutiques de votre quartier
            </Text>
            <View style={styles.productsGrid}>
              {STORES.map((store, index) => (
                <RotateIn key={store.id} delay={index * 150} style={styles.productCard}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => viewProductShop({ id: store.id, name: store.name, image: store.icon, price: '0', rating: store.rating })}
                  >
                    <View style={styles.productImage}>
                      <View style={styles.productRatingBadge}>
                        <Text style={styles.productRatingText}>⭐ {store.rating}</Text>
                      </View>
                      <Image source={{ uri: store.icon }} style={{ width: 80, height: 80, alignSelf: 'center', marginTop: 20 }} />
                    </View>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{store.name}</Text>
                      <Text style={styles.productPrice}>{store.type}</Text>
                      <Text style={{ fontSize: 14, color: COLORS.orange, marginBottom: 8 }}>{store.quartier}</Text>
                      <AnimatedButton
                        style={styles.addToCartButton}
                        onPress={() => viewProductShop({ id: store.id, name: store.name, image: store.icon, price: '0', rating: store.rating })}
                      >
                        <Text style={styles.addToCartText}>Voir Boutique</Text>
                      </AnimatedButton>
                    </View>
                  </TouchableOpacity>
                </RotateIn>
              ))}
            </View>
          </View>
        )}

        {/* CTA Final */}
        <View style={styles.finalCTA}>
          <Text style={styles.finalCTATitle}>Prêt à rejoindre Vendoo?</Text>
          <Text style={styles.finalCTASubtitle}>
            Des milliers de commerçants et particuliers nous font déjà confiance
          </Text>
          <View style={styles.finalCTAButtons}>
            <AnimatedButton style={styles.finalCTAButtonPrimary} onPress={() => setShowAuthModal(true)}>
              <Text style={styles.finalCTAButtonTextPrimary}>Je suis Commerçant</Text>
            </AnimatedButton>
            <AnimatedButton style={styles.finalCTAButtonSecondary} onPress={() => setShowAuthModal(true)}>
              <Text style={styles.finalCTAButtonTextSecondary}>Je suis Particulier</Text>
            </AnimatedButton>
          </View>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Pourquoi Vendoo?</Text>
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3686/3686848.png' }} style={styles.featureIconImage} />
              <Text style={styles.featureTitle}>Livraison rapide</Text>
              <Text style={styles.featureText}>2-3 jours ouvrés</Text>
            </View>
            <View style={styles.featureCard}>
              <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3236/3236336.png' }} style={styles.featureIconImage} />
              <Text style={styles.featureTitle}>Proche de chez vous</Text>
              <Text style={styles.featureText}>Magasins locaux</Text>
            </View>
            <View style={styles.featureCard}>
              <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2950/2950324.png' }} style={styles.featureIconImage} />
              <Text style={styles.featureTitle}>Retours gratuits</Text>
              <Text style={styles.featureText}>30 jours</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.footerSection}>
              <Text style={styles.footerLogo}>Vendoo</Text>
              <Text style={styles.footerText}>
                La plateforme qui connecte shopping en ligne et commerces de quartier.
              </Text>
            </View>
            <View style={styles.footerSection}>
              <Text style={styles.footerTitle}>Shopping</Text>
              <Text style={styles.footerLink}>Produits</Text>
              <Text style={styles.footerLink}>Promotions</Text>
              <Text style={styles.footerLink}>Nouveautés</Text>
            </View>
            <View style={styles.footerSection}>
              <Text style={styles.footerTitle}>Quartiers</Text>
              <Text style={styles.footerLink}>Le Marais</Text>
              <Text style={styles.footerLink}>Saint-Germain</Text>
              <Text style={styles.footerLink}>Montmartre</Text>
            </View>
            <View style={styles.footerSection}>
              <Text style={styles.footerTitle}>Aide</Text>
              <Text style={styles.footerLink}>FAQ</Text>
              <Text style={styles.footerLink}>Contact</Text>
              <Text style={styles.footerLink}>Support</Text>
            </View>
          </View>
          <View style={styles.footerBottom}>
            <Text style={styles.footerCopyright}>© 2024 Vendoo. Tous droits réservés.</Text>
          </View>
        </View>

        {/* Video Ads Section */}
        <View style={styles.videoAdsSection}>
          <Text style={styles.videoAdsTitle}>Découvrez nos partenaires</Text>
          <View style={styles.videoAdsGrid}>
            {[
              { id: 1, title: 'Restaurant Le Dakar', category: 'Gastronomie' },
              { id: 2, title: 'Mode Internationale', category: 'Fashion' },
              { id: 3, title: 'Artisanat Local', category: 'Art' },
            ].map((ad, index) => (
              <BounceIn key={ad.id} delay={index * 100} style={styles.videoAdCard}>
                <View style={styles.videoAdPlaceholder}>
                  <Text style={styles.videoAdIcon}>🎬</Text>
                  <Text style={styles.videoAdPlaceholderText}>Espace Publicitaire</Text>
                </View>
                <Text style={styles.videoAdTitle}>{ad.title}</Text>
                <Text style={styles.videoAdCategory}>{ad.category}</Text>
              </BounceIn>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Auth Modal */}
      <Modal
        visible={showAuthModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowAuthModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowAuthModal(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>

            <View style={styles.modalLogo}>
              <PulseAnimation>
                <Text style={styles.modalLogoText}>🤖 Vendoo</Text>
              </PulseAnimation>
              <Text style={styles.modalLogoSubtitle}>Rejoignez la révolution</Text>
            </View>

            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={[styles.modalTab, isLogin && styles.modalTabActive]}
                onPress={() => setIsLogin(true)}
              >
                <Text style={[styles.modalTabText, isLogin && styles.modalTabTextActive]}>
                  Connexion
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalTab, !isLogin && styles.modalTabActive]}
                onPress={() => setIsLogin(false)}
              >
                <Text style={[styles.modalTabText, !isLogin && styles.modalTabTextActive]}>
                  Inscription
                </Text>
              </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <View style={styles.modalForm}>
                {!isLogin && (
                  <>
                    <View style={styles.typeSwitcher}>
                      <TouchableOpacity
                        style={[styles.typeBtn, userType === 'business' && styles.typeBtnActive]}
                        onPress={() => setUserType('business')}
                      >
                        <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png' }} style={styles.typeBtnIcon} />
                        <Text style={[styles.typeBtnText, userType === 'business' && styles.typeBtnTextActive]}>
                          Marchand
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.typeBtn, userType === 'personal' && styles.typeBtnActive]}
                        onPress={() => setUserType('personal')}
                      >
                        <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3236/3236336.png' }} style={styles.typeBtnIcon} />
                        <Text style={[styles.typeBtnText, userType === 'personal' && styles.typeBtnTextActive]}>
                          Visiteur
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Nom complet"
                      value={name}
                      onChangeText={setName}
                      placeholderTextColor={COLORS.textLight}
                    />
                  </>
                )}

                <TextInput
                  style={styles.input}
                  placeholder={t('landing.email')}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={COLORS.textLight}
                />

                <TextInput
                  style={styles.input}
                  placeholder={t('landing.password')}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor={COLORS.textLight}
                />

                {!isLogin && (
                  <TextInput
                    style={styles.input}
                    placeholder={t('landing.confirmPassword')}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    placeholderTextColor={COLORS.textLight}
                  />
                )}

                {error && <Text style={styles.errorText}>{error}</Text>}

                <TouchableOpacity
                  style={[styles.modalButton, loading && styles.modalButtonDisabled]}
                  onPress={isLogin ? handleLogin : handleRegister}
                  disabled={loading}
                >
                  <Text style={styles.modalButtonText}>
                    {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : "S'inscrire")}
                  </Text>
                </TouchableOpacity>

                {isLogin && (
                  <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>Mot de passe oublié?</Text>
                  </TouchableOpacity>
                )}
              </View>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.page,
  },
  header: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingVertical: 16,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.orange,
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: COLORS.orange,
  },
  tabText: {
    color: COLORS.textLight,
    fontWeight: '500',
    fontSize: 14,
  },
  tabTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  headerButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
  headerButtonSecondary: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.orange,
  },
  headerButtonTextSecondary: {
    color: COLORS.orange,
    fontWeight: '600',
    fontSize: 14,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartIcon: {
    fontSize: 24,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.orange,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  videoHeaderWrapper: {
    position: 'relative',
    height: H * 0.7,
  },
  heroSection: {
    paddingVertical: 60,
    paddingHorizontal: 40,
    backgroundColor: COLORS.page,
    alignItems: 'center',
  },
  storesHeroSection: {
    paddingVertical: 80,
    paddingHorizontal: 40,
    backgroundColor: COLORS.page,
    alignItems: 'center',
  },
  storesHeroTitle: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  storesHeroSubtitle: {
    fontSize: 18,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 600,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  searchIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  quartiersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  quartierCard: {
    minWidth: 280,
    maxWidth: 380,
    flex: 1,
  },
  quartierCardInner: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  quartierImage: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  quartierImageInner: {
    borderRadius: 20,
  },
  quartierOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  quartierName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  quartierStores: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  quartierDetails: {
    marginTop: 40,
    paddingVertical: 40,
    paddingHorizontal: 40,
    backgroundColor: COLORS.white,
    borderRadius: 20,
  },
  quartierDetailsTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 24,
  },
  storesList: {
    gap: 16,
  },
  storeCard: {
    minWidth: 280,
    maxWidth: 380,
    flex: 1,
  },
  storeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  storeType: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  storeRating: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  storeRatingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  storesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  storeCardInner: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  storeIconContainer: {
    backgroundColor: COLORS.surfaceAlt,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeIconLarge: {
    width: 80,
    height: 80,
  },
  storeCardContent: {
    padding: 20,
  },
  storeCardName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  storeCardType: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  storeCardQuartier: {
    fontSize: 14,
    color: COLORS.orange,
    fontWeight: '500',
    marginBottom: 12,
  },
  storeCardRating: {
    backgroundColor: 'rgba(255,107,53,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  storeCardRatingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.orange,
  },
  videoHeader: {
    flex: 1,
    width: '100%',
  },
  videoBackgroundImage: {
    resizeMode: 'cover',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  webVideoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  webVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  webVideoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  heroContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  heroBadge: {
    backgroundColor: 'rgba(255,107,53,0.2)',
    color: COLORS.orange,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: COLORS.orange,
  },
  heroTitle: {
    fontSize: 56,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  heroTitleHighlight: {
    color: COLORS.orange,
  },
  heroSubtitle: {
    fontSize: 20,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 40,
    maxWidth: 700,
    lineHeight: 30,
  },
  heroCTAs: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 18,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  secondaryButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 18,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    paddingVertical: 24,
    paddingHorizontal: 40,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.orange,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  section: {
    paddingVertical: 60,
    paddingHorizontal: 40,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 40,
    maxWidth: 800,
    alignSelf: 'center',
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  moduleCard: {
    flex: 1,
    minWidth: 280,
    maxWidth: 380,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 32,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    alignItems: 'center',
  },
  moduleIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  moduleIconImage: {
    width: 48,
    height: 48,
  },
  moduleIcon: {
    fontSize: 32,
  },
  moduleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  moduleDescription: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  advantagesSection: {
    paddingVertical: 60,
    paddingHorizontal: 40,
    backgroundColor: COLORS.white,
  },
  advantagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  advantageCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  advantageIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.orange + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  advantageIconImage: {
    width: 32,
    height: 32,
  },
  advantageIcon: {
    fontSize: 32,
  },
  advantageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  advantageDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  productCard: {
    minWidth: 280,
    maxWidth: 380,
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 0,
    borderWidth: 2,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  productIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  productImage: {
    width: '100%',
    height: 200,
    marginBottom: 0,
    position: 'relative',
  },
  productImageInner: {
    borderRadius: 0,
  },
  productRatingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  productRatingText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.orange,
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.orange,
    marginBottom: 16,
  },
  addToCartButton: {
    backgroundColor: COLORS.orange,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addToCartText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16,
  },
  heroStores: {
    backgroundColor: COLORS.orange,
    paddingVertical: 60,
    paddingHorizontal: 40,
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 40,
  },
  heroStoresBadge: {
    backgroundColor: COLORS.white,
    color: COLORS.orange,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  heroStoresTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  heroStoresTitleHighlight: {
    color: 'rgba(255,255,255,0.8)',
  },
  heroStoresSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    maxWidth: 600,
  },
  heroMarketplace: {
    backgroundColor: COLORS.orange,
    borderRadius: 24,
    padding: 48,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroMarketplaceBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    color: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 24,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heroMarketplaceTitle: {
    fontSize: 52,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroMarketplaceTitleHighlight: {
    color: 'rgba(255,255,255,0.9)',
  },
  heroMarketplaceSubtitle: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    maxWidth: 600,
    marginBottom: 32,
    lineHeight: 28,
  },
  ctaButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.orange,
  },
  forBuyersSection: {
    marginBottom: 40,
  },
  buyerBenefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  buyerBenefitCard: {
    minWidth: 280,
    maxWidth: 380,
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 32,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  buyerBenefitIcon: {
    width: 64,
    height: 64,
    marginBottom: 20,
  },
  buyerBenefitTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  buyerBenefitDesc: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  forSellersSection: {
    marginBottom: 40,
  },
  sellerBenefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  sellerBenefitCard: {
    minWidth: 280,
    maxWidth: 380,
    flex: 1,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 20,
    padding: 32,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  sellerBenefitIcon: {
    width: 64,
    height: 64,
    marginBottom: 20,
  },
  sellerBenefitTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  sellerBenefitDesc: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  finalCTA: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 48,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  finalCTATitle: {
    fontSize: 42,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  finalCTASubtitle: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    maxWidth: 600,
    marginBottom: 32,
    lineHeight: 28,
  },
  finalCTAButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  finalCTAButtonPrimary: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  finalCTAButtonTextPrimary: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  finalCTAButtonSecondary: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  finalCTAButtonTextSecondary: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  quartiersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    maxWidth: 1200,
    alignSelf: 'center',
  },
  quartierCard: {
    width: (W - 120) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  quartierCardInner: {
    padding: 32,
    alignItems: 'center',
  },
  quartierCardActive: {
    borderColor: COLORS.orange,
    backgroundColor: COLORS.surfaceAlt,
  },
  quartierEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  quartierIconImage: {
    width: 48,
    height: 48,
    marginBottom: 12,
  },
  quartierName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  quartierCount: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  storesSection: {
    marginTop: 40,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  storesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  clearSelection: {
    fontSize: 14,
    color: COLORS.orange,
    fontWeight: '500',
  },
  storeCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  storeEmoji: {
    fontSize: 48,
    marginRight: 20,
  },
  storeIconImage: {
    width: 48,
    height: 48,
    marginRight: 20,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  storeType: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  storeRating: {
    fontSize: 14,
    color: COLORS.orange,
  },
  featuresSection: {
    paddingVertical: 60,
    paddingHorizontal: 40,
    backgroundColor: COLORS.white,
  },
  featuresGrid: {
    flexDirection: 'row',
    gap: 24,
    maxWidth: 1200,
    alignSelf: 'center',
  },
  featureCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  featureIconImage: {
    width: 48,
    height: 48,
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  footer: {
    backgroundColor: COLORS.white,
    paddingVertical: 60,
    paddingHorizontal: 40,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerContent: {
    flexDirection: 'row',
    gap: 60,
    maxWidth: 1200,
    alignSelf: 'center',
  },
  footerSection: {
    flex: 1,
  },
  footerLogo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.orange,
    marginBottom: 12,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  footerLink: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  footerBottom: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerCopyright: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  videoAdsSection: {
    paddingVertical: 60,
    paddingHorizontal: 40,
    backgroundColor: COLORS.white,
  },
  videoAdsTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 32,
  },
  videoAdsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  videoAdCard: {
    minWidth: 280,
    maxWidth: 380,
    flex: 1,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  videoAdPlaceholder: {
    aspectRatio: 16 / 9,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoAdIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  videoAdPlaceholderText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  videoAdTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    padding: 16,
    paddingTop: 20,
  },
  videoAdCategory: {
    fontSize: 14,
    color: COLORS.textLight,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 450,
    maxHeight: '80%',
  },
  modalClose: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  modalCloseText: {
    fontSize: 24,
    color: COLORS.textLight,
  },
  modalLogo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalLogoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.orange,
    marginBottom: 8,
  },
  modalLogoSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
  },
  modalTab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.orange,
  },
  modalTabText: {
    fontSize: 16,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  modalTabTextActive: {
    color: COLORS.orange,
    fontWeight: '600',
  },
  modalForm: {
    gap: 16,
  },
  input: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
  },
  modalButton: {
    backgroundColor: COLORS.orange,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
  modalButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  registerButton: {
    marginTop: 16,
    padding: 12,
  },
  registerButtonText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  registerButtonTextHighlight: {
    color: COLORS.orange,
    fontWeight: '600',
  },
  forgotPassword: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.orange,
    fontWeight: '600',
  },
  typeSwitcher: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  typeBtnIcon: {
    width: 24,
    height: 24,
  },
  typeBtnActive: {
    backgroundColor: COLORS.white,
  },
  typeBtnText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  typeBtnTextActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
  scrollHint: {
    alignItems: 'center',
    marginTop: 20,
  },
  scrollHintText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
});
