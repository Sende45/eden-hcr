import React, { useState, useEffect, useMemo } from 'react';
import { MessageSquare, Send, Search, Megaphone, Users, CheckCheck, Clock, ShieldAlert, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

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
}

interface Message {
  _id: string;
  id?: string;
  sender: 'admin' | 'extra';
  text: string;
  time: string;
}

export const MessageManager: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string>('');
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [newMessageText, setNewMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<string>('');
  
  // États de la Console d'Alerte de Masse
  const [broadcastMode, setBroadcastMode] = useState(false);
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState('serveur');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // 1. CARGEMENT DYNAMIQUE DES CONVERSATIONS DEPUIS ATLAS
  const fetchConversations = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError('');
    const token = localStorage.getItem('eden_token');

    try {
      const response = await fetch('https://eden-hcr.onrender.com/api/admin/messages/channels', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();

      if (response.ok) {
        const cloudChannels: Channel[] = resData.data?.channels || resData.channels || resData;
        const cloudMessages: Record<string, Message[]> = resData.data?.messages || resData.messages || {};
        
        setChannels(cloudChannels);
        setMessages(cloudMessages);
        
        // Sélection automatique du premier canal disponible s'il n'y a pas de sélection active
        if (cloudChannels.length > 0 && !activeChannelId) {
          setActiveChannelId(cloudChannels[0]._id || cloudChannels[0].id || '');
        }
      } else {
        setError(resData.message || "Impossible de charger la messagerie.");
      }
    } catch (err) {
      console.error("Erreur MessageManager fetch :", err);
      setError("Échec de synchronisation avec le serveur de messagerie EDÈN.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const activeChannel = useMemo(() => {
    return channels.find(c => (c._id === activeChannelId || c.id === activeChannelId));
  }, [channels, activeChannelId]);

  // 2. ENVOI D'UN MESSAGE INDIVIDUEL EN DIRECT SUR LE BACKEND
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeChannelId) return;

    const token = localStorage.getItem('eden_token');
    const textToSend = newMessageText;
    setNewMessageText(''); // Nettoyage réactif instantané pour l'UX

    try {
      const response = await fetch(`https://eden-hcr.onrender.com/api/admin/messages/channels/${activeChannelId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: textToSend })
      });

      const resData = await response.json();

      if (response.ok) {
        // Hydratation réactive locale du message validé par Atlas
        const savedMsg: Message = resData.data || resData;
        setMessages(prev => ({
          ...prev,
          [activeChannelId]: [...(prev[activeChannelId] || []), savedMsg]
        }));

        // Remontée du canal en tête de liste avec son dernier message mis à jour
        setChannels(prev => prev.map(c => 
          (c._id === activeChannelId || c.id === activeChannelId) 
            ? { ...c, lastMessage: textToSend, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), unread: 0 } 
            : c
        ));
      } else {
        setActionMessage(`Erreur d'envoi : ${resData.message}`);
        setNewMessageText(textToSend); // Restitution en cas d'échec
      }
    } catch (err) {
      console.error("Erreur envoi message :", err);
      setActionMessage("Message non distribué : Serveur déconnecté.");
      setNewMessageText(textToSend);
    } finally {
      setTimeout(() => setActionMessage(''), 3000);
    }
  };

  // 3. ENVOI D'UN BROADCAST "COUP DE FEU" (OFFRE FLASH SUR MONGO ATLAS + SMS)
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;

    setIsBroadcasting(true);
    setActionMessage('');
    const token = localStorage.getItem('eden_token'); // Alignement sur la clé d'administration unique

    const missionPayload = {
      posteRecherche: broadcastTarget === 'serveur' ? 'Chef de Rang' : broadcastTarget === 'barman' ? 'Mixologue' : 'Chef de Partie',
      dateDebut: new Date(),
      dateFin: new Date(Date.now() + 8 * 60 * 60 * 1000), // Shift standard de 8 heures
      nombreExtras: 1,
      tauxHoraireBrut: 19.5,
      briefing: broadcastText,
      statutMission: 'ouverte'
    };

    try {
      const response = await fetch('https://eden-hcr.onrender.com/api/admin/missions/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(missionPayload)
      });

      const data = await response.json();

      if (response.ok) {
        setActionMessage(`Alerte d'urgence diffusée et enregistrée sur Atlas !`);
        setBroadcastText('');
        setBroadcastMode(false);
      } else {
        setActionMessage(`Erreur : ${data.message}`);
      }
    } catch (error) {
      console.error("Erreur réseau broadcast :", error);
      setActionMessage("Échec de la diffusion générale.");
    } finally {
      setIsBroadcasting(false);
      setTimeout(() => setActionMessage(''), 4000);
    }
  };

  // Filtrage réactif de la liste des conversations de la brigade
  const filteredChannels = useMemo(() => {
    return channels.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.role.toLowerCase().includes(searchTerm.toLowerCase())
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
      
      {/* SECTION CONTRÔLEUR DE MESSAGERIE UNIQUE */}
      <div className="flex-1 bg-eden-bg2 border border-eden-border rounded-2xl overflow-hidden shadow-xl flex h-full min-h-0">
        
        {/* LE VOLET GAUCHE : LISTE DES CANALS INTERACTIFS */}
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
                  title="Actualiser les messages"
                  className="p-1.5 text-eden-text-light hover:text-eden-navy bg-transparent border-none cursor-pointer rounded-lg hover:bg-eden-bg transition-colors"
                >
                  <RefreshCw size={13} />
                </button>
                <button 
                  type="button"
                  onClick={() => setBroadcastMode(!broadcastMode)}
                  className={`flex items-center gap-1.5 p-1.5 px-3 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border border-solid
                    ${broadcastMode 
                      ? 'bg-eden-orange text-white border-eden-orange shadow-md' 
                      : 'bg-eden-navy/5 text-eden-navy border-eden-navy/10 hover:bg-eden-navy/10'
                    }`}
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

          {/* Liste infinie scrollable des canaux Atlas */}
          <div className="flex-1 overflow-y-auto divide-y divide-eden-border/30">
            {filteredChannels.map(channel => {
              const channelId = channel._id || channel.id || '';
              const isActive = channelId === activeChannelId && !broadcastMode;
              return (
                <div 
                  key={channelId}
                  onClick={() => { setActiveChannelId(channelId); setBroadcastMode(false); }}
                  className={`p-4 flex items-start gap-3 cursor-pointer transition-all hover:bg-eden-navy/[0.01] select-none
                    ${isActive ? 'bg-eden-navy/[0.03] border-l-[3px] border-eden-tan' : ''}`}
                >
                  <div className="w-9 h-9 rounded-full bg-eden-navy text-white font-bold flex items-center justify-center text-xs uppercase shrink-0 shadow-2xs">
                    {channel.avatar || channel.name.substring(0, 2)}
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
            })}

            {filteredChannels.length === 0 && (
              <div className="p-8 text-center text-eden-text-light font-light italic text-[11px]">
                Aucun canal de discussion trouvé.
              </div>
            )}
          </div>
        </div>

        {/* LE VOLET DROIT : FIL CONTINU ET INTERACTIONS D'ACTION */}
        <div className="flex-1 flex flex-col min-w-0 bg-eden-bg/10 relative">
          
          {actionMessage && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 p-2.5 px-4 text-xs text-white bg-eden-navy/90 border border-eden-tan rounded-xl shadow-md font-medium">
              {actionMessage}
            </div>
          )}

          {/* CAS A : CONSOLE D'ALERTE DE MASSE ACTIVÉE */}
          {broadcastMode ? (
            <div className="flex-1 flex flex-col p-8 justify-center max-w-xl mx-auto space-y-6 animate-[fadeInUp_0.3s_ease-out]">
              <div className="text-center space-y-2 select-none">
                <div className="w-12 h-12 bg-eden-orange/10 text-eden-orange rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Megaphone size={22} />
                </div>
                <h4 className="font-serif font-bold text-lg text-eden-navy tracking-wide">Console d'Alerte "Coup de feu"</h4>
                <p className="text-xs text-eden-text-light font-light">Envoyez instantanément une notification push et un SMS groupé à tous les extras correspondants.</p>
              </div>

              <form onSubmit={handleSendBroadcast} className="space-y-4 bg-white border border-eden-border rounded-xl p-6 shadow-sm">
                <div className="flex flex-col gap-1.5 text-xs">
                  <label className="font-semibold text-eden-text-dark">Sélectionner la brigade cible</label>
                  <select 
                    value={broadcastTarget} 
                    onChange={(e) => setBroadcastTarget(e.target.value)}
                    className="bg-eden-bg border border-eden-border rounded-lg p-2.5 outline-none focus:border-eden-tan text-xs cursor-pointer"
                  >
                    <option value="serveur">Tous les Serveurs / Chefs de Rang</option>
                    <option value="barman">Tous les Barmans / Mixologues</option>
                    <option value="cuisinier">Tous les Cuisiniers / Chefs de Partie</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-1.5 text-xs">
                  <label className="font-semibold text-eden-text-dark">Message d'urgence</label>
                  <textarea 
                    required 
                    rows={4} 
                    value={broadcastText} 
                    onChange={(e) => setBroadcastText(e.target.value)}
                    placeholder="Ex: Urgent - Besoin de 2 serveurs ce soir à 18h00 au Lutetia. Tarif majoré + indemnité de nuit. Postulez d'un clic !"
                    className="bg-eden-bg border border-eden-border rounded-lg p-3 outline-none focus:border-eden-tan text-xs resize-none text-eden-text-dark leading-relaxed"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isBroadcasting}
                  className="w-full bg-eden-orange hover:bg-eden-navy text-white text-xs font-bold py-3 px-4 rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-sm border-none disabled:opacity-50"
                >
                  {isBroadcasting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  <span>Diffuser la mission d'urgence</span>
                </button>
              </form>
            </div>
          ) : activeChannel ? (
            
            // CAS B : FIL DE DISCUSSION INTERACTIF ACTIF
            <>
              {/* Entête du fil */}
              <div className="p-4 bg-white border-b border-eden-border/60 flex items-center justify-between px-6 select-none shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-eden-tan/10 text-eden-tan font-bold flex items-center justify-center text-xs shadow-inner uppercase">
                    {activeChannel.avatar || activeChannel.name.substring(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-eden-navy leading-none">{activeChannel.name}</h4>
                    <p className="text-[10px] text-eden-text-light font-light mt-1 flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-eden-teal" /> En ligne · Direct Extra
                    </p>
                  </div>
                </div>
                {activeChannel.isUrgent && (
                  <span className="text-[9px] font-semibold bg-eden-orange/10 text-eden-orange border border-eden-orange/20 rounded-md p-[3px_8px] uppercase tracking-wider flex items-center gap-1">
                    <ShieldAlert size={10} /> Shift Imminent
                  </span>
                )}
              </div>

              {/* Fil des messages avec défilement fluide */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white/40">
                {(messages[activeChannelId] || []).map((msg) => {
                  const msgId = msg._id || msg.id;
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <div 
                      key={msgId}
                      className={`flex flex-col max-w-[75%] space-y-1 animate-[fadeInUp_0.2s_ease-out]
                        ${isAdmin ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                    >
                      <div 
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs
                          ${isAdmin 
                            ? 'bg-eden-navy text-white rounded-br-none' 
                            : 'bg-white border border-eden-border/60 text-eden-text-dark rounded-bl-none'
                          }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                      <div className="flex items-center gap-1 px-1 text-[10px] text-eden-text-light font-mono font-light select-none">
                        <span>{msg.time}</span>
                        {isAdmin && <CheckCheck size={12} className="text-eden-teal" />}
                      </div>
                    </div>
                  );
                })}

                {(messages[activeChannelId] || []).length === 0 && (
                  <div className="text-center py-12 text-eden-text-light/60 font-light italic text-xs">
                    Début de l'historique sécurisé avec {activeChannel.name}.
                  </div>
                )}
              </div>

              {/* Formulaire de saisie bas de page */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-eden-border/60 px-6 flex items-center gap-3 shadow-md">
                <input 
                  type="text" 
                  required 
                  value={newMessageText} 
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder={`Répondre à ${activeChannel.name}...`}
                  className="flex-1 bg-eden-bg border border-eden-border rounded-xl px-4 py-3 text-xs outline-none focus:border-eden-tan text-eden-text-dark transition-all shadow-inner"
                />
                <button 
                  type="submit"
                  className="bg-eden-navy hover:bg-eden-light-navy text-white p-3 rounded-xl cursor-pointer transition-colors flex-shrink-0 shadow-md border-none"
                  aria-label="Transmettre le message"
                >
                  <Send size={14} />
                </button>
              </form>
            </>
          ) : (
            
            // CAS C : ZONE D'ATTENTE DE SÉLECTION INITIALE
            <div className="flex-1 flex flex-col justify-center text-center select-none">
              <MessageSquare size={24} className="text-eden-text-light/40 mx-auto mb-2" />
              <p className="text-xs text-eden-text-light font-medium">Sélectionnez une discussion active pour piloter la mise en place de vos brigades.</p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};