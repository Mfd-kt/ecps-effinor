import React from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Home, FileText, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ThankYou = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { leadId, ceePotential, companyName } = location.state || {};

  if (!leadId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Page introuvable</h1>
          <Link to="/">
            <Button>Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Merci pour votre demande | EFFINOR</title>
        <meta name="description" content="Votre demande d'éligibilité CEE a été envoyée avec succès. Notre équipe vous contactera sous 24h." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl p-8 md:p-12"
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="inline-block"
                >
                  <div className="bg-green-100 rounded-full p-6 mb-6">
                    <CheckCircle className="h-16 w-16 text-green-600" />
                  </div>
                </motion.div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Merci {companyName ? companyName : ''} !
                </h1>
                <p className="text-xl text-gray-600">
                  Votre demande d'éligibilité CEE a été envoyée avec succès
                </p>
              </div>

              {ceePotential && (
                <div className="bg-gradient-to-r from-secondary-50 to-green-50 border-2 border-secondary-200 rounded-lg p-6 mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                    Estimation de votre potentiel CEE
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm text-center">
                      <p className="text-sm text-gray-600 mb-2">Potentiel LED</p>
                      <p className="text-2xl font-bold text-secondary-600">
                        {ceePotential.ledPotential.toLocaleString('fr-FR')} €
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm text-center">
                      <p className="text-sm text-gray-600 mb-2">Potentiel Chauffage</p>
                      <p className="text-2xl font-bold text-secondary-600">
                        {ceePotential.heatingPotential.toLocaleString('fr-FR')} €
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm text-center">
                      <p className="text-sm text-gray-600 mb-2">Total estimé</p>
                      <p className="text-2xl font-bold text-green-600">
                        {ceePotential.totalPotential.toLocaleString('fr-FR')} €
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Prochaines étapes
                </h3>
                <ul className="space-y-3 text-blue-800">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-green-600" />
                    <span>Notre équipe d'experts analyse votre dossier sous 24h ouvrées</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-green-600" />
                    <span>Vous recevrez une étude personnalisée détaillée par email</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-green-600" />
                    <span>Un expert vous contactera pour affiner votre projet</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-green-600" />
                    <span>Nous vous accompagnons dans la constitution de votre dossier CEE</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">Besoin d'aide ?</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="h-5 w-5 text-secondary-600" />
                    <a href="mailto:contact@effinor.fr" className="hover:text-secondary-600 transition-colors">
                      contact@effinor.fr
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="h-5 w-5 text-secondary-600" />
                    <a href="tel:+33123456789" className="hover:text-secondary-600 transition-colors">
                      +33 1 23 45 67 89
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <Home className="mr-2 h-5 w-5" />
                    Retour à l'accueil
                  </Button>
                </Link>
                <Link to="/prime-cee/eligibilite">
                  <Button size="lg" className="w-full sm:w-auto bg-secondary-600 hover:bg-secondary-700">
                    <FileText className="mr-2 h-5 w-5" />
                    Nouvelle demande
                  </Button>
                </Link>
              </div>

              <p className="text-center text-sm text-gray-500 mt-8">
                Référence de votre demande : <span className="font-mono font-semibold">{leadId}</span>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ThankYou;