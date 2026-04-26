const express = require("express");
const router = express.Router();
const spaceShipSkinsController = require("../controllers/spaceShipSkinsControllers");
const jwtMiddleware = require("../middlewares/jwtMiddleware");

// Get maximum points (public endpoint for showing minimum requirement)
router.get("/max-points", spaceShipSkinsController.readMaxPoints);

// Get skins with user's acquired status (authenticated)
router.get(
  "/user/status",
  jwtMiddleware.verifyToken,
  spaceShipSkinsController.readSkinsWithUserStatus,
);

// Get skins created by current user
router.get(
  "/user/created",
  jwtMiddleware.verifyToken,
  spaceShipSkinsController.readUserCreatedSkins,
);

// Create spaceShip skin
router.post(
  "/",
  jwtMiddleware.verifyToken,
  spaceShipSkinsController.defaultRequestValidation, // Validate request body
  spaceShipSkinsController.checkMinimumPoints, // check so that the skin point is not smaller than the current largest point
  spaceShipSkinsController.skinNameExistence, // Check if the skin name already existed or not
  spaceShipSkinsController.pointsRequiredExistence, // Check if points required already existed or not
  spaceShipSkinsController.createSkin, // Create skin
);

// Update skin  ( only creator can update )
router.put(
  "/:skin_id",
  jwtMiddleware.verifyToken,
  spaceShipSkinsController.validateSkinId, // skin_id validation
  spaceShipSkinsController.checkCreatorByUserId, // Check if user is creator
  spaceShipSkinsController.requestValidationForUpdating, // Validate all required information are in request body
  spaceShipSkinsController.retrieveSkinId, // To give correct skin_id if wrong
  spaceShipSkinsController.checkSkinName, // check skin_name with skin_id so that the user is updating the correct skin
  spaceShipSkinsController.checkMinimumPoints, // check so that the skin point is not smaller than the current largest point
  spaceShipSkinsController.skinNameExistenceForUpdate, // Check if the skin_name already exists
  spaceShipSkinsController.retrievePointsRequired, // Read points_required by skin_name
  spaceShipSkinsController.pointsRequiredExistenceForUpdate, // Check if the points_required already existed.
  spaceShipSkinsController.updateSkinBySkinId, // Update skin by skin_id
);

// Delete skin (only creator can delete)
router.delete(
  "/:skin_id",
  jwtMiddleware.verifyToken,
  spaceShipSkinsController.validateSkinId,
  spaceShipSkinsController.checkCreatorByUserId, // Check if user is creator
  spaceShipSkinsController.deleteSkinById,
);

module.exports = router;
