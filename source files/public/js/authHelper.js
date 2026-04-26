// Check if token expired and redirect to login
function handleAuthError(responseStatus, errorDiv) {
  if (responseStatus === 401) {
    if (errorDiv) {
      errorDiv.textContent =
        "Your session has expired. Redirecting to login...";
      errorDiv.classList.remove("d-none");
    }
    localStorage.removeItem("token");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
    return true;
  }
  return false;
}
