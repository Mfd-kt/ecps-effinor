# Récupération des données depuis Supabase

## 🎯 Vue d'ensemble

Après la soumission du formulaire de la landing page, un lead est créé dans Supabase et l'utilisateur est redirigé vers le formulaire complet avec l'ID du lead dans l'URL :

```
https://groupe-effinor.fr/formulaire-complet?leadId=324afd7e-a1c6-4c2f-944c-154b001d0d17
```

## 🚀 Solution rapide (Recommandée)

### Option 1 : Script standalone (si formulaire sur autre site)

```html
<!-- 1. Configurer Supabase -->
<script>
  window.EFFINOR_SUPABASE_URL = 'https://erjgptxkctrfszrzhoxa.supabase.co';
  window.EFFINOR_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
</script>

<!-- 2. Charger le script helper -->
<script src="https://votre-domaine.com/lead-data-fetcher.js"></script>

<!-- 3. Récupérer et utiliser les données -->
<script>
  document.addEventListener('DOMContentLoaded', async function() {
    // Récupérer l'ID depuis l'URL
    const leadId = EffinorLeadFetcher.getLeadIdFromUrl();
    
    if (leadId) {
      // Récupérer les données depuis Supabase
      const leadData = await EffinorLeadFetcher.fetchLeadData(leadId);
      
      if (leadData) {
        // Pré-remplir le formulaire
        if (leadData.nom) {
          document.getElementById('nom').value = leadData.nom;
        }
        if (leadData.email) {
          document.getElementById('email').value = leadData.email;
        }
        if (leadData.telephone) {
          document.getElementById('telephone').value = leadData.telephone;
        }
        if (leadData.societe) {
          document.getElementById('societe').value = leadData.societe;
        }
        if (leadData.type_batiment) {
          document.getElementById('type_batiment').value = leadData.type_batiment;
        }
        if (leadData.surface_m2) {
          document.getElementById('surface').value = leadData.surface_m2;
        }
        if (leadData.code_postal) {
          document.getElementById('code_postal').value = leadData.code_postal;
        }
      }
    }
  });
</script>
```

### Option 2 : Avec React (même projet)

```javascript
import { useEffect, useState } from 'react';
import { fetchLeadData, getLeadIdFromUrl } from '@/lib/leadDataFetcher';

function FormulaireComplet() {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    societe: '',
    type_batiment: '',
    surface_m2: '',
    code_postal: '',
  });

  useEffect(() => {
    async function loadLeadData() {
      const leadId = getLeadIdFromUrl();
      
      if (leadId) {
        const leadData = await fetchLeadData(leadId);
        
        if (leadData) {
          setFormData({
            nom: leadData.nom || '',
            email: leadData.email || '',
            telephone: leadData.telephone || '',
            societe: leadData.societe || '',
            type_batiment: leadData.type_batiment || '',
            surface_m2: leadData.surface_m2 || '',
            code_postal: leadData.code_postal || '',
          });
        }
      }
    }

    loadLeadData();
  }, []);

  return (
    <form>
      <input 
        type="text" 
        value={formData.nom} 
        onChange={(e) => setFormData({...formData, nom: e.target.value})}
        placeholder="Nom"
      />
      {/* ... autres champs */}
    </form>
  );
}
```

## 📋 Champs disponibles depuis Supabase

| Champ Supabase | Type | Description |
|----------------|------|-------------|
| `id` | string (UUID) | ID unique du lead |
| `nom` | string | Nom et prénom |
| `email` | string | Adresse email |
| `telephone` | string | Numéro de téléphone |
| `societe` | string | Nom de la société |
| `type_batiment` | string | Type de bâtiment |
| `surface_m2` | number | Surface en m² |
| `code_postal` | string | Code postal |
| `type_projet` | string | Type de projet (toujours "LED Éclairage" pour cette landing) |
| `adresse` | string | Adresse (si disponible) |
| `ville` | string | Ville (si disponible) |
| `siret` | string | SIRET (si disponible) |

## 🔧 API disponible

### `fetchLeadData(leadId, email)`
Récupère les données d'un lead depuis Supabase.

**Paramètres :**
- `leadId` (string, optionnel) : ID du lead
- `email` (string, optionnel) : Email du lead (utilisé si leadId n'est pas fourni)

**Retourne :** Promise<Object|null>

**Exemple :**
```javascript
const leadData = await EffinorLeadFetcher.fetchLeadData('324afd7e-a1c6-4c2f-944c-154b001d0d17');
```

### `getLeadIdFromUrl()`
Récupère l'ID du lead depuis les paramètres d'URL.

**Retourne :** string|null

**Exemple :**
```javascript
const leadId = EffinorLeadFetcher.getLeadIdFromUrl();
```

### `getEmailFromUrl()`
Récupère l'email depuis les paramètres d'URL (fallback).

**Retourne :** string|null

## ⚠️ Configuration requise

Pour utiliser le script standalone, vous devez configurer les credentials Supabase :

```html
<script>
  window.EFFINOR_SUPABASE_URL = 'https://erjgptxkctrfszrzhoxa.supabase.co';
  window.EFFINOR_SUPABASE_KEY = 'votre_cle_anon_supabase';
</script>
```

**⚠️ Sécurité :** Utilisez uniquement la clé **anon** (publique) de Supabase, jamais la clé de service. Configurez les Row Level Security (RLS) dans Supabase pour limiter l'accès.

## 🔒 Sécurité Supabase

Assurez-vous que votre table `leads` a les bonnes politiques RLS :

```sql
-- Permettre la lecture des leads par leur ID
CREATE POLICY "Allow read by lead ID"
ON leads FOR SELECT
USING (true); -- Ou une condition plus restrictive selon vos besoins
```

## 📝 Exemple complet

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
    <input type="tel" id="telephone" name="telephone" placeholder="Téléphone">
    <input type="text" id="societe" name="societe" placeholder="Société">
    <input type="text" id="type_batiment" name="type_batiment" placeholder="Type de bâtiment">
    <input type="number" id="surface" name="surface" placeholder="Surface (m²)">
    <input type="text" id="code_postal" name="code_postal" placeholder="Code postal">
  </form>

  <!-- Configuration Supabase -->
  <script>
    window.EFFINOR_SUPABASE_URL = 'https://erjgptxkctrfszrzhoxa.supabase.co';
    window.EFFINOR_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyamdwdHhrY3RyZnN6cnpob3hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NzI5MDYsImV4cCI6MjA3ODQ0ODkwNn0.c9R3aFBRkTbzbZpJG6IneXahB-otUK4Pjrbu7ZhPX1k';
  </script>

  <!-- Script helper -->
  <script src="https://votre-domaine.com/lead-data-fetcher.js"></script>

  <!-- Récupération et pré-remplissage -->
  <script>
    document.addEventListener('DOMContentLoaded', async function() {
      const leadId = EffinorLeadFetcher.getLeadIdFromUrl();
      
      if (leadId) {
        console.log('Récupération des données pour le lead:', leadId);
        
        const leadData = await EffinorLeadFetcher.fetchLeadData(leadId);
        
        if (leadData) {
          console.log('Données récupérées:', leadData);
          
          // Pré-remplir tous les champs
          const fields = {
            'nom': leadData.nom,
            'email': leadData.email,
            'telephone': leadData.telephone,
            'societe': leadData.societe,
            'type_batiment': leadData.type_batiment,
            'surface': leadData.surface_m2,
            'code_postal': leadData.code_postal,
          };
          
          Object.keys(fields).forEach(function(fieldId) {
            const element = document.getElementById(fieldId);
            if (element && fields[fieldId]) {
              element.value = fields[fieldId];
            }
          });
        } else {
          console.warn('Aucune donnée trouvée pour ce lead');
        }
      } else {
        console.log('Aucun ID de lead dans l\'URL');
      }
    });
  </script>
</body>
</html>
```

