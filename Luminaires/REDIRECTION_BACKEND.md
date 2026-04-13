# 🔄 Redirection Backend - Documentation

## Vue d'ensemble

La création du lead et la génération de l'URL de redirection sont maintenant gérées côté **backend** via une **Supabase Edge Function** au lieu du frontend.

## Architecture

```
Landing Page (Frontend)
    ↓ (POST avec données formulaire)
Edge Function: create-lead-and-redirect
    ↓ (Crée lead dans Supabase)
    ↓ (Génère URL de redirection avec paramètres)
    ↓ (Retourne { leadId, redirectUrl })
Frontend
    ↓ (Redirige vers redirectUrl)
Formulaire Complet
```

## Edge Function : `create-lead-and-redirect`

### Localisation
`ecps-effinor/supabase/functions/create-lead-and-redirect/index.ts`

### Fonctionnalités
1. ✅ Reçoit les données du formulaire depuis le frontend
2. ✅ Valide les champs requis (name, email, phone)
3. ✅ Crée le lead dans Supabase avec service_role (bypass RLS)
4. ✅ Génère l'URL de redirection avec tous les paramètres :
   - `leadId` (UUID du lead créé)
   - `prenom` (extrait du nom complet)
   - `nom` (extrait du nom complet)
   - `email`
   - `telephone`
   - `code_postal`
   - `societe`
5. ✅ Retourne l'URL complète au frontend

### Format de la requête

**POST** `/functions/v1/create-lead-and-redirect`

**Body JSON** :
```json
{
  "name": "Nazih MILADI",
  "company": "ECPS",
  "email": "koutmoufdi.pro@gmail.com",
  "phone": "0688474254",
  "buildingType": "Bureau",
  "surfaceArea": "100-500",
  "postalCode": "94320",
  "landing": "landing_luminaire_exterieur",
  "redirectUrl": "https://groupe-effinor.fr/formulaire-complet"
}
```

### Format de la réponse

**Succès (200)** :
```json
{
  "success": true,
  "leadId": "2e7f9cb4-1b6c-4449-9d70-fd80f8f5c4f5",
  "redirectUrl": "https://groupe-effinor.fr/formulaire-complet?leadId=2e7f9cb4-1b6c-4449-9d70-fd80f8f5c4f5&prenom=Nazih&nom=MILADI&email=koutmoufdi.pro%40gmail.com&telephone=0688474254&code_postal=94320&societe=ECPS"
}
```

**Erreur (400/500)** :
```json
{
  "success": false,
  "error": "Message d'erreur",
  "details": "Détails supplémentaires"
}
```

## Modifications Frontend

### Service `leadService.js`

**Avant** : Création directe du lead dans Supabase depuis le frontend
**Maintenant** : Appel à l'Edge Function `create-lead-and-redirect`

**Fonction modifiée** :
- `submitLead()` : Appelle maintenant `createLeadViaBackend()` qui invoque l'Edge Function

### Composant `Hero.jsx`

**Avant** : Génération de l'URL de redirection côté frontend
**Maintenant** : Utilise l'URL retournée par le backend

**Changements** :
- Suppression de la logique de génération d'URL
- Utilisation directe de `result.redirectUrl` depuis la réponse backend
- Redirection immédiate avec `window.location.replace()`

## Déploiement

### 1. Déployer l'Edge Function

```bash
# Depuis le dossier ecps-effinor
cd /Users/mfd/Projects/ecps-effinor

# Se connecter à Supabase (si pas déjà fait)
supabase login

# Lier le projet (si pas déjà fait)
supabase link --project-ref erjgptxkctrfszrzhoxa

# Déployer la fonction
supabase functions deploy create-lead-and-redirect
```

### 2. Vérifier les secrets

L'Edge Function utilise automatiquement :
- `SUPABASE_URL` (automatique)
- `SUPABASE_SERVICE_ROLE_KEY` (automatique)

Ces variables sont automatiquement disponibles dans les Edge Functions Supabase.

### 3. Tester la fonction

**Via le Dashboard Supabase** :
1. Allez dans **Edge Functions** > **create-lead-and-redirect**
2. Cliquez sur **Invoke**
3. Testez avec un body JSON

**Via curl** :
```bash
curl -X POST https://erjgptxkctrfszrzhoxa.supabase.co/functions/v1/create-lead-and-redirect \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "0123456789",
    "company": "Test Company",
    "buildingType": "Bureau",
    "surfaceArea": "100-500",
    "postalCode": "75001"
  }'
```

## Avantages

### Sécurité
- ✅ Création du lead côté serveur (service_role)
- ✅ Validation côté serveur
- ✅ Pas d'exposition de la logique métier dans le frontend

### Maintenabilité
- ✅ Logique centralisée dans l'Edge Function
- ✅ Facile à modifier pour toutes les landing pages
- ✅ Un seul point de contrôle

### Performance
- ✅ Redirection fluide (pas de setTimeout)
- ✅ URL générée côté serveur (plus rapide)
- ✅ Pas de calculs côté client

## Compatibilité avec autres landing pages

Cette Edge Function peut être utilisée par **toutes les landing pages** :
- Luminaires ✅
- Déshumidificateur (à adapter)
- Autres landing pages futures

Il suffit de passer le paramètre `landing` pour identifier la source.

## Exemple d'URL générée

```
https://groupe-effinor.fr/formulaire-complet?leadId=2e7f9cb4-1b6c-4449-9d70-fd80f8f5c4f5&prenom=Nazih&nom=MILADI&email=koutmoufdi.pro%40gmail.com&telephone=0688474254&code_postal=94320&societe=ECPS
```

Cette URL est générée **entièrement côté backend** et retournée au frontend qui fait simplement la redirection.

---

**Date de création** : 2025-01-12
**Statut** : ✅ Implémenté

