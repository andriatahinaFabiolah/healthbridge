import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';

const Symptom = sequelize.define('Symptom', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  patientId: { type: DataTypes.INTEGER, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  severity: { type: DataTypes.ENUM('low', 'medium', 'high'), allowNull: false },
  suggestedSpecialty: { type: DataTypes.STRING, allowNull: true },
});

export default Symptom;