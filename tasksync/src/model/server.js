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
    const result = await db.collection('User').insertOne({
      email,
      username,
      password: hashedPassword,
      registrationDate: new Date()
    });
    res.status(201).json({ _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login a user
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.collection('User').findOne({ username });

    if (!user) {
      console.log('User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('Invalid credentials');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { password: _, ...userInfo } = user;

    res.status(200).json({ message: 'Login successful', user: userInfo });
  } catch (err) {
    res.status(500).json({ error: 'Failed to login user' });
  }
});

// Get user information
app.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await db.collection('User').findOne({ username }, { projection: { _id: 0, username: 1, email: 1 } });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).send('User not found');
    }
  } catch (err) {
    res.status(500).send('Error fetching user information');
  }
});

module.exports = app;