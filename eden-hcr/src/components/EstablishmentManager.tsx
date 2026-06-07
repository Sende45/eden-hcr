import React from 'react';
import { Building2 } from 'lucide-react';

export const EstablishmentManager: React.FC = () => {
  return (
    <div className="p-[24px_30px] font-sans">
      <div className="bg-eden-bg2 border border-eden-border rounded-xl p-5 shadow-xs">
        <h2 className="font-serif font-semibold text-xl text-eden-navy flex items-center gap-2">
          <Building2 size={20} className="text-eden-tan" /> Établissements
        </h2>
        <p className="text-xs text-eden-text-light font-light mt-1">
          Gestion des établissements partenaires — à venir.
        </p>
      </div>
    </div>
  );
};

export default EstablishmentManager;