import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Building2, Coffee, Loader2, AlertCircle } from 'lucide-react';
import { type HcrShift } from '../types/planning';

export const HcrCalendar: React.FC = () => {
  const [shifts, setShifts] = useState<HcrShift[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // Gestion dynamique de la semaine (Semaine courante par défaut)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Ajustement pour commencer le Lundi
    return new Date(today.setDate(diff));
  });

  // Fonction pour charger les données réelles planifiées depuis Atlas via ton API
  const fetchPlanningData = async () => {
    setIsLoading(true);
    setError('');
    const token = localStorage.getItem('eden_token');
    
    try {
      // Formatage des dates pour filtrer la semaine côté backend
      const startParam = currentWeekStart.toISOString().split('T')[0];
      const endToDate = new Date(currentWeekStart);
      endToDate.setDate(endToDate.getDate() + 6);
      const endParam = endToDate.toISOString().split('T')[0];

      const response = await fetch(`https://eden-hcr.onrender.com/api/admin/planning?start=${startParam}&end=${endParam}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();

      if (response.ok) {
        // Liaison directe avec le tableau de shifts renvoyé par la base de données
        setShifts(resData.data || resData);
      } else {
        setError(resData.message || "Impossible de charger le planning consolidé.");
      }
    } catch (err) {
      console.error("Erreur planning Atlas :", err);
      setError("Erreur de liaison avec le serveur d'affectation EDÈN.");
    } finally {
      setIsLoading(false);
    }
  };

  // Re-déclencher le fetch à chaque fois que l'utilisateur change de semaine
  useEffect(() => {
    fetchPlanningData();
  }, [currentWeekStart]);

  // Génération dynamique des jours de la semaine courante
  const generateWeekDays = () => {
    const days = [];
    const names = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(currentWeekStart);
      nextDay.setDate(nextDay.getDate() + i);
      
      // Format ISO YYYY-MM-DD constant pour le filtrage
      const isoString = nextDay.toISOString().split('T')[0];
      
      days.push({
        name: names[i],
        date: isoString,
        num: String(nextDay.getDate())
      });
    }
    return days;
  };

  const weekDays = generateWeekDays();

  // Navigation inter-semaines
  const changeWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      return newDate;
    });
  };

  // Libellé de la période sélectionnée
  const getWeekRangeLabel = () => {
    const endDate = new Date(currentWeekStart);
    endDate.setDate(endDate.getDate() + 6);
    
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return `${currentWeekStart.toLocaleDateString('fr-FR', options)} – ${endDate.toLocaleDateString('fr-FR', options)}`;
  };

  return (
    <div className="p-[24px_30px] font-sans space-y-6">
      
      {/* EN-TÊTE DU CALENDRIER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-eden-bg2 border border-eden-border rounded-xl p-5 shadow-xs">
        <div className="space-y-1">
          <h2 className="font-serif font-semibold text-xl text-eden-navy tracking-wide flex items-center gap-2">
            <CalendarIcon size={20} className="text-eden-tan" /> Planning de la brigade
          </h2>
          <p className="text-xs text-eden-text-light font-light">Suivi en direct des présences, des shifts continus et des coupures régis par la direction.</p>
        </div>

        {/* CONTROLES DE LA SEMAINE */}
        <div className="flex items-center gap-2 bg-eden-bg border border-eden-border rounded-lg p-1.5 self-start sm:self-center select-none">
          <button 
            type="button"
            onClick={() => changeWeek('prev')}
            className="p-1.5 text-eden-text-light hover:text-eden-navy rounded-md hover:bg-eden-bg2 cursor-pointer border-none bg-transparent transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-semibold text-eden-navy px-2 whitespace-nowrap font-mono">
            {getWeekRangeLabel()}
          </span>
          <button 
            type="button"
            onClick={() => changeWeek('next')}
            className="p-1.5 text-eden-text-light hover:text-eden-navy rounded-md hover:bg-eden-bg2 cursor-pointer border-none bg-transparent transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 max-w-7xl mx-auto">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

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

        {/* AFFICHAGE DES CELLULES OU DU CHARGEMENT */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[350px] w-full space-y-2 bg-white/40">
            <Loader2 className="animate-spin text-eden-tan" size={28} />
            <span className="text-[11px] text-eden-text-light font-light">Interrogation des shifts Atlas...</span>
          </div>
        ) : (
          <div className="grid grid-cols-7 divide-x divide-eden-border/40 min-h-[350px] bg-white">
            {weekDays.map(day => {
              // CORRECTION SÉCURITÉ TYPE : Assurer que la date est traitée comme string avant le fractionnement
              const dayShifts = shifts.filter(s => {
                const dateString = String(s.date);
                const shiftDateStr = dateString.includes('T') ? dateString.split('T')[0] : dateString;
                return shiftDateStr === day.date;
              });

              return (
                <div key={day.date} className="p-2.5 space-y-3 bg-transparent h-full min-w-0 hover:bg-eden-bg2/10 transition-colors">
                  {dayShifts.map(shift => (
                    <div 
                      key={shift.id || (shift as any)._id}
                      className="border border-eden-border-light rounded-xl p-3 bg-eden-bg/50 hover:border-eden-tan transition-all shadow-2xs space-y-2 cursor-pointer relative group"
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
                        
                        {/* SERVICE OPTIQUE PRINCIPAL */}
                        <div className="flex items-center gap-1 font-medium text-eden-navy pt-0.5">
                          <Clock size={11} className="text-eden-teal shrink-0" />
                          <span>{shift.startHour} → {shift.endHour}</span>
                        </div>

                        {/* SERVICE EN COUPURE LE CAS ÉCHÉANT */}
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
                    <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity min-h-[60px]">
                      <span className="text-[10px] text-eden-text-light/30 font-light">Aucun shift</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};