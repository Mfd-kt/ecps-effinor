import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Linkedin, Facebook, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="mb-4">
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                EFFINOR
              </span>
              <p className="text-sm text-gray-400 mt-1">Groupe Effinor</p>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Expert en solutions d'éclairage LED professionnel. Réduisez vos coûts énergétiques avec les primes CEE.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-cyan-600 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-cyan-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-cyan-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <span className="font-semibold text-white mb-4 block">Solutions</span>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Éclairage Entrepôt</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Éclairage Bureau</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Éclairage Commerce</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Éclairage Industriel</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Éclairage Extérieur</a></li>
            </ul>
          </div>

          <div>
            <span className="font-semibold text-white mb-4 block">Entreprise</span>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">À propos</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Nos réalisations</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Certifications</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Carrières</a></li>
            </ul>
          </div>

          <div>
            <span className="font-semibold text-white mb-4 block">Contact</span>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-gray-400">
                <Phone className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">09 78 45 50 63</p>
                  <p className="text-xs">Lun-Ven: 8h-18h</p>
                </div>
              </li>
              <li className="flex items-start gap-2 text-gray-400">
                <Mail className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">contact@effinor.fr</p>
                  <p className="text-xs">Réponse sous 24h</p>
                </div>
              </li>
              <li className="flex items-start gap-2 text-gray-400">
                <MapPin className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <p>Tour Europa, Av. de l'Europe, 94320 Thiais</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>© 2025 EFFINOR - Groupe Effinor. Tous droits réservés.</p>
            <div className="flex gap-6">
              <Link to="/mentions-legales" className="hover:text-cyan-400 transition-colors">Mentions légales</Link>
              <a href="#" className="hover:text-cyan-400 transition-colors">Politique de confidentialité</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">CGV</a>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full text-xs text-gray-400">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Certifié RGE • Qualibat • ISO 9001
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;