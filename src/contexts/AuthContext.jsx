/**
 * Contexte d'authentification centralisé pour l'application ECPS/Effinor
 * 
 * Ce contexte fournit une interface unifiée pour gérer l'authentification Supabase
 * dans toute l'application React. Il encapsule la logique d'authentification et
 * expose un état réactif pour les composants enfants.
 * 
 * Valeurs exposées :
 * - user : L'utilisateur Supabase authentifié (ou null si non connecté)
 * - session : La session Supabase complète (ou null si non connecté)
 * - loading : État de chargement initial (true au démarrage, false une fois la session récupérée)
 * - error : Message d'erreur éventuel (string ou null)
 * - signInWithPassword({ email, password }) : Méthode pour se connecter avec email/mot de passe
 * - signOut() : Méthode pour se déconnecter
 * 
 * Toutes les futures fonctionnalités d'authentification (mot de passe oublié, mise à jour
 * de profil, etc.) devront passer par ce contexte pour maintenir une cohérence dans l'application.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Création du contexte
export const AuthContext = createContext(null);

/**
 * Provider d'authentification
 * 
 * Gère l'état d'authentification et les abonnements aux changements de session Supabase.
 * Fournit les méthodes d'authentification aux composants enfants.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupération de la session au montage et abonnement aux changements
  useEffect(() => {
    // Récupérer la session actuelle
    const getSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          if (import.meta.env.DEV) {
            console.error('[AuthContext] Erreur récupération session:', sessionError);
          }
          setError(sessionError.message);
          setSession(null);
          setUser(null);
        } else {
          // Vérifier que la session n'est pas expirée
          if (session && session.expires_at) {
            const expiresAt = new Date(session.expires_at * 1000);
            const now = new Date();
            if (expiresAt < now) {
              // Session expirée
              if (import.meta.env.DEV) {
                console.log('[AuthContext] Session expirée, déconnexion...');
              }
              await supabase.auth.signOut();
              setSession(null);
              setUser(null);
              setError('Votre session a expiré. Veuillez vous reconnecter.');
            } else {
              setSession(session);
              setUser(session?.user ?? null);
              setError(null);
            }
          } else {
            setSession(session);
            setUser(session?.user ?? null);
            setError(null);
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('[AuthContext] Erreur inattendue:', err);
        }
        setError(err.message || 'Erreur lors de la récupération de la session');
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Vérification périodique de la session (toutes les 5 minutes)
    const sessionCheckInterval = setInterval(async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error || !currentSession) {
          // Session invalide ou expirée
          setSession(null);
          setUser(null);
          if (error && import.meta.env.DEV) {
            console.error('[AuthContext] Erreur vérification session périodique:', error);
          }
        } else {
          // Vérifier l'expiration
          if (currentSession.expires_at) {
            const expiresAt = new Date(currentSession.expires_at * 1000);
            const now = new Date();
            const timeUntilExpiry = expiresAt.getTime() - now.getTime();
            
            // Si la session expire dans moins de 1 minute, essayer de la rafraîchir
            if (timeUntilExpiry < 60000 && timeUntilExpiry > 0) {
              if (import.meta.env.DEV) {
                console.log('[AuthContext] Rafraîchissement de la session...');
              }
              const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
              if (refreshError) {
                console.error('[AuthContext] Erreur rafraîchissement session:', refreshError);
                setSession(null);
                setUser(null);
              } else if (refreshedSession) {
                setSession(refreshedSession);
                setUser(refreshedSession.user);
              }
            } else if (timeUntilExpiry <= 0) {
              // Session expirée
              await supabase.auth.signOut();
              setSession(null);
              setUser(null);
            }
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('[AuthContext] Erreur vérification session périodique:', err);
        }
      }
    }, 5 * 60 * 1000); // Toutes les 5 minutes

    // S'abonner aux changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (import.meta.env.DEV) {
          console.log('[AuthContext] Auth state changed:', event, newSession?.user?.email);
        }
        
        // Gérer les événements spécifiques
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          setError(null);
        } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          setError(null);
        } else {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          setError(null);
        }
        
        setLoading(false);
      }
    );

    // Nettoyer les abonnements au démontage
    return () => {
      clearInterval(sessionCheckInterval);
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Connexion avec email et mot de passe
   * 
   * @param {Object} credentials - { email: string, password: string }
   * @returns {Promise<{ error: Error | null }>}
   */
  const signInWithPassword = async ({ email, password }) => {
    setError(null);
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        if (import.meta.env.DEV) {
          console.error('[AuthContext] Erreur signInWithPassword:', signInError);
        }
        setError(signInError.message);
        setLoading(false);
        return { error: signInError };
      }

      // La session sera mise à jour automatiquement via onAuthStateChange
      if (import.meta.env.DEV) {
        console.log('[AuthContext] Connexion réussie:', data.user?.email);
      }
      
      setError(null);
      setLoading(false);
      return { error: null };
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[AuthContext] Erreur inattendue signInWithPassword:', err);
      }
      const errorMessage = err.message || 'Une erreur inattendue est survenue lors de la connexion';
      setError(errorMessage);
      setLoading(false);
      return { error: err };
    }
  };

  /**
   * Déconnexion de l'utilisateur
   * 
   * @returns {Promise<{ error: Error | null }>}
   */
  const signOut = async () => {
    setError(null);
    setLoading(true);

    try {
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        if (import.meta.env.DEV) {
          console.error('[AuthContext] Erreur signOut:', signOutError);
        }
        setError(signOutError.message);
        setLoading(false);
        return { error: signOutError };
      }

      // Réinitialiser l'état local
      setUser(null);
      setSession(null);
      setError(null);

      if (import.meta.env.DEV) {
        console.log('[AuthContext] Déconnexion réussie');
      }

      setLoading(false);
      return { error: null };
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[AuthContext] Erreur inattendue signOut:', err);
      }
      const errorMessage = err.message || 'Une erreur inattendue est survenue lors de la déconnexion';
      setError(errorMessage);
      setLoading(false);
      return { error: err };
    }
  };

  // Valeur du contexte
  const value = {
    user,
    session,
    loading,
    error,
    signInWithPassword,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook personnalisé pour accéder au contexte d'authentification
 * 
 * @returns {Object} Le contexte d'authentification
 * @throws {Error} Si utilisé en dehors d'un AuthProvider
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return ctx;
}








