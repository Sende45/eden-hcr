import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

export const CreateShiftModal = ({ isOpen, onClose, onSave }: any) => {
  const [formData, setFormData] = useState({ date: '', poste: '', start: '', end: '' });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-eden-navy/20 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-serif font-bold text-lg text-eden-navy">Nouvel Shift</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <input type="date" className="w-full border p-2 rounded-lg" onChange={e => setFormData({...formData, date: e.target.value})} />
        <input type="text" placeholder="Poste (ex: Chef de rang)" className="w-full border p-2 rounded-lg" onChange={e => setFormData({...formData, poste: e.target.value})} />
        <div className="flex gap-2">
          <input type="time" className="w-1/2 border p-2 rounded-lg" onChange={e => setFormData({...formData, start: e.target.value})} />
          <input type="time" className="w-1/2 border p-2 rounded-lg" onChange={e => setFormData({...formData, end: e.target.value})} />
        </div>
        <button onClick={() => onSave(formData)} className="w-full bg-eden-navy text-white p-3 rounded-xl font-bold">
          Créer le shift
        </button>
      </div>
    </div>
  );
};