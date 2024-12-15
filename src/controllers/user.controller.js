import {ApiError} from '../utilsHelper/ApiError.js'
import {asyncHandler} from '../utilsHelper/asyncHandler.js'
import {User} from '../models/user.models.js'
import {uploadOnCloudinary , deleteFromCloudinary} from '../utilsHelper/cloudinary.js'
import {ApiResponse} from '../utilsHelper/ApiResponse.js'




const generateRefreshTokenAandAccessToken = async (userid) =>{
    const user = await User.findById(userid)

  if (!user) {
    throw new ApiError(400, "we could not find the user!")
  }

  // generating access token or refresh token
    try {
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})
        return {accessToken ,refreshToken}


    } catch (error) {
      throw new ApiError(500 ,"Something went wrong while generating access and refresh tokens")
    }

}


const registerUser = asyncHandler( async (req,res) =>{
     // Todo

    const {username , email,password ,fullname} = req.body;
    console.log(" user data :", username ,email , password , fullname);
    

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



// login controller

const loginUser = asyncHandler( async (req,res) =>{
  // get the data from body or frontend

const { email, password, username } = req.body;
  console.log(req.body);
  console.log("data" ,username ,email ,password);
  
  // validation
  if (!email) {
    throw new ApiError(400 , 'Email is required!')
  }

  const user = await User.findOne({
    $or : [{username} , {email}]
  })

  if (!user) {
    throw new ApiError(400 ," User not found !")
  }

  // validate password
  const isPasswordValid = await user.isPasswordCorret(password)

  if (!isPasswordValid) {
    throw new ApiError(400 , "Invalid credentials")
  }

  // if the passwrod is correct then generate token for login

  const {accessToken , refreshToken} = await generateRefreshTokenAandAccessToken(user._id)

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if (!loggedInUser) {
    throw new ApiError(400 , "User not found")
  }


  const options = {
    httpOnly : true,
    secure : process.env.NODE_ENV === 'production',
  }


  return res
  .status(200)
  .cookie('accessToken' ,accessToken , options)
  .cookie('refreshToken' ,refreshToken , options)
  // .json( new ApiResponse(200 ,loggedInUser , "User Logged in successfully")) or 
  .json( new ApiResponse(   // this one is for when we createing an appliction for moblie coz mobile does not save cookies so we have send cookies
    200 ,
    {user : loggedInUser ,accessToken ,refreshToken} ,
     "User Logged in successfully"))

})



export {registerUser , loginUser}

