import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '@/hooks/usePageSEO';
import SEOHead from '@/components/SEOHead';
import ImageGallery from '@/components/ImageGallery';
import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/utils/logger';
import { ArrowRight, Loader2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/use-toast';

const ProduitsSolutions = () => {
  const seo = usePageSEO('/produits-solutions');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, nom, description, prix, image_1, image_2, image_3, image_4, image_url, slug, actif, categorie, marque, reference, caracteristiques, puissance')
        .eq('actif', true)
        .order('ordre', { ascending: true });

      if (error) {
        // Si la table n'existe pas encore, retourner un tableau vide
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          logger.warn('[ProduitsSolutions] Table products does not exist yet');
          setProducts([]);
          return;
        }
        throw error;
      }
      setProducts(data || []);
    } catch (err) {
      logger.error('[ProduitsSolutions] Error fetching products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (supabaseUrl && imagePath) {
      return `${supabaseUrl}/storage/v1/object/public/effinor-assets/${imagePath}`;
    }
    return null;
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    toast({
      title: "✅ Produit ajouté au panier !",
      description: `${product.nom} a été ajouté au panier.`,
    });
  };

  return (
    <>
      <SEOHead
        metaTitle={seo.metaTitle}
        metaDescription={seo.metaDescription}
        ogImage={seo.ogImage}
        isIndexable={seo.isIndexable}
        h1={seo.h1 || 'Produits & Solutions LED professionnels'}
        intro={seo.intro}
      />

      <div className="min-h-screen bg-white overflow-x-hidden">
        <div className="container mx-auto px-3 md:px-4 py-4 md:py-6 lg:py-8 max-w-7xl overflow-x-hidden">
          <div className="max-w-[95%] sm:max-w-lg md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                {seo.h1 || 'Produits & Solutions LED professionnels'}
              </h1>
              {seo.intro && (
                <p className="text-sm md:text-base text-gray-600">
                  {seo.intro}
                </p>
              )}
              {!seo.intro && (
                <p className="text-sm md:text-base text-gray-600">
                  Découvrez notre gamme complète de luminaires LED et solutions d'éclairage professionnel.
                </p>
              )}
            </div>

            {/* Liste des produits */}
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--secondary-500)]" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 text-sm mb-2">Aucun produit disponible.</p>
                <p className="text-gray-500 text-xs">
                  Les produits seront disponibles une fois la base de données configurée.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-8">
              {products.map((product) => {
                const imageUrl = getImageUrl(product.image_1 || product.image_url);
                return (
                <div
                  key={product.id}
                  className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[var(--secondary-500)]/30"
                >
                  <div className="relative">
                    <div 
                      className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer relative z-10"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (imageUrl) {
                          const allImages = [
                            product.image_1 || product.image_url,
                            product.image_2,
                            product.image_3,
                            product.image_4
                          ].filter(Boolean).map(img => getImageUrl(img));
                          if (allImages.length > 0) {
                            setGalleryImages(allImages);
                            setGalleryIndex(0);
                            setGalleryOpen(true);
                          }
                        }
                      }}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.nom}
                          className="w-full h-full object-contain p-3 md:p-4 lg:p-2 max-w-[80%] max-h-[80%] mx-auto group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/400x400/e2e8f0/e2e8f0?text=Image';
                          }}
                        />
                      ) : (
                        <div className="text-gray-400 text-xs">Pas d'image</div>
                      )}
                    </div>
                  </div>
                  <Link to={`/produit/${product.slug}`}>
                    <div className="p-2 md:p-3">
                      {product.marque && (
                        <p className="text-[10px] md:text-xs text-gray-500 mb-0.5 md:mb-1 uppercase tracking-wide">
                          {product.marque}
                        </p>
                      )}
                      <h3 className="text-xs md:text-sm lg:text-base font-bold text-gray-900 mb-0.5 md:mb-1 group-hover:text-[var(--secondary-500)] transition-colors line-clamp-2">
                        {product.nom}
                      </h3>
                      {product.reference && (
                        <p className="text-[10px] md:text-xs text-gray-500 mb-1 md:mb-1.5">
                          Réf: {product.reference}
                        </p>
                      )}
                      {product.description && (
                        <p className="text-gray-600 mb-1.5 md:mb-2 line-clamp-2 text-[10px] md:text-xs leading-relaxed">
                          {product.description}
                        </p>
                      )}
                      {product.puissance && (
                        <p className="text-[10px] md:text-xs text-gray-700 mb-1 md:mb-1.5">
                          <strong>Puissance:</strong> {product.puissance}W
                        </p>
                      )}
                      {product.prix && (
                        <p className="text-sm md:text-base lg:text-lg font-bold text-[var(--secondary-500)] mb-1.5 md:mb-2">
                          {typeof product.prix === 'number' 
                            ? `${product.prix.toFixed(2)} €` 
                            : product.prix}
                        </p>
                      )}
                    </div>
                  </Link>
                  <div className="px-2 md:px-3 pb-2 md:pb-3 flex flex-col sm:flex-row gap-1.5 md:gap-2">
                    <Link
                      to={`/produit/${product.slug}`}
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full text-[10px] md:text-xs py-1.5 md:py-2 h-auto">
                        Voir détails
                        <ArrowRight className="ml-1 h-2.5 w-2.5 md:h-3 md:w-3" />
                      </Button>
                    </Link>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
                      className="bg-[var(--secondary-500)] hover:bg-[var(--secondary-600)] text-[10px] md:text-xs py-1.5 md:py-2 h-auto px-2 md:px-3 w-full sm:w-auto"
                    >
                      <ShoppingCart className="h-2.5 w-2.5 md:h-3 md:w-3" />
                    </Button>
                  </div>
                </div>
                );
              })}
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-3 md:p-4 lg:p-6 text-center">
              <h2 className="text-sm md:text-base lg:text-lg font-bold text-gray-900 mb-1.5 md:mb-2">
                Besoin d'un conseil personnalisé ?
              </h2>
              <p className="text-[10px] md:text-xs lg:text-sm text-gray-600 mb-3 md:mb-4">
                Notre équipe d'experts est à votre disposition pour vous guider.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center px-3 md:px-4 py-1.5 md:py-2 bg-[var(--secondary-500)] text-white rounded-lg hover:bg-[var(--secondary-600)] transition-all font-semibold text-[10px] md:text-xs lg:text-sm shadow-sm hover:shadow-md"
              >
                Demander un devis
                <ArrowRight className="ml-1.5 md:ml-2 h-2.5 w-2.5 md:h-3 md:w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery Modal */}
      <ImageGallery
        images={galleryImages}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        initialIndex={galleryIndex}
      />
    </>
  );
};

export default ProduitsSolutions;

