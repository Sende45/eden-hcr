import React, { useState, useEffect, useMemo } from 'react';
// CORRIGÉ : Ajout de 'Clock' dans les icônes importées
import { Building2, Search, ShieldCheck, ShieldAlert, Check, X, Eye, Loader2, AlertCircle, Clock } from 'lucide-react';

interface Etablissement {
  _id: string;
  raisonSociale: string;
  siret: string;
  typeEtablissement: string;
  ville?: string;
  statutCompte: 'actif' | 'en_attente_validation' | 'suspendu';
  contactInterne: {
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
  };
  createdAt: string;
}

export const EstablishmentManager: React.FC = () => {
  const [establishments, setEstablishments] = useState<Etablissement[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [selectedEstablishment, setSelectedEstablishment] = useState<Etablissement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<string>('');

  // 1. RÉCUPÉRATION DES ÉTABLISSEMENTS DEPUIS ATLAS
  const fetchEstablishments = async () => {
    setIsLoading(true);
    setError('');
    const token = localStorage.getItem('eden_token');

    try {
      const response = await fetch('https://eden-hcr.onrender.com/api/admin/establishments', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();

      if (response.ok) {
        setEstablishments(resData.data || resData);
      } else {
        setError(resData.message || "Erreur lors du chargement des filiales HCR.");
      }
    } catch (err) {
      console.error("Erreur EstablishmentManager fetch :", err);
      setError("Liaison interrompue avec le registre des hôtels partenaires.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEstablishments();
  }, []);

  // 2. MODIFICATION DU STATUT DE L'ÉTABLISSEMENT EN BASE
  const handleUpdateStatus = async (id: string, newStatus: 'actif' | 'suspendu') => {
    const token = localStorage.getItem('eden_token');
    setActionMessage("Mise à jour de la structure sur Atlas...");

    try {
      const response = await fetch(`https://eden-hcr.onrender.com/api/admin/establishments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ statutCompte: newStatus })
      });

      const resData = await response.json();

      if (response.ok) {
        setEstablishments(prev => prev.map(e => e._id === id ? { ...e, statutCompte: newStatus } : e));
        if (selectedEstablishment && selectedEstablishment._id === id) {
          setSelectedEstablishment(prev => prev ? { ...prev, statutCompte: newStatus } : null);
        }
        setActionMessage(`Établissement configuré sur : ${newStatus}`);
      } else {
        setActionMessage(`Erreur : ${resData.message}`);
      }
    } catch (err) {
      console.error("Erreur de mise à jour de l'établissement :", err);
      setActionMessage("Échec de la synchronisation réseau.");
    } finally {
      setTimeout(() => setActionMessage(''), 3000);
    }
  };

  // Filtrage et recherche optimisés
  const filteredEstablishments = useMemo(() => {
    return establishments.filter(e => {
      const matchesStatus = filterStatut === 'all' || e.statutCompte === filterStatut;
      const matchesSearch = 
        e.raisonSociale.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.siret.includes(searchTerm);
      return matchesStatus && matchesSearch;
    });
  }, [establishments, filterStatut, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px] space-y-3 font-sans">
        <Loader2 className="animate-spin text-eden-tan" size={32} />
        <p className="text-xs text-eden-text-light font-light tracking-wide">Ouverture du registre des comptes entreprises...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 font-sans space-y-6 max-w-[1600px] mx-auto animate-[fadeInUp_0.4s_ease-out]">
      
      {/* HEADER & BARRE DE RECHERCHE */}
      <div className="bg-eden-bg2 border border-eden-border rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-serif font-semibold text-xl text-eden-navy tracking-wide flex items-center gap-2">
            <Building2 size={22} className="text-eden-tan" /> Établissements & Hôtels Partenaires
          </h2>
          <p className="text-xs text-eden-text-light font-light">Supervisez l'activité des filiales, validez les accès d'agences et gérez les restrictions.</p>
        </div>

        <div className="flex items-center gap-2 bg-eden-bg border border-eden-border rounded-lg p-[8px_14px] text-eden-text-light w-full sm:w-[260px]">
          <Search size={15} className="shrink-0" />
          <input
            type="text"
            placeholder="Rechercher par enseigne, SIRET..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-xs outline-none w-full text-eden-text-dark placeholder:text-eden-text-light/70"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {actionMessage && (
        <div className="p-3 text-xs text-eden-navy bg-eden-tan/10 border border-eden-tan/30 rounded-xl font-medium animate-pulse">
          {actionMessage}
        </div>
      )}

      {/* FILTRES PAR ÉTAT */}
      <div className="flex items-center gap-2 select-none overflow-x-auto pb-1 scrollbar-none">
        {([
          { key: 'all', label: 'Toutes les structures' },
          { key: 'actif', label: 'Comptes actifs' },
          { key: 'en_attente_validation', label: 'En attente d\'homologation' },
          { key: 'suspendu', label: 'Comptes suspendus' }
        ]).map(f => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilterStatut(f.key)}
            className={`p-[6px_14px] rounded-full border text-xs font-medium transition-all cursor-pointer whitespace-nowrap
              ${filterStatut === f.key
                ? 'bg-eden-navy/10 border-eden-navy text-eden-navy font-semibold'
                : 'bg-transparent text-eden-text-light border-eden-border hover:border-eden-tan hover:text-eden-text-dark'
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* CORE GRID CONTENEUR SPLIT-VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* GRILLE TABLEAU DES ÉTABLISSEMENTS */}
        <div className="lg:col-span-8 bg-eden-bg2 border border-eden-border rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-eden-border bg-eden-navy/[0.02] text-eden-text-light font-semibold tracking-wider uppercase select-none">
                  <th className="p-4 pl-6">Raison Sociale / Enseigne</th>
                  <th className="p-4">Identifiant SIRET</th>
                  <th className="p-4">Statut Account</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-eden-border/40 bg-white text-eden-text-dark">
                {filteredEstablishments.map(est => (
                  <tr 
                    key={est._id} 
                    className={`hover:bg-eden-bg/10 transition-colors cursor-pointer ${selectedEstablishment?._id === est._id ? 'bg-eden-navy/[0.02]' : ''}`}
                    onClick={() => setSelectedEstablishment(est)}
                  >
                    <td className="p-4 pl-6 font-semibold text-eden-navy text-sm">
                      <div>{est.raisonSociale}</div>
                      <div className="text-[10px] font-mono text-eden-tan uppercase tracking-wider font-medium mt-0.5">
                        {est.typeEtablissement} {est.ville ? `· ${est.ville}` : ''}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-eden-text-light">{est.siret}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold p-[2px_8px] rounded-full
                        ${est.statutCompte === 'actif'
                          ? 'bg-eden-teal/10 text-eden-teal'
                          : est.statutCompte === 'suspendu'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-eden-orange/10 text-eden-orange'
                        }`}
                      >
                        {est.statutCompte === 'actif' && <><ShieldCheck size={11} /> Actif</>}
                        {est.statutCompte === 'suspendu' && <><ShieldAlert size={11} /> Suspendu</>}
                        {est.statutCompte === 'en_attente_validation' && <><Clock size={11} /> En attente</>}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right" onClick={e => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setSelectedEstablishment(est)}
                        className="p-2 bg-transparent border border-eden-border hover:border-eden-tan text-eden-text-light hover:text-eden-navy rounded-xl transition-all cursor-pointer"
                        title="Inspecter le compte"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredEstablishments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-eden-text-light font-light italic bg-eden-bg2/10">
                      Aucune entreprise partenaire ne correspond à vos filtres.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PANNEAU DE CONTRÔLE DE SÉCURITÉ DE L'ÉTABLISSEMENT */}
        <div className="lg:col-span-4">
          {selectedEstablishment ? (
            <div className="bg-eden-bg2 border border-eden-border rounded-2xl p-6 shadow-md space-y-6 sticky top-24 animate-[fadeInUp_0.3s_ease-out]">
              
              <div className="flex items-start justify-between border-b border-eden-border/40 pb-4">
                <div className="space-y-0.5">
                  <h3 className="font-serif font-bold text-base text-eden-navy">{selectedEstablishment.raisonSociale}</h3>
                  <p className="text-[11px] text-eden-text-light font-mono">SIRET : {selectedEstablishment.siret}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEstablishment(null)}
                  className="p-1 text-eden-text-light hover:text-eden-navy bg-transparent border-none cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Fiche contact interne */}
              <div className="space-y-3 text-xs bg-white border border-eden-border-light rounded-xl p-4 shadow-2xs">
                <p className="text-eden-text-light font-medium uppercase text-[10px] tracking-wider select-none">Gestionnaire de compte</p>
                <div className="space-y-1 font-light">
                  <p className="font-semibold text-eden-text-dark">{selectedEstablishment.contactInterne.prenom} {selectedEstablishment.contactInterne.nom}</p>
                  <p>E-mail : <span className="font-mono text-eden-navy font-normal">{selectedEstablishment.contactInterne.email}</span></p>
                  {selectedEstablishment.contactInterne.telephone && (
                    <p>Téléphone : <span className="font-mono font-normal">{selectedEstablishment.contactInterne.telephone}</span></p>
                  )}
                  <p className="text-[11px] text-eden-text-light font-light pt-1 border-t border-eden-border/30 mt-2">
                    Partenaire depuis le : {new Date(selectedEstablishment.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              {/* BOUTONS D'INTERACTION ATLAS */}
              <div className="space-y-2">
                {selectedEstablishment.statutCompte !== 'actif' ? (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedEstablishment._id, 'actif')}
                    className="w-full bg-eden-navy hover:bg-eden-light-navy text-white text-xs font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 border-none cursor-pointer transition-colors shadow-sm"
                  >
                    <Check size={14} /> Réactiver / Homologuer le compte
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedEstablishment._id, 'suspendu')}
                    className="w-full bg-transparent border border-red-200 text-red-600 hover:bg-red-600 hover:text-white text-xs font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-2xs"
                  >
                    <X size={14} /> Suspendre la filiale temporairement
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-eden-bg2/40 border border-eden-border border-dashed rounded-2xl p-10 text-center select-none sticky top-24">
              <Building2 size={26} className="text-eden-text-light/50 mx-auto mb-3" />
              <p className="text-xs font-medium text-eden-text-light">Sélectionnez une entreprise dans le tableau pour analyser ses fiches d'accès légaux, modifier ses droits ou suspendre sa licence d'utilisation.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default EstablishmentManager;