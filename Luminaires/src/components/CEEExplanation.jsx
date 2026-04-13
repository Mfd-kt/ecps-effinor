import React from 'react';
import { motion } from 'framer-motion';
import { Gift, FileCheck, Banknote, TrendingUp } from 'lucide-react';

const CEEExplanation = () => {
  const advantages = [
    {
      icon: Gift,
      title: 'Primes jusqu\'à 100%',
      description: 'Financez votre projet grâce aux Certificats d\'Économies d\'Énergie'
    },
    {
      icon: FileCheck,
      title: 'Démarches simplifiées',
      description: 'Nous gérons toutes les formalités administratives pour vous'
    },
    {
      icon: Banknote,
      title: 'Versement rapide',
      description: 'Primes versées directement après validation de l\'installation'
    },
    {
      icon: TrendingUp,
      title: 'ROI immédiat',
      description: 'Commencez à économiser dès le premier mois'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-yellow-500/30">
            Financement CEE
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Qu'est-ce que les primes CEE ?
          </h2>
          <p className="text-lg text-blue-100 max-w-3xl mx-auto">
            Les Certificats d'Économies d'Énergie sont un dispositif gouvernemental qui finance vos travaux d'efficacité énergétique. 
            EFFINOR vous accompagne pour maximiser vos aides.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <img 
              className="w-full h-96 object-cover rounded-2xl shadow-2xl" 
              alt="LED lighting installation with CEE funding"
             src="https://images.unsplash.com/photo-1605982035527-13063c7f6645" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold mb-4 text-cyan-300">Comment ça fonctionne ?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-400 text-xl">1.</span>
                  <span>Les fournisseurs d'énergie sont obligés de financer des travaux d'économies d'énergie</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-400 text-xl">2.</span>
                  <span>Votre projet LED est éligible et génère des certificats</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-400 text-xl">3.</span>
                  <span>EFFINOR valorise ces certificats et vous reverse les primes</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-400 text-xl">4.</span>
                  <span>Vous réduisez ou annulez votre investissement initial</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/30">
              <p className="text-lg font-semibold text-yellow-300 mb-2">
                💰 Exemple concret
              </p>
              <p className="text-blue-100">
                Pour un entrepôt de 2000m², les primes CEE peuvent couvrir <span className="font-bold text-yellow-300">jusqu'à 80%</span> du coût total de votre installation LED, soit une économie moyenne de <span className="font-bold text-yellow-300">15 000€</span>.
              </p>
            </div>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantages.map((advantage, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-cyan-500/20 rounded-xl mb-4">
                <advantage.icon className="w-6 h-6 text-cyan-300" />
              </div>
              <h3 className="text-lg font-bold mb-2">{advantage.title}</h3>
              <p className="text-sm text-blue-200">{advantage.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CEEExplanation;