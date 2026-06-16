import React from 'react';
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
  ShieldCheck 
} from 'lucide-react';
import { type DashboardView } from '../types/navigation';

export type SidebarProps = {
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  userRole?: string; 
};

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, userRole }) => {
  return (
    <aside className="bg-eden-navy w-60 flex flex-col relative overflow-hidden min-h-screen font-sans select-none shrink-0">
      
      {/* CERCLES DE FOND DÉCORATIFS */}
      <div className="absolute top-[-60px] right-[-60px] w-50 h-50 rounded-full border-[40px] border-[#b2976a]/8 pointer-events-none" />
      <div className="absolute bottom-[-80px] left-[-60px] w-60 h-60 rounded-full border-[40px] border-[#1d6b5a]/10 pointer-events-none" />
      
      {/* ZONE LOGO */}
      <div className="p-[28px_24px_22px] border-b border-[#b2976a]/20 relative z-10">
        <div className="flex items-center gap-3">
          {/* SYMBOLE MIS À JOUR */}
          <div className="w-[38px] h-[38px] shrink-0">
            <img 
              src="https://i.ibb.co/5XF5Db6B/symbole1.png" 
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
      </div>

      {/* NAVIGATION INTERACTIVE */}
      <nav className="p-[22px_14px] flex-1 space-y-6 overflow-y-auto scrollbar-none relative z-10">
        
        {/* SECTION DIRECTION */}
        {userRole === 'superadmin' && (
          <div className="space-y-0.5">
            <div className="text-[9px] text-[#b2976a]/55 tracking-[3px] font-semibold uppercase px-2.5 mb-1.5">Direction</div>
            <button 
              onClick={() => onViewChange('superadmin')}
              className={`w-full flex items-center gap-2.5 p-[9px_12px] rounded-lg text-xs tracking-wide cursor-pointer border-none text-left transition-all
                ${currentView === 'superadmin' ? 'bg-[#b2976a]/18 text-eden-tan font-medium' : 'text-white/55 hover:bg-white/7 hover:text-white/90'}`}
            >
              <ShieldCheck size={16} className="opacity-90" /> Console SuperAdmin
            </button>
          </div>
        )}
        
        {/* SECTION PRINCIPAL */}
        <div className="space-y-0.5">
          <div className="text-[9px] text-[#b2976a]/55 tracking-[3px] font-semibold uppercase px-2.5 mb-1.5">Principal</div>
          
          <button 
            onClick={() => onViewChange('dashboard')}
            className={`w-full flex items-center gap-2.5 p-[9px_12px] rounded-lg text-xs tracking-wide cursor-pointer border-none text-left transition-all
              ${currentView === 'dashboard' ? 'bg-[#b2976a]/18 text-eden-tan font-medium' : 'text-white/55 hover:bg-white/7 hover:text-white/90'}`}
          >
            <LayoutDashboard size={16} className="opacity-90" /> Tableau de bord
          </button>
          
          <button 
            onClick={() => onViewChange('missions')}
            className={`w-full flex items-center gap-2.5 p-[9px_12px] rounded-lg text-xs tracking-wide cursor-pointer border-none text-left transition-all
              ${currentView === 'missions' ? 'bg-[#b2976a]/18 text-eden-tan font-medium' : 'text-white/55 hover:bg-white/7 hover:text-white/90'}`}
          >
            <Briefcase size={16} className="opacity-90" /> Missions 
            <span className="ml-auto bg-eden-orange text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">12</span>
          </button>
          
          <button 
            onClick={() => onViewChange('candidates')}
            className={`w-full flex items-center gap-2.5 p-[9px_12px] rounded-lg text-xs tracking-wide cursor-pointer border-none text-left transition-all
              ${currentView === 'candidates' ? 'bg-[#b2976a]/18 text-eden-tan font-medium' : 'text-white/55 hover:bg-white/7 hover:text-white/90'}`}
          >
            <Users size={16} className="opacity-90" /> Candidats
          </button>
          
          <button 
            onClick={() => onViewChange('establishments')}
            className={`w-full flex items-center gap-2.5 p-[9px_12px] rounded-lg text-xs tracking-wide cursor-pointer border-none text-left transition-all
              ${currentView === 'establishments' ? 'bg-[#b2976a]/18 text-eden-tan font-medium' : 'text-white/55 hover:bg-white/7 hover:text-white/90'}`}
          >
            <Building size={16} className="opacity-90" /> Établissements
          </button>
        </div>

        {/* SECTION GESTION */}
        <div className="space-y-0.5">
          <div className="text-[9px] text-[#b2976a]/55 tracking-[3px] font-semibold uppercase px-2.5 mb-1.5">Gestion</div>
          
          <button 
            onClick={() => onViewChange('planning')}
            className={`w-full flex items-center gap-2.5 p-[9px_12px] rounded-lg text-xs tracking-wide cursor-pointer border-none text-left transition-all
              ${currentView === 'planning' ? 'bg-[#b2976a]/18 text-eden-tan font-medium' : 'text-white/55 hover:bg-white/7 hover:text-white/90'}`}
          >
            <Calendar size={16} className="opacity-90" /> Planning
          </button>
          
          <button 
            onClick={() => onViewChange('contracts')}
            className={`w-full flex items-center gap-2.5 p-[9px_12px] rounded-lg text-xs tracking-wide cursor-pointer border-none text-left transition-all
              ${currentView === 'contracts' ? 'bg-[#b2976a]/18 text-eden-tan font-medium' : 'text-white/55 hover:bg-white/7 hover:text-white/90'}`}
          >
            <FileText size={16} className="opacity-90" /> Contrats
            <span className="ml-auto bg-eden-teal text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">3</span>
          </button>
          
          <button 
            onClick={() => onViewChange('reports')}
            className={`w-full flex items-center gap-2.5 p-[9px_12px] rounded-lg text-xs tracking-wide cursor-pointer border-none text-left transition-all
              ${currentView === 'reports' ? 'bg-[#b2976a]/18 text-eden-tan font-medium' : 'text-white/55 hover:bg-white/7 hover:text-white/90'}`}
          >
            <BarChart3 size={16} className="opacity-90" /> Rapports
          </button>
          
          <button 
            onClick={() => onViewChange('payments')}
            className={`w-full flex items-center gap-2.5 p-[9px_12px] rounded-lg text-xs tracking-wide cursor-pointer border-none text-left transition-all
              ${currentView === 'payments' ? 'bg-[#b2976a]/18 text-eden-tan font-medium' : 'text-white/55 hover:bg-white/7 hover:text-white/90'}`}
          >
            <Coins size={16} className="opacity-90" /> Paiements
          </button>
        </div>

        {/* SECTION OUTILS */}
        <div className="space-y-0.5">
          <div className="text-[9px] text-[#b2976a]/55 tracking-[3px] font-semibold uppercase px-2.5 mb-1.5">Outils</div>
          
          <button 
            onClick={() => onViewChange('messages')}
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

      {/* FOOTER USER CHIP */}
      <div className="p-[16px_14px] border-t border-[#b2976a]/15 relative z-10">
        <div className="flex items-center gap-2.5 p-[10px_12px] rounded-xl hover:bg-white/6 cursor-pointer transition-colors group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-eden-teal to-eden-sage flex items-center justify-center text-xs font-semibold text-white border-2 border-[#b2976a]/30 shrink-0">
            ST
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-white/85 truncate">Samuel Tam</div>
            <div className="text-[11px] text-white/35 font-light mt-[1px] truncate">Responsable agence</div>
          </div>
          <ChevronRight size={13} className="text-white/25 ml-auto group-hover:text-white/6 transition-colors" />
        </div>
      </div>

    </aside>
  );
};