import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Building2, Search, Check, X, Eye, Loader2, AlertCircle,
  Trash2, Plus, Upload, MapPin, Phone, Mail, User,
  Hash, Briefcase, ChevronDown, ImagePlus, ArrowLeft
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────
interface Etablissement {
  _id: string;
  raisonSociale: string;
  siret: string;
  typeEtablissement: string;
  ville?: string;
  adresse?: string;
  codePostal?: string;
  photo?: string;          // URL photo principale
  statutCompte: 'actif' | 'en_attente_validation' | 'suspendu';
  contactInterne: {
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
  };
  createdAt: string;
}

interface NewEtablissementForm {
  raisonSociale: string;
  siret: string;
  typeEtablissement: string;
  ville: string;
  adresse: string;
  codePostal: string;
  contactNom: string;
  contactPrenom: string;
  contactEmail: string;
  contactTelephone: string;
  photo: File | null;
  photoPreview: string;
}

const INITIAL_FORM: NewEtablissementForm = {
  raisonSociale: '',
  siret: '',
  typeEtablissement: '',
  ville: '',
  adresse: '',
  codePostal: '',
  contactNom: '',
  contactPrenom: '',
  contactEmail: '',
  contactTelephone: '',
  photo: null,
  photoPreview: ''
};

const TYPE_OPTIONS = [
  'Hôtel',
  'Restaurant',
  'Brasserie',
  'Bar / Lounge',
  'Traiteur / Événementiel',
  'Palace / Luxury',
  'Autre'
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const statutColor = (s: string) => {
  if (s === 'actif')                   return 'bg-eden-teal/10 text-eden-teal';
  if (s === 'en_attente_validation')   return 'bg-eden-orange/10 text-eden-orange';
  return 'bg-red-50 text-red-600';
};
const statutLabel = (s: string) => {
  if (s === 'actif')                   return 'Actif';
  if (s === 'en_attente_validation')   return 'En attente';
  return 'Suspendu';
};

// ── Composant principal ───────────────────────────────────────────────────────
export const EstablishmentManager: React.FC = () => {
  const [establishments, setEstablishments]         = useState<Etablissement[]>([]);
  const [searchTerm, setSearchTerm]                 = useState('');
  const [filterStatut, setFilterStatut]             = useState('all');
  const [selectedEstablishment, setSelectedEstablishment] = useState<Etablissement | null>(null);
  const [isLoading, setIsLoading]                   = useState(true);
  const [error, setError]                           = useState('');
  const [actionMessage, setActionMessage]           = useState('');

  // Mode création
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm]                     = useState<NewEtablissementForm>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [formError, setFormError]           = useState('');
  const photoInputRef                       = useRef<HTMLInputElement>(null);

  // ── Fetch ──
  const fetchEstablishments = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('eden_token');
    try {
      const response = await fetch('https://eden-hcr.onrender.com/api/admin/establishments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await response.json();
      if (response.ok) setEstablishments(resData.data || resData);
      else setError(resData.message || 'Erreur de chargement.');
    } catch {
      setError('Erreur de liaison avec le registre.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchEstablishments(); }, []);

  // ── Actions statut / suppression ──
  const handleUpdateStatus = async (id: string, newStatus: 'actif' | 'suspendu') => {
    const token = localStorage.getItem('eden_token');
    await fetch(`https://eden-hcr.onrender.com/api/admin/establishments/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ statutCompte: newStatus })
    });
    setEstablishments(prev => prev.map(e => e._id === id ? { ...e, statutCompte: newStatus } : e));
    if (selectedEstablishment?._id === id)
      setSelectedEstablishment(prev => prev ? { ...prev, statutCompte: newStatus } : null);
    setActionMessage(`Statut mis à jour : ${statutLabel(newStatus)}`);
    setTimeout(() => setActionMessage(''), 3000);
  };

  const handleDeleteEstablishment = async (id: string) => {
    if (!window.confirm('CONFIRMATION REQUISE : Voulez-vous supprimer définitivement cet établissement ?')) return;
    const token = localStorage.getItem('eden_token');
    const response = await fetch(`https://eden-hcr.onrender.com/api/admin/establishments/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      setEstablishments(prev => prev.filter(e => e._id !== id));
      setSelectedEstablishment(null);
      setActionMessage('Établissement supprimé avec succès.');
      setTimeout(() => setActionMessage(''), 3000);
    }
  };

  // ── Gestion formulaire création ──
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const preview = URL.createObjectURL(file);
      setForm(prev => ({ ...prev, photo: file, photoPreview: preview }));
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    const token = localStorage.getItem('eden_token');

    try {
      // Upload photo si présente (multipart)
      let photoUrl = '';
      if (form.photo) {
        const fd = new FormData();
        fd.append('file', form.photo);
        try {
          const uploadRes = await fetch('https://eden-hcr.onrender.com/api/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: fd
          });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            photoUrl = uploadData.url || uploadData.data?.url || '';
          }
        } catch {
          // Upload photo optionnel — on continue même si ça échoue
          console.warn('Upload photo échoué, on continue sans photo.');
        }
      }

      const payload = {
        raisonSociale:      form.raisonSociale,
        siret:              form.siret,
        typeEtablissement:  form.typeEtablissement,
        adresse: {
          rue:        form.adresse,
          ville:      form.ville,
          codePostal: form.codePostal
        },
        contactInterne: {
          nom:        form.contactNom,
          prenom:     form.contactPrenom,
          email:      form.contactEmail,
          telephone:  form.contactTelephone
        },
        photo:          photoUrl,
        statutCompte:   'en_attente_validation'
      };

      const response = await fetch('https://eden-hcr.onrender.com/api/admin/establishments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();

      if (response.ok) {
        const created: Etablissement = resData.data || resData;
        setEstablishments(prev => [created, ...prev]);
        setShowCreateForm(false);
        setForm(INITIAL_FORM);
        setActionMessage('Établissement créé et en attente de validation.');
        setTimeout(() => setActionMessage(''), 3500);
      } else {
        setFormError(resData.message || 'Erreur lors de la création.');
      }
    } catch {
      setFormError('Impossible de joindre le serveur.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Filtre ──
  const filteredEstablishments = useMemo(() => {
    return establishments.filter(e => {
      const matchesStatus = filterStatut === 'all' || e.statutCompte === filterStatut;
      const matchesSearch =
        (e.raisonSociale || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.siret || '').includes(searchTerm) ||
        (e.ville || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [establishments, filterStatut, searchTerm]);

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px] space-y-3 font-sans">
        <Loader2 className="animate-spin text-eden-tan" size={32} />
        <p className="text-xs text-eden-text-light font-light">Chargement du registre des établissements...</p>
      </div>
    );
  }

  // ── FORMULAIRE DE CRÉATION ────────────────────────────────────────────────
  if (showCreateForm) {
    return (
      <div className="p-6 lg:p-8 font-sans max-w-3xl mx-auto animate-[fadeInUp_0.4s_ease-out]">
        
        {/* Header formulaire */}
        <div className="flex items-center gap-3 mb-8">
          <button
            type="button"
            onClick={() => { setShowCreateForm(false); setForm(INITIAL_FORM); setFormError(''); }}
            className="p-2 rounded-xl border border-eden-border text-eden-text-light hover:text-eden-navy hover:border-eden-tan transition-all cursor-pointer bg-transparent"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <p className="text-[10px] font-mono font-bold tracking-[3px] uppercase text-eden-tan">Nouveau dossier</p>
            <h2 className="font-serif font-bold text-2xl text-eden-navy">Ajouter un établissement</h2>
          </div>
        </div>

        <form onSubmit={handleCreateSubmit} className="space-y-6">

          {formError && (
            <div className="p-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* ── PHOTO ── */}
          <div
            className="relative rounded-2xl overflow-hidden border-2 border-dashed border-eden-border bg-eden-bg2 cursor-pointer group transition-all hover:border-eden-tan"
            style={{ height: 200 }}
            onClick={() => photoInputRef.current?.click()}
          >
            {form.photoPreview ? (
              <>
                <img src={form.photoPreview} alt="Aperçu" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-eden-navy/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-xs font-semibold flex items-center gap-2"><ImagePlus size={16} /> Changer la photo</p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 select-none">
                <div className="p-4 bg-eden-navy/5 rounded-full"><ImagePlus size={28} className="text-eden-text-light" /></div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-eden-navy">Photo de l'établissement</p>
                  <p className="text-xs text-eden-text-light font-light mt-0.5">Cliquez pour uploader · JPG, PNG, WEBP</p>
                </div>
              </div>
            )}
            <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </div>

          {/* ── INFOS GÉNÉRALES ── */}
          <div className="bg-white border border-eden-border rounded-2xl p-6 space-y-4 shadow-xs">
            <p className="text-[10px] font-mono font-bold tracking-[2px] uppercase text-eden-tan flex items-center gap-2">
              <Building2 size={12} /> Informations générales
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-eden-text-dark">Raison sociale *</label>
              <input
                type="text" name="raisonSociale" required value={form.raisonSociale}
                onChange={handleFormChange} placeholder="Ex : Hôtel Mercure Lyon Centre"
                className="w-full bg-eden-bg border border-eden-border/80 rounded-xl p-3 text-xs outline-none focus:border-eden-tan transition-all text-eden-text-dark"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-eden-text-dark">SIRET *</label>
                <div className="relative">
                  <Hash size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-eden-text-light" />
                  <input
                    type="text" name="siret" required value={form.siret}
                    onChange={handleFormChange} placeholder="14 chiffres"
                    maxLength={14}
                    className="w-full bg-eden-bg border border-eden-border/80 rounded-xl pl-8 pr-3 p-3 text-xs outline-none focus:border-eden-tan transition-all font-mono text-eden-text-dark"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-eden-text-dark">Type d'établissement *</label>
                <div className="relative">
                  <Briefcase size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-eden-text-light pointer-events-none" />
                  <select
                    name="typeEtablissement" required value={form.typeEtablissement}
                    onChange={handleFormChange}
                    className="w-full bg-eden-bg border border-eden-border/80 rounded-xl pl-8 pr-3 p-3 text-xs outline-none focus:border-eden-tan transition-all text-eden-text-dark appearance-none cursor-pointer"
                  >
                    <option value="">Sélectionner...</option>
                    {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-eden-text-light pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* ── ADRESSE ── */}
          <div className="bg-white border border-eden-border rounded-2xl p-6 space-y-4 shadow-xs">
            <p className="text-[10px] font-mono font-bold tracking-[2px] uppercase text-eden-tan flex items-center gap-2">
              <MapPin size={12} /> Localisation
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-eden-text-dark">Adresse</label>
              <input
                type="text" name="adresse" value={form.adresse}
                onChange={handleFormChange} placeholder="12 rue de la Paix"
                className="w-full bg-eden-bg border border-eden-border/80 rounded-xl p-3 text-xs outline-none focus:border-eden-tan transition-all text-eden-text-dark"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-eden-text-dark">Ville *</label>
                <input
                  type="text" name="ville" required value={form.ville}
                  onChange={handleFormChange} placeholder="Paris"
                  className="w-full bg-eden-bg border border-eden-border/80 rounded-xl p-3 text-xs outline-none focus:border-eden-tan transition-all text-eden-text-dark"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-eden-text-dark">Code postal</label>
                <input
                  type="text" name="codePostal" value={form.codePostal}
                  onChange={handleFormChange} placeholder="75001"
                  maxLength={5}
                  className="w-full bg-eden-bg border border-eden-border/80 rounded-xl p-3 text-xs outline-none focus:border-eden-tan transition-all font-mono text-eden-text-dark"
                />
              </div>
            </div>
          </div>

          {/* ── CONTACT INTERNE ── */}
          <div className="bg-white border border-eden-border rounded-2xl p-6 space-y-4 shadow-xs">
            <p className="text-[10px] font-mono font-bold tracking-[2px] uppercase text-eden-tan flex items-center gap-2">
              <User size={12} /> Responsable / Contact interne
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-eden-text-dark">Prénom *</label>
                <input
                  type="text" name="contactPrenom" required value={form.contactPrenom}
                  onChange={handleFormChange}
                  className="w-full bg-eden-bg border border-eden-border/80 rounded-xl p-3 text-xs outline-none focus:border-eden-tan transition-all text-eden-text-dark"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-eden-text-dark">Nom *</label>
                <input
                  type="text" name="contactNom" required value={form.contactNom}
                  onChange={handleFormChange}
                  className="w-full bg-eden-bg border border-eden-border/80 rounded-xl p-3 text-xs outline-none focus:border-eden-tan transition-all text-eden-text-dark"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-eden-text-dark">Email *</label>
              <div className="relative">
                <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-eden-text-light" />
                <input
                  type="email" name="contactEmail" required value={form.contactEmail}
                  onChange={handleFormChange} placeholder="contact@hotel.fr"
                  className="w-full bg-eden-bg border border-eden-border/80 rounded-xl pl-8 pr-3 p-3 text-xs outline-none focus:border-eden-tan transition-all text-eden-text-dark"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-eden-text-dark">Téléphone</label>
              <div className="relative">
                <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-eden-text-light" />
                <input
                  type="tel" name="contactTelephone" value={form.contactTelephone}
                  onChange={handleFormChange} placeholder="06 00 00 00 00"
                  className="w-full bg-eden-bg border border-eden-border/80 rounded-xl pl-8 pr-3 p-3 text-xs outline-none focus:border-eden-tan transition-all text-eden-text-dark"
                />
              </div>
            </div>
          </div>

          {/* ── BOUTONS ── */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => { setShowCreateForm(false); setForm(INITIAL_FORM); setFormError(''); }}
              className="text-eden-text-light hover:text-eden-navy text-xs font-semibold bg-transparent border-none cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <X size={14} /> Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-eden-navy hover:bg-eden-light-navy text-white text-xs font-bold py-3 px-8 rounded-xl cursor-pointer transition-all disabled:opacity-50 shadow-md flex items-center gap-2 border-none"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
              {isSubmitting ? 'Enregistrement...' : 'Créer l\'établissement'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ── VUE LISTE ─────────────────────────────────────────────────────────────
  return (
    <div className="p-6 lg:p-8 font-sans space-y-6 max-w-[1600px] mx-auto animate-[fadeInUp_0.4s_ease-out]">

      {/* HEADER */}
      <div className="bg-eden-bg2 border border-eden-border rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-serif font-semibold text-xl text-eden-navy flex items-center gap-2">
            <Building2 size={22} className="text-eden-tan" /> Administration Établissements
          </h2>
          <p className="text-xs text-eden-text-light font-light">
            {establishments.length} établissement{establishments.length !== 1 ? 's' : ''} dans le registre
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Filtre statut */}
          <select
            value={filterStatut}
            onChange={e => setFilterStatut(e.target.value)}
            className="bg-eden-bg border border-eden-border rounded-xl px-3 py-2.5 text-xs text-eden-text-dark outline-none focus:border-eden-tan cursor-pointer"
          >
            <option value="all">Tous les statuts</option>
            <option value="actif">Actifs</option>
            <option value="en_attente_validation">En attente</option>
            <option value="suspendu">Suspendus</option>
          </select>

          {/* Recherche */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-eden-text-light" />
            <input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-eden-bg border border-eden-border rounded-xl pl-8 pr-4 py-2.5 text-xs outline-none focus:border-eden-tan text-eden-text-dark transition-all w-48"
            />
          </div>

          {/* Bouton ajout */}
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 bg-eden-navy hover:bg-eden-light-navy text-white py-2.5 px-4 rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-sm border-none"
          >
            <Plus size={14} /> Ajouter
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" /><span>{error}</span>
        </div>
      )}

      {actionMessage && (
        <div className="p-3 text-xs text-eden-navy bg-eden-tan/10 border border-eden-tan/30 rounded-xl font-medium animate-pulse">
          {actionMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── LISTE ── */}
        <div className="lg:col-span-8 space-y-3">
          {filteredEstablishments.length === 0 ? (
            <div className="bg-white border border-dashed border-eden-border rounded-2xl p-12 text-center space-y-3">
              <Building2 size={28} className="text-eden-text-light/40 mx-auto" />
              <p className="text-sm font-serif font-semibold text-eden-navy">Aucun établissement trouvé</p>
              <p className="text-xs text-eden-text-light font-light">Ajoutez votre premier établissement partenaire.</p>
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center gap-2 bg-eden-navy text-white py-2.5 px-5 rounded-xl text-xs font-semibold cursor-pointer transition-colors border-none mt-2"
              >
                <Plus size={14} /> Ajouter un établissement
              </button>
            </div>
          ) : (
            filteredEstablishments.map(est => (
              <div
                key={est._id}
                onClick={() => setSelectedEstablishment(est)}
                className={`bg-white border rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-md hover:border-eden-tan/40 flex ${selectedEstablishment?._id === est._id ? 'border-eden-tan shadow-md' : 'border-eden-border'}`}
              >
                {/* Photo thumbnail */}
                <div className="w-24 sm:w-32 shrink-0 bg-eden-navy/5 relative overflow-hidden">
                  {est.photo ? (
                    <img src={est.photo} alt={est.raisonSociale} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 size={24} className="text-eden-navy/20" />
                    </div>
                  )}
                </div>

                {/* Infos */}
                <div className="flex-1 p-4 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm text-eden-navy truncate">{est.raisonSociale}</p>
                      <span className="text-[10px] font-mono font-semibold bg-eden-navy/5 text-eden-navy px-2 py-0.5 rounded uppercase tracking-wide shrink-0">
                        {est.typeEtablissement}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-eden-text-light">SIRET : {est.siret}</p>
                    {(est.ville) && (
                      <p className="text-[11px] text-eden-text-light flex items-center gap-1">
                        <MapPin size={10} /> {est.ville}
                      </p>
                    )}
                    <p className="text-[11px] text-eden-text-dark font-light">
                      Contact : <span className="font-medium">{est.contactInterne?.prenom} {est.contactInterne?.nom}</span>
                    </p>
                  </div>
                  <div className="shrink-0">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide ${statutColor(est.statutCompte)}`}>
                      {statutLabel(est.statutCompte)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── PANNEAU DE CONTRÔLE ── */}
        <div className="lg:col-span-4 space-y-4">
          {selectedEstablishment ? (
            <div className="bg-white border border-eden-border rounded-2xl overflow-hidden shadow-md sticky top-24 animate-[fadeInUp_0.3s_ease-out]">

              {/* Photo bannière */}
              <div className="h-36 bg-eden-navy/5 relative overflow-hidden">
                {selectedEstablishment.photo ? (
                  <img src={selectedEstablishment.photo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 size={36} className="text-eden-navy/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-eden-navy/60 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <p className="text-white font-bold font-serif text-base leading-tight">{selectedEstablishment.raisonSociale}</p>
                  <p className="text-white/70 text-[11px] font-mono mt-0.5">{selectedEstablishment.typeEtablissement}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEstablishment(null)}
                  className="absolute top-3 right-3 p-1 bg-white/20 hover:bg-white/40 rounded-lg text-white border-none cursor-pointer transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Statut */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-eden-text-light">Statut</span>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold ${statutColor(selectedEstablishment.statutCompte)}`}>
                    {statutLabel(selectedEstablishment.statutCompte)}
                  </span>
                </div>

                {/* Infos clés */}
                <div className="space-y-2 text-xs bg-eden-bg/50 border border-eden-border/60 rounded-xl p-3">
                  <p className="text-eden-text-light font-light">SIRET : <span className="font-mono font-semibold text-eden-navy">{selectedEstablishment.siret}</span></p>
                  {selectedEstablishment.ville && (
                    <p className="text-eden-text-light font-light flex items-center gap-1">
                      <MapPin size={10} /> <span className="text-eden-navy font-medium">{selectedEstablishment.ville}</span>
                    </p>
                  )}
                  <p className="text-eden-text-light font-light">
                    Créé le <span className="text-eden-navy font-medium">{new Date(selectedEstablishment.createdAt).toLocaleDateString('fr-FR')}</span>
                  </p>
                </div>

                {/* Contact */}
                <div className="space-y-2 text-xs">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-eden-text-light">Contact</p>
                  <p className="font-semibold text-eden-navy">{selectedEstablishment.contactInterne?.prenom} {selectedEstablishment.contactInterne?.nom}</p>
                  <p className="text-eden-text-light flex items-center gap-1.5"><Mail size={11} className="shrink-0" />{selectedEstablishment.contactInterne?.email}</p>
                  {selectedEstablishment.contactInterne?.telephone && (
                    <p className="text-eden-text-light flex items-center gap-1.5"><Phone size={11} className="shrink-0" />{selectedEstablishment.contactInterne.telephone}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(
                      selectedEstablishment._id,
                      selectedEstablishment.statutCompte === 'actif' ? 'suspendu' : 'actif'
                    )}
                    className={`w-full p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors border-none ${
                      selectedEstablishment.statutCompte === 'actif'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-eden-teal hover:bg-eden-teal/90 text-white'
                    }`}
                  >
                    {selectedEstablishment.statutCompte === 'actif'
                      ? <><X size={13} /> Suspendre l'accès</>
                      : <><Check size={13} /> Réactiver l'accès</>
                    }
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteEstablishment(selectedEstablishment._id)}
                    className="w-full p-3 rounded-xl font-bold text-xs bg-red-50 text-red-700 hover:bg-red-100 flex items-center justify-center gap-2 cursor-pointer transition-colors border-none"
                  >
                    <Trash2 size={13} /> Supprimer définitivement
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-eden-bg2/40 border border-dashed border-eden-border rounded-2xl p-10 text-center select-none sticky top-24">
              <Eye size={26} className="text-eden-text-light/40 mx-auto mb-3" />
              <p className="text-xs font-medium text-eden-text-light">Sélectionnez un établissement pour voir ses détails et gérer son accès.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};