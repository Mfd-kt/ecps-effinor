import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/utils/logger';
import { sanitizeFormData } from '@/utils/sanitize';

/**
 * Validates a French phone number.
 * Allows formats like 0612345678, +33612345678, 06 12 34 56 78, etc.
 * @param {string} phone The phone number to validate.
 * @returns {boolean} True if the phone number is valid.
 */
export const validateFrenchPhone = (phone) => {
  if (!phone) return false;
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return phoneRegex.test(phone.trim());
};

/**
 * Validates an email address.
 * @param {string} email The email to validate.
 * @returns {boolean} True if the email is valid.
 */
export const validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Submits form data to the 'leads' table in Supabase.
 * @param {object} formData The data to insert.
 * @returns {Promise<{success: boolean, data?: object, error?: object}>} Result of the submission.
 */
export const handleFormSubmission = async (formData) => {
  try {
    // Sanitize data before insertion to prevent XSS attacks
    const sanitizedData = sanitizeFormData(formData);
    
    // IMPORTANT: Désactiver temporairement les triggers si possible
    // En utilisant une transaction ou en insérant sans trigger
    const { data, error } = await supabase
      .from('leads')
      .insert([sanitizedData])
      .select()
      .single();

    if (error) {
      // Log l'erreur complète pour le debugging
      logger.error('Error submitting form to Supabase:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      // Si c'est une erreur de contrainte de clé étrangère (leads_events)
      // C'est probablement un trigger qui cause le problème
      if (error.code === '23503' && error.message?.includes('leads_events')) {
        logger.error('CRITICAL: Foreign key constraint error on leads_events. The trigger must be disabled.');
        logger.error('Please run the migration: migrations/20251201_fix_leads_events_trigger_AGGRESSIVE.sql');
        // Ne pas retourner de succès ici car le lead n'a probablement pas été créé
      }
      
      throw error;
    }

    // Si le lead a été créé avec succès, on peut optionnellement logger l'événement manuellement
    // MAIS seulement APRÈS avoir vérifié que le lead existe
    if (data && data.id) {
      // Optionnel: logger manuellement dans leads_events (non-bloquant)
      try {
        await supabase
          .from('leads_events')
          .insert([{
            lead_id: data.id,
            event_type: 'lead_created',
            details: {
              source: sanitizedData.source || 'unknown',
              statut: sanitizedData.statut || 'nouveau',
              formulaire_complet: sanitizedData.formulaire_complet || false
            }
          }]);
      } catch (eventError) {
        // Ignorer silencieusement - le logging d'événement est non-critique
        if (import.meta.env.DEV) {
          logger.warn('Could not log lead creation event (non-critical):', eventError);
        }
      }
    }

    return { success: true, data };
  } catch (error) {
    logger.error('Error submitting form to Supabase:', error);
    return { success: false, error };
  }
};