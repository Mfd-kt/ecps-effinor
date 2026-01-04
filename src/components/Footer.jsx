import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import Logo from '@/components/Logo';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <Logo size="lg" showText text="EFFINOR" />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Votre fournisseur LED professionnel pour l'industrie, le tertiaire et l'agricole.
            </p>
          </div>

          <div>
            <span className="font-semibold text-[var(--secondary-400)] block mb-4">Navigation</span>
            <div className="space-y-3">
              <Link to="/" className="block text-sm text-gray-300 hover:text-[var(--secondary-400)] transition-colors">
                Accueil
              </Link>
              <Link to="/produits-solutions" className="block text-sm text-gray-300 hover:text-[var(--secondary-400)] transition-colors">
                Produits & Solutions
              </Link>
              <Link to="/secteurs-activite" className="block text-sm text-gray-300 hover:text-[var(--secondary-400)] transition-colors">
                Secteurs d'activité
              </Link>
              <Link to="/realisations" className="block text-sm text-gray-300 hover:text-[var(--secondary-400)] transition-colors">
                Réalisations
              </Link>
              <Link to="/services-accompagnement" className="block text-sm text-gray-300 hover:text-[var(--secondary-400)] transition-colors">
                Services & Accompagnement
              </Link>
              <Link to="/blog" className="block text-sm text-gray-300 hover:text-[var(--secondary-400)] transition-colors">
                Blog
              </Link>
              <Link to="/a-propos" className="block text-sm text-gray-300 hover:text-[var(--secondary-400)] transition-colors">
                À propos
              </Link>
            </div>
          </div>

          <div>
            <span className="font-semibold text-[var(--secondary-400)] block mb-4">Informations</span>
            <div className="space-y-3">
              <Link to="/contact" className="block text-sm text-gray-300 hover:text-[var(--secondary-400)] transition-colors">
                Contact
              </Link>
              <Link to="/espace-client/login" className="block text-sm text-gray-300 hover:text-[var(--secondary-400)] transition-colors">
                Espace client
              </Link>
              <Link to="/mentions-legales" className="block text-sm text-gray-300 hover:text-[var(--secondary-400)] transition-colors">
                Mentions légales
              </Link>
              <Link to="/cgv" className="block text-sm text-gray-300 hover:text-[var(--secondary-400)] transition-colors">
                CGV
              </Link>
              <Link to="/politique-confidentialite" className="block text-sm text-gray-300 hover:text-[var(--secondary-400)] transition-colors">
                Politique de Confidentialité
              </Link>
            </div>
          </div>

          <div>
            <span className="font-semibold text-[var(--secondary-400)] block mb-4">Contact</span>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Mail className="h-4 w-4" />
                <span>contact@effinor.fr</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Phone className="h-4 w-4" />
                <span>09 78 45 50 63</span>
              </div>
              <div className="flex items-start space-x-2 text-sm text-gray-300">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-1" />
                <span>Tour Europa, Av. de l’Europe, 94320 Thiais</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Clock className="h-4 w-4" />
                <span>Lun-Ven: 8h-18h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} EFFINOR. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;