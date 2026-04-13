# Luminaires EFFINOR - Landing Page

Application React/Vite pour la génération de leads pour les solutions d'éclairage LED professionnel d'EFFINOR.

## 🚀 Installation

```bash
npm install
```

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet en copiant `.env.example` :

```bash
cp .env.example .env
```

Puis remplissez les variables suivantes :

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase

# Redirection après soumission
VITE_REDIRECT_URL=https://groupe-effinor.fr/formulaire-complet

# Google Analytics (optionnel)
VITE_GA_MEASUREMENT_ID=votre_ga_id
```

⚠️ **Important** : Ne commitez jamais le fichier `.env` dans Git. Il est déjà dans `.gitignore`.

## 📦 Dépendances principales

- **React 18** - Bibliothèque UI
- **Vite 4** - Build tool et dev server
- **Tailwind CSS** - Framework CSS
- **Framer Motion** - Animations
- **Supabase** - Base de données et authentification
- **Zod** - Validation de schémas
- **Radix UI** - Composants UI accessibles

## 🛠️ Scripts disponibles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Preview du build
npm run preview
```

## 📁 Structure du projet

```
src/
├── components/       # Composants React réutilisables
│   ├── ui/          # Composants UI de base (Radix UI)
│   └── Hero.jsx     # Composant principal du formulaire
├── config/          # Configuration centralisée
├── contexts/        # Contextes React (Auth, etc.)
├── lib/             # Utilitaires et helpers
│   ├── validation.js    # Schémas Zod
│   ├── logger.js        # Logger centralisé
│   └── customSupabaseClient.js
├── pages/           # Pages de l'application
└── services/        # Services métier
    └── leadService.js   # Service de gestion des leads
```

## 🔒 Sécurité

- ✅ Toutes les clés API sont dans les variables d'environnement
- ✅ Validation des données avec Zod
- ✅ Triple sauvegarde des leads (Supabase + Make.com + Email)
- ✅ Gestion d'erreurs robuste

## 🎯 Fonctionnalités

- Formulaire multi-étapes avec validation
- Intégration Supabase pour la base de données
- Sauvegarde automatique avec `type_projet: "LED Éclairage"`
- Redirection vers le formulaire complet après soumission
- Tracking Google Analytics
- Animations fluides avec Framer Motion

## 📝 Notes de développement

### Plugins Vite personnalisés

Le projet utilise des plugins Vite personnalisés pour l'édition visuelle :
- `vite-plugin-react-inline-editor.js` - Édition inline des composants
- `vite-plugin-edit-mode.js` - Mode édition
- `vite-plugin-selection-mode.js` - Mode sélection
- `vite-plugin-iframe-route-restoration.js` - Restauration des routes iframe

Ces plugins sont uniquement actifs en mode développement.

## 🐛 Dépannage

### Erreur "Configuration Supabase manquante"

Vérifiez que votre fichier `.env` contient bien `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`.

### Erreur de validation Zod

Les messages d'erreur de validation sont affichés dans les toasts. Vérifiez que les données correspondent aux schémas définis dans `src/lib/validation.js`.

## 📄 Licence

Propriétaire - Groupe Effinor

