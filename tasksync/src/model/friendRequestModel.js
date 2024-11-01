const { ObjectId } = require('mongodb');
const { createNotification } = require('./notificationModel');


const sendFriendRequest = async (db, fromUserId, toUsername) => {
  const toUser = await db.collection('User').findOne({ username: toUsername });
  if (!toUser) {
    throw new Error('User not found');
  }
  const friendRequest = {
    fromUserId: new ObjectId(fromUserId),
    toUserId: toUser._id,
    status: 'pending',
    date: new Date()
  };
  const result = await db.collection('FriendRequest').insertOne(friendRequest);

  const notification = {
    userId: toUser._id,
    message: `You have a new friend request from ${fromUserId}`,
    read: false,
    date: new Date()
  };
  await createNotification(db, notification);
  return result.insertedId;
};

const getFriendRequests = async (db, userId) => {
  return await db.collection('FriendRequest').find({ toUserId: new ObjectId(userId), status: 'pending' }).toArray();
};

const updateFriendRequestStatus = async (db, requestId, status) => {
  return await db.collection('FriendRequest').updateOne(
    { _id: new ObjectId(requestId) },
    { $set: { status } }
  );
};

module.exports = { sendFriendRequest, getFriendRequests, updateFriendRequestStatus };