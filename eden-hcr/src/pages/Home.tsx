import React from 'react';
import { ShieldCheck, Zap, Sparkles, ArrowUpRight, Award, Clock, ArrowRight, Building2, UserCheck, Star } from 'lucide-react';
import { CandidateOnboarding } from '../components/CandidateOnboarding';

// 1. DÉCLARATION STRICTE DES PROPS ATTENDUES
export type HomeProps = {
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
};

// 2. INJECTION DES PROPS DANS LE COMPOSANT
export const Home: React.FC<HomeProps> = ({ showOnboarding, setShowOnboarding }) => {

  // RENDER DU TUNNEL D'INSCRIPTION CANDIDAT (ÉTAPE 1)
  if (showOnboarding) {
    return (
      <div className="bg-eden-bg min-h-screen font-sans text-eden-text-dark py-12 px-6">
        <div className="max-w-2xl mx-auto mb-6 select-none">
          <button 
            onClick={() => setShowOnboarding(false)}
            className="text-xs font-semibold tracking-wide text-eden-navy hover:text-eden-tan transition-colors border-none bg-transparent cursor-pointer flex items-center gap-1.5"
          >
            ← Retour à l'accueil vitrine
          </button>
        </div>
        <CandidateOnboarding onComplete={() => setShowOnboarding(false)} />
      </div>
    );
  }

  return (
    <div className="bg-eden-bg min-h-screen font-sans text-eden-text-dark selection:bg-eden-navy selection:text-white overflow-hidden scroll-smooth">
      
      {/* HERO SECTION - ARCHITECTURE ASYMÉTRIQUE HAUT DE GAMME */}
      <section className="relative min-h-[90vh] flex items-center px-6 lg:px-16 bg-gradient-to-b from-eden-bg2 via-eden-bg2 to-eden-bg border-b border-eden-border/30">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full border-[60px] border-eden-tan/5 pointer-events-none blur-3xl animate-pulse duration-[6000ms]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full border-[50px] border-eden-teal/5 pointer-events-none blur-2xl" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 py-12">
          
          {/* ACCROCHE TEXTUELLE (7 COLONNES) */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-eden-navy/5 border border-eden-navy/10 text-eden-navy text-xs font-medium tracking-wider uppercase backdrop-blur-md">
              <Sparkles size={12} className="text-eden-tan animate-spin duration-3000" /> 
              <span>L'Élite de l'Intérim HCR</span>
            </div>
            
            <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl text-eden-navy tracking-tight leading-[1.08]">
              Le recrutement temporaire <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-eden-navy via-eden-light-navy to-eden-teal">
                haute performance
              </span>
            </h1>
            
            <p className="text-eden-text-light text-base md:text-lg max-w-xl font-light leading-relaxed">
              Pourvoyez vos brigades en quelques clics avec des professionals validés, bilingues et immédiatement opérationnels. Une flexibilité absolue, gérée de manière chirurgicale.
            </p>

            {/* CTAS COORDONNÉS */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button className="group bg-eden-navy hover:bg-eden-light-navy text-white font-medium text-xs tracking-wider uppercase py-4 px-8 rounded-xl shadow-lg hover:shadow-eden-navy/20 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer">
                Trouver un extra
                <Zap size={14} className="text-eden-orange fill-eden-orange group-hover:scale-125 transition-transform" />
              </button>
              
              {/* Branché sur le setShowOnboarding local */}
              <button 
                onClick={() => setShowOnboarding(true)}
                className="group bg-transparent hover:bg-eden-navy/5 text-eden-navy border border-eden-border hover:border-eden-tan font-medium text-xs tracking-wider uppercase py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                Devenir intérimaire EDÈN
                <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>

            {/* PRESTIGE PROOF */}
            <div className="pt-6 border-t border-eden-border/50 flex flex-wrap gap-x-8 gap-y-4 items-center">
              <div className="flex items-center gap-1 text-eden-tan">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-eden-tan" />)}
                <span className="text-xs font-semibold text-eden-navy ml-1">4.9/5</span>
              </div>
              <div className="text-xs font-light text-eden-text-light tracking-wide">
                Partenaire des plus grandes <span className="font-medium text-eden-navy">tables et palaces de France</span>
              </div>
            </div>
          </div>

          {/* VISUEL INTERACTIF SAAS LUXE (5 COLONNES) */}
          <div className="lg:col-span-5 relative hidden lg:block select-none">
            <div className="bg-eden-bg2 border border-eden-border rounded-2xl p-6 shadow-2xl space-y-4 relative z-10 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-eden-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-eden-teal animate-pulse" />
                  <span className="font-serif font-medium text-sm text-eden-navy tracking-wide">Matching en temps réel</span>
                </div>
                <span className="text-[10px] uppercase font-semibold tracking-widest text-eden-tan">Urgent</span>
              </div>

              <div className="bg-eden-bg/30 border border-eden-border-light rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-semibold text-eden-navy">Chef de partie chaud</h4>
                    <p className="text-[11px] text-eden-text-light flex items-center gap-1 mt-0.5">
                      <Building2 size={12} className="text-eden-tan" /> Brasserie de Prestige · Paris 8e
                    </p>
                  </div>
                  <span className="bg-eden-navy/5 text-eden-navy text-[10px] font-medium p-1 rounded">Cuisine</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-eden-text-light/80 pt-1 border-t border-eden-border/30">
                  <div className="flex items-center gap-1"><Clock size={11} /> 17:00 → 23:30</div>
                  <div className="font-semibold text-eden-navy">16.50 € / h</div>
                </div>
              </div>

              <div className="bg-eden-navy text-white rounded-xl p-3 shadow-lg flex items-center gap-3 transform translate-x-[-20px] w-[105%] animate-bounce duration-3000">
                <div className="w-8 h-8 rounded-full bg-eden-teal text-white flex items-center justify-center font-bold text-xs shrink-0">KD</div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">Koffi Diallo</p>
                  <p className="text-[10px] text-white/60 truncate">Profil vérifié · Étoilé Michelin</p>
                </div>
                <UserCheck size={16} className="text-eden-tan shrink-0 mr-1" />
              </div>
            </div>
            <div className="absolute inset-0 bg-eden-tan/10 rounded-2xl filter blur-xl transform scale-95 translate-y-4 z-0 pointer-events-none" />
          </div>

        </div>
      </section>

      {/* VALUE PROPOSITION GRID - SOLUTIONS BRANCHÉES ICI */}
      <section id="solutions" className="max-w-7xl mx-auto px-6 py-24 relative z-10 scroll-mt-20">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
          <p className="text-[10px] text-eden-tan font-semibold uppercase tracking-[4px]">L'Exigence EDÈN</p>
          <h2 className="font-serif font-bold text-3xl md:text-4xl text-eden-navy tracking-wide">
            Une brique technologique au service de l'excellence humaine
          </h2>
          <div className="w-12 h-[1px] bg-eden-tan mx-auto pt-2 opacity-40" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-eden-bg2 border border-eden-border-light rounded-2xl p-8 shadow-xs hover:border-eden-tan transition-all duration-300 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-eden-navy/5 text-eden-navy flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-eden-navy group-hover:text-white group-hover:shadow-md">
              <Award size={22} />
            </div>
            <h3 className="font-serif font-semibold text-xl text-eden-navy mb-3">Sourcing d'Élite</h3>
            <p className="text-xs text-eden-text-light font-light leading-relaxed">
              Entretien individuel systématique, contrôle rigoureux des références dans l'hôtellerie de luxe, et validation des acquis sur les normes de sécurité HACCP.
            </p>
            <div className="pt-4 flex items-center gap-1 text-[11px] font-semibold text-eden-tan opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Processus de sélection <ArrowRight size={12} />
            </div>
          </div>

          <div className="bg-eden-bg2 border border-eden-border-light rounded-2xl p-8 shadow-xs hover:border-eden-tan transition-all duration-300 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-eden-teal/5 text-eden-teal flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-eden-teal group-hover:text-white group-hover:shadow-md">
              <Clock size={22} />
            </div>
            <h3 className="font-serif font-semibold text-xl text-eden-navy mb-3">Réactivité "Coup de feu"</h3>
            <p className="text-xs text-eden-text-light font-light leading-relaxed">
              Un désistement de dernière minute avant la mise en place ? Notre algorithme de matching prévient instantanément les extras qualifiés à proximité immédiate.
            </p>
            <div className="pt-4 flex items-center gap-1 text-[11px] font-semibold text-eden-teal opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Algorithme prédictif <ArrowRight size={12} />
            </div>
          </div>

          <div className="bg-eden-bg2 border border-eden-border-light rounded-2xl p-8 shadow-xs hover:border-eden-tan transition-all duration-300 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-eden-tan/10 text-eden-tan flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-eden-tan group-hover:text-white group-hover:shadow-md">
              <ShieldCheck size={22} />
            </div>
            <h3 className="font-serif font-semibold text-xl text-eden-navy mb-3">Sécurité Légale Absolue</h3>
            <p className="text-xs text-eden-text-light font-light leading-relaxed">
              Génération automatisée des contrats CTT à la volée, déclarations DPAE instantanées, prise en compte des coupures et gestion fine de la convention collective HCR.
            </p>
            <div className="pt-4 flex items-center gap-1 text-[11px] font-semibold text-eden-tan opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Conformité France <ArrowRight size={12} />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION ÉTABLISSEMENTS - BRANCHÉE ICI */}
      <section id="etablissements" className="max-w-7xl mx-auto px-6 py-24 border-t border-eden-border/30 scroll-mt-20">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
          <p className="text-[10px] text-eden-tan font-semibold uppercase tracking-[4px]">Nos Partenaires</p>
          <h2 className="font-serif font-bold text-3xl md:text-4xl text-eden-navy tracking-wide">
            Déployé dans les plus grandes structures de France
          </h2>
          <div className="w-12 h-[1px] bg-eden-tan mx-auto pt-2 opacity-40" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-xs font-semibold text-eden-text-light/60 select-none">
          <div className="bg-eden-bg2 border border-eden-border-light p-6 rounded-xl">Palaces & Hôtels 5★</div>
          <div className="bg-eden-bg2 border border-eden-border-light p-6 rounded-xl">Tables Étoilées</div>
          <div className="bg-eden-bg2 border border-eden-border-light p-6 rounded-xl">Brasseries Premium</div>
          <div className="bg-eden-bg2 border border-eden-border-light p-6 rounded-xl">Traiteurs Événementiels</div>
        </div>
      </section>

    </div>
  );
};