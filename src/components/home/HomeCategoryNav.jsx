import React from 'react';
import { Lightbulb, Activity, Zap, Warehouse, Factory, Building2 } from 'lucide-react';
import HomeCategoryCard from './HomeCategoryCard';

const defaultCategories = [
  {
    key: 'highbay-led',
    title: 'Highbay LED industriel',
    description: 'Éclairage pour grands volumes : ateliers, usines, plateformes logistiques.',
    icon: Warehouse,
    to: '/produits-solutions/highbay-led',
  },
  {
    key: 'projecteurs-led',
    title: 'Projecteurs LED extérieurs',
    description: 'Sécuriser parkings, façades, zones de chargement et stades.',
    icon: Zap,
    to: '/produits-solutions/projecteur-led-floodlight',
  },
  {
    key: 'panneaux-led',
    title: 'Panneaux LED tertiaires',
    description: 'Confort visuel pour bureaux, commerces et établissements recevant du public.',
    icon: Lightbulb,
    to: '/produits-solutions/panneaux-led',
  },
  {
    key: 'tubes-led',
    title: 'Tubes & réglettes LED',
    description: 'Remplacement simple des néons, ateliers, couloirs et réserves.',
    icon: Activity,
    to: '/produits-solutions/reglettes-led',
  },
  {
    key: 'lampe-industrielle',
    title: 'Lampes industrielles',
    description: 'Solutions robustes pour environnements exigeants.',
    icon: Factory,
    to: '/produits-solutions/lampe-industrielle',
  },
  {
    key: 'secteurs',
    title: 'Solutions par secteur',
    description: 'Logistique, agroalimentaire, tertiaire, industrie lourde…',
    icon: Building2,
    to: '/solutions',
  },
];

const HomeCategoryNav = ({ title, subtitle, categories = defaultCategories }) => {
  return (
    <section className="py-6 md:py-8 bg-gray-50">
      <div className="container mx-auto max-w-7xl px-3 md:px-4">
        <div className="max-w-[95%] sm:max-w-lg md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto">
          <header className="text-center mb-4 md:mb-6">
            <h2 className="text-base md:text-lg lg:text-xl font-semibold text-gray-900">
              {title || 'Accédez directement à vos solutions LED professionnelles'}
            </h2>
            <p className="mt-1 text-[11px] md:text-xs lg:text-sm text-gray-600">
              {subtitle ||
                "Trouvez rapidement le luminaire LED adapté à votre projet : éclairage industriel, tertiaire, extérieur ou spécialisé. Solutions certifiées, livraison rapide, prix compétitifs."}
            </p>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {categories.map((cat) => (
              <HomeCategoryCard
                key={cat.key || cat.to}
                icon={cat.icon}
                title={cat.title}
                description={cat.description}
                to={cat.to}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeCategoryNav;


