import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabaseClient'; // Changed import
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, Loader2, PlusCircle } from 'lucide-react';

const AdminOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderLines, setOrderLines] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('commandes').select('*').order('date_creation', { ascending: false });
      if (error) throw error;
      setOrders(data);
    } catch (error) {
      toast({ title: "Erreur", description: `Chargement commandes échoué: ${error.message}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

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