import Mission from '../models/Mission.js';

export const createMission = async (req, res) => {
  try {
    const nouvelleMission = await Mission.create(req.body);

    res.status(201).json({
      status: 'success',
      message: 'Mission publiée avec succès au sein de la brigade.',
      data: nouvelleMission
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Impossible de publier la demande de shift.',
      error: error.message
    });
  }
};

export const getMissionsOuvertes = async (req, res) => {
  try {
    const missions = await Mission.find({ statutMission: 'ouverte' }).populate('etablissementId', 'raisonSociale typeEtablissement');
    res.status(200).json({
      status: 'success',
      results: missions.length,
      data: missions
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des missions.',
      error: error.message
    });
  }
};