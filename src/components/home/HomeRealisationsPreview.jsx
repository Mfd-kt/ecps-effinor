import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const HomeRealisationsPreview = ({ title, subtitle, realisations = [] }) => {
  const hasData = realisations && realisations.length > 0;

  return (
    <section className="py-6 md:py-8 bg-gray-50">
      <div className="container mx-auto max-w-7xl px-3 md:px-4">
        <div className="max-w-[95%] sm:max-w-lg md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto">
          <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-4 md:mb-5">
            <div>
              <h2 className="text-base md:text-lg lg:text-xl font-semibold text-gray-900">
                {title || 'Réalisations professionnelles'}
              </h2>
              <p className="mt-1 text-[11px] md:text-xs lg:text-sm text-gray-600">
                {subtitle ||
                  "Découvrez nos projets d'éclairage LED réussis : entrepôts logistiques, sites industriels, coopératives agricoles et collectivités. Des installations performantes qui réduisent la consommation énergétique et améliorent les conditions de travail."}
              </p>
            </div>
            <Link
              to="/realisations"
              className="inline-flex items-center gap-1 text-[11px] md:text-xs font-semibold text-secondary-700 hover:text-secondary-800"
            >
              Voir toutes nos réalisations
              <ArrowRight className="w-3 h-3" />
            </Link>
          </header>

          {hasData ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {realisations.slice(0, 3).map((r) => {
                const mainImage = r.images && r.images[0]?.url;
                return (
                  <Link
                    key={r.id}
                    to={`/realisations/${r.slug}`}
                    className="group bg-white border border-gray-100 rounded-lg overflow-hidden hover:border-secondary-500 hover:shadow-md transition-all flex flex-col"
                  >
                    <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                      {mainImage ? (
                        <img
                          src={mainImage}
                          alt={r.titre}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[11px] text-gray-400">
                          Projet sans image
                        </div>
                      )}
                    </div>
                    <div className="p-3 md:p-4 flex-1 flex flex-col gap-1.5">
                      <h3 className="text-sm md:text-base font-semibold text-gray-900 line-clamp-2">
                        {r.titre}
                      </h3>
                      {r.client && (
                        <p className="text-[11px] md:text-xs text-gray-600">
                          {r.client}
                        </p>
                      )}
                      {r.secteur && (
                        <p className="text-[11px] md:text-xs text-gray-500">
                          {r.secteur}
                        </p>
                      )}
                      {r.description_courte && (
                        <p className="text-[11px] md:text-xs text-gray-600 line-clamp-2">
                          {r.description_courte}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-gray-200 rounded-lg p-4 text-center text-[11px] md:text-xs text-gray-500">
              Les réalisations pourront être gérées depuis le dashboard. Cette
              section affichera automatiquement les derniers projets publiés.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HomeRealisationsPreview;


