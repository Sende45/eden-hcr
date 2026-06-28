import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Building,
  Calendar,
  FileText,
  BarChart3,
  Coins,
  MessageSquare,
  Settings,
  ChevronRight,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';

import { type DashboardView } from '../types/navigation';

export type SidebarProps = {
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  userRole?: string;
};

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, userRole }) => {
  const [stats, setStats] = useState({ missions: 0, contrats: 0, messages: 0 });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('https://eden-hcr.onrender.com/api/admin/dashboard-stats', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setStats({
          missions: data.missions || 0,
          contrats: data.contrats || 0,
          messages: data.messages || 0
        });
      })
      .catch(console.error);
  }, []);

  // Fermer le menu mobile après navigation
  const handleNav = (view: DashboardView) => {
    onViewChange(view);
    setIsOpen(false);
  };

  const navContent = (
    <aside className="bg-eden-navy flex flex-col relative overflow-hidden h-full font-sans select-none">

      {/* CERCLES DÉCORATIFS */}
      <div className="absolute top-[-60px] right-[-60px] w-50 h-50 rounded-full border-[40px] border-[#b2976a]/8 pointer-events-none" />
      <div className="absolute bottom-[-80px] left-[-60px] w-60 h-60 rounded-full border-[40px] border-[#1d6b5a]/10 pointer-events-none" />

      {/* LOGO */}
      <div className="p-[28px_24px_22px] border-b border-[#b2976a]/20 relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-[38px] h-[38px] shrink-0">
            <img
              src="https://i.ibb.co/k63wFvcJ/Symbole3.png"
              alt="EDÈN Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="font-serif font-semibold text-xl text-white tracking-wider leading-none">
              ED<span className="text-eden-tan">È</span>N <span className="font-light text-white/75">Group</span>
            </div>
            <div className="text-[9px] text-[#b2976a]/70 tracking-[2.5px] font-medium uppercase mt-[3px]">
              Intérim HCR
            </div>
            <div className="text-[10px] text-white/40 tracking-wide font-light mt-[1px]">
              Flexibilité · Qualité · Simplicité
            </div>
          </div>
        </div>
        {/* Bouton fermeture mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden text-white/50 hover:text-white transition-colors border-none bg-transparent cursor-pointer p-1"
        >
          <X size={18} />
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="p-[22px_14px] flex-1 space-y-6 overflow-y-auto scrollbar-none relative z-10">

        {/* DIRECTION */}
        {userRole === 'superadmin' && (
          <div className="space-y-0.5">
            <div className="text-[9px] text-[#b2976a]/55 tracking-[3px] font-semibold uppercase px-2.5 mb-1.5">Direction</div>
            <button
              onClick={() => handleNav('superadmin')}
              className={`w-full flex items-center gap-2.5 p-[9px_12px] rounded-lg text-xs tracking-wide cursor-pointer border-none text-left transition-all
                ${currentView === 'superadmin' ? 'bg-[#b2976a]/18 text-eden-tan font-medium' : 'text-white/55 hover:bg-white/7 hover:text-white/90'}`}
            >
              <ShieldCheck size={16} className="opacity-90" /> Console SuperAdmin
            </button>
          </div>
        )}

        {/* PRINCIPAL */}
        <div className="space-y-0.5">
          <div className="text-[9px] text-[#b2976a]/55 tracking-[3px] font-semibold uppercase px-2.5 mb-1.5">Principal</div>

          {[
            { view: 'dashboard', icon: <LayoutDashboard size={16} />, label: 'Tableau de bord' },
            { view: 'missions', icon: <Briefcase size={16} />, label: 'Missions', badge: stats.missions, badgeColor: 'bg-eden-orange' },
            { view: 'candidates', icon: <Users size={16} />, label: 'Candidats' },
            { view: 'establishments', icon: <Building size={16} />, label: 'Établissements' },
          ].map(({ view, icon, label, badge, badgeColor }) => (
            <button
              key={view}
              onClick={() => handleNav(view as DashboardView)}
              className={`w-full flex items-center gap-2.5 p-[9px_12px] rounded-lg text-xs tracking-wide cursor-pointer border-none text-left transition-all
                ${currentView === view ? 'bg-[#b2976a]/18 text-eden-tan font-medium' : 'text-white/55 hover:bg-white/7 hover:text-white/90'}`}
            >
              <span className="opacity-90">{icon}</span>
              {label}
              {badge !== undefined && (
                <span className={`ml-auto ${badgeColor} text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full`}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* GESTION */}
        <div className="space-y-0.5">
          <div className="text-[9px] text-[#b2976a]/55 tracking-[3px] font-semibold uppercase px-2.5 mb-1.5">Gestion</div>

          {[
            { view: 'planning', icon: <Calendar size={16} />, label: 'Planning' },
            { view: 'contracts', icon: <FileText size={16} />, label: 'Contrats', badge: stats.contrats, badgeColor: 'bg-eden-teal' },
            { view: 'reports', icon: <BarChart3 size={16} />, label: 'Rapports' },
            { view: 'payments', icon: <Coins size={16} />, label: 'Paiements' },
          ].map(({ view, icon, label, badge, badgeColor }) => (
            <button
              key={view}
              onClick={() => handleNav(view as DashboardView)}
              className={`w-full flex items-center gap-2.5 p-[9px_12px] rounded-lg text-xs tracking-wide cursor-pointer border-none text-left transition-all
                ${currentView === view ? 'bg-[#b2976a]/18 text-eden-tan font-medium' : 'text-white/55 hover:bg-white/7 hover:text-white/90'}`}
            >
              <span className="opacity-90">{icon}</span>
              {label}
              {badge !== undefined && (
                <span className={`ml-auto ${badgeColor} text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full`}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* OUTILS */}
        <div className="space-y-0.5">
          <div className="text-[9px] text-[#b2976a]/55 tracking-[3px] font-semibold uppercase px-2.5 mb-1.5">Outils</div>
          <button
            onClick={() => handleNav('messages')}
            className={`w-full flex items-center gap-2.5 p-[9px_12px] rounded-lg text-xs tracking-wide cursor-pointer border-none text-left transition-all
              ${currentView === 'messages' ? 'bg-[#b2976a]/18 text-eden-tan font-medium' : 'text-white/55 hover:bg-white/7 hover:text-white/90'}`}
          >
            <MessageSquare size={16} className="opacity-90" /> Messagerie
          </button>
          <button className="w-full flex items-center gap-2.5 p-[9px_12px] rounded-lg text-white/55 hover:bg-white/7 hover:text-white/90 text-xs tracking-wide cursor-pointer transition-all border-none text-left">
            <Settings size={16} className="opacity-90" /> Paramètres
          </button>
        </div>
      </nav>

      {/* FOOTER USER */}
      <div className="p-[16px_14px] border-t border-[#b2976a]/15 relative z-10">
        <div className="flex items-center gap-2.5 p-[10px_12px] rounded-xl hover:bg-white/6 cursor-pointer transition-colors group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-eden-teal to-eden-sage flex items-center justify-center text-xs font-semibold text-white border-2 border-[#b2976a]/30 shrink-0">
            ST
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-white/85 truncate">Samuel Tam</div>
            <div className="text-[11px] text-white/35 font-light mt-[1px] truncate">Responsable agence</div>
          </div>
          <ChevronRight size={13} className="text-white/25 ml-auto group-hover:text-white/60 transition-colors" />
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* ── BOUTON HAMBURGER MOBILE ── */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-eden-navy text-white p-2.5 rounded-xl shadow-lg border border-[#b2976a]/20 cursor-pointer"
      >
        <Menu size={18} />
      </button>

      {/* ── SIDEBAR DESKTOP ── visible en permanence ≥ lg */}
      <div className="hidden lg:flex w-60 min-h-screen shrink-0">
        {navContent}
      </div>

      {/* ── SIDEBAR MOBILE ── drawer avec overlay */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          {/* Drawer */}
          <div className="lg:hidden fixed top-0 left-0 h-full w-72 z-50 shadow-2xl">
            {navContent}
          </div>
        </>
      )}
    </>
  );
};