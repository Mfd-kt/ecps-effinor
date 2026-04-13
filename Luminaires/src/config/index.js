/**
 * Configuration centralisée de l'application
 * Toutes les variables d'environnement sont chargées depuis .env
 */

const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_REDIRECT_URL',
];

// Vérifier que toutes les variables requises sont présentes
const missingVars = requiredEnvVars.filter(
  (varName) => !import.meta.env[varName]
);

if (missingVars.length > 0 && import.meta.env.MODE !== 'test') {
  console.warn(
    `⚠️ Variables d'environnement manquantes: ${missingVars.join(', ')}`
  );
}

export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },
  webhooks: {
    redirect: import.meta.env.VITE_REDIRECT_URL || 'https://groupe-effinor.fr/formulaire-complet',
  },
  analytics: {
    gaMeasurementId: import.meta.env.VITE_GA_MEASUREMENT_ID || '',
  },
  // Timeouts en millisecondes
  timeouts: {
    redirect: 1500, // 1.5 secondes avant redirection
  },
};

// Validation de la configuration en développement
if (import.meta.env.DEV) {
  const isValid = Object.values(config.supabase).every(Boolean) &&
                  config.webhooks.redirect;
  
  if (!isValid) {
    console.error('❌ Configuration incomplète. Vérifiez votre fichier .env');
  }
}

export default config;

