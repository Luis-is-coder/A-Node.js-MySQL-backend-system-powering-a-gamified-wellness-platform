# Gamified Wellness Challenge Platform
CosmicWellness is a small gamified wellness website I built using HTML, JavaScript, and a MySQL database.

Users complete wellness challenges, earn points, unlock planets and spaceship skins, and progress through a space‑themed journey.

## Features

### User Authentication
- Only logged‑in users can access challenges, planets, and spaceship skins.
- Non‑logged‑in users can only see the home page and the leaderboard podium.
- If a user tries to access a locked page, they will be asked to sign in.

### Points & Progression System
- Users earn points by completing and creating challenges.
- Points don’t directly unlock items. Instead, the total points decide:
  - The user’s current spaceship skin
  - The planet status they are exploring

### Create & Explore
- Users can create their own:
  - Challenges  
  - Planets  
  - Spaceship skins  
- Anything created will appear in:
  - **Created** section (their own items)
  - **Available** section (for all users)

### Profile Dashboard
- Users can track:
  - Completed challenges
  - Not completed challenges
  - Created challenges
- Same tracking applies to planets and spaceship skins.
- Leaderboard shows total points and ranking.

### Account Management
- Users can update their name and password.
- Users can delete their account after verifying their identity.
- The total number of explorers on the home page updates automatically whenever an account is created or deleted.

## Tech Stack
- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Node.js  
- **Database:** MySQL  

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

ERD Diagram

<img width="2041" height="1043" alt="BED CA2 ERD (2)" src="https://github.com/user-attachments/assets/a3102c81-ecb2-49a8-9634-6e5210c45241" />
