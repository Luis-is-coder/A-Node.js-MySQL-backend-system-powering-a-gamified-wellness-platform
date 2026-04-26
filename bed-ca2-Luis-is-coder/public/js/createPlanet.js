document.addEventListener("DOMContentLoaded", function () {
  const submitBtn = document.getElementById("submitPlanetBtn");
  const form = document.getElementById("createPlanetForm");
  const errorDiv = document.getElementById("createPlanetError");
  const successDiv = document.getElementById("createPlanetSuccess");
  const modal = document.getElementById("createPlanetModal");
  const distanceLabel = document.querySelector(
    'label[for="distanceFromEarth"]',
  );

  function updateMinimumDistance() {
    const callback = (responseStatus, responseData) => {
      if (responseStatus === 200 && responseData) {
        const minDistance = responseData.minimum_required;
        if (minDistance > 0) {
          distanceLabel.textContent = `Distance from Earth (Min: ${minDistance} light years)`;
          document.getElementById("distanceFromEarth").min = minDistance;
        } else {
          distanceLabel.textContent = "Distance from Earth (light years)";
          document.getElementById("distanceFromEarth").min = 1;
        }
      }
    };

    //no auth needed
    fetchPublic(
      currentUrl + "/api/planets/max-distance",
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

      const planetId = document.getElementById("planetId").value;
      const planetName = document.getElementById("planetName").value.trim();
      const originalPlanetName =
        document.getElementById("originalPlanetName").value;
      const distanceFromEarth = parseInt(
        document.getElementById("distanceFromEarth").value,
      );
      const description = document.getElementById("description").value.trim();

      if (!planetName || !distanceFromEarth || !description) {
        errorDiv.textContent = "Please fill in all fields";
        errorDiv.classList.remove("d-none");
        return;
      }

      if (distanceFromEarth <= 0) {
        errorDiv.textContent = "Distance must be greater than 0";
        errorDiv.classList.remove("d-none");
        return;
      }

      const isUpdate = planetId !== "";

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${isUpdate ? "Updating..." : "Creating..."}`;

      if (isUpdate) {
        const data = {
          planet_name: originalPlanetName,
          updated_planet_name: planetName,
          updated_distance_from_earth: distanceFromEarth,
          updated_description: description,
        };

        const callback = (responseStatus, responseData) => {
          submitBtn.disabled = false;
          submitBtn.innerHTML =
            '<i class="bi bi-check-circle me-2"></i>Update Planet';

          // Handle auth error
          if (handleAuthError(responseStatus)) {
            return;
          }

          if (responseStatus === 200) {
            submitBtn.disabled = true;
            submitBtn.innerHTML =
              '<span class="spinner-border spinner-border-sm me-2"></span>Updating...';
            successDiv.textContent = `Planet "${planetName}" updated successfully!`;
            successDiv.classList.remove("d-none");

            setTimeout(() => {
              const modalInstance = bootstrap.Modal.getInstance(modal);
              modalInstance.hide();
              window.location.reload();
            }, 1000);
          } else {
            errorDiv.textContent =
              responseData.message || "Failed to update planet";
            errorDiv.classList.remove("d-none");
          }
        };

        // Use fetchWithAuth for authenticated update
        fetchWithAuth(
          currentUrl + `/api/planets/${planetId}`,
          callback,
          "PUT",
          data,
        );
      } else {
        const data = {
          planet_name: planetName,
          distance_from_earth: distanceFromEarth,
          description: description,
        };

        const callback = (responseStatus, responseData) => {
          submitBtn.disabled = false;
          submitBtn.innerHTML =
            '<i class="bi bi-check-circle me-2"></i>Create Planet';

          // Handle auth error
          if (handleAuthError(responseStatus)) {
            return;
          }

          if (responseStatus === 201) {
            submitBtn.disabled = true;
            submitBtn.innerHTML =
              '<span class="spinner-border spinner-border-sm me-2"></span>Creating...';
            successDiv.textContent = `Planet "${planetName}" created successfully!`;
            successDiv.classList.remove("d-none");

            form.reset();

            setTimeout(() => {
              const modalInstance = bootstrap.Modal.getInstance(modal);
              modalInstance.hide();
              window.location.reload();
            }, 1500);
          } else {
            errorDiv.textContent =
              responseData.message || "Failed to create planet";
            errorDiv.classList.remove("d-none");
          }
        };

        // Use fetchWithAuth for authenticated create
        fetchWithAuth(currentUrl + "/api/planets", callback, "POST", data);
      }
    });
  }

  if (modal) {
    modal.addEventListener("show.bs.modal", function (e) {
      updateMinimumDistance();

      setTimeout(function () {
        const planetId = document.getElementById("planetId").value;

        if (!planetId) {
          console.log("Opening for CREATE mode");
          document.getElementById("modalTitle").textContent =
            "Create New Planet";
          document.getElementById("submitBtnText").textContent =
            "Create Planet";
          form.reset();
          document.getElementById("planetId").value = "";
          document.getElementById("originalPlanetName").value = "";
          errorDiv.classList.add("d-none");
          successDiv.classList.add("d-none");
        } else {
          console.log("Opening for EDIT mode - keeping existing values");
        }
      }, 10);
    });

    modal.addEventListener("hidden.bs.modal", function () {
      form.reset();
      errorDiv.classList.add("d-none");
      successDiv.classList.add("d-none");
      document.getElementById("planetId").value = "";
      document.getElementById("originalPlanetName").value = "";
      distanceLabel.textContent = "Distance from Earth (light years)";
    });
  }
});
