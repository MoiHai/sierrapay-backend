// Phone Number Formatter
const phoneFormatter = {
  // Format phone to E.164 format
  formatToE164: (phone) => {
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Sierra Leone country code is +232
    // Check if it starts with 232
    if (cleaned.startsWith('232')) {
      return `+${cleaned}`;
    }
    // Check if it starts with 0
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
      return `+232${cleaned}`;
    }
    // Assume it's a local number without country code
    return `+232${cleaned}`;
  },
  
  // Format phone for display
  formatForDisplay: (phone) => {
    // Remove +232 prefix for display
    let formatted = phone.replace('+232', '');
    // Format as 76 123 456
    if (formatted.length === 8) {
      return `${formatted.substring(0, 2)} ${formatted.substring(2, 5)} ${formatted.substring(5)}`;
    }
    return formatted;
  },
  
  // Validate Sierra Leone phone number
  isValidSierraLeonePhone: (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    // Check if it's a valid Sierra Leone number (8-9 digits after country code)
    if (cleaned.startsWith('232')) {
      const number = cleaned.substring(3);
      return number.length >= 8 && number.length <= 9;
    }
    if (cleaned.startsWith('0')) {
      const number = cleaned.substring(1);
      return number.length >= 8 && number.length <= 9;
    }
    return cleaned.length >= 8 && cleaned.length <= 9;
  },
  
  // Extract local number (without country code)
  extractLocalNumber: (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('232')) {
      return cleaned.substring(3);
    }
    if (cleaned.startsWith('0')) {
      return cleaned.substring(1);
    }
    return cleaned;
  }
};

module.exports = phoneFormatter;
