/**
 * Utilitaires pour transférer les données du formulaire vers le formulaire complet
 */

const STORAGE_KEY = 'effinor_landing_form_data';
const STORAGE_EXPIRY = 30 * 60 * 1000; // 30 minutes

/**
 * Stocke les données du formulaire dans localStorage
 * @param {Object} formData - Données du formulaire
 */
export function storeFormData(formData) {
  try {
    const dataToStore = {
      ...formData,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    return true;
  } catch (error) {
    console.error('Erreur lors du stockage des données:', error);
    return false;
  }
}

/**
 * Récupère les données du formulaire depuis localStorage
 * @returns {Object|null} Données du formulaire ou null si expirées/inexistantes
 */
export function getStoredFormData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored);
    const now = Date.now();

    // Vérifier si les données ont expiré
    if (data.timestamp && now - data.timestamp > STORAGE_EXPIRY) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    // Retourner les données sans le timestamp
    const { timestamp, ...formData } = data;
    return formData;
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

/**
 * Supprime les données stockées
 */
export function clearStoredFormData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression des données:', error);
    return false;
  }
}

/**
 * Génère une URL avec les données du formulaire en paramètres
 * @param {string} baseUrl - URL de base
 * @param {Object} formData - Données du formulaire
 * @returns {string} URL avec les paramètres
 */
export function generateRedirectUrl(baseUrl, formData) {
  try {
    const url = new URL(baseUrl);
    
    // Ajouter les données en tant que paramètres d'URL
    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        url.searchParams.set(key, formData[key]);
      }
    });

    return url.toString();
  } catch (error) {
    console.error('Erreur lors de la génération de l\'URL:', error);
    return baseUrl;
  }
}

/**
 * Récupère les données du formulaire depuis les paramètres d'URL
 * @returns {Object} Données du formulaire
 */
export function getFormDataFromUrl() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const formData = {};

    // Liste des champs attendus
    const fields = [
      'name',
      'company',
      'email',
      'phone',
      'buildingType',
      'surfaceArea',
      'postalCode',
    ];

    fields.forEach((field) => {
      const value = urlParams.get(field);
      if (value) {
        formData[field] = decodeURIComponent(value);
      }
    });

    return formData;
  } catch (error) {
    console.error('Erreur lors de la récupération des données depuis l\'URL:', error);
    return {};
  }
}

