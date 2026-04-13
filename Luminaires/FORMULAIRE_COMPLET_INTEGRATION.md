# Intégration avec le Formulaire Complet

## 🚀 Solution rapide (Recommandée)

Si le formulaire complet est sur un autre domaine/site, utilisez le script standalone :

```html
<!-- Dans le formulaire complet, ajoutez avant la fermeture de </body> -->
<script src="https://votre-domaine.com/form-data-helper.js"></script>
<script>
  // Récupérer les données
  const formData = EffinorFormData.getFormData();
  
  // Pré-remplir vos champs
  if (formData.name) {
    document.getElementById('nom').value = formData.name;
  }
  if (formData.email) {
    document.getElementById('email').value = formData.email;
  }
  // etc.
</script>
```

## 📋 Données transmises

Lors de la soumission du formulaire de la landing page, les données suivantes sont transmises au formulaire complet :

### Méthode 1 : Paramètres d'URL
Les données sont passées dans l'URL en tant que paramètres de requête :

```
https://groupe-effinor.fr/formulaire-complet?name=John+Doe&company=Acme&email=john@example.com&phone=0123456789&buildingType=Bureau&surfaceArea=100-500&postalCode=75001
```

### Méthode 2 : localStorage
Les données sont également stockées dans le localStorage du navigateur avec la clé `effinor_landing_form_data`.

## 🔧 Récupération des données dans le formulaire complet

### Option 1 : Depuis l'URL (Recommandé)

```javascript
// Fonction utilitaire fournie
import { getFormDataFromUrl } from '@/lib/formDataTransfer';

// Dans votre composant
const formData = getFormDataFromUrl();
// Retourne : { name, company, email, phone, buildingType, surfaceArea, postalCode }
```

### Option 2 : Depuis localStorage

```javascript
// Fonction utilitaire fournie
import { getStoredFormData } from '@/lib/formDataTransfer';

// Dans votre composant
const formData = getStoredFormData();
// Retourne : { name, company, email, phone, buildingType, surfaceArea, postalCode } ou null
```

### Option 3 : Code personnalisé

```javascript
// Depuis l'URL
const urlParams = new URLSearchParams(window.location.search);
const name = urlParams.get('name');
const email = urlParams.get('email');
// etc.

// Depuis localStorage
const stored = localStorage.getItem('effinor_landing_form_data');
if (stored) {
  const formData = JSON.parse(stored);
  // Utiliser formData.name, formData.email, etc.
}
```

## 📝 Champs disponibles

| Champ | Type | Description |
|-------|------|-------------|
| `name` | string | Nom et prénom |
| `company` | string | Nom de la société |
| `email` | string | Adresse email |
| `phone` | string | Numéro de téléphone |
| `buildingType` | string | Type de bâtiment (Bureau, Commerce, Industrie, Entrepôt, Autre) |
| `surfaceArea` | string | Surface à éclairer (< 100, 100-500, 500-1000, 1000-5000, > 5000) |
| `postalCode` | string | Code postal (5 chiffres) |

## ⚠️ Notes importantes

1. **Expiration** : Les données dans localStorage expirent après 30 minutes
2. **Encodage** : Les valeurs dans l'URL sont automatiquement encodées (URL encoding)
3. **Priorité** : Il est recommandé d'utiliser d'abord les paramètres d'URL, puis localStorage en fallback

## 🔄 Exemple d'utilisation complète

### Avec React (même projet)

```javascript
import { getFormDataFromUrl, getStoredFormData } from '@/lib/formDataTransfer';

function FormulaireComplet() {
  useEffect(() => {
    // Essayer d'abord depuis l'URL
    let formData = getFormDataFromUrl();
    
    // Si pas de données dans l'URL, essayer localStorage
    if (!formData || Object.keys(formData).length === 0) {
      formData = getStoredFormData();
    }
    
    // Pré-remplir le formulaire si des données sont disponibles
    if (formData) {
      setFormValues({
        nom: formData.name || '',
        societe: formData.company || '',
        email: formData.email || '',
        telephone: formData.phone || '',
        type_batiment: formData.buildingType || '',
        surface: formData.surfaceArea || '',
        code_postal: formData.postalCode || '',
      });
    }
  }, []);
  
  // ... reste du composant
}
```

### Avec le script standalone (autre site)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Formulaire Complet</title>
</head>
<body>
  <form id="formulaire-complet">
    <input type="text" id="nom" name="nom" placeholder="Nom">
    <input type="email" id="email" name="email" placeholder="Email">
    <input type="text" id="telephone" name="telephone" placeholder="Téléphone">
    <!-- etc. -->
  </form>

  <!-- Script helper -->
  <script src="https://votre-domaine.com/form-data-helper.js"></script>
  <script>
    // Attendre que le DOM soit chargé
    document.addEventListener('DOMContentLoaded', function() {
      // Récupérer les données
      const formData = EffinorFormData.getFormData();
      
      // Pré-remplir les champs
      if (formData.name) {
        document.getElementById('nom').value = formData.name;
      }
      if (formData.email) {
        document.getElementById('email').value = formData.email;
      }
      if (formData.phone) {
        document.getElementById('telephone').value = formData.phone;
      }
      
      // Optionnel : mapper automatiquement avec la fonction helper
      const mappedData = EffinorFormData.mapToFormCompletFields(formData);
      // mappedData contient : { nom, prenom, societe, email, telephone, type_batiment, surface, code_postal }
    });
  </script>
</body>
</html>
```

## 🧹 Nettoyage

Après avoir récupéré et utilisé les données, vous pouvez les supprimer :

```javascript
import { clearStoredFormData } from '@/lib/formDataTransfer';

// Après avoir pré-rempli le formulaire
clearStoredFormData();
```

