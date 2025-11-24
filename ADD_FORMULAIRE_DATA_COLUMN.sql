-- ============================================
-- Script SQL pour ajouter la colonne formulaire_data JSONB
-- à la table leads pour stocker toutes les données du formulaire
-- ============================================

-- Étape 1: Ajouter la colonne formulaire_data (JSONB) si elle n'existe pas
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS formulaire_data JSONB DEFAULT '{}'::jsonb;

-- Étape 2: Créer un index GIN pour améliorer les performances des requêtes sur JSONB
CREATE INDEX IF NOT EXISTS idx_leads_formulaire_data 
ON leads USING GIN (formulaire_data);

-- Étape 3 (Optionnel): Migrer les données existantes de products vers formulaire_data
-- Cette requête migre les données JSONB depuis products vers formulaire_data
-- 
-- ATTENTION: Décommentez cette section seulement si vous voulez migrer les données existantes
--
-- UPDATE leads
-- SET formulaire_data = products
-- WHERE products IS NOT NULL 
--   AND (formulaire_data IS NULL OR formulaire_data = '{}'::jsonb);

-- ============================================
-- Instructions:
-- ============================================
-- 1. Ouvrez Supabase Dashboard
-- 2. Allez dans SQL Editor
-- 3. Copiez-collez ce script
-- 4. Exécutez le script (bouton RUN)
-- 5. Vérifiez que la colonne a été créée dans Table Editor > leads
--
-- Note: La colonne products est conservée pour la compatibilité
-- avec l'ancien système. On pourra la supprimer plus tard si nécessaire.
-- ============================================

