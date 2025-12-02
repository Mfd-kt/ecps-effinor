import React from 'react';
import { Helmet } from 'react-helmet';

/**
 * Composant pour injecter les meta tags SEO dans le <head>
 * Utilise react-helmet pour gérer les meta tags
 */
const SEOHead = ({
  metaTitle,
  metaDescription,
  ogImage,
  isIndexable = true,
  h1,
  intro
}) => {
  // Valeurs par défaut
  const title = metaTitle || 'Effinor - Spécialiste français de l\'éclairage LED professionnel';
  const description = metaDescription || 'Effinor propose des solutions d\'éclairage LED professionnel pour l\'industrie, le tertiaire, la logistique et les collectivités.';
  const image = ogImage || 'https://i.ibb.co/6rT1m18/logo-ecps.png';
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://effinor.fr';
  const currentUrl = typeof window !== 'undefined' ? window.location.href : siteUrl;

  return (
    <Helmet>
      {/* Meta tags de base */}
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Robots meta */}
      {!isIndexable && (
        <meta name="robots" content="noindex, nofollow" />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />
    </Helmet>
  );
};

export default SEOHead;

