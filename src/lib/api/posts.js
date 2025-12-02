import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/utils/logger';

/**
 * Blog Posts API
 * Gestion complète des articles de blog pour ECPS
 */

/**
 * Récupérer les posts publiés pour le site public (avec pagination)
 * @param {Object} options - Options de pagination et filtrage
 * @param {number} options.page - Numéro de page (défaut: 1)
 * @param {number} options.limit - Nombre d'articles par page (défaut: 10)
 * @returns {Promise<{success: boolean, data?: Array, pagination?: Object, error?: string}>}
 */
export async function getPublicPosts({ page = 1, limit = 10 } = {}) {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        slug,
        excerpt,
        cover_image_url,
        published_at,
        tags,
        author_id,
        author:utilisateurs!posts_author_id_fkey(
          id,
          prenom,
          nom,
          full_name,
          photo_profil_url
        )
      `, { count: 'exact' })
      .eq('status', 'published')
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  } catch (error) {
    logger.error('Error fetching public posts:', error);
    console.error('Error fetching public posts:', error);
    return {
      success: false,
      error: error.message,
      data: [],
      pagination: { page: 1, limit, total: 0, totalPages: 0 }
    };
  }
}

/**
 * Récupérer un post publié par son slug (site public)
 * @param {string} slug - Slug de l'article
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function getPublicPostBySlug(slug) {
  try {
    if (!slug) {
      throw new Error('Slug is required');
    }

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:utilisateurs!posts_author_id_fkey(
          id,
          prenom,
          nom,
          full_name,
          photo_profil_url
        )
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .not('published_at', 'is', null)
      .single();

    if (error) {
      // Si le post n'existe pas, retourner un message clair
      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: 'Article non trouvé',
          data: null
        };
      }
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    logger.error('Error fetching post by slug:', error);
    console.error('Error fetching post by slug:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

/**
 * Récupérer tous les posts pour le dashboard admin (avec pagination et filtres)
 * @param {Object} options - Options de pagination et filtrage
 * @param {number} options.page - Numéro de page (défaut: 1)
 * @param {number} options.limit - Nombre d'articles par page (défaut: 20)
 * @param {string} options.status - Filtrer par statut ('draft', 'published', ou 'all')
 * @param {string} options.searchQuery - Recherche dans le titre et le contenu
 * @returns {Promise<{success: boolean, data?: Array, pagination?: Object, error?: string}>}
 */
export async function getAdminPosts({ 
  page = 1, 
  limit = 20, 
  status = 'all',
  searchQuery = ''
} = {}) {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('posts')
      .select(`
        *,
        author:utilisateurs!posts_author_id_fkey(
          id,
          prenom,
          nom,
          full_name,
          photo_profil_url
        )
      `, { count: 'exact' });

    // Filtrer par statut
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Recherche dans le titre et le contenu
    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
    }

    // Trier par date de création (plus récent en premier)
    query = query.order('created_at', { ascending: false });

    // Pagination
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  } catch (error) {
    logger.error('Error fetching admin posts:', error);
    console.error('Error fetching admin posts:', error);
    return {
      success: false,
      error: error.message,
      data: [],
      pagination: { page: 1, limit, total: 0, totalPages: 0 }
    };
  }
}

/**
 * Récupérer un post par son ID (pour édition côté admin)
 * @param {string} id - ID de l'article
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function getPostById(id) {
  try {
    if (!id) {
      throw new Error('Post ID is required');
    }

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:utilisateurs!posts_author_id_fkey(
          id,
          prenom,
          nom,
          full_name,
          photo_profil_url
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: 'Article non trouvé',
          data: null
        };
      }
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    logger.error('Error fetching post by ID:', error);
    console.error('Error fetching post by ID:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

/**
 * Créer un nouvel article
 * @param {Object} postData - Données de l'article
 * @param {string} postData.title - Titre de l'article
 * @param {string} postData.slug - Slug URL-friendly
 * @param {string} postData.content - Contenu de l'article
 * @param {string} postData.author_id - ID de l'auteur (utilisateur)
 * @param {string} [postData.excerpt] - Résumé court
 * @param {string} [postData.cover_image_url] - URL de l'image de couverture
 * @param {string} [postData.status] - Statut ('draft' ou 'published')
 * @param {string[]} [postData.tags] - Tableau de tags
 * @param {string} [postData.seo_title] - Titre SEO
 * @param {string} [postData.seo_description] - Description SEO
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function createPost(postData) {
  try {
    // Validation des champs requis
    if (!postData.title || !postData.slug || !postData.content || !postData.author_id) {
      throw new Error('Les champs title, slug, content et author_id sont requis');
    }

    // Préparer les données
    const insertData = {
      title: postData.title.trim(),
      slug: postData.slug.trim(),
      content: postData.content,
      author_id: postData.author_id,
      excerpt: postData.excerpt?.trim() || null,
      cover_image_url: postData.cover_image_url?.trim() || null,
      status: postData.status || 'draft',
      tags: postData.tags || [],
      seo_title: postData.seo_title?.trim() || null,
      seo_description: postData.seo_description?.trim() || null,
      published_at: null
    };

    // Si le statut est 'published', définir published_at à maintenant
    if (insertData.status === 'published' && !postData.published_at) {
      insertData.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('posts')
      .insert([insertData])
      .select(`
        *,
        author:utilisateurs!posts_author_id_fkey(
          id,
          prenom,
          nom,
          full_name,
          photo_profil_url
        )
      `)
      .single();

    if (error) throw error;

    logger.log('✅ Post créé:', data.id);
    return {
      success: true,
      data
    };
  } catch (error) {
    logger.error('Error creating post:', error);
    console.error('Error creating post:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Mettre à jour un article existant
 * @param {string} id - ID de l'article
 * @param {Object} updates - Données à mettre à jour
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function updatePost(id, updates) {
  try {
    if (!id) {
      throw new Error('Post ID is required');
    }

    // Préparer les données de mise à jour
    const updateData = {};

    if (updates.title !== undefined) updateData.title = updates.title.trim();
    if (updates.slug !== undefined) updateData.slug = updates.slug.trim();
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.excerpt !== undefined) updateData.excerpt = updates.excerpt?.trim() || null;
    if (updates.cover_image_url !== undefined) updateData.cover_image_url = updates.cover_image_url?.trim() || null;
    if (updates.tags !== undefined) updateData.tags = updates.tags || [];
    if (updates.seo_title !== undefined) updateData.seo_title = updates.seo_title?.trim() || null;
    if (updates.seo_description !== undefined) updateData.seo_description = updates.seo_description?.trim() || null;

    // Gestion du statut et published_at
    if (updates.status !== undefined) {
      updateData.status = updates.status;

      // Si le statut passe à 'published' et que published_at est null, le définir à maintenant
      if (updates.status === 'published') {
        // Vérifier le published_at actuel
        const { data: currentPost } = await supabase
          .from('posts')
          .select('published_at')
          .eq('id', id)
          .single();

        if (!currentPost?.published_at) {
          updateData.published_at = new Date().toISOString();
        }
      } else if (updates.status === 'draft') {
        // Si on repasse en brouillon, on peut garder published_at ou le mettre à null
        // Ici on garde published_at pour l'historique
      }
    }

    // Si published_at est explicitement fourni
    if (updates.published_at !== undefined) {
      updateData.published_at = updates.published_at;
    }

    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        author:utilisateurs!posts_author_id_fkey(
          id,
          prenom,
          nom,
          full_name,
          photo_profil_url
        )
      `)
      .single();

    if (error) throw error;

    logger.log('✅ Post mis à jour:', id);
    return {
      success: true,
      data
    };
  } catch (error) {
    logger.error('Error updating post:', error);
    console.error('Error updating post:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Supprimer un article
 * @param {string} id - ID de l'article
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deletePost(id) {
  try {
    if (!id) {
      throw new Error('Post ID is required');
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    logger.log('✅ Post supprimé:', id);
    return {
      success: true
    };
  } catch (error) {
    logger.error('Error deleting post:', error);
    console.error('Error deleting post:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Générer un slug à partir d'un titre
 * @param {string} title - Titre de l'article
 * @returns {string} - Slug URL-friendly
 */
export function generateSlugFromTitle(title) {
  if (!title) return '';

  return title
    .toLowerCase()
    .trim()
    .normalize('NFD') // Décomposer les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9]+/g, '-') // Remplacer les caractères non alphanumériques par des tirets
    .replace(/^-+|-+$/g, ''); // Supprimer les tirets en début et fin
}





