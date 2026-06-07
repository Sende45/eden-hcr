import React, { useState, useMemo } from 'react';
import { FileText, Search, Clock, CheckCircle, Download, Send } from 'lucide-react';
import { type HcrContract, type ContractStatus } from '../types/contract';

const INITIAL_CONTRACTS: HcrContract[] = [
  {
    id: 'CTR-2026-001',
    candidateName: 'Koffi Diallo',
    establishmentName: 'Le Grand Récamier',
    role: 'Chef de partie',
    startDate: '05/06/2026',
    endDate: '05/06/2026',
    totalHours: 7,
    grossAmount: 115.50,
    status: 'signed'
  },
  {
    id: 'CTR-2026-002',
    candidateName: 'Sophie Bernard',
    establishmentName: 'Hôtel National',
    role: 'Réceptionniste',
    startDate: '05/06/2026',
    endDate: '05/06/2026',
    totalHours: 8,
    grossAmount: 132.00,
    status: 'pending_signature'
  },
  {
    id: 'CTR-2026-003',
    candidateName: 'Amine Mekki',
    establishmentName: 'Rooftop National',
    role: 'Mixologue',
    startDate: '06/06/2026',
    endDate: '07/06/2026',
    totalHours: 16,
    grossAmount: 264.00,
    status: 'pending_signature'
  }
];

export const ContractManager: React.FC = () => {
  const [contracts] = useState<HcrContract[]>(INITIAL_CONTRACTS);
  const [filterStatus, setFilterStatus] = useState<ContractStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      const matchesStatus = filterStatus === 'all' || contract.status === filterStatus;
      const matchesSearch =
        contract.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.establishmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [contracts, filterStatus, searchQuery]);

  const handleRemindCandidate = (contractId: string, name: string) => {
    alert(`Relance SMS & Email envoyée avec succès à ${name} pour le contrat ${contractId}.`);
  };

  return (
    <div className="p-[24px_30px] font-sans space-y-6">

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

      <div className="flex items-center gap-2 select-none">
        {(['all', 'pending_signature', 'signed', 'archived'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`p-[6px_14px] rounded-full border text-xs font-medium transition-all cursor-pointer border-eden-border
              ${filterStatus === status
                ? 'bg-eden-navy/10 border-eden-navy text-eden-navy font-semibold'
                : 'bg-transparent text-eden-text-light hover:border-eden-tan hover:text-eden-text-dark'
              }`}
          >
            {status === 'all' && 'Tous les contrats'}
            {status === 'pending_signature' && 'En attente de signature'}
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
            <tbody className="divide-y divide-eden-border/40 text-eden-text-dark">
              {filteredContracts.map(contract => (
                <tr key={contract.id} className="hover:bg-eden-bg/10 transition-colors">
                  <td className="p-4 font-mono font-medium text-eden-navy">{contract.id}</td>
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
                        : 'bg-eden-orange/10 text-eden-orange'
                      }`}
                    >
                      {contract.status === 'signed' ? (
                        <><CheckCircle size={10} /> Signé</>
                      ) : (
                        <><Clock size={10} /> En attente</>
                      )}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {contract.status === 'pending_signature' ? (
                        <button
                          onClick={() => handleRemindCandidate(contract.id, contract.candidateName)}
                          title="Relancer l'extra"
                          className="p-1.5 text-eden-tan hover:text-eden-navy rounded-lg hover:bg-eden-bg transition-colors border-none bg-transparent cursor-pointer"
                        >
                          <Send size={14} />
                        </button>
                      ) : (
                        <button
                          title="Télécharger le PDF CTT"
                          className="p-1.5 text-eden-text-light hover:text-eden-navy rounded-lg hover:bg-eden-bg transition-colors border-none bg-transparent cursor-pointer"
                        >
                          <Download size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredContracts.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-eden-text-light font-light text-xs">
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