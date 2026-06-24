// candidatRoutes.js
import express from 'express';
import multer from 'multer';
import {
  registerCandidat,
  updateCandidateStatus,
  searchCandidats,
  uploadDocuments,
} from '../controllers/candidatController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/documents/'),
  filename:    (req, file, cb) => {
    const ext  = file.originalname.split('.').pop();
    const name = `${req.params.id}_${file.fieldname}_${Date.now()}.${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max par fichier
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format non autorisé. PDF, JPG ou PNG uniquement.'));
    }
  },
});

const docFields = upload.fields([
  { name: 'idCard',      maxCount: 1 },
  { name: 'vitaleCard',  maxCount: 1 },
  { name: 'rib',         maxCount: 1 },
  { name: 'titreSejour', maxCount: 1 },
]);

router.post('/',                          protect, registerCandidat);
router.patch('/:id/status',              protect, updateCandidateStatus);
router.get('/search',                    protect, searchCandidats);
router.post('/:id/documents',            protect, docFields, uploadDocuments);

export default router;