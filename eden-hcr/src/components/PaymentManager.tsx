import React, { useState, useEffect, useMemo } from 'react';
import { Coins, CreditCard, ArrowUpRight, ArrowDownLeft, Loader2, AlertCircle, Plus, X } from 'lucide-react';

// ─── Modal de Saisie Financière ──────────────────────────────────────────
const AddPaymentModal = ({ isOpen, onClose, onSave, type }: any) => {
  const [data, setData] = useState({ name: '', amount: '', ref: '' });
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-eden-navy/20 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-serif font-bold text-lg text-eden-navy">Ajouter {type}</h3>
          <button onClick={onClose} className="cursor-pointer text-eden-text-light hover:text-eden-navy"><X size={18} /></button>
        </div>
        <input type="text" placeholder={type === 'Facture' ? "Nom établissement" : "Nom extra"} className="w-full border border-eden-border rounded-xl p-3 text-xs" onChange={e => setData({...data, name: e.target.value})} />
        <input type="number" placeholder="Montant (€)" className="w-full border border-eden-border rounded-xl p-3 text-xs" onChange={e => setData({...data, amount: e.target.value})} />
        <input type="text" placeholder="Référence" className="w-full border border-eden-border rounded-xl p-3 text-xs" onChange={e => setData({...data, ref: e.target.value})} />
        <button onClick={() => onSave(data)} className="w-full bg-eden-navy text-white p-3 rounded-xl font-bold text-xs hover:bg-eden-light-navy cursor-pointer">Enregistrer</button>
      </div>
    </div>
  );
};

export const PaymentManager: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<string>('');
  const [isGeneratingSepa, setIsGeneratingSepa] = useState<boolean>(false);
  const [modal, setModal] = useState<{ open: boolean, type: 'Facture' | 'Virement' | null }>({ open: false, type: null });

  const fetchFinancialData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('eden_token');
    try {
      const response = await fetch('https://eden-hcr.onrender.com/api/admin/payments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await response.json();
      if (response.ok) {
        setInvoices(resData.invoices || []);
        setPayouts(resData.payouts || []);
      }
    } catch (err) { setError("Rupture de liaison réseau avec EDÈN."); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchFinancialData(); }, []);

  const handleSaveOperation = async (data: any) => {
    const token = localStorage.getItem('eden_token');
    const endpoint = modal.type === 'Facture' ? '/api/admin/invoices' : '/api/admin/payouts';
    await fetch(`https://eden-hcr.onrender.com${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    setModal({ open: false, type: null });
    fetchFinancialData();
  };

  const handleGenerateSepa = async () => {
    setIsGeneratingSepa(true);
    const token = localStorage.getItem('eden_token');
    const res = await fetch('https://eden-hcr.onrender.com/api/admin/payments/generate-sepa', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setActionMessage("Fichier XML SEPA transmis à la banque.");
    setIsGeneratingSepa(false);
    setTimeout(() => setActionMessage(''), 4000);
  };

  const totalInvoicesPending = useMemo(() => invoices.reduce((s, i) => s + i.amount, 0), [invoices]);

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-eden-tan" size={32} /></div>;

  return (
    <div className="p-[24px_30px] font-sans space-y-6">
      <AddPaymentModal isOpen={modal.open} onClose={() => setModal({open: false, type: null})} onSave={handleSaveOperation} type={modal.type} />
      
      <div className="bg-eden-bg2 border border-eden-border rounded-xl p-5 shadow-xs flex justify-between items-center">
        <div>
          <h2 className="font-serif font-semibold text-xl text-eden-navy flex items-center gap-2">
            <Coins size={20} className="text-eden-tan" /> Flux Financiers
          </h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModal({open: true, type: 'Facture'})} className="bg-eden-teal text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer"><Plus size={14} /> Facture</button>
          <button onClick={() => setModal({open: true, type: 'Virement'})} className="bg-eden-orange text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer"><Plus size={14} /> Virement</button>
        </div>
      </div>

      {error && <div className="p-4 text-xs text-red-600 bg-red-50 border rounded-2xl flex items-center gap-2"><AlertCircle size={16} />{error}</div>}
      {actionMessage && <div className="p-3 text-xs text-eden-navy bg-eden-tan/10 rounded-xl animate-pulse">{actionMessage}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-eden-bg2 border border-eden-border rounded-xl p-5 space-y-4">
          <div className="flex justify-between border-b pb-3">
            <h3 className="text-xs font-bold uppercase text-eden-text-light flex items-center gap-1.5"><ArrowDownLeft size={14} className="text-eden-teal" /> Facturation (Entrées)</h3>
            <span className="text-xs font-bold text-eden-teal">{totalInvoicesPending.toLocaleString('fr-FR')} €</span>
          </div>
          {invoices.map(inv => (
            <div key={inv._id} className="p-3 bg-white border rounded-lg flex justify-between shadow-2xs">
              <p className="text-xs font-medium">{inv.establishmentName}</p>
              <p className="text-xs font-bold">{inv.amount.toFixed(2)} €</p>
            </div>
          ))}
        </div>

        <div className="bg-eden-bg2 border border-eden-border rounded-xl p-5 space-y-4">
          <div className="flex justify-between border-b pb-3">
            <h3 className="text-xs font-bold uppercase text-eden-text-light flex items-center gap-1.5"><ArrowUpRight size={14} className="text-eden-orange" /> Paies (Sorties)</h3>
            <button disabled={isGeneratingSepa || payouts.length === 0} onClick={handleGenerateSepa} className="bg-eden-navy text-white text-[10px] px-3 py-1 rounded-md flex items-center gap-1.5">
              {isGeneratingSepa ? <Loader2 size={11} className="animate-spin" /> : <CreditCard size={11} />} SEPA
            </button>
          </div>
          {payouts.map(pay => (
            <div key={pay._id} className="p-3 bg-white border rounded-lg flex justify-between shadow-2xs">
              <p className="text-xs font-medium">{pay.candidateName}</p>
              <p className="text-xs font-bold text-eden-teal">{pay.amount.toFixed(2)} €</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};