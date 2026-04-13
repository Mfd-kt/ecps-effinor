const TOKEN   = import.meta.env.VITE_AIRTABLE_TOKEN;
const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const API_URL = `https://api.airtable.com/v0/${BASE_ID}`;

const TABLES = {
  LEADS:   'Site_internet',
  CONTACT: 'Site_internet',
};

async function postToAirtable(tableName, fields) {
  if (!TOKEN || !BASE_ID) {
    if (import.meta.env.DEV) {
      console.warn('[Airtable] Variables VITE_AIRTABLE_TOKEN ou VITE_AIRTABLE_BASE_ID manquantes.');
    }
    return;
  }

  const response = await fetch(`${API_URL}/${encodeURIComponent(tableName)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Airtable error ${response.status}: ${err}`);
  }

  return response.json();
}

/**
 * Formulaire homepage → table Site_internet.
 *
 * Champs : Quel est votre projet ?, Type de bâtiment, Surface (m²),
 *          Nom complet, Téléphone, Email, Commentaire qualification
 */
export async function sendLeadToAirtable({
  nom,
  telephone,
  email,
  type_batiment,
  surface_m2,
  besoin_principal_label,
  // contextes additionnels
  contexte_pac,
  contexte_destrat,
  contexte_equil,
  source,
  societe = '',
  worksite_postal_code = '',
  worksite_city = '',
}) {
  try {
    // ── Construction du commentaire enrichi ─────────────────────────────────
    const lignes = [
      '=== FORMULAIRE HOMEPAGE ===',
      '',
      `Projet       : ${besoin_principal_label || '—'}`,
      `Type bâtiment: ${type_batiment          || '—'}`,
      `Surface      : ${surface_m2             ? `${surface_m2} m²` : '—'}`,
      '',
      `Nom          : ${nom       || '—'}`,
      `Société      : ${societe || '—'}`,
      `CP chantier  : ${worksite_postal_code || '—'}`,
      `Ville chantier: ${worksite_city || '—'}`,
      `Téléphone    : ${telephone || '—'}`,
      `Email        : ${email     || '—'}`,
    ];

    if (contexte_pac)     lignes.push('', `Contexte PAC        : ${contexte_pac}`);
    if (contexte_destrat) lignes.push(`Contexte Déstrat    : ${contexte_destrat}`);
    if (contexte_equil)   lignes.push(`Contexte Équilibrage: ${contexte_equil}`);
    if (source)           lignes.push('', `Source : ${source}`);

    const commentaire = lignes.join('\n');

    // ── Envoi Airtable ───────────────────────────────────────────────────────
    await postToAirtable(TABLES.LEADS, {
      'Quel est votre projet ?':   besoin_principal_label ?? '',
      'Type de bâtiment':          type_batiment          ?? '',
      'Surface (m²)':              surface_m2 ? String(surface_m2) : '',
      'Nom complet':               nom                    ?? '',
      'Téléphone':                 telephone              ?? '',
      'Email':                     email                  ?? '',
      'Commentaire qualification': commentaire,
    });
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('[Airtable] sendLeadToAirtable failed:', err);
    }
  }
}

/**
 * Formulaire Contact → table Site_internet.
 *
 * Champs : Nom complet, Société, Email, Téléphone,
 *          Quel est votre projet ?, Commentaire qualification
 */
export async function sendContactToAirtable({
  nom,
  societe,
  email,
  telephone,
  sujet,
  message,
  /** Attribution funnel (URL /contact?… ) */
  effinor_source: effinorSource,
  effinor_project: effinorProject,
  effinor_cta: effinorCta,
  effinor_landing_page: effinorLandingPage,
  effinor_slug: effinorSlug,
  effinor_category: effinorCategory,
}) {
  try {
    // ── Construction du commentaire enrichi ─────────────────────────────────
    const lignes = [
      '=== FORMULAIRE CONTACT ===',
      '',
      `Nom          : ${nom     || '—'}`,
      `Société      : ${societe || '—'}`,
      `Email        : ${email   || '—'}`,
      `Téléphone    : ${telephone || '—'}`,
    ];

    const attrLines = [
      effinorSource && `source : ${effinorSource}`,
      effinorProject && `project : ${effinorProject}`,
      effinorCta && `cta : ${effinorCta}`,
      effinorLandingPage && `landing page : ${effinorLandingPage}`,
      effinorSlug && `slug : ${effinorSlug}`,
      effinorCategory && `category : ${effinorCategory}`,
    ].filter(Boolean);
    if (attrLines.length) {
      lignes.push('', '--- Attribution ---', ...attrLines);
    }

    if (sujet)   lignes.push('', `Sujet   : ${sujet}`);
    if (message) lignes.push('', `Message :\n${message}`);

    const commentaire = lignes.join('\n');

    // ── Envoi Airtable ───────────────────────────────────────────────────────
    await postToAirtable(TABLES.CONTACT, {
      'Nom complet':               nom        ?? '',
      'Société':                   societe    ?? '',
      'Email':                     email      ?? '',
      'Téléphone':                 telephone  ?? '',
      'Quel est votre projet ?':   sujet      ?? '',
      'Commentaire qualification': commentaire,
    });
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('[Airtable] sendContactToAirtable failed:', err);
    }
  }
}
