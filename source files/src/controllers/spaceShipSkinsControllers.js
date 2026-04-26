const model = require("../models/spaceShipSkinsModels");
const userModel = require("../models/userModels");

//Default RequestBody Validation
module.exports.defaultRequestValidation = (req, res, next) => {
  if (
    req.body.skin_name == undefined ||
    req.body.points_required == undefined ||
    req.body.description == undefined
  ) {
    return res.status(400).json({
      message:
        "Error: one of the user authentication data is undefined. There must be skin_name, points_required and description.",
    }); //Check if required fields exist
  }

  if (req.body.skin_name.length === 0) {
    return res.status(400).json({
      message: "Error: skin name cannot be empty",
    }); // Validation: Check if skin name is not empty
  }

  if (isNaN(req.body.points_required) || req.body.points_required <= 0) {
    return res
      .status(400)
      .send(
        "Points required must be a number and cannot be zero or less than zero.",
      );
  }

  if (req.body.description.length === 0) {
    return res.status(400).json({
      message: "Error: description cannot be empty",
    }); // Validation: Check if description is not empty
  }

  next();
};

//skin_name existence Validation
module.exports.skinNameExistence = (req, res, next) => {
  // Define data object
  const data = {
    skin_name: String(req.body.skin_name),
  };

  const callback = (error, results, fields) => {
    // Handle error first
    if (error) {
      console.error("Error checking skin_name:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    }

    // If no skin exists yet → skip comparison
    if (results.length === 0) {
      console.log("No existing skin found — safe to create new one");
      return next();
    }

    // Check if skin_name exists
    if (results.length > 0) {
      return res.status(409).json({
        message: "Error: skin_name already exists",
      });
    } else {
      next();
    }
  };

  model.selectBySkinname(data, callback);
};

//skin_name existence Validation For updating
module.exports.skinNameExistenceForUpdate = (req, res, next) => {
  // Define data object
  const data = {
    skin_name: String(req.body.skin_name),
    updated_skin_name: String(req.body.updated_skin_name),
  };

  const callback = (error, results, fields) => {
    // Handle error first
    if (error) {
      console.error("Error checking skin_name:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    }

    if (data.updated_skin_name === data.skin_name) {
      return next();
    } else if (results.length > 0) {
      return res.status(409).json({
        message: "Error: skin_name already exists",
      });
    } else {
      next();
    }
  };

  model.selectBySkinnameForUpdate(data, callback);
};

// Retrieve points_required
module.exports.retrievePointsRequired = (req, res, next) => {
  const data = {
    skin_name: String(req.body.skin_name),
  };

  const callback = (error, results, fields) => {
    // Handle error first
    if (error) {
      console.error("Error retrieving points_required:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    }

    res.locals.currentPointsRequired = results.points_required;

    next();
  };

  model.selectPointsRequiredBySkinname(data, callback);
};

//points_required existence Validation For updating
module.exports.pointsRequiredExistenceForUpdate = (req, res, next) => {
  // Define data object
  const data = {
    points_required: String(req.body.updated_points_required),
  };

  const callback = (error, results, fields) => {
    // Handle error first
    if (error) {
      console.error("Error checking updated_points_required:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    }

    if (data.points_required === res.locals.currentPointsRequired) {
      return next();
    } else if (results.length > 0) {
      return res.status(409).json({
        message: "Two skins cannot have the same points required to unlock.",
      });
    } else {
      next();
    }
  };

  model.selectByPointsrequired(data, callback);
};

// same points_required Validation
module.exports.pointsRequiredExistence = (req, res, next) => {
  // Define data object
  const data = {
    points_required: Number(req.body.points_required),
  };

  const callback = (error, results, fields) => {
    // Handle error first
    if (error) {
      console.error("Error checking points_required: ", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    }

    // If no skin exists yet → skip comparison
    if (results.length === 0) {
      console.log("No existing skin found — safe to create new one");
      return next();
    }

    if (results.length > 0) {
      return res.status(409).json({
        message: "Two skins cannot have the same points required.",
      });
    }

    next();
  };

  model.selectByPointsrequired(data, callback);
};

// Get maximum points for display in frontend
module.exports.readMaxPoints = (req, res, next) => {
  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error readMaxPoints:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    const maxPoints = results[0].max_points || 0;

    res.status(200).json({
      max_points: maxPoints,
      minimum_required: maxPoints,
    });
  };

  model.getMaxPoints(callback);
};

// Check if points required is greater than or equal to current maximum
module.exports.checkMinimumPoints = (req, res, next) => {
  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error checkMinimumPoints:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    const maxPoints = results[0].max_points;
    const requestedPoints = Number(
      req.body.updated_points_required || req.body.points_required,
    );

    // If this is the first skin, allow any points
    if (maxPoints === null) {
      return next();
    }

    // Check if requested points is at least the maximum
    if (requestedPoints < maxPoints) {
      return res.status(400).json({
        message: `Skin points must be at least ${maxPoints} points (current maximum). Your requested points: ${requestedPoints} points.`,
      });
    }

    next();
  };

  model.getMaxPoints(callback);
};

// For skin creation
module.exports.createSkin = (req, res, next) => {
  console.log("create Skin");

  // Build a data package
  const data = {
    skin_name: String(req.body.skin_name),
    points_required: Number(req.body.points_required),
    description: String(req.body.description),
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error createSkin: ", error);
      res.status(500).json({
        message: "Internal Server Error",
        error: error,
      });
    } else {
      console.log("createNewSkin results: ", results);
      if (
        results.affectedRows !== 1 ||
        results.insertId == undefined ||
        results.insertId <= 0
      ) {
        res.status(500).send("Error: Failed to create new skin");
      } else {
        res.status(201).json({
          skin_name: data.skin_name,
          points_required: data.points_required,
          description: data.description,
        });
      }
    }
  };
  model.singleInsert(data, callback);
};

//planet_id Validation
module.exports.validateSkinId = (req, res, next) => {
  const skin_id = Number(req.params.skin_id);

  if (isNaN(skin_id) || skin_id <= 0) {
    return res.status(400).send("Invalid skin_id");
  }
  next();
};

//RequestBody Validation for updating spaceShipSkin
module.exports.requestValidationForUpdating = (req, res, next) => {
  if (
    req.body.skin_name == undefined ||
    req.body.updated_skin_name == undefined ||
    req.body.updated_points_required == undefined ||
    req.body.updated_description == undefined
  ) {
    return res.status(400).json({
      message:
        "Error: one of the user authentication data is undefined. There must be skin_name, updated_skin_name, updated_points_required and updated_description.",
    }); //Check if required fields exist
  }

  if (req.body.skin_name.length === 0) {
    return res.status(400).json({
      message: "Error: skin name cannot be empty",
    }); // Validation: Check if skin name is not empty
  }

  if (req.body.updated_skin_name.length === 0) {
    return res.status(400).json({
      message: "Error: updated skin name cannot be empty",
    }); // Validation: Check if skin name is not empty
  }

  if (
    isNaN(req.body.updated_points_required) ||
    req.body.updated_points_required <= 0
  ) {
    return res
      .status(400)
      .send(
        "Required points must be a number and cannot be zero or less than zero.",
      );
  }

  if (req.body.updated_description.length === 0) {
    return res.status(400).json({
      message: "Error: description cannot be empty",
    }); // Validation: Check if description is not empty
  }

  next();
};

// retrieve skin_id by skin_name
module.exports.retrieveSkinId = (req, res, next) => {
  // Define data object
  const data = {
    skin_name: String(req.body.skin_name),
  };

  const callback = (error, results, fields) => {
    // Handle error first
    if (error) {
      console.error("Error retrieve skin_id:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    } else {
      res.locals.correctSkinId = results[0].skin_id;
      next();
    }
  };

  model.selectBySkinname(data, callback);
};

// Retrieve skin_name by given skin_id and check with the one in request body
module.exports.checkSkinName = (req, res, next) => {
  // Define data object
  const data = {
    skin_id: Number(req.params.skin_id),
    skin_name: String(req.body.skin_name),
  };

  const callback = (error, results, fields) => {
    // Handle error first
    if (error) {
      console.error("Error checkSkinName:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    }

    if (results[0].skin_name === data.skin_name) {
      next();
    } else {
      return res.status(404).json({
        message: `Your provided skin_id and skin_name are not related. By this skin_id ${data.skin_id}, you are updating ${results[0].skin_name}, not ${data.skin_name}. Correct skin_id for ${data.skin_name} is ${res.locals.correctSkinId}. `,
      });
    }
  };

  model.checkskinName(data, callback);
};

// Update skin by skin_id
module.exports.updateSkinBySkinId = (req, res, next) => {
  const data = {
    skin_id: Number(req.params.skin_id),
    skin_name: String(req.body.skin_name),
    updated_skin_name: String(req.body.updated_skin_name),
    updated_points_required: Number(req.body.updated_points_required),
    updated_description: String(req.body.updated_description),
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error updateSkinBySkinId:", error);
      res.status(500).json(error);
    } else {
      if (results.affectedRows == 0) {
        res.status(404).json({
          message: "SpaceShip skin not found",
        });
      } else {
        res.status(200).json({
          message: `SpaceShip skin with skin_id ${data.skin_id} is updated`,
          updated_skin_name: data.updated_skin_name,
          skin_id: data.skin_id,
          points_required: data.updated_points_required,
          description: data.updated_description,
        });
      }
    }
  };

  model.updateSkinById(data, callback);
};

// Get all skins with user's acquired status
module.exports.readSkinsWithUserStatus = (req, res) => {
  const user_id = res.locals.userId;

  if (!user_id) {
    return res.status(401).json({
      message: "Invalid token - user_id not found",
    });
  }

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error readSkinsWithUserStatus:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    }

    // Separate skins into acquired and unacquired
    const acquiredSkins = results.filter((s) => s.user_acquired !== null);
    const unacquiredSkins = results.filter((s) => s.user_acquired === null);

    res.status(200).json({
      all_skins: results,
      acquired_skins: acquiredSkins,
      unacquired_skins: unacquiredSkins,
      total_skins: results.length,
      skins_acquired_count: acquiredSkins.length,
    });
  };

  model.getSkinsWithUserStatus(user_id, callback);
};

// Get skins created by current user
module.exports.readUserCreatedSkins = (req, res) => {
  const creator_id = res.locals.userId;

  if (!creator_id) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error readUserCreatedSkins:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    }

    res.status(200).json({
      created_skins: results,
      total_created: results.length,
    });
  };

  model.selectByCreatorId(creator_id, callback);
};

// Update createSkin to include creator_id
module.exports.createSkin = (req, res, next) => {
  const user_id = res.locals.userId;

  if (!user_id) {
    return res.status(401).json({
      message: "Authentication required to create skins",
    });
  }

  const data = {
    skin_name: String(req.body.skin_name),
    points_required: Number(req.body.points_required),
    description: String(req.body.description),
    creator_id: user_id,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error createSkin: ", error);
      res.status(500).json({
        message: "Internal Server Error",
        error: error,
      });
    } else {
      if (
        results.affectedRows !== 1 ||
        results.insertId == undefined ||
        results.insertId <= 0
      ) {
        res.status(500).send("Error: Failed to create new skin");
      } else {
        res.status(201).json({
          skin_id: results.insertId,
          skin_name: data.skin_name,
          points_required: data.points_required,
          description: data.description,
          creator_id: data.creator_id,
          points_awarded: res.locals.pointsAwarded || 0,
          current_user_points:
            res.locals.updatedPoints || res.locals.currentPoints,
        });
      }
    }
  };

  model.singleInsert(data, callback);
};

// Check if user is creator (middleware)
module.exports.checkCreatorByUserId = (req, res, next) => {
  const data = {
    skin_id: Number(req.params.skin_id),
    user_id: res.locals.userId,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error checkCreatorByUserId:", error);
      return res.status(500).json(error);
    } else if (results.length === 0) {
      return res.status(404).json({
        message: `Skin with skin_id:${data.skin_id} not found`,
      });
    } else if (results[0].creator_id !== data.user_id) {
      return res.status(403).json({
        message: "Only the creator can modify this skin.",
      });
    } else {
      next();
    }
  };

  model.checkCreator(data, callback);
};

// Delete skin by skin_id
module.exports.deleteSkinById = (req, res) => {
  const data = {
    skin_id: Number(req.params.skin_id),
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error deleteSkinById:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    } else {
      if (results.affectedRows === 0) {
        return res.status(404).json({
          message: `Skin with skin_id:${data.skin_id} not found`,
        });
      } else {
        res.status(204).send();
      }
    }
  };

  model.deleteById(data, callback);
};
