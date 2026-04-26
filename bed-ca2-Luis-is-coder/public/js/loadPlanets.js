document.addEventListener("DOMContentLoaded", function () {
  // Use tokenManager to check login
  if (!requireLogin()) {
    return;
  }

  loadAllPlanets();
  loadCreatedPlanets();
});

function loadAllPlanets() {
  const callback = (responseStatus, responseData) => {
    console.log("Planets responseStatus:", responseStatus);
    console.log("Planets responseData:", responseData);

    if (responseStatus == 200 && responseData) {
      displayPlanets(responseData);
    }
  };

  // Use fetchWithAuth for authenticated request
  fetchWithAuth(currentUrl + "/api/planets/user/status", callback, "GET", null);
}

function loadCreatedPlanets() {
  const callback = (responseStatus, responseData) => {
    console.log("Created planets responseStatus:", responseStatus);
    console.log("Created planets responseData:", responseData);

    // Handle auth error
    if (handleAuthError(responseStatus)) {
      return;
    }

    if (responseStatus == 200 && responseData) {
      displayCreatedPlanets(responseData.created_planets);
    }
  };

  // Use fetchWithAuth for authenticated request
  fetchWithAuth(
    currentUrl + "/api/planets/user/created",
    callback,
    "GET",
    null,
  );
}

function displayPlanets(data) {
  const reachedContainer = document.getElementById("reachedPlanets");
  const unreachedContainer = document.getElementById("unreachedPlanets");
  const noReachedMsg = document.getElementById("noReachedPlanets");
  const noUnreachedMsg = document.getElementById("noUnreachedPlanets");

  if (data.reached_planets.length === 0) {
    noReachedMsg.classList.remove("d-none");
  } else {
    data.reached_planets.forEach((planet) => {
      const card = createPlanetCard(planet, true, false);
      reachedContainer.appendChild(card);
    });
  }

  if (data.unreached_planets.length === 0) {
    noUnreachedMsg.classList.remove("d-none");
  } else {
    data.unreached_planets.forEach((planet) => {
      const card = createPlanetCard(planet, false, false);
      unreachedContainer.appendChild(card);
    });
  }
}

function displayCreatedPlanets(planets) {
  const createdContainer = document.getElementById("createdPlanets");
  const noCreatedMsg = document.getElementById("noCreatedPlanets");

  if (planets.length === 0) {
    noCreatedMsg.classList.remove("d-none");
  } else {
    planets.forEach((planet) => {
      const card = createPlanetCard(planet, false, true);
      createdContainer.appendChild(card);
    });
  }
}

function createPlanetCard(planet, isReached, isCreated) {
  const cardColumn = document.createElement("div");
  cardColumn.className = "col-lg-4 col-md-6";

  let badge = "";
  let actionButtons = "";

  if (isCreated) {
    badge = `<span class="badge bg-success position-absolute top-0 end-0 m-3">
            <i class="bi bi-pencil me-1"></i>Your Creation
        </span>`;

    actionButtons = `
            <button class="btn btn-warning w-100 mb-2 edit-planet-btn" 
                    data-planet-id="${planet.planet_id}"
                    data-planet-name="${planet.planet_name}"
                    data-distance="${planet.distance_from_earth}"
                    data-description="${planet.description}">
                <i class="bi bi-pencil me-2"></i>Edit Planet
            </button>
            <button class="btn btn-danger w-100 delete-planet-btn" 
                    data-planet-id="${planet.planet_id}"
                    data-planet-name="${planet.planet_name}">
                <i class="bi bi-trash me-2"></i>Delete Planet
            </button>
        `;
  } else if (isReached) {
    badge = `<span class="badge bg-primary position-absolute top-0 end-0 m-3">
            <i class="bi bi-check-circle me-1"></i>Reached
        </span>`;

    actionButtons = `
            <button class="btn btn-outline-light w-100" disabled>
                <i class="bi bi-check-circle me-2"></i>Already Explored
            </button>
        `;
  } else {
    actionButtons = `
            <a href="challenges.html" class="btn btn-info w-100">
                <i class="bi bi-rocket-takeoff me-2"></i>Begin Mission
            </a>
        `;
  }

  const borderColor = isCreated ? "success" : isReached ? "primary" : "info";
  const titleColor = isCreated ? "success" : isReached ? "primary" : "warning";

  cardColumn.innerHTML = `
        <div class="card h-100 bg-dark text-white border-${borderColor} position-relative">
            ${badge}
            <div class="card-body">
                <h3 class="card-title text-${titleColor}">
                    <i class="bi bi-globe me-2"></i>
                    ${planet.planet_name}
                </h3>
                <p class="card-text text-info mb-2">
                    <i class="bi bi-speedometer2 me-2"></i>
                    Distance: ${planet.distance_from_earth.toLocaleString()} light years
                </p>
                <p class="card-text text-light">
                    ${planet.description}
                </p>
            </div>
            <div class="card-footer bg-transparent border-${borderColor}">
                ${actionButtons}
            </div>
        </div>
    `;

  if (isCreated) {
    const editBtn = cardColumn.querySelector(".edit-planet-btn");
    const deleteBtn = cardColumn.querySelector(".delete-planet-btn");

    if (editBtn) {
      editBtn.addEventListener("click", function () {
        const planetId = this.dataset.planetId;
        const planetName = this.dataset.planetName;
        const distance = this.dataset.distance;
        const description = this.dataset.description;

        editPlanet(planetId, planetName, distance, description);
      });
    }

    if (deleteBtn) {
      deleteBtn.addEventListener("click", function () {
        const planetId = this.dataset.planetId;
        const planetName = this.dataset.planetName;

        deletePlanet(planetId, planetName);
      });
    }
  }

  return cardColumn;
}

function editPlanet(planetId, planetName, distance, description) {
  document.getElementById("modalTitle").textContent = "Edit Planet";
  document.getElementById("submitBtnText").textContent = "Update Planet";
  document.getElementById("planetId").value = planetId;
  document.getElementById("planetName").value = planetName;
  document.getElementById("originalPlanetName").value = planetName;
  document.getElementById("distanceFromEarth").value = distance;
  document.getElementById("description").value = description;

  const modal = new bootstrap.Modal(
    document.getElementById("createPlanetModal"),
  );
  modal.show();
}

function deletePlanet(planetId, planetName) {
  window.currentDeletePlanet = { planetId, planetName };

  document.getElementById("deletePlanetName").textContent = planetName;
  document.getElementById("deletePlanetError").classList.add("d-none");
  document.getElementById("deletePlanetSuccess").classList.add("d-none");

  const modal = new bootstrap.Modal(
    document.getElementById("deletePlanetModal"),
  );
  modal.show();
}

// Delete confirmation handler
document.addEventListener("DOMContentLoaded", function () {
  const confirmBtn = document.getElementById("confirmDeletePlanetBtn");
  const errorDiv = document.getElementById("deletePlanetError");
  const successDiv = document.getElementById("deletePlanetSuccess");
  const modal = document.getElementById("deletePlanetModal");

  if (confirmBtn) {
    confirmBtn.addEventListener("click", function () {
      if (!window.currentDeletePlanet) return;

      const { planetId, planetName } = window.currentDeletePlanet;

      confirmBtn.disabled = true;
      confirmBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span>Deleting...';

      const callback = (responseStatus, responseData) => {
        // Handle auth error
        if (handleAuthError(responseStatus)) {
          confirmBtn.disabled = false;
          confirmBtn.innerHTML =
            '<i class="bi bi-trash me-2"></i>Delete Planet';
          return;
        }

        if (responseStatus == 204) {
          successDiv.textContent = `Planet "${planetName}" deleted successfully!`;
          successDiv.classList.remove("d-none");

          setTimeout(() => {
            bootstrap.Modal.getInstance(modal).hide();
            window.location.reload();
          }, 1500);
        } else {
          confirmBtn.disabled = false;
          confirmBtn.innerHTML =
            '<i class="bi bi-trash me-2"></i>Delete Planet';

          errorDiv.textContent =
            responseData.message || "Failed to delete planet";
          errorDiv.classList.remove("d-none");
        }
      };

      // Use fetchWithAuth for authenticated delete
      fetchWithAuth(
        currentUrl + `/api/planets/${planetId}`,
        callback,
        "DELETE",
        null,
      );
    });
  }
});
