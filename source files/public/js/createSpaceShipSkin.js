document.addEventListener("DOMContentLoaded", function () {
  const submitBtn = document.getElementById("submitSkinBtn");
  const form = document.getElementById("createSkinForm");
  const errorDiv = document.getElementById("createSkinError");
  const successDiv = document.getElementById("createSkinSuccess");
  const modal = document.getElementById("createSkinModal");
  const pointsLabel = document.querySelector('label[for="pointsRequired"]');

  function updateMinimumPoints() {
    const callback = (responseStatus, responseData) => {
      if (responseStatus === 200 && responseData) {
        const minPoints = responseData.minimum_required;
        if (minPoints > 0) {
          pointsLabel.textContent = `Points Required (Min: ${minPoints})`;
          document.getElementById("pointsRequired").min = minPoints;
        } else {
          pointsLabel.textContent = "Points Required";
          document.getElementById("pointsRequired").min = 1;
        }
      }
    };

    //no auth needed
    fetchPublic(
      currentUrl + "/api/spaceshipskins/max-points",
      callback,
      "GET",
      null,
    );
  }

  if (submitBtn) {
    submitBtn.addEventListener("click", function (e) {
      e.preventDefault();

      errorDiv.classList.add("d-none");
      successDiv.classList.add("d-none");

      const skinId = document.getElementById("skinId").value;
      const skinName = document.getElementById("skinName").value.trim();
      const originalSkinName =
        document.getElementById("originalSkinName").value;
      const pointsRequired = parseInt(
        document.getElementById("pointsRequired").value,
      );
      const description = document.getElementById("description").value.trim();

      if (!skinName || !pointsRequired || !description) {
        errorDiv.textContent = "Please fill in all fields";
        errorDiv.classList.remove("d-none");
        return;
      }

      if (pointsRequired <= 0 || isNaN(pointsRequired)) {
        errorDiv.textContent =
          "Points required must be a valid number greater than 0";
        errorDiv.classList.remove("d-none");
        return;
      }

      const isUpdate = skinId !== "";

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${isUpdate ? "Updating..." : "Creating..."}`;

      if (isUpdate) {
        const data = {
          skin_name: originalSkinName,
          updated_skin_name: skinName,
          updated_points_required: pointsRequired,
          updated_description: description,
        };

        const callback = function (responseStatus, responseData) {
          submitBtn.disabled = false;
          submitBtn.innerHTML =
            '<i class="bi bi-check-circle me-2"></i><span id="submitBtnText">Update Skin</span>';

          // Handle auth error
          if (handleAuthError(responseStatus)) {
            return;
          }

          if (responseStatus === 200) {
            submitBtn.disabled = true;
            submitBtn.innerHTML =
              '<span class="spinner-border spinner-border-sm me-2"></span>Updating...';
            successDiv.textContent = `Skin "${skinName}" updated successfully!`;
            successDiv.classList.remove("d-none");

            setTimeout(function () {
              bootstrap.Modal.getInstance(modal).hide();
              window.location.reload();
            }, 1500);
          } else {
            errorDiv.textContent =
              responseData.message || "Failed to update skin";
            errorDiv.classList.remove("d-none");
          }
        };

        // Use fetchWithAuth for authenticated update
        fetchWithAuth(
          currentUrl + `/api/spaceshipskins/${skinId}`,
          callback,
          "PUT",
          data,
        );
      } else {
        const data = {
          skin_name: skinName,
          points_required: pointsRequired,
          description: description,
        };

        const callback = function (responseStatus, responseData) {
          submitBtn.disabled = false;
          submitBtn.innerHTML =
            '<i class="bi bi-check-circle me-2"></i><span id="submitBtnText">Create Skin</span>';

          // Handle auth error
          if (handleAuthError(responseStatus)) {
            return;
          }

          if (responseStatus === 201) {
            submitBtn.disabled = true;
            submitBtn.innerHTML =
              '<span class="spinner-border spinner-border-sm me-2"></span>Creating...';
            successDiv.textContent = `Skin "${skinName}" created successfully!`;
            successDiv.classList.remove("d-none");

            form.reset();

            setTimeout(function () {
              bootstrap.Modal.getInstance(modal).hide();
              window.location.reload();
            }, 2000);
          } else {
            errorDiv.textContent =
              responseData.message || "Failed to create skin";
            errorDiv.classList.remove("d-none");
          }
        };

        // Use fetchWithAuth for authenticated create
        fetchWithAuth(
          currentUrl + "/api/spaceshipskins",
          callback,
          "POST",
          data,
        );
      }
    });
  }

  if (modal) {
    modal.addEventListener("show.bs.modal", function (e) {
      updateMinimumPoints();

      setTimeout(function () {
        const skinId = document.getElementById("skinId").value;

        if (!skinId) {
          console.log("Opening for CREATE mode");
          document.getElementById("modalTitle").textContent = "Create New Skin";
          document.getElementById("submitBtnText").textContent = "Create Skin";
          if (form) form.reset();
          document.getElementById("skinId").value = "";
          document.getElementById("originalSkinName").value = "";
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
      document.getElementById("skinId").value = "";
      document.getElementById("originalSkinName").value = "";
      pointsLabel.textContent = "Points Required";
    });
  }
});
