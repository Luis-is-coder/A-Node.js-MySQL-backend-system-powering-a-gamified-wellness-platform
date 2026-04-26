const pool = require("../services/db");

const SQLSTATEMENT = `

DROP TABLE IF EXISTS UserLocation;


DROP TABLE IF EXISTS UserPlanetsRel;

DROP TABLE IF EXISTS UserSkinsRel;

DROP TABLE IF EXISTS Spaceships;

DROP TABLE IF EXISTS User;


DROP TABLE IF EXISTS UserCompletion;

DROP TABLE IF EXISTS spaceShipSkins;

DROP TABLE IF EXISTS Planets;

DROP TABLE IF EXISTS WellnessChallenge;

CREATE TABLE UserLocation (
user_id INT NOT NULL,
current_planet VARCHAR(255) DEFAULT 'Earth',
no_of_planets_reached INT DEFAULT 0
);



CREATE TABLE UserPlanetsRel (
  user_id INT NOT NULL,
  planet_id INT NOT NULL,
  acquired_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE UserSkinsRel (
user_id INT NOT NULL,
skin_id INT NOT NULL,
acquired_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE User (
user_id INT AUTO_INCREMENT PRIMARY KEY,
username VARCHAR(255) NOT NULL,
points INT DEFAULT 0,
email TEXT NOT NULL,
password TEXT NOT NULL,
tiktok TEXT NOT NULL,
created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Spaceships (
spaceship_id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT NOT NULL UNIQUE,  
name VARCHAR(255),
level INT DEFAULT 1,
skin VARCHAR(255) DEFAULT 'Iron Vortex',
fuel INT NOT NULL 
);


CREATE TABLE UserCompletion (
completion_id INT AUTO_INCREMENT PRIMARY KEY,
challenge_id INT NOT NULL,
user_id INT NOT NULL,
details TEXT,
completed_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE spaceShipSkins (
skin_id INT AUTO_INCREMENT PRIMARY KEY,
skin_name VARCHAR(255) NOT NULL,
points_required INT NOT NULL,
description TEXT NOT NULL,
creator_id INT DEFAULT NULL,
created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Planets(
planet_id INT AUTO_INCREMENT PRIMARY KEY,
planet_name VARCHAR(255) NOT NULL,
distance_from_earth INT NOT NULL,
description TEXT NOT NULL,
creator_id INT DEFAULT NULL,
created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE WellnessChallenge (
challenge_id INT AUTO_INCREMENT PRIMARY KEY,
creator_id INT NOT NULL,
description TEXT NOT NULL,
points INT NOT NULL
);
`;

pool.query(SQLSTATEMENT, (error, results, fields) => {
  if (error) {
    console.error("Error creating tables:", error);
  } else {
    console.log("Tables created successfully");
  }
  process.exit();
});
