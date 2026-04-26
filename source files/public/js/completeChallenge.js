document.addEventListener("DOMContentLoaded", function () {
  const submitBtn = document.getElementById("submitCompleteBtn");
  const errorDiv = document.getElementById("completeChallengeError");
  const successDiv = document.getElementById("completeChallengeSuccess");
  const modal = document.getElementById("completeChallengeModal");

  if (submitBtn) {
    submitBtn.addEventListener("click", function (e) {
      e.preventDefault();

      errorDiv.classList.add("d-none");
      successDiv.classList.add("d-none");

      const challengeId = document.getElementById("completeChallengeId").value;
      const details = document.getElementById("completionDetails").value.trim();

      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span>Completing...';

      const data = {
        details: details,
      };

      const callback = function (responseStatus, responseData) {
        // Handle auth error
        if (handleAuthError(responseStatus)) {
          return;
        }

        if (responseStatus === 201) {
          submitBtn.innerHTML =
            '<span class="spinner-border spinner-border-sm me-2"></span>Success!';

          successDiv.textContent = `Challenge completed successfully! You now have ${responseData.current_userpoint} points!`;
          successDiv.classList.remove("d-none");

          setTimeout(function () {
            bootstrap.Modal.getInstance(modal).hide();
            window.location.reload();
          }, 1500);
        } else {
          submitBtn.disabled = false;
          submitBtn.innerHTML =
            '<i class="bi bi-check-circle me-2"></i>Mark as Complete';

          errorDiv.textContent =
            responseData.message || "Failed to complete challenge";
          errorDiv.classList.remove("d-none");
        }
      };

      // Use fetchWithAuth for authenticated request
      fetchWithAuth(
        currentUrl + `/api/userCompletion/${challengeId}`,
        callback,
        "POST",
        data,
      );
    });
  }

  // Reset form when modal closes
  if (modal) {
    modal.addEventListener("hidden.bs.modal", function () {
      document.getElementById("completionDetails").value = "";
      errorDiv.classList.add("d-none");
      successDiv.classList.add("d-none");
    });
  }
});
