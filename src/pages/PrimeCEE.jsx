import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Award, CheckCircle, Send, FileText, Loader2, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/utils/logger';
import { Badge } from '@/components/ui/badge';

const PrimeCEE = () => {
  const [fiches, setFiches] = useState([]);
  const [secteurFilter, setSecteurFilter] = useState('Tous');
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
    const fetchFiches = async () => {
      setLoading(true);
      setError(null);
      
      try {
        logger.log('📦 Chargement des fiches CEE...');
        
        let query = supabase
          .from('fiches_cee')
          .select('*')
          .eq('actif', true)
          .order('ordre', { ascending: true });

        if (secteurFilter !== 'Tous' && secteurFilter !== 'Tous secteurs') {
          query = query.eq('secteur', secteurFilter);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          // If table doesn't exist, show empty state
          if (fetchError.message?.includes('relation') || fetchError.message?.includes('does not exist')) {
            logger.warn('⚠️ Table fiches_cee n\'existe pas encore');
            setFiches([]);
            setLoading(false);
            return;
          }
          throw fetchError;
        }

        logger.log(`✅ ${data.length} fiches CEE chargées`);
        setFiches(data || []);

      } catch (err) {
        logger.error('❌ Erreur chargement fiches CEE:', err);
        setError(err.message);
        setFiches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFiches();
  }, [secteurFilter]);

  const secteurs = ['Tous', 'Tertiaire', 'Industrie', 'Résidentiel', 'Agriculture'];

  return (
    <>
      <Helmet>
        <title>Prime Énergie CEE - Financement jusqu'à 100% | EFFINOR</title>
        <meta name="description" content="Bénéficiez des Certificats d'Économies d'Énergie (CEE) pour financer vos luminaires LED. Notre équipe vous accompagne dans votre dossier." />
      </Helmet>

      {/* Hero Section - Full Width Background */}
      <div className="w-full bg-primary-900 text-white py-12 pt-32">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Award className="h-16 w-16 mx-auto mb-4 text-secondary-500" />
            <h1 className="text-4xl sm:text-5xl md:text-5xl font-bold mb-4 text-white">Prime Énergie CEE</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Financez jusqu'à 100% de votre installation LED grâce aux Certificats d'Économies d'Énergie
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="card p-8 mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Qu'est-ce que la Prime CEE ?</h2>
            
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 mb-4">
                Nos produits sont éligibles aux <strong>Certificats d'Économies d'Énergie (CEE)</strong>.
              </p>
              
              <p className="text-lg text-gray-700 mb-6">
                Selon votre activité et votre bâtiment, la prime peut couvrir <strong className="text-primary-700">jusqu'à 100 % du matériel et de l'installation</strong>.
              </p>

              <div className="badge badge-prime w-full text-center p-4 mb-6">
                <p className="font-semibold text-lg">
                  💡 Notre équipe vous aide à constituer le dossier complet et maximiser vos aides.
                </p>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">Avantages de la Prime CEE</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {[
                  'Financement jusqu\'à 100% de votre projet',
                  'Réduction immédiate de vos factures d\'énergie',
                  'Accompagnement complet par nos experts',
                  'Valorisation de votre patrimoine immobilier',
                  'Amélioration du confort de vos équipes',
                  'Engagement environnemental reconnu'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-secondary-500 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-primary-900 rounded-lg shadow-xl p-8 text-center text-white"
          >
            <FileText className="h-16 w-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4 text-white">Vérifiez votre éligibilité</h2>
            <p className="text-xl mb-8 text-white/90">
              Remplissez notre formulaire détaillé et obtenez une estimation personnalisée de vos aides CEE
            </p>
            <Link to="/formulaire-complet" className="btn-primary">
              <Send className="mr-2 h-5 w-5" />
              Commencer le formulaire
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Fiches CEE Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Nos Fiches CEE Disponibles
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez toutes les opérations éligibles aux Certificats d'Économies d'Énergie
            </p>
          </motion.div>

          {/* Filter */}
          <div className="flex justify-center mb-8">
            <select
              value={secteurFilter}
              onChange={(e) => setSecteurFilter(e.target.value)}
              className="px-6 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-all"
            >
              {secteurs.map(secteur => (
                <option key={secteur} value={secteur === 'Tous' ? 'Tous' : secteur}>
                  {secteur === 'Tous' ? 'Tous les secteurs' : secteur}
                </option>
              ))}
            </select>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-secondary-500" />
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center max-w-2xl mx-auto">
              <p className="text-yellow-800">
                ⚠️ Impossible de charger les fiches CEE pour le moment. Veuillez réessayer plus tard.
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && fiches.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center max-w-2xl mx-auto">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune fiche CEE disponible</h3>
              <p className="text-gray-600">
                Les fiches CEE seront bientôt disponibles. Consultez régulièrement cette page pour découvrir les nouvelles fiches.
              </p>
            </div>
          )}

          {/* Grid of fiches */}
          {!loading && fiches.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {fiches.map((fiche) => (
                <motion.div
                  key={fiche.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <Link
                    to={`/prime-cee/${fiche.slug}`}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 block h-full"
                  >
                    {fiche.image && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={getFileUrl(fiche.image)}
                          alt={fiche.titre}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          onError={(e) => {
                            logger.warn(`Failed to load image for fiche ${fiche.id}:`, fiche.image);
                            e.target.src = 'https://via.placeholder.com/400x300?text=Image+non+disponible';
                          }}
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <Badge className="bg-secondary-100 text-secondary-700 text-xs font-mono mb-3">
                        {fiche.numero}
                      </Badge>
                      <h3 className="text-xl font-semibold mb-2 text-gray-900 line-clamp-2">{fiche.titre}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{fiche.description}</p>
                      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <Badge variant="outline" className="text-xs">
                          {fiche.secteur}
                        </Badge>
                        {fiche.montant_cee && (
                          <span className="text-secondary-600 font-bold text-lg">
                            {fiche.montant_cee} {fiche.unite || '€/unité'}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default PrimeCEE;