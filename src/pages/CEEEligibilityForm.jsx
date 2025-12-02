import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { loadFormData, clearFormData, saveFormData } from '@/utils/formStorage';
import { calculateCEEPotential } from '@/utils/ceeCalculations';
import { logger } from '@/utils/logger';
import { sanitizeFormData } from '@/utils/sanitize';
import { updateLead } from '@/lib/api/leads';
import { useDebounce } from '@/hooks/useDebounce';
import ProgressBar from '@/components/cee/ProgressBar';
import FormNavigation from '@/components/cee/FormNavigation';
import Step1CompanyInfo from '@/components/cee/steps/Step1CompanyInfo';
import Step2MainContact from '@/components/cee/steps/Step2MainContact';
import Step3EnergyExpenses from '@/components/cee/steps/Step3EnergyExpenses';
import Step4BuildingCount from '@/components/cee/steps/Step4BuildingCount';
import Step5BuildingDetails from '@/components/cee/steps/Step5BuildingDetails';
import Step6AdditionalRemarks from '@/components/cee/steps/Step6AdditionalRemarks';

const TOTAL_STEPS = 6;

const CEEEligibilityForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [currentBuildingIndex, setCurrentBuildingIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    step1: {},
    step2: {},
    step3: {},
    step4: {},
    buildings: [],
    step6: {}
  });

  // Debounced form data for auto-save
  const debouncedFormData = useDebounce(formData, 2000); // 2 secondes de délai
  const savingRef = useRef(false);

  // Fonction pour sauvegarder le progrès du formulaire
  const saveFormProgress = useCallback(async (dataToSave = null) => {
    const leadId = localStorage.getItem('current_lead_id');
    if (!leadId || savingRef.current) return;

    const data = dataToSave || formData;
    savingRef.current = true;

    try {
      // Préparer formulaire_data JSONB avec toutes les données
      const formulaireData = {
        step1: data.step1 || {},
        step2: data.step2 || {},
        step3: data.step3 || {},
        step4: data.step4 || {},
        buildings: data.buildings || [],
        step6: data.step6 || {},
      };

      // Si on a assez de données, calculer le potentiel CEE
      if (data.buildings && data.buildings.length > 0) {
        try {
          const ceePotential = calculateCEEPotential(data);
          formulaireData.ceePotential = ceePotential;
        } catch (e) {
          // Pas grave si le calcul échoue, on continue sans
        }
      }

      // Préparer les données de mise à jour
      const updateData = {
        formulaire_data: JSON.stringify(formulaireData),
        etape_formulaire: `step${currentStep}`,
      };

      // Mapper aussi vers les colonnes si données disponibles
      if (data.step1?.companyName) {
        updateData.societe = data.step1.companyName;
      }
      if (data.step1?.siret) {
        updateData.siret = data.step1.siret;
      }
      if (data.step1?.address && data.step1?.postalCode && data.step1?.city) {
        updateData.adresse = `${data.step1.address}, ${data.step1.postalCode} ${data.step1.city}`;
        updateData.code_postal = data.step1.postalCode;
        updateData.ville = data.step1.city;
      }
      if (data.step2?.firstName || data.step2?.lastName) {
        updateData.nom = `${data.step2.firstName || ''} ${data.step2.lastName || ''}`.trim();
        updateData.prenom = data.step2.firstName || '';
      }
      if (data.step2?.email) {
        updateData.email = data.step2.email;
      }
      if (data.step2?.phone) {
        updateData.telephone = data.step2.phone;
      }
      if (data.step2?.position) {
        updateData.poste = data.step2.position;
      }
      if (data.step3?.energyExpenses) {
        updateData.consommation_annuelle = data.step3.energyExpenses;
      }
      if (data.buildings && data.buildings.length > 0) {
        updateData.type_batiment = data.buildings.map(b => b.type).filter(Boolean).join(', ');
        const totalSurface = data.buildings.reduce((sum, b) => sum + (parseFloat(b.surface) || 0), 0);
        if (totalSurface > 0) {
          updateData.surface_m2 = totalSurface;
        }
      }
      if (data.step6?.remarks) {
        updateData.message = data.step6.remarks;
      }

      // Sanitize avant sauvegarde
      const sanitizedUpdateData = sanitizeFormData(updateData);

      // Sauvegarder dans la base de données
      const result = await updateLead(leadId, sanitizedUpdateData);
      
      if (result.success) {
        // Sauvegarde silencieuse - pas de toast pour éviter de déranger l'utilisateur
        // Un indicateur visuel discret pourrait être ajouté si nécessaire
      }
    } catch (error) {
      logger.error('Error saving form progress:', error);
      // Ne pas afficher d'erreur pour la sauvegarde progressive (pour éviter de perturber l'utilisateur)
    } finally {
      savingRef.current = false;
    }
  }, [formData, currentStep]);

  // Auto-save après debounce
  useEffect(() => {
    const leadId = localStorage.getItem('current_lead_id');
    if (!leadId || !debouncedFormData) return;

    // Vérifier si on a au moins une étape commencée
    const hasData = Object.keys(debouncedFormData).some(key => {
      if (key === 'buildings') {
        return debouncedFormData.buildings && debouncedFormData.buildings.length > 0;
      }
      return debouncedFormData[key] && Object.keys(debouncedFormData[key]).length > 0;
    });

    if (hasData && currentStep > 1) {
      saveFormProgress(debouncedFormData);
    }
  }, [debouncedFormData, currentStep, saveFormProgress]);

  useEffect(() => {
    const savedData = loadFormData();
    if (savedData) {
      const nameParts = savedData.nom ? savedData.nom.split(' ') : ['', ''];
      const firstName = nameParts.slice(0, -1).join(' ') || nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(-1)[0] : '';

      const prefilledData = {
        ...formData,
        step2: {
          ...formData.step2,
          firstName: firstName,
          lastName: lastName,
          email: savedData.email || '',
          phone: savedData.telephone || '',
        },
        step4: {
          buildingCount: 1,
        },
        buildings: [{
          type: savedData.type_batiment?.toLowerCase().replace(/ /g, '_').replace('/', '_') || 'warehouse',
          surface: savedData.surface_m2 || '',
        }],
      };
      
      setFormData(prefilledData);
      saveFormData(prefilledData);

      toast({
        title: "Informations pré-remplies",
        description: "Continuez à remplir le formulaire pour une estimation précise.",
      });
    }
  }, []);

  const handleStepChange = (step, field, value) => {
    const updatedData = { ...formData, [step]: { ...formData[step], [field]: value } };
    setFormData(updatedData);
    saveFormData(updatedData);
  };

  const handleBuildingChange = (index, field, value) => {
    const updatedBuildings = [...formData.buildings];
    updatedBuildings[index] = { ...updatedBuildings[index], [field]: value };
    const updatedData = { ...formData, buildings: updatedBuildings };
    setFormData(updatedData);
    saveFormData(updatedData);
  };

  const handleNext = async () => {
    // Sauvegarder avant de passer à l'étape suivante
    if (currentStep >= 1) {
      await saveFormProgress();
    }

    if (currentStep === 4) {
      const buildingCount = formData.step4.buildingCount || 1;
      const buildings = Array.from({ length: buildingCount }, (_, i) => formData.buildings[i] || {});
      setFormData({ ...formData, buildings });
      setCurrentBuildingIndex(0);
      setCurrentStep(5);
    } else if (currentStep === 5) {
      if (currentBuildingIndex < (formData.step4.buildingCount || 1) - 1) {
        setCurrentBuildingIndex(currentBuildingIndex + 1);
      } else {
        setCurrentStep(6);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevious = () => {
    if (currentStep === 5 && currentBuildingIndex > 0) {
      setCurrentBuildingIndex(currentBuildingIndex - 1);
    } else {
      setCurrentStep(currentStep - 1);
    }
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const leadId = localStorage.getItem('current_lead_id');

    if (!leadId) {
      toast({ title: "Erreur", description: "ID de prospect manquant.", variant: "destructive" });
      setIsSubmitting(false);
      navigate('/');
      return;
    }

    try {
      const ceePotential = calculateCEEPotential(formData);
      // Préparer formulaire_data JSONB
      const formulaireData = {
        step1: formData.step1,
        step2: formData.step2,
        step3: formData.step3,
        step4: formData.step4,
        buildings: formData.buildings,
        step6: formData.step6,
        ceePotential,
      };

      const updateData = {
        societe: formData.step1.companyName,
        siret: formData.step1.siret,
        adresse: `${formData.step1.address}, ${formData.step1.postalCode} ${formData.step1.city}`,
        nom: `${formData.step2.firstName} ${formData.step2.lastName}`,
        telephone: formData.step2.phone,
        email: formData.step2.email,
        poste: formData.step2.position,
        consommation_annuelle: formData.step3.energyExpenses,
        type_batiment: formData.buildings.map(b => b.type).join(', '),
        surface_m2: formData.buildings.reduce((sum, b) => sum + (parseFloat(b.surface) || 0), 0),
        message: formData.step6.remarks || '',
        products: JSON.stringify({ ...formData, ceePotential }),
        formulaire_data: JSON.stringify(formulaireData), // Sauvegarde complète dans JSONB
        montant_cee_estime: ceePotential.totalPotential,
        notes_techniques: `Potentiel LED: ${ceePotential.ledPotential}€, Potentiel Chauffage: ${ceePotential.heatingPotential}€, Classification: ${ceePotential.classification}`,
        formulaire_complet: true,
        etape_formulaire: 'complet',
        statut: 'devis_a_preparer',
      };

      // Sanitize data before update to prevent XSS attacks
      const sanitizedUpdateData = sanitizeFormData(updateData);

      const { error } = await supabase.from('leads').update(sanitizedUpdateData).eq('id', leadId);
      if (error) throw error;

      clearFormData();
      localStorage.removeItem('current_lead_id');
      toast({ title: "✅ Demande complète envoyée !", description: "Notre équipe vous recontactera." });
      navigate('/merci', { state: { leadId, ceePotential, companyName: formData.step1.companyName } });
    } catch (error) {
      logger.error('Error updating lead:', error);
      toast({ title: "Erreur", description: "Une erreur est survenue.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1CompanyInfo data={formData.step1} onChange={(f, v) => handleStepChange('step1', f, v)} errors={errors} />;
      case 2: return <Step2MainContact data={formData.step2} onChange={(f, v) => handleStepChange('step2', f, v)} errors={errors} />;
      case 3: return <Step3EnergyExpenses data={formData.step3} onChange={(f, v) => handleStepChange('step3', f, v)} errors={errors} />;
      case 4: return <Step4BuildingCount data={formData.step4} onChange={(f, v) => handleStepChange('step4', f, v)} errors={errors} />;
      case 5: return <Step5BuildingDetails buildingIndex={currentBuildingIndex} totalBuildings={formData.step4.buildingCount || 1} data={formData.buildings[currentBuildingIndex] || {}} onChange={(f, v) => handleBuildingChange(currentBuildingIndex, f, v)} errors={errors} />;
      case 6: return <Step6AdditionalRemarks data={formData.step6} onChange={(f, v) => handleStepChange('step6', f, v)} ceePotential={calculateCEEPotential(formData)} />;
      default: return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Finalisez votre demande de devis | EFFINOR</title>
        <meta name="description" content="Complétez les informations sur votre projet pour obtenir une estimation précise et un devis personnalisé pour vos luminaires LED professionnels." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12 pt-32">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="card">
              <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
              <div className="mt-8">{renderStep()}</div>
              <FormNavigation currentStep={currentStep} totalSteps={TOTAL_STEPS} onPrevious={handlePrevious} onNext={handleNext} onSubmit={handleSubmit} isValid={true} isSubmitting={isSubmitting} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CEEEligibilityForm;