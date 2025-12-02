import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useLocation } from 'react-router-dom';
import { logger } from '@/utils/logger';

/**
 * Hook pour récupérer les données SEO d'une page
 * @param {string} slug - Slug de la page (ex: "/", "/a-propos", "/solutions/industrie")
 * @returns {object} - { metaTitle, metaDescription, h1, intro, ogImage, isIndexable, loading }
 */
export const usePageSEO = (slug = null) => {
  const location = useLocation();
  const [seoData, setSeoData] = useState({
    metaTitle: null,
    metaDescription: null,
    h1: null,
    intro: null,
    ogImage: null,
    isIndexable: true,
    loading: true
  });

  // Utiliser le slug fourni ou le pathname actuel
  const pageSlug = slug || location.pathname;

  useEffect(() => {
    const fetchSEO = async () => {
      try {
        setSeoData(prev => ({ ...prev, loading: true }));

        // 1. Chercher dans pages_seo
        try {
          const { data: pageSEO, error: pageError } = await supabase
            .from('pages_seo')
            .select('*')
            .eq('slug', pageSlug)
            .single();

          if (!pageError && pageSEO) {
            setSeoData({
              metaTitle: pageSEO.meta_title,
              metaDescription: pageSEO.meta_description,
              h1: pageSEO.h1,
              intro: pageSEO.intro,
              ogImage: pageSEO.og_image_url,
              isIndexable: pageSEO.is_indexable,
              loading: false
            });
            return;
          }
        } catch (pageErr) {
          // Si la table n'existe pas, continuer avec les autres sources
          if (pageErr.code !== '42P01' && !pageErr.message?.includes('does not exist')) {
            logger.error('[usePageSEO] Error fetching page SEO:', pageErr);
          }
        }

        // 2. Si c'est une page blog, chercher dans posts
        if (pageSlug.startsWith('/blog/')) {
          const postSlug = pageSlug.replace('/blog/', '');
          try {
            const { data: post, error: postError } = await supabase
              .from('posts')
              .select('*')
              .eq('slug', postSlug)
              .eq('status', 'published')
              .single();

            if (!postError && post) {
              setSeoData({
                metaTitle: post.seo_title || post.title,
                metaDescription: post.seo_description || post.excerpt,
                h1: post.title,
                intro: post.excerpt,
                ogImage: post.seo_og_image_url || post.cover_image_url,
                isIndexable: true,
                loading: false
              });
              return;
            }
          } catch (postErr) {
            // Si la table n'existe pas, continuer avec le fallback
            if (postErr.code !== '42P01' && !postErr.message?.includes('does not exist')) {
              logger.error('[usePageSEO] Error fetching post:', postErr);
            }
          }
        }

        // 3. Si c'est une page réalisation, chercher dans realisations
        if (pageSlug.startsWith('/realisations/')) {
          const realSlug = pageSlug.replace('/realisations/', '');
          try {
            const { data: realisation, error: realError } = await supabase
              .from('realisations')
              .select('*')
              .eq('slug', realSlug)
              .eq('status', 'published')
              .single();

            if (!realError && realisation) {
              const h1Text = `Rénovation d'éclairage pour ${realisation.secteur || 'votre site'} – ${realisation.client || 'Client'}`;
              setSeoData({
                metaTitle: realisation.seo_title || realisation.titre,
                metaDescription: realisation.seo_description || realisation.description_courte,
                h1: h1Text,
                intro: realisation.description_courte,
                ogImage: realisation.seo_og_image_url || (realisation.images && realisation.images[0]?.url),
                isIndexable: true,
                loading: false
              });
              return;
            }
          } catch (realErr) {
            // Si la table n'existe pas, continuer avec le fallback
            if (realErr.code !== '42P01' && !realErr.message?.includes('does not exist')) {
              logger.error('[usePageSEO] Error fetching realisation:', realErr);
            }
          }
        }

        // 4. Fallback: valeurs par défaut
        const defaultTitle = 'Effinor - Spécialiste français de l\'éclairage LED professionnel';
        const defaultDescription = 'Effinor propose des solutions d\'éclairage LED professionnel pour l\'industrie, le tertiaire, la logistique et les collectivités.';

        setSeoData({
          metaTitle: defaultTitle,
          metaDescription: defaultDescription,
          h1: null,
          intro: null,
          ogImage: null,
          isIndexable: true,
          loading: false
        });

      } catch (err) {
        logger.error('[usePageSEO] Error fetching SEO data:', err);
        setSeoData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchSEO();
  }, [pageSlug]);

  return seoData;
};

