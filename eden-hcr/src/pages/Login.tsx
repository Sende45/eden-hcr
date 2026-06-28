import React, { useState } from 'react';
import {
  Mail, Lock, Loader2, ArrowRight, Building2,
  Eye, ShieldCheck, UserCheck, AlertCircle, Briefcase, UserPlus
} from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { login, register } from '../services/authService';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'prestataire' | 'agence' | 'client';
type ClientSubTab = 'connexion' | 'inscription';

export type LoginProps = {
  onPrestataireLoginSuccess: (userData: { id: string; email: string; role: string }) => void;
  onAdminLoginSuccess: () => void;
  onClientLoginSuccess: (userData: { id: string; email: string; role: string; societe?: string }) => void;
};

// ─── Composant racine unifié ──────────────────────────────────────────────────

export const Login: React.FC<LoginProps> = ({
  onPrestataireLoginSuccess,
  onAdminLoginSuccess,
  onClientLoginSuccess,
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

        {/* ONGLETS PRINCIPAUX */}
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
            label="Espace Extra"
          />
          <TabButton
            active={activeTab === 'agence'}
            onClick={() => setActiveTab('agence')}
            icon={<ShieldCheck size={13} />}
            label="Admin Agence"
          />
          <TabButton
            active={activeTab === 'client'}
            onClick={() => setActiveTab('client')}
            icon={<Building2 size={13} />}
            label="Espace Client"
          />
        </div>

        {/* FORMULAIRES */}
        {activeTab === 'prestataire' && (
          <PrestataireForm key="login-prestataire" onSuccess={onPrestataireLoginSuccess} />
        )}
        {activeTab === 'agence' && (
          <AgenceForm key="login-agence" onSuccess={onAdminLoginSuccess} />
        )}
        {activeTab === 'client' && (
          <ClientPanel key="client-panel" onSuccess={onClientLoginSuccess} />
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

// ─── Panel Client (connexion + inscription) ───────────────────────────────────

const ClientPanel: React.FC<{
  onSuccess: (userData: { id: string; email: string; role: string; societe?: string }) => void;
}> = ({ onSuccess }) => {
  const [subTab, setSubTab] = useState<ClientSubTab>('connexion');

  return (
    <div className="space-y-4">
      {/* Sous-onglets */}
      <div className="flex gap-1 bg-eden-bg2 border border-eden-border rounded-xl p-1">
        <div className="relative flex w-full gap-1">
          <div
            className="absolute top-0 bottom-0 bg-white rounded-lg shadow-sm transition-all duration-300 ease-in-out"
            style={{ width: 'calc(50% - 2px)', left: subTab === 'connexion' ? '0px' : 'calc(50% + 2px)' }}
          />
          <button
            type="button"
            onClick={() => setSubTab('connexion')}
            className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-semibold rounded-lg transition-colors border-none cursor-pointer bg-transparent ${
              subTab === 'connexion' ? 'text-eden-navy' : 'text-eden-text-light'
            }`}
          >
            <UserCheck size={12} />
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => setSubTab('inscription')}
            className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-semibold rounded-lg transition-colors border-none cursor-pointer bg-transparent ${
              subTab === 'inscription' ? 'text-eden-navy' : 'text-eden-text-light'
            }`}
          >
            <UserPlus size={12} />
            Créer un compte
          </button>
        </div>
      </div>

      {subTab === 'connexion'
        ? <ClientConnexionForm onSuccess={onSuccess} />
        : <ClientInscriptionForm onSuccess={onSuccess} />
      }
    </div>
  );
};

// ─── Formulaire Connexion Extra ───────────────────────────────────────────────

const PrestataireForm: React.FC<{
  onSuccess: (userData: { id: string; email: string; role: string }) => void;
}> = ({ onSuccess }) => {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const result = await login(email, password);
      if (result.user.role !== 'extra') {
        setError("Ce formulaire est réservé aux extras. Utilisez l'onglet correspondant à votre profil.");
        return;
      }
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

// ─── Formulaire Connexion Client ──────────────────────────────────────────────

const ClientConnexionForm: React.FC<{
  onSuccess: (userData: { id: string; email: string; role: string; societe?: string }) => void;
}> = ({ onSuccess }) => {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const result = await login(email, password);
      if (result.user.role !== 'client') {
        setError("Ce formulaire est réservé aux clients. Utilisez l'onglet correspondant à votre profil.");
        return;
      }
      onSuccess({
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        societe: result.user.societe
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginForm
      subtitle="Accédez à l'annuaire de nos extras qualifiés."
      error={error}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      email={email}
      onEmailChange={setEmail}
      password={password}
      onPasswordChange={setPassword}
      showPassword={showPassword}
      onTogglePassword={() => setShowPassword(v => !v)}
      emailPlaceholder="contact@monhotel.fr"
      submitLabel="Accéder à mon espace client"
      loadingLabel="Authentification..."
    />
  );
};

// ─── Formulaire Inscription Client ────────────────────────────────────────────

const ClientInscriptionForm: React.FC<{
  onSuccess: (userData: { id: string; email: string; role: string; societe?: string }) => void;
}> = ({ onSuccess }) => {
  const [societe, setSociete]           = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const result = await register({ email, password, societe, role: 'client' });
      onSuccess({
        id: result.user.id,
        email: result.user.email,
        role: String(result.user.role),
        societe: result.user.societe
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5 bg-eden-tan/10 border border-eden-tan/30 rounded-xl px-3 py-3">
        <Briefcase size={13} className="text-eden-tan shrink-0 mt-0.5" />
        <p className="text-[11px] text-eden-navy font-medium leading-relaxed">
          Espace réservé aux <strong>établissements & entreprises clientes</strong>.
          Accédez à la liste complète de nos extras qualifiés.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-[11px] p-3 rounded-xl font-medium">
          <AlertCircle size={13} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs" autoComplete="off">
        <div className="space-y-1">
          <label className="font-medium text-eden-navy block">Nom de l'établissement / société</label>
          <div className="relative">
            <Building2 size={14} className="absolute left-3 top-3.5 text-eden-text-light/60" />
            <input
              type="text"
              required
              disabled={isLoading}
              placeholder="Ex : Hôtel Le Grand Paris"
              value={societe}
              onChange={e => setSociete(e.target.value)}
              className="w-full bg-eden-bg2 border border-eden-border rounded-xl p-[11px_12px_11px_36px] outline-none focus:border-eden-tan transition-all"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="font-medium text-eden-navy block">Adresse email professionnelle</label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-3.5 text-eden-text-light/60" />
            <input
              type="email"
              required
              disabled={isLoading}
              placeholder="contact@monhotel.fr"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-eden-bg2 border border-eden-border rounded-xl p-[11px_12px_11px_36px] outline-none focus:border-eden-tan transition-all"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="font-medium text-eden-navy block">Mot de passe</label>
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-3.5 text-eden-text-light/60" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              disabled={isLoading}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-eden-bg2 border border-eden-border rounded-xl p-[11px_38px_11px_36px] outline-none focus:border-eden-tan transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-3.5 text-eden-text-light/60 hover:text-eden-navy"
            >
              <Eye size={14} />
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-eden-navy hover:bg-eden-light-navy text-white text-xs font-medium py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {isLoading
            ? <><Loader2 size={14} className="animate-spin" />Création du compte...</>
            : <>Créer mon accès client <ArrowRight size={14} /></>}
        </button>
      </form>
    </div>
  );
};

// ─── Formulaire Admin ─────────────────────────────────────────────────────────

const AgenceForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const result = await login(email, password);
      if (result.user.role === 'admin' || result.user.role === 'superadmin') {
        onSuccess();
      } else {
        setError("Accès refusé. Ce compte ne possède pas les privilèges Agence.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Identifiants invalides.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 bg-eden-navy/5 border border-eden-navy/10 rounded-xl px-3 py-2.5">
        <ShieldCheck size={13} className="text-eden-tan shrink-0" />
        <p className="text-[11px] text-eden-navy font-medium">Accès restreint — Console interne EDÈN</p>
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
        loadingLabel="Vérification..."
      />
    </div>
  );
};

// ─── Formulaire générique partagé ─────────────────────────────────────────────

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
};

const LoginForm: React.FC<LoginFormProps> = ({
  subtitle, error, onSubmit, isLoading,
  email, onEmailChange, password, onPasswordChange,
  showPassword, onTogglePassword,
  emailPlaceholder, submitLabel, loadingLabel,
}) => (
  <div className="space-y-4">
    {subtitle && <p className="text-[11px] text-eden-text-light font-light">{subtitle}</p>}
    {error && (
      <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-[11px] p-3 rounded-xl font-medium">
        <AlertCircle size={13} className="shrink-0 mt-0.5" />
        <span>{error}</span>
      </div>
    )}
    <form onSubmit={onSubmit} className="space-y-4 text-xs" autoComplete="off">
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
            className="w-full bg-eden-bg2 border border-eden-border rounded-xl p-[11px_12px_11px_36px] outline-none focus:border-eden-tan transition-all"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="font-medium text-eden-navy block">Mot de passe</label>
        <div className="relative">
          <Lock size={14} className="absolute left-3 top-3.5 text-eden-text-light/60" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            disabled={isLoading}
            placeholder="••••••••"
            value={password}
            onChange={e => onPasswordChange(e.target.value)}
            className="w-full bg-eden-bg2 border border-eden-border rounded-xl p-[11px_38px_11px_36px] outline-none focus:border-eden-tan transition-all"
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-3.5 text-eden-text-light/60 hover:text-eden-navy"
          >
            <Eye size={14} />
          </button>
        </div>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-eden-navy hover:bg-eden-light-navy text-white text-xs font-medium py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
      >
        {isLoading
          ? <><Loader2 size={14} className="animate-spin" />{loadingLabel}</>
          : <>{submitLabel}<ArrowRight size={14} /></>}
      </button>
    </form>
  </div>
);