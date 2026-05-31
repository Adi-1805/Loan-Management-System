import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';

export const env = {
  nodeEnv,
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri:
    process.env.MONGODB_URI ||
    (nodeEnv === 'production' ? '' : 'mongodb://localhost:27017/lms'),
  jwtSecret:
    process.env.JWT_SECRET ||
    (nodeEnv === 'production' ? '' : 'dev-secret-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl:
    process.env.CLIENT_URL ||
    (nodeEnv === 'production' ? '' : 'http://localhost:3000'),
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
};
