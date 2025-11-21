import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { logger } from '@/utils/logger';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, Loader2, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const AdminOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderLines, setOrderLines] = useState([]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error, count } = await supabase
        .from('commandes')
        .select('id, date_creation, nom_client, email, telephone, societe, statut, total', { count: 'exact' })
        .order('date_creation', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);
      
      if (error) throw error;
      setOrders(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      logger.error('Error fetching orders:', error);
      toast({ title: "Erreur", description: `Chargement commandes échoué: ${error.message}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);
  
  const totalPages = Math.ceil(totalCount / pageSize);
  const canGoPrevious = page > 0;
  const canGoNext = page < totalPages - 1;

  const handleViewDetails = async (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
    try {
      const { data, error } = await supabase.from('commandes_lignes').select('*, produit:products(image_1)').eq('commande_id', order.id);
        if (error) throw error;
        setOrderLines(data);
    } catch (error) {
        toast({ title: "Erreur", description: `Chargement lignes commande échoué: ${error.message}`, variant: "destructive" });
    }
  };
  
  const closeModal = () => {
    setIsDetailModalOpen(false);
    setSelectedOrder(null);
    setOrderLines([]);
  };

  const handleDeleteOrder = async (orderId) => {
      //... delete logic
      toast({
        title: 'Fonctionnalité non implémentée',
        description: "La suppression de commande n'est pas encore disponible.",
      });
  };

  return (
    <>
      <Helmet><title>Gestion des Commandes | Effinor Admin</title></Helmet>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestion des Devis & Commandes</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div> : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                {/* Table Header */}
                <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left">Client</th><th className="px-6 py-3 text-left">Date</th><th className="px-6 py-3 text-left">Statut</th><th className="px-6 py-3 text-right">Actions</th></tr></thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4">{order.nom_client}</td>
                      <td className="px-6 py-4">{new Date(order.date_creation).toLocaleDateString()}</td>
                      <td className="px-6 py-4"><Badge>{order.statut}</Badge></td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleViewDetails(order)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteOrder(order.id)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination */}
              {totalCount > 0 && (
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

        {isDetailModalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Détails de la commande #{selectedOrder.id.substring(0, 8)}</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-2 border-b pb-1">Lignes de commande</h3>
                  <div className="space-y-2">
                    {orderLines.map(line => (
                        <div key={line.id} className="flex items-center gap-4 p-2 bg-gray-50 rounded">
                            <img src={line.produit?.image_1 || 'https://via.placeholder.com/48'} alt={line.nom} className="h-12 w-12 object-cover rounded"/>
                            <div className="flex-grow">{line.nom}</div>
                            <div>x {line.quantite}</div>
                            <div>{line.prix_unitaire} €</div>
                        </div>
                    ))}
                  </div>
                  <Button size="sm" className="mt-2" onClick={() => toast({ title: '🚧 Bientôt disponible !'})}><PlusCircle className="h-4 w-4 mr-2"/>Ajouter Produit</Button>
                </div>
                {/* Other sections like Installation, CEE, Facturation */}
              </div>

              <div className="flex justify-end mt-6">
                <Button variant="outline" onClick={closeModal}>Fermer</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminOrders;