import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { logger } from '@/utils/logger';
import { Loader2 } from 'lucide-react';

const errorMessages = {
  'invalid_credentials': "Email ou mot de passe incorrect.",
  'user_not_found': "Cet email n'existe pas dans notre base de données.",
  'user_banned': "Votre compte a été désactivé.",
  'too_many_requests': "Trop de tentatives. Veuillez réessayer dans quelques minutes.",
  'network_error': "Erreur de connexion. Vérifiez votre connexion internet.",
  'profile_not_found': "Profil utilisateur non configuré. Contactez un administrateur.",
  'account_inactive': "Votre compte est désactivé. Veuillez contacter le support.",
  'account_suspended': "Votre compte a été suspendu. Veuillez contacter le support.",
  'generic_error': "Une erreur inattendue est survenue. Veuillez réessayer.",
};

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const displayError = (messageKey) => {
    const message = errorMessages[messageKey] || errorMessages['generic_error'];
    setErrorMsg(message);
    logger.error('Login Error:', message);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // 1. Input Validation
    if (!email.trim() || !password) {
      displayError(!email.trim() ? 'Veuillez saisir votre email.' : 'Veuillez saisir votre mot de passe.');
      setLoading(false);
      return;
    }

    try {
      // 2. Authentication
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        // Map Supabase auth errors to our custom messages
        if (authError.message.includes('Invalid login credentials')) {
          displayError('invalid_credentials');
        } else {
          displayError('generic_error');
        }
        setPassword(''); // Clear password field on error
        throw authError;
      }
      
      // 3. Load User Profile from 'utilisateurs'
      const { data: profile, error: profileError } = await supabase
        .from('utilisateurs')
        .select('*')
        .eq('auth_user_id', authData.user.id)
        .maybeSingle();

      if (profileError) {
        displayError('generic_error');
        await supabase.auth.signOut();
        throw profileError;
      }
      
      // 4. Validate Profile
      if (!profile) {
        displayError('profile_not_found');
        await supabase.auth.signOut();
        return;
      }
      
      // 5. Check Account Status
      if (!profile.active) {
        displayError('account_inactive');
        await supabase.auth.signOut();
        return;
      }
      
      if (profile.statut_emploi === 'suspendu') {
        displayError('account_suspended');
        await supabase.auth.signOut();
        return;
      }

      // 6. Success and Redirect
      logger.log(`Login successful for ${profile.full_name || profile.email}`);
      toast({ title: 'Connexion réussie !', description: `Bienvenue, ${profile.full_name || profile.email}` });
      
      // Optional: Store user info
      localStorage.setItem('user_id', profile.id);
      localStorage.setItem('user_email', profile.email);
      localStorage.setItem('user_name', profile.full_name);
      localStorage.setItem('user_role', profile.role);

      // Redirect based on role
      switch (profile.role) {
        case 'super_admin':
        case 'admin':
          navigate('/admin/dashboard', { replace: true });
          break;
        case 'commercial':
          navigate('/commercial/dashboard', { replace: true });
          break;
        case 'technicien':
          navigate('/technicien/dashboard', { replace: true });
          break;
        default:
          navigate('/dashboard', { replace: true });
      }

    } catch (error) {
       // Errors are handled and displayed inside the try block
       // This catch is for any truly unexpected issues
       if (!errorMsg) {
         displayError('generic_error');
       }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Connexion | Effinor Admin</title></Helmet>
      <div className="login-page">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <img alt="Logo Effinor" className="mx-auto h-12 w-auto mb-4" src="https://i.ibb.co/6rT1m18/logo-ecps.png" />
              <h1>Connexion</h1>
              <p>Accédez à votre espace de gestion</p>
            </div>
            
            {errorMsg && (
              <div id="error-message" className="error-alert">
                <span className="error-icon" role="img" aria-label="error icon">❌</span>
                <span id="error-text">{errorMsg}</span>
              </div>
            )}
            
            <form id="login-form" onSubmit={handleLogin} noValidate>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  placeholder="votre.email@effinor.fr"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Mot de passe</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <div className="form-remember">
                <input type="checkbox" id="remember" name="remember" />
                <label htmlFor="remember">Se souvenir de moi</label>
              </div>
              
              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Se connecter'}
                {loading && 'Connexion...'}
              </button>
            </form>
            
            <div className="login-footer">
              <Link to="/forgot-password">Mot de passe oublié ?</Link>
              <span className="divider">•</span>
              <Link to="/signup">Créer un compte</Link>
            </div>
          </div>
          
          <div className="login-info">
            <h2>Bienvenue chez Effinor</h2>
            <p>Gérez vos projets LED et vos devis en toute simplicité.</p>
            <ul className="info-list">
              <li>✅ Gestion complète des projets</li>
              <li>✅ Suivi des devis en temps réel</li>
              <li>✅ Accès aux ressources techniques</li>
              <li>✅ Support personnalisé</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;