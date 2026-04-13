import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Factory, ShoppingBag, TrendingDown, Zap, Calendar } from 'lucide-react';
const CaseStudies = () => {
  const [activeTab, setActiveTab] = useState(0);
  const cases = [{
    icon: Factory,
    category: 'Entrepôt Logistique',
    company: 'LogiStock France',
    location: 'Lyon',
    surface: '5000 m²',
    savings: '68%',
    investment: '45 000€',
    cee: '35 000€',
    roi: '18 mois',
    description: 'Remplacement de 250 tubes fluorescents par des LED haute performance dans un entrepôt de stockage.',
    results: ['Réduction de 68% de la consommation électrique', 'Amélioration de la luminosité de 40%', 'Élimination des coûts de maintenance', 'Retour sur investissement en 18 mois'],
    beforeImage: 'Dark warehouse with old fluorescent lighting',
    afterImage: 'Bright modern warehouse with LED lighting'
  }, {
    icon: Building2,
    category: 'Bureaux Tertiaires',
    company: 'TechCorp Solutions',
    location: 'Paris',
    surface: '2000 m²',
    savings: '62%',
    investment: '28 000€',
    cee: '22 000€',
    roi: '12 mois',
    description: 'Modernisation complète de l\'éclairage de bureaux avec détection de présence et gestion intelligente.',
    results: ['Économie annuelle de 18 000€', 'Confort visuel amélioré pour 150 employés', 'Gestion automatisée de l\'éclairage', 'Certification HQE obtenue'],
    beforeImage: 'Traditional office with fluorescent ceiling lights',
    afterImage: 'Modern office with smart LED lighting system'
  }, {
    icon: ShoppingBag,
    category: 'Commerce Retail',
    company: 'SuperMarché Plus',
    location: 'Marseille',
    surface: '1500 m²',
    savings: '55%',
    investment: '32 000€',
    cee: '18 000€',
    roi: '24 mois',
    description: 'Installation LED avec température de couleur optimisée pour la mise en valeur des produits.',
    results: ['Réduction de 55% des coûts d\'éclairage', 'Meilleure mise en valeur des produits', 'Augmentation du confort client', 'Durée de vie 5x supérieure'],
    beforeImage: 'Retail store with old halogen spotlights',
    afterImage: 'Modern retail store with LED accent lighting'
  }];
  const activeCase = cases[activeTab];
  return <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.6
      }} className="text-center mb-12">
          <span className="inline-block bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            Études de cas
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nos réalisations récentes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez comment nos clients ont transformé leur éclairage
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {cases.map((caseStudy, index) => <button key={index} onClick={() => setActiveTab(index)} className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${activeTab === index ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50 shadow'}`}>
              <caseStudy.icon className="w-5 h-5" />
              {caseStudy.category}
            </button>)}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -20
        }} transition={{
          duration: 0.5
        }} className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 p-8">
              <div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {activeCase.company}
                  </h3>
                  <p className="text-gray-600 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {activeCase.location} • {activeCase.surface}
                  </p>
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed">
                  {activeCase.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-gray-600 font-medium">Économies</span>
                    </div>
                    <div className="text-3xl font-bold text-green-600">
                      {activeCase.savings}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-600 font-medium">ROI</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                      {activeCase.roi}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-purple-600" />
                      <span className="text-sm text-gray-600 font-medium">Investissement</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {activeCase.investment}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-5 h-5 text-orange-600" />
                      <span className="text-sm text-gray-600 font-medium">Primes CEE</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">
                      {activeCase.cee}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-6">
                  <h4 className="font-bold text-gray-900 mb-4">Résultats obtenus :</h4>
                  <ul className="space-y-2">
                    {activeCase.results.map((result, index) => <li key={index} className="flex items-start gap-2 text-gray-700">
                        <span className="text-cyan-500 mt-1">✓</span>
                        <span>{result}</span>
                      </li>)}
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-2">AVANT</p>
                  <img className="w-full h-64 object-cover rounded-xl shadow-lg" alt={`${activeCase.company} before LED installation`} src="https://horizons-cdn.hostinger.com/af4d6cb8-3ed0-4aab-b714-14e686641159/2025-09-15-14.30.08-aJOtL.jpg" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-2">APRÈS</p>
                  <img className="w-full h-64 object-cover rounded-xl shadow-lg" alt={`${activeCase.company} after LED installation`} src="https://horizons-cdn.hostinger.com/af4d6cb8-3ed0-4aab-b714-14e686641159/imageusine-xcF8f.png" />
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>;
};
export default CaseStudies;