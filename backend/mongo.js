const mongoose = require('mongoose');

const state = {
  configured: Boolean(process.env.MONGODB_URI),
  connected: false,
  error: null
};

async function connectMongo() {
  if (!state.configured) {
    console.log('[MongoDB] MONGODB_URI not configured; claim persistence is using in-memory mode.');
    return state;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME || 'land_acquisition',
      serverSelectionTimeoutMS: 3000
    });
    state.connected = true;
    state.error = null;
    console.log(`[MongoDB] Connected to ${process.env.MONGODB_DB_NAME || 'land_acquisition'}.`);
  } catch (error) {
    state.connected = false;
    state.error = error.message;
    console.warn(`[MongoDB] Unavailable; using in-memory claim persistence. ${error.message}`);
  }

  return state;
}

function getMongoState() {
  return { ...state };
}

module.exports = { connectMongo, getMongoState };
