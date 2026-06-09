import React from 'react';
import { Calendar, CheckCircle, Clock } from 'lucide-react';

export const ExtraDashboard: React.FC<{ user: any }> = ({ user }) => {
  return (
    <div className="p-8 space-y-6 animate-[fadeInUp_0.3s_ease-out]">
      <div className="bg-white border border-eden-border p-6 rounded-2xl shadow-sm">
        <h2 className="text-lg font-bold text-eden-navy font-serif">Bienvenue, {user?.email}</h2>
        <p className="text-xs text-eden-text-light">Voici vos informations et prochaines missions.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-eden-navy text-white p-6 rounded-2xl">
          <Calendar className="mb-2" />
          <div className="text-2xl font-bold">0</div>
          <div className="text-xs opacity-70">Missions à venir</div>
        </div>
        <div className="bg-white border p-6 rounded-2xl">
          <CheckCircle className="mb-2 text-eden-teal" />
          <div className="text-2xl font-bold">12</div>
          <div className="text-xs text-eden-text-light">Missions terminées</div>
        </div>
        <div className="bg-white border p-6 rounded-2xl">
          <Clock className="mb-2 text-eden-tan" />
          <div className="text-2xl font-bold">4.8</div>
          <div className="text-xs text-eden-text-light">Note moyenne</div>
        </div>
      </div>
    </div>
  );
};