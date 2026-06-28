import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Calendar, FileText, Euro, Briefcase, Clock, LogOut, Bell,
  SlidersHorizontal, Search, CheckCircle, ChevronRight, MapPin,
  Star, MessageSquare, Settings, BarChart2, Download, AlertCircle,
  Send, ArrowLeft, ChevronDown, Upload, PenLine, X, Menu,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { io as socketIO } from 'socket.io-client';
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserType {
  id?: string; _id?: string; prenom?: string; nom?: string; email?: string;
  role?: string; candidatRef?: string; etablissementRef?: string;
  nationalite?: string; titreSejour?: { type?: string; dateExpiration?: string };
}
interface Mission {
  _id: string; posteRecherche?: string; titre?: string; poste?: string;
  briefing?: string; description?: string; lieu?: string; ville?: string;
  dateDebut?: string; dateFin?: string; dateDebutMission?: string;
  dateFinMission?: string; statut?: string; taux?: number; tauxHoraire?: number;
}
interface Contrat {
  _id: string; titre?: string; dateDebut?: string; dateFin?: string;
  statut?: string; poste?: string; signatureData?: string; signéLe?: string;
  etablissement?: string | { nom?: string; nomEtablissement?: string };
  mission?: { posteRecherche?: string } | string;
}
interface Paiement {
  _id: string; mois?: string; montant?: number; statut?: string; dateEmission?: string;
}
interface ChannelMessage {
  _id: string; contenu: string; expediteurId?: string; createdAt?: string; lu?: boolean;
}
interface Channel {
  _id: string; nom?: string; lastMessage?: string; lastMessageAt?: string;
  updatedAt?: string; messages: ChannelMessage[]; participants?: string[]; unreadCount?: number;
}
interface DocumentsData {
  idCardUrl?: string; vitaleCardUrl?: string; ribUrl?: string; titreSejourUrl?: string;
  idCardUploadedAt?: string; vitaleCardUploadedAt?: string; ribUploadedAt?: string; titreSejourUploadedAt?: string;
}
interface Notification {
  id: string; type: string; message: string; contratId?: string; channelId?: string;
  createdAt: Date; read: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const API = 'https://eden-hcr.onrender.com';
const COLORS = ['#073B4C', '#C5A46D', '#118AB2', '#06D6A0', '#FFD166', '#EF476F'];

function getToken() { return localStorage.getItem('eden_token') || localStorage.getItem('token') || ''; }
function getLocalUser(): UserType {
  try { return JSON.parse(localStorage.getItem('eden_user') || '{}'); } catch { return {}; }
}
function authHeaders() { return { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' }; }
function getUserId(user: UserType): string { return user.id || user._id || user.candidatRef || ''; }
function titreContrat(c: Contrat): string {
  if (c.titre) return c.titre; if (c.poste) return c.poste;
  if (typeof c.mission === 'object' && c.mission?.posteRecherche) return c.mission.posteRecherche;
  return 'Contrat';
}
function nomEtabContrat(c: Contrat): string {
  if (!c.etablissement) return '';
  if (typeof c.etablissement === 'string') return c.etablissement;
  return c.etablissement.nom || c.etablissement.nomEtablissement || '';
}
function titreMission(m: Mission): string { return m.posteRecherche || m.titre || m.poste || 'Mission'; }
function channelLabel(ch: Channel): string { return ch.nom || 'Conversation EDÈN'; }
function getTitreStatus(dateStr?: string): 'valide' | 'expire_bientot' | 'expire' | null {
  if (!dateStr) return null;
  const diff = Math.floor((new Date(dateStr).getTime() - Date.now()) / 86400000);
  if (diff < 0) return 'expire'; if (diff <= 90) return 'expire_bientot'; return 'valide';
}

const NAV_SEARCH_MAP: Record<string, string> = {
  mission: 'missions', missions: 'missions', planning: 'planning',
  calendrier: 'planning', contrat: 'contrats', contrats: 'contrats',
  rapport: 'rapports', rapports: 'rapports', paiement: 'paiements',
  paiements: 'paiements', salaire: 'paiements', message: 'messagerie',
  messagerie: 'messagerie', parametre: 'parametres', parametres: 'parametres',
  profil: 'parametres', tableau: 'dashboard', dashboard: 'dashboard',
};

// ─── Signature Pad Component ──────────────────────────────────────────────────

const SignaturePad: React.FC<{
  contrat: Contrat;
  onSigned: (contratId: string) => void;
  onClose: () => void;
}> = ({ contrat, onSigned, onClose }) => {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const src  = 'touches' in e ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const { x, y } = getPos(e, canvas);
    ctx.beginPath(); ctx.moveTo(x, y);
    setDrawing(true); setHasDrawn(true);
  };
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const { x, y } = getPos(e, canvas);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#073B4C'; ctx.lineWidth = 2.5;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.stroke();
  };
  const endDraw = () => setDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSave = async () => {
    const canvas = canvasRef.current; if (!canvas || !hasDrawn) return;
    setSaving(true); setError(null);
    const signatureData = canvas.toDataURL('image/png');
    try {
      const res = await fetch(`${API}/api/admin/contracts/${contrat._id}/sign`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ signatureData }),
      });
      const data = await res.json();
      if (res.ok) { onSigned(contrat._id); }
      else { setError(data.message || 'Erreur lors de la signature.'); }
    } catch { setError('Impossible de contacter le serveur.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E6DDD1]">
          <div>
            <p className="text-[9px] sm:text-[10px] tracking-[2px] sm:tracking-[3px] text-[#C5A46D] uppercase mb-0.5">Signature électronique</p>
            <h3 className="font-bold text-[#073B4C] text-sm sm:text-base">{titreContrat(contrat)}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-[#073B4C] transition-colors p-1">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 sm:p-5 space-y-4">
          <p className="text-xs text-gray-500">En signant, vous acceptez les termes du contrat. Signez dans le cadre ci-dessous avec votre souris ou votre doigt.</p>
          <div className="border-2 border-dashed border-[#E6DDD1] rounded-xl overflow-hidden bg-[#FAFAF8] touch-none">
            <canvas
              ref={canvasRef}
              width={460}
              height={160}
              className="w-full cursor-crosshair touch-none"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />
          </div>
          {!hasDrawn && (
            <p className="text-[11px] text-gray-400 text-center">↑ Dessinez votre signature ici</p>
          )}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
              <AlertCircle size={13} /> <span className="break-words">{error}</span>
            </div>
          )}
          <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
            <button
              onClick={clearCanvas}
              className="order-2 xs:order-1 flex-1 border border-[#E6DDD1] text-gray-500 hover:text-[#073B4C] py-2.5 rounded-xl text-sm transition-colors"
            >
              Effacer
            </button>
            <button
              onClick={handleSave}
              disabled={!hasDrawn || saving}
              className="order-1 xs:order-2 flex-1 bg-[#073B4C] hover:bg-[#0A5268] disabled:opacity-40 disabled:cursor-not-allowed text-white py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {saving
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Enregistrement…</>
                : <><PenLine size={15} /> Signer le contrat</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── DocumentsSection ────────────────────────────────────────────────────────

const DocumentsSection: React.FC<{
  userId: string; token: string; nationalite?: string;
  titreSejour?: { type?: string; dateExpiration?: string };
}> = ({ userId, token, nationalite, titreSejour }) => {
  const [docs, setDocs]           = useState<DocumentsData>({});
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage]     = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isEtranger  = nationalite === 'etranger';
  const titreStatus = getTitreStatus(titreSejour?.dateExpiration);
  const expiration  = titreSejour?.dateExpiration
    ? new Date(titreSejour.dateExpiration).toLocaleDateString('fr-FR') : null;

  useEffect(() => {
    if (!userId || !token) { setLoading(false); return; }
    fetch(`${API}/api/candidat/${userId}`, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { const c = data?.data || data?.candidat || data; if (c?.documents) setDocs(c.documents); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [userId, token]);

  const handleUpload = async (file: File, field: string) => {
    if (!userId || !token) return;
    setUploading(field); setMessage(null);
    const fd = new FormData(); fd.append(field, file);
    try {
      const res  = await fetch(`${API}/api/candidat/${userId}/documents`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
      });
      const data = await res.json();
      if (res.ok) {
        setDocs(prev => ({ ...prev, ...data.data?.documents }));
        setMessage({ type: 'success', text: 'Document enregistré avec succès.' });
      } else { setMessage({ type: 'error', text: data.message || "Erreur lors de l'upload." }); }
    } catch { setMessage({ type: 'error', text: 'Impossible de contacter le serveur.' }); }
    finally { setUploading(null); setTimeout(() => setMessage(null), 4000); }
  };

  const docList = [
    { field: 'idCard',     label: "Pièce d'identité",    sub: 'CNI recto/verso, Passeport',     url: docs.idCardUrl,     uploadedAt: docs.idCardUploadedAt },
    { field: 'vitaleCard', label: 'Attestation Vitale',   sub: 'Carte vitale ou attestation SS', url: docs.vitaleCardUrl, uploadedAt: docs.vitaleCardUploadedAt },
    { field: 'rib',        label: 'RIB',                  sub: "Relevé d'identité bancaire",      url: docs.ribUrl,        uploadedAt: docs.ribUploadedAt },
    ...(isEtranger ? [{ field: 'titreSejour', label: 'Titre de séjour', sub: titreSejour?.type || 'Document officiel', url: docs.titreSejourUrl, uploadedAt: docs.titreSejourUploadedAt }] : []),
  ];

  if (loading) return (
    <div className="bg-white rounded-2xl border border-[#E6DDD1] p-4 sm:p-6 flex items-center justify-center h-32 sm:h-40">
      <div className="w-6 h-6 border-2 border-[#073B4C]/20 border-t-[#073B4C] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-[#E6DDD1] p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
        <div>
          <p className="text-[9px] sm:text-[10px] tracking-[2px] sm:tracking-[3px] text-[#C5A46D] uppercase mb-1">Conformité</p>
          <h2 className="text-lg sm:text-xl font-bold text-[#073B4C]">Mes documents</h2>
        </div>
        <span className="text-xs text-gray-400">{docList.filter(d => d.url).length} / {docList.length} fourni{docList.filter(d => d.url).length > 1 ? 's' : ''}</span>
      </div>

      {isEtranger && titreStatus === 'expire' && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
          <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
          <div><p className="text-xs font-semibold text-red-600">Titre de séjour expiré</p>
            <p className="text-[11px] text-red-500 mt-0.5">Expiré le {expiration}. Contactez EDÈN Group immédiatement.</p></div>
        </div>
      )}
      {isEtranger && titreStatus === 'expire_bientot' && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4">
          <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
          <div><p className="text-xs font-semibold text-amber-600">Titre expire bientôt</p>
            <p className="text-[11px] text-amber-500 mt-0.5">Expire le {expiration}. Engagez le renouvellement rapidement.</p></div>
        </div>
      )}
      {isEtranger && titreStatus === 'valide' && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl mb-4">
          <CheckCircle size={14} className="text-green-500 shrink-0" />
          <p className="text-xs font-semibold text-green-600">Titre valide jusqu'au {expiration}</p>
        </div>
      )}
      {message && (
        <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 text-xs font-medium ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-600' : 'bg-red-50 border border-red-200 text-red-600'}`}>
          {message.type === 'success' ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
          <span className="break-words">{message.text}</span>
        </div>
      )}

      <div className="space-y-3">
        {docList.map(doc => {
          const isUploaded  = !!doc.url;
          const isUploading = uploading === doc.field;
          const isTitre     = doc.field === 'titreSejour';
          const titreExp    = isTitre && titreStatus === 'expire';
          const titreSoon   = isTitre && titreStatus === 'expire_bientot';
          const uploadedDate = doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : null;

          return (
            <div key={doc.field} className={`rounded-xl border p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-all ${titreExp ? 'border-red-200 bg-red-50/30' : titreSoon ? 'border-amber-200 bg-amber-50/30' : isUploaded ? 'border-green-200 bg-green-50/20' : 'border-[#E6DDD1] bg-[#FAFAF8]'}`}>
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${titreExp ? 'bg-red-100 text-red-500' : titreSoon ? 'bg-amber-100 text-amber-500' : isUploaded ? 'bg-green-100 text-green-600' : 'bg-[#F4EFE8] text-[#073B4C]/40'}`}>
                  {titreExp || titreSoon ? <AlertCircle size={14} className="sm:w-4 sm:h-4" /> : isUploaded ? <CheckCircle size={14} className="sm:w-4 sm:h-4" /> : <FileText size={14} className="sm:w-4 sm:h-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-[#073B4C]">{doc.label}</p>
                    {titreExp  && <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-600">Expiré</span>}
                    {titreSoon && <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-600">Expire bientôt</span>}
                    {isUploaded && !titreExp && !titreSoon && <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-600">Fourni</span>}
                    {!isUploaded && <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500">Manquant</span>}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5 truncate">{isUploaded && uploadedDate ? `Uploadé le ${uploadedDate}` : doc.sub}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                {isUploaded && doc.url && (
                  <a href={`${API}${doc.url}`} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-[#F4F1EA] hover:bg-[#E6DDD1] flex items-center justify-center text-gray-500 hover:text-[#073B4C] transition-colors" title="Voir le document">
                    <Download size={14} />
                  </a>
                )}
                <label className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium cursor-pointer transition-colors ${isUploading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : isUploaded ? 'bg-[#F4F1EA] hover:bg-[#E6DDD1] text-[#073B4C]' : 'bg-[#073B4C] hover:bg-[#0A5268] text-white'}`}>
                  {isUploading ? <><div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" /> Envoi…</> : isUploaded ? <><Upload size={12} /> Remplacer</> : <><Upload size={12} /> Uploader</>}
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg" disabled={uploading !== null}
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f, doc.field); }} className="hidden" />
                </label>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[9px] sm:text-[10px] text-gray-400 text-center mt-4">Documents chiffrés et stockés de manière sécurisée. Conformité RGPD.</p>
    </div>
  );
};

// ─── ExtraDashboard ───────────────────────────────────────────────────────────

export const ExtraDashboard = ({
  user: userProp,
  onLogout,
}: {
  user?: UserType;
  onLogout?: () => void;
}) => {
  const [user, setUser]           = useState<UserType>(() => ({ ...getLocalUser(), ...(userProp || {}) }));
  const [missions, setMissions]   = useState<Mission[]>([]);
  const [contrats, setContrats]   = useState<Contrat[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [channels, setChannels]               = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [newMessage, setNewMessage]           = useState('');
  const [sendingMessage, setSendingMessage]   = useState(false);
  const [sendError, setSendError]             = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchQuery, setSearchQuery]     = useState('');
  const [applySuccess, setApplySuccess]   = useState<string | null>(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen]     = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs]       = useState(false);
  const unreadNotifs = notifications.filter(n => !n.read).length;

  // Signature
  const [contratASignerModal, setContratASignerModal] = useState<Contrat | null>(null);

  // ── Socket.io ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const userId = getUserId({ ...getLocalUser(), ...(userProp || {}) });
    if (!userId) return;

    const socket = socketIO(API, { query: { userId }, transports: ['websocket'] });

    socket.on('notification', (payload: { type: string; message: string; contratId?: string; channelId?: string }) => {
      const notif: Notification = {
        id: Math.random().toString(36).slice(2),
        type: payload.type,
        message: payload.message,
        contratId: payload.contratId,
        channelId: payload.channelId,
        createdAt: new Date(),
        read: false,
      };
      setNotifications(prev => [notif, ...prev].slice(0, 20));

      if (payload.type === 'contrat_a_signer' && payload.contratId) {
        fetch(`${API}/api/contrats/${payload.contratId}`, { headers: authHeaders() })
          .then(r => r.ok ? r.json() : null)
          .then(data => {
            const c = data?.data || data;
            if (c?._id) setContratASignerModal(c);
          }).catch(() => {});
      }
    });

    socket.on('new_message', (payload: { channelId: string; message: ChannelMessage }) => {
      setChannels(prev => prev.map(ch => {
        if (ch._id !== payload.channelId) return ch;
        const msgs = [...ch.messages, payload.message];
        return { ...ch, messages: msgs, lastMessage: payload.message.contenu, lastMessageAt: payload.message.createdAt, unreadCount: (ch.unreadCount || 0) + 1 };
      }));
      setSelectedChannel(prev => {
        if (!prev || prev._id !== payload.channelId) return prev;
        return { ...prev, messages: [...prev.messages, payload.message] };
      });
    });

    return () => { socket.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Scroll messages ────────────────────────────────────────────────────────
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [selectedChannel]);

  // ── Chargement initial ─────────────────────────────────────────────────────
  useEffect(() => {
    const token = getToken();
    if (!token) { setError('Session expirée. Veuillez vous reconnecter.'); setLoading(false); return; }
    const h = authHeaders();
    const loadData = async () => {
      setLoading(true); setError(null);
      try {
        const meRes = await fetch(`${API}/api/auth/me`, { headers: h });
        if (meRes.ok) { const { user: u } = await meRes.json(); setUser(prev => ({ ...prev, ...u })); }

        const missionsRes = await fetch(`${API}/api/mission/ouvertes`, { headers: h });
        if (missionsRes.ok) { const j = await missionsRes.json(); setMissions(Array.isArray(j) ? j : (j.data || [])); }

        const userId = getUserId({ ...getLocalUser(), ...(userProp || {}) });
        if (userId) {
          const cRes = await fetch(`${API}/api/contrats/candidat/${userId}`, { headers: h });
          if (cRes.ok) { const j = await cRes.json(); setContrats(Array.isArray(j) ? j : (j.data || j.contrats || [])); }
        }
        try {
          const uid2 = getUserId({ ...getLocalUser(), ...(userProp || {}) });
          if (uid2) {
            const pRes = await fetch(`${API}/api/paiements/candidat/${uid2}`, { headers: h });
            if (pRes.ok) { const j = await pRes.json(); setPaiements(Array.isArray(j) ? j : (j.data || j.paiements || [])); }
          }
        } catch { /* pas encore dispo */ }
        await loadChannels(h);
      } catch (err) {
        console.error('[ExtraDashboard]', err); setError('Erreur de connexion au serveur EDÈN.');
      } finally { setLoading(false); }
    };
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadChannels = async (h = authHeaders()) => {
    try {
      const res = await fetch(`${API}/api/messagerie/channels`, { headers: h });
      if (!res.ok) return;
      const json = await res.json();
      const raw: any[] = Array.isArray(json) ? json : (json.data || json.channels || []);
      const parsed: Channel[] = raw.map((ch: any) => {
        const msgs: ChannelMessage[] = (ch.messages || []).map((msg: any) => ({
          _id: msg._id, contenu: msg.contenu || '', expediteurId: msg.expediteurId, createdAt: msg.createdAt, lu: msg.lu ?? false,
        }));
        msgs.sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime());
        return {
          _id: ch._id, nom: ch.nom,
          lastMessage: ch.lastMessage || msgs[msgs.length - 1]?.contenu || '',
          lastMessageAt: ch.lastMessageAt || ch.updatedAt || msgs[msgs.length - 1]?.createdAt,
          updatedAt: ch.updatedAt, messages: msgs, participants: ch.participants || [],
          unreadCount: msgs.filter(m => !m.lu).length,
        };
      });
      parsed.sort((a, b) => new Date(b.lastMessageAt ?? 0).getTime() - new Date(a.lastMessageAt ?? 0).getTime());
      setChannels(parsed);
      if (selectedChannel) {
        const updated = parsed.find(c => c._id === selectedChannel._id);
        if (updated) setSelectedChannel(updated);
      }
    } catch { /* pas encore dispo */ }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel) return;
    setSendingMessage(true); setSendError(null);
    try {
      const res = await fetch(`${API}/api/messagerie/channels/${selectedChannel._id}/messages`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify({ text: newMessage.trim() }),
      });
      if (res.ok) { setNewMessage(''); await loadChannels(); }
      else { const e = await res.json().catch(() => ({})); setSendError(e.message || "Erreur lors de l'envoi."); }
    } catch { setSendError('Impossible de contacter le serveur.'); }
    finally { setSendingMessage(false); }
  };

  const handlePostuler = async (missionId: string) => {
    try {
      const res = await fetch(`${API}/api/mission/${missionId}/postuler`, { method: 'POST', headers: authHeaders() });
      if (res.ok) { setApplySuccess(missionId); setTimeout(() => setApplySuccess(null), 4000); }
    } catch (e) { console.error('[postuler]', e); }
  };

  const handleContratSigned = (contratId: string) => {
    setContrats(prev => prev.map(c => c._id === contratId ? { ...c, statut: 'signé', signéLe: new Date().toISOString() } : c));
    setContratASignerModal(null);
  };

  const markAllNotifsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value; setSearchQuery(value);
    if (value.length < 2) return;
    const match = Object.keys(NAV_SEARCH_MAP).find(k => value.toLowerCase().includes(k));
    if (match) { const t = NAV_SEARCH_MAP[match]; setActiveSection(t); if (t !== 'messagerie') setSelectedChannel(null); }
  };

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const semaine = (() => {
    const now = new Date(), start = new Date(now.getFullYear(), 0, 1);
    return Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  })();

  const filteredMissions = missions.filter(m =>
    !searchQuery || titreMission(m).toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.briefing?.toLowerCase().includes(searchQuery.toLowerCase()) || m.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = channels.reduce((s, c) => s + (c.unreadCount || 0), 0);
  const totalPaye   = paiements.reduce((s, p) => s + (p.montant || 0), 0);
  const contratsASigner = contrats.filter(c => c.statut === 'en_attente_signature');

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const formatTime = (d?: string) => {
    if (!d) return '';
    const date = new Date(d), now = new Date();
    if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };
  const formatMontant = (n?: number) => n != null ? `${n.toLocaleString('fr-FR')} €` : '—';

  // ── Données graphiques ─────────────────────────────────────────────────────
  const paiementsChartData = paiements.map(p => ({
    name: p.mois || formatDate(p.dateEmission),
    montant: p.montant || 0,
  }));
  const contratsChartData = [
    { name: 'Signés',    value: contrats.filter(c => c.statut === 'signé').length },
    { name: 'En attente', value: contrats.filter(c => c.statut !== 'signé').length },
  ];

  const navSections = [
    { label: 'PRINCIPAL', items: [
      { id: 'dashboard', label: 'Tableau de bord', icon: <BarChart2 size={16} /> },
      { id: 'missions',  label: 'Missions',        icon: <Star size={16} />, badge: missions.length },
    ]},
    { label: 'GESTION', items: [
      { id: 'planning',  label: 'Planning',  icon: <Calendar size={16} /> },
      { id: 'contrats',  label: 'Contrats',  icon: <FileText size={16} />, badge: contratsASigner.length || contrats.length },
      { id: 'rapports',  label: 'Rapports',  icon: <BarChart2 size={16} /> },
      { id: 'paiements', label: 'Paiements', icon: <Euro size={16} /> },
    ]},
    { label: 'OUTILS', items: [
      { id: 'messagerie', label: 'Messagerie', icon: <MessageSquare size={16} />, badge: totalUnread || undefined },
      { id: 'parametres', label: 'Paramètres', icon: <Settings size={16} /> },
    ]},
  ];

  const getSectionTitle = () => navSections.flatMap(s => s.items).find(i => i.id === activeSection)?.label || 'Tableau de bord';
  const displayName   = `${user?.prenom || ''} ${user?.nom || ''}`.trim() || 'Extra';
  const initiale      = user?.prenom?.[0]?.toUpperCase() || user?.nom?.[0]?.toUpperCase() || 'E';
  const currentUserId = getUserId(user);

  return (
    <div className="min-h-screen flex bg-[#F4F1EA]">

      {/* Modal signature */}
      {contratASignerModal && (
        <SignaturePad
          contrat={contratASignerModal}
          onSigned={handleContratSigned}
          onClose={() => setContratASignerModal(null)}
        />
      )}

      {/* SIDEBAR - Responsive avec overlay mobile */}
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-[280px] sm:w-[260px] bg-[#073B4C] text-white 
        flex flex-col transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#C5A46D] flex items-center justify-center flex-shrink-0">
              <span className="text-[#073B4C] font-bold text-xs sm:text-sm">E</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-wide">EDÈN <span className="font-light">Group</span></h1>
              <p className="text-[9px] sm:text-[10px] text-white/50 uppercase tracking-widest">Intérim HCR</p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden text-white/60 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mx-3 sm:mx-4 h-px bg-white/10 mb-2" />
        <nav className="flex-1 px-2 sm:px-3 overflow-y-auto py-2">
          {navSections.map(section => (
            <div key={section.label} className="mb-4 sm:mb-5">
              <p className="text-[9px] sm:text-[10px] tracking-[2px] sm:tracking-[3px] text-[#C5A46D] px-2 sm:px-3 mb-1.5 sm:mb-2">{section.label}</p>
              {section.items.map(item => (
                <button key={item.id}
                  onClick={() => { setActiveSection(item.id); if (item.id !== 'messagerie') setSelectedChannel(null); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl mb-0.5 transition-all text-xs sm:text-sm ${activeSection === item.id ? 'bg-white/15 text-white font-semibold' : 'text-white/60 hover:bg-white/8 hover:text-white'}`}
                >
                  <span className="flex items-center gap-2 sm:gap-2.5">
                    <span className="w-4 h-4 flex items-center justify-center">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badge != null && item.badge > 0 && (
                    <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${item.id === 'messagerie' ? 'bg-orange-400 text-white' : item.id === 'contrats' && contratsASigner.length > 0 ? 'bg-red-400 text-white' : 'bg-[#C5A46D] text-[#073B4C]'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="mx-3 sm:mx-4 h-px bg-white/10 mb-3" />
        <div className="p-3 sm:p-4 pt-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#C5A46D] flex items-center justify-center font-bold text-[#073B4C] text-xs sm:text-sm flex-shrink-0">{initiale}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-semibold truncate">{displayName}</p>
              <p className="text-[10px] sm:text-[11px] text-white/50">Extra EDÈN</p>
            </div>
            <button onClick={onLogout} className="text-white/40 hover:text-white transition-colors p-1" title="Déconnexion"><LogOut size={14} className="sm:w-4 sm:h-4" /></button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-h-screen w-full overflow-x-hidden">

        {/* HEADER - Responsive */}
        <header className="bg-white border-b border-[#E6DDD1] px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-20 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="lg:hidden text-[#073B4C] hover:text-[#C5A46D] transition-colors p-1 flex-shrink-0"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-[#073B4C] truncate">{getSectionTitle()}</h1>
              <p className="text-[10px] sm:text-sm text-gray-400 truncate capitalize">{today} · Semaine {semaine}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-shrink-0">
            {/* Barre de recherche - cachée sur très petit écran */}
            <div className="hidden sm:flex relative">
              <Search size={14} className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Rechercher…" value={searchQuery} onChange={handleSearchChange}
                className="pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 bg-[#F4F1EA] rounded-xl text-xs sm:text-sm text-gray-700 w-28 sm:w-36 lg:w-52 focus:outline-none focus:ring-2 focus:ring-[#073B4C]/20" />
            </div>

            {/* Cloche notifications */}
            <div className="relative">
              <button onClick={() => { setShowNotifs(v => !v); markAllNotifsRead(); }}
                className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F4F1EA] flex items-center justify-center text-gray-500 hover:bg-[#E6DDD1] transition-colors">
                <Bell size={14} className="sm:w-4 sm:h-4" />
                {(unreadNotifs > 0 || totalUnread > 0) && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400 rounded-full animate-pulse" />
                )}
              </button>
              {showNotifs && (
                <div className="absolute right-0 top-10 sm:top-11 w-72 sm:w-80 bg-white border border-[#E6DDD1] rounded-2xl shadow-xl z-30 overflow-hidden max-h-[80vh]">
                  <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#E6DDD1] flex items-center justify-between">
                    <p className="font-semibold text-sm text-[#073B4C]">Notifications</p>
                    <button onClick={() => setShowNotifs(false)} className="text-gray-400 hover:text-[#073B4C]"><X size={14} /></button>
                  </div>
                  <div className="max-h-60 sm:max-h-72 overflow-y-auto divide-y divide-[#F4F1EA]">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-6">Aucune notification</p>
                    ) : notifications.map(n => (
                      <div key={n.id} className={`px-3 sm:px-4 py-2.5 sm:py-3 ${!n.read ? 'bg-[#F4F1EA]' : ''}`}>
                        <p className="text-xs font-medium text-[#073B4C] break-words">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{formatTime(n.createdAt.toISOString())}</p>
                        {n.contratId && (
                          <button
                            onClick={() => {
                              const c = contrats.find(ct => ct._id === n.contratId);
                              if (c) { setContratASignerModal(c); setShowNotifs(false); }
                            }}
                            className="text-[11px] text-[#073B4C] font-semibold mt-1 hover:underline flex items-center gap-1"
                          >
                            <PenLine size={11} /> Signer maintenant
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bouton recherche mobile */}
            <button className="sm:hidden w-8 h-8 rounded-xl bg-[#F4F1EA] flex items-center justify-center text-gray-500 hover:bg-[#E6DDD1] transition-colors">
              <Search size={14} />
            </button>

            <button onClick={() => { setActiveSection('missions'); setSelectedChannel(null); }}
              className="hidden sm:flex w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F4F1EA] items-center justify-center text-gray-500 hover:bg-[#E6DDD1] transition-colors" title="Voir les missions">
              <SlidersHorizontal size={14} className="sm:w-4 sm:h-4" />
            </button>
            <button onClick={() => { setActiveSection('missions'); setSelectedChannel(null); }}
              className="hidden md:flex items-center gap-1.5 sm:gap-2 bg-[#073B4C] hover:bg-[#0A5268] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap">
              + Voir missions
            </button>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-x-hidden">
          {error && (
            <div className="mb-4 sm:mb-6 flex items-start sm:items-center gap-2 sm:gap-3 bg-red-50 border border-red-200 text-red-700 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm">
              <AlertCircle size={14} className="sm:w-4 sm:h-4 shrink-0 mt-0.5 sm:mt-0" /> 
              <span className="break-words">{error}</span>
            </div>
          )}

          {/* Bannière contrats à signer - Responsive */}
          {contratsASigner.length > 0 && activeSection !== 'contrats' && (
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 bg-amber-50 border border-amber-200 text-amber-700 px-4 sm:px-5 py-3 rounded-xl text-xs sm:text-sm">
              <span className="flex items-center gap-2 break-words">
                <PenLine size={14} className="shrink-0" />
                {contratsASigner.length} contrat{contratsASigner.length > 1 ? 's' : ''} en attente de signature
              </span>
              <button onClick={() => setActiveSection('contrats')} className="font-semibold text-amber-800 hover:underline flex items-center gap-1 self-start sm:self-auto">
                Voir <ChevronRight size={14} />
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-40 sm:h-48 text-gray-400 text-xs sm:text-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-[#073B4C]/20 border-t-[#073B4C] rounded-full animate-spin" />
                Chargement de vos données…
              </div>
            </div>
          ) : (
            <>
              {/* ── DASHBOARD ── */}
              {activeSection === 'dashboard' && (
                <div className="space-y-4 sm:space-y-6">
                  {/* KPIs - Grid responsive */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
                    {[
                      { icon: <Star size={16} className="sm:w-5 sm:h-5" />, value: missions.length, label: 'Missions', sub: 'disponibles', action: () => setActiveSection('missions') },
                      { icon: <Calendar size={16} className="sm:w-5 sm:h-5" />, value: 0, label: 'Planning', sub: 'shifts' },
                      { icon: <FileText size={16} className="sm:w-5 sm:h-5" />, value: contrats.length, label: 'Contrats', sub: 'signés', action: () => setActiveSection('contrats') },
                      { icon: <Euro size={16} className="sm:w-5 sm:h-5" />, value: totalPaye > 0 ? formatMontant(totalPaye) : '—', label: 'Total perçu', sub: '', action: () => setActiveSection('paiements') },
                    ].map((kpi, i) => (
                      <div key={i} onClick={kpi.action} className={`bg-white rounded-xl sm:rounded-2xl border border-[#E6DDD1] p-3 sm:p-4 lg:p-5 ${kpi.action ? 'cursor-pointer hover:border-[#073B4C]/30 hover:shadow-sm transition-all' : ''}`}>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#F4EFE8] flex items-center justify-center text-[#073B4C] mb-2 sm:mb-4">
                          {kpi.icon}
                        </div>
                        <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-[#073B4C] break-words">
                          {kpi.value} <span className="text-xs sm:text-base font-normal text-gray-400">{kpi.sub}</span>
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">{kpi.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Graphiques - Responsive */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {/* Paiements */}
                    <div className="bg-white rounded-xl sm:rounded-2xl border border-[#E6DDD1] p-4 sm:p-6">
                      <p className="text-[9px] sm:text-[10px] tracking-[2px] sm:tracking-[3px] text-[#C5A46D] uppercase mb-1">Rémunération</p>
                      <h3 className="font-bold text-[#073B4C] text-sm sm:text-base mb-3 sm:mb-4">Historique des paiements</h3>
                      {paiementsChartData.length > 0 ? (
                        <div className="h-[150px] sm:h-[180px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={paiementsChartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#F4F1EA" />
                              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                              <YAxis tick={{ fontSize: 9 }} />
                              <Tooltip formatter={(value) => value == null ? "" : `${Number(value).toLocaleString("fr-FR")} €`} />
                              <Bar dataKey="montant" fill="#073B4C" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-[150px] sm:h-[180px] flex items-center justify-center text-gray-400 text-xs sm:text-sm">Aucune donnée</div>
                      )}
                    </div>

                    {/* Contrats */}
                    <div className="bg-white rounded-xl sm:rounded-2xl border border-[#E6DDD1] p-4 sm:p-6">
                      <p className="text-[9px] sm:text-[10px] tracking-[2px] sm:tracking-[3px] text-[#C5A46D] uppercase mb-1">Contrats</p>
                      <h3 className="font-bold text-[#073B4C] text-sm sm:text-base mb-3 sm:mb-4">État des contrats</h3>
                      {contrats.length > 0 ? (
                        <div className="h-[150px] sm:h-[180px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={contratsChartData} cx="50%" cy="50%" outerRadius={55} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false} fontSize={9}>
                                {contratsChartData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-[150px] sm:h-[180px] flex items-center justify-center text-gray-400 text-xs sm:text-sm">Aucun contrat</div>
                      )}
                    </div>
                  </div>

                  {/* Profil + missions - Responsive */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                    <div className="bg-white rounded-xl sm:rounded-2xl border border-[#E6DDD1] p-4 sm:p-6 flex flex-col gap-3 sm:gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#C5A46D] flex items-center justify-center font-bold text-[#073B4C] text-base sm:text-lg">{initiale}</div>
                        <div>
                          <p className="font-bold text-[#073B4C] text-sm sm:text-base break-words">{displayName}</p>
                          <p className="text-[10px] sm:text-xs text-gray-400 break-all">{user?.email}</p>
                        </div>
                      </div>
                      <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between"><span className="text-gray-400">Rôle</span><span className="font-medium text-[#073B4C] capitalize break-words">{user?.role || 'Extra'}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Missions dispo.</span><span className="font-medium text-[#073B4C]">{missions.length}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Contrats</span><span className="font-medium text-[#073B4C]">{contrats.length}</span></div>
                        {totalPaye > 0 && <div className="flex justify-between"><span className="text-gray-400">Total perçu</span><span className="font-medium text-[#073B4C] break-words">{formatMontant(totalPaye)}</span></div>}
                      </div>
                      <button onClick={() => setActiveSection('parametres')} className="mt-auto text-xs text-[#073B4C]/60 hover:text-[#073B4C] flex items-center gap-1 transition-colors">
                        <Settings size={12} /> Voir mon profil
                      </button>
                    </div>
                    <div className="md:col-span-2 bg-white rounded-xl sm:rounded-2xl border border-[#E6DDD1] p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
                        <div>
                          <p className="text-[9px] sm:text-[10px] tracking-[2px] sm:tracking-[3px] text-[#C5A46D] uppercase mb-1">Opportunités</p>
                          <h2 className="font-bold text-[#073B4C] text-sm sm:text-base">Missions disponibles</h2>
                        </div>
                        <button onClick={() => setActiveSection('missions')} className="text-xs text-[#073B4C]/60 hover:text-[#073B4C] flex items-center gap-1 self-start sm:self-auto">Voir tout <ChevronRight size={12} /></button>
                      </div>
                      {missions.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-[#E6DDD1] p-6 sm:p-8 text-center">
                          <Briefcase className="mx-auto text-[#E6DDD1] mb-2" size={24} />
                          <p className="text-gray-400 text-xs sm:text-sm">Aucune mission disponible.</p>
                        </div>
                      ) : (
                        <div className="space-y-2 sm:space-y-3">
                          {missions.slice(0, 3).map(m => (
                            <div key={m._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 rounded-xl border border-[#E6DDD1] px-3 sm:px-4 py-2.5 sm:py-3 hover:border-[#073B4C]/20 transition-all">
                              <div className="min-w-0">
                                <p className="font-semibold text-sm text-[#073B4C] break-words">{titreMission(m)}</p>
                                <p className="text-xs text-gray-400 mt-0.5 break-words">{m.lieu || m.ville || ''}{(m.dateDebut || m.dateDebutMission) ? ` · ${formatDate(m.dateDebut || m.dateDebutMission)}` : ''}</p>
                              </div>
                              {applySuccess === m._id
                                ? <span className="flex items-center gap-1 text-green-600 text-xs font-medium whitespace-nowrap"><CheckCircle size={13} /> Envoyée</span>
                                : <button onClick={() => handlePostuler(m._id)} className="text-xs bg-[#073B4C] text-white px-3 py-1.5 rounded-lg hover:bg-[#0A5268] transition-colors whitespace-nowrap self-start sm:self-auto">Postuler</button>
                              }
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── MISSIONS ── */}
              {activeSection === 'missions' && (
                <div className="bg-white rounded-xl sm:rounded-2xl border border-[#E6DDD1] p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-5">
                    <div>
                      <p className="text-[9px] sm:text-[10px] tracking-[2px] sm:tracking-[3px] text-[#C5A46D] uppercase mb-1">Opportunités</p>
                      <h2 className="text-lg sm:text-xl font-bold text-[#073B4C]">Missions disponibles</h2>
                    </div>
                    {filteredMissions.length > 0 && <span className="text-xs sm:text-sm text-gray-400">{filteredMissions.length} mission{filteredMissions.length > 1 ? 's' : ''}</span>}
                  </div>
                  {filteredMissions.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#E6DDD1] p-10 sm:p-14 text-center">
                      <Briefcase className="mx-auto text-[#E6DDD1] mb-3" size={28} />
                      <p className="text-gray-400 text-xs sm:text-sm">Aucune mission disponible actuellement.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {filteredMissions.map(m => (
                        <div key={m._id} className="rounded-xl border border-[#E6DDD1] p-4 sm:p-5 hover:border-[#073B4C]/20 hover:shadow-sm transition-all">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                                <h3 className="font-semibold text-[#073B4C] text-sm sm:text-base break-words">{titreMission(m)}</h3>
                                <span className="text-[9px] sm:text-[10px] bg-[#F4EFE8] text-[#C5A46D] px-2 py-0.5 rounded-full font-medium uppercase">{m.statut || 'Disponible'}</span>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-500 break-words">{m.briefing || m.description || ''}</p>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-3 text-[10px] sm:text-xs text-gray-400">
                                {(m.lieu || m.ville) && <span className="flex items-center gap-1"><MapPin size={11} /> {m.lieu || m.ville}</span>}
                                {(m.dateDebut || m.dateDebutMission) && <span className="flex items-center gap-1"><Clock size={11} />{formatDate(m.dateDebut || m.dateDebutMission)}{(m.dateFin || m.dateFinMission) ? ` → ${formatDate(m.dateFin || m.dateFinMission)}` : ''}</span>}
                                {(m.taux || m.tauxHoraire) && <span className="flex items-center gap-1"><Euro size={11} /> {m.taux || m.tauxHoraire} €/h</span>}
                              </div>
                            </div>
                            <div className="flex-shrink-0 self-start sm:self-auto">
                              {applySuccess === m._id
                                ? <span className="flex items-center gap-1.5 text-green-600 text-xs sm:text-sm font-medium"><CheckCircle size={14} /> Candidature envoyée</span>
                                : <button onClick={() => handlePostuler(m._id)} className="flex items-center gap-1 bg-[#073B4C] hover:bg-[#0A5268] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-colors">Postuler <ChevronRight size={14} /></button>
                              }
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── PLANNING ── */}
              {activeSection === 'planning' && (
                <div className="bg-white rounded-xl sm:rounded-2xl border border-[#E6DDD1] p-4 sm:p-6">
                  <div className="mb-4 sm:mb-5">
                    <p className="text-[9px] sm:text-[10px] tracking-[2px] sm:tracking-[3px] text-[#C5A46D] uppercase mb-1">Calendrier</p>
                    <h2 className="text-lg sm:text-xl font-bold text-[#073B4C]">Mon planning</h2>
                  </div>
                  <div className="rounded-xl border border-dashed border-[#E6DDD1] p-10 sm:p-14 text-center">
                    <Calendar className="mx-auto text-[#E6DDD1] mb-3" size={28} />
                    <p className="text-gray-400 text-xs sm:text-sm">Aucun shift planifié pour le moment.</p>
                  </div>
                </div>
              )}

              {/* ── CONTRATS ── */}
              {activeSection === 'contrats' && (
                <div className="space-y-4 sm:space-y-5">
                  {/* Contrats à signer en priorité */}
                  {contratsASigner.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl sm:rounded-2xl p-4 sm:p-5">
                      <p className="text-[9px] sm:text-[10px] tracking-[2px] sm:tracking-[3px] text-amber-600 uppercase mb-2">Action requise</p>
                      <h3 className="font-bold text-amber-800 text-sm sm:text-base mb-3">Contrats en attente de signature</h3>
                      <div className="space-y-2">
                        {contratsASigner.map(c => (
                          <div key={c._id} className="bg-white rounded-xl border border-amber-200 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold text-[#073B4C] text-sm sm:text-base break-words">{titreContrat(c)}</p>
                              <p className="text-xs text-gray-400 mt-0.5 break-words">{nomEtabContrat(c)}{c.dateDebut ? ` · Du ${formatDate(c.dateDebut)}` : ''}</p>
                            </div>
                            <button onClick={() => setContratASignerModal(c)}
                              className="flex items-center gap-1.5 bg-[#073B4C] hover:bg-[#0A5268] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-colors self-start sm:self-auto">
                              <PenLine size={14} /> Signer
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-white rounded-xl sm:rounded-2xl border border-[#E6DDD1] p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-5">
                      <div>
                        <p className="text-[9px] sm:text-[10px] tracking-[2px] sm:tracking-[3px] text-[#C5A46D] uppercase mb-1">Documents</p>
                        <h2 className="text-lg sm:text-xl font-bold text-[#073B4C]">Mes contrats</h2>
                      </div>
                      {contrats.length > 0 && <span className="text-xs sm:text-sm text-gray-400">{contrats.length} contrat{contrats.length > 1 ? 's' : ''}</span>}
                    </div>
                    {contrats.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-[#E6DDD1] p-10 sm:p-14 text-center">
                        <FileText className="mx-auto text-[#E6DDD1] mb-3" size={28} />
                        <p className="text-gray-400 text-xs sm:text-sm">Aucun contrat disponible.</p>
                      </div>
                    ) : (
                      <div className="space-y-2 sm:space-y-3">
                        {contrats.map(c => (
                          <div key={c._id} className="rounded-xl border border-[#E6DDD1] p-3 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 hover:border-[#073B4C]/20 transition-all">
                            <div className="min-w-0">
                              <p className="font-semibold text-[#073B4C] text-sm sm:text-base break-words">{titreContrat(c)}</p>
                              <p className="text-xs text-gray-400 mt-1 break-words">{nomEtabContrat(c) ? `${nomEtabContrat(c)} · ` : ''}{formatDate(c.dateDebut)}{c.dateFin ? ` → ${formatDate(c.dateFin)}` : ''}</p>
                              {c.signéLe && <p className="text-[11px] text-green-600 mt-0.5">Signé le {formatDate(c.signéLe)}</p>}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                              {c.statut && (
                                <span className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${c.statut === 'signé' ? 'bg-green-50 text-green-600' : c.statut === 'en_attente_signature' ? 'bg-amber-50 text-amber-600' : c.statut === 'en attente' ? 'bg-yellow-50 text-yellow-600' : 'bg-[#F4EFE8] text-[#C5A46D]'}`}>{c.statut}</span>
                              )}
                              {c.statut === 'en_attente_signature' && (
                                <button onClick={() => setContratASignerModal(c)}
                                  className="flex items-center gap-1 bg-[#073B4C] text-white px-2.5 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-medium hover:bg-[#0A5268] transition-colors">
                                  <PenLine size={12} /> Signer
                                </button>
                              )}
                              <button className="text-gray-400 hover:text-[#073B4C] transition-colors p-1" title="Télécharger"><Download size={14} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── RAPPORTS ── */}
              {activeSection === 'rapports' && (
                <div className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
                    {[
                      { label: 'Missions disponibles', value: missions.length },
                      { label: 'Contrats signés',      value: contrats.filter(c => c.statut === 'signé').length },
                      { label: 'Total perçu',          value: totalPaye ? formatMontant(totalPaye) : '—' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white rounded-xl sm:rounded-2xl border border-[#E6DDD1] p-4 sm:p-5">
                        <p className="text-xl sm:text-2xl font-bold text-[#073B4C] break-words">{stat.value}</p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 break-words">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {paiementsChartData.length > 0 && (
                    <div className="bg-white rounded-xl sm:rounded-2xl border border-[#E6DDD1] p-4 sm:p-6">
                      <p className="text-[9px] sm:text-[10px] tracking-[2px] sm:tracking-[3px] text-[#C5A46D] uppercase mb-1">Évolution</p>
                      <h3 className="font-bold text-[#073B4C] text-sm sm:text-base mb-3 sm:mb-4">Paiements reçus</h3>
                      <div className="h-[180px] sm:h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={paiementsChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F4F1EA" />
                            <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                            <YAxis tick={{ fontSize: 9 }} />
                            <Tooltip formatter={(value) => value == null ? "" : `${Number(value).toLocaleString("fr-FR")} €`} />
                            <Line type="monotone" dataKey="montant" stroke="#073B4C" strokeWidth={2} dot={{ fill: '#C5A46D', r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── PAIEMENTS ── */}
              {activeSection === 'paiements' && (
                <div className="bg-white rounded-xl sm:rounded-2xl border border-[#E6DDD1] p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-5">
                    <div>
                      <p className="text-[9px] sm:text-[10px] tracking-[2px] sm:tracking-[3px] text-[#C5A46D] uppercase mb-1">Rémunération</p>
                      <h2 className="text-lg sm:text-xl font-bold text-[#073B4C]">Mes fiches de paie</h2>
                    </div>
                    {paiements.length > 0 && <span className="text-xs sm:text-sm text-gray-400">{paiements.length} fiche{paiements.length > 1 ? 's' : ''}</span>}
                  </div>
                  {paiements.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#E6DDD1] p-10 sm:p-14 text-center">
                      <Euro className="mx-auto text-[#E6DDD1] mb-3" size={28} />
                      <p className="text-gray-400 text-xs sm:text-sm">Aucune fiche de paie disponible.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {paiements.map(p => (
                        <div key={p._id} className="rounded-xl border border-[#E6DDD1] p-3 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 hover:border-[#073B4C]/20 transition-all">
                          <div>
                            <p className="font-semibold text-[#073B4C] text-sm sm:text-base break-words">{p.mois || formatDate(p.dateEmission)}</p>
                            <p className="text-xs text-gray-400 mt-0.5 break-words">{formatDate(p.dateEmission)}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                            <p className="font-bold text-[#073B4C] text-sm sm:text-base break-words">{formatMontant(p.montant)}</p>
                            {p.statut && <span className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${p.statut === 'payé' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>{p.statut}</span>}
                            <button className="text-gray-400 hover:text-[#073B4C] transition-colors p-1" title="Télécharger"><Download size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── MESSAGERIE ── */}
              {activeSection === 'messagerie' && (
                <div className="bg-white rounded-xl sm:rounded-2xl border border-[#E6DDD1] overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
                  <div className="flex flex-col md:flex-row h-full">
                    {/* Liste des conversations - cachée sur mobile quand une conversation est sélectionnée */}
                    <div className={`${selectedChannel ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[300px] lg:w-[320px] border-r border-[#E6DDD1] h-full`}>
                      <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-[#E6DDD1] flex items-center justify-between flex-shrink-0">
                        <div>
                          <p className="text-[9px] sm:text-[10px] tracking-[2px] sm:tracking-[3px] text-[#C5A46D] uppercase mb-0.5">Communication</p>
                          <h2 className="font-bold text-[#073B4C] text-base sm:text-lg">Messagerie</h2>
                        </div>
                        {totalUnread > 0 && <span className="bg-orange-100 text-orange-600 text-[10px] sm:text-xs font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">{totalUnread} non lu{totalUnread > 1 ? 's' : ''}</span>}
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        {channels.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-center px-4 sm:px-6 py-8 sm:py-12">
                            <MessageSquare className="text-[#E6DDD1] mb-3" size={28} />
                            <p className="text-gray-400 text-xs sm:text-sm">Aucune conversation.</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-[#F4F1EA]">
                            {channels.map(ch => {
                              const isActive  = selectedChannel?._id === ch._id;
                              const hasUnread = (ch.unreadCount || 0) > 0;
                              return (
                                <button key={ch._id} onClick={() => setSelectedChannel(ch)}
                                  className={`w-full text-left px-4 sm:px-5 py-3 sm:py-4 flex items-start gap-2 sm:gap-3 transition-all ${isActive ? 'bg-[#073B4C]/5 border-l-2 border-l-[#073B4C]' : 'hover:bg-[#F4F1EA] border-l-2 border-l-transparent'}`}>
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#073B4C] flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-white text-[10px] sm:text-xs font-bold">E</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                                      <p className={`text-xs sm:text-sm truncate ${hasUnread ? 'font-bold text-[#073B4C]' : 'font-medium text-gray-700'}`}>{channelLabel(ch)}</p>
                                      <span className="text-[9px] sm:text-[10px] text-gray-400 flex-shrink-0">{formatTime(ch.lastMessageAt)}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-1 sm:gap-2">
                                      <p className={`text-[10px] sm:text-xs truncate ${hasUnread ? 'text-gray-600' : 'text-gray-400'}`}>{ch.lastMessage || 'Aucun message'}</p>
                                      {hasUnread && <span className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 bg-orange-400 text-white text-[8px] sm:text-[10px] font-bold rounded-full flex items-center justify-center">{ch.unreadCount}</span>}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Zone de conversation */}
                    {selectedChannel ? (
                      <div className="flex-1 flex flex-col min-w-0 h-full">
                        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#E6DDD1] flex items-center gap-2 sm:gap-3 flex-shrink-0 bg-white">
                          <button onClick={() => setSelectedChannel(null)} className="md:hidden text-gray-400 hover:text-[#073B4C] transition-colors p-1"><ArrowLeft size={18} /></button>
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#073B4C] flex items-center justify-center flex-shrink-0"><span className="text-white text-[10px] sm:text-xs font-bold">E</span></div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[#073B4C] text-sm sm:text-base truncate">{channelLabel(selectedChannel)}</p>
                            <p className="text-[10px] sm:text-xs text-gray-400">{selectedChannel.messages.length} message{selectedChannel.messages.length > 1 ? 's' : ''}</p>
                          </div>
                          <button onClick={() => loadChannels()} className="text-gray-400 hover:text-[#073B4C] transition-colors text-[10px] sm:text-xs flex items-center gap-1 p-1">
                            <ChevronDown size={14} className="rotate-180" />
                          </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-5 space-y-3 sm:space-y-4 bg-[#FAFAF8]">
                          {selectedChannel.messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                              <MessageSquare className="text-[#E6DDD1] mb-3" size={24} />
                              <p className="text-gray-400 text-xs sm:text-sm">Aucun message.</p>
                            </div>
                          ) : (
                            <>
                              {selectedChannel.messages.map((msg, idx) => {
                                const isOwn    = msg.expediteurId === currentUserId;
                                const showDate = idx === 0 || new Date(msg.createdAt ?? 0).toDateString() !== new Date(selectedChannel.messages[idx - 1]?.createdAt ?? 0).toDateString();
                                return (
                                  <React.Fragment key={msg._id}>
                                    {showDate && (
                                      <div className="flex items-center gap-2 sm:gap-3 my-3 sm:my-4">
                                        <div className="flex-1 h-px bg-[#E6DDD1]" />
                                        <span className="text-[9px] sm:text-[10px] text-gray-400 text-center">{new Date(msg.createdAt ?? 0).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                                        <div className="flex-1 h-px bg-[#E6DDD1]" />
                                      </div>
                                    )}
                                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                      <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col gap-0.5 sm:gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
                                        <div className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm leading-relaxed break-words ${isOwn ? 'bg-[#073B4C] text-white rounded-br-md' : 'bg-white text-gray-800 border border-[#E6DDD1] rounded-bl-md shadow-sm'}`}>
                                          {msg.contenu}
                                        </div>
                                        <span className="text-[9px] sm:text-[10px] text-gray-400 px-1">{formatTime(msg.createdAt)}</span>
                                      </div>
                                    </div>
                                  </React.Fragment>
                                );
                              })}
                              <div ref={messagesEndRef} />
                            </>
                          )}
                        </div>
                        <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-[#E6DDD1] bg-white flex-shrink-0">
                          {sendError && <p className="text-[10px] sm:text-xs text-red-500 mb-1.5 sm:mb-2 flex items-center gap-1"><AlertCircle size={12} /> <span className="break-words">{sendError}</span></p>}
                          <div className="flex items-end gap-2 sm:gap-3">
                            <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                              placeholder="Écrire un message…" rows={1}
                              className="flex-1 resize-none bg-[#F4F1EA] rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#073B4C]/20 min-h-[36px] sm:min-h-[44px] max-h-28 sm:max-h-32"
                              style={{ lineHeight: '1.5' }} />
                            <button onClick={handleSendMessage} disabled={!newMessage.trim() || sendingMessage}
                              className="flex-shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#073B4C] hover:bg-[#0A5268] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all">
                              {sendingMessage ? <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={14} className="sm:w-4 sm:h-4" />}
                            </button>
                          </div>
                          <p className="text-[9px] sm:text-[10px] text-gray-300 mt-1 sm:mt-2 text-right">Shift+Entrée pour aller à la ligne</p>
                        </div>
                      </div>
                    ) : (
                      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#FAFAF8] text-center px-8 sm:px-12">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#F4EFE8] flex items-center justify-center mb-3 sm:mb-4">
                          <MessageSquare className="text-[#C5A46D]" size={24} />
                        </div>
                        <p className="font-semibold text-[#073B4C] text-sm sm:text-base mb-0.5 sm:mb-1">Sélectionnez une conversation</p>
                        <p className="text-xs sm:text-sm text-gray-400">Choisissez un échange dans la liste pour lire et répondre.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── PARAMÈTRES ── */}
              {activeSection === 'parametres' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-white rounded-xl sm:rounded-2xl border border-[#E6DDD1] p-4 sm:p-6">
                    <div className="mb-4 sm:mb-6">
                      <p className="text-[9px] sm:text-[10px] tracking-[2px] sm:tracking-[3px] text-[#C5A46D] uppercase mb-1">Compte</p>
                      <h2 className="text-lg sm:text-xl font-bold text-[#073B4C]">Mes informations</h2>
                    </div>
                    <div className="space-y-2 sm:space-y-3 max-w-lg">
                      {[
                        { label: 'Prénom', value: user?.prenom },
                        { label: 'Nom',    value: user?.nom },
                        { label: 'Email',  value: user?.email },
                        { label: 'Rôle',   value: user?.role },
                      ].map((field, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between py-2 sm:py-3 border-b border-[#E6DDD1] gap-1 sm:gap-0">
                          <span className="text-xs sm:text-sm text-gray-500">{field.label}</span>
                          <span className="text-xs sm:text-sm font-medium text-[#073B4C] break-words">{field.value || '—'}</span>
                        </div>
                      ))}
                      <button onClick={onLogout} className="mt-2 sm:mt-4 flex items-center gap-2 text-xs sm:text-sm text-red-500 hover:text-red-600 transition-colors">
                        <LogOut size={14} /> Se déconnecter
                      </button>
                    </div>
                  </div>
                  <DocumentsSection userId={getUserId(user)} token={getToken()} nationalite={user?.nationalite} titreSejour={user?.titreSejour} />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Bouton déconnexion flottant - responsive */}
      <button onClick={onLogout} className="fixed bottom-3 sm:bottom-6 right-3 sm:right-6 flex items-center gap-1.5 sm:gap-2 bg-[#073B4C] text-white/70 hover:text-white text-[10px] sm:text-sm px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl shadow-lg hover:bg-[#0A5268] transition-all z-10">
        <LogOut size={12} className="sm:w-3.5 sm:h-3.5" /> Déconnexion
      </button>
    </div>
  );
};