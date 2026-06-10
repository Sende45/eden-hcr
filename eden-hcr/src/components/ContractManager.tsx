import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Search, Clock, CheckCircle, Download, Send, Loader2, AlertCircle, Plus, X } from 'lucide-react';
import { type HcrContract, type ContractStatus } from '../types/contract';

// ─── Modal de Création ──────────────────────────────────────────────────────
const CreateContractModal = ({ isOpen, onClose, onSave }: any) => {
  const [data, setData] = useState({ candidateId: '', establishmentName: '', role: '', startDate: '', grossAmount: '' });
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-eden-navy/20 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-serif font-bold text-lg text-eden-navy">Générer un contrat</h3>
          <button onClick={onClose} className="cursor-pointer"><X size={18} /></button>
        </div>
        <input type="text" placeholder="ID Candidat" className="w-full border border-eden-border rounded-xl p-3 text-xs" onChange={e => setData({...data, candidateId: e.target.value})} />
        <input type="text" placeholder="Établissement" className="w-full border border-eden-border rounded-xl p-3 text-xs" onChange={e => setData({...data, establishmentName: e.target.value})} />
        <input type="date" className="w-full border border-eden-border rounded-xl p-3 text-xs" onChange={e => setData({...data, startDate: e.target.value})} />
        <input type="number" placeholder="Montant Brut (€)" className="w-full border border-eden-border rounded-xl p-3 text-xs" onChange={e => setData({...data, grossAmount: e.target.value})} />
        <button onClick={() => onSave(data)} className="w-full bg-eden-navy text-white p-3 rounded-xl font-bold text-xs hover:bg-eden-light-navy cursor-pointer">Générer le contrat</button>
      </div>
    </div>
  );
};

export const ContractManager: React.FC = () => {
  const [contracts, setContracts] = useState<HcrContract[]>([]);
  const [filterStatus, setFilterStatus] = useState<ContractStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleCreateContract = async (data: any) => {
    const token = localStorage.getItem('eden_token');
    setActionMessage("Génération du contrat en cours...");
    try {
      const response = await fetch('https://eden-hcr.onrender.com/api/admin/contracts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        setActionMessage("Contrat généré avec succès.");
        setIsModalOpen(false);
        fetchContracts();
      } else {
        setActionMessage("Erreur lors de la génération.");
      }
    } catch (err) { setActionMessage("Échec de connexion au serveur."); }
    finally { setTimeout(() => setActionMessage(''), 3000); }
  };

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
      <CreateContractModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleCreateContract} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-eden-bg2 border border-eden-border rounded-xl p-5 shadow-xs">
        <div className="space-y-1">
          <h2 className="font-serif font-semibold text-xl text-eden-navy tracking-wide flex items-center gap-2">
            <FileText size={20} className="text-eden-tan" /> Suivi des Contrats CTT
          </h2>
          <p className="text-xs text-eden-text-light font-light">
            Gérez, contrôlez la conformité légale et suivez le statut des signatures.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-eden-bg border border-eden-border rounded-lg p-[8px_14px] text-eden-text-light w-full sm:w-[260px]">
            <Search size={15} className="shrink-0" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-xs outline-none w-full text-eden-text-dark"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-eden-navy text-white text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2 hover:bg-eden-light-navy cursor-pointer transition-colors"
          >
            <Plus size={14} /> Nouveau
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

      <div className="flex items-center gap-2 select-none overflow-x-auto pb-1 scrollbar-none">
        {(['all', 'pending_signature', 'signed', 'archived'] as const).map(status => (
          <button
            key={status}
            type="button"
            onClick={() => setFilterStatus(status)}
            className={`p-[6px_14px] rounded-full border text-xs font-medium transition-all cursor-pointer whitespace-nowrap
              ${filterStatus === status
                ? 'bg-eden-navy/10 border-eden-navy text-eden-navy font-semibold'
                : 'bg-transparent text-eden-text-light border-eden-border hover:border-eden-tan'
              }`}
          >
            {status === 'all' && 'Tous les contrats'}
            {status === 'pending_signature' && 'En attente'}
            {status === 'signed' && 'Signés'}
            {status === 'archived' && 'Archivés'}
          </button>
        ))}
      </div>

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
                    <td className="p-4">{contract.startDate}</td>
                    <td className="p-4 font-medium text-eden-navy">{contract.grossAmount.toFixed(2)} €</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold p-[2px_8px] rounded-full ${contract.status === 'signed' ? 'bg-eden-teal/10 text-eden-teal' : 'bg-eden-orange/10 text-eden-orange'}`}>
                        {contract.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {contract.status === 'pending_signature' && (
                          <button onClick={() => handleRemindCandidate(contractId, contract.candidateName)} className="p-1.5 text-eden-tan hover:text-eden-navy cursor-pointer">
                            <Send size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};