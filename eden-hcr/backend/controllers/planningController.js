import Planning from '../models/Planning.js';

export const addPlanningEntry = async (req, res) => {
  try {
    const nouvelleEntree = await Planning.create(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Shift inscrit au planning de la brigade avec succès.',
      data: nouvelleEntree
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: "Impossible d'ajouter le shift au planning.",
      error: error.message
    });
  }
};