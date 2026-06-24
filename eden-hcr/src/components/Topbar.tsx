import React, { useEffect, useState, useRef } from 'react';
import {
  Search, Bell, SlidersHorizontal, Plus, Eye, X,
  CheckCheck, Briefcase, User, ChevronRight,
  Calendar, FileText, Euro, MessageSquare, BarChart2
} from 'lucide-react';
import { type DashboardView } from '../types/navigation';

interface TopbarProps {
  onNewMissionClick: () => void;
  onViewMissionsClick?: () => void;
  onNavigate?: (view: DashboardView) => void;
  title?: string;
}

interface Notification {
  _id: string;
  type: string;
  message: string;
  lu: boolean;
  createdAt: string;
  expediteur?: { nom: string; prenom: string };
}

interface FilterState {
  statut: string;
  secteur: string;
  dateDebut: string;
}

interface SearchResult {
  _id: string;
  nom?: string;
  prenom?: string;
  titre?: string;
  statut?: string;
  _type: 'mission' | 'candidat' | 'contrat' | 'paiement' | 'planning' | 'message';
}

const API_URL = 'https://eden-hcr.onrender.com/api';

const getToken = () => localStorage.getItem('eden_token');
const getUser  = () => {
  try {
    const raw = localStorage.getItem('eden_user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const authFetch = (url: string, options: RequestInit = {}) =>
  fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });

// Map type résultat → vue dashboard + icône
const RESULT_META: Record<SearchResult['_type'], {
  view: DashboardView;
  icon: React.ReactNode;
  label: string;
}> = {
  mission:   { view: 'missions',   icon: <Briefcase size={13} />,    label: 'Mission' },
  candidat:  { view: 'candidates', icon: <User size={13} />,         label: 'Candidat' },
  contrat:   { view: 'contracts',  icon: <FileText size={13} />,     label: 'Contrat' },
  paiement:  { view: 'payments',   icon: <Euro size={13} />,         label: 'Paiement' },
  planning:  { view: 'planning',   icon: <Calendar size={13} />,     label: 'Planning' },
  message:   { view: 'messages',   icon: <MessageSquare size={13} />,label: 'Message' },
};

// Sections statiques du sidebar — recherche locale
const SIDEBAR_SECTIONS = [
  { keywords: ['mission', 'missions', 'poste', 'extra'],         view: 'missions'      as DashboardView, icon: <Briefcase size={13} />,     label: 'Missions' },
  { keywords: ['candidat', 'candidats', 'profil', 'prestataire'],view: 'candidates'    as DashboardView, icon: <User size={13} />,           label: 'Candidats' },
  { keywords: ['planning', 'calendrier', 'agenda', 'semaine'],   view: 'planning'      as DashboardView, icon: <Calendar size={13} />,       label: 'Planning' },
  { keywords: ['contrat', 'contrats', 'accord', 'document'],     view: 'contracts'     as DashboardView, icon: <FileText size={13} />,       label: 'Contrats' },
  { keywords: ['rapport', 'rapports', 'stats', 'statistiques'],  view: 'reports'       as DashboardView, icon: <BarChart2 size={13} />,      label: 'Rapports' },
  { keywords: ['paiement', 'paiements', 'salaire', 'virement'],  view: 'payments'      as DashboardView, icon: <Euro size={13} />,           label: 'Paiements' },
  { keywords: ['message', 'messagerie', 'chat', 'discussion'],   view: 'messages'      as DashboardView, icon: <MessageSquare size={13} />,  label: 'Messagerie' },
  { keywords: ['tableau', 'bord', 'dashboard', 'accueil'],       view: 'dashboard'     as DashboardView, icon: <BarChart2 size={13} />,      label: 'Tableau de bord' },
];

export const Topbar: React.FC<TopbarProps> = ({
  onNewMissionClick,
  onViewMissionsClick,
  onNavigate,
  title = 'Tableau de bord',
}) => {
  const user        = getUser();
  const role        = user?.role || 'extra';
  const isSuperAdmin = role === 'superadmin' || role === 'admin';

  const [search, setSearch]               = useState('');
  const [results, setResults]             = useState<SearchResult[]>([]);
  const [navSuggestions, setNavSuggestions] = useState<typeof SIDEBAR_SECTIONS>([]);
  const [searching, setSearching]         = useState(false);
  const [showResults, setShowResults]     = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs]       = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const [showFilters, setShowFilters]     = useState(false);
  const [filters, setFilters]             = useState<FilterState>({ statut: '', secteur: '', dateDebut: '' });

  const searchRef   = useRef<HTMLDivElement>(null);
  const notifRef    = useRef<HTMLDivElement>(null);
  const filterRef   = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const unreadCount = notifications.filter(n => !n.lu).length;

  // Fermer dropdowns au clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilters(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Notifications — polling 30s
  const fetchNotifications = async () => {
    if (!getToken()) return;
    setLoadingNotifs(true);
    try {
      const res = await authFetch(`${API_URL}/messagerie/notifications`);
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || data.data || []);
    } catch (e) {
      console.error('Notifications:', e);
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    try {
      await authFetch(`${API_URL}/messagerie/notifications/mark-read`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
    } catch (e) { console.error(e); }
  };

  // Recherche — sidebar local + API
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);

    if (value.trim().length < 2) {
      setResults([]);
      setNavSuggestions([]);
      setShowResults(false);
      return;
    }

    // Suggestions sidebar immédiates (local, sans API)
    const q = value.toLowerCase();
    const matched = SIDEBAR_SECTIONS.filter(s =>
      s.keywords.some(k => k.includes(q) || q.includes(k))
    );
    setNavSuggestions(matched);

    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const routes = isSuperAdmin
          ? [
              authFetch(`${API_URL}/mission?search=${encodeURIComponent(value)}`).then(r => r.ok ? r.json() : []).then(d => (d.data || d || []).map((i: any) => ({ ...i, _type: 'mission' }))),
              authFetch(`${API_URL}/candidat?search=${encodeURIComponent(value)}`).then(r => r.ok ? r.json() : []).then(d => (d.data || d || []).map((i: any) => ({ ...i, _type: 'candidat' }))),
              authFetch(`${API_URL}/contrats?search=${encodeURIComponent(value)}`).then(r => r.ok ? r.json() : []).then(d => (d.data || d || []).map((i: any) => ({ ...i, _type: 'contrat' }))),
            ]
          : [
              authFetch(`${API_URL}/mission/ouvertes?search=${encodeURIComponent(value)}`).then(r => r.ok ? r.json() : []).then(d => (d.data || d || []).map((i: any) => ({ ...i, _type: 'mission' }))),
            ];

        const datasets = await Promise.all(routes);
        const merged   = datasets.flat();
        setResults(merged);
        setShowResults(true);
      } catch (e) {
        console.error('Recherche:', e);
      } finally {
        setSearching(false);
      }
    }, 350);

    setShowResults(true);
  };

  const handleResultClick = (result: SearchResult) => {
    const meta = RESULT_META[result._type];
    if (meta && onNavigate) onNavigate(meta.view);
    setSearch('');
    setResults([]);
    setNavSuggestions([]);
    setShowResults(false);
  };

  const handleNavClick = (view: DashboardView) => {
    if (onNavigate) onNavigate(view);
    setSearch('');
    setResults([]);
    setNavSuggestions([]);
    setShowResults(false);
  };

  const clearSearch = () => {
    setSearch('');
    setResults([]);
    setNavSuggestions([]);
    setShowResults(false);
  };

  // Date + semaine
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const getWeekNumber = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  };

  const hasDropdown = showResults && (navSuggestions.length > 0 || results.length > 0 || (search.length >= 2 && !searching));

  return (
    <div className="flex items-center justify-between p-[18px_30px] border-b border-eden-border bg-eden-bg2 font-sans shrink-0 relative z-40">

      {/* TITRE */}
      <div>
        <h1 className="font-serif font-semibold text-2xl text-eden-navy tracking-wide">{title}</h1>
        <p className="text-xs text-eden-text-light font-light tracking-wide mt-[2px] capitalize">
          {currentDate} · Semaine {getWeekNumber()}
        </p>
      </div>

      <div className="flex items-center gap-2.5">

        {/* ── RECHERCHE ── */}
        <div className="relative" ref={searchRef}>
          <div className={`flex items-center gap-2 bg-eden-bg border rounded-lg p-[8px_14px] text-eden-text-light transition-all duration-200 ${
            search ? 'w-[300px] border-eden-tan' : 'w-[220px] border-eden-border'
          }`}>
            {searching
              ? <div className="w-4 h-4 border-2 border-eden-tan border-t-transparent rounded-full animate-spin shrink-0" />
              : <Search size={16} className="shrink-0" />
            }
            <input
              value={search}
              onChange={handleSearch}
              type="text"
              placeholder={isSuperAdmin ? 'Missions, candidats, contrats…' : 'Rechercher une mission…'}
              className="bg-transparent border-none text-xs outline-none w-full text-eden-text-dark placeholder:text-eden-text-light/60"
            />
            {search && (
              <button onClick={clearSearch}>
                <X size={13} className="text-eden-text-light hover:text-eden-navy" />
              </button>
            )}
          </div>

          {/* Dropdown */}
          {hasDropdown && (
            <div className="absolute top-full mt-2 left-0 w-[360px] bg-white border border-eden-border rounded-xl shadow-xl z-50 overflow-hidden">

              {/* Suggestions navigation sidebar */}
              {navSuggestions.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-eden-bg2 border-b border-eden-border">
                    <span className="text-[10px] text-eden-text-light uppercase tracking-widest font-medium">Navigation</span>
                  </div>
                  {navSuggestions.map((s, i) => (
                    <div
                      key={i}
                      onClick={() => handleNavClick(s.view)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-eden-bg cursor-pointer border-b border-eden-border/40 last:border-b-0 transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-eden-navy/5 border border-eden-border flex items-center justify-center text-eden-tan shrink-0">
                        {s.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-eden-navy">Aller vers · {s.label}</p>
                      </div>
                      <ChevronRight size={13} className="text-eden-border group-hover:text-eden-tan transition-colors" />
                    </div>
                  ))}
                </>
              )}

              {/* Résultats API */}
              {results.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-eden-bg2 border-b border-eden-border">
                    <span className="text-[10px] text-eden-text-light uppercase tracking-widest font-medium">
                      {results.length} résultat{results.length > 1 ? 's' : ''} en base
                    </span>
                  </div>
                  <div className="max-h-56 overflow-auto">
                    {results.map((item, i) => {
                      const meta = RESULT_META[item._type];
                      return (
                        <div
                          key={i}
                          onClick={() => handleResultClick(item)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-eden-bg cursor-pointer border-b border-eden-border/50 last:border-b-0 transition-colors group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-eden-bg2 border border-eden-border flex items-center justify-center text-eden-text-light shrink-0">
                            {meta?.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-eden-navy truncate">
                              {item.titre || `${item.prenom || ''} ${item.nom || ''}`.trim() || 'Résultat'}
                            </p>
                            <p className="text-[10px] text-eden-text-light mt-0.5">
                              {meta?.label}{item.statut ? ` · ${item.statut}` : ''}
                            </p>
                          </div>
                          <ChevronRight size={13} className="text-eden-border group-hover:text-eden-tan transition-colors" />
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Aucun résultat */}
              {results.length === 0 && navSuggestions.length === 0 && search.length >= 2 && !searching && (
                <div className="px-4 py-6 text-center">
                  <p className="text-xs text-eden-text-light">Aucun résultat pour « {search} »</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── NOTIFICATIONS ── */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifs(v => !v); if (!showNotifs) fetchNotifications(); }}
            className="w-9 h-9 rounded-lg border border-eden-border bg-eden-bg flex items-center justify-center text-eden-text-light relative hover:border-eden-tan hover:text-eden-navy cursor-pointer transition-all"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute top-[4px] right-[4px] min-w-[16px] h-4 rounded-full bg-eden-orange text-white text-[10px] flex items-center justify-center px-1 animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute top-full right-0 mt-2 w-[340px] bg-white border border-eden-border rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-eden-border bg-eden-bg2">
                <span className="text-xs font-semibold text-eden-navy">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="flex items-center gap-1 text-[10px] text-eden-tan hover:text-eden-navy transition-colors">
                    <CheckCheck size={12} /> Tout marquer lu
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-auto">
                {loadingNotifs ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 border-2 border-eden-tan border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell size={24} className="text-eden-border mx-auto mb-2" />
                    <p className="text-xs text-eden-text-light">Aucune notification</p>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif._id}
                      onClick={() => { onNavigate?.('messages'); setShowNotifs(false); }}
                      className={`px-4 py-3 border-b border-eden-border/50 last:border-b-0 cursor-pointer hover:bg-eden-bg transition-colors ${!notif.lu ? 'bg-eden-bg2' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        {!notif.lu && <div className="w-1.5 h-1.5 rounded-full bg-eden-orange mt-1.5 shrink-0" />}
                        <div className={!notif.lu ? '' : 'ml-3.5'}>
                          <p className="text-xs text-eden-navy leading-relaxed">{notif.message}</p>
                          {notif.expediteur && (
                            <p className="text-[10px] text-eden-text-light mt-0.5">
                              De : {notif.expediteur.prenom} {notif.expediteur.nom}
                            </p>
                          )}
                          <p className="text-[10px] text-eden-text-light mt-0.5">
                            {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── FILTRES ── */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`w-9 h-9 rounded-lg border bg-eden-bg flex items-center justify-center cursor-pointer transition-all relative ${
              showFilters || Object.values(filters).some(Boolean)
                ? 'border-eden-tan text-eden-navy'
                : 'border-eden-border text-eden-text-light hover:border-eden-tan hover:text-eden-navy'
            }`}
          >
            <SlidersHorizontal size={17} />
            {Object.values(filters).some(Boolean) && (
              <span className="absolute top-[4px] right-[4px] w-2 h-2 rounded-full bg-eden-tan" />
            )}
          </button>

          {showFilters && (
            <div className="absolute top-full right-0 mt-2 w-[280px] bg-white border border-eden-border rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-eden-border bg-eden-bg2">
                <span className="text-xs font-semibold text-eden-navy">Filtres</span>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-[10px] text-eden-text-light uppercase tracking-widest font-medium block mb-1.5">Statut</label>
                  <select
                    value={filters.statut}
                    onChange={e => setFilters(f => ({ ...f, statut: e.target.value }))}
                    className="w-full text-xs border border-eden-border rounded-lg p-2 bg-eden-bg text-eden-navy outline-none focus:border-eden-tan"
                  >
                    <option value="">Tous</option>
                    <option value="ouverte">Ouverte</option>
                    <option value="en_cours">En cours</option>
                    <option value="terminee">Terminée</option>
                    <option value="annulee">Annulée</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-eden-text-light uppercase tracking-widest font-medium block mb-1.5">Secteur</label>
                  <select
                    value={filters.secteur}
                    onChange={e => setFilters(f => ({ ...f, secteur: e.target.value }))}
                    className="w-full text-xs border border-eden-border rounded-lg p-2 bg-eden-bg text-eden-navy outline-none focus:border-eden-tan"
                  >
                    <option value="">Tous</option>
                    <option value="hcr">Hôtellerie</option>
                    <option value="cafe">Café</option>
                    <option value="restaurant">Restaurant</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-eden-text-light uppercase tracking-widest font-medium block mb-1.5">À partir du</label>
                  <input
                    type="date"
                    value={filters.dateDebut}
                    onChange={e => setFilters(f => ({ ...f, dateDebut: e.target.value }))}
                    className="w-full text-xs border border-eden-border rounded-lg p-2 bg-eden-bg text-eden-navy outline-none focus:border-eden-tan"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setFilters({ statut: '', secteur: '', dateDebut: '' })}
                    className="flex-1 text-xs border border-eden-border rounded-lg py-2 text-eden-text-light hover:text-eden-navy hover:border-eden-tan transition-colors"
                  >
                    Réinitialiser
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-1 text-xs bg-eden-navy text-white rounded-lg py-2 hover:bg-eden-light-navy transition-colors"
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── BOUTON PRINCIPAL ── */}
        {isSuperAdmin ? (
          <button
            onClick={onNewMissionClick}
            className="bg-eden-navy hover:bg-eden-light-navy text-white text-xs font-medium tracking-wide p-[9px_18px] rounded-lg flex items-center gap-1.5 border-none transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={15} />
            Nouvelle mission
          </button>
        ) : (
          <button
            onClick={onViewMissionsClick}
            className="bg-eden-navy hover:bg-eden-light-navy text-white text-xs font-medium tracking-wide p-[9px_18px] rounded-lg flex items-center gap-1.5 border-none transition-colors shadow-sm cursor-pointer"
          >
            <Eye size={15} />
            Voir missions
          </button>
        )}

      </div>
    </div>
  );
};