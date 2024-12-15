import {ApiResponse} from '../utilsHelper/ApiResponse.js'
import {ApiError} from '../utilsHelper/ApiError.js'
import {asyncHandler} from '../utilsHelper/asyncHandler.js'


const healgthCheck = asyncHandler( async(req,res) => {
    return res.status(200).json(new ApiResponse(200,'ok',"Health check passed !"))
})

export {healgthCheck}