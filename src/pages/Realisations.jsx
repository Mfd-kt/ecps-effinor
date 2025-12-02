import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '@/hooks/usePageSEO';
import SEOHead from '@/components/SEOHead';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Filter, Search, TrendingDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { logger } from '@/utils/logger';

const Realisations = () => {
  const seo = usePageSEO('/realisations');
  const [realisations, setRealisations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    secteur: '',
    search: ''
  });

  useEffect(() => {
    fetchRealisations();
  }, [filters]);

  const fetchRealisations = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('realisations')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (filters.secteur && filters.secteur !== 'all') {
        query = query.eq('secteur', filters.secteur);
      }

      if (filters.search && filters.search.trim()) {
        query = query.or(`titre.ilike.%${filters.search}%,client.ilike.%${filters.search}%,description_courte.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        // Si la table n'existe pas encore, retourner un tableau vide
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          logger.warn('[Realisations] Table realisations does not exist yet');
          setRealisations([]);
          return;
        }
        throw error;
      }
      setRealisations(data || []);
    } catch (err) {
      logger.error('[Realisations] Error fetching realisations:', err);
      // En cas d'erreur, afficher un tableau vide plutôt que de bloquer
      setRealisations([]);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les secteurs uniques pour le filtre
  const secteurs = Array.from(new Set(realisations.map(r => r.secteur).filter(Boolean)));

  return (
    <>
      <SEOHead
        metaTitle={seo.metaTitle}
        metaDescription={seo.metaDescription}
        ogImage={seo.ogImage}
        isIndexable={seo.isIndexable}
        h1={seo.h1 || 'Nos réalisations'}
        intro={seo.intro}
      />

      <div className="min-h-screen bg-white overflow-x-hidden">
        <div className="container mx-auto px-3 md:px-4 py-4 md:py-6 lg:py-8 max-w-7xl overflow-x-hidden">
          <div className="max-w-[95%] sm:max-w-lg md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto">
            {/* Hero */}
            <div className="text-center mb-6">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                {seo.h1 || 'Nos réalisations'}
              </h1>
              {seo.intro && (
                <p className="text-sm md:text-base text-gray-600">
                  {seo.intro}
                </p>
              )}
              {!seo.intro && (
                <p className="text-sm md:text-base text-gray-600">
                  Découvrez nos réalisations d'éclairage LED pour les professionnels.
                </p>
              )}
            </div>

            {/* Filtres */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="h-4 w-4 text-gray-500" />
                <h2 className="text-sm md:text-base font-semibold text-gray-900">Filtres</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
              <Select value={filters.secteur || 'all'} onValueChange={(value) => setFilters({ ...filters, secteur: value === 'all' ? '' : value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Secteur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les secteurs</SelectItem>
                  {secteurs.map((secteur) => (
                    <SelectItem key={secteur} value={secteur}>
                      {secteur}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              </div>
            </div>

            {/* Liste réalisations */}
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--secondary-500)]" />
              </div>
            ) : realisations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 text-sm mb-2">Aucune réalisation trouvée.</p>
                <p className="text-gray-500 text-xs mb-4">
                  {filters.secteur || filters.search 
                    ? 'Aucune réalisation ne correspond à vos critères de recherche.'
                    : 'Les réalisations seront disponibles une fois la base de données configurée. Assurez-vous d\'avoir exécuté les migrations SQL.'}
                </p>
                {(filters.secteur || filters.search) && (
                  <button
                    onClick={() => setFilters({ secteur: '', search: '' })}
                    className="text-[var(--secondary-500)] hover:underline text-xs"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 lg:gap-4">
            {realisations.map((realisation) => {
              const mainImage = realisation.images && realisation.images[0]?.url;
              return (
                <Link
                  key={realisation.id}
                  to={`/realisations/${realisation.slug}`}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
                >
                  <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
                    {mainImage ? (
                      <img
                        src={mainImage}
                        alt={realisation.titre}
                        className="w-full h-full object-cover scale-90 md:scale-100 group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-gray-400 text-xs">Pas d'image</div>
                    )}
                  </div>
                  <div className="p-2 md:p-3">
                    <h3 className="text-xs md:text-sm lg:text-base font-bold text-gray-900 mb-1.5 md:mb-2 line-clamp-2">
                      {realisation.titre}
                    </h3>
                    {realisation.client && (
                      <p className="text-[10px] md:text-xs text-gray-600 mb-0.5 md:mb-1">
                        Client: {realisation.client}
                      </p>
                    )}
                    {realisation.secteur && (
                      <p className="text-[10px] md:text-xs text-gray-600 mb-1.5 md:mb-2">
                        Secteur: {realisation.secteur}
                      </p>
                    )}
                    {realisation.description_courte && (
                      <p className="text-gray-700 mb-2 md:mb-3 line-clamp-2 text-[10px] md:text-xs leading-relaxed">
                        {realisation.description_courte}
                      </p>
                    )}
                    {realisation.economie_energie_pct && (
                      <div className="flex items-center gap-1 md:gap-1.5 text-[var(--secondary-500)] font-bold text-[10px] md:text-xs">
                        <TrendingDown className="h-2.5 w-2.5 md:h-3 md:w-3" />
                        <span>Économie: {realisation.economie_energie_pct}%</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
              })}
            </div>
          )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Realisations;

