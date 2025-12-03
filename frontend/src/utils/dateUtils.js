/**
 * Date utility functions for handling various date formats from backend
 */

/**
 * Parse Java LocalDateTime array format to JavaScript Date
 * Java sends dates as: [year, month, day, hour, minute, second, nanosecond]
 * @param {Array|string|number} dateValue - Date value from backend
 * @returns {Date|null} - JavaScript Date object or null if invalid
 */
export const parseJavaDate = (dateValue) => {
  if (!dateValue) return null;

  // If it's already a valid Date object
  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? null : dateValue;
  }

  // If it's an array (Java LocalDateTime format)
  if (Array.isArray(dateValue)) {
    try {
      const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = dateValue;
      
      // Validate required fields
      if (!year || !month || !day) return null;
      
      // Java months are 1-based, JavaScript months are 0-based
      const jsMonth = month - 1;
      
      // Create date with milliseconds (convert nanoseconds to milliseconds)
      const milliseconds = Math.floor(nano / 1000000);
      const date = new Date(year, jsMonth, day, hour, minute, second, milliseconds);
      
      return isNaN(date.getTime()) ? null : date;
    } catch (error) {
      console.error('Error parsing Java date array:', error);
      return null;
    }
  }

  // If it's a string or number, try standard Date parsing
  try {
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

/**
 * Format date to Vietnamese locale date string
 * @param {Array|string|Date} dateValue - Date value to format
 * @returns {string} - Formatted date string or 'N/A'
 */
export const formatDate = (dateValue) => {
  const date = parseJavaDate(dateValue);
  if (!date) return 'N/A';
  
  try {
    return date.toLocaleDateString('vi-VN');
  } catch {
    return 'N/A';
  }
};

/**
 * Format date to Vietnamese locale datetime string
 * @param {Array|string|Date} dateValue - Date value to format
 * @returns {string} - Formatted datetime string or 'N/A'
 */
export const formatDateTime = (dateValue) => {
  const date = parseJavaDate(dateValue);
  if (!date) return 'N/A';
  
  try {
    return date.toLocaleString('vi-VN');
  } catch {
    return 'N/A';
  }
};

/**
 * Format date to Vietnamese locale time string
 * @param {Array|string|Date} dateValue - Date value to format
 * @returns {string} - Formatted time string or 'N/A'
 */
export const formatTime = (dateValue) => {
  const date = parseJavaDate(dateValue);
  if (!date) return 'N/A';
  
  try {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'N/A';
  }
};

/**
 * Format date with custom options
 * @param {Array|string|Date} dateValue - Date value to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string or 'N/A'
 */
export const formatDateCustom = (dateValue, options = {}) => {
  const date = parseJavaDate(dateValue);
  if (!date) return 'N/A';
  
  try {
    return new Intl.DateTimeFormat('vi-VN', options).format(date);
  } catch {
    return 'N/A';
  }
};

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param {Array|string|Date} dateValue - Date value
 * @returns {string} - Relative time string or 'N/A'
 */
export const getRelativeTime = (dateValue) => {
  const date = parseJavaDate(dateValue);
  if (!date) return 'N/A';
  
  try {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return 'vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHour < 24) return `${diffHour} giờ trước`;
    if (diffDay < 30) return `${diffDay} ngày trước`;
    
    return formatDate(dateValue);
  } catch {
    return 'N/A';
  }
};

/**
 * Check if a date value is valid
 * @param {Array|string|Date} dateValue - Date value to check
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidDate = (dateValue) => {
  const date = parseJavaDate(dateValue);
  return date !== null;
};

/**
 * Format currency to Vietnamese Dong (VND)
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'N/A';
  }
  
  try {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  } catch {
    return 'N/A';
  }
};

/**
 * Format number with thousand separators
 * @param {number} num - Number to format
 * @returns {string} - Formatted number string
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) {
    return 'N/A';
  }
  
  try {
    return new Intl.NumberFormat('vi-VN').format(num);
  } catch {
    return 'N/A';
  }
};