const connectToDatabase = require('./mongoConnection');

async function testConnection() {
  const db = await connectToDatabase();
  if (db) {
    console.log('Database connection successful');
  } else {
    console.log('Database connection failed');
  }
}

testConnection().catch(console.error);

async function verifySetup() {
    const db = await connectToDatabase();
  
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(col => col.name));
  }
  
  verifySetup().catch(console.error)