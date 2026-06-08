import React, { useState, useEffect, useMemo } from 'react';
import { Search, Briefcase, Calendar, Clock, Building2, UserCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

interface HcrMissionItem {
  _id: string;
  id?: string;
  title: string;
  establishmentName: string;
  sector: string;
  date: string;
  hours: string;
  hourlyRate: number;
  status: 'searching' | 'ongoing' | 'completed';
  assignedCandidate?: string;
}

export const MissionManager: React.FC = () => {
  const [missions, setMissions] = useState<HcrMissionItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'searching' | 'ongoing' | 'completed'>('all');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // 1. RÉCUPÉRATION DES MISSIONS DEPUIS MONGO DB ATLAS
  const fetchMissions = async () => {
    setIsLoading(true);
    setError('');
    const token = localStorage.getItem('eden_token');

    try {
      const response = await fetch('https://eden-hcr.onrender.com/api/admin/missions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();

      if (response.ok) {
        console.log("Réponse missions :", resData);

        const missionsData = Array.isArray(resData?.data)
          ? resData.data
          : Array.isArray(resData)
          ? resData
          : [];

        setMissions(missionsData);

        if (!Array.isArray(missionsData)) {
          console.error("Les missions ne sont pas un tableau :", resData);
        }
      } else {
        setError(resData.message || "Erreur lors du chargement du registre des missions.");
      }
    } catch (err) {
      console.error("Erreur MissionManager fetch :", err);
      setError("Connexion interrompue avec le serveur de dispatching EDÈN HCR.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  // Filtrage combiné (Statut + Recherche textuelle sur ID, titre et établissement)
  const filteredMissions = useMemo(() => {
    return missions.filter(mission => {
      const missionId = mission.id || mission._id || '';
      const matchesStatus = statusFilter === 'all' || mission.status === statusFilter;
      const matchesSearch = 
        mission.title.toLowerCase().includes(search.toLowerCase()) ||
        mission.establishmentName.toLowerCase().includes(search.toLowerCase()) ||
        missionId.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [missions, statusFilter, search]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px] space-y-3 font-sans">
        <Loader2 className="animate-spin text-eden-tan" size={32} />
        <p className="text-xs text-eden-text-light font-light tracking-wide">Synchronisation avec le registre central des brigades...</p>
      </div>
    );
  }

  return (
    <div className="p-[24px_30px] font-sans space-y-6">
      
      {/* EN-TÊTE DE GESTION */}
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
            className="bg-transparent border-none text-xs outline-none w-full text-eden-text-dark placeholder:text-eden-text-light/70"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* FILTRES BARRE */}
      <div className="flex items-center gap-2 select-none overflow-x-auto pb-1 scrollbar-none">
        {([
          { key: 'all', label: 'Toutes les missions' },
          { key: 'searching', label: "En recherche d'extra" },
          { key: 'ongoing', label: 'En cours' },
          { key: 'completed', label: 'Clôturées' }
        ] as const).map(filter => (
          <button
            key={filter.key}
            type="button"
            onClick={() => setStatusFilter(filter.key)}
            className={`p-[6px_14px] rounded-full border text-xs font-medium transition-all cursor-pointer whitespace-nowrap
              ${statusFilter === filter.key 
                ? 'bg-eden-navy/10 border-eden-navy text-eden-navy font-semibold' 
                : 'bg-transparent text-eden-text-light border-eden-border hover:border-eden-tan hover:text-eden-text-dark'
              }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* CARTES DES MISSIONS ATLAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMissions.map(mission => {
          const missionId = mission.id || mission._id;
          return (
            <div key={missionId} className="bg-eden-bg2 border border-eden-border rounded-xl p-5 flex flex-col justify-between hover:border-eden-tan transition-all shadow-2xs bg-white">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono tracking-wide text-eden-text-light/60">{missionId}</span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold p-[2px_8px] rounded-full select-none
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
                  <span className="text-eden-navy font-medium ml-auto">{mission.hourlyRate.toFixed(2)} €/h</span>
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
                <button 
                  type="button" 
                  className="text-eden-tan hover:text-eden-navy font-semibold flex items-center gap-1 text-[11px] border-none bg-transparent cursor-pointer transition-colors"
                >
                  Gérer la brigade <ArrowRight size={12} />
                </button>
              </div>
            </div>
          );
        })}

        {filteredMissions.length === 0 && (
          <div className="col-span-1 md:col-span-2 p-12 text-center text-eden-text-light font-light text-xs bg-eden-bg2/40 border border-dashed border-eden-border rounded-xl">
            Aucune mission ne correspond à vos critères actuels.
          </div>
        )}
      </div>
    </div>
  );
};