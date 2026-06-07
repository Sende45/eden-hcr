import React, { useState } from 'react';
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';

export type ClientLoginProps = {
  onLoginSuccess: () => void;
};

export const ClientLogin: React.FC<ClientLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulation d'accès pour un hôtel partenaire (ex: Le Ritz)
    setTimeout(() => {
      if (email === 'ritz.paris@eden.co' && password === 'client2026') {
        setIsLoading(false);
        onLoginSuccess();
      } else {
        setIsLoading(false);
        setError('Identifiants Entreprise incorrects. Veuillez vérifier vos accès.');
      }
    }, 1200);
  };

  return (
    <AuthLayout>
      <div className="space-y-6 font-sans">
        
        <div className="space-y-1.5 text-left">
          <h1 className="font-serif font-bold text-2xl text-eden-navy tracking-wide">
            Espace Établissement
          </h1>
          <p className="text-xs text-eden-text-light font-light">
            Console de commande de brigades et gestion des extras pour les hôtels et restaurants partenaires.
          </p>
        </div>

        {error && (
          <div className="bg-eden-orange/10 border border-eden-orange/20 text-eden-orange text-[11px] p-3 rounded-lg font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="space-y-1">
            <label className="font-medium text-eden-navy block">Email Entreprise / Hôtel</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-3.5 text-eden-text-light/60" />
              <input 
                type="email" 
                required
                disabled={isLoading}
                placeholder="ritz.paris@eden.co"
                className="w-full bg-eden-bg2 border border-eden-border rounded-xl p-[11px_12px_11px_36px] text-eden-text-dark outline-hidden focus:border-eden-tan text-xs disabled:opacity-60 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-medium text-eden-navy block">Mot de passe</label>
              <button type="button" className="text-[11px] text-eden-tan hover:text-eden-navy font-medium border-none bg-transparent cursor-pointer">
                Oublié ?
              </button>
            </div>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-3.5 text-eden-text-light/60" />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                disabled={isLoading}
                placeholder="••••••••"
                className="w-full bg-eden-bg2 border border-eden-border rounded-xl p-[11px_38px_11px_36px] text-eden-text-dark outline-hidden focus:border-eden-tan text-xs disabled:opacity-60 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-eden-text-light/60 hover:text-eden-navy border-none bg-transparent cursor-pointer flex items-center justify-center"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-eden-navy hover:bg-eden-light-navy text-white text-xs font-medium tracking-wide py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 border-none cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Vérification du compte...
              </>
            ) : (
              <>
                Accéder aux commandes
                <ArrowRight size={14} />
              </>
            )}
          </button>

        </form>

      </div>
    </AuthLayout>
  );
};