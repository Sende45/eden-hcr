import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Hotel, Layers, TrendingUp, Check, X, Loader2, AlertCircle, ChevronDown, ChevronUp, Building2, Mail, Phone } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<string>('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const fetchAdminData = async () => {
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
        setStats(resData.data?.stats || resData.stats || null);
        setDemandes(resData.data?.actionsRequises?.etablissementsAValider || resData.etablissementsAValider || []);
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

  const handleActionEtablissement = async (id: string, action: 'approuver' | 'rejeter') => {
    const token = localStorage.getItem('eden_token');
    setActionMessage(action === 'approuver' ? `Homologation du dossier en cours...` : `Rejet et suppression du dossier...`);
    
    try {
      const response = await fetch(`https://eden-hcr.onrender.com/api/admin/etablissement/${id}`, {
        method: action === 'approuver' ? 'PUT' : 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ statutCompte: 'actif' })
      });

      if (response.ok) {
        setDemandes(prev => prev.filter(item => item._id !== id));
        setActionMessage(action === 'approuver' ? `Établissement activé avec succès.` : `Dossier supprimé.`);
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

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 min-h-[250px] sm:min-h-[300px] md:min-h-[400px] space-y-3 font-sans">
        <Loader2 className="animate-spin text-eden-tan" size={28} />
        <p className="text-[10px] sm:text-xs text-eden-text-light font-light tracking-wide text-center px-4 max-w-[280px] sm:max-w-none">
          Chargement de la Console Haute Direction EDÈN...
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 font-sans max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8 animate-[fadeInUp_0.4s_ease-out]">
      
      {/* Entête Direction - Ultra responsive */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 sm:gap-3 border-b border-eden-border/60 pb-3 sm:pb-4 md:pb-5 select-none">
        <div className="space-y-0.5 sm:space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 text-eden-tan font-mono text-[8px] xs:text-[9px] sm:text-[10px] font-bold tracking-[1.5px] xs:tracking-[2px] sm:tracking-[3px] uppercase">
            <ShieldCheck size={12} className="sm:w-[14px] sm:h-[14px]" /> 
            <span className="truncate">Securitized Infrastructure</span>
          </div>
          <h2 className="font-serif font-bold text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl text-eden-navy tracking-wide truncate">
            Console SuperAdmin
          </h2>
        </div>
        <div className="bg-eden-navy text-white text-[8px] xs:text-[9px] sm:text-[10px] md:text-[11px] font-mono font-bold px-2 py-1 xs:px-2.5 xs:py-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-eden-tan/20 shadow-sm text-center whitespace-nowrap flex-shrink-0">
          AGENCE Puy-en-velay
        </div>
      </div>

      {/* Messages d'erreur et d'action */}
      {error && (
        <div className="p-2.5 xs:p-3 sm:p-4 text-[10px] xs:text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl flex items-start sm:items-center gap-1.5 sm:gap-2">
          <AlertCircle size={14} className="shrink-0 mt-0.5 sm:mt-0" />
          <span className="break-words text-[10px] xs:text-xs">{error}</span>
        </div>
      )}

      {actionMessage && (
        <div className="p-2.5 xs:p-3 text-[10px] xs:text-xs text-eden-navy bg-eden-tan/10 border border-eden-tan/30 rounded-lg sm:rounded-xl animate-pulse font-medium break-words">
          {actionMessage}
        </div>
      )}

      {/* Grille de KPI - Ultra responsive avec 2 colonnes sur mobile */}
      {stats && (
        <div className="grid grid-cols-2 gap-2 xs:gap-3 sm:gap-4 md:gap-5">
          
          {/* Brigade Extras */}
          <div className="bg-white border border-eden-border rounded-xl sm:rounded-2xl p-2.5 xs:p-3 sm:p-4 md:p-5 shadow-2xs flex items-center gap-2 xs:gap-3 sm:gap-4">
            <div className="p-1.5 xs:p-2 sm:p-3 bg-eden-navy/5 text-eden-navy rounded-lg sm:rounded-xl shrink-0">
              <Users size={14} className="xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[8px] xs:text-[9px] sm:text-[10px] md:text-[11px] text-eden-text-light font-medium uppercase tracking-[0.5px] xs:tracking-[1px] select-none truncate">
                Prestataires
              </p>
              <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-bold text-eden-navy mt-0.5 truncate">
                {stats.totalExtras} <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-normal text-eden-text-light">actifs</span>
              </p>
            </div>
          </div>

          {/* Comptes Hôtels */}
          <div className="bg-white border border-eden-border rounded-xl sm:rounded-2xl p-2.5 xs:p-3 sm:p-4 md:p-5 shadow-2xs flex items-center gap-2 xs:gap-3 sm:gap-4">
            <div className="p-1.5 xs:p-2 sm:p-3 bg-eden-navy/5 text-eden-tan rounded-lg sm:rounded-xl shrink-0">
              <Hotel size={14} className="xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[8px] xs:text-[9px] sm:text-[10px] md:text-[11px] text-eden-text-light font-medium uppercase tracking-[0.5px] xs:tracking-[1px] select-none truncate">
                Comptes Hôtels
              </p>
              <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-bold text-eden-navy mt-0.5 truncate">
                {stats.totalEntreprises} <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-normal text-eden-text-light">filiales</span>
              </p>
            </div>
          </div>

          {/* Shifts Cumulés */}
          <div className="bg-white border border-eden-border rounded-xl sm:rounded-2xl p-2.5 xs:p-3 sm:p-4 md:p-5 shadow-2xs flex items-center gap-2 xs:gap-3 sm:gap-4">
            <div className="p-1.5 xs:p-2 sm:p-3 bg-eden-navy/5 text-eden-teal rounded-lg sm:rounded-xl shrink-0">
              <Layers size={14} className="xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[8px] xs:text-[9px] sm:text-[10px] md:text-[11px] text-eden-text-light font-medium uppercase tracking-[0.5px] xs:tracking-[1px] select-none truncate">
                Shifts Cumulés
              </p>
              <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-bold text-eden-navy mt-0.5 truncate">
                {stats.totalMissions} <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-normal text-eden-text-light">missions</span>
              </p>
            </div>
          </div>

          {/* Volume d'Affaires */}
          <div className="bg-white border border-eden-border rounded-xl sm:rounded-2xl p-2.5 xs:p-3 sm:p-4 md:p-5 shadow-2xs flex items-center gap-2 xs:gap-3 sm:gap-4">
            <div className="p-1.5 xs:p-2 sm:p-3 bg-eden-navy/5 text-eden-orange rounded-lg sm:rounded-xl shrink-0">
              <TrendingUp size={14} className="xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[8px] xs:text-[9px] sm:text-[10px] md:text-[11px] text-eden-text-light font-medium uppercase tracking-[0.5px] xs:tracking-[1px] select-none truncate">
                Volume d'Affaires
              </p>
              <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-bold text-eden-navy mt-0.5 truncate">
                {(stats.chiffreAffaires || 0).toLocaleString('fr-FR')} €
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section Modération - Ultra responsive */}
      <div className="bg-white border border-eden-border rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-5 md:p-6 shadow-xs space-y-3 sm:space-y-4">
        <div className="select-none">
          <h3 className="font-serif font-bold text-sm xs:text-base sm:text-lg md:text-xl text-eden-navy leading-tight">
            Comptes Entreprises à valider
          </h3>
          <p className="text-[10px] xs:text-xs text-eden-text-light font-light mt-0.5">
            Vérifiez les données SIRET et structures avant l'activation réglementaire.
          </p>
          <p className="text-[9px] xs:text-[10px] text-eden-text-light/60 font-light mt-1">
            {demandes.length} dossier{demandes.length > 1 ? 's' : ''} en attente
          </p>
        </div>

        {demandes.length === 0 ? (
          <div className="text-[10px] xs:text-xs text-eden-text-light font-light py-6 xs:py-8 text-center border border-dashed border-eden-border/60 rounded-lg sm:rounded-xl bg-eden-bg2/5 select-none px-4">
            <Building2 size={24} className="mx-auto text-eden-text-light/30 mb-2" />
            Aucun dossier en attente d'homologation.
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {demandes.map(item => {
              const isExpanded = expandedItems.has(item._id);
              
              return (
                <div 
                  key={item._id} 
                  className="bg-white border border-eden-border/60 rounded-lg sm:rounded-xl hover:border-eden-tan/30 transition-all duration-200 overflow-hidden"
                >
                  {/* En-tête de la carte - toujours visible */}
                  <div 
                    className="p-2.5 xs:p-3 sm:p-4 cursor-pointer hover:bg-eden-bg2/20 transition-colors"
                    onClick={() => toggleExpand(item._id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 xs:gap-2 flex-wrap">
                          <p className="text-xs xs:text-sm font-bold text-eden-navy truncate max-w-[120px] xs:max-w-[160px] sm:max-w-[200px] md:max-w-none">
                            {item.raisonSociale}
                          </p>
                          <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-mono font-semibold text-eden-tan bg-eden-tan/10 px-1.5 py-0.5 rounded uppercase select-none tracking-wide whitespace-nowrap">
                            {item.typeEtablissement}
                          </span>
                        </div>
                        <p className="text-[9px] xs:text-[10px] sm:text-[11px] text-eden-text-light font-mono mt-0.5 truncate">
                          SIRET : {item.siret}
                        </p>
                        {/* Info contact simplifiée sur mobile */}
                        <div className="mt-1 xs:mt-1.5 flex items-center gap-1 xs:gap-2 text-[9px] xs:text-[10px] text-eden-text-dark font-light truncate">
                          <span className="hidden xs:inline">Contact :</span>
                          <span className="font-medium truncate">
                            {item.contactInterne?.prenom} {item.contactInterne?.nom}
                          </span>
                          <span className="hidden xs:inline text-eden-text-light">—</span>
                          <span className="text-eden-text-light font-mono truncate hidden sm:inline">
                            {item.contactInterne?.email}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 shrink-0">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActionEtablissement(item._id, 'approuver');
                          }}
                          className="p-1.5 xs:p-2 bg-eden-teal/10 text-eden-teal hover:bg-eden-teal hover:text-white rounded-lg xs:rounded-xl transition-colors border-none cursor-pointer"
                          title="Approuver l'établissement"
                        >
                          <Check size={14} className="xs:w-4 xs:h-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActionEtablissement(item._id, 'rejeter');
                          }}
                          className="p-1.5 xs:p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg xs:rounded-xl transition-colors border-none cursor-pointer"
                          title="Rejeter le dossier"
                        >
                          <X size={14} className="xs:w-4 xs:h-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(item._id);
                          }}
                          className="p-1 xs:p-1.5 text-eden-text-light hover:text-eden-navy rounded-lg transition-colors border-none cursor-pointer bg-transparent"
                        >
                          {isExpanded ? <ChevronUp size={16} className="xs:w-[18px] xs:h-[18px]" /> : <ChevronDown size={16} className="xs:w-[18px] xs:h-[18px]" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contenu expansible - détails complets */}
                  {isExpanded && (
                    <div className="p-3 xs:p-4 sm:p-5 pt-0 xs:pt-0 sm:pt-0 border-t border-eden-border/40 bg-eden-bg2/5">
                      <div className="space-y-2 xs:space-y-3">
                        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 xs:gap-3">
                          <div className="flex items-start gap-1.5 xs:gap-2">
                            <Building2 size={14} className="xs:w-4 xs:h-4 text-eden-text-light/60 mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-[9px] xs:text-[10px] text-eden-text-light uppercase tracking-wide font-medium">Raison Sociale</p>
                              <p className="text-xs xs:text-sm font-medium text-eden-navy truncate">{item.raisonSociale}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-1.5 xs:gap-2">
                            <div className="min-w-0">
                              <p className="text-[9px] xs:text-[10px] text-eden-text-light uppercase tracking-wide font-medium">SIRET</p>
                              <p className="text-xs xs:text-sm font-mono text-eden-text-dark truncate">{item.siret}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-1.5 xs:gap-2">
                          <Mail size={14} className="xs:w-4 xs:h-4 text-eden-text-light/60 mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[9px] xs:text-[10px] text-eden-text-light uppercase tracking-wide font-medium">Email de contact</p>
                            <p className="text-xs xs:text-sm font-medium text-eden-navy break-all">{item.contactInterne?.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-1.5 xs:gap-2">
                          <div className="min-w-0">
                            <p className="text-[9px] xs:text-[10px] text-eden-text-light uppercase tracking-wide font-medium">Contact</p>
                            <p className="text-xs xs:text-sm font-medium text-eden-navy">
                              {item.contactInterne?.prenom} {item.contactInterne?.nom}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};