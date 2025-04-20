const cloudinary = require('cloudinary').v2;

class CloudinaryUtil {
  static async uploadFileToCloudinary(file) {
    // Configure Cloudinary (move this to a config file if possible)
    cloudinary.config({
      cloud_name: "dewtebubz",
      api_key: "738444617725835",
      api_secret: "AiCF_wOy3e71x-bbLshgLC1SKNU"
    });

    try {
      // Check if file exists and has a path
      if (!file || !file.path) {
        throw new Error('No file uploaded or file path missing');
      }

      // Upload to Cloudinary
      const response = await cloudinary.uploader.upload(file.path, {
        folder: 'lawyer-profiles' // Optional: organize files in Cloudinary
      });

      return response;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error; // Re-throw to handle in the controller
    }
  }
}

module.exports = CloudinaryUtil;