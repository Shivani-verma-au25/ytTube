import {ApiError} from '../utilsHelper/ApiError.js'
import {asyncHandler} from '../utilsHelper/asyncHandler.js'
import {User} from '../models/user.models.js'
import {uploadOnCloudinary , deleteFromCloudinary} from '../utilsHelper/cloudinary.js'
import {ApiResponse} from '../utilsHelper/ApiResponse.js'


const registerUser = asyncHandler( async (req,res) =>{
     // Todo

    const {username , email,password ,fullname} = req.body;
    console.log(" user data :", username ,email , password , fullname);
    // if (!username) {
    //     res.status(400).json("  All fields are required!")
    // }

    // validation


    if (
        [username,email,fullname,password].some((fields) => fields?.trim() === '')
    ) {
        throw new ApiError(400, "All fields are required!")   
        // throw new Error("  All fields are required!")

    }


    // if user already exist

   const existedUser =  await User.findOne({
        $or : [{username} , { email}]
    })


    if (existedUser) {
        throw new ApiError(409 , "User is Already exist!")
    }

  
    
    
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverLocalPath = req.files?.coverImage?.[0]?.path
    // console.log("after ");
    

    // console.log("req.files:", req.files.avatar);
    // console.log("req.files:", req.files.coverImage);  

    if (!avatarLocalPath) {
        throw new ApiError(400 , "Avatar file is missing!")
    }

    // uloading into cloudinary
    // const atavar = await uploadOnCloudinary(avatarLocalPath)
    // let coverImage = ''
    // if (coverLocalPath) {
    //     coverImage = await uploadOnCloudinary(coverImage)
    // }


  let avatar;
  try {
    avatar =  await uploadOnCloudinary(avatarLocalPath)
    // console.log("Avatar uploaded" , avatar);
    
  } catch (error) {
    // console.log("Error from Avatar while uploading avatar", error);
    throw new ApiError(500 , "Failed to upload avatar");
  }

   let coverImage;
  try {
    coverImage =  await uploadOnCloudinary(coverLocalPath)
    console.log("Avatar uploaded" , coverImage);
    
  } catch (error) {
    console.log("Error from Avatar while uploading coverimage", error);
    throw new ApiError(500 , "Failed to upload coverimage");
  }


    // creating new user


    try {
        const user = await User.create({
            fullname,
            username : username.toLowerCase(),
            email,
            avatar : avatar.url,
            coverImage : coverImage?.url || '',
            password
        })
    
        const createdUser = await User.findById(user._id).select(
          "-password -refreshToken"
        )
    
        if (!createdUser) {
            throw new ApiError(500 , "Something went wrong while registering data user not created")
            // throw new Error(" user not created ")
        }
    
    
        // send response
    
        return res
        .status(201)
        .json( new ApiResponse(200 , createdUser , "User registered successFully!"))

    } catch (error) {
        console.log( "User creation failed" ,error);
        if (avatar) {
            await deleteFromCloudinary(avatar.public_id)
        }
        if (coverImage) {
            await deleteFromCloudinary(coverImage.public_id)
        }
        // console.log("something went wrong ", error);
        throw new ApiError(500 , "something went wrong while resgistering user and images  was deleted");
    }

})


export {registerUser}

