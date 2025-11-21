import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Building, Square, Mail, Loader2, User, Phone, Lock, Zap } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { handleFormSubmission, validateEmail, validateFrenchPhone } from '@/utils/formUtils';
import { saveFormData } from '@/utils/formStorage';

const MiniEstimationForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: '',
    telephone: '',
    type_batiment: '',
    surface: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nom) newErrors.nom = 'Le nom complet est requis';
    if (!validateFrenchPhone(formData.telephone)) newErrors.telephone = 'Format de téléphone invalide';
    if (!formData.type_batiment) newErrors.type_batiment = 'Le type de bâtiment est requis';
    if (!formData.surface || formData.surface < 100) newErrors.surface = 'La surface doit être d\'au moins 100 m²';
    if (!validateEmail(formData.email)) newErrors.email = 'Format d\'email invalide';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast({ title: "Veuillez corriger les champs en rouge.", variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    const submissionData = {
      nom: formData.nom,
      telephone: formData.telephone,
      type_batiment: formData.type_batiment,
      surface_m2: Number(formData.surface),
      email: formData.email,
      source: 'hero_formulaire_accueil',
      statut: 'nouveau',
      priorite: 'normale',
      type: 'estimation',
      etape_formulaire: 'mini_form_completed',
      formulaire_complet: false,
    };

    const result = await handleFormSubmission(submissionData);

    if (result.success) {
      toast({
        title: '✅ Merci !',
        description: 'Nous préparons votre estimation. Continuez pour plus de précision.',
        className: 'bg-green-100 border-green-400 text-green-800',
        duration: 4000,
      });

      localStorage.setItem('current_lead_id', result.data.id);
      const dataToSave = {
        lead_id: result.data.id,
        nom: formData.nom,
        telephone: formData.telephone,
        type_batiment: formData.type_batiment,
        surface_m2: formData.surface,
        email: formData.email,
      }
      saveFormData(dataToSave);
      
      navigate('/formulaire-complet');
    } else {
      toast({ 
        title: 'Erreur lors de la soumission.',
        description: "Veuillez réessayer ou nous contacter directement.",
        variant: 'destructive' 
      });
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="card hero-form-card w-full max-w-lg mx-auto"
    >
      <div className="card-header">
        <div className="icon"><Zap size={48} /></div>
        <h3>Estimation gratuite en 24h</h3>
        <p>Combien pouvez-vous économiser avec les CEE ?</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className={`form-field ${errors.nom ? 'error' : ''}`}>
          <label htmlFor="nom"><User className="h-4 w-4 mr-2"/>Nom complet *</label>
          <input id="nom" name="nom" type="text" value={formData.nom} onChange={e => handleChange('nom', e.target.value)} placeholder="Jean Dupont" required aria-invalid={!!errors.nom} />
          {errors.nom && <span className="error-message">{errors.nom}</span>}
        </div>

        <div className={`form-field ${errors.telephone ? 'error' : ''}`}>
          <label htmlFor="telephone"><Phone className="h-4 w-4 mr-2"/>Téléphone *</label>
          <input id="telephone" name="telephone" type="tel" value={formData.telephone} onChange={e => handleChange('telephone', e.target.value)} placeholder="+33 6 XX XX XX XX" required aria-invalid={!!errors.telephone} />
          {errors.telephone && <span className="error-message">{errors.telephone}</span>}
        </div>

        <div className={`form-field ${errors.type_batiment ? 'error' : ''}`}>
          <label htmlFor="type_batiment"><Building className="h-4 w-4 mr-2"/>Type de bâtiment *</label>
          <select id="type_batiment" name="type_batiment" value={formData.type_batiment} onChange={e => handleChange('type_batiment', e.target.value)} required>
              <option value="" disabled>Sélectionner...</option>
              <option value="Entrepôt / Logistique">Entrepôt / Logistique</option>
              <option value="Bureau">Bureau</option>
              <option value="Usine / Production">Usine / Production</option>
              <option value="Commerce / Retail">Commerce / Retail</option>
              <option value="Autre">Autre</option>
          </select>
          {errors.type_batiment && <span className="error-message">{errors.type_batiment}</span>}
        </div>
        
        <div className={`form-field ${errors.surface ? 'error' : ''}`}>
          <label htmlFor="surface"><Square className="h-4 w-4 mr-2"/>Surface (m²) *</label>
          <input id="surface" name="surface" type="number" min="100" value={formData.surface} onChange={e => handleChange('surface', e.target.value)} placeholder="Ex: 1000" required aria-invalid={!!errors.surface} />
          {errors.surface && <span className="error-message">{errors.surface}</span>}
        </div>

        <div className={`form-field ${errors.email ? 'error' : ''}`}>
          <label htmlFor="email"><Mail className="h-4 w-4 mr-2"/>Email professionnel *</label>
          <input id="email" name="email" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} placeholder="votre.email@entreprise.fr" required aria-invalid={!!errors.email} />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>
        
        <div className="pt-2">
          <button id="submit-button" type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              '✨ Obtenir mon estimation gratuite'
            )}
          </button>
        </div>
      </form>

      <div className="text-center text-xs text-gray-500 mt-5 pt-5 border-t border-gray-200 space-y-1">
        <p className="flex items-center justify-center gap-1.5"><Lock className="h-3 w-3" /> Vos données sont sécurisées</p>
        <p className="flex items-center justify-center gap-1.5"><Zap className="h-3 w-3" /> Étude personnalisée sous 24h</p>
        <p className="flex items-center justify-center gap-1.5"><Phone className="h-3 w-3" /> Sans engagement</p>
      </div>
    </motion.div>
  );
};

export default MiniEstimationForm;