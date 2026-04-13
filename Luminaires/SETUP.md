# Guide de configuration

## 🔧 Configuration initiale

### 1. Créer le fichier `.env`

Créez un fichier `.env` à la racine du projet avec le contenu suivant :

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://erjgptxkctrfszrzhoxa.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyamdwdHhrY3RyZnN6cnpob3hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NzI5MDYsImV4cCI6MjA3ODQ0ODkwNn0.c9R3aFBRkTbzbZpJG6IneXahB-otUK4Pjrbu7ZhPX1k

# Redirection après soumission
VITE_REDIRECT_URL=https://groupe-effinor.fr/formulaire-complet

# Google Analytics (optionnel)
VITE_GA_MEASUREMENT_ID=
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Lancer le serveur de développement

```bash
npm run dev
```

## 📝 Notes importantes

- ⚠️ Le fichier `.env` est dans `.gitignore` et ne sera jamais commité
- 🔒 Pour la production, utilisez des variables d'environnement sécurisées
- 📦 Zod a été ajouté aux dépendances - exécutez `npm install` si nécessaire

## ✅ Vérifications

Après la configuration, vérifiez que :

1. Le serveur démarre sans erreur
2. Les variables d'environnement sont bien chargées (pas d'erreur "Configuration Supabase manquante")
3. Le formulaire fonctionne correctement

## 🆘 Problèmes courants

### Erreur "Configuration Supabase manquante"
- Vérifiez que le fichier `.env` existe à la racine
- Vérifiez que les variables commencent par `VITE_`
- Redémarrez le serveur de développement après modification du `.env`

### Erreur "zod is not defined"
- Exécutez `npm install` pour installer les nouvelles dépendances

