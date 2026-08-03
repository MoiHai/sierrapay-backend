// Socket Server
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const environment = require('../config/environment');

let io = null;

const setupSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });
  
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      
      const decoded = jwt.verify(token, environment.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });
  
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    
    // Join user's room
    socket.join(`user:${socket.userId}`);
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
    
    // Handle ping
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });
  });
  
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = {
  setupSocket,
  getIO
};
