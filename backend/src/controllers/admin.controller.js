import { User, Consultation, Prescription, Message } from '../models/index.js';

// Tous les comptes utilisateurs
export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Activer / désactiver un compte
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    await User.update({ isActive }, { where: { id } });
    res.status(200).json({ message: 'Statut mis à jour' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Supprimer un compte
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.destroy({ where: { id } });
    res.status(200).json({ message: 'Compte supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Statistiques globales
export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalPatients = await User.count({ where: { role: 'patient' } });
    const totalDoctors = await User.count({ where: { role: 'doctor' } });
    const totalNurses = await User.count({ where: { role: 'nurse' } });
    const totalAdmins = await User.count({ where: { role: 'admin' } });
    const totalConsultations = await Consultation.count();
    const totalPrescriptions = await Prescription.count();
    const pendingConsultations = await Consultation.count({ where: { status: 'pending' } });
    const activeConsultations = await Consultation.count({ where: { status: 'active' } });
    const doneConsultations = await Consultation.count({ where: { status: 'done' } });

    res.status(200).json({
      totalUsers, totalPatients, totalDoctors, totalNurses, totalAdmins,
      totalConsultations, totalPrescriptions, pendingConsultations,
      activeConsultations, doneConsultations,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Signalements (placeholder pour l'instant)
export const getReports = async (req, res) => {
  try {
    res.status(200).json({ reports: [] });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};