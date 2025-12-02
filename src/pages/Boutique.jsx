import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, RefreshCw, Filter, X } from 'lucide-react';
import { logger } from '@/utils/logger';
import ProductCard from '@/components/ProductCard';
import { normalizeCaracteristiques } from '@/utils/productSpecs';

const Boutique = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPowerRange, setSelectedPowerRange] = useState('all');
  const [selectedUsage, setSelectedUsage] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState(null);

  // Power ranges for filtering
  const powerRanges = [
    { value: 'all', label: 'Toutes puissances' },
    { value: '<100', label: '< 100 W' },
    { value: '100-200', label: '100 - 200 W' },
    { value: '200-300', label: '200 - 300 W' },
    { value: '>300', label: '> 300 W' },
  ];

  // Usage types (mapped from categories)
  const usageTypes = [
    { value: 'all', label: 'Tous usages' },
    { value: 'industriel', label: 'Industriel' },
    { value: 'tertiaire', label: 'Tertiaire' },
    { value: 'agricole', label: 'Agricole' },
  ];

  // Load categories from database
  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      logger.log('📦 Chargement des catégories...');
      const { data, error: categoriesError } = await supabase
        .from('categories')
        .select('id, nom, slug, ordre')
        .eq('actif', true)
        .order('ordre', { ascending: true });

      if (categoriesError) {
        // If categories table doesn't exist, use fallback
        if (categoriesError.message?.includes('relation') || categoriesError.message?.includes('does not exist')) {
          logger.warn('Table categories n\'existe pas. Utilisation du fallback.');
          // Fallback to hardcoded categories
          setCategories([
            { id: 'luminaires_industriels', nom: 'Luminaires industriels', slug: 'luminaires_industriels', ordre: 0 },
            { id: 'eclairage_exterieur', nom: 'Éclairage extérieur', slug: 'eclairage_exterieur', ordre: 1 },
            { id: 'eclairage_etanche', nom: 'Éclairage étanche', slug: 'eclairage_etanche', ordre: 2 },
            { id: 'accessoires', nom: 'Accessoires', slug: 'accessoires', ordre: 3 },
          ]);
        } else {
          throw categoriesError;
        }
      } else {
        logger.log(`✅ ${data.length} catégories chargées`);
        setCategories(data || []);
      }
    } catch (err) {
      logger.error('❌ Erreur chargement catégories:', err);
      // Fallback to hardcoded categories on error
      setCategories([
        { id: 'luminaires_industriels', nom: 'Luminaires industriels', slug: 'luminaires_industriels', ordre: 0 },
        { id: 'eclairage_exterieur', nom: 'Éclairage extérieur', slug: 'eclairage_exterieur', ordre: 1 },
        { id: 'eclairage_etanche', nom: 'Éclairage étanche', slug: 'eclairage_etanche', ordre: 2 },
        { id: 'accessoires', nom: 'Accessoires', slug: 'accessoires', ordre: 3 },
      ]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    logger.log("Attempting to connect to Supabase and load products...");

    try {
      const { data, error: supabaseError } = await supabase
        .from('products')
        .select('id, nom, description, prix, image_1, image_url, slug, actif, categorie, categorie_id, ordre, marque, reference, caracteristiques, puissance')
        .eq('actif', true)
        .order('ordre', { ascending: true });

      if (supabaseError) throw supabaseError;

      logger.log(`Successfully loaded ${data.length} products.`);
      
      // Log image URLs for debugging
      if (data && data.length > 0) {
        logger.log('Sample product images:', data.slice(0, 3).map(p => ({
          id: p.id,
          nom: p.nom,
          image_url: p.image_url,
          image_1: p.image_1
        })));
      }
      
      setAllProducts(data || []);
    } catch (err) {
      logger.error("Error loading products:", err.message);
      setError("Une erreur est survenue lors du chargement des produits.");
    } finally {
      setLoading(false);
    }
  }, []);

  const matchesSelectedCategory = useCallback((product, category) => {
    if (category === 'all') return true;

    // Try to match by categorie_id (UUID)
    if (product.categorie_id && category?.length === 36) {
      return product.categorie_id === category;
    }

    const categoryObj = categories.find((c) => c.id === category || c.slug === category);
    if (categoryObj) {
      if (product.categorie_id) {
        return product.categorie_id === categoryObj.id;
      }
      return product.categorie === categoryObj.slug || product.categorie === category;
    }

    return product.categorie === category;
  }, [categories]);

  const matchesPowerRange = useCallback((product, powerRange) => {
    if (powerRange === 'all') return true;
    
    const normalized = normalizeCaracteristiques(product);
    const puissance = normalized.specs.puissance_w || product.puissance;
    if (!puissance || typeof puissance !== 'number') return false;

    switch (powerRange) {
      case '<100':
        return puissance < 100;
      case '100-200':
        return puissance >= 100 && puissance <= 200;
      case '200-300':
        return puissance > 200 && puissance <= 300;
      case '>300':
        return puissance > 300;
      default:
        return true;
    }
  }, []);

  const matchesUsage = useCallback((product, usage) => {
    if (usage === 'all') return true;
    
    const categorySlug = product.categorie?.toLowerCase() || '';
    const categoryName = categories.find(c => c.id === product.categorie_id || c.slug === product.categorie)?.nom?.toLowerCase() || '';
    
    // Map categories to usage types
    const isIndustriel = categorySlug.includes('industri') || categoryName.includes('industri') || 
                         categorySlug.includes('highbay') || categorySlug.includes('atelier');
    const isTertiaire = categorySlug.includes('tertiaire') || categoryName.includes('tertiaire') ||
                        categorySlug.includes('bureau') || categorySlug.includes('reglette');
    const isAgricole = categorySlug.includes('agricol') || categoryName.includes('agricol') ||
                       categorySlug.includes('serre') || categorySlug.includes('elevage');

    switch (usage) {
      case 'industriel':
        return isIndustriel;
      case 'tertiaire':
        return isTertiaire;
      case 'agricole':
        return isAgricole;
      default:
        return true;
    }
  }, [categories]);

  const displayedProducts = useMemo(() => {
    if (!allProducts?.length) return [];
    return allProducts.filter((product) => {
      return matchesSelectedCategory(product, selectedCategory) &&
             matchesPowerRange(product, selectedPowerRange) &&
             matchesUsage(product, selectedUsage);
    });
  }, [allProducts, selectedCategory, selectedPowerRange, selectedUsage, matchesSelectedCategory, matchesPowerRange, matchesUsage]);

  useEffect(() => {
    logger.log("Boutique component mounted. Supabase client is defined:", !!supabase);
    loadCategories();
    loadProducts();
  }, [loadCategories, loadProducts]);

  const handleFilterCategory = (category) => {
    logger.log(`Filtering by category: ${category}`);
    setSelectedCategory(category);
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedPowerRange('all');
    setSelectedUsage('all');
    setShowAdvancedFilters(false);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (selectedPowerRange !== 'all') count++;
    if (selectedUsage !== 'all') count++;
    return count;
  }, [selectedCategory, selectedPowerRange, selectedUsage]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-secondary-500" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-message">
          <span className="icon" role="img" aria-label="error icon">❌</span>
          <h3>Une erreur est survenue</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Réessayer</button>
        </div>
      );
    }

    if (displayedProducts.length === 0) {
      return (
        <div className="no-products">
          <span className="icon" role="img" aria-label="box icon">📦</span>
          <h3>Aucun produit disponible</h3>
          <p>Les produits pour cette catégorie seront bientôt disponibles.</p>
          <button onClick={loadProducts}><RefreshCw className="mr-2 h-4 w-4" /> Actualiser</button>
        </div>
      );
    }
    
    logger.log(`Displaying ${displayedProducts.length} products.`);
    return (
      <div className="products-grid">
        {displayedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Boutique - Catalogue de produits LED | EFFINOR</title>
        <meta name="description" content="Découvrez notre gamme complète de luminaires LED professionnels pour l'industrie, l'extérieur et les ateliers. Solutions haute performance, livraison rapide, prix compétitifs." />
      </Helmet>

      <section className="catalog-section">
        <div className="container mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1>Notre Catalogue</h1>
            <p className="subtitle">Solutions LED professionnelles haute performance</p>
          </motion.div>
          
          {/* Main Filters: Categories */}
          <div className="category-filters mb-6">
            <button 
              key="all"
              className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterCategory('all')}
            >
              Tous les produits
            </button>
            {!categoriesLoading && categories.map(category => (
              <button 
                key={category.id}
                className={`category-btn ${selectedCategory === category.id || selectedCategory === category.slug ? 'active' : ''}`}
                onClick={() => handleFilterCategory(category.id)}
              >
                {category.nom}
              </button>
            ))}
            {categoriesLoading && (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Chargement des catégories...</span>
              </div>
            )}
          </div>

          {/* Advanced Filters */}
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:border-secondary-500 hover:bg-secondary-50 transition-colors text-sm font-medium"
            >
              <Filter className="h-4 w-4" />
              Filtres avancés
              {activeFiltersCount > 0 && (
                <span className="bg-secondary-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:border-red-500 hover:bg-red-50 transition-colors text-sm font-medium text-red-600"
              >
                <X className="h-4 w-4" />
                Réinitialiser
              </button>
            )}
            <div className="text-sm text-gray-600">
              {displayedProducts.length} produit{displayedProducts.length > 1 ? 's' : ''} trouvé{displayedProducts.length > 1 ? 's' : ''}
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Power Range Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Puissance
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {powerRanges.map(range => (
                      <button
                        key={range.value}
                        onClick={() => setSelectedPowerRange(range.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedPowerRange === range.value
                            ? 'bg-secondary-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Usage Type Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Usage recommandé
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {usageTypes.map(usage => (
                      <button
                        key={usage.value}
                        onClick={() => setSelectedUsage(usage.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedUsage === usage.value
                            ? 'bg-secondary-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                      >
                        {usage.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div id="products-container">
            {renderContent()}
          </div>
        </div>
      </section>
    </>
  );
};

export default Boutique;