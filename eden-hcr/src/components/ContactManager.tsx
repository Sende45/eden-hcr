import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2, Trash2, MessageSquare } from 'lucide-react';

export const ContactManager: React.FC<{ userRole?: string }> = ({ userRole }) => {
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // États pour la partie Admin
  const [messages, setMessages] = useState<any[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);

  // 1. Charger les messages (uniquement si SuperAdmin)
  useEffect(() => {
    if (userRole === 'superadmin') {
      fetchMessages();
    }
  }, [userRole]);

  const fetchMessages = async () => {
    setAdminLoading(true);
    const token = localStorage.getItem('eden_token');
    try {
      const res = await fetch('https://eden-hcr.onrender.com/api/admin/messagerie', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setMessages(await res.json());
    } catch (err) { console.error(err); }
    finally { setAdminLoading(false); }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('eden_token');
    await fetch(`https://eden-hcr.onrender.com/api/admin/messagerie/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setMessages(prev => prev.filter(m => m._id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('https://eden-hcr.onrender.com/api/messagerie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });
      if (response.ok) setIsSubmitted(true);
      else setErrorMessage("Erreur de transmission.");
    } catch (error) { setErrorMessage("Erreur serveur."); }
    finally { setLoading(false); }
  };

  // --- VUE ADMIN : LISTE DES MESSAGES ---
  if (userRole === 'superadmin') {
    return (
      <div className="p-[24px_30px] space-y-6">
        <h2 className="font-serif font-bold text-xl text-eden-navy flex items-center gap-2">
          <MessageSquare size={20} className="text-eden-tan" /> Console Messagerie SuperAdmin
        </h2>
        {adminLoading ? <Loader2 className="animate-spin" /> : (
          <div className="grid gap-4">
            {messages.map((msg: any) => (
              <div key={msg._id} className="bg-white p-6 rounded-xl border border-eden-border flex justify-between items-start shadow-sm">
                <div>
                  <h4 className="font-bold text-sm">{msg.name} <span className="text-eden-tan">({msg.email})</span></h4>
                  <p className="text-xs font-mono text-eden-navy mt-1">{msg.subject}</p>
                  <p className="text-xs mt-2 text-gray-600">{msg.message}</p>
                </div>
                <button onClick={() => handleDelete(msg._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg cursor-pointer">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- VUE PUBLIQUE (Formulaire) ---
  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-10 rounded-2xl border text-center space-y-4">
        <CheckCircle2 size={48} className="mx-auto text-eden-teal animate-bounce" />
        <h3 className="font-serif font-semibold text-2xl text-eden-navy">Demande transmise</h3>
        <button onClick={() => setIsSubmitted(false)} className="text-eden-tan font-bold">Envoyer un autre message</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start p-6">
      <div className="lg:col-span-5 bg-eden-navy text-white p-8 rounded-2xl space-y-6">
        <h2 className="font-serif text-2xl">Maison EDÈN</h2>
        <div className="space-y-4 text-xs font-light">
          <div className="flex items-center gap-3"><Mail size={16} /> direction@eden-group.pro</div>
          <div className="flex items-center gap-3"><Phone size={16} /> +33 (0)7 80 80 16 42</div>
          <div className="flex items-center gap-3"><MapPin size={16} /> Paris, France</div>
        </div>
      </div>

      <div className="lg:col-span-7 bg-white p-8 rounded-2xl border border-eden-border shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <input type="text" required placeholder="Nom complet" className="w-full p-3 rounded-xl border text-xs" onChange={e => setFormState({...formState, name: e.target.value})} />
          <input type="email" required placeholder="Email" className="w-full p-3 rounded-xl border text-xs" onChange={e => setFormState({...formState, email: e.target.value})} />
          <input type="text" required placeholder="Sujet" className="w-full p-3 rounded-xl border text-xs" onChange={e => setFormState({...formState, subject: e.target.value})} />
          <textarea required rows={4} placeholder="Message" className="w-full p-3 rounded-xl border text-xs" onChange={e => setFormState({...formState, message: e.target.value})} />
          <button type="submit" disabled={loading} className="w-full bg-eden-navy text-white p-3.5 rounded-xl text-xs font-semibold flex justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={14} /> : <><Send size={13} /> Transmettre</>}
          </button>
        </form>
      </div>
    </div>
  );
};