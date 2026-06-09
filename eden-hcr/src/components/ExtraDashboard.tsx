import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle,
  FileText,
  Euro,
  Briefcase
} from 'lucide-react';

export const ExtraDashboard = ({ user }: any) => {

  const [missions, setMissions] = useState([]);
  const [contrats, setContrats] = useState([]);
  const [paiements, setPaiements] = useState([]);

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

        if (missionsRes.ok)
          setMissions(await missionsRes.json());

        if (contratsRes.ok)
          setContrats(await contratsRes.json());

        if (paiementsRes.ok)
          setPaiements(await paiementsRes.json());

      } catch (err) {
        console.error(err);
      }
    };

    loadData();
  }, []);

  return (
    <div className="p-8 space-y-6">

      <div className="bg-white rounded-2xl border p-6">
        <h2 className="text-2xl font-bold">
          Bonjour {user?.prenom}
        </h2>

        <p className="text-gray-500 mt-1">
          Bienvenue dans votre espace EDÈN.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">

        <div className="bg-white p-5 rounded-xl border">
          <Briefcase />
          <h3 className="text-2xl font-bold">
            {missions.length}
          </h3>
          <p>Missions disponibles</p>
        </div>

        <div className="bg-white p-5 rounded-xl border">
          <Calendar />
          <h3 className="text-2xl font-bold">
            0
          </h3>
          <p>Planning</p>
        </div>

        <div className="bg-white p-5 rounded-xl border">
          <FileText />
          <h3 className="text-2xl font-bold">
            {contrats.length}
          </h3>
          <p>Contrats</p>
        </div>

        <div className="bg-white p-5 rounded-xl border">
          <Euro />
          <h3 className="text-2xl font-bold">
            {paiements.length}
          </h3>
          <p>Fiches de paie</p>
        </div>

      </div>

      <div className="bg-white border rounded-2xl p-6">
        <h3 className="font-bold mb-4">
          Missions disponibles
        </h3>

        {missions.length === 0 ? (
          <p>Aucune mission disponible.</p>
        ) : (
          missions.map((mission: any) => (
            <div
              key={mission._id}
              className="border rounded-xl p-4 mb-3"
            >
              <h4 className="font-semibold">
                {mission.posteRecherche}
              </h4>

              <p>{mission.briefing}</p>

              <button className="mt-3 bg-eden-navy text-white px-4 py-2 rounded-lg">
                Postuler
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
};