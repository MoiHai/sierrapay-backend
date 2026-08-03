// Formatter Utility
const formatter = {
  // Format currency
  currency: (amount, currency = 'SLE') => {
    if (amount === undefined || amount === null) return '0.00';
    const formatted = Number(amount).toFixed(2);
    if (currency === 'SLE') {
      return `Le ${formatted}`;
    }
    return `${currency} ${formatted}`;
  },
  
  // Format date
  date: (date, format = 'default') => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    switch (format) {
      case 'short':
        return d.toLocaleDateString('en-US');
      case 'long':
        return d.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      case 'time':
        return d.toLocaleTimeString('en-US');
      case 'datetime':
        return d.toLocaleString('en-US');
      default:
        return d.toISOString();
    }
  },
  
  // Format phone number
  phone: (phone) => {
    if (!phone) return '';
    // Format Sierra Leone phone numbers
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('232')) {
      cleaned = cleaned.substring(3);
    }
    if (cleaned.length === 8) {
      return `${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5)}`;
    }
    return cleaned;
  },
  
  // Format transaction amount with sign
  transactionAmount: (amount, type) => {
    const sign = type === 'send' || type === 'withdrawal' ? '-' : '+';
    return `${sign} ${formatter.currency(amount)}`;
  }
};

module.exports = formatter;
