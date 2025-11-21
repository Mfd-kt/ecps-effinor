import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Lightbulb, Wind, ShieldCheck, TrendingUp, Users, Award } from 'lucide-react';
import MiniEstimationForm from '@/components/MiniEstimationForm';
import FinalCTA from '@/components/FinalCTA';

const Home = () => {
  const solutions = [
    { icon: Lightbulb, title: "Éclairage LED", description: "Modernisez votre éclairage pour une efficacité maximale et une consommation réduite." },
    { icon: Wind, title: "Déstratificateurs d'Air", description: "Homogénéisez la température de vos grands volumes et réduisez vos coûts de chauffage." },
    { icon: ShieldCheck, title: "Isolation", description: "Isolez vos bâtiments pour des économies d'énergie durables." },
    { icon: Zap, title: "Audit Énergétique Complet", description: "Identifiez tous les gisements d'économies d'énergie grâce à une analyse 360°." }
  ];

  const benefits = [
    { icon: "✅", title: "Audit 100% gratuit", description: "Nous analysons votre potentiel sans aucun frais." },
    { icon: "💰", title: "Jusqu'à 50% d'économies", description: "Réduisez drastiquement vos factures d'énergie." },
    { icon: "📞", title: "Rappel en 2h", description: "Un expert vous contacte rapidement pour votre projet." },
    { icon: "🧑‍🎓", title: "Experts certifiés", description: "Notre équipe est qualifiée pour garantir vos aides." }
  ];

  const stats = [
    { icon: TrendingUp, number: "50%", label: "d'économies en moyenne" },
    { icon: Users, number: "250+", label: "clients satisfaits" },
    { icon: Award, number: "100%", label: "projets CEE validés" }
  ];

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <>
      <Helmet>
        <title>Réduisez vos Factures Énergétiques avec les CEE | EFFINOR</title>
        <meta name="description" content="Audit énergétique gratuit en 24h. Réalisez jusqu'à 50% d'économies sur vos factures grâce aux Certificats d'Économies d'Énergie (CEE)." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@700&display=swap" rel="stylesheet" />
        <style>{`:root { --secondary-500-rgb: 16, 185, 129; }`}</style>
      </Helmet>

      <section className="hero-section z-0">
        <div className="container mx-auto grid lg:grid-cols-2 gap-16 lg:gap-20 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center lg:items-start text-center lg:text-left"
          >
            <h1>Réduisez vos factures énergétiques avec les CEE</h1>
            <p className="hero-subtitle my-8 max-w-xl">
              Audit gratuit en 24h | Jusqu'à 50% d'économies sur vos projets d'efficacité énergétique.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link to="/formulaire-complet" className="btn-primary">
                Demander un audit gratuit <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/a-propos" className="btn-secondary">
                En savoir plus
              </Link>
            </div>
            <div className="hero-stats w-full">
              {stats.map((stat, index) => (
                <div key={index} className="hero-stat-item">
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
          <MiniEstimationForm />
        </div>
      </section>

      <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4 text-gray-800">Nos Solutions CEE</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Nous vous accompagnons sur une large gamme de projets pour maximiser vos économies d'énergie et vos primes CEE.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {solutions.map((solution, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 solution-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="w-12 h-12 icon-wrapper rounded-lg flex items-center justify-center mb-4">
                  <solution.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl mb-2">{solution.title}</h3>
                <p>{solution.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4 text-gray-800">Pourquoi choisir EFFINOR ?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Un accompagnement simple, rapide et efficace pour un projet réussi.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-lg text-center shadow-sm">
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl mb-2 text-gray-800">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <FinalCTA />
    </>
  );
};

export default Home;