import React, { useState } from 'react';
import { User, Briefcase, Calendar, Upload, CheckCircle2, ArrowRight, ArrowLeft, FileText, Check } from 'lucide-react';

type OnboardingStep = 1 | 2 | 3 | 4;

interface FormData {
  // Étape 1 : Infos perso
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // Étape 2 : Métier & Expérience
  role: string;
  experienceYears: string;
  specialty: string;
  // Étape 3 : Dispos & Zone
  city: string;
  availability: string[];
  // Étape 4 : Documents
  idCard: File | null;
  vitaleCard: File | null;
  rib: File | null;
}

const INITIAL_STATE: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: '',
  experienceYears: '',
  specialty: '',
  city: '',
  availability: [],
  idCard: null,
  vitaleCard: null,
  rib: null
};

export const CandidateOnboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState<OnboardingStep>(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (day: string) => {
    setFormData(prev => {
      const current = prev.availability;
      const updated = current.includes(day) 
        ? current.filter(d => d !== day) 
        : [...current, day];
      return { ...prev, availability: updated };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'idCard' | 'vitaleCard' | 'rib') => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, [field]: e.target.files![0] }));
    }
  };

  const nextStep = () => setStep(prev => (prev < 4 ? (prev + 1) as OnboardingStep : prev));
  const prevStep = () => setStep(prev => (prev > 1 ? (prev - 1) as OnboardingStep : prev));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setServerError('');

    // Mapping propre vers les propriétés du modèle Mongoose Candidat
    const backendPayload = {
      civilite: 'M.', // Valeur par défaut requise par l'énumérateur du modèle Mongoose
      nom: formData.lastName,
      prenom: formData.firstName,
      email: formData.email,
      telephone: formData.phone,
      adresse: {
        ville: formData.city,
        codePostal: '75000' // Code postal temporaire par défaut pour valider le modèle imbriqué
      },
      metier: formData.role,
      // Conversion vers les énumérateurs stricts de ta collection Mongoose
      experience: formData.experienceYears === '0-1' ? 'sans_experience' 
                : formData.experienceYears === '1-3' ? '1_2_ans' 
                : formData.experienceYears === '3-5' ? '3_5_ans' 
                : 'plus_5_ans',
      competences: formData.availability, // Transfert des jours ou des compétences
      cvUrl: "" // Initialisation de l'emplacement de fichier
    };

    // 1. Récupération du jeton de sécurité stocké au moment de la connexion
    const token = localStorage.getItem('userToken');

    try {
      const response = await fetch('https://eden-hcr-backend.onrender.com/api/candidat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 2. Injection du Token JWT pour ouvrir la barrière du middleware protect
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(backendPayload),
      });

      const data = await response.json();

      if (response.ok) {
        onComplete();
      } else {
        setServerError(data.message || "Impossible de finaliser la création de votre dossier.");
      }
    } catch (error) {
      console.error("Erreur onboarding :", error);
      setServerError("Erreur de liaison réseau avec l'infrastructure EDÈN.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  return (
    <div className="max-w-2xl mx-auto bg-eden-bg2 border border-eden-border rounded-2xl p-8 lg:p-10 shadow-2xl font-sans relative overflow-hidden backdrop-blur-md animate-[fadeInUp_0.4s_each-out]">
      {/* Lueur d'élégance en arrière-plan */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-eden-tan/5 rounded-full blur-2xl pointer-events-none" />
      
      {/* BARRE DE PROGRESSION PRESTIGE */}
      <div className="mb-10 select-none relative z-10">
        <div className="flex items-center justify-between text-[11px] font-semibold tracking-widest text-eden-text-light uppercase mb-3.5">
          <span className="bg-eden-navy/5 text-eden-navy px-2.5 py-1 rounded-md font-mono">Dossier {step} / 4</span>
          <span className="text-eden-tan font-bold tracking-wide">
            {step === 1 && 'Informations Personnelles'}
            {step === 2 && 'Métier & Spécialisation'}
            {step === 3 && 'Disponibilités & Zone'}
            {step === 4 && 'Dossier réglementaire'}
          </span>
        </div>
        <div className="h-[3px] w-full bg-eden-border rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-eden-tan via-eden-navy to-eden-teal transition-all duration-500 ease-out"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
        {serverError && (
          <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl">
            {serverError}
          </div>
        )}
        
        {/* ÉTAPE 1 : INFORMATIONS PERSONNELLES */}
        {step === 1 && (
          <div className="space-y-5 animate-[fadeInUp_0.3s_ease-out]">
            <div className="flex items-center gap-2.5 text-eden-navy font-serif font-semibold text-xl pb-3 border-b border-eden-border/40">
              <User size={20} className="text-eden-tan" />
              <span>Création de votre compte extra</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wide text-eden-text-dark">Prénom</label>
                <input 
                  type="text" name="firstName" required value={formData.firstName} onChange={handleTextChange}
                  className="bg-eden-bg border border-eden-border/80 rounded-xl p-3 text-xs outline-hidden focus:border-eden-tan focus:ring-1 focus:ring-eden-tan/30 transition-all text-eden-text-dark shadow-2xs"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wide text-eden-text-dark">Nom de famille</label>
                <input 
                  type="text" name="lastName" required value={formData.lastName} onChange={handleTextChange}
                  className="bg-eden-bg border border-eden-border/80 rounded-xl p-3 text-xs outline-hidden focus:border-eden-tan focus:ring-1 focus:ring-eden-tan/30 transition-all text-eden-text-dark shadow-2xs"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide text-eden-text-dark">Adresse email professionnelle</label>
              <input 
                type="email" name="email" required value={formData.email} onChange={handleTextChange}
                className="bg-eden-bg border border-eden-border/80 rounded-xl p-3 text-xs outline-hidden focus:border-eden-tan focus:ring-1 focus:ring-eden-tan/30 transition-all text-eden-text-dark shadow-2xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide text-eden-text-dark">Numéro de mobile</label>
              <input 
                type="tel" name="phone" placeholder="06 00 00 00 00" required value={formData.phone} onChange={handleTextChange}
                className="bg-eden-bg border border-eden-border/80 rounded-xl p-3 text-xs outline-hidden focus:border-eden-tan focus:ring-1 focus:ring-eden-tan/30 transition-all text-eden-text-dark shadow-2xs"
              />
            </div>
          </div>
        )}

        {/* ÉTAPE 2 : MÉTIER & EXPÉRIENCE */}
        {step === 2 && (
          <div className="space-y-5 animate-[fadeInUp_0.3s_ease-out]">
            <div className="flex items-center gap-2.5 text-eden-navy font-serif font-semibold text-xl pb-3 border-b border-eden-border/40">
              <Briefcase size={20} className="text-eden-tan" />
              <span>Votre expertise HCR</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide text-eden-text-dark">Métier principal exercé</label>
              <div className="relative">
                <select 
                  name="role" required value={formData.role} onChange={handleTextChange}
                  className="w-full bg-eden-bg border border-eden-border/80 rounded-xl p-3 text-xs outline-hidden focus:border-eden-tan focus:ring-1 focus:ring-eden-tan/30 transition-all text-eden-text-dark appearance-none shadow-2xs cursor-pointer"
                >
                  <option value="">Sélectionnez votre corps de métier</option>
                  <option value="serveur">Serveur / Chef de Rang</option>
                  <option value="barman">Barman / Mixologue</option>
                  <option value="cuisinier">Cuisinier / Chef de Partie</option>
                  <option value="commis">Commis de Cuisine</option>
                  <option value="hote">Hôte d'accueil / Maître d'Hôtel</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wide text-eden-text-dark">Expérience globale</label>
                <select 
                  name="experienceYears" required value={formData.experienceYears} onChange={handleTextChange}
                  className="bg-eden-bg border border-eden-border/80 rounded-xl p-3 text-xs outline-hidden focus:border-eden-tan focus:ring-1 focus:ring-eden-tan/30 transition-all text-eden-text-dark appearance-none shadow-2xs cursor-pointer"
                >
                  <option value="">Sélectionnez</option>
                  <option value="0-1">Moins d'un an</option>
                  <option value="1-3">1 à 3 ans</option>
                  <option value="3-5">3 à 5 ans</option>
                  <option value="5+">Plus de 5 ans</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wide text-eden-text-dark">Standard d'établissement</label>
                <select 
                  name="specialty" value={formData.specialty} onChange={handleTextChange}
                  className="bg-eden-bg border border-eden-border/80 rounded-xl p-3 text-xs outline-hidden focus:border-eden-tan focus:ring-1 focus:ring-eden-tan/30 transition-all text-eden-text-dark appearance-none shadow-2xs cursor-pointer"
                >
                  <option value="">Sélectionnez votre univers</option>
                  <option value="luxe">Hôtellerie de Luxe / Palaces</option>
                  <option value="brasserie">Brasseries traditionnelles</option>
                  <option value="bistrot">Bistronomique</option>
                  <option value="event">Événementiel / Banquets</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 : DISPONIBILITÉS & ZONE */}
        {step === 3 && (
          <div className="space-y-5 animate-[fadeInUp_0.3s_ease-out]">
            <div className="flex items-center gap-2.5 text-eden-navy font-serif font-semibold text-xl pb-3 border-b border-eden-border/40">
              <Calendar size={20} className="text-eden-tan" />
              <span>Mobilité & Disponibilités</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide text-eden-text-dark">Zone géographique de recherche</label>
              <input 
                type="text" name="city" placeholder="Ex: Paris (75) ou Code Postal" required value={formData.city} onChange={handleTextChange}
                className="bg-eden-bg border border-eden-border/80 rounded-xl p-3 text-xs outline-hidden focus:border-eden-tan focus:ring-1 focus:ring-eden-tan/30 transition-all text-eden-text-dark shadow-2xs"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-semibold tracking-wide text-eden-text-dark block">Jours d'activation pour vos missions</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {daysOfWeek.map(day => {
                  const isChecked = formData.availability.includes(day);
                  return (
                    <label 
                      key={day}
                      className={`flex items-center justify-between p-3 border rounded-xl text-xs font-medium cursor-pointer transition-all duration-200 select-none shadow-2xs
                        ${isChecked
                          ? 'bg-eden-navy/5 border-eden-navy text-eden-navy font-semibold shadow-inner'
                          : 'bg-eden-bg border-eden-border/70 text-eden-text-light hover:border-eden-tan/60 hover:text-eden-text-dark'
                        }`}
                    >
                      <input 
                        type="checkbox" checked={isChecked} 
                        onChange={() => handleCheckboxChange(day)} className="hidden"
                      />
                      <span>{day}</span>
                      {isChecked && <span className="w-1.5 h-1.5 rounded-full bg-eden-tan animate-pulse" />}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 4 : TÉLÉCHARGEMENT DES PIÈCES */}
        {step === 4 && (
          <div className="space-y-5 animate-[fadeInUp_0.3s_ease-out]">
            <div className="flex items-center gap-2.5 text-eden-navy font-serif font-semibold text-xl pb-3 border-b border-eden-border/40">
              <Upload size={20} className="text-eden-tan" />
              <span>Vérification de conformité réglementaire</span>
            </div>
            
            {/* Pièce d'identité */}
            <div className={`border rounded-2xl p-4 flex items-center justify-between gap-4 transition-all duration-300 shadow-2xs
              ${formData.idCard ? 'border-eden-teal/40 bg-eden-teal/[0.02]' : 'border-eden-border bg-eden-bg'}`}>
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`p-2.5 rounded-xl ${formData.idCard ? 'bg-eden-teal/10 text-eden-teal' : 'bg-eden-navy/5 text-eden-text-light'}`}>
                  <FileText size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-eden-text-dark">Pièce d'Identité officielle</p>
                  <p className="text-[11px] text-eden-text-light truncate font-light mt-0.5">
                    {formData.idCard ? formData.idCard.name : 'CNI recto/verso, Passeport ou Titre de séjour'}
                  </p>
                </div>
              </div>
              <label className="shrink-0 p-[7px_14px] bg-eden-navy hover:bg-eden-light-navy text-white rounded-xl text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm">
                {formData.idCard ? <Check size={13} /> : <Upload size={13} />}
                <span>{formData.idCard ? 'Remplacer' : 'Uploader'}</span>
                <input type="file" required={!formData.idCard} accept=".pdf,.png,.jpg,.jpeg" onChange={e => handleFileChange(e, 'idCard')} className="hidden" />
              </label>
            </div>

            {/* Carte Vitale */}
            <div className={`border rounded-2xl p-4 flex items-center justify-between gap-4 transition-all duration-300 shadow-2xs
              ${formData.vitaleCard ? 'border-eden-teal/40 bg-eden-teal/[0.02]' : 'border-eden-border bg-eden-bg'}`}>
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`p-2.5 rounded-xl ${formData.vitaleCard ? 'bg-eden-teal/10 text-eden-teal' : 'bg-eden-navy/5 text-eden-text-light'}`}>
                  <FileText size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-eden-text-dark">Attestation Vitale</p>
                  <p className="text-[11px] text-eden-text-light truncate font-light mt-0.5">
                    {formData.vitaleCard ? formData.vitaleCard.name : 'Requis pour la Déclaration Préalable à l\'Embauche'}
                  </p>
                </div>
              </div>
              <label className="shrink-0 p-[7px_14px] bg-eden-navy hover:bg-eden-light-navy text-white rounded-xl text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm">
                {formData.vitaleCard ? <Check size={13} /> : <Upload size={13} />}
                <span>{formData.vitaleCard ? 'Remplacer' : 'Uploader'}</span>
                <input type="file" required={!formData.vitaleCard} accept=".pdf,.png,.jpg,.jpeg" onChange={e => handleFileChange(e, 'vitaleCard')} className="hidden" />
              </label>
            </div>

            {/* RIB */}
            <div className={`border rounded-2xl p-4 flex items-center justify-between gap-4 transition-all duration-300 shadow-2xs
              ${formData.rib ? 'border-eden-teal/40 bg-eden-teal/[0.02]' : 'border-eden-border bg-eden-bg'}`}>
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`p-2.5 rounded-xl ${formData.rib ? 'bg-eden-teal/10 text-eden-teal' : 'bg-eden-navy/5 text-eden-text-light'}`}>
                  <FileText size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-eden-text-dark">Relevé d'Identité Bancaire (RIB)</p>
                  <p className="text-[11px] text-eden-text-light truncate font-light mt-0.5">
                    {formData.rib ? formData.rib.name : 'Destiné aux virements sécurisés de vos rémunérations'}
                  </p>
                </div>
              </div>
              <label className="shrink-0 p-[7px_14px] bg-eden-navy hover:bg-eden-light-navy text-white rounded-xl text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm">
                {formData.rib ? <Check size={13} /> : <Upload size={13} />}
                <span>{formData.rib ? 'Remplacer' : 'Uploader'}</span>
                <input type="file" required={!formData.rib} accept=".pdf,.png,.jpg,.jpeg" onChange={e => handleFileChange(e, 'rib')} className="hidden" />
              </label>
            </div>
          </div>
        )}

        {/* ZONE DE BOUTONS / NAVIGATION INTERNE */}
        <div className="flex items-center justify-between pt-5 border-t border-eden-border/40 select-none">
          {step > 1 ? (
            <button 
              type="button" onClick={prevStep}
              className="flex items-center gap-2 text-eden-text-light hover:text-eden-navy font-semibold text-xs bg-transparent border-none cursor-pointer transition-colors p-1"
            >
              <ArrowLeft size={15} /> <span>Retour</span>
            </button>
          ) : <div />}

          {step < 4 ? (
            <button 
              type="button" onClick={nextStep}
              className="flex items-center gap-1.5 bg-eden-navy hover:bg-eden-light-navy text-white py-3 px-6 rounded-xl text-xs font-semibold tracking-wide cursor-pointer transition-all shadow-md hover:shadow-eden-navy/10 active:scale-98"
            >
              <span>Continuer</span> <ArrowRight size={15} />
            </button>
          ) : (
            <button 
              type="submit" disabled={isSubmitting}
              className="flex items-center gap-2 bg-eden-tan hover:bg-eden-navy text-white py-3 px-6 rounded-xl text-xs font-bold tracking-wide cursor-pointer transition-all disabled:opacity-50 shadow-md hover:shadow-eden-tan/20 active:scale-98"
            >
              <span>{isSubmitting ? 'Transmission sécurisée...' : 'Valider mon inscription'}</span> 
              <CheckCircle2 size={15} />
            </button>
          )}
        </div>

      </form>
    </div>
  );
};