import React, { useState } from 'react';
import { BarChart3, TrendingUp, Clock, FileSpreadsheet, Download, ArrowUpRight } from 'lucide-react';

export const ReportManager: React.FC = () => {
  return (
    <div className="p-[24px_30px] font-sans space-y-6">
      {/* EN-TÊTE */}
      <div className="bg-eden-bg2 border border-eden-border rounded-xl p-5 shadow-xs">
        <div className="space-y-1">
          <h2 className="font-serif font-semibold text-xl text-eden-navy tracking-wide flex items-center gap-2">
            <BarChart3 size={20} className="text-eden-tan" /> Rapports & Analytics Agence
          </h2>
          <p className="text-xs text-eden-text-light font-light">Suivez l'état de performance de l'activité intérim HCR et exportez vos bilans comptables.</p>
        </div>
      </div>

      {/* MINI STATS RAPPORT */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-eden-bg2 border border-eden-border rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-eden-teal/10 rounded-lg text-eden-teal"><Clock size={20} /></div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-eden-text-light font-semibold">Heures Cumulées</p>
            <p className="text-xl font-bold text-eden-navy mt-0.5">1 420h <span className="text-[11px] text-eden-teal font-normal">(ce mois)</span></p>
          </div>
        </div>
        <div className="bg-eden-bg2 border border-eden-border rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-eden-tan/10 rounded-lg text-eden-tan"><TrendingUp size={20} /></div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-eden-text-light font-semibold">Taux de Remplissage</p>
            <p className="text-xl font-bold text-eden-navy mt-0.5">94.2% <span className="text-[11px] text-eden-tan font-normal">(+2.4%)</span></p>
          </div>
        </div>
        <div className="bg-eden-bg2 border border-eden-border rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-eden-orange/10 rounded-lg text-eden-orange"><FileSpreadsheet size={20} /></div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-eden-text-light font-semibold">Factures Émises</p>
            <p className="text-xl font-bold text-eden-navy mt-0.5">48 documents</p>
          </div>
        </div>
      </div>

      {/* SECTION EXPORTS DISPONIBLES */}
      <div className="bg-eden-bg2 border border-eden-border rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-eden-navy">Documents et extractions comptables</h3>
        <div className="divide-y divide-eden-border/40 text-xs">
          <div className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
            <div>
              <p className="font-medium text-eden-text-dark">Rapport des heures intérimaires — Mai 2026</p>
              <p className="text-[11px] text-eden-text-light font-light mt-0.5">Format XLSX · Généré le 01/06/2026</p>
            </div>
            <button className="flex items-center gap-1.5 bg-eden-navy hover:bg-eden-light-navy text-white p-[6px_12px] rounded-lg text-[11px] font-medium transition-colors border-none cursor-pointer">
              <Download size={13} /> Télécharger
            </button>
          </div>
          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="font-medium text-eden-text-dark">Registre URSSAF & Déclarations Préalables (DPAE)</p>
              <p className="text-[11px] text-eden-text-light font-light mt-0.5">Format PDF · À jour en temps réel</p>
            </div>
            <button className="flex items-center gap-1.5 bg-transparent border border-eden-border hover:border-eden-tan text-eden-text-dark p-[6px_12px] rounded-lg text-[11px] font-medium transition-all cursor-pointer">
              <ArrowUpRight size={13} /> Ouvrir le registre
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};