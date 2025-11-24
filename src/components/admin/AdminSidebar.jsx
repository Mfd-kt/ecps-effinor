import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Package, ShoppingCart, Users, LogOut, Activity, FileText, FolderOpen, FileCheck, Shield, Settings, ChevronDown, ChevronRight, Cog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabaseClient';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, signOut } = useAuth();
  const [userProfile, setUserProfile] = useState(null);

  // Load profile from utilisateurs table
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('utilisateurs')
          .select('*')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading profile:', error);
          return;
        }

        if (data) {
          setUserProfile(data);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, [user?.id]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Déconnexion réussie',
        description: 'Vous avez été déconnecté.',
      });
      navigate('/admin/login');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: `La déconnexion a échoué: ${error.message}`,
      });
    }
  };

  // Use profile from utilisateurs table, fallback to context profile or user
  const currentUser = userProfile || profile || user;
  const userName = currentUser?.full_name || currentUser?.email || 'Utilisateur';
  const userInitial = (currentUser?.full_name || currentUser?.email || 'U').charAt(0).toUpperCase();
  const userAvatar = currentUser?.photo_profil_url || currentUser?.avatar_url || '';

  // State for settings submenu - check if any settings page is active on mount
  const [settingsOpen, setSettingsOpen] = useState(() => {
    return location.pathname.startsWith('/admin/settings');
  });

  const navLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { href: '/admin/products', label: 'Produits', icon: Package },
    { href: '/admin/categories', label: 'Catégories', icon: FolderOpen },
    { href: '/admin/fiches-cee', label: 'Fiches CEE', icon: FileCheck },
    { href: '/admin/operations', label: 'Opérations CEE', icon: Settings },
    { href: '/admin/orders', label: 'Commandes', icon: ShoppingCart },
    { href: '/admin/leads', label: 'Leads', icon: FileText },
    { href: '/admin/users', label: 'Utilisateurs (Ancien)', icon: Users, adminOnly: false },
    { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users, adminOnly: true },
    { 
      href: '/admin/settings', 
      label: 'Réglages', 
      icon: Cog, 
      adminOnly: true,
      children: [
        { href: '/admin/settings/roles', label: 'Rôles & Permissions' },
        { href: '/admin/settings/lead-statuses', label: 'Statuts Leads' },
        { href: '/admin/settings/operation-statuses', label: 'Statuts Opérations CEE' },
        { href: '/admin/settings/order-statuses', label: 'Statuts Commandes' },
      ]
    },
    { href: '/admin/visitors', label: 'Visiteurs', icon: Activity },
  ];
  
  // Check admin status - use userProfile (from utilisateurs table) as primary source
  const userRole = userProfile?.role || profile?.role || currentUser?.role || localStorage.getItem('user_role');
  const isAdmin = userRole === 'admin' || userRole === 'super_admin';
  
  const filteredNavLinks = navLinks.filter(link => {
    if (link.adminOnly && !isAdmin) {
      return false;
    }
    return true;
  });

  // Update settings menu state when location changes
  useEffect(() => {
    const isSettingsActive = location.pathname.startsWith('/admin/settings');
    if (isSettingsActive && !settingsOpen) {
      setSettingsOpen(true);
    }
  }, [location.pathname]);

  return (
    <aside className="w-64 bg-gray-900 text-white flex-col hidden lg:flex fixed left-0 top-0 bottom-0 z-30 overflow-hidden">
      <div className="flex flex-col h-full">
        <div className="h-20 flex items-center justify-center border-b border-gray-700 flex-shrink-0">
        <Link to="/admin/dashboard" className="flex items-center space-x-3">
          <img 
            src="https://i.ibb.co/6rT1m18/logo-ecps.png" 
            alt="Effinor Logo" 
            className="h-10 w-auto" 
          />
          <span className="text-xl font-bold">Effinor Admin</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {filteredNavLinks.map((link) => {
          const isActive = location.pathname.startsWith(link.href);
          const hasChildren = link.children && link.children.length > 0;
          
          if (hasChildren) {
            // For settings menu, check if it's the settings link
            const isSettingsLink = link.href === '/admin/settings';
            const menuOpen = isSettingsLink ? settingsOpen : false;
            
            return (
              <div key={link.href}>
                <button
                  onClick={() => {
                    if (isSettingsLink) {
                      setSettingsOpen(!settingsOpen);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-gray-700 font-semibold' 
                      : 'hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center">
                    <link.icon className="h-5 w-5 mr-3" />
                    {link.label}
                  </div>
                  {menuOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                {menuOpen && link.children && (
                  <div className="ml-4 mt-1 space-y-1">
                    {link.children.map((child) => {
                      const isChildActive = location.pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          to={child.href}
                          className={`flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${
                            isChildActive
                              ? 'bg-gray-700 font-semibold'
                              : 'hover:bg-gray-800 text-gray-300'
                          }`}
                        >
                          <span className="ml-2">{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
          
          return (
            <Link
              key={link.href}
              to={link.href}
              className={`flex items-center px-4 py-2.5 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-gray-700 font-semibold' 
                  : 'hover:bg-gray-800'
              }`}
            >
              <link.icon className="h-5 w-5 mr-3" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-6 border-t border-gray-700 space-y-4">
        <div className="flex items-center gap-3 px-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback className="bg-gray-700 text-white font-bold">{userInitial}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p id="user-name" className="text-sm font-semibold truncate">{userName}</p>
            <p className="text-xs text-gray-400 truncate">{userRole || 'Role'}</p>
          </div>
        </div>

        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Déconnexion
        </Button>
        
        <Link
          to="/"
          className="flex items-center px-4 py-2.5 rounded-lg hover:bg-gray-800 text-sm text-gray-300"
        >
          <Home className="h-5 w-5 mr-3" />
          Retour au site public
        </Link>
      </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;