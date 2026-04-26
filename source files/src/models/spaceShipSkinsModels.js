const pool = require("../services/db");

// This is used in skin_name existence validation
module.exports.selectBySkinname = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT skin_id FROM spaceShipSkins
    WHERE skin_name = ?;
    `;
  const VALUES = [data.skin_name];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

module.exports.selectBySkinnameForUpdate = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT skin_id FROM spaceShipSkins
    WHERE skin_name = ?;
    `;
  const VALUES = [data.updated_skin_name];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

module.exports.selectPointsRequiredBySkinname = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT points_required FROM spaceShipSkins
    WHERE skin_name = ?;
    `;
  const VALUES = [data.planet_name];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// This is used in  same points_required validation
module.exports.selectByPointsrequired = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT skin_id FROM spaceShipSkins
    WHERE points_required = ?;
    `;
  const VALUES = [data.points_required];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Create new skin
module.exports.singleInsert = (data, callback) => {
  const SQLSTATMENT = `
    INSERT INTO spaceShipSkins (skin_name, points_required, description, creator_id)
    VALUES (?,?,?,?);
    `;
  const VALUES = [
    data.skin_name,
    data.points_required,
    data.description,
    data.creator_id,
  ];

  pool.query(SQLSTATMENT, VALUES, callback);
};

// Model for checking skin_name with skin_id
module.exports.checkskinName = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT skin_name FROM spaceShipSkins
    WHERE skin_id = ?;
    `;
  const VALUES = [data.skin_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Model to update skin by skin_id
module.exports.updateSkinById = (data, callback) => {
  const SQLSTATMENT = `
    UPDATE spaceShipSkins
    SET skin_name = ?,points_required = ?, description = ?
    WHERE skin_id = ?;
    `;
  const VALUES = [
    data.updated_skin_name,
    data.updated_points_required,
    data.updated_description,
    data.skin_id,
  ];

  pool.query(SQLSTATMENT, VALUES, callback);
};

// Get all skins with user's acquired status using LEFT JOIN
module.exports.getSkinsWithUserStatus = (user_id, callback) => {
  const SQLSTATEMENT = `
    SELECT
        S.skin_id,
        S.skin_name,
        S.points_required,
        S.description,
        USR.user_id AS user_acquired,
        USR.acquired_on
    FROM spaceShipSkins S
    LEFT JOIN UserSkinsRel USR ON S.skin_id = USR.skin_id AND USR.user_id = ?
    ORDER BY S.points_required ASC;
    `;

  const VALUES = [user_id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Get skins created by user
module.exports.selectByCreatorId = (creator_id, callback) => {
  const SQLSTATEMENT = `
    SELECT * FROM spaceShipSkins
    WHERE creator_id = ?
    ORDER BY created_on DESC;
    `;
  const VALUES = [creator_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Delete skin by skin_id
module.exports.deleteById = (data, callback) => {
  const SQLSTATEMENT = `
    DELETE FROM spaceShipSkins
    WHERE skin_id = ?;
    `;
  const VALUES = [data.skin_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Check if user is creator
module.exports.checkCreator = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT creator_id FROM spaceShipSkins
    WHERE skin_id = ?;
    `;
  const VALUES = [data.skin_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Get maximum points required from all skins
module.exports.getMaxPoints = (callback) => {
  const SQLSTATEMENT = `
    SELECT MAX(points_required) as max_points FROM spaceShipSkins;
    `;

  pool.query(SQLSTATEMENT, [], callback);
};
