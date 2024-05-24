// index.js
const express = require('express');
const cors = require('cors');
const { BracketsManager } = require('brackets-manager');
const { Database } = require('brackets-json-db');

const app = express();
app.use(cors());
app.use(express.json());

const db = new Database(':memory:'); // Use an in-memory database for simplicity
const manager = new BracketsManager(db);

// Create a tournament
app.post('/tournament', async (req, res) => {
  const { name, type, participants } = req.body;
  const tournament = await manager.create({
    name,
    type,
    participants
  });
  res.status(201).json(tournament);
});

// Get tournament data
app.get('/tournament/:id', async (req, res) => {
  const { id } = req.params;
  const tournament = await manager.get.tournament(id);
  res.json(tournament);
});

// Update match result
app.post('/match/:id/result', async (req, res) => {
  const { id } = req.params;
  const { winnerId } = req.body;
  const result = await manager.update.match({
    id,
    opponent1: { result: id === winnerId ? 'win' : 'loss' },
    opponent2: { result: id === winnerId ? 'loss' : 'win' }
  });
  res.json(result);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
