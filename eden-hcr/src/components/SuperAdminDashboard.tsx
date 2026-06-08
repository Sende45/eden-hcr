import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Hotel, Layers, TrendingUp, Check, X, Loader2, AlertCircle } from 'lucide-react';

interface AdminStats {
  totalExtras: number;
  totalEntreprises: number;
  chiffreAffaires: number;
  totalMissions: number;
}

interface EtablissementAttente {
  _id: string;
  raisonSociale: string;
  siret: string;
  typeEtablissement: string;
  contactInterne: {
    nom: string;
    prenom: string;
    email: string;
  };
}

export const SuperAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [demandes, setDemandes] = useState<EtablissementAttente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  // 1. CHARGEMENT DES MÉTRIQUES DEPUIS TON SERVEUR MERN
  const fetchAdminData = async () => {
    // CORRECTION : Utilisation de la clé globale unifiée 'eden_token'
    const token = localStorage.getItem('eden_token');
    try {
      const response = await fetch('https://eden-hcr.onrender.com/api/admin/metrics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();

      if (response.ok) {
        setStats(resData.data.stats);
        setDemandes(resData.data.actionsRequises.etablissementsAValider);
      } else {
        setError(resData.message || "Erreur de chargement des privilèges SuperAdmin.");
      }
    } catch (err) {
      console.error("Erreur SuperAdmin :", err);
      setError("Liaison interrompue avec le serveur de haute sécurité EDÈN.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // 2. SYNCHRONISATION DES ACTIONS DE VALIDATION SUR ATLAS (PUT / DELETE)
  const handleActionEtablissement = async (id: string, action: 'approuver' | 'rejeter') => {
    const token = localStorage.getItem('eden_token');
    setActionMessage(action === 'approuver' ? `Homologation du dossier en cours...` : `Rejet et suppression du dossier...`);
    
    try {
      // Configuration de l'appel fetch réel vers tes routes d'administration
      const response = await fetch(`https://eden-hcr.onrender.com/api/admin/etablissement/${id}`, {
        method: action === 'approuver' ? 'PUT' : 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ statutCompte: 'actif' })
      });

      if (response.ok) {
        // Mise à jour de l'état local pour faire disparaître l'établissement traité avec animation
        setDemandes(prev => prev.filter(item => item._id !== id));
        setActionMessage(action === 'approuver' ? `Établissement activé avec succès.` : `Dossier supprimé.`);
        
        // Rafraîchissement des compteurs financiers et d'entreprises
        fetchAdminData();
      } else {
        const dataErr = await response.json();
        setActionMessage(`Erreur : ${dataErr.message}`);
      }
    } catch (err) {
      console.error("Erreur lors de l'action :", err);
      setActionMessage("Impossible de joindre le serveur pour traiter cette action.");
    } finally {
      setTimeout(() => setActionMessage(''), 3500);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px] space-y-3 font-sans">
        <Loader2 className="animate-spin text-eden-tan" size={36} />
        <p className="text-xs text-eden-text-light font-light tracking-wide">Chargement de la Console Haute Direction EDÈN...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 font-sans max-w-7xl mx-auto space-y-8 animate-[fadeInUp_0.4s_ease-out]">
      
      {/* Entête Direction */}
      <div className="flex items-center justify-between border-b border-eden-border/60 pb-5 select-none">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-eden-tan font-mono text-[10px] font-bold tracking-[3px] uppercase">
            <ShieldCheck size={14} /> Securitized Infrastructure
          </div>
          <h2 className="font-serif font-bold text-2xl lg:text-3xl text-eden-navy tracking-wide">Console SuperAdmin</h2>
        </div>
        <div className="bg-eden-navy text-white text-[11px] font-mono font-bold px-3 py-1.5 rounded-lg border border-eden-tan/20 shadow-sm">
          AGENCE PARIS
        </div>
      </div>

      {error && (
        <div className="p-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {actionMessage && (
        <div className="p-3 text-xs text-eden-navy bg-eden-tan/10 border border-eden-tan/30 rounded-xl animate-pulse font-medium">
          {actionMessage}
        </div>
      )}

      {/* Grille de KPI Macro (Ce que montre la console) */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Nombre d'extras inscrits sur la plateforme */}
          <div className="bg-eden-bg2 border border-eden-border rounded-2xl p-5 shadow-2xs flex items-center gap-4">
            <div className="p-3 bg-eden-navy/5 text-eden-navy rounded-xl"><Users size={20} /></div>
            <div>
              <p className="text-[11px] text-eden-text-light font-medium uppercase tracking-wider">Brigade Extras</p>
              <p className="text-xl font-bold text-eden-navy mt-0.5">{stats.totalExtras} actifs</p>
            </div>
          </div>

          {/* Nombre total d'hôtels/restaurants partenaires validés */}
          <div className="bg-eden-bg2 border border-eden-border rounded-2xl p-5 shadow-2xs flex items-center gap-4">
            <div className="p-3 bg-eden-navy/5 text-eden-tan rounded-xl"><Hotel size={20} /></div>
            <div>
              <p className="text-[11px] text-eden-text-light font-medium uppercase tracking-wider">Comptes Hôtels</p>
              <p className="text-xl font-bold text-eden-navy mt-0.5">{stats.totalEntreprises} filiales</p>
            </div>
          </div>

          {/* Nombre total de missions d'extra publiées ou accomplies */}
          <div className="bg-eden-bg2 border border-eden-border rounded-2xl p-5 shadow-2xs flex items-center gap-4">
            <div className="p-3 bg-eden-navy/5 text-eden-teal rounded-xl"><Layers size={20} /></div>
            <div>
              <p className="text-[11px] text-eden-text-light font-medium uppercase tracking-wider">Shifts Cumulés</p>
              <p className="text-xl font-bold text-eden-navy mt-0.5">{stats.totalMissions} missions</p>
            </div>
          </div>

          {/* Chiffre d'affaires brut consolidé tiré des paiements traités */}
          <div className="bg-eden-bg2 border border-eden-border rounded-2xl p-5 shadow-2xs flex items-center gap-4">
            <div className="p-3 bg-eden-navy/5 text-eden-orange rounded-xl"><TrendingUp size={20} /></div>
            <div>
              <p className="text-[11px] text-eden-text-light font-medium uppercase tracking-wider">Volume d'Affaires</p>
              <p className="text-xl font-bold text-eden-navy mt-0.5">{stats.chiffreAffaires.toLocaleString('fr-FR')} €</p>
            </div>
          </div>
        </div>
      )}

      {/* Section Modération : Flux de validation réglementaire (RGPD & INSEE) */}
      <div className="bg-white border border-eden-border rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-serif font-bold text-lg text-eden-navy leading-tight">Comptes Entreprises à valider</h3>
          <p className="text-xs text-eden-text-light font-light mt-0.5">Vérifiez les données SIRET et structures avant l'activation réglementaire.</p>
        </div>

        {demandes.length === 0 ? (
          <p className="text-xs text-eden-text-light font-light py-4 text-center border border-dashed border-eden-border/60 rounded-xl">
            Aucun dossier en attente d'homologation.
          </p>
        ) : (
          <div className="divide-y divide-eden-border/40 overflow-hidden border border-eden-border/60 rounded-xl bg-eden-bg2/10">
            {demandes.map(item => (
              <div key={item._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:bg-eden-bg2/20 transition-colors">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-eden-navy">
                    {item.raisonSociale} 
                    <span className="text-[10px] font-mono text-eden-tan bg-eden-tan/10 px-1.5 py-0.5 rounded uppercase ml-1">
                      {item.typeEtablissement}
                    </span>
                  </p>
                  <p className="text-[11px] text-eden-text-light font-mono">SIRET : {item.siret}</p>
                  <p className="text-[11px] text-eden-text-dark font-light">
                    Contact : {item.contactInterne.prenom} {item.contactInterne.nom} — <span className="text-eden-text-light font-mono">{item.contactInterne.email}</span>
                  </p>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  {/* Bouton d'homologation (Passe le statut à 'actif') */}
                  <button 
                    onClick={() => handleActionEtablissement(item._id, 'approuver')}
                    className="p-2 bg-eden-teal/10 text-eden-teal hover:bg-eden-teal hover:text-white rounded-xl transition-colors border-none cursor-pointer"
                    title="Approuver l'établissement"
                  >
                    <Check size={14} />
                  </button>
                  
                  {/* Bouton de rejet (Supprime le dossier invalide) */}
                  <button 
                    onClick={() => handleActionEtablissement(item._id, 'rejeter')}
                    className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-colors border-none cursor-pointer"
                    title="Rejeter le dossier"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};