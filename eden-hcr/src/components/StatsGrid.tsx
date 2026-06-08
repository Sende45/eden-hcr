import React, { useState, useEffect } from 'react';
import { Briefcase, Users, FileCheck, Euro, Loader2, AlertCircle } from 'lucide-react';

interface DashboardStats {
  activeMissions: number;
  activeMissionsDelta: number;
  availableExtras: number;
  availabilityRate: number;
  generatedContracts: number;
  monthlyRevenue: number;
  revenueDelta: number;
}

export const StatsGrid: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  // RÉCUPÉRATION DES STATISTIQUES CONSOLIDÉES DEPUIS ATLAS
  const fetchDashboardStats = async () => {
    setIsLoading(true);
    setError(false);
    const token = localStorage.getItem('eden_token');

    try {
      const response = await fetch('https://eden-hcr.onrender.com/api/admin/dashboard/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();

      if (response.ok) {
        setStats(resData.data || resData);
      } else {
        console.error("Erreur backend stats:", resData.message);
        setError(true);
      }
    } catch (err) {
      console.error("Erreur réseau StatsGrid :", err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Formate la vue des grands nombres de facturation (ex: 12400 devient 12.4K)
  const formatRevenue = (value: number): string => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K€`;
    }
    return `${value}€`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px] p-[24px_30px_0px] font-sans">
      
      {/* CARD 1 : MISSIONS ACTIVES */}
      <div className="bg-white border border-eden-border rounded-[14px] p-[22px_24px] relative overflow-hidden shadow-xs group hover:border-eden-tan transition-all">
        <div className="absolute top-[-30px] right-[-30px] w-24 h-24 rounded-full border-[10px] border-eden-navy/4 pointer-events-none group-hover:scale-110 transition-transform" />
        <div className="flex items-center justify-between mb-[14px] select-none">
          <span className="text-[12.5px] text-eden-text-light font-medium uppercase tracking-wider">Missions Actives</span>
          <div className="w-[34px] h-[34px] rounded-lg bg-eden-navy/5 text-eden-navy flex items-center justify-center">
            {error ? <AlertCircle size={15} className="text-red-500" /> : <Briefcase size={16} />}
          </div>
        </div>
        <div className="font-serif font-bold text-[32px] text-eden-navy leading-none">
          {isLoading ? (
            <span className="inline-block w-16 h-8 bg-eden-bg2 animate-pulse rounded-md" />
          ) : (
            stats?.activeMissions ?? 0
          )}
        </div>
        <div className="text-[11.5px] text-eden-sage font-medium mt-[6px] select-none">
          {stats?.activeMissionsDelta !== undefined && stats.activeMissionsDelta >= 0 ? `+${stats.activeMissionsDelta}` : stats?.activeMissionsDelta || 0}{' '}
          <span className="text-eden-text-light/60 font-light">cette semaine</span>
        </div>
      </div>

      {/* CARD 2 : EXTRAS DISPONIBLES */}
      <div className="bg-white border border-eden-border rounded-[14px] p-[22px_24px] relative overflow-hidden shadow-xs group hover:border-eden-tan transition-all">
        <div className="absolute top-[-30px] right-[-30px] w-24 h-24 rounded-full border-[10px] border-eden-teal/4 pointer-events-none group-hover:scale-110 transition-transform" />
        <div className="flex items-center justify-between mb-[14px] select-none">
          <span className="text-[12.5px] text-eden-text-light font-medium uppercase tracking-wider">Extras Disponibles</span>
          <div className="w-[34px] h-[34px] rounded-lg bg-eden-teal/5 text-eden-teal flex items-center justify-center">
            {error ? <AlertCircle size={15} className="text-red-500" /> : <Users size={16} />}
          </div>
        </div>
        <div className="font-serif font-bold text-[32px] text-eden-navy leading-none">
          {isLoading ? (
            <span className="inline-block w-20 h-8 bg-eden-bg2 animate-pulse rounded-md" />
          ) : (
            stats?.availableExtras ?? 0
          )}
        </div>
        <div className="text-[11.5px] text-eden-sage font-medium mt-[6px] select-none">
          {isLoading ? '--' : `${stats?.availabilityRate ?? 0}%`}{' '}
          <span className="text-eden-text-light/60 font-light">de taux de dispo.</span>
        </div>
      </div>

      {/* CARD 3 : CONTRATS GÉNÉRÉS */}
      <div className="bg-white border border-eden-border rounded-[14px] p-[22px_24px] relative overflow-hidden shadow-xs group hover:border-eden-tan transition-all">
        <div className="absolute top-[-30px] right-[-30px] w-24 h-24 rounded-full border-[10px] border-eden-tan/8 pointer-events-none group-hover:scale-110 transition-transform" />
        <div className="flex items-center justify-between mb-[14px] select-none">
          <span className="text-[12.5px] text-eden-text-light font-medium uppercase tracking-wider">Contrats Générés</span>
          <div className="w-[34px] h-[34px] rounded-lg bg-eden-tan/10 text-eden-tan flex items-center justify-center">
            {error ? <AlertCircle size={15} className="text-red-500" /> : <FileCheck size={16} />}
          </div>
        </div>
        <div className="font-serif font-bold text-[32px] text-eden-navy leading-none">
          {isLoading ? (
            <span className="inline-block w-16 h-8 bg-eden-bg2 animate-pulse rounded-md" />
          ) : (
            stats?.generatedContracts ?? 0
          )}
        </div>
        <div className="text-[11.5px] text-eden-sage font-medium mt-[6px] select-none">
          100% <span className="text-eden-text-light/60 font-light">conformes URSSAF</span>
        </div>
      </div>

      {/* CARD 4 : CHIFFRE D'AFFAIRES MENSUEL */}
      <div className="bg-white border border-eden-border rounded-[14px] p-[22px_24px] relative overflow-hidden shadow-xs group hover:border-eden-tan transition-all">
        <div className="absolute top-[-30px] right-[-30px] w-24 h-24 rounded-full border-[10px] border-eden-orange/5 pointer-events-none group-hover:scale-110 transition-transform" />
        <div className="flex items-center justify-between mb-[14px] select-none">
          <span className="text-[12.5px] text-eden-text-light font-medium uppercase tracking-wider">Facturation CA</span>
          <div className="w-[34px] h-[34px] rounded-lg bg-eden-orange/5 text-eden-orange flex items-center justify-center">
            {/* CORRECTION : Remplacement de l'icône de devise Dollar par l'Euro pour l'écosystème France */}
            {error ? <AlertCircle size={15} className="text-red-500" /> : <Euro size={16} />}
          </div>
        </div>
        <div className="font-serif font-bold text-[32px] text-eden-navy leading-none">
          {isLoading ? (
            <span className="inline-block w-24 h-8 bg-eden-bg2 animate-pulse rounded-md" />
          ) : (
            formatRevenue(stats?.monthlyRevenue ?? 0)
          )}
        </div>
        <div className={`text-[11.5px] font-medium mt-[6px] select-none ${stats?.revenueDelta !== undefined && stats.revenueDelta >= 0 ? 'text-eden-sage' : 'text-red-500'}`}>
          {stats?.revenueDelta !== undefined && stats.revenueDelta >= 0 ? `+${stats.revenueDelta}` : stats?.revenueDelta ?? 0}%{' '}
          <span className="text-eden-text-light/60 font-light">vs mois dernier</span>
        </div>
      </div>

    </div>
  );
};