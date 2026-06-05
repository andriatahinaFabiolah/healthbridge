import sequelize from '../utils/database.js';
import User from './User.js';
import Symptom from './Symptom.js';
import Consultation from './Consultation.js';
import Prescription from './Prescription.js';
import Message from './Message.js';
import Reminder from './Reminder.js';

// Associations
User.hasMany(Symptom, { foreignKey: 'patientId' });
Symptom.belongsTo(User, { foreignKey: 'patientId' });

User.hasMany(Consultation, { foreignKey: 'patientId', as: 'PatientConsultations' });
User.hasMany(Consultation, { foreignKey: 'doctorId', as: 'DoctorConsultations' });
Consultation.belongsTo(User, { foreignKey: 'patientId', as: 'Patient' });
Consultation.belongsTo(User, { foreignKey: 'doctorId', as: 'Doctor' });

Consultation.hasOne(Prescription, { foreignKey: 'consultationId' });
Prescription.belongsTo(Consultation, { foreignKey: 'consultationId' });

User.hasMany(Message, { foreignKey: 'senderId', as: 'SentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'ReceivedMessages' });

User.hasMany(Reminder, { foreignKey: 'patientId' });
Reminder.belongsTo(User, { foreignKey: 'patientId' });

// Sync
export const syncDB = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Tables synchronisées avec MySQL ✅');
  } catch (error) {
    console.error('Erreur de synchronisation ❌', error);
  }
};

export { User, Symptom, Consultation, Prescription, Message, Reminder };
export default sequelize;