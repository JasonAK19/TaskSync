const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const connectToDatabase = require('./mongoConnection');
const { addTask, getTasks, editTask } = require('./taskModel');
const { ObjectId } = require('mongodb');

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
      registrationDate: new Date(),
      friends: [],
      groups: []
      
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

// Add a new task
app.post('/tasks', async (req, res) => {
  const { username, task } = req.body;
  try {
    const taskId = await addTask(username, task);
    res.status(201).json({ taskId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add task' });
  }
});

//Edit an existing task
app.put('/tasks/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const updatedTask = req.body;

  try {
    const result = await editTask(new ObjectId(taskId), updatedTask);
    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'Task updated successfully' });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Get tasks for a user
app.get('/tasks/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const tasks = await getTasks(username);
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Delete an existing task
app.delete('/tasks/:taskId', async (req, res) => {
  const { taskId } = req.params;

  try {
    const result = await db.collection('tasks').deleteOne({ _id: new ObjectId(taskId) });
    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Task deleted successfully' });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});


// Fetch user groups
app.get('/api/user/:username/groups', async (req, res) => {
  try {
    const user = await db.collection('User').findOne({ username: req.params.username });
    const groups = await db.collection('Group').find({ members: user._id }).toArray();
    res.json({ groups });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching groups' });
  }
});

// Add a new group
app.post('/api/user/:username/groups', async (req, res) => {
  try {
    const user = await db.collection('User').findOne({ username: req.params.username });
    const newGroup = {
      name: req.body.name,
      members: [user._id]
    };
    const result = await db.collection('Group').insertOne(newGroup);
    res.json({ group: newGroup });
  } catch (error) {
    res.status(500).json({ error: 'Error adding group' });
  }
});


module.exports = app;