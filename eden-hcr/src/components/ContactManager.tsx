import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export const ContactManager: React.FC = () => {
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      // CORRECTION : Alignement constant sur ton nom de domaine API principal unique
      const response = await fetch('https://eden-hcr.onrender.com/api/messagerie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        setErrorMessage(data.message || "Une erreur est survenue lors de la transmission.");
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
      setErrorMessage("Impossible de joindre le serveur EDÈN HCR. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-10 rounded-2xl border border-eden-border/60 shadow-xl text-center space-y-4 animate-fadeIn">
        <div className="flex justify-center text-eden-teal">
          <CheckCircle2 size={48} className="animate-bounce" />
        </div>
        <h3 className="font-serif font-semibold text-2xl text-eden-navy">Demande transmise avec succès</h3>
        <p className="text-xs text-eden-text-light max-w-md mx-auto leading-relaxed">
          Votre message a bien été pris en compte par la direction d'EDÈN Group. Un conseiller de l'agence HCR vous recontactera sous 24 heures heures ouvrées.
        </p>
        <button 
          type="button"
          onClick={() => { setIsSubmitted(false); setFormState({ name: '', email: '', subject: '', message: '' }); }}
          className="mt-4 text-xs font-semibold text-eden-tan hover:text-eden-navy transition-colors border-none bg-transparent cursor-pointer"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* INFORMATIONS INSTITUTIONNELLES (5 COLONNES) */}
      <div className="lg:col-span-5 bg-eden-navy text-white p-8 rounded-2xl space-y-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-20%] w-48 h-48 rounded-full border-[20px] border-[rgba(178,151,106,0.05)] pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <h2 className="font-serif font-semibold text-2xl tracking-wide">Maison EDÈN</h2>
          <p className="text-[11px] text-eden-tan font-bold tracking-[3px] uppercase">Relations Partenaires</p>
        </div>

        <p className="text-xs text-white/70 font-light leading-relaxed pt-2">
          Que vous soyez un établissement de prestige à la recherche d'une brigade d'exception ou un professionnel de l'hôtellerie-restauration visant l'excellence, nos équipes sont à votre entière disposition.
        </p>

        <div className="space-y-4 pt-4 text-xs font-light relative z-10">
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-eden-tan shrink-0" />
            <span className="opacity-90">contact@eden-group.fr</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={16} className="text-eden-tan shrink-0" />
            <span className="opacity-90">+33 (0)1 00 00 00 00</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin size={16} className="text-eden-tan shrink-0" />
            <span className="opacity-90">Paris, France</span>
          </div>
        </div>
      </div>

      {/* FORMULAIRE DE CONTACT LUXE (7 COLONNES) */}
      <div className="lg:col-span-7 bg-white p-8 rounded-2xl border border-eden-border shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMessage && (
            <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-eden-navy">Votre nom complet</label>
              <input 
                type="text" 
                required
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                placeholder="Ex: Marie Lefebvre" 
                className="w-full p-3 rounded-xl border border-eden-border text-xs focus:outline-none focus:border-eden-tan transition-colors bg-eden-bg2/30" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-eden-navy">Adresse Email</label>
              <input 
                type="email" 
                required
                value={formState.email}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                placeholder="Ex: contact@etablissement.fr" 
                className="w-full p-3 rounded-xl border border-eden-border text-xs focus:outline-none focus:border-eden-tan transition-colors bg-eden-bg2/30" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-eden-navy">Sujet de votre demande</label>
            <input 
              type="text" 
              required
              value={formState.subject}
              onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
              placeholder="Ex: Demande de brigade temporaire / Recrutement" 
              className="w-full p-3 rounded-xl border border-eden-border text-xs focus:outline-none focus:border-eden-tan transition-colors bg-eden-bg2/30" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-eden-navy">Votre message</label>
            <textarea 
              required
              rows={4} 
              value={formState.message}
              onChange={(e) => setFormState({ ...formState, message: e.target.value })}
              placeholder="Décrivez votre besoin ou votre projet de collaboration avec précision..." 
              className="w-full p-3 rounded-xl border border-eden-border text-xs focus:outline-none focus:border-eden-tan transition-colors bg-eden-bg2/30 resize-none text-eden-text-dark leading-relaxed" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-eden-navy hover:bg-eden-light-navy text-white text-xs font-semibold py-3.5 px-6 rounded-xl border-none cursor-pointer flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 disabled:opacity-50"
          >
            <Send size={13} className="text-eden-tan" /> 
            <span>{loading ? "Transmission..." : "Transmettre ma demande"}</span>
          </button>
        </form>
      </div>
    </div>
  );
};