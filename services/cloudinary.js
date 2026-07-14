const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary only if environment variables are set
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

/**
 * Uploads a local file to Cloudinary.
 * If Cloudinary is not configured, it returns a local path format.
 * @param {string} localFilePath - Path to local file
 * @param {string} folderName - Cloudinary folder name
 * @returns {Promise<string>} File URL
 */
const uploadToCloudinary = async (localFilePath, folderName = 'medical-store') => {
  try {
    if (!localFilePath) return null;

    // Check if Cloudinary credentials are set
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const response = await cloudinary.uploader.upload(localFilePath, {
        folder: folderName,
        resource_type: 'auto'
      });
      // Delete local file after successful upload
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
      return response.secure_url;
    } else {
      // Fallback: If no Cloudinary config, return URL referencing local server uploads folder
      const filename = localFilePath.split(/[\\/]/).pop();
      return `/uploads/${filename}`;
    }
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    // Return local fallback on error as well, so app doesn't crash
    const filename = localFilePath.split(/[\\/]/).pop();
    return `/uploads/${filename}`;
  }
};

module.exports = { uploadToCloudinary };
