import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import dotenv from "dotenv";
dotenv.config();



cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dqswf244s",
  api_key: process.env.CLOUDINARY_API_KEY || "945682592389545",
  api_secret: process.env.CLOUDINARY_API_SECRET || "PNZrfIhi8GyKe-QjcrWU3QuLsw0",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any, file: any) => {
    return {
      folder: "chat-app",
      resource_type: "auto",
      public_id: `${Date.now()}-${file.originalname}`,
      allowed_formats: [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "mp4",
        "mov",
        "avi",
        "mkv"
      ],
    };
  },
});





export const deleteFromCloudinary = async (publicId: string, resourceType: "image" | "video" = "image") => {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    console.log("Deleted from Cloudinary:", publicId);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
  }
};

export default storage;