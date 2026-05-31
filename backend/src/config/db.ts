import mongoose from 'mongoose';
import { env } from './env';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const connectDB = async (attempt = 1): Promise<void> => {
  if (!env.mongoUri) {
    throw new Error('MONGODB_URI is not defined');
  }

  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB connected (${env.nodeEnv})`);
  } catch (err) {
    console.error(`MongoDB connection failed (attempt ${attempt}/${MAX_RETRIES})`, err);

    if (attempt >= MAX_RETRIES) {
      throw err;
    }

    await wait(RETRY_DELAY_MS);
    await connectDB(attempt + 1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log('MongoDB disconnected');
};
