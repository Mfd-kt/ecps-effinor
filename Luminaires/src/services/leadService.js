import { supabase } from '@/lib/customSupabaseClient';
import { logger } from '@/lib/logger';
import { config } from '@/config';
import {
  parseSurfaceArea,
  validateWithSchema,
  leadSchema,
  qualificationSchema,
  contactSchema,
} from '@/lib/validation';

/**
 * Service de gestion des leads
 * Centralise toute la logique de sauvegarde des leads
 */

/**
 * Crée un lead via l'Edge Function backend et récupère l'URL de redirection
 */
async function createLeadViaBackend(formData) {
  try {
    logger.debug('🗄️ Envoi à l\'Edge Function backend...');

    // Appeler l'Edge Function Supabase
    const { data: edgeResult, error: edgeError } = await supabase.functions.invoke('create-lead-and-redirect', {
      body: {
        name: formData.name,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        buildingType: formData.buildingType,
        surfaceArea: formData.surfaceArea,
        postalCode: formData.postalCode,
        landing: formData.landing || 'landing_luminaire_exterieur',
        redirectUrl: config.webhooks.redirect, // URL de base pour redirection
      },
    });

    if (edgeError) {
      logger.error('❌ Edge Function Error:', edgeError);
      throw new Error(edgeError.message || 'Erreur lors de l\'appel à l\'Edge Function');
    }

    if (!edgeResult || !edgeResult.success) {
      const errorMsg = edgeResult?.error || 'Erreur lors de la création du lead';
      logger.error('❌ Edge Function returned error:', errorMsg);
      throw new Error(errorMsg);
    }

    logger.lead('✅ Lead créé via backend SUCCESS', { 
      leadId: edgeResult.leadId,
      redirectUrl: edgeResult.redirectUrl 
    });

    return { 
      success: true, 
      error: null, 
      leadId: edgeResult.leadId,
      redirectUrl: edgeResult.redirectUrl 
    };
  } catch (error) {
    logger.error('❌ Backend Error:', error);
    return { 
      success: false, 
      error: error.message || error, 
      leadId: null,
      redirectUrl: null 
    };
  }
}

/**
 * Soumet un lead complet via l'Edge Function backend
 * @param {Object} formData - Données du formulaire
 * @returns {Promise<Object>} Résultat de la soumission avec redirectUrl
 */
export async function submitLead(formData) {
  // Validation des données
  const validation = validateWithSchema(leadSchema, {
    ...formData,
    landing: formData.landing || 'landing_luminaire_exterieur',
    timestamp: formData.timestamp || new Date().toISOString(),
  });

  if (!validation.success) {
    return {
      success: false,
      errors: validation.errors,
      supabaseSuccess: false,
      redirectUrl: null,
    };
  }

  const validatedData = validation.data;

  // Créer le lead via l'Edge Function backend
  const backendResult = await createLeadViaBackend(validatedData);

  return {
    success: backendResult.success,
    errors: null,
    supabaseSuccess: backendResult.success,
    supabaseError: backendResult.error,
    leadId: backendResult.leadId,
    redirectUrl: backendResult.redirectUrl, // URL de redirection générée par le backend
  };
}

/**
 * Récupère un lead depuis Supabase par son ID
 * @param {string} leadId - ID du lead
 * @returns {Promise<Object|null>} Données du lead ou null
 */
export async function getLeadById(leadId) {
  try {
    if (!leadId) {
      return null;
    }

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (error) {
      logger.error('❌ Erreur lors de la récupération du lead:', error);
      return null;
    }

    return data;
  } catch (error) {
    logger.error('❌ Erreur lors de la récupération du lead:', error);
    return null;
  }
}

/**
 * Récupère un lead depuis Supabase par son email
 * @param {string} email - Email du lead
 * @returns {Promise<Object|null>} Données du lead le plus récent ou null
 */
export async function getLeadByEmail(email) {
  try {
    if (!email) {
      return null;
    }

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      logger.error('❌ Erreur lors de la récupération du lead par email:', error);
      return null;
    }

    return data;
  } catch (error) {
    logger.error('❌ Erreur lors de la récupération du lead par email:', error);
    return null;
  }
}

/**
 * Formate les données d'un lead pour le formulaire complet
 * @param {Object} lead - Données du lead depuis Supabase
 * @returns {Object} Données formatées pour le formulaire
 */
export function formatLeadForForm(lead) {
  if (!lead) return null;

  return {
    // Données de base
    id: lead.id,
    nom: lead.nom || '',
    prenom: lead.prenom || (lead.nom ? lead.nom.split(' ')[0] : ''),
    email: lead.email || '',
    telephone: lead.telephone || '',
    societe: lead.societe || '',
    
    // Données du projet
    type_batiment: lead.type_batiment || '',
    surface_m2: lead.surface_m2 || '',
    code_postal: lead.code_postal || '',
    type_projet: lead.type_projet || 'LED Éclairage',
    
    // Données supplémentaires si disponibles
    adresse: lead.adresse || '',
    ville: lead.ville || '',
    siret: lead.siret || '',
    // ... autres champs selon vos besoins
  };
}

/**
 * Valide uniquement les données de qualification (étape 1)
 */
export function validateQualification(data) {
  return validateWithSchema(qualificationSchema, data);
}

/**
 * Valide uniquement les données de contact (étape 2)
 */
export function validateContact(data) {
  return validateWithSchema(contactSchema, data);
}
