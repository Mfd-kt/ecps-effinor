import { createClient } from '@supabase/supabase-js';
import { logger } from '@/utils/logger';

/** Client réel (anon) — distinct du mock `supabaseClient.js` utilisé ailleurs. */
let browserClient = null;

function getAnonClient() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key || String(url).includes('your-project')) return null;
  if (!browserClient) {
    browserClient = createClient(url, key);
  }
  return browserClient;
}

/**
 * Insert Supabase activé si URL + clé anon sont définies.
 * Désactiver explicitement : VITE_DISABLE_SUPABASE_MINI_FORM_INSERT=true
 */
export function isMiniFormSupabaseInsertEnabled() {
  if (import.meta.env.VITE_DISABLE_SUPABASE_MINI_FORM_INSERT === 'true') return false;
  return !!getAnonClient();
}

function splitFullName(fullName) {
  const t = (fullName || '').trim();
  if (!t) return { first_name: '', last_name: '' };
  const parts = t.split(/\s+/);
  if (parts.length === 1) return { first_name: parts[0], last_name: '' };
  return { first_name: parts[0], last_name: parts.slice(1).join(' ') };
}

/**
 * Insert une ligne `public.leads` depuis les données déjà sanitizées du mini-formulaire.
 * La valeur `source` doit exister dans l’enum Postgres `lead_source` (ex. ajuster via migration).
 *
 * RLS : prévoir une policy INSERT pour le rôle `anon` sur `public.leads`, ou passer par une Edge Function service_role.
 */
export async function insertMiniFormLeadFromSanitized(sanitizedData) {
  const supabase = getAnonClient();
  if (!supabase) {
    return { success: false, error: 'Supabase non configuré (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)', id: null };
  }

  const fd = sanitizedData.formulaire_data ?? {};
  const attribution = sanitizedData.attribution ?? {};
  const { first_name, last_name } = splitFullName(sanitizedData.nom);

  const leadSource =
    import.meta.env.VITE_LEAD_SOURCE_MINI_FORM ||
    import.meta.env.VITE_LEAD_SOURCE_DEFAULT ||
    'website';

  const societe = (sanitizedData.societe || '').trim();
  const worksiteCity = (sanitizedData.worksite_city || '').trim();

  const simPayload = {
    mini_form: true,
    besoin_principal: fd.besoin_principal ?? null,
    besoin_principal_label: fd.besoin_principal_label ?? null,
    contexte_pac: fd.contexte_pac ?? null,
    contexte_destrat: fd.contexte_destrat ?? null,
    contexte_equil: fd.contexte_equil ?? null,
    effinor_product: fd.effinor_product ?? null,
    effinor_attr: {
      source: attribution.source || null,
      project: attribution.project || null,
      cta: attribution.cta || null,
      page: attribution.page || null,
      slug: attribution.slug || null,
      category: attribution.category || null,
    },
  };

  const row = {
    source: leadSource,
    campaign: attribution.cta || null,
    landing: attribution.page || null,
    product_interest: sanitizedData.type_projet || null,
    company_name: societe || 'Non renseigné',
    first_name: first_name || null,
    last_name: last_name || null,
    contact_name: sanitizedData.nom || null,
    phone: sanitizedData.telephone,
    email: sanitizedData.email,
    worksite_address: '',
    worksite_postal_code: sanitizedData.worksite_postal_code,
    worksite_city: worksiteCity || 'À compléter',
    building_type: sanitizedData.type_batiment,
    surface_m2: sanitizedData.surface_m2,
    heating_type: sanitizedData.heating_type || null,
    lead_origin: 'mini_estimation_form',
    sim_payload_json: simPayload,
  };

  const { data, error } = await supabase.from('leads').insert([row]).select('id').single();

  if (error) {
    logger.error('[miniFormLeadSupabase] insert error', error);
    return { success: false, error: error.message || String(error), id: null };
  }

  return { success: true, error: null, id: data?.id ?? null };
}
