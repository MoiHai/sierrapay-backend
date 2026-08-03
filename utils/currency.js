// Currency Utility
const currency = {
  // Format currency
  format: (amount, currency = 'SLE') => {
    if (amount === undefined || amount === null) return '0.00';
    const formatted = Number(amount).toFixed(2);
    switch (currency) {
      case 'SLE':
        return `Le ${formatted}`;
      case 'USD':
        return `$${formatted}`;
      case 'EUR':
        return `€${formatted}`;
      case 'GBP':
        return `£${formatted}`;
      default:
        return `${currency} ${formatted}`;
    }
  },
  
  // Convert between currencies (placeholder)
  convert: (amount, from, to) => {
    // In production, you'd call an exchange rate API
    // For now, assume 1:1 for same currency
    if (from === to) return amount;
    
    // Placeholder conversion rates
    const rates = {
      SLE: 1,
      USD: 0.04,
      EUR: 0.037,
      GBP: 0.032
    };
    
    if (!rates[from] || !rates[to]) return amount;
    return (amount / rates[from]) * rates[to];
  },
  
  // Validate amount
  isValid: (amount) => {
    if (amount === undefined || amount === null) return false;
    const num = Number(amount);
    return !isNaN(num) && num >= 0 && isFinite(num);
  },
  
  // Round amount to 2 decimal places
  round: (amount) => {
    return Number(amount).toFixed(2);
  }
};

module.exports = currency;
