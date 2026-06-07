import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Building2, Coffee } from 'lucide-react';
import { type HcrShift } from '../types/planning';

// Mock de données de planning pour la semaine du 1er au 7 Juin 2026
const INITIAL_SHIFTS: HcrShift[] = [
  {
    id: 's1',
    candidateName: 'Koffi Diallo',
    role: 'Chef de partie',
    establishmentName: 'Le Grand Récamier',
    sector: 'Cuisine',
    date: '2026-06-05',
    startHour: '11:30',
    endHour: '14:30',
    hasCut: true,
    secondStartHour: '18:30',
    secondEndHour: '22:30'
  },
  {
    id: 's2',
    candidateName: 'Sophie Bernard',
    role: 'Réceptionniste',
    establishmentName: 'Hôtel National',
    sector: 'Réception',
    date: '2026-06-05',
    startHour: '08:00',
    endHour: '16:00',
    hasCut: false
  },
  {
    id: 's3',
    candidateName: 'Amine Mekki',
    role: 'Mixologue',
    establishmentName: 'Rooftop National',
    sector: 'Bar',
    date: '2026-06-06',
    startHour: '18:00',
    endHour: '02:00',
    hasCut: false
  }
];

export const HcrCalendar: React.FC = () => {
  const [shifts] = useState<HcrShift[]>(INITIAL_SHIFTS);
  
  // Génération des jours de la semaine courante pour l'affichage des colonnes
  const weekDays = [
    { name: 'Lun', date: '2026-06-01', num: '1' },
    { name: 'Mar', date: '2026-06-02', num: '2' },
    { name: 'Mer', date: '2026-06-03', num: '3' },
    { name: 'Jeu', date: '2026-06-04', num: '4' },
    { name: 'Ven', date: '2026-06-05', num: '5' },
    { name: 'Sam', date: '2026-06-06', num: '6' },
    { name: 'Dim', date: '2026-06-07', num: '7' },
  ];

  return (
    <div className="p-[24px_30px] font-sans space-y-6">
      
      {/* EN-TÊTE DU CALENDRIER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-eden-bg2 border border-eden-border rounded-xl p-5 shadow-xs">
        <div className="space-y-1">
          <h2 className="font-serif font-semibold text-xl text-eden-navy tracking-wide flex items-center gap-2">
            <CalendarIcon size={20} className="text-eden-tan" /> Planning de la semaine
          </h2>
          <p className="text-xs text-eden-text-light font-light">Suivi chirurgical des présences, des shifts continus et des coupures.</p>
        </div>

        {/* CONTROLES DE LA SEMAINE */}
        <div className="flex items-center gap-2 bg-eden-bg border border-eden-border rounded-lg p-1.5 self-start sm:self-center">
          <button className="p-1.5 text-eden-text-light hover:text-eden-navy rounded-md hover:bg-eden-bg2 cursor-pointer border-none bg-transparent transition-all">
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-medium text-eden-navy px-2 whitespace-nowrap">
            1 Juin – 7 Juin 2026
          </span>
          <button className="p-1.5 text-eden-text-light hover:text-eden-navy rounded-md hover:bg-eden-bg2 cursor-pointer border-none bg-transparent transition-all">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* GRILLE DU PLANNING HEBDOMADAIRE */}
      <div className="bg-eden-bg2 border border-eden-border rounded-xl shadow-xs overflow-hidden">
        <div className="grid grid-cols-7 border-b border-eden-border/60 bg-eden-bg/30 text-center select-none">
          {weekDays.map(day => (
            <div key={day.date} className="p-3 border-r last:border-r-0 border-eden-border/40 space-y-0.5">
              <div className="text-[11px] text-eden-text-light uppercase tracking-wider font-medium">{day.name}</div>
              <div className="font-serif font-bold text-base text-eden-navy">{day.num}</div>
            </div>
          ))}
        </div>

        {/* AFFICHAGE DES CELLULES DE GRID DES SHIFTS */}
        <div className="grid grid-cols-7 divide-x divide-eden-border/40 min-h-[350px]">
          {weekDays.map(day => {
            // Filtrer les shifts pour ce jour précis
            const dayShifts = shifts.filter(s => s.date === day.date);

            return (
              <div key={day.date} className="p-2.5 space-y-3 bg-transparent h-full min-w-0">
                {dayShifts.map(shift => (
                  <div 
                    key={shift.id}
                    className="border border-eden-border-light rounded-xl p-3 bg-eden-bg/40 hover:border-eden-tan transition-all shadow-2xs space-y-2 cursor-pointer relative group"
                  >
                    <div>
                      <h4 className="text-[12px] font-semibold text-eden-navy truncate">{shift.candidateName}</h4>
                      <p className="text-[11px] text-eden-text-dark font-medium truncate">{shift.role}</p>
                    </div>

                    <div className="space-y-1 text-[10px] text-eden-text-light/90 font-light">
                      <div className="flex items-center gap-1 truncate">
                        <Building2 size={11} className="text-eden-tan shrink-0" />
                        <span className="truncate">{shift.establishmentName}</span>
                      </div>
                      
                      {/* SERVICE 1 / OU CONTINU */}
                      <div className="flex items-center gap-1 font-medium text-eden-navy pt-0.5">
                        <Clock size={11} className="text-eden-teal shrink-0" />
                        <span>{shift.startHour} → {shift.endHour}</span>
                      </div>

                      {/* INDICATION VISUELLE ET HORAIRE DU SERVICE EN COUPURE */}
                      {shift.hasCut && (
                        <div className="mt-1 pt-1.5 border-t border-eden-border/30 space-y-1">
                          <div className="inline-flex items-center gap-1 text-[9px] bg-eden-orange/10 text-eden-orange p-[1px_5px] rounded-sm font-semibold tracking-wide uppercase">
                            <Coffee size={9} /> Coupure
                          </div>
                          <div className="flex items-center gap-1 font-medium text-eden-navy">
                            <Clock size={11} className="text-eden-orange shrink-0" />
                            <span>{shift.secondStartHour} → {shift.secondEndHour}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {dayShifts.length === 0 && (
                  <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-eden-text-light/40 font-light">Aucun shift</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};