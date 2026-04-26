const express = require("express");
const router = express.Router();
const planetsController = require("../controllers/planetsControllers");
const jwtMiddleware = require("../middlewares/jwtMiddleware");

// Get maximum distance (public endpoint for showing minimum requirement)
router.get("/max-distance", planetsController.readMaxDistance);

// Get planets with user's reached status
router.get(
  "/user/status",
  jwtMiddleware.verifyToken,
  planetsController.readPlanetsWithUserStatus,
);

// Get planets created by current user
router.get(
  "/user/created",
  jwtMiddleware.verifyToken,
  planetsController.readUserCreatedPlanets,
);

// Get planet by ID
router.get(
  "/:planet_id",
  planetsController.validatePlanetId,
  planetsController.readPlanetById,
);

// Create planet
router.post(
  "/",
  jwtMiddleware.verifyToken,
  planetsController.defaultRequestValidation,
  planetsController.checkMinimumDistance, // check so that the planet distance is not smaller than the current largest distance
  planetsController.planetNameExistence,
  planetsController.distanceFromEarthExistence,
  planetsController.createPlanet,
);

// Update planet
router.put(
  "/:planet_id",
  jwtMiddleware.verifyToken,
  planetsController.validatePlanetId, // planet_id validation
  planetsController.checkCreatorByUserId, // Check if user is creator
  planetsController.requestValidationForUpdating, // Validate all required information are in request body
  planetsController.retrievePlanetId, // To give correct planet_id if wrong
  planetsController.checkPlanetName, // check planet_name with planet_id so that the user is updating the correct planet
  planetsController.checkMinimumDistance, // check so that the planet distance is not smaller than the current largest distance
  planetsController.planetNameExistenceForUpdate, // Check if the planet_name already exists
  planetsController.retrieveDistanceFromEarth, // Read distance from earth by planet_name
  planetsController.distanceFromEarthExistenceForUpdate, // Check if the distanceFromEarth already existed.
  planetsController.updatePlanetByPlanetId, // Update planet by planet_id
);

// Delete planet (only creator can delete)
router.delete(
  "/:planet_id",
  jwtMiddleware.verifyToken,
  planetsController.validatePlanetId,
  planetsController.checkCreatorByUserId, // Check if user is creator
  planetsController.deletePlanetById,
);

module.exports = router;
