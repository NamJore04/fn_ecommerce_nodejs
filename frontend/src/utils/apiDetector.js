/**
 * 🔧 Smart API URL Detection
 * 
 * Automatically detects the correct API URL based on the environment:
 * - Docker/Production: /api (proxied through Nginx)
 * - Local Development: http://localhost:5000/api (direct backend)
 * 
 * No manual switching needed! 🎉
 */

export function detectApiUrl() {
  // Priority 1: Explicitly set in environment variable
  if (process.env.REACT_APP_API_URL) {
    console.log('🔧 API URL from REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }

  // Priority 2: Detect based on current window location
  const currentPort = window.location.port;
  const hostname = window.location.hostname;

  // Check if running through Nginx (port 80/443 or no port)
  const isNginx = currentPort === '' || 
                  currentPort === '80' || 
                  currentPort === '443';

  if (isNginx) {
    // Running behind Nginx (Docker environment)
    console.log('🐳 Docker environment detected → Using /api (Nginx proxy)');
    return '/api';
  }

  // Check if development mode (React dev server on port 3000)
  if (currentPort === '3000') {
    // Local development mode
    console.log('💻 Local development detected → Using http://localhost:5000/api');
    return 'http://localhost:5000/api';
  }

  // Fallback: Assume local development
  console.log('⚠️  Unknown environment → Defaulting to http://localhost:5000/api');
  return 'http://localhost:5000/api';
}

// Export the detected API URL
export const API_URL = detectApiUrl();

// Log for debugging
console.log('═══════════════════════════════════════════════════');
console.log('🌍 Environment Detection');
console.log('═══════════════════════════════════════════════════');
console.log('Window Location:', window.location.href);
console.log('Port:', window.location.port || '(default)');
console.log('Hostname:', window.location.hostname);
console.log('API URL:', API_URL);
console.log('═══════════════════════════════════════════════════');

// Export helper functions
export default {
  API_URL,
  detectApiUrl,
  isDocker: () => API_URL === '/api',
  isLocal: () => API_URL.includes('localhost:5000')
};
