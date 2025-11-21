import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, RefreshCw } from 'lucide-react';
import { logger } from '@/utils/logger';
import ProductCard from '@/components/ProductCard';

const categoryFilters = [
  { id: 'all', name: 'Tous les produits' },
  { id: 'luminaires_industriels', name: 'Luminaires industriels' },
  { id: 'eclairage_exterieur', name: 'Éclairage extérieur' },
  { id: 'eclairage_etanche', name: 'Éclairage étanche' },
  { id: 'accessoires', name: 'Accessoires' },
];

const Boutique = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    logger.log("Attempting to connect to Supabase and load products...");

    try {
      const { data, error: supabaseError } = await supabase
        .from('products')
        .select('*')
        .eq('actif', true)
        .order('ordre', { ascending: true });

      if (supabaseError) throw supabaseError;

      logger.log(`Successfully loaded ${data.length} products.`);
      setAllProducts(data || []);
      // Initially display all products
      if (currentCategory === 'all') {
         setFilteredProducts(data || []);
      } else {
         setFilteredProducts(data.filter(p => p.categorie === currentCategory));
      }
    } catch (err) {
      logger.error("Error loading products:", err.message);
      setError("Une erreur est survenue lors du chargement des produits.");
    } finally {
      setLoading(false);
    }
  }, [currentCategory]);

  useEffect(() => {
     logger.log("Boutique component mounted. Supabase client is defined:", !!supabase);
    loadProducts();
  }, [loadProducts]);

  const handleFilterCategory = (category) => {
    logger.log(`Filtering by category: ${category}`);
    setCurrentCategory(category);
    if (category === 'all') {
      setFilteredProducts(allProducts);
      logger.log(`Displaying all ${allProducts.length} products.`);
    } else {
      const filtered = allProducts.filter(p => p.categorie === category);
      setFilteredProducts(filtered);
      logger.log(`Found ${filtered.length} products in category '${category}'.`);
    }
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
            {categoryFilters.map(filter => (
              <button 
                key={filter.id}
                className={`category-btn ${currentCategory === filter.id ? 'active' : ''}`}
                onClick={() => handleFilterCategory(filter.id)}
              >
                {filter.name}
              </button>
            ))}
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