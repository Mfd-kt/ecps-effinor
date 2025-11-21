import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { logger } from '@/utils/logger';
import { Activity, Clock, Link as LinkIcon, Monitor, Globe, UserCheck, UserX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AdminVisitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchVisitors = async () => {
    // No need for setLoading(true) here to avoid flicker on realtime updates
    try {
      const { data, error } = await supabase
        .from('visiteurs')
        .select('*')
        .order('last_seen', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      setVisitors(data);
    } catch (error) {
      logger.error('Error fetching visitors:', error);
      toast({
        title: "Erreur",
        description: `Impossible de charger les visiteurs: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchVisitors();

    const channel = supabase
      .channel('realtime-visitors-admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'visiteurs' },
        (payload) => {
          fetchVisitors(); // Refetch the list on any change
        }
      )
      .subscribe((status) => {
        if (status !== 'SUBSCRIBED') {
          logger.error('Failed to subscribe to visitors channel');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return 'N/A';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const getStatusProps = (status) => {
    if (status === 'active') {
      return {
        icon: <UserCheck className="h-5 w-5 text-secondary-500" />,
        badge: <Badge className="bg-secondary-500 hover:bg-secondary-600">Actif</Badge>
      };
    }
    return {
      icon: <UserX className="h-5 w-5 text-gray-500" />,
      badge: <Badge variant="secondary">Parti</Badge>
    };
  };

  return (
    <>
      <Helmet>
        <title>Suivi des Visiteurs | Effinor Admin</title>
      </Helmet>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Suivi des Visiteurs en Temps Réel</h1>
          <div className="flex items-center gap-2 text-secondary-600 font-semibold">
              <Activity className="h-5 w-5 animate-pulse" />
              <span>{visitors.filter(v => v.statut === 'active').length} en ligne</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
           {loading ? (
            <div className="text-center p-8">Chargement des données...</div>
          ) : visitors.length === 0 ? (
            <div className="text-center p-8 text-gray-600">Aucun visiteur pour le moment.</div>
          ) : (
            <div className="space-y-4">
              {visitors.map((visitor) => {
                const { icon, badge } = getStatusProps(visitor.statut);
                return (
                  <div key={visitor.id} className="border rounded-lg p-4 flex flex-col md:flex-row justify-between gap-4 transition-colors hover:bg-gray-50">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {icon}
                        <p className="font-bold text-gray-800">{visitor.ip_address}</p>
                        {badge}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <LinkIcon className="h-4 w-4" />
                        <span className="font-semibold">Page:</span>
                        <span className="hover:underline">{visitor.page_actuelle}</span>
                      </div>
                       <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Globe className="h-4 w-4" />
                        <span className="font-semibold">Source:</span>
                        <span className="truncate max-w-xs">{visitor.referer || 'Accès direct'}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 md:text-right space-y-2">
                      <div className="flex items-center justify-end gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(visitor.temps_session)}</span>
                      </div>
                      <div className="flex items-center justify-end gap-2 text-sm text-gray-600">
                          <Monitor className="h-4 w-4" />
                          <span className="truncate max-w-[200px]">{visitor.navigateur}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                          Dernière vue: {new Date(visitor.last_seen).toLocaleTimeString('fr-FR')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminVisitors;