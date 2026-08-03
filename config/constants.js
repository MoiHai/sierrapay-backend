// Application Constants
module.exports = {
  // User Roles
  ROLES: {
    USER: 'user',
    MERCHANT: 'merchant',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin'
  },
  
  // Transaction Types
  TRANSACTION_TYPES: {
    SEND: 'send',
    RECEIVE: 'receive',
    QR_PAYMENT: 'qr_payment',
    BILL_PAYMENT: 'bill_payment',
    WITHDRAWAL: 'withdrawal',
    DEPOSIT: 'deposit',
    FEE: 'fee',
    REVERSAL: 'reversal'
  },
  
  // Transaction Status
  TRANSACTION_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REVERSED: 'reversed',
    CANCELLED: 'cancelled'
  },
  
  // KYC Status
  KYC_STATUS: {
    PENDING: 'pending',
    SUBMITTED: 'submitted',
    VERIFIED: 'verified',
    REJECTED: 'rejected',
    EXPIRED: 'expired'
  },
  
  // OTP Types
  OTP_TYPES: {
    LOGIN: 'login',
    REGISTER: 'register',
    TRANSACTION: 'transaction',
    RESET_PASSWORD: 'reset_password',
    VERIFY_EMAIL: 'verify_email',
    VERIFY_PHONE: 'verify_phone'
  },
  
  // Notification Types
  NOTIFICATION_TYPES: {
    TRANSACTION: 'transaction',
    KYC: 'kyc',
    PROMOTION: 'promotion',
    SECURITY: 'security',
    SYSTEM: 'system',
    BILL_PAYMENT: 'bill_payment'
  },
  
  // Limits
  MAX_OTP_ATTEMPTS: 5,
  MAX_TRANSACTION_AMOUNT: 10000,
  MAX_WITHDRAWAL_AMOUNT: 5000,
  MIN_TRANSACTION_AMOUNT: 1,
  
  // Currency
  CURRENCY: 'SLE',
  CURRENCY_SYMBOL: 'Le',
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
};
