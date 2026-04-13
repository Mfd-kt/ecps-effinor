import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'Qu\'est-ce que les primes CEE et comment en bénéficier ?',
      answer: 'Les Certificats d\'Économies d\'Énergie (CEE) sont un dispositif gouvernemental obligeant les fournisseurs d\'énergie à financer des travaux d\'efficacité énergétique. ECPS gère l\'intégralité des démarches administratives pour vous. Selon votre projet, les primes peuvent couvrir de 50% à 100% de votre investissement.'
    },
    {
      question: 'Quel est le délai entre la demande et l\'installation ?',
      answer: 'Notre processus est rapide : audit gratuit sous 48h, étude personnalisée sous 5 jours, et installation réalisée en 1 à 3 jours selon la taille du projet. En moyenne, de votre première demande à l\'installation complète, comptez moins de 2 semaines.'
    },
    {
      question: 'L\'installation nécessite-t-elle l\'arrêt de mon activité ?',
      answer: 'Non, nos équipes interviennent en dehors de vos heures d\'ouverture (soirs, week-ends) pour ne pas perturber votre activité. L\'installation est rapide, propre et sans interruption de service.'
    },
    {
      question: 'Quelle est la durée de vie des LED et la garantie ?',
      answer: 'Nos LED professionnelles ont une durée de vie de 50 000 heures (soit environ 15 ans en usage normal). Nous offrons une garantie complète de 5 ans sur le matériel et l\'installation, incluant le SAV et la maintenance préventive.'
    },
    {
      question: 'Quelles économies puis-je réellement espérer ?',
      answer: 'En moyenne, nos clients constatent une réduction de 50% à 70% de leur facture d\'éclairage. Le ROI moyen est de 2 à 3 ans, mais avec les primes CEE, il peut être ramené à moins de 18 mois. Nous vous fournissons une étude détaillée avec garantie de résultats.'
    },
    {
      question: 'Proposez-vous un financement pour le reste à charge ?',
      answer: 'Oui, nous travaillons avec des partenaires financiers pour proposer des solutions de financement adaptées. Dans de nombreux cas, les économies mensuelles réalisées couvrent les mensualités, rendant l\'opération neutre financièrement dès le premier mois.'
    },
    {
      question: 'Êtes-vous certifiés et assurés ?',
      answer: 'Absolument. ECPS est certifié RGE (Reconnu Garant de l\'Environnement), condition obligatoire pour bénéficier des primes CEE. Nous disposons également de toutes les assurances professionnelles nécessaires (décennale, RC Pro).'
    },
    {
      question: 'Que se passe-t-il en cas de panne après l\'installation ?',
      answer: 'Notre garantie 5 ans couvre tous les défauts matériels et de pose. En cas de problème, notre SAV intervient sous 48h. Nous proposons également des contrats de maintenance préventive pour assurer la longévité optimale de votre installation.'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            Questions fréquentes
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Vous avez des questions ?
          </h2>
          <p className="text-lg text-gray-600">
            Nous avons les réponses
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-cyan-600 flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-gray-600 leading-relaxed border-t">
                      <div className="pt-4">{faq.answer}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center bg-white rounded-xl p-8 shadow-lg"
        >
          <p className="text-gray-700 mb-4">
            Vous ne trouvez pas la réponse à votre question ?
          </p>
          <p className="text-cyan-600 font-semibold text-lg">
            📞 Contactez-nous au 01 XX XX XX XX ou demandez un audit gratuit
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;