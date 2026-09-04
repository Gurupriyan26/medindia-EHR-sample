import { Router } from 'express';
import {
  getConsents,
  createConsent,
  updateConsentStatus,
} from '../controllers/consentController.js';

const router = Router();

router.get('/', getConsents);
router.post('/', createConsent);
router.patch('/:id/status', updateConsentStatus);

export default router;
