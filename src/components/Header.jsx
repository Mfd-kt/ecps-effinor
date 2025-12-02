import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Phone, User, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { useBanner } from '@/contexts/BannerContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/utils/logger';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openMobileDropdown, setOpenMobileDropdown] = useState(null);
  const [categories, setCategories] = useState([]);
  const { getTotalItems } = useCart();
  const location = useLocation();
  const { isBannerVisible } = useBanner();
  const dropdownRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Fonction pour ouvrir le dropdown avec gestion du délai
  const handleDropdownEnter = (path, event) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setOpenDropdown(path);
  };

  // Fonction pour fermer le dropdown avec délai
  const handleDropdownLeave = (event) => {
    // Vérifier si on passe vers un élément enfant
    const relatedTarget = event.relatedTarget;
    if (relatedTarget && dropdownRef.current && dropdownRef.current.contains(relatedTarget)) {
      return; // Ne pas fermer si on passe vers un élément du dropdown
    }
    
    closeTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 300); // Délai de 300ms avant fermeture
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, nom, slug, ordre')
        .eq('actif', true)
        .order('ordre', { ascending: true });

      if (error) {
        // Si la table n'existe pas encore, utiliser les catégories par défaut
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          logger.warn('[Header] Table categories does not exist yet');
          return;
        }
        throw error;
      }
      
      if (data && data.length > 0) {
        setCategories(data);
      }
    } catch (err) {
      logger.error('[Header] Error fetching categories:', err);
    }
  };

  const { user } = useAuth();
  const isClient = user; // TODO: Vérifier si l'utilisateur a le rôle "client"

  // Créer les enfants du dropdown "Produits & Solutions" depuis les catégories
  const produitsSolutionsChildren = categories.length > 0
    ? categories.map(cat => ({
        path: `/produits-solutions/${cat.slug}`,
        label: cat.nom
      }))
    : [
        // Fallback si pas de catégories
        { path: '/produits-solutions/luminaires-industrie-entrepots', label: 'Industrie & entrepôts' },
        { path: '/produits-solutions/luminaires-tertiaire-bureaux', label: 'Tertiaire & bureaux' },
        { path: '/produits-solutions/luminaires-commerces-gms', label: 'Commerces & GMS' },
        { path: '/produits-solutions/luminaires-parkings-exterieurs', label: 'Parkings & extérieurs' },
        { path: '/produits-solutions/accessoires-pilotage', label: 'Accessoires & pilotage' }
      ];

  const navLinks = [
    { path: '/', label: 'Accueil' },
    { 
      path: '/produits-solutions', 
      label: 'Produits & Solutions',
      hasDropdown: true,
      children: produitsSolutionsChildren
    },
    { 
      path: '/secteurs-activite', 
      label: 'Secteurs',
      hasDropdown: true,
      children: [
        { path: '/secteurs-activite/industrie-logistique', label: 'Industrie & logistique' },
        { path: '/secteurs-activite/tertiaire-bureaux', label: 'Tertiaire / bureaux' },
        { path: '/secteurs-activite/retail-grande-distribution', label: 'Retail & GMS' },
        { path: '/secteurs-activite/collectivites-ecoles-gymnases', label: 'Collectivités' },
        { path: '/secteurs-activite/sante-etablissements-sensibles', label: 'Santé' }
      ]
    },
    { path: '/realisations', label: 'Réalisations' },
    { path: '/services-accompagnement', label: 'Services' },
    { path: '/blog', label: 'Blog' },
    { path: '/a-propos', label: 'À propos' },
    { path: '/contact', label: 'Contact' }
  ];

  return (
    <header className={`bg-gray-800 text-white shadow-lg ${isBannerVisible ? 'with-banner' : 'no-banner'}`}>
      <div className="container mx-auto px-3 md:px-4">
        <div className="flex items-center justify-between h-16 lg:h-20 gap-2 md:gap-3 lg:gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
            <div className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 bg-[var(--secondary-500)] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm md:text-base lg:text-lg">E</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-sm md:text-base lg:text-lg font-bold text-white">EFFINOR</span>
            </div>
          </Link>

          {/* Navigation principale - Centrée */}
          <nav className="hidden lg:flex items-center justify-center flex-1 max-w-4xl mx-4">
            <div className="flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path || 
                  (link.children && link.children.some(child => location.pathname.startsWith(child.path)));
                const isDropdownOpen = openDropdown === link.path;

                if (link.hasDropdown && link.children) {
                  return (
                    <div
                      key={link.path}
                      className="relative group"
                      ref={openDropdown === link.path ? dropdownRef : null}
                      onMouseEnter={(e) => {
                        e.stopPropagation();
                        handleDropdownEnter(link.path, e);
                      }}
                      onMouseLeave={(e) => {
                        const relatedTarget = e.relatedTarget;
                        if (!relatedTarget || !dropdownRef.current?.contains(relatedTarget)) {
                          handleDropdownLeave(e);
                        }
                      }}
                    >
                      <Link
                        to={link.path}
                        className={`px-2.5 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                          isActive 
                            ? 'text-[var(--secondary-500)] bg-gray-700' 
                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                        }`}
                      >
                        {link.label}
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </Link>
                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[100]"
                            onMouseEnter={(e) => {
                              e.stopPropagation();
                              if (closeTimeoutRef.current) {
                                clearTimeout(closeTimeoutRef.current);
                                closeTimeoutRef.current = null;
                              }
                            }}
                            onMouseLeave={handleDropdownLeave}
                          >
                            {link.children.map((child) => {
                              const isChildActive = location.pathname === child.path;
                              return (
                                <Link
                                  key={child.path}
                                  to={child.path}
                                  className={`block px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                                    isChildActive
                                      ? 'text-[var(--secondary-500)] bg-gray-50 font-semibold'
                                      : 'text-gray-700 hover:text-[var(--secondary-500)] hover:bg-gray-50'
                                  }`}
                                  onClick={() => {
                                    setOpenDropdown(null);
                                    if (closeTimeoutRef.current) {
                                      clearTimeout(closeTimeoutRef.current);
                                    }
                                  }}
                                  onMouseEnter={() => {
                                    if (closeTimeoutRef.current) {
                                      clearTimeout(closeTimeoutRef.current);
                                      closeTimeoutRef.current = null;
                                    }
                                  }}
                                >
                                  {child.label}
                                </Link>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-2.5 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive 
                        ? 'text-[var(--secondary-500)] bg-gray-700' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Actions utilisateur - Droite */}
          <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3 flex-shrink-0">
            {/* Téléphone - Version compacte */}
            <a 
              href="tel:+33978455063" 
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 md:px-3 md:py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
              title="09 78 45 50 63"
            >
              <Phone className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0"/>
              <span className="hidden 2xl:block text-xs md:text-sm font-semibold whitespace-nowrap">09 78 45 50 63</span>
            </a>

            {/* Espace client */}
            {isClient ? (
              <Link
                to="/espace-client/dashboard"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 md:px-3.5 md:py-2 bg-[var(--secondary-500)] text-white rounded-lg hover:bg-[var(--secondary-600)] transition-colors font-semibold text-xs md:text-sm whitespace-nowrap"
              >
                <User className="h-4 w-4 md:h-4 md:w-4" />
                <span className="hidden xl:inline">Espace client</span>
              </Link>
            ) : (
              <Link
                to="/espace-client/login"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 md:px-3.5 md:py-2 bg-[var(--secondary-500)] text-white rounded-lg hover:bg-[var(--secondary-600)] transition-colors font-semibold text-xs md:text-sm whitespace-nowrap"
              >
                <User className="h-4 w-4 md:h-4 md:w-4" />
                <span className="hidden xl:inline">Espace client</span>
              </Link>
            )}

            {/* Panier */}
            <Link 
              to="/panier" 
              className="relative p-1.5 md:p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors flex-shrink-0" 
              aria-label="Voir le panier"
            >
              <ShoppingCart className="h-5 w-5 md:h-5 md:w-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 bg-[var(--secondary-500)] text-white text-[10px] md:text-xs font-bold rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {/* Menu mobile */}
            <button
              className="lg:hidden p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors flex-shrink-0"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Ouvrir le menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-gray-800 border-t border-gray-700"
          >
            <nav className="container mx-auto px-3 md:px-4 py-3 md:py-4">
              {/* Navigation principale */}
              <div className="flex flex-col space-y-1 mb-4">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path || 
                    (link.children && link.children.some(child => location.pathname.startsWith(child.path)));
                  const isMobileDropdownOpen = openMobileDropdown === link.path;
                  
                  return (
                    <div key={link.path}>
                      {link.hasDropdown && link.children ? (
                        <>
                          <button
                            onClick={() => setOpenMobileDropdown(openMobileDropdown === link.path ? null : link.path)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                              isActive 
                                ? 'text-[var(--secondary-500)] bg-gray-700' 
                                : 'text-gray-300 hover:text-white hover:bg-gray-700'
                            }`}
                          >
                            <span>{link.label}</span>
                            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isMobileDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>
                          <AnimatePresence>
                            {isMobileDropdownOpen && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="ml-4 mt-1 space-y-0.5 overflow-hidden"
                              >
                                {link.children.map((child) => {
                                  const isChildActive = location.pathname === child.path;
                                  return (
                                    <Link
                                      key={child.path}
                                      to={child.path}
                                      onClick={() => {
                                        setIsMenuOpen(false);
                                        setOpenMobileDropdown(null);
                                      }}
                                      className={`block text-sm px-3 py-2 rounded-md transition-colors ${
                                        isChildActive 
                                          ? 'text-[var(--secondary-500)] bg-gray-700 font-semibold' 
                                          : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                      }`}
                                    >
                                      {child.label}
                                    </Link>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        <Link
                          to={link.path}
                          onClick={() => setIsMenuOpen(false)}
                          className={`block px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                            isActive 
                              ? 'text-[var(--secondary-500)] bg-gray-700' 
                              : 'text-gray-300 hover:text-white hover:bg-gray-700'
                          }`}
                        >
                          {link.label}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Actions rapides */}
              <div className="border-t border-gray-700 pt-3 space-y-2">
                {/* Espace client */}
                {isClient ? (
                  <Link
                    to="/espace-client/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[var(--secondary-500)] text-white rounded-lg hover:bg-[var(--secondary-600)] transition-colors font-semibold text-sm"
                  >
                    <User className="h-4 w-4" />
                    <span>Espace client</span>
                  </Link>
                ) : (
                  <Link
                    to="/espace-client/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[var(--secondary-500)] text-white rounded-lg hover:bg-[var(--secondary-600)] transition-colors font-semibold text-sm"
                  >
                    <User className="h-4 w-4" />
                    <span>Espace client</span>
                  </Link>
                )}

                {/* Téléphone */}
                <a 
                  href="tel:+33978455063" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold text-sm"
                >
                  <Phone className="h-4 w-4" />
                  <span>09 78 45 50 63</span>
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;