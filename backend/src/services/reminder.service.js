import cron from 'node-cron';
import { Reminder, User } from '../models/index.js';
import { sendReminderEmail } from './email.service.js';
import { Op } from 'sequelize';

export const startReminderCron = () => {
  // Vérification toutes les minutes
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000);

      // Trouver les rappels non envoyés et dont l'heure est passée
      const reminders = await Reminder.findAll({
        where: {
          sent: false,
          scheduledAt: { [Op.lte]: fiveMinutesLater },
        },
        include: [{
          model: User,
          attributes: ['name', 'email'],
        }],
      });

      for (const reminder of reminders) {
        try {
          await sendReminderEmail({
            to: reminder.User.email,
            patientName: reminder.User.name,
            message: reminder.message,
            type: reminder.type,
          });

          // Marquer comme envoyé
          await reminder.update({ sent: true });
          console.log(`Rappel envoyé à ${reminder.User.email} ✅`);
        } catch (error) {
          console.error(`Erreur envoi rappel #${reminder.id}:`, error.message);
        }
      }
    } catch (error) {
      console.error('Erreur cron job:', error.message);
    }
  });

  console.log('Cron job rappels démarré ✅');
};