const { ObjectId } = require('mongodb');

const createNotification = async (db, notification) => {
  const result = await db.collection('Notification').insertOne(notification);
  return result.insertedId;
};

const getNotifications = async (db, userId) => {
  return await db.collection('Notification').find({ userId: new ObjectId(userId) }).toArray();
};

const markAsRead = async (db, notificationId) => {
  return await db.collection('Notification').updateOne(
    { _id: new ObjectId(notificationId) },
    { $set: { read: true } }
  );
};

module.exports = { createNotification, getNotifications, markAsRead };