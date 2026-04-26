/**
 * Token Manager
 * Centralized token management and authenticated requests
 */

// Get token from localStorage
function getAuthToken() {
  return localStorage.getItem("token");
}

// Check if user has a valid token
function isTokenValid() {
  return getAuthToken() !== null;
}

// Save token to localStorage (for login/register)
function saveToken(token) {
  localStorage.setItem("token", token);
}

// Remove token from localStorage (for logout)
function clearToken() {
  localStorage.removeItem("token");
}

// Redirect to login if no token exists
function requireLogin() {
  if (!isTokenValid()) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

// Make authenticated API request (automatically includes token)
function fetchWithAuth(url, callback, method = "GET", data = null) {
  const token = getAuthToken();
  fetchMethod(url, callback, method, data, token);
}

// Make public API request (no token needed)
function fetchPublic(url, callback, method = "GET", data = null) {
  fetchMethod(url, callback, method, data, null);
}

// Handle 401 authentication errors
function handleAuthError(responseStatus) {
  if (responseStatus === 401) {
    alert("Your session has expired. Please log in again.");
    clearToken();
    window.location.href = "login.html";
    return true;
  }
  return false;
}
