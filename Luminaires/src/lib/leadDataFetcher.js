/**
 * Utilitaires pour récupérer les données d'un lead depuis Supabase
 * Pour utilisation dans le formulaire complet
 */

import { getLeadById, getLeadByEmail, formatLeadForForm } from '@/services/leadService';

/**
 * Récupère les données du lead depuis Supabase
 * @param {string} leadId - ID du lead (optionnel)
 * @param {string} email - Email du lead (optionnel, utilisé si leadId n'est pas fourni)
 * @returns {Promise<Object|null>} Données formatées pour le formulaire ou null
 */
export async function fetchLeadData(leadId = null, email = null) {
  try {
    let lead = null;

    // Priorité 1 : Récupérer par ID si fourni
    if (leadId) {
      lead = await getLeadById(leadId);
    }
    
    // Priorité 2 : Récupérer par email si pas de lead trouvé
    if (!lead && email) {
      lead = await getLeadByEmail(email);
    }

    // Formater les données pour le formulaire
    if (lead) {
      return formatLeadForForm(lead);
    }

    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération des données du lead:', error);
    return null;
  }
}

/**
 * Récupère l'ID du lead depuis l'URL
 * @returns {string|null} ID du lead ou null
 */
export function getLeadIdFromUrl() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('leadId');
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'ID depuis l\'URL:', error);
    return null;
  }
}

/**
 * Récupère l'email depuis l'URL
 * @returns {string|null} Email ou null
 */
export function getEmailFromUrl() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('email');
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'email depuis l\'URL:', error);
    return null;
  }
}

