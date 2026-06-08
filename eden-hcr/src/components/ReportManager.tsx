import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, FileSpreadsheet, Download, ArrowUpRight, Loader2, AlertCircle } from 'lucide-react';

interface AgencyStats {
  totalHours: number;
  fillingRate: number;
  fillingRateDelta: number;
  issuedInvoicesCount: number;
}

interface ReportDocument {
  _id: string;
  id?: string;
  title: string;
  format: 'XLSX' | 'PDF' | 'CSV';
  generatedAt: string;
  downloadUrl?: string;
  type: 'hours' | 'urssaf' | 'accounting';
}

export const ReportManager: React.FC = () => {
  const [stats, setStats] = useState<AgencyStats | null>(null);
  const [reports, setReports] = useState<ReportDocument[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<string>('');

  // 1. RÉCUPÉRATION DES STATISTIQUES ET DES RAPPORTS DISPONIBLES DEPUIS ATLAS
  const fetchReportData = async () => {
    setIsLoading(true);
    setError('');
    const token = localStorage.getItem('eden_token');

    try {
      const response = await fetch('https://eden-hcr.onrender.com/api/admin/reports', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();

      if (response.ok) {
        setStats(resData.data?.stats || resData.stats || null);
        setReports(resData.data?.documents || resData.documents || []);
      } else {
        setError(resData.message || "Erreur lors du chargement des analytics agence.");
      }
    } catch (err) {
      console.error("Erreur ReportManager fetch :", err);
      setError("Impossible de joindre le serveur analytique EDÈN HCR.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  // 2. TÉLÉCHARGEMENT DIRECT D'UN RAPPORT DEPUIS LE SERVEUR DE PRODUCTION
  const handleDownloadReport = async (reportId: string, filename: string) => {
    const token = localStorage.getItem('eden_token');
    setActionMessage(`Préparation de l'extraction de ${filename}...`);

    try {
      window.open(`https://eden-hcr.onrender.com/api/admin/reports/${reportId}/download?token=${token}`, '_blank');
      setActionMessage("Extraction comptable initiée.");
    } catch (err) {
      console.error("Erreur téléchargement rapport :", err);
      setActionMessage("Échec de l'extraction du document.");
    } finally {
      setTimeout(() => setActionMessage(''), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px] space-y-3 font-sans">
        <Loader2 className="animate-spin text-eden-tan" size={32} />
        <p className="text-xs text-eden-text-light font-light tracking-wide">Consolidation des bilans et génération des indicateurs de performance...</p>
      </div>
    );
  }

  return (
    <div className="p-[24px_30px] font-sans space-y-6">
      
      {/* EN-TÊTE */}
      <div className="bg-eden-bg2 border border-eden-border rounded-xl p-5 shadow-xs">
        <div className="space-y-1">
          <h2 className="font-serif font-semibold text-xl text-eden-navy tracking-wide flex items-center gap-2 select-none">
            <BarChart3 size={20} className="text-eden-tan" /> Rapports & Analytics Agence
          </h2>
          <p className="text-xs text-eden-text-light font-light">Suivez l'état de performance de l'activité intérim HCR et exportez vos bilans comptables.</p>
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

      {/* BLOC STATISTIQUES DYNAMIQUES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* HEURES CUMULÉES */}
        <div className="bg-eden-bg2 border border-eden-border rounded-xl p-5 flex items-center gap-4 bg-white">
          <div className="p-3 bg-eden-teal/10 rounded-lg text-eden-teal shrink-0"><Clock size={20} /></div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-eden-text-light font-semibold select-none">Heures Cumulées</p>
            <p className="text-xl font-bold text-eden-navy mt-0.5">
              {stats?.totalHours.toLocaleString('fr-FR') || '0'}h <span className="text-[11px] text-eden-teal font-normal">(ce mois)</span>
            </p>
          </div>
        </div>

        {/* TAUX DE REMPLISSAGE */}
        <div className="bg-eden-bg2 border border-eden-border rounded-xl p-5 flex items-center gap-4 bg-white">
          <div className="p-3 bg-eden-tan/10 rounded-lg text-eden-tan shrink-0"><TrendingUp size={20} /></div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-eden-text-light font-semibold select-none">Taux de Remplissage</p>
            <p className="text-xl font-bold text-eden-navy mt-0.5">
              {stats?.fillingRate.toFixed(1) || '0'}%{' '}
              {stats?.fillingRateDelta !== undefined && (
                <span className={`text-[11px] font-normal ${stats.fillingRateDelta >= 0 ? 'text-eden-tan' : 'text-red-500'}`}>
                  ({stats.fillingRateDelta >= 0 ? `+${stats.fillingRateDelta.toFixed(1)}` : stats.fillingRateDelta.toFixed(1)}%)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* FACTURES ÉMISES */}
        <div className="bg-eden-bg2 border border-eden-border rounded-xl p-5 flex items-center gap-4 bg-white">
          <div className="p-3 bg-eden-orange/10 rounded-lg text-eden-orange shrink-0"><FileSpreadsheet size={20} /></div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-eden-text-light font-semibold select-none">Factures Émises</p>
            <p className="text-xl font-bold text-eden-navy mt-0.5">
              {stats?.issuedInvoicesCount || '0'} {stats && stats.issuedInvoicesCount > 1 ? 'documents' : 'document'}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION EXPORTS DYNAMIQUES DISPONIBLES */}
      <div className="bg-eden-bg2 border border-eden-border rounded-xl p-6 space-y-4 bg-white">
        <h3 className="text-sm font-semibold text-eden-navy select-none">Documents et extractions comptables</h3>
        
        <div className="divide-y divide-eden-border/40 text-xs">
          {reports.map((report) => {
            const reportId = report._id || report.id || '';
            return (
              <div key={reportId} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                <div>
                  <p className="font-medium text-eden-text-dark">{report.title}</p>
                  <p className="text-[11px] text-eden-text-light font-light mt-0.5">
                    Format {report.format} · {report.type === 'urssaf' ? 'À jour en temps réel' : `Généré le ${new Date(report.generatedAt).toLocaleDateString('fr-FR')}`}
                  </p>
                </div>
                
                {report.type === 'urssaf' ? (
                  <a 
                    href={`https://eden-hcr.onrender.com/api/admin/reports/${reportId}/view`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-transparent border border-eden-border hover:border-eden-tan text-eden-text-dark p-[6px_12px] rounded-lg text-[11px] font-medium transition-all cursor-pointer decoration-none"
                  >
                    <ArrowUpRight size={13} /> Ouvrir le registre
                  </a>
                ) : (
                  <button 
                    type="button"
                    onClick={() => handleDownloadReport(reportId, report.title)}
                    className="flex items-center gap-1.5 bg-eden-navy hover:bg-eden-light-navy text-white p-[6px_12px] rounded-lg text-[11px] font-medium transition-colors border-none cursor-pointer shadow-xs"
                  >
                    <Download size={13} /> Télécharger
                  </button>
                )}
              </div>
            );
          })}

          {reports.length === 0 && (
            <div className="text-center py-8 text-eden-text-light font-light italic">
              Aucun document ou rapport n'est actuellement disponible pour extraction.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};