const { MongoClient, ObjectId } = require('mongodb');
const uri = "mongodb+srv://jasona2:8Ea0i9A1OqbvQ1ZR@schedulercluster.gowe7.mongodb.net/?retryWrites=true&w=majority&appName=SchedulerCluster";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db('Scheduler');
  } catch (err) {
    console.error(err);
  }
}

async function addTask(username, task) {
  const db = await connectToDatabase();
  const collection = db.collection('tasks');
  const result = await collection.insertOne({ username, ...task, sharedWith: task.sharedWith || [] });
  return result.insertedId;
}

async function editTask(taskId, updatedTask) {
  const db = await connectToDatabase();
  const collection = db.collection('tasks');
  try {
    const result = await collection.updateOne(
      { _id: new ObjectId(taskId) },
      { $set: updatedTask }
    );
    return result;
  } catch (err) {
    throw new Error('Failed to update task in the database');
  }
}

module.exports = { addTask, getTasks, editTask };

async function getTasks(username) {
  const db = await connectToDatabase();
  const collection = db.collection('tasks');
  const tasks = await collection.find({ username }).toArray(); // Only get tasks created by user
  return tasks;
}

module.exports = { addTask, getTasks, editTask };