import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Boutique from '@/pages/Boutique';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import PrimeCEE from '@/pages/PrimeCEE';
import FicheCEEDetail from '@/pages/FicheCEEDetail';
import CEEEligibilityForm from '@/pages/CEEEligibilityForm';
import ThankYou from '@/pages/ThankYou';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import LegalNotice from '@/pages/LegalNotice';
import CGV from '@/pages/CGV';
import PolitiqueConfidentialite from '@/pages/PolitiqueConfidentialite'; // Import new page
import LandingDeshumidificateur from '@/pages/landing/LandingDeshumidificateur';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminProductNew from '@/pages/admin/AdminProductNew';
import AdminProductEdit from '@/pages/admin/AdminProductEdit';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminFichesCEE from '@/pages/admin/AdminFichesCEE';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminOrderDetail from '@/pages/admin/AdminOrderDetail';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminUtilisateurs from '@/pages/admin/AdminUtilisateurs';
import DetailUtilisateur from '@/pages/admin/DetailUtilisateur';
import AdminRoles from '@/pages/admin/AdminRoles';
import AdminUserForm from '@/pages/admin/AdminUserForm';
import AdminVisitors from '@/pages/admin/AdminVisitors';
import AdminLeads from '@/pages/admin/AdminLeads';
import DetailLead from '@/pages/admin/DetailLead';
import AdminOperations from '@/pages/admin/AdminOperations';
import DetailOperation from '@/pages/admin/DetailOperation';
import AdminOperationsNew from '@/pages/admin/AdminOperationsNew';
import SettingsRolesPage from '@/pages/admin/settings/SettingsRolesPage';
import SettingsLeadStatusesPage from '@/pages/admin/settings/SettingsLeadStatusesPage';
import SettingsOperationStatusesPage from '@/pages/admin/settings/SettingsOperationStatusesPage';
import SettingsOrderStatusesPage from '@/pages/admin/settings/SettingsOrderStatusesPage';
import AuthCallback from '@/pages/AuthCallback';
import SignUp from '@/pages/SignUp';
import CookieConsent from '@/components/CookieConsent';
import { useVisitorTracking } from '@/hooks/useVisitorTracking';
import RequireAdmin from '@/components/admin/RequireAdmin';
import TopNotificationBar from '@/components/TopNotificationBar';
import FloatingCallButton from '@/components/FloatingCallButton';
import { useBanner } from '@/contexts/BannerContext';
import LoginDirect from '@/pages/LoginDirect';
import ScrollToTop from '@/components/ScrollToTop';
import '@/styles/global-design-system.css';

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

// Placeholder for role-specific dashboards
const CommercialDashboard = () => <div><h1>Dashboard Commercial</h1></div>;
const TechnicienDashboard = () => <div><h1>Dashboard Technicien</h1></div>;
const DefaultDashboard = () => <div><h1>Dashboard</h1></div>;


function App() {
  useVisitorTracking();

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/login-direct" element={<LoginDirect />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Generic dashboard route */}
        <Route path="/dashboard" element={<RequireAdmin><DefaultDashboard/></RequireAdmin>} />
        <Route path="/commercial/dashboard" element={<RequireAdmin><CommercialDashboard/></RequireAdmin>} />
        <Route path="/technicien/dashboard" element={<RequireAdmin><TechnicienDashboard/></RequireAdmin>} />
        
        <Route
          path="/admin/*"
          element={
            <RequireAdmin roles={['super_admin', 'admin']}>
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="/dashboard" element={<AdminDashboard />} />
                  <Route path="/products" element={<AdminProducts />} />
                  <Route path="/products/new" element={<AdminProductNew />} />
                  <Route path="/products/:id/edit" element={<AdminProductEdit />} />
                  <Route path="/categories" element={<AdminCategories />} />
                  <Route path="/fiches-cee" element={<AdminFichesCEE />} />
                  <Route path="/orders" element={<AdminOrders />} />
                  <Route path="/orders/:id" element={<AdminOrderDetail />} />
                  <Route path="/users" element={<AdminUsers />} />
                  <Route 
                    path="/users/:id" 
                    element={
                      <RequireAdmin roles={['super_admin', 'admin']}>
                        <DetailUtilisateur />
                      </RequireAdmin>
                    } 
                  />
                  <Route 
                    path="/users/:id/edit" 
                    element={
                      <RequireAdmin roles={['super_admin', 'admin']}>
                        <DetailUtilisateur />
                      </RequireAdmin>
                    } 
                  />
                  <Route 
                    path="/utilisateurs" 
                    element={
                      <RequireAdmin roles={['super_admin', 'admin']}>
                        <AdminUtilisateurs />
                      </RequireAdmin>
                    } 
                  />
                  <Route 
                    path="/utilisateurs/:id" 
                    element={
                      <RequireAdmin roles={['super_admin', 'admin']}>
                        <DetailUtilisateur />
                      </RequireAdmin>
                    } 
                  />
                  <Route 
                    path="/roles" 
                    element={<Navigate to="/admin/settings/roles" replace />}
                  />
                  <Route 
                    path="/settings/roles" 
                    element={
                      <RequireAdmin roles={['super_admin', 'admin']}>
                        <SettingsRolesPage />
                      </RequireAdmin>
                    } 
                  />
                  <Route 
                    path="/settings/lead-statuses" 
                    element={
                      <RequireAdmin roles={['super_admin', 'admin']}>
                        <SettingsLeadStatusesPage />
                      </RequireAdmin>
                    } 
                  />
                  <Route 
                    path="/settings/operation-statuses" 
                    element={
                      <RequireAdmin roles={['super_admin', 'admin']}>
                        <SettingsOperationStatusesPage />
                      </RequireAdmin>
                    } 
                  />
                  <Route 
                    path="/settings/order-statuses" 
                    element={
                      <RequireAdmin roles={['super_admin', 'admin']}>
                        <SettingsOrderStatusesPage />
                      </RequireAdmin>
                    } 
                  />
                  <Route path="/users/new" element={<AdminUserForm />} />
                  <Route path="/users/:id" element={<AdminUserForm />} />
                  <Route path="/visitors" element={<AdminVisitors />} />
                  <Route path="/leads" element={<AdminLeads />} />
                  <Route path="/leads/:id" element={<DetailLead />} />
                  <Route path="/operations" element={<AdminOperations />} />
                  <Route path="/operations/new" element={<AdminOperationsNew />} />
                  <Route path="/operations/:id" element={<DetailOperation />} />
                </Routes>
              </AdminLayout>
            </RequireAdmin>
          }
        />
        <Route
          path="/*"
          element={
            <MainLayout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/boutique" element={<Boutique />} />
                <Route path="/produit/:slug" element={<ProductDetail />} />
                <Route path="/panier" element={<Cart />} />
                <Route path="/prime-cee" element={<PrimeCEE />} />
                <Route path="/prime-cee/:slug" element={<FicheCEEDetail />} />
                <Route path="/formulaire-complet" element={<CEEEligibilityForm />} />
                <Route path="/merci" element={<ThankYou />} />
                <Route path="/a-propos" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/mentions-legales" element={<LegalNotice />} />
                <Route path="/cgv" element={<CGV />} />
                <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} /> {/* Add new route */}
                <Route path="/landing/deshumidificateur" element={<LandingDeshumidificateur />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </MainLayout>
          }
        />
      </Routes>
      <CookieConsent />
      <Toaster />
    </>
  );
}

export default App;