import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';

const Prescription = sequelize.define('Prescription', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  consultationId: { type: DataTypes.INTEGER, allowNull: false },
  doctorId: { type: DataTypes.INTEGER, allowNull: false },
  patientId: { type: DataTypes.INTEGER, allowNull: false },
  medications: { type: DataTypes.JSON, allowNull: false },
  duration: { type: DataTypes.INTEGER, allowNull: false },
  instructions: { type: DataTypes.TEXT, allowNull: true },
});

export default Prescription;