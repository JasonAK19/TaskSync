const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const connectToDatabase = require('./mongoConnection');

const app = express();
const port = 3000;

app.use(bodyParser.json());

let db;

// Connect to MongoDB
connectToDatabase().then(database => {
  db = database;
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
});

// Register a new user
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.collection('users').insertOne({
      username,
      email,
      password: hashedPassword,
      created_at: new Date()
    });
    res.status(201).json({ _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register user' });
  }
});