import app from './src/app.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './src/utils/database.js';

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
await connectDB();
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});