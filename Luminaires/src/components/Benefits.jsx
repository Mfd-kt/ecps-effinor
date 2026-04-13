import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Euro, Leaf, Shield, Clock, Award } from 'lucide-react';
const Benefits = () => {
  const benefits = [{
    icon: Euro,
    title: 'Économies Garanties',
    description: 'Réduisez votre facture énergétique de 50 à 70% dès la première année. ROI moyen en 2-3 ans.',
    color: 'from-yellow-400 to-orange-500'
  }, {
    icon: Zap,
    title: 'Performance Optimale',
    description: 'Éclairage LED haute performance avec durée de vie de 50 000h. Qualité lumineuse supérieure.',
    color: 'from-cyan-400 to-blue-500'
  }, {
    icon: Leaf,
    title: 'Impact Environnemental',
    description: 'Réduisez vos émissions CO2 jusqu\'à 80%. Contribuez activement à la transition énergétique.',
    color: 'from-green-400 to-emerald-500'
  }, {
    icon: Shield,
    title: 'Garantie 5 Ans',
    description: 'Installation professionnelle avec garantie complète. SAV réactif et maintenance préventive incluse.',
    color: 'from-blue-400 to-indigo-500'
  }, {
    icon: Clock,
    title: 'Installation Rapide',
    description: 'Intervention en dehors des heures d\'ouverture. Aucune interruption de votre activité.',
    color: 'from-purple-400 to-pink-500'
  }, {
    icon: Award,
    title: 'Financement CEE',
    description: 'Primes CEE jusqu\'à 100% du projet. Accompagnement administratif complet et gratuit.',
    color: 'from-orange-400 to-red-500'
  }];
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
      }} className="text-center mb-16">
          <span className="inline-block bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">Pourquoi choisir EFFINOR ?</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Des avantages qui font la différence
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Une solution complète pour optimiser votre éclairage professionnel
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => <motion.div key={index} initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6,
          delay: index * 0.1
        }} whileHover={{
          y: -8,
          transition: {
            duration: 0.3
          }
        }} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all group">
              <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${benefit.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform`}>
                <benefit.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {benefit.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>)}
        </div>
      </div>
    </section>;
};
export default Benefits;