document.addEventListener("DOMContentLoaded", function () {
  // Use tokenManager to check login
  if (!requireLogin()) {
    return;
  }

  loadAllSkins();
  loadCreatedSkins();
});

function loadAllSkins() {
  const callback = (responseStatus, responseData) => {
    console.log("Skins responseStatus:", responseStatus);
    console.log("Skins responseData:", responseData);

    // Handle auth error
    if (handleAuthError(responseStatus)) {
      return;
    }

    if (responseStatus == 200 && responseData) {
      displaySkins(responseData);
    }
  };

  // Use fetchWithAuth for authenticated request
  fetchWithAuth(
    currentUrl + "/api/spaceshipskins/user/status",
    callback,
    "GET",
    null,
  );
}

function loadCreatedSkins() {
  const callback = (responseStatus, responseData) => {
    console.log("Created skins responseStatus:", responseStatus);
    console.log("Created skins responseData:", responseData);

    // Handle auth error
    if (handleAuthError(responseStatus)) {
      return;
    }

    if (responseStatus == 200 && responseData) {
      displayCreatedSkins(responseData.created_skins);
    }
  };

  // Use fetchWithAuth for authenticated request
  fetchWithAuth(
    currentUrl + "/api/spaceshipskins/user/created",
    callback,
    "GET",
    null,
  );
}

function displaySkins(data) {
  const acquiredContainer = document.getElementById("acquiredSkins");
  const unacquiredContainer = document.getElementById("unacquiredSkins");
  const noAcquiredMsg = document.getElementById("noAcquiredSkins");
  const noUnacquiredMsg = document.getElementById("noUnacquiredSkins");

  if (data.acquired_skins.length === 0) {
    noAcquiredMsg.classList.remove("d-none");
  } else {
    data.acquired_skins.forEach((skin) => {
      const card = createSkinCard(skin, true, false);
      acquiredContainer.appendChild(card);
    });
  }

  if (data.unacquired_skins.length === 0) {
    noUnacquiredMsg.classList.remove("d-none");
  } else {
    data.unacquired_skins.forEach((skin) => {
      const card = createSkinCard(skin, false, false);
      unacquiredContainer.appendChild(card);
    });
  }
}

function displayCreatedSkins(skins) {
  const createdContainer = document.getElementById("createdSkins");
  const noCreatedMsg = document.getElementById("noCreatedSkins");

  if (skins.length === 0) {
    noCreatedMsg.classList.remove("d-none");
  } else {
    skins.forEach((skin) => {
      const card = createSkinCard(skin, false, true);
      createdContainer.appendChild(card);
    });
  }
}

function createSkinCard(skin, isAcquired, isCreated) {
  const cardColumn = document.createElement("div");
  cardColumn.className = "col-lg-4 col-md-6";

  let badge = "";
  let actionButton = "";
  let borderColor = "info";
  let titleColor = "warning";

  if (isCreated) {
    badge = `<span class="badge bg-success position-absolute top-0 end-0 m-3">
            <i class="bi bi-pencil me-1"></i>Your Creation
        </span>`;

    actionButton = `
            <button class="btn btn-warning w-100 mb-2 edit-skin-btn"
                    data-skin-id="${skin.skin_id}"
                    data-skin-name="${skin.skin_name}"
                    data-points-required="${skin.points_required}"
                    data-description="${skin.description}">
                <i class="bi bi-pencil me-2"></i>Edit Skin
            </button>
            <button class="btn btn-danger w-100 delete-skin-btn"
                    data-skin-id="${skin.skin_id}"
                    data-skin-name="${skin.skin_name}">
                <i class="bi bi-trash me-2"></i>Delete Skin
            </button>
        `;
    borderColor = "success";
    titleColor = "success";
  } else if (isAcquired) {
    badge = `<span class="badge bg-success position-absolute top-0 end-0 m-3">
            <i class="bi bi-check-circle me-1"></i>Acquired
        </span>`;

    actionButton = `<button class="btn btn-outline-light w-100" disabled>
            <i class="bi bi-check-circle me-2"></i>Already Unlocked
        </button>`;

    borderColor = "success";
    titleColor = "success";
  } else {
    actionButton = `<a href="challenges.html" class="btn btn-warning w-100">
            <i class="bi bi-rocket-takeoff me-2"></i>Begin Mission
        </a>`;

    borderColor = "info";
    titleColor = "warning";
  }

  const dateInfo =
    isAcquired && skin.acquired_on
      ? `<small class="text-light d-block mt-2">
            <i class="bi bi-calendar-check me-1"></i>
            Acquired: ${new Date(skin.acquired_on).toLocaleDateString()}
        </small>`
      : "";

  cardColumn.innerHTML = `
        <div class="card h-100 bg-dark text-white border-${borderColor} position-relative">
            ${badge}
            <div class="card-body">
                <h3 class="card-title text-${titleColor}">
                    <i class="bi bi-rocket me-2"></i>
                    ${skin.skin_name}
                </h3>
                <p class="card-text text-info mb-2">
                    <i class="bi bi-star-fill me-2"></i>
                    Points Required: ${skin.points_required.toLocaleString()}
                </p>
                <p class="card-text text-light">
                    ${skin.description}
                </p>
                ${dateInfo}
            </div>
            <div class="card-footer bg-transparent border-${borderColor}">
                ${actionButton}
            </div>
        </div>
    `;

  if (isCreated) {
    const editBtn = cardColumn.querySelector(".edit-skin-btn");
    const deleteBtn = cardColumn.querySelector(".delete-skin-btn");

    if (editBtn) {
      editBtn.addEventListener("click", function () {
        const skinId = this.dataset.skinId;
        const skinName = this.dataset.skinName;
        const pointsRequired = this.dataset.pointsRequired;
        const description = this.dataset.description;

        editSkin(skinId, skinName, pointsRequired, description);
      });
    }

    if (deleteBtn) {
      deleteBtn.addEventListener("click", function () {
        const skinId = this.dataset.skinId;
        const skinName = this.dataset.skinName;

        deleteSkin(skinId, skinName);
      });
    }
  }

  return cardColumn;
}

function editSkin(skinId, skinName, pointsRequired, description) {
  document.getElementById("modalTitle").textContent = "Edit Skin";
  document.getElementById("submitBtnText").textContent = "Update Skin";
  document.getElementById("skinId").value = skinId;
  document.getElementById("skinName").value = skinName;
  document.getElementById("originalSkinName").value = skinName;
  document.getElementById("pointsRequired").value = pointsRequired;
  document.getElementById("description").value = description;

  const modal = new bootstrap.Modal(document.getElementById("createSkinModal"));
  modal.show();
}

function deleteSkin(skinId, skinName) {
  window.currentDeleteSkin = { skinId, skinName };

  document.getElementById("deleteSkinName").textContent = skinName;
  document.getElementById("deleteSkinError").classList.add("d-none");
  document.getElementById("deleteSkinSuccess").classList.add("d-none");

  const modal = new bootstrap.Modal(document.getElementById("deleteSkinModal"));
  modal.show();
}

// Delete confirmation handler
document.addEventListener("DOMContentLoaded", function () {
  const confirmBtn = document.getElementById("confirmDeleteSkinBtn");
  const errorDiv = document.getElementById("deleteSkinError");
  const successDiv = document.getElementById("deleteSkinSuccess");
  const modal = document.getElementById("deleteSkinModal");

  if (confirmBtn) {
    confirmBtn.addEventListener("click", function () {
      if (!window.currentDeleteSkin) return;

      const { skinId, skinName } = window.currentDeleteSkin;

      confirmBtn.disabled = true;
      confirmBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span>Deleting...';

      const callback = (responseStatus, responseData) => {
        // Handle auth error
        if (handleAuthError(responseStatus)) {
          return;
        }

        if (responseStatus == 204) {
          successDiv.textContent = `Skin "${skinName}" deleted successfully!`;
          successDiv.classList.remove("d-none");

          setTimeout(() => {
            bootstrap.Modal.getInstance(modal).hide();
            window.location.reload();
          }, 1500);
        } else {
          confirmBtn.disabled = false;
          confirmBtn.innerHTML = '<i class="bi bi-trash me-2"></i>Delete Skin';

          errorDiv.textContent =
            responseData.message || "Failed to delete skin";
          errorDiv.classList.remove("d-none");
        }
      };

      // Use fetchWithAuth for authenticated delete
      fetchWithAuth(
        currentUrl + `/api/spaceshipskins/${skinId}`,
        callback,
        "DELETE",
        null,
      );
    });
  }
});
