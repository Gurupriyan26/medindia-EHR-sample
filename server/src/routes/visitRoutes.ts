import { Router } from 'express';
import {
  getVisits,
  getVisitById,
  createVisit,
} from '../controllers/visitController.js';

const router = Router();

router.get('/', getVisits);
router.get('/:id', getVisitById);
router.post('/', createVisit);

export default router;
