import express from 'express';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import {
  getPatients, getPatientRecord, getPatientTreatment, alertDoctor, getDoctorsList
} from '../controllers/nurse.controller.js';

const router = express.Router();

router.use(protect, authorize('nurse'));

router.get('/patients', getPatients);
router.get('/patients/:id/record', getPatientRecord);
router.get('/patients/:id/treatment', getPatientTreatment);
router.post('/alerts', alertDoctor);
router.get('/doctors', getDoctorsList);

export default router;