import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, RefreshCw } from 'lucide-react';
import { logger } from '@/utils/logger';
import ProductCard from '@/components/ProductCard';

const Boutique = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState(null);

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
        .select('id, nom, description, prix, image_1, image_url, slug, actif, categorie, categorie_id, ordre')
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

  // Apply category filter to products
  const applyCategoryFilter = useCallback((products, category) => {
    if (category === 'all') {
      setFilteredProducts(products);
      logger.log(`Displaying all ${products.length} products.`);
    } else {
      // Filter by categorie_id (UUID) or categorie (slug) for backward compatibility
      const filtered = products.filter(p => {
        // Try to match by categorie_id first (new system - UUID)
        if (p.categorie_id && category && typeof category === 'string') {
          // Check if category is a UUID (36 chars) - new system
          if (category.length === 36) {
            return p.categorie_id === category;
          }
        }
        // Fallback to categorie slug (old system)
        // Also check if category matches slug in categories array
        const categoryObj = categories.find(c => c.id === category || c.slug === category);
        if (categoryObj) {
          // If we have categorie_id, match by it, otherwise match by slug
          if (p.categorie_id) {
            return p.categorie_id === categoryObj.id;
          }
          return p.categorie === categoryObj.slug || p.categorie === category;
        }
        return p.categorie === category;
      });
      setFilteredProducts(filtered);
      logger.log(`Found ${filtered.length} products in category '${category}'.`);
    }
  }, [categories]);

  useEffect(() => {
    logger.log("Boutique component mounted. Supabase client is defined:", !!supabase);
    loadCategories();
    loadProducts();
  }, [loadCategories, loadProducts]);

  // Apply filter when products or category changes
  useEffect(() => {
    if (allProducts.length > 0) {
      applyCategoryFilter(allProducts, currentCategory);
    }
  }, [currentCategory, allProducts, applyCategoryFilter]);

  const handleFilterCategory = (category) => {
    logger.log(`Filtering by category: ${category}`);
    setCurrentCategory(category);
  };

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

    if (filteredProducts.length === 0) {
      return (
        <div className="no-products">
          <span className="icon" role="img" aria-label="box icon">📦</span>
          <h3>Aucun produit disponible</h3>
          <p>Les produits pour cette catégorie seront bientôt disponibles.</p>
          <button onClick={loadProducts}><RefreshCw className="mr-2 h-4 w-4" /> Actualiser</button>
        </div>
      );
    }
    
    logger.log(`Displaying ${filteredProducts.length} products.`);
    return (
      <div className="products-grid">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Boutique - Catalogue de produits LED | EFFINOR</title>
        <meta name="description" content="Découvrez notre gamme complète de luminaires LED professionnels pour l'industrie, l'extérieur et les ateliers. Solutions haute performance éligibles CEE." />
      </Helmet>

      <section className="catalog-section">
        <div className="container mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1>Notre Catalogue</h1>
            <p className="subtitle">Solutions LED professionnelles haute performance</p>
          </motion.div>
          
          <div className="category-filters">
            <button 
              key="all"
              className={`category-btn ${currentCategory === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterCategory('all')}
            >
              Tous les produits
            </button>
            {!categoriesLoading && categories.map(category => (
              <button 
                key={category.id}
                className={`category-btn ${currentCategory === category.id || currentCategory === category.slug ? 'active' : ''}`}
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
          
          <div id="products-container">
            {renderContent()}
          </div>
        </div>
      </section>
    </>
  );
};

export default Boutique;