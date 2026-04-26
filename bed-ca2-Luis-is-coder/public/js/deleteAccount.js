document.addEventListener("DOMContentLoaded", function () {
  const deleteAccountBtn = document.getElementById("deleteAccountBtn");
  const continueDeleteBtn = document.getElementById("continueDeleteBtn");
  const finalDeleteBtn = document.getElementById("finalDeleteBtn");

  const deleteAccountModal = document.getElementById("deleteAccountModal");
  const deleteConfirmModal = document.getElementById("deleteConfirmModal");

  const deleteError = document.getElementById("deleteError");
  const deleteSuccess = document.getElementById("deleteSuccess");
  const deleteConfirmForm = document.getElementById("deleteConfirmForm");

  // Step 1: User clicks "Continue to Delete" button
  if (continueDeleteBtn) {
    continueDeleteBtn.addEventListener("click", function () {
      const modal1 = bootstrap.Modal.getInstance(deleteAccountModal);
      modal1.hide();

      const modal2 = new bootstrap.Modal(deleteConfirmModal);
      modal2.show();

      deleteConfirmForm.reset();
      deleteError.classList.add("d-none");
      deleteSuccess.classList.add("d-none");
    });
  }

  // Step 2: User clicks "Permanently Delete Account" button
  if (finalDeleteBtn) {
    finalDeleteBtn.addEventListener("click", function () {
      deleteError.classList.add("d-none");
      deleteSuccess.classList.add("d-none");

      const confirmText = document.getElementById("confirmDeleteText").value;
      const password = document.getElementById("deletePassword").value;

      // Validation
      if (confirmText !== "DELETE") {
        deleteError.textContent = 'Please type "DELETE" exactly to confirm.';
        deleteError.classList.remove("d-none");
        return;
      }

      if (!password) {
        deleteError.textContent = "Please provide your account password.";
        deleteError.classList.remove("d-none");
        return;
      }

      // Check if user is logged in using tokenManager
      if (!isTokenValid()) {
        deleteError.textContent =
          "You must be logged in to delete your account.";
        deleteError.classList.remove("d-none");
        return;
      }

      finalDeleteBtn.disabled = true;
      finalDeleteBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span>Deleting...';

      // Get user info from token
      const getUserCallback = function (responseStatus, responseData) {
        // Handle auth error
        if (handleAuthError(responseStatus)) {
          finalDeleteBtn.disabled = false;
          finalDeleteBtn.innerHTML =
            '<i class="bi bi-trash me-2"></i>Permanently Delete Account';
          return;
        }

        if (responseStatus === 200 && responseData) {
          const userId = responseData.user_id;
          const username = responseData.username;
          const email = responseData.email;

          const deleteData = {
            username: username,
            email: email,
            password: password,
          };

          const deleteCallback = function (responseStatus, responseData) {
            if (responseStatus === 200 || responseStatus === 204) {
              deleteSuccess.textContent =
                "Account deleted successfully! Redirecting...";
              deleteSuccess.classList.remove("d-none");

              setTimeout(() => {
                // Use tokenManager to clear token
                clearToken();
                window.location.href = "index.html";
              }, 2000);
            } else {
              finalDeleteBtn.disabled = false;
              finalDeleteBtn.innerHTML =
                '<i class="bi bi-trash me-2"></i>Permanently Delete Account';

              const errorMsg =
                responseData && responseData.message
                  ? responseData.message
                  : "Failed to delete account";

              deleteError.textContent = errorMsg;
              deleteError.classList.remove("d-none");
            }
          };

          // Use fetchWithAuth for authenticated delete
          fetchWithAuth(
            currentUrl + `/api/users/${userId}`,
            deleteCallback,
            "DELETE",
            deleteData,
          );
        } else {
          finalDeleteBtn.disabled = false;
          finalDeleteBtn.innerHTML =
            '<i class="bi bi-trash me-2"></i>Permanently Delete Account';

          deleteError.textContent =
            "Error getting user information. Please try again.";
          deleteError.classList.remove("d-none");
        }
      };

      // Use fetchWithAuth for authenticated request
      fetchWithAuth(
        currentUrl + "/api/users/token/info",
        getUserCallback,
        "GET",
        null,
      );
    });
  }

  // Reset forms when modals close
  if (deleteAccountModal) {
    deleteAccountModal.addEventListener("hidden.bs.modal", function () {
      // Reset handled when opening next modal
    });
  }

  if (deleteConfirmModal) {
    deleteConfirmModal.addEventListener("hidden.bs.modal", function () {
      deleteConfirmForm.reset();
      deleteError.classList.add("d-none");
      deleteSuccess.classList.add("d-none");

      if (finalDeleteBtn) {
        finalDeleteBtn.disabled = false;
        finalDeleteBtn.innerHTML =
          '<i class="bi bi-trash me-2"></i>Permanently Delete Account';
      }
    });
  }
});
