import React, { useState } from 'react';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Footer } from './components/Footer';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ClientLogin } from './pages/ClientLogin'; // <-- Importation de l'écran Client
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react'; // Ajout des icônes pour le contact premium

type AppView = 'landing' | 'login' | 'dashboard' | 'contact' | 'client-login'; // <-- Ajout strict de 'client-login'

function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  // Déclaration de l'état partagé pour l'onboarding de la vitrine
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  
  // États locaux pour gérer le formulaire de contact en ligne
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState<boolean>(false);

  // ÉCRAN 1 : Interface d'administration complète (Dashboard)
  if (currentView === 'dashboard') {
    return (
      <div className="relative">
        <Dashboard />
        <button
          onClick={() => setCurrentView('landing')}
          className="fixed bottom-4 right-4 bg-eden-tan hover:bg-eden-navy text-white text-xs font-medium p-2 rounded-lg shadow-lg z-50 transition-colors cursor-pointer border-none"
        >
          ← Déconnexion Agence
        </button>
      </div>
    );
  }

  // ÉCRAN 2 : Formulaire de connexion sécurisé (Login)
  if (currentView === 'login') {
    return (
      <div className="relative">
        <Login onLoginSuccess={() => setCurrentView('dashboard')} />
        <button
          onClick={() => setCurrentView('landing')}
          className="fixed bottom-4 right-4 bg-eden-navy hover:bg-eden-light-navy text-white text-xs font-medium p-2.5 rounded-xl shadow-lg z-50 transition-colors cursor-pointer border-none"
        >
          ← Retour à la Vitrine
        </button>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="fixed bottom-4 left-4 bg-eden-tan/20 text-eden-navy hover:bg-eden-tan hover:text-white text-[10px] p-2 rounded-lg z-50 transition-all cursor-pointer border-none"
        >
          Bypass Login (Dev) →
        </button>
      </div>
    );
  }

  // ÉCRAN NOUVEAU : Formulaire de connexion Espace Client Établissement
  if (currentView === 'client-login') {
    return (
      <div className="relative">
        <ClientLogin onLoginSuccess={() => alert("Connexion réussie ! Interface de commande Hôtel/Restaurant en cours d'intégration.")} />
        <button
          onClick={() => setCurrentView('landing')}
          className="fixed bottom-4 right-4 bg-eden-navy hover:bg-eden-light-navy text-white text-xs font-medium p-2.5 rounded-xl shadow-lg z-50 transition-colors cursor-pointer border-none"
        >
          ← Retour à la Vitrine
        </button>
      </div>
    );
  }

  // ÉCRAN INTERMÉDIAIRE : Vue de Contact dédiée intégrée
  const renderMainContent = () => {
    if (currentView === 'contact') {
      return (
        <div className="bg-eden-bg min-h-[80vh] py-12 px-6 animate-[fadeInUp_0.35s_ease-out]">
          <div className="max-w-5xl mx-auto mb-6 select-none">
            <button 
              onClick={() => {
                setCurrentView('landing');
                setContactSubmitted(false);
              }}
              className="text-xs font-semibold tracking-wide text-eden-navy hover:text-eden-tan transition-colors border-none bg-transparent cursor-pointer flex items-center gap-1.5"
            >
              ← Retour à l'accueil vitrine
            </button>
          </div>

          {contactSubmitted ? (
            <div className="max-w-2xl mx-auto bg-white p-10 rounded-2xl border border-eden-border shadow-xl text-center space-y-4">
              <div className="flex justify-center text-eden-teal">
                <CheckCircle2 size={48} className="animate-pulse" />
              </div>
              <h3 className="font-serif font-semibold text-2xl text-eden-navy">Demande transmise</h3>
              <p className="text-xs text-eden-text-light max-w-md mx-auto leading-relaxed">
                Votre message a bien été pris en compte par la direction d'EDÈN Group. Un conseiller HCR vous recontactera sous 24h.
              </p>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* CARTES D'INFOS AGENCE (5 COLONNES) */}
              <div className="lg:col-span-5 bg-eden-navy text-white p-8 rounded-2xl space-y-6 shadow-lg relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-20%] w-48 h-48 rounded-full border-[20px] border-[#b2976a]/5 pointer-events-none" />
                <div className="space-y-1">
                  <h2 className="font-serif font-semibold text-2xl tracking-wide">Maison EDÈN</h2>
                  <p className="text-[10px] text-eden-tan font-bold tracking-[3px] uppercase">Relations Établissements</p>
                </div>
                <p className="text-xs text-white/70 font-light leading-relaxed pt-2">
                  Prenez contact avec nos équipes de Paris pour planifier vos renforts de brigades ou l'intégration de nos extras certifiés.
                </p>
                <div className="space-y-4 pt-4 text-xs font-light">
                  <div className="flex items-center gap-3"><Mail size={15} className="text-eden-tan" /> <span>contact@eden-group.co</span></div>
                  <div className="flex items-center gap-3"><Phone size={15} className="text-eden-tan" /> <span>+33 (0)1 00 00 00 00</span></div>
                  <div className="flex items-center gap-3"><MapPin size={15} className="text-eden-tan" /> <span>Paris, France</span></div>
                </div>
              </div>

              {/* FORMULAIRE DESIGN PRESTIGE (7 COLONNES) */}
              <div className="lg:col-span-7 bg-eden-bg2 border border-eden-border rounded-2xl p-8 shadow-sm">
                <form 
                  onSubmit={(e) => { e.preventDefault(); setContactSubmitted(true); }} 
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-eden-navy">Nom Complet</label>
                      <input 
                        type="text" required value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="bg-eden-bg border border-eden-border rounded-xl p-3 text-xs outline-hidden focus:border-eden-tan text-eden-text-dark" 
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-eden-navy">Adresse Email</label>
                      <input 
                        type="email" required value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="bg-eden-bg border border-eden-border rounded-xl p-3 text-xs outline-hidden focus:border-eden-tan text-eden-text-dark" 
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-eden-navy">Objet</label>
                    <input 
                      type="text" required value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="bg-eden-bg border border-eden-border rounded-xl p-3 text-xs outline-hidden focus:border-eden-tan text-eden-text-dark" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-eden-navy">Message</label>
                    <textarea 
                      required rows={4} value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="bg-eden-bg border border-eden-border rounded-xl p-3 text-xs outline-hidden focus:border-eden-tan text-eden-text-dark resize-none leading-relaxed" 
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-eden-navy hover:bg-eden-light-navy text-white text-xs font-semibold py-3.5 px-6 rounded-xl border-none cursor-pointer flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98"
                  >
                    <Send size={13} className="text-eden-tan" /> Transmettre ma demande
                  </button>
                </form>
              </div>

            </div>
          )}
        </div>
      );
    }

    return <Home showOnboarding={showOnboarding} setShowOnboarding={setShowOnboarding} />;
  };

  // ÉCRAN 3 (Vue par défaut) : Landing page vitrine avec le vrai logo
  return (
    <div className="flex flex-col min-h-screen bg-eden-bg selection:bg-eden-navy selection:text-white">
      {/* Configuration du Header avec toutes ses fonctions de routage public */}
      <Header 
        onNavigateToDashboard={() => {
          setShowOnboarding(false);
          setCurrentView('login');
        }} 
        onNavigateToOnboarding={() => {
          setCurrentView('landing');
          setShowOnboarding(true);
        }}
        onNavigateToContact={() => {
          setShowOnboarding(false);
          setCurrentView('contact');
        }}
        onNavigateToClientAuth={() => {
          setShowOnboarding(false);
          setCurrentView('client-login');
        }}
      />
      <main className="flex-1">
        {renderMainContent()}
      </main>
      <Footer />
    </div>
  );
}

export default App;