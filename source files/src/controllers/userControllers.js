const model = require("../models/userModels");
const bcryptMiddleware = require("../middlewares/bcryptMiddleware");

//UserId Validation
module.exports.validateUserId = (req, res, next) => {
  const user_id = req.params.user_id;

  if (isNaN(user_id) || user_id <= 0) {
    return res.status(400).send("Invalid user ID");
  }
  next();
};

module.exports.validateLoginReqBody = (req, res, next) => {
  if (req.body.username == undefined || req.body.password == undefined) {
    return res.status(400).send("Error: username/password is undefined");
  }

  next();
};

module.exports.checkUsernameOrEmailExist = (req, res, next) => {
  const data = {
    username: req.body.username,
    email: req.body.email,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error checkUsernameOrEmailExist:", error);
      res.status(500).json(error);
    } else {
      if (results.length > 0) {
        res.status(409).json({
          message: "Username or email already exists",
        });
      } else {
        next();
      }
    }
  };

  model.selectUserByUsernameOrEmail(data, callback);
};

//UserRequestBody Validation for user creation
module.exports.userRequestValidationForUserCreation = (req, res, next) => {
  if (
    req.body.username == undefined ||
    req.body.email == undefined ||
    req.body.password == undefined
  ) {
    return res.status(400).json({
      message:
        "Error: one of the user authentication data is undefined. There must be username, email and password.",
    }); //Check if required fields exist
  }

  if (req.body.username.length === 0) {
    return res.status(400).json({
      message: "Error: user name cannot be empty",
    }); // Validation: Check if username is not empty
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

//UserRequestBody Validation For updating
module.exports.userRequestValidationForUpdating = (req, res, next) => {
  if (
    req.body.username == undefined ||
    req.body.email == undefined ||
    req.body.password == undefined ||
    req.body.updated_username == undefined ||
    req.body.updated_email == undefined ||
    req.body.updated_password == undefined
  ) {
    return res.status(400).json({
      message:
        "Error: one of the user authentication data is undefined. There must be username, email and password to verify user credentials and updated username, email and password to update.",
    }); //Check if required fields exist
  }

  if (req.body.username.length === 0) {
    return res.status(400).json({
      message: "Error: username cannot be empty",
    }); // Validation: Check if email is not empty
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

  if (req.body.updated_username.length === 0) {
    return res.status(400).json({
      message: "Error: updated_username cannot be empty",
    }); // Validation: Check if updated_username is not empty
  }

  if (req.body.updated_email.length === 0) {
    return res.status(400).json({
      message: "Error: updated_email cannot be empty",
    }); // Validation: Check if updated_email is not empty
  }

  if (req.body.updated_password.length === 0) {
    return res.status(400).json({
      message: "Error: updated_password cannot be empty",
    }); // Validation: Check if updated_password is not empty
  }

  next();
};

//Username existence Validation
module.exports.userNameExistence = (req, res, next) => {
  // Define data object
  const data = {
    username: String(req.body.username),
  };

  const callback = (error, results, fields) => {
    // Handle error first
    if (error) {
      console.error("Error checking username:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    }

    // Check if username exists
    if (results.length > 0) {
      return res.status(409).json({
        message: "Error: username already exists",
      });
    } else {
      next();
    }
  };

  model.selectByUsername(data, callback);
};

//Username existence Validation For updating
module.exports.userNameExistenceForUpdate = (req, res, next) => {
  // Define data object
  const data = {
    username: String(req.body.username),
    updated_username: String(req.body.updated_username),
  };

  const callback = (error, results, fields) => {
    // Handle error first
    if (error) {
      console.error("Error checking username:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    }

    if (data.updated_username === data.username) {
      return next();
    } else if (results.length > 0) {
      return res.status(409).json({
        message: "Error: username already exists",
      });
    } else {
      next();
    }
  };

  model.selectByUsernameForUpdate(data, callback);
};

// Function to validate password: password must be at least 8 words-long, must use numbers and characters, a mix of capital letters and small letters and at least one special character
function isValidPassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber &&
    hasSpecialChar
  );
}

// Default password validation
module.exports.passwordValidation = (req, res, next) => {
  // Define data object
  const data = {
    password: String(req.body.password),
  };

  if (isValidPassword(data.password)) {
    next();
  } else {
    res.status(400).json({
      message:
        "To be a strong password, it must be at least 8 word-long using a mix of numbers and characters, a mix of capital letters and small letters and contain at least one special character. E.g. 'HelloWorld1!",
    });
  }
};

// Password Validation For updating
module.exports.passwordValidationForUpdating = (req, res, next) => {
  // Define data object
  const data = {
    updated_password: String(req.body.updated_password),
  };

  if (isValidPassword(data.updated_password)) {
    next();
  } else {
    res.status(400).json({
      message:
        "To be a strong password, it must be at least 8 word-long using a mix of numbers and characters, a mix of capital letters and small letters and contain at least one special character. E.g. 'HelloWorld1!",
    });
  }
};

// For user creation
module.exports.createUser = (req, res, next) => {
  // Build a data package
  const data = {
    username: String(req.body.username),
    email: String(req.body.email),
    password: res.locals.hash,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error createUser: ", error);
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
        res.status(500).send("Error: Failed to create new user");
      } else {
        // Save new user_id, name and point for next middleware
        res.locals.userId = results.insertId;
        res.locals.username = data.username;
        res.locals.points = 0;
        res.locals.no_of_planets_reached = 0;

        next();
      }
    }
  };
  model.singleInsert(data, callback);
};

// For creating current default location
module.exports.createCurrentLocation = (req, res, next) => {
  console.log("create current location");

  // Build a data package
  const data = {
    user_id: Number(res.locals.userId),
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error createCurrentLocation: ", error);
      res.status(500).json({
        message: "Internal Server Error",
        error: error,
      });
    } else {
      console.log("createCurrentLocation results: ", results);
      if (results.affectedRows !== 1) {
        res.status(500).send("Error: Failed to create current location");
      } else {
        next();
      }
    }
  };
  model.insertCurrentLocation(data, callback);
};

// Assigning default spaceship for each user
module.exports.assignDefaultSpaceship = (req, res, next) => {
  const spaceshipData = {
    user_id: Number(res.locals.userId),
    name: `Apolo ${String(res.locals.username)}`,
    fuel: Number(res.locals.points),
  };

  const callback = (error, results) => {
    if (error) {
      console.error("Error creating spaceship: ", error);
      return res.status(500).json({
        message: "User created but failed to assign spaceship",
        error: error,
      });
    }

    // Attach spaceship info to response
    res.locals.spaceship_id = results.insertId;
    res.locals.spaceship_level = 1;
    res.locals.spaceship_skin = "Iron Vortex";
    res.locals.spaceship_fuel = res.locals.points;

    next();
  };

  model.insertSpaceship(spaceshipData, callback);
};

// Reading all users
module.exports.readAllUsers = (req, res, next) => {
  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error readAllUsers:", error);
      res.status(500).json(error);
    } else res.status(200).json(results);
  };

  model.selectAll(callback);
};

// Get user by username
module.exports.findUserByUsername = (req, res, next) => {
  const data = {
    username: req.body.username,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error login:", error);
      res.status(500).json(error);
    } else {
      if (results.length == 0) {
        res.status(404).json({ message: "Login failed !!" });
      } else {
        res.locals.userId = results[0].user_id;
        res.locals.username = results[0].username;
        res.locals.hash = results[0].password;
        res.locals.message =
          "User " + res.locals.username + " logged in successfully.";
        next();
      }
    }
  };

  model.selectUserByUsername(data, callback);
};

// Read user by token
module.exports.readUserByToken = (req, res) => {
  const user_id = res.locals.userId;

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error readUserByToken:", error);
      res.status(500).json(error);
    } else {
      if (results.length === 0) {
        res.status(404).json({
          message: "User not found",
        });
      } else {
        res.status(200).json(results[0]);
      }
    }
  };

  model.selectUserById(user_id, callback);
};

//Get user by Id, Can also be middleware
module.exports.readUserById = (req, res, next) => {
  user_id: Number(req.params.user_id);

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error readUserById:", error);
      res.status(500).json(error);
    } else {
      if (results.length == 0) {
        res.status(404).json({
          message: "User not found",
        });
      } else {
        res.status(200).json(results[0]);
      }
    }
  };

  model.selectUserById(data, callback);
};

//User email and password verification middleware ( use login )
module.exports.userVerification = (req, res, next) => {
  const data = {
    user_id: Number(req.params.user_id),
    username: String(req.body.username),
    email: String(req.body.email),
    password: String(req.body.password),
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error userVerification:", error);
      res.status(500).json(error);
    } else {
      if (results.length === 0) {
        return res.status(404).json({
          message: "User not found",
        });
      } else if (results[0].username !== data.username) {
        return res.status(400).json({
          message: "Wrong username !!",
        });
      } else if (results[0].email !== data.email) {
        return res.status(400).json({
          message: "Wrong email !!",
        });
      } else if (results[0].password !== data.password) {
        return res.status(400).json({
          message: "Wrong password !!",
        });
      } else {
        next();
      }
    }
  };

  model.logIn(data, callback);
};

// User verification for account deletion
module.exports.userVerificationForDeletionAndUpdating = (req, res, next) => {
  const data = {
    user_id: Number(req.params.user_id),
    username: String(req.body.username),
    email: String(req.body.email),
    password: String(req.body.password),
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error userVerification:", error);
      res.status(500).json(error);
    } else {
      if (results.length === 0) {
        return res.status(404).json({
          message: "User not found",
        });
      } else if (results[0].username !== data.username) {
        return res.status(400).json({
          message: "Wrong username !!",
        });
      } else if (results[0].email !== data.email) {
        return res.status(400).json({
          message: "Wrong email !!",
        });
      } else {
        // SAME PATTERN AS LOGIN: Store hash and call bcryptMiddleware
        res.locals.hash = results[0].password;

        // Use bcryptMiddleware.comparePassword
        const bcryptMiddleware = require("../middlewares/bcryptMiddleware");
        bcryptMiddleware.comparePassword(req, res, next);
      }
    }
  };

  model.logIn(data, callback);
};

//Update spaceship name by user_id middleware
module.exports.updateSpaceShipNameByUserId = (req, res, next) => {
  const data = {
    user_id: Number(req.params.user_id),
    updated_username: `Apolo ${String(req.body.updated_username)}`,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error updateSpaceShipNameByUserId:", error);
      res.status(500).json(error);
    } else {
      if (results.affectedRows == 0) {
        res.status(404).json({
          message: "User not found",
        });
      } else {
        next();
      }
    }
  };

  model.updateSpaceshipName(data, callback);
};

//Update User by user_id
module.exports.updateUserByUserId = (req, res, next) => {
  const data = {
    user_id: Number(req.params.user_id),
    email: String(req.body.email),
    password: String(req.body.password),
    updated_username: String(req.body.updated_username),
    updated_email: String(req.body.updated_email),
    updated_password: res.locals.hash,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error updateUserByUserId:", error);
      res.status(500).json(error);
    } else {
      if (results.affectedRows == 0) {
        res.status(404).json({
          message: "User not found",
        });
      } else
        res.status(200).json({
          message: `User credentials with user_id: ${data.user_id} is updated.`,
        });
    }
  };

  model.updateUserById(data, callback);
};

// Delete user completion by user_id,
module.exports.deleteUserCompletionById = (req, res, next) => {
  const data = {
    user_id: Number(req.params.user_id),
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error deleteUserCompletionById:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    } else {
      next();
    }
  };

  model.deleteCompletionById(data, callback);
};

// Delete UserPlanetRel by user_id,
module.exports.deleteUserPlanetRelById = (req, res, next) => {
  const data = {
    user_id: Number(req.params.user_id),
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error deleteUserPlanetRelById:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    } else {
      next();
    }
  };

  model.deleteuserPlanetRelById(data, callback);
};

// Delete UserSkinRel by user_id,
module.exports.deleteUserSkinRelById = (req, res, next) => {
  const data = {
    user_id: Number(req.params.user_id),
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error deleteUserSkinRelById:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    } else {
      next();
    }
  };

  model.deleteuserSkinRelById(data, callback);
};

// Delete user by user_id, can also be used as a middleware
module.exports.deleteUserById = (req, res, next) => {
  const data = {
    user_id: Number(req.params.user_id),
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error deleteUserById:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    } else {
      // Check if any rows were affected
      if (results.affectedRows === 0) {
        res.status(404).json({
          message: `User with user_id:${data.user_id} not found`,
        });
      } else {
        next();
      }
    }
  };

  model.deleteById(data, callback);
};

// Delete current location by user_id,
module.exports.deleteCurrentLocationById = (req, res, next) => {
  const data = {
    user_id: Number(req.params.user_id),
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error deleteCurrentLocationById:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    } else {
      // Check if any rows were affected
      if (results.affectedRows === 0) {
        res.status(404).json({
          message: `Location with user_id:${data.user_id} not found`,
        });
      } else {
        next();
      }
    }
  };

  model.deleteLocationById(data, callback);
};

// Delete spaceship by user_id
module.exports.deleteSpaceshipByUserId = (req, res, next) => {
  const data = {
    user_id: Number(req.params.user_id),
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error deleteSpaceshipByUserId:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    } else {
      // Check if any rows were affected
      if (results.affectedRows === 0) {
        res.status(404).json({
          message: `Spaceship with user_id:${data.user_id} not found`,
        });
      } else {
        res.status(200).json({
          message:
            "User, Spaceship, location, completion and relations are deleted successfully",
        });
      }
    }
  };

  model.deleteSpaceShip(data, callback);
};

// Read user profile data by token
module.exports.readUserProfileByToken = (req, res) => {
  const user_id = res.locals.userId;

  console.log("Fetching profile for user_id:", user_id);

  if (!user_id) {
    return res.status(401).json({
      message: "Invalid token - user_id not found",
    });
  }

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error readUserProfileByToken:", error);
      res.status(500).json(error);
    } else {
      if (results.length === 0) {
        res.status(404).json({
          message: "User not found",
        });
      } else {
        const profile = results[0];

        // Calculate progress percentage for next level
        const progressPercentage = profile.next_level_points_required
          ? (
              (profile.cosmic_points / profile.next_level_points_required) *
              100
            ).toFixed(1)
          : 100;

        res.status(200).json({
          user_id: profile.user_id,
          username: profile.username,
          member_since: profile.member_since,
          current_planet: profile.current_planet || "Earth",
          spaceship_level: profile.spaceship_level || 1,
          current_skin_name:
            profile.current_skin_name || profile.spaceship_skin,
          current_skin_description:
            profile.current_skin_description || "Default skin",
          next_level: (profile.spaceship_level || 1) + 1,
          next_skin_name: profile.next_skin_name || "Max Level",
          next_skin_description:
            profile.next_skin_description || "You have reached maximum level",
          next_level_points_required:
            profile.next_level_points_required || profile.cosmic_points,
          progress_percentage: progressPercentage,
          cosmic_points: profile.cosmic_points || 0,
          challenges_completed: profile.challenges_completed || 0,
          skins_acquired: profile.skins_acquired || 0,
          no_of_planets_reached: profile.no_of_planets_reached || 0,
          challenges_created: profile.challenges_created || 0,
          planets_created: profile.planets_created || 0,
          skins_created: profile.skins_created,
        });
      }
    }
  };

  model.selectUserProfileById(user_id, callback);
};

// Get total users count
module.exports.readTotalUsers = (req, res) => {
  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error readTotalUsers:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    res.status(200).json({
      total_users: results[0].total_users,
    });
  };

  model.getTotalUsers(callback);
};

// Get top 3 users
module.exports.readTopUsers = (req, res) => {
  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error readTopUsers:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    res.status(200).json({
      leaderboard: results,
    });
  };

  model.getTopUsers(callback);
};
