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
  const [preview, setPreview] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (currentUrl) {
      // If it's a blob URL, keep it, otherwise use the provided URL
      if (currentUrl.startsWith('blob:')) {
        setPreview(currentUrl);
      } else {
        // Ensure we construct the full URL if needed
        setPreview(currentUrl);
      }
    } else {
      setPreview(null);
    }
  }, [currentUrl]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image');
        e.target.value = ''; // Reset input
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'image est trop grande. Maximum 5MB');
        e.target.value = ''; // Reset input
        return;
      }

      const newPreviewUrl = URL.createObjectURL(file);
      setPreview(newPreviewUrl);
      onFileChange(e);
    } else {
      // Reset preview if no file selected
      if (!currentUrl) {
        setPreview(null);
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setFileInputKey(prev => prev + 1); // Reset file input
    onRemove(fieldName, currentUrl);
  };

  // Construct proper image URL for display
  const imageUrl = preview || currentUrl;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="w-full h-40 border-2 border-dashed rounded-lg flex justify-center items-center relative bg-gray-50 overflow-hidden">
        {imageUrl ? (
          <>
            <img 
              src={imageUrl} 
              alt="Aperçu" 
              className="max-h-full max-w-full object-contain rounded-md"
              onError={(e) => {
                logger.error(`Erreur de chargement d'image pour ${fieldName}:`, imageUrl);
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<div class="text-center text-gray-400"><span class="text-sm">Erreur de chargement</span></div>';
              }}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-7 w-7 z-10"
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
        key={fileInputKey}
        type="file"
        name={fieldName}
        accept="image/*"
        onChange={handleFileChange}
        className="mt-2"
        disabled={uploading}
      />
      {fileInputKey === 0 && currentUrl && (
        <p className="text-xs text-gray-500 mt-1">Cliquez sur "Choisir un fichier" pour remplacer l'image</p>
      )}
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
    categorie_id: null,
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

  const [categories, setCategories] = useState([]);
  const [fichesCEE, setFichesCEE] = useState([]);
  const [selectedFiches, setSelectedFiches] = useState([]);
  const [fileUploads, setFileUploads] = useState({});
  const [filesToRemove, setFilesToRemove] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Fetch categories from database
  const fetchCategories = useCallback(async () => {
    try {
      logger.log('📦 Chargement des catégories...');
      const { data, error } = await supabase
        .from('categories')
        .select('id, nom, slug')
        .eq('actif', true)
        .order('ordre', { ascending: true });
      
      if (error) throw error;
      
      logger.log(`✅ ${data.length} catégories chargées`);
      setCategories(data || []);
    } catch (error) {
      logger.error('❌ Erreur chargement catégories:', error);
      toast({
        title: "Avertissement",
        description: `Impossible de charger les catégories: ${error.message}. Vous pouvez toujours saisir la catégorie manuellement.`,
        variant: "default"
      });
    }
  }, [toast]);

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

  // Fetch available fiches CEE
  const fetchFichesCEE = useCallback(async () => {
    try {
      logger.log('📦 Chargement des fiches CEE...');
      const { data, error } = await supabase
        .from('fiches_cee')
        .select('id, numero, titre')
        .eq('actif', true)
        .order('ordre', { ascending: true });
      
      if (error) {
        logger.warn('⚠️ Erreur chargement fiches CEE (table peut ne pas exister):', error);
        setFichesCEE([]);
        return;
      }
      
      logger.log(`✅ ${data.length} fiches CEE chargées`);
      setFichesCEE(data || []);
    } catch (error) {
      logger.error('❌ Erreur chargement fiches CEE:', error);
      setFichesCEE([]);
    }
  }, []);

  // Load existing links when editing
  const fetchExistingFichesLinks = useCallback(async () => {
    if (!id) return;
    try {
      const { data, error } = await supabase
        .from('produits_fiches_cee')
        .select('fiche_cee_id')
        .eq('produit_id', id);
      
      if (error) {
        logger.warn('⚠️ Table produits_fiches_cee peut ne pas exister:', error);
        setSelectedFiches([]);
        return;
      }
      
      setSelectedFiches(data?.map(d => d.fiche_cee_id) || []);
    } catch (error) {
      logger.error('❌ Erreur chargement liens fiches CEE:', error);
      setSelectedFiches([]);
    }
  }, [id]);

  // Save fiches links function
  const saveFichesLinks = async (productId) => {
    try {
      // Delete existing links
      await supabase
        .from('produits_fiches_cee')
        .delete()
        .eq('produit_id', productId);
      
      // Insert new links
      if (selectedFiches.length > 0) {
        const links = selectedFiches.map(ficheId => ({
          produit_id: productId,
          fiche_cee_id: ficheId
        }));
        
        const { error: insertError } = await supabase
          .from('produits_fiches_cee')
          .insert(links);
        
        if (insertError) {
          logger.warn('⚠️ Erreur insertion liens fiches CEE (table peut ne pas exister):', insertError);
        } else {
          logger.log(`✅ ${selectedFiches.length} lien(s) fiche(s) CEE sauvegardé(s)`);
        }
      }
    } catch (error) {
      logger.warn('⚠️ Erreur sauvegarde liens fiches CEE:', error);
      // Don't throw error, just log it - this is optional functionality
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchFichesCEE();
    if (isEditing) {
      fetchProduct();
      fetchExistingFichesLinks();
    }
  }, [isEditing, fetchProduct, fetchCategories, fetchFichesCEE, fetchExistingFichesLinks]);

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
            // Try both 'products' and 'effinor-assets' path patterns for backward compatibility
            const path = url.pathname.split('/effinor-assets/')[1] || url.pathname.split('/products/')[1];
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
    // Use the correct bucket name: 'effinor-assets'
    const bucketsToTry = ['effinor-assets'];
    
    logger.log(`📤 Tentative d'upload, path: ${filePath}`);
    logger.log(`📊 Taille du fichier: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    
    let lastError = null;
    
    for (const bucket of bucketsToTry) {
      try {
        logger.log(`📦 Tentative avec bucket: ${bucket}`);
        
        // Check if bucket exists and is accessible
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        
        if (listError) {
          logger.warn(`⚠️ Erreur lors de la liste des buckets:`, listError);
        } else {
          const bucketExists = buckets?.some(b => b.name === bucket);
          if (!bucketExists) {
            logger.warn(`⚠️ Bucket "${bucket}" n'existe pas. Vérifiez dans Supabase Dashboard > Storage.`);
          }
        }
        
        // Upload file
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, { 
            upsert: true,
            contentType: file.type,
            cacheControl: '3600'
          });
        
        if (uploadError) {
          logger.error(`❌ Erreur upload avec bucket "${bucket}":`, uploadError);
          lastError = uploadError;
          continue; // Try next bucket
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);
        
        logger.log(`✅ Fichier uploadé avec succès dans "${bucket}": ${urlData.publicUrl}`);
        return urlData.publicUrl;
        
      } catch (error) {
        logger.error(`❌ Erreur avec bucket "${bucket}":`, error);
        lastError = error;
        continue; // Try next bucket
      }
    }
    
    // If we get here, all buckets failed
    logger.error('❌ Tous les buckets ont échoué. Dernière erreur:', lastError);
    throw new Error(`Impossible d'uploader le fichier. ${lastError?.message || 'Vérifiez que le bucket "effinor-assets" existe et est public dans Supabase Dashboard > Storage.'}`);
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
        const { error: deleteError } = await supabase.storage.from('effinor-assets').remove(pathsToDelete);
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

      // Remove categorie_id if null (column might not exist in DB yet)
      // Keep categorie (slug) for backward compatibility
      if (!dataToSave.categorie_id || dataToSave.categorie_id === null || dataToSave.categorie_id === '') {
        delete dataToSave.categorie_id;
        logger.log('⚠️ categorie_id est null, suppression du champ (la colonne n\'existe peut-être pas encore)');
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
      
      // Save fiches CEE links
      if (savedData?.id) {
        await saveFichesLinks(savedData.id);
      }
      
      toast({ 
        title: "Succès !", 
        description: `Produit ${isEditing ? 'mis à jour' : 'créé'} avec succès !` 
      });

      if (!isEditing) {
        navigate('/admin/products');
      } else {
        // Refetch data to get the latest state after save
        fetchProduct();
        fetchExistingFichesLinks();
      }

    } catch (error) {
      logger.error("❌ Erreur de sauvegarde:", error);
      
      // Check if error is about categorie_id column not existing
      if (error.message?.includes('categorie_id') || error.message?.includes('column') && error.message?.includes('not found')) {
        // Try again without categorie_id
        logger.log('⚠️ Tentative de sauvegarde sans categorie_id...');
        delete sanitizedDataToSave.categorie_id;
        
        try {
          if (isEditing) {
            ({ data: savedData, error } = await supabase
              .from('products')
              .update(sanitizedDataToSave)
              .eq('id', id)
              .select()
              .single());
          } else {
            ({ data: savedData, error } = await supabase
              .from('products')
              .insert([sanitizedDataToSave])
              .select()
              .single());
          }
          
          if (!error) {
            toast({ 
              title: "Produit sauvegardé (sans categorie_id)", 
              description: "Le produit a été sauvegardé avec succès. La colonne categorie_id n'existe pas encore dans la base de données. Créez-la avec le script SQL fourni pour activer la relation entre produits et catégories.",
              variant: "default"
            });
            
            if (!isEditing) {
              navigate('/admin/products');
            } else {
              fetchProduct();
            }
            setSaving(false);
            return;
          }
        } catch (retryError) {
          logger.error("❌ Erreur lors de la tentative de sauvegarde sans categorie_id:", retryError);
        }
      }
      
      toast({ 
        title: "Erreur de sauvegarde", 
        description: `La sauvegarde a échoué: ${error.message}${error.message?.includes('categorie_id') ? '. La colonne categorie_id n\'existe pas encore. Exécutez le script SQL ADD_CATEGORIE_ID_COLUMN.sql dans Supabase Dashboard.' : ''}`, 
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
              {categories.length > 0 ? (
                <Select 
                  name="categorie" 
                  onValueChange={(value) => {
                    const selectedCategory = categories.find(c => c.id === value);
                    setFormData(prev => ({
                      ...prev,
                      categorie_id: value || null,
                      categorie: selectedCategory?.slug || selectedCategory?.nom || ''
                    }));
                  }}
                  value={formData.categorie_id || formData.categorie || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  name="categorie"
                  value={formData.categorie || ''}
                  onChange={handleInputChange}
                  placeholder="Ex: luminaires_industriels"
                  required
                />
              )}
              <small className="text-gray-500">
                {categories.length === 0 && 'Chargement des catégories...'}
              </small>
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
          
          {/* Fiches CEE */}
          {fichesCEE.length > 0 && (
            <div className="form-section">
              <h2>🎯 Fiches CEE Applicables</h2>
              <p className="section-description">
                Sélectionnez les fiches CEE qui s'appliquent à ce produit
              </p>
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                {fichesCEE.map(fiche => (
                  <label key={fiche.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-secondary-300 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFiches.includes(fiche.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFiches([...selectedFiches, fiche.id]);
                        } else {
                          setSelectedFiches(selectedFiches.filter(id => id !== fiche.id));
                        }
                      }}
                      className="w-4 h-4 text-secondary-500 border-gray-300 rounded focus:ring-secondary-500"
                    />
                    <div className="flex-1">
                      <span className="font-mono text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded mr-2">
                        {fiche.numero}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{fiche.titre}</span>
                    </div>
                  </label>
                ))}
                {selectedFiches.length === 0 && (
                  <p className="text-sm text-gray-500 italic text-center py-2">
                    Aucune fiche CEE sélectionnée
                  </p>
                )}
              </div>
            </div>
          )}

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