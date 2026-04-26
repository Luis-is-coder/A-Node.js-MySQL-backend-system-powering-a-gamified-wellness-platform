const model = require("../models/wellness_challengeModels");

//challengeId Validation
module.exports.validateChallengeId = (req, res, next) => {
  const challenge_id = req.params.challenge_id;

  if (isNaN(challenge_id) || challenge_id <= 0) {
    return res.status(400).send("Invalid challenge ID");
  }
  next();
};

//Default UserRequestBody Validation
module.exports.defaultUserRequestValidation = (req, res, next) => {
  if (
    req.body.user_id == undefined ||
    req.body.email == undefined ||
    req.body.password == undefined
  ) {
    return res.status(400).json({
      message:
        "Error: one of the user authentication data is undefined. There must be user_id to check whether the creator of challenge and email and password to verify user credentials.",
    }); //Check if required fields exist
  }

  if (typeof req.body.user_id !== "number" || isNaN(req.body.user_id)) {
    return res.status(400).json({
      message: "Error: user_id cannot be empty and must be valid number",
    }); // Validation: Check if user_id is not empty
  }

  if (req.body.email.length === 0) {
    return res.status(400).json({
      message: "Error: email cannot be empty",
    }); // Validation: Check if email is not empty
  }

  if (req.body.password.length === 0) {
    return res.status(400).json({
      message: "Error: password cannot be empty",
    }); // Validation: Check if password is not empty
  }

  next();
};

// Check if user is creator (middleware) - JWT version
module.exports.checkCreatorByUserId = (req, res, next) => {
  const data = {
    challenge_id: Number(req.params.challenge_id),
    user_id: res.locals.userId,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error checkCreatorByUserId:", error);
      return res.status(500).json(error);
    } else if (results.length === 0) {
      return res.status(404).json({
        message: `Challenge with challenge_id:${data.challenge_id} not found`,
      });
    } else if (results[0].creator_id !== data.user_id) {
      return res.status(403).json({
        message: "Only the creator can modify this challenge.",
      });
    } else {
      next();
    }
  };

  model.checkCreator(data, callback);
};

//User email and password verification middleware ( use login )
module.exports.userVerification = (req, res, next) => {
  const data = {
    user_id: Number(req.body.user_id),
    email: String(req.body.email),
    password: String(req.body.password),
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error userVerification:", error);
      res.status(500).json(error);
    } else {
      if (results[0].email !== data.email) {
        res.status(400).json({
          message: "Wrong email !!",
        });
      } else if (results[0].password !== data.password) {
        res.status(400).json({
          message: "Wrong password !!",
        });
      } else {
        next();
      }
    }
  };

  model.logIn(data, callback);
};

// Simplified request validation for JWT
module.exports.challengeRequestValidation = (req, res, next) => {
  if (req.body.description == undefined || req.body.points == undefined) {
    return res.status(400).json({
      message: "Error: description and points are required",
    });
  }

  if (req.body.description.length === 0) {
    return res.status(400).json({
      message: "Error: description cannot be empty",
    });
  }

  if (
    typeof req.body.points !== "number" ||
    isNaN(req.body.points) ||
    req.body.points <= 0
  ) {
    return res.status(400).json({
      message: "Error: points must be a valid number greater than 0",
    });
  }

  next();
};

// Check challenge existence
module.exports.challengeExistence = (req, res, next) => {
  // Define data object
  const data = {
    description: String(req.body.description),
  };

  const callback = (error, results, fields) => {
    // Handle error first
    if (error) {
      console.error("Error checking challenge:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    }

    // Check if challenge exists
    if (results.length > 0) {
      return res.status(409).json({
        message: "Error: challenge already exists",
      });
    } else {
      next();
    }
  };

  model.checkChallengeExistence(data, callback);
};

// Check challenge_point is not over 50
module.exports.checkChallengePoint = (req, res, next) => {
  const challenge_point = Number(req.body.points);

  if (challenge_point > 50) {
    return res.status(400).json({
      message: "Rewarding points cannot exceed 50.",
    });
  } else {
    next();
  }
};

// Update readUserPointByUserId for JWT
module.exports.readUserPointByUserId = (req, res, next) => {
  const user_id = res.locals.userId;

  if (!user_id) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const data = { user_id: user_id };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error readUserPointByUserId:", error);
      res.status(500).json(error);
    } else {
      if (results.length == 0) {
        res.status(404).json({
          message: "User not found",
        });
      } else {
        res.locals.currentPoints = results[0].points;
        next();
      }
    }
  };

  model.selectPointByuserId(data, callback);
};

// Update updatePointByUserId for JWT
module.exports.updatePointByUserId = (req, res, next) => {
  const user_id = res.locals.userId;

  if (res.locals.currentPoints === undefined) {
    return res.status(500).json({
      message: "Missing points data",
    });
  }

  const POINTS_FOR_CHALLENGE_CREATION = 10;

  const data = {
    user_id: user_id,
    points: POINTS_FOR_CHALLENGE_CREATION + Number(res.locals.currentPoints),
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error updatePointByUserId:", error);
      res.status(500).json(error);
    } else {
      if (results.affectedRows == 0) {
        res.status(404).json({
          message: "User not found",
        });
      } else {
        res.locals.updatedPoints = data.points;
        res.locals.pointsAwarded = POINTS_FOR_CHALLENGE_CREATION;
        next();
      }
    }
  };

  model.updatePointByuserId(data, callback);
};

// Update createChallenge to use JWT
module.exports.createChallenge = (req, res) => {
  const user_id = res.locals.userId;

  if (!user_id) {
    return res.status(401).json({
      message: "Authentication required to create challenges",
    });
  }

  const data = {
    user_id: user_id,
    description: String(req.body.description),
    points: Number(req.body.points),
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error createChallenge: ", error);
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
        res.status(500).send("Error: Failed to create new challenge");
      } else {
        res.status(201).json({
          challenge_id: results.insertId,
          description: data.description,
          creator_id: data.user_id,
          points: data.points,
          creator_award: res.locals.pointsAwarded || 10,
          current_user_points:
            res.locals.updatedPoints || res.locals.currentPoints,
        });
      }
    }
  };

  model.singleInsert(data, callback);
};

// Reading all wellness challenges
module.exports.readAllChallenges = (req, res, next) => {
  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error readAllUsers:", error);
      res.status(500).json(error);
    } else res.status(200).json(results);
  };

  model.selectAll(callback);
};

//Get challenge by challenge_id
module.exports.readChallengeById = (req, res, next) => {
  const data = {
    challenge_id: Number(req.params.challenge_id),
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error readChallengeById:", error);
      res.status(500).json(error);
    } else {
      if (results.length == 0) {
        res.status(404).json({
          message: "Challenge not found",
        });
      } else {
        res.status(200).json(results[0]);
      }
    }
  };

  model.selectById(data, callback);
};

// Update deleteChallengeById for JWT
module.exports.deleteChallengeById = (req, res) => {
  const data = {
    challenge_id: Number(req.params.challenge_id),
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error deleteChallengeById:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    } else {
      if (results.affectedRows === 0) {
        return res.status(404).json({
          message: `Challenge with challenge_id:${data.challenge_id} not found`,
        });
      } else {
        res.status(204).send();
      }
    }
  };

  model.deleteById(data, callback);
};

// Update challenge - JWT version
module.exports.updateChallengeByChallengeId = (req, res) => {
  const data = {
    challenge_id: Number(req.params.challenge_id),
    creator_id: res.locals.userId,
    description: String(req.body.description),
    points: Number(req.body.points),
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error updateChallengeByChallengeId:", error);
      res.status(500).json(error);
    } else {
      if (results.affectedRows == 0) {
        res.status(404).json({
          message: "Challenge not found",
        });
      } else {
        res.status(200).json({
          message: `Challenge with challenge_id ${data.challenge_id} is updated`,
          challenge_id: data.challenge_id,
          creator_id: data.creator_id,
          description: data.description,
          points: data.points,
        });
      }
    }
  };

  model.updateChallengeById(data, callback);
};

// Get all challenges with user's completion status
module.exports.readChallengesWithUserStatus = (req, res) => {
  const user_id = res.locals.userId;

  if (!user_id) {
    return res.status(401).json({
      message: "Invalid token - user_id not found",
    });
  }

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error readChallengesWithUserStatus:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    }

    // Separate challenges into completed and uncompleted
    const completedChallenges = results.filter(
      (c) => c.user_completed !== null,
    );
    const uncompletedChallenges = results.filter(
      (c) => c.user_completed === null,
    );

    res.status(200).json({
      all_challenges: results,
      completed_challenges: completedChallenges,
      uncompleted_challenges: uncompletedChallenges,
      total_challenges: results.length,
      challenges_completed_count: completedChallenges.length,
    });
  };

  model.getChallengesWithUserStatus(user_id, callback);
};

// Get challenges created by current user
module.exports.readUserCreatedChallenges = (req, res) => {
  const creator_id = res.locals.userId;

  if (!creator_id) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error readUserCreatedChallenges:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    }

    res.status(200).json({
      created_challenges: results,
      total_created: results.length,
    });
  };

  model.selectByCreatorId(creator_id, callback);
};
