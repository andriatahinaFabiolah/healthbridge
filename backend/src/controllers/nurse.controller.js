import { Consultation, User, Prescription, Symptom } from '../models/index.js';

// Liste des patients assignés (via consultations actives)
export const getPatients = async (req, res) => {
  try {
    const consultations = await Consultation.findAll({
      where: { status: 'active' },
      include: [{ model: User, as: 'Patient', attributes: ['id', 'name', 'email', 'phone'] }],
    });
    const patients = [...new Map(consultations.map(c => [c.Patient.id, c.Patient])).values()];
    res.status(200).json({ patients });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Dossier médical d'un patient
export const getPatientRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const symptoms = await Symptom.findAll({ where: { patientId: id } });
    const consultations = await Consultation.findAll({
      where: { patientId: id },
      include: [{ model: User, as: 'Doctor', attributes: ['id', 'name', 'specialty'] }],
    });
    res.status(200).json({ symptoms, consultations });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Suivre l'évolution du traitement
export const getPatientTreatment = async (req, res) => {
  try {
    const { id } = req.params;
    const prescriptions = await Prescription.findAll({
      where: { patientId: id },
      include: [{ model: Consultation }],
    });
    res.status(200).json({ prescriptions });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Alerter le médecin
export const alertDoctor = async (req, res) => {
  try {
    const { doctorId, patientId, message } = req.body;
    // Pour l'instant on simule l'alerte (on branchera Socket.io plus tard)
    res.status(201).json({
      message: 'Alerte envoyée au médecin',
      alert: { doctorId, patientId, content: message, sentBy: req.user.id }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};