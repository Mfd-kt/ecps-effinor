import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Mail, Phone, MapPin, Clock, AlertCircle, Loader2, User, Building, MessageSquare, Send, CheckCircle2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/utils/logger';
import { useToast } from '@/components/ui/use-toast';
import { sanitizeFormData } from '@/utils/sanitize';

export default function Contact() {
  const { toast } = useToast();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    nom: '',
    societe: '',
    email: '',
    telephone: '',
    sujet: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    if (!formData.sujet) newErrors.sujet = 'Le sujet est requis';
    if (!formData.message.trim()) newErrors.message = 'Le message est requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, sujet: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) {
      toast({
        title: "Veuillez corriger les erreurs",
        description: "Certains champs requis sont manquants ou invalides.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Sanitize form data before insertion
      const sanitizedFormData = sanitizeFormData({
            nom: formData.nom,
            societe: formData.societe,
            email: formData.email,
            telephone: formData.telephone,
            message: `Sujet: ${formData.sujet}\n\nMessage: ${formData.message}`,
            source: 'Formulaire de Contact',
            statut: 'Nouveau',
            type_projet: formData.sujet,
            page_origine: '/contact'
      });

      const { data, error } = await supabase
        .from('leads')
        .insert([sanitizedFormData])
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      setSubmitted(true);
      setFormData({
        nom: '',
        societe: '',
        email: '',
        telephone: '',
        sujet: '',
        message: ''
      });
      toast({
        title: "Message envoyé !",
        description: "Nous avons bien reçu votre message. Notre équipe vous répondra dans les plus brefs délais.",
      });
      setTimeout(() => setSubmitted(false), 5000);

    } catch (error) {
      logger.error('Error submitting form:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact | EFFINOR</title>
        <meta name="description" content="Contactez EFFINOR pour vos projets d'éclairage et performance énergétique" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section - Full Width Background */}
        <div className="w-full bg-primary-900 text-white py-8 md:py-12 pt-24">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-xl md:text-2xl font-bold mb-2 leading-tight text-white">Contactez-nous</h1>
              <p className="text-sm md:text-base text-white/90">Nous sommes à votre écoute pour tous vos projets</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto py-4 md:py-6 lg:py-8 max-w-7xl px-3 md:px-4 overflow-x-hidden">
          <div className="max-w-[95%] sm:max-w-lg md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
              
              {/* Contact Information */}
              <div className="md:col-span-2 lg:col-span-2 space-y-3 md:space-y-4">
                
                {/* Email */}
                <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-secondary-500 text-white p-2 rounded-lg flex-shrink-0">
                      <Mail className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm md:text-base font-bold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600 mb-1">
                      <a href="mailto:contact@effinor.fr" className="hover:text-secondary-600 font-semibold">
                        contact@effinor.fr
                      </a>
                    </p>
                    <p className="text-gray-600">
                      <a href="mailto:devis@effinor.fr" className="hover:text-secondary-600 font-semibold">
                        devis@effinor.fr
                      </a>
                    </p>
                  </div>
                </div>
              </div>

                {/* Phone */}
                <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-secondary-500 text-white p-2 rounded-lg flex-shrink-0">
                      <Phone className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm md:text-base font-bold text-gray-900 mb-1">Téléphone</h3>
                    <p className="text-gray-600 mb-1">
                      <a href="tel:+33978455063" className="hover:text-secondary-600 font-semibold">
                        09 78 45 50 63
                      </a>
                    </p>
                    <p className="text-gray-500 text-sm flex items-center gap-1 mt-2">
                      <Clock className="w-4 h-4" />
                      Lun-Ven : 9h-18h
                    </p>
                  </div>
                </div>
              </div>

                {/* Address */}
                <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-secondary-500 text-white p-2 rounded-lg flex-shrink-0">
                      <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm md:text-base font-bold text-gray-900 mb-1">Localisation</h3>
                    <p className="text-gray-600 font-semibold">Siège Social</p>
                    <p className="text-gray-600">1 Avenue de l'Europe</p>
                    <p className="text-gray-600">94320 Thiais Tour europa</p>
                    <p className="text-gray-600 mt-2 text-sm">France / Europe</p>
                  </div>
                </div>
              </div>

                {/* Response Time */}
                <div className="bg-secondary-50 border-l-4 border-secondary-500 p-3 md:p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-secondary-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-secondary-900 mb-0.5 text-xs md:text-sm">Réponse sous 24h garantie</p>
                      <p className="text-secondary-800 text-xs">
                        Notre équipe s'engage à vous répondre dans les meilleurs délais.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Contact Form */}
              <div className="md:col-span-2 lg:col-span-3">
                <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
                  {/* Form Header */}
                  <div className="text-center mb-4 md:mb-6">
                    <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-secondary-500/10 rounded-full mb-2">
                      <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-secondary-500" />
                    </div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-1">Envoyez-nous un message</h2>
                    <p className="text-gray-600 text-xs md:text-sm">Notre équipe vous répondra sous 24h</p>
                  </div>

                {/* Success Message */}
                {submitted && (
                  <div className="bg-secondary-50 border-2 border-secondary-200 text-secondary-800 p-4 rounded-lg mb-6 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Merci ! Votre message a été envoyé avec succès.</p>
                      <p className="text-sm">Nous vous répondrons dans les plus brefs délais.</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Row 1: Name and Company */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="nom" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 text-secondary-500" />
                        Nom complet *
                      </label>
                      <input
                        id="nom"
                        name="nom"
                        type="text"
                        placeholder="Jean Dupont"
                        value={formData.nom}
                        onChange={handleInputChange}
                        required
                        className={`w-full bg-gray-50 border ${
                          errors.nom ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-secondary-500 focus:ring-secondary-500/20'
                        } rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:ring-2 focus:outline-none`}
                      />
                      {errors.nom && (
                        <p className="text-red-600 text-xs mt-1">{errors.nom}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="societe" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Building className="w-4 h-4 text-secondary-500" />
                        Société
                      </label>
                      <input
                        id="societe"
                        name="societe"
                        type="text"
                        placeholder="Nom de votre société"
                        value={formData.societe}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Row 2: Email and Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-4 h-4 text-secondary-500" />
                        Email *
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="jean.dupont@exemple.fr"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className={`w-full bg-gray-50 border ${
                          errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-secondary-500 focus:ring-secondary-500/20'
                        } rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:ring-2 focus:outline-none`}
                      />
                      {errors.email && (
                        <p className="text-red-600 text-xs mt-1">{errors.email}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="telephone" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Phone className="w-4 h-4 text-secondary-500" />
                        Téléphone
                      </label>
                      <input
                        id="telephone"
                        name="telephone"
                        type="tel"
                        placeholder="+33 6 XX XX XX XX"
                        value={formData.telephone}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="sujet" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <MessageSquare className="w-4 h-4 text-secondary-500" />
                      Sujet *
                    </label>
                    <Select 
                      value={formData.sujet} 
                      onValueChange={(value) => {
                        handleSelectChange(value);
                        if (errors.sujet) {
                          setErrors(prev => ({ ...prev, sujet: null }));
                        }
                      }} 
                      required
                    >
                      <SelectTrigger className={`w-full bg-gray-50 border ${
                        errors.sujet ? 'border-red-500' : 'border-gray-200'
                      } rounded-lg px-4 py-3 text-gray-900 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20`}>
                        <SelectValue placeholder="Sélectionnez un sujet" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="devis">Demande de devis</SelectItem>
                        <SelectItem value="audit">Audit énergétique</SelectItem>
                        <SelectItem value="produit">Information produit</SelectItem>
                        <SelectItem value="commande">Suivi de commande</SelectItem>
                        <SelectItem value="support">Support technique</SelectItem>
                        <SelectItem value="partenariat">Partenariat</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.sujet && (
                      <p className="text-red-600 text-xs mt-1">{errors.sujet}</p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <MessageSquare className="w-4 h-4 text-secondary-500" />
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      placeholder="Décrivez votre projet ou votre demande..."
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className={`w-full bg-gray-50 border ${
                        errors.message ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-secondary-500 focus:ring-secondary-500/20'
                      } rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 resize-none transition-all duration-200 focus:ring-2 focus:outline-none`}
                    />
                    {errors.message && (
                      <p className="text-red-600 text-xs mt-1">{errors.message}</p>
                    )}
                  </div>

                  {/* 24h Badge */}
                  <div className="bg-secondary-50 border-l-4 border-secondary-500 p-4 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-secondary-600 flex-shrink-0" />
                    <p className="text-sm text-secondary-800">
                      <span className="font-semibold">Réponse sous 24h garantie</span> - Notre équipe s'engage à vous répondre dans les meilleurs délais.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-secondary-500 hover:bg-secondary-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg shadow-secondary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Envoyer le message
                      </>
                    )}
                  </button>

                  {/* Privacy Notice */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-2">
                      <Lock className="w-3 h-3" />
                    En envoyant ce formulaire, vous acceptez notre 
                      <Link to="/politique-confidentialite" className="text-secondary-600 hover:underline font-medium"> politique de confidentialité</Link>.
                  </p>
                  </div>
                </form>
              </div>
            </div>

          </div>

            {/* Company Information Section */}
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Informations sur l'Entreprise</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                
                {/* Identification */}
                <div className="border-l-4 border-secondary-600 pl-3 md:pl-4">
                  <h3 className="text-sm md:text-base font-bold text-gray-900 mb-2">Identification</h3>
                  <div className="space-y-1.5 text-xs md:text-sm text-gray-600">
                    <p><strong>Dénomination:</strong> ECPS</p>
                    <p><strong>Nom commercial:</strong> EFFINOR Air-Energie-Lighting</p>
                    <p><strong>Forme juridique:</strong> SAS</p>
                    <p><strong>RCS:</strong> 907 547 665 R.C.S. Créteil</p>
                    <p><strong>EUID:</strong> FR9401.907547665</p>
                  </div>
                </div>

                {/* Capital & Activities */}
                <div className="border-l-4 border-secondary-600 pl-3 md:pl-4">
                  <h3 className="text-sm md:text-base font-bold text-gray-900 mb-2">Capital & Activités</h3>
                  <div className="space-y-1.5 text-xs md:text-sm text-gray-600">
                    <p><strong>Capital social:</strong> 115 900,00 €</p>
                    <p><strong>Code APE:</strong> 7112 B</p>
                    <p><strong>Activité:</strong> Bureau d'étude, performance énergétique</p>
                    <p><strong>Services:</strong> Audit thermique, Chauffage, Climatisation, Plomberie, Électricité</p>
                  </div>
                </div>

                {/* Dates & Duration */}
                <div className="border-l-4 border-secondary-600 pl-3 md:pl-4">
                  <h3 className="text-sm md:text-base font-bold text-gray-900 mb-2">Dates & Durée</h3>
                  <div className="space-y-1.5 text-xs md:text-sm text-gray-600">
                    <p><strong>Création:</strong> 29/11/2021</p>
                    <p><strong>Durée:</strong> Jusqu'au 25/11/2120</p>
                    <p><strong>Clôture exercice:</strong> 31 décembre</p>
                    <p><strong>Localisation:</strong> France / Europe</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Map Section (Optional) */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="h-64 md:h-80 bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 md:w-10 md:h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 font-semibold text-xs md:text-sm">1 Avenue de l'Europe, 94320 Thiais Tour europa</p>
                  <p className="text-gray-500 text-xs mt-1">Carte interactive à intégrer</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}