/**
 * Contexte utilisateur global pour gérer le profil utilisateur
 * 
 * Ce contexte charge et maintient les données du profil utilisateur depuis la table `utilisateurs`
 * et les expose à toute l'application. Il se synchronise avec AuthContext pour charger
 * automatiquement le profil quand l'utilisateur se connecte.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/utils/logger';

const UserContext = createContext(null);

/**
 * Provider du contexte utilisateur
 * 
 * @param {Object} props
 * @param {Object} props.user - Utilisateur depuis AuthContext (passé depuis le parent)
 * @param {React.ReactNode} props.children
 */
export const UserProvider = ({ children, user: authUser }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Charge le profil utilisateur depuis la table utilisateurs
   */
  const loadProfile = useCallback(async (userId, userEmail) => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('utilisateurs')
        .select(`
          *,
          role:roles!utilisateurs_role_id_fkey(slug, label, nom)
        `)
        .eq('auth_user_id', userId)
        .maybeSingle();

      if (fetchError) {
        logger.error('[UserContext] Erreur chargement profil:', fetchError);
        setError(fetchError.message);
        setProfile(null);
        return;
      }

      if (data) {
        setProfile(data);
        logger.log('[UserContext] Profil chargé:', data.email);
        
        // Logs de debug pour vérifier la structure du profil et de la relation role
        if (import.meta.env.DEV) {
          console.log('[UserContext] Structure du profil chargé:', {
            id: data.id,
            email: data.email,
            role_id: data.role_id,
            role: data.role,
            roleSlug: data.role?.slug,
            roleLabel: data.role?.label,
            roleNom: data.role?.nom,
            hasRoleRelation: !!data.role,
            profileKeys: Object.keys(data)
          });
        }
      } else {
        // Profil n'existe pas encore, créer un profil minimal
        logger.log('[UserContext] Profil non trouvé, création...');
        // Trouver le rôle par défaut (commercial ou premier rôle disponible)
        const { data: defaultRole } = await supabase
          .from('roles')
          .select('id')
          .eq('slug', 'commercial')
          .maybeSingle();
        
        const roleId = defaultRole?.id || null;
        
        const { data: newProfile, error: createError } = await supabase
          .from('utilisateurs')
          .insert({
            auth_user_id: userId,
            email: userEmail || '',
            prenom: '',
            nom: '',
            full_name: userEmail || '',
            role_id: roleId,
          })
          .select(`
            *,
            role:roles!utilisateurs_role_id_fkey(slug, label, nom)
          `)
          .single();

        if (createError) {
          logger.error('[UserContext] Erreur création profil:', createError);
          setError(createError.message);
        } else {
          setProfile(newProfile);
          logger.log('[UserContext] Profil créé:', newProfile.email);
          
          // Logs de debug pour vérifier la structure du nouveau profil
          if (import.meta.env.DEV) {
            console.log('[UserContext] Structure du nouveau profil créé:', {
              id: newProfile.id,
              email: newProfile.email,
              role_id: newProfile.role_id,
              role: newProfile.role,
              roleSlug: newProfile.role?.slug,
              hasRoleRelation: !!newProfile.role
            });
          }
        }
      }
    } catch (err) {
      logger.error('[UserContext] Erreur inattendue:', err);
      setError(err.message || 'Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Recharge le profil depuis la base de données
   */
  const refreshProfile = useCallback(async () => {
    if (authUser?.id) {
      await loadProfile(authUser.id, authUser.email);
    }
  }, [authUser, loadProfile]);

  /**
   * Met à jour le profil localement (optimistic update)
   */
  const updateProfile = useCallback((updates) => {
    setProfile(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  // Charger le profil quand l'utilisateur change
  useEffect(() => {
    if (authUser?.id) {
      loadProfile(authUser.id, authUser.email);
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [authUser?.id, authUser?.email, loadProfile]);

  const value = {
    profile,
    loading,
    error,
    refreshProfile,
    updateProfile,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

/**
 * Hook pour accéder au contexte utilisateur
 */
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

