import { Consultation, Symptom, Prescription, Message, User } from '../models/index.js';

// Liste des patients (via consultations)
export const getPatients = async (req, res) => {
  try {
    const consultations = await Consultation.findAll({
      where: { doctorId: req.user.id },
      include: [{ model: User, as: 'Patient', attributes: ['id', 'name', 'email', 'phone'] }],
    });
    const patients = [...new Map(consultations.map(c => [c.Patient.id, c.Patient])).values()];
    res.status(200).json({ patients });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Symptômes d'un patient
export const getPatientSymptoms = async (req, res) => {
  try {
    const { id } = req.params;
    const symptoms = await Symptom.findAll({ where: { patientId: id } });
    res.status(200).json({ symptoms });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Consultations du médecin
export const getConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.findAll({
      where: { doctorId: req.user.id },
      include: [{ model: User, as: 'Patient', attributes: ['id', 'name', 'email'] }],
      order: [['date', 'ASC']],
    });
    res.status(200).json({ consultations });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Rédiger une ordonnance
export const createPrescription = async (req, res) => {
  try {
    const { consultationId, patientId, medications, duration, instructions } = req.body;
    const prescription = await Prescription.create({
      consultationId, patientId,
      doctorId: req.user.id,
      medications, duration, instructions,
    });
    await Consultation.update({ status: 'done' }, { where: { id: consultationId } });
    res.status(201).json({ message: 'Ordonnance créée', prescription });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Messages avec un patient
export const getMessages = async (req, res) => {
  try {
    const { patientId } = req.params;
    const messages = await Message.findAll({
      where: { senderId: req.user.id, receiverId: patientId },
    });
    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Envoyer un message
export const sendMessage = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { content } = req.body;
    const message = await Message.create({
      senderId: req.user.id,
      receiverId: patientId,
      content,
    });
    res.status(201).json({ message: 'Message envoyé', data: message });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};