document.addEventListener("DOMContentLoaded", function () {
  // Use tokenManager to check if logged in
  const isLoggedIn = isTokenValid();

  // Load statistics
  loadTotalUsers();
  loadLeaderboard();

  // Button event listeners
  const beginJourneyBtn = document.getElementById("begin-journey-btn");

  if (beginJourneyBtn) {
    beginJourneyBtn.addEventListener("click", function () {
      if (isLoggedIn) {
        window.location.href = "challenges.html";
      } else {
        // Show login prompt
        if (
          confirm(
            "You need to be logged in to begin your journey.\nWould you like to log in now?",
          )
        ) {
          window.location.href = "login.html";
        }
      }
    });
  }
});

// Load total users count
function loadTotalUsers() {
  const callback = (responseStatus, responseData) => {
    const totalUsersElement = document.getElementById("total-users");

    if (responseStatus === 200 && responseData) {
      totalUsersElement.textContent = responseData.total_users.toLocaleString();
    } else {
      totalUsersElement.textContent = "---";
    }
  };

  // Use fetchPublic for public endpoint (no token needed)
  fetchPublic(currentUrl + "/api/users/stats/total", callback, "GET", null);
}

// Load leaderboard
function loadLeaderboard() {
  const callback = (responseStatus, responseData) => {
    if (responseStatus === 200 && responseData && responseData.leaderboard) {
      displayLeaderboard(responseData.leaderboard);
    } else {
      // Show placeholder data
      document.getElementById("first-name").textContent = "No data yet";
      document.getElementById("second-name").textContent = "No data yet";
      document.getElementById("third-name").textContent = "No data yet";
    }
  };

  // Use fetchPublic for public endpoint (no token needed)
  fetchPublic(
    currentUrl + "/api/users/stats/leaderboard",
    callback,
    "GET",
    null,
  );
}

// Display leaderboard data
function displayLeaderboard(leaderboard) {
  // First place
  if (leaderboard[0]) {
    document.getElementById("first-name").textContent = leaderboard[0].username;
    document.getElementById("first-points").textContent =
      leaderboard[0].points.toLocaleString();
    document.getElementById("first-level").textContent =
      `Level ${leaderboard[0].spaceship_level || 1}`;
  } else {
    document.getElementById("first-name").textContent = "No data yet";
  }

  // Second place
  if (leaderboard[1]) {
    document.getElementById("second-name").textContent =
      leaderboard[1].username;
    document.getElementById("second-points").textContent =
      leaderboard[1].points.toLocaleString();
    document.getElementById("second-level").textContent =
      `Level ${leaderboard[1].spaceship_level || 1}`;
  } else {
    document.getElementById("second-name").textContent = "No data yet";
  }

  // Third place
  if (leaderboard[2]) {
    document.getElementById("third-name").textContent = leaderboard[2].username;
    document.getElementById("third-points").textContent =
      leaderboard[2].points.toLocaleString();
    document.getElementById("third-level").textContent =
      `Level ${leaderboard[2].spaceship_level || 1}`;
  } else {
    document.getElementById("third-name").textContent = "No data yet";
  }
}
