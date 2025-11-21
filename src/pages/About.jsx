import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Award, Target, Users, Globe } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Award,
      title: 'Excellence',
      description: 'Produits certifiés CE et conformes aux normes les plus strictes'
    },
    {
      icon: Target,
      title: 'Performance',
      description: 'Solutions LED haute efficacité pour optimiser vos économies'
    },
    {
      icon: Users,
      title: 'Accompagnement',
      description: 'Équipe d\'experts à votre écoute pour tous vos projets'
    },
    {
      icon: Globe,
      title: 'Engagement',
      description: 'Solutions durables pour un avenir énergétique responsable'
    }
  ];

  return (
    <>
      <Helmet>
        <title>À propos - EFFINOR | Solutions LED professionnelles</title>
        <meta name="description" content="Découvrez EFFINOR, spécialiste des solutions LED industrielles et du financement CEE. Qualité, performance et accompagnement expert." />
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
            <h1 className="text-4xl sm:text-5xl md:text-5xl font-bold mb-4 text-white">À propos d'EFFINOR</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Votre partenaire de confiance pour l'éclairage LED professionnel
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
            className="bg-white rounded-lg shadow-md p-8 mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Notre histoire</h2>
            
            <div className="prose max-w-none text-gray-700 space-y-4">
              <p className="text-lg">
                <strong>EFFINOR</strong> est une division spécialisée du <strong>Groupe Effinor</strong>, 
                expert reconnu dans les solutions d'efficacité énergétique pour les professionnels.
              </p>
              
              <p>
                Forts de notre expérience dans le domaine des Certificats d'Économies d'Énergie (CEE), 
                nous avons développé une expertise unique dans l'éclairage LED industriel et professionnel.
              </p>

              <p>
                Notre mission : accompagner les entreprises dans leur transition énergétique en proposant 
                des solutions d'éclairage LED haute performance, économiques et respectueuses de l'environnement.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Nos valeurs</h2>
            
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-lg shadow-md p-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Notre engagement qualité</h2>
            
            <div className="space-y-4 text-gray-700">
              <p>
                Tous nos produits sont <strong>certifiés CE</strong> et répondent aux normes européennes 
                les plus strictes en matière de sécurité électrique et de performance énergétique.
              </p>

              <p>
                Nous sélectionnons rigoureusement nos fournisseurs et testons chaque gamme de produits 
                pour garantir une qualité optimale et une durabilité exceptionnelle.
              </p>

              <p>
                Notre équipe technique réalise des <strong>études photométriques DIALux gratuites</strong> pour 
                dimensionner précisément vos besoins et optimiser votre installation.
              </p>

              <div className="bg-accent-400 bg-opacity-10 border-2 border-accent-400 rounded-lg p-6 mt-6">
                <p className="font-semibold text-gray-900">
                  📍 Localisation : France / Europe
                </p>
                <p className="text-gray-700 mt-2">
                  Nous intervenons sur l'ensemble du territoire français et européen pour vos projets 
                  d'éclairage LED professionnel.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default About;