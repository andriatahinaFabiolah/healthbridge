import express from 'express';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import {
  submitSymptoms, createConsultation, getConsultations,
  getTreatment, getReminders, getMessages, sendMessage, getDoctors
} from '../controllers/patient.controller.js';

const router = express.Router();

router.use(protect, authorize('patient'));

router.post('/symptoms', submitSymptoms);
router.post('/consultations', createConsultation);
router.get('/consultations', getConsultations);
router.get('/treatments', getTreatment);
router.get('/reminders', getReminders);
router.get('/messages/:doctorId', getMessages);
router.post('/messages/:doctorId', sendMessage);
router.get('/doctors', getDoctors);

export default router;