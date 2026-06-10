import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Building2, Coffee, Loader2, AlertCircle, X } from 'lucide-react';
import { type HcrShift } from '../types/planning';

// ─── Modal de création de Shift ──────────────────────────────────────────────
const CreateShiftModal = ({ isOpen, onClose, onSave, date }: any) => {
  const [formData, setFormData] = useState({ candidateName: '', role: '', startHour: '', endHour: '', establishmentName: '' });
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-eden-navy/20 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-serif font-bold text-lg text-eden-navy">Ajouter Shift ({date})</h3>
          <button onClick={onClose} className="text-eden-text-light hover:text-eden-navy"><X size={18} /></button>
        </div>
        <input type="text" placeholder="Nom du candidat" className="w-full border border-eden-border rounded-xl p-3 text-xs" onChange={e => setFormData({...formData, candidateName: e.target.value})} />
        <input type="text" placeholder="Rôle" className="w-full border border-eden-border rounded-xl p-3 text-xs" onChange={e => setFormData({...formData, role: e.target.value})} />
        <input type="text" placeholder="Établissement" className="w-full border border-eden-border rounded-xl p-3 text-xs" onChange={e => setFormData({...formData, establishmentName: e.target.value})} />
        <div className="flex gap-2">
          <input type="time" className="w-1/2 border border-eden-border rounded-xl p-3 text-xs" onChange={e => setFormData({...formData, startHour: e.target.value})} />
          <input type="time" className="w-1/2 border border-eden-border rounded-xl p-3 text-xs" onChange={e => setFormData({...formData, endHour: e.target.value})} />
        </div>
        <button onClick={() => onSave({ ...formData, date })} className="w-full bg-eden-navy text-white p-3 rounded-xl font-bold text-xs hover:bg-eden-light-navy">
          Enregistrer le Shift
        </button>
      </div>
    </div>
  );
};

export const HcrCalendar: React.FC = () => {
  const [shifts, setShifts] = useState<HcrShift[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  const fetchPlanningData = async () => {
    setIsLoading(true);
    setError('');
    const token = localStorage.getItem('eden_token');
    try {
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
      if (response.ok) setShifts(resData.data || resData);
      else setError(resData.message || "Impossible de charger le planning consolidé.");
    } catch (err) {
      console.error("Erreur planning Atlas :", err);
      setError("Erreur de liaison avec le serveur d'affectation EDÈN.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanningData();
  }, [currentWeekStart]);

  const handleSaveShift = async (data: any) => {
    const token = localStorage.getItem('eden_token');
    await fetch('https://eden-hcr.onrender.com/api/admin/planning', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    setIsModalOpen(false);
    fetchPlanningData();
  };

  const generateWeekDays = () => {
    const days = [];
    const names = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(currentWeekStart);
      nextDay.setDate(nextDay.getDate() + i);
      const isoString = nextDay.toISOString().split('T')[0];
      days.push({ name: names[i], date: isoString, num: String(nextDay.getDate()) });
    }
    return days;
  };

  const weekDays = generateWeekDays();

  const changeWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      return newDate;
    });
  };

  const getWeekRangeLabel = () => {
    const endDate = new Date(currentWeekStart);
    endDate.setDate(endDate.getDate() + 6);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return `${currentWeekStart.toLocaleDateString('fr-FR', options)} – ${endDate.toLocaleDateString('fr-FR', options)}`;
  };

  return (
    <div className="p-[24px_30px] font-sans space-y-6">
      <CreateShiftModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveShift} date={selectedDate} />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-eden-bg2 border border-eden-border rounded-xl p-5 shadow-xs">
        <div className="space-y-1">
          <h2 className="font-serif font-semibold text-xl text-eden-navy tracking-wide flex items-center gap-2">
            <CalendarIcon size={20} className="text-eden-tan" /> Planning de la brigade
          </h2>
          <p className="text-xs text-eden-text-light font-light">Suivi en direct des présences.</p>
        </div>

        <div className="flex items-center gap-2 bg-eden-bg border border-eden-border rounded-lg p-1.5 self-start sm:self-center select-none">
          <button type="button" onClick={() => changeWeek('prev')} className="p-1.5 text-eden-text-light hover:text-eden-navy rounded-md cursor-pointer border-none bg-transparent transition-all"><ChevronLeft size={16} /></button>
          <span className="text-xs font-semibold text-eden-navy px-2 font-mono">{getWeekRangeLabel()}</span>
          <button type="button" onClick={() => changeWeek('next')} className="p-1.5 text-eden-text-light hover:text-eden-navy rounded-md cursor-pointer border-none bg-transparent transition-all"><ChevronRight size={16} /></button>
        </div>
      </div>

      {error && <div className="p-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 max-w-7xl mx-auto"><AlertCircle size={16} /><span>{error}</span></div>}

      <div className="bg-eden-bg2 border border-eden-border rounded-xl shadow-xs overflow-hidden">
        <div className="grid grid-cols-7 border-b border-eden-border/60 bg-eden-bg/30 text-center select-none">
          {weekDays.map(day => (
            <div key={day.date} className="p-3 border-r last:border-r-0 border-eden-border/40">
              <div className="text-[11px] text-eden-text-light uppercase tracking-wider font-medium">{day.name}</div>
              <div className="font-serif font-bold text-base text-eden-navy">{day.num}</div>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[350px] w-full space-y-2 bg-white/40"><Loader2 className="animate-spin text-eden-tan" size={28} /></div>
        ) : (
          <div className="grid grid-cols-7 divide-x divide-eden-border/40 min-h-[350px] bg-white">
            {weekDays.map(day => {
              const dayShifts = shifts.filter(s => String(s.date).split('T')[0] === day.date);
              return (
                <div key={day.date} className="p-2.5 space-y-3 bg-transparent h-full min-h-[100px] hover:bg-eden-bg2/10 transition-colors cursor-pointer" onClick={() => { setSelectedDate(day.date); setIsModalOpen(true); }}>
                  {dayShifts.map(shift => (
                    <div key={shift.id || (shift as any)._id} className="border border-eden-border-light rounded-xl p-3 bg-eden-bg/50 shadow-2xs space-y-2 text-[11px]">
                      <h4 className="font-semibold text-eden-navy truncate">{shift.candidateName}</h4>
                      <p className="font-medium">{shift.role}</p>
                      <div className="flex items-center gap-1 text-eden-teal"><Clock size={11} /> {shift.startHour}-{shift.endHour}</div>
                    </div>
                  ))}
                  <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"><span className="text-[10px] text-eden-text-light/30">+ Ajouter</span></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};