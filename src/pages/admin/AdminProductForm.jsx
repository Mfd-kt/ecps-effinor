import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast.js';
import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/utils/logger';
import { sanitizeFormData } from '@/utils/sanitize';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Loader2, Upload, Trash2, ImagePlus } from 'lucide-react';

const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

const ImageUploadPreview = ({ label, currentUrl, onFileChange, onRemove, fieldName }) => {
  const [preview, setPreview] = useState(currentUrl);

  useEffect(() => {
    if (currentUrl && (!preview || !preview.startsWith('blob:'))) {
      setPreview(currentUrl);
    } else if (!currentUrl) {
      setPreview(null);
    }
  }, [currentUrl, preview]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newPreviewUrl = URL.createObjectURL(file);
      setPreview(newPreviewUrl);
      onFileChange(e);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onRemove(fieldName, currentUrl);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="w-full h-40 border-2 border-dashed rounded-lg flex justify-center items-center relative bg-gray-50">
        {preview ? (
          <>
            <img src={preview} alt="Aperçu" className="max-h-full max-w-full object-contain rounded-md" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-7 w-7"
              onClick={handleRemove}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <div className="text-center text-gray-400">
            <ImagePlus className="mx-auto h-10 w-10 mb-2" />
            <span className="text-sm">Aucune image</span>
          </div>
        )}
      </div>
      <Input
        type="file"
        name={fieldName}
        accept="image/*"
        onChange={handleFileChange}
        className="mt-2"
      />
    </div>
  );
};

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    nom: '',
    slug: '',
    categorie: '',
    sous_categorie: '',
    description: '',
    puissance: '',
    luminosite: '',
    prix: '',
    sur_devis: false,
    stock: 0,
    prime_cee: true,
    actif: true,
    image_1: null,
    image_2: null,
    image_3: null,
    image_4: null,
    image_url: null,
    fiche_technique: null,
  });

  const [fileUploads, setFileUploads] = useState({});
  const [filesToRemove, setFilesToRemove] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      logger.log('📦 Chargement du produit ID:', id);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      logger.log('✅ Produit chargé:', data);
      setFormData(prev => ({ ...prev, ...data }));
      
      if (data.slug) {
        setIsSlugManuallyEdited(true);
      }
    } catch (error) {
      logger.error('❌ Erreur chargement:', error);
      toast({ 
        title: "Erreur", 
        description: `Impossible de charger le produit: ${error.message}`, 
        variant: "destructive" 
      });
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    if (isEditing) {
      fetchProduct();
    }
  }, [isEditing, fetchProduct]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));

    if (name === 'nom' && !isSlugManuallyEdited) {
      setFormData(prev => ({ ...prev, slug: slugify(newValue) }));
    }
    
    if (name === 'slug') {
      setIsSlugManuallyEdited(true);
    }
    
    if (name === 'prix') {
      setFormData(prev => ({ ...prev, sur_devis: !value }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      logger.log(`📁 Fichier sélectionné pour ${name}:`, files[0].name);
      setFileUploads(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleRemoveFile = useCallback((fieldName, fileUrl) => {
    logger.log(`🗑️ Préparation pour suppression de ${fieldName}:`, fileUrl);
    
    setFormData(prev => ({ ...prev, [fieldName]: null }));
    
    if (fileUrl && typeof fileUrl === 'string' && fileUrl.includes('supabase.co')) {
        try {
            const url = new URL(fileUrl);
            const path = url.pathname.split('/products/')[1];
            if (path) {
                logger.log(`📝 Ajout à la liste de suppression:`, path);
                setFilesToRemove(prev => [...prev, { path: path, url: fileUrl }]);
            }
        } catch (e) {
            logger.warn("URL de fichier invalide pour la suppression:", fileUrl);
        }
    }
    
    setFileUploads(prev => {
      const newUploads = { ...prev };
      delete newUploads[fieldName];
      return newUploads;
    });
  }, []);

  const uploadFile = async (file, path) => {
    if (!file) return null;
    
    const fileName = `${Date.now()}-${slugify(file.name)}`;
    const filePath = `${path}/${fileName}`;
    const bucket = 'products';
    
    logger.log(`📤 Upload vers bucket: ${bucket}, path: ${filePath}`);
    logger.log(`📊 Taille du fichier: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    
    try {
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) {
        logger.error('❌ Erreur upload:', uploadError);
        throw uploadError;
      }
      
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      
      logger.log(`✅ Fichier uploadé: ${urlData.publicUrl}`);
      return urlData.publicUrl;
      
    } catch (error) {
      logger.error('❌ Erreur lors de l\'upload:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    logger.log('📝 Soumission du formulaire');
    
    if (!formData.nom || !formData.categorie || !formData.slug) {
      toast({ 
        title: "Champs requis manquants", 
        description: "Veuillez remplir le nom, le slug et la catégorie.", 
        variant: "destructive" 
      });
      return;
    }
    
    setSaving(true);
    let updatedData = { ...formData };
    
    try {
      if (filesToRemove.length > 0) {
        logger.log('🗑️ Suppression de', filesToRemove.length, 'fichiers');
        const pathsToDelete = filesToRemove.map(f => f.path);
        const { error: deleteError } = await supabase.storage.from('products').remove(pathsToDelete);
        if (deleteError) {
            logger.warn(`⚠️ Erreur lors de la suppression de certains fichiers:`, deleteError);
        } else {
            logger.log(`✅ Fichiers supprimés:`, pathsToDelete);
        }
        setFilesToRemove([]);
      }

      const uploadPath = `produits/${slugify(formData.slug || 'new-product')}`;
      logger.log(`📤 Chemin d'upload: ${uploadPath}`);
      
      const uploadPromises = Object.keys(fileUploads).map(async key => {
        const file = fileUploads[key];
        if (file) {
          try {
            logger.log(`⏳ Upload de ${key}...`);
            const url = await uploadFile(file, uploadPath);
            updatedData[key] = url;
            
            if (key === 'image_1') {
              updatedData.image_url = url;
              logger.log(`🔗 image_url défini à: ${url}`);
            }
            
            logger.log(`✅ ${key} uploadé: ${url}`);
          } catch (error) {
            logger.error(`❌ Erreur upload ${key}:`, error);
            throw error; // Rethrow to stop the process
          }
        }
      });
      
      await Promise.all(uploadPromises);
      setFileUploads({});
      
      const { id: formId, ...dataToSave } = updatedData;
      dataToSave.prix = dataToSave.prix ? parseFloat(dataToSave.prix) : null;
      dataToSave.stock = dataToSave.stock ? parseInt(dataToSave.stock, 10) : 0;
      dataToSave.sur_devis = !dataToSave.prix;
      
      if (!dataToSave.image_url && dataToSave.image_1) {
        dataToSave.image_url = dataToSave.image_1;
        logger.log(`🔗 image_url défini depuis image_1 existante: ${dataToSave.image_url}`);
      }

      // Sanitize data before save to prevent XSS attacks
      const sanitizedDataToSave = sanitizeFormData(dataToSave);

      logger.log('💾 Données à sauvegarder:', sanitizedDataToSave);

      let savedData, error;

      if (isEditing) {
        logger.log('💾 Mise à jour du produit ID:', id);
        ({ data: savedData, error } = await supabase
          .from('products')
          .update(sanitizedDataToSave)
          .eq('id', id)
          .select()
          .single());
      } else {
        logger.log('✨ Création d\'un nouveau produit');
        ({ data: savedData, error } = await supabase
          .from('products')
          .insert([sanitizedDataToSave])
          .select()
          .single());
      }

      if (error) throw error;

      logger.log('✅ Produit sauvegardé:', savedData);
      
      toast({ 
        title: "Succès !", 
        description: `Produit ${isEditing ? 'mis à jour' : 'créé'} avec succès !` 
      });

      if (!isEditing) {
        navigate('/admin/products');
      } else {
        // Refetch data to get the latest state after save
        fetchProduct();
      }

    } catch (error) {
      logger.error("❌ Erreur de sauvegarde:", error);
      toast({ 
        title: "Erreur de sauvegarde", 
        description: `La sauvegarde a échoué: ${error.message}`, 
        variant: "destructive" 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isEditing ? 'Modifier' : 'Nouveau'} Produit | Effinor Admin</title>
      </Helmet>
      <div className="admin-page">
        <div className="page-header">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {isEditing ? 'Modifier le Produit' : '➕ Ajouter un nouveau Produit'}
          </h1>
          <Link to="/admin/products">
            <Button variant="outline">← Retour</Button>
          </Link>
        </div>

        <form id="product-form" onSubmit={handleSubmit} className="product-form">
          {/* Basic Info */}
          <div className="form-section">
            <h2>📋 Informations de base</h2>
            <div className="form-group">
              <label htmlFor="nom">Nom du produit *</label>
              <Input 
                id="nom" 
                name="nom" 
                value={formData.nom || ''} 
                onChange={handleInputChange} 
                required 
                placeholder="Ex: Projecteur LED UFO" 
              />
            </div>
            <div className="form-group">
              <label htmlFor="slug">Slug (URL) *</label>
              <Input 
                id="slug" 
                name="slug" 
                value={formData.slug || ''} 
                onChange={handleInputChange} 
                required 
                placeholder="Ex: projecteur-led-ufo" 
              />
              <small>Généré automatiquement depuis le nom. Modifiez-le pour personnaliser.</small>
            </div>
            <div className="form-group">
              <label htmlFor="categorie">Catégorie *</label>
              <Select 
                name="categorie" 
                onValueChange={(value) => handleSelectChange('categorie', value)} 
                value={formData.categorie || ''}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="luminaires_industriels">Luminaires industriels</SelectItem>
                  <SelectItem value="eclairage_exterieur">Éclairage extérieur</SelectItem>
                  <SelectItem value="eclairage_etanche">Éclairage étanche</SelectItem>
                  <SelectItem value="accessoires">Accessoires</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <Textarea 
                id="description" 
                name="description" 
                value={formData.description || ''} 
                onChange={handleInputChange} 
                rows={4} 
                placeholder="Description détaillée du produit." 
              />
            </div>
          </div>

          {/* Specifications & Price */}
          <div className="form-section">
            <h2>⚙️ Spécifications & Prix</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="puissance">Puissance (W)</label>
                <Input 
                  id="puissance" 
                  name="puissance" 
                  type="text" 
                  value={formData.puissance || ''} 
                  onChange={handleInputChange} 
                  placeholder="Ex: 150W" 
                />
              </div>
              <div className="form-group">
                <label htmlFor="luminosite">Flux (lm)</label>
                <Input 
                  id="luminosite" 
                  name="luminosite" 
                  type="text" 
                  value={formData.luminosite || ''} 
                  onChange={handleInputChange} 
                  placeholder="Ex: 21000 lm" 
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="prix">Prix vente HT (€)</label>
                <Input 
                  id="prix" 
                  name="prix" 
                  type="number" 
                  step="0.01" 
                  value={formData.prix || ''} 
                  onChange={handleInputChange} 
                  placeholder="Laisser vide si sur devis" 
                />
              </div>
              <div className="form-group">
                <label htmlFor="stock">Stock</label>
                <Input 
                  id="stock" 
                  name="stock" 
                  type="number" 
                  value={formData.stock || '0'} 
                  onChange={handleInputChange} 
                  min="0" 
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="checkbox-label">
                <Checkbox 
                  id="prime_cee" 
                  name="prime_cee" 
                  checked={!!formData.prime_cee} 
                  onCheckedChange={(checked) => handleInputChange({ target: { name: 'prime_cee', checked, type: 'checkbox' }})} 
                />
                <label htmlFor="prime_cee">Éligible CEE</label>
              </div>
              <div className="checkbox-label">
                <Checkbox 
                  id="sur_devis" 
                  name="sur_devis" 
                  checked={!!formData.sur_devis} 
                  disabled 
                />
                <label htmlFor="sur_devis">Sur devis</label>
              </div>
              <div className="checkbox-label">
                <Checkbox 
                  id="actif" 
                  name="actif" 
                  checked={!!formData.actif} 
                  onCheckedChange={(checked) => handleInputChange({ target: { name: 'actif', checked, type: 'checkbox' }})} 
                />
                <label htmlFor="actif">Produit actif</label>
              </div>
            </div>
          </div>
          
          {/* Images & Documents */}
          <div className="form-section">
            <h2>🖼️ Images & Documents</h2>
            <p className="section-description">La première image sera utilisée comme image principale</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <ImageUploadPreview 
                label="Image 1 (Principale) *" 
                currentUrl={formData.image_1} 
                onFileChange={handleFileChange} 
                onRemove={handleRemoveFile} 
                fieldName="image_1" 
              />
              <ImageUploadPreview 
                label="Image 2" 
                currentUrl={formData.image_2} 
                onFileChange={handleFileChange} 
                onRemove={handleRemoveFile} 
                fieldName="image_2" 
              />
              <ImageUploadPreview 
                label="Image 3" 
                currentUrl={formData.image_3} 
                onFileChange={handleFileChange} 
                onRemove={handleRemoveFile} 
                fieldName="image_3" 
              />
              <ImageUploadPreview 
                label="Image 4" 
                currentUrl={formData.image_4} 
                onFileChange={handleFileChange} 
                onRemove={handleRemoveFile} 
                fieldName="image_4" 
              />
            </div>
            <div className="form-group">
              <label>📄 Fiche technique (PDF)</label>
              {formData.fiche_technique && (
                <div className="my-2 flex items-center gap-2">
                  <a 
                    href={formData.fiche_technique} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-secondary-600 hover:underline"
                  >
                    ✅ Voir le fichier actuel
                  </a>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveFile('fiche_technique', formData.fiche_technique)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                  </Button>
                </div>
              )}
              <Input 
                type="file" 
                name="fiche_technique" 
                accept=".pdf" 
                onChange={handleFileChange} 
              />
            </div>
          </div>
          
          {/* Actions */}
          <div className="form-actions">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => navigate('/admin/products')}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {isEditing ? 'Mettre à jour' : 'Enregistrer le produit'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AdminProductForm;