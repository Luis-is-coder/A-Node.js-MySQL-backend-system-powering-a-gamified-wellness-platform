const pool = require("../services/db");

// Create new user
module.exports.singleInsert = (data, callback) => {
  const SQLSTATMENT = `
    INSERT INTO User (username, email, password)
    VALUES (?,?,?);
    `;
  const VALUES = [data.username, data.email, data.password];

  pool.query(SQLSTATMENT, VALUES, callback);
};

// This is used in user name existence validation
module.exports.selectByUsername = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT user_id FROM User
    WHERE username = ?;
    `;
  const VALUES = [data.username];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Select by username or email
module.exports.selectUserByUsernameOrEmail = (data, callback) => {
  const SQLSTATEMENT = `SELECT * FROM User WHERE username = ? OR email = ?`;
  const VALUES = [data.username, data.email];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

module.exports.selectByUsernameForUpdate = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT user_id FROM User
    WHERE username = ?;
    `;
  const VALUES = [data.updated_username];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// insertSpaceship function
module.exports.insertSpaceship = (data, callback) => {
  const SQLSTATMENT = `
        INSERT INTO Spaceships (user_id, name, fuel)
        VALUES (?, ?, ?);
    `;
  const VALUES = [data.user_id, data.name, data.fuel];
  pool.query(SQLSTATMENT, VALUES, callback);
};

// Model for insert current location
module.exports.insertCurrentLocation = (data, callback) => {
  const SQLSTATMENT = `
        INSERT INTO UserLocation (user_id)
        VALUES (?);
    `;
  const VALUES = [data.user_id];
  pool.query(SQLSTATMENT, VALUES, callback);
};

// Model to read all users
module.exports.selectAll = (callback) => {
  const SQLSTATMENT = `
    SELECT * FROM user`;

  pool.query(SQLSTATMENT, callback);
};

// Model to select by username
module.exports.selectUserByUsername = (data, callback) => {
  const SQLSTATEMENT = `SELECT * FROM User WHERE username COLLATE utf8mb4_bin = ?`;
  const VALUES = [data.username];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Model to read user by id
module.exports.selectUserById = (user_id, callback) => {
  const SQLSTATEMENT = `
    SELECT user_id, username, points, email, created_on FROM user
    WHERE user_id = ?;
    `;
  const VALUES = [user_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Update username by userId, spaceship name is also edited in the backend

// Model to validate user's username, email and password
module.exports.logIn = (data, callback) => {
  const SQLSTATMENT = `
    SELECT username,email, password FROM user
    WHERE user_id = ?;
    `;
  const VALUES = [data.user_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};

// Model to update spaceShip name by user_id
module.exports.updateSpaceshipName = (data, callback) => {
  const SQLSTATMENT = `
    UPDATE Spaceships 
    SET name = ?
    WHERE user_id = ?;
    `;
  const VALUES = [data.updated_username, data.user_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};

//Update user by user_id
module.exports.updateUserById = (data, callback) => {
  const SQLSTATMENT = `
    UPDATE user 
    SET username = ?, email = ?, password = ?
    WHERE user_id = ?;
    `;
  const VALUES = [
    data.updated_username,
    data.updated_email,
    data.updated_password,
    data.user_id,
  ];

  pool.query(SQLSTATMENT, VALUES, callback);
};

//Delete UserCompletion by user Id
module.exports.deleteCompletionById = (data, callback) => {
  const SQLSTATMENT = `
    DELETE FROM UserCompletion
    WHERE user_id = ?;
    `;

  const VALUES = [data.user_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};

//Delete UserPlanetRel by user Id
module.exports.deleteuserPlanetRelById = (data, callback) => {
  const SQLSTATMENT = `
    DELETE FROM UserPlanetsRel
    WHERE user_id = ?;
    `;

  const VALUES = [data.user_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};

//Delete UserSkinRel by user Id
module.exports.deleteuserSkinRelById = (data, callback) => {
  const SQLSTATMENT = `
    DELETE FROM UserSkinsRel
    WHERE user_id = ?;
    `;

  const VALUES = [data.user_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};

// Delete User By Id
module.exports.deleteById = (data, callback) => {
  const SQLSTATMENT = `
    DELETE FROM User
    WHERE user_id = ?;
    `;
  const VALUES = [data.user_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};

//Delete location by user Id
module.exports.deleteLocationById = (data, callback) => {
  const SQLSTATMENT = `
    DELETE FROM UserLocation
    WHERE user_id = ?;
    `;

  const VALUES = [data.user_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};

//Delete spaceship by user Id
module.exports.deleteSpaceShip = (data, callback) => {
  const SQLSTATMENT = `
    DELETE FROM Spaceships
    WHERE user_id = ?;
    `;

  const VALUES = [data.user_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};

// Get complete user profile data with calculated values
module.exports.selectUserProfileById = (user_id, callback) => {
  const SQLSTATEMENT = `
    SELECT 
        u.user_id,
        u.username,
        u.points AS cosmic_points,
        u.created_on AS member_since,
        ul.current_planet,
        ul.no_of_planets_reached,
        s.level AS spaceship_level,
        s.skin AS spaceship_skin,
        (SELECT COUNT(*) FROM UserCompletion WHERE user_id = ?) AS challenges_completed,
        (SELECT COUNT(*) FROM UserSkinsRel WHERE user_id = ?) AS skins_acquired,
        (SELECT COUNT(*) FROM WellnessChallenge WHERE creator_id = ?) AS challenges_created,
        (SELECT COUNT(*) FROM Planets WHERE creator_id = ?) AS planets_created,
        (SELECT COUNT(*) FROM spaceShipSkins WHERE creator_id = ?) AS skins_created,
        (SELECT skin_name FROM spaceShipSkins WHERE skin_id = s.level) AS current_skin_name,
        (SELECT description FROM spaceShipSkins WHERE skin_id = s.level) AS current_skin_description,
        (SELECT skin_name FROM spaceShipSkins WHERE skin_id = s.level + 1) AS next_skin_name,
        (SELECT description FROM spaceShipSkins WHERE skin_id = s.level + 1) AS next_skin_description,
        (SELECT points_required FROM spaceShipSkins WHERE skin_id = s.level + 1) AS next_level_points_required
    FROM User u
    LEFT JOIN UserLocation ul ON u.user_id = ul.user_id
    LEFT JOIN Spaceships s ON u.user_id = s.user_id
    WHERE u.user_id = ?;
    `;

  const VALUES = [
    user_id, // For UserCompletion Count
    user_id, // For UserSkinsRel Count
    user_id, // For Wellness Challenge Count
    user_id, // For Planets Created Count
    user_id, // For Skins Created Count
    user_id, // For main WHERE clause
  ];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Get total number of users
module.exports.getTotalUsers = (callback) => {
  const SQLSTATEMENT = `SELECT COUNT(*) as total_users FROM User`;
  pool.query(SQLSTATEMENT, callback);
};

// Get top 3 users by points (leaderboard)
module.exports.getTopUsers = (callback) => {
  const SQLSTATEMENT = `
    SELECT 
        u.user_id,
        u.username,
        u.points,
        s.level AS spaceship_level,
        s.skin AS spaceship_skin,
        (SELECT COUNT(*) FROM UserCompletion WHERE user_id = u.user_id) AS challenges_completed
    FROM User u
    LEFT JOIN Spaceships s ON u.user_id = s.user_id
    ORDER BY u.points DESC
    LIMIT 3;
    `;
  pool.query(SQLSTATEMENT, callback);
};
