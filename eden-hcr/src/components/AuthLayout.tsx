import React from 'react';
import { Sparkles } from 'lucide-react';

export type AuthLayoutProps = {
  children: React.ReactNode;
};

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-eden-bg flex antialiased font-sans overflow-hidden">
      
      {/* PANNEAU DE PRESTIGE GAUCHE (VISIBLE SUR DESKTOP) */}
      <div className="hidden lg:flex lg:w-[45%] bg-eden-navy relative flex-col justify-between p-12 select-none overflow-hidden shrink-0">
        {/* Cercles de flou cinétique de la marque */}
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full border-[40px] border-[#b2976a]/5 blur-2xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full border-[50px] border-[#1d6b5a]/8 blur-3xl" />

        {/* LOGO EN-TÊTE */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-[38px] h-[38px]">
            <svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path d="M19 6 C19 6, 14 10, 14 14 C14 17, 16.5 19, 19 19 C21.5 19, 24 17, 24 14 C24 10, 19 6, 19 6Z" stroke="#b2976a" strokeWidth="2" fill="none"/>
              <path d="M19 32 C19 32, 14 28, 14 24 C14 21, 16.5 19, 19 19 C21.5 19, 24 21, 24 24 C24 28, 19 32, 19 32Z" stroke="#b2976a" strokeWidth="2" fill="none"/>
              <path d="M6 19 C6 19, 10 14, 14 14 C17 14, 19 16.5, 19 19 C19 21.5, 17 24, 14 24 C10 24, 6 19, 6 19Z" stroke="#b2976a" strokeWidth="2" fill="none"/>
              <path d="M32 19 C32 19, 28 14, 24 14 C21 14, 19 16.5, 19 19 C19 21.5, 21 24, 24 24 C28 24, 32 19, 32 19Z" stroke="#b2976a" strokeWidth="2" fill="none"/>
            </svg>
          </div>
          <div>
            <div className="font-serif font-semibold text-xl text-white tracking-wider leading-none">
              ED<span className="text-eden-tan">È</span>N <span className="font-light text-white/70">Group</span>
            </div>
            <div className="text-[9px] text-[#b2976a]/80 tracking-[2.5px] uppercase font-medium mt-1">
              Intérim HCR
            </div>
          </div>
        </div>

        {/* ACCROCHE CENTRALE */}
        <div className="relative z-10 max-w-sm space-y-4 my-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#b2976a] text-[10px] font-semibold uppercase tracking-wider">
            <Sparkles size={11} /> Agence de confiance
          </div>
          <h2 className="font-serif font-bold text-3xl text-white tracking-tight leading-tight">
            Pilotez vos équipes avec une précision chirurgicale.
          </h2>
          <p className="text-white/60 text-xs font-light leading-relaxed">
            Accédez aux dossiers des extras, gérez la conformité des contrats et lancez les processus de facturation depuis votre console d'administration.
          </p>
        </div>

        {/* FOOTER DISCRET */}
        <div className="relative z-10 text-[10px] text-white/30 font-light tracking-wide">
          © 2026 EDÈN Group HCR · Console d'administration privée.
        </div>
      </div>

      {/* ZONE DE FORMULAIRE DROITE */}
      <div className="flex-1 flex items-center justify-center p-6 bg-eden-bg relative">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>

    </div>
  );
};