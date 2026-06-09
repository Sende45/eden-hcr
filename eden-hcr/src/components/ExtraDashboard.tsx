import React, { useEffect, useState } from 'react';
import {
  Calendar,
  FileText,
  Euro,
  Briefcase,
  User,
  Clock,
  LogOut
} from 'lucide-react';

export const ExtraDashboard = ({ user }: any) => {
  const [missions, setMissions] = useState<any[]>([]);
  const [contrats, setContrats] = useState<any[]>([]);
  const [paiements, setPaiements] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('eden_token');

    const loadData = async () => {
      try {
        const missionsRes = await fetch(
          'https://eden-hcr.onrender.com/api/mission',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const contratsRes = await fetch(
          'https://eden-hcr.onrender.com/api/contrats',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const paiementsRes = await fetch(
          'https://eden-hcr.onrender.com/api/paiements',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (missionsRes.ok) {
          setMissions(await missionsRes.json());
        }

        if (contratsRes.ok) {
          setContrats(await contratsRes.json());
        }

        if (paiementsRes.ok) {
          setPaiements(await paiementsRes.json());
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen flex bg-[#F7F5F1]">

      {/* SIDEBAR */}

      <aside className="w-[290px] bg-[#073B4C] text-white flex flex-col">

        <div className="p-8 border-b border-white/10">
          <h1 className="text-4xl font-serif text-[#C5A46D]">
            EDÈN
          </h1>

          <p className="text-sm text-white/70 mt-2">
            Espace Extra
          </p>
        </div>

        <div className="flex-1 p-6">

          <p className="text-xs tracking-[4px] text-[#C5A46D] mb-6">
            MON ESPACE
          </p>

          <div className="space-y-3">

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10">
              <Briefcase size={18} />
              <span>Missions</span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10">
              <Calendar size={18} />
              <span>Planning</span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10">
              <FileText size={18} />
              <span>Contrats</span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10">
              <Euro size={18} />
              <span>Paie</span>
            </div>

          </div>
        </div>

        <div className="p-6 border-t border-white/10">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-full bg-[#C5A46D] flex items-center justify-center font-bold">
              {user?.prenom?.[0] || 'E'}
            </div>

            <div>
              <p className="font-semibold">
                {user?.prenom} {user?.nom}
              </p>

              <p className="text-xs text-white/60">
                Extra EDÈN
              </p>
            </div>

          </div>

        </div>

      </aside>

      {/* CONTENU */}

      <main className="flex-1">

        {/* HEADER */}

        <div className="bg-white border-b px-10 py-8">

          <h1 className="text-5xl font-serif text-[#073B4C]">
            Tableau de bord
          </h1>

          <p className="text-gray-500 mt-2">
            Bienvenue dans votre espace personnel EDÈN
          </p>

        </div>

        {/* CONTENU */}

        <div className="p-10 space-y-8">

          {/* BIENVENUE */}

          <div className="bg-white rounded-3xl border border-[#E6DDD1] p-8">

            <div className="flex items-center gap-4">

              <div className="w-16 h-16 rounded-2xl bg-[#F4EFE8] flex items-center justify-center">
                <User className="text-[#073B4C]" />
              </div>

              <div>
                <h2 className="text-3xl font-serif text-[#073B4C]">
                  Bonjour {user?.prenom}
                </h2>

                <p className="text-gray-500">
                  Heureux de vous revoir sur la plateforme EDÈN.
                </p>
              </div>

            </div>

          </div>

          {/* KPIs */}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            <div className="bg-white rounded-3xl border border-[#E6DDD1] p-6">
              <Briefcase className="text-[#C5A46D]" />
              <h3 className="text-4xl font-bold mt-4">
                {missions.length}
              </h3>
              <p className="text-gray-500">
                Missions disponibles
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-[#E6DDD1] p-6">
              <Calendar className="text-[#C5A46D]" />
              <h3 className="text-4xl font-bold mt-4">
                0
              </h3>
              <p className="text-gray-500">
                Planning
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-[#E6DDD1] p-6">
              <FileText className="text-[#C5A46D]" />
              <h3 className="text-4xl font-bold mt-4">
                {contrats.length}
              </h3>
              <p className="text-gray-500">
                Contrats
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-[#E6DDD1] p-6">
              <Euro className="text-[#C5A46D]" />
              <h3 className="text-4xl font-bold mt-4">
                {paiements.length}
              </h3>
              <p className="text-gray-500">
                Fiches de paie
              </p>
            </div>

          </div>

          {/* MISSIONS */}

          <div className="bg-white rounded-3xl border border-[#E6DDD1] p-8">

            <h2 className="text-3xl font-serif text-[#073B4C] mb-6">
              Missions disponibles
            </h2>

            {missions.length === 0 ? (
              <div className="border rounded-2xl p-10 text-center text-gray-500">
                Aucune mission disponible actuellement.
              </div>
            ) : (
              <div className="space-y-4">

                {missions.map((mission: any) => (
                  <div
                    key={mission._id}
                    className="border rounded-2xl p-6"
                  >
                    <h3 className="font-bold text-lg">
                      {mission.posteRecherche}
                    </h3>

                    <p className="text-gray-600 mt-2">
                      {mission.briefing}
                    </p>

                    <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                      <Clock size={14} />
                      Mission disponible
                    </div>

                    <button className="mt-5 bg-[#073B4C] hover:bg-[#0A5268] text-white px-5 py-3 rounded-xl transition-colors">
                      Postuler
                    </button>
                  </div>
                ))}

              </div>
            )}

          </div>

        </div>

      </main>

    </div>
  );
};