const express = require("express");
const router = express.Router();
const controller = require("../controllers/user_completionControllers");
const jwtMiddleware = require("../middlewares/jwtMiddleware");

// Complete a challenge (with JWT authentication)
router.post(
  "/:challenge_id",
  jwtMiddleware.verifyToken, // JWT authentication
  controller.validateChallengeId, // Validate challenge_id
  controller.checkAlreadyCompleted, // Check if already completed
  controller.getCompletionData, // INNER JOIN: Get challenge + user + location + spaceship data
  controller.getPlanetsData, // LEFT JOIN: Get all planets with user status
  controller.getSkinsData, // LEFT JOIN: Get all skins with user status
  controller.updateUserPoints, // Update user points
  controller.insertUnlockedPlanets, // Insert new planets
  controller.insertUnlockedSkins, // Insert new skins
  controller.updateUserLocation, // Update location
  controller.updateSpaceship, // Update spaceship
  controller.createCompletion, // Create completion record
  controller.sendResponse, // Send final response with counts
);

// Get attempts for a challenge
router.get(
  "/:challenge_id/attempts",
  controller.validateChallengeId,
  controller.challengeExistence,
  controller.readAttemptsByChallengeId,
);

module.exports = router;
