# Déploiement FTP - Effinor Admin

## Date: 2025-12-03

## Instructions de déploiement

### 1. Sauvegarde
Avant de déployer, sauvegardez les fichiers actuels sur le serveur FTP.

### 2. Upload des fichiers
- Connectez-vous à votre serveur FTP
- Uploadez tous les fichiers du dossier `dist/` vers le répertoire public de votre site
- Remplacez les fichiers existants si demandé

### 3. Structure des fichiers
Les fichiers sont organisés comme suit :
- `index.html` - Point d'entrée de l'application
- `assets/` - Tous les fichiers JavaScript, CSS et autres ressources compilés
- `images/` - Images statiques
- `.htaccess` - Configuration Apache pour le routing

### 4. Vérification
Après le déploiement, vérifiez que :
- Le site se charge correctement
- La page `/login` s'affiche correctement
- Les pages publiques s'affichent
- Les pages admin fonctionnent
- Le dashboard est visible dans le menu
- Le responsive fonctionne sur mobile et desktop
- Les notifications sont alignées à droite

## Modifications incluses

### Correction site vide
- ✅ Correction du problème de site vide (TrackingWrapper)
- ✅ Routes publiques correctement enveloppées
- ✅ Routes admin fonctionnelles

### Corrections responsive
- ✅ Suppression de l'espace entre le menu et le contenu sur desktop
- ✅ Alignement des notifications à droite
- ✅ Amélioration du comportement mobile (sidebar en overlay)

### Correction dashboard
- ✅ Dashboard toujours visible dans le menu pour tous les utilisateurs authentifiés
- ✅ Correction du problème d'affichage du dashboard dans le menu

### Fichiers modifiés
- `src/App.jsx` - Correction du TrackingWrapper
- Layout admin (AdminLayout, AdminSidebar, AdminHeader)
- Toutes les pages admin (Dashboard, Products, Leads, etc.)
- Système de permissions (routePermissions)

## Notes importantes

- Les fichiers sont minifiés et optimisés pour la production
- Le cache du navigateur peut nécessiter un rafraîchissement (Ctrl+F5)
- Le fichier `.htaccess` est inclus pour le routing côté serveur
- En cas de problème, restaurez la sauvegarde précédente

## Version
- Build: 2025-12-03
- Toutes les corrections incluses (site vide, responsive, dashboard)
