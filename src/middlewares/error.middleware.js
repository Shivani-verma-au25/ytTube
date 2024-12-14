import mongoose from 'mongoose'
import {ApiError} from '../utilsHelper/ApiError.js'

const errorHandler = (err , req,res,next) =>{
    let error = err

    if (!(error instanceof ApiError )) {
        const statusCode = error.statusCode || error instanceof mongoose.Error ? 400 : 500

        const message = error.message || 'Something went wrong'
        error = new ApiError(statusCode , message , error?.errors || [] , err.stack)   
    }
    console.error(error); // Log unexpected errors


    const response = {
        ...error,
        message : error.message,
        ...(process.env.NODE_ENV === 'developnent' ? {stack: error.stack} : {})
    }

    return res.status(error.statusCode).json(response)
}


export {errorHandler}