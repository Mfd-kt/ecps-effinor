import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, Save, Loader2, Calendar, Euro,
  FileText, Building, User, AlertCircle
} from 'lucide-react';
import { 
  getOperationById, 
  updateOperation, 
  updateOperationCriteria,
  STATUSES 
} from '@/lib/api/operations';
import { searchLeads } from '@/lib/api/leads';
import { supabase } from '@/lib/supabaseClient';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Operation CEE Detail Page
 * Edit operation with dynamic criteria form based on fiche criteria_definition
 */
const DetailOperation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [operation, setOperation] = useState(null);
  const [loading, setLoading] = useState(true);
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

  // Load operation
  const loadOperation = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const result = await getOperationById(id);
      if (result.success && result.data) {
        const op = result.data;
        setOperation(op);
        
        // Set form data
        setFormData({
          fiche_cee_id: op.fiche_cee_id || '',
          lead_id: op.lead_id || '',
          statut: op.statut || 'brouillon',
          prime_estimee: op.prime_estimee || '',
          calcul_kwhc: op.calcul_kwhc || ''
        });
        
        // Load criteria definition from fiche
        if (op.fiche?.criteria_definition) {
          try {
            const def = typeof op.fiche.criteria_definition === 'string' 
              ? JSON.parse(op.fiche.criteria_definition)
              : op.fiche.criteria_definition;
            setCriteriaDefinition(Array.isArray(def) ? def : []);
            
            // Initialize criteria values from existing criteria
            const criteriaMap = {};
            if (op.criteria && Array.isArray(op.criteria)) {
              op.criteria.forEach(crit => {
                criteriaMap[crit.key] = crit.value;
              });
            }
            
            // Set criteria state with values
            const criteriaWithValues = (Array.isArray(def) ? def : []).map(critDef => ({
              key: critDef.key,
              value: criteriaMap[critDef.key] || ''
            }));
            setCriteria(criteriaWithValues);
          } catch (e) {
            console.error('Error parsing criteria_definition:', e);
            setCriteriaDefinition([]);
            setCriteria([]);
          }
        } else {
          setCriteriaDefinition([]);
          setCriteria([]);
        }
      } else {
        throw new Error(result.error || 'Opération introuvable');
      }
    } catch (error) {
      console.error('Error loading operation:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: `Impossible de charger l'opération: ${error.message}`
      });
      navigate('/admin/operations');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    loadOperation();
  }, [loadOperation]);

  // Load fiches CEE for select
  useEffect(() => {
    const loadFiches = async () => {
      try {
        const { data, error } = await supabase
          .from('fiches_cee')
          .select('id, numero, slug, titre')
          .eq('actif', true)
          .order('numero', { ascending: true });
        
        if (!error && data) {
          setFichesCEE(data || []);
        }
      } catch (error) {
        console.error('Error loading fiches CEE:', error);
      }
    };
    loadFiches();
  }, []);

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

  // Handle fiche change - reload criteria definition
  const handleFicheChange = async (ficheId) => {
    if (!ficheId) {
      setCriteriaDefinition([]);
      setCriteria([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('fiches_cee')
        .select('criteria_definition')
        .eq('id', ficheId)
        .single();

      if (!error && data?.criteria_definition) {
        try {
          const def = typeof data.criteria_definition === 'string'
            ? JSON.parse(data.criteria_definition)
            : data.criteria_definition;
          setCriteriaDefinition(Array.isArray(def) ? def : []);
          
          // Initialize criteria with empty values
          const initialCriteria = (Array.isArray(def) ? def : []).map(critDef => ({
            key: critDef.key,
            value: ''
          }));
          setCriteria(initialCriteria);
        } catch (e) {
          console.error('Error parsing criteria_definition:', e);
          setCriteriaDefinition([]);
          setCriteria([]);
        }
      } else {
        setCriteriaDefinition([]);
        setCriteria([]);
      }
    } catch (error) {
      console.error('Error loading fiche criteria:', error);
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
    if (!operation) return;
    
    setSaving(true);
    try {
      // Update operation
      const updateResult = await updateOperation(operation.id, formData);
      if (!updateResult.success) {
        throw new Error(updateResult.error);
      }

      // Update criteria
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

      const criteriaResult = await updateOperationCriteria(operation.id, criteriaData);
      if (!criteriaResult.success) {
        throw new Error(criteriaResult.error);
      }

      toast({
        title: 'Opération sauvegardée',
        description: 'Les modifications ont été enregistrées avec succès.'
      });

      // Reload operation
      await loadOperation();
    } catch (error) {
      console.error('Error saving operation:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: `Impossible de sauvegarder: ${error.message}`
      });
    } finally {
      setSaving(false);
    }
  };

  // Format amount
  const formatAmount = (amount) => {
    if (!amount) return '';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy à HH:mm', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = STATUSES[status] || STATUSES.brouillon;
    const colorMap = {
      gray: 'bg-gray-100 text-gray-800 border-gray-300',
      blue: 'bg-blue-100 text-blue-800 border-blue-300',
      green: 'bg-green-100 text-green-800 border-green-300',
      red: 'bg-red-100 text-red-800 border-red-300',
      slate: 'bg-slate-100 text-slate-800 border-slate-300'
    };
    return colorMap[statusConfig.color] || colorMap.gray;
  };

  // Render criteria field based on type
  const renderCriteriaField = (critDef, value) => {
    const fieldValue = criteria.find(c => c.key === critDef.key)?.value || value || '';

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

  if (loading) {
    return (
      <div className="admin-page p-4 md:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#0EA5E9] mx-auto mb-4" />
            <p className="text-gray-600">Chargement de l'opération...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!operation) {
    return (
      <div className="admin-page p-4 md:p-8">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Opération introuvable</p>
          <Button onClick={() => navigate('/admin/operations')}>
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Opération CEE - {operation.fiche?.numero || 'Détail'} | CRM Effinor</title>
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
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Opération CEE - {operation.fiche?.numero || 'Sans fiche'}
                </h1>
                {operation.fiche?.slug && (
                  <p className="text-gray-600 mt-1 text-sm">{operation.fiche.slug}</p>
                )}
              </div>
              <Badge
                variant="outline"
                className={getStatusBadge(operation.statut)}
              >
                {STATUSES[operation.statut]?.label || operation.statut}
              </Badge>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#22C55E] hover:bg-[#16a34a] text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
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
                    {operation.lead && (
                      <p className="text-xs text-gray-500 mt-1">
                        {operation.lead.email || `${operation.lead.prenom || ''} ${operation.lead.nom || ''}`.trim()}
                      </p>
                    )}
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

                  {/* Date de création */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Date de création
                    </label>
                    <Input
                      type="text"
                      value={formatDate(operation.date_creation || operation.created_at)}
                      disabled
                      className="bg-gray-50"
                    />
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Critères techniques
                </CardTitle>
                <CardDescription>
                  {criteriaDefinition.length === 0
                    ? 'Aucun critère défini pour cette fiche CEE. Sélectionnez une fiche CEE pour charger ses critères.'
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
                        {renderCriteriaField(critDef, criteria.find(c => c.key === critDef.key)?.value)}
                        {critDef.description && (
                          <p className="text-xs text-gray-500">{critDef.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
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
                  <p className="text-xs text-gray-500">Prime estimée</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatAmount(operation.prime_estimee || 0)}
                  </p>
                </div>
                {operation.calcul_kwhc && (
                  <div>
                    <p className="text-xs text-gray-500">Calcul kWhc</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {operation.calcul_kwhc}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500">Critères remplis</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {criteria.filter(c => c.value && c.value !== '').length} / {criteriaDefinition.length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailOperation;
