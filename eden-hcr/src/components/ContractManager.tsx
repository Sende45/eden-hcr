import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Search, Clock, CheckCircle, Download, Send, Loader2, AlertCircle } from 'lucide-react';
import { type HcrContract, type ContractStatus } from '../types/contract';

export const ContractManager: React.FC = () => {
  const [contracts, setContracts] = useState<HcrContract[]>([]);
  const [filterStatus, setFilterStatus] = useState<ContractStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<string>('');

  // 1. RÉCUPÉRATION DES CONTRATS CTT DEPUIS ATLAS
  const fetchContracts = async () => {
    setIsLoading(true);
    setError('');
    const token = localStorage.getItem('eden_token');

    try {
      const response = await fetch('https://eden-hcr.onrender.com/api/admin/contracts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();

      if (response.ok) {
        setContracts(resData.data || resData);
      } else {
        setError(resData.message || "Erreur lors du chargement des contrats.");
      }
    } catch (err) {
      console.error("Erreur ContractManager fetch :", err);
      setError("Liaison interrompue avec le registre des contrats EDÈN.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  // 2. ENVOI DE RELANCE DE SIGNATURE AU BACKEND MERN (SMS / EMAIL)
  const handleRemindCandidate = async (contractId: string, name: string) => {
    const token = localStorage.getItem('eden_token');
    setActionMessage(`Notification de relance pour ${name} en préparation...`);

    try {
      const response = await fetch(`https://eden-hcr.onrender.com/api/admin/contracts/${contractId}/remind`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();

      if (response.ok) {
        setActionMessage(`Relance SMS & Email transmise avec succès à ${name}.`);
      } else {
        setActionMessage(`Erreur serveur : ${resData.message}`);
      }
    } catch (err) {
      console.error("Erreur lors de la relance contractuelle :", err);
      setActionMessage("Échec de l'envoi : Serveur injoignable.");
    } finally {
      setTimeout(() => setActionMessage(''), 4000);
    }
  };

  // Filtrage et recherche optimisés via useMemo
  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      const contractId = contract.id || (contract as any)._id || '';
      const matchesStatus = filterStatus === 'all' || contract.status === filterStatus;
      const matchesSearch =
        contract.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.establishmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contractId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [contracts, filterStatus, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px] space-y-3 font-sans">
        <Loader2 className="animate-spin text-eden-tan" size={32} />
        <p className="text-xs text-eden-text-light font-light tracking-wide">Synchronisation du registre des contrats légaux...</p>
      </div>
    );
  }

  return (
    <div className="p-[24px_30px] font-sans space-y-6">

      {/* PANNEAU RECHERCHE & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-eden-bg2 border border-eden-border rounded-xl p-5 shadow-xs">
        <div className="space-y-1">
          <h2 className="font-serif font-semibold text-xl text-eden-navy tracking-wide flex items-center gap-2">
            <FileText size={20} className="text-eden-tan" /> Suivi des Contrats CTT
          </h2>
          <p className="text-xs text-eden-text-light font-light">
            Générez, contrôlez la conformité légale et suivez le statut des signatures électroniques.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-eden-bg border border-eden-border rounded-lg p-[8px_14px] text-eden-text-light w-full sm:w-[260px]">
          <Search size={15} className="shrink-0" />
          <input
            type="text"
            placeholder="Rechercher par ID, extra, hôtel..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
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

      {/* FILTRES DE STATUTS */}
      <div className="flex items-center gap-2 select-none overflow-x-auto pb-1 scrollbar-none">
        {(['all', 'pending_signature', 'signed', 'archived'] as const).map(status => (
          <button
            key={status}
            type="button"
            onClick={() => setFilterStatus(status)}
            className={`p-[6px_14px] rounded-full border text-xs font-medium transition-all cursor-pointer whitespace-nowrap
              ${filterStatus === status
                ? 'bg-eden-navy/10 border-eden-navy text-eden-navy font-semibold'
                : 'bg-transparent text-eden-text-light border-eden-border hover:border-eden-tan hover:text-eden-text-dark'
              }`}
          >
            {status === 'all' && 'Tous les contrats'}
            {status === 'pending_signature' && 'En attente de signature'}
            {status === 'signed' && 'Signés'}
            {status === 'archived' && 'Archivés'}
          </button>
        ))}
      </div>

      {/* TABLEAU DES CONTRATS ATLAS */}
      <div className="bg-eden-bg2 border border-eden-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-eden-border/60 bg-eden-bg/30 text-eden-text-light font-medium select-none">
                <th className="p-4 font-medium">ID Contrat</th>
                <th className="p-4 font-medium">Intérimaire Extra</th>
                <th className="p-4 font-medium">Établissement</th>
                <th className="p-4 font-medium">Date & Durée</th>
                <th className="p-4 font-medium">Brut Estimé</th>
                <th className="p-4 font-medium">Statut</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-eden-border/40 text-eden-text-dark bg-white">
              {filteredContracts.map(contract => {
                const contractId = contract.id || (contract as any)._id;
                return (
                  <tr key={contractId} className="hover:bg-eden-bg/10 transition-colors">
                    <td className="p-4 font-mono font-medium text-eden-navy">{contractId}</td>
                    <td className="p-4 font-semibold">{contract.candidateName}</td>
                    <td className="p-4 text-eden-text-light">{contract.establishmentName}</td>
                    <td className="p-4 space-y-0.5">
                      <div>{contract.startDate}</div>
                      <div className="text-[10px] text-eden-text-light font-light">
                        {contract.totalHours}h de shift · {contract.role}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-eden-navy">{contract.grossAmount.toFixed(2)} €</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold p-[2px_8px] rounded-full
                        ${contract.status === 'signed'
                          ? 'bg-eden-teal/10 text-eden-teal'
                          : contract.status === 'archived'
                          ? 'bg-eden-navy/10 text-eden-text-light'
                          : 'bg-eden-orange/10 text-eden-orange'
                        }`}
                      >
                        {contract.status === 'signed' && <><CheckCircle size={10} /> Signé</>}
                        {contract.status === 'pending_signature' && <><Clock size={10} /> En attente</>}
                        {contract.status === 'archived' && <><FileText size={10} /> Archivé</>}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {contract.status === 'pending_signature' ? (
                          <button
                            type="button"
                            onClick={() => handleRemindCandidate(contractId, contract.candidateName)}
                            title="Relancer l'extra"
                            className="p-1.5 text-eden-tan hover:text-eden-navy rounded-lg hover:bg-eden-bg transition-colors border-none bg-transparent cursor-pointer"
                          >
                            <Send size={14} />
                          </button>
                        ) : (
                          <a
                            href={`https://eden-hcr.onrender.com/api/admin/contracts/${contractId}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Télécharger le PDF CTT"
                            className="p-1.5 text-eden-text-light hover:text-eden-navy rounded-lg hover:bg-eden-bg transition-colors flex items-center"
                          >
                            <Download size={14} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredContracts.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-eden-text-light font-light text-xs bg-eden-bg2/10">
                    Aucun contrat CTT ne correspond à vos critères actuels.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};