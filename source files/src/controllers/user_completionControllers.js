const model = require("../models/user_completionModels");

console.log("UserCompletionController loaded");

// Validate challenge_id parameter
module.exports.validateChallengeId = (req, res, next) => {
  const challenge_id = req.params.challenge_id;

  if (isNaN(challenge_id) || challenge_id <= 0) {
    return res.status(400).send("Invalid challenge ID");
  }
  next();
};

// ============ MAIN MIDDLEWARE ============

// Check if already completed
module.exports.checkAlreadyCompleted = (req, res, next) => {
  const data = {
    user_id: res.locals.userId,
    challenge_id: Number(req.params.challenge_id),
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error checkAlreadyCompleted:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length > 0) {
      return res.status(409).json({
        message: "This challenge is already completed by this user.",
      });
    }

    next();
  };

  model.checkAlreadyCompleted(data, callback);
};

// Get all completion data using INNER JOIN
module.exports.getCompletionData = (req, res, next) => {
  const data = {
    user_id: res.locals.userId,
    challenge_id: Number(req.params.challenge_id),
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error getCompletionData:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Challenge or User not found",
      });
    }

    // Store all data from INNER JOIN result
    res.locals.completionData = results[0];
    res.locals.newPoints =
      results[0].current_user_points + results[0].rewarded_points;

    next();
  };

  model.getCompletionData(data, callback);
};

// Get planets with user status
module.exports.getPlanetsData = (req, res, next) => {
  const data = {
    user_id: res.locals.userId,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error getPlanetsData:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    const newPoints = res.locals.newPoints;

    // Filter unlockable planets (not reached yet AND user has enough points)
    res.locals.unlockablePlanets = results.filter(
      (p) => p.user_reached === null && newPoints >= p.distance_from_earth,
    );

    // Count already reached planets
    res.locals.reachedCount = results.filter(
      (p) => p.user_reached !== null,
    ).length;

    next();
  };

  model.getPlanetsWithStatus(data, callback);
};

// Get skins with user status
module.exports.getSkinsData = (req, res, next) => {
  const data = {
    user_id: res.locals.userId,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error getSkinsData:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    const newPoints = res.locals.newPoints;

    // Filter unlockable skins (not owned yet AND user has enough points)
    res.locals.unlockableSkins = results.filter(
      (s) => s.user_owned === null && newPoints >= s.points_required,
    );

    next();
  };

  model.getSkinsWithStatus(data, callback);
};

// Update user points
module.exports.updateUserPoints = (req, res, next) => {
  const data = {
    user_id: res.locals.userId,
    new_points: res.locals.newPoints,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error updateUserPoints:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    next();
  };

  model.updateUserPoints(data, callback);
};

// Insert unlocked planets
module.exports.insertUnlockedPlanets = (req, res, next) => {
  const unlockablePlanets = res.locals.unlockablePlanets || [];

  if (unlockablePlanets.length === 0) {
    return next();
  }

  let completed = 0;

  unlockablePlanets.forEach((planet) => {
    const data = {
      user_id: res.locals.userId,
      planet_id: planet.planet_id,
    };

    const callback = (error, results, fields) => {
      if (error) {
        console.error("Error inserting planet:", error);
      }

      completed++;
      if (completed === unlockablePlanets.length) {
        next();
      }
    };

    model.insertPlanet(data, callback);
  });
};

// Insert unlocked skins
module.exports.insertUnlockedSkins = (req, res, next) => {
  const unlockableSkins = res.locals.unlockableSkins || [];

  if (unlockableSkins.length === 0) {
    return next();
  }

  let completed = 0;

  unlockableSkins.forEach((skin) => {
    const data = {
      user_id: res.locals.userId,
      skin_id: skin.skin_id,
    };

    const callback = (error, results, fields) => {
      if (error) {
        console.error("Error inserting skin:", error);
      }

      completed++;
      if (completed === unlockableSkins.length) {
        next();
      }
    };

    model.insertSkin(data, callback);
  });
};

// Update user location
module.exports.updateUserLocation = (req, res, next) => {
  const unlockablePlanets = res.locals.unlockablePlanets || [];
  const completionData = res.locals.completionData;

  const data = {
    user_id: res.locals.userId,
    current_planet:
      unlockablePlanets.length > 0
        ? unlockablePlanets[unlockablePlanets.length - 1].planet_name
        : completionData.current_planet,
    planet_count: res.locals.reachedCount + unlockablePlanets.length,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error updateUserLocation:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "User location not found" });
    }

    res.locals.updatedPlanet = data.current_planet;
    res.locals.planetCount = data.planet_count;

    next();
  };

  model.updateUserLocation(data, callback);
};

// Update spaceship
module.exports.updateSpaceship = (req, res, next) => {
  const unlockableSkins = res.locals.unlockableSkins || [];
  const completionData = res.locals.completionData;

  const data = {
    user_id: res.locals.userId,
    skin:
      unlockableSkins.length > 0
        ? unlockableSkins[unlockableSkins.length - 1].skin_name
        : completionData.spaceship_skin,
    level:
      unlockableSkins.length > 0
        ? unlockableSkins[unlockableSkins.length - 1].skin_id
        : completionData.spaceship_level,
    fuel: res.locals.newPoints,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error updateSpaceship:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Spaceship not found" });
    }

    res.locals.updatedSkin = data.skin;
    res.locals.updatedLevel = data.level;

    next();
  };

  model.updateSpaceship(data, callback);
};

// Create completion record
module.exports.createCompletion = (req, res, next) => {
  const data = {
    user_id: res.locals.userId,
    challenge_id: Number(req.params.challenge_id),
    details: String(req.body.details),
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error createCompletion:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (
      results.affectedRows !== 1 ||
      results.insertId == undefined ||
      results.insertId <= 0
    ) {
      return res
        .status(500)
        .json({ message: "Failed to create completion record" });
    }

    res.locals.completionId = results.insertId;

    next();
  };

  model.createCompletion(data, callback);
};

// Get final counts and send response
module.exports.sendResponse = (req, res, next) => {
  const data = {
    user_id: res.locals.userId,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error getFinalCounts:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    const counts = results[0];
    const completionData = res.locals.completionData;

    return res.status(201).json({
      completion_id: res.locals.completionId,
      challenge_id: Number(req.params.challenge_id),
      challenge_description: completionData.challenge_description,
      no_of_challenges_completed_by_user: counts.challenges_completed,
      user_id: req.body.user_id,
      current_userpoint: res.locals.newPoints,
      details: req.body.details,
      unlocked_planets: res.locals.unlockablePlanets,
      current_planet: res.locals.updatedPlanet,
      no_of_planets_reached: counts.planets_reached,
      unlocked_spaceShipSkins: res.locals.unlockableSkins,
      no_of_spaceShip_skins_owned: counts.skins_owned,
      current_spaceShip_level: res.locals.updatedLevel,
      current_spaceShip_skin: res.locals.updatedSkin,
    });
  };

  model.getFinalCounts(data, callback);
};

// Check challenge existence
module.exports.challengeExistence = (req, res, next) => {
  const data = {
    challenge_id: Number(req.params.challenge_id),
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error challengeExistence:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length > 0) {
      next();
    } else {
      return res.status(404).json({
        message: `Challenge with challenge_id ${data.challenge_id} does not exist.`,
      });
    }
  };

  model.checkChallengeExistence(data, callback);
};

// Get attempts by challenge_id
module.exports.readAttemptsByChallengeId = (req, res, next) => {
  const data = {
    challenge_id: Number(req.params.challenge_id),
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error readAttemptsByChallengeId:", error);
      return res.status(500).json(error);
    }

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "No one attempted this challenge" });
    }

    res.status(200).json(results);
  };

  model.selectAttemptsByChallengeId(data, callback);
};
