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
import { MessageManager } from '../components/MessageManager'; // <-- Importation de la messagerie
import { CreateMissionModal } from '../components/CreateMissionModal';
import { type CreateMissionInput } from '../types/missionForm';
import { type DashboardView } from '../types/navigation';
import { ShieldAlert, Loader2 } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [view, setView] = useState<DashboardView>('dashboard');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasToken, setHasToken] = useState<boolean>(true);

  // Vérification stricte de la session JWT au montage du tableau de bord d'administration
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      setHasToken(false);
    }
  }, [view]);

  // ACTION DYNAMIQUE : ENVOI DE LA MISSION CRÉÉE VERS TON BACKEND MERN
  const handleCreateMission = useCallback(async (data: CreateMissionInput) => {
    setIsSubmitting(true);
    const token = localStorage.getItem('userToken');

    // Mapping propre des données du formulaire vers ton schéma Mongoose `Mission`
    const missionPayload = {
      etablissementId: "65f1a2b3c4d5e6f7a8b9c0d1", // Remplacer par l'ID réel ou l'ID de l'établissement connecté
      posteRecherche: data.title, // Liaison directe avec ton input titre/poste
      dateDebut: new Date(), // Ajuster avec le sélecteur de date de ta modale
      dateFin: new Date(Date.now() + 8 * 60 * 60 * 1000), // Estimation d'un shift de 8h
      nombreExtras: 1,
      tauxHoraireBrut: 19.5, // Taux par défaut ou extrait du formulaire
      briefing: data.description || '', // Contenu de description
      statutMission: 'ouverte'
    };

    try {
      const response = await fetch('https://eden-hcr-backend.onrender.com/api/mission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Barrière protect
        },
        body: JSON.stringify(missionPayload)
      });

      const resData = await response.json();

      if (response.ok) {
        setNotification(`La mission "${data.title}" a été enregistrée en base et publiée au sein de la brigade.`);
        setIsModalOpen(false);
        
        // Rafraîchissement léger de la vue si l'utilisateur est sur l'onglet missions
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
      case 'messages': // <-- Intégration de la messagerie dans le routeur
        return (
          <div className="animate-[fadeInUp_0.35s_ease-out]">
            <MessageManager />
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
            {isSubmitting ? (
              <Loader2 className="animate-spin text-eden-tan" size={14} />
            ) : (
              <span className="w-2 h-2 rounded-full bg-eden-teal animate-pulse" />
            )}
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