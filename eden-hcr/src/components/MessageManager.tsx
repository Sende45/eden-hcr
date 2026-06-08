import React, { useState } from 'react';
import { MessageSquare, Send, Search, Megaphone, Users, CheckCheck, Clock, ShieldAlert } from 'lucide-react';

interface Channel {
  id: string;
  name: string;
  role: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  isUrgent?: boolean;
}

interface Message {
  id: string;
  sender: 'admin' | 'extra';
  text: string;
  time: string;
}

const INITIAL_CHANNELS: Channel[] = [
  {
    id: '1',
    name: 'Amandine Rousseau',
    role: 'Chef de Rang',
    lastMessage: "Bonjour Marie, j'ai bien reçu mon contrat pour le shift de ce soir au Récamier.",
    time: '10:42',
    unread: 1,
    avatar: 'AR',
    isUrgent: true
  },
  {
    id: '2',
    name: 'Koffi Diallo',
    role: 'Chef de Partie',
    lastMessage: 'Heures validées sur la feuille d’émargement, merci !',
    time: 'Hier',
    unread: 0,
    avatar: 'KD'
  },
  {
    id: '3',
    name: 'Alexandre Vidal',
    role: 'Mixologue',
    lastMessage: 'Je suis disponible ce week-end pour l’événementiel privé.',
    time: '02 Juin',
    unread: 0,
    avatar: 'AV'
  }
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
  '1': [
    { id: '1', sender: 'admin', text: "Bonjour Amandine, ton profil a été validé par l'agence. Tu as une proposition de shift pour ce soir.", time: '10:30' },
    { id: '2', sender: 'extra', text: "Bonjour Marie, j'ai bien reçu mon contrat pour le shift de ce soir au Récamier.", time: '10:42' }
  ],
  '2': [
    { id: '1', sender: 'extra', text: "Le brief de cuisine est parfait.", time: 'Mercredi' },
    { id: '2', sender: 'admin', text: "Super, bon shift à toi Koffi !", time: 'Mercredi' },
    { id: '3', sender: 'extra', text: "Heures validées sur la feuille d’émargement, merci !", time: 'Hier' }
  ]
};

export const MessageManager: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState<string>('1');
  const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [newMessageText, setNewMessageText] = useState('');
  const [broadcastMode, setBroadcastMode] = useState(false);
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState('serveur');

  const activeChannel = channels.find(c => c.id === activeChannelId);

  // ENVOI D'UN MESSAGE INDIVIDUEL
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'admin',
      text: newMessageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), newMsg]
    }));

    setChannels(prev => prev.map(c => c.id === activeChannelId ? { ...c, lastMessage: newMessageText, time: 'À l\'instant', unread: 0 } : c));
    setNewMessageText('');
  };

  // ENVOI D'UN BROADCAST (ALERTE MASSIVE & PUBLICATION DE SHIFT DE PRODUCTION)
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;

    // 1. Récupération du jeton JWT indispensable
    const token = localStorage.getItem('userToken');

    // 2. Structuration du payload conforme au modèle Mongoose Mission
    const missionPayload = {
      etablissementId: "65f1a2b3c4d5e6f7a8b9c0d1", // ID temporaire de validation
      posteRecherche: broadcastTarget === 'serveur' ? 'Chef de Rang' : broadcastTarget === 'barman' ? 'Mixologue' : 'Chef de Partie',
      dateDebut: new Date(),
      dateFin: new Date(Date.now() + 8 * 60 * 60 * 1000), // Shift standard de 8h
      nombreExtras: 1,
      tauxHoraireBrut: 19.5,
      briefing: broadcastText,
      statutMission: 'ouverte'
    };

    try {
      const response = await fetch('https://eden-hcr-backend.onrender.com/api/mission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Protection JWT active
        },
        body: JSON.stringify(missionPayload)
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Alerte Coup de feu diffusée et enregistrée dans MongoDB avec succès !`);
        setBroadcastText('');
        setBroadcastMode(false);
      } else {
        alert(`Erreur de transmission : ${data.message}`);
      }
    } catch (error) {
      console.error("Erreur réseau broadcast :", error);
      alert("Impossible de joindre le serveur pour publier la mission d'urgence.");
    }
  };

  return (
    <div className="p-6 lg:p-8 font-sans max-w-[1600px] mx-auto h-[calc(100vh-80px)] flex flex-col gap-6 animate-[fadeInUp_0.4s_ease-out]">
      
      {/* SECTION WRAPPER DE LA MESSAGERIE COMPLÈTE */}
      <div className="flex-1 bg-eden-bg2 border border-eden-border rounded-2xl overflow-hidden shadow-xl flex h-full min-h-0">
        
        {/* LE VOLET GAUCHE : CANAUX & ALERTES (4 COLONNES EFFECTIVES) */}
        <div className="w-full sm:w-[350px] md:w-[400px] border-r border-eden-border/60 flex flex-col shrink-0 bg-eden-bg2/50">
          
          {/* Entête volet gauche + Outil d'alerte de masse */}
          <div className="p-4 border-b border-eden-border/60 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-serif text-eden-navy flex items-center gap-2">
                <MessageSquare size={16} className="text-eden-tan" /> Conversations Extra
              </h3>
              <button 
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

            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-eden-text-light" />
              <input 
                type="text" placeholder="Rechercher une discussion..."
                className="w-full bg-eden-bg border border-eden-border rounded-xl pl-8 pr-4 py-2 text-xs outline-hidden focus:border-eden-tan/80 text-eden-text-dark transition-all"
              />
            </div>
          </div>

          {/* Liste déroulante des canaux */}
          <div className="flex-1 overflow-y-auto divide-y divide-eden-border/30">
            {channels.map(channel => {
              const isActive = channel.id === activeChannelId && !broadcastMode;
              return (
                <div 
                  key={channel.id}
                  onClick={() => { setActiveChannelId(channel.id); setBroadcastMode(false); }}
                  className={`p-4 flex items-start gap-3 cursor-pointer transition-all hover:bg-eden-navy/[0.01] select-none
                    ${isActive ? 'bg-eden-navy/[0.03] border-l-[3px] border-eden-tan' : ''}`}
                >
                  <div className="w-9 h-9 rounded-full bg-eden-navy text-white font-bold flex items-center justify-center text-xs uppercase shrink-0 shadow-2xs">
                    {channel.avatar}
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
          </div>
        </div>

        {/* LE VOLET DROIT : ACTION & ZONE DE FIL DE DISCUSSION (DYNAMIQUE) */}
        <div className="flex-1 flex flex-col min-w-0 bg-eden-bg/10 relative">
          
          {/* CAS 1 : MODE BROADCAST ALERTE GÉNÉRALE ACTIVÉ */}
          {broadcastMode ? (
            <div className="flex-1 flex flex-col p-8 justify-center max-w-xl mx-auto space-y-6 animate-[fadeInUp_0.3s_each-out]">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-eden-orange/10 text-eden-orange rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Megaphone size={22} />
                </div>
                <h4 className="font-serif font-bold text-lg text-eden-navy tracking-wide">Console d'Alerte "Coup de feu"</h4>
                <p className="text-xs text-eden-text-light font-light">Envoyez instantanément une notification push et un SMS groupé à tous les extras correspondants.</p>
              </div>

              <form onSubmit={handleSendBroadcast} className="space-y-4 bg-eden-bg2 border border-eden-border rounded-xl p-6 shadow-sm">
                <div className="flex flex-col gap-1.5 text-xs">
                  <label className="font-semibold text-eden-text-dark">Sélectionner la brigade cible</label>
                  <select 
                    value={broadcastTarget} onChange={(e) => setBroadcastTarget(e.target.value)}
                    className="bg-eden-bg border border-eden-border rounded-lg p-2.5 outline-hidden focus:border-eden-tan"
                  >
                    <option value="serveur">Tous les Serveurs / Chefs de Rang ({channels.filter(c => c.role.includes('Rang')).length}+)</option>
                    <option value="barman">Tous les Barmans / Mixologues</option>
                    <option value="cuisinier">Tous les Cuisiniers / Chefs de Partie</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-1.5 text-xs">
                  <label className="font-semibold text-eden-text-dark">Message d'urgence</label>
                  <textarea 
                    required rows={4} value={broadcastText} onChange={(e) => setBroadcastText(e.target.value)}
                    placeholder="Ex: Urgent - Besoin de 2 serveurs ce soir à 18h00 au Lutetia. Tarif majoré + indemnité de nuit. Postulez d'un clic !"
                    className="bg-eden-bg border border-eden-border rounded-lg p-3 outline-hidden focus:border-eden-tan text-xs resize-none text-eden-text-dark leading-relaxed"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-eden-orange hover:bg-eden-navy text-white text-xs font-bold py-3 px-4 rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Send size={14} /> Diffuser la mission d'urgence
                </button>
              </form>
            </div>
          ) : activeChannel ? (
            
            // CAS 2 : DISCUSSION INDIVIDUELLE SÉLECTIONNÉE
            <>
              {/* Entête discussion active */}
              <div className="p-4 bg-eden-bg2 border-b border-eden-border/60 flex items-center justify-between px-6 select-none">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-eden-tan/10 text-eden-tan font-bold flex items-center justify-center text-xs shadow-inner uppercase">
                    {activeChannel.avatar}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-eden-navy leading-none">{activeChannel.name}</h4>
                    <p className="text-[10px] text-eden-text-light font-light mt-1 flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-eden-teal" /> Discuter avec l'extra en direct
                    </p>
                  </div>
                </div>
                {activeChannel.isUrgent && (
                  <span className="text-[9px] font-semibold bg-eden-orange/10 text-eden-orange border border-eden-orange/20 rounded-md p-[3px_8px] uppercase tracking-wider flex items-center gap-1">
                    <ShieldAlert size={10} /> Shift Imminent
                  </span>
                )}
              </div>

              {/* Fil des messages avec scrolling */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {(messages[activeChannelId] || []).map((msg) => {
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <div 
                      key={msg.id}
                      className={`flex flex-col max-w-[75%] space-y-1 animate-[fadeInUp_0.2s_ease-out]
                        ${isAdmin ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                    >
                      <div 
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs
                          ${isAdmin 
                            ? 'bg-eden-navy text-white rounded-br-none' 
                            : 'bg-eden-bg2 border border-eden-border/60 text-eden-text-dark rounded-bl-none'
                          }`}
                      >
                        <p>{msg.text}</p>
                      </div>
                      <div className="flex items-center gap-1 px-1 text-[10px] text-eden-text-light font-mono font-light select-none">
                        <span>{msg.time}</span>
                        {isAdmin && <CheckCheck size={12} className="text-eden-teal" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Barre de saisie en bas */}
              <form onSubmit={handleSendMessage} className="p-4 bg-eden-bg2 border-t border-eden-border/60 px-6 flex items-center gap-3">
                <input 
                  type="text" required value={newMessageText} onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder={`Répondre à ${activeChannel.name}...`}
                  className="flex-1 bg-eden-bg border border-eden-border rounded-xl px-4 py-3 text-xs outline-hidden focus:border-eden-tan text-eden-text-dark transition-all shadow-inner"
                />
                <button 
                  type="submit"
                  className="bg-eden-navy hover:bg-eden-light-navy text-white p-3 rounded-xl cursor-pointer transition-colors flex-shrink-0 shadow-md"
                  aria-label="Envoyer"
                >
                  <Send size={14} />
                </button>
              </form>
            </>
          ) : (
            
            // CAS PAR DÉFAUT SI AUCUN CANAL N'EST LIÉ
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