import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Package, ShoppingCart, Users, LogOut, Activity, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/SupabaseAuthContext';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, signOut } = useAuth();

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

  const currentUser = profile || user;
  const userName = currentUser?.full_name || currentUser?.email || 'Utilisateur';
  const userInitial = (currentUser?.full_name || currentUser?.email || 'U').charAt(0).toUpperCase();
  const userAvatar = currentUser?.avatar_url || '';

  const navLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { href: '/admin/products', label: 'Produits', icon: Package },
    { href: '/admin/orders', label: 'Commandes', icon: ShoppingCart },
    { href: '/admin/leads', label: 'Leads', icon: FileText },
    { href: '/admin/users', label: 'Utilisateurs', icon: Users },
    { href: '/admin/visitors', label: 'Visiteurs', icon: Activity },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white flex-col hidden lg:flex">
      <div className="h-20 flex items-center justify-center border-b border-gray-700">
        <Link to="/admin/dashboard" className="flex items-center space-x-3">
           <img src="https://i.ibb.co/6rT1m18/logo-ecps.png" alt="Effinor Logo" className="h-10 w-auto" />
          <span className="text-xl font-bold">Effinor Admin</span>
        </Link>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className={`flex items-center px-4 py-2.5 rounded-lg transition-colors
              ${(location.pathname.startsWith(link.href))
                ? 'bg-gray-700 font-semibold' 
                : 'hover:bg-gray-800'
              }`}
          >
            <link.icon className="h-5 w-5 mr-3" />
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="px-4 py-6 border-t border-gray-700 space-y-4">
        <div className="flex items-center gap-3 px-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={userAvatar} alt={userName} />
              <AvatarFallback className="bg-gray-700 text-white font-bold">{userInitial}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
                <p id="user-name" className="text-sm font-semibold truncate">{userName}</p>
                <p className="text-xs text-gray-400 truncate">{currentUser?.role || 'Role'}</p>
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
    </aside>
  );
};

export default AdminSidebar;