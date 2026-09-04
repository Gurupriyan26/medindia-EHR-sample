import { Router } from 'express';
import { getAIPatientSummary } from '../controllers/aiController.js';

const router = Router();

router.get('/patient-summary/:patientId', getAIPatientSummary);

export default router;
