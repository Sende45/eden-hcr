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

// @desc    Rechercher des missions
// @route   GET /api/mission/search?q=...
// @access  Private
export const searchMissions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(200).json([]);
    }

    const missions = await Mission.find({
      $or: [
        { titre: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { ville: { $regex: q, $options: 'i' } }
      ]
    })
      .populate('etablissementId', 'raisonSociale')
      .limit(20)
      .sort({ createdAt: -1 });

    res.status(200).json(missions);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la recherche des missions',
      error: error.message
    });
  }
};