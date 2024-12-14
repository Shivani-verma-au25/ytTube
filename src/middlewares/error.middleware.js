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




// import mongoose from 'mongoose';
// import { ApiError } from '../utilsHelper/ApiError.js';

// const errorHandler = (err, req, res, next) => {
//     let error = err;

//     // Handle errors not of type ApiError
//     if (!(error instanceof ApiError)) {
//         const statusCode =
//             error.statusCode || (error instanceof mongoose.Error ? 400 : 500);

//         const message = error.message || 'Something went wrong';
//         error = new ApiError(statusCode, message, error?.errors || [], err.stack);
//     }

//     // Log the error (more detailed in development)
//     console.error(
//         `Error: ${error.message}, Stack: ${
//             process.env.NODE_ENV === 'development' ? error.stack : 'Hidden'
//         }`
//     );

//     // Build the response object
//     const response = {
//         statusCode: error.statusCode,
//         message: error.message,
//         ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
//     };

//     return res.status(error.statusCode).json(response);
// };

export { errorHandler };
