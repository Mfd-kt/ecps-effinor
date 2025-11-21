import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast.js';
import { logger } from '@/utils/logger';
import { Loader2, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Link } from 'react-router-dom';

const getStatusVariant = (status) => {
  switch (status) {
    case 'Nouveau': return 'default';
    case 'En cours': return 'secondary';
    case 'Signé': return 'success';
    case 'Refusé': return 'destructive';
    case 'Hors cible': return 'outline';
    default: return 'default';
  }
};

const AdminLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error, count } = await supabase
        .from('leads')
        .select('id, nom, email, telephone, societe, created_at, statut, source, priorite', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);
      
      if (error) throw error;
      setLeads(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      logger.error('Error fetching leads:', error);
      toast({ title: "Erreur", description: `Chargement des leads échoué: ${error.message}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, toast]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const canGoPrevious = page > 0;
  const canGoNext = page < totalPages - 1;

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce lead définitivement ?")) return;

    try {
      // First delete related notes
      const { error: notesError } = await supabase
        .from('leads_notes')
        .delete()
        .eq('lead_id', leadId);
      
      // Check if notes deletion failed
      if (notesError) {
        throw new Error(`Erreur lors de la suppression des notes: ${notesError.message}`);
      }
      
      // Then delete the lead
      const { error: leadError } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);
      
      // Check if lead deletion failed
      if (leadError) {
        throw new Error(`Erreur lors de la suppression du lead: ${leadError.message}`);
      }

      // Refresh leads list after deletion
      fetchLeads();
      toast({ title: "Succès", description: "Lead supprimé." });
    } catch (error) {
      logger.error('Error deleting lead:', error);
      toast({ 
        title: "Erreur", 
        description: `Impossible de supprimer le lead: ${error.message}`, 
        variant: "destructive" 
      });
    }
  };

  return (
    <>
      <Helmet><title>Gestion des Leads | Effinor Admin</title></Helmet>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestion des Leads</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          {loading ? <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin inline-block text-secondary-600" /></div> : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map(lead => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(lead.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.nom}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.source}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusVariant(lead.statut)}>{lead.statut || 'Nouveau'}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/admin/leads/${lead.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteLead(lead.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
                        Affichage de <span className="font-medium">{leads.length > 0 ? page * pageSize + 1 : 0}</span> à{' '}
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

export default AdminLeads;