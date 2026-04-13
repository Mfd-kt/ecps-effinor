import React from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, Lightbulb, TrendingDown } from 'lucide-react';

const SocialProof = () => {
  const stats = [
    { icon: Users, value: '500+', label: 'Clients satisfaits' },
    { icon: Building2, value: '1200+', label: 'Sites équipés' },
    { icon: Lightbulb, value: '50k+', label: 'LED installées' },
    { icon: TrendingDown, value: '-65%', label: 'Économie moyenne' }
  ];

  const partners = [
    'Schneider Electric',
    'Philips Lighting',
    'Osram',
    'Legrand',
    'Signify'
  ];

  return (
    <section className="py-16 bg-white border-b">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ils nous font confiance
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Plus de 500 entreprises ont déjà optimisé leur éclairage avec ECPS
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-4">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="border-t pt-12"
        >
          <p className="text-center text-sm text-gray-500 mb-8 font-semibold">
            NOS PARTENAIRES TECHNOLOGIQUES
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {partners.map((partner, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-gray-400 font-semibold text-lg hover:text-cyan-600 transition-colors cursor-pointer"
              >
                {partner}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProof;