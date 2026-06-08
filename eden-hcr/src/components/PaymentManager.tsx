import React, { useState, useEffect, useMemo } from 'react';
import { Coins, CreditCard, ShieldCheck, ArrowUpRight, ArrowDownLeft, Loader2, AlertCircle } from 'lucide-react';

interface ClientInvoice {
  _id: string;
  id?: string;
  establishmentName: string;
  invoiceNumber: string;
  amount: number;
}

interface CandidatePayout {
  _id: string;
  id?: string;
  candidateName: string;
  role: string;
  validatedHours: number;
  amount: number;
}

interface PaymentDataResponse {
  invoices: ClientInvoice[];
  payouts: CandidatePayout[];
}

export const PaymentManager: React.FC = () => {
  const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
  const [payouts, setPayouts] = useState<CandidatePayout[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<string>('');
  const [isGeneratingSepa, setIsGeneratingSepa] = useState<boolean>(false);

  // 1. CARGEMENT EN DIRECT DES FLUX FINANCIERS DEPUIS ATLAS
  const fetchFinancialData = async () => {
    setIsLoading(true);
    setError('');
    const token = localStorage.getItem('eden_token');

    try {
      const response = await fetch('https://eden-hcr.onrender.com/api/admin/payments', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();

      if (response.ok) {
        // Hydratation des deux flux (Entrées / Sorties)
        const data: PaymentDataResponse = resData.data || resData;
        setInvoices(data.invoices || []);
        setPayouts(data.payouts || []);
      } else {
        setError(resData.message || "Impossible de récupérer les flux financiers.");
      }
    } catch (err) {
      console.error("Erreur PaymentManager fetch :", err);
      setError("Rupture de liaison réseau avec le grand livre comptable EDÈN.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  // 2. CALCUL DYNAMIQUE DES TOTAUX EN ATTENTE VIA USEMEMO
  const totalInvoicesPending = useMemo(() => {
    return invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  }, [invoices]);

  // 3. ORDRE DE GÉNÉRATION DU FICHIER SEPA BACKEND
  const handleGenerateSepa = async () => {
    setIsGeneratingSepa(true);
    setActionMessage('');
    const token = localStorage.getItem('eden_token');

    try {
      const response = await fetch('https://eden-hcr.onrender.com/api/admin/payments/generate-sepa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();

      if (response.ok) {
        setActionMessage("Fichier XML SEPA consolidé et transmis à la banque avec succès.");
      } else {
        setActionMessage(`Échec : ${resData.message}`);
      }
    } catch (err) {
      console.error("Erreur SEPA :", err);
      setActionMessage("Erreur réseau lors de la génération du virement.");
    } finally {
      setIsGeneratingSepa(false);
      setTimeout(() => setActionMessage(''), 4000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px] space-y-3 font-sans">
        <Loader2 className="animate-spin text-eden-tan" size={32} />
        <p className="text-xs text-eden-text-light font-light tracking-wide">Calcul des balances et traitement des encaissements Atlas...</p>
      </div>
    );
  }

  return (
    <div className="p-[24px_30px] font-sans space-y-6">
      
      {/* EN-TÊTE */}
      <div className="bg-eden-bg2 border border-eden-border rounded-xl p-5 shadow-xs">
        <div className="space-y-1">
          <h2 className="font-serif font-semibold text-xl text-eden-navy tracking-wide flex items-center gap-2">
            <Coins size={20} className="text-eden-tan" /> Flux Financiers & Paiements
          </h2>
          <p className="text-xs text-eden-text-light font-light">Contrôlez les encaissements des établissements Hôtels-Restaurants et ordonnez les virements d'extras.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ENCAISSEMENTS CLIENTS (ENTRÉES) */}
        <div className="bg-eden-bg2 border border-eden-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-eden-border/40 pb-3 select-none">
            <h3 className="text-xs font-bold uppercase tracking-wider text-eden-text-light flex items-center gap-1.5">
              <ArrowDownLeft size={14} className="text-eden-teal" /> Facturation Clients (Entrées)
            </h3>
            <span className="text-xs font-bold text-eden-teal">En attente : {totalInvoicesPending.toLocaleString('fr-FR')} €</span>
          </div>
          
          <div className="space-y-3 text-xs overflow-y-auto max-h-[380px] pr-1">
            {invoices.map(invoice => (
              <div key={invoice._id || invoice.id} className="p-3 bg-white border border-eden-border/60 rounded-lg flex justify-between items-center shadow-2xs hover:border-eden-tan transition-colors">
                <div>
                  <p className="font-medium text-eden-text-dark">{invoice.establishmentName}</p>
                  <p className="text-[11px] text-eden-text-light font-mono mt-0.5">Facture #{invoice.invoiceNumber}</p>
                </div>
                <span className="font-mono font-bold text-eden-navy">{invoice.amount.toFixed(2)} €</span>
              </div>
            ))}

            {invoices.length === 0 && (
              <div className="text-center py-8 text-eden-text-light font-light italic text-[11px]">
                Aucun encaissement client en attente de traitement.
              </div>
            )}
          </div>
        </div>

        {/* REMUNERATIONS INTÉRIMAIRES (SORTIES) */}
        <div className="bg-eden-bg2 border border-eden-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-eden-border/40 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-eden-text-light flex items-center gap-1.5 select-none">
              <ArrowUpRight size={14} className="text-eden-orange" /> Paies Intérimaires (Sorties)
            </h3>
            <button 
              type="button"
              disabled={isGeneratingSepa || payouts.length === 0}
              onClick={handleGenerateSepa}
              className="bg-eden-navy hover:bg-eden-light-navy text-white text-[10px] font-medium p-[5px_12px] rounded-md transition-colors border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-xs"
            >
              {isGeneratingSepa ? (
                <Loader2 size={11} className="animate-spin" />
              ) : (
                <CreditCard size={11} />
              )}
              <span>Générer les SEPA</span>
            </button>
          </div>
          
          <div className="space-y-3 text-xs overflow-y-auto max-h-[380px] pr-1">
            {payouts.map(payout => (
              <div key={payout._id || payout.id} className="p-3 bg-white border border-eden-border/60 rounded-lg flex justify-between items-center shadow-2xs hover:border-eden-tan transition-colors">
                <div>
                  <p className="font-semibold text-eden-text-dark">{payout.candidateName}</p>
                  <p className="text-[11px] text-eden-text-light font-light mt-0.5">
                    {payout.validatedHours}h de shift validées · <span className="font-normal text-eden-tan">{payout.role}</span>
                  </p>
                </div>
                <span className="font-mono font-bold text-eden-teal">{payout.amount.toFixed(2)} €</span>
              </div>
            ))}

            {payouts.length === 0 && (
              <div className="text-center py-8 text-eden-text-light font-light italic text-[11px]">
                Aucun virement extra n'est en attente de validation ce jour.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};