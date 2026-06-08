import React, { useState } from 'react';
import {
  Mail, Lock, Loader2, ArrowRight, UserPlus,
  Eye, EyeOff, ShieldCheck, UserCheck, AlertCircle
} from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { login, register } from '../services/authService';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'prestataire' | 'agence' | 'inscription';

export type LoginProps = {
  onPrestataireLoginSuccess: (userData: { id: string; email: string; role: string }) => void;
  onAdminLoginSuccess: () => void;
};

// ─── Composant racine unifié ──────────────────────────────────────────────────

export const Login: React.FC<LoginProps> = ({
  onPrestataireLoginSuccess,
  onAdminLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('prestataire');

  return (
    <AuthLayout>
      <div className="space-y-6 font-sans">

        {/* EN-TÊTE */}
        <div className="text-center space-y-1 select-none">
          <h1 className="font-serif font-bold text-2xl text-eden-navy tracking-wide">
            EDÈN HCR
          </h1>
          <p className="text-[11px] text-eden-text-light font-light">
            Plateforme de gestion des extras & brigades
          </p>
        </div>

        {/* ONGLETS */}
        <div className="relative flex bg-eden-bg2 border border-eden-border rounded-xl p-1 gap-1">
          <div
            className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm transition-all duration-300 ease-in-out"
            style={{
              width: 'calc(33.33% - 4px)',
              left: activeTab === 'prestataire' 
                ? '4px' 
                : activeTab === 'agence' 
                  ? 'calc(33.33% + 2px)' 
                  : 'calc(66.66% + 2px)'
            }}
          />
          <TabButton
            active={activeTab === 'prestataire'}
            onClick={() => setActiveTab('prestataire')}
            icon={<UserCheck size={13} />}
            label="Connexion Extra"
          />
          <TabButton
            active={activeTab === 'agence'}
            onClick={() => setActiveTab('agence')}
            icon={<ShieldCheck size={13} />}
            label="Admin Agence"
          />
          <TabButton
            active={activeTab === 'inscription'}
            onClick={() => setActiveTab('inscription')}
            icon={<UserPlus size={13} />}
            label="Rejoindre"
          />
        </div>

        {/* FORMULAIRES DYNAMISÉS */}
        {activeTab === 'prestataire' && (
          <PrestataireForm onSuccess={onPrestataireLoginSuccess} />
        )}
        {activeTab === 'agence' && (
          <AgenceForm onSuccess={onAdminLoginSuccess} />
        )}
        {activeTab === 'inscription' && (
          <InscriptionForm onSuccess={onPrestataireLoginSuccess} />
        )}

      </div>
    </AuthLayout>
  );
};

// ─── Bouton onglet ────────────────────────────────────────────────────────────

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2.5 px-1 rounded-lg text-[10px] font-semibold tracking-wide transition-colors duration-200 border-none cursor-pointer bg-transparent ${
      active ? 'text-eden-navy' : 'text-eden-text-light hover:text-eden-navy/60'
    }`}
  >
    {icon}
    {label}
  </button>
);

// ─── Formulaire Connexion Prestataire ─────────────────────────────────────────

const PrestataireForm: React.FC<{
  onSuccess: (userData: { id: string; email: string; role: string }) => void;
}> = ({ onSuccess }) => {
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const result = await login(email, password);
      onSuccess({ id: result.user.id, email: result.user.email, role: result.user.role });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginForm
      subtitle="Accédez à votre espace de missions et disponibilités."
      error={error}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      email={email}
      onEmailChange={setEmail}
      password={password}
      onPasswordChange={setPassword}
      showPassword={showPassword}
      onTogglePassword={() => setShowPassword(v => !v)}
      emailPlaceholder="extra@eden-group.fr"
      submitLabel="Accéder à mon espace"
      loadingLabel="Authentification..."
    />
  );
};

// ─── Formulaire Inscription Nouveau Candidat ───────────────────────────────────

const InscriptionForm: React.FC<{
  onSuccess: (userData: { id: string; email: string; role: string }) => void;
}> = ({ onSuccess }) => {
  const [nom, setNom]                 = useState('');
  const [prenom, setPrenom]           = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const result = await register({ email, password, nom, prenom, role: 'extra' });
      onSuccess({ id: result.user.id, email: result.user.email, role: String(result.user.role) });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginForm
      subtitle="Rejoignez la brigade EDÈN HCR et accédez aux meilleures missions de prestige."
      error={error}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      email={email}
      onEmailChange={setEmail}
      password={password}
      onPasswordChange={setPassword}
      showPassword={showPassword}
      onTogglePassword={() => setShowPassword(v => !v)}
      emailPlaceholder="Ex: jean.dupont@email.com"
      submitLabel="Créer mon compte candidat"
      loadingLabel="Création du profil..."
      isRegister={true}
      nom={nom}
      onNomChange={setNom}
      prenom={prenom}
      onPrenomChange={setPrenom}
    />
  );
};

// ─── Formulaire Admin DYNAMIQUE ATLAS MERN ────────────────────────────────────

const AgenceForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      
      if (result.user.role === 'admin') {
        onSuccess();
      } else {
        setError("Accès refusé. Ce compte ne possède pas les privilèges Agence.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Identifiants invalides (Email ou mot de passe incorrect).');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 bg-eden-navy/5 border border-eden-navy/10 rounded-xl px-3 py-2.5">
        <ShieldCheck size={13} className="text-eden-tan shrink-0" />
        <p className="text-[11px] text-eden-navy font-medium">
          Accès restreint — Console de gestion interne EDÈN
        </p>
      </div>
      <LoginForm
        error={error}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        email={email}
        onEmailChange={setEmail}
        password={password}
        onPasswordChange={setPassword}
        showPassword={showPassword}
        onTogglePassword={() => setShowPassword(v => !v)}
        emailPlaceholder="Saisissez votre email administrateur"
        submitLabel="Accéder à la console"
        loadingLabel="Vérification des accès..."
      />
    </div>
  );
};

// ─── Formulaire générique partagé unifié ───────────────────────────────────────

type LoginFormProps = {
  subtitle?: string;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  email: string;
  onEmailChange: (v: string) => void;
  password: string;
  onPasswordChange: (v: string) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  emailPlaceholder: string;
  submitLabel: string;
  loadingLabel: string;
  isRegister?: boolean;
  nom?: string;
  onNomChange?: (v: string) => void;
  prenom?: string;
  onPrenomChange?: (v: string) => void;
};

const LoginForm: React.FC<LoginFormProps> = ({
  subtitle, error, onSubmit, isLoading,
  email, onEmailChange, password, onPasswordChange,
  showPassword, onTogglePassword,
  emailPlaceholder, submitLabel, loadingLabel,
  isRegister = false, nom = '', onNomChange, prenom = '', onPrenomChange
}) => (
  <div className="space-y-4">
    {subtitle && (
      <p className="text-[11px] text-eden-text-light font-light">{subtitle}</p>
    )}

    {error && (
      <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-[11px] p-3 rounded-xl font-medium">
        <AlertCircle size={13} className="shrink-0 mt-0.5" />
        <span>{error}</span>
      </div>
    )}

    <form onSubmit={onSubmit} className="space-y-4 text-xs">

      {isRegister && onPrenomChange && onNomChange && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="font-medium text-eden-navy block">Prénom</label>
            <input
              type="text"
              required
              disabled={isLoading}
              placeholder="Jean"
              value={prenom}
              onChange={e => onPrenomChange(e.target.value)}
              className="w-full bg-eden-bg2 border border-eden-border rounded-xl p-[11px_12px] text-eden-text-dark outline-hidden focus:border-eden-tan text-xs disabled:opacity-60 transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="font-medium text-eden-navy block">Nom</label>
            <input
              type="text"
              required
              disabled={isLoading}
              placeholder="Dupont"
              value={nom}
              onChange={e => onNomChange(e.target.value)}
              className="w-full bg-eden-bg2 border border-eden-border rounded-xl p-[11px_12px] text-eden-text-dark outline-hidden focus:border-eden-tan text-xs disabled:opacity-60 transition-all"
            />
          </div>
        </div>
      )}

      {/* Email */}
      <div className="space-y-1">
        <label className="font-medium text-eden-navy block">Adresse email</label>
        <div className="relative">
          <Mail size={14} className="absolute left-3 top-3.5 text-eden-text-light/60" />
          <input
            type="email"
            required
            disabled={isLoading}
            placeholder={emailPlaceholder}
            value={email}
            onChange={e => onEmailChange(e.target.value)}
            className="w-full bg-eden-bg2 border border-eden-border rounded-xl p-[11px_12px_11px_36px] text-eden-text-dark outline-hidden focus:border-eden-tan text-xs disabled:opacity-60 transition-all"
          />
        </div>
      </div>

      {/* Mot de passe avec sécurité anti-remplissage automatique */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="font-medium text-eden-navy block">Mot de passe</label>
          {!isRegister && (
            <button type="button" className="text-[11px] text-eden-tan hover:text-eden-navy font-medium border-none bg-transparent cursor-pointer">
              Oublié ?
            </button>
          )}
        </div>
        <div className="relative">
          <Lock size={14} className="absolute left-3 top-3.5 text-eden-text-light/60" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            disabled={isLoading}
            autoComplete="new-password" // <-- Force le navigateur à laisser le champ vide
            placeholder="••••••••"
            value={password}
            onChange={e => onPasswordChange(e.target.value)}
            className="w-full bg-eden-bg2 border border-eden-border rounded-xl p-[11px_38px_11px_36px] text-eden-text-dark outline-hidden focus:border-eden-tan text-xs disabled:opacity-60 transition-all"
          />
          <button
            type="button"
            disabled={isLoading}
            onClick={onTogglePassword}
            className="absolute right-3 top-3.5 text-eden-text-light/60 hover:text-eden-navy border-none bg-transparent cursor-pointer flex items-center"
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-eden-navy hover:bg-eden-light-navy text-white text-xs font-medium tracking-wide py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 border-none cursor-pointer mt-2"
      >
        {isLoading ? (
          <><Loader2 size={14} className="animate-spin" />{loadingLabel}</>
        ) : (
          <>{submitLabel}<ArrowRight size={14} /></>
        )}
      </button>
    </form>
  </div>
);