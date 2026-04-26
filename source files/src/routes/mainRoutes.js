const express = require("express");

const router = express.Router();
const userController = require("../controllers/userControllers");
const bcryptMiddleware = require("../middlewares/bcryptMiddleware");
const jwtMiddleware = require("../middlewares/jwtMiddleware");

const userRoutes = require("./userRoutes");
const userCompletionRoutes = require("./user_completionRoutes");
const wellnessChallengeRoutes = require("./wellness_challengeRoutes");
const planetsRoutes = require("./planetsRoutes");
const spaceShipSkinsRoutes = require("./spaceShipSkinsRoutes");

//========================================
// Routes Config
//========================================

router.post(
  "/register",
  userController.userRequestValidationForUserCreation, // Validate all required info are in request body
  userController.checkUsernameOrEmailExist, // Check if the username or email already existed or not
  userController.passwordValidation, // Check if password is strong or not
  bcryptMiddleware.hashPassword,
  userController.createUser, //Insert User
  userController.createCurrentLocation, // Create current Location
  userController.assignDefaultSpaceship, // inserts spaceship
  jwtMiddleware.generateToken,
  jwtMiddleware.sendToken,
);

// Login User
router.post(
  "/login",
  userController.validateLoginReqBody,
  userController.findUserByUsername,
  bcryptMiddleware.comparePassword,
  jwtMiddleware.generateToken,
  jwtMiddleware.sendToken,
);

router.use("/users", userRoutes);
router.use("/userCompletion", userCompletionRoutes);
router.use("/challenges", wellnessChallengeRoutes);
router.use("/planets", planetsRoutes);
router.use("/spaceShipSkins", spaceShipSkinsRoutes);

// Test that the master route is working
router.get("/main", (req, res) => {
  res.status(200).send("CA2 main route is alive!");
});

module.exports = router;
