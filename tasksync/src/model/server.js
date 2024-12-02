const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors'); // Import the CORS middleware
const deepEmailValidator = require('deep-email-validator');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const connectToDatabase = require('./mongoConnection');
const { addTask, getTasks, editTask } = require('./taskModel');
const { ObjectId } = require('mongodb');
const { create } = require('domain');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:3002'], // Allow requests from these origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
    credentials: true
  }
});

const port = process.env.PORT || 3000;


app.use(cors({ origin: ['http://localhost:3001', 'http://localhost:3002'], credentials: true })); // Use the CORS middleware
app.use(bodyParser.json());

let db;

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('New client connected');
  
  ws.on('message', (message) => {
    // Parse the buffer to string and then to JSON
    const messageString = message.toString();
    console.log('Received message:', messageString);
    
    try {
      const parsedMessage = JSON.parse(messageString);
      // Add a unique message ID
      parsedMessage.id = Date.now() + Math.random().toString(36).substring(7);
      
      // Broadcast the message to all clients except the sender
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(parsedMessage));
        }
      });
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  // Send welcome message
  ws.send(JSON.stringify({ 
    id: 'welcome-' + Date.now(),
    sender: 'Server', 
    text: 'Welcome to the group chat!',
    timestamp: new Date().toISOString()
  }));
});

// Connect to MongoDB
connectToDatabase().then(database => {
  db = database;
  server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
});

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// validate email function with timeout
async function isEmailValid(email) {
  const timeout = 5000; // 5 seconds timeout
  return Promise.race([
    deepEmailValidator.validate(email),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Validation timeout')), timeout))
  ]);
}

// Register a new user
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Remove email validation
    // const { valid, reason, validators } = await isEmailValid(email).catch(err => {
    //   if (err.message === 'Validation timeout') {
    //     return { valid: false, reason: 'timeout', validators: { timeout: { reason: 'Email validation timed out' } } };
    //   }
    //   throw err;
    // });

    // if (!valid) {
    //   return res.status(400).json({ error: `Invalid email: ${reason}. ${validators[reason].reason}` });
    // }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.collection('User').insertOne({
      email,
      username,
      password: hashedPassword,
      registrationDate: new Date(),
      friends: [],
      groups: [],
      isVerified: true
    });

    res.status(201).json({ _id: result.insertedId });
  } catch (err) {
    console.error('Error registering user:', err);
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

  //validation for task title
  if (!task.title || task.title.trim() === '') {
    return res.status(400).json({ error: 'Invalid task title.' });
  }

  try {
    const taskId = await addTask(username, task);
    res.status(201).json({ taskId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add task' });
  }
});

// Edit an existing task
app.put('/tasks/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const updatedTask = req.body;
  const { username } = req.body; // Add username to request body

  try {
    // Check if user is the task creator
    const task = await db.collection('tasks').findOne({ 
      _id: new ObjectId(taskId),
      username: username
    });

    if (!task) {
      return res.status(403).json({ error: 'Not authorized to edit this task' });
    }

    const result = await editTask(new ObjectId(taskId), updatedTask);
    // ... rest of the handler
  } catch (err) {
    // ... error handling
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
  const { username } = req.query; // Ensure username is passed as a query parameter

  try {
    // Check if the task exists and is created by the user
    const task = await db.collection('tasks').findOne({ _id: new ObjectId(taskId), username: username });

    if (!task) {
      return res.status(404).json({ error: 'Task not found or not authorized to delete' });
    }

    // Delete the task
    const result = await db.collection('tasks').deleteOne({ _id: new ObjectId(taskId) });

    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Task deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete task' });
    }
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});
// Create a new group
app.post('/api/groups', async (req, res) => {
  try {
    const { name, creator, members } = req.body;
    
    const newGroup = {
      name,
      creator,
      members,
      tasks: [],
      events: [],
      createdAt: new Date()
    };

    const result = await db.collection('Group').insertOne(newGroup);
    
    // Update all members' user documents to include this group
    await db.collection('User').updateMany(
      { username: { $in: members } },
      { $push: { groups: result.insertedId } }
    );

    res.status(201).json({ 
      groupId: result.insertedId,
      group: newGroup 
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Fetch groups for a user
app.get('/api/user/:username/groups', async (req, res) => {
  try {
    const { username } = req.params;
    console.log('Fetching groups for user:', username); // Log the username

    const user = await db.collection('User').findOne({ username });
    console.log('User found:', user); // Log the user

    if (!user) {
      console.log('User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    const groups = await db.collection('Group').find({ members: { $in: [username] } }).toArray();
    console.log('Fetched groups:', groups); // Log the fetched groups

    res.status(200).json({ groups });
  } catch (err) {
    console.error('Error fetching groups:', err);
    res.status(500).json({ error: 'Failed to fetch groups' });
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

// send friend request
app.post('/friend-requests', async (req, res) => {
  const { fromUsername, toUsername } = req.body;
  
  try {
    // Input validation
    if (!fromUsername || !toUsername) {
      console.log('Missing required fields:', { fromUsername, toUsername });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find sender user
    const fromUser = await db.collection('User').findOne({ username: fromUsername });
    if (!fromUser) {
      console.log('Sender user not found:', fromUsername);
      return res.status(404).json({ error: 'Sender not found' });
    }

    // Find recipient user
    const toUser = await db.collection('User').findOne({ username: toUsername });
    if (!toUser) {
      console.log('Target user not found:', toUsername);
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Check if request already exists
    const existingRequest = await db.collection('FriendRequest').findOne({
      fromUserId: fromUser._id,
      toUserId: toUser._id,
      status: 'pending'
    });

    if (existingRequest) {
      console.log('Friend request already exists');
      return res.status(400).json({ error: 'Friend request already exists' });
    }

    // Create friend request
    const friendRequest = {
      fromUserId: fromUser._id,
      toUserId: toUser._id,
      status: 'pending',
      createdAt: new Date()
    };

    const requestResult = await db.collection('FriendRequest').insertOne(friendRequest);

    // Create notification
    const notification = {
      userId: toUser._id,
      type: 'friendRequest',
      requestId: requestResult.insertedId,
      fromUsername: fromUser.username,
      message: `${fromUser.username} sent you a friend request`,
      read: false,
      createdAt: new Date()
    };

    await db.collection('Notification').insertOne(notification);

    // Emit notification
    io.to(toUser._id.toString()).emit('newNotification', notification);

    res.status(201).json({ 
      message: 'Friend request sent successfully',
      requestId: requestResult.insertedId 
    });

  } catch (err) {
    console.error('Error in friend request:', err);
    res.status(500).json({ error: 'Failed to send friend request', details: err.message });
  }
});

// Get friend requests for a user
app.get('/friend-requests/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const friendRequests = await db.collection('FriendRequest').find({ toUserId: new ObjectId(userId) }).toArray();
    res.status(200).json(friendRequests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch friend requests' });
  }
});

// Update friend request status
app.put('/friend-requests/:requestId', async (req, res) => {
  const { requestId } = req.params;
  const { status } = req.body;

  try {
    const result = await db.collection('FriendRequest').updateOne(
      { _id: new ObjectId(requestId) },
      { $set: { status } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    // If accepted, add users as friends
    if (status === 'accepted') {
      const request = await db.collection('FriendRequest').findOne({ 
        _id: new ObjectId(requestId) 
      });
      
      // Add each user to the other's friends list
      await db.collection('User').updateOne(
        { _id: request.toUserId },
        { $addToSet: { friends: request.fromUserId } }
      );
      
      await db.collection('User').updateOne(
        { _id: request.fromUserId },
        { $addToSet: { friends: request.toUserId } }
      );
    }

    res.status(200).json({ message: 'Friend request updated successfully' });
  } catch (err) {
    console.error('Error updating friend request:', err);
    res.status(500).json({ error: 'Failed to update friend request' });
  }
});

// Get friends for a user
app.get('/friends/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const user = await db.collection('User').findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const friends = await db.collection('User').find({ _id: { $in: user.friends } }).toArray();
    res.status(200).json(friends);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
});

// Mark notification as read
app.put('/api/notifications/:notificationId/read', async (req, res) => {
  try {
    const result = await db.collection('Notification').updateOne(
      { _id: new ObjectId(req.params.notificationId) },
      { $set: { read: true } }
    );
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Get notifications for a user
app.get('/api/notifications/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // First get the user to get their ID
    const user = await db.collection('User').findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Then find notifications using userId
    const notifications = await db.collection('Notification')
      .find({ userId: user._id })
      .sort({ createdAt: -1 })
      .toArray();

    console.log('Found notifications:', notifications); // Debug log
    res.status(200).json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});


// Update notification
app.put('/api/notifications/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { handled, read } = req.body;

    const result = await db.collection('Notification').updateOne(
      { _id: new ObjectId(notificationId) },
      { $set: { handled, read } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification updated successfully' });
  } catch (err) {
    console.error('Error updating notification:', err);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Create group task
app.post('/api/groups/:groupId/tasks', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { title, description, date, time, assignedTo, createdBy } = req.body;

    const task = {
      title,
      description, 
      date: new Date(date + 'T' + time),
      time,
      groupId: new ObjectId(groupId),
      assignedTo,
      createdBy,
      status: 'pending',
      createdAt: new Date()
    };

    const result = await db.collection('tasks').insertOne(task);
    res.status(201).json({ taskId: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create group task' });
  }
});

// Get tasks for a group
app.get('/api/groups/:groupId/tasks', async (req, res) => {
  try {
    const { groupId } = req.params;
    const tasks = await db.collection('tasks')
      .find({ groupId: new ObjectId(groupId) })
      .sort({ date: 1, time: 1 })
      .toArray();

    const formattedTasks = tasks.map(task => ({
        ...task,
        date: task.date.toISOString() // Ensure date is in ISO format
      }))
    res.status(200).json(formattedTasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch group tasks' });
  }
});

// Get group information
app.get('/api/groups/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    
    const group = await db.collection('Group').findOne(
      { _id: new ObjectId(groupId) }
    );

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.status(200).json(group);
  } catch (err) {
    console.error('Error fetching group:', err);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});


// Create a new event
app.post('/api/events', async (req, res) => {
  try {
    const { title, description, startDateTime, endDateTime, location, isAllDay, reminder, reminderTime, createdBy } = req.body;

    const newEvent = {
      title,
      description,
      startDateTime: new Date(startDateTime),
      endDateTime: new Date(endDateTime),
      location,
      isAllDay:Boolean(isAllDay),
      reminder:Boolean(reminder),
      reminderTime:Number(reminderTime) || 15,
      createdBy: createdBy,
      createdAt: new Date(),
      sharedWith: []
    };

    // Verify user exists before creating event
    const user = await db.collection('User').findOne({ username: createdBy });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }


    const result = await db.collection('Event').insertOne(newEvent);
    res.status(201).json({ eventId: result.insertedId, ...newEvent });
    console.log('Event created:', newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

/// Fetch events for a user
app.get('/api/events/:username', async (req, res) => {
  try {
    const { username } = req.params;
    console.log(`Fetching events for user: ${username}`);

    const user = await db.collection('User').findOne({ username });
    if (!user) {
      console.log(`User not found: ${username}`);
      return res.status(404).json({ error: 'User not found' });
    }

    const events = await db.collection('Event').find({ createdBy: username}).toArray();
    console.log(`Found ${events.length} events for user: ${username}`);
    res.status(200).json(events);
  } catch (err) {
    console.error('Failed to fetch events:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.get('/api/events/:username', async (req, res) => {
  try {
    const { username } = req.params;
    console.log('Fetching events for user:', username); 

    const events = await db.collection('Events').find({ createdBy: username }).toArray();
    console.log('Events found:', events); 

    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.put('/api/events/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const updates = req.body;

    // Ensure that the provided eventId is valid
    if (!ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    // Find the event to ensure the user is authorized to edit it
    const event = await db.collection('Event').findOne({ _id: new ObjectId(eventId) });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if the current user is the creator of the event
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to edit this event' });
    }

    // Update the event
    const result = await db.collection('Event').updateOne(
      { _id: new ObjectId(eventId) },
      { $set: updates }
    );

    res.status(200).json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

app.delete('/api/events/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    // Ensure that the provided eventId is valid
    if (!ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    // Find the event to ensure the user is authorized to delete it
    const event = await db.collection('Event').findOne({ _id: new ObjectId(eventId) });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if the current user is the creator of the event
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to delete this event' });
    }

    // Delete the event
    const result = await db.collection('Event').deleteOne({ _id: new ObjectId(eventId) });

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Get shared events
app.get('/api/events/shared/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const sharedEvents = await db.collection('Event').find({ sharedWith: username }).toArray();
    res.status(200).json(sharedEvents);
  } catch (err) {
    console.error('Failed to fetch shared events:', err);
    res.status(500).json({ error: 'Failed to fetch shared events' });
  }
});

// Merge schedules
app.post('/api/merge-schedules', async (req, res) => {
  const { username, friend, type } = req.body;

  try {
    if (type === 'task') {
      // Update tasks to include the friend in the sharedWith field
      await db.collection('tasks').updateMany(
        { username },
        { $addToSet: { sharedWith: friend } }
      );
    } else if (type === 'event') {
      // Update events to include the friend in the sharedWith field
      await db.collection('Event').updateMany(
        { createdBy: username },
        { $addToSet: { sharedWith: friend } }
      );
    }

    res.status(200).json({ message: 'Schedules merged successfully' });
  } catch (err) {
    console.error('Failed to merge schedules:', err);
    res.status(500).json({ error: 'Failed to merge schedules' });
  }
});

app.get('/tasks/shared/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const sharedTasks = await db.collection('tasks').find({
      sharedWith: username,
      username: { $ne: username } // Exclude tasks created by the user
    }).toArray();
    res.status(200).json(sharedTasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch shared tasks' });
  }
});

module.exports = app;