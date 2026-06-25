import { Symptom, Consultation, Prescription, Message, Reminder, User } from '../models/index.js';

// Soumettre les symptômes
export const submitSymptoms = async (req, res) => {
  try {
    const { description, severity } = req.body;
    const specialtyMap = {
      high: 'Urgentiste',
      medium: 'Généraliste',
      low: 'Généraliste',
    };
    const symptom = await Symptom.create({
      patientId: req.user.id,
      description,
      severity,
      suggestedSpecialty: specialtyMap[severity],
    });
    res.status(201).json({ message: 'Symptômes soumis avec succès', symptom });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Créer une consultation
export const createConsultation = async (req, res) => {
  try {
    const { doctorId, symptomId, date } = req.body;
    const consultation = await Consultation.create({
      patientId: req.user.id,
      doctorId, symptomId, date,
    });
    res.status(201).json({ message: 'Consultation créée', consultation });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Récupérer ses consultations
export const getConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.findAll({
      where: { patientId: req.user.id },
      include: [{ model: User, as: 'Doctor', attributes: ['id', 'name', 'specialty'] }],
    });
    res.status(200).json({ consultations });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Récupérer son traitement
export const getTreatment = async (req, res) => {
  try {
    const prescriptions = await Prescription.findAll({
      where: { patientId: req.user.id },
      include: [{ model: Consultation }],
    });
    res.status(200).json({ prescriptions });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Récupérer ses rappels
export const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.findAll({
      where: { patientId: req.user.id },
      order: [['scheduledAt', 'ASC']],
    });
    res.status(200).json({ reminders });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Récupérer messages avec un médecin
export const getMessages = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const messages = await Message.findAll({
      where: {
        senderId: req.user.id, receiverId: doctorId,
      },
    });
    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Envoyer un message
export const sendMessage = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { content } = req.body;
    const message = await Message.create({
      senderId: req.user.id,
      receiverId: doctorId,
      content,
    });
    res.status(201).json({ message: 'Message envoyé', data: message });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};