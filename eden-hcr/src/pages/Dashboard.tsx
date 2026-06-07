import React, { useState, useCallback } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { StatsGrid } from '../components/StatsGrid';
import { DashboardContent } from '../components/DashboardContent';
import { CandidateManager } from '../components/CandidateManager';
import { HcrCalendar } from '../components/HcrCalendar';
import { ContractManager } from '../components/ContractManager';
import { EstablishmentManager } from '../components/EstablishmentManager';
import { MissionManager } from '../components/MissionManager';
import { ReportManager } from '../components/ReportManager';
import { PaymentManager } from '../components/PaymentManager';
import { CreateMissionModal } from '../components/CreateMissionModal';
import { type CreateMissionInput } from '../types/missionForm';
import { type DashboardView } from '../types/navigation';

export const Dashboard: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [view, setView] = useState<DashboardView>('dashboard');

  const handleCreateMission = useCallback((data: CreateMissionInput) => {
    console.log('Données de la mission reçues pour EDÈN HCR :', data);
    setNotification(`La mission "${data.title}" a été planifiée avec succès.`);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
    setIsModalOpen(false);
  }, []);

  // Rendu avec enveloppe d'animation native ou injectée via les keyframes CSS
  const renderMainContent = () => {
    switch (view) {
      case 'candidates':
        return (
          <div className="animate-[fadeInUp_0.35s_ease-out]">
            <CandidateManager />
          </div>
        );
      case 'planning':
        return (
          <div className="animate-[fadeInUp_0.35s_ease-out]">
            <HcrCalendar />
          </div>
        );
      case 'contracts':
        return (
          <div className="animate-[fadeInUp_0.35s_ease-out]">
            <ContractManager />
          </div>
        );
      case 'establishments':
        return (
          <div className="animate-[fadeInUp_0.35s_ease-out]">
            <EstablishmentManager />
          </div>
        );
      case 'missions':
        return (
          <div className="animate-[fadeInUp_0.35s_ease-out]">
            <MissionManager />
          </div>
        );
      case 'reports':
        return (
          <div className="animate-[fadeInUp_0.35s_ease-out]">
            <ReportManager />
          </div>
        );
      case 'payments':
        return (
          <div className="animate-[fadeInUp_0.35s_ease-out]">
            <PaymentManager />
          </div>
        );
      case 'dashboard':
      default:
        return (
          <div className="space-y-2 animate-[fadeInUp_0.3s_ease-out]">
            <StatsGrid />
            <DashboardContent />
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-full bg-eden-bg text-eden-text-dark antialiased overflow-hidden font-sans selection:bg-eden-navy selection:text-white">
      
      {/* 1. Sidebar connectée à la charte et à la navigation épurée */}
      <Sidebar
        currentView={view}
        onViewChange={(newView: DashboardView) => setView(newView)}
      />

      {/* 2. Conteneur principal */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        
        {/* Barre supérieure fixe */}
        <Topbar onNewMissionClick={() => setIsModalOpen(true)} />

        {/* Vue défilante isolée avec transition globale */}
        <main className="flex-1 overflow-y-auto scrollbar-thin scroll-smooth pb-12 transition-all duration-300">
          {renderMainContent()}
        </main>

        {/* TOAST DE NOTIFICATION PRESTIGE ET FLUIDE */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 bg-eden-navy border border-eden-tan/30 text-white p-[14px_24px] rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300 animate-[slideIn_0.3s_ease-out] backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-eden-teal animate-pulse" />
            <p className="text-xs font-medium tracking-wide font-sans">{notification}</p>
          </div>
        )}
      </div>

      {/* 3. Fenêtre modale de saisie */}
      <CreateMissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateMission}
      />
    </div>
  );
};