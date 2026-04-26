const pool = require("../services/db");

// Get all data needed for challenge completion in ONE query using INNER JOINs
module.exports.getCompletionData = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT
        WC.challenge_id AS challenge_id,
        WC.description AS challenge_description,
        WC.points AS rewarded_points,
        U.user_id AS user_id,
        U.points AS current_user_points,
        UL.current_planet AS current_planet,
        UL.no_of_planets_reached AS no_of_planets_reached,
        S.spaceship_id AS spaceship_id,
        S.level AS spaceship_level,
        S.skin AS spaceship_skin,
        S.fuel AS spaceship_fuel

    FROM WellnessChallenge WC

    INNER JOIN User U ON U.user_id = ?

    INNER JOIN UserLocation UL ON UL.user_id = U.user_id

    INNER JOIN Spaceships S ON S.user_id = U.user_id

    WHERE WC.challenge_id = ?;
    `;

  const VALUES = [data.user_id, data.challenge_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Check if user already completed this challenge
module.exports.checkAlreadyCompleted = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT 
        completion_id
    FROM UserCompletion
    WHERE user_id = ? AND challenge_id = ?;
    `;

  const VALUES = [data.user_id, data.challenge_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Get all planets with user's reached status using LEFT JOIN
module.exports.getPlanetsWithStatus = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT
        P.planet_id AS planet_id,
        P.planet_name AS planet_name,
        P.distance_from_earth AS distance_from_earth,
        P.description AS description,
        UPR.user_id AS user_reached

    FROM Planets P

    LEFT JOIN UserPlanetsRel UPR ON P.planet_id = UPR.planet_id AND UPR.user_id = ?

    ORDER BY P.distance_from_earth ASC;
    `;

  const VALUES = [data.user_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Get all skins with user's owned status using LEFT JOIN
module.exports.getSkinsWithStatus = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT
        SS.skin_id AS skin_id,
        SS.skin_name AS skin_name,
        SS.points_required AS points_required,
        SS.description AS description,
        USR.user_id AS user_owned

    FROM spaceShipSkins SS

    LEFT JOIN UserSkinsRel USR ON SS.skin_id = USR.skin_id AND USR.user_id = ?

    ORDER BY SS.points_required ASC;
    `;

  const VALUES = [data.user_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Update user points
module.exports.updateUserPoints = (data, callback) => {
  const SQLSTATEMENT = `
    UPDATE User 
    SET points = ?
    WHERE user_id = ?;
    `;

  const VALUES = [data.new_points, data.user_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Create user completion record
module.exports.createCompletion = (data, callback) => {
  const SQLSTATEMENT = `
    INSERT INTO UserCompletion (challenge_id, user_id, details)
    VALUES (?, ?, ?);
    `;

  const VALUES = [data.challenge_id, data.user_id, data.details];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Insert unlocked planet
module.exports.insertPlanet = (data, callback) => {
  const SQLSTATEMENT = `
    INSERT IGNORE INTO UserPlanetsRel (user_id, planet_id)
    VALUES (?, ?);
    `;

  const VALUES = [data.user_id, data.planet_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Insert unlocked skin
module.exports.insertSkin = (data, callback) => {
  const SQLSTATEMENT = `
    INSERT IGNORE INTO UserSkinsRel (user_id, skin_id)
    VALUES (?, ?);
    `;

  const VALUES = [data.user_id, data.skin_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Update user location
module.exports.updateUserLocation = (data, callback) => {
  const SQLSTATEMENT = `
    UPDATE UserLocation 
    SET current_planet = ?, no_of_planets_reached = ?
    WHERE user_id = ?;
    `;

  const VALUES = [data.current_planet, data.planet_count, data.user_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Update spaceship
module.exports.updateSpaceship = (data, callback) => {
  const SQLSTATEMENT = `
    UPDATE Spaceships 
    SET skin = ?, level = ?, fuel = ?
    WHERE user_id = ?;
    `;

  const VALUES = [data.skin, data.level, data.fuel, data.user_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Get final counts using subqueries
module.exports.getFinalCounts = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT 
        (SELECT COUNT(*) FROM UserCompletion WHERE user_id = ?) AS challenges_completed,
        (SELECT COUNT(*) FROM UserPlanetsRel WHERE user_id = ?) AS planets_reached,
        (SELECT COUNT(*) FROM UserSkinsRel WHERE user_id = ?) AS skins_owned;
    `;

  const VALUES = [data.user_id, data.user_id, data.user_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// ============ For other endpoints ============

// Check challenge existence
module.exports.checkChallengeExistence = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT description 
    FROM WellnessChallenge
    WHERE challenge_id = ?;
    `;

  const VALUES = [data.challenge_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Get attempts by challenge_id
module.exports.selectAttemptsByChallengeId = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT 
        user_id, 
        details, 
        completed_on 
    FROM UserCompletion
    WHERE challenge_id = ?;
    `;

  const VALUES = [data.challenge_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};
