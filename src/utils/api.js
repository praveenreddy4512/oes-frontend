/**
 * API Utility - Wraps fetch with credentials: 'include' for cross-origin cookies
 * Ensures all API calls include session cookies AND JWT tokens automatically
 */

export const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Get JWT token from localStorage
 * @returns {string|null} JWT token or null if not available
 */
export function getToken() {
  return localStorage.getItem('jwtToken');
}

/**
 * Store JWT token in localStorage
 * @param {string} token - JWT token to store
 */
export function setToken(token) {
  localStorage.setItem('jwtToken', token);
}

/**
 * Remove JWT token from localStorage
 */
export function clearToken() {
  localStorage.removeItem('jwtToken');
}

/**
 * Make an API call with automatic credential inclusion and JWT token
 * @param {string} endpoint - API endpoint (e.g., '/api/login')
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise} Fetch response
 */
export async function apiCall(endpoint, options = {}) {
  const url = `${apiUrl}${endpoint}`;
  const token = getToken();
  
  const defaultOptions = {
    credentials: 'include',  // ✅ Always include cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,  // Allow overriding headers
    },
  };

  // Add JWT token to Authorization header if available
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  // Merge user options with defaults
  const fetchOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  const response = await fetch(url, fetchOptions);
  
  // If 401 Unauthorized, clear token and handle differently based on error type
  if (response.status === 401) {
    clearToken();
    
    // Parse error to identify reason
    try {
      const errorData = await response.clone().json();
      if (errorData.error === 'Session Invalidated') {
        // Session was invalidated due to multi-login
        console.warn('[🚫 SESSION_INVALIDATED]', errorData.message);
        localStorage.setItem('sessionInvalidatedReason', JSON.stringify({
          reason: 'multi_login',
          message: errorData.message,
          invalidatedAt: errorData.invalidatedAt
        }));
      }
    } catch (e) {
      // Error parsing response, continue
    }
    
    // Redirect to login page after clearing token
    window.location.href = '/login';
  }
  
  return response;
}

/**
 * Make a GET request
 * @param {string} endpoint - API endpoint
 * @returns {Promise} Fetch response
 */
export async function apiGet(endpoint) {
  return apiCall(endpoint, { method: 'GET' });
}

/**
 * Make a POST request
 * @param {string} endpoint - API endpoint
 * @param {object} body - Request body (will be JSON stringified)
 * @returns {Promise} Fetch response
 */
export async function apiPost(endpoint, body) {
  return apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Make a PUT request
 * @param {string} endpoint - API endpoint
 * @param {object} body - Request body (will be JSON stringified)
 * @returns {Promise} Fetch response
 */
export async function apiPut(endpoint, body) {
  return apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * Make a DELETE request
 * @param {string} endpoint - API endpoint
 * @returns {Promise} Fetch response
 */
export async function apiDelete(endpoint) {
  return apiCall(endpoint, { method: 'DELETE' });
}

export default apiCall;
