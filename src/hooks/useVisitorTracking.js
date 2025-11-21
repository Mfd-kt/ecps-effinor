import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext'; // Utiliser le contexte d'authentification

let sessionStartTime = null;
let visitorId = null; // Store the visitor ID for the session

export const useVisitorTracking = () => {
  const location = useLocation();
  const { supabase } = useAuth(); // Récupérer le client Supabase depuis le contexte
  const updateIntervalRef = useRef(null);
  const isTrackingRef = useRef(false);

  // Function to get IP address (best effort)
  const getIpAddress = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      if (!response.ok) return null;
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error("Could not fetch IP address:", error);
      return null;
    }
  };

  const startTrackingSession = async () => {
    if (!supabase || location.pathname.startsWith('/admin') || visitorId) return;

    isTrackingRef.current = true;
    sessionStartTime = Date.now();
    const clientIp = await getIpAddress();

    const { data, error } = await supabase
      .from('visiteurs')
      .insert([{
        ip_address: clientIp,
        page_actuelle: window.location.pathname,
        referer: document.referrer || null,
        navigateur: navigator.userAgent || null,
        statut: 'active'
      }])
      .select('id')
      .single();

    if (error) {
      console.error("Error starting visitor session:", error);
    } else if (data) {
      visitorId = data.id;
    }
    isTrackingRef.current = false;
  };
  
  const updateTrackingSession = async () => {
    if (!supabase || !visitorId || isTrackingRef.current) return;
    isTrackingRef.current = true;

    const temps_session = Math.floor((Date.now() - (sessionStartTime || Date.now())) / 1000);
    const { error } = await supabase
      .from('visiteurs')
      .update({
        last_seen: new Date().toISOString(),
        page_actuelle: location.pathname,
        temps_session
      })
      .eq('id', visitorId);

    if (error) {
      console.error("Error updating visitor session:", error);
    }
    isTrackingRef.current = false;
  };

  const endTrackingSession = async () => {
      if (supabase && visitorId) {
          await supabase
            .from('visiteurs')
            .update({ statut: 'left', last_seen: new Date().toISOString() })
            .eq('id', visitorId);
          visitorId = null;
      }
  };


  useEffect(() => {
    if (!supabase) return;
    
    const consent = localStorage.getItem('cookie-consent');
    if (consent !== 'accepted' || location.pathname.startsWith('/admin')) {
      return;
    }

    if (!visitorId) {
        startTrackingSession();
    }
    
    clearInterval(updateIntervalRef.current);
    updateIntervalRef.current = setInterval(updateTrackingSession, 15000);

    window.addEventListener('beforeunload', endTrackingSession);

    return () => {
      clearInterval(updateIntervalRef.current);
      window.removeEventListener('beforeunload', endTrackingSession);
    };
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;

    const consent = localStorage.getItem('cookie-consent');
    if (consent === 'accepted' && visitorId) {
      updateTrackingSession();
    }
  }, [location.pathname, supabase]);
};