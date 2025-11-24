import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Skeleton from '@/components/ui/Skeleton';
import { 
  Plus, Search, Filter, Trash2, Eye, Edit, 
  FileText, Loader2, Calendar, Euro
} from 'lucide-react';
import { getAllOperations, deleteOperation, STATUSES } from '@/lib/api/operations';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Admin Operations CEE Page
 * Liste des opérations CEE avec filtres et actions
 */
const AdminOperations = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState({
    statut: 'all',
    leadId: 'all',
    ficheCeeId: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Load operations
  const loadOperations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getAllOperations({
        filters,
        page,
        pageSize,
        sortBy: 'date_creation',
        sortOrder: 'desc'
      });

      if (result.success) {
        setOperations(result.data || []);
        setTotalPages(result.totalPages || 1);
        setTotalCount(result.count || 0);
      } else {
        throw new Error(result.error || 'Erreur lors du chargement');
      }
    } catch (err) {
      console.error('Error loading operations:', err);
      setError(err.message);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les opérations CEE.'
      });
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize, toast]);

  useEffect(() => {
    loadOperations();
  }, [loadOperations]);

  // Handle delete
  const handleDelete = async (id) => {
    try {
      const result = await deleteOperation(id);
      if (result.success) {
        toast({
          title: 'Opération supprimée',
          description: 'L\'opération CEE a été supprimée avec succès.'
        });
        loadOperations();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de supprimer l\'opération.'
      });
    }
  };

  // Format amount
  const formatAmount = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = STATUSES[status] || STATUSES.brouillon;
    const colorMap = {
      gray: 'bg-gray-100 text-gray-800 border-gray-300',
      blue: 'bg-blue-100 text-blue-800 border-blue-300',
      green: 'bg-green-100 text-green-800 border-green-300',
      red: 'bg-red-100 text-red-800 border-red-300',
      slate: 'bg-slate-100 text-slate-800 border-slate-300'
    };
    return colorMap[statusConfig.color] || colorMap.gray;
  };

  // Get lead display name
  const getLeadDisplay = (lead) => {
    if (!lead) return '-';
    if (lead.email) return lead.email;
    if (lead.nom || lead.prenom) {
      return `${lead.prenom || ''} ${lead.nom || ''}`.trim();
    }
    if (lead.societe) return lead.societe;
    return '-';
  };

  return (
    <>
      <Helmet>
        <title>Opérations CEE | CRM Effinor</title>
      </Helmet>

      <div className="admin-page p-4 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Opérations CEE</h1>
              <p className="text-gray-600 mt-1 text-sm">Gérez vos opérations CEE et leurs critères</p>
            </div>
            <Button
              onClick={() => navigate('/admin/operations/new')}
              className="bg-[#0EA5E9] hover:bg-[#0284c7] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle opération
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filters.statut}
              onValueChange={(value) => setFilters({ ...filters, statut: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {Object.entries(STATUSES).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ statut: 'all', leadId: 'all', ficheCeeId: 'all' })}
            >
              Réinitialiser
            </Button>
          </div>
        </div>

        {/* Operations Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 flex-1" />
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-12 w-24" />
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={loadOperations}
              >
                Réessayer
              </Button>
            </div>
          ) : operations.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Aucune opération CEE trouvée</p>
              <Button
                onClick={() => navigate('/admin/operations/new')}
                className="bg-[#0EA5E9] hover:bg-[#0284c7] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer une opération
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fiche CEE
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lead associé
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prime estimée
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {operations.map((operation) => (
                      <tr
                        key={operation.id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/admin/operations/${operation.id}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {formatDate(operation.date_creation || operation.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {operation.fiche?.numero || '-'}
                          </div>
                          {operation.fiche?.slug && (
                            <div className="text-xs text-gray-500">{operation.fiche.slug}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className={getStatusBadge(operation.statut)}
                          >
                            {STATUSES[operation.statut]?.label || operation.statut}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getLeadDisplay(operation.lead)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="flex items-center gap-1">
                            <Euro className="h-4 w-4 text-gray-400" />
                            {formatAmount(operation.prime_estimee)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/operations/${operation.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/operations/${operation.id}?edit=true`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Supprimer l'opération</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Êtes-vous sûr de vouloir supprimer cette opération CEE ? Cette action est irréversible.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(operation.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Affichage de {(page - 1) * pageSize + 1} à {Math.min(page * pageSize, totalCount)} sur {totalCount} opérations
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Précédent
                    </Button>
                    <span className="text-sm text-gray-700">
                      Page {page} sur {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminOperations;

