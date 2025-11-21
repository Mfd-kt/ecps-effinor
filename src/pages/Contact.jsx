import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Mail, Phone, MapPin, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, sujet: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([
          { 
            nom: formData.nom,
            societe: formData.societe,
            email: formData.email,
            telephone: formData.telephone,
            message: `Sujet: ${formData.sujet}\n\nMessage: ${formData.message}`,
            source: 'Formulaire de Contact',
            statut: 'Nouveau',
            type_projet: formData.sujet,
            page_origine: '/contact'
          }
        ]);

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
      console.error('Error submitting form:', error);
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
        {/* Header - Fixed Positioning */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">Contactez-nous</h1>
            <p className="text-xl text-teal-50">Nous sommes à votre écoute pour tous vos projets</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Email */}
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                <div className="flex items-start gap-4">
                  <div className="bg-teal-600 text-white p-3 rounded-lg flex-shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
                    <p className="text-gray-600 mb-1">
                      <a href="mailto:contact@effinor.fr" className="hover:text-teal-600 font-semibold">
                        contact@effinor.fr
                      </a>
                    </p>
                    <p className="text-gray-600">
                      <a href="mailto:devis@effinor.fr" className="hover:text-teal-600 font-semibold">
                        devis@effinor.fr
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                <div className="flex items-start gap-4">
                  <div className="bg-teal-600 text-white p-3 rounded-lg flex-shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Téléphone</h3>
                    <p className="text-gray-600 mb-1">
                      <a href="tel:+33978455063" className="hover:text-teal-600 font-semibold">
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
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                <div className="flex items-start gap-4">
                  <div className="bg-teal-600 text-white p-3 rounded-lg flex-shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Localisation</h3>
                    <p className="text-gray-600 font-semibold">Siège Social</p>
                    <p className="text-gray-600">1 Avenue de l'Europe</p>
                    <p className="text-gray-600">94320 Thiais Tour europa</p>
                    <p className="text-gray-600 mt-2 text-sm">France / Europe</p>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="bg-teal-50 border-l-4 border-teal-600 p-6 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-teal-900 mb-1">Réponse sous 24h garantie</p>
                    <p className="text-teal-800 text-sm">
                      Notre équipe s'engage à vous répondre dans les meilleurs délais.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Envoyez-nous un message</h2>

                {submitted && (
                  <div className="bg-teal-50 border border-teal-200 text-teal-800 p-4 rounded-lg mb-6">
                    ✅ Merci ! Votre message a été envoyé avec succès.
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Row 1: Name and Company */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="nom" className="block text-sm font-semibold text-gray-700 mb-2">
                        Nom complet *
                      </label>
                      <Input
                        id="nom"
                        name="nom"
                        type="text"
                        placeholder="Jean Dupont"
                        value={formData.nom}
                        onChange={handleInputChange}
                        required
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="societe" className="block text-sm font-semibold text-gray-700 mb-2">
                        Société
                      </label>
                      <Input
                        id="societe"
                        name="societe"
                        type="text"
                        placeholder="Nom de votre société"
                        value={formData.societe}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Row 2: Email and Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                        Email *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="jean.dupont@exemple.fr"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="telephone" className="block text-sm font-semibold text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <Input
                        id="telephone"
                        name="telephone"
                        type="tel"
                        placeholder="+33 6 XX XX XX XX"
                        value={formData.telephone}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="sujet" className="block text-sm font-semibold text-gray-700 mb-2">
                      Sujet *
                    </label>
                    <Select value={formData.sujet} onValueChange={handleSelectChange} required>
                      <SelectTrigger className="w-full">
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
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Décrivez votre projet ou votre demande..."
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-lg transition"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    En envoyant ce formulaire, vous acceptez notre 
                    <Link to="/politique-confidentialite" className="text-teal-600 hover:underline"> politique de confidentialité</Link>.
                  </p>
                </form>
              </div>
            </div>

          </div>

          {/* Company Information Section */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Informations sur l'Entreprise</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              {/* Identification */}
              <div className="border-l-4 border-teal-600 pl-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Identification</h3>
                <div className="space-y-2 text-gray-600">
                  <p><strong>Dénomination:</strong> ECPS</p>
                  <p><strong>Nom commercial:</strong> EFFINOR Air-Energie-Lighting</p>
                  <p><strong>Forme juridique:</strong> SAS</p>
                  <p><strong>RCS:</strong> 907 547 665 R.C.S. Créteil</p>
                  <p><strong>EUID:</strong> FR9401.907547665</p>
                </div>
              </div>

              {/* Capital & Activities */}
              <div className="border-l-4 border-teal-600 pl-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Capital & Activités</h3>
                <div className="space-y-2 text-gray-600">
                  <p><strong>Capital social:</strong> 115 900,00 €</p>
                  <p><strong>Code APE:</strong> 7112 B</p>
                  <p><strong>Activité:</strong> Bureau d'étude, performance énergétique</p>
                  <p><strong>Services:</strong> Audit thermique, Chauffage, Climatisation, Plomberie, Électricité</p>
                </div>
              </div>

              {/* Dates & Duration */}
              <div className="border-l-4 border-teal-600 pl-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Dates & Durée</h3>
                <div className="space-y-2 text-gray-600">
                  <p><strong>Création:</strong> 29/11/2021</p>
                  <p><strong>Durée:</strong> Jusqu'au 25/11/2120</p>
                  <p><strong>Clôture exercice:</strong> 31 décembre</p>
                  <p><strong>Localisation:</strong> France / Europe</p>
                </div>
              </div>

            </div>
          </div>

          {/* Map Section (Optional) */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-96 bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-semibold">1 Avenue de l'Europe, 94320 Thiais Tour europa</p>
                <p className="text-gray-500 text-sm mt-2">Carte interactive à intégrer</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}