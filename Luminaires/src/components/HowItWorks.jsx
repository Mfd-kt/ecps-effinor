
import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, Calculator, Wrench } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: ClipboardCheck,
      title: 'Audit Gratuit',
      description: 'Notre expert analyse votre installation actuelle et identifie les opportunités d\'économies. Visite sur site sous 48h.',
      duration: '48h',
      image: 'https://images.unsplash.com/photo-1703765886965-6531cb9eaf8d'
    },
    {
      icon: Calculator,
      title: 'Étude Personnalisée',
      description: 'Nous calculons vos économies potentielles et les primes CEE disponibles. Proposition détaillée avec ROI garanti.',
      duration: '5 jours',
      image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e'
    },
    {
      icon: Wrench,
      title: 'Installation Clé en Main',
      description: 'Nos techniciens certifiés installent vos LED. Intervention rapide, propre et sans interruption d\'activité.',
      duration: '1-3 jours',
      image: 'https://images.unsplash.com/photo-1650969789494-15fcb33eaa01'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            Notre processus
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Un accompagnement complet en 3 étapes simples
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-1/4 left-0 right-0 h-1 bg-gradient-to-r from-cyan-200 via-blue-200 to-cyan-200 -z-10"></div>
          
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all h-full flex flex-col">
                <div className="absolute -top-6 left-8 w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg z-10">
                  {index + 1}
                </div>
                
                <div className="mb-6 mt-4 overflow-hidden rounded-xl shadow-md h-48 relative group">
                  <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-transparent transition-colors duration-300 z-10"></div>
                  <img
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    alt={step.title}
                    src={step.image}
                  />
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-sm border border-blue-100">
                    <step.icon className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {step.duration}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="inline-block bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm">
            <p className="text-green-800 font-medium text-lg flex items-center gap-2 justify-center">
              <span className="text-2xl">⚡</span> 
              De la demande à l'installation : <span className="font-bold text-green-700">moins de 2 semaines</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
