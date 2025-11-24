import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, Save, Loader2, Calendar, Euro,
  FileText, Building, AlertCircle, Plus
} from 'lucide-react';
import { createOperation, STATUSES } from '@/lib/api/operations';
import { searchLeads } from '@/lib/api/leads';
import { supabase } from '@/lib/supabaseClient';

/**
 * Admin Operations CEE New Page
 * Create a new operation CEE with dynamic criteria form
 */
const AdminOperationsNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fichesCEE, setFichesCEE] = useState([]);
  const [leads, setLeads] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    fiche_cee_id: '',
    lead_id: '',
    statut: 'brouillon',
    prime_estimee: '',
    calcul_kwhc: ''
  });
  
  // Criteria state (dynamic based on fiche.criteria_definition)
  const [criteria, setCriteria] = useState([]);
  const [criteriaDefinition, setCriteriaDefinition] = useState([]);

  // Load fiches CEE for select
  useEffect(() => {
    const loadFiches = async () => {
      try {
        const { data, error } = await supabase
          .from('fiches_cee')
          .select('id, numero, slug, titre, criteria_definition')
          .eq('actif', true)
          .order('numero', { ascending: true });
        
        if (!error && data) {
          setFichesCEE(data || []);
        }
      } catch (error) {
        console.error('Error loading fiches CEE:', error);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de charger les fiches CEE.'
        });
      }
    };
    loadFiches();
  }, [toast]);

  // Load leads for select
  useEffect(() => {
    const loadLeads = async () => {
      try {
        const result = await searchLeads('', 100);
        if (result.success) {
          setLeads(result.data || []);
        }
      } catch (error) {
        console.error('Error loading leads:', error);
      }
    };
    loadLeads();
  }, []);

  // Handle fiche change - load criteria definition
  const handleFicheChange = (ficheId) => {
    if (!ficheId) {
      setCriteriaDefinition([]);
      setCriteria([]);
      return;
    }

    const selectedFiche = fichesCEE.find(f => f.id === ficheId);
    if (!selectedFiche) {
      setCriteriaDefinition([]);
      setCriteria([]);
      return;
    }

    try {
      if (selectedFiche.criteria_definition) {
        const def = typeof selectedFiche.criteria_definition === 'string'
          ? JSON.parse(selectedFiche.criteria_definition)
          : selectedFiche.criteria_definition;
        
        setCriteriaDefinition(Array.isArray(def) ? def : []);
        
        // Initialize criteria with empty values
        const initialCriteria = (Array.isArray(def) ? def : []).map(critDef => ({
          key: critDef.key,
          value: ''
        }));
        setCriteria(initialCriteria);
      } else {
        setCriteriaDefinition([]);
        setCriteria([]);
      }
    } catch (e) {
      console.error('Error parsing criteria_definition:', e);
      setCriteriaDefinition([]);
      setCriteria([]);
    }
  };

  // Handle criteria change
  const handleCriteriaChange = (key, value) => {
    setCriteria(prev => {
      const updated = prev.map(crit => 
        crit.key === key ? { ...crit, value } : crit
      );
      // If key doesn't exist, add it
      if (!updated.find(c => c.key === key)) {
        updated.push({ key, value });
      }
      return updated;
    });
  };

  // Handle save
  const handleSave = async () => {
    // Validation
    if (!formData.fiche_cee_id) {
      toast({
        variant: 'destructive',
        title: 'Champ requis',
        description: 'La fiche CEE est obligatoire.'
      });
      return;
    }

    // Validate required criteria
    const missingCriteria = criteriaDefinition
      .filter(critDef => critDef.required)
      .filter(critDef => {
        const crit = criteria.find(c => c.key === critDef.key);
        return !crit || !crit.value || crit.value.trim() === '';
      });

    if (missingCriteria.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Critères requis manquants',
        description: `Veuillez remplir les critères requis: ${missingCriteria.map(c => c.label || c.key).join(', ')}`
      });
      return;
    }

    setSaving(true);
    try {
      // Prepare criteria data
      const criteriaData = criteria
        .filter(c => c.key && c.key.trim() !== '')
        .map(c => {
          const critDef = criteriaDefinition.find(def => def.key === c.key);
          return {
            key: c.key.trim(),
            value: c.value === null || c.value === undefined ? null : String(c.value),
            type: critDef?.type || null,
            unit: critDef?.unit || null
          };
        });

      // Create operation
      const result = await createOperation({
        leadId: formData.lead_id || null,
        commandeId: null,
        ficheCeeId: formData.fiche_cee_id,
        statut: formData.statut,
        criteria: criteriaData,
        prime_estimee: formData.prime_estimee ? parseFloat(formData.prime_estimee) : null,
        calcul_kwhc: formData.calcul_kwhc ? parseFloat(formData.calcul_kwhc) : null
      });

      if (result.success) {
        toast({
          title: 'Opération créée',
          description: 'L\'opération CEE a été créée avec succès.'
        });
        navigate(`/admin/operations/${result.data.id}`);
      } else {
        throw new Error(result.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Error creating operation:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: `Impossible de créer l'opération: ${error.message}`
      });
    } finally {
      setSaving(false);
    }
  };

  // Render criteria field based on type
  const renderCriteriaField = (critDef) => {
    const fieldValue = criteria.find(c => c.key === critDef.key)?.value || '';

    switch (critDef.type) {
      case 'number':
        return (
          <Input
            type="number"
            value={fieldValue}
            onChange={(e) => handleCriteriaChange(critDef.key, e.target.value)}
            placeholder={critDef.unit ? `0 ${critDef.unit}` : '0'}
            step="any"
            required={critDef.required}
          />
        );
      
      case 'select':
        return (
          <Select
            value={fieldValue}
            onValueChange={(val) => handleCriteriaChange(critDef.key, val)}
            required={critDef.required}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              {critDef.options && Array.isArray(critDef.options) && critDef.options.length > 0 ? (
                critDef.options.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))
              ) : (
                <div className="text-sm text-gray-500 p-2">Aucune option disponible</div>
              )}
            </SelectContent>
          </Select>
        );
      
      case 'boolean':
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={fieldValue === 'true' || fieldValue === true}
              onCheckedChange={(checked) => handleCriteriaChange(critDef.key, checked ? 'true' : 'false')}
              required={critDef.required}
            />
            <label className="text-sm text-gray-700">
              {fieldValue === 'true' || fieldValue === true ? 'Oui' : 'Non'}
            </label>
          </div>
        );
      
      case 'text':
      default:
        return (
          <Input
            type="text"
            value={fieldValue}
            onChange={(e) => handleCriteriaChange(critDef.key, e.target.value)}
            placeholder={critDef.placeholder || ''}
            required={critDef.required}
          />
        );
    }
  };

  return (
    <>
      <Helmet>
        <title>Nouvelle Opération CEE | CRM Effinor</title>
      </Helmet>

      <div className="admin-page p-4 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/operations')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la liste
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Nouvelle Opération CEE</h1>
              <p className="text-gray-600 mt-1 text-sm">Créez une nouvelle opération CEE avec ses critères</p>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#22C55E] hover:bg-[#16a34a] text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Créer l'opération
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Infos générales */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Informations générales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Fiche CEE */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Fiche CEE <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.fiche_cee_id}
                      onValueChange={(value) => {
                        setFormData({ ...formData, fiche_cee_id: value });
                        handleFicheChange(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une fiche CEE" />
                      </SelectTrigger>
                      <SelectContent>
                        {fichesCEE.map(fiche => (
                          <SelectItem key={fiche.id} value={fiche.id}>
                            {fiche.numero} - {fiche.titre || fiche.slug}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Lead associé */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Lead associé
                    </label>
                    <Select
                      value={formData.lead_id || 'none'}
                      onValueChange={(value) => setFormData({ ...formData, lead_id: value === 'none' ? null : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Aucun lead associé" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucun lead associé</SelectItem>
                        {leads.map(lead => (
                          <SelectItem key={lead.id} value={lead.id}>
                            {lead.email || `${lead.prenom || ''} ${lead.nom || ''}`.trim() || lead.societe || lead.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Statut */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Statut
                    </label>
                    <Select
                      value={formData.statut}
                      onValueChange={(value) => setFormData({ ...formData, statut: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUSES).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Prime estimée */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-2">
                      <Euro className="h-4 w-4 text-gray-400" />
                      Prime estimée (€)
                    </label>
                    <Input
                      type="number"
                      value={formData.prime_estimee}
                      onChange={(e) => setFormData({ ...formData, prime_estimee: e.target.value })}
                      placeholder="0"
                      step="0.01"
                      min="0"
                    />
                  </div>

                  {/* Calcul kWhc */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Calcul kWhc
                    </label>
                    <Input
                      type="number"
                      value={formData.calcul_kwhc}
                      onChange={(e) => setFormData({ ...formData, calcul_kwhc: e.target.value })}
                      placeholder="0"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Critères techniques */}
            {formData.fiche_cee_id && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Critères techniques
                  </CardTitle>
                  <CardDescription>
                    {criteriaDefinition.length === 0
                      ? 'Cette fiche CEE n\'a pas de critères définis.'
                      : `Remplissez les ${criteriaDefinition.length} critère(s) technique(s) requis pour cette opération.`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {criteriaDefinition.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>Aucun critère défini pour cette fiche CEE.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {criteriaDefinition.map((critDef) => (
                        <div key={critDef.key} className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            {critDef.label || critDef.key}
                            {critDef.unit && (
                              <span className="text-xs text-gray-500">({critDef.unit})</span>
                            )}
                            {critDef.required && (
                              <span className="text-red-500">*</span>
                            )}
                          </label>
                          {renderCriteriaField(critDef)}
                          {critDef.description && (
                            <p className="text-xs text-gray-500">{critDef.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {!formData.fiche_cee_id && (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Sélectionnez une fiche CEE pour afficher les critères techniques.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-6">
            {/* Résumé */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Résumé
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Fiche CEE sélectionnée</p>
                  <p className="text-sm font-medium text-gray-900">
                    {fichesCEE.find(f => f.id === formData.fiche_cee_id)?.numero || 'Aucune'}
                  </p>
                </div>
                {formData.prime_estimee && (
                  <div>
                    <p className="text-xs text-gray-500">Prime estimée</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                        minimumFractionDigits: 0
                      }).format(parseFloat(formData.prime_estimee) || 0)}
                    </p>
                  </div>
                )}
                {criteriaDefinition.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500">Critères remplis</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {criteria.filter(c => c.value && c.value !== '').length} / {criteriaDefinition.length}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminOperationsNew;
