import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';

const FinalCTA = () => {
  return (
    <section className="bg-primary-900 py-8 md:py-12 lg:py-16 text-white overflow-x-hidden">
      <div className="container mx-auto px-3 md:px-4 text-center overflow-x-hidden">
        <div className="max-w-[95%] sm:max-w-lg md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 md:mb-3 lg:mb-4 text-white">
              🚀 Prêt à réduire vos factures ?
            </h2>
            <p className="text-sm md:text-base lg:text-lg mb-4 md:mb-6 lg:mb-8 text-white/90 max-w-2xl mx-auto">
              Obtenez votre audit énergétique gratuit et personnalisé sous 24h.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
              <Link to="/formulaire-complet" className="btn-primary text-sm md:text-base px-4 md:px-6 py-2.5 md:py-3">
                  Demander un audit
                  <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Link>
              <a href="tel:+33978455063" className="btn-secondary text-sm md:text-base px-4 md:px-6 py-2.5 md:py-3">
                  <Phone className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  Nous appeler
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;