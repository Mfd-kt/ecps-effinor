import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  PlusCircle, Edit, Trash2, Loader2, Eye, EyeOff, 
  FileText, X, ChevronLeft, ChevronRight, Download
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/utils/logger';
import { sanitizeFormData } from '@/utils/sanitize';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';

// Generate slug from titre
const generateSlug = (titre) => {
  if (!titre) return '';
  return titre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Construct file URL helper
const getFileUrl = (filePath) => {
  if (!filePath) return null;
  if (filePath.startsWith('http')) return filePath;
  if (filePath.startsWith('/')) return filePath;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl) {
    return `${supabaseUrl}/storage/v1/object/public/effinor-assets/${filePath}`;
  }
  return filePath;
};

const AdminFichesCEE = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [fiches, setFiches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingFiche, setEditingFiche] = useState(null);
  
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  const [formData, setFormData] = useState({
    numero: '',
    titre: '',
    slug: '',
    description: '',
    description_longue: '',
    secteur: 'Tous secteurs',
    montant_cee: '',
    unite: '€/unité',
    conditions: '',
    eligible_professionnels: true,
    eligible_particuliers: false,
    document_legal_pdf: null,
    image: null,
    date_debut: '',
    date_fin: '',
    actif: true,
    ordre: 0,
  });

  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const secteurs = ['Tous secteurs', 'Tertiaire', 'Industrie', 'Résidentiel', 'Agriculture'];

  // Fetch fiches with pagination
  const fetchFiches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      logger.log('📦 Chargement des fiches CEE...');
      
      // Get total count
      const { count } = await supabase
        .from('fiches_cee')
        .select('*', { count: 'exact', head: true });
      
      setTotalCount(count || 0);

      // Get paginated data
      const start = page * pageSize;
      const end = start + pageSize - 1;
      
      const { data, error: fetchError } = await supabase
        .from('fiches_cee')
        .select('*')
        .order('ordre', { ascending: true })
        .range(start, end);

      if (fetchError) throw fetchError;

      logger.log(`✅ ${data.length} fiches chargées`);
      setFiches(data || []);

    } catch (err) {
      logger.error('❌ Erreur chargement fiches CEE:', err);
      setError(err.message);
      toast({
        title: "Erreur de chargement",
        description: `Impossible de charger les fiches CEE: ${err.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, toast]);

  useEffect(() => {
    fetchFiches();
  }, [fetchFiches]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));

    // Auto-generate slug from titre
    if (name === 'titre' && !isSlugManuallyEdited) {
      setFormData(prev => ({ ...prev, slug: generateSlug(newValue) }));
    }
    
    if (name === 'slug') {
      setIsSlugManuallyEdited(true);
    }
  };

  // Handle PDF file selection
  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Type de fichier invalide",
          description: "Veuillez sélectionner un fichier PDF.",
          variant: "destructive"
        });
        return;
      }
      setPdfFile(file);
      setPdfPreview(null); // PDF preview not shown, just file name
    }
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Type de fichier invalide",
          description: "Veuillez sélectionner une image.",
          variant: "destructive"
        });
        return;
      }
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Remove files
  const handleRemovePdf = () => {
    setPdfFile(null);
    setFormData(prev => ({ ...prev, document_legal_pdf: null }));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: null }));
  };

  // Upload file to Supabase Storage
  const uploadFile = async (file, path) => {
    if (!file) return null;

    const fileName = `${Date.now()}-${generateSlug(file.name)}`;
    const filePath = `${path}/${fileName}`;
    const bucket = 'effinor-assets';

    try {
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type,
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      logger.error('❌ Erreur upload fichier:', error);
      throw error;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!formData.numero || !formData.titre || !formData.slug) {
        toast({
          title: "Champs requis manquants",
          description: "Le numéro, le titre et le slug sont obligatoires.",
          variant: "destructive"
        });
        setSaving(false);
        return;
      }

      let dataToSave = { ...formData };

      // Upload PDF if new file selected
      if (pdfFile) {
        const pdfUrl = await uploadFile(pdfFile, 'fiches-cee/pdf');
        dataToSave.document_legal_pdf = pdfUrl;
      }

      // Upload image if new file selected
      if (imageFile) {
        const imageUrl = await uploadFile(imageFile, 'fiches-cee/images');
        dataToSave.image = imageUrl;
      }

      // Convert empty date strings to null (required by PostgreSQL DATE type)
      if (dataToSave.date_debut === '' || !dataToSave.date_debut) {
        dataToSave.date_debut = null;
      }
      if (dataToSave.date_fin === '' || !dataToSave.date_fin) {
        dataToSave.date_fin = null;
      }

      // Convert montant_cee to number or null
      if (dataToSave.montant_cee === '' || dataToSave.montant_cee === null || dataToSave.montant_cee === undefined) {
        dataToSave.montant_cee = null;
      } else {
        const parsed = parseFloat(dataToSave.montant_cee);
        dataToSave.montant_cee = isNaN(parsed) ? null : parsed;
      }

      // Convert empty strings to null for optional text fields
      if (dataToSave.description === '') {
        dataToSave.description = null;
      }
      if (dataToSave.description_longue === '') {
        dataToSave.description_longue = null;
      }
      if (dataToSave.conditions === '') {
        dataToSave.conditions = null;
      }

      // Sanitize data
      const sanitizedData = sanitizeFormData(dataToSave);
      
      // Remove id from data if editing
      const { id, ...dataWithoutId } = sanitizedData;

      let savedData, error;
      if (editingFiche) {
        // Update
        logger.log('💾 Mise à jour fiche CEE:', editingFiche.id);
        ({ data: savedData, error } = await supabase
          .from('fiches_cee')
          .update(dataWithoutId)
          .eq('id', editingFiche.id)
          .select()
          .single());
      } else {
        // Insert
        logger.log('✨ Création nouvelle fiche CEE');
        ({ data: savedData, error } = await supabase
          .from('fiches_cee')
          .insert([dataWithoutId])
          .select()
          .single());
      }

      if (error) throw error;

      toast({
        title: "Succès !",
        description: `Fiche CEE ${editingFiche ? 'mise à jour' : 'créée'} avec succès !`
      });

      // Reset form
      resetForm();
      fetchFiches();

    } catch (err) {
      logger.error('❌ Erreur sauvegarde fiche CEE:', err);
      toast({
        title: "Erreur de sauvegarde",
        description: `La sauvegarde a échoué: ${err.message}`,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      numero: '',
      titre: '',
      slug: '',
      description: '',
      description_longue: '',
      secteur: 'Tous secteurs',
      montant_cee: '',
      unite: '€/unité',
      conditions: '',
      eligible_professionnels: true,
      eligible_particuliers: false,
      document_legal_pdf: null,
      image: null,
      date_debut: '',
      date_fin: '',
      actif: true,
      ordre: 0,
    });
    setEditingFiche(null);
    setPdfFile(null);
    setImageFile(null);
    setPdfPreview(null);
    setImagePreview(null);
    setIsSlugManuallyEdited(false);
    setShowForm(false);
  };

  // Edit fiche
  const handleEdit = (fiche) => {
    setEditingFiche(fiche);
    
    // Format dates for input fields (YYYY-MM-DD format required by HTML date input)
    const formatDateForInput = (dateValue) => {
      if (!dateValue) return '';
      try {
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
      } catch (e) {
        return '';
      }
    };
    
    setFormData({
      numero: fiche.numero || '',
      titre: fiche.titre || '',
      slug: fiche.slug || '',
      description: fiche.description || '',
      description_longue: fiche.description_longue || '',
      secteur: fiche.secteur || 'Tous secteurs',
      montant_cee: fiche.montant_cee || '',
      unite: fiche.unite || '€/unité',
      conditions: fiche.conditions || '',
      eligible_professionnels: fiche.eligible_professionnels !== undefined ? fiche.eligible_professionnels : true,
      eligible_particuliers: fiche.eligible_particuliers !== undefined ? fiche.eligible_particuliers : false,
      document_legal_pdf: fiche.document_legal_pdf || null,
      image: fiche.image || null,
      date_debut: formatDateForInput(fiche.date_debut),
      date_fin: formatDateForInput(fiche.date_fin),
      actif: fiche.actif !== undefined ? fiche.actif : true,
      ordre: fiche.ordre || 0,
    });
    setImagePreview(fiche.image ? getFileUrl(fiche.image) : null);
    setIsSlugManuallyEdited(true);
    setShowForm(true);
  };

  // Delete fiche
  const handleDelete = async (ficheId) => {
    try {
      const { error } = await supabase
        .from('fiches_cee')
        .delete()
        .eq('id', ficheId);

      if (error) throw error;

      toast({
        title: "Fiche CEE supprimée",
        description: "La fiche CEE a été supprimée avec succès."
      });

      fetchFiches();
    } catch (err) {
      logger.error('❌ Erreur suppression fiche CEE:', err);
      toast({
        title: "Erreur de suppression",
        description: `La suppression a échoué: ${err.message}`,
        variant: "destructive"
      });
    }
  };

  // Toggle active status
  const handleToggleStatus = async (ficheId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('fiches_cee')
        .update({ actif: !currentStatus })
        .eq('id', ficheId);

      if (error) throw error;

      toast({
        title: "Statut mis à jour",
        description: `La fiche CEE est maintenant ${!currentStatus ? 'active' : 'inactive'}.`
      });

      fetchFiches();
    } catch (err) {
      logger.error('❌ Erreur changement statut:', err);
      toast({
        title: "Erreur",
        description: `Impossible de changer le statut: ${err.message}`,
        variant: "destructive"
      });
    }
  };

  if (loading && fiches.length === 0) {
    return (
      <div className="admin-page p-4 md:p-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-secondary-500 mx-auto mb-4" />
            <p className="text-gray-600">Chargement des fiches CEE...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <>
      <Helmet>
        <title>Gestion des Fiches CEE | Effinor Admin</title>
      </Helmet>

      <div className="admin-page p-4 md:p-8">
        <div className="page-header">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Gestion des Fiches CEE</h1>
            <p className="text-gray-600 mt-1">
              {totalCount} fiche{totalCount > 1 ? 's' : ''} au total
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-secondary-500 hover:bg-secondary-600 text-white"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Ajouter une fiche CEE
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-red-600 text-2xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-red-900 font-bold text-lg mb-2">Erreur de chargement</h3>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => {
              if (e.target === e.currentTarget) resetForm();
            }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingFiche ? 'Modifier la fiche CEE' : 'Nouvelle fiche CEE'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-secondary-500" />
                      Informations de base
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Numéro (BAT-EQ-XXX) *
                        </label>
                        <Input
                          name="numero"
                          value={formData.numero}
                          onChange={handleInputChange}
                          required
                          placeholder="Ex: BAT-EQ-123"
                          className="w-full font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ordre d'affichage
                        </label>
                        <Input
                          type="number"
                          name="ordre"
                          value={formData.ordre}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Titre *
                        </label>
                        <Input
                          name="titre"
                          value={formData.titre}
                          onChange={handleInputChange}
                          required
                          placeholder="Ex: Isolation thermique des parois opaques"
                          className="w-full"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Slug (URL) *
                        </label>
                        <Input
                          name="slug"
                          value={formData.slug}
                          onChange={handleInputChange}
                          required
                          placeholder="Ex: isolation-thermique-parois-opaques"
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Généré automatiquement depuis le titre. Modifiez-le pour personnaliser.
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description (courte)
                        </label>
                        <Textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={3}
                          placeholder="Description courte de la fiche..."
                          className="w-full"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description longue
                        </label>
                        <Textarea
                          name="description_longue"
                          value={formData.description_longue}
                          onChange={handleInputChange}
                          rows={6}
                          placeholder="Description détaillée de la fiche..."
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sector & Amount */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Secteur & Montant CEE</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Secteur *
                        </label>
                        <Select
                          value={formData.secteur}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, secteur: value }))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {secteurs.map(secteur => (
                              <SelectItem key={secteur} value={secteur}>{secteur}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Montant CEE (€)
                        </label>
                        <Input
                          type="number"
                          name="montant_cee"
                          value={formData.montant_cee}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Unité
                        </label>
                        <Input
                          name="unite"
                          value={formData.unite}
                          onChange={handleInputChange}
                          placeholder="€/unité"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Conditions & Eligibility */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Conditions & Éligibilité</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Conditions d'éligibilité
                        </label>
                        <Textarea
                          name="conditions"
                          value={formData.conditions}
                          onChange={handleInputChange}
                          rows={4}
                          placeholder="Conditions à remplir pour être éligible..."
                          className="w-full"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="eligible_professionnels"
                            checked={formData.eligible_professionnels}
                            onCheckedChange={(checked) => 
                              handleInputChange({ target: { name: 'eligible_professionnels', checked, type: 'checkbox' } })
                            }
                          />
                          <label htmlFor="eligible_professionnels" className="text-sm font-medium text-gray-700">
                            Éligible aux professionnels
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="eligible_particuliers"
                            checked={formData.eligible_particuliers}
                            onCheckedChange={(checked) => 
                              handleInputChange({ target: { name: 'eligible_particuliers', checked, type: 'checkbox' } })
                            }
                          />
                          <label htmlFor="eligible_particuliers" className="text-sm font-medium text-gray-700">
                            Éligible aux particuliers
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Dates de validité</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date de début
                        </label>
                        <Input
                          type="date"
                          name="date_debut"
                          value={formData.date_debut}
                          onChange={handleInputChange}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date de fin
                        </label>
                        <Input
                          type="date"
                          name="date_fin"
                          value={formData.date_fin}
                          onChange={handleInputChange}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Files */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Fichiers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Document légal (PDF)
                        </label>
                        {formData.document_legal_pdf && !pdfFile && (
                          <div className="mb-2 flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <FileText className="w-5 h-5 text-secondary-500" />
                            <a
                              href={getFileUrl(formData.document_legal_pdf)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-secondary-600 hover:underline flex-1"
                            >
                              Document actuel
                            </a>
                            <button
                              type="button"
                              onClick={handleRemovePdf}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        <Input
                          type="file"
                          accept="application/pdf"
                          onChange={handlePdfChange}
                          className="w-full"
                        />
                        {pdfFile && (
                          <p className="text-xs text-gray-500 mt-1">
                            Fichier sélectionné: {pdfFile.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Image
                        </label>
                        {imagePreview && (
                          <div className="mb-4 relative inline-block">
                            <img
                              src={imagePreview}
                              alt="Aperçu"
                              className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                    <Checkbox
                      id="actif"
                      checked={formData.actif}
                      onCheckedChange={(checked) => 
                        handleInputChange({ target: { name: 'actif', checked, type: 'checkbox' } })
                      }
                    />
                    <label htmlFor="actif" className="text-sm font-medium text-gray-700">
                      Fiche active
                    </label>
                  </div>

                  <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-secondary-500 hover:bg-secondary-600 text-white"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          {editingFiche ? 'Mettre à jour' : 'Créer la fiche'}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Fiches Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Numéro</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Titre</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Secteur</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Montant CEE</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fiches.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Aucune fiche CEE créée pour le moment.</p>
                      <p className="text-sm mt-2">Cliquez sur "Ajouter une fiche CEE" pour commencer.</p>
                    </td>
                  </tr>
                ) : (
                  fiches.map((fiche) => (
                    <tr key={fiche.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 font-mono">{fiche.numero}</code>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{fiche.titre}</div>
                        {fiche.description && (
                          <p className="text-xs text-gray-600 mt-1 truncate max-w-xs">{fiche.description}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-xs">
                          {fiche.secteur}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {fiche.montant_cee ? (
                          <span className="text-secondary-600 font-semibold">
                            {fiche.montant_cee} {fiche.unite || '€/unité'}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-600">
                          {fiche.date_debut && (
                            <div>Début: {new Date(fiche.date_debut).toLocaleDateString('fr-FR')}</div>
                          )}
                          {fiche.date_fin && (
                            <div>Fin: {new Date(fiche.date_fin).toLocaleDateString('fr-FR')}</div>
                          )}
                          {!fiche.date_debut && !fiche.date_fin && (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          variant={fiche.actif ? "default" : "secondary"}
                          className={fiche.actif ? "bg-secondary-500" : "bg-gray-400"}
                        >
                          {fiche.actif ? 'Actif' : 'Inactif'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleStatus(fiche.id, fiche.actif)}
                            title={fiche.actif ? "Désactiver" : "Activer"}
                          >
                            {fiche.actif ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(fiche)}
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette fiche CEE ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action est irréversible. La fiche CEE "{fiche.numero} - {fiche.titre}" sera définitivement supprimée.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(fiche.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {page + 1} sur {totalPages} ({totalCount} fiches)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(prev => Math.max(0, prev - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={page >= totalPages - 1}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminFichesCEE;

