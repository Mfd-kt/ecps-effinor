# 🔗 Intégration avec le Formulaire Complet

## ✅ Modifications Effectuées

### 1. Redirection Améliorée (Landing Luminaires)

**Fichier modifié** : `src/components/Hero.jsx`

La redirection vers le formulaire complet inclut maintenant :
- ✅ L'ID du lead (`leadId`) pour récupération depuis Supabase
- ✅ Les données essentielles dans l'URL pour pré-remplissage immédiat :
  - `nom` et `prenom` (séparés automatiquement)
  - `email`
  - `telephone`
  - `code_postal`
  - `societe`

**Exemple d'URL générée** :
```
https://groupe-effinor.fr/formulaire-complet?leadId=xxx&prenom=Jean&nom=Dupont&email=jean@example.com&telephone=0123456789&code_postal=75001&societe=Mon%20Entreprise
```

### 2. Récupération des Données depuis l'URL

**Fichier modifié** : `ecps-effinor/src/utils/formStorage.js`

Nouvelle fonction `getFormDataFromUrl()` qui :
- ✅ Récupère les paramètres d'URL
- ✅ Décode les valeurs URL-encodées
- ✅ Stocke automatiquement le `leadId` dans localStorage pour la sauvegarde progressive

### 3. Pré-remplissage du Formulaire Complet

**Fichier modifié** : `ecps-effinor/src/pages/CEEEligibilityForm.jsx`

Le formulaire complet récupère maintenant les données dans cet ordre de priorité :

1. **URL** (données de la landing page) - Priorité la plus haute
2. **Supabase** (via `leadId`) - Si leadId présent dans l'URL
3. **localStorage** (fallback) - Données sauvegardées précédemment

**Champs pré-remplis** :
- ✅ **Étape 1** : Nom de la société, Code postal
- ✅ **Étape 2** : Prénom, Nom, Email, Téléphone
- ✅ **Étape 4** : Nombre de bâtiments (1 par défaut)
- ✅ **Étape 5** : Type de bâtiment et surface (si disponibles)

## 🔄 Flux Complet

```
1. Utilisateur remplit le formulaire sur la landing Luminaires
   ↓
2. Données sauvegardées dans Supabase → leadId généré
   ↓
3. Redirection vers formulaire complet avec :
   - leadId dans l'URL
   - Données essentielles dans l'URL (nom, prénom, email, téléphone, code postal)
   ↓
4. Formulaire complet :
   - Récupère les données depuis l'URL (priorité 1)
   - Si leadId présent, récupère depuis Supabase (priorité 2)
   - Fallback sur localStorage (priorité 3)
   ↓
5. Champs pré-remplis automatiquement
   ↓
6. Utilisateur continue à remplir le formulaire
```

## 📋 Données Transmises

### Depuis la Landing Luminaires

| Champ Landing | Paramètre URL | Champ Formulaire Complet |
|---------------|---------------|---------------------------|
| `name` | `nom` / `prenom` | Étape 2 : Nom / Prénom |
| `email` | `email` | Étape 2 : Email |
| `phone` | `telephone` | Étape 2 : Téléphone |
| `postalCode` | `code_postal` | Étape 1 : Code postal |
| `company` | `societe` | Étape 1 : Nom société |
| `buildingType` | - | Étape 5 : Type bâtiment (via Supabase) |
| `surfaceArea` | - | Étape 5 : Surface (via Supabase) |

## 🧪 Test du Flux

### Scénario de test :

1. **Aller sur la landing Luminaires**
   ```
   http://localhost:3000/ (ou URL de production)
   ```

2. **Remplir le formulaire** :
   - Type de bâtiment : Bureau
   - Surface : 100-500 m²
   - Code postal : 75001
   - Nom : Jean Dupont
   - Société : Test Company
   - Email : jean@test.com
   - Téléphone : 0123456789

3. **Soumettre le formulaire**

4. **Vérifier la redirection** :
   - URL doit contenir `leadId=...`
   - URL doit contenir les paramètres `nom`, `prenom`, `email`, `telephone`, `code_postal`, `societe`

5. **Vérifier le pré-remplissage** :
   - Étape 1 : Société et code postal pré-remplis
   - Étape 2 : Prénom, Nom, Email, Téléphone pré-remplis
   - Toast de confirmation affiché

## 🔧 Configuration

### Variables d'environnement requises

**Landing Luminaires** (`Luminaires/.env`) :
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon
VITE_REDIRECT_URL=https://groupe-effinor.fr/formulaire-complet
```

**Site Principal** (`ecps-effinor/.env`) :
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon
```

## ⚠️ Notes Importantes

1. **Séparation Nom/Prénom** : Si seulement "nom" est fourni, le système essaie de séparer automatiquement (premier mot = prénom, reste = nom)

2. **Stockage leadId** : Le `leadId` est automatiquement stocké dans `localStorage` sous la clé `current_lead_id` pour permettre la sauvegarde progressive du formulaire

3. **Fallback** : Si les données ne sont pas dans l'URL, le système essaie Supabase puis localStorage

4. **Encodage URL** : Toutes les valeurs sont correctement encodées/décodées pour l'URL

## 🐛 Dépannage

### Les champs ne sont pas pré-remplis

1. Vérifier que l'URL contient les paramètres
2. Vérifier la console pour les erreurs
3. Vérifier que le `leadId` est valide dans Supabase
4. Vérifier que les noms de champs correspondent

### Erreur "leadId manquant"

- Vérifier que la redirection inclut bien le `leadId`
- Vérifier que `getFormDataFromUrl()` récupère bien le `leadId`
- Vérifier que le `leadId` est stocké dans localStorage

## 📝 Prochaines Améliorations Possibles

- [ ] Ajouter un indicateur visuel de chargement pendant la récupération des données
- [ ] Gérer les erreurs de récupération Supabase de manière plus élégante
- [ ] Ajouter des logs pour le debugging
- [ ] Optimiser la récupération Supabase (cache)

---

**Date de mise à jour** : 2025-01-07
**Statut** : ✅ Implémenté et testé

