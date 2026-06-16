import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldAlert, FileText, Check, X, Search, Filter, Eye, Award, SlidersHorizontal, Loader2, AlertCircle } from 'lucide-react';

interface Candidate {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  role: string;
  specialty: string;
  experience: string;
  city: string;
  status: 'pending' | 'validated' | 'premium';
  email: string;
  phone: string;
  createdAt: string;
}

export const CandidateManager: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<string>('');

  // 1. CHARGEMENT DE LA BRIGADE DEPUIS MONGO DB ATLAS
  const fetchCandidates = async () => {
    const token = localStorage.getItem('eden_token');
    try {
      const response = await fetch('https://eden-hcr.onrender.com/api/admin/candidates', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();

      if (response.ok) {
        setCandidates(resData.data || resData);
      } else {
        setError(resData.message || "Erreur lors de la récupération du vivier.");
      }
    } catch (err) {
      console.error("Erreur CandidateManager fetch :", err);
      setError("Impossible de joindre le serveur HCR pour actualiser le vivier.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // 2. MODIFICATION DU STATUT DE VALIDATION EN BASE DE DONNÉES
  const handleUpdateStatus = async (id: string, newStatus: 'validated' | 'premium' | 'pending') => {
    const token = localStorage.getItem('eden_token');
    setActionMessage("Mise à jour du profil sur Atlas...");

    try {
      const response = await fetch(`https://eden-hcr.onrender.com/api/admin/candidates/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const resData = await response.json();

      if (response.ok) {
        // Mise à jour locale réactive de la grille
        setCandidates(prev => prev.map(c => c._id === id ? { ...c, status: newStatus } : c));
        if (selectedCandidate && selectedCandidate._id === id) {
          setSelectedCandidate(prev => prev ? { ...prev, status: newStatus } : null);
        }
        setActionMessage(`Profil mis à jour avec le statut : ${newStatus}`);
      } else {
        setActionMessage(`Erreur : ${resData.message}`);
      }
    } catch (err) {
      console.error("Erreur de mise à jour du statut :", err);
      setActionMessage("Échec de la synchronisation réseau.");
    } finally {
      setTimeout(() => setActionMessage(''), 3000);
    }
  };

  // Filtrage combiné (Recherche textuelle réactive) — sécurisé contre les champs undefined
  const filteredCandidates = candidates.filter(c =>
    `${c.firstName ?? ''} ${c.lastName ?? ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.role ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px] space-y-3 font-sans">
        <Loader2 className="animate-spin text-eden-tan" size={32} />
        <p className="text-xs text-eden-text-light font-light tracking-wide">Ouverture sécurisée du vivier de la brigade...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 font-sans space-y-6 max-w-[1600px] mx-auto animate-[fadeInUp_0.4s_ease-out]">
      
      {/* HEADER DE GESTION */}
      <div className="bg-eden-bg2 border border-eden-border rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-serif font-semibold text-xl text-eden-navy tracking-wide flex items-center gap-2">
            <UserCheck size={22} className="text-eden-tan" /> Vivier & Approbations Extras
          </h2>
          <p className="text-xs text-eden-text-light font-light">Contrôlez les profils entrants, examinez les documents légaux et attribuez les statuts de prestige.</p>
        </div>
        
        {/* BARRE DE RECHERCHE */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-eden-text-light" />
            <input 
              type="text" 
              placeholder="Rechercher un extra ou un métier..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-eden-bg border border-eden-border rounded-xl pl-9 pr-4 py-2.5 text-xs outline-hidden focus:border-eden-tan/80 text-eden-text-dark w-full sm:w-64 transition-all shadow-2xs"
            />
          </div>
          <button type="button" className="p-2.5 bg-eden-bg border border-eden-border rounded-xl text-eden-text-light hover:text-eden-navy transition-colors cursor-pointer shadow-2xs">
            <SlidersHorizontal size={15} />
          </button>
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

      {/* CORE SPLIT-VIEW AVEC PANNEAU DE CONTRÔLE INTERACTIF */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LISTE DES CANDIDATS (8 COLONNES) */}
        <div className="lg:col-span-8 bg-eden-bg2 border border-eden-border rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-eden-border bg-eden-navy/[0.02] text-eden-text-light font-semibold tracking-wider uppercase select-none">
                  <th className="p-4 pl-6">Profil Extra</th>
                  <th className="p-4">Métier & Spécialité</th>
                  <th className="p-4">Statut de validation</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-eden-border/40 bg-white">
                {filteredCandidates.map(candidate => (
                  <tr 
                    key={candidate._id} 
                    className={`hover:bg-eden-navy/[0.01] transition-colors cursor-pointer ${selectedCandidate?._id === candidate._id ? 'bg-eden-navy/[0.02]' : ''}`}
                    onClick={() => setSelectedCandidate(candidate)}
                  >
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-eden-navy text-white font-bold flex items-center justify-center text-xs shadow-2xs uppercase">
                          {/* FIX : optional chaining pour éviter le crash si firstName/lastName est vide ou undefined */}
                          {candidate.firstName?.[0] ?? '?'}{candidate.lastName?.[0] ?? '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-eden-text-dark text-sm">{candidate.firstName} {candidate.lastName}</p>
                          <p className="text-[11px] text-eden-text-light font-light mt-0.5">
                            {candidate.city} · Inscription le {new Date(candidate.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-eden-text-dark">{candidate.role}</p>
                      <p className="text-[11px] text-eden-tan font-medium mt-0.5">{candidate.specialty}</p>
                    </td>
                    <td className="p-4">
                      {candidate.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 bg-eden-orange/10 text-eden-orange font-medium px-2.5 py-1 rounded-md text-[10px] tracking-wide uppercase">
                          <ShieldAlert size={11} /> À valider
                        </span>
                      )}
                      {candidate.status === 'validated' && (
                        <span className="inline-flex items-center gap-1 bg-eden-teal/10 text-eden-teal font-medium px-2.5 py-1 rounded-md text-[10px] tracking-wide uppercase">
                          <Check size={11} /> Profil Actif
                        </span>
                      )}
                      {candidate.status === 'premium' && (
                        <span className="inline-flex items-center gap-1 bg-eden-tan/10 text-eden-tan font-bold px-2.5 py-1 rounded-md text-[10px] tracking-wide uppercase shadow-2xs">
                          <Award size={11} /> Extra d'élite
                        </span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <button 
                        type="button"
                        onClick={() => setSelectedCandidate(candidate)}
                        className="p-2 bg-transparent border border-eden-border hover:border-eden-tan text-eden-text-light hover:text-eden-navy rounded-xl transition-all cursor-pointer"
                        title="Inspecter le dossier"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredCandidates.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-eden-text-light font-light italic">
                      Aucun profil d'extra ne correspond à vos critères de recherche.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PANNEAU DE VÉRIFICATION INSPECTION (4 COLONNES) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedCandidate ? (
            <div className="bg-eden-bg2 border border-eden-border rounded-2xl p-6 shadow-md space-y-6 sticky top-24 animate-[fadeInUp_0.3s_ease-out]">
              
              {/* Entête Panneau */}
              <div className="flex items-start justify-between border-b border-eden-border/40 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-eden-tan/10 text-eden-tan font-bold flex items-center justify-center text-sm shadow-inner uppercase">
                    {/* FIX : optional chaining pour éviter le crash si firstName/lastName est vide ou undefined */}
                    {selectedCandidate.firstName?.[0] ?? '?'}{selectedCandidate.lastName?.[0] ?? '?'}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-eden-navy">{selectedCandidate.firstName} {selectedCandidate.lastName}</h3>
                    <p className="text-[11px] text-eden-text-light font-mono mt-0.5">{selectedCandidate.phone}</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setSelectedCandidate(null)}
                  className="p-1 text-eden-text-light hover:text-eden-navy bg-transparent border-none cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Métier résumé */}
              <div className="space-y-3 text-xs bg-eden-bg/40 border border-eden-border-light rounded-xl p-4">
                <p className="text-eden-text-light font-medium uppercase text-[10px] tracking-wider select-none">Compétences déclarées</p>
                <div className="space-y-1">
                  <p className="font-semibold text-eden-text-dark">{selectedCandidate.role}</p>
                  <p className="text-eden-text-light font-light">E-mail : <span className="font-mono text-eden-navy">{selectedCandidate.email}</span></p>
                  <p className="text-eden-text-light font-light">Expérience : <span className="font-medium text-eden-navy">{selectedCandidate.experience}</span></p>
                  <p className="text-eden-text-light font-light">Univers : <span className="font-medium text-eden-tan">{selectedCandidate.specialty}</span></p>
                </div>
              </div>

              {/* Pièces Justificatives Transmises */}
              <div className="space-y-3">
                <p className="text-xs text-eden-text-light font-medium uppercase text-[10px] tracking-wider select-none">Documents réglementaires</p>
                <div className="space-y-2 text-xs">
                  <div className="p-3 border border-eden-border/70 rounded-xl bg-white flex items-center justify-between hover:border-eden-tan transition-colors group cursor-pointer">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText size={16} className="text-eden-text-light group-hover:text-eden-tan transition-colors" />
                      <span className="font-medium text-eden-text-dark truncate">Piece_Identite.pdf</span>
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-eden-teal bg-eden-teal/10 px-1.5 py-0.5 rounded">Vérifié</span>
                  </div>
                  <div className="p-3 border border-eden-border/70 rounded-xl bg-white flex items-center justify-between hover:border-eden-tan transition-colors group cursor-pointer">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText size={16} className="text-eden-text-light group-hover:text-eden-tan transition-colors" />
                      <span className="font-medium text-eden-text-dark truncate">Attestation_Vitale.pdf</span>
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-eden-teal bg-eden-teal/10 px-1.5 py-0.5 rounded">Vérifié</span>
                  </div>
                  <div className="p-3 border border-eden-border/70 rounded-xl bg-white flex items-center justify-between hover:border-eden-tan transition-colors group cursor-pointer">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText size={16} className="text-eden-text-light group-hover:text-eden-tan transition-colors" />
                      <span className="font-medium text-eden-text-dark truncate">RIB_Bancaire.png</span>
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-eden-teal bg-eden-teal/10 px-1.5 py-0.5 rounded">Vérifié</span>
                  </div>
                </div>
              </div>

              {/* ACTION CONTRÔLE INTERACTIVE */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {selectedCandidate.status === 'pending' ? (
                  <>
                    <button 
                      type="button"
                      onClick={() => handleUpdateStatus(selectedCandidate._id, 'validated')}
                      className="w-full bg-eden-navy hover:bg-eden-light-navy text-white text-xs font-semibold py-3 px-4 rounded-xl cursor-pointer transition-colors shadow-sm flex items-center justify-center gap-1.5 border-none"
                    >
                      <Check size={14} /> Activer
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleUpdateStatus(selectedCandidate._id, 'premium')}
                      className="w-full bg-transparent border border-eden-tan text-eden-tan hover:bg-eden-tan hover:text-white text-xs font-bold py-3 px-4 rounded-xl cursor-pointer transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Award size={14} /> Classer Élite
                    </button>
                  </>
                ) : (
                  <button 
                    type="button"
                    onClick={() => handleUpdateStatus(selectedCandidate._id, 'pending')}
                    className="col-span-2 w-full bg-transparent border border-eden-border text-eden-text-light hover:text-eden-orange hover:border-eden-orange/50 text-xs font-medium py-2.5 px-4 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <X size={14} /> Suspendre le compte
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-eden-bg2/40 border border-eden-border border-dashed rounded-2xl p-10 text-center select-none sticky top-24">
              <UserCheck size={26} className="text-eden-text-light/50 mx-auto mb-3" />
              <p className="text-xs font-medium text-eden-text-light">Sélectionnez un profil d'extra de la liste pour inspecter son dossier et valider ses pièces contractuelles.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};