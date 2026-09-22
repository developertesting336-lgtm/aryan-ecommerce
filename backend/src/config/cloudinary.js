import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  console.info("Cloudinary configured successfully");
} else {
  console.warn("Cloudinary credentials not provided. Cloudinary features will be disabled.");
}

export default cloudinary;




export const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response =await cloudinary.uploader.upload(localFilePath, {
  folder: "aryan/products",
});
    console.log(
      "File uploaded successfully:",
      response.secure_url
    );

    // Delete temporary local file
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return response;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);

    // Delete temporary file if it exists
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};
