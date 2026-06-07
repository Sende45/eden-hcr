import React, { useState } from 'react';
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';

export type LoginProps = {
  onLoginSuccess: () => void;
};

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulation de la validation locale avec tes vrais identifiants statiques
    setTimeout(() => {
      if (email === 'yohannesende@gmail.com' && password === '60023329') {
        setIsLoading(false);
        onLoginSuccess(); // Déclenche le passage vers le Dashboard.tsx
      } else {
        setIsLoading(false);
        setError('Identifiants incorrects. Veuillez vérifier vos accès Agence.');
      }
    }, 1200);
  };

  return (
    <AuthLayout>
      <div className="space-y-6 font-sans">
        
        {/* TITRES */}
        <div className="space-y-1.5 text-left">
          <h1 className="font-serif font-bold text-2xl text-eden-navy tracking-wide">
            Espace Agence
          </h1>
          <p className="text-xs text-eden-text-light font-light">
            Saisissez vos paramètres de connexion pour accéder à la console.
          </p>
        </div>

        {/* ERREUR VISUELLE DE CONFORMITÉ */}
        {error && (
          <div className="bg-eden-orange/10 border border-eden-orange/20 text-eden-orange text-[11px] p-3 rounded-lg font-medium animate-fade-in">
            {error}
          </div>
        )}

        {/* FORMULAIRE */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* CHAMP EMAIL */}
          <div className="space-y-1">
            <label className="font-medium text-eden-navy block">Adresse email agence</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-3.5 text-eden-text-light/60" />
              <input 
                type="email" 
                required
                disabled={isLoading}
                placeholder="yohannesende@gmail.com"
                className="w-full bg-eden-bg2 border border-eden-border rounded-xl p-[11px_12px_11px_36px] text-eden-text-dark outline-hidden focus:border-eden-tan text-xs disabled:opacity-60 transition-all"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* CHAMP MOT DE PASSE */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-medium text-eden-navy block">Mot de passe</label>
              <button 
                type="button"
                className="text-[11px] text-eden-tan hover:text-eden-navy font-medium border-none bg-transparent cursor-pointer"
              >
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
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

          {/* BOUTON DE SOUMISSION */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-eden-navy hover:bg-eden-light-navy text-white text-xs font-medium tracking-wide py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 border-none cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Vérification des accès...
              </>
            ) : (
              <>
                Se connecter à la console
                <ArrowRight size={14} />
              </>
            )}
          </button>

        </form>

      </div>
    </AuthLayout>
  );
};