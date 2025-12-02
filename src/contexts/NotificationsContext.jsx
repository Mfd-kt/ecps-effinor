/**
 * Contexte de notifications temps réel
 * 
 * Gère les notifications depuis la table notifications de Supabase.
 * S'abonne à Supabase Realtime pour recevoir les nouvelles notifications en direct.
 * 
 * @example
 * ```jsx
 * import { useNotifications } from '@/contexts/NotificationsContext';
 * 
 * const MyComponent = () => {
 *   const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
 *   
 *   return (
 *     <div>
 *       {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
 *       <button onClick={markAllAsRead}>Marquer tout comme lu</button>
 *     </div>
 *   );
 * };
 * ```
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/utils/logger';
import { toast } from '@/components/ui/use-toast';
import { useUser } from '@/contexts/UserContext';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
} from '@/services/notifications';

const NotificationsContext = createContext(null);

/**
 * Provider du contexte de notifications
 */
export const NotificationsProvider = ({ children }) => {
  const { profile } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Référence pour la subscription Realtime
  const channelRef = useRef(null);

  /**
   * Charge les notifications depuis Supabase
   * Pour les commerciaux, filtre automatiquement par recipient_user_id
   */
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Charger les notifications (RLS filtre déjà, mais on peut ajouter un filtre explicite pour les commerciaux)
      let data = await fetchNotifications({ limit: 50 });
      
      // Double vérification côté client pour les commerciaux
      if (profile?.role?.slug === 'commercial' && profile?.id) {
        data = (data || []).filter(n => 
          // Notification destinée à ce commercial OU notification globale (sans recipient)
          n.recipient_user_id === profile.id || 
          (n.recipient_user_id === null && n.recipient_role === null)
        );
      }
      
      setNotifications(data || []);

      // Charger le nombre de non lues (RLS filtre déjà)
      const count = await getUnreadCount();
      setUnreadCount(count);

      if (import.meta.env.DEV) {
        logger.log('[NotificationsContext] Notifications chargées:', data?.length || 0, 'Non lues:', count, 'Profil:', profile?.role?.slug);
      }
    } catch (err) {
      logger.error('[NotificationsContext] Erreur chargement notifications:', err);
      setError(err.message || 'Erreur lors du chargement des notifications');
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  /**
   * Marque une notification comme lue
   */
  const markAsRead = useCallback(async (id) => {
    try {
      await markNotificationAsRead(id);
      
      // Mettre à jour localement
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, status: 'read', read_at: new Date().toISOString() }
            : n
        )
      );
      
      // Décrémenter le compteur
      setUnreadCount((prev) => Math.max(0, prev - 1));
      
      if (import.meta.env.DEV) {
        logger.log('[NotificationsContext] Notification marquée comme lue:', id);
      }
    } catch (err) {
      logger.error('[NotificationsContext] Erreur markAsRead:', err);
    }
  }, []);

  /**
   * Marque toutes les notifications comme lues
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
      
      // Mettre à jour localement
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          status: 'read',
          read_at: n.read_at || new Date().toISOString(),
        }))
      );
      
      setUnreadCount(0);
      
      if (import.meta.env.DEV) {
        logger.log('[NotificationsContext] Toutes les notifications marquées comme lues');
      }
    } catch (err) {
      logger.error('[NotificationsContext] Erreur markAllAsRead:', err);
    }
  }, []);

  /**
   * Fonction pour jouer un son de notification (optionnel)
   */
  const playNotificationSound = useCallback(() => {
    try {
      // Créer un son court et discret
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // Fréquence en Hz
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Ignorer les erreurs audio (navigateur ne supporte pas, etc.)
      if (import.meta.env.DEV) {
        logger.log('[NotificationsContext] Impossible de jouer le son:', error);
      }
    }
  }, []);

  /**
   * Fonction pour obtenir l'icône selon le type de notification
   */
  const getNotificationIcon = useCallback((type) => {
    switch (type) {
      case 'lead_created':
      case 'lead_assigned':
        return '👤';
      case 'order_created':
      case 'order_assigned':
        return '🛒';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  }, []);

  /**
   * Setup Realtime subscription
   */
  useEffect(() => {
    // Subscription pour les nouvelles notifications
    const channel = supabase
      .channel('realtime:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotification = payload.new;
          
          if (import.meta.env.DEV) {
            logger.log('[NotificationsContext] ✨ Nouvelle notification en temps réel:', newNotification);
          }
          
          // Vérifier que la notification est pour l'utilisateur actuel
          // Pour les commerciaux, on vérifie que recipient_user_id correspond à leur ID
          if (profile?.role?.slug === 'commercial' && profile?.id) {
            // Si c'est une notification pour un commercial, vérifier qu'elle lui est destinée
            if (newNotification.recipient_user_id && newNotification.recipient_user_id !== profile.id) {
              // Cette notification n'est pas pour ce commercial, l'ignorer
              if (import.meta.env.DEV) {
                logger.log('[NotificationsContext] Notification ignorée (pas pour ce commercial):', newNotification.id);
              }
              return;
            }
          }
          
          // Ajouter la nouvelle notification en début de liste
          setNotifications((prev) => {
            // Éviter les doublons
            if (prev.some((n) => n.id === newNotification.id)) {
              return prev;
            }
            // Ajouter en début et limiter à 50
            return [newNotification, ...prev].slice(0, 50);
          });
          
          // Incrémenter le compteur si non lue
          if (newNotification.status === 'unread') {
            setUnreadCount((prev) => prev + 1);
            
            // Afficher un toast pour les nouvelles notifications non lues
            const icon = getNotificationIcon(newNotification.type);
            toast({
              title: `${icon} ${newNotification.title}`,
              description: newNotification.message || '',
              duration: 6000,
              // Le toast s'affiche automatiquement via le Toaster dans App.jsx
            });
            
            // Jouer un son discret (optionnel, seulement si l'utilisateur est sur la page)
            // On vérifie que la page est visible pour ne pas déranger si l'utilisateur est sur un autre onglet
            if (typeof window !== 'undefined' && !document.hidden) {
              try {
                if ('AudioContext' in window || 'webkitAudioContext' in window) {
                  playNotificationSound();
                }
              } catch (error) {
                // Ignorer les erreurs audio silencieusement
              }
            }
            
            // Vibration sur mobile (si supportée et page visible)
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator && !document.hidden) {
              try {
                navigator.vibrate(200);
              } catch (error) {
                // Ignorer les erreurs de vibration
              }
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          if (import.meta.env.DEV) {
            logger.log('[NotificationsContext] Notification mise à jour:', payload.new);
          }
          
          // Mettre à jour la notification dans la liste
          setNotifications((prev) =>
            prev.map((n) => (n.id === payload.new.id ? payload.new : n))
          );
          
          // Mettre à jour le compteur si le statut a changé
          if (payload.old.status === 'unread' && payload.new.status === 'read') {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          } else if (payload.old.status === 'read' && payload.new.status === 'unread') {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe((status) => {
        if (import.meta.env.DEV) {
          logger.log('[NotificationsContext] Statut subscription Realtime:', status);
        }
        
        if (status === 'SUBSCRIBED') {
          logger.log('[NotificationsContext] ✅ Abonné au canal Realtime notifications');
        } else if (status === 'CHANNEL_ERROR') {
          logger.error('[NotificationsContext] ❌ Erreur subscription Realtime');
        }
      });

    channelRef.current = channel;

    // Cleanup
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        if (import.meta.env.DEV) {
          logger.log('[NotificationsContext] 🔌 Désabonné du canal Realtime');
        }
      }
    };
  }, [playNotificationSound, profile]);

  /**
   * Charger les notifications au montage et quand le profil change
   */
  useEffect(() => {
    if (profile) {
      refresh();
    }
  }, [refresh, profile]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

/**
 * Hook pour accéder au contexte de notifications
 * 
 * @returns {Object} { notifications, unreadCount, loading, error, refresh, markAsRead, markAllAsRead }
 */
export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
