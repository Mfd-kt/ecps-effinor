const FORM_STORAGE_KEY = 'cee_eligibility_form_data';

/**
 * Saves form data to localStorage.
 * @param {object} data The data to save.
 * @returns {boolean} True if successful, false otherwise.
 */
export const saveFormData = (data) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error saving form data to localStorage:', error);
    return false;
  }
};

/**
 * Loads form data from localStorage.
 * @returns {object|null} The parsed data or null if not found or error.
 */
export const loadFormData = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const data = localStorage.getItem(FORM_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    }
    return null;
  } catch (error) {
    console.error('Error loading form data from localStorage:', error);
    return null;
  }
};

/**
 * Clears form data from localStorage.
 * @returns {boolean} True if successful, false otherwise.
 */
export const clearFormData = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(FORM_STORAGE_KEY);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error clearing form data from localStorage:', error);
    return false;
  }
};