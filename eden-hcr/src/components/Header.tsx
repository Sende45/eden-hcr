import React from 'react';
import { Menu, User, Briefcase, Bell, Shield } from 'lucide-react';

// Déclaration de l'interface pour le typage strict des props
export type HeaderProps = {
  onNavigateToDashboard: () => void;
  onNavigateToOnboarding: () => void;
  onNavigateToContact: () => void;
  onNavigateToClientAuth: () => void; // <-- Ajout strict de la prop manquante
};

export const Header: React.FC<HeaderProps> = ({ 
  onNavigateToDashboard, 
  onNavigateToOnboarding, 
  onNavigateToContact,
  onNavigateToClientAuth // <-- Récupération de la prop
}) => {
  return (
    <header className="bg-eden-bg2/90 border-b border-eden-border px-6 py-4 sticky top-0 z-50 font-sans backdrop-blur-md shadow-2xs transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* LOGO RECOMPOSÉ */}
        <div className="flex items-center select-none group cursor-pointer transition-all duration-300">
          <div className="h-[42px] w-[58px] flex items-center justify-center overflow-hidden rounded-xl bg-eden-navy/5 p-1 border border-eden-border/30 transition-all duration-300 group-hover:bg-eden-navy/10 group-hover:border-eden-tan/40 shadow-2xs">
            <img 
              src="https://i.ibb.co/zTQJj8Tk/logo23-AJ.png" 
              alt="EDÈN Logo Icon" 
              className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
            />
          </div>
          <div className="ml-3 flex flex-col justify-center">
            <div className="font-serif font-semibold text-xl text-eden-navy tracking-wider leading-none transition-colors duration-300 group-hover:text-eden-light-navy">
              ED<span className="text-eden-tan">È</span>N <span className="font-light text-eden-navy/80">Group</span>
            </div>
            <div className="text-[11px] text-eden-tan font-bold tracking-[4px] uppercase mt-1.5 pl-0.5 leading-none">
              HCR
            </div>
          </div>
        </div>

        {/* NAVIGATION DESKTOP */}
        <nav className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-eden-text-dark/70 tracking-wide select-none">
          <a href="#solutions" className="hover:text-eden-tan transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1.5px] after:bg-eden-tan hover:after:w-full after:transition-all after:duration-300">Nos Solutions</a>
          <a href="#etablissements" className="hover:text-eden-tan transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1.5px] after:bg-eden-tan hover:after:w-full after:transition-all after:duration-300">Établissements</a>
          
          <button 
            onClick={onNavigateToOnboarding}
            className="bg-transparent border-none p-0 font-sans font-semibold text-[13px] text-eden-text-dark/70 tracking-wide hover:text-eden-tan cursor-pointer transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1.5px] after:bg-eden-tan hover:after:w-full after:transition-all after:duration-300"
          >
            Devenir Intérimaire
          </button>
          
          <button 
            onClick={onNavigateToContact}
            className="bg-transparent border-none p-0 font-sans font-semibold text-[13px] text-eden-text-dark/70 tracking-wide hover:text-eden-tan cursor-pointer transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1.5px] after:bg-eden-tan hover:after:w-full after:transition-all after:duration-300"
          >
            Contact
          </button>
        </nav>

        {/* ACTIONS */}
        <div className="flex items-center gap-4">
          <button className="p-2 text-eden-text-light hover:text-eden-navy transition-colors relative border-none bg-transparent cursor-pointer group" aria-label="Notifications">
            <Bell size={18} className="transition-transform duration-300 group-hover:rotate-12" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-eden-orange rounded-full ring-2 ring-eden-bg2" />
          </button>
          
          <a href="https://eden-group.co" className="hidden lg:flex items-center gap-2 border border-eden-border hover:border-eden-tan/60 hover:bg-eden-navy/[0.02] text-eden-text-dark px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 bg-transparent shadow-2xs">
            <Briefcase size={14} className="text-eden-text-light" /> Accès Nettoyage
          </a>

          <button onClick={onNavigateToDashboard} className="hidden sm:flex items-center gap-2 text-eden-text-light hover:text-eden-navy hover:bg-eden-navy/5 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 border-none bg-transparent cursor-pointer">
            <Shield size={14} className="text-eden-tan" /> Espace Agence
          </button>

          {/* BOUTON ESPACE CLIENT DESORMAIS BRANCHÉ STRICTEMENT */}
          <button 
            onClick={onNavigateToClientAuth}
            className="bg-eden-navy hover:bg-eden-light-navy text-white px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-eden-navy/10 active:scale-98 border-none cursor-pointer"
          >
            <User size={14} /> Espace Client
          </button>

          <button className="md:hidden p-2 text-eden-navy hover:bg-eden-navy/5 rounded-lg transition-colors border-none bg-transparent cursor-pointer" aria-label="Menu principal">
            <Menu size={20} />
          </button>
        </div>

      </div>
    </header>
  );
};