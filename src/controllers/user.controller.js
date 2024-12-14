import {ApiError} from '../utilsHelper/ApiError.js'
import {asyncHandeler} from '../utilsHelper/asyncHandler.js'
import {User} from '../models/user.models.js'
import {uploadOnCloudinary} from '../utilsHelper/cloudinary.js'
import {ApiResponse} from '../utilsHelper/ApiResponse.js'


const registerUser = asyncHandeler( async (req,res) =>{
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

    console.warn(req.files);
    
    
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverLocalPath = req.files?.coverImage?.[0]?.path

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
    console.log("Avatar uploaded" , avatar);
    
  } catch (error) {
    console.log("Error from Avatar while uploading avatar", erorr);
    throw new ApiError(500 , "Failed to upload avatar");
  }

   let coverImage;
  try {
    coverImage =  await uploadOnCloudinary(coverImageLocalPath)
    console.log("Avatar uploaded" , coverImage);
    
  } catch (error) {
    console.log("Error from Avatar while uploading coverimage", erorr);
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
    
        const createdUser = await User.findById(user._id).secret(
          "-password -refreshToken"
        )
    
        if (!createdUser) {
            // throw new ApiError(500 , "Something went wrong while registering user")
            throw new Error(" user not created ")
        }
    
    
        // send response
    
        return res
        .status(201)
        .json( new ApiResponse(200 , createdUser , "User registered successFully!"))
    } catch (error) {
        console.log( "USer creation failed" ,erorr);
        if (avatar) {
            await deleteFromCloudinary(avatar.public_id)
        }
        if (coverImage) {
            await deleteFromCloudinary(coverImage.public_id)
        }
        console.log("something went wrong ", erorr);
        throw new ApiError(500 , "something went wrong while resgistering user and images  was deleted");
    }

})






// const registerUser = asyncHandeler(async (req, res) => {
//   // get user details from frontend
//   // validation - not empty
//   // check if user already exist : username , email
//   // check for images , check for avatar
//   // upload them to cloudaniry , avatar
//   // create user object - create entry in db
//   // remove password and refr esh token feed from response
//   // check for user creation
//   //  return response

//   const { fullName, email, username, password } = req.body;
//   console.log("email:", email);

//   if (
//     [fullname, email, username, password].some((field) => field?.trim() === "")
//   ) {
//     throw new ApiError(400, "All fields are required");
//   }

//   const existedUser = await User.findOne({
//     $or: [{ username }, { email }],
//   });

//   if (existedUser) {
//     throw new ApiError(409, "User with email or username already existed!");
//   }
//   const avatarLocalPath = req.files?.avatar[0]?.path;

//   const coverImageLocalPath = req.files?.coverImage[0]?.path;

//   if (!avatarLocalPath) {
//     throw new ApiError(400, "Avatar file is required!");
//   }

//   //console.log(req.files)
//   const avatar = await uploadOnCloudinary(avatarLocalPath);
//   const coverImage = await uploadOnCloudinary(coverImageLocalPath);

//   if (!avatar) {
//     throw new ApiError(400, "Avatar file is required!");
//   }

//   const user = await User.create({
//     fullName,
//     avatar: avatar.url,
//     coverImage: coverImage?.url || "",
//     email,
//     password,
//     username: username.toLowerCase(),
//   });

//   const createdUser = await User.findById(user._id).select(
//     "-password -refreshToken "
//   );
//   if (!createdUser) {
//     throw new ApiError(500, "Something went wrong while registering the user");
//   }
//   return res
//     .status(201)
//     .json(new ApiResponse(200, createdUser, "User Registered Successfully"));
// });








// const generateAccessTokenAndRefreshToken = async (userId) => {
//   try {
//     const user = await User.findById(userId);
//     const accessToken = user.generateAccessToken();
//     const refreshToken = user.generateRefreshToken();
//     // console.log(generateAccessAndRefreshToken);
//     user.refreshToken = refreshToken;
//     await user.save({ validateBeforeSave: false });

//     return { accessToken, refreshToken };
//   } catch (error) {
//     throw new ApiError(
//       500,
//       "Something went wrong while generating refresh and access token"
//     );
//   }
// };

// const registerUser = asyncHandeler(async (req, res) => {
//   // get user details from frontend
//   // validation - not empty
//   // check if user already exist : username , email
//   // check for images , check for avatar
//   // upload them to cloudaniry , avatar
//   // create user object - create entry in db
//   // remove password and refr esh token feed from response
//   // check for user creation
//   //  return response

//   const { fullName, email, username, password } = req.body;
//   console.log("email:", email);

//   if (
//     [fullName, email, username, password].some((field) => field?.trim() === "")
//   ) {
//     throw new ApiError(400, "All fields are required");
//   }

//   const existedUser = await User.findOne({
//     $or: [{ username }, { email }],
//   });

//   if (existedUser) {
//     throw new ApiError(409, "User with email or username already existed!");
//   }
//   const avatarLocalPath = req.files?.avatar[0]?.path;

//   const coverImageLocalPath = req.files?.coverImage[0]?.path;

//   if (!avatarLocalPath) {
//     throw new ApiError(400, "Avatar file is required!");
//   }

//   //console.log(req.files)
//   const avatar = await uploadOnCloudinary(avatarLocalPath);
//   const coverImage = await uploadOnCloudinary(coverImageLocalPath);

//   if (!avatar) {
//     throw new ApiError(400, "Avatar file is required!");
//   }

//   const user = await User.create({
//     fullName,
//     avatar: avatar.url,
//     coverImage: coverImage?.url || "",
//     email,
//     password,
//     username: username.toLowerCase(),
//   });

//   const createdUser = await User.findById(user._id).select(
//     "-password -refreshToken "
//   );
//   if (!createdUser) {
//     throw new ApiError(500, "Something went wrong while registering the user");
//   }
//   return res
//     .status(201)
//     .json(new ApiResponse(200, createdUser, "User Registered Successfully"));

// });

export {registerUser}

