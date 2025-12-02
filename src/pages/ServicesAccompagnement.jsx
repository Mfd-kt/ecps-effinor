import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '@/hooks/usePageSEO';
import SEOHead from '@/components/SEOHead';
import { 
  Lightbulb, Wrench, DollarSign, Settings, ArrowRight, CheckCircle2 
} from 'lucide-react';

const ServicesAccompagnement = () => {
  const seo = usePageSEO('/services-accompagnement');

  const services = [
    {
      icon: Lightbulb,
      title: 'Audit et étude lumière',
      description: 'Analyse complète de votre installation avec Dialux, respect des normes et recommandations personnalisées.',
      features: [
        'Étude Dialux complète',
        'Respect des normes en vigueur',
        'Recommandations personnalisées',
        'Rapport détaillé'
      ]
    },
    {
      icon: Wrench,
      title: 'Offre clé en main',
      description: 'De la conception à l\'installation, nous gérons tout votre projet d\'éclairage LED.',
      features: [
        'Conception sur mesure',
        'Fourniture des équipements',
        'Installation par nos équipes',
        'Mise en service'
      ]
    },
    {
      icon: DollarSign,
      title: 'Financement & CEE',
      description: 'Accompagnement dans le financement de votre projet et obtention des Certificats d\'Économies d\'Énergie.',
      features: [
        'Aide au financement',
        'Certificats CEE',
        'Solutions de leasing',
        'ROI optimisé'
      ]
    },
    {
      icon: Settings,
      title: 'Maintenance & SAV',
      description: 'Service après-vente réactif et maintenance préventive pour garantir la performance de votre installation.',
      features: [
        'Maintenance préventive',
        'Intervention rapide',
        'Pièces détachées disponibles',
        'Support technique'
      ]
    }
  ];

  return (
    <>
      <SEOHead
        metaTitle={seo.metaTitle}
        metaDescription={seo.metaDescription}
        ogImage={seo.ogImage}
        isIndexable={seo.isIndexable}
        h1={seo.h1 || 'Services & Accompagnement'}
        intro={seo.intro}
      />

      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {seo.h1 || 'Services & Accompagnement'}
            </h1>
            {seo.intro && (
              <p className="text-xl text-gray-600">
                {seo.intro}
              </p>
            )}
            {!seo.intro && (
              <p className="text-xl text-gray-600">
                Un accompagnement complet de A à Z pour votre projet d'éclairage LED professionnel.
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-6xl mx-auto">
          {services.map((service, idx) => {
            const Icon = service.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-4 bg-[var(--secondary-500)]/10 rounded-xl">
                    <Icon className="h-10 w-10 text-[var(--secondary-500)]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {service.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-[var(--secondary-500)] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

          <div className="bg-[var(--secondary-500)] text-white rounded-2xl p-12 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              Prêt à démarrer votre projet ?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Demandez un audit gratuit et personnalisé pour votre installation.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-4 bg-white text-[var(--secondary-500)] rounded-lg hover:bg-gray-100 transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Demander un audit
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServicesAccompagnement;

