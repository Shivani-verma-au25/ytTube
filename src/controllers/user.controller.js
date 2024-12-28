import {ApiError} from '../utilsHelper/ApiError.js'
import {asyncHandler} from '../utilsHelper/asyncHandler.js'
import {User} from '../models/user.models.js'
import {uploadOnCloudinary , deleteFromCloudinary} from '../utilsHelper/cloudinary.js'
import {ApiResponse} from '../utilsHelper/ApiResponse.js'
import jwt from 'jsonwebtoken'




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
  // console.log(req.body);
  // console.log("data" ,username ,email ,password);
  
  //validation
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



// log out 

const logOutUser = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    throw new ApiError(400, "User not authenticated");
  }

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});



const refreshAccessToken = asyncHandler(async (req,res) =>{
  const incommingrefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!incommingrefreshToken) {
     throw new ApiError(401, "Refresh Token is required")
  }

  try {
    const decodedToken = jwt.verify(incommingrefreshToken , process.env.REFRESH_tOKEN_SECRET)
    const user = await User.findById(decodedToken._id)
    if (!user) {
      throw new ApiError(404 , "Invailid refreh token")
    }

    if (incommingrefreshToken !== user?.refreshToken) {
      throw new ApiError(401 , "Invailid refreh token")
    }


    const options = {
      httpOnly : true,
      success : process.env.NODE_ENV ==='production'
    }

    const {accessToken , refreshToken : newRefreshtoken} = await generateRefreshTokenAandAccessToken(user._id)

    return res
    .status(200)
    .cookie('accessToken' ,accessToken ,options)
    .cookie('refreshToken' ,newRefreshtoken ,options)
    .json( new ApiResponse(200 , {accessToken ,refreshToken : newRefreshtoken}, "Access token refreshed successfully"))
  } catch (error) {
    throw new ApiError(500 , "Something went wrong while refreshing  access token")
  }
})

// change current pass

const changeCurrentPassword = asyncHandler(async (req, res) =>{
  const {oldpassword , newPassword } = req.body;
  const user = await User.findById(req.user?._id)

  const isPasswordValid = await user.isPasswordCorret(oldpassword)

  if (!isPasswordValid) {
    throw new ApiError( 401 , "Old password is incorrect")
  }

  user.password = newPassword
  await user.save({validateBeforeSave : true})

  return res
  .status(200)
  .json(new ApiResponse (200 , {} ," Password changed successfully"))

})

const getCurrentUser = asyncHandler(async (req, res) =>{
  return res.status(200).json(new ApiResponse( 200 , req.user ,"Current User details"))
})

const updateAccountDetails = asyncHandler(async (req, res) =>{
  const {email , fullname} = req.body;

  if (!(email || fullname)) {
    throw new ApiError(401 ,"Email and fullname are required")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set : {
        fullname,
        email :   email
      }
    },
    {new : true }
  ).select(' -password -refreshTken')

  return res.status(200).json( new ApiResponse(200 , user , "User's details updated successfully!"))
   
})

const updateUserAvatar = asyncHandler(async (req, res) =>{
  const avatarLocalPath = req.files.avatar?.[0]?.path
  if (!avatarLocalPath) {
    throw new ApiError(400 , "file is required")
  }

  // upload on cloudinary
  const newAvatar = await uploadOnCloudinary(avatarLocalPath)

  if (!newAvatar.url) {
    throw new ApiError( 401 , "Somethingwent wrong while upl=dating avatar")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set : {
        avatar :  newAvatar.url
      }
    },
    {new : true}
  ).select( "-password -refreshToken" )


  return res.status(201).json(new ApiResponse(200 , user , "User's avatar is updated!"))


})



const updateUserCoverImage = asyncHandler(async (req, res) =>{

  const coverLoactPath = req.file.coverImage?.[0]?.path
  
  if (!coverLoactPath) {
    throw new ApiError(407 ," CoverImage File is missing ")
  }

  const newcoverImage = uploadOnCloudinary(coverLoactPath)

  if (!newcoverImage.url) {
    throw new ApiError(400 ,"Something went wrong while uploading cover image");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set : {
        coverImage : newcoverImage.url
      }
    },
    {new : true}
  ).select("-password -refreshToken")

  return res.status(200).json(200, user , "Cover Image in updated successfully !")

})






export {registerUser , loginUser ,refreshAccessToken ,logOutUser ,updateUserAvatar,updateUserCoverImage,updateAccountDetails,getCurrentUser,changeCurrentPassword  }

