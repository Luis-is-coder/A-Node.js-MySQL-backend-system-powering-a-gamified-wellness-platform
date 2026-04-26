const model = require("../models/planetsModels");

//Default RequestBody Validation
module.exports.defaultRequestValidation = (req, res, next) => {
  if (
    req.body.planet_name == undefined ||
    req.body.distance_from_earth == undefined ||
    req.body.description == undefined
  ) {
    return res.status(400).json({
      message:
        "Error: one of the user authentication data is undefined. There must be planet_name, distance_from_earth and description.",
    }); //Check if required fields exist
  }

  if (req.body.planet_name.length === 0) {
    return res.status(400).json({
      message: "Error: planet name cannot be empty",
    }); // Validation: Check if planet name is not empty
  }

  if (
    isNaN(req.body.distance_from_earth) ||
    req.body.distance_from_earth <= 0
  ) {
    return res
      .status(400)
      .send(
        "Distance from earth must be a number and cannot be zero or less than zero.",
      );
  }

  if (req.body.description.length === 0) {
    return res.status(400).json({
      message: "Error: description cannot be empty",
    }); // Validation: Check if description is not empty
  }

  next();
};

//planet_name existence Validation
module.exports.planetNameExistence = (req, res, next) => {
  // Define data object
  const data = {
    planet_name: String(req.body.planet_name),
  };

  const callback = (error, results, fields) => {
    // Handle error first
    if (error) {
      console.error("Error checking planet_name:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    }

    // If no planet exists yet → skip comparison
    if (results.length === 0) {
      return next();
    }

    // Check if planet_name exists
    if (results.length > 0) {
      return res.status(409).json({
        message: "planet_name already exists",
      });
    } else {
      next();
    }
  };

  model.selectByPlanetname(data, callback);
};

//Planetname existence Validation For updating
module.exports.planetNameExistenceForUpdate = (req, res, next) => {
  // Define data object
  const data = {
    planet_name: String(req.body.planet_name),
    updated_planet_name: String(req.body.updated_planet_name),
  };

  const callback = (error, results, fields) => {
    // Handle error first
    if (error) {
      console.error("Error checking planet_name:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    }

    if (data.updated_planet_name === data.planet_name) {
      return next();
    } else if (results.length > 0) {
      return res.status(409).json({
        message: "Error: planet_name already exists",
      });
    } else {
      next();
    }
  };

  model.selectByPlanetnameForUpdate(data, callback);
};

// same distance from earth Validation
module.exports.distanceFromEarthExistence = (req, res, next) => {
  // Define data object
  const data = {
    distance_from_earth: Number(req.body.distance_from_earth),
  };

  const callback = (error, results, fields) => {
    // Handle error first
    if (error) {
      console.error("Error checking distance_from_earth:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    }

    // If no planet exists yet → skip comparison
    if (results.length === 0) {
      return next();
    }

    if (results.length > 0) {
      return res.status(409).json({
        message: "Two planets cannot be at the same distance from earth.",
      });
    }

    next();
  };

  model.selectByDistanceFromEarth(data, callback);
};

// Retrieve distance From earth
module.exports.retrieveDistanceFromEarth = (req, res, next) => {
  const data = {
    planet_name: String(req.body.planet_name),
  };

  const callback = (error, results, fields) => {
    // Handle error first
    if (error) {
      console.error("Error retrieving distance_from_earth:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    }

    res.locals.currentDistanceFromEarth = results.distance_from_earth;

    next();
  };

  model.selectDistanceByPlanetname(data, callback);
};

//Distance From earth existence Validation For updating
module.exports.distanceFromEarthExistenceForUpdate = (req, res, next) => {
  // Define data object
  const data = {
    distance_from_earth: String(req.body.updated_distance_from_earth),
  };

  const callback = (error, results, fields) => {
    // Handle error first
    if (error) {
      console.error("Error checking updated_distance_from_earth:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    }

    if (data.distance_from_earth === res.locals.currentDistanceFromEarth) {
      return next();
    } else if (results.length > 0) {
      return res.status(409).json({
        message: "Two planets cannot be at the same distance from earth.",
      });
    } else {
      next();
    }
  };

  model.selectByDistanceFromEarth(data, callback);
};

// Get maximum distance for display in frontend
module.exports.readMaxDistance = (req, res, next) => {
  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error readMaxDistance:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    const maxDistance = results[0].max_distance || 0;

    res.status(200).json({
      max_distance: maxDistance,
      minimum_required: maxDistance,
    });
  };

  model.getMaxDistance(callback);
};

// Check if distance is greater than or equal to current maximum
module.exports.checkMinimumDistance = (req, res, next) => {
  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error checkMinimumDistance:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    const maxDistance = results[0].max_distance;
    const requestedDistance = Number(
      req.body.updated_distance_from_earth || req.body.distance_from_earth,
    );

    // Check if requested distance is at least the maximum
    if (requestedDistance < maxDistance) {
      return res.status(400).json({
        message: `Planet distance must be at least ${maxDistance} light years (current maximum). Your requested distance: ${requestedDistance} light years.`,
      });
    }

    next();
  };

  model.getMaxDistance(callback);
};

// For planet creation
module.exports.createPlanet = (req, res, next) => {
  const user_id = res.locals.userId;

  // Build a data package
  const data = {
    planet_name: String(req.body.planet_name),
    distance_from_earth: Number(req.body.distance_from_earth),
    description: String(req.body.description),
    creator_id: user_id,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error createPlanet: ", error);
      res.status(500).json({
        message: "Internal Server Error",
        error: error,
      });
    } else {
      console.log("createNewPlanet results: ", results);
      if (
        results.affectedRows !== 1 ||
        results.insertId == undefined ||
        results.insertId <= 0
      ) {
        res.status(500).send("Error: Failed to create new planet");
      } else {
        res.status(201).json({
          planet_id: results.insertId,
          planet_name: data.planet_name,
          distance_from_earth: data.distance_from_earth,
          description: data.description,
          creator_id: data.creator_id,
        });
      }
    }
  };
  model.singleInsert(data, callback);
};

// Get planets created by current user
module.exports.readUserCreatedPlanets = (req, res) => {
  const creator_id = res.locals.userId;

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error readUserCreatedPlanets:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    }

    res.status(200).json({
      created_planets: results,
      total_created: results.length,
    });
  };

  model.selectByCreatorId(creator_id, callback);
};

// Check if user is creator (middleware)
module.exports.checkCreatorByUserId = (req, res, next) => {
  const data = {
    planet_id: Number(req.params.planet_id),
    user_id: res.locals.userId,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error checkCreatorByUserId:", error);
      return res.status(500).json(error);
    } else if (results.length === 0) {
      return res.status(404).json({
        message: `Planet with planet_id:${data.planet_id} not found`,
      });
    } else if (results[0].creator_id !== data.user_id) {
      return res.status(403).json({
        message: "Only the creator can modify this planet.",
      });
    } else {
      next();
    }
  };

  model.checkCreator(data, callback);
};

// Delete planet by planet_id
module.exports.deletePlanetById = (req, res) => {
  const data = {
    planet_id: Number(req.params.planet_id),
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error deletePlanetById:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    } else {
      if (results.affectedRows === 0) {
        return res.status(404).json({
          message: `Planet with planet_id:${data.planet_id} not found`,
        });
      } else {
        res.status(204).send();
      }
    }
  };

  model.deleteById(data, callback);
};

//planet_id Validation
module.exports.validatePlanetId = (req, res, next) => {
  const planet_id = Number(req.params.planet_id);

  if (isNaN(planet_id) || planet_id <= 0) {
    return res.status(400).send("Invalid planet_id");
  }
  next();
};

//RequestBody Validation for updating planet
module.exports.requestValidationForUpdating = (req, res, next) => {
  if (
    req.body.planet_name == undefined ||
    req.body.updated_planet_name == undefined ||
    req.body.updated_distance_from_earth == undefined ||
    req.body.updated_description == undefined
  ) {
    return res.status(400).json({
      message:
        "Error: one of the user authentication data is undefined. There must be planet_name, updated_planet_name, updated_distance_from_earth and updated_description.",
    }); //Check if required fields exist
  }

  if (req.body.planet_name.length === 0) {
    return res.status(400).json({
      message: "Error: planet name cannot be empty",
    }); // Validation: Check if planet name is not empty
  }

  if (req.body.updated_planet_name.length === 0) {
    return res.status(400).json({
      message: "Error: updated planet name cannot be empty",
    }); // Validation: Check if planet name is not empty
  }

  if (
    isNaN(req.body.updated_distance_from_earth) ||
    req.body.updated_distance_from_earth <= 0
  ) {
    return res
      .status(400)
      .send(
        "Distance from earth must be a number and cannot be zero or less than zero.",
      );
  }

  if (req.body.updated_description.length === 0) {
    return res.status(400).json({
      message: "Error: description cannot be empty",
    }); // Validation: Check if description is not empty
  }

  next();
};

// retrieve planet_id by planet_name
module.exports.retrievePlanetId = (req, res, next) => {
  // Define data object
  const data = {
    planet_name: String(req.body.planet_name),
  };

  const callback = (error, results, fields) => {
    // Handle error first
    if (error) {
      console.error("Error retrieve planet_id:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    } else {
      res.locals.correctPlanetId = results[0].planet_id;
      next();
    }
  };

  model.selectByPlanetname(data, callback);
};

// Retrieve planet_name by given planet_id and check with the one in request body
module.exports.checkPlanetName = (req, res, next) => {
  // Define data object
  const data = {
    planet_id: Number(req.params.planet_id),
    planet_name: String(req.body.planet_name),
  };

  const callback = (error, results, fields) => {
    // Handle error first
    if (error) {
      console.error("Error checkPlanetName:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    }

    if (results[0].planet_name === data.planet_name) {
      next();
    } else {
      return res.status(404).json({
        message: `Your provided planet_id and planet_name are not related. By this planet_id ${data.planet_id}, you are updating ${results[0].planet_name}, not ${data.planet_name}. Correct planet_id for ${data.planet_name} is ${res.locals.correctPlanetId}. `,
      });
    }
  };

  model.checkplanetName(data, callback);
};

// Update planet by planet_id
module.exports.updatePlanetByPlanetId = (req, res, next) => {
  const data = {
    planet_id: Number(req.params.planet_id),
    planet_name: String(req.body.planet_name),
    updated_planet_name: String(req.body.updated_planet_name),
    updated_distance_from_earth: Number(req.body.updated_distance_from_earth),
    updated_description: String(req.body.updated_description),
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error updatePlanetByPlanetId:", error);
      res.status(500).json(error);
    } else {
      if (results.affectedRows == 0) {
        res.status(404).json({
          message: "Planet not found",
        });
      } else {
        res.status(200).json({
          message: `Planet with planet_id ${data.planet_id} is updated`,
          updated_planet_name: data.updated_planet_name,
          planet_id: data.planet_id,
          distance_from_earth: data.updated_distance_from_earth,
          description: data.updated_description,
        });
      }
    }
  };

  model.updatePlanetById(data, callback);
};

// Get all planets with user's reached status
module.exports.readPlanetsWithUserStatus = (req, res, next) => {
  const user_id = res.locals.userId;

  if (!user_id) {
    return res.status(401).json({
      message: "Invalid token - user_id not found",
    });
  }

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error readPlanetsWithUserStatus:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    }

    // Separate planets into reached and unreached
    const reachedPlanets = results.filter((p) => p.user_reached !== null);
    const unreachedPlanets = results.filter((p) => p.user_reached === null);

    res.status(200).json({
      all_planets: results,
      reached_planets: reachedPlanets,
      unreached_planets: unreachedPlanets,
      total_planets: results.length,
      planets_reached_count: reachedPlanets.length,
    });
  };

  model.getPlanetsWithUserStatus(user_id, callback);
};

// Read planet by ID
module.exports.readPlanetById = (req, res, next) => {
  const data = {
    planet_id: Number(req.params.planet_id),
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error readPlanetById:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Planet not found" });
    }

    res.status(200).json(results[0]);
  };

  model.readPlanetById(data, callback);
};
