/**
 * Script standalone pour récupérer les données d'un lead depuis Supabase
 * À utiliser dans le formulaire complet
 * 
 * Configuration requise :
 *   - Définir window.EFFINOR_SUPABASE_URL et window.EFFINOR_SUPABASE_KEY
 *   - Ou passer les credentials via data attributes
 * 
 * Usage:
 *   <script>
 *     window.EFFINOR_SUPABASE_URL = 'https://...';
 *     window.EFFINOR_SUPABASE_KEY = 'eyJ...';
 *   </script>
 *   <script src="lead-data-fetcher.js"></script>
 *   <script>
 *     EffinorLeadFetcher.fetchLeadData('lead-id-here').then(data => {
 *       console.log(data);
 *     });
 *   </script>
 */

(function(window) {
  'use strict';

  let supabaseClient = null;

  /**
   * Initialise le client Supabase
   */
  function initSupabase() {
    if (supabaseClient) {
      return supabaseClient;
    }

    const supabaseUrl = window.EFFINOR_SUPABASE_URL || 
                       document.querySelector('[data-supabase-url]')?.dataset.supabaseUrl;
    const supabaseKey = window.EFFINOR_SUPABASE_KEY || 
                       document.querySelector('[data-supabase-key]')?.dataset.supabaseKey;

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Configuration Supabase manquante. Définissez window.EFFINOR_SUPABASE_URL et window.EFFINOR_SUPABASE_KEY');
      return null;
    }

    // Note: Ce script nécessite que @supabase/supabase-js soit chargé
    // Si ce n'est pas le cas, on utilise fetch directement
    if (window.supabase) {
      supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
    } else {
      // Fallback avec fetch
      supabaseClient = {
        url: supabaseUrl,
        key: supabaseKey
      };
    }

    return supabaseClient;
  }

  /**
   * Récupère un lead par ID avec fetch
   */
  async function fetchLeadById(leadId) {
    const client = initSupabase();
    if (!client) return null;

    try {
      const response = await fetch(
        `${client.url}/rest/v1/leads?id=eq.${leadId}&select=*`,
        {
          headers: {
            'apikey': client.key,
            'Authorization': `Bearer ${client.key}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Erreur lors de la récupération du lead:', error);
      return null;
    }
  }

  /**
   * Récupère un lead par email avec fetch
   */
  async function fetchLeadByEmail(email) {
    const client = initSupabase();
    if (!client) return null;

    try {
      const response = await fetch(
        `${client.url}/rest/v1/leads?email=eq.${encodeURIComponent(email)}&select=*&order=created_at.desc&limit=1`,
        {
          headers: {
            'apikey': client.key,
            'Authorization': `Bearer ${client.key}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Erreur lors de la récupération du lead par email:', error);
      return null;
    }
  }

  /**
   * Formate les données d'un lead pour le formulaire
   */
  function formatLeadForForm(lead) {
    if (!lead) return null;

    return {
      id: lead.id,
      nom: lead.nom || '',
      prenom: lead.prenom || (lead.nom ? lead.nom.split(' ')[0] : ''),
      email: lead.email || '',
      telephone: lead.telephone || '',
      societe: lead.societe || '',
      type_batiment: lead.type_batiment || '',
      surface_m2: lead.surface_m2 || '',
      code_postal: lead.code_postal || '',
      type_projet: lead.type_projet || 'LED Éclairage',
      adresse: lead.adresse || '',
      ville: lead.ville || '',
      siret: lead.siret || '',
    };
  }

  /**
   * Récupère les données du lead
   */
  async function fetchLeadData(leadId, email) {
    let lead = null;

    // Priorité 1 : Par ID
    if (leadId) {
      if (window.supabase && supabaseClient) {
        const { data, error } = await supabaseClient
          .from('leads')
          .select('*')
          .eq('id', leadId)
          .single();
        
        if (!error && data) {
          lead = data;
        }
      } else {
        lead = await fetchLeadById(leadId);
      }
    }

    // Priorité 2 : Par email
    if (!lead && email) {
      if (window.supabase && supabaseClient) {
        const { data, error } = await supabaseClient
          .from('leads')
          .select('*')
          .eq('email', email)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (!error && data) {
          lead = data;
        }
      } else {
        lead = await fetchLeadByEmail(email);
      }
    }

    return formatLeadForForm(lead);
  }

  /**
   * Récupère l'ID depuis l'URL
   */
  function getLeadIdFromUrl() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('leadId');
    } catch (error) {
      console.error('Erreur:', error);
      return null;
    }
  }

  /**
   * Récupère l'email depuis l'URL
   */
  function getEmailFromUrl() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('email');
    } catch (error) {
      console.error('Erreur:', error);
      return null;
    }
  }

  // Exposer l'API publique
  window.EffinorLeadFetcher = {
    fetchLeadData: fetchLeadData,
    getLeadIdFromUrl: getLeadIdFromUrl,
    getEmailFromUrl: getEmailFromUrl,
    initSupabase: initSupabase,
  };

})(window);

