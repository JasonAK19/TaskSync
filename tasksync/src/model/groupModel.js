const { ObjectId } = require('mongodb');
const db = require('./mongoConnection');

const createGroup = async (groupData) => {
  const group = {
    name: groupData.name,
    creator: groupData.creator,
    members: groupData.members,
    createdAt: new Date()
  };
  
  const result = await db.collection('groups').insertOne(group);
  return result.insertedId;
};

const getGroupsByUser = async (username) => {
  return await db.collection('groups')
    .find({ members: username })
    .toArray();
};

module.exports = { createGroup, getGroupsByUser };