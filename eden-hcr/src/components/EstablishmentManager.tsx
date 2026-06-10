import React, { useState, useEffect, useMemo } from 'react';
import { Building2, Search, ShieldCheck, ShieldAlert, Check, X, Eye, Loader2, AlertCircle, Clock, Trash2, ShieldX } from 'lucide-react';

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

  const fetchEstablishments = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('eden_token');
    try {
      const response = await fetch('https://eden-hcr.onrender.com/api/admin/establishments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await response.json();
      if (response.ok) setEstablishments(resData.data || resData);
      else setError(resData.message);
    } catch (err) { setError("Erreur de liaison avec le registre."); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchEstablishments(); }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'actif' | 'suspendu') => {
    const token = localStorage.getItem('eden_token');
    await fetch(`https://eden-hcr.onrender.com/api/admin/establishments/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ statutCompte: newStatus })
    });
    setEstablishments(prev => prev.map(e => e._id === id ? { ...e, statutCompte: newStatus } : e));
    if (selectedEstablishment?._id === id) setSelectedEstablishment(prev => prev ? { ...prev, statutCompte: newStatus } : null);
    setActionMessage(`Statut mis à jour en : ${newStatus}`);
    setTimeout(() => setActionMessage(''), 3000);
  };

  const handleDeleteEstablishment = async (id: string) => {
    if (!window.confirm("CONFIRMATION REQUISE : Voulez-vous supprimer définitivement cet établissement ?")) return;
    
    const token = localStorage.getItem('eden_token');
    const response = await fetch(`https://eden-hcr.onrender.com/api/admin/establishments/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      setEstablishments(prev => prev.filter(e => e._id !== id));
      setSelectedEstablishment(null);
      setActionMessage("Établissement supprimé avec succès.");
    }
  };

  const filteredEstablishments = useMemo(() => {
    return establishments.filter(e => {
      const matchesStatus = filterStatut === 'all' || e.statutCompte === filterStatut;
      const matchesSearch = e.raisonSociale.toLowerCase().includes(searchTerm.toLowerCase()) || e.siret.includes(searchTerm);
      return matchesStatus && matchesSearch;
    });
  }, [establishments, filterStatut, searchTerm]);

  return (
    <div className="p-6 lg:p-8 font-sans space-y-6 max-w-[1600px] mx-auto animate-[fadeInUp_0.4s_ease-out]">
      
      {/* HEADER */}
      <div className="bg-eden-bg2 border border-eden-border rounded-2xl p-6 shadow-xs flex justify-between items-center">
        <div>
          <h2 className="font-serif font-semibold text-xl text-eden-navy flex items-center gap-2">
            <Building2 size={22} className="text-eden-tan" /> Administration Établissements
          </h2>
        </div>
        <div className="flex gap-2">
           <input placeholder="Rechercher..." className="bg-eden-bg p-2 rounded-lg text-xs border" onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {actionMessage && <div className="p-3 text-xs bg-eden-tan/10 rounded-xl animate-pulse">{actionMessage}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-eden-bg2 border border-eden-border rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-eden-navy/5">
              <tr>
                <th className="p-4">Raison Sociale</th>
                <th className="p-4">SIRET</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Contrôle</th>
              </tr>
            </thead>
            <tbody className="divide-y bg-white">
              {filteredEstablishments.map(est => (
                <tr key={est._id} className="hover:bg-eden-bg/50 cursor-pointer" onClick={() => setSelectedEstablishment(est)}>
                  <td className="p-4 font-semibold text-eden-navy">{est.raisonSociale}</td>
                  <td className="p-4 font-mono">{est.siret}</td>
                  <td className="p-4"><span className={`px-2 py-1 rounded-full text-[10px] ${est.statutCompte === 'actif' ? 'bg-eden-teal/10 text-eden-teal' : 'bg-red-50 text-red-600'}`}>{est.statutCompte}</span></td>
                  <td className="p-4 text-right"><Eye size={14} className="inline text-eden-tan" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PANNEAU DE CONTRÔLE SUPÉRIEUR */}
        <div className="lg:col-span-4">
          {selectedEstablishment && (
            <div className="bg-white border p-6 rounded-2xl space-y-4 shadow-md sticky top-24">
              <h3 className="font-bold text-eden-navy">{selectedEstablishment.raisonSociale}</h3>
              <p className="text-xs">Propriétaire: {selectedEstablishment.contactInterne.prenom} {selectedEstablishment.contactInterne.nom}</p>
              
              <div className="space-y-2">
                <button onClick={() => handleUpdateStatus(selectedEstablishment._id, selectedEstablishment.statutCompte === 'actif' ? 'suspendu' : 'actif')} 
                  className={`w-full p-3 rounded-xl font-bold text-xs ${selectedEstablishment.statutCompte === 'actif' ? 'bg-red-600 text-white' : 'bg-eden-teal text-white'}`}>
                  {selectedEstablishment.statutCompte === 'actif' ? "Suspendre l'accès" : "Réactiver l'accès"}
                </button>
                
                {/* POUVOIR SUPRÊME : SUPPRESSION */}
                <button onClick={() => handleDeleteEstablishment(selectedEstablishment._id)} 
                  className="w-full p-3 rounded-xl font-bold text-xs bg-red-100 text-red-700 flex items-center justify-center gap-2 hover:bg-red-200">
                  <Trash2 size={14} /> Supprimer définitivement
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};