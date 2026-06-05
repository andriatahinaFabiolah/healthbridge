import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';

const Reminder = sequelize.define('Reminder', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  patientId: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.ENUM('medication', 'consultation'), allowNull: false },
  message: { type: DataTypes.STRING, allowNull: false },
  scheduledAt: { type: DataTypes.DATE, allowNull: false },
  sent: { type: DataTypes.BOOLEAN, defaultValue: false },
});

export default Reminder;