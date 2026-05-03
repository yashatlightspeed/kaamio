const { Server } = require('socket.io');

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  global.io = io;

  io.on('connection', (socket) => {
    socket.on('join', (userId) => {
      socket.join(`user_${userId}`);
    });
    socket.on('join_project', (projectId) => {
      socket.join(`project_${projectId}`);
    });
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  });

  return io;
};

module.exports = initSocket;