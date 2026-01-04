import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { usePageSEO } from '@/hooks/usePageSEO';
import SEOHead from '@/components/SEOHead';
import Breadcrumbs from '@/components/Breadcrumbs';
import ImageGallery from '@/components/ImageGallery';
import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/utils/logger';
import { ArrowRight, CheckCircle2, Loader2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/use-toast';
import { getAccessoriesForCategory } from '@/lib/api/products';

// Données pour chaque catégorie
const categoryData = {
  // Produits & Solutions
  'luminaires-industrie-entrepots': {
    title: 'Luminaires industrie & entrepôts',
    parentPath: '/produits-solutions',
    parentLabel: 'Produits & Solutions',
    heroTitle: 'Solutions d\'éclairage LED haute performance pour l\'industrie et les entrepôts',
    benefits: [
      'Réduction jusqu\'à 80% de la consommation énergétique',
      'Haute performance lumineuse (jusqu\'à 200 lm/W)',
      'Résistance aux environnements difficiles (IP65+)',
      'Maintenance réduite (durée de vie 50 000h+)',
      'Installation simple et rapide'
    ],
    problems: [
      'Consommation énergétique élevée',
      'Maintenance fréquente et coûteuse',
      'Éclairage insuffisant dans certains espaces',
      'Chaleur dégagée par les anciennes technologies'
    ],
    solutions: [
      'Installation de Highbay LED haute performance',
      'Système de pilotage intelligent',
      'Optimisation de l\'éclairage selon les zones',
      'Maintenance préventive programmée'
    ]
  },
  'luminaires-tertiaire-bureaux': {
    title: 'Luminaires tertiaire & bureaux',
    parentPath: '/produits-solutions',
    parentLabel: 'Produits & Solutions',
    heroTitle: 'Solutions d\'éclairage LED pour bureaux et espaces tertiaires',
    benefits: [
      'Confort visuel optimal pour le travail',
      'Réglage de l\'intensité lumineuse',
      'Design moderne et discret',
      'Réduction de la fatigue visuelle',
      'Économies d\'énergie significatives'
    ],
    problems: [
      'Éblouissement et fatigue visuelle',
      'Consommation énergétique élevée',
      'Design obsolète',
      'Manque de flexibilité'
    ],
    solutions: [
      'Réglettes LED avec diffuseur',
      'Système de gradation',
      'Design moderne et épuré',
      'Installation flexible'
    ]
  },
  'luminaires-commerces-gms': {
    title: 'Luminaires commerces & GMS',
    parentPath: '/produits-solutions',
    parentLabel: 'Produits & Solutions',
    heroTitle: 'Éclairage LED pour magasins et grandes surfaces',
    benefits: [
      'Mise en valeur des produits',
      'Ambiance chaleureuse et accueillante',
      'Économies d\'énergie significatives',
      'Flexibilité d\'éclairage par zone'
    ],
    problems: [
      'Éclairage inadapté aux produits',
      'Coûts énergétiques élevés',
      'Chaleur dégagée',
      'Manque d\'ambiance'
    ],
    solutions: [
      'Spots LED directionnels',
      'Réglettes LED pour éclairage général',
      'Système de gradation',
      'Éclairage d\'ambiance'
    ]
  },
  'luminaires-parkings-exterieurs': {
    title: 'Luminaires parkings & extérieurs',
    parentPath: '/produits-solutions',
    parentLabel: 'Produits & Solutions',
    heroTitle: 'Éclairage LED pour parkings et espaces extérieurs',
    benefits: [
      'Sécurité renforcée',
      'Détection de présence',
      'Résistance aux intempéries (IP65+)',
      'Économies d\'énergie jusqu\'à 70%'
    ],
    problems: [
      'Sécurité insuffisante',
      'Consommation énergétique élevée',
      'Résistance aux intempéries',
      'Maintenance difficile'
    ],
    solutions: [
      'Projecteurs LED haute performance',
      'Détection de présence',
      'IP65+ pour extérieur',
      'Maintenance réduite'
    ]
  },
  'accessoires-pilotage': {
    title: 'Accessoires & pilotage',
    parentPath: '/produits-solutions',
    parentLabel: 'Produits & Solutions',
    heroTitle: 'Drivers, détection et solutions de pilotage intelligent',
    benefits: [
      'Pilotage intelligent',
      'Détection de présence',
      'Dimming et gradation',
      'Intégration domotique'
    ],
    problems: [
      'Manque de contrôle',
      'Pas de détection',
      'Consommation constante',
      'Pas d\'intégration'
    ],
    solutions: [
      'Drivers LED haute performance',
      'Détecteurs de présence',
      'Systèmes de dimming',
      'Intégration domotique'
    ]
  },
  // Secteurs d'activité
  'industrie-logistique': {
    title: 'Industrie & logistique',
    parentPath: '/secteurs-activite',
    parentLabel: 'Secteurs d\'activité',
    heroTitle: 'Solutions d\'éclairage LED pour l\'industrie et la logistique',
    benefits: [
      'Performance optimale pour grandes hauteurs',
      'ROI rapide (moins de 2 ans)',
      'Conformité aux normes de sécurité',
      'Maintenance facilitée'
    ],
    problems: [
      'Hauteur sous plafond importante',
      'Besoin d\'éclairage constant',
      'Coûts énergétiques élevés',
      'Maintenance difficile en hauteur'
    ],
    solutions: [
      'Highbay LED adaptés aux grandes hauteurs',
      'Système de détection de présence',
      'Pilotage centralisé',
      'Maintenance facilitée'
    ]
  },
  'tertiaire-bureaux': {
    title: 'Tertiaire / bureaux',
    parentPath: '/secteurs-activite',
    parentLabel: 'Secteurs d\'activité',
    heroTitle: 'Éclairage LED pour bureaux et espaces tertiaires',
    benefits: [
      'Confort visuel optimal',
      'Productivité améliorée',
      'Design moderne',
      'Économies d\'énergie'
    ],
    problems: [
      'Fatigue visuelle',
      'Éclairage inadapté',
      'Coûts élevés',
      'Design obsolète'
    ],
    solutions: [
      'Réglettes LED avec diffuseur',
      'Gradation intelligente',
      'Design moderne',
      'Installation flexible'
    ]
  },
  'retail-grande-distribution': {
    title: 'Retail & grande distribution',
    parentPath: '/secteurs-activite',
    parentLabel: 'Secteurs d\'activité',
    heroTitle: 'Éclairage LED pour magasins et grandes surfaces',
    benefits: [
      'Mise en valeur des produits',
      'Ambiance accueillante',
      'Économies d\'énergie',
      'Flexibilité par zone'
    ],
    problems: [
      'Éclairage inadapté',
      'Coûts énergétiques élevés',
      'Chaleur dégagée',
      'Manque d\'ambiance'
    ],
    solutions: [
      'Spots LED directionnels',
      'Réglettes LED générales',
      'Gradation par zone',
      'Éclairage d\'ambiance'
    ]
  },
  'collectivites-ecoles-gymnases': {
    title: 'Collectivités / écoles / gymnases',
    parentPath: '/secteurs-activite',
    parentLabel: 'Secteurs d\'activité',
    heroTitle: 'Solutions d\'éclairage LED pour collectivités et établissements scolaires',
    benefits: [
      'Conformité aux normes en vigueur',
      'Durabilité et fiabilité',
      'Maintenance réduite',
      'Économies budgétaires'
    ],
    problems: [
      'Normes strictes à respecter',
      'Budget limité',
      'Maintenance coûteuse',
      'Besoin de durabilité'
    ],
    solutions: [
      'Produits certifiés et conformes',
      'Solutions économiques',
      'Maintenance facilitée',
      'Garanties étendues'
    ]
  },
  'sante-etablissements-sensibles': {
    title: 'Santé / établissements sensibles',
    parentPath: '/secteurs-activite',
    parentLabel: 'Secteurs d\'activité',
    heroTitle: 'Éclairage LED pour établissements de santé',
    benefits: [
      'Conformité aux normes strictes',
      'Qualité de lumière optimale',
      'Fiabilité maximale',
      'Maintenance préventive'
    ],
    problems: [
      'Normes très strictes',
      'Besoin de fiabilité',
      'Qualité lumière critique',
      'Maintenance essentielle'
    ],
    solutions: [
      'Produits certifiés NF',
      'Qualité lumière optimale',
      'Fiabilité maximale',
      'Maintenance préventive'
    ]
  }
};

const CategoryDetail = () => {
  const { slug } = useParams();
  const location = useLocation();
  const isProduitsSolutions = location.pathname.startsWith('/produits-solutions/');
  const isSecteursActivite = location.pathname.startsWith('/secteurs-activite/');
  
  const data = categoryData[slug];
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategory, setLoadingCategory] = useState(true);
   const [categoryAccessories, setCategoryAccessories] = useState([]);
  const [loadingAccessories, setLoadingAccessories] = useState(false);
  const [accessoriesError, setAccessoriesError] = useState(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (isProduitsSolutions || isSecteursActivite) {
      fetchCategoryAndProducts();
    }
  }, [slug, isProduitsSolutions, isSecteursActivite]);

  const fetchCategoryAndProducts = async () => {
    try {
      setLoadingCategory(true);
      setLoadingProducts(true);
      setLoadingAccessories(true);
      setAccessoriesError(null);
      
      // Récupérer la catégorie par slug
      const { data: categoryDbData, error: categoryError } = await supabase
        .from('categories')
        .select('id, nom, slug, description, description_longue, images')
        .eq('slug', slug)
        .eq('actif', true)
        .single();

      if (categoryError) {
        if (categoryError.code === '42P01' || categoryError.message?.includes('does not exist')) {
          logger.warn('[CategoryDetail] Table categories does not exist yet');
        } else if (categoryError.code === 'PGRST116') {
          // Catégorie non trouvée dans la base, on continue quand même
          logger.warn('[CategoryDetail] Category not found in DB:', slug);
        } else {
          logger.error('[CategoryDetail] Error fetching category:', categoryError);
        }
      } else {
        setCategory(categoryDbData);
      }

      setLoadingCategory(false);

      // Récupérer les produits de cette catégorie (uniquement ceux avec image)
      let productsQuery = supabase
        .from('products')
        .select('id, nom, description, prix, image_1, image_2, image_3, image_4, image_url, slug, actif, categorie, categorie_id, marque, reference, caracteristiques, puissance')
        .eq('actif', true)
        .or('image_1.not.is.null,image_url.not.is.null');

      // Filtrer par categorie_id si disponible, sinon par categorie (slug)
      if (categoryDbData?.id) {
        productsQuery = productsQuery.eq('categorie_id', categoryDbData.id);
      } else {
        productsQuery = productsQuery.eq('categorie', slug);
      }

      const { data: productsData, error: productsError } = await productsQuery
        .order('ordre', { ascending: true });

      if (productsError) {
        if (productsError.code === '42P01' || productsError.message?.includes('does not exist')) {
          logger.warn('[CategoryDetail] Table products does not exist yet');
        } else {
          logger.error('[CategoryDetail] Error fetching products:', productsError);
        }
        setProducts([]);
      } else {
        setProducts(productsData || []);
      }

      // Charger les accessoires liés à cette catégorie (via les produits)
      try {
        const accessoriesResult = await getAccessoriesForCategory(slug);

        if (!accessoriesResult.success) {
          setAccessoriesError(accessoriesResult.error || 'Erreur lors du chargement des accessoires de la catégorie.');
          setCategoryAccessories([]);
        } else {
          setCategoryAccessories(accessoriesResult.data || []);
        }
      } catch (accessoriesErr) {
        logger.error('[CategoryDetail] Error fetching category accessories:', accessoriesErr);
        setAccessoriesError(accessoriesErr.message || 'Erreur lors du chargement des accessoires de la catégorie.');
        setCategoryAccessories([]);
      }
    } catch (err) {
      logger.error('[CategoryDetail] Error fetching category/products:', err);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
      setLoadingCategory(false);
      setLoadingAccessories(false);
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

  // Déterminer le parentPath et parentLabel
  const parentPath = isProduitsSolutions ? '/produits-solutions' : isSecteursActivite ? '/secteurs-activite' : '/';
  const parentLabel = isProduitsSolutions ? 'Produits & Solutions' : isSecteursActivite ? 'Secteurs d\'activité' : 'Accueil';
  
  // Utiliser les données de la catégorie depuis la base ou les données hardcodées
  const categoryTitle = category?.nom || data?.title || slug;
  const categoryHeroTitle = category?.description || data?.heroTitle || `Catégorie ${categoryTitle}`;
  
  // Afficher la page si on a des données hardcodées, une catégorie en base, ou si on est en train de charger
  // On affiche toujours la page pour les routes /produits-solutions et /secteurs-activite
  if (!isProduitsSolutions && !isSecteursActivite && !data) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Page non trouvée</h1>
        <Link to="/" className="text-[var(--secondary-500)] hover:underline">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  const seo = usePageSEO(`${parentPath}/${slug}`);

  return (
    <>
      <SEOHead
        metaTitle={seo.metaTitle}
        metaDescription={seo.metaDescription}
        ogImage={seo.ogImage}
        isIndexable={seo.isIndexable}
        h1={seo.h1 || categoryHeroTitle}
        intro={seo.intro}
      />

      <div className="min-h-screen bg-white overflow-x-hidden">
        <div className="container mx-auto px-3 md:px-4 py-4 md:py-6 lg:py-8 max-w-7xl overflow-x-hidden">
          <div className="max-w-[95%] sm:max-w-lg md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto">
            <Breadcrumbs
              items={[
                { label: parentLabel, to: parentPath },
                { label: categoryTitle }
              ]}
            />

            <div className="mb-4 md:mb-6">
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                {seo.h1 || categoryHeroTitle}
              </h1>
              {seo.intro && (
                <p className="text-xs md:text-sm lg:text-base text-gray-600 leading-relaxed">
                  {seo.intro}
                </p>
              )}
              {!seo.intro && category?.description && (
                <p className="text-xs md:text-sm lg:text-base text-gray-600 leading-relaxed">
                  {category.description}
                </p>
              )}
            </div>

            {/* Section Produits de la catégorie - EN PREMIER */}
            {isProduitsSolutions && (
              <section className="mb-6 md:mb-8">
                <h2 className="text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-3 md:mb-4">
                  Produits {categoryTitle}
                </h2>
                {loadingProducts ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[var(--secondary-500)]" />
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-sm">
                      Aucun produit disponible dans cette catégorie pour le moment.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 lg:gap-4">
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
                                  ]
                                    .filter(Boolean)
                                    .map((img) => getImageUrl(img));
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
                                <div className="text-gray-400 text-xs">Pas d&apos;image</div>
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
                            <Link to={`/produit/${product.slug}`} className="flex-1">
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
              </section>
            )}

            {/* Accessoires compatibles pour cette catégorie */}
            {isProduitsSolutions && (
              <section className="mb-6 md:mb-8">
                <h2 className="text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-3 md:mb-4">
                  Accessoires compatibles pour cette catégorie
                </h2>
                {loadingAccessories ? (
                  <div className="flex justify-center items-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-[var(--secondary-500)]" />
                  </div>
                ) : accessoriesError ? (
                  <p className="text-xs md:text-sm text-red-500">
                    {accessoriesError}
                  </p>
                ) : categoryAccessories.length === 0 ? (
                  <p className="text-xs md:text-sm text-gray-500">
                    Aucun accessoire n&apos;est encore défini pour cette catégorie.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 lg:gap-4">
                    {categoryAccessories.map((accessory) => {
                      const imageUrl = getImageUrl(accessory.image_1 || accessory.image_url);
                      return (
                        <div
                          key={accessory.id}
                          className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[var(--secondary-500)]/30"
                        >
                          <Link to={`/produit/${accessory.slug}`}>
                            <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={accessory.nom}
                                  className="w-full h-full object-contain p-3 md:p-4 lg:p-2 max-w-[80%] max-h-[80%] mx-auto group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    e.target.src = 'https://placehold.co/400x400/e2e8f0/e2e8f0?text=Image';
                                  }}
                                />
                              ) : (
                                <div className="text-gray-400 text-xs">Pas d&apos;image</div>
                              )}
                            </div>
                          </Link>
                          <div className="p-2 md:p-3">
                            <Link to={`/produit/${accessory.slug}`}>
                              <h3 className="text-xs md:text-sm lg:text-base font-bold text-gray-900 mb-0.5 md:mb-1 group-hover:text-[var(--secondary-500)] transition-colors line-clamp-2">
                                {accessory.nom}
                              </h3>
                            </Link>
                            {accessory.description && (
                              <p className="text-gray-600 mb-1.5 md:mb-2 line-clamp-2 text-[10px] md:text-xs leading-relaxed">
                                {accessory.description}
                              </p>
                            )}
                            {accessory.prix && !accessory.sur_devis && (
                              <p className="text-sm md:text-base lg:text-lg font-bold text-[var(--secondary-500)] mb-1.5 md:mb-2">
                                {typeof accessory.prix === 'number'
                                  ? `${accessory.prix.toFixed(2)} €`
                                  : accessory.prix}
                              </p>
                            )}
                            {accessory.sur_devis && (
                              <p className="text-[10px] md:text-xs text-gray-500 mb-1.5">
                                Prix sur devis
                              </p>
                            )}
                          </div>
                          <div className="px-2 md:px-3 pb-2 md:pb-3 flex">
                            <Button
                              onClick={(e) => {
                                e.preventDefault();
                                handleAddToCart(accessory);
                              }}
                              className="bg-[var(--secondary-500)] hover:bg-[var(--secondary-600)] text-[10px] md:text-xs py-1.5 md:py-2 h-auto px-2 md:px-3 w-full"
                            >
                              <ShoppingCart className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                              Ajouter au panier
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* Galerie d'images de la catégorie */}
            {category?.images && Array.isArray(category.images) && category.images.length > 0 && (
              <section className="mb-6 md:mb-8">
                <h2 className="text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-3 md:mb-4">
                  Découvrez nos solutions {categoryTitle}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 lg:gap-4">
                {category.images.map((image, idx) => {
                  const imageUrl = getImageUrl(image.url);
                  return (
                  <div 
                    key={idx} 
                    className="group relative rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      const allImages = category.images.map(img => ({
                        url: getImageUrl(img.url),
                        alt_text: img.alt_text,
                        legend: img.legend
                      }));
                      setGalleryImages(allImages);
                      setGalleryIndex(idx);
                      setGalleryOpen(true);
                    }}
                  >
                    {imageUrl ? (
                      <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={image.alt_text || image.legend || `Image ${categoryTitle} ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/800x600/e2e8f0/e2e8f0?text=Image';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
                        <div className="text-gray-400 text-xs">Pas d'image</div>
                      </div>
                    )}
                    {image.legend && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <p className="text-white text-xs font-medium">{image.legend}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

            {/* Description longue de la catégorie */}
            {category?.description_longue && (
              <section className="mb-8">
                <div className="bg-gradient-to-br from-[var(--secondary-500)]/5 to-[var(--secondary-500)]/10 rounded-lg p-4 md:p-6">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
                    Pourquoi choisir {categoryTitle} ?
                  </h2>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed text-xs md:text-sm whitespace-pre-line">
                      {category.description_longue}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Sections bénéfices, problèmes, solutions - seulement si données hardcodées disponibles */}
            {data && (
              <>
                <section className="mb-6 md:mb-8">
                  <h2 className="text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-3 md:mb-4">Bénéfices clés</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                    {data.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start space-x-2 bg-gray-50 rounded-lg p-3">
                        <CheckCircle2 className="h-4 w-4 text-[var(--secondary-500)] flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700 text-xs md:text-sm leading-relaxed">{benefit}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="mb-6 md:mb-8 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="bg-red-50 rounded-lg p-3 md:p-4">
                    <h2 className="text-sm md:text-base lg:text-lg font-bold text-gray-900 mb-2 md:mb-3">Problèmes fréquents</h2>
                    <ul className="space-y-2">
                      {data.problems.map((problem, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-red-500 mt-0.5 font-bold text-sm">•</span>
                          <p className="text-gray-700 text-xs md:text-sm leading-relaxed">{problem}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-[var(--secondary-500)]/5 rounded-lg p-3 md:p-4">
                    <h2 className="text-sm md:text-base lg:text-lg font-bold text-gray-900 mb-2 md:mb-3">Notre réponse</h2>
                    <ul className="space-y-2">
                      {data.solutions.map((solution, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <CheckCircle2 className="h-4 w-4 text-[var(--secondary-500)] flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700 text-xs md:text-sm leading-relaxed">{solution}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              </>
            )}

            <section className="bg-[var(--secondary-500)] text-white rounded-lg p-3 md:p-4 lg:p-6 text-center">
              <h2 className="text-sm md:text-base lg:text-lg font-bold mb-1.5 md:mb-2">Prêt à passer à l'éclairage LED ?</h2>
              <p className="text-[10px] md:text-xs lg:text-sm mb-3 md:mb-4 opacity-90">
                Demandez un devis gratuit et personnalisé pour votre projet.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center px-3 md:px-4 py-1.5 md:py-2 bg-white text-[var(--secondary-500)] rounded-lg hover:bg-gray-100 transition-all font-semibold text-[10px] md:text-xs lg:text-sm shadow-sm hover:shadow-md"
              >
                Demander un devis
                <ArrowRight className="ml-1.5 md:ml-2 h-2.5 w-2.5 md:h-3 md:w-3" />
              </Link>
            </section>
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

export default CategoryDetail;

