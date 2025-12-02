import React from 'react';
import { Navigate } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { useRequireAuth } from '@/hooks/useRequireAuth';

/**
 * Layout admin avec protection d'authentification
 * 
 * Vérifie que l'utilisateur est authentifié avant d'afficher le layout.
 * Redirige vers /login si non authentifié.
 */
const AdminLayout = ({ children }) => {
  const { isAuthenticated, loading } = useRequireAuth();

  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Vérification de votre session...</p>
        </div>
      </div>
    );
  }

  // Rediriger vers login si non authentifié
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      {/* Main content area with left margin to account for fixed sidebar (256px = w-64) - only on desktop */}
      <div className="flex-1 flex flex-col overflow-x-hidden lg:ml-64">
        {/* Header avec notifications */}
        <header className="bg-gray-900 border-b border-gray-700 px-4 md:px-6 py-4 flex items-center justify-end sticky top-0 z-20">
          <AdminHeader />
        </header>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;