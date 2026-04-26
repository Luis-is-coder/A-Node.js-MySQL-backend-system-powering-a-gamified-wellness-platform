const pool = require("../services/db");

// Read planet by ID
module.exports.readPlanetById = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT * FROM Planets
    WHERE planet_id = ?;
    `;
  const VALUES = [data.planet_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// This is used in planet_name existence validation
module.exports.selectByPlanetname = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT planet_id FROM Planets
    WHERE planet_name = ?;
    `;
  const VALUES = [data.planet_name];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

module.exports.selectByPlanetnameForUpdate = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT planet_id FROM Planets
    WHERE planet_name = ?;
    `;
  const VALUES = [data.updated_planet_name];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

module.exports.selectDistanceByPlanetname = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT distance_from_earth FROM Planets
    WHERE planet_name = ?;
    `;
  const VALUES = [data.planet_name];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// This is used in  same distance validation
module.exports.selectByDistanceFromEarth = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT planet_id FROM Planets
    WHERE distance_from_earth = ?;
    `;
  const VALUES = [data.distance_from_earth];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Create new planet
module.exports.singleInsert = (data, callback) => {
  const SQLSTATEMENT = `
    INSERT INTO Planets (planet_name, distance_from_earth, description, creator_id)
    VALUES (?,?,?,?);
    `;
  const VALUES = [
    data.planet_name,
    data.distance_from_earth,
    data.description,
    data.creator_id,
  ];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Model for checking planet_name with planet_id
module.exports.checkplanetName = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT planet_name FROM Planets
    WHERE planet_id = ?;
    `;
  const VALUES = [data.planet_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Model to update planet by planet_id
module.exports.updatePlanetById = (data, callback) => {
  const SQLSTATMENT = `
    UPDATE Planets 
    SET planet_name = ?,distance_from_earth = ?, description = ?
    WHERE planet_id = ?;
    `;
  const VALUES = [
    data.updated_planet_name,
    data.updated_distance_from_earth,
    data.updated_description,
    data.planet_id,
  ];

  pool.query(SQLSTATMENT, VALUES, callback);
};

// Get all planets with user's reached status using LEFT JOIN
module.exports.getPlanetsWithUserStatus = (user_id, callback) => {
  const SQLSTATEMENT = `
    SELECT
        P.planet_id,
        P.planet_name,
        P.distance_from_earth,
        P.description,
        UPR.user_id AS user_reached,
        UPR.acquired_on
    FROM Planets P
    LEFT JOIN UserPlanetsRel UPR ON P.planet_id = UPR.planet_id AND UPR.user_id = ?
    ORDER BY P.distance_from_earth ASC;
    `;

  const VALUES = [user_id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Get planets created by user
module.exports.selectByCreatorId = (creator_id, callback) => {
  const SQLSTATEMENT = `
    SELECT * FROM Planets
    WHERE creator_id = ?
    ORDER BY created_on DESC;
    `;
  const VALUES = [creator_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Delete planet by planet_id
module.exports.deleteById = (data, callback) => {
  const SQLSTATEMENT = `
    DELETE FROM Planets
    WHERE planet_id = ?;
    `;
  const VALUES = [data.planet_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Check if user is creator
module.exports.checkCreator = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT creator_id FROM Planets
    WHERE planet_id = ?;
    `;
  const VALUES = [data.planet_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Get maximum distance from all planets
module.exports.getMaxDistance = (callback) => {
  const SQLSTATEMENT = `
    SELECT MAX(distance_from_earth) as max_distance FROM Planets;
    `;

  pool.query(SQLSTATEMENT, [], callback);
};
