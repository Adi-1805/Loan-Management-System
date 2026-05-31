import { UploadApiResponse } from 'cloudinary';
import cloudinary, { assertCloudinaryConfig } from '../config/cloudinary';

export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  folder: string
): Promise<UploadApiResponse> => {
  assertCloudinaryConfig();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        use_filename: true,
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Cloudinary upload failed'));
          return;
        }
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};
