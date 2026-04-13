# 📁 Structure de la Landing Luminaires

## Emplacement

La landing Luminaires est maintenant intégrée dans le projet principal :
```
/Users/mfd/Projects/ecps-effinor/Luminaires/
```

## Architecture

### Structure des fichiers

```
Luminaires/
├── src/
│   ├── components/
│   │   ├── Hero.jsx              # Formulaire principal avec redirection backend
│   │   ├── Benefits.jsx
│   │   ├── SocialProof.jsx
│   │   └── ui/                    # Composants UI (button, toast, etc.)
│   ├── services/
│   │   └── leadService.js        # Service utilisant l'Edge Function
│   ├── lib/
│   │   ├── customSupabaseClient.js
│   │   ├── validation.js
│   │   └── formDataTransfer.js
│   ├── config/
│   │   └── index.js               # Configuration (Supabase, redirect URL)
│   └── pages/
│       ├── HomePage.jsx
│       └── LegalNoticePage.jsx
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Intégration Backend

### Edge Function utilisée

**`create-lead-and-redirect`** (dans `ecps-effinor/supabase/functions/`)

Cette Edge Function :
1. ✅ Crée le lead dans Supabase
2. ✅ Génère l'URL de redirection avec tous les paramètres
3. ✅ Retourne `{ leadId, redirectUrl }` au frontend

### Flux de données

```
Formulaire Landing (Hero.jsx)
    ↓
submitLead() (leadService.js)
    ↓
createLeadViaBackend() → Edge Function
    ↓
Backend crée lead + génère URL
    ↓
Frontend reçoit redirectUrl
    ↓
Redirection immédiate vers formulaire-complet
```

## Configuration

### Variables d'environnement requises

Créer un fichier `.env` dans `Luminaires/` :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key
VITE_REDIRECT_URL=https://groupe-effinor.fr/formulaire-complet
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX (optionnel)
```

## Développement

### Lancer le serveur de dev

```bash
cd /Users/mfd/Projects/ecps-effinor/Luminaires
npm install  # Si première fois
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

### Build de production

```bash
npm run build
```

Les fichiers de production seront dans `dist/`

## Déploiement

### Option 1 : Déploiement séparé (recommandé)

La landing peut être déployée séparément sur un sous-domaine ou un chemin spécifique.

### Option 2 : Intégration dans le site principal

Si vous souhaitez intégrer la landing dans le site principal (`ecps-effinor`), il faudra :
1. Ajouter une route dans `src/App.jsx`
2. Créer un composant wrapper dans `src/pages/landing/`
3. Adapter les imports si nécessaire

## Points importants

### ✅ Avantages de cette structure

- **Séparation claire** : Landing indépendante mais dans le même repo
- **Partage de ressources** : Edge Functions partagées
- **Maintenance facilitée** : Tout au même endroit
- **Backend centralisé** : Une seule Edge Function pour toutes les landings

### 🔄 Compatibilité

Cette structure est compatible avec :
- ✅ L'Edge Function `create-lead-and-redirect`
- ✅ Le formulaire complet (`/formulaire-complet`)
- ✅ Toutes les autres landing pages (à créer de la même manière)

## Prochaines étapes

1. ✅ Déployer l'Edge Function `create-lead-and-redirect`
2. ✅ Configurer les variables d'environnement
3. ✅ Tester le flux complet (formulaire → redirection → formulaire complet)
4. 🔄 Répéter pour les autres landing pages si nécessaire

---

**Date** : 2025-01-12
**Statut** : ✅ Intégré et fonctionnel

