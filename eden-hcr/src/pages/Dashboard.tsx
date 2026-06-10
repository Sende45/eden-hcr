import React, { useState, useCallback, useEffect } from 'react';
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
import { MessageManager } from '../components/MessageManager'; 
import { SuperAdminDashboard } from '../components/SuperAdminDashboard'; 
import { ExtraDashboard } from '../components/ExtraDashboard'; // Nouveau composant à créer
import { CreateMissionModal } from '../components/CreateMissionModal';
import { type CreateMissionInput } from '../types/missionForm';
import { type DashboardView } from '../types/navigation';
import { ShieldAlert, Loader2, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  user: {
    id: string;
    email: string;
    role: string;
    nom?: string;
    prenom?: string;
  } | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  
  // Initialisation de la vue par défaut selon le rôle
  const [view, setView] = useState<DashboardView>(
    user?.role === 'superadmin' ? 'superadmin' : (user?.role === 'extra' ? 'dashboard' : 'dashboard')
  );
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasToken, setHasToken] = useState<boolean>(true);

  // Synchronisation de la session JWT via la clé globale unifiée
  useEffect(() => {
    const token = localStorage.getItem('eden_token');
    if (!token) {
      setHasToken(false);
    }
  }, [view]);

  // Si l'utilisateur change ou rafraîchit, on force l'ajustement de la vue
  useEffect(() => {
    if (user?.role === 'superadmin') {
      setView('superadmin');
    } else {
      setView('dashboard');
    }
  }, [user]);

  // ACTION DYNAMIQUE : ENVOI DE LA MISSION CRÉÉE VERS LE BACKEND MERN
  const handleCreateMission = useCallback(async (data: CreateMissionInput) => {
    setIsSubmitting(true);
    const token = localStorage.getItem('eden_token');

    const missionPayload = {
      etablissementId: "65f1a2b3c4d5e6f7a8b9c0d1", 
      posteRecherche: data.title, 
      dateDebut: new Date(), 
      dateFin: new Date(Date.now() + 8 * 60 * 60 * 1000), 
      nombreExtras: 1,
      tauxHoraireBrut: 19.5, 
      briefing: data.description || '', 
      statutMission: 'ouverte'
    };

    try {
      const response = await fetch('https://eden-hcr.onrender.com/api/mission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(missionPayload)
      });

      const resData = await response.json();

      if (response.ok) {
        setNotification(`La mission "${data.title}" a été enregistrée en base et publiée au sein de la brigade.`);
        setIsModalOpen(false);
        
        if (view === 'missions') {
          window.location.reload();
        }
      } else {
        setNotification(`Erreur serveur : ${resData.message}`);
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation de la mission :', error);
      setNotification('Échec de la publication : Impossible de joindre le serveur EDÈN.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  }, [view]);

  // Intercepteur d'affichage si la session a expiré ou est absente
  if (!hasToken) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-eden-bg p-6 text-center font-sans">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-3 shadow-inner">
          <ShieldAlert size={24} />
        </div>
        <h3 className="font-serif font-bold text-lg text-eden-navy">Accès Restreint</h3>
        <p className="text-xs text-eden-text-light font-light max-w-sm mt-1">
          Votre session administrative a expiré ou est invalide. Veuillez vous reconnecter depuis l'Espace Client.
        </p>
      </div>
    );
  }

  const renderMainContent = () => {
    // Gestion spécifique de l'interface Prestataire/Extra
    if (user?.role === 'extra') {
      return <div className="animate-[fadeInUp_0.35s_ease-out]"><ExtraDashboard user={user} /></div>;
    }

    switch (view) {
      case 'candidates':
        return <div className="animate-[fadeInUp_0.35s_ease-out]"><CandidateManager /></div>;
      case 'planning':
        return <div className="animate-[fadeInUp_0.35s_ease-out]"><HcrCalendar /></div>;
      case 'contracts':
        return <div className="animate-[fadeInUp_0.35s_ease-out]"><ContractManager /></div>;
      case 'establishments':
        return <div className="animate-[fadeInUp_0.35s_ease-out]"><EstablishmentManager /></div>;
      case 'missions':
        return <div className="animate-[fadeInUp_0.35s_ease-out]"><MissionManager /></div>;
      case 'reports':
        return <div className="animate-[fadeInUp_0.35s_ease-out]"><ReportManager /></div>;
      case 'payments':
        return <div className="animate-[fadeInUp_0.35s_ease-out]"><PaymentManager /></div>;
      case 'messages': 
        return <div className="animate-[fadeInUp_0.35s_ease-out]"><MessageManager /></div>;
        
      case 'superadmin': 
        if (user?.role !== 'superadmin') {
          return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] w-full text-center p-6 font-sans">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-3 shadow-inner">
                <AlertTriangle size={22} />
              </div>
              <h3 className="font-serif font-bold text-base text-eden-navy">Privilèges Insuffisants</h3>
            </div>
          );
        }
        return <div className="animate-[fadeInUp_0.35s_ease-out]"><SuperAdminDashboard /></div>;
        
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
      
      <Sidebar
        currentView={view}
        userRole={user?.role}
        onViewChange={(newView: DashboardView) => {
          if (newView === 'superadmin' && user?.role !== 'superadmin') {
            return;
          }
          setView(newView);
        }}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <Topbar onNewMissionClick={() => setIsModalOpen(true)} />
        <main className="flex-1 overflow-y-auto scrollbar-thin scroll-smooth pb-12 transition-all duration-300">
          {renderMainContent()}
        </main>

        {notification && (
          <div className="fixed bottom-6 right-6 z-50 bg-eden-navy border border-eden-tan/30 text-white p-[14px_24px] rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300 animate-[slideIn_0.3s_ease-out] backdrop-blur-md">
            {isSubmitting ? <Loader2 className="animate-spin text-eden-tan" size={14} /> : <span className="w-2 h-2 rounded-full bg-eden-teal animate-pulse" />}
            <p className="text-xs font-medium tracking-wide font-sans">{notification}</p>
          </div>
        )}
      </div>

      <CreateMissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateMission}
      />
    </div>
  );
};