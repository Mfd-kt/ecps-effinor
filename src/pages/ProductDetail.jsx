import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/utils/logger';
import { Loader2, Award, ShieldCheck, Phone, ArrowLeft, ShoppingCart, Download } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/use-toast';

const SpecItem = ({ icon, label, value }) => (
  <div className="spec-item">
    <div className="spec-icon">{icon}</div>
    <div className="spec-content">
      <p className="spec-label">{label}</p>
      <p className="spec-value">{value}</p>
    </div>
  </div>
);

const AdvantageCard = ({ icon, title, description }) => (
  <div className="advantage-card">
    <div className="icon">{icon}</div>
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(null);

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
          .select('*')
          .eq('slug', slug)
          .eq('actif', true)
          .single();

        if (supabaseError) {
          if (supabaseError.code === 'PGRST116') { // PostgREST code for "No rows found"
             throw new Error("Produit non trouvé ou non disponible.");
          }
          throw supabaseError;
        }
        
        logger.log("Product loaded successfully:", data);
        setProduct(data);
        setMainImage(data.image_1 || data.image_url);
      } catch (err) {
        logger.error("Error loading product:", err);
        setError(err.message || "Une erreur est survenue lors du chargement du produit.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
    toast({
      title: "Produit ajouté au panier !",
      description: `${product.nom} a été ajouté à votre demande de devis.`,
    });
  };

  if (loading) {
    return (
      <div className="product-detail-page flex items-center justify-center">
        <Loader2 className="h-24 w-24 animate-spin text-secondary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail-page">
        <div className="container mx-auto">
          <div className="error-page">
            <div className="error-icon" role="img" aria-label="sad face">😕</div>
            <h1>Erreur</h1>
            <p>{error}</p>
            <Link to="/boutique" className="btn-primary">
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la boutique
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null; // Should be covered by error state
  }
  
  const galleryImages = [product.image_1, product.image_2, product.image_3, product.image_4].filter(Boolean);
  const categoryName = formatCategory(product.categorie);

  return (
    <>
      <Helmet>
        <title>{`${product.nom} | Effinor`}</title>
        <meta name="description" content={product.description} />
      </Helmet>
      <div className="product-detail-page">
        <div className="container mx-auto">
          <nav className="breadcrumb">
            <Link to="/">Accueil</Link>
            <span>/</span>
            <Link to="/boutique">Boutique</Link>
            <span>/</span>
            <span id="product-category-breadcrumb">{categoryName}</span>
          </nav>
          
          <div id="product-content" className="product-layout">
            <div className="product-image-section">
              <div className="main-image-container">
                <img id="product-main-image" alt={product.nom} src={mainImage || 'https://via.placeholder.com/600x600'} />
                {product.prime_cee && (
                  <span id="prime-badge" className="badge-prime">Prime CEE</span>
                )}
              </div>
              {galleryImages.length > 1 && (
                <div className="thumbnail-gallery">
                  {galleryImages.map((img, index) => (
                    <div 
                      key={index}
                      className={`thumbnail ${mainImage === img ? 'active' : ''}`}
                      onClick={() => setMainImage(img)}
                    >
                      <img src={img} alt={`Aperçu ${index + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="product-info-section">
              <p id="product-category" className="category">{categoryName}</p>
              <h1 id="product-name">{product.nom}</h1>
              <p id="product-description" className="description">{product.description}</p>
              
              <div id="product-specs" className="specs-grid">
                {product.puissance && <SpecItem icon="⚡" label="Puissance" value={product.puissance} />}
                {product.luminosite && <SpecItem icon="💡" label="Luminosité" value={product.luminosite} />}
                <SpecItem icon={<Award className="text-accent-600" />} label="Éligibilité" value={product.prime_cee ? "Prime CEE" : "Non applicable"} />
                <SpecItem icon={<ShieldCheck className="text-secondary-600" />} label="Garantie" value="5 ans" />
              </div>
              
              <div id="product-price" className="price-section">
                {product.sur_devis || !product.prix ? (
                  <p className="price-label">Sur devis</p>
                ) : (
                  <p className="price">{parseFloat(product.prix).toFixed(2)} € HT</p>
                )}
              </div>
              
              <div className="cta-section">
                <button onClick={handleAddToCart} className="btn-primary btn-large">
                  <ShoppingCart className="mr-2 h-5 w-5" /> Ajouter au devis
                </button>
                {product.fiche_technique && (
                   <a href={product.fiche_technique} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-large">
                    <Download className="mr-2 h-5 w-5" /> Fiche Technique
                  </a>
                )}
              </div>
              
              <div className="contact-quick">
                <p>Une question ? Appelez-nous :</p>
                <a href="tel:0978455063" className="phone-link">
                  <Phone className="inline-block mr-2" size={24}/> 09 78 45 50 63
                </a>
              </div>
            </div>
          </div>
          
          <div className="advantages-section">
            <h2>Pourquoi choisir Effinor ?</h2>
            <div className="advantages-grid">
              <AdvantageCard icon="💰" title="100% Financé" description="Vos travaux financés par les CEE, zéro investissement" />
              <AdvantageCard icon="⚡" title="Installation Rapide" description="Intervention en 7 jours sans interruption d'activité" />
              <AdvantageCard icon="🏆" title="Garantie 5 ans" description="Matériel et installation garantis" />
              <AdvantageCard icon="🤝" title="Accompagnement" description="Suivi personnalisé de A à Z" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;