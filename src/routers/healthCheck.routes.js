import {Router} from 'express'
import {healgthCheck} from '../controllers/healthCheck.controler.js'


const router  = Router()

router.route('/').get(healgthCheck)

export default router





