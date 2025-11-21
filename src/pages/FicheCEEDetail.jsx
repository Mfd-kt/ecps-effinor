import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/utils/logger';
import { FileText, Download, CheckCircle, XCircle, Loader2, ArrowLeft, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/ProductCard';

const FicheCEEDetail = () => {
  const { slug } = useParams();
  const [fiche, setFiche] = useState(null);
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  // Construct file URL helper
  const getFileUrl = (filePath) => {
    if (!filePath) return null;
    if (filePath.startsWith('http')) return filePath;
    if (filePath.startsWith('/')) return filePath;
    if (supabaseUrl) {
      return `${supabaseUrl}/storage/v1/object/public/effinor-assets/${filePath}`;
    }
    return filePath;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        logger.log(`📦 Chargement de la fiche CEE avec slug: ${slug}`);
        
        // Fetch fiche
        const { data: ficheData, error: ficheError } = await supabase
          .from('fiches_cee')
          .select('*')
          .eq('slug', slug)
          .eq('actif', true)
          .single();
        
        if (ficheError) {
          if (ficheError.code === 'PGRST116') {
            throw new Error('Fiche CEE non trouvée ou non disponible.');
          }
          throw ficheError;
        }

        if (!ficheData) {
          throw new Error('Fiche CEE non trouvée.');
        }

        logger.log('✅ Fiche CEE chargée:', ficheData);
        setFiche(ficheData);
        
        // Fetch linked products
        try {
          const { data: links, error: linksError } = await supabase
            .from('produits_fiches_cee')
            .select(`
              produit_id,
              products (
                id,
                nom,
                description,
                prix,
                image_1,
                image_url,
                slug,
                actif,
                categorie,
                ordre
              )
            `)
            .eq('fiche_cee_id', ficheData.id);
          
          if (linksError) {
            logger.warn('⚠️ Erreur chargement produits liés (table peut ne pas exister):', linksError);
            setProduits([]);
          } else {
            const linkedProducts = links
              ?.filter(link => link.products && link.products.actif)
              .map(link => link.products) || [];
            logger.log(`✅ ${linkedProducts.length} produit(s) lié(s) trouvé(s)`);
            setProduits(linkedProducts);
          }
        } catch (linksErr) {
          logger.warn('⚠️ Erreur lors du chargement des produits liés:', linksErr);
          setProduits([]);
        }
        
      } catch (err) {
        logger.error('❌ Erreur chargement fiche CEE:', err);
        setError(err.message || 'Une erreur est survenue lors du chargement de la fiche CEE.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-24 w-24 animate-spin text-secondary-500 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de la fiche CEE...</p>
        </div>
      </div>
    );
  }

  if (error || !fiche) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-lg">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Fiche CEE non trouvée</h1>
            <p className="text-gray-600 mb-6">{error || "Cette fiche CEE n'existe pas ou n'est plus disponible."}</p>
            <Link to="/prime-cee">
              <Button className="bg-secondary-500 hover:bg-secondary-600">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux fiches CEE
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{fiche.titre} - Fiche CEE {fiche.numero} | Effinor</title>
        <meta name="description" content={fiche.description || `Découvrez la fiche CEE ${fiche.numero}: ${fiche.titre}`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
              <Link to="/" className="text-gray-600 hover:text-secondary-600 transition-colors">Accueil</Link>
              <span>/</span>
              <Link to="/prime-cee" className="text-gray-600 hover:text-secondary-600 transition-colors">Prime CEE</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">{fiche.numero}</span>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Left: Image */}
            <div className="lg:col-span-1">
              {fiche.image ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mb-4"
                >
                  <img
                    src={getFileUrl(fiche.image)}
                    alt={fiche.titre}
                    className="w-full rounded-lg shadow-lg object-cover"
                    onError={(e) => {
                      logger.warn(`Failed to load image for fiche ${fiche.id}:`, fiche.image);
                      e.target.src = 'https://via.placeholder.com/400x300?text=Image+non+disponible';
                    }}
                  />
                </motion.div>
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-16 h-16 text-gray-400" />
                </div>
              )}

              {/* PDF Download */}
              {fiche.document_legal_pdf && (
                <a
                  href={getFileUrl(fiche.document_legal_pdf)}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition shadow-lg shadow-secondary-500/30 hover:shadow-xl"
                >
                  <Download className="w-5 h-5" />
                  Télécharger le document légal (PDF)
                </a>
              )}
            </div>

            {/* Right: Details */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Badge className="bg-secondary-100 text-secondary-700 text-sm font-mono mb-4">
                  {fiche.numero}
                </Badge>

                <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-900">{fiche.titre}</h1>

                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-xs text-gray-600 block mb-1">Secteur</span>
                    <p className="font-semibold text-gray-900">{fiche.secteur}</p>
                  </div>
                  {fiche.montant_cee && (
                    <div className="bg-secondary-50 rounded-lg p-3">
                      <span className="text-xs text-gray-600 block mb-1">Montant CEE</span>
                      <p className="font-semibold text-secondary-600">
                        {fiche.montant_cee} {fiche.unite || '€/unité'}
                      </p>
                    </div>
                  )}
                </div>

                {fiche.description && (
                  <div className="prose max-w-none mb-8">
                    <p className="text-gray-700 leading-relaxed text-lg">{fiche.description}</p>
                  </div>
                )}

                {fiche.description_longue && (
                  <div className="prose max-w-none mb-8">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{fiche.description_longue}</p>
                  </div>
                )}

                {/* Dates */}
                {(fiche.date_debut || fiche.date_fin) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                    <h3 className="font-semibold mb-2 text-blue-900">Dates de validité</h3>
                    <div className="flex gap-4 text-sm">
                      {fiche.date_debut && (
                        <div>
                          <span className="text-blue-700">Début:</span>{' '}
                          <span className="font-medium">{new Date(fiche.date_debut).toLocaleDateString('fr-FR')}</span>
                        </div>
                      )}
                      {fiche.date_fin && (
                        <div>
                          <span className="text-blue-700">Fin:</span>{' '}
                          <span className="font-medium">{new Date(fiche.date_fin).toLocaleDateString('fr-FR')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Conditions */}
                {fiche.conditions && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                    <h3 className="font-semibold mb-2 text-yellow-900 flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-700" />
                      Conditions d'éligibilité
                    </h3>
                    <p className="text-gray-700 whitespace-pre-line">{fiche.conditions}</p>
                  </div>
                )}

                {/* Eligibility */}
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    {fiche.eligible_professionnels ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-gray-900">Éligible aux professionnels</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="text-gray-600">Non éligible aux professionnels</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    {fiche.eligible_particuliers ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-gray-900">Éligible aux particuliers</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="text-gray-600">Non éligible aux particuliers</span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Produits compatibles */}
          {produits.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-16"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <Award className="w-8 h-8 text-secondary-500" />
                  Produits Compatibles
                </h2>
                <Badge className="bg-secondary-500 text-white">
                  {produits.length} produit{produits.length > 1 ? 's' : ''}
                </Badge>
              </div>
              <p className="text-gray-600 mb-8">
                Ces produits sont éligibles à cette fiche CEE et peuvent bénéficier du montant indiqué ci-dessus.
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {produits.map(produit => (
                  <ProductCard key={produit.id} product={produit} />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default FicheCEEDetail;

