import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
});

export const assertCloudinaryConfig = (): void => {
  if (
    !env.cloudinary.cloudName ||
    !env.cloudinary.apiKey ||
    !env.cloudinary.apiSecret
  ) {
    throw new Error('Cloudinary environment variables are not configured');
  }
};

export default cloudinary;
