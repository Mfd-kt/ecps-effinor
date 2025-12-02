import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, ChevronLeft, ChevronRight, Loader2, ArrowRight } from 'lucide-react';
import { getPublicPosts } from '@/lib/api/posts';
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

const BlogList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchPosts = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getPublicPosts({ page, limit: 10 });
      
      if (result.success) {
        setPosts(result.data || []);
        setPagination(result.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
      } else {
        throw new Error(result.error || 'Erreur lors du chargement des articles');
      }
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors du chargement des articles';
      setError(errorMessage);
      logger.error('Error fetching blog posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage, fetchPosts]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setSearchParams({ page: newPage.toString() });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Blog | EFFINOR</title>
          <meta name="description" content="Découvrez nos articles sur l'éclairage LED, l'efficacité énergétique et les solutions professionnelles." />
        </Helmet>
        <div className="min-h-screen bg-gray-50">
          <div className="w-full bg-primary-900 text-white py-12 pt-32">
            <div className="container mx-auto">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-white">Blog</h1>
              <p className="text-xl text-white/90">Nos articles et actualités</p>
            </div>
          </div>
          <div className="container mx-auto py-12">
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary-600 mb-4" />
              <p className="text-gray-600">Chargement des articles...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Blog | EFFINOR</title>
          <meta name="description" content="Découvrez nos articles sur l'éclairage LED, l'efficacité énergétique et les solutions professionnelles." />
        </Helmet>
        <div className="min-h-screen bg-gray-50">
          <div className="w-full bg-primary-900 text-white py-12 pt-32">
            <div className="container mx-auto">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-white">Blog</h1>
              <p className="text-xl text-white/90">Nos articles et actualités</p>
            </div>
          </div>
          <div className="container mx-auto py-12">
            <div className="text-center py-20">
              <span className="text-4xl" role="img" aria-label="error">❌</span>
              <h3 className="text-xl font-semibold mt-4">Erreur de chargement</h3>
              <p className="text-gray-600 my-2">{error}</p>
              <button
                onClick={() => fetchPosts(currentPage)}
                className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Blog | EFFINOR</title>
        <meta name="description" content="Découvrez nos articles sur l'éclairage LED, l'efficacité énergétique, les Certificats d'Économies d'Énergie et les solutions professionnelles pour votre entreprise." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="w-full bg-primary-900 text-white py-12 pt-32">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-white">Blog</h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Découvrez nos articles sur l'éclairage LED, l'efficacité énergétique et les solutions professionnelles
              </p>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto py-12">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl" role="img" aria-label="document">📝</span>
              <h3 className="text-2xl font-semibold mt-4">Aucun article disponible</h3>
              <p className="text-gray-600 my-2">Les articles seront bientôt disponibles.</p>
            </div>
          ) : (
            <>
              {/* Articles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {posts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <Link to={`/blog/${post.slug}`} className="block">
                      {/* Cover Image */}
                      {post.cover_image_url && (
                        <div className="w-full h-48 overflow-hidden bg-gray-200">
                          <img
                            src={post.cover_image_url}
                            alt={post.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-primary-600 transition-colors">
                          {post.title}
                        </h2>
                        
                        {post.excerpt && (
                          <p className="text-gray-600 mb-4 line-clamp-3">
                            {post.excerpt}
                          </p>
                        )}

                        {/* Meta Information */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                          {post.published_at && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(post.published_at)}</span>
                            </div>
                          )}
                          {post.author && (
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>
                                {post.author.full_name || 
                                 `${post.author.prenom || ''} ${post.author.nom || ''}`.trim() || 
                                 'Auteur'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.slice(0, 3).map((tag, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {post.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{post.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Read More */}
                        <div className="flex items-center text-primary-600 font-medium text-sm mt-4">
                          Lire la suite
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </button>
                  
                  <span className="text-gray-700">
                    Page {pagination.page} sur {pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogList;





