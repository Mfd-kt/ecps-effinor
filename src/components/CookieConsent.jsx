import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Cookie } from 'lucide-react';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
    // Here you would initialize your tracking scripts (GA, Meta Pixel, etc.)
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg z-[101] flex items-center justify-between flex-wrap"
        >
          <div className="flex items-center mb-4 sm:mb-0">
            <Cookie className="h-6 w-6 mr-3 text-accent-400" />
            <p className="text-sm">
              Nous utilisons des cookies pour améliorer votre expérience et pour le suivi. 
              <a href="/mentions-legales" className="underline hover:text-accent-400 ml-1">En savoir plus</a>.
            </p>
          </div>
          <div className="flex gap-4">
            <Button onClick={handleDecline} variant="outline" className="text-white border-white hover:bg-white/10">
              Refuser
            </Button>
            <Button onClick={handleAccept} className="bg-secondary-600 hover:bg-secondary-700">
              Accepter
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;