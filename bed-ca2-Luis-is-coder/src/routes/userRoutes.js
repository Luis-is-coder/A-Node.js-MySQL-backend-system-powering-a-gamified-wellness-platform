const express = require("express");
const router = express.Router();
const userController = require("../controllers/userControllers");
const bcryptMiddleware = require("../middlewares/bcryptMiddleware");
const jwtMiddleware = require("../middlewares/jwtMiddleware");

// Get current user info from token
router.get(
  "/token/info",
  jwtMiddleware.verifyToken,
  userController.readUserByToken,
);

// Get current user's complete profile from token
router.get(
  "/token/profile",
  jwtMiddleware.verifyToken,
  userController.readUserProfileByToken,
);

// Get total users count
router.get("/stats/total", userController.readTotalUsers);

// Get leaderboard - top 3 users
router.get("/stats/leaderboard", userController.readTopUsers);

// Get all users
router.get("/", userController.readAllUsers);

// Get user by user_id
router.get(
  "/:user_id",
  userController.validateUserId, // Check if user_id valid or not
  userController.readUserById,
);

// Update User by userId
router.put(
  "/:user_id",
  userController.userRequestValidationForUpdating, // Check if all required datafield exists
  userController.validateUserId, // Check whether userId is valid or not
  userController.userVerificationForDeletionAndUpdating, // Check whether user email and password is correct or not
  userController.userNameExistenceForUpdate, // Check if new username already exists
  userController.passwordValidationForUpdating, // Check whether the updated password is strong enough or not
  bcryptMiddleware.hashPassword, // Hash password
  userController.updateSpaceShipNameByUserId, // Update user's spaceship name
  userController.updateUserByUserId, // Update user information
);

// Delete User, his/her spaceship and current location with user_id
router.delete(
  "/:user_id",
  userController.validateUserId, // Check if user_id is valid or not
  userController.userRequestValidationForUserCreation, // Make sure all necessary credentials are provided
  userController.userVerificationForDeletionAndUpdating, // Check the user is deleting its own account
  userController.deleteUserCompletionById, // Delete completions
  userController.deleteUserPlanetRelById, // Delete user-planet relations
  userController.deleteUserSkinRelById, // Delete user-skin relations
  userController.deleteUserById, // Delete user By user_id/
  userController.deleteCurrentLocationById, // Delete User's location
  userController.deleteSpaceshipByUserId, // Delete user's spaceship
);

module.exports = router;
