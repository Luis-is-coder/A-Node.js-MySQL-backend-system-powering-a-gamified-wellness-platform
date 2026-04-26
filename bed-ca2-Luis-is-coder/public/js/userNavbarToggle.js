document.addEventListener("DOMContentLoaded", function () {
  const loginButton = document.getElementById("loginButton");
  const registerButton = document.getElementById("registerButton");
  const profileButton = document.getElementById("profileButton");
  const logoutButton = document.getElementById("logoutButton");

  // Use tokenManager to check if logged in
  if (isTokenValid()) {
    // Token exists, show profile button and hide login and register buttons
    loginButton.classList.add("d-none");
    registerButton.classList.add("d-none");
    profileButton.classList.remove("d-none");
    logoutButton.classList.remove("d-none");
  } else {
    // Token does not exist, show login and register buttons
    loginButton.classList.remove("d-none");
    registerButton.classList.remove("d-none");
    profileButton.classList.add("d-none");
    logoutButton.classList.add("d-none");
  }

  logoutButton.addEventListener("click", function () {
    // Use tokenManager to clear token
    clearToken();
    window.location.href = "index.html";
  });
});
