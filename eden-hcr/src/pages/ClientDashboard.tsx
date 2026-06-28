import React, { useEffect, useState, useCallback } from 'react';
import {
  Users, Search, Filter, LogOut, Star,
  Phone, Mail, MapPin, Briefcase, ChevronDown,
  RefreshCw, AlertCircle, Building2, Award
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Candidat {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  poste?: string;
  ville?: string;
  competences?: string[];
  experience?: string;
  statut?: string;
  langues?: string[];
  noteAgence?: number;
  createdAt: string;
}

interface ClientDashboardProps {
  user: { id: string; email: string; role: string; societe?: string };
  onLogout: () => void;
}

const API_URL = import.meta.env.VITE_API_URL ?? 'https://eden-hcr-1.onrender.com';

// ─── Composant principal ──────────────────────────────────────────────────────

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ user, onLogout }) => {
  const [candidats, setCandidats]     = useState<Candidat[]>([]);
  const [filtered, setFiltered]       = useState<Candidat[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [search, setSearch]           = useState('');
  const [filterPoste, setFilterPoste] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // ── Fetch candidats ──────────────────────────────────────────────────────
  const fetchCandidats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('eden_token');
      const res = await fetch(`${API_URL}/api/clients/candidats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur serveur');
      setCandidats(data.data ?? []);
      setFiltered(data.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les candidats.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchCandidats(); }, [fetchCandidats]);

  // ── Filtres ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let result = [...candidats];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        `${c.prenom} ${c.nom}`.toLowerCase().includes(q) ||
        (c.poste ?? '').toLowerCase().includes(q) ||
        (c.ville ?? '').toLowerCase().includes(q) ||
        (c.competences ?? []).some(s => s.toLowerCase().includes(q))
      );
    }
    if (filterPoste) {
      result = result.filter(c => (c.poste ?? '') === filterPoste);
    }
    setFiltered(result);
  }, [search, filterPoste, candidats]);

  // ── Postes uniques pour le filtre ────────────────────────────────────────
  const postes = Array.from(new Set(candidats.map(c => c.poste).filter(Boolean))) as string[];

  return (
    <div className="min-h-screen bg-eden-bg font-sans">

      {/* ── Header ── */}
      <header className="bg-white border-b border-eden-border px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-eden-navy flex items-center justify-center">
            <span className="text-white font-serif font-bold text-sm">E</span>
          </div>
          <div>
            <p className="font-serif font-bold text-eden-navy text-sm tracking-wide">EDÈN HCR</p>
            <p className="text-[10px] text-eden-text-light">Espace client</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-eden-bg2 border border-eden-border rounded-lg px-3 py-1.5">
            <Building2 size={12} className="text-eden-tan" />
            <span className="text-xs text-eden-navy font-medium">{user.societe ?? user.email}</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-[11px] text-eden-text-light hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            <LogOut size={13} />
            Déconnexion
          </button>
        </div>
      </header>

      {/* ── Contenu ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Titre + stats */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-serif font-bold text-2xl text-eden-navy">
              Nos extras disponibles
            </h2>
            <p className="text-xs text-eden-text-light mt-1">
              Consultez les profils de notre brigade qualifiée
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-eden-tan/15 text-eden-navy text-xs font-semibold px-3 py-1.5 rounded-lg border border-eden-tan/30">
              {filtered.length} profil{filtered.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={fetchCandidats}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-[11px] text-eden-text-light hover:text-eden-navy border border-eden-border px-3 py-1.5 rounded-lg hover:bg-eden-bg2 transition-all"
            >
              <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Barre de recherche + filtres */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-3 text-eden-text-light/60" />
            <input
              type="text"
              placeholder="Rechercher par nom, poste, ville, compétence..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border border-eden-border rounded-xl py-2.5 pl-9 pr-4 text-xs outline-none focus:border-eden-tan transition-all"
            />
          </div>
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-3 text-eden-text-light/60" />
            <select
              value={filterPoste}
              onChange={e => setFilterPoste(e.target.value)}
              className="appearance-none bg-white border border-eden-border rounded-xl py-2.5 pl-9 pr-8 text-xs outline-none focus:border-eden-tan transition-all cursor-pointer min-w-[160px]"
            >
              <option value="">Tous les postes</option>
              {postes.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-3 top-3.5 text-eden-text-light/60 pointer-events-none" />
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs p-4 rounded-xl">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Skeleton loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-eden-border p-5 animate-pulse space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-eden-bg2 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 bg-eden-bg2 rounded w-3/4" />
                    <div className="h-2.5 bg-eden-bg2 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-2 bg-eden-bg2 rounded w-full" />
                <div className="h-2 bg-eden-bg2 rounded w-4/5" />
              </div>
            ))}
          </div>
        )}

        {/* Liste candidats */}
        {!isLoading && !error && (
          <>
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-eden-text-light">
                <Users size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Aucun profil trouvé</p>
                <p className="text-xs mt-1">Modifiez vos critères de recherche</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(candidat => (
                  <CandidatCard key={candidat._id} candidat={candidat} />
                ))}
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
};

// ─── Carte candidat ───────────────────────────────────────────────────────────

const CandidatCard: React.FC<{ candidat: Candidat }> = ({ candidat }) => {
  const initiales = `${(candidat.prenom?.[0] ?? '').toUpperCase()}${(candidat.nom?.[0] ?? '').toUpperCase()}`;

  const statutColor = {
    disponible: 'bg-green-50 text-green-700 border-green-200',
    en_mission: 'bg-orange-50 text-orange-700 border-orange-200',
    indisponible: 'bg-red-50 text-red-600 border-red-200',
  }[candidat.statut ?? ''] ?? 'bg-eden-bg2 text-eden-text-light border-eden-border';

  const statutLabel = {
    disponible: 'Disponible',
    en_mission: 'En mission',
    indisponible: 'Indisponible',
  }[candidat.statut ?? ''] ?? 'Non renseigné';

  return (
    <div className="bg-white rounded-2xl border border-eden-border hover:border-eden-tan/50 hover:shadow-md transition-all duration-200 p-5 space-y-4 group">

      {/* En-tête carte */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar initiales */}
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-eden-navy to-eden-navy/70 flex items-center justify-center shrink-0">
            <span className="text-white font-semibold text-sm">{initiales || '?'}</span>
          </div>
          <div>
            <p className="font-semibold text-eden-navy text-sm leading-tight">
              {candidat.prenom} {candidat.nom}
            </p>
            {candidat.poste && (
              <p className="text-[11px] text-eden-text-light mt-0.5">{candidat.poste}</p>
            )}
          </div>
        </div>
        {/* Badge statut */}
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${statutColor}`}>
          {statutLabel}
        </span>
      </div>

      {/* Infos */}
      <div className="space-y-1.5 text-[11px] text-eden-text-light">
        {candidat.ville && (
          <div className="flex items-center gap-2">
            <MapPin size={11} className="text-eden-tan shrink-0" />
            <span>{candidat.ville}</span>
          </div>
        )}
        {candidat.telephone && (
          <div className="flex items-center gap-2">
            <Phone size={11} className="text-eden-tan shrink-0" />
            <span>{candidat.telephone}</span>
          </div>
        )}
        {candidat.email && (
          <div className="flex items-center gap-2">
            <Mail size={11} className="text-eden-tan shrink-0" />
            <span className="truncate">{candidat.email}</span>
          </div>
        )}
        {candidat.experience && (
          <div className="flex items-center gap-2">
            <Briefcase size={11} className="text-eden-tan shrink-0" />
            <span>{candidat.experience}</span>
          </div>
        )}
      </div>

      {/* Compétences */}
      {candidat.competences && candidat.competences.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {candidat.competences.slice(0, 4).map((comp, i) => (
            <span
              key={i}
              className="text-[10px] bg-eden-bg2 border border-eden-border text-eden-navy px-2 py-0.5 rounded-full font-medium"
            >
              {comp}
            </span>
          ))}
          {candidat.competences.length > 4 && (
            <span className="text-[10px] text-eden-text-light px-1">
              +{candidat.competences.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Note agence */}
      {candidat.noteAgence !== undefined && candidat.noteAgence > 0 && (
        <div className="flex items-center gap-1.5 pt-1 border-t border-eden-border">
          <Award size={11} className="text-eden-tan" />
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={10}
                className={i < Math.round(candidat.noteAgence!) ? 'text-eden-tan fill-eden-tan' : 'text-eden-border'}
              />
            ))}
          </div>
          <span className="text-[10px] text-eden-text-light">{candidat.noteAgence}/5</span>
        </div>
      )}

    </div>
  );
};