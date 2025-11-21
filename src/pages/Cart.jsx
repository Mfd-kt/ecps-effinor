import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, Send, Loader2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, getTotalPrice } = useCart();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      company: '',
      message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) {
          setErrors(prev => ({ ...prev, [name]: null }));
      }
  };
  
  const validateForm = () => {
      const newErrors = {};
      if (!formData.name) newErrors.name = "Le nom est requis.";
      if (!formData.email) newErrors.email = "L'email est requis.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Format d'email invalide.";
      if (!formData.phone) newErrors.phone = "Le téléphone est requis.";
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
        toast({ title: "Informations manquantes", description: "Veuillez remplir tous les champs obligatoires.", variant: "destructive" });
        return;
    }
    if (cart.length === 0) {
      toast({ title: "Panier vide", description: "Ajoutez des produits avant de valider.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('commandes')
        .insert([{
          nom_client: formData.name,
          email: formData.email,
          telephone: formData.phone,
          societe: formData.company,
          commentaire: formData.message,
          produits: cart.map(item => ({ id: item.id, nom: item.nom, quantite: item.quantity })),
          statut: 'Nouveau Devis'
        }])
        .select('id')
        .single();
      
      if (orderError) throw orderError;
      
      toast({ title: "Demande de devis envoyée !", description: "Merci ! Notre équipe vous recontactera sous 24h." });
      
      clearCart();
      setFormData({ name: '', email: '', phone: '', company: '', message: '' });

    } catch (error) {
      console.error('Error submitting order:', error);
      toast({ title: "Erreur lors de l'envoi", description: `Une erreur est survenue : ${error.message}`, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <>
        <Helmet><title>Mon Panier | EFFINOR</title></Helmet>
        <div className="container mx-auto px-4 py-12 pt-32 text-center">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Votre panier est vide</h1>
            <p className="text-gray-600 mb-8">Découvrez nos solutions LED professionnelles</p>
            <Link to="/boutique" className="btn-primary">Découvrir nos produits</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet><title>Mon Panier | EFFINOR</title></Helmet>
      <div className="bg-primary-800 text-white py-12 pt-32">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Mon Panier</h1>
          <p className="text-xl text-primary-300">Finalisez votre demande de devis</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h2 className="text-2xl font-bold mb-6">Produits sélectionnés</h2>
              <div className="space-y-4">
                {cart.map((item) => (
                  <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 p-4 border rounded-lg">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img alt={item.nom} className="w-full h-full object-cover" src={item.image_url || "https://images.unsplash.com/photo-1669784589815-bf71646b7bc7"} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.nom}</h3>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border rounded-lg">
                          <button className="btn-ghost" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="h-3 w-3" /></button>
                          <span className="w-12 text-center text-sm font-semibold">{item.quantity}</span>
                          <button className="btn-ghost" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="h-3 w-3" /></button>
                        </div>
                        <button className="btn-ghost text-error" onClick={() => removeFromCart(item.id)}><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                    <div className="text-right font-bold text-secondary-700">
                      {item.prix === 0 || item.sur_devis ? 'Sur demande' : `${(item.prix * item.quantity).toFixed(2)} € HT`}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="card p-6">
              <h2 className="text-2xl font-bold mb-6">Vos informations</h2>
              <form onSubmit={handleSubmitOrder} className="space-y-4">
                <div className={`form-field ${errors.name ? 'error' : ''}`}>
                  <label htmlFor="name">Nom complet *</label>
                  <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange} placeholder="Jean Dupont"/>
                   {errors.name && <span className="error-message">{errors.name}</span>}
                </div>
                <div className="form-field">
                  <label htmlFor="company">Société</label>
                  <input type="text" id="company" name="company" value={formData.company} onChange={handleChange} placeholder="Nom de votre société"/>
                </div>
                 <div className={`form-field ${errors.email ? 'error' : ''}`}>
                  <label htmlFor="email">Email *</label>
                  <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} placeholder="jean.dupont@exemple.fr"/>
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
                <div className={`form-field ${errors.phone ? 'error' : ''}`}>
                  <label htmlFor="phone">Téléphone *</label>
                  <input type="tel" id="phone" name="phone" required value={formData.phone} onChange={handleChange} placeholder="+33 6 XX XX XX XX"/>
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>
                <div className="form-field">
                  <label htmlFor="message">Commentaires / Informations complémentaires</label>
                  <textarea id="message" name="message" value={formData.message} onChange={handleChange} placeholder="Précisez vos besoins..."/>
                </div>
                <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
                  <Send className="mr-2 h-5 w-5" />
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Valider ma demande de devis"}
                </button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Récapitulatif</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Nombre d'articles</span>
                  <span className="font-semibold">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                {getTotalPrice() > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total indicatif HT</span>
                    <span className="font-semibold">{getTotalPrice().toFixed(2)} €</span>
                  </div>
                )}
              </div>
              <div className="badge badge-prime w-full text-center p-3 mb-6">
                <p>💡 Produits éligibles CEE : financement jusqu'à 100% possible</p>
              </div>
              <div className="text-sm text-gray-600 space-y-2">
                <p>✓ Devis personnalisé sous 24h</p>
                <p>✓ Étude photométrique gratuite</p>
                <p>✓ Accompagnement CEE inclus</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;