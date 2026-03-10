import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'djroowd5j',
  api_key: process.env.CLOUDINARY_API_KEY || '251693162538862',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'v0cyprN9vgUwuY7TnqB1QFkG6Uw',
});

console.log('🔧 Cloudinary configured (replaces Backblaze B2)');

// MAIN FUNCTION - Same name as before!
export async function uploadToB2(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string = 'image/jpeg'
): Promise<{ url: string; key: string; size: number }> {
  try {
    console.log(`📤 Uploading to Cloudinary: ${fileName}`);
    
    return new Promise((resolve, reject) => {
      // Upload to Cloudinary
      cloudinary.uploader.upload_stream(
        {
          folder: 'saga-read',
          resource_type: 'auto',
          public_id: fileName.replace(/\.[^/.]+$/, ''),
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload failed:', error);
            reject(new Error(`Upload failed: ${error.message}`));
          } else if (result) {
            console.log(`✅ Uploaded: ${result.secure_url}`);
            resolve({
              url: result.secure_url,
              key: result.public_id,
              size: fileBuffer.length
            });
          }
        }
      ).end(fileBuffer);
    });
    
  } catch (error: any) {
    console.error('❌ Upload error:', error);
    throw error;
  }
}

// Keep same function names for compatibility
export async function getSignedB2Url(fileKey: string) {
  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${fileKey}`;
}

export async function testB2Connection() {
  try {
    const testBuffer = Buffer.from('Cloudinary test');
    const result = await uploadToB2(testBuffer, `test-${Date.now()}.txt`);
    
    return {
      success: true,
      message: '✅ Cloudinary working!',
      url: result.url
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}