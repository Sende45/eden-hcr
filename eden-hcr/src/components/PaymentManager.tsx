import React from 'react';
import { Coins, CreditCard, ShieldCheck, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export const PaymentManager: React.FC = () => {
  return (
    <div className="p-[24px_30px] font-sans space-y-6">
      {/* EN-TÊTE */}
      <div className="bg-eden-bg2 border border-eden-border rounded-xl p-5 shadow-xs">
        <div className="space-y-1">
          <h2 className="font-serif font-semibold text-xl text-eden-navy tracking-wide flex items-center gap-2">
            <Coins size={20} className="text-eden-tan" /> Flux Financiers & Paiements
          </h2>
          <p className="text-xs text-eden-text-light font-light">Contrôlez les encaissements des établissements Hôtels-Restaurants et ordonnez les virements d'extras.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ENCAISSEMENTS CLIENTS */}
        <div className="bg-eden-bg2 border border-eden-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-eden-border/40 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-eden-text-light flex items-center gap-1.5">
              <ArrowDownLeft size={14} className="text-eden-teal" /> Facturation Clients (Entrées)
            </h3>
            <span className="text-xs font-bold text-eden-teal">En attente : 4 890 €</span>
          </div>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-eden-bg border border-eden-border rounded-lg flex justify-between items-center">
              <div>
                <p className="font-medium text-eden-text-dark">Le Grand Récamier</p>
                <p className="text-[11px] text-eden-text-light font-light mt-0.5">Facture #FA-2026-401</p>
              </div>
              <span className="font-mono font-bold text-eden-navy">1 240.00 €</span>
            </div>
            <div className="p-3 bg-eden-bg border border-eden-border rounded-lg flex justify-between items-center">
              <div>
                <p className="font-medium text-eden-text-dark">Brasserie Lutetia</p>
                <p className="text-[11px] text-eden-text-light font-light mt-0.5">Facture #FA-2026-402</p>
              </div>
              <span className="font-mono font-bold text-eden-navy">3 650.00 €</span>
            </div>
          </div>
        </div>

        {/* REMUNERATIONS INTÉRIMAIRES */}
        <div className="bg-eden-bg2 border border-eden-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-eden-border/40 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-eden-text-light flex items-center gap-1.5">
              <ArrowUpRight size={14} className="text-eden-orange" /> Paies Intérimaires (Sorties)
            </h3>
            <button className="bg-eden-navy hover:bg-eden-light-navy text-white text-[10px] font-medium p-[4px_10px] rounded-md transition-colors border-none cursor-pointer">
              Générer les SEPA
            </button>
          </div>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-eden-bg border border-eden-border rounded-lg flex justify-between items-center">
              <div>
                <p className="font-medium text-eden-text-dark">Koffi Diallo</p>
                <p className="text-[11px] text-eden-text-light font-light mt-0.5">8h de shift validées · Chef de partie</p>
              </div>
              <span className="font-mono font-bold text-eden-teal">152.00 €</span>
            </div>
            <div className="p-3 bg-eden-bg border border-eden-border rounded-lg flex justify-between items-center">
              <div>
                <p className="font-medium text-eden-text-dark">Amine Mekki</p>
                <p className="text-[11px] text-eden-text-light font-light mt-0.5">16h de shift validées · Mixologue</p>
              </div>
              <span className="font-mono font-bold text-eden-teal">280.00 €</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};