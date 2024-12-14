import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config()

// configure clodinary


// Configuration
cloudinary.config({ 
    cloud_name:  process.env.CLOUDINARY_NAME , 
    api_key: process.env.CLOUDINARY_API_KEY , 
    api_secret:  process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});


const uploadOnCloudinary = async (localFilePath) =>{
    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(
            localFilePath , {
                resource_type : 'auto'
            }
        ) 
        console.log("file uploaded on cloudinary ",response.url);
        // once the is uploaded ,we would like to delete it from our server
        fs.unlinkSync(localFilePath) 
        return response       
    } catch (error) {
        console.log("erorr cloudinary " ,error);
        fs.unlinkSync(localFilePath)
        return null
    }
}


const deleteFromCloudinary = async (publicID) =>{
    try {
       const result =  await cloudinary.uploader.destroy(publicID)
       console.log("deleting on cloudinary" ,publicID ,result);
       
    } catch (error) {
       console.log("Error delete cloudinary" ,error);
        return null
    }
}

export {uploadOnCloudinary,deleteFromCloudinary}