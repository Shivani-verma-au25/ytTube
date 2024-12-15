import express from 'express'
import Cors from 'cors'
import CookieParser from 'cookie-parser'
// import {ApiError} from './utilsHelper/ApiError.js'
// import {errorHandler} from ''


const app = express()


// common middlewares
app.use(Cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))

app.use(express.json({limit : '16kb'}))
app.use(express.urlencoded({extended : true , limit : '16kb'}))
app.use(express.static('public'))
app.use(CookieParser())




// routes imports
import healgthCheck from './routers/healthCheck.routes.js'
import UserRouter from './routers/user.routes.js'



app.use('/api/v1/healthcheck' , healgthCheck)
app.use('/api/v1/users' ,UserRouter)


// app.post('/test', (req, res) => {
//     throw new ApiError(400, "Testing error handling");
// });

// api.use()
export {app}