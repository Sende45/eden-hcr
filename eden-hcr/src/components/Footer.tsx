import React from 'react';
import { Globe, Shield, Phone, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-eden-deep-navy text-white/80 font-sans border-t border-eden-tan/20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* COLONNE COMPAGNIE */}
          <div className="space-y-4">
            <div className="font-serif font-semibold text-xl text-white tracking-wider">
              ED<span className="text-eden-tan">È</span>N <span className="font-light text-white/70">Group</span>
            </div>
            <p className="text-xs text-white/50 leading-relaxed max-w-xs">
              Solutions de recrutement temporaire d'excellence pour l'hôtellerie, la restauration et les cafés. Flexibilité totale, profils qualifiés.
            </p>
          </div>

          {/* COLONNE SECTEURS */}
          <div>
            <h3 className="font-serif text-eden-tan font-medium tracking-wide text-sm mb-4">Secteurs HCR</h3>
            <ul className="space-y-2.5 text-xs text-white/60">
              <li><span className="hover:text-white transition-colors cursor-pointer">Cuisine & Pâtisserie</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Service en salle & Banquet</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Bar & Mixologie</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Réception & Gouvernance</span></li>
            </ul>
          </div>

          {/* COLONNE LIENS UTILES */}
          <div>
            <h3 className="font-serif text-eden-tan font-medium tracking-wide text-sm mb-4">Écosystème</h3>
            <ul className="space-y-2.5 text-xs text-white/60">
              <li><a href="https://eden-group.fr" className="hover:text-white transition-colors flex items-center gap-1.5"><Globe size={12}/> Site Principal</a></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Volet Propreté & Nettoyage</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Mentions légales & Conformité</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">CGU & RGPD</span></li>
            </ul>
          </div>

          {/* COLONNE CONTACT */}
          <div>
            <h3 className="font-serif text-eden-tan font-medium tracking-wide text-sm mb-4">Support & Agence</h3>
            <ul className="space-y-2.5 text-xs text-white/60">
              <li className="flex items-center gap-2 text-white/70"><Phone size={13} className="text-eden-tan"/> +33 (0)1 00 00 00 00</li>
              <li className="flex items-center gap-2 text-white/70"><Mail size={13} className="text-eden-tan"/> contact@eden-group.fr</li>
              <li className="flex items-center gap-2 text-white/50 pt-2"><Shield size={13} /> Régulation URSSAF & Inspection du travail France</li>
            </ul>
          </div>

        </div>

        {/* SÉPARATEUR ÉLÉGANT */}
        <div className="flex items-center gap-4 my-6 opacity-20">
          <div className="flex-1 h-[1px] bg-eden-border" />
          <span className="font-serif text-[10px] text-eden-tan tracking-[3px] uppercase">E D È N</span>
          <div className="flex-1 h-[1px] bg-eden-border" />
        </div>

        {/* BOTTOM RIGHTS */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/40 font-light mt-4 gap-2">
          <div>&copy; {new Date().getFullYear()} EDÈN Group. Tous droits réservés.</div>
          <div>Implantations : France · International</div>
        </div>
      </div>
    </footer>
  );
};