import dotenv from 'dotenv'
import {app} from './src/app.js'
import connectDB from './src/db/databse.js'

dotenv.config({
    path:'./.env'
})



const PORT = process.env.PORT || 5000
// db connection
connectDB()
.then(() => {
    app.listen(PORT, () => {
    console.log(`Server is Running on Port ${PORT}`);
})
})
.catch((error) => {
    console.log("Mongobd connection error : -" ,error);
    
})

