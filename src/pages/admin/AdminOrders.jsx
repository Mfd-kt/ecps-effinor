import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { logger } from '@/utils/logger';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, Loader2, PlusCircle, ChevronLeft, ChevronRight, Package } from 'lucide-react';

const AdminOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [orderLinesCounts, setOrderLinesCounts] = useState({});

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      logger.log('📦 Chargement des commandes...');
      
      const start = page * pageSize;
      const end = start + pageSize - 1;
      
      // Try to fetch orders - use date_creation (standard column name)
      let { data, error: fetchError, count } = await supabase
        .from('commandes')
        .select('*', { count: 'exact' })
        .order('date_creation', { ascending: false })
        .range(start, end);
      
      // If error with date_creation, try without ordering (or with id)
      if (fetchError && fetchError.message?.includes('column') && fetchError.message?.includes('date_creation')) {
        logger.warn('⚠️ Colonne date_creation non trouvée, tentative sans tri ou avec id...');
        // Try ordering by id instead
        ({ data, error: fetchError, count } = await supabase
          .from('commandes')
          .select('*', { count: 'exact' })
          .order('id', { ascending: false })
          .range(start, end));
      }
      
      if (fetchError) {
        logger.error('❌ Erreur Supabase commandes:', fetchError);
        logger.error('❌ Détails:', {
          message: fetchError.message,
          code: fetchError.code,
          details: fetchError.details,
          hint: fetchError.hint
        });
        
        // Check for specific errors
        if (fetchError.message?.includes('relation "public.commandes" does not exist') || 
            fetchError.message?.includes('relation commandes does not exist')) {
          logger.warn('⚠️ Table commandes n\'existe pas');
          setOrders([]);
          setTotalCount(0);
          setError('La table "commandes" n\'existe pas dans la base de données.');
          setLoading(false);
          return;
        }
        
        // For column errors, try without ordering
        if (fetchError.message?.includes('column') || fetchError.code === '42703') {
          logger.warn('⚠️ Erreur de colonne, tentative sans tri...');
          const { data: fallbackData, error: fallbackError, count: fallbackCount } = await supabase
            .from('commandes')
            .select('*', { count: 'exact' })
            .range(start, end);
          
          if (!fallbackError) {
            logger.log(`✅ ${fallbackData.length} commandes chargées (sans tri)`);
            setOrders(fallbackData || []);
            setTotalCount(fallbackCount || 0);
            setLoading(false);
            return;
          }
        }
        
        // If still error, show it
        throw fetchError;
      }
      
      if (!data) {
        logger.warn('⚠️ Aucune donnée retournée');
        setOrders([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }
      
      logger.log(`✅ ${data.length} commandes chargées`);
      setOrders(data || []);
      setTotalCount(count || 0);
      
      // Fetch order lines counts for each order (non-blocking)
      if (data && data.length > 0) {
        try {
          const orderIds = data.map(o => o.id);
          const { data: linesData, error: linesError } = await supabase
            .from('commandes_lignes')
            .select('commande_id')
            .in('commande_id', orderIds);
          
          if (!linesError && linesData) {
            const counts = {};
            linesData.forEach(line => {
              counts[line.commande_id] = (counts[line.commande_id] || 0) + 1;
            });
            setOrderLinesCounts(counts);
          }
        } catch (linesErr) {
          logger.warn('⚠️ Erreur chargement compteurs lignes (non bloquant):', linesErr);
        }
      }
    } catch (err) {
      logger.error('❌ Erreur chargement commandes:', err);
      const errorMessage = err.message || 'Une erreur est survenue lors du chargement des commandes.';
      setError(errorMessage);
      setOrders([]);
      setTotalCount(0);
      toast({ 
        title: "Erreur de chargement", 
        description: errorMessage,
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  
  const totalPages = Math.ceil(totalCount / pageSize);
  const canGoPrevious = page > 0;
  const canGoNext = page < totalPages - 1;

  // Get status badge color
  const getStatusColor = (statut) => {
    const statusConfig = {
      'Nouveau Devis': 'bg-blue-100 text-blue-800',
      'Devis envoyé': 'bg-purple-100 text-purple-800',
      'En cours': 'bg-yellow-100 text-yellow-800',
      'Validé': 'bg-green-100 text-green-800',
      'Annulé': 'bg-red-100 text-red-800',
    };
    return statusConfig[statut] || 'bg-gray-100 text-gray-800';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Debug: Log render state
  logger.log('🔍 AdminOrders render:', { loading, error, ordersCount: orders.length, totalCount });

  return (
    <>
      <Helmet><title>Gestion des Commandes | Effinor Admin</title></Helmet>
      <div className="admin-page p-4 md:p-8">
        <div className="page-header mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Gestion des Devis & Commandes</h1>
            <p className="text-gray-600 mt-1">
              {loading ? 'Chargement...' : `${totalCount} commande${totalCount > 1 ? 's' : ''} au total`}
            </p>
          </div>
          {!loading && (
            <Button
              onClick={() => fetchOrders()}
              variant="outline"
              size="sm"
            >
              Actualiser
            </Button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-red-600 text-2xl">⚠️</div>
              <div className="flex-1">
                <h3 className="font-bold text-red-800 mb-2">Erreur de chargement</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading && !error ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-secondary-500 mx-auto mb-4" />
                <p className="text-gray-600">Chargement des commandes...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {orders.length === 0 && !loading && (
                <div className="p-12 text-center">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune commande</h3>
                  <p className="text-gray-600 mb-4">
                    {error ? 'Impossible de charger les commandes.' : 'Il n\'y a aucune commande pour le moment.'}
                  </p>
                  {error && (
                    <Button onClick={() => fetchOrders()} variant="outline" className="mt-2">
                      Réessayer
                    </Button>
                  )}
                </div>
              )}
              {orders.length > 0 && (
                <>
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Client</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Société</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Statut</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Nb Produits</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 font-mono">
                              {order.id.slice(0, 8)}...
                            </code>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatDate(order.date_creation || order.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{order.nom_client || '-'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">{order.email || '-'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">{order.societe || '-'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={getStatusColor(order.statut)}>
                              {order.statut || 'Nouveau Devis'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium">
                                {orderLinesCounts[order.id] || 0}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {order.total ? (
                              <span className="font-semibold text-gray-900">
                                {parseFloat(order.total).toFixed(2)}€
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              to={`/admin/orders/${order.id}`}
                              className="inline-flex items-center px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors text-sm font-medium"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Voir détail
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
              
              {/* Pagination */}
              {totalCount > 0 && orders.length > 0 && (
                <div className="mt-6 flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
                  <div className="flex flex-1 justify-between sm:hidden">
                    <Button
                      variant="outline"
                      onClick={() => setPage(prev => Math.max(0, prev - 1))}
                      disabled={!canGoPrevious}
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
                      disabled={!canGoNext}
                    >
                      Suivant
                    </Button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Affichage de <span className="font-medium">{orders.length > 0 ? page * pageSize + 1 : 0}</span> à{' '}
                        <span className="font-medium">{Math.min((page + 1) * pageSize, totalCount)}</span> sur{' '}
                        <span className="font-medium">{totalCount}</span> résultats
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(prev => Math.max(0, prev - 1))}
                        disabled={!canGoPrevious}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Précédent
                      </Button>
                      <span className="text-sm text-gray-700">
                        Page {page + 1} sur {totalPages || 1}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
                        disabled={!canGoNext}
                      >
                        Suivant
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminOrders;