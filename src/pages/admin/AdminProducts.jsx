import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Edit, Trash2, Loader2, Copy, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/utils/logger';
import { sanitizeFormData } from '@/utils/sanitize';
import { getSpecSummary } from '@/utils/productSpecs';
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

const categoryMap = {
  'luminaires_industriels': 'Luminaires Industriels',
  'eclairage_exterieur': 'Éclairage Extérieur',
  'eclairage_etanche': 'Éclairage Étanche',
  'accessoires': 'Accessoires',
};

const formatCategory = (category) => categoryMap[category] || category;

const AdminProductCard = ({ product, onDuplicate, onDelete, onToggleStatus, onEdit }) => {
  const specSummary = getSpecSummary(product);

  return (
    <div className="product-card" data-product-id={product.id}>
      <div className="product-image">
        <img 
          src={product.image_url || product.image_1 || `https://via.placeholder.com/400x300/F0F0F0/AAAAAA?text=${encodeURIComponent(product.nom)}`} 
          alt={product.nom}
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/400x300/F0F0F0/AAAAAA?text=${encodeURIComponent(product.nom)}`;
            logger.warn(`Erreur de chargement d'image pour produit ${product.id}:`, product.image_url || product.image_1);
          }}
        />
        {product.prime_cee && (
          <div className="badge-cee">CEE</div>
        )}
      </div>
      <div className="product-info">
        <div className="product-header">
          <p className="product-category">{formatCategory(product.categorie)}</p>
          {product.actif ? (
            <span className="badge-active">Actif</span>
          ) : (
            <span className="badge-inactive">Inactif</span>
          )}
        </div>
        <h3 className="product-name">{product.nom}</h3>
        {(product.marque || product.reference) && (
          <p className="text-sm text-gray-600 mb-2">
            {product.marque && <span className="font-semibold text-gray-900">{product.marque}</span>}
            {product.marque && product.reference && <span className="mx-1 text-gray-400">—</span>}
            {product.reference && <span className="text-gray-500">Réf. {product.reference}</span>}
          </p>
        )}
        <p className="product-description">{product.description}</p>
        
        <div className="mt-3 text-xs text-gray-600 bg-gray-50 rounded-md px-3 py-2 border border-dashed border-gray-200">
          {specSummary ? (
            <span className="font-medium text-gray-700">{specSummary}</span>
          ) : (
            <span className="italic text-gray-400">Caractéristiques non renseignées</span>
          )}
        </div>
      </div>
      <div className="product-footer">
        <div className="product-price">
          {product.sur_devis || !product.prix || product.prix === '' || product.prix === null ? (
            <span className="price-label">Sur devis</span>
          ) : (
            <span className="price">
              {product.prix ? `${parseFloat(product.prix).toFixed(2)}€` : 'N/A'}
            </span>
          )}
        </div>
        <div className="product-actions">
          <Button variant="ghost" size="icon" onClick={() => onToggleStatus(product.id, product.actif)} title={product.actif ? "Désactiver" : "Activer"}>
            {product.actif ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(product.id)} title="Modifier">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDuplicate(product.id)} title="Dupliquer">
            <Copy className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-800 hover:bg-red-50" title="Supprimer">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce produit ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Le produit "{product.nom}" sera définitivement supprimé.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(product.id)} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

const AdminProducts = () => {
  // Note: La vérification des permissions est gérée par RequireRole dans App.jsx
  // Pas besoin de double vérification ici
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: '', category: 'all', status: 'all' });
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProducts = useCallback(async () => {
    logger.log("Starting to load products...");
    setLoading(true);
    setError(null);
    try {
      // Build query with server-side filters
      let query = supabase
        .from('products')
        .select('id, nom, description, prix, actif, categorie, slug, image_1, image_url, ordre, marque, reference, caracteristiques, prime_cee', { count: 'exact' });
      
      if (import.meta.env.DEV) {
        console.log('[AdminProducts] Tentative de chargement des produits...');
      }
      
      // Apply category filter (server-side)
      if (filters.category && filters.category !== 'all') {
        query = query.eq('categorie', filters.category);
      }
      
      // Apply status filter (server-side)
      if (filters.status && filters.status !== 'all') {
        const isActif = filters.status === 'actif';
        query = query.eq('actif', isActif);
      }
      
      // Apply ordering and pagination
      const { data, error: dbError, count } = await query
        .order('ordre', { ascending: true })
        .range(page * pageSize, (page + 1) * pageSize - 1);
      
      if (import.meta.env.DEV) {
        console.log('[AdminProducts] Résultat requête Supabase:', { data: data?.length, count, error: dbError });
      }
        
      if (dbError) {
        if (import.meta.env.DEV) {
          console.error('[AdminProducts] Erreur Supabase:', dbError);
          console.error('[AdminProducts] Code erreur:', dbError.code);
          console.error('[AdminProducts] Message:', dbError.message);
          console.error('[AdminProducts] Détails:', dbError.details);
          console.error('[AdminProducts] Hint:', dbError.hint);
        }
        
        // Afficher un toast si c'est une erreur RLS
        if (dbError.code === '42501' || dbError.message?.includes('row-level security') || dbError.message?.includes('permission denied')) {
          toast({
            variant: 'destructive',
            title: 'Erreur de permissions',
            description: 'Vous n\'avez pas les permissions nécessaires pour voir les produits. Vérifiez les politiques RLS dans Supabase.',
          });
        }
        
        throw dbError;
      }

      setAllProducts(data || []);
      setTotalCount(count || 0);
      logger.log(`Successfully loaded ${data?.length || 0} products (page ${page + 1}) with filters: category=${filters.category}, status=${filters.status}.`);
    } catch (err) {
      const errorMessage = `Chargement des produits échoué: ${err.message}`;
      setError(errorMessage);
      toast({ 
        title: "Erreur de chargement", 
        description: "Impossible de charger les produits. Vérifiez votre connexion internet et réessayez. Si le problème persiste, contactez le support technique.",
        variant: "destructive" 
      });
      logger.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [toast, page, pageSize, filters.category, filters.status]);

  useEffect(() => {
    logger.log("AdminProducts component mounted.");
    fetchProducts();
  }, [fetchProducts]);
  
  // Reset to page 0 when server-side filters change (not search)
  useEffect(() => {
    setPage(0);
  }, [filters.category, filters.status]);
  
  const totalPages = Math.ceil(totalCount / pageSize);
  const canGoPrevious = page > 0;
  const canGoNext = page < totalPages - 1;

  // Client-side search filter (applied to already filtered server results)
  const filteredProducts = useMemo(() => {
    if (!filters.search || filters.search.trim() === '') {
      return allProducts;
    }
    
    const searchLower = filters.search.toLowerCase();
    return allProducts.filter(product => {
      return product.nom.toLowerCase().includes(searchLower) ||
        (product.description && product.description.toLowerCase().includes(searchLower)) ||
        (product.categorie && formatCategory(product.categorie).toLowerCase().includes(searchLower));
    });
  }, [allProducts, filters.search]);

  const handleFilterChange = (filterName, value) => {
    logger.log(`Filter changed: ${filterName}=${value}`);
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleEdit = (productId) => {
    logger.log(`Editing product ${productId}`);
    navigate(`/produits/${productId}/edit`);
  };
  
  const handleDuplicateProduct = async (productId) => {
    logger.log(`Duplicating product ${productId}`);
    const productToDuplicate = allProducts.find(p => p.id === productId);
    if (!productToDuplicate) return;

    const { id, created_at, updated_at, ...newProductData } = productToDuplicate;
    
    newProductData.nom = `${productToDuplicate.nom} (Copie)`;
    newProductData.slug = `${productToDuplicate.slug}-${Date.now()}`;
    newProductData.actif = false;
    newProductData.ordre = null;

    try {
      // Sanitize data before insertion
      const sanitizedProductData = sanitizeFormData(newProductData);
      const { error } = await supabase.from('products').insert([sanitizedProductData]);
      if (error) throw error;
      toast({ title: "Produit dupliqué", description: `Le produit "${newProductData.nom}" a été créé.` });
      fetchProducts();
    } catch (error) {
      toast({ title: "Erreur de duplication", description: `La duplication a échoué: ${error.message}`, variant: "destructive" });
    }
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    logger.log(`Toggling status for product ${productId} from ${currentStatus}`);
    try {
      const { error } = await supabase.from('products').update({ actif: !currentStatus }).eq('id', productId);
      if (error) throw error;
      toast({ title: "Statut mis à jour", description: "Le statut du produit a été modifié avec succès." });
      fetchProducts();
    } catch (error) {
      toast({ title: "Erreur de mise à jour", description: `La mise à jour du statut a échoué: ${error.message}`, variant: "destructive" });
    }
  };

  const handleDelete = async (productId) => {
    logger.log(`Deleting product ${productId}`);
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      toast({ title: "Produit supprimé", description: "Le produit a été supprimé avec succès." });
      fetchProducts();
    } catch (error) {
      toast({ title: "Erreur de suppression", description: `La suppression a échoué: ${error.message}`, variant: "destructive" });
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-state flex flex-col items-center justify-center py-20 col-span-full text-center">
            <Loader2 className="h-12 w-12 animate-spin text-secondary-600 mb-4" />
            <p className="text-gray-600">Chargement des produits...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="error-state col-span-full text-center py-20">
          <span className="text-4xl" role="img" aria-label="error">❌</span>
          <h3 className="text-xl font-semibold mt-4">Erreur de chargement</h3>
          <p className="text-gray-600 my-2">{error}</p>
          <Button onClick={fetchProducts}>Réessayer</Button>
        </div>
      );
    }
    if (allProducts.length === 0) {
        return (
            <div className="empty-state col-span-full text-center py-20">
                <span className="text-6xl" role="img" aria-label="box">📦</span>
                <h3 className="text-2xl font-semibold mt-4">Aucun produit</h3>
                <p className="text-gray-600 my-2">Cliquez sur 'Ajouter un produit' pour commencer.</p>
                 <Link to="/produits/new">
                    <Button className="mt-4">Ajouter un produit</Button>
                </Link>
            </div>
        );
    }
    if (filteredProducts.length === 0) {
      return (
        <div className="empty-state col-span-full text-center py-20">
          <span className="text-6xl" role="img" aria-label="search">🕵️</span>
          <h3 className="text-2xl font-semibold mt-4">Aucun produit trouvé</h3>
          <p className="text-gray-600 my-2">Ajustez vos filtres ou créez un nouveau produit.</p>
        </div>
      );
    }
    return filteredProducts.map(product => (
      <AdminProductCard 
        key={product.id} 
        product={product} 
        onDuplicate={handleDuplicateProduct}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        onEdit={handleEdit}
      />
    ));
  };

  return (
    <>
      <Helmet><title>Gestion des Produits | Effinor Admin</title></Helmet>
      <div className="admin-page p-4 md:p-8">
        <div className="page-header">
          <div>
            <h1>📦 Gestion des Produits</h1>
            <p><span id="product-count">{totalCount}</span> produits au catalogue{filters.category !== 'all' || filters.status !== 'all' ? ' (filtrés)' : ''}</p>
          </div>
          <Link to="/admin/products/new">
            <Button className="btn-primary">
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un produit
            </Button>
          </Link>
        </div>
        
        <div className="filters-bar">
          <div className="search-box">
            <Input 
              type="text" 
              id="search-products" 
              placeholder="🔍 Rechercher un produit..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          
          <Select onValueChange={(value) => handleFilterChange('category', value)} value={filters.category}>
              <SelectTrigger className="w-full md:w-[200px] filter-select">
                  <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {Object.entries(categoryMap).map(([slug, name]) => (
                  <SelectItem key={slug} value={slug}>{name}</SelectItem>
                ))}
              </SelectContent>
          </Select>

          <Select onValueChange={(value) => handleFilterChange('status', value)} value={filters.status}>
              <SelectTrigger className="w-full md:w-[180px] filter-select">
                  <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="actif">Actifs</SelectItem>
                <SelectItem value="inactif">Inactifs</SelectItem>
              </SelectContent>
          </Select>
        </div>
        
        <div id="products-container" className="products-grid">
          {renderContent()}
        </div>
        
        {/* Pagination */}
        {totalCount > 0 && filteredProducts.length > 0 && (
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
                  Affichage de <span className="font-medium">{allProducts.length > 0 ? page * pageSize + 1 : 0}</span> à{' '}
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
    </>
  );
};

export default AdminProducts;