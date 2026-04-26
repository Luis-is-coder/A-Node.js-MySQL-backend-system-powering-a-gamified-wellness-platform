const express = require("express");
const router = express.Router();
const challengeController = require("../controllers/wellness_challengeControllers");
const jwtMiddleware = require("../middlewares/jwtMiddleware");

// Get challenges with user's completion status (authenticated)
router.get(
  "/user/status",
  jwtMiddleware.verifyToken,
  challengeController.readChallengesWithUserStatus,
);

// Get challenges created by current user
router.get(
  "/user/created",
  jwtMiddleware.verifyToken,
  challengeController.readUserCreatedChallenges,
);

// Create new challenge
router.post(
  "/",
  jwtMiddleware.verifyToken,
  challengeController.challengeRequestValidation, // Check if essential fields are in request body
  challengeController.challengeExistence, // Check if challenge already exists
  challengeController.checkChallengePoint, // Check the challenge's rewarding point doesn't exceed 50
  challengeController.readUserPointByUserId, // Get user's current point
  challengeController.updatePointByUserId, // User's point is increased by 10 for creating one challenge
  challengeController.createChallenge, //Insert Challenge
);

// Update challenge ( Only creator can update )
router.put(
  "/:challenge_id",
  jwtMiddleware.verifyToken,
  challengeController.validateChallengeId, // Check whether challengeId is valid or not
  challengeController.checkCreatorByUserId, // Check whether the creator or not
  challengeController.challengeRequestValidation,
  challengeController.checkChallengePoint,
  challengeController.updateChallengeByChallengeId, // Update challenge
);

// Delete challenge ( Only creator can delete )
router.delete(
  "/:challenge_id",
  jwtMiddleware.verifyToken,
  challengeController.validateChallengeId,
  challengeController.checkCreatorByUserId, // Only the creator can delete
  challengeController.deleteChallengeById,
);

// Get all challenges
router.get("/", challengeController.readAllChallenges);

// Get challenge by challenge_id
router.get(
  "/:challenge_id",
  challengeController.validateChallengeId,
  challengeController.readChallengeById,
);

module.exports = router;
