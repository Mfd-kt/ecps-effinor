import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { useBanner } from '@/contexts/BannerContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getTotalItems } = useCart();
  const location = useLocation();
  const { isBannerVisible } = useBanner();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navLinks = [
    { path: '/', label: 'Accueil' },
    { path: '/boutique', label: 'Boutique' },
    { path: '/prime-cee', label: 'Prime CEE' },
    { path: '/a-propos', label: 'À propos' },
    { path: '/contact', label: 'Contact' }
  ];

  return (
    <header className={`main-header ${isBannerVisible ? 'with-banner' : 'no-banner'}`}>
      <div className="main-header-content">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[var(--secondary-500)] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-lg font-bold logo-text">EFFINOR</span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center space-x-2 main-nav">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={location.pathname === link.path ? 'active' : ''}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-2 md:space-x-4">
          <a href="tel:+33978455063" className="hidden lg:flex items-center space-x-2">
            <button className="btn-outline" style={{ padding: '8px 16px', borderColor: 'var(--secondary-600)', color: 'var(--secondary-600)' }}>
              <Phone className="h-5 w-5 mr-2"/>
              <div className="text-left">
                <span className="block text-xs font-semibold leading-tight">Appelez-nous</span>
                <span className="block text-sm font-bold leading-tight">09 78 45 50 63</span>
              </div>
            </button>
          </a>

          <Link to="/panier" className="relative btn-ghost" aria-label="Voir le panier">
            <ShoppingCart className="h-6 w-6" />
            {getTotalItems() > 0 && (
              <span className="absolute -top-1 -right-1 bg-[var(--secondary-500)] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </Link>

          <button
            className="btn-ghost lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Ouvrir le menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col space-y-3 main-nav">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={location.pathname === link.path ? 'active' : ''}
                >
                  {link.label}
                </Link>
              ))}
               <a href="tel:+33978455063" className="w-full">
                 <button className="btn-primary w-full mt-4">
                      <Phone className="mr-2 h-5 w-5" />
                      Appeler le 09 78 45 50 63
                 </button>
               </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;