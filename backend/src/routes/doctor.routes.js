import express from 'express';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import {
  getPatients, getPatientSymptoms, getConsultations,
  createPrescription, getMessages, sendMessage
} from '../controllers/doctor.controller.js';

const router = express.Router();

router.use(protect, authorize('doctor'));

router.get('/patients', getPatients);
router.get('/patients/:id/symptoms', getPatientSymptoms);
router.get('/consultations', getConsultations);
router.post('/prescriptions', createPrescription);
router.get('/messages/:patientId', getMessages);
router.post('/messages/:patientId', sendMessage);

export default router;