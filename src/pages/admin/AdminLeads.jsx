import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabaseClient'; // Changed import
import { useToast } from '@/components/ui/use-toast.js';
import { Loader2, Trash2, Eye } from 'lucide-react';
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
  const { toast } = useToast();

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setLeads(data);
      } catch (error) {
        toast({ title: "Erreur", description: `Chargement des leads échoué: ${error.message}`, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, [toast]);

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce lead définitivement ?")) return;

    try {
      // First delete related notes
      await supabase.from('leads_notes').delete().eq('lead_id', leadId);
      // Then delete the lead
      const { error } = await supabase.from('leads').delete().eq('id', leadId);
      if (error) throw error;

      setLeads(prev => prev.filter(lead => lead.id !== leadId));
      toast({ title: "Succès", description: "Lead supprimé." });
    } catch (error) {
      toast({ title: "Erreur", description: `Impossible de supprimer le lead: ${error.message}`, variant: "destructive" });
    }
  };

  return (
    <>
      <Helmet><title>Gestion des Leads | Effinor Admin</title></Helmet>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestion des Leads</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          {loading ? <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin inline-block text-[#116BAD]" /></div> : (
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
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminLeads;