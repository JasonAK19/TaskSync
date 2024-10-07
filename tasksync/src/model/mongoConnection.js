const { MongoClient, ServerApiVersion } = require('mongodb');

// Replace the following with your MongoDB connection string.
const uri = "mongodb+srv://jasona2:8Ea0i9A1OqbvQ1ZR@schedulercluster.gowe7.mongodb.net/?retryWrites=true&w=majority&appName=SchedulerCluster";;

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

module.exports = connectToDatabase;