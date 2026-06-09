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
  Star
} from 'lucide-react';

export const ExtraDashboard = ({ user, onLogout }: any) => {
  const [missions, setMissions] = useState<any[]>([]);
  const [contrats, setContrats] = useState<any[]>([]);
  const [paiements, setPaiements] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [applySuccess, setApplySuccess] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('eden_token');

    const loadData = async () => {
      try {
        const [missionsRes, contratsRes, paiementsRes] = await Promise.all([
          fetch('https://eden-hcr.onrender.com/api/mission', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('https://eden-hcr.onrender.com/api/contrats', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('https://eden-hcr.onrender.com/api/paiements', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (missionsRes.ok) setMissions(await missionsRes.json());
        if (contratsRes.ok) setContrats(await contratsRes.json());
        if (paiementsRes.ok) setPaiements(await paiementsRes.json());
      } catch (err) {
        console.error(err);
      }
    };

    loadData();
  }, []);

  const handlePostuler = async (missionId: string) => {
    const token = localStorage.getItem('eden_token');
    try {
      const res = await fetch(
        `https://eden-hcr.onrender.com/api/mission/${missionId}/postuler`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (res.ok) {
        setApplySuccess(missionId);
        setTimeout(() => setApplySuccess(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const semaine = (() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    return Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  })();

  const filteredMissions = missions.filter(
    (m) =>
      !searchQuery ||
      m.posteRecherche?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.briefing?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: <Briefcase size={16} />, section: 'PRINCIPAL' },
    { id: 'missions', label: 'Missions', icon: <Star size={16} />, badge: missions.length, section: 'PRINCIPAL' },
    { id: 'planning', label: 'Planning', icon: <Calendar size={16} />, section: 'GESTION' },
    { id: 'contrats', label: 'Contrats', icon: <FileText size={16} />, badge: contrats.length, section: 'GESTION' },
    { id: 'paiements', label: 'Paiements', icon: <Euro size={16} />, section: 'GESTION' }
  ];

  const sections = ['PRINCIPAL', 'GESTION'];

  return (
    <div className="min-h-screen flex bg-[#F4F1EA]">

      {/* SIDEBAR */}
      <aside className="w-[260px] bg-[#073B4C] text-white flex flex-col fixed h-full z-10">

        {/* Logo */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-[#C5A46D] flex items-center justify-center">
              <span className="text-[#073B4C] font-bold text-sm">E</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide text-white">EDÈN</h1>
              <p className="text-[10px] text-white/50 uppercase tracking-widest">Intérim HCR</p>
            </div>
          </div>
          <p className="text-[10px] text-white/40 mt-2 leading-relaxed">
            Flexibilité · Qualité · Simplicité
          </p>
        </div>

        <div className="mx-4 h-px bg-white/10 mb-4" />

        {/* Navigation */}
        <nav className="flex-1 px-3 overflow-y-auto">
          {sections.map((section) => (
            <div key={section} className="mb-4">
              <p className="text-[10px] tracking-[3px] text-[#C5A46D] px-3 mb-2">{section}</p>
              {navItems
                .filter((item) => item.section === section)
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl mb-1 transition-all text-sm ${
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
                      <span className="bg-[#C5A46D] text-[#073B4C] text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="mx-4 h-px bg-white/10 mb-4" />
        <div className="p-4 pt-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#C5A46D] flex items-center justify-center font-bold text-[#073B4C] text-sm flex-shrink-0">
              {user?.prenom?.[0] || 'E'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-[11px] text-white/50">Extra EDÈN</p>
            </div>
            <button
              onClick={onLogout}
              className="text-white/40 hover:text-white transition-colors"
              title="Déconnexion"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="ml-[260px] flex-1 flex flex-col min-h-screen">

        {/* TOP HEADER */}
        <header className="bg-white border-b border-[#E6DDD1] px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-[#073B4C]">Tableau de bord</h1>
            <p className="text-sm text-gray-400 capitalize">
              {today} · Semaine {semaine}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une mission..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-[#F4F1EA] rounded-xl text-sm text-gray-700 w-56 focus:outline-none focus:ring-2 focus:ring-[#073B4C]/20"
              />
            </div>

            <button className="relative w-9 h-9 rounded-xl bg-[#F4F1EA] flex items-center justify-center text-gray-500 hover:bg-[#E6DDD1] transition-colors">
              <Bell size={16} />
              {missions.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C5A46D] rounded-full" />
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

        {/* PAGE CONTENT */}
        <main className="flex-1 p-8">

          {/* KPI CARDS */}
          <div className="grid grid-cols-4 gap-5 mb-8">
            {[
              { icon: <User size={20} />, value: '1', label: 'Brigade Extras', sub: 'actifs' },
              { icon: <Briefcase size={20} />, value: missions.length.toString(), label: 'Missions', sub: 'disponibles' },
              { icon: <FileText size={20} />, value: contrats.length.toString(), label: 'Contrats', sub: 'signés' },
              { icon: <Euro size={20} />, value: paiements.length.toString(), label: 'Fiches de paie', sub: 'disponibles' }
            ].map((kpi, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E6DDD1] p-5">
                <div className="w-10 h-10 rounded-xl bg-[#F4EFE8] flex items-center justify-center text-[#073B4C] mb-4">
                  {kpi.icon}
                </div>
                <p className="text-3xl font-bold text-[#073B4C]">{kpi.value} <span className="text-base font-normal text-gray-400">{kpi.sub}</span></p>
                <p className="text-sm text-gray-500 mt-1">{kpi.label}</p>
              </div>
            ))}
          </div>

          {/* MISSIONS LIST */}
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
              <div className="rounded-xl border border-dashed border-[#E6DDD1] p-12 text-center">
                <Briefcase className="mx-auto text-[#E6DDD1] mb-3" size={32} />
                <p className="text-gray-400 text-sm">Aucune mission disponible actuellement.</p>
                <p className="text-gray-300 text-xs mt-1">Revenez prochainement pour de nouvelles opportunités.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMissions.map((mission: any) => (
                  <div
                    key={mission._id}
                    className="rounded-xl border border-[#E6DDD1] p-5 hover:border-[#073B4C]/20 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[#073B4C]">{mission.posteRecherche}</h3>
                          <span className="text-[10px] bg-[#F4EFE8] text-[#C5A46D] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">
                            Disponible
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed">{mission.briefing}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                          {mission.lieu && (
                            <span className="flex items-center gap-1">
                              <MapPin size={11} /> {mission.lieu}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> Mission disponible
                          </span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {applySuccess === mission._id ? (
                          <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                            <CheckCircle size={16} /> Candidature envoyée
                          </span>
                        ) : (
                          <button
                            onClick={() => handlePostuler(mission._id)}
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

        </main>
      </div>

      {/* DÉCONNEXION flottante */}
      <button
        onClick={onLogout}
        className="fixed bottom-6 right-6 flex items-center gap-2 bg-[#073B4C] text-white/70 hover:text-white text-sm px-4 py-2.5 rounded-xl shadow-lg hover:bg-[#0A5268] transition-all"
      >
        <LogOut size={14} /> Déconnexion
      </button>

    </div>
  );
};