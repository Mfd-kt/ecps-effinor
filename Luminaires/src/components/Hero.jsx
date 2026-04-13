import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Building, Factory, MapPin, User, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { config } from '@/config';
import { submitLead, validateQualification, validateContact } from '@/services/leadService';
import { storeFormData } from '@/lib/formDataTransfer';

const Hero = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    buildingType: '',
    surfaceArea: '',
    postalCode: '',
    name: '',
    company: '',
    email: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelection = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNext = () => {
    // Validation avec Zod
    const validation = validateQualification({
      buildingType: formData.buildingType,
      surfaceArea: formData.surfaceArea,
      postalCode: formData.postalCode,
    });

    if (!validation.success) {
      const firstError = Object.values(validation.errors)[0];
      toast({
        title: 'Champs requis',
        description: firstError || 'Veuillez remplir tous les champs de qualification.',
        variant: 'destructive',
      });
      return;
    }

    if (step < 2) {
      setStep(step + 1);

      // Google Analytics tracking
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'form_step_1_complete', {
          event_category: 'form_luminaire_exterieur',
          event_label: 'qualification',
        });
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation avec Zod
    const validation = validateContact({
      name: formData.name,
      company: formData.company,
      email: formData.email,
      phone: formData.phone,
    });

    if (!validation.success) {
      const firstError = Object.values(validation.errors)[0];
      toast({
        title: 'Champs requis',
        description: firstError || 'Veuillez remplir tous les champs de contact.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    // Google Analytics tracking
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'form_submit_start', {
        event_category: 'form_luminaire_exterieur',
        event_label: 'contact',
      });
    }

    // Préparation des données
    const dataToSend = {
      ...formData,
      landing: 'landing_luminaire_exterieur',
      timestamp: new Date().toISOString(),
    };

    // Soumission via le service
    const result = await submitLead(dataToSend);

    // Gestion des résultats
    if (result.success) {
      // SUCCESS TOTAL
      toast({
        title: '✅ Demande enregistrée !',
        description: 'Vous allez être redirigé vers le formulaire technique.',
      });

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'conversion', {
          send_to: 'AW-XXXXX/XXXXX',
          value: 1.0,
          currency: 'EUR',
        });
        window.gtag('event', 'form_submit_success', {
          event_category: 'form_luminaire_exterieur',
          event_label: 'contact',
          method: 'supabase',
        });
      }

      // Stocker les données pour le formulaire complet (fallback)
      storeFormData(dataToSend);

      // L'URL de redirection est générée par le backend (Edge Function)
      const redirectUrl = result.redirectUrl || config.webhooks.redirect;

      // Reset form
      setFormData({
        buildingType: '',
        surfaceArea: '',
        postalCode: '',
        name: '',
        company: '',
        email: '',
        phone: '',
      });
      setStep(1);

      // Redirection fluide et immédiate vers l'URL générée par le backend
      // Utiliser replace() pour éviter d'ajouter à l'historique et rendre la transition plus fluide
      window.location.replace(redirectUrl);
    } else {
      // ÉCHEC
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'form_submit_error', {
          event_category: 'form_luminaire_exterieur',
          supabase_status: result.supabaseSuccess,
        });
      }

      toast({
        title: "Erreur d'envoi",
        description:
          "Impossible d'envoyer votre demande. Veuillez vérifier votre connexion ou nous contacter directement.",
        variant: 'destructive',
      });

      setIsSubmitting(false);
    }
  };

  const buildingTypes = ['Bureau', 'Commerce', 'Industrie', 'Entrepôt', 'Autre'];
  const surfaceAreas = ['< 100', '100-500', '500-1000', '1000-5000', '> 5000'];

  const progressPercentage = step === 1 ? 50 : 100;

  const formSteps = [
    {
      step: 1,
      title: 'Qualifiez votre projet en 30 secondes',
      icon: Building,
      content: (
        <div className="space-y-8 text-left">
          <div>
            <label className="flex items-center gap-2 text-lg font-medium text-blue-200 mb-4">
              <Building className="w-5 h-5 text-cyan-400" />
              Type de bâtiment
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {buildingTypes.map((type) => (
                <Button
                  key={type}
                  variant="outline"
                  className={`justify-start p-4 h-auto text-base font-semibold transition-all duration-300 transform-gpu hover:scale-105 hover:shadow-[0_0_20px_theme(colors.cyan.500/0.5)] rounded-lg flex items-center gap-3 ${
                    formData.buildingType === type
                      ? 'bg-gradient-to-br from-blue-800 to-cyan-800 border-cyan-500 text-white'
                      : 'bg-gradient-to-br from-blue-900/80 to-cyan-900/50 text-white border-white/20'
                  }`}
                  onClick={() => handleSelection('buildingType', type)}
                >
                  <Building className="w-4 h-4 opacity-70" /> {type}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-lg font-medium text-blue-200 mb-4">
              <Factory className="w-5 h-5 text-cyan-400" />
              Surface à éclairer (m²)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {surfaceAreas.map((area) => (
                <Button
                  key={area}
                  variant="outline"
                  className={`justify-start p-4 h-auto text-base font-semibold transition-all duration-300 transform-gpu hover:scale-105 hover:shadow-[0_0_20px_theme(colors.cyan.500/0.5)] rounded-lg flex items-center gap-3 ${
                    formData.surfaceArea === area
                      ? 'bg-gradient-to-br from-blue-800 to-cyan-800 border-cyan-500 text-white'
                      : 'bg-gradient-to-br from-blue-900/80 to-cyan-900/50 text-white border-white/20'
                  }`}
                  onClick={() => handleSelection('surfaceArea', area)}
                >
                  <Ruler className="w-4 h-4 opacity-70" /> {area}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-lg font-medium text-blue-200 mb-4">
              <MapPin className="w-5 h-5 text-cyan-400" />
              Code postal
            </label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              className="w-full px-5 py-4 border-2 border-white/20 bg-blue-900/50 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-white text-center text-xl placeholder:text-gray-400"
              placeholder="Ex: 75001"
              required
            />
          </div>

          <Button
            onClick={handleNext}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-semibold"
          >
            Suivant <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      ),
    },
    {
      step: 2,
      title: 'Finalisez votre demande',
      icon: User,
      content: (
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-1">
              Nom Prénom *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-blue-900/50 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-1">
              Société *
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-blue-900/50 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-blue-900/50 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-1">
              Téléphone *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-blue-900/50 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-white"
              required
            />
          </div>
          <div className="pt-2">
            <p className="flex items-center text-xs text-blue-300 mb-4">
              <input type="checkbox" checked readOnly className="mr-2" /> J'accepte
              la politique de confidentialité.
            </p>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 py-6 text-lg font-semibold"
            >
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma demande'}
            </Button>
          </div>
        </form>
      ),
    },
  ];

  const currentStepData = formSteps.find((s) => s.step === step);
  const CurrentIcon = currentStepData?.icon || Building;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Modernisez votre éclairage à{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-yellow-400">
                0 € de reste à charge
              </span>
            </h1>

            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Économisez jusqu'à 80% sur vos factures d'énergie grâce aux aides de
              l'État (CEE). Réponse d'éligibilité en 2 minutes !
            </p>

            <p className="text-xs font-semibold text-yellow-400 mb-6">
              Offre réservée aux bâtiments professionnels — vérifiez votre
              éligibilité avant la fin du mois.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-300">
                  ✓
                </div>
                <span className="font-semibold">Audit 100% gratuit</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-300">
                  ✓
                </div>
                <span className="font-semibold">Installation clé en main</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg border border-white/20">
                <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-300">
                  ✓
                </div>
                <span className="font-semibold">
                  Partenaire certifié CEE - Opérations financées par les pollueurs
                  obligés.
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-blue-950/80 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 text-white text-center"
          >
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2 text-sm">
                <span className="font-semibold">{`Étape ${step}/2`}</span>
                <span className="font-bold text-cyan-400">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <motion.div
                  className="bg-cyan-400 h-2 rounded-full"
                  initial={{ width: step === 1 ? '0%' : '50%' }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CurrentIcon className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-6">
                  {currentStepData.title}
                </h3>
                {currentStepData.content}
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex justify-between items-center">
              {step > 1 && (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="text-blue-300 hover:text-white"
                >
                  Précédent
                </Button>
              )}
              {step < 2 && <div />}
              <p className="text-xs text-blue-400">
                Sans engagement - Données 100% sécurisées
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
