/**
 * Format price to Vietnamese currency
 * @param {number} price - Price in VND
 * @returns {string} Formatted price string
 */
export const formatPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) {
    return '0₫';
  }
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

/**
 * Format date to Vietnamese locale
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
};

/**
 * Format date to short format
 * @param {string|Date} date - Date to format
 * @returns {string} Short formatted date string
 */
export const formatDateShort = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(dateObj);
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Vừa xong';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} phút trước`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} giờ trước`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ngày trước`;
  } else {
    return formatDateShort(dateObj);
  }
};

/**
 * Format number with commas
 * @param {number} number - Number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (number) => {
  if (typeof number !== 'number' || isNaN(number)) {
    return '0';
  }
  
  return new Intl.NumberFormat('vi-VN').format(number);
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size string
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength) + '...';
};

/**
 * Format phone number
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format Vietnamese phone number
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  } else if (cleaned.length === 11 && cleaned.startsWith('84')) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{3})(\d{3})/, '+$1 $2 $3 $4');
  }
  
  return phone;
};

/**
 * Format order status
 * @param {string} status - Order status
 * @returns {string} Formatted status string
 */
export const formatOrderStatus = (status) => {
  const statusMap = {
    'pending': 'Chờ xử lý',
    'confirmed': 'Đã xác nhận',
    'processing': 'Đang xử lý',
    'shipping': 'Đang giao hàng',
    'delivered': 'Đã giao hàng',
    'cancelled': 'Đã hủy',
    'returned': 'Đã hoàn trả'
  };
  
  return statusMap[status] || status;
};

/**
 * Get status color class
 * @param {string} status - Order status
 * @returns {string} Bootstrap color class
 */
export const getStatusColor = (status) => {
  const colorMap = {
    'pending': 'warning',
    'confirmed': 'info',
    'processing': 'primary',
    'shipping': 'primary',
    'delivered': 'success',
    'cancelled': 'danger',
    'returned': 'secondary'
  };
  
  return colorMap[status] || 'secondary';
};

/**
 * Get product image URL - handles both string and object formats
 * @param {string|object|array} image - Image data (can be string URL, object with url property, or array)
 * @param {string} fallback - Fallback image URL
 * @returns {string} Image URL
 */
export const getImageUrl = (image, fallback = '/placeholder-product.jpg') => {
  if (!image) return fallback;
  
  // If image is an array, get first element
  const img = Array.isArray(image) ? image[0] : image;
  
  if (!img) return fallback;
  
  // Helper function to normalize URL
  const normalizeUrl = (url) => {
    if (!url) return fallback;
    
    // If it's a full backend URL (http://localhost:5000/uploads/...), convert to relative
    if (url.includes('localhost:5000/uploads/') || url.includes('127.0.0.1:5000/uploads/')) {
      return url.replace(/https?:\/\/(localhost|127\.0\.0\.1):5000/, '');
    }
    
    // If it starts with http (external URL) or / (relative), return as is
    if (url.startsWith('http') || url.startsWith('/')) {
      return url;
    }
    
    // Otherwise, assume it's a filename and prepend uploads path
    return `/uploads/${url}`;
  };
  
  // If it's an object with url property
  if (typeof img === 'object' && img.url) {
    return normalizeUrl(img.url);
  }
  
  // If it's a string
  if (typeof img === 'string') {
    return normalizeUrl(img);
  }
  
  return fallback;
};
