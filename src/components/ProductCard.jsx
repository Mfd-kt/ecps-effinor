import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { logger } from '@/utils/logger';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const formatCategory = (categorySlug) => {
    if (!categorySlug) return '';
    return categorySlug.replace(/_/g, ' ').toUpperCase();
  };

  const handleRequestQuote = (e) => {
    e.preventDefault();
    e.stopPropagation();
    logger.log(`Requesting quote for product ID: ${product.id}`);
    localStorage.setItem('devis_product', JSON.stringify(product));
    localStorage.setItem('devis_product_id', product.id);
    navigate(`/formulaire-complet?type=devis&product=${product.slug}`);
  };

  const handleCardClick = () => {
    navigate(`/produit/${product.slug}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="product-card"
      data-product-id={product.id}
      onClick={handleCardClick}
    >
      <div className="product-image">
        <img 
          src={product.image_url || "https://placehold.co/600x400/e2e8f0/e2e8f0?text=Image"} 
          alt={`Image pour ${product.nom}`} 
        />
        {product.prime_cee && <div className="badge-prime">Prime CEE</div>}
      </div>
      <div className="product-content">
        <div className="category">{formatCategory(product.categorie)}</div>
        <h3>{product.nom}</h3>
        <p className="description">{product.description}</p>
        
        {(product.puissance || product.luminosite) && (
          <div className="specs">
            {product.puissance && <span>{product.puissance}</span>}
            {product.luminosite && <span>{product.luminosite}</span>}
          </div>
        )}
        
        <div className="mt-auto">
          {product.sur_devis || !product.prix ? (
            <p className="price-label">Sur devis</p>
          ) : (
            <p className="price">{parseFloat(product.prix).toFixed(2)} € HT</p>
          )}

          <button onClick={handleRequestQuote} className="btn-devis">
            Demander un devis
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;