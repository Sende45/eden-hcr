import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Footer } from './components/Footer';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { getMe, isAuthenticated, logout } from './services/authService';
import { ExtraDashboard } from './components/ExtraDashboard';

// ─── Types ────────────────────────────────────────────────────────────────────

type AppView =
  | 'landing'
  | 'login'
  | 'dashboard'
  | 'superadmin'
  | 'dashboard-prestataire'
  | 'contact';

interface AppUser {
  id: string;
  email: string;
  role: string;
  nom?: string;
  prenom?: string;
  candidatRef?: string;
  etablissementRef?: string;
}

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  const [currentView, setCurrentView]           = useState<AppView>('landing');
  const [showOnboarding, setShowOnboarding]     = useState<boolean>(false);
  const [user, setUser]                         = useState<AppUser | null>(null);
  const [contactForm, setContactForm]           = useState({ name: '', email: '', subject: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState<boolean>(false);

  // Oriente l'utilisateur selon son rôle
  const determineDashboardView = (role: string): AppView => {
    if (role === 'superadmin') return 'superadmin';
    if (role === 'admin')      return 'dashboard';
    return 'dashboard-prestataire';
  };

  // Synchronisation de session au chargement
  useEffect(() => {
    if (isAuthenticated()) {
      getMe()
        .then((profile) => {
          setUser(profile);
          setCurrentView(determineDashboardView(profile.role));
        })
        .catch(() => {
          logout();
          setUser(null);
          setCurrentView('landing');
        });
    }
  }, []);

  // Déconnexion globale
  const handleLogout = () => {
    logout();
    setUser(null);
    setCurrentView('landing');
  };

  // ── SuperAdmin ───────────────────────────────────────────────────────────────
  if (currentView === 'superadmin') {
    return (
      <div className="relative">
        <Dashboard user={user} />
        <button
          onClick={handleLogout}
          className="fixed bottom-4 right-4 bg-eden-tan hover:bg-eden-navy text-white text-xs font-medium p-2 rounded-lg shadow-lg z-50 transition-colors cursor-pointer border-none"
        >
          ← Déconnexion SuperAdmin
        </button>
      </div>
    );
  }

  // ── Admin ────────────────────────────────────────────────────────────────────
  if (currentView === 'dashboard') {
    return (
      <div className="relative">
        <Dashboard user={user} />
        <button
          onClick={handleLogout}
          className="fixed bottom-4 right-4 bg-eden-tan hover:bg-eden-navy text-white text-xs font-medium p-2 rounded-lg shadow-lg z-50 transition-colors cursor-pointer border-none"
        >
          ← Déconnexion Agence
        </button>
      </div>
    );
  }

  // ── Extra / Prestataire ──────────────────────────────────────────────────────
  if (currentView === 'dashboard-prestataire') {
    return (
      <ExtraDashboard
        user={user ?? {}}
        onLogout={handleLogout}
      />
    );
  }

  // ── Login ────────────────────────────────────────────────────────────────────
  if (currentView === 'login') {
    return (
      <div className="relative">
        <Login
          onPrestataireLoginSuccess={(userData) => {
            setUser(userData);
            setCurrentView(determineDashboardView(userData.role));
          }}
          onAdminLoginSuccess={() => {
            getMe()
              .then((profile) => {
                setUser(profile);
                setCurrentView(determineDashboardView(profile.role));
              })
              .catch(() => {
                setCurrentView('dashboard');
              });
          }}
        />
        <button
          onClick={() => setCurrentView('landing')}
          className="fixed bottom-4 right-4 bg-eden-navy hover:bg-eden-light-navy text-white text-xs font-medium p-2.5 rounded-xl shadow-lg z-50 transition-colors cursor-pointer border-none"
        >
          ← Retour à la Vitrine
        </button>
      </div>
    );
  }

  // ── Landing + Contact ────────────────────────────────────────────────────────
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
                  <div className="flex items-center gap-3"><Mail size={15} className="text-eden-tan" /><span>contact@eden-group.co</span></div>
                  <div className="flex items-center gap-3"><Phone size={15} className="text-eden-tan" /><span>+33 (0)1 00 00 00 00</span></div>
                  <div className="flex items-center gap-3"><MapPin size={15} className="text-eden-tan" /><span>Paris, France</span></div>
                </div>
              </div>

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

  return (
    <div className="flex flex-col min-h-screen bg-eden-bg selection:bg-eden-navy selection:text-white">
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
          setCurrentView('login');
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