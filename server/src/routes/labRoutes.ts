import { Router } from 'express';
import {
  getLabReports,
  getLabReportById,
  createLabReport,
} from '../controllers/labController.js';

const router = Router();

router.get('/', getLabReports);
router.get('/:id', getLabReportById);
router.post('/', createLabReport);

export default router;
