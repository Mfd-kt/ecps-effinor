import React from 'react';
import { ShieldCheck, Award, Truck, CheckCircle2 } from 'lucide-react';

const itemsDefault = [
  {
    icon: ShieldCheck,
    title: 'Certifications & conformité',
    text: 'Tous nos luminaires LED sont conformes CE, RoHS et répondent aux normes françaises et européennes. Produits testés et certifiés pour une utilisation en environnement industriel et tertiaire.',
  },
  {
    icon: Award,
    title: 'Expertise éclairage professionnel',
    text: 'Bénéficiez de l\'accompagnement de spécialistes de l\'éclairage LED industriel. De l\'audit énergétique à la mise en service, nous vous conseillons pour optimiser vos installations.',
  },
  {
    icon: Truck,
    title: 'Logistique rapide & maîtrisée',
    text: 'Stock permanent en France, expéditions sous 48h et livraisons adaptées à vos contraintes chantier. Suivi de commande en temps réel et coordination avec vos équipes.',
  },
  {
    icon: CheckCircle2,
    title: 'Garantie & pérennité',
    text: 'Produits sélectionnés pour leur robustesse et leur durée de vie exceptionnelle. Garantie fabricant jusqu\'à 5 ans, support technique réactif et pièces détachées disponibles.',
  },
];

const HomeTrustSection = ({ title, subtitle, items = itemsDefault }) => {
  return (
    <section className="py-6 md:py-8 bg-gray-900 text-white">
      <div className="container mx-auto max-w-7xl px-3 md:px-4">
        <div className="max-w-[95%] sm:max-w-lg md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto">
          <header className="text-center mb-4 md:mb-6">
            <h2 className="text-base md:text-lg lg:text-xl font-semibold text-white">
              {title || 'Pourquoi choisir Effinor Lighting ?'}
            </h2>
            <p className="mt-1 text-[11px] md:text-xs lg:text-sm text-gray-200">
              {subtitle ||
                "Votre partenaire de confiance pour l'éclairage LED professionnel. Qualité certifiée, disponibilité immédiate, expertise projet et accompagnement personnalisé pour tous vos chantiers industriels et tertiaires."}
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {items.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex gap-3 bg-gray-800/60 border border-gray-700 rounded-lg p-3 md:p-4"
                >
                  <div className="flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full bg-secondary-600/10 flex items-center justify-center">
                    {Icon ? (
                      <Icon className="w-5 h-5 text-secondary-400" />
                    ) : (
                      <span className="text-secondary-400 text-sm font-semibold">
                        ✓
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-semibold mb-0.5 text-white">
                      {item.title}
                    </h3>
                    <p className="text-[11px] md:text-xs text-gray-200 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeTrustSection;


