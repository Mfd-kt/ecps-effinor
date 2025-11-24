import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { logger } from '@/utils/logger';
import { Loader2, Users, Plus, Search, Edit, Trash2, Eye, Filter } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import UserAvatar from '@/components/ui/UserAvatar';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { getAllUsers, deleteUser } from '@/lib/api/utilisateurs';
import { getAllRoles } from '@/lib/api/roles';
import ModalAjoutUtilisateur from '@/components/admin/ModalAjoutUtilisateur';
import ModalEditionUtilisateur from '@/components/admin/ModalEditionUtilisateur';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const AdminUtilisateurs = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userToDelete, setUserToDelete] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [allRoles, setAllRoles] = useState([]);
  const { toast } = useToast();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const loadUsers = useCallback(async () => {
    logger.log("Chargement des utilisateurs...");
    setLoading(true);
    setError(null);
    try {
      const result = await getAllUsers();
      if (result.success) {
        logger.log(`Utilisateurs chargés: ${result.data.length}`);
        setAllUsers(result.data || []);
      } else {
        throw new Error('Erreur lors du chargement des utilisateurs');
      }
    } catch (err) {
      logger.error("Erreur lors du chargement des utilisateurs:", err);
      setError("Impossible de charger la liste des utilisateurs. Veuillez réessayer.");
      toast({ 
        title: "Erreur", 
        description: err.message || "Erreur lors du chargement", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    // Vérifier que l'utilisateur est admin
    if (profile && !['admin', 'super_admin'].includes(profile.role)) {
      toast({
        variant: 'destructive',
        title: 'Accès refusé',
        description: 'Seuls les administrateurs peuvent accéder à cette page.'
      });
      return;
    }
    loadUsers();
    loadRoles();
  }, [loadUsers, profile, toast]);

  const loadRoles = async () => {
    try {
      const result = await getAllRoles();
      if (result.success) {
        setAllRoles(result.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement rôles:', error);
      // Ne pas bloquer si les rôles ne peuvent pas être chargés
    }
  };

  const handleDeleteRequest = (userId, userName) => {
    setUserToDelete({ id: userId, name: userName });
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete.id);
      toast({
        title: "Utilisateur supprimé",
        description: `L'utilisateur ${userToDelete.name} a été supprimé avec succès.`,
      });
      loadUsers();
    } catch (error) {
      toast({
        title: "Échec de la suppression",
        description: error.message || `L'utilisateur ${userToDelete.name} n'a pas pu être supprimé.`,
        variant: "destructive",
      });
      logger.error("Erreur de suppression:", error);
    } finally {
      setUserToDelete(null);
    }
  };

  const handleEdit = (userId) => {
    setSelectedUserId(userId);
    setEditModalOpen(true);
  };

  const handleAddSuccess = () => {
    loadUsers();
  };

  const handleEditSuccess = () => {
    loadUsers();
  };

  const filteredUsers = useMemo(() => {
    return allUsers.filter(user => {
      const roleMatch = roleFilter === 'all' || user.role === roleFilter;
      const statusMatch = statusFilter === 'all' || user.statut === statusFilter;
      const term = searchTerm.toLowerCase();
      const searchMatch = !term ||
        (user.full_name?.toLowerCase().includes(term)) ||
        (user.email?.toLowerCase().includes(term)) ||
        (user.prenom?.toLowerCase().includes(term)) ||
        (user.nom?.toLowerCase().includes(term));

      return roleMatch && statusMatch && searchMatch;
    });
  }, [allUsers, searchTerm, roleFilter, statusFilter]);

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-blue-100 text-blue-800',
      super_admin: 'bg-purple-100 text-purple-800',
      commercial: 'bg-green-100 text-green-800',
      technicien: 'bg-orange-100 text-orange-800',
      comptable: 'bg-yellow-100 text-yellow-800',
      lecture: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadgeColor = (statut) => {
    const colors = {
      actif: 'bg-green-100 text-green-800',
      suspendu: 'bg-red-100 text-red-800',
      parti: 'bg-gray-100 text-gray-800'
    };
    return colors[statut] || 'bg-gray-100 text-gray-800';
  };


  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
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

  if (profile && !['admin', 'super_admin'].includes(profile.role)) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h1>
        <p className="text-gray-600">Seuls les administrateurs peuvent accéder à cette page.</p>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Gestion des Utilisateurs | Effinor Admin</title></Helmet>
      <div className="admin-page p-4 md:p-8">
        <div className="page-header mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-8 w-8 text-secondary-500" />
              Utilisateurs
            </h1>
            <p className="text-gray-600 mt-1">
              {loading ? 'Chargement...' : `${filteredUsers.length} utilisateur${filteredUsers.length > 1 ? 's' : ''} trouvé${filteredUsers.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <Button
            onClick={() => setAddModalOpen(true)}
            className="bg-secondary-500 hover:bg-secondary-600 text-white"
          >
            <Plus className="mr-2 h-5 w-5" />
            Ajouter Utilisateur
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="filters-bar mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                {allRoles.map((role) => (
                  <SelectItem key={role.nom} value={role.nom}>{role.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="actif">Actif</SelectItem>
                <SelectItem value="suspendu">Suspendu</SelectItem>
                <SelectItem value="parti">Parti</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière connexion</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-secondary-500" />
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      Aucun utilisateur trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div 
                          className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => navigate(`/admin/utilisateurs/${user.id}`)}
                        >
                          <UserAvatar user={user} size="md" className="mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.full_name || `${user.prenom || ''} ${user.nom || ''}`.trim() || user.email}
                            </div>
                            {user.telephone && (
                              <div className="text-sm text-gray-500">{user.telephone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {allRoles.find(r => r.nom === user.role)?.label || user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusBadgeColor(user.statut)}>
                          {user.statut || 'actif'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.derniere_connexion)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user.id)}
                            className="text-secondary-600 hover:text-secondary-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {user.role !== 'super_admin' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRequest(user.id, user.full_name || user.email)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ModalAjoutUtilisateur
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={handleAddSuccess}
      />

      <ModalEditionUtilisateur
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        userId={selectedUserId}
        onSuccess={handleEditSuccess}
      />

      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur <strong>{userToDelete?.name}</strong> ? Cette action est irréversible et supprimera également le compte d'authentification.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminUtilisateurs;

