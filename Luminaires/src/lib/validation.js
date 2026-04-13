import { z } from 'zod';

/**
 * Schémas de validation pour les formulaires
 */

// Schéma pour la validation du type de bâtiment
export const buildingTypeSchema = z.enum([
  'Bureau',
  'Commerce',
  'Industrie',
  'Entrepôt',
  'Autre'
]);

// Schéma pour la validation de la surface
export const surfaceAreaSchema = z.enum([
  '< 100',
  '100-500',
  '500-1000',
  '1000-5000',
  '> 5000'
]);

// Schéma pour le code postal (5 chiffres)
export const postalCodeSchema = z
  .string()
  .min(5, 'Le code postal doit contenir 5 chiffres')
  .max(5, 'Le code postal doit contenir 5 chiffres')
  .regex(/^\d{5}$/, 'Le code postal doit contenir exactement 5 chiffres');

// Schéma pour le formulaire de qualification (étape 1)
export const qualificationSchema = z.object({
  buildingType: buildingTypeSchema,
  surfaceArea: surfaceAreaSchema,
  postalCode: postalCodeSchema,
});

// Schéma pour les informations de contact (étape 2)
export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom contient des caractères invalides'),
  company: z
    .string()
    .min(2, 'Le nom de la société doit contenir au moins 2 caractères')
    .max(200, 'Le nom de la société ne peut pas dépasser 200 caractères'),
  email: z
    .string()
    .email('Adresse email invalide')
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .min(10, 'Le numéro de téléphone doit contenir au moins 10 caractères')
    .max(20, 'Le numéro de téléphone ne peut pas dépasser 20 caractères')
    .regex(/^[0-9+\s\-()]+$/, 'Le numéro de téléphone contient des caractères invalides'),
});

// Schéma complet pour le lead
export const leadSchema = qualificationSchema.merge(contactSchema).extend({
  landing: z.string().default('landing_luminaire_exterieur'),
  timestamp: z.string().optional(),
});

// Fonction utilitaire pour parser la surface en nombre
export function parseSurfaceArea(surfaceString) {
  if (!surfaceString) return 0;
  
  // Extraire le premier nombre trouvé
  const match = surfaceString.match(/\d+/);
  if (!match) return 0;
  
  const value = parseInt(match[0], 10);
  
  // Validation: surface doit être positive et raisonnable (< 100000 m²)
  if (isNaN(value) || value <= 0 || value > 100000) {
    return 0;
  }
  
  return value;
}

// Fonction pour valider un objet avec un schéma Zod
export function validateWithSchema(schema, data) {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.reduce((acc, err) => {
        const path = err.path.join('.');
        acc[path] = err.message;
        return acc;
      }, {});
      return { success: false, data: null, errors };
    }
    throw error;
  }
}

// Note: Si vous migrez vers TypeScript plus tard, vous pouvez ajouter :
// export type BuildingType = z.infer<typeof buildingTypeSchema>;
// export type SurfaceArea = z.infer<typeof surfaceAreaSchema>;
// export type QualificationData = z.infer<typeof qualificationSchema>;
// export type ContactData = z.infer<typeof contactSchema>;
// export type LeadData = z.infer<typeof leadSchema>;

