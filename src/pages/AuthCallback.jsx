import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';

function getParams() {
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const search = new URLSearchParams(window.location.search);
  
  const allParams = {};
  for (const [key, value] of hash.entries()) {
    allParams[key] = value;
  }
  for (const [key, value] of search.entries()) { // Fixed: changed 'value}' to 'value]'
    allParams[key] = value;
  }

  return {
    type: allParams.type,
    next: allParams.next || '/admin',
    accessToken: allParams.access_token,
    refreshToken: allParams.refresh_token,
  };
}

export default function AuthCallback() {
  const { type, next, accessToken, refreshToken } = useMemo(getParams, []);
  const [phase, setPhase] = useState('exchanging');
  const [error, setError] = useState(null);
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');

  useEffect(() => {
    (async () => {
      // Si on a les tokens dans l'URL (magic link, invite, recovery)
      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          setError(sessionError.message);
          setPhase('error');
          return;
        }

        if (type === 'invite' || type === 'recovery') {
          setPhase('needs_password');
        } else {
          setPhase('done');
          window.location.replace(next || '/admin');
        }
      } else {
         setError("Paramètres d'authentification manquants dans l'URL.");
         setPhase('error');
      }
    })();
  }, [type, next, accessToken, refreshToken]);

  const onSetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    if (!pwd || pwd.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères.');
      return;
    }
    if (pwd !== pwd2) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    
    // 1. Mettre à jour le mot de passe de l'utilisateur
    const { data: { user }, error: updateUserError } = await supabase.auth.updateUser({ password: pwd });

    if (updateUserError) {
      setError(updateUserError.message);
      return;
    }
    
    // 2. Synchroniser les informations dans la table utilisateurs (si ce n'est pas déjà fait par un trigger)
    // C'est une sécurité supplémentaire au cas où le trigger `handle_new_user` n'aurait pas pu insérer les métadonnées.
    if(user && type === 'invite') {
        const { data: profile, error: profileError } = await supabase
            .from('utilisateurs')
            .select('id')
            .eq('auth_user_id', user.id)
            .single();

        if (profileError && profileError.code === 'PGRST116') { // Si le profil n'existe pas
             await supabase.from('utilisateurs').insert({
                auth_user_id: user.id,
                email: user.email,
                prenom: user.user_metadata?.prenom || '',
                nom: user.user_metadata?.nom || '',
                role: user.user_metadata?.role || 'viewer',
                statut: 'actif'
            });
        }
    }

    // 3. Rediriger vers l'admin
    window.location.replace(next || '/admin');
  };

  if (phase === 'exchanging') {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-secondary-600 mb-4" />
          <p className="text-gray-600">Finalisation de la connexion...</p>
        </div>
    );
  }

  if (phase === 'needs_password') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8 bg-white rounded-2xl shadow-xl">
          <h1 className="text-2xl font-bold text-center mb-6">Définir votre mot de passe</h1>
          <form onSubmit={onSetPassword} className="space-y-4">
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              className="w-full border rounded-lg p-3"
              required
            />
            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={pwd2}
              onChange={(e) => setPwd2(e.target.value)}
              className="w-full border rounded-lg p-3"
              required
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button className="w-full bg-secondary-600 text-white rounded-lg px-4 py-3 font-semibold hover:bg-secondary-700 transition-colors">
                Valider et me connecter
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8 bg-white rounded-2xl shadow-xl text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Lien invalide ou expiré</h1>
          <p className="mb-6 text-gray-700">{error}</p>
          <a className="text-secondary-600 underline font-semibold" href="/admin/login">
            Retour à la connexion
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-secondary-600 mb-4" />
      <p className="text-gray-600">Redirection...</p>
    </div>
  );
}