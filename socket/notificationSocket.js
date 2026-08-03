// Notification Socket
const { getIO } = require('./socketServer');

const NotificationSocket = {
  // Send notification to specific user
  sendToUser: (userId, notification) => {
    const io = getIO();
    io.to(`user:${userId}`).emit('notification', notification);
  },
  
  // Send notification to multiple users
  sendToUsers: (userIds, notification) => {
    const io = getIO();
    userIds.forEach(userId => {
      io.to(`user:${userId}`).emit('notification', notification);
    });
  },
  
  // Send transaction update
  sendTransactionUpdate: (userId, transaction) => {
    const io = getIO();
    io.to(`user:${userId}`).emit('transaction_update', transaction);
  }
};

module.exports = NotificationSocket;
