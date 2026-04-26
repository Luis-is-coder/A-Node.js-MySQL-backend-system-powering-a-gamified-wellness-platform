document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("editProfileModal");
  const submitBtn = document.getElementById("submitEditProfileBtn");
  const form = document.getElementById("editProfileForm");
  const errorDiv = document.getElementById("editProfileError");
  const successDiv = document.getElementById("editProfileSuccess");

  // Load current user data when modal opens
  if (modal) {
    modal.addEventListener("show.bs.modal", function () {
      errorDiv.classList.add("d-none");
      successDiv.classList.add("d-none");

      const callback = (responseStatus, responseData) => {
        // Handle auth error
        if (handleAuthError(responseStatus)) {
          return;
        }

        if (responseStatus === 200 && responseData) {
          document.getElementById("editUserId").value = responseData.user_id;
          document.getElementById("currentUsername").value =
            responseData.username;
          document.getElementById("currentEmail").value = responseData.email;
          document.getElementById("editUsername").value = responseData.username;
          document.getElementById("editEmail").value = responseData.email;
          document.getElementById("currentPassword").value = "";
          document.getElementById("newPassword").value = "";
        }
      };

      // Use fetchWithAuth for authenticated request
      fetchWithAuth(
        currentUrl + "/api/users/token/info",
        callback,
        "GET",
        null,
      );
    });

    // Reset form when modal closes
    modal.addEventListener("hidden.bs.modal", function () {
      form.reset();
      errorDiv.classList.add("d-none");
      successDiv.classList.add("d-none");
    });
  }

  // Handle form submission
  if (submitBtn) {
    submitBtn.addEventListener("click", function (e) {
      e.preventDefault();

      errorDiv.classList.add("d-none");
      successDiv.classList.add("d-none");

      const userId = document.getElementById("editUserId").value;
      const currentUsername = document.getElementById("currentUsername").value;
      const currentEmail = document.getElementById("currentEmail").value;
      const newUsername = document.getElementById("editUsername").value.trim();
      const newEmail = document.getElementById("editEmail").value.trim();
      const currentPassword = document.getElementById("currentPassword").value;
      const newPassword = document.getElementById("newPassword").value;

      // Validation
      if (!newUsername || !newEmail || !currentPassword) {
        errorDiv.textContent = "Please fill in all required fields";
        errorDiv.classList.remove("d-none");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span>Updating...';

      // Prepare data
      const data = {
        username: currentUsername,
        email: currentEmail,
        password: currentPassword,
        updated_username: newUsername,
        updated_email: newEmail,
        updated_password: newPassword || currentPassword,
      };

      const callback = (responseStatus, responseData) => {
        submitBtn.disabled = false;
        submitBtn.innerHTML =
          '<i class="bi bi-check-circle me-2"></i>Update Profile';

        // Handle auth error
        if (handleAuthError(responseStatus)) {
          return;
        }

        if (responseStatus === 200) {
          successDiv.textContent =
            "Profile updated successfully! Refreshing...";
          successDiv.classList.remove("d-none");

          setTimeout(() => {
            bootstrap.Modal.getInstance(modal).hide();
            window.location.reload();
          }, 1500);
        } else {
          errorDiv.textContent =
            responseData.message || "Failed to update profile";
          errorDiv.classList.remove("d-none");
        }
      };

      // Use fetchWithAuth for authenticated update
      fetchWithAuth(currentUrl + `/api/users/${userId}`, callback, "PUT", data);
    });
  }
});
