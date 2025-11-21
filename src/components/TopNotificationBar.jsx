import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Megaphone, Phone, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBanner } from '@/contexts/BannerContext';

const TopNotificationBar = () => {
  const { isBannerVisible, closeBanner } = useBanner();

  return (
    <AnimatePresence>
      {isBannerVisible && (
        <motion.div
          initial={{ y: '-100%' }}
          animate={{ y: '0%' }}
          exit={{ y: '-100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="announcement-banner"
          role="region"
          aria-label="Annonce spéciale"
        >
          <div className="flex items-center justify-center flex-col sm:flex-row gap-2 sm:gap-4 w-full">
            <div className="flex items-center text-center">
              <Megaphone className="h-5 w-5 mr-3 flex-shrink-0 text-yellow-400 hidden sm:block" />
              <p>
                <span className="font-bold">🔥 Offre spéciale :</span> Audit énergétique GRATUIT jusqu'à fin novembre !
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a href="tel:+33978455063" className="font-semibold hover:underline">
                <Phone className="inline h-4 w-4 mr-1"/>
                09 78 45 50 63
              </a>
              <Link to="/formulaire-complet" className="cta-btn hidden sm:inline-flex">
                J'en profite
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
          <button 
            onClick={closeBanner} 
            className="close-btn"
            aria-label="Fermer la bannière d'annonce"
          >
            <X className="h-5 w-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TopNotificationBar;