import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MessageSquare, Send, Search, Megaphone, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface Channel {
  _id: string;
  id?: string;
  name: string;
  role: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  isUrgent?: boolean;
  realChannelId?: string; // _id MongoDB du channel une fois résolu
}

interface Message {
  _id: string;
  id?: string;
  sender: 'admin' | 'extra';
  text: string;
  time: string;
}

interface Candidate {
  _id: string;
  firstName?: string;
  lastName?: string;
  prenom?: string;
  nom?: string;
  role?: string;
  metier?: string;
  email?: string;
  phone?: string;
  telephone?: string;
  status?: string;
  statutCompte?: string;
  createdAt?: string;
}

const API = 'https://eden-hcr.onrender.com';

const candidateToChannel = (c: Candidate): Channel => {
  const firstName = c.firstName || c.prenom || '';
  const lastName  = c.lastName  || c.nom    || '';
  const fullName  = `${firstName} ${lastName}`.trim() || 'Extra';
  const role      = c.role || c.metier || 'Extra HCR';
  const initials  = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || 'EX';

  return {
    _id:         c._id,
    name:        fullName,
    role,
    lastMessage: 'Aucun message pour le moment',
    time:        '',
    unread:      0,
    avatar:      initials,
  };
};

export const MessageManager: React.FC = () => {
  const [channels, setChannels]             = useState<Channel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string>('');
  const [messages, setMessages]             = useState<Record<string, Message[]>>({});
  const [newMessageText, setNewMessageText] = useState('');
  const [searchTerm, setSearchTerm]         = useState('');
  const [isLoading, setIsLoading]           = useState<boolean>(true);
  const [error, setError]                   = useState<string>('');
  const [actionMessage, setActionMessage]   = useState<string>('');
  const [broadcastMode, setBroadcastMode]   = useState(false);
  const [broadcastText, setBroadcastText]   = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState('serveur');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // userId de l'admin connecté (pour distinguer ses messages)
  const adminUserIdRef = useRef<string>('');

  useEffect(() => {
    const stored = localStorage.getItem('eden_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        adminUserIdRef.current = parsed.id || parsed._id || '';
      } catch {}
    }
  }, []);

  // ── Chargement des conversations ────────────────────────────────────────────
  const fetchConversations = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError('');
    const token = localStorage.getItem('eden_token');

    try {
      const res = await fetch(`${API}/api/admin/messages/channels`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });

      const resData = await res.json();
      let loadedChannels: Channel[] = [];

      if (res.ok) {
        const raw: any[] = Array.isArray(resData.data) ? resData.data : [];

        // Channels MongoDB → format UI
        loadedChannels = raw.map((ch: any) => {
          const other = ch.participants?.find(
            (p: any) => String(p._id) !== adminUserIdRef.current
          );
          const firstName = other?.prenom || other?.nom?.split(' ')?.[0] || '';
          const lastName  = other?.nom    || '';
          const fullName  = other
            ? `${other.prenom || ''} ${other.nom || ''}`.trim() || other.email || 'Extra'
            : 'Extra';
          const initials  = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || 'EX';

          return {
            _id:           ch._id,
            realChannelId: ch._id,
            name:          fullName,
            role:          other?.role || 'Extra HCR',
            lastMessage:   ch.lastMessage || 'Aucun message pour le moment',
            time:          ch.lastMessageAt
              ? new Date(ch.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '',
            unread:  ch.unread || 0,
            avatar:  initials,
          };
        });
      }

      // Fallback : liste des candidats si aucun channel existant
      if (loadedChannels.length === 0) {
        const resCandidates = await fetch(`${API}/api/admin/candidates`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
        });

        if (resCandidates.ok) {
          const candidateData = await resCandidates.json();
          const rawList: Candidate[] = Array.isArray(candidateData.data)
            ? candidateData.data
            : Array.isArray(candidateData) ? candidateData : [];
          loadedChannels = rawList.map(candidateToChannel);
        }
      }

      setChannels(loadedChannels);

      if (loadedChannels.length > 0 && !activeChannelId) {
        setActiveChannelId(loadedChannels[0]._id);
      }

    } catch (err) {
      console.error('Erreur MessageManager fetch :', err);
      setError('Échec de synchronisation avec le serveur de messagerie EDÈN.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchConversations(); }, []);

  const activeChannel = useMemo(() => {
    if (!Array.isArray(channels)) return undefined;
    return channels.find(c => c._id === activeChannelId || c.id === activeChannelId);
  }, [channels, activeChannelId]);

  // ── Ouverture d'une conversation ────────────────────────────────────────────
  const openConversation = async (candidateOrChannelId: string) => {
    const token = localStorage.getItem('eden_token');

    try {
      const response = await fetch(
        `${API}/api/admin/messages/channels/${candidateOrChannelId}`,
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
      );

      const data = await response.json();
      if (!response.ok) { console.error(data); return; }

      const ch = data.data;
      const realId = ch._id;

      // Convertit les messages backend → format UI
      const convertedMessages: Message[] = (ch.messages || []).map((m: any) => ({
        _id:    m._id,
        sender: String(m.expediteurId) === adminUserIdRef.current ? 'admin' : 'extra',
        text:   m.contenu,
        time:   new Date(m.createdAt || Date.now()).toLocaleTimeString([], {
          hour: '2-digit', minute: '2-digit'
        })
      }));

      // Met à jour la liste : remplace l'entrée candidat par le vrai channel
      setChannels(prev => prev.map(c =>
        c._id === candidateOrChannelId
          ? {
              ...c,
              _id:           realId,
              realChannelId: realId,
              lastMessage:   ch.lastMessage || c.lastMessage,
              time:          ch.lastMessageAt
                ? new Date(ch.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : c.time
            }
          : c
      ));

      setMessages(prev => ({ ...prev, [realId]: convertedMessages }));
      setActiveChannelId(realId);

    } catch (err) {
      console.error('Erreur ouverture conversation :', err);
    }
  };

  // ── Envoi d'un message ──────────────────────────────────────────────────────
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeChannelId) return;

    const token = localStorage.getItem('eden_token');
    const textToSend = newMessageText;
    setNewMessageText('');

    const optimisticMsg: Message = {
      _id:    `local_${Date.now()}`,
      sender: 'admin',
      text:   textToSend,
      time:   new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), optimisticMsg]
    }));

    setChannels(prev => prev.map(c =>
      c._id === activeChannelId
        ? { ...c, lastMessage: textToSend, time: optimisticMsg.time, unread: 0 }
        : c
    ));

    try {
      const response = await fetch(`${API}/api/admin/messages/channels/${activeChannelId}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ text: textToSend })
      });

      if (!response.ok) {
        const resData = await response.json();
        setActionMessage(`Erreur d'envoi : ${resData.message}`);
        setMessages(prev => ({
          ...prev,
          [activeChannelId]: (prev[activeChannelId] || []).filter(m => m._id !== optimisticMsg._id)
        }));
        setNewMessageText(textToSend);
      }
    } catch (err) {
      console.error('Erreur envoi message :', err);
      setActionMessage('Connexion instable — message enregistré localement.');
    } finally {
      setTimeout(() => setActionMessage(''), 3000);
    }
  };

  // ── Broadcast ───────────────────────────────────────────────────────────────
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;

    setIsBroadcasting(true);
    setActionMessage('');
    const token = localStorage.getItem('eden_token');

    const missionPayload = {
      posteRecherche:  broadcastTarget === 'serveur' ? 'Chef de Rang' : broadcastTarget === 'barman' ? 'Mixologue' : 'Chef de Partie',
      dateDebut:       new Date(),
      dateFin:         new Date(Date.now() + 8 * 60 * 60 * 1000),
      nombreExtras:    1,
      tauxHoraireBrut: 19.5,
      briefing:        broadcastText,
      statutMission:   'ouverte'
    };

    try {
      const response = await fetch(`${API}/api/admin/missions/broadcast`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(missionPayload)
      });

      const data = await response.json();

      if (response.ok) {
        setActionMessage("Alerte d'urgence diffusée et enregistrée sur Atlas !");
        setBroadcastText('');
        setBroadcastMode(false);
      } else {
        setActionMessage(`Erreur : ${data.message}`);
      }
    } catch {
      setActionMessage('Échec de la diffusion générale.');
    } finally {
      setIsBroadcasting(false);
      setTimeout(() => setActionMessage(''), 4000);
    }
  };

  const filteredChannels = useMemo(() => {
    if (!Array.isArray(channels)) return [];
    return channels.filter(c =>
      (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.role || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [channels, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[450px] space-y-3 font-sans">
        <Loader2 className="animate-spin text-eden-tan" size={32} />
        <p className="text-xs text-eden-text-light font-light tracking-wide">Établissement du tunnel de messagerie sécurisé...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 font-sans max-w-[1600px] mx-auto h-[calc(100vh-80px)] flex flex-col gap-6 animate-[fadeInUp_0.4s_ease-out]">
      <div className="flex-1 bg-eden-bg2 border border-eden-border rounded-2xl overflow-hidden shadow-xl flex h-full min-h-0">

        {/* ── COLONNE GAUCHE ── */}
        <div className="w-full sm:w-[350px] md:w-[400px] border-r border-eden-border/60 flex flex-col shrink-0 bg-eden-bg2/50">
          <div className="p-4 border-b border-eden-border/60 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-serif text-eden-navy flex items-center gap-2 select-none">
                <MessageSquare size={16} className="text-eden-tan" /> Conversations Extra
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => fetchConversations(true)}
                  className="p-1.5 text-eden-text-light hover:text-eden-navy bg-transparent border-none cursor-pointer rounded-lg hover:bg-eden-bg transition-colors"
                  title="Actualiser"
                >
                  <RefreshCw size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setBroadcastMode(!broadcastMode)}
                  className={`flex items-center gap-1.5 p-1.5 px-3 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border border-solid ${broadcastMode ? 'bg-eden-orange text-white border-eden-orange shadow-md' : 'bg-eden-navy/5 text-eden-navy border-eden-navy/10 hover:bg-eden-navy/10'}`}
                >
                  <Megaphone size={12} /> Alerte Générale
                </button>
              </div>
            </div>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-eden-text-light" />
              <input
                type="text"
                placeholder="Rechercher une discussion..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-eden-bg border border-eden-border rounded-xl pl-8 pr-4 py-2 text-xs outline-none focus:border-eden-tan/80 text-eden-text-dark transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="m-3 p-3 text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-xl flex items-center gap-1.5">
              <AlertCircle size={13} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto divide-y divide-eden-border/30">
            {filteredChannels.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <MessageSquare size={24} className="text-eden-text-light/40 mx-auto" />
                <p className="text-xs text-eden-text-light font-light italic">Aucun prestataire inscrit pour le moment.</p>
              </div>
            ) : (
              filteredChannels.map(channel => {
                const channelId = channel._id || channel.id || '';
                const isActive  = channelId === activeChannelId && !broadcastMode;
                return (
                  <div
                    key={channelId}
                    onClick={() => { setBroadcastMode(false); openConversation(channelId); }}
                    className={`p-4 flex items-start gap-3 cursor-pointer transition-all hover:bg-eden-navy/[0.01] select-none ${isActive ? 'bg-eden-navy/[0.03] border-l-[3px] border-eden-tan' : ''}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-eden-navy text-white font-bold flex items-center justify-center text-xs uppercase shrink-0 shadow-2xs">
                      {channel.avatar || channel.name?.substring(0, 2) || 'EX'}
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-xs text-eden-text-dark truncate">{channel.name}</p>
                        <span className="text-[10px] text-eden-text-light font-mono shrink-0">{channel.time}</span>
                      </div>
                      <p className="text-[10px] text-eden-tan font-medium tracking-wide uppercase">{channel.role}</p>
                      <p className="text-[11px] text-eden-text-light truncate font-light mt-1">{channel.lastMessage}</p>
                    </div>
                    {channel.unread > 0 && (
                      <span className="w-2 h-2 rounded-full bg-eden-orange shrink-0 self-center animate-pulse" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── COLONNE DROITE ── */}
        <div className="flex-1 flex flex-col min-w-0 bg-eden-bg/10 relative">
          {actionMessage && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 p-2.5 px-4 text-xs text-white bg-eden-navy/90 border border-eden-tan rounded-xl shadow-md font-medium">
              {actionMessage}
            </div>
          )}

          {broadcastMode ? (
            <div className="flex-1 flex flex-col p-8 justify-center max-w-xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-eden-orange/10 text-eden-orange rounded-full flex items-center justify-center mx-auto">
                  <Megaphone size={22} />
                </div>
                <h4 className="font-serif font-bold text-lg text-eden-navy">Console d'Alerte</h4>
                <p className="text-xs text-eden-text-light">Diffuse une mission urgente à tous les extras du corps de métier sélectionné.</p>
              </div>
              <form onSubmit={handleSendBroadcast} className="space-y-4 bg-white border border-eden-border rounded-xl p-6 shadow-sm">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-eden-text-dark">Corps de métier ciblé</label>
                  <select
                    value={broadcastTarget}
                    onChange={e => setBroadcastTarget(e.target.value)}
                    className="w-full bg-eden-bg border border-eden-border rounded-lg p-2.5 text-xs text-eden-text-dark outline-none focus:border-eden-tan"
                  >
                    <option value="serveur">Serveurs / Chefs de rang</option>
                    <option value="barman">Barmans / Mixologues</option>
                    <option value="cuisinier">Cuisiniers / Chefs de partie</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-eden-text-dark">Message d'alerte</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Ex : Besoin urgent d'un chef de rang ce soir 19h-23h, Hôtel Mercure Lyon..."
                    value={broadcastText}
                    onChange={e => setBroadcastText(e.target.value)}
                    className="w-full bg-eden-bg border border-eden-border rounded-lg p-3 text-xs text-eden-text-dark outline-none focus:border-eden-tan resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isBroadcasting}
                  className="w-full bg-eden-orange hover:bg-eden-orange/90 text-white text-xs font-bold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isBroadcasting ? <Loader2 className="animate-spin" size={14} /> : <><Megaphone size={14} /> Diffuser l'alerte</>}
                </button>
              </form>
            </div>

          ) : activeChannel ? (
            <>
              <div className="p-4 bg-white border-b border-eden-border/60 px-6 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-eden-tan/10 text-eden-tan font-bold flex items-center justify-center text-xs uppercase">
                    {activeChannel.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-eden-navy">{activeChannel.name}</h4>
                    <p className="text-[11px] text-eden-tan font-medium mt-0.5">{activeChannel.role}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white/40">
                {(messages[activeChannelId] || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-2 text-center">
                    <MessageSquare size={28} className="text-eden-text-light/30" />
                    <p className="text-xs text-eden-text-light font-light">Aucun message avec {activeChannel.name} pour le moment.</p>
                    <p className="text-[11px] text-eden-text-light/60">Envoyez le premier message ci-dessous.</p>
                  </div>
                ) : (
                  (messages[activeChannelId] || []).map(msg => (
                    <div
                      key={msg._id}
                      className={`flex flex-col ${msg.sender === 'admin' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                      style={{ maxWidth: '75%' }}
                    >
                      <div className={`p-3.5 rounded-2xl text-xs shadow-2xs leading-relaxed ${msg.sender === 'admin' ? 'bg-eden-navy text-white rounded-br-sm' : 'bg-white border border-eden-border text-eden-text-dark rounded-bl-sm'}`}>
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-eden-text-light mt-1 font-mono">{msg.time}</span>
                    </div>
                  ))
                )}
              </div>

              <form
                onSubmit={handleSendMessage}
                className="p-4 bg-white border-t border-eden-border/60 px-6 flex items-center gap-3"
              >
                <input
                  type="text"
                  required
                  value={newMessageText}
                  onChange={e => setNewMessageText(e.target.value)}
                  placeholder={`Message à ${activeChannel.name}...`}
                  className="flex-1 bg-eden-bg border border-eden-border rounded-xl px-4 py-3 text-xs text-eden-text-dark outline-none focus:border-eden-tan transition-all"
                />
                <button
                  type="submit"
                  disabled={!newMessageText.trim()}
                  className="bg-eden-navy hover:bg-eden-light-navy disabled:opacity-40 text-white p-3 rounded-xl transition-colors cursor-pointer border-none"
                >
                  <Send size={14} />
                </button>
              </form>
            </>

          ) : (
            <div className="flex-1 flex flex-col items-center justify-center space-y-3 text-center p-8">
              <MessageSquare size={32} className="text-eden-text-light/30" />
              <p className="text-sm font-serif font-semibold text-eden-navy">Messagerie EDÈN HCR</p>
              <p className="text-xs text-eden-text-light font-light">Sélectionnez un prestataire dans la liste pour démarrer ou reprendre une conversation.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};