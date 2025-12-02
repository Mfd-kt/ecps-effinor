import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Lightbulb, Wind, ShieldCheck, TrendingUp, Users, Award, TrendingDown } from 'lucide-react';
import MiniEstimationForm from '@/components/MiniEstimationForm';
import FinalCTA from '@/components/FinalCTA';
import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/utils/logger';

const Home = () => {
  const [featuredRealisations, setFeaturedRealisations] = useState([]);
  const [loadingRealisations, setLoadingRealisations] = useState(true);

  useEffect(() => {
    fetchFeaturedRealisations();
  }, []);

  const fetchFeaturedRealisations = async () => {
    try {
      const { data, error } = await supabase
        .from('realisations')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(6);

      if (error) {
        // Si la table n'existe pas encore, continuer sans erreur
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          logger.warn('[Home] Table realisations does not exist yet');
          setFeaturedRealisations([]);
          return;
        }
        throw error;
      }
      setFeaturedRealisations(data || []);
    } catch (err) {
      logger.error('[Home] Error fetching featured realisations:', err);
      setFeaturedRealisations([]);
    } finally {
      setLoadingRealisations(false);
    }
  };

  const solutions = [
    { icon: Lightbulb, title: "Highbay LED", description: "Éclairage haute performance pour hall industriel, entrepôts et grands volumes." },
    { icon: Lightbulb, title: "Réglettes LED", description: "Solutions d'éclairage linéaire pour bureaux, ateliers et espaces tertiaires." },
    { icon: Lightbulb, title: "Projecteurs LED", description: "Éclairage extérieur et industriel robuste, IP65+, idéal pour l'extérieur." },
    { icon: Lightbulb, title: "LED Agricole", description: "Solutions d'éclairage pour serres chauffées, élevages et bâtiments agricoles." }
  ];

  const benefits = [
    { icon: "✅", title: "Livraison rapide", description: "Expédition sous 24-48h pour tous nos produits en stock." },
    { icon: "💰", title: "Meilleur prix garanti", description: "Prix compétitifs sans compromis sur la qualité." },
    { icon: "📞", title: "Support technique", description: "Équipe d'experts à votre écoute pour vos projets." },
    { icon: "🛡️", title: "Qualité certifiée", description: "Produits conformes aux normes, garantis et durables." }
  ];

  const stats = [
    { icon: TrendingUp, number: "50 000+", label: "luminaires installés" },
    { icon: Users, number: "500+", label: "clients professionnels" },
    { icon: Award, number: "5 ans", label: "garantie sur sélection" }
  ];

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <>
      <Helmet>
        <title>Effinor Lighting – Fournisseur LED professionnel pour l'industrie, le tertiaire et l'agricole</title>
        <meta name="description" content="Luminaires LED industriels, tertiaires et agricoles. Highbay, réglettes, projecteurs, solutions d'éclairage performantes, livraison rapide et prix compétitifs." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@700&display=swap" rel="stylesheet" />
        <style>{`:root { --secondary-500-rgb: 16, 185, 129; }`}</style>
      </Helmet>

      <section className="hero-section z-0">
        <div className="container mx-auto px-3 md:px-4 py-8 md:py-12 lg:py-16 overflow-x-hidden">
          <div className="max-w-[95%] sm:max-w-lg md:max-w-3xl lg:max-w-6xl xl:max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center relative z-10">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col items-center lg:items-start text-center lg:text-left"
              >
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 md:mb-4 lg:mb-6 leading-tight">
                  Effinor Lighting, votre fournisseur LED professionnel
                </h1>
                <p className="text-sm md:text-base lg:text-lg text-white/90 mb-4 md:mb-6 max-w-xl">
                  Des luminaires industriels performants, livrés rapidement, au meilleur prix. Qualité certifiée, service rapide, satisfaction garantie.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mb-4 md:mb-6">
                  <Link to="/boutique" className="btn-primary text-sm md:text-base px-4 md:px-6 py-2.5 md:py-3">
                    Découvrir la boutique <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                  </Link>
                  <Link to="/a-propos" className="btn-secondary text-sm md:text-base px-4 md:px-6 py-2.5 md:py-3">
                    En savoir plus
                  </Link>
                </div>
                <div className="grid grid-cols-3 gap-2 md:gap-3 w-full">
                  {stats.map((stat, index) => (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-2 md:p-3 text-center">
                      <div className="text-xl md:text-2xl lg:text-3xl font-bold text-[var(--secondary-400)] mb-1">{stat.number}</div>
                      <div className="text-[10px] md:text-xs text-white/80">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
              <MiniEstimationForm />
            </div>
          </div>
        </div>
      </section>

      <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="py-4 md:py-6 lg:py-8 bg-gray-50 overflow-x-hidden">
        <div className="container mx-auto max-w-7xl px-3 md:px-4 overflow-x-hidden">
          <div className="max-w-[95%] sm:max-w-lg md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto">
            <div className="text-center mb-3 md:mb-4">
              <h2 className="text-base md:text-lg lg:text-xl mb-1 md:mb-1.5 text-gray-800">Nos Solutions LED Professionnelles</h2>
              <p className="text-xs md:text-sm text-gray-600">
                Découvrez nos Highbay, réglettes, projecteurs et solutions agricoles pour tous vos besoins d'éclairage professionnel.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
              {solutions.map((solution, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-2.5 md:p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="w-7 h-7 md:w-8 md:h-8 bg-[var(--secondary-500)]/10 rounded-lg flex items-center justify-center mb-1.5 md:mb-2">
                    <solution.icon className="h-3.5 w-3.5 md:h-4 md:w-4 text-[var(--secondary-500)]" />
                  </div>
                  <h3 className="text-xs md:text-sm lg:text-base mb-0.5 md:mb-1 font-semibold text-gray-900">{solution.title}</h3>
                  <p className="text-[10px] md:text-xs text-gray-600 leading-relaxed">{solution.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="py-4 md:py-6 lg:py-8 bg-white overflow-x-hidden">
        <div className="container mx-auto max-w-7xl px-3 md:px-4 overflow-x-hidden">
          <div className="max-w-[95%] sm:max-w-lg md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto">
            <div className="text-center mb-3 md:mb-4">
              <h2 className="text-base md:text-lg lg:text-xl mb-1 md:mb-1.5 text-gray-800">Pourquoi choisir EFFINOR ?</h2>
              <p className="text-xs md:text-sm text-gray-600">
                Un accompagnement simple, rapide et efficace pour un projet réussi.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-gray-50 p-2.5 md:p-3 rounded-lg text-center border border-gray-100">
                  <div className="text-lg md:text-xl lg:text-2xl mb-1 md:mb-1.5">{benefit.icon}</div>
                  <h3 className="text-xs md:text-sm mb-0.5 font-semibold text-gray-800">{benefit.title}</h3>
                  <p className="text-[10px] md:text-xs text-gray-600 leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Section Réalisations */}
      {!loadingRealisations && featuredRealisations.length > 0 && (
        <motion.section 
          variants={sectionVariants} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, amount: 0.2 }} 
          className="py-4 md:py-6 lg:py-8 bg-gray-50 overflow-x-hidden"
        >
          <div className="container mx-auto max-w-7xl px-3 md:px-4 overflow-x-hidden">
            <div className="max-w-[95%] sm:max-w-lg md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto">
              <div className="text-center mb-3 md:mb-4">
                <h2 className="text-base md:text-lg lg:text-xl mb-1 md:mb-1.5 text-gray-800">Nos Réalisations</h2>
                <p className="text-xs md:text-sm text-gray-600">
                  Découvrez nos projets d'éclairage LED réussis pour des clients professionnels.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 mb-3 md:mb-4">
                {featuredRealisations.slice(0, 6).map((realisation, index) => {
                  const mainImage = realisation.images && realisation.images[0]?.url;
                  return (
                    <motion.div
                      key={realisation.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Link
                        to={`/realisations/${realisation.slug}`}
                        className="block bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
                      >
                        <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
                          {mainImage ? (
                            <img
                              src={mainImage}
                              alt={realisation.titre}
                              className="w-full h-full object-cover scale-90 md:scale-100"
                            />
                          ) : (
                            <div className="text-gray-400 text-xs">Pas d'image</div>
                          )}
                        </div>
                        <div className="p-2 md:p-3">
                          <h3 className="text-xs md:text-sm lg:text-base font-bold text-gray-900 mb-1 md:mb-1.5 line-clamp-2">
                            {realisation.titre}
                          </h3>
                          {realisation.client && (
                            <p className="text-[10px] md:text-xs text-gray-600 mb-0.5 md:mb-1">
                              {realisation.client}
                            </p>
                          )}
                          {realisation.secteur && (
                            <p className="text-[10px] md:text-xs text-gray-500 mb-1.5 md:mb-2">
                              {realisation.secteur}
                            </p>
                          )}
                          {realisation.description_courte && (
                            <p className="text-gray-700 mb-1.5 md:mb-2 line-clamp-2 text-[10px] md:text-xs">
                              {realisation.description_courte}
                            </p>
                          )}
                          {realisation.economie_energie_pct && (
                            <div className="flex items-center gap-1 md:gap-1.5 text-[var(--secondary-500)] font-bold text-[10px] md:text-xs">
                              <TrendingDown className="h-2.5 w-2.5 md:h-3 md:w-3" />
                              <span>Économie: {realisation.economie_energie_pct}%</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
              <div className="text-center">
                <Link
                  to="/realisations"
                  className="inline-flex items-center px-3 md:px-4 py-1.5 md:py-2 bg-[var(--secondary-500)] text-white rounded-lg hover:bg-[var(--secondary-600)] transition-colors font-semibold text-[10px] md:text-xs lg:text-sm"
                >
                  Voir toutes nos réalisations
                  <ArrowRight className="ml-1.5 md:ml-2 h-2.5 w-2.5 md:h-3 md:w-3" />
                </Link>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      <FinalCTA />
    </>
  );
};

export default Home;