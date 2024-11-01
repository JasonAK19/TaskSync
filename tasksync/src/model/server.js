const express = require('express');
const deepEmailValidator = require('deep-email-validator');
const nodemailer = require('nodemailer');
const crypto = require('crypto')
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const connectToDatabase = require('./mongoConnection');
const { addTask, getTasks, editTask } = require('./taskModel');
const { createNotification, getNotifications, markAsRead } = require('./notificationModel');
const { sendFriendRequest, getFriendRequests, updateFriendRequestStatus } = require('./friendRequestModel');
const { ObjectId } = require('mongodb');

const app = express();
const port = 3000;

app.use(bodyParser.json());

let db;

// nodemailer
const transporter = nodemailer.createTransport({
  host: 'Gmail', 
  port: 587, // or 465 for SSL
  secure: false, // true for 465
  auth: {
    user: 'tsync99@gmail.com',
    pass: 'derpherp90'
  }
});
// Connect to MongoDB
connectToDatabase().then(database => {
  db = database;
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
});


// validate email function
async function isEmailValid(email) {
  return deepEmailValidator.validate(email);
}

// Register a new user
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const { valid, reason, validators } = await isEmailValid(email);
    if (!valid) {
      return res.status(400).json({ error: `Invalid email: ${reason}. ${validators[reason].reason}` });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const result = await db.collection('User').insertOne({
      email,
      username,
      password: hashedPassword,
      registrationDate: new Date(),
      friends: [],
      groups: [],
      verificationToken,
      isVerified: false
    });

    const verificationLink = `http://localhost:${port}/verify-email?token=${verificationToken}`;
    await transporter.sendMail({
      from: 'tsync99@gmail.com',
      to: email,
      subject: 'Task Sync Verification',
      html: `<p>Please verify your email by clicking on the following link: <a href="${verificationLink}">Verify Email</a></p>`
    }, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });



    res.status(201).json({ _id: result.insertedId });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Verify email
app.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    const result = await db.collection('User').findOneAndUpdate(
      { verificationToken: token },
      { $set: { isVerified: true }, $unset: { verificationToken: "" } }
    );

    if (!result.value) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify email' });
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
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, ...userInfo } = user;
    res.status(200).json(userInfo);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user information' });
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


// Add a new notification
app.post('/notifications', async (req, res) => {
  try {
    const { userId, message } = req.body;
    const notification = {
      userId: new ObjectId(userId),
      message,
      read: false,
      date: new Date()
    };
    const notificationId = await createNotification(db, notification);
    res.status(201).json({ notificationId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Get notifications for a user
app.get('/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await getNotifications(db, userId);
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});


// Mark notification as read
app.put('/notifications/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;
    await markAsRead(db, notificationId);
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Send a friend request
app.post('/friend-requests', async (req, res) => {
  try {
    const { fromUserId, toUsername } = req.body;
    const requestId = await sendFriendRequest(db, fromUserId, toUsername);
    res.status(201).json({ requestId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get friend requests for a user
app.get('/friend-requests/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const requests = await getFriendRequests(db, userId);
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch friend requests' });
  }
});

// Update friend request status
app.put('/friend-requests/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    await updateFriendRequestStatus(db, requestId, status);
    res.status(200).json({ message: 'Friend request status updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update friend request status' });
  }
});

module.exports = app;