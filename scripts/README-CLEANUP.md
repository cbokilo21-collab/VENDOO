# Script de nettoyage des boutiques démo et anciennes

## Instructions pour supprimer les boutiques démo et anciennes

### Étape 1: Télécharger les credentials Firebase Admin

1. Allez sur [Firebase Console](https://console.firebase.google.com/project/vendoo-67f37/settings/serviceaccounts/adminsdk)
2. Cliquez sur "Générer une nouvelle clé privée"
3. Téléchargez le fichier JSON
4. Renommez le fichier en `firebase-service-account.json`
5. Placez-le dans le répertoire racine du projet (`/Users/cyrilbokilo/Documents/vendoo/`)

### Étape 2: Exécuter le script de nettoyage

```bash
node scripts/cleanup-simple.js
```

## Ce que le script fait

Le script supprime les boutiques qui correspondent à l'un de ces critères:
- **Boutiques démo**: Marquées avec `isDemo: true` ou avec un nom contenant "demo", "test", "exemple"
- **Boutiques sans utilisateur**: N'ont pas de `userId` associé
- **Boutiques anciennes**: Créées il y a plus de 30 jours

Pour chaque boutique supprimée, le script supprime également:
- Tous les produits associés à cette boutique

## Critères de suppression

| Critère | Description |
|---------|-------------|
| Démo | `isDemo === true` ou nom contient "demo/test/exemple" |
| Sans utilisateur | `userId` vide ou null |
| Ancienne | Créée il y a plus de 30 jours |

## Sécurité

Le script affiche:
- Le nombre total de boutiques trouvées
- Les boutiques qui seront supprimées avec la raison
- Les boutiques conservées
- Le résumé final des suppressions

**Le script ne supprime PAS**:
- Les boutiques avec un `userId` valide
- Les boutiques créées il y a moins de 30 jours
- Les boutiques qui ne sont pas marquées comme démo
