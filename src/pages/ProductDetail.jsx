import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/utils/logger';
import { 
  Loader2, Award, ShieldCheck, Phone, ArrowLeft, ShoppingCart, 
  Download, FileText, CheckCircle2, Zap, Lightbulb, Clock, 
  TrendingUp, Star, Heart, Maximize2, ChevronLeft, ChevronRight,
  Package, Truck, RotateCcw, ArrowRight
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const ProductDetail = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [imageZoom, setImageZoom] = useState(false);
  const [expandedSpecs, setExpandedSpecs] = useState(false);
  const [fichesCEE, setFichesCEE] = useState([]);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  const formatCategory = useCallback((categorySlug) => {
    if (!categorySlug) return '';
    const names = {
      'luminaires_industriels': 'Luminaires Industriels',
      'eclairage_exterieur': 'Éclairage Extérieur',
      'eclairage_etanche': 'Éclairage Étanche',
      'accessoires': 'Accessoires',
    };
    return names[categorySlug] || categorySlug.replace(/_/g, ' ').toUpperCase();
  }, []);

  // Construct image URL helper
  const getImageUrl = useCallback((imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return imagePath;
    if (supabaseUrl) {
      return `${supabaseUrl}/storage/v1/object/public/effinor-assets/${imagePath}`;
    }
    return imagePath;
  }, [supabaseUrl]);

  // Parse characteristics helper
  const parseCharacteristics = useMemo(() => {
    if (!product?.caracteristiques) return [];
    
    try {
      const parsed = JSON.parse(product.caracteristiques);
      if (Array.isArray(parsed)) {
        return parsed;
      } else if (typeof parsed === 'object') {
        return Object.entries(parsed).map(([key, value]) => ({
          label: key,
          value: value
        }));
      }
    } catch (e) {
      const text = product.caracteristiques;
      if (typeof text === 'string') {
        const lines = text.split(/\n|;/).filter(line => line.trim());
        return lines.map(line => {
          const [label, ...valueParts] = line.split(':');
          return {
            label: label?.trim() || line.trim(),
            value: valueParts.join(':').trim() || ''
          };
        });
      }
    }
    return [];
  }, [product?.caracteristiques]);

  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) {
        setError("Aucun produit spécifié.");
        setLoading(false);
        return;
      }

      logger.log(`Fetching product with slug: ${slug}`);
      setLoading(true);
      setError(null);

      try {
        const { data, error: supabaseError } = await supabase
          .from('products')
          .select('id, nom, description, prix, categorie, slug, actif, image_1, image_2, image_3, image_4, image_url, caracteristiques, fiche_technique, puissance, luminosite, prime_cee, sur_devis, ordre')
          .eq('slug', slug)
          .eq('actif', true)
          .single();

        if (supabaseError) {
          if (supabaseError.code === 'PGRST116') {
            throw new Error("Produit non trouvé ou non disponible.");
          }
          throw supabaseError;
        }
        
        logger.log("Product loaded successfully:", data);
        
        const mainImageUrl = getImageUrl(data.image_1 || data.image_url);
        setProduct(data);
        setMainImage(mainImageUrl);
      } catch (err) {
        logger.error("Error loading product:", err);
        setError(err.message || "Une erreur est survenue lors du chargement du produit.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug, getImageUrl]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
    toast({
      title: "Produit ajouté au panier !",
      description: `${product.nom} a été ajouté à votre demande de devis.`,
    });
  };

  // Get all gallery images
  const galleryImages = useMemo(() => {
    if (!product) return [];
    const images = [
      product.image_1,
      product.image_2,
      product.image_3,
      product.image_4
    ].filter(Boolean);
    
    return images.map(img => getImageUrl(img));
  }, [product, getImageUrl]);

  // Update main image when thumbnail is clicked
  useEffect(() => {
    if (galleryImages.length > 0 && galleryImages[selectedImageIndex]) {
      setMainImage(galleryImages[selectedImageIndex]);
    }
  }, [selectedImageIndex, galleryImages]);

  // Navigate images with keyboard
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (imageZoom && galleryImages.length > 1) {
        if (e.key === 'ArrowLeft' && selectedImageIndex > 0) {
          setSelectedImageIndex(selectedImageIndex - 1);
        } else if (e.key === 'ArrowRight' && selectedImageIndex < galleryImages.length - 1) {
          setSelectedImageIndex(selectedImageIndex + 1);
        } else if (e.key === 'Escape') {
          setImageZoom(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [imageZoom, selectedImageIndex, galleryImages.length]);

  // Get PDF URL
  const pdfUrl = useMemo(() => {
    if (!product?.fiche_technique) return null;
    return getImageUrl(product.fiche_technique);
  }, [product?.fiche_technique, getImageUrl]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="h-16 w-16 animate-spin text-secondary-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chargement du produit...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center bg-white p-8 rounded-2xl shadow-xl"
          >
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Produit non trouvé</h1>
            <p className="text-gray-600 mb-6">{error || "Le produit demandé n'existe pas ou n'est plus disponible."}</p>
            <Link to="/boutique">
              <Button className="bg-secondary-500 hover:bg-secondary-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la boutique
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const categoryName = formatCategory(product.categorie);
  const specs = parseCharacteristics;

  return (
    <>
      <Helmet>
        <title>{`${product.nom} | Effinor - Luminaires LED Professionnels`}</title>
        <meta name="description" content={product.description || `Découvrez ${product.nom} sur Effinor. Solutions LED professionnelles éligibles CEE.`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <nav className="text-sm text-gray-600" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link to="/" className="hover:text-secondary-600 transition-colors font-medium">Accueil</Link>
                </li>
                <li className="text-gray-400">/</li>
                <li>
                  <Link to="/boutique" className="hover:text-secondary-600 transition-colors font-medium">Boutique</Link>
                </li>
                <li className="text-gray-400">/</li>
                <li>
                  <Link to={`/boutique?categorie=${product.categorie}`} className="hover:text-secondary-600 transition-colors font-medium">{categoryName}</Link>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-900 font-semibold truncate max-w-xs">{product.nom}</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 lg:py-12">
          {/* Main Product Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
            {/* Image Gallery Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              {/* Main Image with Zoom */}
              <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden group">
                <div className="aspect-square relative">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={mainImage}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      src={mainImage || 'https://via.placeholder.com/800x800?text=Image+non+disponible'}
                      alt={product.nom}
                      className="w-full h-full object-contain p-8 cursor-zoom-in transition-transform duration-300 group-hover:scale-105"
                      onClick={() => galleryImages.length > 0 && setImageZoom(true)}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/800x800?text=Image+non+disponible';
                      }}
                    />
                  </AnimatePresence>
                  
                  {/* Zoom Icon */}
                  {galleryImages.length > 0 && (
                    <button
                      onClick={() => setImageZoom(true)}
                      className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Maximize2 className="w-5 h-5 text-gray-700" />
                    </button>
                  )}

                  {/* Prime CEE Badge */}
                  {product.prime_cee && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-accent-400 text-white font-bold px-4 py-2 shadow-lg text-sm">
                        <Award className="w-4 h-4 mr-2 inline" /> Prime CEE
                      </Badge>
                    </div>
                  )}

                  {/* Image Navigation Arrows */}
                  {galleryImages.length > 1 && (
                    <>
                      {selectedImageIndex > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex(selectedImageIndex - 1);
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <ChevronLeft className="w-5 h-5 text-gray-700" />
                        </button>
                      )}
                      {selectedImageIndex < galleryImages.length - 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex(selectedImageIndex + 1);
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <ChevronRight className="w-5 h-5 text-gray-700" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {galleryImages.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {galleryImages.map((img, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => {
                        setSelectedImageIndex(index);
                        setMainImage(img);
                      }}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? 'border-secondary-500 ring-4 ring-secondary-500/20 shadow-lg scale-105'
                          : 'border-gray-200 hover:border-secondary-300 hover:shadow-md'
                      }`}
                    >
                      <img
                        src={img || 'https://via.placeholder.com/200x200'}
                        alt={`Aperçu ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/200x200';
                        }}
                      />
                      {selectedImageIndex === index && (
                        <div className="absolute inset-0 bg-secondary-500/10 flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-secondary-500" />
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Package className="w-4 h-4 text-secondary-500" />
                  <span>En stock</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Truck className="w-4 h-4 text-secondary-500" />
                  <span>Livraison rapide</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <RotateCcw className="w-4 h-4 text-secondary-500" />
                  <span>Retour facile</span>
                </div>
              </div>
            </motion.div>

            {/* Product Info Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Category Badge */}
              <div>
                <Badge variant="outline" className="text-sm px-4 py-2 border-secondary-500 text-secondary-600 font-semibold">
                  {categoryName}
                </Badge>
              </div>

              {/* Product Name */}
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">{product.nom}</h1>

              {/* Quick Stats */}
              <div className="flex items-center gap-6 py-4 border-y border-gray-200">
                {product.puissance && (
                  <div className="flex items-center gap-2">
                    <div className="bg-secondary-100 p-2 rounded-lg">
                      <Zap className="w-5 h-5 text-secondary-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Puissance</p>
                      <p className="text-lg font-bold text-gray-900">{product.puissance}</p>
                    </div>
                  </div>
                )}
                {product.luminosite && (
                  <div className="flex items-center gap-2">
                    <div className="bg-secondary-100 p-2 rounded-lg">
                      <Lightbulb className="w-5 h-5 text-secondary-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Luminosité</p>
                      <p className="text-lg font-bold text-gray-900">{product.luminosite}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="bg-secondary-100 p-2 rounded-lg">
                    <Clock className="w-5 h-5 text-secondary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Durée de vie</p>
                    <p className="text-lg font-bold text-gray-900">50 000h</p>
                  </div>
                </div>
              </div>

              {/* Price Section */}
              <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-2xl p-6 border-2 border-secondary-200">
                {product.sur_devis || !product.prix ? (
                  <div>
                    <p className="text-sm text-secondary-700 font-medium mb-2">Prix sur devis</p>
                    <p className="text-3xl font-bold text-secondary-900">Sur devis</p>
                    <p className="text-sm text-secondary-600 mt-2">Contactez-nous pour un devis personnalisé</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-secondary-700 font-medium mb-2">Prix TTC</p>
                    <p className="text-4xl font-bold text-secondary-900 mb-1">{parseFloat(product.prix).toFixed(2)} €</p>
                    <p className="text-sm text-secondary-600">Prix HT disponible sur demande</p>
                  </div>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleAddToCart}
                  className="bg-secondary-500 hover:bg-secondary-600 text-white font-bold py-6 px-8 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all flex-1 group"
                  size="lg"
                >
                  <ShoppingCart className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" /> 
                  Ajouter au devis
                </Button>
                {pdfUrl && (
                  <a
                    href={pdfUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-6 bg-white hover:bg-gray-50 rounded-xl font-bold transition-all border-2 border-gray-300 hover:border-secondary-500 text-gray-700 hover:text-secondary-600 shadow-md hover:shadow-lg"
                  >
                    <FileText className="w-5 h-5" /> PDF
                  </a>
                )}
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-secondary-500" />
                    <div>
                      <p className="font-semibold text-gray-900">Garantie 5 ans</p>
                      <p className="text-xs text-gray-600">Matériel & Installation</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <Award className="w-8 h-8 text-accent-500" />
                    <div>
                      <p className="font-semibold text-gray-900">Prime CEE</p>
                      <p className="text-xs text-gray-600">Jusqu'à 100% financé</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Quick */}
              <div className="bg-gradient-to-r from-primary-900 to-primary-800 text-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 rounded-full p-3">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm opacity-90 mb-1">Une question sur ce produit ?</p>
                    <a 
                      href="tel:0978455063" 
                      className="text-2xl font-bold hover:text-secondary-400 transition-colors flex items-center gap-2"
                    >
                      09 78 45 50 63
                      <ArrowRight className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tabs Section */}
          <div className="mb-12">
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                {['description', 'caracteristiques', 'garantie'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 px-2 font-semibold text-sm border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-secondary-500 text-secondary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'description' && 'Description'}
                    {tab === 'caracteristiques' && 'Caractéristiques'}
                    {tab === 'garantie' && 'Garantie & Éligibilité'}
                  </button>
                ))}
              </nav>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                {activeTab === 'description' && (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                      {product.description || 'Aucune description disponible pour ce produit.'}
                    </p>
                  </div>
                )}

                {activeTab === 'caracteristiques' && (
                  <div>
                    {specs.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(expandedSpecs ? specs : specs.slice(0, 10)).map((spec, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex justify-between items-center py-4 px-4 bg-gray-50 rounded-lg border-l-4 border-secondary-500 hover:bg-gray-100 transition-colors"
                          >
                            <span className="font-semibold text-gray-700">{spec.label}</span>
                            <span className="text-gray-900 font-medium">{spec.value || '-'}</span>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-center py-8">Aucune caractéristique disponible pour ce produit.</p>
                    )}
                    {specs.length > 10 && (
                      <div className="text-center mt-6">
                        <Button
                          variant="outline"
                          onClick={() => setExpandedSpecs(!expandedSpecs)}
                          className="border-secondary-500 text-secondary-600 hover:bg-secondary-50"
                        >
                          {expandedSpecs ? 'Voir moins' : `Voir toutes les caractéristiques (${specs.length})`}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'garantie' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <ShieldCheck className="w-7 h-7 text-secondary-500" />
                        Garantie
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-6 h-6 text-secondary-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-gray-900">Garantie constructeur</p>
                            <p className="text-gray-600">5 ans sur le matériel</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-6 h-6 text-secondary-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-gray-900">Garantie installation</p>
                            <p className="text-gray-600">5 ans sur l'installation</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-6 h-6 text-secondary-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-gray-900">Support technique</p>
                            <p className="text-gray-600">Assistance continue disponible</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <Award className="w-7 h-7 text-accent-500" />
                        Éligibilité CEE
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-6 h-6 text-accent-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-gray-900">Prime CEE</p>
                            <p className="text-gray-600">{product.prime_cee ? 'Éligible jusqu\'à 100% du financement' : 'Non éligible'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-6 h-6 text-accent-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-gray-900">Certifications</p>
                            <p className="text-gray-600">Normes CE, IP65, conforme aux réglementations</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-6 h-6 text-accent-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-gray-900">Économies d'énergie</p>
                            <p className="text-gray-600">Jusqu'à 80% d'économie sur votre facture</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Fiches CEE Section */}
          {fichesCEE.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-secondary-50 to-green-50 rounded-2xl p-6 lg:p-8 mb-8 border-2 border-secondary-200"
            >
              <h3 className="text-xl lg:text-2xl font-bold mb-4 flex items-center gap-2 text-gray-900">
                <Award className="w-6 h-6 text-secondary-600" />
                Fiches CEE Applicables
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Ce produit est éligible aux Certificats d'Économies d'Énergie suivants :
              </p>
              <div className="space-y-3">
                {fichesCEE.map(fiche => (
                  <Link
                    key={fiche.slug}
                    to={`/prime-cee/${fiche.slug}`}
                    className="block p-4 bg-white rounded-lg border-2 border-secondary-200 hover:border-secondary-500 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Badge className="bg-secondary-100 text-secondary-700 text-xs font-mono mb-2">
                          {fiche.numero}
                        </Badge>
                        <h4 className="font-semibold text-gray-900 mt-2">{fiche.titre}</h4>
                        {fiche.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1">{fiche.description}</p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        {fiche.montant_cee && (
                          <p className="text-secondary-600 font-bold text-lg">
                            {fiche.montant_cee} {fiche.unite || '€/unité'}
                          </p>
                        )}
                        <LinkIcon className="w-4 h-4 text-secondary-500 mt-2 ml-auto" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {/* Why Choose Effinor Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-primary-900 text-white rounded-3xl shadow-2xl p-8 lg:p-12 mb-12"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">Pourquoi choisir Effinor ?</h2>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                Des solutions LED professionnelles pour optimiser votre efficacité énergétique
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: TrendingUp, title: "100% Financé", desc: "Par les primes CEE, zéro investissement de votre part" },
                { icon: Clock, title: "Installation Rapide", desc: "Intervention en 7 jours sans interruption d'activité" },
                { icon: ShieldCheck, title: "Garantie 5 ans", desc: "Matériel et installation garantis par nos experts" },
                { icon: Star, title: "Accompagnement", desc: "Suivi personnalisé de A à Z par nos spécialistes" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all shadow-lg backdrop-blur-sm"
                >
                  <div className="bg-secondary-500/30 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">{item.title}</h3>
                  <p className="text-white/90 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Image Zoom Modal */}
        <AnimatePresence>
          {imageZoom && galleryImages.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
              onClick={() => setImageZoom(false)}
            >
              <motion.button
                onClick={() => setImageZoom(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all"
              >
                <span className="text-2xl">×</span>
              </motion.button>

              {galleryImages.length > 1 && (
                <>
                  {selectedImageIndex > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex(selectedImageIndex - 1);
                      }}
                      className="absolute left-4 bg-white/10 hover:bg-white/20 rounded-full p-4 text-white transition-all"
                    >
                      <ChevronLeft className="w-8 h-8" />
                    </button>
                  )}
                  {selectedImageIndex < galleryImages.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex(selectedImageIndex + 1);
                      }}
                      className="absolute right-4 bg-white/10 hover:bg-white/20 rounded-full p-4 text-white transition-all"
                    >
                      <ChevronRight className="w-8 h-8" />
                    </button>
                  )}
                </>
              )}

              <motion.img
                key={selectedImageIndex}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                src={galleryImages[selectedImageIndex]}
                alt={product.nom}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />

              {galleryImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {galleryImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        selectedImageIndex === index ? 'bg-white w-8' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default ProductDetail;
