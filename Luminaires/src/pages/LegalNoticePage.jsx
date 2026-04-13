import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Building, FileText, User, Euro, MapPin, Mail, Phone, Briefcase } from 'lucide-react';

const LegalNoticePage = () => {
  const legalInfo = [
    { icon: Building, label: "Dénomination sociale", value: "EFFINOR" },
    { icon: FileText, label: "Forme juridique", value: "Société par actions simplifiée" },
    { icon: Euro, label: "Capital social", value: "115 900,00 Euros" },
    { icon: MapPin, label: "Adresse du siège social", value: "1 Avenue de l'Europe, 94320 Thiais" },
    { icon: FileText, label: "Numéro RCS", value: "907 547 665 R.C.S. Créteil" },
    { icon: FileText, label: "Date d'immatriculation", value: "14/11/2021" },
    { icon: FileText, label: "Identifiant européen (EUID)", value: "FR9401.907547665" },
    { icon: User, label: "Président", value: "MILADI Nazih" },
  ];

  const contactInfo = [
    { icon: Mail, label: "Email", value: "contact@effinor.fr" },
    { icon: Phone, label: "Téléphone", value: "09 78 45 50 63" },
    { icon: MapPin, label: "Adresse de contact", value: "Tour Europa, Av. de l'Europe, 94320 Thiais" },
    { icon: Briefcase, label: "Horaires", value: "Lundi au Vendredi : 8h - 18h" },
  ];

  const activities = "Bureau d'étude, performance énergétique (code APE 7112B), audit thermique, chauffage, climatisation, plomberie et électricité.";

  return (
    <>
      <Helmet>
        <title>Mentions Légales - EFFINOR</title>
        <meta name="description" content="Consultez les mentions légales de la société EFFINOR. Informations sur l'entreprise, l'éditeur du site et l'hébergeur." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-slate-50 py-20 sm:py-24"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center mb-16"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Mentions Légales
              </h1>
              <p className="text-lg text-slate-600">
                Informations légales concernant la société EFFINOR et l'utilisation de ce site.
              </p>
            </motion.div>

            <div className="space-y-12">
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h2 className="text-2xl font-semibold text-slate-800 border-b-2 border-cyan-500 pb-3 mb-6 flex items-center gap-3">
                  <Building className="w-6 h-6 text-cyan-600" />
                  Informations sur la société
                </h2>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                  {legalInfo.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-cyan-100 text-cyan-700 rounded-lg flex items-center justify-center mt-1">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700">{item.label}</p>
                        <p className="text-slate-600">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <h2 className="text-2xl font-semibold text-slate-800 border-b-2 border-cyan-500 pb-3 mb-6 flex items-center gap-3">
                  <Briefcase className="w-6 h-6 text-cyan-600" />
                  Activités principales
                </h2>
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                  <p className="text-slate-600 leading-relaxed">{activities}</p>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <h2 className="text-2xl font-semibold text-slate-800 border-b-2 border-cyan-500 pb-3 mb-6 flex items-center gap-3">
                  <Phone className="w-6 h-6 text-cyan-600" />
                  Nous Contacter
                </h2>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                  {contactInfo.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-cyan-100 text-cyan-700 rounded-lg flex items-center justify-center mt-1">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700">{item.label}</p>
                        <p className="text-slate-600">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default LegalNoticePage;