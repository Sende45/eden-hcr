import React, { useEffect, useState, useRef } from 'react';
import {
  Calendar,
  FileText,
  Euro,
  Briefcase,
  Clock,
  LogOut,
  Bell,
  SlidersHorizontal,
  Search,
  CheckCircle,
  ChevronRight,
  MapPin,
  Star,
  MessageSquare,
  Settings,
  BarChart2,
  Download,
  AlertCircle,
  Send,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserType {
  id?: string;
  _id?: string;
  prenom?: string;
  nom?: string;
  email?: string;
  role?: string;
  candidatRef?: string;
  etablissementRef?: string;
}

interface Mission {
  _id: string;
  posteRecherche?: string;
  titre?: string;
  poste?: string;
  briefing?: string;
  description?: string;
  lieu?: string;
  ville?: string;
  dateDebut?: string;
  dateFin?: string;
  dateDebutMission?: string;
  dateFinMission?: string;
  statut?: string;
  taux?: number;
  tauxHoraire?: number;
}

interface Contrat {
  _id: string;
  titre?: string;
  dateDebut?: string;
  dateFin?: string;
  statut?: string;
  poste?: string;
  etablissement?: string | { nom?: string; nomEtablissement?: string };
  mission?: { posteRecherche?: string } | string;
}

interface Paiement {
  _id: string;
  mois?: string;
  montant?: number;
  statut?: string;
  dateEmission?: string;
}

// ─── Messagerie : types channel ───────────────────────────────────────────────

interface ChannelMessage {
  _id: string;
  contenu: string;
  expediteurId?: string;
  createdAt?: string;
  lu?: boolean;
}

interface Channel {
  _id: string;
  nom?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  updatedAt?: string;
  messages: ChannelMessage[];
  participants?: string[];
  unreadCount?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const API = 'https://eden-hcr.onrender.com';

function getToken() {
  return localStorage.getItem('eden_token') || localStorage.getItem('token') || '';
}

function getLocalUser(): UserType {
  try {
    return JSON.parse(localStorage.getItem('eden_user') || '{}');
  } catch {
    return {};
  }
}

function authHeaders() {
  return {
    Authorization: `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  };
}

function getUserId(user: UserType): string {
  return user.id || user._id || user.candidatRef || '';
}

function titreContrat(c: Contrat): string {
  if (c.titre) return c.titre;
  if (c.poste) return c.poste;
  if (typeof c.mission === 'object' && c.mission?.posteRecherche) return c.mission.posteRecherche;
  return 'Contrat';
}

function nomEtabContrat(c: Contrat): string {
  if (!c.etablissement) return '';
  if (typeof c.etablissement === 'string') return c.etablissement;
  return c.etablissement.nom || c.etablissement.nomEtablissement || '';
}

function titreMission(m: Mission): string {
  return m.posteRecherche || m.titre || m.poste || 'Mission';
}

function channelLabel(ch: Channel, userId: string): string {
  if (ch.nom) return ch.nom;
  return 'Conversation EDÈN';
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ExtraDashboard = ({
  user: userProp,
  onLogout,
}: {
  user?: UserType;
  onLogout?: () => void;
}) => {
  const [user, setUser] = useState<UserType>(() => ({
    ...getLocalUser(),
    ...(userProp || {}),
  }));

  const [missions, setMissions]   = useState<Mission[]>([]);
  const [contrats, setContrats]   = useState<Contrat[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);

  // ── Messagerie ──────────────────────────────────────────────────────────────
  const [channels, setChannels]             = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [newMessage, setNewMessage]         = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sendError, setSendError]           = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── UI ──────────────────────────────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchQuery, setSearchQuery]     = useState('');
  const [applySuccess, setApplySuccess]   = useState<string | null>(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);

  // ─── Scroll to bottom des messages ────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChannel]);

  // ─── Chargement données ────────────────────────────────────────────────────
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError('Session expirée. Veuillez vous reconnecter.');
      setLoading(false);
      return;
    }

    const h = authHeaders();

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Profil frais
        const meRes = await fetch(`${API}/api/auth/me`, { headers: h });
        if (meRes.ok) {
          const { user: freshUser } = await meRes.json();
          setUser(prev => ({ ...prev, ...freshUser }));
        }

        // 2. Missions ouvertes
        const missionsRes = await fetch(`${API}/api/mission/ouvertes`, { headers: h });
        if (missionsRes.ok) {
          const json = await missionsRes.json();
          setMissions(Array.isArray(json) ? json : (json.data || []));
        }

        // 3. Contrats du candidat
        const userId = getUserId({ ...getLocalUser(), ...(userProp || {}) });
        if (userId) {
          const contratsRes = await fetch(`${API}/api/contrats/candidat/${userId}`, { headers: h });
          if (contratsRes.ok) {
            const json = await contratsRes.json();
            setContrats(Array.isArray(json) ? json : (json.data || json.contrats || []));
          }
        }

        // 4. Paiements
        try {
          const userId2 = getUserId({ ...getLocalUser(), ...(userProp || {}) });
          if (userId2) {
            const paiementsRes = await fetch(`${API}/api/paiements/candidat/${userId2}`, { headers: h });
            if (paiementsRes.ok) {
              const json = await paiementsRes.json();
              setPaiements(Array.isArray(json) ? json : (json.data || json.paiements || []));
            }
          }
        } catch { /* route pas encore dispo */ }

        // 5. Channels de messagerie
        await loadChannels(h);

      } catch (err) {
        console.error('[ExtraDashboard] loadData:', err);
        setError('Erreur de connexion au serveur EDÈN.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Chargement des channels ───────────────────────────────────────────────
  const loadChannels = async (h = authHeaders()) => {
    try {
      const res = await fetch(`${API}/api/messagerie/channels`, { headers: h });
      if (!res.ok) return;
      const json = await res.json();
      const raw: any[] = Array.isArray(json) ? json : (json.data || json.channels || []);

      const parsed: Channel[] = raw.map((ch: any) => {
        const msgs: ChannelMessage[] = (ch.messages || []).map((msg: any) => ({
          _id: msg._id,
          contenu: msg.contenu || '',
          expediteurId: msg.expediteurId,
          createdAt: msg.createdAt,
          lu: msg.lu ?? false,
        }));

        // Tri chronologique (plus ancien en premier pour affichage dans le fil)
        msgs.sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime());

        const unread = msgs.filter(m => !m.lu).length;

        return {
          _id: ch._id,
          nom: ch.nom,
          lastMessage: ch.lastMessage || msgs[msgs.length - 1]?.contenu || '',
          lastMessageAt: ch.lastMessageAt || ch.updatedAt || msgs[msgs.length - 1]?.createdAt,
          updatedAt: ch.updatedAt,
          messages: msgs,
          participants: ch.participants || [],
          unreadCount: unread,
        };
      });

      // Trier les channels par date du dernier message (plus récent en haut)
      parsed.sort((a, b) =>
        new Date(b.lastMessageAt ?? 0).getTime() - new Date(a.lastMessageAt ?? 0).getTime()
      );

      setChannels(parsed);

      // Mettre à jour le channel sélectionné si déjà ouvert
      if (selectedChannel) {
        const updated = parsed.find(c => c._id === selectedChannel._id);
        if (updated) setSelectedChannel(updated);
      }
    } catch {
      /* messagerie pas encore dispo */
    }
  };

  // ─── Envoi d'un message ────────────────────────────────────────────────────
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel) return;
    setSendingMessage(true);
    setSendError(null);

    try {
      const res = await fetch(
        `${API}/api/messagerie/channels/${selectedChannel._id}/messages`,
        {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ text: newMessage.trim() }),
        }
      );

      if (res.ok) {
        setNewMessage('');
        // Recharger les channels pour avoir le message à jour
        await loadChannels();
      } else {
        const err = await res.json().catch(() => ({}));
        setSendError(err.message || 'Erreur lors de l\'envoi.');
      }
    } catch {
      setSendError('Impossible de contacter le serveur.');
    } finally {
      setSendingMessage(false);
    }
  };

  // ─── Postuler à une mission ────────────────────────────────────────────────
  const handlePostuler = async (missionId: string) => {
    try {
      const res = await fetch(`${API}/api/mission/${missionId}/postuler`, {
        method: 'POST',
        headers: authHeaders(),
      });
      if (res.ok) {
        setApplySuccess(missionId);
        setTimeout(() => setApplySuccess(null), 4000);
      }
    } catch (err) {
      console.error('[ExtraDashboard] postuler:', err);
    }
  };

  // ─── Helpers UI ───────────────────────────────────────────────────────────
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const semaine = (() => {
    const now   = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    return Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  })();

  const filteredMissions = missions.filter(
    m =>
      !searchQuery ||
      titreMission(m).toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.briefing?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalUnread    = channels.reduce((s, c) => s + (c.unreadCount || 0), 0);
  const totalPaye      = paiements.reduce((s, p) => s + (p.montant || 0), 0);

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const formatTime = (d?: string) => {
    if (!d) return '';
    const date = new Date(d);
    const now  = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();
    if (isToday) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  const formatMontant = (n?: number) =>
    n != null ? `${n.toLocaleString('fr-FR')} €` : '—';

  // ─── Nav ──────────────────────────────────────────────────────────────────
  const navSections = [
    {
      label: 'PRINCIPAL',
      items: [
        { id: 'dashboard', label: 'Tableau de bord', icon: <BarChart2 size={16} /> },
        { id: 'missions',  label: 'Missions',        icon: <Star size={16} />, badge: missions.length },
      ],
    },
    {
      label: 'GESTION',
      items: [
        { id: 'planning',  label: 'Planning',  icon: <Calendar size={16} /> },
        { id: 'contrats',  label: 'Contrats',  icon: <FileText size={16} />, badge: contrats.length },
        { id: 'rapports',  label: 'Rapports',  icon: <BarChart2 size={16} /> },
        { id: 'paiements', label: 'Paiements', icon: <Euro size={16} /> },
      ],
    },
    {
      label: 'OUTILS',
      items: [
        { id: 'messagerie', label: 'Messagerie', icon: <MessageSquare size={16} />, badge: totalUnread || undefined },
        { id: 'parametres', label: 'Paramètres', icon: <Settings size={16} /> },
      ],
    },
  ];

  const getSectionTitle = () => {
    const all = navSections.flatMap(s => s.items);
    return all.find(i => i.id === activeSection)?.label || 'Tableau de bord';
  };

  const displayName = `${user?.prenom || ''} ${user?.nom || ''}`.trim() || 'Extra';
  const initiale    = user?.prenom?.[0]?.toUpperCase() || user?.nom?.[0]?.toUpperCase() || 'E';

  const currentUserId = getUserId(user);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex bg-[#F4F1EA]">

      {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
      <aside className="w-[260px] bg-[#073B4C] text-white flex flex-col fixed h-full z-20">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-[#C5A46D] flex items-center justify-center">
              <span className="text-[#073B4C] font-bold text-sm">E</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">EDÈN <span className="font-light">Group</span></h1>
              <p className="text-[10px] text-white/50 uppercase tracking-widest">Intérim HCR</p>
            </div>
          </div>
          <p className="text-[10px] text-white/40 mt-2">Flexibilité · Qualité · Simplicité</p>
        </div>

        <div className="mx-4 h-px bg-white/10 mb-2" />

        <nav className="flex-1 px-3 overflow-y-auto py-2">
          {navSections.map(section => (
            <div key={section.label} className="mb-5">
              <p className="text-[10px] tracking-[3px] text-[#C5A46D] px-3 mb-2">{section.label}</p>
              {section.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    if (item.id !== 'messagerie') setSelectedChannel(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl mb-0.5 transition-all text-sm ${
                    activeSection === item.id
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-white/60 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {item.icon}
                    {item.label}
                  </span>
                  {item.badge != null && item.badge > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                      item.id === 'messagerie'
                        ? 'bg-orange-400 text-white'
                        : 'bg-[#C5A46D] text-[#073B4C]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="mx-4 h-px bg-white/10 mb-3" />
        <div className="p-4 pt-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#C5A46D] flex items-center justify-center font-bold text-[#073B4C] text-sm flex-shrink-0">
              {initiale}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{displayName}</p>
              <p className="text-[11px] text-white/50">Extra EDÈN</p>
            </div>
            <button onClick={onLogout} className="text-white/40 hover:text-white transition-colors" title="Déconnexion">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────────────────────────── */}
      <div className="ml-[260px] flex-1 flex flex-col min-h-screen">

        {/* Header */}
        <header className="bg-white border-b border-[#E6DDD1] px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-[#073B4C]">{getSectionTitle()}</h1>
            <p className="text-sm text-gray-400 capitalize">{today} · Semaine {semaine}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-[#F4F1EA] rounded-xl text-sm text-gray-700 w-52 focus:outline-none focus:ring-2 focus:ring-[#073B4C]/20"
              />
            </div>
            <button className="relative w-9 h-9 rounded-xl bg-[#F4F1EA] flex items-center justify-center text-gray-500 hover:bg-[#E6DDD1] transition-colors">
              <Bell size={16} />
              {totalUnread > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-400 rounded-full" />
              )}
            </button>
            <button className="w-9 h-9 rounded-xl bg-[#F4F1EA] flex items-center justify-center text-gray-500 hover:bg-[#E6DDD1] transition-colors">
              <SlidersHorizontal size={16} />
            </button>
            <button
              onClick={() => setActiveSection('missions')}
              className="flex items-center gap-2 bg-[#073B4C] hover:bg-[#0A5268] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              + Voir missions
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8">

          {error && (
            <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-[#073B4C]/20 border-t-[#073B4C] rounded-full animate-spin" />
                Chargement de vos données…
              </div>
            </div>
          ) : (
            <>

              {/* ── TABLEAU DE BORD ── */}
              {activeSection === 'dashboard' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-4 gap-5">
                    {[
                      {
                        icon: <Star size={20} />,
                        value: missions.length,
                        label: 'Missions',
                        sub: 'disponibles',
                        action: () => setActiveSection('missions'),
                      },
                      {
                        icon: <Calendar size={20} />,
                        value: 0,
                        label: 'Planning',
                        sub: 'shifts',
                      },
                      {
                        icon: <FileText size={20} />,
                        value: contrats.length,
                        label: 'Contrats',
                        sub: 'signés',
                        action: () => setActiveSection('contrats'),
                      },
                      {
                        icon: <Euro size={20} />,
                        value: paiements.length || '—',
                        label: 'Fiches de paie',
                        sub: paiements.length ? 'disponibles' : 'à venir',
                        action: () => setActiveSection('paiements'),
                      },
                    ].map((kpi, i) => (
                      <div
                        key={i}
                        onClick={kpi.action}
                        className={`bg-white rounded-2xl border border-[#E6DDD1] p-5 ${
                          kpi.action ? 'cursor-pointer hover:border-[#073B4C]/30 hover:shadow-sm transition-all' : ''
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#F4EFE8] flex items-center justify-center text-[#073B4C] mb-4">
                          {kpi.icon}
                        </div>
                        <p className="text-3xl font-bold text-[#073B4C]">
                          {kpi.value}{' '}
                          <span className="text-base font-normal text-gray-400">{kpi.sub}</span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{kpi.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-5">
                    {/* Card profil */}
                    <div className="bg-white rounded-2xl border border-[#E6DDD1] p-6 flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#C5A46D] flex items-center justify-center font-bold text-[#073B4C] text-lg">
                          {initiale}
                        </div>
                        <div>
                          <p className="font-bold text-[#073B4C]">{displayName}</p>
                          <p className="text-xs text-gray-400">{user?.email}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Rôle</span>
                          <span className="font-medium text-[#073B4C] capitalize">{user?.role || 'Extra'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Missions dispo.</span>
                          <span className="font-medium text-[#073B4C]">{missions.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Contrats</span>
                          <span className="font-medium text-[#073B4C]">{contrats.length}</span>
                        </div>
                        {totalPaye > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Total perçu</span>
                            <span className="font-medium text-[#073B4C]">{formatMontant(totalPaye)}</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setActiveSection('parametres')}
                        className="mt-auto text-xs text-[#073B4C]/60 hover:text-[#073B4C] flex items-center gap-1 transition-colors"
                      >
                        <Settings size={12} /> Voir mon profil
                      </button>
                    </div>

                    {/* Missions récentes */}
                    <div className="col-span-2 bg-white rounded-2xl border border-[#E6DDD1] p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-[10px] tracking-[3px] text-[#C5A46D] uppercase mb-1">Opportunités</p>
                          <h2 className="font-bold text-[#073B4C]">Missions disponibles</h2>
                        </div>
                        <button
                          onClick={() => setActiveSection('missions')}
                          className="text-xs text-[#073B4C]/60 hover:text-[#073B4C] flex items-center gap-1"
                        >
                          Voir tout <ChevronRight size={12} />
                        </button>
                      </div>

                      {missions.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-[#E6DDD1] p-8 text-center">
                          <Briefcase className="mx-auto text-[#E6DDD1] mb-2" size={28} />
                          <p className="text-gray-400 text-sm">Aucune mission disponible.</p>
                          <p className="text-gray-300 text-xs mt-1">Revenez prochainement.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {missions.slice(0, 3).map(m => (
                            <div
                              key={m._id}
                              className="flex items-center justify-between rounded-xl border border-[#E6DDD1] px-4 py-3 hover:border-[#073B4C]/20 transition-all"
                            >
                              <div>
                                <p className="font-semibold text-sm text-[#073B4C]">{titreMission(m)}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {m.lieu || m.ville || ''}
                                  {(m.dateDebut || m.dateDebutMission) ? ` · ${formatDate(m.dateDebut || m.dateDebutMission)}` : ''}
                                </p>
                              </div>
                              {applySuccess === m._id ? (
                                <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                                  <CheckCircle size={13} /> Envoyée
                                </span>
                              ) : (
                                <button
                                  onClick={() => handlePostuler(m._id)}
                                  className="text-xs bg-[#073B4C] text-white px-3 py-1.5 rounded-lg hover:bg-[#0A5268] transition-colors"
                                >
                                  Postuler
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── MISSIONS ── */}
              {activeSection === 'missions' && (
                <div className="bg-white rounded-2xl border border-[#E6DDD1] p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-[10px] tracking-[3px] text-[#C5A46D] uppercase mb-1">Opportunités</p>
                      <h2 className="text-xl font-bold text-[#073B4C]">Missions disponibles</h2>
                    </div>
                    {filteredMissions.length > 0 && (
                      <span className="text-sm text-gray-400">
                        {filteredMissions.length} mission{filteredMissions.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {filteredMissions.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#E6DDD1] p-14 text-center">
                      <Briefcase className="mx-auto text-[#E6DDD1] mb-3" size={32} />
                      <p className="text-gray-400 text-sm">Aucune mission disponible actuellement.</p>
                      <p className="text-gray-300 text-xs mt-1">Revenez prochainement pour de nouvelles opportunités.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredMissions.map(m => (
                        <div
                          key={m._id}
                          className="rounded-xl border border-[#E6DDD1] p-5 hover:border-[#073B4C]/20 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-[#073B4C]">{titreMission(m)}</h3>
                                <span className="text-[10px] bg-[#F4EFE8] text-[#C5A46D] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">
                                  {m.statut || 'Disponible'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 leading-relaxed">
                                {m.briefing || m.description || ''}
                              </p>
                              <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                                {(m.lieu || m.ville) && (
                                  <span className="flex items-center gap-1">
                                    <MapPin size={11} /> {m.lieu || m.ville}
                                  </span>
                                )}
                                {(m.dateDebut || m.dateDebutMission) && (
                                  <span className="flex items-center gap-1">
                                    <Clock size={11} />
                                    {formatDate(m.dateDebut || m.dateDebutMission)}
                                    {(m.dateFin || m.dateFinMission)
                                      ? ` → ${formatDate(m.dateFin || m.dateFinMission)}`
                                      : ''}
                                  </span>
                                )}
                                {(m.taux || m.tauxHoraire) && (
                                  <span className="flex items-center gap-1">
                                    <Euro size={11} /> {m.taux || m.tauxHoraire} €/h
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              {applySuccess === m._id ? (
                                <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                                  <CheckCircle size={16} /> Candidature envoyée
                                </span>
                              ) : (
                                <button
                                  onClick={() => handlePostuler(m._id)}
                                  className="flex items-center gap-1.5 bg-[#073B4C] hover:bg-[#0A5268] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                                >
                                  Postuler <ChevronRight size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── PLANNING ── */}
              {activeSection === 'planning' && (
                <div className="bg-white rounded-2xl border border-[#E6DDD1] p-6">
                  <div className="mb-5">
                    <p className="text-[10px] tracking-[3px] text-[#C5A46D] uppercase mb-1">Calendrier</p>
                    <h2 className="text-xl font-bold text-[#073B4C]">Mon planning</h2>
                  </div>
                  <div className="rounded-xl border border-dashed border-[#E6DDD1] p-14 text-center">
                    <Calendar className="mx-auto text-[#E6DDD1] mb-3" size={32} />
                    <p className="text-gray-400 text-sm">Aucun shift planifié pour le moment.</p>
                    <p className="text-gray-300 text-xs mt-1">Vos shifts confirmés apparaîtront ici.</p>
                  </div>
                </div>
              )}

              {/* ── CONTRATS ── */}
              {activeSection === 'contrats' && (
                <div className="bg-white rounded-2xl border border-[#E6DDD1] p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-[10px] tracking-[3px] text-[#C5A46D] uppercase mb-1">Documents</p>
                      <h2 className="text-xl font-bold text-[#073B4C]">Mes contrats</h2>
                    </div>
                    {contrats.length > 0 && (
                      <span className="text-sm text-gray-400">
                        {contrats.length} contrat{contrats.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {contrats.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#E6DDD1] p-14 text-center">
                      <FileText className="mx-auto text-[#E6DDD1] mb-3" size={32} />
                      <p className="text-gray-400 text-sm">Aucun contrat disponible.</p>
                      <p className="text-gray-300 text-xs mt-1">Vos contrats signés apparaîtront ici.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {contrats.map(c => (
                        <div
                          key={c._id}
                          className="rounded-xl border border-[#E6DDD1] p-5 flex items-center justify-between hover:border-[#073B4C]/20 transition-all"
                        >
                          <div>
                            <p className="font-semibold text-[#073B4C]">{titreContrat(c)}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {nomEtabContrat(c) ? `${nomEtabContrat(c)} · ` : ''}
                              {formatDate(c.dateDebut)}
                              {c.dateFin ? ` → ${formatDate(c.dateFin)}` : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            {c.statut && (
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide ${
                                  c.statut === 'signé'
                                    ? 'bg-green-50 text-green-600'
                                    : c.statut === 'en attente'
                                    ? 'bg-yellow-50 text-yellow-600'
                                    : 'bg-[#F4EFE8] text-[#C5A46D]'
                                }`}
                              >
                                {c.statut}
                              </span>
                            )}
                            <button className="text-gray-400 hover:text-[#073B4C] transition-colors" title="Télécharger">
                              <Download size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── RAPPORTS ── */}
              {activeSection === 'rapports' && (
                <div className="bg-white rounded-2xl border border-[#E6DDD1] p-6">
                  <div className="mb-5">
                    <p className="text-[10px] tracking-[3px] text-[#C5A46D] uppercase mb-1">Synthèse</p>
                    <h2 className="text-xl font-bold text-[#073B4C]">Mes rapports</h2>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { label: 'Missions disponibles', value: missions.length },
                      { label: 'Contrats signés',       value: contrats.length },
                      { label: 'Total perçu',           value: totalPaye ? formatMontant(totalPaye) : '—' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-[#F4F1EA] rounded-xl p-5">
                        <p className="text-2xl font-bold text-[#073B4C]">{stat.value}</p>
                        <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border border-dashed border-[#E6DDD1] p-10 text-center">
                    <BarChart2 className="mx-auto text-[#E6DDD1] mb-3" size={32} />
                    <p className="text-gray-400 text-sm">Rapports détaillés à venir.</p>
                  </div>
                </div>
              )}

              {/* ── PAIEMENTS ── */}
              {activeSection === 'paiements' && (
                <div className="bg-white rounded-2xl border border-[#E6DDD1] p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-[10px] tracking-[3px] text-[#C5A46D] uppercase mb-1">Rémunération</p>
                      <h2 className="text-xl font-bold text-[#073B4C]">Mes fiches de paie</h2>
                    </div>
                    {paiements.length > 0 && (
                      <span className="text-sm text-gray-400">
                        {paiements.length} fiche{paiements.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {paiements.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#E6DDD1] p-14 text-center">
                      <Euro className="mx-auto text-[#E6DDD1] mb-3" size={32} />
                      <p className="text-gray-400 text-sm">Aucune fiche de paie disponible.</p>
                      <p className="text-gray-300 text-xs mt-1">
                        Cette section sera disponible une fois les routes de paiement activées.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {paiements.map(p => (
                        <div
                          key={p._id}
                          className="rounded-xl border border-[#E6DDD1] p-5 flex items-center justify-between hover:border-[#073B4C]/20 transition-all"
                        >
                          <div>
                            <p className="font-semibold text-[#073B4C]">{p.mois || formatDate(p.dateEmission)}</p>
                            <p className="text-xs text-gray-400 mt-1">{formatDate(p.dateEmission)}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="font-bold text-[#073B4C]">{formatMontant(p.montant)}</p>
                            {p.statut && (
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide ${
                                  p.statut === 'payé'
                                    ? 'bg-green-50 text-green-600'
                                    : 'bg-yellow-50 text-yellow-600'
                                }`}
                              >
                                {p.statut}
                              </span>
                            )}
                            <button className="text-gray-400 hover:text-[#073B4C] transition-colors" title="Télécharger">
                              <Download size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── MESSAGERIE ────────────────────────────────────────────────── */}
              {activeSection === 'messagerie' && (
                <div className="bg-white rounded-2xl border border-[#E6DDD1] overflow-hidden" style={{ height: 'calc(100vh - 160px)' }}>
                  <div className="flex h-full">

                    {/* ── Colonne gauche : liste des channels ── */}
                    <div className={`flex flex-col border-r border-[#E6DDD1] ${selectedChannel ? 'w-[300px]' : 'flex-1'} transition-all`}>

                      {/* Header liste */}
                      <div className="px-5 py-4 border-b border-[#E6DDD1] flex items-center justify-between flex-shrink-0">
                        <div>
                          <p className="text-[10px] tracking-[3px] text-[#C5A46D] uppercase mb-0.5">Communication</p>
                          <h2 className="font-bold text-[#073B4C] text-lg">Messagerie</h2>
                        </div>
                        {totalUnread > 0 && (
                          <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                            {totalUnread} non lu{totalUnread > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {/* Liste channels */}
                      <div className="flex-1 overflow-y-auto">
                        {channels.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
                            <MessageSquare className="text-[#E6DDD1] mb-3" size={32} />
                            <p className="text-gray-400 text-sm">Aucune conversation.</p>
                            <p className="text-gray-300 text-xs mt-1">
                              Vos échanges avec EDÈN apparaîtront ici.
                            </p>
                          </div>
                        ) : (
                          <div className="divide-y divide-[#F4F1EA]">
                            {channels.map(ch => {
                              const isActive = selectedChannel?._id === ch._id;
                              const hasUnread = (ch.unreadCount || 0) > 0;
                              return (
                                <button
                                  key={ch._id}
                                  onClick={() => setSelectedChannel(ch)}
                                  className={`w-full text-left px-5 py-4 flex items-start gap-3 transition-all ${
                                    isActive
                                      ? 'bg-[#073B4C]/5 border-l-2 border-l-[#073B4C]'
                                      : 'hover:bg-[#F4F1EA] border-l-2 border-l-transparent'
                                  }`}
                                >
                                  {/* Avatar channel */}
                                  <div className="w-10 h-10 rounded-full bg-[#073B4C] flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-white text-xs font-bold">E</span>
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                      <p className={`text-sm truncate ${hasUnread ? 'font-bold text-[#073B4C]' : 'font-medium text-gray-700'}`}>
                                        {channelLabel(ch, currentUserId)}
                                      </p>
                                      <span className="text-[10px] text-gray-400 flex-shrink-0">
                                        {formatTime(ch.lastMessageAt)}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                      <p className={`text-xs truncate ${hasUnread ? 'text-gray-600' : 'text-gray-400'}`}>
                                        {ch.lastMessage || 'Aucun message'}
                                      </p>
                                      {hasUnread && (
                                        <span className="flex-shrink-0 w-5 h-5 bg-orange-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                          {ch.unreadCount}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── Colonne droite : fil de messages ── */}
                    {selectedChannel ? (
                      <div className="flex-1 flex flex-col min-w-0">

                        {/* Header conversation */}
                        <div className="px-6 py-4 border-b border-[#E6DDD1] flex items-center gap-3 flex-shrink-0 bg-white">
                          <button
                            onClick={() => setSelectedChannel(null)}
                            className="text-gray-400 hover:text-[#073B4C] transition-colors mr-1 md:hidden"
                          >
                            <ArrowLeft size={18} />
                          </button>
                          <div className="w-9 h-9 rounded-full bg-[#073B4C] flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">E</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[#073B4C] truncate">
                              {channelLabel(selectedChannel, currentUserId)}
                            </p>
                            <p className="text-xs text-gray-400">
                              {selectedChannel.messages.length} message{selectedChannel.messages.length > 1 ? 's' : ''}
                            </p>
                          </div>
                          <button
                            onClick={() => loadChannels()}
                            className="text-gray-400 hover:text-[#073B4C] transition-colors text-xs flex items-center gap-1"
                            title="Actualiser"
                          >
                            <ChevronDown size={14} className="rotate-180" />
                          </button>
                        </div>

                        {/* Fil de messages */}
                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-[#FAFAF8]">
                          {selectedChannel.messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                              <MessageSquare className="text-[#E6DDD1] mb-3" size={28} />
                              <p className="text-gray-400 text-sm">Aucun message dans cette conversation.</p>
                              <p className="text-gray-300 text-xs mt-1">Envoyez le premier message ci-dessous.</p>
                            </div>
                          ) : (
                            <>
                              {selectedChannel.messages.map((msg, idx) => {
                                const isOwn = msg.expediteurId === currentUserId;
                                const showDate =
                                  idx === 0 ||
                                  new Date(msg.createdAt ?? 0).toDateString() !==
                                    new Date(selectedChannel.messages[idx - 1]?.createdAt ?? 0).toDateString();

                                return (
                                  <React.Fragment key={msg._id}>
                                    {showDate && (
                                      <div className="flex items-center gap-3 my-4">
                                        <div className="flex-1 h-px bg-[#E6DDD1]" />
                                        <span className="text-[10px] text-gray-400 flex-shrink-0">
                                          {new Date(msg.createdAt ?? 0).toLocaleDateString('fr-FR', {
                                            weekday: 'long', day: 'numeric', month: 'long',
                                          })}
                                        </span>
                                        <div className="flex-1 h-px bg-[#E6DDD1]" />
                                      </div>
                                    )}
                                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                        <div
                                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                            isOwn
                                              ? 'bg-[#073B4C] text-white rounded-br-md'
                                              : 'bg-white text-gray-800 border border-[#E6DDD1] rounded-bl-md shadow-sm'
                                          }`}
                                        >
                                          {msg.contenu}
                                        </div>
                                        <span className="text-[10px] text-gray-400 px-1">
                                          {formatTime(msg.createdAt)}
                                        </span>
                                      </div>
                                    </div>
                                  </React.Fragment>
                                );
                              })}
                              <div ref={messagesEndRef} />
                            </>
                          )}
                        </div>

                        {/* Zone de saisie */}
                        <div className="px-6 py-4 border-t border-[#E6DDD1] bg-white flex-shrink-0">
                          {sendError && (
                            <p className="text-xs text-red-500 mb-2 flex items-center gap-1">
                              <AlertCircle size={12} /> {sendError}
                            </p>
                          )}
                          <div className="flex items-end gap-3">
                            <textarea
                              value={newMessage}
                              onChange={e => setNewMessage(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendMessage();
                                }
                              }}
                              placeholder="Écrire un message… (Entrée pour envoyer)"
                              rows={1}
                              className="flex-1 resize-none bg-[#F4F1EA] rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#073B4C]/20 min-h-[44px] max-h-32"
                              style={{ lineHeight: '1.5' }}
                            />
                            <button
                              onClick={handleSendMessage}
                              disabled={!newMessage.trim() || sendingMessage}
                              className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#073B4C] hover:bg-[#0A5268] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all"
                              title="Envoyer"
                            >
                              {sendingMessage ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <Send size={16} />
                              )}
                            </button>
                          </div>
                          <p className="text-[10px] text-gray-300 mt-2 text-right">
                            Shift+Entrée pour aller à la ligne
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* Placeholder si aucun channel sélectionné */
                      <div className="flex-1 flex flex-col items-center justify-center bg-[#FAFAF8] text-center px-12">
                        <div className="w-16 h-16 rounded-2xl bg-[#F4EFE8] flex items-center justify-center mb-4">
                          <MessageSquare className="text-[#C5A46D]" size={28} />
                        </div>
                        <p className="font-semibold text-[#073B4C] mb-1">Sélectionnez une conversation</p>
                        <p className="text-sm text-gray-400">
                          Choisissez un échange dans la liste pour lire et répondre aux messages.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── PARAMÈTRES ── */}
              {activeSection === 'parametres' && (
                <div className="bg-white rounded-2xl border border-[#E6DDD1] p-6">
                  <div className="mb-6">
                    <p className="text-[10px] tracking-[3px] text-[#C5A46D] uppercase mb-1">Compte</p>
                    <h2 className="text-xl font-bold text-[#073B4C]">Paramètres</h2>
                  </div>
                  <div className="space-y-4 max-w-lg">
                    {[
                      { label: 'Prénom', value: user?.prenom },
                      { label: 'Nom',    value: user?.nom },
                      { label: 'Email',  value: user?.email },
                      { label: 'Rôle',   value: user?.role },
                    ].map((field, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-3 border-b border-[#E6DDD1]"
                      >
                        <span className="text-sm text-gray-500">{field.label}</span>
                        <span className="text-sm font-medium text-[#073B4C]">{field.value || '—'}</span>
                      </div>
                    ))}
                    <button
                      onClick={onLogout}
                      className="mt-4 flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors"
                    >
                      <LogOut size={14} /> Se déconnecter
                    </button>
                  </div>
                </div>
              )}

            </>
          )}
        </main>
      </div>

      {/* Bouton déconnexion flottant */}
      <button
        onClick={onLogout}
        className="fixed bottom-6 right-6 flex items-center gap-2 bg-[#073B4C] text-white/70 hover:text-white text-sm px-4 py-2.5 rounded-xl shadow-lg hover:bg-[#0A5268] transition-all"
      >
        <LogOut size={14} /> Déconnexion
      </button>

    </div>
  );
};