import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Award, CheckCircle, Send, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrimeCEE = () => {
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
    </>
  );
};

export default PrimeCEE;