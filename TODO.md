# 📋 Vendoo — Checklist Développement

## Phase 1 ✅ COMPLÉTÉE

- [x] Design System v2 (colors, typography, spacing, shadows)
- [x] 8 Composants réutilisables (Card, Button, Input, Badge, etc.)
- [x] Firestore Service CRUD abstraction
- [x] ProductsContext refactorisé pour Firestore real-time
- [x] HTTP Client avec auth Firebase
- [x] AdvancedFacade component (4 niveaux SVG)
- [x] ShopDetailScreen complet
- [x] Documentation (DEVELOPMENT.md, IMPROVEMENTS.md)
- [x] Components index centralisé

---

## Phase 2A: Dashboard Temps Réel (PRIORITÉ 1)

### Dashboard Core
- [ ] Refactoriser `BusinessDashboard.tsx`
  - [ ] Remplacer mock data par Firestore queries
  - [ ] Setup WebSocket listener pour live orders
  - [ ] Real-time KPI refresh (30s)
  
- [ ] Créer `services/realtimeService.ts`
  - [ ] WebSocket connection manager
  - [ ] Event listeners (newOrder, statusChange, etc.)
  - [ ] Auto-reconnect logic
  
- [ ] Créer `hooks/useRealtimeData.ts`
  - [ ] Firestore listener hook
  - [ ] Cleanup on unmount
  - [ ] Error boundary

### Analytics & Charts
- [ ] Implémenter Sparkline (déjà présente, optimiser)
- [ ] Animations chart au changement période
- [ ] Trend indicators (▲ +15%, ▼ -3%)
- [ ] Insights prédictifs
  - [ ] "Meilleur produit: Coca-Cola (234 ventes)"
  - [ ] "Stock alerte: 3 produits < 5 unités"

### Notifications Panel
- [ ] Afficher récentes commandes
- [ ] Badge "Unread" count
- [ ] Click → OrderDetailScreen

### Dark Mode
- [ ] Toggle dans SettingsScreen
- [ ] Appliquer T.darkMode tokens
- [ ] Persist preference (AsyncStorage)

**Estimation**: 2-3 jours | **Files**: BusinessDashboard.tsx, realtimeService.ts, useRealtimeData.ts

---

## Phase 2B: POS Production-Ready (PRIORITÉ 2)

### Stripe Integration
- [ ] Créer `services/stripeService.ts`
  - [ ] Payment intent creation
  - [ ] Client secret handling
  - [ ] Webhook verification
  
- [ ] Implémenter Stripe UI dans POSScreen
  - [ ] Replace mock payment
  - [ ] Card input form
  - [ ] Error handling (declined, etc.)

- [ ] Webhook handler (Firebase Cloud Function)
  - [ ] Listen `payment_intent.succeeded`
  - [ ] Update order status → "Payé"
  - [ ] Send confirmation email

### Receipts
- [ ] Créer `services/printService.ts`
  - [ ] ESC/POS formatting (thermal printer)
  - [ ] JSON → PDF conversion
  
- [ ] Receita templates
  - [ ] Header (boutique name, date, time)
  - [ ] Item list (qty, prix, total)
  - [ ] Payment method
  - [ ] Footer (merci message)

### Stock Management
- [ ] Decrement stock post-paiement
  - [ ] Transaction: update product.stock
  - [ ] Alert si stock < 5
  
- [ ] Impossible to sell si stock = 0
  - [ ] Disable buy button
  - [ ] Afficher "Out of stock"

### IA Recommendations
- [ ] Créer `services/recommendationService.ts`
  - [ ] Cross-sell logic (Coca → Chips)
  - [ ] Daily recommendations API call
  
- [ ] Afficher suggestions dans caisse
  - [ ] "Clients qui achètent X achètent aussi Y"

**Estimation**: 3 jours | **Files**: POSScreen.tsx, stripeService.ts, printService.ts, recommendationService.ts

---

## Phase 2C: Product Management Pro (PRIORITÉ 3)

### Image Upload
- [ ] Créer `components/ImagePicker.tsx`
  - [ ] Camera or gallery selection
  - [ ] Crop/resize UI
  
- [ ] Créer `services/imageService.ts`
  - [ ] ImageKit upload (signed URL)
  - [ ] Auto-resize (responsive sizes)
  - [ ] Error handling

- [ ] Implémenter dans ProductsScreen
  - [ ] Upload button
  - [ ] Progress indicator
  - [ ] Save to Firestore (imageUri field)

### Variants Management
- [ ] Créer `components/VariantManager.tsx`
  - [ ] Add/remove variant form
  - [ ] Size + Color inputs
  - [ ] Price override per variant
  - [ ] Stock per variant

- [ ] Update ProductsContext
  - [ ] Product.variants: Array<{size, color, price, stock}>

### Bulk Operations
- [ ] Créer `screens/ProductBulkScreen.tsx`
  - [ ] Select multiple products
  - [ ] Batch update price/category
  - [ ] CSV import/export

### Barcodes
- [ ] Créer `services/barcodeService.ts`
  - [ ] QR code generation (product ID)
  - [ ] Barcode scanner integration
  
- [ ] Afficher QR dans product detail
- [ ] Scanner for quick add-to-cart

**Estimation**: 2-3 jours | **Files**: ProductsScreen.tsx, ProductEditScreen.tsx, ImagePicker.tsx, VariantManager.tsx, imageService.ts, barcodeService.ts

---

## Phase 2D: Orders Workflow (PRIORITÉ 4)

### Status Machine
- [ ] Créer `components/OrderTimeline.tsx`
  - [ ] Visualize progression (Nouveau → Livré)
  - [ ] Highlight current status
  - [ ] Timeline markers

- [ ] Status enum
  ```typescript
  type OrderStatus = 'nouveau' | 'paye' | 'preparation' | 'expédie' | 'livré' | 'retour_demande' | 'retour_approuvé' | 'remboursé';
  ```

### Order Detail Screen
- [ ] Créer `screens/OrderDetailScreen.tsx`
  - [ ] Full order info
  - [ ] Customer details
  - [ ] Items list
  - [ ] Timeline
  - [ ] Actions (print label, refund, send SMS)

### Tracking Page (Public)
- [ ] Créer `screens/OrderTrackingScreen.tsx`
  - [ ] Public URL: `/track/:orderId`
  - [ ] No auth required
  - [ ] Show status + ETA
  - [ ] Map with delivery location

### Returns Management
- [ ] Return request form
  - [ ] Reason selection
  - [ ] Photo attachment
  - [ ] Approval workflow

- [ ] Update order status → retour_demande
- [ ] Admin approval → retour_approuvé
- [ ] Auto-refund post approval

### Notifications
- [ ] Email après chaque status change
  - [ ] "Votre commande est en préparation"
  - [ ] "Commande expédiée! Numéro tracking: XYZ"
  
- [ ] SMS (optional, Twilio)
  - [ ] "Votre commande #1234 est prête!"

**Estimation**: 2-3 jours | **Files**: OrdersScreen.tsx, OrderDetailScreen.tsx, OrderTrackingScreen.tsx, OrderTimeline.tsx

---

## Phase 2E: Customer CRM (PRIORITÉ 5)

### Segmentation
- [ ] Auto-compute customer segments
  ```typescript
  VIP: totalSpent > 100,000
  Loyaliste: orderCount >= 3
  Nouveau: joinedDate < 30 days
  À risque: lastPurchase > 90 days
  ```

- [ ] Refactoriser `CustomersScreen.tsx`
  - [ ] Filter by segment
  - [ ] Display segment badge

### Customer Profile
- [ ] Créer `screens/CustomerDetailScreen.tsx`
  - [ ] Profile info
  - [ ] Order history (all)
  - [ ] Wishlist (products saved)
  - [ ] Returns (if any)
  - [ ] Messages (conversation history)
  - [ ] LTV (Lifetime Value)

### LTV Calculation
- [ ] Service `crmService.ts`
  - [ ] SUM(orders.total) by customer
  - [ ] Display in profile
  - [ ] Sort customers by LTV

### Actions
- [ ] Send personalized email
  - [ ] Template with customer name
  - [ ] Discount coupon generation

- [ ] Add private note
  - [ ] Stored in Firestore (admin-only)
  - [ ] Visible in profile

**Estimation**: 2 jours | **Files**: CustomersScreen.tsx, CustomerDetailScreen.tsx, crmService.ts

---

## Phase 2F: Analytics Avancées (PRIORITÉ 6)

### Multiple Views
- [ ] Overview (KPIs + trends)
- [ ] Revenue breakdown (by product/category/region)
- [ ] Customer acquisition cost (CAC)
- [ ] Customer retention rate
- [ ] 30-day forecast

### Advanced Charts
- [ ] Heatmap (hours × days)
- [ ] Funnel (browse → cart → purchase)
- [ ] Cohort analysis (retention by signup week)

### Export
- [ ] PDF report generation
- [ ] CSV download

**Estimation**: 2 jours | **Files**: AnalyticsScreen.tsx, AnalyticsCharts.tsx, analyticsService.ts

---

## Phase 3: Boutique & Marketing (PRIORITÉ 7-8)

### Boutique Appearance (Theming)
- [ ] Color picker (4-5 colors: primary, secondary, accent)
- [ ] Font selection (Montserrat, Poppins, Quicksand)
- [ ] Logo upload
- [ ] Banner/cover image

- [ ] Create `BoutiquePreviewScreen.tsx`
  - [ ] Live preview avec theme appliqué
  - [ ] Preview de POS avec couleurs

- [ ] Hook `useBoutiqueTheme.ts`
  - [ ] Apply theme colors globally

**Estimation**: 2 jours

### Marketing Automation
- [ ] Email campaign builder (drag-drop)
- [ ] SMS campaigns
- [ ] Promotion manager (coupons, flash sales)
- [ ] A/B testing (subject, CTA)

**Estimation**: 3 jours

### Settings & Integrations
- [ ] Boutique settings (hours, currency, tax mode)
- [ ] Team management (invite, roles)
- [ ] Billing details
- [ ] Integration config (Stripe, email, analytics)

**Estimation**: 2-3 jours

---

## Phase 4: Quality & Deployment (PRIORITÉ 9)

### Testing
- [ ] Unit tests (business logic)
  - [ ] firestoreService.ts
  - [ ] crmService.ts
  - [ ] stripeService.ts

- [ ] E2E tests (user flows)
  - [ ] Sign up → Create shop → Add product → POS → Pay → Track
  - [ ] Buy from marketplace

- [ ] Visual regression tests
  - [ ] Screenshot comparison

### Performance
- [ ] Image optimization (WebP, responsive)
- [ ] Code splitting (lazy load screens)
- [ ] Bundle analysis
- [ ] Lighthouse audit (90+)

### Deployment
- [ ] EAS Build (iOS/Android)
- [ ] Web deployment (Vercel)
- [ ] CI/CD pipeline (GitHub Actions)

### Monitoring
- [ ] Sentry (error tracking)
- [ ] Analytics (Mixpanel/Amplitude)
- [ ] Performance (Datadog)

**Estimation**: 3-5 jours

---

## 🎯 Priorité Globale

1. **Phase 2A** (Dashboard Temps Réel) — Vue utilisateur imm édiate
2. **Phase 2B** (POS Production) — Transactions réelles = revenue
3. **Phase 2C** (Product Management) — Core inventory
4. **Phase 2D** (Orders) — Customer experience complète
5. **Phase 2E** (CRM) — Business insights
6. **Phase 2F** (Analytics) — Data-driven decisions
7. **Phase 3** (Boutique & Marketing) — Retention & growth
8. **Phase 4** (Quality & Deploy) — Production-ready

---

## ⏱️ Estimation Timeline

| Phase | Durée | Cum. |
|-------|-------|------|
| Phase 1 ✅ | 3 jours | 3j |
| Phase 2A | 2-3j | 5-6j |
| Phase 2B | 3j | 8-9j |
| Phase 2C | 2-3j | 10-12j |
| Phase 2D | 2-3j | 12-15j |
| Phase 2E | 2j | 14-17j |
| Phase 2F | 2j | 16-19j |
| Phase 3 | 7-8j | 23-27j |
| Phase 4 | 3-5j | 26-32j |
| **TOTAL** | **~6-8 semaines** | **26-32j** |

---

## 🚨 Blockers & Dépendances

- **Phase 2B requires**: Stripe API key + webhook setup
- **Phase 2C requires**: ImageKit API key + account
- **Phase 3A requires**: Email service (Resend/SendGrid)
- **Phase 4 requires**: GitHub Actions + EAS account

---

## 📌 Notes Importantes

1. **Firestore Security Rules** : À écrire pour chaque collection
2. **Firebase Cloud Functions** : Créer pour webhooks Stripe, emails
3. **Analytics Data Model** : Design indices Firestore (userId + status + date)
4. **Offline Support** : AsyncStorage cache + sync quand connecté
5. **Internationalization** : Garder texte hors code pour future i18n

---

**Last Updated**: 2026-06-28  
**Owner**: Claude  
**Status**: 🟢 Ready to Execute
