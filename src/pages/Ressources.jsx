import React, { useState, useEffect } from 'react';
import { usePageSEO } from '@/hooks/usePageSEO';
import SEOHead from '@/components/SEOHead';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Download, FileText, BookOpen } from 'lucide-react';
import { logger } from '@/utils/logger';

const Ressources = () => {
  const seo = usePageSEO('/ressources');
  const [ressources, setRessources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRessources();
  }, []);

  const fetchRessources = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('medias')
        .select('*')
        .eq('category', 'ressource')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRessources(data || []);
    } catch (err) {
      logger.error('[Ressources] Error fetching ressources:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url, fileName) => {
    try {
      // Télécharger depuis Supabase Storage
      const { data, error } = await supabase.storage
        .from('ressources')
        .download(fileName);

      if (error) throw error;

      // Créer un lien de téléchargement
      const blob = await data.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      logger.error('[Ressources] Error downloading file:', err);
      // Fallback: ouvrir dans un nouvel onglet
      window.open(url, '_blank');
    }
  };

  return (
    <>
      <SEOHead
        metaTitle={seo.metaTitle}
        metaDescription={seo.metaDescription}
        ogImage={seo.ogImage}
        isIndexable={seo.isIndexable}
        h1={seo.h1 || 'Ressources & Documentation'}
        intro={seo.intro}
      />

      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16">
          {/* Hero */}
          <div className="text-center mb-16 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {seo.h1 || 'Ressources & Documentation'}
            </h1>
            {seo.intro && (
              <p className="text-xl text-gray-600">
                {seo.intro}
              </p>
            )}
            {!seo.intro && (
              <p className="text-xl text-gray-600">
                Téléchargez nos guides, livres blancs et fiches techniques pour en savoir plus sur nos solutions d'éclairage LED.
              </p>
            )}
          </div>

        {/* Liste ressources */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-[var(--secondary-500)]" />
          </div>
        ) : ressources.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Aucune ressource disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {ressources.map((ressource) => {
              const isPDF = ressource.mime_type === 'application/pdf' || ressource.file_name?.endsWith('.pdf');
              const Icon = isPDF ? FileText : Download;
              
              return (
                <div
                  key={ressource.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-4 bg-[var(--secondary-500)]/10 rounded-xl">
                      <Icon className="h-8 w-8 text-[var(--secondary-500)]" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {ressource.titre || ressource.file_name || 'Document'}
                  </h3>
                  {ressource.alt_text && (
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                      {ressource.alt_text}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    {ressource.file_size && (
                      <span className="text-xs text-gray-500 font-medium">
                        {(ressource.file_size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    )}
                    <button
                      onClick={() => handleDownload(ressource.url, ressource.file_name || 'document')}
                      className="inline-flex items-center px-5 py-2.5 bg-[var(--secondary-500)] text-white rounded-lg hover:bg-[var(--secondary-600)] transition-all font-semibold text-sm shadow-md hover:shadow-lg"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>
    </>
  );
};

export default Ressources;

