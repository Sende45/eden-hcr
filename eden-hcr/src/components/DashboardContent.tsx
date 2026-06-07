import React from 'react';
import { UserCheck, FilePlus, Building2, ChevronRight, Star } from 'lucide-react';

export const DashboardContent: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.1fr] gap-[24px] p-[24px_30px] font-sans">

      {/* COLONNE GAUCHE */}
      <div className="space-y-[24px]">

        <div className="bg-eden-bg2 border border-eden-border rounded-[14px] overflow-hidden shadow-xs">
          <div className="p-[18px_22px] border-b border-eden-border/60 flex items-center justify-between">
            <h2 className="font-serif font-semibold text-[17px] text-eden-navy tracking-wide">
              Missions urgentes à pourvoir
            </h2>
            <button className="text-[12px] text-eden-tan hover:text-eden-navy font-medium flex items-center gap-1 cursor-pointer transition-colors">
              Voir tout <ChevronRight size={14} />
            </button>
          </div>

          <div className="divide-y divide-eden-border/40">
            <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr] items-center p-[15px_22px] hover:bg-eden-bg/30 transition-colors cursor-pointer gap-2">
              <div>
                <div className="text-[13.5px] font-medium text-eden-navy">Chef de Rang (H/F)</div>
                <div className="text-[11.5px] text-eden-text-light/80 flex items-center gap-1 mt-0.5">
                  <Building2 size={13} className="text-eden-tan/70" /> Le Grand Récamier · Paris 7e
                </div>
              </div>
              <div>
                <span className="inline-flex items-center rounded-md bg-eden-navy/5 text-eden-navy text-[11px] font-medium p-[2px_8px]">
                  Service en salle
                </span>
              </div>
              <div className="sm:text-right">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium p-[3px_9px] rounded-full bg-eden-orange/10 text-eden-orange">
                  <span className="w-1 h-1 rounded-full bg-current" /> Ce soir (Coup de feu)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr] items-center p-[15px_22px] hover:bg-eden-bg/30 transition-colors cursor-pointer gap-2">
              <div>
                <div className="text-[13.5px] font-medium text-eden-navy">Commis de Cuisine (H/F)</div>
                <div className="text-[11.5px] text-eden-text-light/80 flex items-center gap-1 mt-0.5">
                  <Building2 size={13} className="text-eden-tan/70" /> Brasserie Les Deux Magots
                </div>
              </div>
              <div>
                <span className="inline-flex items-center rounded-md bg-eden-teal/5 text-eden-teal text-[11px] font-medium p-[2px_8px]">
                  Cuisine
                </span>
              </div>
              <div className="sm:text-right">
                <span className="text-[12px] text-eden-text-light/70 font-light">Sam. 7 Juin</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr] items-center p-[15px_22px] hover:bg-eden-bg/30 transition-colors cursor-pointer gap-2">
              <div>
                <div className="text-[13.5px] font-medium text-eden-navy">Bartender / Mixologue</div>
                <div className="text-[11.5px] text-eden-text-light/80 flex items-center gap-1 mt-0.5">
                  <Building2 size={13} className="text-eden-tan/70" /> Rooftop Hôtel National
                </div>
              </div>
              <div>
                <span className="inline-flex items-center rounded-md bg-eden-tan/15 text-eden-tan text-[11px] font-medium p-[2px_8px]">
                  Bar & Lounge
                </span>
              </div>
              <div className="sm:text-right">
                <span className="text-[12px] text-eden-text-light/70 font-light">08/06 au 12/06</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-eden-bg2 border border-eden-border rounded-[14px] overflow-hidden shadow-xs">
          <div className="p-[18px_22px] border-b border-eden-border/60">
            <h2 className="font-serif font-semibold text-[17px] text-eden-navy tracking-wide">
              Candidats qualifiés disponibles
            </h2>
          </div>
          <div className="p-[14px_22px] grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="border border-eden-border-light rounded-xl p-3 flex items-center gap-3 hover:border-eden-tan cursor-pointer transition-colors">
              <div className="w-9 h-9 rounded-full bg-eden-navy text-white text-xs font-semibold flex items-center justify-center">AM</div>
              <div>
                <div className="text-[13px] font-medium text-eden-navy">Alexandre Moreau</div>
                <div className="text-[11px] text-eden-text-light">Chef de partie · 5 ans exp.</div>
              </div>
              <span className="w-2 h-2 rounded-full bg-eden-teal ml-auto" title="Disponible immédiatement" />
            </div>
            <div className="border border-eden-border-light rounded-xl p-3 flex items-center gap-3 hover:border-eden-tan cursor-pointer transition-colors">
              <div className="w-9 h-9 rounded-full bg-eden-teal text-white text-xs font-semibold flex items-center justify-center">CI</div>
              <div>
                <div className="text-[13px] font-medium text-eden-navy">Clara Ibanez</div>
                <div className="text-[11px] text-eden-text-light">Hôtesse d'accueil · Bilingue</div>
              </div>
              <span className="w-2 h-2 rounded-full bg-eden-teal ml-auto" title="Disponible immédiatement" />
            </div>
          </div>
        </div>

      </div>

      {/* COLONNE DROITE */}
      <div className="space-y-[24px]">

        <div className="bg-eden-bg2 border border-eden-border rounded-[14px] p-[20px_22px] shadow-xs">
          <h2 className="font-serif font-semibold text-[17px] text-eden-navy tracking-wide mb-[16px]">
            Flux d'activité agence
          </h2>
          <div className="space-y-[16px]">
            <div className="flex gap-3 text-[12.5px] leading-relaxed">
              <div className="w-[26px] h-[26px] rounded-full bg-eden-teal/10 text-eden-teal flex items-center justify-center shrink-0 mt-0.5">
                <UserCheck size={13} />
              </div>
              <div className="flex-1">
                <span className="font-medium text-eden-navy">Thomas G.</span> a validé son contrat d'extra pour l'Hôtel Ritz.
                <div className="text-[11px] text-eden-text-light/50 font-light mt-0.5">Il y a 10 min</div>
              </div>
            </div>
            <div className="flex gap-3 text-[12.5px] leading-relaxed">
              <div className="w-[26px] h-[26px] rounded-full bg-eden-tan/15 text-eden-tan flex items-center justify-center shrink-0 mt-0.5">
                <FilePlus size={13} />
              </div>
              <div className="flex-1">
                Nouvelle demande d'extra déposée par le restaurant <span className="font-medium text-eden-navy">Le Meurice</span>.
                <div className="text-[11px] text-eden-text-light/50 font-light mt-0.5">Il y a 45 min</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-[12px]">
          <div className="bg-eden-bg2 border border-eden-border rounded-[14px] p-[16px_20px] shadow-xs">
            <div className="text-[12px] font-medium text-eden-text-light flex items-center gap-1.5 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-eden-navy" /> Taux de remplissage des shifts
            </div>
            <div className="w-full h-1.5 bg-eden-bg rounded-full overflow-hidden mb-2">
              <div className="h-full bg-eden-navy rounded-full" style={{ width: '82%' }} />
            </div>
            <div className="flex justify-between items-end">
              <div className="font-serif font-bold text-[22px] text-eden-navy leading-none">82%</div>
              <div className="text-[11px] text-eden-text-light/60">41 / 50 postes pourvus</div>
            </div>
          </div>

          <div className="bg-eden-bg2 border border-eden-border rounded-[14px] p-[16px_20px] shadow-xs">
            <div className="text-[12px] font-medium text-eden-text-light flex items-center gap-1.5 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-eden-teal" /> Satisfaction des établissements
            </div>
            <div className="w-full h-1.5 bg-eden-bg rounded-full overflow-hidden mb-2">
              <div className="h-full bg-eden-teal rounded-full" style={{ width: '94%' }} />
            </div>
            <div className="flex justify-between items-end">
              <div className="font-serif font-bold text-[22px] text-eden-teal leading-none">
                4.8<span className="text-[12px] text-eden-text-light font-light">/5</span>
              </div>
              <div className="text-[11px] text-eden-text-light/60 flex items-center gap-0.5">
                Basé sur 120 avis <Star size={10} className="fill-eden-tan text-eden-tan" />
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};