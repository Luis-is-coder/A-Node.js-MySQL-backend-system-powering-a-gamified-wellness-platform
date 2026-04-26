document.addEventListener("DOMContentLoaded", function () {
  const submitBtn = document.getElementById("submitChallengeBtn");
  const form = document.getElementById("createChallengeForm");
  const errorDiv = document.getElementById("createChallengeError");
  const successDiv = document.getElementById("createChallengeSuccess");
  const modal = document.getElementById("createChallengeModal");

  if (submitBtn) {
    submitBtn.addEventListener("click", function (e) {
      e.preventDefault();

      errorDiv.classList.add("d-none");
      successDiv.classList.add("d-none");

      const challengeId = document.getElementById("challengeId").value;
      const description = document
        .getElementById("challengeDescription")
        .value.trim();
      const originalDescription = document.getElementById(
        "originalDescription",
      ).value;
      const points = parseInt(document.getElementById("challengePoints").value);

      if (!description || !points) {
        errorDiv.textContent = "Please fill in all fields";
        errorDiv.classList.remove("d-none");
        return;
      }

      if (points <= 0 || points > 50 || isNaN(points)) {
        errorDiv.textContent = "Points must be between 1 and 50";
        errorDiv.classList.remove("d-none");
        return;
      }

      const isUpdate = challengeId !== "";

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${isUpdate ? "Updating..." : "Creating..."}`;

      if (isUpdate) {
        const data = {
          description: description,
          points: points,
        };

        const callback = function (responseStatus, responseData) {
          submitBtn.disabled = false;
          submitBtn.innerHTML =
            '<i class="bi bi-check-circle me-2"></i><span id="submitBtnText">Update Challenge</span>';
          // Handle auth error
          if (handleAuthError(responseStatus)) {
            return;
          }

          if (responseStatus === 200) {
            submitBtn.disabled = true;
            submitBtn.innerHTML =
              '<span class="spinner-border spinner-border-sm me-2"></span>Updating...';
            successDiv.textContent = "Challenge updated successfully!";
            successDiv.classList.remove("d-none");

            setTimeout(function () {
              bootstrap.Modal.getInstance(modal).hide();
              window.location.reload();
            }, 1000);
          } else {
            errorDiv.textContent =
              responseData.message || "Failed to update challenge";
            errorDiv.classList.remove("d-none");
          }
        };

        // Use fetchWithAuth for authenticated update
        fetchWithAuth(
          currentUrl + `/api/challenges/${challengeId}`,
          callback,
          "PUT",
          data,
        );
      } else {
        const data = {
          description: description,
          points: points,
        };

        const callback = function (responseStatus, responseData) {
          submitBtn.disabled = false;
          submitBtn.innerHTML =
            '<i class="bi bi-check-circle me-2"></i><span id="submitBtnText">Create Challenge</span>';

          // Handle auth error
          if (handleAuthError(responseStatus)) {
            return;
          }

          if (responseStatus === 201) {
            submitBtn.disabled = true;
            submitBtn.innerHTML =
              '<span class="spinner-border spinner-border-sm me-2"></span>Creating...';
            let message = "Challenge created successfully!";
            if (responseData.creator_award) {
              message += ` You earned ${responseData.creator_award} points! Total: ${responseData.current_user_points}`;
            }
            successDiv.textContent = message;
            successDiv.classList.remove("d-none");

            form.reset();

            setTimeout(function () {
              bootstrap.Modal.getInstance(modal).hide();
              window.location.reload();
            }, 2000);
          } else {
            errorDiv.textContent =
              responseData.message || "Failed to create challenge";
            errorDiv.classList.remove("d-none");
          }
        };

        // Use fetchWithAuth for authenticated create
        fetchWithAuth(currentUrl + "/api/challenges", callback, "POST", data);
      }
    });
  }

  // Reset form when modal is opened for create
  if (modal) {
    modal.addEventListener("show.bs.modal", function (e) {
      setTimeout(function () {
        const challengeId = document.getElementById("challengeId").value;

        if (!challengeId) {
          console.log("Opening for CREATE mode");
          document.getElementById("modalTitle").textContent =
            "Create New Challenge";
          document.getElementById("submitBtnText").textContent =
            "Create Challenge";
          if (form) form.reset();
          document.getElementById("challengeId").value = "";
          document.getElementById("originalDescription").value = "";
          errorDiv.classList.add("d-none");
          successDiv.classList.add("d-none");
        } else {
          console.log("Opening for EDIT mode - keeping existing values");
        }
      }, 10);
    });

    modal.addEventListener("hidden.bs.modal", function () {
      if (form) form.reset();
      errorDiv.classList.add("d-none");
      successDiv.classList.add("d-none");
      document.getElementById("challengeId").value = "";
      document.getElementById("originalDescription").value = "";
    });
  }
});
