const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// Placeholder database or variables to store game-related information
let games = {};
let players = {};

const fs = require('fs');

// Read existing user data from users.json
let users = {};
fs.readFile('users.json', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
  } else {
    users = JSON.parse(data);
  }
});

// Route for user registration
app.post('/register', (req, res) => {
  const { nick, password } = req.body;

  if (users[nick] && users[nick].password !== password) {
    res.status(400).json({ error: "User registered with a different password" });
  } else {
    users[nick] = { password };

    // Update users.json with new user data
    fs.writeFile('users.json', JSON.stringify(users), (err) => {
      if (err) {
        res.status(500).json({ error: "Failed to write user data" });
      } else {
        res.status(200).json({});
      }
    }); 
  }
});

// Function to generate a random game ID
const generateGameID = () => {
  const length = 8;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Route for joining a game
app.post('/join', (req, res) => {
  const { group, nick, password, size } = req.body;

  // Validate user credentials before allowing join
  if (!users[nick] || users[nick].password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Check if the group already has a game
  if (!games[group]) {
    // If no game exists for the group, create a new game with the provided size
    games[group] = {
      gameID: generateGameID(), // Generate a unique game ID
      size: size,
      players: [{ nick, color: 'white' }] // Assuming first player is always white
    };

    players[nick] = { group, gameID: games[group].gameID };
  } else {
    // If a game exists for the group, add the player to that game
    const game = games[group];
    if (game.players.length >= 2) {
      return res.status(400).json({ error: 'Game is full' });
    }

    // Add the player to the existing game
    game.players.push({ nick, color: 'black' }); // Assuming second player is always black
    players[nick] = { group, gameID: game.gameID };
  }

  // Return relevant game data or game ID
  res.status(200).json({ gameID: games[group].gameID /* or other relevant data */ });
});

// Route for leaving a game
app.post('/leave', (req, res) => {
  const { nick, password, game } = req.body;

  // Validate user credentials before leaving
  if (!users[nick] || users[nick].password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Check if the player is part of any game
  if (!players[nick] || players[nick].gameID !== game) {
    return res.status(400).json({ error: 'Player not in a game' });
  }

  const group = players[nick].group;

  // Remove player from the game
  const gameIndex = games[group].players.findIndex(player => player.nick === nick);
  games[group].players.splice(gameIndex, 1);
  delete players[nick];

  res.status(200).json({ message: 'Player left the game successfully' });
});



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
