// src/lib/visitorTracker.js
import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/utils/logger';

const STORAGE_KEY = 'effinor_visitor_session_id';
const VISITOR_ID_KEY = 'effinor_visitor_id';

/**
 * Génère un UUID v4 simple (compatible navigateur)
 */
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback pour navigateurs plus anciens
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Récupère ou crée un session_id dans localStorage
 */
function getSessionId() {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = generateUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

/**
 * Récupère le visiteur_id depuis localStorage
 */
export function getVisitorId() {
  return localStorage.getItem(VISITOR_ID_KEY);
}

/**
 * Stocke le visiteur_id dans localStorage
 */
function setVisitorId(id) {
  localStorage.setItem(VISITOR_ID_KEY, id);
}

/**
 * Détermine le type d'appareil basé sur la largeur de l'écran
 */
function getDeviceType() {
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Parse le User-Agent pour extraire le navigateur et l'OS
 */
function parseUserAgent(userAgent) {
  const ua = userAgent || navigator.userAgent;
  
  // Browser detection
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  
  if (ua.includes('Chrome') && !ua.includes('Edg')) {
    browserName = 'Chrome';
    const match = ua.match(/Chrome\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (ua.includes('Firefox')) {
    browserName = 'Firefox';
    const match = ua.match(/Firefox\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browserName = 'Safari';
    const match = ua.match(/Version\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (ua.includes('Edg')) {
    browserName = 'Edge';
    const match = ua.match(/Edg\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  }
  
  // OS detection
  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS X') || ua.includes('Macintosh')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.match(/iPhone|iPad|iPod/)) os = 'iOS';
  
  return { browserName, browserVersion, os };
}

/**
 * Extrait les paramètres UTM et le referrer de l'URL
 */
function getSourceTraffic() {
  const url = new URL(window.location.href);
  const referrer = document.referrer;
  
  // Extraire les UTM
  const utmSource = url.searchParams.get('utm_source');
  const utmMedium = url.searchParams.get('utm_medium');
  const utmCampaign = url.searchParams.get('utm_campaign');
  const utmContent = url.searchParams.get('utm_content');
  const utmTerm = url.searchParams.get('utm_term');
  
  return {
    referrer_url: referrer || null,
    utm_source: utmSource || null,
    utm_medium: utmMedium || null,
    utm_campaign: utmCampaign || null,
    utm_content: utmContent || null,
    utm_term: utmTerm || null,
  };
}

/**
 * Track une page vue
 */
export async function trackPageView() {
  try {
    // Vérifier le consentement cookies
    const consent = localStorage.getItem('cookie-consent');
    if (consent !== 'accepted') {
      return;
    }

    // Ne pas tracker les pages admin
    if (window.location.pathname.startsWith('/admin') || 
        window.location.pathname.startsWith('/dashboard') ||
        window.location.pathname.startsWith('/login') ||
        window.location.pathname.startsWith('/espace-client')) {
      return;
    }

    const sessionId = getSessionId();
    const page = window.location.pathname + window.location.search;
    const deviceType = getDeviceType();
    const sourceTraffic = getSourceTraffic();
    const { browserName, browserVersion, os } = parseUserAgent();
    const navigateur = navigator.userAgent;
    const now = new Date().toISOString();

    // 1) Vérifier s'il existe déjà un visiteur pour cette session
    const { data: existing, error: selectError } = await supabase
      .from('visiteurs')
      .select('id, nombre_pages_vues, parcours, landing_page, is_new_visitor')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (selectError) {
      logger.error('[VisitorTracker] select error', selectError);
      return;
    }

    if (!existing) {
      // 2) Première page de la session → INSERT
      const insertData = {
        session_id: sessionId,
        page_actuelle: page,
        landing_page: page,
        referrer_url: sourceTraffic.referrer_url,
        utm_source: sourceTraffic.utm_source,
        utm_medium: sourceTraffic.utm_medium,
        utm_campaign: sourceTraffic.utm_campaign,
        utm_content: sourceTraffic.utm_content,
        utm_term: sourceTraffic.utm_term,
        navigateur,
        browser_name: browserName,
        browser_version: browserVersion,
        os,
        device_type: deviceType,
        appareil: deviceType, // Garder pour compatibilité
        statut: 'active',
        nombre_pages_vues: 1,
        parcours: JSON.stringify([page]),
        created_at: now,
        derniere_activite: now,
        last_seen: now,
        is_new_visitor: true,
        a_converti: false,
      };

      // Nettoyer les valeurs null pour éviter les erreurs
      Object.keys(insertData).forEach(key => {
        if (insertData[key] === null) {
          delete insertData[key];
        }
      });

      const { data: insertedData, error: insertError } = await supabase
        .from('visiteurs')
        .insert(insertData)
        .select('id')
        .single();

      if (insertError) {
        logger.error('[VisitorTracker] insert error', insertError);
      } else if (insertedData?.id) {
        // Stocker le visiteur_id pour les événements
        setVisitorId(insertedData.id);
        
        // Logger l'événement page_view
        await logVisitEvent({
          event_type: 'page_view',
          page,
          page_title: document.title,
        });
      }
    } else {
      // 3) Session déjà connue → UPDATE
      const previousCount = Number(existing.nombre_pages_vues || 0);
      let parcours = [];

      try {
        if (existing.parcours) {
          parcours = Array.isArray(existing.parcours)
            ? existing.parcours
            : JSON.parse(existing.parcours);
        }
      } catch (e) {
        parcours = [];
      }

      // Ajouter la nouvelle page si elle est différente de la dernière
      const lastPage = parcours[parcours.length - 1];
      if (lastPage !== page) {
        parcours.push(page);
      }

      const updateData = {
        page_actuelle: page,
        exit_page: page, // Mettre à jour la page de sortie
        referrer_url: sourceTraffic.referrer_url || existing.referrer_url,
        utm_source: sourceTraffic.utm_source || existing.utm_source,
        utm_medium: sourceTraffic.utm_medium || existing.utm_medium,
        utm_campaign: sourceTraffic.utm_campaign || existing.utm_campaign,
        utm_content: sourceTraffic.utm_content || existing.utm_content,
        utm_term: sourceTraffic.utm_term || existing.utm_term,
        navigateur,
        browser_name: browserName,
        browser_version: browserVersion,
        os,
        device_type: deviceType,
        appareil: deviceType, // Garder pour compatibilité
        statut: 'active',
        nombre_pages_vues: previousCount + 1,
        parcours: JSON.stringify(parcours),
        derniere_activite: now,
        last_seen: now,
      };

      // Nettoyer les valeurs null pour éviter les erreurs
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === null) {
          delete updateData[key];
        }
      });

      const { error: updateError } = await supabase
        .from('visiteurs')
        .update(updateData)
        .eq('id', existing.id);

      if (updateError) {
        logger.error('[VisitorTracker] update error', updateError);
      } else {
        // S'assurer que le visiteur_id est stocké
        setVisitorId(existing.id);
        
        // Logger l'événement page_view seulement si c'est une nouvelle page
        if (lastPage !== page) {
          await logVisitEvent({
            event_type: 'page_view',
            page,
            page_title: document.title,
          });
        }
      }
    }
  } catch (err) {
    logger.error('[VisitorTracker] error', err);
  }
}

/**
 * Log un événement de visite dans visites_events
 */
export async function logVisitEvent(params = {}) {
  try {
    // Vérifier le consentement cookies
    const consent = localStorage.getItem('cookie-consent');
    if (consent !== 'accepted') {
      return;
    }

    // Ne pas tracker les pages admin
    if (window.location.pathname.startsWith('/admin') || 
        window.location.pathname.startsWith('/dashboard') ||
        window.location.pathname.startsWith('/login') ||
        window.location.pathname.startsWith('/espace-client')) {
      return;
    }

    let visiteurId = getVisitorId();
    if (!visiteurId) {
      // Si pas de visiteur_id, essayer de le récupérer depuis la session
      const sessionId = getSessionId();
      const { data: visitor } = await supabase
        .from('visiteurs')
        .select('id')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (visitor?.id) {
        setVisitorId(visitor.id);
        visiteurId = visitor.id;
      } else {
        return; // Pas de visiteur, on ne peut pas logger
      }
    }

    const payload = {
      visiteur_id: visiteurId,
      event_type: params.event_type || 'page_view',
      page: params.page || window.location.pathname + window.location.search,
      page_title: params.page_title || document.title,
      referrer: params.referrer || document.referrer || null,
      scroll_pct: params.scroll_pct ?? null,
      time_on_page_ms: params.time_on_page_ms ?? null,
      extra: params.extra ? JSON.stringify(params.extra) : null,
    };

    // Nettoyer les valeurs null
    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        delete payload[key];
      }
    });

    const { error } = await supabase.from('visites_events').insert(payload);
    
    if (error) {
      logger.error('[VisitorTracker] logVisitEvent error', error);
    }
  } catch (err) {
    logger.error('[VisitorTracker] logVisitEvent error', err);
  }
}

/**
 * Marque une conversion (ex: soumission de formulaire, achat)
 */
export async function trackConversion(eventType = 'conversion', eventData = {}) {
  try {
    const consent = localStorage.getItem('cookie-consent');
    if (consent !== 'accepted') {
      return;
    }

    const sessionId = getSessionId();
    const now = new Date().toISOString();

    // Trouver le visiteur actuel
    const { data: visitor, error: selectError } = await supabase
      .from('visiteurs')
      .select('id, events')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (selectError || !visitor) {
      logger.error('[VisitorTracker] conversion tracking error', selectError);
      return;
    }

    // Mettre à jour les événements
    let events = [];
    try {
      if (visitor.events) {
        events = Array.isArray(visitor.events) 
          ? visitor.events 
          : JSON.parse(visitor.events);
      }
    } catch (e) {
      events = [];
    }

    events.push({
      type: eventType,
      timestamp: now,
      data: eventData,
    });

    // Mettre à jour le visiteur
    const { error: updateError } = await supabase
      .from('visiteurs')
      .update({
        a_converti: true,
        conversion_at: now,
        events: JSON.stringify(events),
        last_seen: now,
        derniere_activite: now,
      })
      .eq('id', visitor.id);

    if (updateError) {
      logger.error('[VisitorTracker] conversion update error', updateError);
    } else {
      // Logger l'événement de conversion
      await logVisitEvent({
        event_type: eventType,
        extra: eventData,
      });
    }
  } catch (err) {
    logger.error('[VisitorTracker] conversion error', err);
  }
}

