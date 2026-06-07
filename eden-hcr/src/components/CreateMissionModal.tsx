import React, { useState } from 'react';
import { X, Utensils, Clock, Building2, Euro, FileText, ToggleLeft, ToggleRight } from 'lucide-react';
import { type CreateMissionInput } from '../types/missionForm';
import { type HcrSector } from '../types/dashboard';

interface CreateMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMissionInput) => void;
}

export const CreateMissionModal: React.FC<CreateMissionModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CreateMissionInput>({
    title: '',
    establishmentName: '',
    sector: 'Service',
    startDate: '',
    endDate: '',
    ratePerHour: 14.50,
    includeMealAllowance: true,
    schedule: {
      startHour: '12:00',
      endHour: '15:00',
      hasCut: false,
      secondStartHour: '19:00',
      secondEndHour: '23:00',
    },
    description: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-eden-deep-navy/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans animate-fade-in">
      
      <div className="bg-eden-bg2 border border-eden-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col relative">
        
        {/* EN-TÊTE DE LA MODAL */}
        <div className="p-5 border-b border-eden-border/60 flex items-center justify-between bg-gradient-to-r from-eden-bg2 to-eden-bg/30">
          <div>
            <h3 className="font-serif font-semibold text-lg text-eden-navy tracking-wide flex items-center gap-2">
              <Utensils size={18} className="text-eden-tan" /> Planifier une nouvelle mission HCR
            </h3>
            <p className="text-xs text-eden-text-light font-light mt-0.5">Configurez le besoin et la structure horaire du shift.</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-eden-text-light hover:text-eden-navy rounded-lg hover:bg-eden-bg transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* FORMULAIRE CONTAINER (SCROLLABLE) */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* INFORMATIONS PRINCIPALES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-medium text-eden-navy block">Intitulé du poste (ex: Chef de Rang)</label>
              <div className="relative">
                <FileText size={14} className="absolute left-3 top-3 text-eden-text-light/60" />
                <input 
                  type="text" required
                  placeholder="ex: Serveur Banquet Extra"
                  className="w-full bg-eden-bg border border-eden-border rounded-lg p-[9px_12px_9px_34px] text-eden-text-dark outline-hidden focus:border-eden-tan text-xs"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-medium text-eden-navy block">Établissement recruteur</label>
              <div className="relative">
                <Building2 size={14} className="absolute left-3 top-3 text-eden-text-light/60" />
                <input 
                  type="text" required
                  placeholder="ex: Brasserie L'Opéra"
                  className="w-full bg-eden-bg border border-eden-border rounded-lg p-[9px_12px_9px_34px] text-eden-text-dark outline-hidden focus:border-eden-tan text-xs"
                  value={formData.establishmentName}
                  onChange={e => setFormData({...formData, establishmentName: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* SECTEUR ET FACTURATION */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-medium text-eden-navy block">Secteur métier</label>
              <select 
                className="w-full bg-eden-bg border border-eden-border rounded-lg p-[9px_12px] text-eden-text-dark outline-hidden focus:border-eden-tan text-xs cursor-pointer"
                value={formData.sector}
                onChange={e => setFormData({...formData, sector: e.target.value as HcrSector})}
              >
                <option value="Cuisine">Cuisine</option>
                <option value="Service">Service en salle</option>
                <option value="Bar">Bar & Mixologie</option>
                <option value="Réception">Réception & Accueil</option>
                <option value="Ménage">Gouvernance / Ménage</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-medium text-eden-navy block">Taux horaire brut (€/h)</label>
              <div className="relative">
                <Euro size={14} className="absolute left-3 top-3 text-eden-text-light/60" />
                <input 
                  type="number" step="0.01" required
                  className="w-full bg-eden-bg border border-eden-border rounded-lg p-[9px_12px_9px_34px] text-eden-text-dark outline-hidden focus:border-eden-tan text-xs"
                  value={formData.ratePerHour}
                  onChange={e => setFormData({...formData, ratePerHour: parseFloat(e.target.value)})}
                />
              </div>
            </div>

            {/* TOGGLE INDEMNITÉ REPAS */}
            <div className="space-y-1 flex flex-col justify-between">
              <label className="font-medium text-eden-navy block">Avantage nourriture (MG)</label>
              <button 
                type="button"
                onClick={() => setFormData({...formData, includeMealAllowance: !formData.includeMealAllowance})}
                className="flex items-center justify-between w-full bg-eden-bg border border-eden-border rounded-lg p-[8px_12px] text-left cursor-pointer transition-colors"
              >
                <span className="text-eden-text-light">Inclure le repas</span>
                {formData.includeMealAllowance ? (
                  <ToggleRight size={20} className="text-eden-teal" />
                ) : (
                  <ToggleLeft size={20} className="text-eden-text-light/40" />
                )}
              </button>
            </div>
          </div>

          {/* DATES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-medium text-eden-navy block">Date de début</label>
              <input 
                type="date" required
                className="w-full bg-eden-bg border border-eden-border rounded-lg p-[9px_12px] text-eden-text-dark outline-hidden focus:border-eden-tan text-xs"
                value={formData.startDate}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-eden-navy block">Date de fin</label>
              <input 
                type="date" required
                className="w-full bg-eden-bg border border-eden-border rounded-lg p-[9px_12px] text-eden-text-dark outline-hidden focus:border-eden-tan text-xs"
                value={formData.endDate}
                onChange={e => setFormData({...formData, endDate: e.target.value})}
              />
            </div>
          </div>

          {/* BLOC HORAIRES / COUPURES CRITIQUES */}
          <div className="border border-eden-border rounded-xl p-4 bg-eden-bg/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-serif font-semibold text-sm text-eden-navy flex items-center gap-1.5">
                <Clock size={15} className="text-eden-tan" /> Organisation du temps de travail
              </span>
              <button 
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  schedule: { ...formData.schedule, hasCut: !formData.schedule.hasCut }
                })}
                className="text-eden-tan hover:text-eden-navy font-medium text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
              >
                {formData.schedule.hasCut ? "Supprimer la coupure" : "Activer un service en coupure"}
              </button>
            </div>

            {/* PREMIER SERVICE (OU CONTINU) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-eden-text-light block">{formData.schedule.hasCut ? "Début service 1 (Midi)" : "Heure de prise de poste"}</label>
                <input 
                  type="time" required
                  className="w-full bg-eden-bg border border-eden-border rounded-lg p-[8px_12px] text-eden-text-dark outline-hidden text-xs"
                  value={formData.schedule.startHour}
                  onChange={e => setFormData({
                    ...formData,
                    schedule: { ...formData.schedule, startHour: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-eden-text-light block">{formData.schedule.hasCut ? "Fin service 1 (Midi)" : "Heure de fin de poste"}</label>
                <input 
                  type="time" required
                  className="w-full bg-eden-bg border border-eden-border rounded-lg p-[8px_12px] text-eden-text-dark outline-hidden text-xs"
                  value={formData.schedule.endHour}
                  onChange={e => setFormData({
                    ...formData,
                    schedule: { ...formData.schedule, endHour: e.target.value }
                  })}
                />
              </div>
            </div>

            {/* DEUXIÈME SERVICE (EN CAS DE COUPURE) */}
            {formData.schedule.hasCut && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-eden-border/40 animate-slide-down">
                <div className="space-y-1">
                  <label className="text-eden-text-light block">Début service 2 (Soir)</label>
                  <input 
                    type="time" required={formData.schedule.hasCut}
                    className="w-full bg-eden-bg border border-eden-border rounded-lg p-[8px_12px] text-eden-text-dark outline-hidden text-xs"
                    value={formData.schedule.secondStartHour}
                    onChange={e => setFormData({
                      ...formData,
                      schedule: { ...formData.schedule, secondStartHour: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-eden-text-light block">Fin service 2 (Soir)</label>
                  <input 
                    type="time" required={formData.schedule.hasCut}
                    className="w-full bg-eden-bg border border-eden-border rounded-lg p-[8px_12px] text-eden-text-dark outline-hidden text-xs"
                    value={formData.schedule.secondEndHour}
                    onChange={e => setFormData({
                      ...formData,
                      schedule: { ...formData.schedule, secondEndHour: e.target.value }
                    })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* DESCRIPTION / CONSIGNES D'HABILLAGE */}
          <div className="space-y-1">
            <label className="font-medium text-eden-navy block">Consignes spécifiques (Code vestimentaire, tâches...)</label>
            <textarea 
              rows={3}
              placeholder="ex: Tenue de limonadier exigée (Tablier noir, chemise blanche). Expérience en plateau obligatoire."
              className="w-full bg-eden-bg border border-eden-border rounded-lg p-[9px_12px] text-eden-text-dark outline-hidden focus:border-eden-tan text-xs resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

        </form>

        {/* FOOTER ACTIONS */}
        <div className="p-4 border-t border-eden-border/60 bg-eden-bg/30 flex items-center justify-end gap-3">
          <button 
            type="button" onClick={onClose}
            className="border border-eden-border hover:border-eden-tan text-eden-text-dark px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button 
            type="submit" onClick={handleSubmit}
            className="bg-eden-navy hover:bg-eden-light-navy text-white px-5 py-2 rounded-lg font-medium shadow-xs transition-colors cursor-pointer"
          >
            Publier l'offre d'extra
          </button>
        </div>

      </div>
    </div>
  );
};