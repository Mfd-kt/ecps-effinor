import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-[var(--secondary-500)] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              <span className="text-lg font-bold text-white">EFFINOR</span>
            </div>
            <p className="text-gray-400 text-sm">
              Solutions d'efficacité énergétique pour les professionnels.
            </p>
          </div>

          <div>
            <span className="font-semibold text-[var(--secondary-400)] block mb-4">Navigation</span>
            <div className="space-y-2">
              <Link to="/" className="block text-sm">
                Accueil
              </Link>
              <Link to="/boutique" className="block text-sm">
                Boutique
              </Link>
              <Link to="/prime-cee" className="block text-sm">
                Prime CEE
              </Link>
              <Link to="/a-propos" className="block text-sm">
                À propos
              </Link>
            </div>
          </div>

          <div>
            <span className="font-semibold text-[var(--secondary-400)] block mb-4">Informations</span>
            <div className="space-y-2">
              <Link to="/contact" className="block text-sm">
                Contact
              </Link>
              <Link to="/mentions-legales" className="block text-sm">
                Mentions légales
              </Link>
              <Link to="/cgv" className="block text-sm">
                CGV
              </Link>
               <Link to="/politique-confidentialite" className="block text-sm">
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

        <div className="footer-bottom-border mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} EFFINOR. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;