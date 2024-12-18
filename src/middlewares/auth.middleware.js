import jwt from 'jsonwebtoken'
import {ApiError} from '../utilsHelper/ApiError.js'
import {User} from '../models/user.models.js'
import {asyncHandler}from '../utilsHelper/asyncHandler.js'

export const verifyJwt = asyncHandler( async (req , _, next) => {
    const token = req.cookies.accessToken || req.header("Authorization")?.replace('Bearer ', '')

    if (!token) {
        throw new ApiError( 401 ,"Unauthorized");
    }

    
    // console.log(process.env.ACCESS_tOKEN_SECRET , "token from mi");
    try {
        const decodedToken = jwt.verify(token , process.env.ACCESS_tOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        )

        if (!user) {
            throw new ApiError(404 ,"User not find , unauthrized user")
        }


        req.user = user

        next()
    } catch (error) {
        throw new ApiError( 401 , error?.message || "Invailid access Token")
    }
} )



