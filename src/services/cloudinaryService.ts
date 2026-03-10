// src/services/cloudinaryService.ts
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'djroowd5j',
  api_key: process.env.CLOUDINARY_API_KEY || '251693162538862',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'v0cyprN9vgUwuY7TnqB1QFkG6Uw',
});

// Upload homepage slide with forced landscape (16:9) format
export async function uploadHomepageSlide(
  fileBuffer: Buffer,
  fileName: string
): Promise<{ url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    // Convert buffer to base64
    const base64Image = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;
    
    cloudinary.uploader.upload(
      base64Image,
      {
        folder: 'saga-read/homepage-slides',
        public_id: fileName.replace(/\.[^/.]+$/, ''),
        transformation: [
          { width: 1920, height: 1080, crop: 'fill', gravity: 'auto' }, // Force 16:9 landscape
          { quality: 'auto:good' }
        ],
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
        }
      }
    );
  });
}

// Delete image from Cloudinary
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
}

// Upload file to Cloudinary (general purpose)
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  fileName: string,
  folder: string = 'saga-read'
): Promise<{ url: string; public_id: string; format: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        public_id: fileName.replace(/\.[^/.]+$/, ''),
        resource_type: 'auto',
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
          });
        }
      }
    );
    
    uploadStream.end(fileBuffer);
  });
}

// Test Cloudinary connection
export async function testCloudinaryConnection() {
  try {
    const result = await cloudinary.api.root_folders();
    return {
      success: true,
      message: '✅ Cloudinary connected successfully',
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folders: result.folders || []
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      credentials: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'djroowd5j',
        has_api_key: !!process.env.CLOUDINARY_API_KEY,
        has_api_secret: !!process.env.CLOUDINARY_API_SECRET
      }
    };
  }
}