import app from './src/app.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './src/utils/database.js';
import { syncDB } from './src/models/index.js';
import { Message } from './src/models/index.js';
import { verifyEmailConfig } from './src/services/email.service.js';
import { startReminderCron } from './src/services/reminder.service.js';

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Rejoindre une room (conversation entre 2 utilisateurs)
  socket.on('joinRoom', ({ userId, receiverId }) => {
    const room = [userId, receiverId].sort().join('-');
    socket.join(room);
    console.log(`User ${userId} joined room ${room}`);
  });

  // Envoyer un message en temps réel
  socket.on('sendMessage', async ({ senderId, receiverId, content }) => {
    try {
      // Sauvegarder en base de données
      const message = await Message.create({ senderId, receiverId, content });

      // Diffuser dans la room
      const room = [senderId, receiverId].sort().join('-');
      io.to(room).emit('receiveMessage', message);
    } catch (error) {
      console.error('Erreur socket message:', error);
    }
  });

  // Indicateur "en train d'écrire"
  socket.on('typing', ({ userId, receiverId }) => {
    const room = [userId, receiverId].sort().join('-');
    socket.to(room).emit('userTyping', { userId });
  });

  socket.on('stopTyping', ({ userId, receiverId }) => {
    const room = [userId, receiverId].sort().join('-');
    socket.to(room).emit('userStopTyping', { userId });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

await connectDB();
await syncDB();

await verifyEmailConfig();
startReminderCron();

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});