import {Router} from 'express'
import { registerUser ,logOutUser } from '../controllers/user.controller.js'
import{upload } from '../middlewares/multer.middleware.js'
import {loginUser} from '../controllers/user.controller.js'
import {verifyJwt} from '../middlewares/auth.middleware.js'

const router = Router()

router.route('/register').post( upload.fields([
    {
        name :'avatar',
        maxCount : 1
    },
    {
        name :'coverImage',
        maxCount : 1
    },
    
]) ,registerUser)


// login user

router.route('/login').post(loginUser)

// secured routes

router.route('/logout').post(verifyJwt , logOutUser)

export default router