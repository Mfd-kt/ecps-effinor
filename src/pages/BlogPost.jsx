import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowLeft, Loader2, Tag } from 'lucide-react';
import { getPublicPostBySlug } from '@/lib/api/posts';
import { logger } from '@/utils/logger';
import { Badge } from '@/components/ui/badge';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) {
        setError('Slug manquant');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const result = await getPublicPostBySlug(slug);
        
        if (result.success && result.data) {
          setPost(result.data);
        } else {
          throw new Error(result.error || 'Article non trouvé');
        }
      } catch (err) {
        const errorMessage = err.message || 'Erreur lors du chargement de l\'article';
        setError(errorMessage);
        logger.error('Error fetching blog post:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Chargement... | EFFINOR</title>
        </Helmet>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto py-12">
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary-600 mb-4" />
              <p className="text-gray-600">Chargement de l'article...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <Helmet>
          <title>Article non trouvé | EFFINOR</title>
          <meta name="description" content="L'article demandé n'existe pas ou n'est plus disponible." />
        </Helmet>
        <div className="min-h-screen bg-gray-50">
          <div className="w-full bg-primary-900 text-white py-12 pt-32">
            <div className="container mx-auto">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-white">Article non trouvé</h1>
            </div>
          </div>
          <div className="container mx-auto py-12">
            <div className="text-center py-20 max-w-2xl mx-auto">
              <span className="text-6xl" role="img" aria-label="error">📄</span>
              <h3 className="text-2xl font-semibold mt-4">Article introuvable</h3>
              <p className="text-gray-600 my-4">
                {error === 'Article non trouvé' 
                  ? "L'article que vous recherchez n'existe pas ou n'est plus disponible."
                  : error}
              </p>
              <div className="flex gap-4 justify-center mt-6">
                <Link
                  to="/blog"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour au blog
                </Link>
                <Link
                  to="/"
                  className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Accueil
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const seoTitle = post.seo_title || post.title;
  const seoDescription = post.seo_description || post.excerpt || '';

  return (
    <>
      <Helmet>
        <title>{seoTitle} | EFFINOR</title>
        <meta name="description" content={seoDescription} />
        {post.cover_image_url && (
          <meta property="og:image" content={post.cover_image_url} />
        )}
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="w-full bg-primary-900 text-white py-12 pt-32">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour au blog
              </Link>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-white">
                {post.title}
              </h1>
              <div className="flex items-center gap-6 text-white/80 text-sm">
                {post.published_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(post.published_at)}</span>
                  </div>
                )}
                {post.author && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>
                      {post.author.full_name || 
                       `${post.author.prenom || ''} ${post.author.nom || ''}`.trim() || 
                       'Auteur'}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto py-12">
          <div className="max-w-4xl mx-auto">
            {/* Cover Image */}
            {post.cover_image_url && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-8 rounded-lg overflow-hidden shadow-lg"
              >
                <img
                  src={post.cover_image_url}
                  alt={post.title}
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </motion.div>
            )}

            {/* Article Content */}
            <motion.article
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-lg shadow-md p-8 md:p-12"
            >
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Content */}
              <div 
                className="prose prose-lg max-w-none text-gray-700"
                style={{
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word'
                }}
              >
                {post.content}
              </div>
            </motion.article>

            {/* Back to Blog Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8 text-center"
            >
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour au blog
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPost;


















