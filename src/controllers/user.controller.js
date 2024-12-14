import { ApiError } from '../utilsHelper/ApiError.js';
import {asyncHandeler} from '../utilsHelper/asyncHandler.js'
import {User} from '../models/user.models.js'
import {uploadOnCloudinary} from '../utilsHelper/cloudinary.js'
import {ApiResponse} from '../utilsHelper/ApiResponse.js'


const registerUser = asyncHandeler( async (req,res) =>{
     // Todo

    const {username , email,password ,fullname} = req.body;

    // validation


    if (
        [username,email,fullname,password].some((fields) => fields?.trim() === '')
    ) {
        throw new ApiError(400, "All fields are required!")   
    }


    // if user already exist

   const existedUser =  await User.findOne({
        $or : [{username} , { email}]
    })


    if (existedUser) {
        throw new ApiError(409 , "User is Already exist!")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverLocalPath = req.files?.coverImage[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400 , "Avatar file is missing!")
    }

    // uloading into cloudinary
    const atavar = await uploadOnCloudinary(avatarLocalPath)
    let coverImage = ''
    if (coverLocalPath) {
        coverImage = await uploadOnCloudinary(coverImage)

    }


    // creating new user

    const user = await User.create({
        fullname,
        username : username.toLowerCase(),
        email,
        avatar : avatar.url,
        coverImage : coverImage?.url || ''
    })

    const createdUser = await User.findById(user._id).secret(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500 , "Something went wrong while registering user")
    }


    // send response

    return res
    .status(201)
    .json( new ApiResponse(200 , createdUser , "User registered successFully!"))

})


export {registerUser}