import express from 'express'
import Cors from 'cors'
import CookieParser from 'cookie-parser'


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



export {app}