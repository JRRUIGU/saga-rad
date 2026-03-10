import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'djroowd5j',
  api_key: process.env.CLOUDINARY_API_KEY || '251693162538862',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'v0cyprN9vgUwuY7TnqB1QFkG6Uw',
  secure: true, // Use HTTPS
});

export { cloudinary };

// Also export a default instance
export default cloudinary;