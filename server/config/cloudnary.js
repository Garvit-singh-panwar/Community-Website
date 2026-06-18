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

export const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'campusVolt/profile_pics', // Dedicated folder
    allowedFormats: ['jpeg', 'png', 'jpg'], // PDFs blocked for profiles
    transformation: [{ width: 400, height: 400, crop: 'limit' }] // Optional: Resize on upload!
  },
});

export const deleteMultipleFromCloudinary = async (publicIds) => {
  try {
    if (!publicIds || publicIds.length === 0) {
      return { success: false, message: "No public IDs provided for deletion." };
    }

    // Cloudinary's Admin API deletes up to 100 resources in one batch
    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: 'image', // Handles 'jpg', 'png', and 'pdf' (Cloudinary treats PDFs as images by default)
      type: 'upload'
    });

    return { success: true, result };
  } catch (error) {
    console.error("Cloudinary batch deletion failed:", error);
    throw new Error(`Cloudinary Error: ${error.message}`);
  }
};
export default cloudinary;