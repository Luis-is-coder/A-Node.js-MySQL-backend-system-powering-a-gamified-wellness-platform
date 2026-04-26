document.addEventListener("DOMContentLoaded", function () {
  // Use tokenManager to check login
  if (!requireLogin()) {
    return;
  }

  const callback = (responseStatus, responseData) => {
    console.log("Profile responseStatus:", responseStatus);
    console.log("Profile responseData:", responseData);

    // Handle auth error using tokenManager
    if (handleAuthError(responseStatus)) {
      return;
    }

    if (responseStatus == 200 && responseData) {
      // Update username
      const usernameContainer = document.getElementById("username");
      if (usernameContainer) {
        usernameContainer.innerHTML = `Commander <span class="text-warning">${responseData.username}</span>`;
      }

      // Update member since date
      const memberDate = new Date(responseData.member_since);
      const formattedDate = `Stardate ${memberDate.getFullYear()}.${memberDate.getMonth() + 1}`;
      const memberSinceElement = document.getElementById("member-since");
      if (memberSinceElement) {
        memberSinceElement.innerHTML = `
                    <i class="bi bi-geo-alt-fill me-2"></i>Exploring ${responseData.current_planet}
                    <span class="mx-3">|</span>
                    <i class="bi bi-calendar-check-fill me-2"></i>Member since: ${formattedDate}
                `;
      }

      // Update level, skin name, and description
      const levelTextDiv = document.getElementById("show-level");
      if (levelTextDiv) {
        levelTextDiv.innerHTML = `
                    <h2 class="fw-bold mb-0">Level ${responseData.spaceship_level}</h2>
                    <small class="text-light d-block">${responseData.current_skin_name}</small>
                    <small class="text-light">${responseData.current_skin_description}</small>
                `;
      }

      // Update progress bar
      const progressText = document.getElementById("progress");
      if (progressText) {
        const nextLevel = responseData.spaceship_level + 1;
        progressText.innerHTML = `
                    <span>Progress to Level ${nextLevel}</span>
                    <span>${responseData.cosmic_points} / ${responseData.next_level_points_required || "???"} Points</span>
                `;
      }

      const progressBar = document.getElementById("progress-bar");
      if (progressBar) {
        const percentage = responseData.next_level_points_required
          ? (
              (responseData.cosmic_points /
                responseData.next_level_points_required) *
              100
            ).toFixed(1)
          : 100;
        progressBar.style.width = `${percentage}%`;
      }

      // Update cosmic points
      const cosmicPointsElement = document.getElementById("user-points");
      if (cosmicPointsElement) {
        cosmicPointsElement.textContent =
          responseData.cosmic_points.toLocaleString();
      }

      // Update challenges completed
      const challengesCompletedElements = document.getElementById(
        "challenges-completed",
      );
      if (challengesCompletedElements) {
        challengesCompletedElements.textContent =
          responseData.challenges_completed;
      }

      // Update spaceship skins
      const spaceshipSkinsElements = document.getElementById("spaceship-skins");
      if (spaceshipSkinsElements) {
        spaceshipSkinsElements.textContent = responseData.skins_acquired;
      }

      // Update planets reached
      const planetsReachedElements = document.getElementById("planets-reached");
      if (planetsReachedElements) {
        planetsReachedElements.textContent = responseData.no_of_planets_reached;
      }

      // Update challenges created
      const challengesCreatedElements =
        document.getElementById("challenges-created");
      if (challengesCreatedElements) {
        challengesCreatedElements.textContent = responseData.challenges_created;
      }

      // Update planets created count
      const planetsCreatedElement = document.getElementById(
        "planets-created-count",
      );
      if (planetsCreatedElement) {
        planetsCreatedElement.textContent = responseData.planets_created || 0;
      }

      // Update skins created count
      const skinsCreatedElement = document.getElementById(
        "skins-created-count",
      );
      if (skinsCreatedElement) {
        skinsCreatedElement.textContent = responseData.skins_created || 0;
      }

      // Update total content created (combined)
      const contentCreatedElement = document.getElementById("content-created");
      if (contentCreatedElement) {
        const totalContent =
          (responseData.planets_created || 0) +
          (responseData.skins_created || 0);
        contentCreatedElement.textContent = totalContent;
      }
    }
  };

  // Use fetchWithAuth for authenticated request
  fetchWithAuth(currentUrl + "/api/users/token/profile", callback, "GET", null);
});
