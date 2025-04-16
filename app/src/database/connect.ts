import mongoose from 'mongoose';

const MONGODB_URI = process.env.DATABASE_URL || '';

if (!MONGODB_URI) {
  throw new Error('Please define the DATABASE_URL environment variable');
}

let cached = (global as any).mongoose || { conn: null, promise: null };

async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: 'feeshare', // optional
    }).then((mongoose) => {
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

(global as any).mongoose = cached;

export default connectToDatabase;
