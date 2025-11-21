import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/utils/logger';
import { useToast } from '@/components/ui/use-toast';
import { sanitizeFormData } from '@/utils/sanitize';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import NotesTimeline from '@/components/NotesTimeline';
import { ArrowLeft, User, Mail, Building, Phone, Package, Loader2, Calendar, Edit, Trash2, Save, X, Plus, ChevronDown, ChevronUp, FileText, MapPin, Briefcase, FileCheck, Upload, MoreVertical, Copy, Euro, CheckCircle, AlertCircle, Tag, Star, Clock, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [orderLines, setOrderLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  
  // Get current user name for notes
  const currentUser = profile || user;
  const currentUserName = currentUser?.full_name || currentUser?.email || 'Admin';

  // Customer edit state
  const [editingCustomer, setEditingCustomer] = useState(false);
  const [customerData, setCustomerData] = useState({
    nom_client: '',
    email: '',
    telephone: '',
    societe: ''
  });

  // Products management state
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [updatingQuantity, setUpdatingQuantity] = useState({});

  // Comment state
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [commentText, setCommentText] = useState('');

  // Email state
  const [sendingEmail, setSendingEmail] = useState(false);

  // Tab system state
  const [activeTab, setActiveTab] = useState('Résumé');
  
  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // CEE Information state
  const [editingCEE, setEditingCEE] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    siege: false,
    travaux: false,
    beneficiaire: false,
    details: false
  });
  const [ceeData, setCeeData] = useState({
    // Section 1: Siège Social
    adresse_siege: '',
    ville_siege: '',
    code_postal_siege: '',
    numero_siret: '',
    siren: '',
    // Section 2: Adresse des Travaux
    adresse_travaux: '',
    ville_travaux: '',
    code_postal_travaux: '',
    siret_site_travaux: '',
    region: '',
    zone_climatique: '',
    // Section 3: Bénéficiaire de Travaux
    raison_sociale_beneficiaire: '',
    telephone_fixe_beneficiaire: '',
    email_beneficiaire: '',
    civilite_responsable: '',
    nom_responsable: '',
    prenom_responsable: '',
    telephone_responsable: '',
    // Section 4: Détails des Travaux
    categories_travaux: [],
    parcelle_cadastrale: '',
    qualification: '',
    surface_m2: '',
    certificat_preparatoire: ''
  });
  const [uploadingCertificat, setUploadingCertificat] = useState(false);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const n8nWebhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL; // Optional

  // Construct image URL helper
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return imagePath;
    if (supabaseUrl) {
      if (imagePath.includes('supabase.co')) return imagePath;
      return `${supabaseUrl}/storage/v1/object/public/effinor-assets/${imagePath}`;
    }
    return imagePath;
  };

  // Get status badge color
  const getStatusColor = (statut) => {
    const statusConfig = {
      'Nouveau Devis': 'bg-blue-100 text-blue-800',
      'Devis envoyé': 'bg-purple-100 text-purple-800',
      'En cours': 'bg-yellow-100 text-yellow-800',
      'Validé': 'bg-green-100 text-green-800',
      'Annulé': 'bg-red-100 text-red-800',
    };
    return statusConfig[statut] || 'bg-gray-100 text-gray-800';
  };

  useEffect(() => {
    fetchOrderData();
    fetchAvailableProducts();
  }, [id]);

  // Fetch available products for adding to order
  const fetchAvailableProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, nom, prix, sur_devis')
        .eq('actif', true)
        .order('nom');
      
      if (error) {
        logger.warn('⚠️ Erreur chargement produits disponibles:', error);
        return;
      }
      
      setAvailableProducts(data || []);
    } catch (err) {
      logger.warn('⚠️ Erreur chargement produits:', err);
    }
  };

  const fetchOrderData = async () => {
    setLoading(true);
    setError(null);
    try {
      logger.log(`📦 Chargement de la commande ID: ${id}`);
      
      // Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from('commandes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (orderError) {
        logger.error('❌ Erreur Supabase commande:', {
          message: orderError.message,
          code: orderError.code,
          details: orderError.details,
          hint: orderError.hint
        });
        
        if (orderError.code === 'PGRST116') {
          throw new Error('Commande non trouvée.');
        }
        
        if (orderError.message?.includes('permission denied') || orderError.message?.includes('RLS')) {
          throw new Error('Permissions insuffisantes. Vérifiez les politiques RLS dans Supabase.');
        }
        
        throw new Error(orderError.message || 'Erreur lors du chargement de la commande.');
      }

      if (!orderData) {
        logger.warn('⚠️ Aucune donnée retournée pour la commande:', id);
        throw new Error('Commande non trouvée.');
      }

      logger.log('✅ Commande chargée:', orderData);
      setOrder(orderData);
      
      // Initialize customer data and comment
      setCustomerData({
        nom_client: orderData.nom_client || '',
        email: orderData.email || '',
        telephone: orderData.telephone || '',
        societe: orderData.societe || ''
      });
      setCommentText(orderData.commentaire || '');

      // Initialize CEE data
      setCeeData({
        adresse_siege: orderData.adresse_siege || '',
        ville_siege: orderData.ville_siege || '',
        code_postal_siege: orderData.code_postal_siege || '',
        numero_siret: orderData.numero_siret || '',
        siren: orderData.siren || '',
        adresse_travaux: orderData.adresse_travaux || '',
        ville_travaux: orderData.ville_travaux || '',
        code_postal_travaux: orderData.code_postal_travaux || '',
        siret_site_travaux: orderData.siret_site_travaux || '',
        region: orderData.region || '',
        zone_climatique: orderData.zone_climatique || '',
        raison_sociale_beneficiaire: orderData.raison_sociale_beneficiaire || '',
        telephone_fixe_beneficiaire: orderData.telephone_fixe_beneficiaire || '',
        email_beneficiaire: orderData.email_beneficiaire || '',
        civilite_responsable: orderData.civilite_responsable || '',
        nom_responsable: orderData.nom_responsable || '',
        prenom_responsable: orderData.prenom_responsable || '',
        telephone_responsable: orderData.telephone_responsable || '',
        categories_travaux: Array.isArray(orderData.categories_travaux) 
          ? orderData.categories_travaux 
          : (orderData.categories_travaux ? JSON.parse(orderData.categories_travaux) : []),
        parcelle_cadastrale: orderData.parcelle_cadastrale || '',
        qualification: orderData.qualification || '',
        surface_m2: orderData.surface_m2 || '',
        certificat_preparatoire: orderData.certificat_preparatoire || ''
      });
      
      // Fetch order lines
      try {
        const { data: linesData, error: linesError } = await supabase
          .from('commandes_lignes')
          .select(`
            id,
            quantite,
            prix_unitaire,
            nom,
            produit_id,
            products (
              id,
              nom,
              image_1,
              image_url,
              prix,
              slug
            )
          `)
          .eq('commande_id', id);
        
        if (linesError || !linesData || linesData.length === 0) {
          if (linesError) {
            logger.warn('⚠️ Erreur chargement lignes de commande:', linesError);
          }
          
          // Fallback: use produits JSON
          if (orderData.produits) {
            try {
              const produits = typeof orderData.produits === 'string' 
                ? JSON.parse(orderData.produits) 
                : orderData.produits;
              const parsedLines = Array.isArray(produits) ? produits : [];
              logger.log(`✅ ${parsedLines.length} produit(s) trouvé(s) dans JSON produits`);
              setOrderLines(parsedLines);
            } catch (parseError) {
              logger.error('❌ Erreur parsing produits JSON:', parseError);
              setOrderLines([]);
            }
          } else {
            setOrderLines([]);
          }
        } else {
          logger.log(`✅ ${linesData.length} ligne(s) de commande trouvée(s)`);
          setOrderLines(linesData || []);
        }
      } catch (linesErr) {
        logger.warn('⚠️ Erreur lors du chargement des lignes de commande:', linesErr);
        setOrderLines([]);
      }
      
    } catch (err) {
      logger.error('❌ Erreur chargement commande:', err);
      const errorMessage = err.message || "Impossible de charger la commande.";
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      logger.log(`💾 Mise à jour statut commande: ${newStatus}`);
      
      const { error } = await supabase
        .from('commandes')
        .update({ statut: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      setOrder({ ...order, statut: newStatus });
      toast({
        title: "Succès",
        description: "Statut mis à jour avec succès."
      });
    } catch (err) {
      logger.error('❌ Erreur mise à jour statut:', err);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  // Feature 1: Edit customer information
  const handleSaveCustomer = async () => {
    setUpdating(true);
    try {
      const sanitizedData = sanitizeFormData(customerData);
      
      const { error } = await supabase
        .from('commandes')
        .update(sanitizedData)
        .eq('id', id);
      
      if (error) throw error;
      
      setOrder({ ...order, ...sanitizedData });
      setEditingCustomer(false);
      toast({
        title: "Succès",
        description: "Informations client mises à jour."
      });
    } catch (err) {
      logger.error('❌ Erreur mise à jour client:', err);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les informations.",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  // Feature 2: Add product to order
  const handleAddProduct = async () => {
    if (!selectedProduct) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un produit.",
        variant: "destructive"
      });
      return;
    }

    setUpdating(true);
    try {
      const product = availableProducts.find(p => p.id === selectedProduct);
      if (!product) {
        throw new Error('Produit non trouvé');
      }

      // Add to commandes_lignes
      const newLine = {
        commande_id: id,
        produit_id: product.id,
        nom: product.nom,
        quantite: quantity,
        prix_unitaire: product.prix || 0
      };

      const { data, error } = await supabase
        .from('commandes_lignes')
        .insert([newLine])
        .select()
        .single();

      if (error) throw error;

      // Refresh order lines
      await fetchOrderData();
      
      toast({
        title: "Succès",
        description: "Produit ajouté à la commande."
      });
      
      setSelectedProduct('');
      setQuantity(1);
    } catch (err) {
      logger.error('❌ Erreur ajout produit:', err);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le produit.",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  // Feature 2: Remove product from order
  const handleRemoveProduct = async (lineId) => {
    if (!confirm('Supprimer ce produit de la commande ?')) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('commandes_lignes')
        .delete()
        .eq('id', lineId);
      
      if (error) throw error;
      
      await fetchOrderData();
      toast({
        title: "Succès",
        description: "Produit retiré de la commande."
      });
    } catch (err) {
      logger.error('❌ Erreur suppression produit:', err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit.",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  // Feature 2: Update product quantity
  const handleUpdateQuantity = async (lineId, newQuantity) => {
    if (newQuantity < 1) {
      toast({
        title: "Erreur",
        description: "La quantité doit être au moins 1.",
        variant: "destructive"
      });
      return;
    }

    setUpdatingQuantity({ ...updatingQuantity, [lineId]: true });
    try {
      const { error } = await supabase
        .from('commandes_lignes')
        .update({ quantite: newQuantity })
        .eq('id', lineId);
      
      if (error) throw error;
      
      await fetchOrderData();
      toast({
        title: "Succès",
        description: "Quantité mise à jour."
      });
    } catch (err) {
      logger.error('❌ Erreur mise à jour quantité:', err);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la quantité.",
        variant: "destructive"
      });
    } finally {
      setUpdatingQuantity({ ...updatingQuantity, [lineId]: false });
    }
  };

  // Feature 3: Save comment
  const handleSaveComment = async () => {
    setUpdating(true);
    try {
      const sanitizedComment = sanitizeFormData({ commentaire: commentText }).commentaire;
      
      const { error } = await supabase
        .from('commandes')
        .update({ commentaire: sanitizedComment })
        .eq('id', id);
      
      if (error) throw error;
      
      setOrder({ ...order, commentaire: sanitizedComment });
      setIsEditingComment(false);
      toast({
        title: "Succès",
        description: "Commentaire enregistré."
      });
    } catch (err) {
      logger.error('❌ Erreur sauvegarde commentaire:', err);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le commentaire.",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  // Validation functions for CEE fields
  const validateSIRET = (siret) => {
    if (!siret) return true; // Optional field
    return /^\d{14}$/.test(siret.replace(/\s/g, ''));
  };

  const validateSIREN = (siren) => {
    if (!siren) return true; // Optional field
    return /^\d{9}$/.test(siren.replace(/\s/g, ''));
  };

  const validateEmail = (email) => {
    if (!email) return true; // Optional field
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    if (!phone) return true; // Optional field
    return /^[\d\s\+\-\(\)]+$/.test(phone);
  };

  // Feature: Save CEE information
  const handleSaveCEE = async () => {
    setUpdating(true);
    try {
      // Validate required fields
      if (ceeData.numero_siret && !validateSIRET(ceeData.numero_siret)) {
        toast({
          title: "Erreur de validation",
          description: "Le SIRET doit contenir exactement 14 chiffres.",
          variant: "destructive"
        });
        setUpdating(false);
        return;
      }

      if (ceeData.siren && !validateSIREN(ceeData.siren)) {
        toast({
          title: "Erreur de validation",
          description: "Le SIREN doit contenir exactement 9 chiffres.",
          variant: "destructive"
        });
        setUpdating(false);
        return;
      }

      if (ceeData.email_beneficiaire && !validateEmail(ceeData.email_beneficiaire)) {
        toast({
          title: "Erreur de validation",
          description: "L'email bénéficiaire n'est pas valide.",
          variant: "destructive"
        });
        setUpdating(false);
        return;
      }

      // Prepare data for save - convert "none" to empty string
      const dataToSave = {
        ...ceeData,
        // Convert "none" values to empty strings
        region: ceeData.region === 'none' ? '' : ceeData.region,
        zone_climatique: ceeData.zone_climatique === 'none' ? '' : ceeData.zone_climatique,
        civilite_responsable: ceeData.civilite_responsable === 'none' ? '' : ceeData.civilite_responsable,
        // Handle categories_travaux - keep as array for JSONB, don't stringify
        categories_travaux: Array.isArray(ceeData.categories_travaux) && ceeData.categories_travaux.length > 0
          ? ceeData.categories_travaux
          : (ceeData.categories_travaux && !Array.isArray(ceeData.categories_travaux) 
            ? (typeof ceeData.categories_travaux === 'string' 
              ? (ceeData.categories_travaux.trim() && ceeData.categories_travaux !== '[]'
                ? JSON.parse(ceeData.categories_travaux)
                : null)
              : ceeData.categories_travaux)
            : null)
      };

      // Sanitize data
      const sanitizedCeeData = sanitizeFormData(dataToSave);

      // Clean SIRET and SIREN (remove spaces)
      if (sanitizedCeeData.numero_siret) {
        sanitizedCeeData.numero_siret = sanitizedCeeData.numero_siret.replace(/\s/g, '');
      }
      if (sanitizedCeeData.siren) {
        sanitizedCeeData.siren = sanitizedCeeData.siren.replace(/\s/g, '');
      }
      if (sanitizedCeeData.siret_site_travaux) {
        sanitizedCeeData.siret_site_travaux = sanitizedCeeData.siret_site_travaux.replace(/\s/g, '');
      }

      // Remove empty strings and null values to avoid database errors
      // Only send fields that have actual values to avoid errors with non-existent columns
      const cleanData = {};
      const fieldsToUpdate = [
        'adresse_siege', 'ville_siege', 'code_postal_siege', 'numero_siret', 'siren',
        'adresse_travaux', 'ville_travaux', 'code_postal_travaux', 'siret_site_travaux', 'region', 'zone_climatique',
        'raison_sociale_beneficiaire', 'telephone_fixe_beneficiaire', 'email_beneficiaire', 'civilite_responsable',
        'nom_responsable', 'prenom_responsable', 'telephone_responsable',
        'categories_travaux', 'parcelle_cadastrale', 'qualification', 'surface_m2', 'certificat_preparatoire'
      ];
      
      fieldsToUpdate.forEach(key => {
        const value = sanitizedCeeData[key];
        
        // Special handling for categories_travaux (JSONB)
        if (key === 'categories_travaux') {
          // If it's an array with items, include it
          // If it's empty array or null/undefined, set to null (don't send empty array)
          if (Array.isArray(value) && value.length > 0) {
            cleanData[key] = value; // Send as array for JSONB
          } else {
            // Don't include empty arrays or null for JSONB
            cleanData[key] = null;
          }
        } else {
          // For other fields, only include non-empty values
          if (value !== null && value !== undefined && value !== '') {
            cleanData[key] = value;
          }
        }
      });

      // Log what we're trying to update for debugging
      logger.log('💾 Tentative de sauvegarde CEE:', {
        orderId: id,
        fieldsCount: Object.keys(cleanData).length,
        fields: Object.keys(cleanData)
      });

      const { data: updatedData, error } = await supabase
        .from('commandes')
        .update(cleanData)
        .eq('id', id)
        .select();

      if (error) {
        logger.error('❌ Erreur Supabase update CEE:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          data: cleanData,
          fieldsAttempted: Object.keys(cleanData)
        });
        throw error;
      }

      logger.log('✅ Données CEE sauvegardées:', updatedData);

      setOrder({ ...order, ...sanitizedCeeData });
      setEditingCEE(false);
      toast({
        title: "Succès",
        description: "Informations CEE enregistrées avec succès."
      });
      } catch (err) {
        logger.error('❌ Erreur sauvegarde CEE:', {
          error: err,
          message: err.message,
          code: err.code,
          details: err.details,
          hint: err.hint,
          ceeData: ceeData
        });
        
        // More detailed error message
        let errorMessage = "Impossible d'enregistrer les informations CEE.";
        
        if (err.message?.includes('column') && err.message?.includes('does not exist')) {
          const missingColumn = err.message.match(/column "([^"]+)" does not exist/)?.[1];
          errorMessage = `La colonne "${missingColumn}" n'existe pas dans la table 'commandes'. Veuillez exécuter le script SQL ADD_CEE_COLUMNS_TO_COMMANDES.sql dans Supabase SQL Editor.`;
        } else if (err.message?.includes('permission denied') || err.message?.includes('RLS')) {
          errorMessage = "Permissions insuffisantes. Vérifiez les politiques RLS dans Supabase pour permettre l'UPDATE sur la table 'commandes'.";
        } else if (err.message) {
          errorMessage = `Erreur: ${err.message}`;
        }
        
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setUpdating(false);
      }
    };

  // Handle certificat preparatoire upload
  const handleCertificatUpload = async (file) => {
    if (!file) return;

    setUploadingCertificat(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `certificat-${id}-${Date.now()}.${fileExt}`;
      const filePath = `certificats/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('effinor-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('effinor-assets')
        .getPublicUrl(filePath);

      setCeeData({ ...ceeData, certificat_preparatoire: filePath });
      
      toast({
        title: "Succès",
        description: "Certificat téléchargé avec succès."
      });
    } catch (err) {
      logger.error('❌ Erreur upload certificat:', err);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le certificat.",
        variant: "destructive"
      });
    } finally {
      setUploadingCertificat(false);
    }
  };

  // Feature 4: Send quote by email
  const handleSendQuote = async () => {
    if (!order.email) {
      toast({
        title: "Erreur",
        description: "Aucun email client pour envoyer le devis.",
        variant: "destructive"
      });
      return;
    }

    setSendingEmail(true);
    try {
      // Calculate total
      const total = orderLines.reduce((sum, line) => {
        const price = line.prix_unitaire || line.products?.prix || 0;
        const qty = line.quantite || 1;
        return sum + (parseFloat(price) * qty);
      }, 0);

      // Build HTML email content
      const productsHTML = orderLines.map(line => {
        const productName = line.products?.nom || line.nom || 'Produit inconnu';
        const qty = line.quantite || 1;
        const unitPrice = line.prix_unitaire || line.products?.prix || 0;
        const lineTotal = parseFloat(unitPrice) * qty;
        
        return `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${productName}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${qty}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${unitPrice > 0 ? `${parseFloat(unitPrice).toFixed(2)}€` : 'Sur devis'}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${unitPrice > 0 ? `${lineTotal.toFixed(2)}€` : 'Sur devis'}</td>
          </tr>
        `;
      }).join('');

      const orderDate = order.date_creation || order.created_at || new Date();
      const formattedDate = new Date(orderDate).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });

      const emailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: #10B981; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">EFFINOR - Devis</h1>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px;">
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <h2 style="margin-top: 0; color: #1f2937;">Informations Client</h2>
              <p style="margin: 8px 0;"><strong>Client:</strong> ${order.nom_client || 'N/A'}</p>
              <p style="margin: 8px 0;"><strong>Société:</strong> ${order.societe || 'N/A'}</p>
              <p style="margin: 8px 0;"><strong>Email:</strong> ${order.email}</p>
              ${order.telephone ? `<p style="margin: 8px 0;"><strong>Téléphone:</strong> ${order.telephone}</p>` : ''}
              <p style="margin: 8px 0;"><strong>Date:</strong> ${formattedDate}</p>
            </div>
            
            <h2 style="color: #1f2937; margin-top: 0;">Détail du devis</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Produit</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Quantité</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Prix unitaire</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${productsHTML}
              </tbody>
              <tfoot>
                <tr style="background-color: #10B981; color: white;">
                  <td colspan="3" style="padding: 15px; text-align: right; font-weight: bold; font-size: 16px;">TOTAL HT</td>
                  <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 20px;">${total > 0 ? `${total.toFixed(2)}€` : 'Sur devis'}</td>
                </tr>
              </tfoot>
            </table>
            
            ${order.commentaire ? `
              <div style="margin-top: 30px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <strong>Note:</strong><br/>
                <p style="margin: 5px 0; white-space: pre-wrap;">${order.commentaire}</p>
              </div>
            ` : ''}
            
            ${(order.adresse_siege || order.numero_siret || order.adresse_travaux || order.raison_sociale_beneficiaire) ? `
              <div style="margin-top: 30px; padding: 20px; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
                <h3 style="margin-top: 0; color: #1e40af; font-size: 18px;">Informations CEE Légales</h3>
                
                ${(order.adresse_siege || order.numero_siret) ? `
                  <div style="margin-bottom: 15px;">
                    <h4 style="color: #1e40af; margin-bottom: 8px; font-size: 14px; font-weight: bold;">Siège Social</h4>
                    ${order.adresse_siege ? `<p style="margin: 4px 0; color: #1f2937;">${order.adresse_siege}</p>` : ''}
                    ${(order.ville_siege || order.code_postal_siege) ? `<p style="margin: 4px 0; color: #1f2937;">${order.code_postal_siege || ''} ${order.ville_siege || ''}</p>` : ''}
                    ${order.numero_siret ? `<p style="margin: 4px 0; color: #1f2937;"><strong>SIRET:</strong> ${order.numero_siret}</p>` : ''}
                    ${order.siren ? `<p style="margin: 4px 0; color: #1f2937;"><strong>SIREN:</strong> ${order.siren}</p>` : ''}
                  </div>
                ` : ''}
                
                ${(order.adresse_travaux || order.region) ? `
                  <div style="margin-bottom: 15px;">
                    <h4 style="color: #1e40af; margin-bottom: 8px; font-size: 14px; font-weight: bold;">Adresse des Travaux</h4>
                    ${order.adresse_travaux ? `<p style="margin: 4px 0; color: #1f2937;">${order.adresse_travaux}</p>` : ''}
                    ${(order.ville_travaux || order.code_postal_travaux) ? `<p style="margin: 4px 0; color: #1f2937;">${order.code_postal_travaux || ''} ${order.ville_travaux || ''}</p>` : ''}
                    ${order.region ? `<p style="margin: 4px 0; color: #1f2937;"><strong>Région:</strong> ${order.region}</p>` : ''}
                    ${order.zone_climatique ? `<p style="margin: 4px 0; color: #1f2937;"><strong>Zone Climatique:</strong> ${order.zone_climatique}</p>` : ''}
                    ${order.siret_site_travaux ? `<p style="margin: 4px 0; color: #1f2937;"><strong>SIRET Site:</strong> ${order.siret_site_travaux}</p>` : ''}
                  </div>
                ` : ''}
                
                ${(order.raison_sociale_beneficiaire || order.nom_responsable) ? `
                  <div style="margin-bottom: 15px;">
                    <h4 style="color: #1e40af; margin-bottom: 8px; font-size: 14px; font-weight: bold;">Bénéficiaire de Travaux</h4>
                    ${order.raison_sociale_beneficiaire ? `<p style="margin: 4px 0; color: #1f2937;"><strong>Raison Sociale:</strong> ${order.raison_sociale_beneficiaire}</p>` : ''}
                    ${(order.civilite_responsable || order.prenom_responsable || order.nom_responsable) ? `
                      <p style="margin: 4px 0; color: #1f2937;">
                        ${order.civilite_responsable || ''} ${order.prenom_responsable || ''} ${order.nom_responsable || ''}
                      </p>
                    ` : ''}
                    ${order.email_beneficiaire ? `<p style="margin: 4px 0; color: #1f2937;"><strong>Email:</strong> ${order.email_beneficiaire}</p>` : ''}
                    ${order.telephone_responsable ? `<p style="margin: 4px 0; color: #1f2937;"><strong>Téléphone:</strong> ${order.telephone_responsable}</p>` : ''}
                  </div>
                ` : ''}
                
                ${(order.surface_m2 || order.categories_travaux) ? `
                  <div>
                    <h4 style="color: #1e40af; margin-bottom: 8px; font-size: 14px; font-weight: bold;">Détails des Travaux</h4>
                    ${order.surface_m2 ? `<p style="margin: 4px 0; color: #1f2937;"><strong>Surface:</strong> ${order.surface_m2} m²</p>` : ''}
                    ${order.qualification ? `<p style="margin: 4px 0; color: #1f2937;"><strong>Qualification:</strong> ${order.qualification}</p>` : ''}
                    ${order.parcelle_cadastrale ? `<p style="margin: 4px 0; color: #1f2937;"><strong>Parcelle Cadastrale:</strong> ${order.parcelle_cadastrale}</p>` : ''}
                    ${order.categories_travaux ? `
                      <p style="margin: 4px 0; color: #1f2937;"><strong>Catégories:</strong> ${
                        Array.isArray(order.categories_travaux) 
                          ? order.categories_travaux.join(', ') 
                          : (typeof order.categories_travaux === 'string' ? JSON.parse(order.categories_travaux || '[]').join(', ') : '')
                      }</p>
                    ` : ''}
                  </div>
                ` : ''}
              </div>
            ` : ''}
            
            <div style="margin-top: 40px; padding: 20px; background-color: #f9fafb; border-radius: 8px; text-align: center;">
              <p style="margin: 10px 0; color: #6b7280;">Pour toute question, contactez-nous:</p>
              <p style="margin: 10px 0;"><strong style="color: #1f2937;">📞 09 78 45 50 63</strong></p>
              <p style="margin: 10px 0;"><strong style="color: #10B981;">✉️ contact@effinor.fr</strong></p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Send via N8N webhook if configured, otherwise show error
      if (n8nWebhookUrl) {
        const response = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: order.email,
            subject: `Devis EFFINOR - ${order.nom_client || 'Commande'}`,
            html: emailHTML
          })
        });

        if (!response.ok) {
          throw new Error('Échec de l\'envoi de l\'email');
        }

        // Update order status
        await supabase
          .from('commandes')
          .update({ statut: 'Devis envoyé' })
          .eq('id', id);

        setOrder({ ...order, statut: 'Devis envoyé' });

        toast({
          title: "Email envoyé",
          description: `Devis envoyé à ${order.email}`
        });
      } else {
        // Fallback: open mailto link with pre-filled content (limited)
        const mailtoSubject = encodeURIComponent(`Devis EFFINOR - ${order.nom_client || 'Commande'}`);
        const mailtoBody = encodeURIComponent(`Bonjour,\n\nVeuillez trouver ci-joint le devis pour votre commande.\n\nCordialement,\nL'équipe EFFINOR`);
        
        window.open(`mailto:${order.email}?subject=${mailtoSubject}&body=${mailtoBody}`, '_blank');
        
        toast({
          title: "Ouvrir le client email",
          description: "Un client email va s'ouvrir. Pour envoyer un devis HTML complet, configurez VITE_N8N_WEBHOOK_URL dans votre .env"
        });
      }
    } catch (err) {
      logger.error('❌ Erreur envoi email:', err);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'email. Vérifiez la configuration du webhook N8N.",
        variant: "destructive"
      });
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page p-4 md:p-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-secondary-500 mx-auto mb-4" />
            <p className="text-gray-600">Chargement de la commande...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="admin-page p-4 md:p-8">
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="text-red-600 text-2xl">⚠️</div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-red-800 mb-2">
                {error ? 'Erreur de chargement' : 'Commande introuvable'}
              </h2>
              <p className="text-red-700 mb-4">{error || 'Cette commande n\'existe pas.'}</p>
              <div className="mt-6 flex gap-3">
                <Button 
                  onClick={() => navigate('/admin/orders')} 
                  className="bg-secondary-500 hover:bg-secondary-600"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux commandes
                </Button>
                <Button onClick={fetchOrderData} variant="outline">
                  Réessayer
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total from order lines
  const calculatedTotal = orderLines.reduce((sum, line) => {
    const price = line.prix_unitaire || line.products?.prix || 0;
    const qty = line.quantite || 1;
    return sum + (parseFloat(price) * qty);
  }, 0);

  // Format date helper
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format short date helper
  const formatShortDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <>
      <Helmet>
        <title>Commande #{order.id.slice(0, 8)} | Effinor Admin</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Sticky Header Bar */}
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/orders')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Commande #{order.id.slice(0, 8)}
                  </h1>
                  <Badge className={`${getStatusColor(order.statut)} text-sm px-3 py-1`}>
                    {order.statut || 'Nouveau Devis'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Créée le {formatDate(order.date_creation || order.created_at)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Status Dropdown */}
              <Select
                value={order.statut || 'Nouveau Devis'}
                onValueChange={handleStatusChange}
                disabled={updating}
              >
                <SelectTrigger className="w-48 font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nouveau Devis">Nouveau Devis</SelectItem>
                  <SelectItem value="Devis envoyé">Devis envoyé</SelectItem>
                  <SelectItem value="En cours">En cours</SelectItem>
                  <SelectItem value="Validé">Validé</SelectItem>
                  <SelectItem value="Annulé">Annulé</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Action Buttons */}
              <Button
                onClick={handleSendQuote}
                disabled={sendingEmail || !order.email || updating}
                className="flex items-center gap-2 px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 disabled:bg-gray-300"
              >
                <Mail className="w-4 h-4" />
                {sendingEmail ? 'Envoi...' : 'Envoyer devis'}
              </Button>
              
              <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Layout: Sidebar + Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Fixed 320px */}
          <aside className="hidden lg:flex w-80 bg-gray-50 border-r border-gray-200 flex-col overflow-y-auto p-6 space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-secondary-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 truncate">{order.nom_client || 'Client'}</h3>
                  {order.societe && <p className="text-sm text-gray-500 truncate">{order.societe}</p>}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <a href={`mailto:${order.email}`} className="text-secondary-600 hover:underline break-all">
                    {order.email || '-'}
                  </a>
                </div>
                
                {order.telephone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <a href={`tel:${order.telephone}`} className="text-gray-900 hover:text-secondary-600">
                      {order.telephone}
                    </a>
                  </div>
                )}
                
                {order.societe && (
                  <div className="flex items-center gap-3 text-sm">
                    <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600 truncate">{order.societe}</span>
                  </div>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingCustomer(true);
                  setCustomerData({
                    nom_client: order.nom_client || '',
                    email: order.email || '',
                    telephone: order.telephone || '',
                    societe: order.societe || ''
                  });
                }}
                className="mt-4 w-full text-sm text-secondary-600 hover:bg-secondary-50"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier les informations
              </Button>
            </div>
            
            {/* Customer Edit Modal */}
            {editingCustomer && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setEditingCustomer(false);
                  setCustomerData({
                    nom_client: order.nom_client || '',
                    email: order.email || '',
                    telephone: order.telephone || '',
                    societe: order.societe || ''
                  });
                }
              }}>
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Modifier les informations</h2>
                    <button
                      onClick={() => {
                        setEditingCustomer(false);
                        setCustomerData({
                          nom_client: order.nom_client || '',
                          email: order.email || '',
                          telephone: order.telephone || '',
                          societe: order.societe || ''
                        });
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveCustomer();
                  }} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                      <Input
                        value={customerData.nom_client}
                        onChange={(e) => setCustomerData({...customerData, nom_client: e.target.value})}
                        placeholder="Nom du client"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <Input
                        type="email"
                        value={customerData.email}
                        onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                        placeholder="email@exemple.fr"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                      <Input
                        value={customerData.telephone}
                        onChange={(e) => setCustomerData({...customerData, telephone: e.target.value})}
                        placeholder="06 12 34 56 78"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Société</label>
                      <Input
                        value={customerData.societe}
                        onChange={(e) => setCustomerData({...customerData, societe: e.target.value})}
                        placeholder="Nom de la société"
                      />
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        type="submit"
                        disabled={updating}
                        className="flex-1 bg-secondary-500 hover:bg-secondary-600 text-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Enregistrer
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setEditingCustomer(false);
                          setCustomerData({
                            nom_client: order.nom_client || '',
                            email: order.email || '',
                            telephone: order.telephone || '',
                            societe: order.societe || ''
                          });
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        Annuler
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <h4 className="font-semibold text-gray-900 mb-3">Statistiques</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Nb produits</span>
                  <span className="font-semibold text-gray-900">{orderLines.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total HT</span>
                  <span className="font-semibold text-secondary-600">
                    {calculatedTotal > 0 ? `${calculatedTotal.toFixed(2)}€` : 'Sur devis'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Date création</span>
                  <span className="text-sm text-gray-900">{formatShortDate(order.date_creation || order.created_at)}</span>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <h4 className="font-semibold text-gray-900 mb-3">Actions rapides</h4>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm hover:bg-gray-50"
                  onClick={() => {
                    toast({
                      title: "Fonctionnalité à venir",
                      description: "Le téléchargement PDF sera disponible prochainement.",
                    });
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Télécharger PDF
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm hover:bg-gray-50"
                  onClick={() => {
                    toast({
                      title: "Fonctionnalité à venir",
                      description: "La duplication de commande sera disponible prochainement.",
                    });
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Dupliquer commande
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm text-red-600 hover:bg-red-50"
                  onClick={() => {
                    if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.')) {
                      // Handle delete
                      toast({
                        title: "Fonctionnalité à venir",
                        description: "La suppression de commande sera disponible prochainement.",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>
            
            {/* Activity Timeline */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <h4 className="font-semibold text-gray-900 mb-3">Activité récente</h4>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-secondary-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">Commande créée</p>
                    <p className="text-xs text-gray-500">{formatShortDate(order.date_creation || order.created_at)}</p>
                  </div>
                </div>
                {order.statut && order.statut !== 'Nouveau Devis' && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">Statut: {order.statut}</p>
                      <p className="text-xs text-gray-500">Mis à jour récemment</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 bg-white flex flex-col overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 px-6 bg-white">
              <div className="flex gap-6 overflow-x-auto">
                {['Résumé', 'Produits', 'Informations CEE', 'Notes'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`
                      py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                      ${activeTab === tab 
                        ? 'border-secondary-500 text-secondary-600' 
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                      }
                    `}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Résumé Tab */}
              {activeTab === 'Résumé' && (
                <div className="max-w-4xl space-y-6">
                  {/* Order Summary Cards */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600 mb-1">Montant total</p>
                          <p className="text-2xl font-bold text-blue-900">
                            {calculatedTotal > 0 ? `${calculatedTotal.toFixed(2)}€` : 'Sur devis'}
                          </p>
                        </div>
                        <Euro className="w-8 h-8 text-blue-400" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600 mb-1">Produits</p>
                          <p className="text-2xl font-bold text-green-900">{orderLines.length}</p>
                        </div>
                        <Package className="w-8 h-8 text-green-400" />
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-purple-600 mb-1">Statut</p>
                          <p className="text-lg font-semibold text-purple-900">{order.statut || 'Nouveau Devis'}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-purple-400" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Customer Details */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-lg text-gray-900 mb-4">Détails client</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm text-gray-600">Nom complet</label>
                        <p className="font-medium text-gray-900 mt-1">{order.nom_client || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Société</label>
                        <p className="font-medium text-gray-900 mt-1">{order.societe || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Email</label>
                        <p className="font-medium text-gray-900 mt-1">{order.email || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Téléphone</label>
                        <p className="font-medium text-gray-900 mt-1">{order.telephone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Produits Tab */}
              {activeTab === 'Produits' && (
                <div className="max-w-6xl space-y-6">
                  {/* Add Product Section */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-secondary-500" />
                      Ajouter un produit
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Select
                        value={selectedProduct}
                        onValueChange={setSelectedProduct}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Sélectionner un produit" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableProducts.map(product => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.nom} - {product.prix ? `${parseFloat(product.prix).toFixed(2)}€` : 'Sur devis'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-24"
                        placeholder="Qté"
                      />
                      <Button
                        onClick={handleAddProduct}
                        disabled={!selectedProduct || updating}
                        className="bg-secondary-500 hover:bg-secondary-600 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter
                      </Button>
                    </div>
                  </div>

                  {/* Products Table */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Package className="w-5 h-5 text-secondary-500" />
                        Produits Commandés
                      </h3>
                    </div>
                    
                    {orderLines.length > 0 ? (
                      <>
                        <div className="divide-y divide-gray-200">
                          {orderLines.map((line, index) => {
                            const product = line.products || {};
                            const productName = product.nom || line.nom || 'Produit inconnu';
                            const productImage = product.image_1 || product.image_url || line.image_1;
                            const qty = line.quantite || 1;
                            const unitPrice = line.prix_unitaire || product.prix || 0;
                            const lineTotal = parseFloat(unitPrice) * qty;
                            const hasId = line.id;
                            
                            return (
                              <div key={line.id || index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                  {productImage && (
                                    <img
                                      src={getImageUrl(productImage)}
                                      alt={productName}
                                      className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                                      onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/64?text=Image';
                                      }}
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 mb-1">{productName}</h4>
                                    {product.slug && (
                                      <Link
                                        to={`/produit/${product.slug}`}
                                        className="text-xs text-secondary-600 hover:underline"
                                        target="_blank"
                                      >
                                        Voir le produit →
                                      </Link>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-6">
                                    <div className="text-center">
                                      <label className="text-xs text-gray-600 block mb-1">Quantité</label>
                                      {hasId ? (
                                        <Input
                                          type="number"
                                          min="1"
                                          value={qty}
                                          onChange={(e) => {
                                            const newQty = Math.max(1, parseInt(e.target.value) || 1);
                                            if (newQty !== qty) {
                                              handleUpdateQuantity(line.id, newQty);
                                            }
                                          }}
                                          onBlur={(e) => {
                                            const newQty = Math.max(1, parseInt(e.target.value) || 1);
                                            handleUpdateQuantity(line.id, newQty);
                                          }}
                                          disabled={updatingQuantity[line.id]}
                                          className="w-20 h-8 text-center"
                                        />
                                      ) : (
                                        <span className="font-medium">{qty}</span>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <label className="text-xs text-gray-600 block mb-1">Prix unit.</label>
                                      <span className="font-medium text-sm">
                                        {unitPrice > 0 ? `${parseFloat(unitPrice).toFixed(2)}€` : 'Sur devis'}
                                      </span>
                                    </div>
                                    <div className="text-right w-24">
                                      <label className="text-xs text-gray-600 block mb-1">Total</label>
                                      <span className="font-bold text-secondary-600">
                                        {unitPrice > 0 ? `${lineTotal.toFixed(2)}€` : 'Sur devis'}
                                      </span>
                                    </div>
                                    {hasId && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveProduct(line.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {/* Total */}
                        {(order.total || calculatedTotal > 0) && (
                          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-semibold text-gray-900">TOTAL HT</span>
                              <span className="text-2xl font-bold text-secondary-600">
                                {(order.total || calculatedTotal).toFixed(2)}€
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-12 text-center text-gray-500">
                        <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Aucun produit trouvé dans cette commande.</p>
                        <p className="text-sm mt-2">Utilisez le formulaire ci-dessus pour ajouter des produits.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Informations CEE Tab */}
              {activeTab === 'Informations CEE' && order && (
                <div className="max-w-4xl">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <FileCheck className="w-5 h-5 text-secondary-500" />
                          Informations CEE Légales
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                          Informations nécessaires pour la génération du devis CEE
                        </p>
                      </div>
                      {!editingCEE ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingCEE(true)}
                          className="text-secondary-600 hover:text-secondary-700"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Modifier
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingCEE(false);
                              setCeeData({
                                adresse_siege: order.adresse_siege || '',
                                ville_siege: order.ville_siege || '',
                                code_postal_siege: order.code_postal_siege || '',
                                numero_siret: order.numero_siret || '',
                                siren: order.siren || '',
                                adresse_travaux: order.adresse_travaux || '',
                                ville_travaux: order.ville_travaux || '',
                                code_postal_travaux: order.code_postal_travaux || '',
                                siret_site_travaux: order.siret_site_travaux || '',
                                region: order.region || '',
                                zone_climatique: order.zone_climatique || '',
                                raison_sociale_beneficiaire: order.raison_sociale_beneficiaire || '',
                                telephone_fixe_beneficiaire: order.telephone_fixe_beneficiaire || '',
                                email_beneficiaire: order.email_beneficiaire || '',
                                civilite_responsable: order.civilite_responsable || '',
                                nom_responsable: order.nom_responsable || '',
                                prenom_responsable: order.prenom_responsable || '',
                                telephone_responsable: order.telephone_responsable || '',
                                categories_travaux: Array.isArray(order.categories_travaux) ? order.categories_travaux : (order.categories_travaux ? JSON.parse(order.categories_travaux) : []),
                                parcelle_cadastrale: order.parcelle_cadastrale || '',
                                qualification: order.qualification || '',
                                surface_m2: order.surface_m2 || '',
                                certificat_preparatoire: order.certificat_preparatoire || ''
                              });
                            }}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Annuler
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveCEE}
                            disabled={updating}
                            className="bg-secondary-500 hover:bg-secondary-600 text-white"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Enregistrer
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {/* CEE Content - Full sections */}
                    {editingCEE ? (
                      <div className="p-6 space-y-6">
                        {/* Section 1: Siège Social */}
                        <div className="border border-gray-200 rounded-lg p-4">
                          <button
                            type="button"
                            onClick={() => setExpandedSections({...expandedSections, siege: !expandedSections.siege})}
                            className="w-full flex items-center justify-between mb-4"
                          >
                            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                              <Building className="w-4 h-4 text-secondary-500" />
                              Siège Social
                            </h3>
                            {expandedSections.siege ? (
                              <ChevronUp className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                          {expandedSections.siege && (
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                                <Input
                                  value={ceeData.adresse_siege}
                                  onChange={(e) => setCeeData({...ceeData, adresse_siege: e.target.value})}
                                  placeholder="Adresse du siège social"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                                <Input
                                  value={ceeData.ville_siege}
                                  onChange={(e) => setCeeData({...ceeData, ville_siege: e.target.value})}
                                  placeholder="Ville"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Code Postal</label>
                                <Input
                                  value={ceeData.code_postal_siege}
                                  onChange={(e) => setCeeData({...ceeData, code_postal_siege: e.target.value})}
                                  placeholder="75001"
                                  maxLength={5}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">SIRET (14 chiffres)</label>
                                <Input
                                  value={ceeData.numero_siret}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 14);
                                    setCeeData({...ceeData, numero_siret: value});
                                  }}
                                  placeholder="12345678901234"
                                  maxLength={14}
                                />
                                {ceeData.numero_siret && !validateSIRET(ceeData.numero_siret) && (
                                  <p className="text-xs text-red-600 mt-1">Le SIRET doit contenir 14 chiffres</p>
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">SIREN (9 chiffres)</label>
                                <Input
                                  value={ceeData.siren}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                                    setCeeData({...ceeData, siren: value});
                                  }}
                                  placeholder="123456789"
                                  maxLength={9}
                                />
                                {ceeData.siren && !validateSIREN(ceeData.siren) && (
                                  <p className="text-xs text-red-600 mt-1">Le SIREN doit contenir 9 chiffres</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Section 2: Adresse des Travaux */}
                        <div className="border border-gray-200 rounded-lg p-4">
                          <button
                            type="button"
                            onClick={() => setExpandedSections({...expandedSections, travaux: !expandedSections.travaux})}
                            className="w-full flex items-center justify-between mb-4"
                          >
                            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-secondary-500" />
                              Adresse des Travaux
                            </h3>
                            {expandedSections.travaux ? (
                              <ChevronUp className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                          {expandedSections.travaux && (
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                                <Input
                                  value={ceeData.adresse_travaux}
                                  onChange={(e) => setCeeData({...ceeData, adresse_travaux: e.target.value})}
                                  placeholder="Adresse des travaux"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                                <Input
                                  value={ceeData.ville_travaux}
                                  onChange={(e) => setCeeData({...ceeData, ville_travaux: e.target.value})}
                                  placeholder="Ville"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Code Postal</label>
                                <Input
                                  value={ceeData.code_postal_travaux}
                                  onChange={(e) => setCeeData({...ceeData, code_postal_travaux: e.target.value})}
                                  placeholder="75001"
                                  maxLength={5}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">SIRET Site Travaux (14 chiffres)</label>
                                <Input
                                  value={ceeData.siret_site_travaux}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 14);
                                    setCeeData({...ceeData, siret_site_travaux: value});
                                  }}
                                  placeholder="12345678901234"
                                  maxLength={14}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Région</label>
                                <Select
                                  value={ceeData.region || 'none'}
                                  onValueChange={(value) => setCeeData({...ceeData, region: value === 'none' ? '' : value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner une région" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">Aucune</SelectItem>
                                    <SelectItem value="Auvergne-Rhône-Alpes">Auvergne-Rhône-Alpes</SelectItem>
                                    <SelectItem value="Bourgogne-Franche-Comté">Bourgogne-Franche-Comté</SelectItem>
                                    <SelectItem value="Bretagne">Bretagne</SelectItem>
                                    <SelectItem value="Centre-Val de Loire">Centre-Val de Loire</SelectItem>
                                    <SelectItem value="Corse">Corse</SelectItem>
                                    <SelectItem value="Grand Est">Grand Est</SelectItem>
                                    <SelectItem value="Hauts-de-France">Hauts-de-France</SelectItem>
                                    <SelectItem value="Île-de-France">Île-de-France</SelectItem>
                                    <SelectItem value="Normandie">Normandie</SelectItem>
                                    <SelectItem value="Nouvelle-Aquitaine">Nouvelle-Aquitaine</SelectItem>
                                    <SelectItem value="Occitanie">Occitanie</SelectItem>
                                    <SelectItem value="Pays de la Loire">Pays de la Loire</SelectItem>
                                    <SelectItem value="Provence-Alpes-Côte d'Azur">Provence-Alpes-Côte d'Azur</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Zone Climatique</label>
                                <Select
                                  value={ceeData.zone_climatique || 'none'}
                                  onValueChange={(value) => setCeeData({...ceeData, zone_climatique: value === 'none' ? '' : value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner une zone" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">Aucune</SelectItem>
                                    <SelectItem value="H1">H1</SelectItem>
                                    <SelectItem value="H2">H2</SelectItem>
                                    <SelectItem value="H3">H3</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Section 3: Bénéficiaire de Travaux */}
                        <div className="border border-gray-200 rounded-lg p-4">
                          <button
                            type="button"
                            onClick={() => setExpandedSections({...expandedSections, beneficiaire: !expandedSections.beneficiaire})}
                            className="w-full flex items-center justify-between mb-4"
                          >
                            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-secondary-500" />
                              Bénéficiaire de Travaux
                            </h3>
                            {expandedSections.beneficiaire ? (
                              <ChevronUp className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                          {expandedSections.beneficiaire && (
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Raison Sociale</label>
                                <Input
                                  value={ceeData.raison_sociale_beneficiaire}
                                  onChange={(e) => setCeeData({...ceeData, raison_sociale_beneficiaire: e.target.value})}
                                  placeholder="Raison sociale du bénéficiaire"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone Fixe</label>
                                <Input
                                  value={ceeData.telephone_fixe_beneficiaire}
                                  onChange={(e) => setCeeData({...ceeData, telephone_fixe_beneficiaire: e.target.value})}
                                  placeholder="01 23 45 67 89"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <Input
                                  type="email"
                                  value={ceeData.email_beneficiaire}
                                  onChange={(e) => setCeeData({...ceeData, email_beneficiaire: e.target.value})}
                                  placeholder="email@exemple.fr"
                                />
                                {ceeData.email_beneficiaire && !validateEmail(ceeData.email_beneficiaire) && (
                                  <p className="text-xs text-red-600 mt-1">Format d'email invalide</p>
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Civilité Responsable</label>
                                <Select
                                  value={ceeData.civilite_responsable || 'none'}
                                  onValueChange={(value) => setCeeData({...ceeData, civilite_responsable: value === 'none' ? '' : value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Civilité" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">Aucune</SelectItem>
                                    <SelectItem value="Mr">Mr</SelectItem>
                                    <SelectItem value="Mme">Mme</SelectItem>
                                    <SelectItem value="Mlle">Mlle</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom Responsable</label>
                                <Input
                                  value={ceeData.nom_responsable}
                                  onChange={(e) => setCeeData({...ceeData, nom_responsable: e.target.value})}
                                  placeholder="Nom du responsable"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom Responsable</label>
                                <Input
                                  value={ceeData.prenom_responsable}
                                  onChange={(e) => setCeeData({...ceeData, prenom_responsable: e.target.value})}
                                  placeholder="Prénom du responsable"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone Responsable</label>
                                <Input
                                  value={ceeData.telephone_responsable}
                                  onChange={(e) => setCeeData({...ceeData, telephone_responsable: e.target.value})}
                                  placeholder="06 12 34 56 78"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Section 4: Détails des Travaux */}
                        <div className="border border-gray-200 rounded-lg p-4">
                          <button
                            type="button"
                            onClick={() => setExpandedSections({...expandedSections, details: !expandedSections.details})}
                            className="w-full flex items-center justify-between mb-4"
                          >
                            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                              <FileText className="w-4 h-4 text-secondary-500" />
                              Détails des Travaux
                            </h3>
                            {expandedSections.details ? (
                              <ChevronUp className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                          {expandedSections.details && (
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Catégories de Travaux</label>
                                <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg min-h-12">
                                  {['Déstratificateur d\'air', 'Luminaire extérieur', 'Luminaire intérieur', 'Éclairage LED', 'Système de gestion d\'énergie', 'Isolation', 'Chauffage', 'Ventilation'].map(cat => {
                                    const isSelected = ceeData.categories_travaux.includes(cat);
                                    return (
                                      <button
                                        key={cat}
                                        type="button"
                                        onClick={() => {
                                          if (isSelected) {
                                            setCeeData({
                                              ...ceeData,
                                              categories_travaux: ceeData.categories_travaux.filter(c => c !== cat)
                                            });
                                          } else {
                                            setCeeData({
                                              ...ceeData,
                                              categories_travaux: [...ceeData.categories_travaux, cat]
                                            });
                                          }
                                        }}
                                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                          isSelected
                                            ? 'bg-secondary-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                      >
                                        {cat}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Parcelle Cadastrale</label>
                                <Input
                                  value={ceeData.parcelle_cadastrale}
                                  onChange={(e) => setCeeData({...ceeData, parcelle_cadastrale: e.target.value})}
                                  placeholder="Ex: 000 AB 00123"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                                <Input
                                  value={ceeData.qualification}
                                  onChange={(e) => setCeeData({...ceeData, qualification: e.target.value})}
                                  placeholder="Ex: 3 étoiles"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Surface (m²)</label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={ceeData.surface_m2}
                                  onChange={(e) => setCeeData({...ceeData, surface_m2: e.target.value})}
                                  placeholder="0"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Certificat Préparatoire</label>
                                <div className="flex items-center gap-4">
                                  <Input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      if (file) handleCertificatUpload(file);
                                    }}
                                    disabled={uploadingCertificat}
                                    className="flex-1"
                                  />
                                  {ceeData.certificat_preparatoire && (
                                    <a
                                      href={getImageUrl(ceeData.certificat_preparatoire)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-secondary-600 hover:underline text-sm"
                                    >
                                      Voir le fichier
                                    </a>
                                  )}
                                </div>
                                {uploadingCertificat && (
                                  <p className="text-xs text-gray-500 mt-1">Téléchargement en cours...</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 space-y-4">
                        {/* Display saved CEE data */}
                        {(order.adresse_siege || order.numero_siret) && (
                          <div className="border-l-4 border-secondary-500 pl-4 py-2">
                            <h3 className="font-semibold text-sm text-gray-700 mb-2">Siège Social</h3>
                            <div className="space-y-1 text-sm text-gray-600">
                              {order.adresse_siege && <p>{order.adresse_siege}</p>}
                              {(order.ville_siege || order.code_postal_siege) && (
                                <p>{order.code_postal_siege} {order.ville_siege}</p>
                              )}
                              {order.numero_siret && <p><strong>SIRET:</strong> {order.numero_siret}</p>}
                              {order.siren && <p><strong>SIREN:</strong> {order.siren}</p>}
                            </div>
                          </div>
                        )}

                        {(order.adresse_travaux || order.region) && (
                          <div className="border-l-4 border-secondary-500 pl-4 py-2">
                            <h3 className="font-semibold text-sm text-gray-700 mb-2">Adresse des Travaux</h3>
                            <div className="space-y-1 text-sm text-gray-600">
                              {order.adresse_travaux && <p>{order.adresse_travaux}</p>}
                              {(order.ville_travaux || order.code_postal_travaux) && (
                                <p>{order.code_postal_travaux} {order.ville_travaux}</p>
                              )}
                              {order.region && <p><strong>Région:</strong> {order.region}</p>}
                              {order.zone_climatique && <p><strong>Zone Climatique:</strong> {order.zone_climatique}</p>}
                              {order.siret_site_travaux && <p><strong>SIRET Site:</strong> {order.siret_site_travaux}</p>}
                            </div>
                          </div>
                        )}

                        {(order.raison_sociale_beneficiaire || order.nom_responsable) && (
                          <div className="border-l-4 border-secondary-500 pl-4 py-2">
                            <h3 className="font-semibold text-sm text-gray-700 mb-2">Bénéficiaire</h3>
                            <div className="space-y-1 text-sm text-gray-600">
                              {order.raison_sociale_beneficiaire && <p><strong>Raison Sociale:</strong> {order.raison_sociale_beneficiaire}</p>}
                              {(order.civilite_responsable || order.prenom_responsable || order.nom_responsable) && (
                                <p>
                                  {order.civilite_responsable} {order.prenom_responsable} {order.nom_responsable}
                                </p>
                              )}
                              {order.email_beneficiaire && <p><strong>Email:</strong> {order.email_beneficiaire}</p>}
                              {order.telephone_responsable && <p><strong>Tél:</strong> {order.telephone_responsable}</p>}
                            </div>
                          </div>
                        )}

                        {(order.surface_m2 || order.categories_travaux) && (
                          <div className="border-l-4 border-secondary-500 pl-4 py-2">
                            <h3 className="font-semibold text-sm text-gray-700 mb-2">Détails Travaux</h3>
                            <div className="space-y-1 text-sm text-gray-600">
                              {order.surface_m2 && <p><strong>Surface:</strong> {order.surface_m2} m²</p>}
                              {order.qualification && <p><strong>Qualification:</strong> {order.qualification}</p>}
                              {order.parcelle_cadastrale && <p><strong>Parcelle:</strong> {order.parcelle_cadastrale}</p>}
                              {order.categories_travaux && (
                                <div>
                                  <strong>Catégories:</strong>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {(Array.isArray(order.categories_travaux) ? order.categories_travaux : JSON.parse(order.categories_travaux || '[]')).map((cat, idx) => (
                                      <Badge key={idx} className="bg-secondary-100 text-secondary-700">
                                        {cat}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {order.certificat_preparatoire && (
                                <p>
                                  <strong>Certificat:</strong>{' '}
                                  <a
                                    href={getImageUrl(order.certificat_preparatoire)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-secondary-600 hover:underline"
                                  >
                                    Télécharger
                                  </a>
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {!order.adresse_siege && !order.adresse_travaux && !order.raison_sociale_beneficiaire && !order.surface_m2 && (
                          <p className="text-gray-500 text-center py-8">Aucune information CEE renseignée</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes Tab */}
              {activeTab === 'Notes' && order && (
                <div className="max-w-4xl">
                  <NotesTimeline 
                    commandeId={order.id}
                    currentUser={currentUserName}
                    title="Notes Internes"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default AdminOrderDetail;
