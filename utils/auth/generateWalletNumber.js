// Generate Wallet Number
const generateWalletNumber = () => {
  // Format: 232XXXXXXXX (10-11 digits)
  const prefix = '232';
  let randomDigits = '';
  // Generate 7-8 random digits
  const length = Math.random() > 0.5 ? 7 : 8;
  for (let i = 0; i < length; i++) {
    randomDigits += Math.floor(Math.random() * 10);
  }
  return `${prefix}${randomDigits}`;
};

const generateWalletNumberWithChecksum = () => {
  const number = generateWalletNumber();
  // Simple checksum (Luhn-like algorithm)
  let sum = 0;
  let isEven = false;
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number[i]);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  const checksum = (10 - (sum % 10)) % 10;
  return number + checksum;
};

module.exports = {
  generateWalletNumber,
  generateWalletNumberWithChecksum
};
