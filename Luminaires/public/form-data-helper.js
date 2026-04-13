/**
 * Helper pour récupérer les données du formulaire de la landing page
 * À inclure dans le formulaire complet : <script src="/form-data-helper.js"></script>
 * 
 * Usage:
 *   const formData = EffinorFormData.getFormData();
 *   console.log(formData.name, formData.email, etc.);
 */

(function(window) {
  'use strict';

  const STORAGE_KEY = 'effinor_landing_form_data';
  const STORAGE_EXPIRY = 30 * 60 * 1000; // 30 minutes

  /**
   * Récupère les données depuis l'URL
   */
  function getFormDataFromUrl() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const formData = {};

      const fields = [
        'name',
        'company',
        'email',
        'phone',
        'buildingType',
        'surfaceArea',
        'postalCode',
      ];

      fields.forEach(function(field) {
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

  /**
   * Récupère les données depuis localStorage
   */
  function getStoredFormData() {
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
      const formData = {};
      Object.keys(data).forEach(function(key) {
        if (key !== 'timestamp') {
          formData[key] = data[key];
        }
      });

      return formData;
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }

  /**
   * Récupère les données du formulaire (URL en priorité, puis localStorage)
   */
  function getFormData() {
    // Essayer d'abord depuis l'URL
    let formData = getFormDataFromUrl();
    
    // Si pas de données dans l'URL, essayer localStorage
    if (!formData || Object.keys(formData).length === 0) {
      formData = getStoredFormData() || {};
    }
    
    return formData;
  }

  /**
   * Supprime les données stockées
   */
  function clearFormData() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression des données:', error);
      return false;
    }
  }

  /**
   * Mappe les champs de la landing vers les champs du formulaire complet
   * @param {Object} formData - Données de la landing
   * @returns {Object} Données mappées pour le formulaire complet
   */
  function mapToFormCompletFields(formData) {
    return {
      nom: formData.name || '',
      prenom: formData.name ? formData.name.split(' ')[0] : '',
      societe: formData.company || '',
      email: formData.email || '',
      telephone: formData.phone || '',
      type_batiment: formData.buildingType || '',
      surface: formData.surfaceArea || '',
      code_postal: formData.postalCode || '',
    };
  }

  // Exposer l'API publique
  window.EffinorFormData = {
    getFormData: getFormData,
    getFormDataFromUrl: getFormDataFromUrl,
    getStoredFormData: getStoredFormData,
    clearFormData: clearFormData,
    mapToFormCompletFields: mapToFormCompletFields,
  };

})(window);

