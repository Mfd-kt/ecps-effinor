import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { logger } from '@/utils/logger';
import { sanitizeFormData } from '@/utils/sanitize';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { Label } from '@/components/ui/label.jsx';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const AdminUserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    role: 'viewer',
    active: true,
    photo_profil_url: '',
  });
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditing);
  const [isEmailValid, setIsEmailValid] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!isEditing) {
        setPageLoading(false);
        return;
    }
    setPageLoading(true);
    try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error || !data) {
            logger.error('Erreur:', error);
            throw new Error("Impossible de charger l'utilisateur.");
        }

        const userData = {
            prenom: data.prenom || '',
            nom: data.nom || '',
            full_name: data.full_name || '',
            email: data.email || '',
            role: data.role || 'viewer',
            active: data.active,
            photo_profil_url: data.avatar_url || '',
            created_at: data.created_at,
            updated_at: data.updated_at,
        };
        setFormData(userData);
        setInitialData(userData);
    } catch (error) {
        logger.error('Error fetching user:', error);
        toast({ 
          title: "Impossible de charger l'utilisateur", 
          description: "Une erreur est survenue lors du chargement des données. Veuillez réessayer ou contacter le support technique.",
          variant: "destructive" 
        });
        navigate('/admin/users');
    } finally {
        setPageLoading(false);
    }
  }, [id, isEditing, navigate, toast]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  
  useEffect(() => {
    if (!isEditing) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setIsEmailValid(emailRegex.test(formData.email || ''));
    }
  }, [formData.email, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name, checked) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleInviteUser = async () => {
    setLoading(true);
    logger.log('=== CRÉATION PROFIL UTILISATEUR ===');
    logger.log('Données:', formData);
    
    try {
      if (!formData.prenom || !formData.nom || !formData.email || !formData.role) {
          toast({ 
            title: "Erreur de validation", 
            description: "Veuillez remplir tous les champs obligatoires.", 
            variant: "destructive" 
          });
          return;
      }
      
      logger.log('Vérification email existant...');
      const { data: existing, error: checkError } = await supabase
          .from('profiles')
          .select('email')
          .eq('email', formData.email)
          .maybeSingle();

      if (checkError) throw checkError;
      
      if (existing) {
          toast({ 
            title: "Email déjà utilisé", 
            description: "Cet email est déjà utilisé par un autre utilisateur.", 
            variant: "destructive" 
          });
          return;
      }

      logger.log('Création du profil...');
      
      // Prepare and sanitize data before insertion
      const profileData = {
        email: formData.email,
        prenom: formData.prenom,
        nom: formData.nom,
        full_name: `${formData.prenom} ${formData.nom}`,
        role: formData.role,
        active: formData.active
      };
      const sanitizedProfileData = sanitizeFormData(profileData);
      
      const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .insert(sanitizedProfileData)
          .select()
          .single();
      
      if (profileError) throw profileError;
      
      logger.log('✅ Profil créé:', profile);

      toast({ 
        title: "✅ Profil créé avec succès !", 
        description: `Nom : ${formData.prenom} ${formData.nom}\nEmail : ${formData.email}\nRôle : ${formData.role}\n\n📧 IMPORTANT : Envoyez un email à l'utilisateur avec ces instructions :\n\n1. Aller sur : ${window.location.origin}/signup\n2. S'inscrire avec l'email : ${formData.email}\n3. Créer un mot de passe\n\nUne fois inscrit, l'utilisateur pourra se connecter au dashboard.`,
        duration: 10000
      });

      logger.log('=== FIN CRÉATION ===');
      navigate('/admin/users');

    } catch (error) {
      logger.error('❌ Erreur inattendue:', error);
      toast({ 
        title: "Impossible de créer le profil", 
        description: "Une erreur est survenue lors de la création du profil. Vérifiez que tous les champs sont correctement remplis et réessayez. Si le problème persiste, contactez le support technique.",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  }

  const handleUpdate = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
          // Prepare and sanitize data before update
          const updateData = {
              prenom: formData.prenom,
              nom: formData.nom,
              full_name: `${formData.prenom} ${formData.nom}`,
              avatar_url: formData.photo_profil_url,
              role: formData.role,
              active: formData.active,
          };
          const sanitizedUpdateData = sanitizeFormData(updateData);
          
          const { error } = await supabase.from('profiles').update(sanitizedUpdateData).eq('id', id);
          if (error) throw error;
          toast({ title: "Succès", description: "Utilisateur mis à jour." });
          fetchUser();
      } catch (error) {
          logger.error('Error updating user:', error);
          toast({ 
            title: "Impossible de mettre à jour l'utilisateur", 
            description: "Une erreur est survenue lors de la mise à jour. Vérifiez que tous les champs sont correctement remplis et réessayez.",
            variant: "destructive" 
          });
      } finally {
          setLoading(false);
      }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      handleUpdate(e);
    } else {
      handleInviteUser();
    }
  };

  if (pageLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-secondary-600" /></div>;
  }

  const isFormDirty = isEditing && JSON.stringify(formData) !== JSON.stringify(initialData);

  return (
    <>
      <Helmet><title>{isEditing ? 'Fiche Utilisateur' : 'Inviter un Utilisateur'} | Effinor Admin</title></Helmet>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
            <Link to="/admin/users"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
            {isEditing ? (
                 <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={formData.photo_profil_url} />
                        <AvatarFallback>{`${(formData.prenom || '').charAt(0)}${(formData.nom || '').charAt(0)}`}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{formData.full_name}</h1>
                        <p className="text-gray-500">{formData.email}</p>
                    </div>
                </div>
            ) : (
                <h1 className="text-3xl font-bold text-gray-900">Inviter un nouvel utilisateur</h1>
            )}
        </div>
        <form onSubmit={handleFormSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6">
                    <h2 className="text-xl font-semibold">Profil</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="prenom">Prénom</Label>
                        <Input id="prenom" name="prenom" value={formData.prenom} onChange={handleInputChange} placeholder="Jean" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nom">Nom</Label>
                        <Input id="nom" name="nom" value={formData.nom} onChange={handleInputChange} placeholder="Dupont" required />
                      </div>
                    </div>
                    {!isEditing &&
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="jean.dupont@email.com" required/>
                             <p className="text-sm text-gray-500">L'utilisateur devra s'inscrire avec cet email.</p>
                        </div>
                    }
                     {isEditing &&
                        <div className="space-y-2">
                            <Label htmlFor="photo_profil_url">URL de l'avatar</Label>
                            <Input id="photo_profil_url" name="photo_profil_url" value={formData.photo_profil_url} onChange={handleInputChange} placeholder="https://..." />
                        </div>
                    }
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6">
                    <h2 className="text-xl font-semibold">Rôle & Statut</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="space-y-2">
                            <Label htmlFor="role">Rôle</Label>
                            <Select name="role" value={formData.role} onValueChange={(v) => handleSelectChange('role', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="viewer">Viewer</SelectItem>
                                    <SelectItem value="support">Support</SelectItem>
                                    <SelectItem value="commercial">Commercial</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="super_admin">Super Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center space-x-2 pt-6">
                            <Switch id="active" name="active" checked={formData.active} onCheckedChange={(c) => handleSwitchChange('active', c)} />
                            <Label htmlFor="active">Statut : <span className="font-bold capitalize">{formData.active ? 'Actif' : 'Inactif'}</span></Label>
                        </div>
                    </div>
                </div>

                 <div className="flex justify-end pt-2">
                    {isEditing ? (
                        <Button type="submit" disabled={loading || !isFormDirty} className="bg-secondary-600 hover:bg-secondary-700">
                           {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Enregistrer
                        </Button>
                    ) : (
                        <Button type="submit" disabled={loading || !isEmailValid || !formData.prenom || !formData.nom} className="bg-secondary-600 hover:bg-secondary-700">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Créer le profil
                        </Button>
                    )}
                 </div>
            </div>
            {isEditing && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-lg space-y-4">
                        <h2 className="text-xl font-semibold">Métadonnées</h2>
                        <div className="text-sm space-y-2 text-gray-600">
                           <p><strong>ID:</strong> <span className="font-mono text-xs break-all">{id}</span></p>
                           <p><strong>Créé le:</strong> {formData.created_at ? new Date(formData.created_at).toLocaleString('fr-FR') : 'N/A'}</p>
                           <p><strong>Mis à jour le:</strong> {formData.updated_at ? new Date(formData.updated_at).toLocaleString('fr-FR') : 'N/A'}</p>
                        </div>
                    </div>
                     <div className="bg-white p-6 rounded-2xl shadow-lg space-y-4">
                        <h2 className="text-xl font-semibold text-red-600">Zone de danger</h2>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="w-full" disabled>
                              <Trash2 className="mr-2 h-4 w-4" />Supprimer l'utilisateur
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                La suppression d'un utilisateur est une action critique qui doit être effectuée depuis une fonction sécurisée. Cette fonction n'est pas encore implémentée.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                     </div>
                </div>
            )}
        </div>
        </form>
      </div>
    </>
  );
};

export default AdminUserForm;