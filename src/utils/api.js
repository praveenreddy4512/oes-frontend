/**
 * API Utility - Wraps fetch with credentials: 'include' for cross-origin cookies
 * Ensures all API calls include session cookies automatically
 */

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Make an API call with automatic credential inclusion
 * @param {string} endpoint - API endpoint (e.g., '/api/login')
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise} Fetch response
 */
export async function apiCall(endpoint, options = {}) {
  const url = `${apiUrl}${endpoint}`;
  
  const defaultOptions = {
    credentials: 'include',  // ✅ Always include cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,  // Allow overriding headers
    },
  };

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
