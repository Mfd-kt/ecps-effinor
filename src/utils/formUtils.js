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
    
    const { data, error } = await supabase
      .from('leads')
      .insert([sanitizedData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    logger.error('Error submitting form to Supabase:', error);
    return { success: false, error };
  }
};