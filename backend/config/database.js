const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    const dbName = process.env.DB_NAME || 'prepmate-ai';

    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoUri, {
      dbName,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
    });

    const db = mongoose.connection;

    db.on('connected', () => {
      console.log(`MongoDB connected successfully (${dbName})`);
    });

    db.on('error', (error) => {
      console.error('MongoDB connection error:', error.message);
    });

    db.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    return db;
  } catch (error) {
    console.error('MongoDB initialization error:', error.message);
    throw error;
  }
};

process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed due to app termination');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB:', error);
    process.exit(1);
  }
});

module.exports = connectDatabase;
