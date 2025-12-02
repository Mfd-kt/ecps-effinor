import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePageSEO } from '@/hooks/usePageSEO';
import SEOHead from '@/components/SEOHead';
import Breadcrumbs from '@/components/Breadcrumbs';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, ArrowRight, TrendingDown, Lightbulb, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '@/utils/logger';

const RealisationDetail = () => {
  const { slug } = useParams();
  const seo = usePageSEO(`/realisations/${slug}`);
  const [realisation, setRealisation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRealisation();
  }, [slug]);

  const fetchRealisation = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('realisations')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) {
        // Si la table n'existe pas encore ou si l'enregistrement n'existe pas
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          logger.warn('[RealisationDetail] Table realisations does not exist yet');
          setRealisation(null);
          return;
        }
        if (error.code === 'PGRST116') {
          // Aucun résultat trouvé
          setRealisation(null);
          return;
        }
        throw error;
      }
      setRealisation(data);
    } catch (err) {
      logger.error('[RealisationDetail] Error fetching realisation:', err);
      setRealisation(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-[var(--secondary-500)]" />
      </div>
    );
  }

  if (!realisation) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Réalisation non trouvée</h1>
        <Link to="/realisations" className="text-[var(--secondary-500)] hover:underline">
          Retour aux réalisations
        </Link>
      </div>
    );
  }

  const h1Text = `Rénovation d'éclairage pour ${realisation.secteur || 'votre site'} – ${realisation.client || 'Client'}`;
  const images = realisation.images || [];
  const produitsUtilises = realisation.produits_utilises || [];

  return (
    <>
      <SEOHead
        metaTitle={seo.metaTitle || realisation.seo_title || realisation.titre}
        metaDescription={seo.metaDescription || realisation.seo_description || realisation.description_courte}
        ogImage={seo.ogImage || realisation.seo_og_image_url || (images[0]?.url)}
        isIndexable={seo.isIndexable}
        h1={seo.h1 || h1Text}
        intro={seo.intro || realisation.description_courte}
      />

      <div className="min-h-screen bg-white overflow-x-hidden">
        <div className="container mx-auto px-3 md:px-4 py-4 md:py-6 lg:py-8 max-w-7xl overflow-x-hidden">
          <div className="max-w-[95%] sm:max-w-lg md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto">
            <Breadcrumbs
              items={[
                { label: 'Réalisations', to: '/realisations' },
                { label: realisation.titre }
              ]}
            />

            {/* Hero */}
            <div className="mb-4 md:mb-6">
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-1.5 md:mb-2">
                {seo.h1 || h1Text}
              </h1>
              {realisation.description_courte && (
                <p className="text-xs md:text-sm lg:text-base text-gray-600 leading-relaxed">
                  {realisation.description_courte}
                </p>
              )}
            </div>

            {/* Image principale */}
            {images.length > 0 && (
              <div className="mb-4 md:mb-6">
                <img
                  src={images[0].url}
                  alt={images[0].legend || realisation.titre}
                  className="w-full max-w-full h-auto rounded-lg shadow-sm scale-90 md:scale-100 mx-auto"
                />
              </div>
            )}

            {/* Infos client */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-6 mb-4 md:mb-6">
              <div className="bg-gray-50 rounded-lg p-3 md:p-4 lg:p-6">
                <h2 className="text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-3 md:mb-4">Contexte client</h2>
              <div className="space-y-2 md:space-y-3 lg:space-y-4 text-gray-700 mb-4 md:mb-6">
                {realisation.client && (
                  <p className="text-sm md:text-base lg:text-lg"><strong className="text-gray-900">Client:</strong> {realisation.client}</p>
                )}
                {realisation.secteur && (
                  <p className="text-sm md:text-base lg:text-lg"><strong className="text-gray-900">Secteur:</strong> {realisation.secteur}</p>
                )}
                {realisation.ville && (
                  <p className="text-sm md:text-base lg:text-lg"><strong className="text-gray-900">Localisation:</strong> {realisation.ville}{realisation.pays && `, ${realisation.pays}`}</p>
                )}
              </div>
              {realisation.contexte && (
                <div className="mt-4 md:mt-6">
                  <p className="text-xs md:text-sm lg:text-base text-gray-700 leading-relaxed">{realisation.contexte}</p>
                </div>
              )}
            </div>
              <div>
                {realisation.economie_energie_pct && (
                  <div className="bg-[var(--secondary-500)] text-white rounded-lg p-3 md:p-4 lg:p-6 text-center shadow-sm">
                    <TrendingDown className="h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 mx-auto mb-2 md:mb-3" />
                    <p className="text-xl md:text-2xl lg:text-3xl font-bold mb-1.5 md:mb-2">{realisation.economie_energie_pct}%</p>
                    <p className="text-xs md:text-sm lg:text-base">d'économie d'énergie</p>
                  </div>
                )}
              </div>
            </div>

            {/* Solution */}
            {realisation.solution && (
              <section className="mb-4 md:mb-6">
                <h2 className="text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-3 md:mb-4">Solution mise en place</h2>
                <div className="bg-white rounded-lg p-3 md:p-4 lg:p-6 border border-gray-100 shadow-sm">
                  <p className="text-xs md:text-sm lg:text-base text-gray-700 whitespace-pre-line leading-relaxed">{realisation.solution}</p>
                </div>
                {produitsUtilises.length > 0 && (
                  <div className="mt-3 md:mt-4 bg-[var(--secondary-500)]/5 rounded-lg p-3 md:p-4 lg:p-6">
                    <h3 className="text-sm md:text-base lg:text-lg font-bold text-gray-900 mb-2 md:mb-3">Produits utilisés</h3>
                    <ul className="space-y-2">
                      {produitsUtilises.map((produit, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <CheckCircle2 className="h-4 w-4 text-[var(--secondary-500)] flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 text-xs md:text-sm">{typeof produit === 'string' ? produit : produit.nom || produit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {/* Résultats */}
            {realisation.resultats && (
              <section className="mb-4 md:mb-6">
                <h2 className="text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-3 md:mb-4">Résultats</h2>
                <div className="bg-white rounded-lg p-3 md:p-4 lg:p-6 border border-gray-100 shadow-sm">
                  <p className="text-xs md:text-sm lg:text-base text-gray-700 whitespace-pre-line leading-relaxed">{realisation.resultats}</p>
                </div>
              </section>
            )}

            {/* Galerie */}
            {images.length > 1 && (
              <section className="mb-4 md:mb-6">
                <h2 className="text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-3 md:mb-4">Galerie photos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 lg:gap-4">
                  {images.slice(1).map((image, idx) => (
                    <div key={idx} className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <img
                        src={image.url}
                        alt={image.legend || `Image ${idx + 2}`}
                        className="w-full h-full object-cover scale-90 md:scale-100"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* CTA */}
            <section className="bg-gray-50 rounded-lg p-3 md:p-4 lg:p-6 text-center">
              <h2 className="text-sm md:text-base lg:text-lg font-bold text-gray-900 mb-1.5 md:mb-2">
                Projet similaire ? Contactez-nous
              </h2>
              <p className="text-[10px] md:text-xs lg:text-sm text-gray-600 mb-3 md:mb-4">
                Notre équipe d'experts est à votre disposition pour étudier votre projet.
              </p>
              <Link to="/contact">
                <Button className="bg-[var(--secondary-500)] hover:bg-[var(--secondary-600)] text-[10px] md:text-xs lg:text-sm px-3 md:px-4 py-1.5 md:py-2 shadow-sm hover:shadow-md transition-all">
                  Demander un devis
                  <ArrowRight className="ml-1.5 md:ml-2 h-2.5 w-2.5 md:h-3 md:w-3 lg:h-4 lg:w-4" />
                </Button>
              </Link>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default RealisationDetail;

