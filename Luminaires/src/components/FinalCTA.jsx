import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FinalCTA = () => {
  const benefits = [
    'Audit énergétique gratuit sous 48h',
    'Étude personnalisée avec calcul des primes CEE',
    'Installation clé en main par des experts certifiés',
    'Garantie 5 ans et SAV réactif',
    'Financement jusqu\'à 100% par les primes CEE'
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-20 bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI gcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybiB+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-yellow-500/30">
              Offre limitée
            </span>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Prêt à réduire vos coûts d'éclairage de{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-yellow-400">
                jusqu'à 70% ?
              </span>
            </h2>

            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Rejoignez les 500+ entreprises qui ont déjà optimisé leur éclairage avec EFFINOR. 
              Demandez votre audit gratuit dès aujourd'hui.
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20">
              <div className="grid md:grid-cols-2 gap-4 text-left">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-100">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                onClick={scrollToTop}
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all"
              >
                Demander mon audit gratuit
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <div className="text-blue-200 text-sm">
                ⚡ Réponse sous 24h • Sans engagement
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-12 flex flex-wrap justify-center gap-8 items-center"
            >
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm">Certifié RGE</div>
                  <div className="text-xs text-blue-200">Éligible CEE</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm">Garantie 5 ans</div>
                  <div className="text-xs text-blue-200">Installation incluse</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm">500+ clients</div>
                  <div className="text-xs text-blue-200">Note 4.9/5</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;