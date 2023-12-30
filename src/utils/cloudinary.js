import { v2 as cloudinary } from "cloudinary";
import fs from "fs"
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary=async(localFilePath)=> {
  try {
    // console.log("LocalPath--------------", localFilePath);
    if (!localFilePath) return null;
  const response = await cloudinary.uploader.upload(localFilePath, {
    resourse_type: "auto",
  });

  // console.log("cloudinary response ", response);
    fs.unlinkSync(localFilePath);
  return response
  } catch (error) {
    console.log("Error while cloudnary upload : ", error);
    fs.unlinkSync(localFilePath)
    return null
    
  }
}
const destroyFromCloudinary = async (public_id) => {
  
// cloudinary.v2.uploader.destroy(public_id, options).then(callback);
  try {
    // console.log("LocalPath--------------", localFilePath);
    if (!id) return null;
    const response = await cloudinary.uploader.destroy(public_id, {
      resourse_type: "auto",
    });

    console.log("cloudinary response while destroy old assets", response);
    return response;
  } catch (error) {
    console.log("Error while destroy an assest from cloudnary  : ", error);
    return null;
  }
};




export { uploadOnCloudinary, destroyFromCloudinary };


