import React, { useState, useMemo } from 'react';
import { Search, Briefcase, Calendar, Clock, Building2, UserCheck, ArrowRight } from 'lucide-react';

interface HcrMissionItem {
  id: string;
  title: string;
  establishmentName: string;
  sector: string;
  date: string;
  hours: string;
  hourlyRate: number;
  status: 'searching' | 'ongoing' | 'completed';
  assignedCandidate?: string;
}

const INITIAL_MISSIONS: HcrMissionItem[] = [
  {
    id: 'MS-2026-089',
    title: 'Serveur Chef de Rang',
    establishmentName: 'Le Grand Récamier',
    sector: 'Service',
    date: 'Ce soir, 19:00',
    hours: '7h du shift',
    hourlyRate: 16.50,
    status: 'searching'
  },
  {
    id: 'MS-2026-088',
    title: 'Chef de Partie Tournant',
    establishmentName: 'Brasserie Lutetia',
    sector: 'Cuisine',
    date: '06 Juin, 11:30',
    hours: '8h du shift',
    hourlyRate: 19.00,
    status: 'ongoing',
    assignedCandidate: 'Koffi Diallo'
  },
  {
    id: 'MS-2026-087',
    title: 'Mixologue / Barman Premium',
    establishmentName: 'Rooftop National',
    sector: 'Bar',
    date: '04 Juin, 18:00',
    hours: '8h du shift',
    hourlyRate: 17.50,
    status: 'completed',
    assignedCandidate: 'Amine Mekki'
  }
];

export const MissionManager: React.FC = () => {
  const [missions] = useState<HcrMissionItem[]>(INITIAL_MISSIONS);
  const [statusFilter, setStatusFilter] = useState<'all' | 'searching' | 'ongoing' | 'completed'>('all');
  const [search, setSearch] = useState<string>('');

  const filteredMissions = useMemo(() => {
    return missions.filter(mission => {
      const matchesStatus = statusFilter === 'all' || mission.status === statusFilter;
      const matchesSearch = mission.title.toLowerCase().includes(search.toLowerCase()) ||
                            mission.establishmentName.toLowerCase().includes(search.toLowerCase()) ||
                            mission.id.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [missions, statusFilter, search]);

  return (
    <div className="p-[24px_30px] font-sans space-y-6">
      
      {/* EN-TÊTE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-eden-bg2 border border-eden-border rounded-xl p-5 shadow-xs">
        <div className="space-y-1">
          <h2 className="font-serif font-semibold text-xl text-eden-navy tracking-wide flex items-center gap-2">
            <Briefcase size={20} className="text-eden-tan" /> Registre des Missions
          </h2>
          <p className="text-xs text-eden-text-light font-light">Consultez les demandes de renfort, les affectations en cours et l'historique des brigades.</p>
        </div>
        <div className="flex items-center gap-2 bg-eden-bg border border-eden-border rounded-lg p-[8px_14px] text-eden-text-light w-full sm:w-[260px]">
          <Search size={15} className="shrink-0" />
          <input 
            type="text" 
            placeholder="Rechercher une mission, un ID..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent border-none text-xs outline-hidden w-full text-eden-text-dark placeholder:text-eden-text-light/70"
          />
        </div>
      </div>

      {/* FILTRES BARRE */}
      <div className="flex items-center gap-2 select-none">
        {(['all', 'searching', 'ongoing', 'completed'] as const).map(filter => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={`p-[6px_14px] rounded-full border text-xs font-medium transition-all cursor-pointer border-eden-border
              ${statusFilter === filter 
                ? 'bg-eden-navy/10 border-eden-navy text-eden-navy font-semibold' 
                : 'bg-transparent text-eden-text-light hover:border-eden-tan hover:text-eden-text-dark'
              }`}
          >
            {filter === 'all' && 'Toutes les missions'}
            {filter === 'searching' && 'En recherche d\'extra'}
            {filter === 'ongoing' && 'En cours'}
            {filter === 'completed' && 'Clôturées'}
          </button>
        ))}
      </div>

      {/* CARTES DES MISSIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMissions.map(mission => (
          <div key={mission.id} className="bg-eden-bg2 border border-eden-border rounded-xl p-5 flex flex-col justify-between hover:border-eden-tan transition-all shadow-2xs">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-mono tracking-wide text-eden-text-light/60">{mission.id}</span>
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold p-[2px_8px] rounded-full
                  ${mission.status === 'searching' && 'bg-eden-orange/10 text-eden-orange'}
                  ${mission.status === 'ongoing' && 'bg-eden-teal/10 text-eden-teal'}
                  ${mission.status === 'completed' && 'bg-eden-text-light/10 text-eden-text-light'}
                `}>
                  <span className="w-1 h-1 rounded-full bg-current" />
                  {mission.status === 'searching' && 'À pourvoir'}
                  {mission.status === 'ongoing' && 'En cours'}
                  {mission.status === 'completed' && 'Clôturée'}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-eden-navy">{mission.title}</h3>
                <p className="text-xs text-eden-text-dark font-medium mt-0.5 flex items-center gap-1">
                  <Building2 size={12} className="text-eden-tan shrink-0" /> {mission.establishmentName}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-eden-text-light font-light pt-1">
                <span className="flex items-center gap-1"><Calendar size={12} className="text-eden-tan" /> {mission.date}</span>
                <span className="flex items-center gap-1"><Clock size={12} className="text-eden-tan" /> {mission.hours}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-eden-border/30 flex items-center justify-between text-xs">
              <div>
                {mission.assignedCandidate ? (
                  <p className="text-[11px] text-eden-text-dark font-medium flex items-center gap-1">
                    <UserCheck size={13} className="text-eden-teal" /> Attribuée à {mission.assignedCandidate}
                  </p>
                ) : (
                  <p className="text-[11px] text-eden-orange font-medium animate-pulse">Recherche d'extra actif...</p>
                )}
              </div>
              <button className="text-eden-tan hover:text-eden-navy font-semibold flex items-center gap-1 text-[11px] border-none bg-transparent cursor-pointer transition-colors">
                Gérer la brigade <ArrowRight size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};