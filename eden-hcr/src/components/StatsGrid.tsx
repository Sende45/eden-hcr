import React from 'react';
import { Briefcase, Users, FileCheck, DollarSign } from 'lucide-react';

export const StatsGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px] p-[24px_30px_0px] font-sans">
      
      {/* CARD 1 : MISSIONS ACTIVES */}
      <div className="bg-eden-bg2 border border-eden-border rounded-[14px] p-[22px_24px] relative overflow-hidden shadow-xs group hover:border-eden-tan transition-all">
        <div className="absolute top-[-30px] right-[-30px] w-24 h-24 rounded-full border-[10px] border-eden-navy/4 pointer-events-none group-hover:scale-110 transition-transform" />
        <div className="flex items-center justify-between mb-[14px]">
          <span className="text-[12.5px] text-eden-text-light font-medium uppercase tracking-wider">Missions Actives</span>
          <div className="w-[34px] h-[34px] rounded-lg bg-eden-navy/5 text-eden-navy flex items-center justify-center">
            <Briefcase size={16} />
          </div>
        </div>
        <div className="font-serif font-bold text-[32px] text-eden-navy leading-none">24</div>
        <div className="text-[11.5px] text-eden-sage font-medium mt-[6px]">
          +3 <span className="text-eden-text-light/60 font-light">cette semaine</span>
        </div>
      </div>

      {/* CARD 2 : EXTRA DISPONIBLES */}
      <div className="bg-eden-bg2 border border-eden-border rounded-[14px] p-[22px_24px] relative overflow-hidden shadow-xs group hover:border-eden-tan transition-all">
        <div className="absolute top-[-30px] right-[-30px] w-24 h-24 rounded-full border-[10px] border-eden-teal/4 pointer-events-none group-hover:scale-110 transition-transform" />
        <div className="flex items-center justify-between mb-[14px]">
          <span className="text-[12.5px] text-eden-text-light font-medium uppercase tracking-wider">Extras Disponibles</span>
          <div className="w-[34px] h-[34px] rounded-lg bg-eden-teal/5 text-eden-teal flex items-center justify-center">
            <Users size={16} />
          </div>
        </div>
        <div className="font-serif font-bold text-[32px] text-eden-navy leading-none">142</div>
        <div className="text-[11.5px] text-eden-sage font-medium mt-[6px]">
          89% <span className="text-eden-text-light/60 font-light">de taux de dispo.</span>
        </div>
      </div>

      {/* CARD 3 : CONTRATS SIGNÉS */}
      <div className="bg-eden-bg2 border border-eden-border rounded-[14px] p-[22px_24px] relative overflow-hidden shadow-xs group hover:border-eden-tan transition-all">
        <div className="absolute top-[-30px] right-[-30px] w-24 h-24 rounded-full border-[10px] border-eden-tan/8 pointer-events-none group-hover:scale-110 transition-transform" />
        <div className="flex items-center justify-between mb-[14px]">
          <span className="text-[12.5px] text-eden-text-light font-medium uppercase tracking-wider">Contrats Générés</span>
          <div className="w-[34px] h-[34px] rounded-lg bg-eden-tan/10 text-eden-tan flex items-center justify-center">
            <FileCheck size={16} />
          </div>
        </div>
        <div className="font-serif font-bold text-[32px] text-eden-navy leading-none">58</div>
        <div className="text-[11.5px] text-eden-sage font-medium mt-[6px]">
          100% <span className="text-eden-text-light/60 font-light">conformes URSSAF</span>
        </div>
      </div>

      {/* CARD 4 : CHIFFRE D'AFFAIRES MENSUELE */}
      <div className="bg-eden-bg2 border border-eden-border rounded-[14px] p-[22px_24px] relative overflow-hidden shadow-xs group hover:border-eden-tan transition-all">
        <div className="absolute top-[-30px] right-[-30px] w-24 h-24 rounded-full border-[10px] border-eden-orange/5 pointer-events-none group-hover:scale-110 transition-transform" />
        <div className="flex items-center justify-between mb-[14px]">
          <span className="text-[12.5px] text-eden-text-light font-medium uppercase tracking-wider">Facturation CA</span>
          <div className="w-[34px] h-[34px] rounded-lg bg-eden-orange/5 text-eden-orange flex items-center justify-center">
            <DollarSign size={16} />
          </div>
        </div>
        <div className="font-serif font-bold text-[32px] text-eden-navy leading-none">12.4K€</div>
        <div className="text-[11.5px] text-eden-orange font-medium mt-[6px]">
          +14% <span className="text-eden-text-light/60 font-light">vs mois dernier</span>
        </div>
      </div>

    </div>
  );
};