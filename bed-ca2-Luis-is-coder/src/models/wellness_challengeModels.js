const pool = require("../services/db");

// Model for checking challenge existence
module.exports.checkChallengeExistence = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT creator_id FROM WellnessChallenge
    WHERE description = ?;
    `;
  const VALUES = [data.description];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Is used in Update challenge by challengeId, This model will be used to check email and password of user's account
module.exports.logIn = (data, callback) => {
  const SQLSTATMENT = `
    SELECT email, password FROM user
    WHERE user_id = ?;
    `;
  const VALUES = [data.user_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};

// Check creator of challenge
module.exports.checkCreator = (data, callback) => {
  const SQLSTATMENT = `
    SELECT creator_id FROM WellnessChallenge
    WHERE challenge_id = ?;
    `;
  const VALUES = [data.challenge_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};

// Model for creating new challenge
module.exports.singleInsert = (data, callback) => {
  const SQLSTATMENT = `
    INSERT INTO WellnessChallenge (creator_id, description, points)
    VALUES (?,?,?);
    `;
  const VALUES = [data.user_id, data.description, data.points];

  pool.query(SQLSTATMENT, VALUES, callback);
};

// Model to retrieve user's current points from user table
module.exports.selectPointByuserId = (data, callback) => {
  const SQLSTATMENT = `
    SELECT points FROM User
    WHERE user_id = ?;
    `;
  const VALUES = [data.user_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};

// Model to update user point by user_id
module.exports.updatePointByuserId = (data, callback) => {
  const SQLSTATMENT = `
    UPDATE User 
    SET points = ?
    WHERE user_id = ?;
    `;
  const VALUES = [data.points, data.user_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};

// Model for retrieving all challenges
module.exports.selectAll = (callback) => {
  const SQLSTATMENT = `
    SELECT * FROM WellnessChallenge`;

  pool.query(SQLSTATMENT, callback);
};

// Model to retrieve a challenge by Id
module.exports.selectById = (data, callback) => {
  const SQLSTATMENT = `
    SELECT * FROM WellnessChallenge
    WHERE challenge_id = ?;
    `;
  const VALUES = [data.challenge_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};

// Delete Challenge By Id
module.exports.deleteById = (data, callback) => {
  const SQLSTATMENT = `
    DELETE FROM WellnessChallenge
    WHERE challenge_id = ?;
    `;
  const VALUES = [data.challenge_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};

// Model to update challenge by challenge_id
module.exports.updateChallengeById = (data, callback) => {
  const SQLSTATMENT = `
    UPDATE WellnessChallenge 
    SET description = ?, points = ?
    WHERE challenge_id = ?;
    `;
  const VALUES = [data.description, data.points, data.challenge_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};

// Get all challenges with user's completion status using LEFT JOIN
module.exports.getChallengesWithUserStatus = (user_id, callback) => {
  const SQLSTATEMENT = `
    SELECT
        WC.challenge_id,
        WC.creator_id,
        WC.description,
        WC.points,
        UC.user_id AS user_completed,
        UC.details AS completion_details,
        UC.completed_on
    FROM WellnessChallenge WC
    LEFT JOIN UserCompletion UC ON WC.challenge_id = UC.challenge_id AND UC.user_id = ?
    ORDER BY WC.points ASC;
    `;

  const VALUES = [user_id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Get challenges created by user
module.exports.selectByCreatorId = (creator_id, callback) => {
  const SQLSTATEMENT = `
    SELECT * FROM WellnessChallenge
    WHERE creator_id = ?
    ORDER BY challenge_id DESC;
    `;
  const VALUES = [creator_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};
