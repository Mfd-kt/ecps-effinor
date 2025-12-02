import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Target, Users, Globe, CheckCircle2, Building2, Factory, Store, MapPin, Zap, Shield, FileCheck, Lightbulb, TrendingUp, Phone, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';

const About = () => {
  const values = [
    {
      icon: Award,
      title: 'Excellence',
      description: 'Produits certifiés CE et conformes aux normes les plus strictes. Sélection rigoureuse de nos fournisseurs et contrôles qualité systématiques.'
    },
    {
      icon: Target,
      title: 'Performance',
      description: 'Solutions LED haute efficacité pour optimiser vos économies d\'énergie. Jusqu\'à 35% d\'économies constatées en moyenne sur vos factures.'
    },
    {
      icon: Users,
      title: 'Accompagnement',
      description: 'Équipe d\'experts photométriques à votre écoute. Études DIALux gratuites et conseil personnalisé pour chaque projet.'
    },
    {
      icon: Globe,
      title: 'Engagement',
      description: 'Solutions durables pour un avenir énergétique responsable. Réduction de l\'empreinte carbone et transition énergétique réussie.'
    }
  ];

  const stats = [
    { icon: TrendingUp, number: '+1 200', label: 'projets accompagnés', color: 'text-blue-600' },
    { icon: Users, number: '180+', label: 'clients professionnels', color: 'text-green-600' },
    { icon: Award, number: '4,8/5', label: 'satisfaction client', color: 'text-yellow-600' },
    { icon: Zap, number: '35%', label: 'd\'économies d\'énergie moyenne', color: 'text-purple-600' }
  ];

  const whyChooseUs = [
    {
      icon: Calculator,
      title: 'Expertise photométrique DIALux',
      description: 'Études photométriques gratuites réalisées par nos ingénieurs pour dimensionner précisément votre installation LED professionnelle.'
    },
    {
      icon: Shield,
      title: 'Produits certifiés CE/ROHS',
      description: 'Tous nos luminaires LED professionnels sont certifiés CE, conformes aux normes européennes et garantis constructeur.'
    },
    {
      icon: Award,
      title: 'Qualité premium garantie',
      description: 'Sélection rigoureuse de nos fournisseurs, tests photométriques systématiques et contrôle qualité à chaque étape.'
    },
    {
      icon: FileCheck,
      title: 'Garantie professionnelle',
      description: 'Garantie constructeur jusqu\'à 5 ans sur sélection, avec SAV réactif et pièces détachées disponibles.'
    },
    {
      icon: Users,
      title: 'Installation & conseil expert',
      description: 'Accompagnement complet de l\'étude à l\'installation, avec conseil technique personnalisé pour chaque projet.'
    },
    {
      icon: Phone,
      title: 'SAV réactif',
      description: 'Support technique disponible et intervention rapide pour garantir la continuité de votre activité professionnelle.'
    }
  ];

  const domains = [
    { icon: Factory, title: 'Entrepôts logistiques', description: 'Éclairage LED haute performance pour entrepôts, centres de distribution et plateformes logistiques.' },
    { icon: Building2, title: 'Sites industriels', description: 'Solutions LED robustes pour usines, ateliers de production et environnements industriels exigeants.' },
    { icon: Store, title: 'Commerces & retail', description: 'Éclairage LED professionnel pour magasins, grandes surfaces et espaces commerciaux.' },
    { icon: Building2, title: 'Collectivités', description: 'Solutions LED durables pour bâtiments publics, écoles, hôpitaux et administrations.' },
    { icon: Building2, title: 'Tertiaire & bureaux', description: 'Éclairage LED confort visuel pour bureaux, open spaces et espaces de travail modernes.' },
    { icon: MapPin, title: 'Éclairage extérieur pro', description: 'Projecteurs LED IP65+ pour parkings, cours, façades et éclairage extérieur professionnel.' }
  ];

  const processSteps = [
    {
      step: '1',
      title: 'Étude & diagnostic',
      description: 'Analyse de votre installation actuelle, relevé photométrique et identification des opportunités d\'optimisation énergétique.'
    },
    {
      step: '2',
      title: 'Simulation photométrique',
      description: 'Étude DIALux gratuite pour dimensionner précisément votre projet LED et visualiser les résultats avant installation.'
    },
    {
      step: '3',
      title: 'Proposition technique',
      description: 'Devis détaillé avec sélection de produits adaptés, plan d\'installation et calcul précis du retour sur investissement.'
    },
    {
      step: '4',
      title: 'Installation ou accompagnement',
      description: 'Installation par nos équipes certifiées ou accompagnement pour vos équipes internes, avec formation et support technique.'
    }
  ];

  const certifications = [
    { title: 'Conformité CE', description: 'Tous nos produits respectent la directive européenne sur la sécurité des équipements électriques.' },
    { title: 'ROHS', description: 'Conformité aux restrictions sur les substances dangereuses pour un éclairage LED respectueux de l\'environnement.' },
    { title: 'Efficacité énergétique', description: 'Luminaires LED haute performance certifiés, avec fiches techniques détaillées et garanties constructeur.' },
    { title: 'Garantie constructeur', description: 'Garantie jusqu\'à 5 ans sur sélection, avec SAV réactif et disponibilité des pièces détachées.' }
  ];

  return (
    <>
      <Helmet>
        <title>À propos - EFFINOR | Expert en éclairage LED professionnel et solutions d'efficacité énergétique</title>
        <meta name="description" content="EFFINOR, expert en éclairage LED professionnel et solutions d'efficacité énergétique. +1 200 projets accompagnés, études photométriques DIALux gratuites, produits certifiés CE. Solutions LED pour entrepôts, industriels, commerces et collectivités." />
        <meta name="keywords" content="éclairage LED professionnel, solutions LED, efficacité énergétique, relamping LED, étude photométrique, éclairage industriel, projecteurs LED pro, panneaux LED pro, DIALux, LED entrepôt, LED industriel" />
      </Helmet>

      {/* Hero Section - Full Width Background */}
      <div className="w-full bg-primary-900 text-white py-8 md:py-12 lg:py-16 pt-24 md:pt-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-6 text-white">
              Expert en éclairage LED professionnel et solutions d'efficacité énergétique
            </h1>
            <p className="text-base md:text-lg lg:text-xl xl:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed px-4">
              Accompagnons votre transition énergétique avec des solutions LED haute performance, certifiées et garanties. Réduisez vos coûts jusqu'à 35% tout en améliorant la qualité de votre éclairage professionnel.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-6 md:py-8 lg:py-12 px-4 overflow-x-hidden">
        <div className="max-w-[95%] sm:max-w-lg md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto">
          
          {/* Section: Notre mission */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-lg shadow-md p-4 md:p-6 lg:p-8 xl:p-12 mb-6 md:mb-8 lg:mb-12"
          >
            <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-4 md:mb-6">Notre mission</h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p className="text-lg leading-relaxed">
                Accompagner les entreprises et collectivités dans leur <strong>transition énergétique</strong> en proposant des <strong>solutions d'éclairage LED professionnel</strong> haute performance, économiques et respectueuses de l'environnement.
              </p>
              <p className="leading-relaxed">
                Nous croyons que l'<strong>efficacité énergétique</strong> est un levier majeur de compétitivité et de responsabilité environnementale. Notre expertise en <strong>relamping LED</strong> permet aux professionnels de réduire significativement leurs coûts d'exploitation tout en améliorant la qualité de leur éclairage.
              </p>
            </div>
          </motion.div>

          {/* Section: Qui sommes-nous ? */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-lg shadow-md p-4 md:p-6 lg:p-8 xl:p-12 mb-6 md:mb-8 lg:mb-12"
          >
            <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-4 md:mb-6">Qui sommes-nous ?</h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p className="text-lg leading-relaxed">
                <strong>EFFINOR</strong> est une division spécialisée du <strong>Groupe Effinor</strong>, expert reconnu dans les solutions d'<strong>efficacité énergétique</strong> pour les professionnels depuis plus de 10 ans.
              </p>
              <p className="leading-relaxed">
                Forts de notre expérience dans le domaine de l'<strong>efficacité énergétique</strong>, nous avons développé une expertise unique dans l'<strong>éclairage LED industriel et professionnel</strong>. Notre équipe d'ingénieurs photométriques réalise des <strong>études photométriques DIALux</strong> pour dimensionner précisément chaque projet et garantir des résultats optimaux.
              </p>
              <p className="leading-relaxed">
                Nous intervenons sur l'ensemble du territoire français et européen, accompagnant les entreprises de toutes tailles dans leur <strong>relamping LED</strong> : de l'audit énergétique initial à l'installation complète, en passant par la simulation photométrique et le conseil technique personnalisé.
              </p>
              <p className="leading-relaxed">
                Notre approche combine <strong>expertise technique</strong>, <strong>produits LED certifiés</strong> de qualité premium et <strong>accompagnement complet</strong> pour garantir la réussite de chaque projet d'éclairage professionnel.
              </p>
            </div>
          </motion.div>

          {/* Section: Nos chiffres clés */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-6 md:mb-8 text-center">Nos chiffres clés</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-shadow"
                >
                  <div className={`w-16 h-16 ${stat.color} bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4`}>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600 text-sm md:text-base">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Section: Pourquoi choisir EFFINOR ? */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-lg shadow-md p-4 md:p-6 lg:p-8 xl:p-12 mb-6 md:mb-8 lg:mb-12"
          >
            <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-6 md:mb-8">Pourquoi choisir EFFINOR ?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {whyChooseUs.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-secondary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Section: Nos valeurs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-6 md:mb-8 text-center">Nos valeurs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 bg-secondary-600 rounded-lg flex items-center justify-center mb-4">
                    <value.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Section: Notre engagement qualité */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-lg shadow-md p-4 md:p-6 lg:p-8 xl:p-12 mb-6 md:mb-8 lg:mb-12"
          >
            <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-4 md:mb-6">Notre engagement qualité</h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p className="leading-relaxed">
                Tous nos produits d'<strong>éclairage LED professionnel</strong> sont <strong>certifiés CE</strong> et répondent aux normes européennes les plus strictes en matière de sécurité électrique et de performance énergétique. Nous sélectionnons rigoureusement nos fournisseurs selon des critères d'excellence : qualité des composants, efficacité lumineuse, durabilité et conformité réglementaire.
              </p>
              <p className="leading-relaxed">
                Chaque gamme de produits est testée en laboratoire pour garantir une qualité optimale et une durabilité exceptionnelle. Nos <strong>tests photométriques</strong> vérifient l'efficacité lumineuse, la répartition de la lumière, la température de couleur et la durée de vie des <strong>luminaires LED professionnels</strong>.
              </p>
              <p className="leading-relaxed">
                Notre équipe technique réalise des <strong>études photométriques DIALux gratuites</strong> pour dimensionner précisément vos besoins et optimiser votre installation. Ces simulations permettent de visualiser les résultats avant installation, d'optimiser le nombre de luminaires nécessaires et de garantir un éclairage uniforme et performant.
              </p>
              <p className="leading-relaxed">
                Nous garantissons la <strong>conformité aux normes</strong> (CE, ROHS, efficacité énergétique) et la traçabilité complète de nos produits, avec fiches techniques détaillées et garanties constructeur jusqu'à 5 ans sur sélection.
              </p>
            </div>
          </motion.div>

          {/* Section: Nos domaines d'intervention */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-6 md:mb-8 text-center">Nos domaines d'intervention</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {domains.map((domain, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4">
                    <domain.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{domain.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{domain.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Section: Notre process en 4 étapes */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-lg shadow-md p-4 md:p-6 lg:p-8 xl:p-12 mb-6 md:mb-8 lg:mb-12"
          >
            <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-6 md:mb-8 text-center">Notre process en 4 étapes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {processSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="bg-secondary-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{step.description}</p>
                  {index < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-6 left-1/2 w-full h-0.5 bg-gray-200 -z-10" style={{ transform: 'translateX(50%)' }} />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Section: Certifications & garanties */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-lg shadow-md p-8 md:p-12 mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Certifications & garanties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certifications.map((cert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 hover:border-secondary-500 transition-colors"
                >
                  <CheckCircle2 className="h-6 w-6 text-secondary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{cert.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{cert.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Section: CTA Final */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-primary-900 to-primary-800 rounded-lg shadow-xl p-8 md:p-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Prêt à réduire vos coûts d'éclairage jusqu'à 35% ?</h2>
            <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
              Contactez nos experts en éclairage LED professionnel pour une étude photométrique gratuite et un devis personnalisé.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="bg-white text-primary-900 hover:bg-gray-100 font-semibold px-8 py-6 text-lg">
                  <Phone className="mr-2 h-5 w-5" />
                  Contactez nos experts
                </Button>
              </Link>
              <Link to="/formulaire-complet">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-primary-900 font-semibold px-8 py-6 text-lg bg-transparent">
                  <Calculator className="mr-2 h-5 w-5" />
                  Demander une étude photométrique gratuite
                </Button>
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </>
  );
};

export default About;
