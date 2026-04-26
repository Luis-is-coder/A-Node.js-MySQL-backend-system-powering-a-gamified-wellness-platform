// Store all challenges data globally for filtering
let allChallengesData = {
  completed: [],
  uncompleted: [],
  created: [],
};

let filtersReady = false;

document.addEventListener("DOMContentLoaded", function () {
  if (!requireLogin()) {
    return;
  }

  initializePage();
});

function initializePage() {
  setTimeout(() => {
    const elementsExist = checkRequiredElements();

    if (elementsExist) {
      setupFilterListeners();
      loadAllChallenges();
      loadCreatedChallenges();
    } else {
      setTimeout(initializePage, 500);
    }
  }, 200);
}

function checkRequiredElements() {
  // Only check essential elements (not the count badges)
  const requiredIds = [
    "searchInput",
    "pointRangeFilter",
    "sortByPoints",
    "clearFilters",
    "completedChallenges",
    "uncompletedChallenges",
    "createdChallenges",
    "noCompletedChallenges",
    "noUncompletedChallenges",
    "noCreatedChallenges",
  ];

  for (let id of requiredIds) {
    const element = document.getElementById(id);
    if (!element) {
      return false;
    }
  }

  return true;
}

function setupFilterListeners() {
  const searchInput = document.getElementById("searchInput");
  const pointRangeFilter = document.getElementById("pointRangeFilter");
  const sortByPoints = document.getElementById("sortByPoints");
  const clearFilters = document.getElementById("clearFilters");

  if (!searchInput || !pointRangeFilter || !sortByPoints || !clearFilters) {
    return;
  }

  let searchTimeout;
  searchInput.addEventListener("input", function () {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      applyFilters();
    }, 300);
  });

  pointRangeFilter.addEventListener("change", function () {
    applyFilters();
  });

  sortByPoints.addEventListener("change", function () {
    applyFilters();
  });

  clearFilters.addEventListener("click", function () {
    searchInput.value = "";
    pointRangeFilter.value = "all";
    sortByPoints.value = "none";
    applyFilters();
  });

  filtersReady = true;
}

function applyFilters() {
  if (!filtersReady) {
    return;
  }

  const searchInput = document.getElementById("searchInput");
  const pointRangeFilter = document.getElementById("pointRangeFilter");
  const sortByPoints = document.getElementById("sortByPoints");

  if (!searchInput || !pointRangeFilter || !sortByPoints) {
    return;
  }

  const searchTerm = searchInput.value.toLowerCase();
  const pointRange = pointRangeFilter.value;
  const sortBy = sortByPoints.value;

  console.log("Applying filters:", { searchTerm, pointRange, sortBy });

  const filteredCompleted = filterChallenges(
    [...allChallengesData.completed],
    searchTerm,
    pointRange,
  );
  const filteredUncompleted = filterChallenges(
    [...allChallengesData.uncompleted],
    searchTerm,
    pointRange,
  );
  const filteredCreated = filterChallenges(
    [...allChallengesData.created],
    searchTerm,
    pointRange,
  );

  if (sortBy !== "none") {
    sortChallenges(filteredCompleted, sortBy);
    sortChallenges(filteredUncompleted, sortBy);
    sortChallenges(filteredCreated, sortBy);
  }

  console.log("Filtered results:", {
    completed: filteredCompleted.length,
    uncompleted: filteredUncompleted.length,
    created: filteredCreated.length,
  });

  displayFilteredChallenges(filteredCompleted, "completed");
  displayFilteredChallenges(filteredUncompleted, "uncompleted");
  displayFilteredChallenges(filteredCreated, "created");

  updateActiveFilters(searchTerm, pointRange, sortBy);
}

function filterChallenges(challenges, searchTerm, pointRange) {
  return challenges.filter((challenge) => {
    const matchesSearch =
      searchTerm === "" ||
      challenge.description.toLowerCase().includes(searchTerm);

    let matchesPointRange = true;
    if (pointRange !== "all") {
      const [min, max] = pointRange.split("-").map(Number);
      matchesPointRange = challenge.points >= min && challenge.points <= max;
    }

    return matchesSearch && matchesPointRange;
  });
}

function sortChallenges(challenges, sortBy) {
  if (sortBy === "low-high") {
    challenges.sort((a, b) => a.points - b.points);
  } else if (sortBy === "high-low") {
    challenges.sort((a, b) => b.points - a.points);
  }
}

function displayFilteredChallenges(challenges, category) {
  let containerId, noResultsId, isCompleted, isCreated;

  if (category === "completed") {
    containerId = "completedChallenges";
    noResultsId = "noCompletedChallenges";
    isCompleted = true;
    isCreated = false;
  } else if (category === "uncompleted") {
    containerId = "uncompletedChallenges";
    noResultsId = "noUncompletedChallenges";
    isCompleted = false;
    isCreated = false;
  } else if (category === "created") {
    containerId = "createdChallenges";
    noResultsId = "noCreatedChallenges";
    isCompleted = false;
    isCreated = true;
  }

  const container = document.getElementById(containerId);
  const noResults = document.getElementById(noResultsId);

  if (!container || !noResults) {
    return;
  }

  container.innerHTML = "";

  if (challenges.length === 0) {
    noResults.classList.remove("d-none");
  } else {
    noResults.classList.add("d-none");
    challenges.forEach((challenge) => {
      const card = createChallengeCard(challenge, isCompleted, isCreated);
      container.appendChild(card);
    });
  }
}

function updateActiveFilters(searchTerm, pointRange, sortBy) {
  const activeFiltersDiv = document.getElementById("activeFilters");
  const filterBadges = document.getElementById("filterBadges");

  if (!activeFiltersDiv || !filterBadges) {
    return;
  }

  const badges = [];

  if (searchTerm) {
    badges.push(
      `<span class="badge bg-info me-1">Search: "${searchTerm}"</span>`,
    );
  }

  if (pointRange !== "all") {
    badges.push(
      `<span class="badge bg-warning text-dark me-1">Points: ${pointRange}</span>`,
    );
  }

  if (sortBy !== "none") {
    const sortText = sortBy === "low-high" ? "Low to High" : "High to Low";
    badges.push(`<span class="badge bg-success me-1">Sort: ${sortText}</span>`);
  }

  if (badges.length > 0) {
    filterBadges.innerHTML = badges.join("");
    activeFiltersDiv.classList.remove("d-none");
  } else {
    activeFiltersDiv.classList.add("d-none");
  }
}

function loadAllChallenges() {
  const callback = (responseStatus, responseData) => {
    console.log("Challenges responseStatus:", responseStatus);
    console.log("Challenges responseData:", responseData);

    if (handleAuthError(responseStatus)) {
      return;
    }

    if (responseStatus == 200 && responseData) {
      allChallengesData.completed = responseData.completed_challenges || [];
      allChallengesData.uncompleted = responseData.uncompleted_challenges || [];

      applyFilters();
    }
  };

  fetchWithAuth(
    currentUrl + "/api/challenges/user/status",
    callback,
    "GET",
    null,
  );
}

function loadCreatedChallenges() {
  const callback = (responseStatus, responseData) => {
    console.log("Created challenges responseStatus:", responseStatus);
    console.log("Created challenges responseData:", responseData);

    if (responseStatus == 200 && responseData) {
      allChallengesData.created = responseData.created_challenges || [];

      console.log(
        "Stored created challenges:",
        allChallengesData.created.length,
      );

      applyFilters();
    }
  };

  fetchWithAuth(
    currentUrl + "/api/challenges/user/created",
    callback,
    "GET",
    null,
  );
}

function createChallengeCard(challenge, isCompleted, isCreated) {
  const cardColumn = document.createElement("div");
  cardColumn.className = "col-lg-4 col-md-6";

  let badge = "";
  let actionButton = "";
  let borderColor = "info";
  let titleColor = "warning";
  let completionInfo = "";

  if (isCreated) {
    badge = `<span class="badge bg-warning position-absolute top-0 end-0 m-3">
            <i class="bi bi-pencil me-1"></i>Your Creation
        </span>`;

    actionButton = `
            <button class="btn btn-warning w-100 mb-2" onclick="editChallenge(${challenge.challenge_id}, '${escapeHtml(challenge.description)}', ${challenge.points})">
                <i class="bi bi-pencil me-2"></i>Edit Challenge
            </button>
            <button class="btn btn-danger w-100" onclick="deleteChallenge(${challenge.challenge_id}, '${escapeHtml(challenge.description)}')">
                <i class="bi bi-trash me-2"></i>Delete Challenge
            </button>
        `;
    borderColor = "warning";
    titleColor = "warning";
  } else if (isCompleted) {
    badge = `<span class="badge bg-success position-absolute top-0 end-0 m-3">
            <i class="bi bi-check-circle me-1"></i>Completed
        </span>`;

    actionButton = `<button class="btn btn-outline-light w-100" disabled>
            <i class="bi bi-check-circle me-2"></i>Already Completed
        </button>`;

    borderColor = "success";
    titleColor = "success";

    const completedDate = new Date(challenge.completed_on).toLocaleDateString();
    completionInfo = `
            <p class="card-text text-success mb-2">
                <i class="bi bi-calendar-check me-2"></i>
                Completed: ${completedDate}
            </p>
        `;

    if (challenge.completion_details) {
      completionInfo += `
                <p class="card-text text-light fst-italic">
                    <i class="bi bi-journal-text me-2"></i>
                    "${challenge.completion_details}"
                </p>
            `;
    }
  } else {
    actionButton = `<button class="btn btn-info w-100" onclick="completeChallenge(${challenge.challenge_id}, '${escapeHtml(challenge.description)}')">
            <i class="bi bi-check-circle me-2"></i>Complete Challenge
        </button>`;

    borderColor = "info";
    titleColor = "info";
  }

  cardColumn.innerHTML = `
        <div class="card h-100 bg-dark text-white border-${borderColor} position-relative">
            ${badge}
            <div class="card-body">
                <h5 class="card-title text-${titleColor} mb-3">
                    <i class="bi bi-trophy me-2"></i>
                    Challenge
                </h5>
                <p class="card-text text-light mb-3">
                    ${challenge.description}
                </p>
                <p class="card-text text-warning mb-2">
                    <i class="bi bi-star-fill me-2"></i>
                    Points: ${challenge.points}
                </p>
                ${completionInfo}
            </div>
            <div class="card-footer bg-transparent border-${borderColor}">
                ${actionButton}
            </div>
        </div>
    `;

  return cardColumn;
}

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

window.editChallenge = function (challengeId, description, points) {
  document.getElementById("modalTitle").textContent = "Edit Challenge";
  document.getElementById("submitBtnText").textContent = "Update Challenge";
  document.getElementById("challengeId").value = challengeId;
  document.getElementById("challengeDescription").value = description;
  document.getElementById("originalDescription").value = description;
  document.getElementById("challengePoints").value = points;

  const modal = new bootstrap.Modal(
    document.getElementById("createChallengeModal"),
  );
  modal.show();
};

window.deleteChallenge = function (challengeId, description) {
  window.currentDeleteChallenge = { challengeId, description };

  document.getElementById("deleteChallengeName").textContent = description;
  document.getElementById("deleteChallengeError").classList.add("d-none");
  document.getElementById("deleteChallengeSuccess").classList.add("d-none");

  const modal = new bootstrap.Modal(
    document.getElementById("deleteChallengeModal"),
  );
  modal.show();
};

window.completeChallenge = function (challengeId, description) {
  document.getElementById("completeChallengeId").value = challengeId;
  document.getElementById("completeChallengeName").textContent = description;
  document.getElementById("completionDetails").value = "";

  const modal = new bootstrap.Modal(
    document.getElementById("completeChallengeModal"),
  );
  modal.show();
};

document.addEventListener("DOMContentLoaded", function () {
  const confirmBtn = document.getElementById("confirmDeleteChallengeBtn");

  if (confirmBtn) {
    confirmBtn.addEventListener("click", function () {
      if (!window.currentDeleteChallenge) return;

      const { challengeId } = window.currentDeleteChallenge;
      const errorDiv = document.getElementById("deleteChallengeError");
      const successDiv = document.getElementById("deleteChallengeSuccess");
      const modal = document.getElementById("deleteChallengeModal");

      confirmBtn.disabled = true;
      confirmBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span>Deleting...';

      const callback = (responseStatus, responseData) => {
        if (handleAuthError(responseStatus)) {
          confirmBtn.disabled = false;
          confirmBtn.innerHTML =
            '<i class="bi bi-trash me-2"></i>Delete Challenge';
          return;
        }

        if (responseStatus == 204) {
          successDiv.textContent = "Challenge deleted successfully!";
          successDiv.classList.remove("d-none");

          setTimeout(() => {
            bootstrap.Modal.getInstance(modal).hide();
            window.location.reload();
          }, 1500);
        } else {
          confirmBtn.disabled = false;
          confirmBtn.innerHTML =
            '<i class="bi bi-trash me-2"></i>Delete Challenge';

          errorDiv.textContent =
            responseData.message || "Failed to delete challenge";
          errorDiv.classList.remove("d-none");
        }
      };

      fetchWithAuth(
        currentUrl + `/api/challenges/${challengeId}`,
        callback,
        "DELETE",
        null,
      );
    });
  }
});
