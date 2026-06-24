import React, { useEffect, useState } from 'react';
import { Search, Bell, SlidersHorizontal, Plus } from 'lucide-react';

interface TopbarProps {
  onNewMissionClick: () => void;
}

const API_URL = 'https://eden-hcr.onrender.com/api';

const getToken = () => localStorage.getItem('eden_token');

const authFetch = (url: string) =>
  fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });

export const Topbar: React.FC<TopbarProps> = ({ onNewMissionClick }) => {
  const [notifications, setNotifications] = useState(0);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);

  // Chargement des notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const res = await authFetch(`${API_URL}/messagerie/notifications`);
        if (!res.ok) return;

        const data = await res.json();
        setNotifications(data.count || 0);
      } catch (error) {
        console.error('Erreur récupération notifications :', error);
      }
    };

    fetchNotifications();
  }, []);

  // Recherche globale
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    if (value.trim().length < 2) {
      setResults([]);
      return;
    }

    try {
      const [missionsRes, candidatsRes] = await Promise.all([
        authFetch(`${API_URL}/mission?search=${encodeURIComponent(value)}`),
        authFetch(`${API_URL}/candidat?search=${encodeURIComponent(value)}`),
      ]);

      const missionsData = missionsRes.ok ? await missionsRes.json() : [];
      const candidatsData = candidatsRes.ok ? await candidatsRes.json() : [];

      setResults([
        ...(missionsData.data || missionsData || []),
        ...(candidatsData.data || candidatsData || []),
      ]);
    } catch (error) {
      console.error('Erreur recherche :', error);
    }
  };

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex items-center justify-between p-[18px_30px] border-b border-eden-border bg-eden-bg2 font-sans shrink-0">

      {/* TITRE */}
      <div>
        <h1 className="font-serif font-semibold text-2xl text-eden-navy tracking-wide">
          Tableau de bord
        </h1>
        <p className="text-xs text-eden-text-light font-light tracking-wide mt-[2px] capitalize">
          {currentDate}
        </p>
      </div>

      {/* ACTIONS */}
      <div className="flex items-center gap-2.5 relative">

        {/* RECHERCHE */}
        <div className="relative">
          <div className="flex items-center gap-2 bg-eden-bg border border-eden-border rounded-lg p-[8px_14px] text-eden-text-light w-[240px] cursor-text">
            <Search size={16} className="shrink-0" />
            <input
              value={search}
              onChange={handleSearch}
              type="text"
              placeholder="Rechercher…"
              className="bg-transparent border-none text-xs outline-hidden w-full text-eden-text-dark placeholder:text-eden-text-light/70"
            />
          </div>

          {/* RESULTATS */}
          {results.length > 0 && (
            <div className="absolute top-full mt-2 left-0 w-full bg-white border border-eden-border rounded-lg shadow-lg z-50 max-h-80 overflow-auto">
              {results.map((item, index) => (
                <div
                  key={index}
                  className="px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                >
                  {item.nom || item.titre || item.prenom || 'Résultat'}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* NOTIFICATIONS */}
        <button className="w-9 h-9 rounded-lg border border-eden-border bg-eden-bg flex items-center justify-center text-eden-text-light relative hover:border-eden-tan hover:text-eden-navy cursor-pointer transition-all">
          <Bell size={17} />
          {notifications > 0 && (
            <span className="absolute top-[4px] right-[4px] min-w-[16px] h-4 rounded-full bg-eden-orange text-white text-[10px] flex items-center justify-center px-1">
              {notifications}
            </span>
          )}
        </button>

        {/* FILTRES */}
        <button className="w-9 h-9 rounded-lg border border-eden-border bg-eden-bg flex items-center justify-center text-eden-text-light hover:border-eden-tan hover:text-eden-navy cursor-pointer transition-all">
          <SlidersHorizontal size={17} />
        </button>

        {/* NOUVELLE MISSION */}
        <button
          onClick={onNewMissionClick}
          className="bg-eden-navy hover:bg-eden-light-navy text-white text-xs font-medium tracking-wide p-[9px_18px] rounded-lg flex items-center gap-1.5 border-none transition-colors shadow-xs cursor-pointer"
        >
          <Plus size={15} />
          Nouvelle mission
        </button>

      </div>
    </div>
  );
};