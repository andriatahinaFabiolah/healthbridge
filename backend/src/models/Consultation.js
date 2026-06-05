import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';

const Consultation = sequelize.define('Consultation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  patientId: { type: DataTypes.INTEGER, allowNull: false },
  doctorId: { type: DataTypes.INTEGER, allowNull: false },
  symptomId: { type: DataTypes.INTEGER, allowNull: true },
  date: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'active', 'done'), defaultValue: 'pending' },
  notes: { type: DataTypes.TEXT, allowNull: true },
});

export default Consultation;