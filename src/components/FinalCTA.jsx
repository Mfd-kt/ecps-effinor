import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';

const FinalCTA = () => {
  return (
    <section className="bg-gradient-to-r from-[var(--primary-800)] to-[var(--primary-900)] py-20 text-white">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            🚀 Prêt à réduire vos factures ?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Obtenez votre audit énergétique gratuit et personnalisé sous 24h.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/formulaire-complet" className="btn-primary">
                Demander un audit
                <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <a href="tel:+33978455063" className="btn-secondary">
                <Phone className="mr-2 h-5 w-5" />
                Nous appeler
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;