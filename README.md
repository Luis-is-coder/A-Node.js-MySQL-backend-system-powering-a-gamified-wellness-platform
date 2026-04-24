# Gamified Wellness Challenge Backend
A Node.js + MySQL backend powering a gamified wellness platform with authentication, rewards, and progress tracking.

Users complete wellness challenges, earn points, unlock planets and spaceship skins, and progress through a space‑themed journey.


# Features
- User registration with strong‑password validation
- Default spaceship, skin, and starting location assigned on signup
- Create, update, delete wellness challenges (creator‑only)
- Complete challenges to earn points
- Automatic unlocking of planets and spaceship skins based on points
- Creation and updating of planets and spaceship skins
- User account update/delete with credential verification
- Challenge creation rewards for creator(10 points )
- Challenge point cannot exceed 50
- Clear validation and helpful feedback for all requests
- User’s current planet, skin, fuel, and level update automatically after each challenge completion according to user points
- Deleting a user removes all related spaceship, unlock data and relations
- Only the challenges the user created are left
- Only the user can delete his/her account
- User can see the dashboard
- User can create, edit and delete planets, challenges and spaceshipskins
- User can edit his/her account details: username, password 


# Setup & Commands
To create package.json with basic structure:
npm init -y 

To install dependencies:
npm install express nodemon mysql2 dotenv bcrypt jsonwebtoken

To run ininTables.js:
npm run initTables

To start server:
 npm run start

 To start with nodemon (auto-restart on file changes): 
 npm run dev

 # Folder Structure
 /public
  /css
  /images
  /js
  /html files
/src
  /config
    /createSchema.js
    /initTables.js
  /controllers
  /models
  /routes
  /services
/.env
/gitignore
/cheatsheet.txt
/index.js
/package.json
/README.md
