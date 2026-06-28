# Vendoo — Guide de Développement v2

## 🎯 Vue d'ensemble

Vendoo est une plateforme SaaS complète pour les commerçants avec :
- **Frontend** : React Native + Expo (iOS, Android, Web)
- **Backend** : Firebase (Firestore, Auth, Cloud Functions)
- **Design** : Design System professionnel avec tokens de couleur, typographie, spacing
- **Intégrations** : OpenAI, Stripe, ImageKit (futures)

---

## 📁 Structure du Projet

```
src/
├── theme.ts                      # Design system complet (colors, typography, spacing, shadows)
├── components/                   # Composants réutilisables
│   ├── index.ts                 # Export centralisé
│   ├── Card.tsx                 # Conteneur générique
│   ├── Button.tsx               # Bouton professionnel (4 variantes)
│   ├── Input.tsx                # Champ texte
│   ├── Badge.tsx                # Badges statut
│   ├── KPICard.tsx              # Cards KPI pour dashboard
│   ├── Section.tsx              # Groupement de contenu
│   ├── Divider.tsx              # Ligne de séparation
│   ├── AdvancedFacade.tsx       # Façades boutique (SVG, 4 niveaux)
│   └── [existing components]    # ScreenHeader, BottomNavigation, etc.
│
├── contexts/                     # État global (Redux alternative)
│   ├── AuthContext.tsx          # Auth Firebase
│   ├── BoutiqueContext.tsx      # Profil boutique
│   └── ProductsContext.tsx      # Inventaire (Firestore sync) ✨
│
├── screens/                      # Écrans (23 total)
│   ├── BusinessDashboard.tsx    # Dashboard avec KPIs
│   ├── POSScreen.tsx            # Point de vente
│   ├── ProductsScreen.tsx       # Gestion inventaire
│   ├── OrdersScreen.tsx         # Gestion commandes
│   ├── QuartierScreen.tsx       # Marketplace (façades visuelles)
│   ├── ShopDetailScreen.tsx     # ✨ NOUVEAU : détail boutique
│   └── [19 other screens]
│
├── services/                     # Logique métier
│   ├── firebase.ts              # Config Firebase
│   ├── firestoreService.ts      # ✨ CRUD abstraction Firestore
│   ├── httpClient.ts            # ✨ HTTP client avec auth
│   ├── AIService.ts             # Stubs (IA future)
│   └── [other services]
│
├── navigation/                   # Navigation React Navigation
│   └── AppNavigator.tsx         # Stack principal
│
└── types/                        # TypeScript interfaces
    └── index.ts
```

---

## 🎨 Design System

### Usage

```typescript
import { T } from '../theme';

// Spacing
<View style={{ margin: T.spacing[4] }} />

// Typographie
<Text style={T.h2}>Titre</Text>
<Text style={T.body}>Paragraphe</Text>
<Text style={T.label}>Label</Text>

// Couleurs
<View style={{ backgroundColor: T.orange }} />
<Text style={{ color: T.text }} />

// Ombres
<View style={T.shadows.lg} />

// Radius
<View style={{ borderRadius: T.radius.lg }} />
```

### Tokens Disponibles

- **Colors**: `text`, `textMid`, `textSub`, `muted`, `faint`, `success`, `warning`, `error`, `info`, `violet`, `orange`, etc.
- **Typography**: `h1-h5`, `bodyLg`, `body`, `bodySm`, `labelLg`, `label`, `labelSm`, `caption`, `mono`
- **Spacing**: `0-20` (8px base) → 0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96
- **Radius**: `none`, `sm` (4), `base` (8), `md` (12), `lg` (16), `xl` (20), `2xl` (24), `full`
- **Shadows**: `xs`, `sm`, `base`, `md`, `lg`, `xl`, `pop`
- **Z-Index**: `hide`, `base`, `dropdown`, `sticky`, `fixed`, `backdrop`, `modal`, `popover`, `toast`, `tooltip`
- **Animations**: `duration` (fast, base, slow, slower) + `timing` curves

---

## 🔄 État Global (Contexts)

### ProductsContext (Firestore-backed)

```typescript
import { useProducts } from '../contexts/ProductsContext';

const MyComponent = () => {
  const { products, loading, error, addProduct, updateProduct, removeProduct } = useProducts();
  
  // ✨ Automatiquement synchronisé avec Firestore en temps réel
  // ✨ Fallback localStorage pour offline
};
```

### BoutiqueContext

```typescript
import { useBoutique } from '../contexts/BoutiqueContext';

const MyComponent = () => {
  const { boutiqueData, setBoutiqueData } = useBoutique();
  // Profil boutique (nom, couleur, description, etc.)
};
```

### AuthContext

```typescript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, userType, loading } = useAuth();
  // Firebase user object ou null
};
```

---

## 🧩 Composants Réutilisables

### Card

```typescript
<Card variant="default|interactive|elevated" padding="5" gap="3">
  <Text>Contenu</Text>
</Card>
```

### Button

```typescript
<Button
  label="Acheter"
  variant="primary|secondary|outline|ghost"
  size="sm|md|lg"
  loading={false}
  disabled={false}
  fullWidth
  onPress={() => {}}
/>
```

### Badge

```typescript
<Badge label="Ouvert" variant="success|warning|error|info|default|orange" size="sm|md" />
```

### Input

```typescript
<Input
  label="Email"
  placeholder="user@example.com"
  error={errorMsg}
  icon={<IconComponent />}
  variant="default|filled"
/>
```

### KPICard

```typescript
<KPICard
  label="Commandes"
  value="47"
  trend="+8.0%"
  trendColor={T.success}
  icon={<IconComponent />}
/>
```

### Section

```typescript
<Section
  title="Titres section"
  subtitle="Sous-titre"
  action={{ label: 'Voir tout', onPress: () => {} }}
>
  <Card>...</Card>
  <Card>...</Card>
</Section>
```

---

## 📡 Firestore Service

### API Simple

```typescript
import { FirestoreService } from '../services/firestoreService';

// Create
const docId = await FirestoreService.create('products', {
  nom: 'Coca-Cola',
  prix: 1200,
});

// Read
const product = await FirestoreService.get('products', docId);

// Query
const products = await FirestoreService.query('products', [
  where('userId', '==', user.uid),
]);

// Update
await FirestoreService.update('products', docId, { prix: 1300 });

// Delete
await FirestoreService.delete('products', docId);

// Real-time listener
const unsub = FirestoreService.onQuery(
  'products',
  [where('userId', '==', user.uid)],
  (products) => console.log('Updated:', products),
  (error) => console.error('Error:', error)
);
unsub(); // cleanup
```

---

## 🌐 HTTP Client (pour futures API)

```typescript
import { httpClient } from '../services/httpClient';

// GET
const products = await httpClient.get('/products', { category: 'books' });

// POST
const created = await httpClient.post('/products', { nom: 'Nouveau' });

// PUT/PATCH
await httpClient.put('/products/123', { prix: 100 });

// DELETE
await httpClient.delete('/products/123');
```

---

## 🎯 Roadmap Implémentation

### Phase 1 ✅ (Complétée)
- [x] Design System v2
- [x] Composants réutilisables
- [x] Firestore Service
- [x] ProductsContext refactorisé
- [x] AdvancedFacade (marketplace)
- [x] ShopDetailScreen
- [x] HTTP Client setup

### Phase 2 (Prochaine)
- [ ] Améliorer Dashboard (temps réel)
- [ ] POS professionnel (Stripe)
- [ ] Product Management (images)
- [ ] Orders workflow complet
- [ ] Customer CRM

### Phase 3 (Later)
- [ ] Analytics avancées
- [ ] Marketing automation
- [ ] Boutique appearance (theming)
- [ ] Settings + integrations

---

## 📝 Conventions de Code

### Imports
```typescript
// Components
import { Card, Button, Badge } from '../components';

// Theme
import { T } from '../theme';

// Services
import { FirestoreService } from '../services/firestoreService';
```

### Styling
```typescript
const s = StyleSheet.create({
  container: {
    padding: T.spacing[4],
    gap: T.spacing[3],
    backgroundColor: T.surface,
    borderRadius: T.radius.lg,
    ...T.shadows.base,
  },
});
```

### Naming
- Screens: `XxxScreen.tsx`
- Components: `XxxComponent.tsx` ou `Xxx.tsx`
- Services: `xxxService.ts`
- Contexts: `XxxContext.tsx`
- Styles variable: `s` ou `styles`

---

## 🔧 Setup Développement

```bash
# Install dependencies
npm install

# Start dev server (web)
npm run web

# Start dev server (iOS)
npm run ios

# Start dev server (Android)
npm run android
```

---

## 🚀 Déploiement

### Frontend
```bash
# EAS build (iOS/Android)
eas build --platform ios
eas build --platform android

# Web
npm run build
# Deploy to Vercel/Netlify
```

### Backend (Firebase)
- Firestore rules: `.firebaserc`
- Cloud Functions: `functions/` directory
- Setup: `firebase init`

---

## 📊 Performance Tips

1. **Lazy load images** : ImageKit avec resize automatique
2. **Code splitting** : Écrans lazy-loaded via React Navigation
3. **Memoization** : `React.memo()` pour composants coûteux
4. **FlatList** : Utiliser pour listes longues avec `renderItem` optimisé
5. **Firestore queries** : Indexer sur userId + status pour perf

---

## 🐛 Debugging

```typescript
// Logs structurés
console.log('[API] Fetching products...');
console.error('[Firestore] Query failed:', error);

// Firestore logs
firebase.firestore.setLoggingEnabled(true);

// Network debugging
Log network calls via httpClient interceptors
```

---

## 📚 Ressources

- **React Native Docs**: https://reactnative.dev
- **Expo Docs**: https://docs.expo.dev
- **Firebase**: https://firebase.google.com/docs
- **React Navigation**: https://reactnavigation.org

---

**Dernière mise à jour**: 2026-06-28  
**Version**: 2.0.0
