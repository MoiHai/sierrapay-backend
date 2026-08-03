// Transaction Socket
const { getIO } = require('./socketServer');

const TransactionSocket = {
  // Notify sender of transaction status
  notifySender: (userId, transaction) => {
    const io = getIO();
    io.to(`user:${userId}`).emit('transaction_sent', transaction);
  },
  
  // Notify receiver of received payment
  notifyReceiver: (userId, transaction) => {
    const io = getIO();
    io.to(`user:${userId}`).emit('transaction_received', transaction);
  },
  
  // Notify both parties of completed transaction
  notifyBoth: (senderId, receiverId, transaction) => {
    const io = getIO();
    io.to(`user:${senderId}`).emit('transaction_completed', transaction);
    io.to(`user:${receiverId}`).emit('transaction_completed', transaction);
  }
};

module.exports = TransactionSocket;
