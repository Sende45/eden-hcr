import React from 'react';
import { Search, Bell, SlidersHorizontal, Plus } from 'lucide-react';

interface TopbarProps {
  onNewMissionClick: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onNewMissionClick }) => {
  return (
    <div className="flex items-center justify-between p-[18px_30px] border-b border-eden-border bg-eden-bg2 font-sans shrink-0">
      
      {/* INTRO PAGE */}
      <div>
        <h1 className="font-serif font-semibold text-2xl text-eden-navy tracking-wide">
          Tableau de bord
        </h1>
        <p className="text-xs text-eden-text-light font-light tracking-wide mt-[2px]">
          Mardi 16 juin 2025 &nbsp;·&nbsp; Semaine 23
        </p>
      </div>

      {/* RECHERCHE ET UTILS */}
      <div className="flex items-center gap-2.5">
        {/* INPUT RECHERCHE SANS BORDURE SUR CHARGE */}
        <div className="flex items-center gap-2 bg-eden-bg border border-eden-border rounded-lg p-[8px_14px] text-eden-text-light w-[210px] cursor-text">
          <Search size={16} className="shrink-0" />
          <input 
            type="text" 
            placeholder="Rechercher…" 
            className="bg-transparent border-none text-xs outline-hidden w-full text-eden-text-dark placeholder:text-eden-text-light/70"
          />
        </div>

        {/* NOTIFICATION BUTTON */}
        <button className="w-9 h-9 rounded-lg border border-eden-border bg-eden-bg flex items-center justify-center text-eden-text-light relative hover:border-eden-tan hover:text-eden-navy cursor-pointer transition-all">
          <Bell size={17} />
          <span className="absolute top-[8px] right-[8px] w-1.5 h-1.5 rounded-full bg-eden-orange border border-eden-bg2" />
        </button>

        {/* FILTRE / PARAMETRES GRAPHIC */}
        <button className="w-9 h-9 rounded-lg border border-eden-border bg-eden-bg flex items-center justify-center text-eden-text-light hover:border-eden-tan hover:text-eden-navy cursor-pointer transition-all">
          <SlidersHorizontal size={17} />
        </button>

        {/* ACTION CTA MODIFIÉE */}
        <button 
          onClick={onNewMissionClick}
          className="bg-eden-navy hover:bg-eden-light-navy text-white text-xs font-medium tracking-wide p-[9px_18px] rounded-lg flex items-center gap-1.5 border-none transition-colors shadow-xs cursor-pointer"
        >
          <Plus size={15} />
          Nouvelle mission
        </button>
      </div>

    </div>
  );
};