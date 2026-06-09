import React, { useEffect, useState } from 'react';
import {
  Calendar,
  FileText,
  Euro,
  Briefcase,
  User,
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
  ExternalLink
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserType {
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
  briefing?: string;
  lieu?: string;
  dateDebut?: string;
  dateFin?: string;
  statut?: string;
  taux?: number;
}

interface Contrat {
  _id: string;
  titre?: string;
  dateDebut?: string;
  dateFin?: string;
  statut?: string;
  poste?: string;
  etablissement?: string;
}

interface Paiement {
  _id: string;
  mois?: string;
  montant?: number;
  statut?: string;
  dateEmission?: string;
}

interface Message {
  _id: string;
  sujet?: string;
  contenu?: string;
  expediteur?: string;
  createdAt?: string;
  lu?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const ExtraDashboard = ({ user, onLogout }: { user: UserType; onLogout?: () => void }) => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [contrats, setContrats] = useState<Contrat[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [applySuccess, setApplySuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API = 'https://eden-hcr.onrender.com';

  // ─── Chargement données ──────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('eden_token');
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [missionsRes, contratsRes, paiementsRes, messagesRes] = await Promise.all([
          fetch(`${API}/api/mission`, { headers }),
          fetch(`${API}/api/contrats`, { headers }),
          fetch(`${API}/api/paiements`, { headers }),
          fetch(`${API}/api/messagerie`, { headers })
        ]);

        if (missionsRes.ok) {
          const data = await missionsRes.json();
          setMissions(Array.isArray(data) ? data : data.missions || []);
        }
        if (contratsRes.ok) {
          const data = await contratsRes.json();
          setContrats(Array.isArray(data) ? data : data.contrats || []);
        }
        if (paiementsRes.ok) {
          const data = await paiementsRes.json();
          setPaiements(Array.isArray(data) ? data : data.paiements || []);
        }
        if (messagesRes.ok) {
          const data = await messagesRes.json();
          setMessages(Array.isArray(data) ? data : data.messages || []);
        }
      } catch (err) {
        console.error(err);
        setError('Erreur de connexion au serveur EDÈN.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ─── Postuler à une mission ──────────────────────────────────────────────────
  const handlePostuler = async (missionId: string) => {
    const token = localStorage.getItem('eden_token');
    try {
      const res = await fetch(`${API}/api/mission/${missionId}/postuler`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        setApplySuccess(missionId);
        setTimeout(() => setApplySuccess(null), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const semaine = (() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    return Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  })();

  const filteredMissions = missions.filter(m =>
    !searchQuery ||
    m.posteRecherche?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.briefing?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const messagesNonLus = messages.filter(m => !m.lu).length;

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const formatMontant = (n?: number) =>
    n != null ? `${n.toLocaleString('fr-FR')} €` : '—';

  // ─── Nav config ──────────────────────────────────────────────────────────────
  const navSections = [
    {
      label: 'PRINCIPAL',
      items: [
        { id: 'dashboard', label: 'Tableau de bord', icon: <BarChart2 size={16} /> },
        { id: 'missions', label: 'Missions', icon: <Star size={16} />, badge: missions.length }
      ]
    },
    {
      label: 'GESTION',
      items: [
        { id: 'planning', label: 'Planning', icon: <Calendar size={16} /> },
        { id: 'contrats', label: 'Contrats', icon: <FileText size={16} />, badge: contrats.length },
        { id: 'rapports', label: 'Rapports', icon: <BarChart2 size={16} /> },
        { id: 'paiements', label: 'Paiements', icon: <Euro size={16} /> }
      ]
    },
    {
      label: 'OUTILS',
      items: [
        { id: 'messagerie', label: 'Messagerie', icon: <MessageSquare size={16} />, badge: messagesNonLus },
        { id: 'parametres', label: 'Paramètres', icon: <Settings size={16} /> }
      ]
    }
  ];

  // ─── Section title helper ────────────────────────────────────────────────────
  const getSectionTitle = () => {
    const all = navSections.flatMap(s => s.items);
    return all.find(i => i.id === activeSection)?.label || 'Tableau de bord';
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex bg-[#F4F1EA]">

      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <aside className="w-[260px] bg-[#073B4C] text-white flex flex-col fixed h-full z-20">

        {/* Logo */}
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

        {/* Navigation */}
        <nav className="flex-1 px-3 overflow-y-auto py-2">
          {navSections.map(section => (
            <div key={section.label} className="mb-5">
              <p className="text-[10px] tracking-[3px] text-[#C5A46D] px-3 mb-2">{section.label}</p>
              {section.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
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

        {/* User footer */}
        <div className="mx-4 h-px bg-white/10 mb-3" />
        <div className="p-4 pt-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#C5A46D] flex items-center justify-center font-bold text-[#073B4C] text-sm flex-shrink-0">
              {user?.prenom?.[0]?.toUpperCase() || 'E'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.prenom} {user?.nom}</p>
              <p className="text-[11px] text-white/50">Extra EDÈN</p>
            </div>
            <button onClick={onLogout} className="text-white/40 hover:text-white transition-colors" title="Déconnexion">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────────────────────────────── */}
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
              {messagesNonLus > 0 && (
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

          {/* Error banner */}
          {error && (
            <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Loading */}
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

                  {/* KPIs */}
                  <div className="grid grid-cols-4 gap-5">
                    {[
                      { icon: <Star size={20} />, value: missions.length, label: 'Missions', sub: 'disponibles', action: () => setActiveSection('missions') },
                      { icon: <Calendar size={20} />, value: 0, label: 'Planning', sub: 'shifts' },
                      { icon: <FileText size={20} />, value: contrats.length, label: 'Contrats', sub: 'signés', action: () => setActiveSection('contrats') },
                      { icon: <Euro size={20} />, value: paiements.length, label: 'Fiches de paie', sub: 'disponibles', action: () => setActiveSection('paiements') }
                    ].map((kpi, i) => (
                      <div
                        key={i}
                        onClick={kpi.action}
                        className={`bg-white rounded-2xl border border-[#E6DDD1] p-5 ${kpi.action ? 'cursor-pointer hover:border-[#073B4C]/30 hover:shadow-sm transition-all' : ''}`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#F4EFE8] flex items-center justify-center text-[#073B4C] mb-4">
                          {kpi.icon}
                        </div>
                        <p className="text-3xl font-bold text-[#073B4C]">
                          {kpi.value} <span className="text-base font-normal text-gray-400">{kpi.sub}</span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{kpi.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Bienvenue + Missions récentes côte à côte */}
                  <div className="grid grid-cols-3 gap-5">

                    {/* Card profil */}
                    <div className="bg-white rounded-2xl border border-[#E6DDD1] p-6 flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#C5A46D] flex items-center justify-center font-bold text-[#073B4C] text-lg">
                          {user?.prenom?.[0]?.toUpperCase() || 'E'}
                        </div>
                        <div>
                          <p className="font-bold text-[#073B4C]">{user?.prenom} {user?.nom}</p>
                          <p className="text-xs text-gray-400">{user?.email}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Rôle</span>
                          <span className="font-medium text-[#073B4C] capitalize">{user?.role || 'Extra'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Missions actives</span>
                          <span className="font-medium text-[#073B4C]">{missions.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Contrats</span>
                          <span className="font-medium text-[#073B4C]">{contrats.length}</span>
                        </div>
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
                        <button onClick={() => setActiveSection('missions')} className="text-xs text-[#073B4C]/60 hover:text-[#073B4C] flex items-center gap-1">
                          Voir tout <ChevronRight size={12} />
                        </button>
                      </div>

                      {missions.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-[#E6DDD1] p-8 text-center">
                          <Briefcase className="mx-auto text-[#E6DDD1] mb-2" size={28} />
                          <p className="text-gray-400 text-sm">Aucune mission disponible.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {missions.slice(0, 3).map(m => (
                            <div key={m._id} className="flex items-center justify-between rounded-xl border border-[#E6DDD1] px-4 py-3 hover:border-[#073B4C]/20 transition-all">
                              <div>
                                <p className="font-semibold text-sm text-[#073B4C]">{m.posteRecherche || 'Mission'}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{m.lieu || ''} {m.dateDebut ? `· ${formatDate(m.dateDebut)}` : ''}</p>
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
                      <span className="text-sm text-gray-400">{filteredMissions.length} mission{filteredMissions.length > 1 ? 's' : ''}</span>
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
                        <div key={m._id} className="rounded-xl border border-[#E6DDD1] p-5 hover:border-[#073B4C]/20 hover:shadow-sm transition-all">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-[#073B4C]">{m.posteRecherche || 'Mission'}</h3>
                                <span className="text-[10px] bg-[#F4EFE8] text-[#C5A46D] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">
                                  {m.statut || 'Disponible'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 leading-relaxed">{m.briefing}</p>
                              <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                                {m.lieu && <span className="flex items-center gap-1"><MapPin size={11} /> {m.lieu}</span>}
                                {m.dateDebut && <span className="flex items-center gap-1"><Clock size={11} /> {formatDate(m.dateDebut)}{m.dateFin ? ` → ${formatDate(m.dateFin)}` : ''}</span>}
                                {m.taux && <span className="flex items-center gap-1"><Euro size={11} /> {m.taux} €/h</span>}
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
                    {contrats.length > 0 && <span className="text-sm text-gray-400">{contrats.length} contrat{contrats.length > 1 ? 's' : ''}</span>}
                  </div>

                  {contrats.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#E6DDD1] p-14 text-center">
                      <FileText className="mx-auto text-[#E6DDD1] mb-3" size={32} />
                      <p className="text-gray-400 text-sm">Aucun contrat disponible.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {contrats.map(c => (
                        <div key={c._id} className="rounded-xl border border-[#E6DDD1] p-5 flex items-center justify-between hover:border-[#073B4C]/20 transition-all">
                          <div>
                            <p className="font-semibold text-[#073B4C]">{c.titre || c.poste || 'Contrat'}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {c.etablissement ? `${c.etablissement} · ` : ''}
                              {formatDate(c.dateDebut)}{c.dateFin ? ` → ${formatDate(c.dateFin)}` : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            {c.statut && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide ${
                                c.statut === 'signé' ? 'bg-green-50 text-green-600' :
                                c.statut === 'en attente' ? 'bg-yellow-50 text-yellow-600' :
                                'bg-[#F4EFE8] text-[#C5A46D]'
                              }`}>
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
                      { label: 'Missions effectuées', value: missions.length },
                      { label: 'Heures travaillées', value: '—' },
                      { label: 'Montant total perçu', value: paiements.reduce((s, p) => s + (p.montant || 0), 0) ? formatMontant(paiements.reduce((s, p) => s + (p.montant || 0), 0)) : '—' }
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
                    {paiements.length > 0 && <span className="text-sm text-gray-400">{paiements.length} fiche{paiements.length > 1 ? 's' : ''}</span>}
                  </div>

                  {paiements.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#E6DDD1] p-14 text-center">
                      <Euro className="mx-auto text-[#E6DDD1] mb-3" size={32} />
                      <p className="text-gray-400 text-sm">Aucune fiche de paie disponible.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {paiements.map(p => (
                        <div key={p._id} className="rounded-xl border border-[#E6DDD1] p-5 flex items-center justify-between hover:border-[#073B4C]/20 transition-all">
                          <div>
                            <p className="font-semibold text-[#073B4C]">{p.mois || formatDate(p.dateEmission)}</p>
                            <p className="text-xs text-gray-400 mt-1">{formatDate(p.dateEmission)}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="font-bold text-[#073B4C]">{formatMontant(p.montant)}</p>
                            {p.statut && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide ${
                                p.statut === 'payé' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                              }`}>
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

              {/* ── MESSAGERIE ── */}
              {activeSection === 'messagerie' && (
                <div className="bg-white rounded-2xl border border-[#E6DDD1] p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-[10px] tracking-[3px] text-[#C5A46D] uppercase mb-1">Communication</p>
                      <h2 className="text-xl font-bold text-[#073B4C]">Messagerie</h2>
                    </div>
                    {messagesNonLus > 0 && (
                      <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full">
                        {messagesNonLus} non lu{messagesNonLus > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {messages.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#E6DDD1] p-14 text-center">
                      <MessageSquare className="mx-auto text-[#E6DDD1] mb-3" size={32} />
                      <p className="text-gray-400 text-sm">Aucun message pour le moment.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {messages.map(m => (
                        <div key={m._id} className={`rounded-xl border px-4 py-3 flex items-start gap-3 hover:border-[#073B4C]/20 transition-all ${!m.lu ? 'border-[#073B4C]/20 bg-[#F4F1EA]' : 'border-[#E6DDD1]'}`}>
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!m.lu ? 'bg-orange-400' : 'bg-transparent'}`} />
                          <div className="flex-1">
                            <p className={`text-sm ${!m.lu ? 'font-semibold text-[#073B4C]' : 'text-gray-600'}`}>{m.sujet || 'Message'}</p>
                            <p className="text-xs text-gray-400 mt-0.5 truncate">{m.contenu}</p>
                          </div>
                          <p className="text-xs text-gray-400 flex-shrink-0">{formatDate(m.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  )}
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
                      { label: 'Nom', value: user?.nom },
                      { label: 'Email', value: user?.email },
                      { label: 'Rôle', value: user?.role }
                    ].map((field, i) => (
                      <div key={i} className="flex items-center justify-between py-3 border-b border-[#E6DDD1]">
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