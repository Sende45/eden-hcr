import React, { useEffect, useState, useCallback } from 'react';
import { UserCheck, FilePlus, Building2, ChevronRight, Star, RefreshCw, AlertCircle } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Mission {
  _id: string;
  titre?: string;
  poste?: string;
  typePoste?: string;
  categorie?: string;
  etablissement?: {
    _id?: string;
    nom?: string;
    nomEtablissement?: string;
    ville?: string;
    arrondissement?: string;
  } | string;
  nomEtablissement?: string;
  dateDebut?: string;
  dateFin?: string;
  dateDebutMission?: string;
  dateFinMission?: string;
  urgence?: boolean;
  statut?: string;
  secteur?: string;
}

interface Candidat {
  _id: string;
  prenom?: string;
  nom?: string;
  firstName?: string;
  lastName?: string;
  metier?: string;
  poste?: string;
  experience?: number | string;
  disponibilite?: string;
  statut?: string;
  langues?: string[];
  initiales?: string;
}

interface FluxItem {
  _id: string;
  type: 'contrat' | 'mission' | 'messagerie' | 'candidat';
  label: React.ReactNode;
  time: string;
  icon: 'user-check' | 'file-plus' | 'building';
}

interface Stats {
  tauxRemplissage: number;
  postes: { pourvus: number; total: number };
  satisfaction: number;
  nbAvis: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const API = 'https://eden-hcr.onrender.com/api';

function getToken(): string | null {
  return localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('eden_token');
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

function initiales(candidat: Candidat): string {
  if (candidat.initiales) return candidat.initiales;
  const p = candidat.prenom || candidat.firstName || '';
  const n = candidat.nom || candidat.lastName || '';
  return `${p[0] || ''}${n[0] || ''}`.toUpperCase() || '??';
}

function nomCandidat(c: Candidat): string {
  return `${c.prenom || c.firstName || ''} ${c.nom || c.lastName || ''}`.trim() || 'Inconnu';
}

function nomEtablissement(m: Mission): string {
  if (typeof m.etablissement === 'object' && m.etablissement) {
    return m.etablissement.nom || m.etablissement.nomEtablissement || m.nomEtablissement || '—';
  }
  return m.nomEtablissement || (typeof m.etablissement === 'string' ? m.etablissement : '—');
}

function villeEtab(m: Mission): string {
  if (typeof m.etablissement === 'object' && m.etablissement) {
    const v = m.etablissement.ville || '';
    const a = m.etablissement.arrondissement || '';
    return [v, a].filter(Boolean).join(' ');
  }
  return '';
}

function titreMission(m: Mission): string {
  return m.titre || m.poste || m.typePoste || 'Poste non défini';
}

function categorieMission(m: Mission): string {
  return m.categorie || m.secteur || m.typePoste || 'Général';
}

function categorieColor(cat: string): { bg: string; text: string } {
  const c = cat.toLowerCase();
  if (c.includes('salle') || c.includes('service')) return { bg: 'bg-eden-navy/5', text: 'text-eden-navy' };
  if (c.includes('cuisine') || c.includes('cuisinier')) return { bg: 'bg-eden-teal/5', text: 'text-eden-teal' };
  if (c.includes('bar') || c.includes('mixo')) return { bg: 'bg-eden-tan/15', text: 'text-eden-tan' };
  if (c.includes('nettoyage') || c.includes('propret')) return { bg: 'bg-eden-orange/10', text: 'text-eden-orange' };
  return { bg: 'bg-eden-navy/5', text: 'text-eden-navy' };
}

function formatDateMission(m: Mission): { label: string; urgent: boolean } {
  if (m.urgence) return { label: 'Ce soir (Coup de feu)', urgent: true };
  const d = m.dateDebut || m.dateDebutMission;
  const f = m.dateFin || m.dateFinMission;
  if (!d) return { label: '—', urgent: false };
  const start = new Date(d);
  const end = f ? new Date(f) : null;
  const fmt = (dt: Date) =>
    dt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  const label = end ? `${fmt(start)} au ${fmt(end)}` : fmt(start);
  return { label, urgent: false };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "À l'instant";
  if (min < 60) return `Il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Il y a ${h}h`;
  return `Il y a ${Math.floor(h / 24)}j`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-eden-border rounded-md ${className}`} />
);

// ─── Composants de section ────────────────────────────────────────────────────

const MissionsSection: React.FC<{ missions: Mission[]; loading: boolean; error: string | null }> = ({
  missions, loading, error,
}) => (
  <div className="bg-eden-bg2 border border-eden-border rounded-[14px] overflow-hidden shadow-xs">
    <div className="p-[18px_22px] border-b border-eden-border/60 flex items-center justify-between">
      <h2 className="font-serif font-semibold text-[17px] text-eden-navy tracking-wide">
        Missions urgentes à pourvoir
      </h2>
      <button className="text-[12px] text-eden-tan hover:text-eden-navy font-medium flex items-center gap-1 cursor-pointer transition-colors">
        Voir tout <ChevronRight size={14} />
      </button>
    </div>

    {loading && (
      <div className="divide-y divide-eden-border/40">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-[15px_22px] flex gap-4 items-center">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-48" />
              <Skeleton className="h-3 w-36" />
            </div>
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="h-5 w-28 rounded-full" />
          </div>
        ))}
      </div>
    )}

    {error && (
      <div className="p-[18px_22px] flex items-center gap-2 text-[12.5px] text-eden-orange">
        <AlertCircle size={14} /> {error}
      </div>
    )}

    {!loading && !error && missions.length === 0 && (
      <div className="p-[18px_22px] text-[12.5px] text-eden-text-light/60 text-center">
        Aucune mission urgente en ce moment
      </div>
    )}

    {!loading && !error && (
      <div className="divide-y divide-eden-border/40">
        {missions.slice(0, 5).map(m => {
          const { label: dateLabel, urgent } = formatDateMission(m);
          const cat = categorieMission(m);
          const { bg, text } = categorieColor(cat);
          const ville = villeEtab(m);
          return (
            <div
              key={m._id}
              className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr] items-center p-[15px_22px] hover:bg-eden-bg/30 transition-colors cursor-pointer gap-2"
            >
              <div>
                <div className="text-[13.5px] font-medium text-eden-navy">{titreMission(m)}</div>
                <div className="text-[11.5px] text-eden-text-light/80 flex items-center gap-1 mt-0.5">
                  <Building2 size={13} className="text-eden-tan/70" />
                  {nomEtablissement(m)}{ville ? ` · ${ville}` : ''}
                </div>
              </div>
              <div>
                <span className={`inline-flex items-center rounded-md ${bg} ${text} text-[11px] font-medium p-[2px_8px]`}>
                  {cat}
                </span>
              </div>
              <div className="sm:text-right">
                {urgent ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium p-[3px_9px] rounded-full bg-eden-orange/10 text-eden-orange">
                    <span className="w-1 h-1 rounded-full bg-current" /> {dateLabel}
                  </span>
                ) : (
                  <span className="text-[12px] text-eden-text-light/70 font-light">{dateLabel}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

const CandidatsSection: React.FC<{ candidats: Candidat[]; loading: boolean; error: string | null }> = ({
  candidats, loading, error,
}) => {
  const COLORS = ['bg-eden-navy', 'bg-eden-teal', 'bg-eden-tan', 'bg-eden-orange'];
  return (
    <div className="bg-eden-bg2 border border-eden-border rounded-[14px] overflow-hidden shadow-xs">
      <div className="p-[18px_22px] border-b border-eden-border/60">
        <h2 className="font-serif font-semibold text-[17px] text-eden-navy tracking-wide">
          Candidats qualifiés disponibles
        </h2>
      </div>
      <div className="p-[14px_22px] grid grid-cols-1 sm:grid-cols-2 gap-3">
        {loading && [1, 2, 3, 4].map(i => (
          <div key={i} className="border border-eden-border-light rounded-xl p-3 flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}

        {error && (
          <div className="col-span-2 flex items-center gap-2 text-[12.5px] text-eden-orange p-1">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {!loading && !error && candidats.length === 0 && (
          <div className="col-span-2 text-[12.5px] text-eden-text-light/60 text-center py-2">
            Aucun candidat disponible actuellement
          </div>
        )}

        {!loading && !error && candidats.slice(0, 6).map((c, i) => (
          <div
            key={c._id}
            className="border border-eden-border-light rounded-xl p-3 flex items-center gap-3 hover:border-eden-tan cursor-pointer transition-colors"
          >
            <div className={`w-9 h-9 rounded-full ${COLORS[i % COLORS.length]} text-white text-xs font-semibold flex items-center justify-center`}>
              {initiales(c)}
            </div>
            <div>
              <div className="text-[13px] font-medium text-eden-navy">{nomCandidat(c)}</div>
              <div className="text-[11px] text-eden-text-light">
                {c.metier || c.poste || 'Extra'}
                {c.experience ? ` · ${c.experience} ans exp.` : ''}
                {c.langues && c.langues.length > 1 ? ' · Bilingue' : ''}
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-eden-teal ml-auto" title="Disponible immédiatement" />
          </div>
        ))}
      </div>
    </div>
  );
};

const FluxSection: React.FC<{ flux: FluxItem[]; loading: boolean; error: string | null }> = ({
  flux, loading, error,
}) => (
  <div className="bg-eden-bg2 border border-eden-border rounded-[14px] p-[20px_22px] shadow-xs">
    <h2 className="font-serif font-semibold text-[17px] text-eden-navy tracking-wide mb-[16px]">
      Flux d'activité agence
    </h2>

    {loading && (
      <div className="space-y-[16px]">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3 items-start">
            <Skeleton className="w-[26px] h-[26px] rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5 pt-0.5">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          </div>
        ))}
      </div>
    )}

    {error && (
      <div className="flex items-center gap-2 text-[12.5px] text-eden-orange">
        <AlertCircle size={14} /> {error}
      </div>
    )}

    {!loading && !error && flux.length === 0 && (
      <div className="text-[12.5px] text-eden-text-light/60">Aucune activité récente</div>
    )}

    {!loading && !error && (
      <div className="space-y-[16px]">
        {flux.map(item => (
          <div key={item._id} className="flex gap-3 text-[12.5px] leading-relaxed">
            <div className={`w-[26px] h-[26px] rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              item.icon === 'user-check' ? 'bg-eden-teal/10 text-eden-teal' :
              item.icon === 'file-plus' ? 'bg-eden-tan/15 text-eden-tan' :
              'bg-eden-navy/10 text-eden-navy'
            }`}>
              {item.icon === 'user-check' && <UserCheck size={13} />}
              {item.icon === 'file-plus' && <FilePlus size={13} />}
              {item.icon === 'building' && <Building2 size={13} />}
            </div>
            <div className="flex-1">
              {item.label}
              <div className="text-[11px] text-eden-text-light/50 font-light mt-0.5">{item.time}</div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const StatsSection: React.FC<{ stats: Stats | null; loading: boolean; error: string | null }> = ({
  stats, loading, error,
}) => (
  <div className="space-y-[12px]">
    {/* Taux de remplissage */}
    <div className="bg-eden-bg2 border border-eden-border rounded-[14px] p-[16px_20px] shadow-xs">
      <div className="text-[12px] font-medium text-eden-text-light flex items-center gap-1.5 mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-eden-navy" /> Taux de remplissage des shifts
      </div>
      {loading ? (
        <>
          <Skeleton className="h-1.5 w-full rounded-full mb-2" />
          <div className="flex justify-between">
            <Skeleton className="h-6 w-14" />
            <Skeleton className="h-3 w-24 mt-1.5" />
          </div>
        </>
      ) : (
        <>
          <div className="w-full h-1.5 bg-eden-bg rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-eden-navy rounded-full transition-all duration-700"
              style={{ width: `${stats?.tauxRemplissage ?? 0}%` }}
            />
          </div>
          <div className="flex justify-between items-end">
            <div className="font-serif font-bold text-[22px] text-eden-navy leading-none">
              {stats?.tauxRemplissage ?? '—'}%
            </div>
            <div className="text-[11px] text-eden-text-light/60">
              {stats ? `${stats.postes.pourvus} / ${stats.postes.total} postes pourvus` : error || '—'}
            </div>
          </div>
        </>
      )}
    </div>

    {/* Satisfaction */}
    <div className="bg-eden-bg2 border border-eden-border rounded-[14px] p-[16px_20px] shadow-xs">
      <div className="text-[12px] font-medium text-eden-text-light flex items-center gap-1.5 mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-eden-teal" /> Satisfaction des établissements
      </div>
      {loading ? (
        <>
          <Skeleton className="h-1.5 w-full rounded-full mb-2" />
          <div className="flex justify-between">
            <Skeleton className="h-6 w-14" />
            <Skeleton className="h-3 w-28 mt-1.5" />
          </div>
        </>
      ) : (
        <>
          <div className="w-full h-1.5 bg-eden-bg rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-eden-teal rounded-full transition-all duration-700"
              style={{ width: `${stats ? (stats.satisfaction / 5) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between items-end">
            <div className="font-serif font-bold text-[22px] text-eden-teal leading-none">
              {stats?.satisfaction ?? '—'}
              <span className="text-[12px] text-eden-text-light font-light">/5</span>
            </div>
            <div className="text-[11px] text-eden-text-light/60 flex items-center gap-0.5">
              {stats ? `Basé sur ${stats.nbAvis} avis` : error || '—'}
              <Star size={10} className="fill-eden-tan text-eden-tan ml-0.5" />
            </div>
          </div>
        </>
      )}
    </div>
  </div>
);

// ─── Composant principal ──────────────────────────────────────────────────────

export const DashboardContent: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [candidats, setCandidats] = useState<Candidat[]>([]);
  const [flux, setFlux] = useState<FluxItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  const [loadingMissions, setLoadingMissions] = useState(true);
  const [loadingCandidats, setLoadingCandidats] = useState(true);
  const [loadingFlux, setLoadingFlux] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  const [errorMissions, setErrorMissions] = useState<string | null>(null);
  const [errorCandidats, setErrorCandidats] = useState<string | null>(null);
  const [errorFlux, setErrorFlux] = useState<string | null>(null);
  const [errorStats, setErrorStats] = useState<string | null>(null);

  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // ── Fetch missions urgentes ──────────────────────────────────────────────────
  const fetchMissions = useCallback(async () => {
    setLoadingMissions(true);
    setErrorMissions(null);
    try {
      // Essaie d'abord les missions urgentes, fallback sur toutes les missions
      let data: Mission[] = [];
      try {
        const res = await apiFetch<Mission[] | { missions?: Mission[]; data?: Mission[] }>(
          '/admin/missions'
        );
        data = Array.isArray(res) ? res : (res.missions || res.data || []);
      } catch {
        const res = await apiFetch<Mission[] | { missions?: Mission[]; data?: Mission[] }>(
          '/mission/ouvertes'
        );
        data = Array.isArray(res) ? res : (res.missions || res.data || []);
      }
      setMissions(data);
    } catch (e: unknown) {
      setErrorMissions('Impossible de charger les missions');
      console.error('[DashboardContent] fetchMissions:', e);
    } finally {
      setLoadingMissions(false);
    }
  }, []);

  // ── Fetch candidats disponibles ──────────────────────────────────────────────
  const fetchCandidats = useCallback(async () => {
    setLoadingCandidats(true);
    setErrorCandidats(null);
    try {
      // Essaie plusieurs variantes selon la structure de ton backend
      let data: Candidat[] = [];
      try {
        const res = await apiFetch<Candidat[] | { candidats?: Candidat[]; extras?: Candidat[]; data?: Candidat[] }>(
          '/admin/candidates'
        );
        data = Array.isArray(res) ? res : (res.candidats || res.extras || res.data || []);
      } catch {
        const res = await apiFetch<Candidat[] | { candidats?: Candidat[]; extras?: Candidat[]; data?: Candidat[] }>(
          '/admin/candidates'
        );
        data = Array.isArray(res) ? res : (res.candidats || res.extras || res.data || []);
      }
      setCandidats(data);
    } catch (e: unknown) {
      setErrorCandidats('Impossible de charger les candidats');
      console.error('[DashboardContent] fetchCandidats:', e);
    } finally {
      setLoadingCandidats(false);
    }
  }, []);

  // ── Fetch flux d'activité (contrats + missions récentes) ─────────────────────
  const fetchFlux = useCallback(async () => {
    setLoadingFlux(true);
    setErrorFlux(null);
    try {
      const items: FluxItem[] = [];

      // Contrats récents
      try {
        const res = await apiFetch<{ contrats?: unknown[]; data?: unknown[] } | unknown[]>('/admin/contracts');
        const contrats: unknown[] = Array.isArray(res) ? res : ((res as { contrats?: unknown[]; data?: unknown[] }).contrats || (res as { data?: unknown[] }).data || []);
        for (const c of contrats.slice(0, 3)) {
          const ct = c as Record<string, unknown>;
          const candidatObj = ct.candidat as Record<string, string> | undefined;
          const extra = candidatObj
            ? `${candidatObj.prenom || candidatObj.firstName || ''} ${(candidatObj.nom || candidatObj.lastName || '').charAt(0) || ''}.`.trim()
            : 'Un extra';
          const etabObj = ct.etablissement as Record<string, string> | undefined;
          const etab = etabObj
            ? (etabObj.nom || etabObj.nomEtablissement || '')
            : (typeof ct.etablissement === 'string' ? ct.etablissement : '');
          items.push({
            _id: String(ct._id),
            type: 'contrat',
            icon: 'user-check',
            label: (
              <>
                <span className="font-medium text-eden-navy">{extra}</span>
                {' '}a validé son contrat d'extra{etab ? ` pour ${etab}` : ''}.
              </>
            ),
            time: timeAgo(String(ct.createdAt || ct.dateCreation || '')),
          });
        }
      } catch { /* silencieux */ }

      // Missions récentes déposées
      try {
        const res = await apiFetch<{ missions?: unknown[]; data?: unknown[] } | unknown[]>('/mission/ouvertes');
        const missions: unknown[] = Array.isArray(res) ? res : ((res as { missions?: unknown[] }).missions || (res as { data?: unknown[] }).data || []);
        for (const m of missions.slice(0, 2)) {
          const mi = m as Record<string, unknown>;
          const etabObj = mi.etablissement as Record<string, string> | undefined;
          const etab = etabObj
            ? (etabObj.nom || etabObj.nomEtablissement || '')
            : (typeof mi.etablissement === 'string' ? mi.etablissement : '');
          items.push({
            _id: `m-${String(mi._id)}`,
            type: 'mission',
            icon: 'file-plus',
            label: (
              <>
                Nouvelle demande d'extra déposée
                {etab ? <> par <span className="font-medium text-eden-navy">{etab}</span></> : ''}.
              </>
            ),
            time: timeAgo(String(mi.createdAt || '')),
          });
        }
      } catch { /* silencieux */ }

      // Trie par "fraîcheur" simulée (déjà dans l'ordre d'insertion)
      setFlux(items.slice(0, 5));
    } catch (e: unknown) {
      setErrorFlux("Impossible de charger l'activité");
      console.error('[DashboardContent] fetchFlux:', e);
    } finally {
      setLoadingFlux(false);
    }
  }, []);

  // ── Fetch statistiques admin ─────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    setErrorStats(null);
    try {
      // Essaie /api/admin/stats ou /api/admin/dashboard
      let raw: Record<string, unknown> = {};
      try {
        raw = await apiFetch<Record<string, unknown>>('/admin/metrics');
      } catch {
        try {
          raw = await apiFetch<Record<string, unknown>>('/admin/dashboard/stats');
        } catch {
          // Calcule depuis les missions si les stats n'ont pas d'endpoint dédié
          const res = await apiFetch<{ missions?: unknown[]; data?: unknown[] } | unknown[]>('/mission/ouvertes');
          const allMissions: unknown[] = Array.isArray(res) ? res : ((res as { missions?: unknown[] }).missions || (res as { data?: unknown[] }).data || []);
          const pourvus = allMissions.filter((m) => {
            const mi = m as Record<string, unknown>;
            return mi.statut === 'pourvue' || mi.statut === 'validée' || mi.statut === 'terminée';
          }).length;
          raw = {
            tauxRemplissage: allMissions.length ? Math.round((pourvus / allMissions.length) * 100) : 0,
            missionsPourvues: pourvus,
            missionsTotal: allMissions.length,
            satisfactionMoyenne: null,
            nombreAvis: 0,
          };
        }
      }

      // Normalise les noms de champs (le backend peut varier)
      const taux =
        (raw.tauxRemplissage as number) ??
        (raw.fillRate as number) ??
        (raw.taux as number) ??
        0;
      const pourvus =
        (raw.missionsPourvues as number) ??
        (raw.shiftsPourvus as number) ??
        0;
      const total =
        (raw.missionsTotal as number) ??
        (raw.shiftsTotal as number) ??
        0;
      const satisfaction =
        (raw.satisfactionMoyenne as number) ??
        (raw.noteMoyenne as number) ??
        (raw.satisfaction as number) ??
        0;
      const nbAvis =
        (raw.nombreAvis as number) ??
        (raw.nbAvis as number) ??
        (raw.totalAvis as number) ??
        0;

      setStats({ tauxRemplissage: taux, postes: { pourvus, total }, satisfaction, nbAvis });
    } catch (e: unknown) {
      setErrorStats('Stats indisponibles');
      console.error('[DashboardContent] fetchStats:', e);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // ── Chargement initial + auto-refresh toutes les 2 minutes ──────────────────
  useEffect(() => {
    fetchMissions();
    fetchCandidats();
    fetchFlux();
    fetchStats();
  }, [fetchMissions, fetchCandidats, fetchFlux, fetchStats]);

  useEffect(() => {
    const id = setInterval(() => {
      fetchMissions();
      fetchCandidats();
      fetchFlux();
      fetchStats();
      setLastRefresh(new Date());
    }, 2 * 60 * 1000); // 2 minutes
    return () => clearInterval(id);
  }, [fetchMissions, fetchCandidats, fetchFlux, fetchStats]);

  const handleManualRefresh = () => {
    fetchMissions();
    fetchCandidats();
    fetchFlux();
    fetchStats();
    setLastRefresh(new Date());
  };

  const isLoading = loadingMissions || loadingCandidats || loadingFlux || loadingStats;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.1fr] gap-[24px] p-[24px_30px] font-sans">

      {/* Barre de refresh discrète */}
      <div className="lg:col-span-2 flex items-center justify-end gap-2 -mb-2">
        <span className="text-[11px] text-eden-text-light/40">
          Mis à jour {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </span>
        <button
          onClick={handleManualRefresh}
          disabled={isLoading}
          className="text-eden-text-light/40 hover:text-eden-tan transition-colors disabled:opacity-30"
          title="Actualiser"
        >
          <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* COLONNE GAUCHE */}
      <div className="space-y-[24px]">
        <MissionsSection
          missions={missions}
          loading={loadingMissions}
          error={errorMissions}
        />
        <CandidatsSection
          candidats={candidats}
          loading={loadingCandidats}
          error={errorCandidats}
        />
      </div>

      {/* COLONNE DROITE */}
      <div className="space-y-[24px]">
        <FluxSection
          flux={flux}
          loading={loadingFlux}
          error={errorFlux}
        />
        <StatsSection
          stats={stats}
          loading={loadingStats}
          error={errorStats}
        />
      </div>

    </div>
  );
};