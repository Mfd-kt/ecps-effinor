import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Users, Award } from 'lucide-react';
import MiniEstimationForm from '@/components/MiniEstimationForm';
import FinalCTA from '@/components/FinalCTA';
import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/utils/logger';
import { getBestSellerProducts } from '@/lib/api/products';
import HomeCategoryNav from '@/components/home/HomeCategoryNav';
import HomePromoSlider from '@/components/home/HomePromoSlider';
import HomeBestSellers from '@/components/home/HomeBestSellers';
import HomeTrustSection from '@/components/home/HomeTrustSection';
import HomeRealisationsPreview from '@/components/home/HomeRealisationsPreview';
import HomeB2BCTA from '@/components/home/HomeB2BCTA';

const Home = () => {
  const [featuredRealisations, setFeaturedRealisations] = useState([]);
  const [loadingRealisations, setLoadingRealisations] = useState(true);
  const [bestSellerProducts, setBestSellerProducts] = useState([]);
  const [loadingBestSellers, setLoadingBestSellers] = useState(true);

  const [promoProducts] = useState([]);

  useEffect(() => {
    fetchFeaturedRealisations();
    fetchBestSellers();
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
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          setFeaturedRealisations([]);
          return;
        }
        throw error;
      }
      setFeaturedRealisations(data || []);
    } catch (err) {
      logger.error('Error fetching featured realisations:', err);
      setFeaturedRealisations([]);
    } finally {
      setLoadingRealisations(false);
    }
  };

  const fetchBestSellers = async () => {
    try {
      setLoadingBestSellers(true);
      const result = await getBestSellerProducts(8);
      if (result.success) {
        setBestSellerProducts(result.data || []);
      } else {
        setBestSellerProducts([]);
      }
    } catch (err) {
      logger.error('Error fetching best sellers:', err);
      setBestSellerProducts([]);
    } finally {
      setLoadingBestSellers(false);
    }
  };

  const stats = [
    { number: '50 000+', label: 'luminaires installés' },
    { number: '500+', label: 'clients professionnels' },
    { number: '5 ans', label: 'garantie sur sélection' },
  ];

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <>
      <Helmet>
        <title>Effinor Lighting – Fournisseur LED professionnel pour l'industrie, le tertiaire et l'agricole</title>
        <meta
          name="description"
          content="Luminaires LED industriels, tertiaires et agricoles certifiés CE/RoHS. Highbay, projecteurs, panneaux LED, réglettes. Réduction consommation jusqu'à 80%, livraison rapide en France, tarifs B2B dégressifs. Expertise éclairage professionnel depuis 10 ans."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@700&display=swap"
          rel="stylesheet"
        />
        <style>{`:root { --secondary-500-rgb: 16, 185, 129; }`}</style>
      </Helmet>

      {/* SECTION 1 — HERO (H1 principal) */}
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
                  Luminaires LED industriels, tertiaires et agricoles de qualité. Éclairage performant, certifications CE/RoHS, livraison rapide en France. Réduisez votre consommation énergétique jusqu'à 80% avec nos solutions d'éclairage professionnel.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mb-4 md:mb-6">
                  <Link to="/produits-solutions" className="btn-primary text-sm md:text-base px-4 md:px-6 py-2.5 md:py-3">
                    Découvrir nos produits <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                  </Link>
                  <Link to="/a-propos" className="btn-secondary text-sm md:text-base px-4 md:px-6 py-2.5 md:py-3">
                    En savoir plus
                  </Link>
                </div>
                <div className="grid grid-cols-3 gap-2 md:gap-3 w-full">
                  {stats.map((stat, index) => (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-2 md:p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-xl md:text-2xl lg:text-3xl font-bold text-[var(--secondary-400)] mb-1">
                        {index === 0 && <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />}
                        {index === 1 && <Users className="w-4 h-4 md:w-5 md:h-5" />}
                        {index === 2 && <Award className="w-4 h-4 md:w-5 md:h-5" />}
                        <span>{stat.number}</span>
                      </div>
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

      {/* SECTION 2 — Navigation rapide catégories (H2) */}
      <HomeCategoryNav
        title="Accéder directement à vos solutions LED"
        subtitle="Highbay, projecteurs, panneaux et solutions spécifiques pour sécuriser, éclairer et optimiser vos sites professionnels."
      />

      {/* SECTION 3 — Promotions du moment (carrousel) */}
      <HomePromoSlider promos={promoProducts} />

      {/* SECTION 4 — Best-sellers */}
      <HomeBestSellers products={bestSellerProducts} loading={loadingBestSellers} />

      {/* SECTION 5 — Bloc crédibilité / Pourquoi Effinor */}
      <HomeTrustSection />

      {/* SECTION 6 — Réalisations professionnelles */}
      <motion.div variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
        <HomeRealisationsPreview
          realisations={featuredRealisations}
          title="Réalisations professionnelles Effinor Lighting"
          subtitle="Quelques projets d'éclairage LED menés avec des entrepôts, industries, coopératives et collectivités en France."
        />
      </motion.div>

      {/* SECTION 7 — Appel à l’action B2B */}
      <HomeB2BCTA />

      {/* SECTION 8 — CTA finale existante */}
      <FinalCTA />
    </>
  );
};

export default Home;