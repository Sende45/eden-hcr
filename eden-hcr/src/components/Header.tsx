import React, { useEffect, useState } from 'react';
import { Menu, User, Briefcase, Bell, Shield, LogOut, X } from 'lucide-react';

export type HeaderProps = {
  onNavigateToDashboard: () => void;
  onNavigateToOnboarding: () => void;
  onNavigateToContact: () => void;
  onNavigateToClientAuth: () => void;
};

export const Header: React.FC<HeaderProps> = ({ 
  onNavigateToDashboard, 
  onNavigateToOnboarding, 
  onNavigateToContact,
  onNavigateToClientAuth
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Vérification de la présence du jeton MERN unifié au montage
  useEffect(() => {
    const token = localStorage.getItem('eden_token');
    setIsAuthenticated(!!token);
  }, []);

  // Gestion propre de la déconnexion
  const handleLogout = () => {
    localStorage.removeItem('eden_token');
    setIsAuthenticated(false);
    window.location.href = '/';
  };

  return (
    <header className="bg-eden-bg2/90 border-b border-eden-border px-6 py-4 sticky top-0 z-50 font-sans backdrop-blur-md shadow-2xs transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* LOGO EDÈN */}
        <button 
          type="button"
          onClick={() => { window.location.href = '/'; }}
          className="flex items-center select-none group cursor-pointer border-none bg-transparent p-0 font-sans text-left"
        >
          <div className="h-[42px] w-[58px] flex items-center justify-center overflow-hidden rounded-xl bg-eden-navy/5 p-1 border border-eden-border/30 transition-all duration-300 group-hover:bg-eden-navy/10 group-hover:border-eden-tan/40 shadow-2xs">
            <img 
              src="https://i.ibb.co/zTQJj8Tk/logo23-AJ.png" 
              alt="EDÈN Logo Icon" 
              className="h-full w-full object-contain"
            />
          </div>
          <div className="ml-3 hidden sm:block">
            <div className="font-serif font-semibold text-xl text-eden-navy tracking-wider leading-none">
              ED<span className="text-eden-tan">È</span>N <span className="font-light text-eden-navy/80">Group</span>
            </div>
            <div className="text-[11px] text-eden-tan font-bold tracking-[4px] uppercase mt-1.5 leading-none">HCR</div>
          </div>
        </button>

        {/* NAVIGATION DESKTOP */}
        <nav className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-eden-text-dark/70 tracking-wide select-none">
          <a href="#solutions" className="hover:text-eden-tan transition-colors duration-200">Nos Solutions</a>
          <a href="#etablissements" className="hover:text-eden-tan transition-colors duration-200">Établissements</a>
          <button onClick={onNavigateToOnboarding} className="bg-transparent border-none p-0 text-[13px] font-semibold text-eden-text-dark/70 hover:text-eden-tan cursor-pointer">Devenir Intérimaire</button>
          <button onClick={onNavigateToContact} className="bg-transparent border-none p-0 text-[13px] font-semibold text-eden-text-dark/70 hover:text-eden-tan cursor-pointer">Contact</button>
        </nav>

        {/* ACTIONS & MENU MOBILE */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-4">
            <a href="https://eden-group.co" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 border border-eden-border hover:border-eden-tan/60 px-4 py-2 rounded-xl text-xs font-semibold text-eden-text-dark transition-all">
              <Briefcase size={14} /> Accès Nettoyage
            </a>
            <button type="button" onClick={onNavigateToDashboard} className="flex items-center gap-2 text-eden-text-light hover:text-eden-navy px-3 py-2 rounded-xl text-xs font-semibold border-none bg-transparent cursor-pointer">
              <Shield size={14} className="text-eden-tan" /> Espace Agence
            </button>
          </div>

          {/* DYNAMISATION ESPACE CLIENT */}
          <div className="hidden sm:flex">
            {isAuthenticated ? (
              <button onClick={handleLogout} className="bg-eden-orange hover:bg-eden-orange/90 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border-none cursor-pointer">
                <LogOut size={14} /> Déconnexion
              </button>
            ) : (
              <button onClick={onNavigateToClientAuth} className="bg-eden-navy hover:bg-eden-light-navy text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border-none cursor-pointer">
                <User size={14} /> Espace Client
              </button>
            )}
          </div>

          {/* BOUTON MENU MOBILE */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-eden-navy hover:bg-eden-navy/5 rounded-lg border-none bg-transparent cursor-pointer"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* MENU MOBILE DÉROULANT */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-eden-bg2 border-b border-eden-border p-6 flex flex-col gap-4 shadow-xl animate-in slide-in-from-top-5">
          <a href="#solutions" onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-eden-border text-sm">Nos Solutions</a>
          <a href="#etablissements" onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-eden-border text-sm">Établissements</a>
          <button onClick={() => { onNavigateToOnboarding(); setIsMenuOpen(false); }} className="py-2 text-left text-sm border-b border-eden-border">Devenir Intérimaire</button>
          <button onClick={onNavigateToDashboard} className="py-2 text-left text-sm border-b border-eden-border">Espace Agence</button>
          <button onClick={isAuthenticated ? handleLogout : onNavigateToClientAuth} className="bg-eden-navy text-white py-3 rounded-xl text-xs font-bold w-full">
            {isAuthenticated ? 'Déconnexion' : 'Espace Client'}
          </button>
        </div>
      )}
    </header>
  );
};