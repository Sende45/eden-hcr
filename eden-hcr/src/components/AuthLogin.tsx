import React, { useState } from 'react';
import { Mail, Lock, LogIn, ShieldCheck, AlertCircle, ShieldAlert } from 'lucide-react';
// 1. Importation du service d'authentification centralisé MERN
import { login as apiLogin } from '../services/authService';

interface AuthLoginProps {
  onLoginSuccess: (userData: { id: string; email: string; role: string }) => void;
  onNavigateToAdmin?: () => void; // <-- Ajout de la prop optionnelle pour le bouton Console Agence
}

export const AuthLogin: React.FC<AuthLoginProps> = ({ onLoginSuccess, onNavigateToAdmin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 2. Utilisation de ton service à la place du fetch brut pour normaliser la réponse
      const result = await apiLogin(email, password);

      // 3. Déclenchement du callback parent avec les infos normalisées
      onLoginSuccess({
        id: result.user.id,
        email: result.user.email,
        role: result.user.role
      });
    } catch (err: any) {
      console.error('Erreur connexion :', err);
      // Récupération propre du message d'erreur renvoyé par ton instance Render
      setError(err.message || 'Identifiants incorrects.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-eden-bg2 border border-eden-border rounded-2xl p-8 shadow-2xl font-sans relative overflow-hidden backdrop-blur-md animate-[fadeInUp_0.4s_ease-out]">
      {/* Lueur d'arrière-plan */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-eden-tan/5 rounded-full blur-2xl pointer-events-none" />

      {/* BOUTON D'ACCÈS RAPIDE À LA CONSOLE DE L'AGENCE */}
      {onNavigateToAdmin && (
        <div className="absolute top-4 right-4 z-20">
          <button
            type="button"
            onClick={onNavigateToAdmin}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-eden-navy/5 hover:bg-eden-navy/10 text-eden-navy rounded-lg text-[10px] font-bold tracking-wide uppercase transition-all cursor-pointer border border-solid border-eden-navy/10"
          >
            <ShieldAlert size={12} className="text-eden-tan" />
            <span>Console Agence</span>
          </button>
        </div>
      )}

      <div className="text-center space-y-2 mb-8 relative z-10 select-none">
        <div className="w-12 h-12 bg-eden-navy/5 text-eden-tan rounded-full flex items-center justify-center mx-auto shadow-inner">
          <ShieldCheck size={24} />
        </div>
        <h3 className="font-serif font-bold text-xl text-eden-navy tracking-wide">Espace Sécurisé EDÈN</h3>
        <p className="text-xs text-eden-text-light font-light">Accédez à votre console de gestion HCR</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5 relative z-10">
        {error && (
          <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 animate-fadeIn">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold tracking-wide text-eden-text-dark">Adresse email</label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-eden-text-light" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: extra@eden-group.fr"
              className="w-full bg-eden-bg border border-eden-border/80 rounded-xl pl-9 pr-4 py-3 text-xs outline-hidden focus:border-eden-tan focus:ring-1 focus:ring-eden-tan/30 transition-all text-eden-text-dark shadow-2xs"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold tracking-wide text-eden-text-dark">Mot de passe</label>
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-eden-text-light" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-eden-bg border border-eden-border/80 rounded-xl pl-9 pr-4 py-3 text-xs outline-hidden focus:border-eden-tan focus:ring-1 focus:ring-eden-tan/30 transition-all text-eden-text-dark shadow-2xs"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-eden-navy hover:bg-eden-light-navy text-white py-3.5 px-6 rounded-xl text-xs font-semibold tracking-wide cursor-pointer transition-all shadow-md active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
        >
          <LogIn size={14} className="text-eden-tan" />
          <span>{isLoading ? 'Authentification en cours...' : 'Se connecter'}</span>
        </button>
      </form>
    </div>
  );
};