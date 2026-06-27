import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  UserCheck, ShieldAlert, FileText, Check, X, Search, Eye, Award,
  SlidersHorizontal, Loader2, AlertCircle, Download, Clock, Bell,
  BarChart2, PenLine, Send, RefreshCw,
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { io as socketIO } from 'socket.io-client';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Documents {
  idCardUrl?: string;        idCardUploadedAt?: string;
  vitaleCardUrl?: string;    vitaleCardUploadedAt?: string;
  ribUrl?: string;           ribUploadedAt?: string;
  titreSejourUrl?: string;   titreSejourUploadedAt?: string;
}

interface Candidate {
  _id: string; id?: string;
  firstName?: string; lastName?: string; prenom?: string; nom?: string;
  role?: string; metier?: string; specialty?: string; competences?: string[];
  experience?: string; city?: string; adresse?: { ville?: string; codePostal?: string };
  status?: 'pending' | 'validated' | 'premium' | 'active' | 'inactive' | 'rejected';
  statutValidation?: 'en_attente' | 'approuve' | 'rejete';
  email?: string; phone?: string; telephone?: string;
  createdAt?: string; statutCompte?: string;
  nationalite?: string;
  titreSejour?: { type?: string; dateExpiration?: string };
  documents?: Documents;
}

interface Contrat {
  _id: string; titre?: string; poste?: string; statut?: string;
  dateDebut?: string; dateFin?: string; signéLe?: string;
  candidatId?: string; candidatRef?: string;
  etablissement?: string | { nom?: string };
}

interface Notification {
  id: string; type: string; message: string; candidatId?: string; contratId?: string;
  createdAt: Date; read: boolean;
}

interface Metrics {
  stats?: {
    totalExtras?: number; totalEntreprises?: number; chiffreAffaires?: number;
    totalMissions?: number; tauxRemplissage?: number; nouveauxExtrasCeMois?: number; totalContrats?: number;
  };
  graphiques?: {
    inscriptionsParMois?: { _id: { year: number; month: number }; count: number }[];
    missionsParStatut?: { _id: string; count: number }[];
    caParMois?: { _id: { year: number; month: number }; total: number }[];
    extrasParMetier?: { _id: string; count: number }[];
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const API_BASE = 'https://eden-hcr.onrender.com';
const API      = `${API_BASE}/api`;
const COLORS   = ['#073B4C', '#C5A46D', '#118AB2', '#06D6A0', '#FFD166', '#EF476F'];
const MOIS     = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

const getFirstName = (c: Candidate) => c.firstName || c.prenom || '';
const getLastName  = (c: Candidate) => c.lastName  || c.nom    || '';
const getRole      = (c: Candidate) => c.role      || c.metier || '';
const getSpecialty = (c: Candidate) => c.specialty || (c.competences ? c.competences[0] : '') || '';
const getCity      = (c: Candidate) => c.city      || c.adresse?.ville || '';
const getPhone     = (c: Candidate) => c.phone     || c.telephone || '';

const getStatus = (c: Candidate): 'pending' | 'validated' | 'premium' => {
  if (c.status === 'validated') return 'validated';
  if (c.status === 'premium')   return 'premium';
  if (c.status === 'pending')   return 'pending';
  if (c.status === 'active')    return 'validated';
  if (c.status === 'inactive')  return 'pending';
  if (c.statutValidation === 'approuve')   return 'validated';
  if (c.statutValidation === 'en_attente') return 'pending';
  if (c.statutCompte === 'actif')          return 'validated';
  return 'pending';
};

function getTitreStatus(dateStr?: string): 'valide' | 'expire_bientot' | 'expire' | null {
  if (!dateStr) return null;
  const diff = Math.floor((new Date(dateStr).getTime() - Date.now()) / 86400000);
  if (diff < 0)   return 'expire';
  if (diff <= 90) return 'expire_bientot';
  return 'valide';
}

function getTitreBlock(c: Candidate): 'expire' | 'manquant' | null {
  if (c.nationalite !== 'etranger') return null;
  const s = getTitreStatus(c.titreSejour?.dateExpiration);
  if (s === 'expire') return 'expire';
  if (!c.documents?.titreSejourUrl) return 'manquant';
  return null;
}

function getToken(): string {
  return localStorage.getItem('eden_token') || localStorage.getItem('token') || '';
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function apiFetch<T>(path: string, options?: RequestInit, retries = 3, delayMs = 1200): Promise<T> {
  let lastError: Error = new Error('Erreur inconnue');
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${API}${path}`, { ...options, headers: { ...authHeaders(), ...(options?.headers ?? {}) } });
      if (res.status === 401 && attempt < retries) { await new Promise(r => setTimeout(r, delayMs * attempt)); continue; }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { message?: string }).message || `${res.status} ${res.statusText}`);
      }
      return res.json();
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt < retries) await new Promise(r => setTimeout(r, delayMs * attempt));
    }
  }
  throw lastError;
}

// ─── Sous-composant : ligne document ─────────────────────────────────────────

const DocumentRow: React.FC<{
  label: string; url?: string; uploadedAt?: string;
  warn?: 'expire' | 'expire_bientot' | null;
}> = ({ label, url, uploadedAt, warn }) => {
  const isPresent = !!url;
  const date = uploadedAt ? new Date(uploadedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : null;

  return (
    <div className={`p-3 border rounded-xl flex items-center justify-between gap-3 transition-colors ${
      warn === 'expire'         ? 'border-red-300 bg-red-50/60'
      : warn === 'expire_bientot' ? 'border-amber-300 bg-amber-50/60'
      : isPresent               ? 'border-green-200 bg-green-50/30'
      : 'border-eden-border/70 bg-white'
    }`}>
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <FileText size={15} className={
          warn === 'expire' ? 'text-red-400 shrink-0'
          : warn === 'expire_bientot' ? 'text-amber-400 shrink-0'
          : isPresent ? 'text-green-500 shrink-0'
          : 'text-eden-text-light shrink-0'
        } />
        <div className="min-w-0">
          <p className="text-xs font-medium text-eden-text-dark truncate">{label}</p>
          {isPresent && date && <p className="text-[10px] text-eden-text-light">Reçu le {date}</p>}
          {!isPresent && <p className="text-[10px] text-eden-text-light italic">Non fourni</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {warn === 'expire' && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-100 text-red-600">Expiré</span>}
        {warn === 'expire_bientot' && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-600 flex items-center gap-1">
            <Clock size={10} /> Bientôt
          </span>
        )}
        {isPresent && !warn && <span className="text-[10px] font-semibold text-green-600 bg-green-100 px-1.5 py-0.5 rounded">✓ Fourni</span>}
        {isPresent && url && (
          <a href={`${API_BASE}${url}`} target="_blank" rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-eden-bg border border-eden-border hover:border-eden-tan text-eden-text-light hover:text-eden-navy transition-colors"
            title="Voir le document">
            <Download size={12} />
          </a>
        )}
      </div>
    </div>
  );
};

// ─── Composant principal ──────────────────────────────────────────────────────

export const CandidateManager: React.FC = () => {
  const [candidates, setCandidates]               = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm]               = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading]                 = useState(true);
  const [error, setError]                         = useState('');
  const [actionMessage, setActionMessage]         = useState('');

  // Contrats
  const [contrats, setContrats]                   = useState<Contrat[]>([]);
  const [sendingContrat, setSendingContrat]        = useState<string | null>(null);
  const [contratMessage, setContratMessage]        = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Métriques & graphiques
  const [metrics, setMetrics]   = useState<Metrics>({});
  const [activeTab, setActiveTab] = useState<'liste' | 'stats'>('liste');

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs]       = useState(false);
  const unreadNotifs = notifications.filter(n => !n.read).length;

  // ── Socket.io ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const userId = localStorage.getItem('eden_user')
      ? JSON.parse(localStorage.getItem('eden_user') || '{}')._id || ''
      : '';
    if (!userId) return;

    const socket = socketIO(API_BASE, { query: { userId }, transports: ['websocket'] });

    socket.on('notification', (payload: { type: string; message: string; candidatId?: string; contratId?: string }) => {
      setNotifications(prev => [{
        id: Math.random().toString(36).slice(2),
        type: payload.type, message: payload.message,
        candidatId: payload.candidatId, contratId: payload.contratId,
        createdAt: new Date(), read: false,
      }, ...prev].slice(0, 30));

      // Rafraîchir le candidat concerné si visible
      if (payload.type === 'contrat_signe' && payload.candidatId) {
        fetchCandidates();
      }
    });

    return () => { socket.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Chargement candidats ───────────────────────────────────────────────────
  const fetchCandidates = useCallback(async () => {
    setIsLoading(true); setError('');
    try {
      const resData = await apiFetch<{ data?: Candidate[] } | Candidate[]>('/admin/candidates');
      const list = (resData as { data?: Candidate[] }).data ?? (resData as Candidate[]);
      setCandidates(list);
    } catch (err) {
      console.error('Erreur CandidateManager fetch :', err);
      setError('Impossible de joindre le serveur HCR pour actualiser le vivier.');
    } finally { setIsLoading(false); }
  }, []);

  // ── Chargement métriques ───────────────────────────────────────────────────
  const fetchMetrics = useCallback(async () => {
    try {
      const resData = await apiFetch<{ data?: Metrics } | Metrics>('/admin/metrics');
      const m = (resData as { data?: Metrics }).data ?? (resData as Metrics);
      setMetrics(m);
    } catch (err) {
      console.error('Erreur métriques :', err);
    }
  }, []);

  // ── Chargement contrats ────────────────────────────────────────────────────
  const fetchContrats = useCallback(async () => {
    try {
      const resData = await apiFetch<{ data?: Contrat[] } | Contrat[]>('/admin/contracts');
      const list = (resData as { data?: Contrat[] }).data ?? (resData as Contrat[]);
      setContrats(list);
    } catch { /* pas encore dispo */ }
  }, []);

  useEffect(() => {
    fetchCandidates();
    fetchMetrics();
    fetchContrats();
  }, [fetchCandidates, fetchMetrics, fetchContrats]);

  // ── Mise à jour statut ─────────────────────────────────────────────────────
  const handleUpdateStatus = async (id: string, newStatus: 'validated' | 'premium' | 'pending') => {
    setActionMessage('Mise à jour du profil sur Atlas…');
    const applyStatus = (c: Candidate) =>
      c._id === id ? { ...c, status: newStatus, statutCompte: newStatus === 'validated' ? 'actif' : c.statutCompte } : c;
    setCandidates(prev => prev.map(applyStatus));
    setSelectedCandidate(prev => prev && prev._id === id ? applyStatus(prev) : prev);
    try {
      await apiFetch(`/admin/candidates/${id}/status`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) });
      setActionMessage(`Statut mis à jour : ${newStatus}`);
    } catch (err) {
      console.error('Erreur de mise à jour du statut :', err);
      setActionMessage('Erreur de synchronisation — rechargement…');
      await fetchCandidates();
    } finally { setTimeout(() => setActionMessage(''), 3000); }
  };

  // ── Envoi contrat pour signature ───────────────────────────────────────────
  const handleSendContrat = async (contratId: string) => {
    setSendingContrat(contratId); setContratMessage(null);
    try {
      await apiFetch(`/admin/contracts/${contratId}/send-signature`, { method: 'POST' });
      setContratMessage({ type: 'success', text: 'Contrat envoyé pour signature. L\'extra a été notifié.' });
      await fetchContrats();
    } catch (err: any) {
      setContratMessage({ type: 'error', text: err.message || 'Erreur lors de l\'envoi.' });
    } finally {
      setSendingContrat(null);
      setTimeout(() => setContratMessage(null), 5000);
    }
  };

  // ── Exports ────────────────────────────────────────────────────────────────
  const handleExport = (type: 'excel' | 'pdf', entity: 'candidats' | 'contrats' | 'paiements') => {
    const token = getToken();
    window.open(`${API}/admin/export/${type}/${entity}?token=${token}`, '_blank');
  };

  // ── Données graphiques ─────────────────────────────────────────────────────
  const inscriptionsData = (metrics.graphiques?.inscriptionsParMois || []).map(d => ({
    name: MOIS[(d._id.month || 1) - 1], count: d.count,
  }));
  const caData = (metrics.graphiques?.caParMois || []).map(d => ({
    name: MOIS[(d._id.month || 1) - 1], total: d.total,
  }));
  const missionsData = (metrics.graphiques?.missionsParStatut || []).map(d => ({
    name: d._id || 'Inconnu', value: d.count,
  }));
  const metiersData = (metrics.graphiques?.extrasParMetier || []).map(d => ({
    name: d._id || 'Autre', value: d.count,
  }));

  const filteredCandidates = candidates.filter(c =>
    `${getFirstName(c)} ${getLastName(c)}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getRole(c).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatMontant = (n?: number) => n != null ? `${n.toLocaleString('fr-FR')} €` : '—';

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px] space-y-3 font-sans">
        <Loader2 className="animate-spin text-eden-tan" size={32} />
        <p className="text-xs text-eden-text-light font-light tracking-wide">Ouverture sécurisée du vivier de la brigade...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 font-sans space-y-6 max-w-[1600px] mx-auto">

      {/* HEADER */}
      <div className="bg-eden-bg2 border border-eden-border rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-serif font-semibold text-xl text-eden-navy tracking-wide flex items-center gap-2">
            <UserCheck size={22} className="text-eden-tan" /> Vivier & Approbations Extras
          </h2>
          <p className="text-xs text-eden-text-light font-light">
            Contrôlez les profils, examinez les documents légaux et attribuez les statuts de prestige.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Tabs */}
          <div className="flex bg-eden-bg border border-eden-border rounded-xl overflow-hidden">
            <button onClick={() => setActiveTab('liste')}
              className={`px-4 py-2 text-xs font-medium transition-colors ${activeTab === 'liste' ? 'bg-eden-navy text-white' : 'text-eden-text-light hover:text-eden-navy'}`}>
              Vivier
            </button>
            <button onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 text-xs font-medium transition-colors ${activeTab === 'stats' ? 'bg-eden-navy text-white' : 'text-eden-text-light hover:text-eden-navy'}`}>
              Statistiques
            </button>
          </div>

          {/* Exports */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 bg-eden-bg border border-eden-border rounded-xl text-xs text-eden-text-light hover:text-eden-navy transition-colors">
              <Download size={14} /> Exporter
            </button>
            <div className="absolute right-0 top-9 w-52 bg-white border border-eden-border rounded-xl shadow-xl z-20 hidden group-hover:block overflow-hidden">
              {[
                { label: 'Extras — Excel', type: 'excel' as const, entity: 'candidats' as const },
                { label: 'Extras — PDF',   type: 'pdf'   as const, entity: 'candidats' as const },
                { label: 'Contrats — Excel', type: 'excel' as const, entity: 'contrats' as const },
                { label: 'Contrats — PDF',   type: 'pdf'   as const, entity: 'contrats' as const },
                { label: 'Paiements — Excel', type: 'excel' as const, entity: 'paiements' as const },
                { label: 'Paiements — PDF',   type: 'pdf'   as const, entity: 'paiements' as const },
              ].map((opt, i) => (
                <button key={i} onClick={() => handleExport(opt.type, opt.entity)}
                  className="w-full text-left px-4 py-2.5 text-xs text-eden-text-dark hover:bg-eden-bg transition-colors border-b border-eden-border/30 last:border-0">
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button onClick={() => { setShowNotifs(v => !v); setNotifications(prev => prev.map(n => ({ ...n, read: true }))); }}
              className="relative p-2.5 bg-eden-bg border border-eden-border rounded-xl text-eden-text-light hover:text-eden-navy transition-colors">
              <Bell size={15} />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadNotifs}
                </span>
              )}
            </button>
            {showNotifs && (
              <div className="absolute right-0 top-11 w-80 bg-white border border-eden-border rounded-2xl shadow-xl z-30 overflow-hidden">
                <div className="px-4 py-3 border-b border-eden-border flex items-center justify-between">
                  <p className="font-semibold text-sm text-eden-navy">Notifications</p>
                  <button onClick={() => setShowNotifs(false)} className="text-eden-text-light hover:text-eden-navy"><X size={14} /></button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-eden-border/40">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-eden-text-light text-center py-6">Aucune notification</p>
                  ) : notifications.map(n => (
                    <div key={n.id} className={`px-4 py-3 ${!n.read ? 'bg-eden-bg/60' : ''}`}>
                      <p className="text-xs font-medium text-eden-navy">{n.message}</p>
                      <p className="text-[10px] text-eden-text-light mt-0.5">{new Date(n.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recherche */}
          {activeTab === 'liste' && (
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-eden-text-light" />
              <input type="text" placeholder="Rechercher un extra ou un métier..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-eden-bg border border-eden-border rounded-xl pl-9 pr-4 py-2.5 text-xs outline-hidden focus:border-eden-tan/80 text-eden-text-dark w-full sm:w-64 transition-all" />
            </div>
          )}

          <button onClick={() => { fetchCandidates(); fetchMetrics(); fetchContrats(); }}
            className="p-2.5 bg-eden-bg border border-eden-border rounded-xl text-eden-text-light hover:text-eden-navy transition-colors" title="Actualiser">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}
      {actionMessage && (
        <div className="p-3 text-xs text-eden-navy bg-eden-tan/10 border border-eden-tan/30 rounded-xl font-medium animate-pulse">
          {actionMessage}
        </div>
      )}

      {/* ── ONGLET STATISTIQUES ── */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Extras inscrits',     value: metrics.stats?.totalExtras ?? '—' },
              { label: 'Entreprises',          value: metrics.stats?.totalEntreprises ?? '—' },
              { label: 'Missions',             value: metrics.stats?.totalMissions ?? '—' },
              { label: 'CA total (€)',         value: metrics.stats?.chiffreAffaires != null ? formatMontant(metrics.stats.chiffreAffaires) : '—' },
              { label: 'Taux remplissage',     value: metrics.stats?.tauxRemplissage != null ? `${metrics.stats.tauxRemplissage}%` : '—' },
              { label: 'Nouveaux ce mois',     value: metrics.stats?.nouveauxExtrasCeMois ?? '—' },
              { label: 'Contrats',             value: metrics.stats?.totalContrats ?? '—' },
            ].map((kpi, i) => (
              <div key={i} className="bg-white border border-eden-border rounded-2xl p-5">
                <p className="text-2xl font-bold text-eden-navy">{kpi.value}</p>
                <p className="text-xs text-eden-text-light mt-1">{kpi.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Inscriptions par mois */}
            <div className="bg-white border border-eden-border rounded-2xl p-6">
              <p className="text-[10px] tracking-[3px] text-eden-tan uppercase mb-1">Croissance</p>
              <h3 className="font-bold text-eden-navy mb-4">Inscriptions extras (6 mois)</h3>
              {inscriptionsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={inscriptionsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F4F1EA" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => [v, 'Inscriptions']} />
                    <Bar dataKey="count" fill="#073B4C" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-[200px] flex items-center justify-center text-eden-text-light text-xs">Aucune donnée</div>}
            </div>

            {/* CA mensuel */}
            <div className="bg-white border border-eden-border rounded-2xl p-6">
              <p className="text-[10px] tracking-[3px] text-eden-tan uppercase mb-1">Financier</p>
              <h3 className="font-bold text-eden-navy mb-4">CA mensuel (6 mois)</h3>
              {caData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={caData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F4F1EA" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => [`${Number(v).toLocaleString('fr-FR')} €`, 'CA']} />
                    <Line type="monotone" dataKey="total" stroke="#C5A46D" strokeWidth={2} dot={{ fill: '#073B4C', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <div className="h-[200px] flex items-center justify-center text-eden-text-light text-xs">Aucune donnée</div>}
            </div>

            {/* Missions par statut */}
            <div className="bg-white border border-eden-border rounded-2xl p-6">
              <p className="text-[10px] tracking-[3px] text-eden-tan uppercase mb-1">Missions</p>
              <h3 className="font-bold text-eden-navy mb-4">Répartition par statut</h3>
              {missionsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={missionsData} cx="50%" cy="50%" outerRadius={75} dataKey="value"
                      label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                      {missionsData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="h-[200px] flex items-center justify-center text-eden-text-light text-xs">Aucune donnée</div>}
            </div>

            {/* Extras par métier */}
            <div className="bg-white border border-eden-border rounded-2xl p-6">
              <p className="text-[10px] tracking-[3px] text-eden-tan uppercase mb-1">Compétences</p>
              <h3 className="font-bold text-eden-navy mb-4">Top métiers</h3>
              {metiersData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={metiersData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#F4F1EA" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                    <Tooltip formatter={(v) => [v, 'Extras']} />
                    <Bar dataKey="value" fill="#C5A46D" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-[200px] flex items-center justify-center text-eden-text-light text-xs">Aucune donnée</div>}
            </div>
          </div>

          {/* Contrats — envoi signature */}
          <div className="bg-white border border-eden-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] tracking-[3px] text-eden-tan uppercase mb-1">Gestion</p>
                <h3 className="font-bold text-eden-navy">Contrats — Envoi pour signature</h3>
              </div>
              <span className="text-xs text-eden-text-light">{contrats.length} contrat{contrats.length > 1 ? 's' : ''}</span>
            </div>

            {contratMessage && (
              <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 text-xs font-medium ${contratMessage.type === 'success' ? 'bg-green-50 border border-green-200 text-green-600' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                {contratMessage.type === 'success' ? <Check size={13} /> : <AlertCircle size={13} />}
                {contratMessage.text}
              </div>
            )}

            {contrats.length === 0 ? (
              <p className="text-xs text-eden-text-light text-center py-8">Aucun contrat disponible.</p>
            ) : (
              <div className="space-y-2">
                {contrats.slice(0, 8).map(c => {
                  const etab = typeof c.etablissement === 'object' ? c.etablissement?.nom || '' : c.etablissement || '';
                  return (
                    <div key={c._id} className="flex items-center justify-between p-3 border border-eden-border rounded-xl hover:border-eden-tan/50 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-eden-navy truncate">{c.titre || c.poste || 'Contrat'}</p>
                        <p className="text-[10px] text-eden-text-light mt-0.5">
                          {etab}{c.dateDebut ? ` · ${new Date(c.dateDebut).toLocaleDateString('fr-FR')}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${
                          c.statut === 'signé'                ? 'bg-green-100 text-green-600'
                          : c.statut === 'en_attente_signature' ? 'bg-amber-100 text-amber-600'
                          : 'bg-eden-bg text-eden-text-light'
                        }`}>{c.statut || 'brouillon'}</span>
                        {c.statut !== 'signé' && (
                          <button onClick={() => handleSendContrat(c._id)}
                            disabled={sendingContrat === c._id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-eden-navy hover:bg-eden-light-navy disabled:opacity-50 disabled:cursor-not-allowed text-white text-[11px] font-medium rounded-lg transition-colors">
                            {sendingContrat === c._id
                              ? <><div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> Envoi…</>
                              : <><Send size={11} /> Envoyer</>
                            }
                          </button>
                        )}
                        {c.statut === 'signé' && (
                          <span className="flex items-center gap-1 text-[11px] text-green-600 font-medium">
                            <Check size={12} /> Signé{c.signéLe ? ` le ${new Date(c.signéLe).toLocaleDateString('fr-FR')}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ONGLET LISTE (VIVIER) ── */}
      {activeTab === 'liste' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* TABLEAU */}
          <div className="lg:col-span-8 bg-eden-bg2 border border-eden-border rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-eden-border bg-eden-navy/[0.02] text-eden-text-light font-semibold tracking-wider uppercase select-none">
                    <th className="p-4 pl-6">Profil Extra</th>
                    <th className="p-4">Métier</th>
                    <th className="p-4">Documents</th>
                    <th className="p-4">Statut</th>
                    <th className="p-4 pr-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-eden-border/40 bg-white">
                  {filteredCandidates.map(candidate => {
                    const firstName  = getFirstName(candidate);
                    const lastName   = getLastName(candidate);
                    const role       = getRole(candidate);
                    const specialty  = getSpecialty(candidate);
                    const city       = getCity(candidate);
                    const status     = getStatus(candidate);
                    const initials   = `${firstName?.[0] ?? '?'}${lastName?.[0] ?? '?'}`.toUpperCase();
                    const titreBlock = getTitreBlock(candidate);
                    const docs       = candidate.documents || {};
                    const docsCount  = [docs.idCardUrl, docs.vitaleCardUrl, docs.ribUrl].filter(Boolean).length
                      + (candidate.nationalite === 'etranger' && docs.titreSejourUrl ? 1 : 0);
                    const docsTotal  = candidate.nationalite === 'etranger' ? 4 : 3;

                    return (
                      <tr key={candidate._id}
                        className={`hover:bg-eden-navy/[0.01] transition-colors cursor-pointer ${selectedCandidate?._id === candidate._id ? 'bg-eden-navy/[0.02]' : ''}`}
                        onClick={() => setSelectedCandidate(candidate)}>
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-eden-navy text-white font-bold flex items-center justify-center text-xs uppercase">{initials}</div>
                            <div>
                              <p className="font-semibold text-eden-text-dark text-sm">
                                {firstName || lastName ? `${firstName} ${lastName}`.trim() : <span className="text-eden-text-light italic">Sans nom</span>}
                              </p>
                              <p className="text-[11px] text-eden-text-light mt-0.5">
                                {city || '—'} · {candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString('fr-FR') : '—'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-eden-text-dark">{role || <span className="text-eden-text-light italic">—</span>}</p>
                          <p className="text-[11px] text-eden-tan font-medium mt-0.5">{specialty || '—'}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${docsCount === docsTotal ? 'bg-green-100 text-green-600' : docsCount === 0 ? 'bg-gray-100 text-gray-500' : 'bg-amber-100 text-amber-600'}`}>
                              {docsCount}/{docsTotal}
                            </span>
                            {titreBlock === 'expire'  && <span className="text-[10px] bg-red-100 text-red-600 font-semibold px-1.5 py-0.5 rounded">Titre expiré</span>}
                            {titreBlock === 'manquant' && <span className="text-[10px] bg-orange-100 text-orange-600 font-semibold px-1.5 py-0.5 rounded">Titre manquant</span>}
                          </div>
                        </td>
                        <td className="p-4">
                          {status === 'pending' && (
                            <span className="inline-flex items-center gap-1 bg-eden-orange/10 text-eden-orange font-medium px-2.5 py-1 rounded-md text-[10px] uppercase">
                              <ShieldAlert size={11} /> À valider
                            </span>
                          )}
                          {status === 'validated' && (
                            <span className="inline-flex items-center gap-1 bg-eden-teal/10 text-eden-teal font-medium px-2.5 py-1 rounded-md text-[10px] uppercase">
                              <Check size={11} /> Actif
                            </span>
                          )}
                          {status === 'premium' && (
                            <span className="inline-flex items-center gap-1 bg-eden-tan/10 text-eden-tan font-bold px-2.5 py-1 rounded-md text-[10px] uppercase">
                              <Award size={11} /> Élite
                            </span>
                          )}
                        </td>
                        <td className="p-4 pr-6 text-right" onClick={e => e.stopPropagation()}>
                          <button onClick={() => setSelectedCandidate(candidate)}
                            className="p-2 bg-transparent border border-eden-border hover:border-eden-tan text-eden-text-light hover:text-eden-navy rounded-xl transition-all cursor-pointer">
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredCandidates.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-eden-text-light italic">Aucun profil ne correspond à vos critères.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* PANNEAU INSPECTION */}
          <div className="lg:col-span-4 space-y-4">
            {selectedCandidate ? (() => {
              const firstName   = getFirstName(selectedCandidate);
              const lastName    = getLastName(selectedCandidate);
              const role        = getRole(selectedCandidate);
              const specialty   = getSpecialty(selectedCandidate);
              const phone       = getPhone(selectedCandidate);
              const status      = getStatus(selectedCandidate);
              const initials    = `${firstName?.[0] ?? '?'}${lastName?.[0] ?? '?'}`.toUpperCase();
              const isEtranger  = selectedCandidate.nationalite === 'etranger';
              const titreStatus = getTitreStatus(selectedCandidate.titreSejour?.dateExpiration);
              const titreBlock  = getTitreBlock(selectedCandidate);
              const docs        = selectedCandidate.documents || {};
              const canValidate = !titreBlock;
              const expiration  = selectedCandidate.titreSejour?.dateExpiration
                ? new Date(selectedCandidate.titreSejour.dateExpiration).toLocaleDateString('fr-FR') : null;

              // Contrats liés à ce candidat
              const contratsCandidat = contrats.filter(c =>
                c.candidatId === selectedCandidate._id || c.candidatRef === selectedCandidate._id
              );

              return (
                <div className="bg-eden-bg2 border border-eden-border rounded-2xl p-6 shadow-md space-y-5 sticky top-24">

                  {/* En-tête */}
                  <div className="flex items-start justify-between border-b border-eden-border/40 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-eden-tan/10 text-eden-tan font-bold flex items-center justify-center text-sm uppercase">{initials}</div>
                      <div>
                        <h3 className="font-serif font-bold text-base text-eden-navy">
                          {firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Sans nom'}
                        </h3>
                        <p className="text-[11px] text-eden-text-light font-mono mt-0.5">{phone || '—'}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedCandidate(null)} className="p-1 text-eden-text-light hover:text-eden-navy bg-transparent border-none cursor-pointer transition-colors">
                      <X size={16} />
                    </button>
                  </div>

                  {/* Infos */}
                  <div className="space-y-1.5 text-xs bg-eden-bg/40 border border-eden-border-light rounded-xl p-4">
                    <p className="text-eden-text-light font-medium uppercase text-[10px] tracking-wider mb-2">Informations</p>
                    <p className="text-eden-text-light">Métier : <span className="font-semibold text-eden-text-dark">{role || '—'}</span></p>
                    <p className="text-eden-text-light">Email : <span className="font-mono text-eden-navy">{selectedCandidate.email || '—'}</span></p>
                    <p className="text-eden-text-light">Expérience : <span className="font-medium text-eden-navy">{selectedCandidate.experience || '—'}</span></p>
                    <p className="text-eden-text-light">Spécialité : <span className="font-medium text-eden-tan">{specialty || '—'}</span></p>
                    <p className="text-eden-text-light">Nationalité : <span className="font-medium text-eden-navy">{isEtranger ? 'Étranger' : 'Française'}</span></p>
                  </div>

                  {/* Alertes titre de séjour */}
                  {isEtranger && titreStatus === 'expire' && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                      <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-red-600">Titre de séjour expiré</p>
                        <p className="text-[11px] text-red-500 mt-0.5">Expiré le {expiration}. Validation impossible.</p>
                      </div>
                    </div>
                  )}
                  {isEtranger && titreStatus === 'expire_bientot' && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-amber-600">Titre expire bientôt</p>
                        <p className="text-[11px] text-amber-500 mt-0.5">Expire le {expiration}. Vérifiez avant renouvellement.</p>
                      </div>
                    </div>
                  )}
                  {isEtranger && titreStatus === 'valide' && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                      <Check size={14} className="text-green-500 shrink-0" />
                      <p className="text-xs font-semibold text-green-600">Titre valide jusqu'au {expiration}</p>
                    </div>
                  )}
                  {isEtranger && !selectedCandidate.titreSejour?.dateExpiration && (
                    <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                      <AlertCircle size={14} className="text-orange-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-orange-600">Titre de séjour manquant</p>
                        <p className="text-[11px] text-orange-500 mt-0.5">Aucune date renseignée. Validation bloquée.</p>
                      </div>
                    </div>
                  )}

                  {/* Documents */}
                  <div className="space-y-2">
                    <p className="text-[10px] text-eden-text-light font-medium uppercase tracking-wider">Documents réglementaires</p>
                    <DocumentRow label="Pièce d'identité"   url={docs.idCardUrl}     uploadedAt={docs.idCardUploadedAt} />
                    <DocumentRow label="Attestation Vitale" url={docs.vitaleCardUrl} uploadedAt={docs.vitaleCardUploadedAt} />
                    <DocumentRow label="RIB"                url={docs.ribUrl}        uploadedAt={docs.ribUploadedAt} />
                    {isEtranger && (
                      <DocumentRow
                        label={`Titre de séjour${selectedCandidate.titreSejour?.type ? ` — ${selectedCandidate.titreSejour.type}` : ''}`}
                        url={docs.titreSejourUrl} uploadedAt={docs.titreSejourUploadedAt}
                        warn={titreStatus === 'expire' ? 'expire' : titreStatus === 'expire_bientot' ? 'expire_bientot' : null}
                      />
                    )}
                  </div>

                  {/* Contrats liés */}
                  {contratsCandidat.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] text-eden-text-light font-medium uppercase tracking-wider">Contrats liés</p>
                      {contratsCandidat.map(c => (
                        <div key={c._id} className="flex items-center justify-between p-2.5 bg-eden-bg border border-eden-border rounded-xl">
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-medium text-eden-navy truncate">{c.titre || c.poste || 'Contrat'}</p>
                            <span className={`text-[10px] font-medium ${c.statut === 'signé' ? 'text-green-600' : c.statut === 'en_attente_signature' ? 'text-amber-600' : 'text-eden-text-light'}`}>
                              {c.statut || '—'}
                            </span>
                          </div>
                          {c.statut !== 'signé' && (
                            <button onClick={() => handleSendContrat(c._id)} disabled={sendingContrat === c._id}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-eden-navy text-white text-[10px] font-medium rounded-lg hover:bg-eden-light-navy disabled:opacity-50 transition-colors ml-2 shrink-0">
                              {sendingContrat === c._id ? <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={10} />}
                              Envoyer
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Blocage info */}
                  {!canValidate && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5">
                        <AlertCircle size={13} /> Validation désactivée
                      </p>
                      <p className="text-[11px] text-red-500 mt-1">
                        {titreBlock === 'expire' ? "Le titre de séjour est expiré." : "Le titre de séjour est manquant."}
                      </p>
                    </div>
                  )}

                  {/* Boutons d'action */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {status === 'pending' ? (
                      <>
                        <button type="button" disabled={!canValidate}
                          onClick={() => canValidate && handleUpdateStatus(selectedCandidate._id, 'validated')}
                          className={`w-full text-white text-xs font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-1.5 border-none ${canValidate ? 'bg-eden-navy hover:bg-eden-light-navy cursor-pointer' : 'bg-gray-300 cursor-not-allowed opacity-60'}`}>
                          <Check size={14} /> Activer
                        </button>
                        <button type="button" disabled={!canValidate}
                          onClick={() => canValidate && handleUpdateStatus(selectedCandidate._id, 'premium')}
                          className={`w-full text-xs font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 ${canValidate ? 'bg-transparent border border-eden-tan text-eden-tan hover:bg-eden-tan hover:text-white cursor-pointer' : 'bg-transparent border border-gray-300 text-gray-400 cursor-not-allowed opacity-60'}`}>
                          <Award size={14} /> Classer Élite
                        </button>
                      </>
                    ) : status === 'validated' ? (
                      <div className="col-span-2 space-y-2">
                        <button type="button" disabled={!canValidate}
                          onClick={() => canValidate && handleUpdateStatus(selectedCandidate._id, 'premium')}
                          className={`w-full text-xs font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 ${canValidate ? 'bg-transparent border border-eden-tan text-eden-tan hover:bg-eden-tan hover:text-white cursor-pointer' : 'bg-transparent border border-gray-300 text-gray-400 cursor-not-allowed opacity-60'}`}>
                          <Award size={14} /> Classer Élite
                        </button>
                        <button type="button" onClick={() => handleUpdateStatus(selectedCandidate._id, 'pending')}
                          className="w-full bg-transparent border border-eden-border text-eden-text-light hover:text-eden-orange hover:border-eden-orange/50 text-xs font-medium py-2.5 px-4 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5">
                          <X size={14} /> Suspendre
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => handleUpdateStatus(selectedCandidate._id, 'pending')}
                        className="col-span-2 w-full bg-transparent border border-eden-border text-eden-text-light hover:text-eden-orange hover:border-eden-orange/50 text-xs font-medium py-2.5 px-4 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5">
                        <X size={14} /> Suspendre
                      </button>
                    )}
                  </div>

                </div>
              );
            })() : (
              <div className="bg-eden-bg2/40 border border-eden-border border-dashed rounded-2xl p-10 text-center select-none sticky top-24">
                <UserCheck size={26} className="text-eden-text-light/50 mx-auto mb-3" />
                <p className="text-xs font-medium text-eden-text-light">
                  Sélectionnez un profil d'extra pour inspecter son dossier.
                </p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};