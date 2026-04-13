# 🏗️ Recommandation d'Architecture

## 📊 Situation actuelle

- **Site principal** : `effinor-website` (Next.js)
- **Landing page** : `Luminaires` (Vite/React)
- **Formulaire complet** : Probablement dans `effinor-website`

## ✅ **RECOMMANDATION : Intégrer la landing dans le site principal**

### Avantages de l'intégration

1. **Partage de code et services**
   - ✅ Même client Supabase
   - ✅ Services de leads réutilisables
   - ✅ Types TypeScript partagés
   - ✅ Utilitaires communs

2. **Gestion simplifiée**
   - ✅ Un seul repository
   - ✅ Configuration centralisée
   - ✅ Variables d'environnement partagées
   - ✅ Déploiement unifié

3. **Intégration native**
   - ✅ Pas besoin de scripts externes
   - ✅ Partage de state/context
   - ✅ Navigation fluide
   - ✅ SEO amélioré

4. **Maintenance**
   - ✅ Un seul build
   - ✅ Dépendances partagées
   - ✅ Tests centralisés

### Structure proposée

```
effinor-website/
├── app/
│   ├── [lang]/
│   │   ├── landing-luminaire/     ← Nouvelle route
│   │   │   └── page.tsx
│   │   └── formulaire-complet/
│   │       └── page.tsx
│   └── ...
├── components/
│   ├── landing/
│   │   └── Hero.tsx               ← Composant landing
│   └── ...
├── lib/
│   ├── services/
│   │   └── leadService.ts         ← Service partagé
│   └── ...
└── ...
```

## 🔄 Plan de migration

### Étape 1 : Créer la route dans Next.js

```bash
# Dans effinor-website
mkdir -p app/[lang]/landing-luminaire
```

### Étape 2 : Migrer les composants

1. Copier `src/components/Hero.jsx` → `components/landing/Hero.tsx`
2. Adapter pour Next.js (Server/Client Components)
3. Migrer les styles Tailwind

### Étape 3 : Migrer les services

1. Copier `src/services/leadService.js` → `lib/services/leadService.ts`
2. Adapter pour utiliser le client Supabase existant
3. Convertir en TypeScript

### Étape 4 : Configuration

1. Utiliser les variables d'environnement existantes
2. Adapter la redirection vers `/formulaire-complet`

### Étape 5 : Tests

1. Tester le formulaire
2. Vérifier la redirection
3. Tester la récupération des données

## ⚠️ Points d'attention

### Différences technologiques

| Aspect | Vite/React | Next.js |
|--------|------------|---------|
| Routing | React Router | App Router |
| SSR | Non | Oui |
| Build | Vite | Next.js |
| Imports | ESM | ESM/CJS |

### Adaptations nécessaires

1. **Routing** : Passer de React Router à Next.js App Router
2. **Client Components** : Ajouter `'use client'` si nécessaire
3. **Imports** : Adapter les chemins d'import
4. **Configuration** : Utiliser `next.config.ts` au lieu de `vite.config.js`

## 🚀 Alternative : Garder séparé mais améliorer

Si vous préférez garder les projets séparés :

### Option A : Monorepo avec partage de code

```
Project_effinor_2026/
├── packages/
│   ├── shared/              ← Code partagé
│   │   ├── services/
│   │   └── types/
│   ├── landing/             ← Landing Vite
│   └── website/             ← Site Next.js
└── package.json             ← Workspace root
```

### Option B : Package npm privé

Créer un package `@effinor/shared` avec les services communs.

## 💡 Ma recommandation finale

**✅ Intégrer dans Next.js** pour :
- Simplicité de gestion
- Meilleure intégration
- Performance (SSR possible)
- SEO amélioré
- Maintenance facilitée

Le temps de migration est estimé à **2-4 heures** pour une intégration complète.

## 📝 Checklist de migration

- [ ] Créer la route `/landing-luminaire` dans Next.js
- [ ] Migrer le composant Hero
- [ ] Migrer les services (leadService)
- [ ] Adapter la validation (Zod déjà présent)
- [ ] Configurer la redirection
- [ ] Tester le flux complet
- [ ] Mettre à jour les scripts de déploiement
- [ ] Documenter la nouvelle structure

## 🔗 Ressources

- [Next.js App Router](https://nextjs.org/docs/app)
- [Migrating from Vite to Next.js](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)

