import { v2 as cloudinary } from 'cloudinary'
import { Env } from '../utils/Env.js';
import { CloudinaryStorage } from "multer-storage-cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Fallback to 'general' if resourceType is missing in the request
    const folderName = req.body.type || 'general';

    return {
      folder: `campusVolt/${folderName}`,
      allowedFormats: ['pdf', 'jpeg', 'png', 'jpg'],
    };
  },
});

export default cloudinary;