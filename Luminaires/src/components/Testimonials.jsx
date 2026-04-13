import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Pierre Dubois',
      role: 'Directeur Technique',
      company: 'LogiStock France',
      rating: 5,
      text: 'ECPS a transformé notre entrepôt. L\'éclairage est incomparablement meilleur et nos factures ont chuté de 68%. L\'équipe est professionnelle et les primes CEE ont couvert 80% du projet.',
      image: 'Professional warehouse manager in modern facility'
    },
    {
      name: 'Sophie Martin',
      role: 'Responsable RSE',
      company: 'TechCorp Solutions',
      rating: 5,
      text: 'Un accompagnement exemplaire du début à la fin. Les démarches CEE ont été gérées intégralement par ECPS. Nos collaborateurs apprécient le nouveau confort visuel et nous avons réduit notre empreinte carbone.',
      image: 'Female business executive in modern office'
    },
    {
      name: 'Marc Lefebvre',
      role: 'Gérant',
      company: 'SuperMarché Plus',
      rating: 5,
      text: 'Installation rapide en dehors des heures d\'ouverture, aucune gêne pour nos clients. La qualité de l\'éclairage met parfaitement en valeur nos produits. ROI atteint en moins de 2 ans !',
      image: 'Retail store manager in modern supermarket'
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
          <span className="inline-block bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            Témoignages clients
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ce que disent nos clients
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Plus de 500 entreprises nous font confiance
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all relative"
            >
              <Quote className="absolute top-6 right-6 w-12 h-12 text-cyan-200" />
              
              <div className="mb-6">
                <img 
                  className="w-20 h-20 rounded-full object-cover mb-4 border-4 border-white shadow-md" 
                  alt={testimonial.name}
                 src="https://images.unsplash.com/photo-1595872018818-97555653a011" />
                
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "{testimonial.text}"
              </p>

              <div className="border-t pt-4">
                <p className="font-bold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
                <p className="text-sm text-cyan-600 font-semibold">{testimonial.company}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-green-50 border-2 border-green-200 rounded-full px-6 py-3">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-gray-900">
              Note moyenne : <span className="text-green-600">4.9/5</span> sur 500+ avis
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;