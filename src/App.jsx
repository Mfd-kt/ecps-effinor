import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import CEEEligibilityForm from '@/pages/CEEEligibilityForm';
import ThankYou from '@/pages/ThankYou';
import PaymentSuccess from '@/pages/PaymentSuccess';
import PaymentCancel from '@/pages/PaymentCancel';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import LegalNotice from '@/pages/LegalNotice';
import CGV from '@/pages/CGV';
import PolitiqueConfidentialite from '@/pages/PolitiqueConfidentialite'; // Import new page
import LandingDeshumidificateur from '@/pages/landing/LandingDeshumidificateur';
import BlogList from '@/pages/BlogList';
import BlogPost from '@/pages/BlogPost';
import Solutions from '@/pages/Solutions';
import SolutionDetail from '@/pages/SolutionDetail';
import Produits from '@/pages/Produits';
import ProduitsSolutions from '@/pages/ProduitsSolutions';
import SecteursActivite from '@/pages/SecteursActivite';
import ServicesAccompagnement from '@/pages/ServicesAccompagnement';
import CategoryDetail from '@/pages/CategoryDetail';
import Realisations from '@/pages/Realisations';
import RealisationDetail from '@/pages/RealisationDetail';
import Ressources from '@/pages/Ressources';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminProductNew from '@/pages/admin/AdminProductNew';
import AdminProductEdit from '@/pages/admin/AdminProductEdit';
import AdminProductAccessories from '@/pages/admin/AdminProductAccessories';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminOrderDetail from '@/pages/admin/AdminOrderDetail';
import AdminUtilisateurs from '@/pages/admin/AdminUtilisateurs';
import DetailUtilisateur from '@/pages/admin/DetailUtilisateur';
import AdminRoles from '@/pages/admin/AdminRoles';
import AdminUserForm from '@/pages/admin/AdminUserForm';
import AdminVisitors from '@/pages/admin/AdminVisitors';
import AdminLeads from '@/pages/admin/AdminLeads';
import DetailLead from '@/pages/admin/DetailLead';
import AdminBlogList from '@/pages/admin/blog/BlogList';
import BlogEdit from '@/pages/admin/blog/BlogEdit';
import PagesSEO from '@/pages/admin/PagesSEO';
import RealisationsList from '@/pages/admin/RealisationsList';
import RealisationEdit from '@/pages/admin/RealisationEdit';
import MediasList from '@/pages/admin/MediasList';
import ClientLogin from '@/pages/client/ClientLogin';
import ClientDashboard from '@/pages/client/ClientDashboard';
import RequireClient from '@/components/client/RequireClient';
import MonCompte from '@/pages/admin/MonCompte';
import NotificationsPage from '@/pages/admin/NotificationsPage';
import CommercialDashboard from '@/pages/admin/CommercialDashboard';
import SettingsRolesPage from '@/pages/admin/settings/SettingsRolesPage';
import SettingsLeadStatusesPage from '@/pages/admin/settings/SettingsLeadStatusesPage';
import SettingsOrderStatusesPage from '@/pages/admin/settings/SettingsOrderStatusesPage';
import AuthCallback from '@/pages/AuthCallback';
import SignUp from '@/pages/SignUp';
import ResetPassword from '@/pages/ResetPassword';
import CookieConsent from '@/components/CookieConsent';
import { trackPageView } from '@/lib/visitorTracker';
import { useScrollTracking } from '@/hooks/useScrollTracking';
import RequireAdmin from '@/components/admin/RequireAdmin';
import RequireRole from '@/components/admin/RequireRole';
import RoleBasedRoute from '@/components/admin/RoleBasedRoute';
import RedirectWithParams from '@/components/admin/RedirectWithParams';
import TopNotificationBar from '@/components/TopNotificationBar';
import FloatingCallButton from '@/components/FloatingCallButton';
import { useBanner } from '@/contexts/BannerContext';
import LoginDirect from '@/pages/LoginDirect';
import ScrollToTop from '@/components/ScrollToTop';
import { logger } from '@/utils/logger';
import { useLocation } from 'react-router-dom';
import '@/styles/global-design-system.css';

// Composant pour tracker les pages
const TrackingWrapper = ({ children }) => {
  const location = useLocation();
  useScrollTracking(); // Track le scroll profond

  useEffect(() => {
    // Attendre un peu pour que la page soit chargée
    const timer = setTimeout(() => {
      trackPageView();
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  return <>{children}</>;
};

const MainLayout = ({ children }) => {
  const { isBannerVisible } = useBanner();

  return (
    <div className={isBannerVisible ? 'pt-[52px]' : ''}>
      <TopNotificationBar />
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <FloatingCallButton />
    </div>
  );
};

// Placeholder for role-specific dashboards - redirect to unified dashboard
const TechnicienDashboard = () => <Navigate to="/dashboard" replace />;
const CallcenterDashboard = () => <Navigate to="/dashboard" replace />;


// Composant pour détecter les tokens d'auth dans le hash et rediriger
const AuthRedirectHandler = () => {
  useEffect(() => {
    // Ne rien faire si on est déjà sur /auth/callback
    if (window.location.pathname === '/auth/callback') {
      return;
    }
    
    const hash = window.location.hash;
    const search = window.location.search;
    
    // Vérifier si on a des tokens d'auth dans le hash (invitation Supabase)
    // Le hash peut contenir: #access_token=...&refresh_token=...&type=invite
    if (hash && hash.length > 1 && hash.includes('access_token')) {
      // Rediriger vers /auth/callback avec le hash et les paramètres de recherche
      const callbackUrl = `/auth/callback${hash}${search}`;
      if (import.meta.env.DEV) {
        logger.log('🔀 Redirection vers AuthCallback:', callbackUrl);
      }
      window.location.replace(callbackUrl);
    }
  }, []);
  
  return null;
};

function App() {
  return (
    <>
      <ScrollToTop />
      <AuthRedirectHandler />
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/login-direct" element={<LoginDirect />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Espace client routes */}
        <Route path="/espace-client/login" element={<ClientLogin />} />
        <Route
          path="/espace-client/dashboard"
          element={
            <RequireClient>
              <MainLayout>
                <ClientDashboard />
              </MainLayout>
            </RequireClient>
          }
        />
        
        {/* Redirect old login route */}
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />
        
        {/* Admin routes - unified without prefixes */}
        <Route
          path="/dashboard"
          element={
            <RequireRole roles={['super_admin', 'admin', 'commercial', 'technicien', 'callcenter']}>
              <AdminLayout>
                <RoleBasedRoute
                  adminComponent={<AdminDashboard />}
                  commercialComponent={<CommercialDashboard />}
                  technicienComponent={<TechnicienDashboard />}
                  callcenterComponent={<CallcenterDashboard />}
                />
              </AdminLayout>
            </RequireRole>
          }
        />
        
        <Route
          path="/leads"
          element={
            <RequireRole roles={['super_admin', 'admin', 'commercial']}>
              <AdminLayout>
                <AdminLeads />
              </AdminLayout>
            </RequireRole>
          }
        />
        
        <Route
          path="/leads/:id"
          element={
            <RequireRole roles={['super_admin', 'admin', 'commercial']}>
              <AdminLayout>
                <DetailLead />
              </AdminLayout>
            </RequireRole>
          }
        />
        
        <Route
          path="/admin/blog"
          element={
            <RequireRole roles={['super_admin', 'admin', 'manager', 'backoffice', 'commercial', 'technicien', 'callcenter']}>
              <AdminLayout>
                <AdminBlogList />
              </AdminLayout>
            </RequireRole>
          }
        />
        
        <Route
          path="/admin/blog/new"
          element={
            <RequireRole roles={['super_admin', 'admin', 'manager', 'backoffice']}>
              <AdminLayout>
                <BlogEdit />
              </AdminLayout>
            </RequireRole>
          }
        />
        
        <Route
          path="/admin/blog/:postId"
          element={
            <RequireRole roles={['super_admin', 'admin', 'manager', 'backoffice', 'commercial', 'technicien', 'callcenter']}>
              <AdminLayout>
                <BlogEdit />
              </AdminLayout>
            </RequireRole>
          }
        />
        
        <Route
          path="/admin/pages-seo"
          element={
            <RequireRole roles={['super_admin', 'admin', 'manager', 'backoffice']}>
              <AdminLayout>
                <PagesSEO />
              </AdminLayout>
            </RequireRole>
          }
        />
        
        <Route
          path="/admin/realisations"
          element={
            <RequireRole roles={['super_admin', 'admin', 'manager', 'backoffice']}>
              <AdminLayout>
                <RealisationsList />
              </AdminLayout>
            </RequireRole>
          }
        />
        
        <Route
          path="/admin/realisations/:id"
          element={
            <RequireRole roles={['super_admin', 'admin', 'manager', 'backoffice']}>
              <AdminLayout>
                <RealisationEdit />
              </AdminLayout>
            </RequireRole>
          }
        />
        
        <Route
          path="/admin/medias"
          element={
            <RequireRole roles={['super_admin', 'admin', 'manager', 'backoffice']}>
              <AdminLayout>
                <MediasList />
              </AdminLayout>
            </RequireRole>
          }
        />
        
        <Route
          path="/commandes"
          element={
            <RequireRole roles={['super_admin', 'admin', 'commercial']}>
              <AdminLayout>
                <AdminOrders />
              </AdminLayout>
            </RequireRole>
          }
        />
        
        <Route
          path="/commandes/:id"
          element={
            <RequireRole roles={['super_admin', 'admin', 'commercial']}>
              <AdminLayout>
                <AdminOrderDetail />
              </AdminLayout>
            </RequireRole>
          }
        />
        
        <Route
          path="/produits"
          element={
            <RequireRole roles={['super_admin', 'admin']}>
              <AdminLayout>
                <AdminProducts />
              </AdminLayout>
            </RequireRole>
          }
        />
        
        <Route
          path="/produits/new"
          element={
            <RequireRole roles={['super_admin', 'admin']}>
              <AdminLayout>
                <AdminProductNew />
              </AdminLayout>
            </RequireRole>
          }
        />
        
        <Route
          path="/produits/:id/edit"
          element={
            <RequireRole roles={['super_admin', 'admin']}>
              <AdminLayout>
                <AdminProductEdit />
              </AdminLayout>
            </RequireRole>
          }
        />

        <Route
          path="/produits/:productId/accessoires"
          element={
            <RequireRole roles={['super_admin', 'admin']}>
              <AdminLayout>
                <AdminProductAccessories />
              </AdminLayout>
            </RequireRole>
          }
        />
        
        <Route
          path="/categories"
          element={
            <RequireRole roles={['super_admin', 'admin']}>
              <AdminLayout>
                <AdminCategories />
              </AdminLayout>
            </RequireRole>
          }
        />
        
        <Route
          path="/utilisateurs"
          element={
            <RequireRole roles={['super_admin', 'admin']}>
              <AdminLayout>
                <AdminUtilisateurs />
              </AdminLayout>
            </RequireRole>
          }
        />
        
        <Route
          path="/utilisateurs/:id"
          element={
            <RequireRole roles={['super_admin', 'admin']}>
              <AdminLayout>
                <DetailUtilisateur />
              </AdminLayout>
            </RequireRole>
          }
        />
        
        <Route
          path="/utilisateurs/new"
          element={
            <RequireRole roles={['super_admin', 'admin']}>
              <AdminLayout>
                <AdminUserForm />
              </AdminLayout>
            </RequireRole>
          }
        />
        
        <Route
          path="/paramètres/roles"
          element={
            <RequireRole roles={['super_admin', 'admin']}>
              <AdminLayout>
                <SettingsRolesPage />
              </AdminLayout>
            </RequireRole>
          }
        />
        
        <Route
          path="/paramètres/lead-statuses"
          element={
            <RequireRole roles={['super_admin', 'admin']}>
              <AdminLayout>
                <SettingsLeadStatusesPage />
              </AdminLayout>
            </RequireRole>
          }
        />
        
        <Route
          path="/paramètres/order-statuses"
          element={
            <RequireRole roles={['super_admin', 'admin']}>
              <AdminLayout>
                <SettingsOrderStatusesPage />
              </AdminLayout>
            </RequireRole>
          }
        />
        
        <Route
          path="/visiteurs"
          element={
            <RequireRole roles={['super_admin', 'admin']}>
              <AdminLayout>
                <AdminVisitors />
              </AdminLayout>
            </RequireRole>
          }
        />
        
        <Route
          path="/mon-compte"
          element={
            <RequireRole roles={['super_admin', 'admin', 'commercial', 'technicien', 'callcenter']}>
              <AdminLayout>
                <MonCompte />
              </AdminLayout>
            </RequireRole>
          }
        />
        
        <Route
          path="/notifications"
          element={
            <RequireRole roles={['super_admin', 'admin', 'commercial', 'technicien', 'callcenter']}>
              <AdminLayout>
                <NotificationsPage />
              </AdminLayout>
            </RequireRole>
          }
        />
        
        {/* Redirect old routes to new ones */}
        <Route path="/admin/dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/commercial/dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/technicien/dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/callcenter/dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/admin/leads" element={<Navigate to="/leads" replace />} />
        <Route path="/commercial/leads" element={<Navigate to="/leads" replace />} />
        <Route path="/admin/leads/:id" element={<RedirectWithParams to="/leads/:id" />} />
        <Route path="/commercial/leads/:id" element={<RedirectWithParams to="/leads/:id" />} />
        <Route path="/admin/orders" element={<Navigate to="/commandes" replace />} />
        <Route path="/commercial/commandes" element={<Navigate to="/commandes" replace />} />
        <Route path="/admin/orders/:id" element={<RedirectWithParams to="/commandes/:id" />} />
        <Route path="/commercial/commandes/:id" element={<RedirectWithParams to="/commandes/:id" />} />
        <Route path="/admin/products" element={<Navigate to="/produits" replace />} />
        <Route path="/admin/categories" element={<Navigate to="/categories" replace />} />
        <Route path="/admin/utilisateurs" element={<Navigate to="/utilisateurs" replace />} />
        <Route path="/admin/mon-compte" element={<Navigate to="/mon-compte" replace />} />
        <Route path="/commercial/mon-compte" element={<Navigate to="/mon-compte" replace />} />
        <Route path="/admin/notifications" element={<Navigate to="/notifications" replace />} />
        <Route path="/commercial/notifications" element={<Navigate to="/notifications" replace />} />
        <Route path="/admin/settings/roles" element={<Navigate to="/paramètres/roles" replace />} />
        <Route path="/admin/settings/lead-statuses" element={<Navigate to="/paramètres/lead-statuses" replace />} />
        <Route path="/admin/settings/order-statuses" element={<Navigate to="/paramètres/order-statuses" replace />} />
        <Route path="/admin/visitors" element={<Navigate to="/visiteurs" replace />} />
        
        <Route
          path="/*"
          element={
            <TrackingWrapper>
              <MainLayout>
                <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/boutique" element={<Navigate to="/produits-solutions" replace />} />
                <Route path="/produit/:slug" element={<ProductDetail />} />
                <Route path="/panier" element={<Cart />} />
                <Route path="/formulaire-complet" element={<CEEEligibilityForm />} />
                <Route path="/merci" element={<ThankYou />} />
                <Route path="/paiement/succes" element={<PaymentSuccess />} />
                <Route path="/paiement/annulee" element={<PaymentCancel />} />
                <Route path="/a-propos" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/mentions-legales" element={<LegalNotice />} />
                <Route path="/cgv" element={<CGV />} />
                <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} /> {/* Add new route */}
                <Route path="/landing/deshumidificateur" element={<LandingDeshumidificateur />} />
                <Route path="/blog" element={<BlogList />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/produits-solutions" element={<ProduitsSolutions />} />
                <Route path="/produits-solutions/:slug" element={<CategoryDetail />} />
                <Route path="/secteurs-activite" element={<SecteursActivite />} />
                <Route path="/secteurs-activite/:slug" element={<CategoryDetail />} />
                <Route path="/realisations" element={<Realisations />} />
                <Route path="/realisations/:slug" element={<RealisationDetail />} />
                <Route path="/services-accompagnement" element={<ServicesAccompagnement />} />
                <Route path="/ressources" element={<Ressources />} />
                {/* Routes legacy pour compatibilité */}
                <Route path="/solutions" element={<Navigate to="/produits-solutions" replace />} />
                <Route path="/solutions/:slug" element={<Navigate to="/produits-solutions/:slug" replace />} />
                <Route path="/produits" element={<Produits />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </MainLayout>
            </TrackingWrapper>
          }
        />
      </Routes>
      <CookieConsent />
      <Toaster />
    </>
  );
}

export default App;