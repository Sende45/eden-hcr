import React, { useState } from 'react';
import {
  User, Briefcase, Calendar, Upload, CheckCircle2,
  ArrowRight, ArrowLeft, FileText, Check, AlertTriangle, ShieldCheck
} from 'lucide-react';

const API = 'https://eden-hcr.onrender.com';

type OnboardingStep = 1 | 2 | 3 | 4;

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  nationalite: 'francais' | 'ue' | 'etranger' | '';
  titreSejour: {
    type: string;
    dateExpiration: string;
  };
  role: string;
  experienceYears: string;
  specialty: string;
  city: string;
  availability: string[];
  idCard: File | null;
  vitaleCard: File | null;
  rib: File | null;
  titreSejeurDoc: File | null;
}

export interface OnboardingResult {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    nom: string;
    prenom: string;
    candidatRef?: string;
  };
}

const INITIAL_STATE: FormData = {
  firstName: '', lastName: '', email: '', phone: '', password: '',
  nationalite: '',
  titreSejour: { type: '', dateExpiration: '' },
  role: '', experienceYears: '', specialty: '',
  city: '', availability: [],
  idCard: null, vitaleCard: null, rib: null, titreSejeurDoc: null,
};

interface CandidateOnboardingProps {
  onComplete: (result: OnboardingResult) => void;
}

// Vérifie si le titre expire dans moins de 3 mois ou est déjà expiré
const getTitreStatus = (dateStr: string): 'valide' | 'expire_bientot' | 'expire' | null => {
  if (!dateStr) return null;
  const expiration = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((expiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'expire';
  if (diffDays <= 90) return 'expire_bientot';
  return 'valide';
};

const TITRE_TYPES = [
  { value: 'carte_sejour_temporaire',   label: 'Carte de séjour temporaire' },
  { value: 'carte_sejour_pluriannuelle', label: 'Carte de séjour pluriannuelle' },
  { value: 'carte_resident',            label: 'Carte de résident (10 ans)' },
  { value: 'titre_etudiant',            label: 'Titre de séjour étudiant' },
  { value: 'passeport_talent',          label: 'Passeport talent' },
  { value: 'vie_privee_familiale',      label: 'Vie privée et familiale' },
  { value: 'autre',                     label: 'Autre titre' },
];

export const CandidateOnboarding: React.FC<CandidateOnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<OnboardingStep>(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const isEtranger = formData.nationalite === 'etranger';
  const titreStatus = isEtranger ? getTitreStatus(formData.titreSejour.dateExpiration) : null;

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTitreChange = (field: 'type' | 'dateExpiration', value: string) => {
    setFormData(prev => ({
      ...prev,
      titreSejour: { ...prev.titreSejour, [field]: value }
    }));
  };

  const handleCheckboxChange = (day: string) => {
    setFormData(prev => {
      const updated = prev.availability.includes(day)
        ? prev.availability.filter(d => d !== day)
        : [...prev.availability, day];
      return { ...prev, availability: updated };
    });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'idCard' | 'vitaleCard' | 'rib' | 'titreSejeurDoc'
  ) => {
    if (e.target.files?.[0]) {
      setFormData(prev => ({ ...prev, [field]: e.target.files![0] }));
    }
  };

  // Bloquer l'avancement si titre expiré
  const canProceedStep1 = () => {
    if (!formData.nationalite) return false;
    if (isEtranger && titreStatus === 'expire') return false;
    return true;
  };

  const nextStep = () => {
    if (step === 1 && !canProceedStep1()) return;
    setStep(prev => (prev < 4 ? ((prev + 1) as OnboardingStep) : prev));
  };
  const prevStep = () => setStep(prev => (prev > 1 ? ((prev - 1) as OnboardingStep) : prev));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setServerError('');

    try {
      const password = formData.password.trim() || `Eden_${Math.random().toString(36).slice(2, 10)}!`;

      const registerRes = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password,
          nom: formData.lastName,
          prenom: formData.firstName,
          role: 'extra',
        })
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        setServerError(registerData.message || 'Erreur lors de la création du compte.');
        setIsSubmitting(false);
        return;
      }

      const { token, user } = registerData;
      localStorage.setItem('eden_token', token);

      const candidatPayload = {
        civilite: 'M.',
        nom: formData.lastName,
        prenom: formData.firstName,
        email: formData.email,
        telephone: formData.phone,
        adresse: { ville: formData.city, codePostal: '75000' },
        metier: formData.role,
        experience: formData.experienceYears === '0-1' ? 'sans_experience'
          : formData.experienceYears === '1-3' ? '1_2_ans'
          : formData.experienceYears === '3-5' ? '3_5_ans'
          : 'plus_5_ans',
        competences: formData.availability,
        cvUrl: '',
        nationalite: formData.nationalite,
        titreSejour: isEtranger ? formData.titreSejour : null,
      };

      const candidatRes = await fetch(`${API}/api/candidat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(candidatPayload)
      });

      const candidatData = await candidatRes.json();

      onComplete({
        token,
        user: {
          id: user.id, email: user.email, role: user.role,
          nom: user.nom, prenom: user.prenom,
          candidatRef: candidatData?.candidat?._id || candidatData?._id
        }
      });
    } catch (error) {
      console.error('Erreur onboarding :', error);
      setServerError("Erreur de liaison réseau avec l'infrastructure EDÈN.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  return (
    <div className="max-w-2xl mx-auto bg-eden-bg2 border border-eden-border rounded-2xl p-8 lg:p-10 shadow-2xl font-sans relative overflow-hidden backdrop-blur-md animate-[fadeInUp_0.4s_ease-out]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-eden-tan/5 rounded-full blur-2xl pointer-events-none" />

      {/* Barre de progression */}
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

      <form onSubmit={handleSubmit} noValidate className="space-y-8 relative z-10">
        {serverError && (
          <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl">{serverError}</div>
        )}

        {/* ── ÉTAPE 1 ── */}
        {step === 1 && (
          <div className="space-y-5 animate-[fadeInUp_0.3s_ease-out]">
            <div className="flex items-center gap-2.5 text-eden-navy font-serif font-semibold text-xl pb-3 border-b border-eden-border/40">
              <User size={20} className="text-eden-tan" />
              <span>Création de votre compte extra</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wide text-eden-text-dark">Prénom</label>
                <input type="text" name="firstName" required value={formData.firstName} onChange={handleTextChange}
                  className="bg-eden-bg border border-eden-border/80 rounded-xl p-3 text-xs outline-hidden focus:border-eden-tan focus:ring-1 focus:ring-eden-tan/30 transition-all text-eden-text-dark shadow-2xs" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wide text-eden-text-dark">Nom de famille</label>
                <input type="text" name="lastName" required value={formData.lastName} onChange={handleTextChange}
                  className="bg-eden-bg border border-eden-border/80 rounded-xl p-3 text-xs outline-hidden focus:border-eden-tan focus:ring-1 focus:ring-eden-tan/30 transition-all text-eden-text-dark shadow-2xs" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide text-eden-text-dark">Adresse email professionnelle</label>
              <input type="email" name="email" required value={formData.email} onChange={handleTextChange}
                className="bg-eden-bg border border-eden-border/80 rounded-xl p-3 text-xs outline-hidden focus:border-eden-tan focus:ring-1 focus:ring-eden-tan/30 transition-all text-eden-text-dark shadow-2xs" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide text-eden-text-dark">Mot de passe</label>
              <input type="password" name="password" required placeholder="Minimum 8 caractères" value={formData.password} onChange={handleTextChange}
                className="bg-eden-bg border border-eden-border/80 rounded-xl p-3 text-xs outline-hidden focus:border-eden-tan focus:ring-1 focus:ring-eden-tan/30 transition-all text-eden-text-dark shadow-2xs" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide text-eden-text-dark">Numéro de mobile</label>
              <input type="tel" name="phone" placeholder="06 00 00 00 00" required value={formData.phone} onChange={handleTextChange}
                className="bg-eden-bg border border-eden-border/80 rounded-xl p-3 text-xs outline-hidden focus:border-eden-tan focus:ring-1 focus:ring-eden-tan/30 transition-all text-eden-text-dark shadow-2xs" />
            </div>

            {/* ── NATIONALITÉ ── */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide text-eden-text-dark">Nationalité *</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'francais', label: '🇫🇷 Français(e)' },
                  { value: 'ue',       label: '🇪🇺 Union Européenne' },
                  { value: 'etranger', label: '🌍 Hors UE' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, nationalite: opt.value as FormData['nationalite'], titreSejour: { type: '', dateExpiration: '' } }))}
                    className={`p-3 rounded-xl border text-xs font-medium transition-all ${
                      formData.nationalite === opt.value
                        ? 'border-eden-navy bg-eden-navy/5 text-eden-navy font-semibold'
                        : 'border-eden-border bg-eden-bg text-eden-text-light hover:border-eden-tan'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── TITRE DE SÉJOUR si étranger hors UE ── */}
            {isEtranger && (
              <div className="space-y-4 p-4 rounded-xl border border-eden-border bg-eden-bg animate-[fadeInUp_0.2s_ease-out]">
                <div className="flex items-center gap-2 text-xs font-semibold text-eden-navy">
                  <ShieldCheck size={15} className="text-eden-tan" />
                  Titre de séjour autorisant le travail
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-eden-text-light">Type de titre</label>
                  <select
                    value={formData.titreSejour.type}
                    onChange={e => handleTitreChange('type', e.target.value)}
                    className="bg-eden-bg2 border border-eden-border/80 rounded-xl p-3 text-xs outline-hidden focus:border-eden-tan text-eden-text-dark appearance-none"
                  >
                    <option value="">Sélectionnez le type de titre</option>
                    {TITRE_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-eden-text-light">Date d'expiration du titre</label>
                  <input
                    type="date"
                    value={formData.titreSejour.dateExpiration}
                    onChange={e => handleTitreChange('dateExpiration', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="bg-eden-bg2 border border-eden-border/80 rounded-xl p-3 text-xs outline-hidden focus:border-eden-tan text-eden-text-dark"
                  />
                </div>

                {/* Alerte statut titre */}
                {titreStatus === 'expire' && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-red-600">Titre de séjour expiré</p>
                      <p className="text-[11px] text-red-500 mt-0.5">
                        Votre titre est expiré. Vous ne pouvez pas être embauché légalement en France. 
                        Veuillez renouveler votre titre avant de vous inscrire.
                      </p>
                    </div>
                  </div>
                )}

                {titreStatus === 'expire_bientot' && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-amber-600">Titre expire bientôt</p>
                      <p className="text-[11px] text-amber-500 mt-0.5">
                        Votre titre expire dans moins de 3 mois. Pensez à engager votre renouvellement rapidement.
                        EDÈN Group sera informé pour le suivi.
                      </p>
                    </div>
                  </div>
                )}

                {titreStatus === 'valide' && formData.titreSejour.dateExpiration && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                    <ShieldCheck size={14} className="text-green-500 shrink-0" />
                    <p className="text-xs font-semibold text-green-600">Titre valide — autorisation de travail confirmée</p>
                  </div>
                )}

                <p className="text-[10px] text-eden-text-light">
                  Ces informations sont strictement confidentielles et utilisées uniquement pour la conformité légale (DPAE, URSSAF).
                </p>
              </div>
            )}

            {/* Info UE */}
            {formData.nationalite === 'ue' && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl animate-[fadeInUp_0.2s_ease-out]">
                <ShieldCheck size={14} className="text-blue-500 shrink-0" />
                <p className="text-xs text-blue-600">
                  Ressortissant UE — libre circulation de travail en France. Aucun titre de séjour requis.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── ÉTAPE 2 ── */}
        {step === 2 && (
          <div className="space-y-5 animate-[fadeInUp_0.3s_ease-out]">
            <div className="flex items-center gap-2.5 text-eden-navy font-serif font-semibold text-xl pb-3 border-b border-eden-border/40">
              <Briefcase size={20} className="text-eden-tan" />
              <span>Votre expertise HCR</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide text-eden-text-dark">Métier principal exercé</label>
              <select name="role" required value={formData.role} onChange={handleTextChange}
                className="w-full bg-eden-bg border border-eden-border/80 rounded-xl p-3 text-xs outline-hidden focus:border-eden-tan focus:ring-1 focus:ring-eden-tan/30 transition-all text-eden-text-dark appearance-none shadow-2xs cursor-pointer">
                <option value="">Sélectionnez votre corps de métier</option>
                <option value="serveur">Serveur / Chef de Rang</option>
                <option value="barman">Barman / Mixologue</option>
                <option value="cuisinier">Cuisinier / Chef de Partie</option>
                <option value="commis">Commis de Cuisine</option>
                <option value="hote">Hôte d'accueil / Maître d'Hôtel</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wide text-eden-text-dark">Expérience globale</label>
                <select name="experienceYears" required value={formData.experienceYears} onChange={handleTextChange}
                  className="bg-eden-bg border border-eden-border/80 rounded-xl p-3 text-xs outline-hidden focus:border-eden-tan focus:ring-1 focus:ring-eden-tan/30 transition-all text-eden-text-dark appearance-none shadow-2xs cursor-pointer">
                  <option value="">Sélectionnez</option>
                  <option value="0-1">Moins d'un an</option>
                  <option value="1-3">1 à 3 ans</option>
                  <option value="3-5">3 à 5 ans</option>
                  <option value="5+">Plus de 5 ans</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wide text-eden-text-dark">Standard d'établissement</label>
                <select name="specialty" value={formData.specialty} onChange={handleTextChange}
                  className="bg-eden-bg border border-eden-border/80 rounded-xl p-3 text-xs outline-hidden focus:border-eden-tan focus:ring-1 focus:ring-eden-tan/30 transition-all text-eden-text-dark appearance-none shadow-2xs cursor-pointer">
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

        {/* ── ÉTAPE 3 ── */}
        {step === 3 && (
          <div className="space-y-5 animate-[fadeInUp_0.3s_ease-out]">
            <div className="flex items-center gap-2.5 text-eden-navy font-serif font-semibold text-xl pb-3 border-b border-eden-border/40">
              <Calendar size={20} className="text-eden-tan" />
              <span>Mobilité & Disponibilités</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide text-eden-text-dark">Zone géographique de recherche</label>
              <input type="text" name="city" placeholder="Ex: Paris (75) ou Code Postal" required value={formData.city} onChange={handleTextChange}
                className="bg-eden-bg border border-eden-border/80 rounded-xl p-3 text-xs outline-hidden focus:border-eden-tan focus:ring-1 focus:ring-eden-tan/30 transition-all text-eden-text-dark shadow-2xs" />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-semibold tracking-wide text-eden-text-dark block">Jours d'activation pour vos missions</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {daysOfWeek.map(day => {
                  const isChecked = formData.availability.includes(day);
                  return (
                    <label key={day} className={`flex items-center justify-between p-3 border rounded-xl text-xs font-medium cursor-pointer transition-all duration-200 select-none shadow-2xs ${
                      isChecked ? 'bg-eden-navy/5 border-eden-navy text-eden-navy font-semibold shadow-inner' : 'bg-eden-bg border-eden-border/70 text-eden-text-light hover:border-eden-tan/60 hover:text-eden-text-dark'
                    }`}>
                      <input type="checkbox" checked={isChecked} onChange={() => handleCheckboxChange(day)} className="hidden" />
                      <span>{day}</span>
                      {isChecked && <span className="w-1.5 h-1.5 rounded-full bg-eden-tan animate-pulse" />}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── ÉTAPE 4 ── */}
        {step === 4 && (
          <div className="space-y-5 animate-[fadeInUp_0.3s_ease-out]">
            <div className="flex items-center gap-2.5 text-eden-navy font-serif font-semibold text-xl pb-3 border-b border-eden-border/40">
              <Upload size={20} className="text-eden-tan" />
              <span>Vérification de conformité réglementaire</span>
            </div>

            {/* Alerte titre bientôt expiré en rappel étape 4 */}
            {isEtranger && titreStatus === 'expire_bientot' && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-600">
                  Rappel : votre titre de séjour expire bientôt. Merci de l'uploader ci-dessous.
                </p>
              </div>
            )}

            {[
              { field: 'idCard' as const,       label: "Pièce d'Identité officielle",         sub: 'CNI recto/verso, Passeport ou Titre de séjour' },
              { field: 'vitaleCard' as const,   label: 'Attestation Vitale',                  sub: "Requis pour la Déclaration Préalable à l'Embauche" },
              { field: 'rib' as const,          label: 'Relevé d\'Identité Bancaire (RIB)',   sub: 'Destiné aux virements sécurisés de vos rémunérations' },
              ...(isEtranger ? [{
                field: 'titreSejeurDoc' as const,
                label: 'Titre de séjour (recto/verso)',
                sub: `${TITRE_TYPES.find(t => t.value === formData.titreSejour.type)?.label || 'Document officiel'} — expiration : ${formData.titreSejour.dateExpiration ? new Date(formData.titreSejour.dateExpiration).toLocaleDateString('fr-FR') : 'non renseignée'}`
              }] : [])
            ].map(({ field, label, sub }) => {
              const file = formData[field];
              return (
                <div key={field} className={`border rounded-2xl p-4 flex items-center justify-between gap-4 transition-all duration-300 shadow-2xs ${
                  file ? 'border-eden-teal/40 bg-eden-teal/[0.02]' : 'border-eden-border bg-eden-bg'
                }`}>
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`p-2.5 rounded-xl ${file ? 'bg-eden-teal/10 text-eden-teal' : 'bg-eden-navy/5 text-eden-text-light'}`}>
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-eden-text-dark">{label}</p>
                      <p className="text-[11px] text-eden-text-light truncate font-light mt-0.5">
                        {file ? (file as File).name : sub}
                      </p>
                    </div>
                  </div>
                  <label className="shrink-0 p-[7px_14px] bg-eden-navy hover:bg-eden-light-navy text-white rounded-xl text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm">
                    {file ? <Check size={13} /> : <Upload size={13} />}
                    <span>{file ? 'Remplacer' : 'Uploader'}</span>
                    <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={e => handleFileChange(e, field)} className="hidden" />
                  </label>
                </div>
              );
            })}

            <p className="text-[11px] text-eden-text-light text-center pt-1">
              Les documents peuvent être ajoutés ultérieurement depuis votre espace personnel.
            </p>
          </div>
        )}

        {/* ── NAVIGATION ── */}
        <div className="flex items-center justify-between pt-5 border-t border-eden-border/40 select-none">
          {step > 1 ? (
            <button type="button" onClick={prevStep}
              className="flex items-center gap-2 text-eden-text-light hover:text-eden-navy font-semibold text-xs bg-transparent border-none cursor-pointer transition-colors p-1">
              <ArrowLeft size={15} /> <span>Retour</span>
            </button>
          ) : <div />}

          {step < 4 ? (
            <button type="button" onClick={nextStep}
              disabled={step === 1 && !canProceedStep1()}
              className="flex items-center gap-1.5 bg-eden-navy hover:bg-eden-light-navy disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl text-xs font-semibold tracking-wide cursor-pointer transition-all shadow-md active:scale-98">
              <span>Continuer</span> <ArrowRight size={15} />
            </button>
          ) : (
            <button type="submit" disabled={isSubmitting}
              className="flex items-center gap-2 bg-eden-tan hover:bg-eden-navy text-white py-3 px-6 rounded-xl text-xs font-bold tracking-wide cursor-pointer transition-all disabled:opacity-50 shadow-md active:scale-98">
              <span>{isSubmitting ? 'Transmission sécurisée...' : 'Valider mon inscription'}</span>
              <CheckCircle2 size={15} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};