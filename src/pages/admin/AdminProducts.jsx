import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Edit, Trash2, Loader2, Copy, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
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
  return (
    <div className="product-card" data-product-id={product.id}>
      <div className="product-image">
        <img 
          src={product.image_url || `https://via.placeholder.com/400x300/F0F0F0/AAAAAA?text=${encodeURIComponent(product.nom)}`} 
          alt={product.nom} 
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
        <p className="product-description">{product.description}</p>
        
        <div className="product-specs">
          {product.puissance && <span>{product.puissance}</span>}
          {product.luminosite && <span>{product.luminosite}</span>}
        </div>
      </div>
      <div className="product-footer">
        <div className="product-price">
          {product.sur_devis ? (
            <span className="price-label">Sur devis</span>
          ) : (
            <span className="price">{product.prix ? `${product.prix} €` : 'N/A'}</span>
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
  const { toast } = useToast();
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: '', category: 'all', status: 'all' });

  const fetchProducts = useCallback(async () => {
    console.log("Starting to load products...");
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('products')
        .select('*')
        .order('ordre', { ascending: true });
        
      if (dbError) throw dbError;

      setAllProducts(data || []);
      console.log(`Successfully loaded ${data.length} products.`);
    } catch (err) {
      const errorMessage = `Chargement des produits échoué: ${err.message}`;
      setError(errorMessage);
      toast({ title: "Erreur de chargement", description: errorMessage, variant: "destructive" });
      console.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    console.log("AdminProducts component mounted.");
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      const searchMatch = filters.search.toLowerCase() === '' ||
        product.nom.toLowerCase().includes(filters.search.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(filters.search.toLowerCase())) ||
        (product.categorie && formatCategory(product.categorie).toLowerCase().includes(filters.search.toLowerCase()));
      
      const categoryMatch = filters.category === 'all' || product.categorie === filters.category;
      
      const statusMatch = filters.status === 'all' ||
        (filters.status === 'actif' && product.actif) ||
        (filters.status === 'inactif' && !product.actif);

      return searchMatch && categoryMatch && statusMatch;
    });
  }, [allProducts, filters]);

  const handleFilterChange = (filterName, value) => {
    console.log(`Filter changed: ${filterName}=${value}`);
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleEdit = (productId) => {
    console.log(`Editing product ${productId}`);
    navigate(`/admin/products/${productId}/edit`);
  };
  
  const handleDuplicateProduct = async (productId) => {
    console.log(`Duplicating product ${productId}`);
    const productToDuplicate = allProducts.find(p => p.id === productId);
    if (!productToDuplicate) return;

    const { id, created_at, updated_at, ...newProductData } = productToDuplicate;
    
    newProductData.nom = `${productToDuplicate.nom} (Copie)`;
    newProductData.slug = `${productToDuplicate.slug}-${Date.now()}`;
    newProductData.actif = false;
    newProductData.ordre = null;

    try {
      const { error } = await supabase.from('products').insert([newProductData]);
      if (error) throw error;
      toast({ title: "Produit dupliqué", description: `Le produit "${newProductData.nom}" a été créé.` });
      fetchProducts();
    } catch (error) {
      toast({ title: "Erreur de duplication", description: `La duplication a échoué: ${error.message}`, variant: "destructive" });
    }
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    console.log(`Toggling status for product ${productId} from ${currentStatus}`);
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
    console.log(`Deleting product ${productId}`);
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
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
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
                 <Link to="/admin/products/new">
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
            <p><span id="product-count">{allProducts.length}</span> produits au catalogue</p>
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
      </div>
    </>
  );
};

export default AdminProducts;