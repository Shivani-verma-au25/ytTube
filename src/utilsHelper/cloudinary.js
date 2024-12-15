import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import dotenv from 'dotenv'

dotenv.config()


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

console.log(process.env.CLOUDINARY_NAME ,"name cloud");
console.log(process.env.CLOUDINARY_API_KEY);
console.log(process.env.CLOUDINARY_API_SECRET);




const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}


const deleteFromCloudinary = async (publicId) =>{
    try {
       const result =  await cloudinary.uploader.destroy(publicId)
       console.log("deleting on cloudinary publicId" ,publicId ,result);
       
    } catch (error) {
       console.log("Error deleting from cloudinary" ,error);
        return null
    }
}

export {uploadOnCloudinary,deleteFromCloudinary}