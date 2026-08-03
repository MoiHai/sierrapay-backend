// DateTime Utility
const dateTime = {
  // Current timestamp
  now: () => {
    return new Date().toISOString();
  },
  
  // Add minutes to date
  addMinutes: (minutes, date = new Date()) => {
    const newDate = new Date(date);
    newDate.setMinutes(newDate.getMinutes() + minutes);
    return newDate.toISOString();
  },
  
  // Add hours to date
  addHours: (hours, date = new Date()) => {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + hours);
    return newDate.toISOString();
  },
  
  // Add days to date
  addDays: (days, date = new Date()) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate.toISOString();
  },
  
  // Check if date is expired
  isExpired: (date) => {
    if (!date) return true;
    const expiryDate = new Date(date);
    return expiryDate < new Date();
  },
  
  // Format date difference
  timeAgo: (date) => {
    if (!date) return '';
    const now = new Date();
    const past = new Date(date);
    const diff = now - past;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
  },
  
  // Get start and end of day
  getDayRange: (date = new Date()) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return {
      start: start.toISOString(),
      end: end.toISOString()
    };
  },
  
  // Get start and end of month
  getMonthRange: (date = new Date()) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return {
      start: start.toISOString(),
      end: end.toISOString()
    };
  }
};

module.exports = dateTime;
